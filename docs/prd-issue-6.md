# Product Requirements Document: User-Specific Goal Saving in Production ✅ COMPLETED

## Executive Summary
Implement functionality to save goals linked to specific users in the production environment, ensuring users can only access their own goals and that authentication works correctly across all environments.

## Problem Statement
Currently, the goal management system does not properly link goals to individual users in production, leading to potential data sharing issues, lost goals, or inability to persist user-specific data. Users need a secure way to save and retrieve their personal goals.

## Solution Overview
Integrate user authentication with goal management by leveraging the existing user_goals junction table, Hasura GraphQL backend, and Authentik OAuth authentication. The solution will ensure JWT token validation in production and proper user isolation for goal data.

## Requirements

### Functional Requirements
- Goals must be linkable to users via the user_goals table
- Users should only see and manage their own goals
- Authentication must work correctly in production environment
- Handle cases where users are not logged in (redirect to login or show appropriate message)
- Goal creation, editing, and deletion must be user-specific

### Non-Functional Requirements
- **Security**: JWT tokens must be properly validated; no data leakage between users
- **Performance**: Goal queries should be efficient with proper indexing
- **Usability**: Seamless user experience with clear error messages for authentication issues
- **Scalability**: Solution should work with increasing number of users and goals

## User Stories
- As a registered user, I want to create goals that are saved to my account so that I can access them from any device
- As a user, I want to see only my own goals so that my data remains private
- As a user, I want to be automatically logged in when accessing the application so that I don't need to re-authenticate frequently
- As a non-logged-in user, I want to be prompted to log in when trying to create or view goals so that I understand the requirement

## Technical Specifications
- **Backend**: Hasura GraphQL API with JWT authentication from Authentik
- **Database**: PostgreSQL with Drizzle ORM schema management
- **Frontend**: Nuxt 4 application with Pinia state management
- **Authentication**: Authentik OAuth integration with JWT tokens containing Hasura claims
- **Data Models**:
  - `goals` table: id, title, created_at, finished_at
  - `user_goals` junction table: user_id, goal_id
  - `users` table: id, sub (from IdP)
- **APIs**: GraphQL mutations for createGoal, updateGoal, getUserGoals

## Success Metrics
- 100% of authenticated users can successfully create and save goals
- 0% data leakage between users (goals visible only to owners)
- Authentication success rate >99% in production
- No security vulnerabilities related to user data isolation
- User satisfaction score >4.5/5 for goal management features

## Timeline
- **Week 1**: Authentication integration and JWT validation setup
- **Week 2**: Backend GraphQL resolvers for user-specific goal operations
- **Week 3**: Frontend integration with user context
- **Week 4**: Testing, security audit, and production deployment

## Stakeholders
- **Product Owner**: Simon Brundin (simonbrundin)
- **Development Team**: Frontend and backend developers
- **Security Team**: Review authentication and data isolation
- **QA Team**: Test user flows and edge cases

## Implementation Status ✅ COMPLETED
- ✅ Authentication integration with Authentik JWT and x-hasura-user-id headers
- ✅ Hasura RLS permissions configured for user-specific data access
- ✅ GraphQL queries updated to filter by authenticated user
- ✅ Frontend auth middleware redirects unauthenticated users
- ✅ Goal CRUD operations restricted to user ownership
- ✅ Production deployment ready through CI/CD pipeline

## Next Steps
- Deploy changes to production environment
- Monitor for any authentication or data access issues
- Consider adding comprehensive test suite for user isolation