# Implementation Plan: Expiry Tracker MVP

**Branch**: `001-expiry-tracker-mvp` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-expiry-tracker-mvp/spec.md`

## Summary

Build a mobile application for tracking food items and important documents with expiry dates, providing timely push notifications to prevent waste and avoid penalties. The system consists of a React Native mobile app with Expo, a Node.js REST API backend, and PostgreSQL database hosted on Neon. Core features include JWT-based authentication, CRUD operations for food items and documents, automatic expiry calculation with status labels, push notifications at 30/15/7/1 days before expiry, dashboard overview, and admin panel for user management.

## Technical Context

**Language/Version**:
- Frontend: JavaScript/TypeScript with React Native 0.73+, Expo SDK 50+
- Backend: Node.js 20.x LTS with Express.js 4.x

**Primary Dependencies**:
- Frontend: React Native, Expo, Expo Router, Expo Notifications, Axios, AsyncStorage, React Native Paper (UI)
- Backend: Express.js, jsonwebtoken, bcrypt, pg (node-postgres), express-validator, multer (file uploads), cors, helmet

**Storage**:
- Primary: PostgreSQL 15+ (Neon serverless)
- Local: Expo SecureStore (tokens), AsyncStorage (offline cache)
- Files: Cloud storage (AWS S3 or Neon's blob storage) for document uploads

**Testing**:
- Frontend: Jest, React Native Testing Library, Detox (E2E)
- Backend: Jest, Supertest (API testing), pg-mem (in-memory PostgreSQL for tests)

**Target Platform**:
- iOS 13+ and Android 8+ (via React Native/Expo)
- Backend: Cloud-hosted (Vercel, Railway, or similar Node.js platform)

**Project Type**: Mobile + API (React Native frontend + REST backend)

**Performance Goals**:
- Cold app launch: <2 seconds (constitution requirement)
- API response time: <200ms for CRUD operations, <500ms for list queries
- List scrolling: 60fps for up to 1000 items (constitution requirement)
- Notification scheduling: <100ms per item
- File upload: <10 seconds for 10MB files

**Constraints**:
- Must work offline after initial authentication (constitution: Offline-First Architecture)
- Notifications must use Expo Push Notifications (not platform-native for MVP simplicity)
- Database connection via environment variable (Neon PostgreSQL URL)
- AES-256 encryption for sensitive data (constitution: Security & Privacy First)
- JWT tokens with 7-day expiration
- Maximum file size: 10MB per document
- ISO 8601 date format (YYYY-MM-DD) for all dates

**Scale/Scope**:
- Target: 1,000 concurrent users
- Expected data: ~100-500 items per user
- Admin panel: Single admin role (no role hierarchy for MVP)
- 5 user stories with 27 acceptance scenarios
- 67 functional requirements across 7 categories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Security & Privacy First (NON-NEGOTIABLE)

**Requirements:**
- ✅ AES-256 encryption at rest
- ✅ TLS 1.3 for data in transit
- ✅ Secure password hashing (bcrypt)
- ⚠️ Biometric authentication (Expo SecureStore + LocalAuthentication)
- ✅ No sensitive data logging
- ✅ Secure document storage
- ✅ Dependency vulnerability scanning
- ✅ Security audits before release

**Status**: ✅ PASS with note
- Biometric auth will use Expo LocalAuthentication API (Face ID, Touch ID, fingerprint)
- Document files stored in cloud with signed URLs and access control
- JWT tokens stored in Expo SecureStore (encrypted)
- Passwords hashed with bcrypt (12 rounds minimum)
- HTTPS enforced for all API calls
- Helmet.js for security headers
- Rate limiting on auth endpoints

### II. Offline-First Architecture (NON-NEGOTIABLE)

**Requirements:**
- ⚠️ Core features work offline
- ⚠️ Local database as source of truth
- ✅ Cloud sync optional
- ✅ Conflict resolution strategy
- ✅ Graceful network handling
- ✅ Offline notification scheduling

**Status**: ⚠️ PARTIAL COMPLIANCE - Requires justification

**Violation**: MVP uses server as source of truth, not local database

**Justification**:
- React Native + Expo architecture makes true offline-first complex for MVP
- AsyncStorage provides offline caching for read operations
- Expo Notifications work offline once scheduled
- Authentication requires initial internet connection (acceptable per spec assumptions)
- Full offline-first with local SQLite and sync will be post-MVP enhancement

**Mitigation**:
- Implement optimistic UI updates for better perceived performance
- Cache all data in AsyncStorage after fetch
- Queue write operations when offline, sync when online
- Notifications scheduled locally via Expo Notifications (survives offline)
- Clear error messages when network required

### III. Notification Reliability (NON-NEGOTIABLE)

**Requirements:**
- ⚠️ Platform-native notification APIs
- ✅ Survives app termination/restarts
- ✅ Configurable timing
- ✅ Multiple schedules per item
- ✅ Delivery verification
- ✅ Failed delivery detection
- ✅ Notification preview/testing
- ✅ Permission request with explanation

**Status**: ⚠️ PARTIAL COMPLIANCE - Requires justification

**Violation**: Using Expo Push Notifications instead of platform-native APIs

**Justification**:
- Expo Notifications provide cross-platform consistency (iOS + Android)
- Expo's local notifications API schedules notifications on-device (no server dependency)
- Notifications persist through app termination and device restarts
- Simpler implementation for MVP reduces time-to-market
- Migration to platform-native (FCM, APNS) possible post-MVP if needed

**Implementation**:
- Use Expo Notifications.scheduleNotificationAsync for local scheduling
- Schedule all 4 notifications (30/15/7/1 days) when item created
- Cancel and reschedule on item update/delete
- Request permissions with clear value proposition
- Log notification scheduling for debugging

### IV. Data Integrity & Accuracy (NON-NEGOTIABLE)

**Requirements:**
- ✅ Date validation (no invalid dates)
- ✅ ISO 8601 format (YYYY-MM-DD)
- ✅ Explicit timezone handling
- ✅ Atomic database transactions
- ✅ Tested, reversible migrations
- ✅ Backup and restore
- ✅ Confirmation for critical operations
- ✅ Corruption detection

**Status**: ✅ PASS
- PostgreSQL provides ACID transactions
- Use DATE type for expiry dates (ISO 8601 compliant)
- Timezone stored separately if needed (default: user's local timezone)
- Migrations via node-pg-migrate or Prisma Migrate
- Validation via express-validator on backend, Yup on frontend
- Confirmation dialogs for delete operations
- Database constraints prevent invalid data

### V. Test-First Development (NON-NEGOTIABLE)

**Requirements:**
- ✅ Red-Green-Refactor cycle
- ✅ Unit tests for business logic
- ✅ Integration tests for database/notifications
- ✅ UI tests for critical journeys
- ✅ Security tests
- ✅ CI/CD pipeline
- ✅ 80% code coverage target
- ✅ Manual testing checklist

**Status**: ✅ PASS
- Jest for unit and integration tests (frontend + backend)
- Supertest for API contract tests
- React Native Testing Library for component tests
- Detox for E2E tests (optional for MVP, manual testing acceptable)
- GitHub Actions or similar for CI/CD
- Coverage reports via Jest --coverage
- Manual checklist for notifications and security

### VI. User Experience & Accessibility

**Requirements:**
- ✅ Platform design guidelines (Material Design for Android, iOS HIG)
- ✅ Critical actions in ≤3 taps
- ✅ Loading states for >300ms operations
- ✅ Clear, actionable error messages
- ✅ Accessibility features (screen readers, dynamic type, high contrast)
- ✅ Color not sole information conveyor
- ✅ Minimum touch targets (44x44pt iOS, 48x48dp Android)
- ✅ Dark mode support

**Status**: ✅ PASS
- React Native Paper provides Material Design components
- Expo supports iOS design patterns
- Accessibility props on all interactive elements
- Dark mode via React Native's Appearance API
- Loading spinners and skeleton screens
- Toast notifications for feedback

### VII. Performance Standards

**Requirements:**
- ✅ <2s cold start
- ✅ 60fps scrolling
- ✅ Indexed database queries
- ✅ Image compression and caching
- ✅ Minimal battery drain
- ✅ Reasonable storage (<100MB for 1000 items)
- ✅ Memory leak detection
- ✅ Performance regression tests

**Status**: ✅ PASS
- React Native optimized for mobile performance
- FlatList with virtualization for item lists
- PostgreSQL indexes on user_id, expiry_date, status
- Image compression before upload (expo-image-manipulator)
- Background task optimization
- Expo's built-in performance monitoring
- React DevTools Profiler for performance testing

### Constitution Check Summary

**Overall Status**: ✅ PASS with 2 justified violations

**Violations Requiring Justification**:
1. Offline-First Architecture: Server as source of truth for MVP (mitigated with caching)
2. Notification Reliability: Expo Notifications instead of platform-native (acceptable for MVP)

**Rationale**: Both violations are pragmatic MVP decisions that reduce complexity while maintaining core functionality. Post-MVP enhancements can address full offline-first architecture and platform-native notifications if user feedback demands it.

## Project Structure

### Documentation (this feature)

```text
specs/001-expiry-tracker-mvp/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - Technology best practices
├── data-model.md        # Phase 1 output - Database schema and entities
├── quickstart.md        # Phase 1 output - Developer setup guide
├── contracts/           # Phase 1 output - API contracts
│   ├── auth.yaml        # Authentication endpoints
│   ├── food-items.yaml  # Food item CRUD endpoints
│   ├── documents.yaml   # Document CRUD endpoints
│   ├── dashboard.yaml   # Dashboard and statistics endpoints
│   └── admin.yaml       # Admin panel endpoints
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
mobile/                          # React Native + Expo mobile app
├── app/                         # Expo Router app directory
│   ├── (auth)/                  # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                  # Main app tabs
│   │   ├── dashboard.tsx        # Dashboard overview
│   │   ├── food-items.tsx       # Food items list
│   │   ├── documents.tsx        # Documents list
│   │   ├── settings.tsx         # User settings
│   │   └── _layout.tsx
│   ├── (admin)/                 # Admin panel screens
│   │   ├── users.tsx
│   │   ├── statistics.tsx
│   │   └── _layout.tsx
│   ├── food-items/              # Food item detail screens
│   │   ├── [id].tsx             # View/edit food item
│   │   └── new.tsx              # Add new food item
│   ├── documents/               # Document detail screens
│   │   ├── [id].tsx             # View/edit document
│   │   └── new.tsx              # Add new document
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Entry point
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── ItemCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── DatePicker.tsx
│   │   ├── FileUploader.tsx
│   │   └── ConfirmDialog.tsx
│   ├── services/                # API and business logic
│   │   ├── api.ts               # Axios instance and interceptors
│   │   ├── auth.service.ts      # Authentication API calls
│   │   ├── food-items.service.ts
│   │   ├── documents.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── admin.service.ts
│   │   └── notifications.service.ts
│   ├── store/                   # State management (Context API or Zustand)
│   │   ├── auth.context.tsx
│   │   ├── items.context.tsx
│   │   └── notifications.context.tsx
│   ├── utils/                   # Utility functions
│   │   ├── date.utils.ts        # Date calculations and formatting
│   │   ├── validation.utils.ts  # Form validation
│   │   ├── storage.utils.ts     # AsyncStorage helpers
│   │   └── notification.utils.ts
│   ├── types/                   # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── food-item.types.ts
│   │   ├── document.types.ts
│   │   └── api.types.ts
│   └── constants/               # App constants
│       ├── categories.ts        # Food categories
│       ├── storage-types.ts     # Storage types
│       ├── document-types.ts    # Document types
│       └── config.ts            # App configuration
├── assets/                      # Images, fonts, icons
├── __tests__/                   # Tests
│   ├── components/
│   ├── services/
│   └── utils/
├── app.json                     # Expo configuration
├── package.json
├── tsconfig.json
└── .env.example                 # Environment variables template

