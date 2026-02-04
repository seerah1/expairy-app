---
description: "Task list for Expiry Tracker MVP implementation"
---

# Tasks: Expiry Tracker MVP

**Input**: Design documents from `/specs/001-expiry-tracker-mvp/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification. If TDD approach is desired, test tasks should be added before implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile app**: `mobile/` at repository root
- **Backend API**: `backend/` at repository root
- Paths shown below use this structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETED

**Purpose**: Project initialization and basic structure

- [x] T001 Create mobile/ directory with Expo app structure per plan.md
- [x] T002 Create backend/ directory with Express.js structure per plan.md
- [x] T003 [P] Initialize mobile app with Expo CLI and TypeScript in mobile/
- [x] T004 [P] Initialize backend with npm and create package.json in backend/
- [x] T005 [P] Install mobile dependencies: expo, expo-router, react-native-paper, axios in mobile/package.json
- [x] T006 [P] Install backend dependencies: express, pg, bcrypt, jsonwebtoken, helmet, cors in backend/package.json
- [x] T007 [P] Configure TypeScript for mobile app in mobile/tsconfig.json
- [x] T008 [P] Configure ESLint and Prettier for mobile in mobile/.eslintrc.js
- [x] T009 [P] Configure ESLint and Prettier for backend in backend/.eslintrc.js
- [x] T010 [P] Create .env.example files for mobile in mobile/.env.example
- [x] T011 [P] Create .env.example files for backend in backend/.env.example
- [x] T012 [P] Configure Expo app.json with app name, slug, and platform settings in mobile/app.json
- [x] T013 [P] Create .gitignore files for mobile and backend directories

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**✅ COMPLETE**: Foundation is ready - user story implementation can now begin

- [x] T014 Create Neon PostgreSQL project and obtain connection string
- [x] T015 Create database migration files in backend/migrations/ per data-model.md
- [x] T016 Create migration 001_create_users_table.sql in backend/migrations/
- [x] T017 Create migration 002_create_food_items_table.sql in backend/migrations/
- [x] T018 Create migration 003_create_documents_table.sql in backend/migrations/
- [x] T019 Create migration 004_create_notifications_table.sql in backend/migrations/
- [x] T020 Create migration 005_create_views_and_functions.sql in backend/migrations/
- [x] T021 Create migration 006_seed_admin_user.sql in backend/migrations/
- [x] T022 [P] Create database configuration in backend/src/config/database.js
- [x] T023 [P] Create JWT configuration in backend/src/config/jwt.js
- [x] T024 [P] Create storage configuration in backend/src/config/storage.js
- [x] T025 [P] Implement authentication middleware in backend/src/middleware/auth.middleware.js
- [x] T026 [P] Implement admin role middleware in backend/src/middleware/admin.middleware.js
- [x] T027 [P] Implement validation middleware in backend/src/middleware/validation.middleware.js
- [x] T028 [P] Implement error handling middleware in backend/src/middleware/error.middleware.js
- [x] T029 [P] Implement rate limiting middleware in backend/src/middleware/rate-limit.middleware.js
- [x] T030 Create Express app setup in backend/src/app.js with middleware chain
- [x] T031 Create server entry point in backend/server.js
- [x] T032 Run database migrations to create all tables
- [x] T033 [P] Create API client configuration in mobile/src/services/api.ts with Axios
- [x] T034 [P] Create date utility functions in mobile/src/utils/date.utils.ts
- [x] T035 [P] Create date utility functions in backend/src/utils/date.utils.js
- [x] T036 [P] Create validation utility functions in backend/src/utils/validation.utils.js
- [x] T037 [P] Create constants for categories in mobile/src/constants/categories.ts
- [x] T038 [P] Create constants for storage types in mobile/src/constants/storage-types.ts
- [x] T039 [P] Create constants for document types in mobile/src/constants/document-types.ts
- [x] T040 [P] Create TypeScript types for auth in mobile/src/types/auth.types.ts
- [x] T041 [P] Create TypeScript types for food items in mobile/src/types/food-item.types.ts
- [x] T042 [P] Create TypeScript types for documents in mobile/src/types/document.types.ts
- [x] T043 [P] Create TypeScript types for API responses in mobile/src/types/api.types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 4 - User Authentication and Account Management (Priority: P1) 🎯 FOUNDATIONAL ✅ COMPLETE

**Goal**: Enable users to register, login, and manage their accounts securely with JWT authentication

**Independent Test**: Register new account, logout, login with correct credentials, attempt login with incorrect credentials, verify data isolation per user

### Backend Implementation for User Story 4

- [x] T044 [P] [US4] Create User model with database queries in backend/src/models/user.model.js
- [x] T045 [P] [US4] Create auth service with password hashing and JWT generation in backend/src/services/auth.service.js
- [x] T046 [P] [US4] Create auth validators for register and login in backend/src/validators/auth.validator.js
- [x] T047 [US4] Create auth controller with register endpoint in backend/src/controllers/auth.controller.js
- [x] T048 [US4] Add login endpoint to auth controller in backend/src/controllers/auth.controller.js
- [x] T049 [US4] Add logout endpoint to auth controller in backend/src/controllers/auth.controller.js
- [x] T050 [US4] Add get profile endpoint to auth controller in backend/src/controllers/auth.controller.js
- [x] T051 [US4] Create auth routes in backend/src/routes/auth.routes.js
- [x] T052 [US4] Register auth routes in backend/src/app.js

### Mobile Implementation for User Story 4

- [x] T053 [P] [US4] Create auth service with API calls in mobile/src/services/auth.service.ts
- [x] T054 [P] [US4] Create storage utility for SecureStore in mobile/src/utils/storage.utils.ts
- [x] T055 [P] [US4] Create validation utility for forms in mobile/src/utils/validation.utils.ts
- [x] T056 [US4] Create auth context for state management in mobile/src/store/auth.context.tsx
- [x] T057 [US4] Create login screen in mobile/app/(auth)/login.tsx
- [x] T058 [US4] Create register screen in mobile/app/(auth)/register.tsx
- [x] T059 [US4] Create auth layout with navigation in mobile/app/(auth)/_layout.tsx
- [x] T060 [US4] Create root layout with auth check in mobile/app/_layout.tsx
- [x] T061 [US4] Create index/entry screen with redirect logic in mobile/app/index.tsx

**Checkpoint**: At this point, User Story 4 (Authentication) should be fully functional and testable independently. Users can register, login, and logout.

---

## Phase 4: User Story 1 - Track Food Items with Expiry Notifications (Priority: P1) 🎯 MVP ✅ COMPLETE

**Goal**: Enable users to add, view, edit, and delete food items with automatic expiry calculation and push notifications

**Independent Test**: Add food items with various expiry dates, view calculated remaining days and status labels, verify notifications are scheduled at 30/15/7/1 days before expiry, edit and delete items

### Backend Implementation for User Story 1

- [x] T062 [P] [US1] Create FoodItem model with CRUD queries in backend/src/models/food-item.model.js
- [x] T063 [P] [US1] Create Notification model with queries in backend/src/models/notification.model.js
- [x] T064 [P] [US1] Create expiry service with status calculation in backend/src/services/expiry.service.js
- [x] T065 [P] [US1] Create notification service with scheduling logic in backend/src/services/notification.service.js
- [x] T066 [P] [US1] Create food item validators in backend/src/validators/food-item.validator.js
- [x] T067 [US1] Create food items controller with list endpoint in backend/src/controllers/food-items.controller.js
- [x] T068 [US1] Add create endpoint to food items controller in backend/src/controllers/food-items.controller.js
- [x] T069 [US1] Add get single item endpoint to food items controller in backend/src/controllers/food-items.controller.js
- [x] T070 [US1] Add update endpoint to food items controller in backend/src/controllers/food-items.controller.js
- [x] T071 [US1] Add delete endpoint to food items controller in backend/src/controllers/food-items.controller.js
- [x] T072 [US1] Create food items routes in backend/src/routes/food-items.routes.js
- [x] T073 [US1] Register food items routes in backend/src/app.js

### Mobile Implementation for User Story 1

- [x] T074 [P] [US1] Create food items service with API calls in mobile/src/services/food-items.service.ts
- [x] T075 [P] [US1] Create notifications service with Expo Notifications in mobile/src/services/notifications.service.ts
- [x] T076 [P] [US1] Create notification utility functions in mobile/src/utils/notification.utils.ts
- [x] T077 [US1] Create items context for state management in mobile/src/store/items.context.tsx
- [x] T078 [US1] Create notifications context for permission handling in mobile/src/store/notifications.context.tsx
- [x] T079 [P] [US1] Create ItemCard component in mobile/src/components/ItemCard.tsx
- [x] T080 [P] [US1] Create StatusBadge component in mobile/src/components/StatusBadge.tsx
- [x] T081 [P] [US1] Create DatePicker component in mobile/src/components/DatePicker.tsx
- [x] T082 [P] [US1] Create ConfirmDialog component in mobile/src/components/ConfirmDialog.tsx
- [x] T083 [US1] Create food items list screen in mobile/app/(tabs)/food-items.tsx
- [x] T084 [US1] Create new food item screen in mobile/app/food-items/new.tsx
- [x] T085 [US1] Create food item detail/edit screen in mobile/app/food-items/[id].tsx
- [x] T086 [US1] Request notification permissions on app launch in mobile/app/_layout.tsx
- [x] T087 [US1] Implement notification scheduling when item created in mobile/src/services/food-items.service.ts
- [x] T088 [US1] Implement notification cancellation when item deleted in mobile/src/services/food-items.service.ts
- [x] T089 [US1] Implement notification rescheduling when item updated in mobile/src/services/food-items.service.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. This is the MVP - users can track food items and receive notifications.

---

## Phase 5: User Story 2 - Dashboard Overview and Quick Insights (Priority: P2) ✅ COMPLETE

**Goal**: Provide users with a summary dashboard showing total items, expired count, expiring soon count, and upcoming expirations

**Independent Test**: Add multiple food items with various expiry dates, verify dashboard displays accurate counts, tap on counts to filter lists, verify real-time updates

### Backend Implementation for User Story 2

- [x] T090 [P] [US2] Create dashboard controller with overview endpoint in backend/src/controllers/dashboard.controller.js
- [x] T091 [P] [US2] Add statistics endpoint to dashboard controller in backend/src/controllers/dashboard.controller.js
- [x] T092 [US2] Create dashboard routes in backend/src/routes/dashboard.routes.js
- [x] T093 [US2] Register dashboard routes in backend/src/app.js

### Mobile Implementation for User Story 2

- [x] T094 [P] [US2] Create dashboard service with API calls in mobile/src/services/dashboard.service.ts
- [x] T095 [US2] Create dashboard screen with overview cards in mobile/app/(tabs)/dashboard.tsx
- [x] T096 [US2] Implement tap navigation to filtered lists from dashboard in mobile/app/(tabs)/dashboard.tsx
- [x] T097 [US2] Add real-time dashboard updates when items change in mobile/src/store/items.context.tsx
- [x] T098 [US2] Create tabs layout with dashboard as default in mobile/app/(tabs)/_layout.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Dashboard provides quick insights into tracked items.

---

## Phase 6: User Story 3 - Track Important Documents with Expiry Dates (Priority: P3) ✅ COMPLETE

**Goal**: Enable users to track documents with expiry dates and optional file uploads, receiving notifications before renewal deadlines

**Independent Test**: Add documents with type, number, expiry date, and optional file upload, verify notifications, view/edit/delete documents, download uploaded files

### Backend Implementation for User Story 3

- [x] T099 [P] [US3] Create Document model with CRUD queries in backend/src/models/document.model.js
- [x] T100 [P] [US3] Create file service with upload/download logic in backend/src/services/file.service.js
- [x] T101 [P] [US3] Create document validators in backend/src/validators/document.validator.js
- [x] T102 [US3] Create documents controller with list endpoint in backend/src/controllers/documents.controller.js
- [x] T103 [US3] Add create endpoint with file upload to documents controller in backend/src/controllers/documents.controller.js
- [x] T104 [US3] Add get single document endpoint to documents controller in backend/src/controllers/documents.controller.js
- [x] T105 [US3] Add update endpoint with file replacement to documents controller in backend/src/controllers/documents.controller.js
- [x] T106 [US3] Add delete endpoint with file cleanup to documents controller in backend/src/controllers/documents.controller.js
- [x] T107 [US3] Add file download endpoint to documents controller in backend/src/controllers/documents.controller.js
- [x] T108 [US3] Create documents routes in backend/src/routes/documents.routes.js
- [x] T109 [US3] Register documents routes in backend/src/app.js

### Mobile Implementation for User Story 3

- [x] T110 [P] [US3] Create documents service with API calls in mobile/src/services/documents.service.ts
- [x] T111 [P] [US3] Create FileUploader component in mobile/src/components/FileUploader.tsx
- [x] T112 [US3] Create documents list screen in mobile/app/(tabs)/documents.tsx
- [x] T113 [US3] Create new document screen with file picker in mobile/app/documents/new.tsx
- [x] T114 [US3] Create document detail/edit screen with file viewer in mobile/app/documents/[id].tsx
- [x] T115 [US3] Implement file upload with compression in mobile/src/services/documents.service.ts
- [x] T116 [US3] Implement file download and viewing in mobile/app/documents/[id].tsx
- [x] T117 [US3] Integrate documents with notification service in mobile/src/services/notifications.service.ts
- [x] T118 [US3] Update dashboard to include documents count in mobile/app/(tabs)/dashboard.tsx

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can track both food items and documents.

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can track both food items and documents.

---

## Phase 7: User Story 5 - Admin Panel for User and Usage Management (Priority: P4)

**Goal**: Provide administrators with user management capabilities and system-wide statistics

**Independent Test**: Login with admin account, view list of all users, search users by email, view user details with their items, view system statistics, deactivate user account

### Backend Implementation for User Story 5

- [ ] T119 [P] [US5] Create admin controller with list users endpoint in backend/src/controllers/admin.controller.js
- [ ] T120 [US5] Add get user details endpoint to admin controller in backend/src/controllers/admin.controller.js
- [ ] T121 [US5] Add update user status endpoint to admin controller in backend/src/controllers/admin.controller.js
- [ ] T122 [US5] Add system statistics endpoint to admin controller in backend/src/controllers/admin.controller.js
- [ ] T123 [US5] Create admin routes with admin middleware in backend/src/routes/admin.routes.js
- [ ] T124 [US5] Register admin routes in backend/src/app.js

### Mobile Implementation for User Story 5

- [ ] T125 [P] [US5] Create admin service with API calls in mobile/src/services/admin.service.ts
- [ ] T126 [US5] Create admin users list screen in mobile/app/(admin)/users.tsx
- [ ] T127 [US5] Create admin statistics screen in mobile/app/(admin)/statistics.tsx
- [ ] T128 [US5] Create admin layout with role check in mobile/app/(admin)/_layout.tsx
- [ ] T129 [US5] Add admin panel navigation for admin users in mobile/app/(tabs)/_layout.tsx

**Checkpoint**: All user stories should now be independently functional. Admin panel provides system management capabilities.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T130 [P] Create settings screen with notification preferences in mobile/app/(tabs)/settings.tsx
- [ ] T131 [P] Implement dark mode support in mobile/app/_layout.tsx
- [ ] T132 [P] Add accessibility labels to all interactive elements in mobile/src/components/
- [ ] T133 [P] Implement offline caching with AsyncStorage in mobile/src/services/api.ts
- [ ] T134 [P] Implement optimistic UI updates in mobile/src/store/items.context.tsx
- [ ] T135 [P] Add loading states and skeleton screens in mobile/app/(tabs)/
- [ ] T136 [P] Add error boundary component in mobile/src/components/ErrorBoundary.tsx
- [ ] T137 [P] Implement pull-to-refresh on list screens in mobile/app/(tabs)/
- [ ] T138 [P] Add search functionality to food items list in mobile/app/(tabs)/food-items.tsx
- [ ] T139 [P] Add search functionality to documents list in mobile/app/(tabs)/documents.tsx
- [ ] T140 [P] Add sorting options to food items list in mobile/app/(tabs)/food-items.tsx
- [ ] T141 [P] Add filtering by category/storage type in mobile/app/(tabs)/food-items.tsx
- [ ] T142 [P] Implement pagination for large lists in backend/src/controllers/
- [ ] T143 [P] Add request logging middleware in backend/src/middleware/logger.middleware.js
- [ ] T144 [P] Create health check endpoint in backend/src/routes/health.routes.js
- [ ] T145 [P] Add API documentation with Swagger/OpenAPI in backend/docs/
- [ ] T146 [P] Create README.md with setup instructions in repository root
- [ ] T147 [P] Create CONTRIBUTING.md with development guidelines in repository root
- [ ] T148 Validate quickstart.md instructions by following setup steps
- [ ] T149 Performance optimization: Add database query indexes per data-model.md
- [ ] T150 Security hardening: Review and update rate limits in backend/src/middleware/rate-limit.middleware.js

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 4 - Authentication (Phase 3)**: Depends on Foundational completion - BLOCKS all other user stories (authentication required)
- **User Story 1 - Food Items (Phase 4)**: Depends on Authentication completion - Core MVP
- **User Story 2 - Dashboard (Phase 5)**: Depends on Food Items completion (needs data to display)
- **User Story 3 - Documents (Phase 6)**: Depends on Authentication completion - Can run in parallel with US1/US2 if staffed
- **User Story 5 - Admin Panel (Phase 7)**: Depends on Authentication completion - Can run in parallel with US1/US2/US3 if staffed
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 4 (P1 - Authentication)**: FOUNDATIONAL - Must complete first, blocks all other stories
- **User Story 1 (P1 - Food Items)**: Depends on US4 - Core MVP functionality
- **User Story 2 (P2 - Dashboard)**: Depends on US1 (needs food items data) - Can integrate US3 data later
- **User Story 3 (P3 - Documents)**: Depends on US4 only - Can run in parallel with US1/US2
- **User Story 5 (P4 - Admin Panel)**: Depends on US4 only - Can run in parallel with US1/US2/US3

### Within Each User Story

- Backend tasks generally before mobile tasks (API must exist before mobile can call it)
- Models before services
- Services before controllers
- Controllers before routes
- Routes before mobile implementation
- Mobile services before UI components
- UI components before screens
- Core implementation before integration

### Parallel Opportunities

- **Setup Phase**: All tasks marked [P] can run in parallel (T003-T013)
- **Foundational Phase**: All tasks marked [P] can run in parallel within their groups
- **Within User Stories**: All tasks marked [P] can run in parallel (models, validators, components)
- **Across User Stories**: After US4 completes, US1, US3, and US5 can start in parallel (US2 depends on US1)
- **Polish Phase**: Most tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1 (Food Items)

```bash
# Backend - Launch all parallel tasks together:
Task T062: Create FoodItem model
Task T063: Create Notification model
Task T064: Create expiry service
Task T065: Create notification service
Task T066: Create food item validators

