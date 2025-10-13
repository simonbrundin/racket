# 500 Error Fix Plan for Production

## Problem Statement

The Plan application is experiencing HTTP 500 status errors in production, indicating server-side failures that prevent normal operation. These errors need to be systematically diagnosed and resolved to restore production functionality.

## Current Architecture Analysis

### System Components
- **Frontend**: Nuxt 4 (Vue 3) application deployed in Kubernetes
- **Backend**: Hasura GraphQL API (`https://plan-hasura.simonbrundin.com/v1/graphql`)
- **Database**: PostgreSQL with user-scoped data access
- **Authentication**: Authentik OAuth with JWT tokens
- **Infrastructure**: Kubernetes cluster with ArgoCD GitOps

### Potential Error Sources
1. **Hasura GraphQL API failures**
2. **Database connectivity issues**
3. **JWT authentication problems**
4. **Environment configuration errors**
5. **Kubernetes deployment issues**
6. **Runtime application errors**

## Diagnostic Plan

### Phase 1: Initial Assessment (Immediate - 1-2 hours)

#### 1.1 Check Application Logs
```bash
# Check pod logs for errors
kubectl logs -n plan-prod deployment/plan-app --tail=100

# Check Hasura logs
kubectl logs -n plan-prod deployment/hasura --tail=100

# Check database connectivity
kubectl logs -n plan-prod deployment/postgres --tail=100
```

#### 1.2 Verify External Dependencies
- [ ] Hasura endpoint accessibility: `curl https://plan-hasura.simonbrundin.com/v1/graphql`
- [ ] Authentik JWKS endpoint: `curl https://auth.simonbrundin.com/application/o/plan/.well-known/jwks.json`
- [ ] Database connectivity from application pods

#### 1.3 Environment Variables Check
- [ ] Verify all required secrets exist in Kubernetes
- [ ] Check environment variable values in running pods
- [ ] Validate GQL_HOST configuration

### Phase 2: Authentication & Authorization (2-4 hours)

#### 2.1 JWT Token Validation
- [ ] Test JWT token generation from Authentik
- [ ] Verify JWT claims structure (x-hasura-user-sub, x-hasura-default-role)
- [ ] Test token validation in Hasura

#### 2.2 Hasura Permissions
- [ ] Review Row Level Security (RLS) policies in Hasura Console
- [ ] Verify user role permissions for database operations
- [ ] Check Hasura JWT configuration matches Authentik setup

#### 2.3 Session Management
- [ ] Test user session creation and persistence
- [ ] Verify NUXT_SESSION_PASSWORD configuration
- [ ] Check session token handling in GraphQL requests

### Phase 3: Database & Data Layer (2-4 hours)

#### 3.1 Database Connectivity
- [ ] Verify database connection string and credentials
- [ ] Test database connectivity from application pods
- [ ] Check database user permissions and grants

#### 3.2 Schema Validation
- [ ] Compare production schema with development schema
- [ ] Verify all required tables exist (users, goals, user_goals, goal_relations)
- [ ] Check foreign key constraints and relationships

#### 3.3 Data Integrity
- [ ] Run database health checks
- [ ] Verify RLS policies are correctly applied
- [ ] Check for orphaned records or constraint violations

### Phase 4: Application Runtime (2-4 hours)

#### 4.1 GraphQL Client Configuration
- [ ] Verify GraphQL client initialization
- [ ] Check authentication plugin (graphql-auth.ts) behavior
- [ ] Test GraphQL query execution with proper headers

#### 4.2 Error Handling
- [ ] Review error handling in GraphQL operations
- [ ] Check for unhandled promise rejections
- [ ] Verify error logging and monitoring

#### 4.3 Build & Deployment
- [ ] Verify production build integrity
- [ ] Check container image version and contents
- [ ] Validate Kubernetes deployment configuration

### Phase 5: Load Testing & Monitoring (1-2 hours)

#### 5.1 Performance Testing
- [ ] Test application under normal load
- [ ] Monitor resource usage (CPU, memory)
- [ ] Check for timeout or resource exhaustion issues

#### 5.2 Error Monitoring Setup
- [ ] Implement structured logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure alerts for 500 errors

## Quick Fix Checklist

### Immediate Actions (Do these first)
- [ ] Check pod status: `kubectl get pods -n plan-prod`
- [ ] Restart problematic pods: `kubectl rollout restart deployment/plan-app -n plan-prod`
- [ ] Verify secrets exist: `kubectl get secrets -n plan-prod`
- [ ] Check Hasura health: Visit Hasura Console at production URL

### Common Quick Fixes
1. **Missing Environment Variables**: Ensure all secrets are properly mounted
2. **JWT Configuration Mismatch**: Verify Authentik and Hasura JWT settings match
3. **Database Connection Issues**: Check database credentials and network connectivity
4. **Hasura Permissions**: Ensure RLS policies allow user access to their data

## Rollback Plan

If fixes cannot be quickly identified:
1. Roll back to previous working deployment
2. Restore database backup if data corruption suspected
3. Implement feature flags to disable problematic functionality

## Prevention Measures

### Post-Fix Actions
- [ ] Implement comprehensive logging
- [ ] Set up monitoring and alerting
- [ ] Create automated health checks
- [ ] Document troubleshooting procedures
- [ ] Implement gradual deployment strategy

### Monitoring Setup
- Application Performance Monitoring (APM)
- Error tracking and alerting
- Database performance monitoring
- Infrastructure monitoring

## Success Criteria

- [ ] Application returns HTTP 200 for all valid requests
- [ ] User authentication and goal operations work correctly
- [ ] No 500 errors in application logs
- [ ] All GraphQL queries execute successfully
- [ ] Database operations complete without errors

## Timeline

- **Phase 1**: 1-2 hours (Initial assessment)
- **Phase 2**: 2-4 hours (Auth debugging)
- **Phase 3**: 2-4 hours (Database issues)
- **Phase 4**: 2-4 hours (Application fixes)
- **Phase 5**: 1-2 hours (Testing & monitoring)

**Total estimated time**: 8-16 hours depending on root cause complexity

## Resources Needed

- Kubernetes cluster access
- Database admin access
- Authentik admin access
- Hasura Console access
- Application logs and monitoring tools

---

*This plan should be executed systematically, starting with Phase 1. Document all findings and actions taken for future reference.*