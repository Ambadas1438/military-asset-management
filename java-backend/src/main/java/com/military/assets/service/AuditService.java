package com.military.assets.service;

import com.military.assets.model.AuditLog;
import com.military.assets.model.User;
import com.military.assets.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(User user, String action, String entityType, String entityId, String details, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setId("aud-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        log.setTimestamp(LocalDateTime.now());
        if (user != null) {
            log.setUserId(user.getId());
            log.setUserName(user.getName());
            log.setUserRole(user.getRole());
            log.setBaseId(user.getBase() != null ? user.getBase().getId() : null);
        }
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setIpAddress(ipAddress);
        auditLogRepository.save(log);
    }
}
