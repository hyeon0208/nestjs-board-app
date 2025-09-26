#!/bin/bash
set -euo pipefail

readonly TARGET_VERSION=$1
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly BACKUP_VERSIONS_FILE=".backup_versions"

# 함수 정의
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$ENVIRONMENT] $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$ENVIRONMENT] $1" >> logs/deploy.log
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

backup_current_version() {
    log "Backing up current version..."
    local current_version
    current_version=$(docker-compose ps --format json 2>/dev/null | jq -r '.[0].Image' 2>/dev/null | cut -d':' -f2 2>/dev/null || echo "none")
    
    # 백업 버전 히스토리 관리 (최대 5개)
    {
        echo "$current_version"
        if [[ -f "$BACKUP_VERSIONS_FILE" ]]; then
            head -4 "$BACKUP_VERSIONS_FILE"
        fi
    } > "${BACKUP_VERSIONS_FILE}.tmp"
    mv "${BACKUP_VERSIONS_FILE}.tmp" "$BACKUP_VERSIONS_FILE"
    
    echo "$current_version" > .current_version
    log "Current version backed up: $current_version"
}

login_ecr() {
    log "Logging in to ECR..."
    aws ecr get-login-password --region ap-northeast-2 | \
        docker login --username AWS --password-stdin "$(echo "$ECR_REGISTRY" | cut -d'/' -f1)" || \
        error_exit "ECR login failed"
}

smart_image_cleanup() {
    log "Smart image cleanup..."
    
    # 현재 실행 중인 이미지 보호
    local running_images
    running_images=$(docker ps --format "table {{.Image}}" | tail -n +2 | sort -u)
    
    # 백업 버전들 보호
    local protected_images=""
    if [[ -f "$BACKUP_VERSIONS_FILE" ]]; then
        while IFS= read -r version; do
            [[ "$version" != "none" && -n "$version" ]] && \
                protected_images="$protected_images $ECR_REGISTRY/$ECR_REPOSITORY:$version"
        done < "$BACKUP_VERSIONS_FILE"
    fi
    
    # 댕글링 이미지 정리
    docker image prune -f >/dev/null 2>&1 || true
    
    # 7일 이상된 이미지 중 보호 대상이 아닌 것만 정리
    docker images "$ECR_REGISTRY/$ECR_REPOSITORY" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" 2>/dev/null | \
        tail -n +2 | \
        awk -v date="$(date -d '7 days ago' '+%Y-%m-%d')" '$2 < date {print $1}' | \
        while read -r image; do
            if [[ ! "$protected_images $running_images" =~ $image ]]; then
                log "Removing old image: $image"
                docker rmi "$image" 2>/dev/null || true
            fi
        done || true
}

create_env_file() {
    log "Creating environment file..."
    cat > .env << EOF
TARGET_VERSION=$TARGET_VERSION
ENVIRONMENT=$ENVIRONMENT
DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ECR_REGISTRY=$ECR_REGISTRY
ECR_REPOSITORY=$ECR_REPOSITORY
CW_LOG_GROUP=$CW_LOG_GROUP
CW_STREAM_PREFIX=$CW_STREAM_PREFIX
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL
JWT_SECRET=$JWT_SECRET
API_KEY=$API_KEY
NODE_ENV=production
SERVICE_NAME=api-worker
EOF
    chmod 600 .env
}

deploy_container() {
    log "Pulling image: $TARGET_VERSION"
    docker pull "$ECR_REGISTRY/$ECR_REPOSITORY:$TARGET_VERSION" || \
        error_exit "Failed to pull image"

    log "Deploying containers..."
    docker-compose down && docker-compose up -d || \
        error_exit "Container deployment failed"
}

multi_level_rollback() {
    local attempt=1
    local max_attempts=3
    
    log "Starting multi-level rollback strategy..."
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Rollback attempt $attempt/$max_attempts"
        
        local rollback_version
        if [[ -f "$BACKUP_VERSIONS_FILE" ]]; then
            rollback_version=$(sed -n "${attempt}p" "$BACKUP_VERSIONS_FILE")
            
            if [[ "$rollback_version" != "none" && -n "$rollback_version" ]]; then
                log "Attempting rollback to: $rollback_version"
                
                if "$SCRIPT_DIR/rollback.sh" "$rollback_version"; then
                    log "Rollback successful to: $rollback_version"
                    return 0
                else
                    log "Rollback failed for version: $rollback_version"
                fi
            fi
        fi
        
        ((attempt++))
    done
    
    error_exit "All rollback attempts failed - manual intervention required"
}

# 메인 로직
main() {
    [[ -z "$TARGET_VERSION" ]] && error_exit "Version not provided"
    
    log "=== Starting deployment: $TARGET_VERSION ==="
    
    mkdir -p logs
    
    backup_current_version
    login_ecr
    smart_image_cleanup
    create_env_file
    deploy_container
    
    # 헬스체크
    log "Running health check..."
    if ! "$SCRIPT_DIR/health-check.sh"; then
        log "Health check failed, attempting rollback..."
        multi_level_rollback
        exit 1
    fi
    
    log "=== Deployment completed successfully: $TARGET_VERSION ==="
    
    # 최종 정리
    docker image prune -f >/dev/null 2>&1 || true
}

main "$@"