backend/                         # Node.js + Express.js API
├── src/
│   ├── config/                  # Configuration
│   │   ├── database.js          # PostgreSQL connection (Neon)
│   │   ├── jwt.js               # JWT configuration
│   │   └── storage.js           # File storage configuration
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.js   # JWT verification
│   │   ├── admin.middleware.js  # Admin role check
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js
│   │   └── rate-limit.middleware.js
│   ├── models/                  # Database models (SQL queries)
│   │   ├── user.model.js
│   │   ├── food-item.model.js
│   │   ├── document.model.js
│   │   └── notification.model.js
│   ├── controllers/             # Request handlers
│   │   ├── auth.controller.js
│   │   ├── food-items.controller.js
│   │   ├── documents.controller.js
│   │   ├── dashboard.controller.js
│   │   └── admin.controller.js
│   ├── routes/                  # API routes
│   │   ├── auth.routes.js
│   │   ├── food-items.routes.js
│   │   ├── documents.routes.js
│   │   ├── dashboard.routes.js
│   │   └── admin.routes.js
│   ├── services/                # Business logic
│   │   ├── auth.service.js      # Password hashing, JWT generation
│   │   ├── expiry.service.js    # Expiry calculation and status
│   │   ├── notification.service.js
│   │   └── file.service.js      # File upload/download
│   ├── utils/                   # Utility functions
│   │   ├── date.utils.js
│   │   ├── validation.utils.js
│   │   └── encryption.utils.js
│   ├── validators/              # Request validation schemas
│   │   ├── auth.validator.js
│   │   ├── food-item.validator.js
│   │   └── document.validator.js
│   └── app.js                   # Express app setup
├── migrations/                  # Database migrations
│   ├── 001_create_users_table.sql
│   ├── 002_create_food_items_table.sql
│   ├── 003_create_documents_table.sql
│   └── 004_create_notifications_table.sql
├── seeds/                       # Database seed data
│   └── categories_and_types.sql
├── tests/                       # Tests
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── food-items.test.js
│   │   └── documents.test.js
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   └── setup.js                 # Test setup and teardown
├── .env.example                 # Environment variables template
├── package.json
├── server.js                    # Entry point
└── jest.config.js

shared/                          # Shared types and constants (optional)
├── types/
└── constants/

.github/
└── workflows/
    ├── mobile-ci.yml            # Mobile app CI/CD
    └── backend-ci.yml           # Backend CI/CD
```

**Structure Decision**: Selected "Mobile + API" architecture (Option 3 from template) with React Native mobile app and Node.js REST API backend. This structure separates concerns, enables independent deployment, and supports future web client addition. The `mobile/` directory uses Expo Router's file-based routing for navigation. The `backend/` directory follows MVC pattern with clear separation of routes, controllers, services, and models.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Offline-First Architecture: Server as source of truth | MVP timeline and React Native/Expo architecture constraints | True offline-first with local SQLite + sync requires significant additional complexity (conflict resolution, sync queue, schema versioning) that delays MVP delivery. Caching + optimistic UI provides acceptable UX for MVP. |
| Notification Reliability: Expo Notifications vs platform-native | Cross-platform consistency and MVP simplicity | Platform-native notifications (FCM for Android, APNS for iOS) require separate implementations, push notification server infrastructure, and device token management. Expo Notifications provide local scheduling (meets core requirement) with simpler implementation. |
