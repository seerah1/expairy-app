---
id: 002
title: Create Implementation Plan for Expiry Tracker MVP
stage: plan
date: 2026-01-23
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-expiry-tracker-mvp
branch: 001-expiry-tracker-mvp
user: DELL LATITUDE
command: /sp.plan
labels: ["plan", "react-native", "expo", "nodejs", "express", "postgresql", "neon", "jwt", "rest-api"]
links:
  spec: specs/001-expiry-tracker-mvp/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-expiry-tracker-mvp/plan.md
 - specs/001-expiry-tracker-mvp/research.md
 - specs/001-expiry-tracker-mvp/data-model.md
 - specs/001-expiry-tracker-mvp/quickstart.md
 - specs/001-expiry-tracker-mvp/contracts/auth.yaml
 - specs/001-expiry-tracker-mvp/contracts/food-items.yaml
 - specs/001-expiry-tracker-mvp/contracts/documents.yaml
 - specs/001-expiry-tracker-mvp/contracts/dashboard.yaml
 - specs/001-expiry-tracker-mvp/contracts/admin.yaml
tests:
 - None (planning artifacts)
---

## Prompt

/sp.plan

Mobile App: React Native + Expo

Backend: Node.js + Express.js

Database: PostgreSQL (Neon)

Connection via environment variable (Neon PSQL URL)

Auth: JWT-based authentication

Notifications: Expo Push Notifications

API Style: REST APIs

Deployment: Cloud-hosted backend, Neon-managed PostgreSQL

Architecture: Modular frontend + REST backend

## Response snapshot

Created comprehensive implementation plan for Expiry Tracker MVP with specified technology stack:

**Technical Stack**:
- Frontend: React Native 0.73+ with Expo SDK 50+, TypeScript, Expo Router, React Native Paper
- Backend: Node.js 20.x LTS with Express.js 4.x, JWT authentication, bcrypt password hashing
- Database: PostgreSQL 15+ on Neon serverless platform
- Notifications: Expo Notifications (local scheduling)
- File Storage: AWS S3 or cloud storage for document uploads
- Testing: Jest, Supertest, React Native Testing Library

**Constitution Check Results**:
- Overall Status: ✅ PASS with 2 justified violations
- Violation 1: Offline-First Architecture - Server as source of truth for MVP (mitigated with AsyncStorage caching + optimistic UI)
- Violation 2: Notification Reliability - Expo Notifications instead of platform-native (acceptable for MVP, provides local scheduling)
- All other principles: PASS (Security, Data Integrity, Test-First, UX, Performance)

**Phase 0 - Research (research.md)**:
- Technology stack decisions with rationale and alternatives
- Architecture patterns (Mobile + API, MVC backend, feature-based frontend)
- Security best practices (bcrypt, JWT, rate limiting, Helmet.js)
- Performance optimization strategies
- Testing strategy (unit, integration, E2E)
- Deployment options (Railway, Render, Vercel for backend)
- Risk mitigation strategies

**Phase 1 - Design Artifacts**:

1. **Data Model (data-model.md)**:
   - 4 main tables: users, food_items, documents, notifications
   - Entity relationships with foreign keys and CASCADE deletes
   - Database triggers for automatic status calculation
   - View for unified expiring items (v_expiring_items)
   - Indexes on user_id, expiry_date, status for performance
   - 6 migration files defined
   - Seed data for admin user and predefined categories

2. **API Contracts (contracts/)**:
   - auth.yaml: Register, login, logout, get profile (4 endpoints)
   - food-items.yaml: CRUD + list with filtering/sorting/pagination (4 endpoints)
   - documents.yaml: CRUD + file upload/download (5 endpoints)
   - dashboard.yaml: Overview + statistics (2 endpoints)
   - admin.yaml: User management + system statistics (3 endpoints)
   - Total: 18 REST API endpoints with OpenAPI 3.0 specs

3. **Quickstart Guide (quickstart.md)**:
   - Prerequisites and required software
   - Step-by-step setup for backend and mobile app
   - Environment variable configuration
   - Database migration and seeding instructions
   - Development workflow and testing commands
   - Common issues and troubleshooting
   - API testing examples with cURL
   - Project structure overview

**Project Structure**:
- Mobile app: Expo Router file-based routing with (auth), (tabs), (admin) route groups
- Backend: MVC pattern with routes → controllers → services → models
- Separation of concerns: config, middleware, validators, utils
- Test directories for both frontend and backend

**Performance Goals**:
- Cold app launch: <2 seconds
- API response: <200ms for CRUD, <500ms for lists
- List scrolling: 60fps for 1000 items
- Notification scheduling: <100ms per item
- File upload: <10 seconds for 10MB files

**Security Measures**:
- bcrypt password hashing (12+ rounds)
- JWT tokens with 7-day expiration
- Expo SecureStore for token storage
- Rate limiting on auth endpoints
- Helmet.js for security headers
- Input validation (express-validator + Yup)
- Parameterized queries (SQL injection prevention)
- HTTPS enforcement in production

## Outcome

- ✅ Impact: Established complete technical implementation plan with architecture, database schema, API contracts, and developer setup guide
- 🧪 Tests: No tests (planning artifacts) - testing strategy defined in research.md
- 📁 Files: Created plan.md, research.md, data-model.md, quickstart.md, and 5 API contract files (9 files total)
- 🔁 Next prompts: /sp.tasks to generate actionable task list for implementation
- 🧠 Reflection: Plan balances MVP pragmatism (Expo Notifications, server-first architecture) with constitution compliance (justified violations with mitigation). Comprehensive API contracts (18 endpoints) and database schema (4 tables + triggers) provide clear implementation roadmap. Quickstart guide enables rapid developer onboarding.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution check passed with justified violations
- Graders run and results (PASS/FAIL): Manual validation - PASS (all planning artifacts complete, constitution violations justified, API contracts comprehensive)
- Prompt variant (if applicable): N/A (standard planning workflow)
- Next experiment (smallest change to try): Monitor whether Expo Notifications meet notification reliability requirements during implementation, or if migration to platform-native (FCM/APNS) becomes necessary based on user feedback
