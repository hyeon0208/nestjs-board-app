#!/bin/bash

# 사용법: ./deploy.sh <deployment env> <version>

set -euo pipefail

# =============================================================================
# 설정 및 변수
# =============================================================================

DEPLOYMENT_ENV=${1:-"dev"}
VERSION=${2:-"latest"}
APP_NAME="board-app"
ECR_REPOSITORY="test-repo"
AWS_REGION="ap-northeast-2"
CONTAINER_NAME="${APP_NAME}-${DEPLOYMENT_ENV}"
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
# Parameter Store에서 환경변수 가져와서 .env 파일 생성
# =============================================================================

generate_env_file() {
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
    
    # 디버그용: 환경변수 목록 출력 (값은 숨김)
    if [ ${ENV_COUNT} -gt 0 ]; then
        log "📋 Loaded environment variables:"
        grep "^[A-Z]" ${ENV_FILE} | cut -d'=' -f1 | while read var; do
            log "   - $var"
        done
    fi
}

# =============================================================================
# SSM Parameter에서 이미지 URI 가져오기 (워크플로우에서 저장한 값)
# =============================================================================

log "🚀 Starting deployment of ${APP_NAME} ${VERSION} to ${DEPLOYMENT_ENV}"

NEW_IMAGE_URI=$(aws ssm get-parameter \
    --name "/${APP_NAME}/${DEPLOYMENT_ENV}/image-uri" \
    --query 'Parameter.Value' --output text) || \
    error_exit "Failed to get image URI from SSM Parameter Store"

log "📦 Target image: ${NEW_IMAGE_URI}"

# =============================================================================
# 환경변수 파일 생성
# =============================================================================

generate_env_file

# =============================================================================
# ECR 로그인
# =============================================================================

log "🔐 Logging into ECR..."
# EC2 인스턴스의 IAM 역할에 ECR 권한 필요:
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

# 기존 컨테이너 이미지를 롤백용으로 저장
BACKUP_IMAGE=""
if docker ps -q -f name=${CONTAINER_NAME} | grep -q .; then
    BACKUP_IMAGE=$(docker inspect ${CONTAINER_NAME} \
        --format='{{.Config.Image}}' 2>/dev/null || echo "")
    log "💾 Backup image saved: ${BACKUP_IMAGE}"
fi

# Docker Compose 환경변수 설정
export IMAGE_URI=${NEW_IMAGE_URI}
export DEPLOYMENT_ENV=${DEPLOYMENT_ENV}

# 홈 디렉토리로 이동
cd ~

# 기존 컨테이너 중지 및 새 컨테이너 시작
log "🏁 Starting new container with docker-compose using environment: ${DEPLOYMENT_ENV}..."
log "📂 Using compose file: ${COMPOSE_FILE}"
log "📂 Using env file: ${ENV_FILE}"
docker compose -f ${COMPOSE_FILE} up -d --force-recreate || error_exit "Failed to start with docker-compose"

# =============================================================================
# 헬스체크
# =============================================================================

log "🏥 Performing health check..."
HEALTH_CHECK_RETRIES=12
HEALTH_CHECK_INTERVAL=5

for i in $(seq 1 ${HEALTH_CHECK_RETRIES}); do
    if curl -f -s http://localhost:8080/health > /dev/null 2>&1; then
        log "✅ Health check passed (attempt ${i}/${HEALTH_CHECK_RETRIES})"
        break
    fi
    
    if [ ${i} -eq ${HEALTH_CHECK_RETRIES} ]; then
        log "❌ Health check failed after ${HEALTH_CHECK_RETRIES} attempts"
        
        # 실패 시 롤백 수행
        if [ -n "${BACKUP_IMAGE}" ]; then
            log "🔄 Rolling back to previous image..."
            export IMAGE_URI=${BACKUP_IMAGE}
            docker compose -f ${COMPOSE_FILE} down || true
            docker compose -f ${COMPOSE_FILE} up -d || error_exit "Rollback failed"
        fi
        
        error_exit "Deployment failed - health check timeout"
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

# SSM Parameter 업데이트 (배포 완료 시간 기록)
log "📝 Updating deployment metadata..."
aws ssm put-parameter \
    --name "/${APP_NAME}/${DEPLOYMENT_ENV}/deployed-at" \
    --value "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --type "String" \
    --overwrite || log "Warning: Failed to update deployment timestamp"

log "🎉 Deployment completed successfully!"
log "📊 Container status:"
docker compose -f ${COMPOSE_FILE} ps

# 배포 성공 알림을 위한 메트릭 전송
log "📊 Sending success metric to CloudWatch..."
aws cloudwatch put-metric-data \
    --namespace "${APP_NAME}/Deployment" \
    --metric-data '[
        {
            "MetricName": "DeploymentSuccess",
            "Value": 1,
            "Unit": "Count",
            "Dimensions": [
                {"Name": "Environment", "Value": "'${DEPLOYMENT_ENV}'"},
                {"Name": "Application", "Value": "'${APP_NAME}'"}
            ]
        }
    ]' 2>/dev/null || log "Warning: Failed to send success metric"

exit 0
