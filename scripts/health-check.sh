#!/bin/bash
set -euo pipefail

readonly MAX_ATTEMPTS=30
readonly RETRY_INTERVAL=10
readonly HEALTH_ENDPOINT="http://localhost:3000/health"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$ENVIRONMENT] $1"
}

check_prerequisites() {
    command -v curl >/dev/null 2>&1 || {
        log "ERROR: curl is not installed"
        return 1
    }
    
    command -v jq >/dev/null 2>&1 || {
        log "ERROR: jq is not installed"
        return 1
    }
    
    return 0
}

detailed_health_check() {
    local response
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo "HTTPSTATUS:000")
    
    local body
    local status
    body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]{3}$//')
    status=$(echo "$response" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [[ "$status" == "200" ]]; then
        # 헬스체크 응답 내용도 검증 (가능한 경우)
        if echo "$body" | jq -e '.status == "healthy"' >/dev/null 2>&1; then
            return 0
        elif [[ -n "$body" && "$body" != "OK" ]]; then
            # JSON이 아닌 경우 단순 OK 체크
            return 0
        else
            log "Health endpoint returned 200 but status is not healthy: $body"
            return 1
        fi
    else
        log "Health check failed with HTTP $status"
        return 1
    fi
}

wait_for_container() {
    log "Waiting for container to be ready..."
    local attempts=0
    local max_wait_attempts=12
    
    while [[ $attempts -lt $max_wait_attempts ]]; do
        local container_status
        container_status=$(docker-compose ps --format json 2>/dev/null | jq -r '.[0].State' 2>/dev/null || echo "unknown")
        
        if [[ "$container_status" == "running" ]]; then
            log "Container is running"
            sleep 5
            return 0
        fi
        
        log "Container status: $container_status (waiting...)"
        sleep 5
        ((attempts++))
    done
    
    log "Container failed to start within expected time"
    return 1
}

main() {
    log "Starting health check..."
    
    if ! check_prerequisites; then
        log "Prerequisites check failed"
        return 1
    fi
    
    if ! wait_for_container; then
        log "Container readiness check failed"
        docker-compose logs --tail=50 api-worker
        return 1
    fi
    
    # 메인 헬스체크 루프
    for attempt in $(seq 1 $MAX_ATTEMPTS); do
        log "Health check attempt $attempt/$MAX_ATTEMPTS"
        
        if detailed_health_check; then
            log "✅ Health check passed!"
            
            log "Final container status:"
            docker-compose ps
            
            log "Recent application logs:"
            docker-compose logs --tail=5 api-worker
            
            return 0
        fi
        
        if [[ $attempt -eq $MAX_ATTEMPTS ]]; then
            log "❌ Health check failed after $MAX_ATTEMPTS attempts"
            log "Final container status:"
            docker-compose ps
            log "Error logs:"
            docker-compose logs --tail=50 api-worker
            return 1
        fi
        
        log "Retrying in ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
    done
}

main "$@"