# Product Requirements Document: User-Specific Goals

## Executive Summary
Implement functionality to save goals linked to specific users in the production environment, ensuring users can only access their own goals with proper authentication.

## Problem Statement
Currently, the goal management system does not associate goals with specific users, meaning all users see the same goals. This creates privacy and security issues, especially in production where multiple users access the system. Users need the ability to create and manage their own private goals.

## Solution Overview
Extend the existing goal system to include user ownership through the user_goals junction table. Implement proper authentication using Authentik JWT tokens in production, and modify GraphQL queries to filter goals by authenticated user. Update the frontend to handle user-specific goal operations.

## Requirements

### Functional Requirements
- Goals must be linkable to users via the user_goals table
- Users should only see their own goals in the interface
- Authentication must work correctly in production environment
- Handle cases where users are not logged in (redirect to login)
- Users can create new goals that are automatically associated with their account
- Users can update and delete only their own goals

### Non-Functional Requirements
- Security: Ensure no data leakage between users
- Performance: Goal queries should remain efficient with user filtering
- Usability: Seamless experience for authenticated users
- Scalability: Support multiple concurrent users in production

## User Stories
- As a registered user, I want to create goals that are private to my account so that other users cannot see them
- As a user, I want to see only my goals when I log in so that I can focus on my own objectives
- As a user, I want to be redirected to login if I'm not authenticated so that I can access my goals securely
- As a developer, I want JWT authentication to work in production so that user data is protected

## Technical Specifications
- **Backend**: Hasura GraphQL with JWT authentication from Authentik
- **Database**: PostgreSQL with Drizzle ORM, using user_goals junction table
- **Frontend**: Nuxt 4 with Pinia stores, GraphQL client with auth headers
- **Authentication**: JWT tokens with Hasura claims for row-level security
- **API**: GraphQL queries filtered by user ID from JWT
- **Deployment**: Kubernetes with Hasura service, Authentik OAuth

## Success Metrics
- 100% of authenticated users can create and view their own goals
- 0 security incidents related to user data access
- Authentication success rate >99% in production
- User satisfaction with private goal functionality

## Timeline
- Week 1: Implement backend user filtering in GraphQL queries
- Week 2: Update frontend to send auth headers and handle user-specific operations
- Week 3: Testing and security review
- Week 4: Production deployment and monitoring

## Stakeholders
- Product Owner: Simon Brundin
- Developers: Frontend and backend teams
- Users: End users of the goal management system
- Security Team: For authentication and data protection review