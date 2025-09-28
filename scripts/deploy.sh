#!/bin/bash

set -euo pipefail

# =============================================================================
# 설정 및 변수
# =============================================================================


[[ $# -ne 3 ]] && { echo "Usage: $0 <app_name> <deployment_env> <image_uri>"; exit 1; }

APP_NAME="$1"
DEPLOYMENT_ENV="$2"
NEW_IMAGE_URI="$3"
VERSION=$(echo "$NEW_IMAGE_URI" | sed 's/.*://')

ECR_REPOSITORY="${APP_NAME}-${DEPLOYMENT_ENV}"  
AWS_REGION="ap-northeast-2"
COMPOSE_FILE="~/docker-compose.yml"
ENV_FILE="~/.env.${DEPLOYMENT_ENV}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

# =============================================================================
# 환경변수 파일 생성
# =============================================================================

log "🔧 Loading environment variables from Parameter Store for ${DEPLOYMENT_ENV}..."

# 기존 .env 파일 초기화
echo "# Environment variables for ${DEPLOYMENT_ENV}" > ${ENV_FILE}
echo "# Generated from Parameter Store at $(date)" >> ${ENV_FILE}
echo "" >> ${ENV_FILE}

# Parameter Store에서 환경변수 가져와서 .env 파일 생성
aws ssm get-parameters-by-path \
    --path "/${APP_NAME}/${DEPLOYMENT_ENV}" \
    --with-decryption \
    --query "Parameters[*].[Name,Value]" \
    --output text | while read name value; do  
        key=$(echo $name | sed 's|.*/||')
        echo "$key=$value" >> ${ENV_FILE}
done || error_exit "Failed to get parameters from Parameter Store"

# 생성된 환경변수 개수 확인
ENV_COUNT=$(grep -c "^[A-Z]" ${ENV_FILE} 2>/dev/null || echo "0")
log "✅ Generated .env file with ${ENV_COUNT} environment variables"

# 파일 권한 설정
chmod 600 ${ENV_FILE}

log "📁 Environment file saved to: ${ENV_FILE}"

# =============================================================================
# ECR 로그인
# =============================================================================

log "🔐 Logging into ECR..."
ECR_REGISTRY=$(echo ${NEW_IMAGE_URI} | cut -d'/' -f1)
aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin ${ECR_REGISTRY} || \
    error_exit "ECR login failed"

# =============================================================================
# 이미지 Pull
# =============================================================================

log "📥 Pulling new image..."
docker pull ${NEW_IMAGE_URI} || error_exit "Failed to pull image ${NEW_IMAGE_URI}"

# =============================================================================
# 기존 컨테이너 백업 및 새 컨테이너 시작
# =============================================================================

# 홈 디렉토리로 이동 (docker-compose 파일 위치)
cd ~

# 현재 실행중인 백업 이미지 추출
log "💾 Extracting current image for backup..."
BACKUP_IMAGE=$(docker-compose -f ${COMPOSE_FILE} config 2>/dev/null | \
    grep "image:" | head -1 | awk '{print $2}' || echo "")

if [ -n "$BACKUP_IMAGE" ]; then
    log "✅ Backup image saved: ${BACKUP_IMAGE}"
else
    log "⚠️ No backup image found"
fi

# Docker Compose 환경변수 설정
export IMAGE_URI=${NEW_IMAGE_URI}
export DEPLOYMENT_ENV=${DEPLOYMENT_ENV}

# 기존 컨테이너 중지 및 새 컨테이너 시작
log "🏁 Starting new container with docker-compose using environment: ${DEPLOYMENT_ENV}..."
log "📂 Using compose file: ${COMPOSE_FILE}"
log "📂 Using env file: ${ENV_FILE}"
log "🖼️  Using image: ${NEW_IMAGE_URI}"
docker compose -f ${COMPOSE_FILE} up -d --force-recreate || error_exit "Failed to start with docker-compose"

# =============================================================================
# 헬스체크
# =============================================================================

log "🏥 Performing health check..."
HEALTH_CHECK_RETRIES=12
HEALTH_CHECK_INTERVAL=5

for i in $(seq 1 ${HEALTH_CHECK_RETRIES}); do
    if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
        log "✅ Health check passed (attempt ${i}/${HEALTH_CHECK_RETRIES})"
        break
    fi
    
    if [ ${i} -eq ${HEALTH_CHECK_RETRIES} ]; then
        log "❌ Health check failed after ${HEALTH_CHECK_RETRIES} attempts"
        
        # 실패 시 롤백 수행
        if [ -n "${BACKUP_IMAGE}" ]; then
            log "🔄 Rolling back to previous image: ${BACKUP_IMAGE}"
            
            export IMAGE_URI=${BACKUP_IMAGE}
            docker compose -f ${COMPOSE_FILE} up -d --force-recreate || error_exit "Rollback failed"
            
            log "🏥 Performing rollback health check..."
            sleep 10
            if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
                log "✅ Rollback successful and healthy"
                error_exit "Deployment failed but rollback successful"
            else
                error_exit "Deployment failed and rollback health check also failed"
            fi
        else
            error_exit "Deployment failed and no backup image available for rollback"
        fi
    fi
    
    log "⏳ Health check attempt ${i}/${HEALTH_CHECK_RETRIES} failed, retrying in ${HEALTH_CHECK_INTERVAL}s..."
    sleep ${HEALTH_CHECK_INTERVAL}
done

# =============================================================================
# 정리 및 완료
# =============================================================================

# 사용하지 않는 이미지 정리
log "🧹 Cleaning up unused images..."
docker image prune -f || true

exit 0