# Then sequential backend tasks:
Task T067-T073: Controllers and routes (depend on models/services)

# Mobile - Launch all parallel tasks together:
Task T074: Create food items service
Task T075: Create notifications service
Task T076: Create notification utilities
Task T079: Create ItemCard component
Task T080: Create StatusBadge component
Task T081: Create DatePicker component
Task T082: Create ConfirmDialog component

# Then sequential mobile tasks:
Task T077-T089: Contexts, screens, and integration (depend on services/components)
```

---

## Implementation Strategy

### MVP First (User Story 4 + User Story 1 Only)

1. Complete Phase 1: Setup (T001-T013)
2. Complete Phase 2: Foundational (T014-T043) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 4 - Authentication (T044-T061)
4. Complete Phase 4: User Story 1 - Food Items with Notifications (T062-T089)
5. **STOP and VALIDATE**: Test authentication and food tracking independently
6. Deploy/demo MVP if ready

**MVP Scope**: 89 tasks total (T001-T089)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T043)
2. Add User Story 4 (Authentication) → Test independently (T044-T061)
3. Add User Story 1 (Food Items) → Test independently → Deploy/Demo (MVP!) (T062-T089)
4. Add User Story 2 (Dashboard) → Test independently → Deploy/Demo (T090-T098)
5. Add User Story 3 (Documents) → Test independently → Deploy/Demo (T099-T118)
6. Add User Story 5 (Admin Panel) → Test independently → Deploy/Demo (T119-T129)
7. Add Polish features → Final release (T130-T150)

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T043)
2. **Team completes Authentication together** (T044-T061) - BLOCKS other stories
3. **Once Authentication is done, split team**:
   - Developer A: User Story 1 - Food Items (T062-T089)
   - Developer B: User Story 3 - Documents (T099-T118) - Can start in parallel
   - Developer C: User Story 5 - Admin Panel (T119-T129) - Can start in parallel
4. **After US1 completes**:
   - Developer A: User Story 2 - Dashboard (T090-T098) - Depends on US1
5. **All developers**: Polish phase (T130-T150)

Stories complete and integrate independently.

---

## Task Summary

**Total Tasks**: 150

**Tasks by Phase**:
- Phase 1 (Setup): 13 tasks (T001-T013)
- Phase 2 (Foundational): 30 tasks (T014-T043)
- Phase 3 (US4 - Authentication): 18 tasks (T044-T061)
- Phase 4 (US1 - Food Items): 28 tasks (T062-T089)
- Phase 5 (US2 - Dashboard): 9 tasks (T090-T098)
- Phase 6 (US3 - Documents): 20 tasks (T099-T118)
- Phase 7 (US5 - Admin Panel): 11 tasks (T119-T129)
- Phase 8 (Polish): 21 tasks (T130-T150)

**MVP Scope** (US4 + US1): 89 tasks (T001-T089)

**Parallel Opportunities**: 67 tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:
- US4: Register, login, logout, verify data isolation
- US1: Add/edit/delete food items, verify notifications, view status labels
- US2: View dashboard counts, tap to filter, verify real-time updates
- US3: Add/edit/delete documents, upload/download files, verify notifications
- US5: View users, search, view details, deactivate accounts, view statistics

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tests are NOT included as they were not requested in spec - add if TDD approach desired
- File paths are exact per plan.md structure
- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with path`
