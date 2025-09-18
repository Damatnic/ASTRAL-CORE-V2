# ASTRAL CORE V2 - Production Deployment Guide

## 🚨 CRITICAL: Life-Saving Crisis Intervention Platform

This documentation covers the production deployment and operational procedures for ASTRAL CORE V2, a crisis intervention platform that provides life-critical services. **Any downtime or failure can directly impact human lives.**

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Security Setup](#security-setup)
4. [Deployment Procedures](#deployment-procedures)
5. [Monitoring and Alerting](#monitoring-and-alerting)
6. [Crisis Response Operations](#crisis-response-operations)
7. [Backup and Recovery](#backup-and-recovery)
8. [Compliance and Audit](#compliance-and-audit)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Emergency Procedures](#emergency-procedures)

---

## Pre-Deployment Checklist

### ✅ Infrastructure Preparation

- [ ] **Server Resources Validated**
  - Minimum 16GB RAM, 8 CPU cores
  - 500GB SSD storage for database
  - 100GB additional for logs and backups
  - Network: 1Gbps bandwidth minimum

- [ ] **SSL Certificates Installed**
  - Primary domain: `astralcore.org`
  - Admin subdomain: `admin.astralcore.org`
  - Monitoring: `monitoring.astralcore.org`
  - Valid for minimum 90 days

- [ ] **DNS Configuration Complete**
  - A records for all subdomains
  - CNAME for CDN assets
  - MX records for email notifications
  - Health check endpoints configured

### ✅ Security Validation

- [ ] **Firewall Rules Configured**
  - Port 80/443 open for web traffic
  - Port 22 restricted to admin IPs
  - Database ports (5432, 6379) internal only
  - Monitoring ports (9090, 3001) restricted

- [ ] **Environment Variables Set**
  - All secrets replaced in `.env.production`
  - Database credentials rotated
  - API keys validated and active
  - Encryption keys generated (256-bit minimum)

- [ ] **HIPAA Compliance Verified**
  - Business Associate Agreements signed
  - Encryption at rest enabled
  - Audit logging configured
  - Access controls implemented

### ✅ Crisis System Validation

- [ ] **Volunteer Network Ready**
  - Minimum 10 trained volunteers available
  - Emergency contact list updated
  - Escalation procedures documented
  - Backup crisis hotlines identified

- [ ] **AI Safety Systems Tested**
  - Content filtering active
  - Risk assessment models trained
  - Fallback protocols validated
  - Human oversight protocols in place

---

## Infrastructure Requirements

### Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   Nginx Proxy   │────│  ASTRAL App     │
│   (CloudFlare)  │    │   (Security)    │    │  (Next.js)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
        ┌───────────────────────┼────────────────────────┼───────────┐
        │                       │                        │           │
        ▼                       ▼                        ▼           ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ PostgreSQL  │    │    Redis    │    │ Prometheus  │    │   Grafana   │
│ (Primary)   │    │   (Cache)   │    │ (Metrics)   │    │(Dashboards) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Hardware Specifications

| Component | Minimum | Recommended | Critical Notes |
|-----------|---------|-------------|----------------|
| **CPU** | 8 cores | 16 cores | AMD64 or ARM64 |
| **RAM** | 16GB | 32GB | Crisis loads can spike |
| **Storage** | 500GB SSD | 1TB NVMe | Database performance critical |
| **Network** | 1Gbps | 10Gbps | Low latency essential |
| **Uptime** | 99.9% | 99.99% | Life-critical system |

### Container Resources

```yaml
# Resource allocation for production containers
services:
  astral-web:
    deploy:
      resources:
        limits: { cpus: '2.0', memory: '2G' }
        reservations: { cpus: '1.0', memory: '1G' }
  
  postgres:
    deploy:
      resources:
        limits: { cpus: '2.0', memory: '4G' }
        reservations: { cpus: '1.0', memory: '2G' }
  
  redis:
    deploy:
      resources:
        limits: { cpus: '1.0', memory: '1G' }
        reservations: { cpus: '0.5', memory: '512M' }
```

---

## Security Setup

### 🔐 SSL/TLS Configuration

1. **Certificate Installation**
   ```bash
   # Install SSL certificates
   sudo mkdir -p /etc/ssl/astralcore
   sudo cp astralcore.org.crt /etc/ssl/astralcore/
   sudo cp astralcore.org.key /etc/ssl/astralcore/
   sudo chmod 600 /etc/ssl/astralcore/*.key
   ```

2. **Security Headers Verification**
   ```bash
   # Verify security headers
   curl -I https://astralcore.org | grep -E "(Strict-Transport|X-Frame|Content-Security)"
   ```

### 🛡️ Firewall Configuration

```bash
# Ubuntu/Debian UFW configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from 10.0.0.0/8 to any port 5432  # Database
sudo ufw allow from 10.0.0.0/8 to any port 6379  # Redis
sudo ufw enable
```

### 🔑 Secrets Management

1. **Environment Variables**
   - Use AWS Secrets Manager or HashiCorp Vault
   - Rotate secrets quarterly minimum
   - Never commit secrets to version control
   - Audit secret access regularly

2. **Database Encryption**
   ```sql
   -- Enable encryption at rest
   ALTER SYSTEM SET ssl = on;
   ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/server.crt';
   ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/server.key';
   ```

---

## Deployment Procedures

### 🚀 Initial Production Deployment

1. **Prepare Environment**
   ```bash
   # Clone repository
   git clone https://github.com/your-org/astral-core-v2.git
   cd astral-core-v2
   
   # Copy production environment
   cp .env.production.example .env.production
   # CRITICAL: Update all secrets in .env.production
   ```

2. **Database Setup**
   ```bash
   # Initialize production database
   docker-compose -f docker-compose.prod.yml up -d postgres
   
   # Wait for database to be ready
   sleep 30
   
   # Run migrations
   pnpm run db:migrate:prod
   
   # Seed critical data (volunteers, emergency contacts)
   pnpm run db:seed:prod
   ```

3. **Deploy Application Stack**
   ```bash
   # Pull latest images
   docker-compose -f docker-compose.prod.yml pull
   
   # Start all services
   docker-compose -f docker-compose.prod.yml up -d
   
   # Verify deployment
   sleep 60
   docker-compose -f docker-compose.prod.yml ps
   ```

4. **Health Check Validation**
   ```bash
   # Critical endpoint checks
   curl -f https://astralcore.org/api/health
   curl -f https://astralcore.org/api/crisis/health
   curl -f https://admin.astralcore.org/api/health
   
   # Performance check
   curl -w "@curl-format.txt" -s -o /dev/null https://astralcore.org
   ```

### 🔄 Rolling Updates (Zero Downtime)

1. **Pre-Update Checks**
   ```bash
   # Verify current system health
   curl https://astralcore.org/api/health
   
   # Check active crisis sessions
   curl https://astralcore.org/api/crisis/active-sessions
   
   # Ensure minimum volunteers available
   curl https://astralcore.org/api/volunteers/availability
   ```

2. **Blue-Green Deployment**
   ```bash
   # Deploy to staging environment first
   docker-compose -f docker-compose.staging.yml up -d
   
   # Run staging tests
   pnpm run test:staging
   
   # Switch traffic gradually
   # Update load balancer to route 10% -> 50% -> 100%
   ```

3. **Rollback Procedure**
   ```bash
   # If issues detected, immediate rollback
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.backup.yml up -d
   
   # Notify crisis team
   curl -X POST $SLACK_WEBHOOK -d '{"text":"🚨 ROLLBACK: Production deployment reverted"}'
   ```

---

## Monitoring and Alerting

### 📊 Critical Metrics Dashboard

Access Grafana at: `https://monitoring.astralcore.org:3001`

**Crisis Intervention Metrics:**
- Active crisis sessions (Target: < 20 concurrent)
- Average response time (Target: < 30 seconds)
- Volunteer availability (Target: > 5 available)
- AI safety check pass rate (Target: > 99%)

**System Health Metrics:**
- Application uptime (Target: 99.99%)
- Database performance (Target: < 100ms queries)
- Memory usage (Alert: > 85%)
- CPU usage (Alert: > 80%)

### 🚨 Alert Escalation Matrix

| Severity | Response Time | Escalation |
|----------|---------------|------------|
| **P0 - Crisis System Down** | Immediate | Page on-call + Crisis team |
| **P1 - Performance Degraded** | 5 minutes | On-call engineer |
| **P2 - High Resource Usage** | 15 minutes | Platform team |
| **P3 - Non-critical Issues** | 1 hour | Development team |

### 📱 Notification Channels

```yaml
# Alert routing configuration
routes:
  - match: { severity: critical }
    receiver: crisis-team-pager
    group_wait: 0s
    
  - match: { service: crisis_intervention }
    receiver: crisis-team-slack
    group_wait: 30s
    
  - match: { severity: warning }
    receiver: platform-team-slack
    group_wait: 5m
```

---

## Crisis Response Operations

### 🆘 Crisis Intervention Workflow

1. **Crisis Detection**
   - AI-powered content analysis
   - Keyword triggers (suicide, self-harm, emergency)
   - User-reported crisis situations
   - Escalation from regular chat

2. **Response Protocol**
   ```
   Crisis Detected → Immediate Queue → Available Volunteer
        ↓              (< 30s)           ↓
   AI Safety Check → Human Review → Crisis Counselor
        ↓              (< 60s)           ↓
   Risk Assessment → Intervention → Follow-up Care
   ```

3. **Emergency Escalation**
   - Suicidal ideation: Immediate counselor + emergency services
   - Violence threat: Police + crisis team
   - Medical emergency: Ambulance + hospital notification

### 👥 Volunteer Management

**Minimum Staffing Requirements:**
- Peak hours (6 PM - 12 AM): 15 volunteers
- Standard hours (8 AM - 6 PM): 10 volunteers  
- Overnight (12 AM - 8 AM): 5 volunteers
- Emergency backup: 20 volunteers on-call

**Volunteer Status Monitoring:**
```bash
# Check volunteer availability
curl https://astralcore.org/api/volunteers/status

# Response format:
{
  "available": 12,
  "busy": 3,
  "offline": 25,
  "emergency_available": 18,
  "last_updated": "2024-01-15T10:30:00Z"
}
```

---

## Backup and Recovery

### 💾 Automated Backup Strategy

1. **Database Backups**
   ```bash
   # Automated daily backups (2 AM UTC)
   0 2 * * * /opt/scripts/backup-database.sh
   
   # Backup retention policy
   # Daily: 30 days
   # Weekly: 12 weeks  
   # Monthly: 12 months
   # Yearly: 7 years (compliance requirement)
   ```

2. **Application State Backup**
   ```bash
   # Backup critical application data
   /opt/scripts/backup-app-state.sh
   
   # Includes:
   # - Configuration files
   # - SSL certificates
   # - User uploaded content
   # - Crisis session transcripts (encrypted)
   ```

3. **Recovery Testing**
   ```bash
   # Monthly recovery drill (first Sunday)
   /opt/scripts/disaster-recovery-test.sh
   
   # Validates:
   # - Database restoration
   # - Application startup
   # - Crisis system functionality
   # - Performance benchmarks
   ```

### 🔄 Disaster Recovery Plan

**Recovery Time Objectives (RTO):**
- Crisis system: 5 minutes maximum
- Full platform: 15 minutes maximum
- Non-critical features: 1 hour maximum

**Recovery Point Objectives (RPO):**
- Crisis data: 1 minute maximum data loss
- User data: 5 minutes maximum data loss
- Analytics data: 1 hour acceptable data loss

**Recovery Procedures:**

1. **Hot Standby Activation**
   ```bash
   # Switch to hot standby (automated)
   /opt/scripts/failover-to-standby.sh
   
   # Manual verification
   curl https://backup.astralcore.org/api/health
   ```

2. **Database Recovery**
   ```bash
   # Restore from latest backup
   /opt/scripts/restore-database.sh --timestamp=latest
   
   # Verify data integrity
   psql -d astral_core_v2 -c "SELECT COUNT(*) FROM crisis_sessions WHERE created_at > NOW() - INTERVAL '24 hours';"
   ```

---

## Compliance and Audit

### 📋 HIPAA Compliance

**Required Controls:**
- [x] Administrative safeguards implemented
- [x] Physical safeguards configured  
- [x] Technical safeguards active
- [x] Audit logging enabled
- [x] Encryption at rest and in transit
- [x] Access controls and authentication
- [x] Employee training completed

**Audit Requirements:**
```bash
# Generate HIPAA audit report
/opt/scripts/generate-hipaa-audit.sh --period=monthly

# Review access logs
tail -f /var/log/astral/access-audit.log | grep -i "phi_access"

# Verify encryption status
/opt/scripts/verify-encryption-status.sh
```

### 🔒 Data Protection (GDPR)

**User Data Rights:**
- Right to access: API endpoint `/api/user/data-export`
- Right to rectification: User profile management
- Right to erasure: Data anonymization process
- Right to portability: JSON export functionality

**Data Retention Policy:**
```yaml
# Automatic data lifecycle management
retention_policies:
  crisis_sessions: 7_years    # Legal requirement
  user_profiles: indefinite   # Until deletion request
  audit_logs: 7_years        # Compliance requirement
  performance_logs: 1_year   # Operational need
  debug_logs: 90_days        # Development need
```

---

## Troubleshooting Guide

### 🔧 Common Issues and Solutions

#### Application Won't Start

1. **Check Docker Services**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs app
   ```

2. **Verify Environment Variables**
   ```bash
   # Check critical variables are set
   grep -E "(DATABASE_URL|REDIS_URL|NEXTAUTH_SECRET)" .env.production
   ```

3. **Database Connection Issues**
   ```bash
   # Test database connectivity
   docker exec astral-postgres-prod pg_isready -U astral_user
   
   # Check connection pool
   psql -d astral_core_v2 -c "SELECT count(*) FROM pg_stat_activity;"
   ```

#### Crisis System Not Responding

1. **Immediate Actions**
   ```bash
   # Check crisis endpoint health
   curl https://astralcore.org/api/crisis/health
   
   # Verify volunteer availability
   curl https://astralcore.org/api/volunteers/status
   
   # Check queue length
   curl https://astralcore.org/api/crisis/queue-status
   ```

2. **Escalation Steps**
   ```bash
   # Activate backup crisis protocol
   /opt/scripts/activate-crisis-backup.sh
   
   # Notify emergency contacts
   /opt/scripts/notify-crisis-team.sh --level=critical
   
   # Enable maintenance mode with crisis hotline redirect
   /opt/scripts/enable-maintenance-crisis-redirect.sh
   ```

#### Performance Degradation

1. **Resource Analysis**
   ```bash
   # Check system resources
   htop
   iotop
   
   # Database performance
   psql -d astral_core_v2 -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
   
   # Redis performance
   redis-cli --latency-history
   ```

2. **Scaling Actions**
   ```bash
   # Horizontal scaling
   docker-compose -f docker-compose.prod.yml up -d --scale app=3
   
   # Database optimization
   psql -d astral_core_v2 -c "ANALYZE;"
   psql -d astral_core_v2 -c "REINDEX DATABASE astral_core_v2;"
   ```

---

## Emergency Procedures

### 🚨 Emergency Response Protocol

#### Code Red: Crisis System Failure

**Immediate Actions (0-5 minutes):**
1. Activate crisis hotline backup: `1-800-273-8255`
2. Display maintenance page with emergency contacts
3. Notify all available volunteers via SMS
4. Page on-call engineering team
5. Activate backup infrastructure

**Short-term Actions (5-30 minutes):**
1. Investigate root cause
2. Implement temporary fix or rollback
3. Restore service functionality
4. Verify crisis response capability
5. Update status page and notifications

**Recovery Actions (30+ minutes):**
1. Full system health verification
2. Post-incident review scheduling
3. Documentation update
4. Process improvement implementation

#### Code Yellow: Performance Degradation

**Response Steps:**
1. Monitor response times < 30 seconds for crisis endpoints
2. Scale resources if needed
3. Optimize database queries
4. Clear cache if beneficial
5. Monitor volunteer wait times

#### Code Blue: Security Incident

**Immediate Response:**
1. Isolate affected systems
2. Preserve evidence
3. Notify security team
4. Change compromised credentials
5. Review audit logs
6. Document incident details

### 📞 Emergency Contact List

| Role | Primary Contact | Backup Contact | Response Time |
|------|----------------|----------------|---------------|
| **Crisis Team Lead** | +1-XXX-XXX-XXXX | +1-XXX-XXX-XXXX | 5 minutes |
| **Platform Engineering** | +1-XXX-XXX-XXXX | +1-XXX-XXX-XXXX | 10 minutes |
| **Security Team** | +1-XXX-XXX-XXXX | +1-XXX-XXX-XXXX | 15 minutes |
| **Database Admin** | +1-XXX-XXX-XXXX | +1-XXX-XXX-XXXX | 20 minutes |

---

## Operational Checklists

### 📅 Daily Operations

- [ ] Review overnight alerts and incidents
- [ ] Check volunteer availability forecast
- [ ] Monitor crisis response metrics
- [ ] Verify backup completion
- [ ] Review system performance trends
- [ ] Update incident status board

### 📅 Weekly Operations

- [ ] Security patch review and application
- [ ] Performance optimization review
- [ ] Volunteer training schedule update
- [ ] Crisis pattern analysis
- [ ] Infrastructure capacity planning
- [ ] Emergency procedure drill

### 📅 Monthly Operations

- [ ] Disaster recovery test
- [ ] Security audit review
- [ ] Compliance report generation
- [ ] Volunteer performance review
- [ ] Infrastructure cost optimization
- [ ] Crisis system enhancement planning

---

## Documentation Maintenance

This documentation should be reviewed and updated:
- **Weekly:** Emergency contacts and procedures
- **Monthly:** Technical procedures and troubleshooting
- **Quarterly:** Compliance requirements and audit procedures
- **Annually:** Complete documentation review and reorganization

**Last Updated:** [Current Date]
**Next Review Date:** [Next Quarter]
**Document Version:** 1.0
**Approved By:** [Crisis Team Lead], [Platform Engineering Lead]

---

## 📚 Additional Resources

- [Crisis Intervention Best Practices](./docs/crisis-best-practices.md)
- [AI Safety Guidelines](./docs/ai-safety-guidelines.md)
- [Volunteer Training Manual](./docs/volunteer-training.md)
- [Technical Architecture Guide](./docs/technical-architecture.md)
- [Security Policies](./docs/security-policies.md)
- [Compliance Procedures](./docs/compliance-procedures.md)

---

**⚠️ CRITICAL REMINDER: This platform saves lives. Every procedure, alert, and response time directly impacts human welfare. Treat all operations with the highest level of care and urgency.**