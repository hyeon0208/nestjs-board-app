#!/bin/bash
set -euo pipefail

readonly ROLLBACK_VERSION=$1

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$ENVIRONMENT] $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$ENVIRONMENT] $1" >> logs/deploy.log
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

verify_version_exists() {
    log "Verifying version exists in ECR..."
    local version_exists
    version_exists=$(aws ecr describe-images \
        --repository-name "$ECR_REPOSITORY" \
        --image-ids imageTag="$ROLLBACK_VERSION" \
        --query 'imageDetails[0].imageDigest' \
        --output text 2>/dev/null || echo "None")
    
    if [[ "$version_exists" == "None" ]]; then
        log "Available versions:"
        aws ecr list-images --repository-name "$ECR_REPOSITORY" \
            --query 'imageIds[?imageTag!=`null`].imageTag' --output table | head -10
        error_exit "Version $ROLLBACK_VERSION not found"
    fi
}

main() {
    [[ -z "$ROLLBACK_VERSION" ]] && error_exit "Rollback version not provided"
    
    log "=== Starting rollback to: $ROLLBACK_VERSION ==="
    
    verify_version_exists
    
    mkdir -p logs
    
    # ECR 로그인
    log "Logging in to ECR..."
    aws ecr get-login-password --region ap-northeast-2 | \
        docker login --username AWS --password-stdin "$(echo "$ECR_REGISTRY" | cut -d'/' -f1)" || \
        error_exit "ECR login failed"
    
    # 환경변수 업데이트
    log "Updating environment for rollback..."
    sed -i "s/TARGET_VERSION=.*/TARGET_VERSION=$ROLLBACK_VERSION/" .env
    sed -i "s/DEPLOYED_AT=.*/DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)/" .env
    
    # 롤백 실행
    log "Pulling rollback image..."
    docker pull "$ECR_REGISTRY/$ECR_REPOSITORY:$ROLLBACK_VERSION" || \
        error_exit "Failed to pull rollback image"
    
    log "Rolling back containers..."
    docker-compose down && docker-compose up -d || \
        error_exit "Rollback deployment failed"
    
    # 헬스체크
    log "Running post-rollback health check..."
    if ! "$(dirname "${BASH_SOURCE[0]}")/health-check.sh"; then
        error_exit "Rollback health check failed - manual intervention required"
    fi
    
    log "=== Rollback completed successfully: $ROLLBACK_VERSION ==="
    
    docker image prune -f >/dev/null 2>&1 || true
}

main "$@"