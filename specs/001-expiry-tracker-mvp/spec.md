# Feature Specification: Expiry Tracker MVP

**Feature Branch**: `001-expiry-tracker-mvp`
**Created**: 2026-01-23
**Status**: Draft
**Input**: User description: "User authentication (email & password, JWT), Add/edit/delete food items and documents, Auto calculation of remaining days, Status labels, Push notifications, Dashboard overview, Admin panel"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Track Food Items with Expiry Notifications (Priority: P1)

A user wants to track food items in their pantry, refrigerator, and freezer to prevent waste and receive timely reminders before items expire. They need to add items with expiry dates, see how many days remain, and get notifications before expiry.

**Why this priority**: This is the core value proposition of the application. Without the ability to track food items and receive notifications, the app has no purpose. This story alone delivers immediate value by helping users reduce food waste.

**Independent Test**: Can be fully tested by creating a user account, adding food items with various expiry dates, viewing the calculated remaining days, and verifying that notifications are received at the configured intervals (30, 15, 7, 1 days before expiry).

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they add a new food item with name "Milk", category "Dairy", expiry date "2026-02-15", quantity "1 liter", and storage type "Refrigerator", **Then** the item is saved and appears in their food items list with status "Safe" and remaining days calculated automatically.

2. **Given** a food item with expiry date 7 days from today, **When** the notification scheduler runs, **Then** the user receives a push notification stating "Milk expires in 7 days" with the item details.

3. **Given** a user viewing their food items list, **When** they select an item, **Then** they can edit the name, category, expiry date, quantity, or storage type, and changes are saved immediately.

4. **Given** a user viewing their food items list, **When** they delete an item, **Then** they are prompted to confirm deletion, and upon confirmation, the item is permanently removed and all associated notifications are cancelled.

5. **Given** a food item with expiry date in the past, **When** the user views their list, **Then** the item displays status "Expired" with visual indication (e.g., red color or icon).

6. **Given** a food item with expiry date within 7 days, **When** the user views their list, **Then** the item displays status "Expiring Soon" with visual indication (e.g., yellow/orange color or icon).

7. **Given** a food item with expiry date more than 7 days away, **When** the user views their list, **Then** the item displays status "Safe" with visual indication (e.g., green color or icon).

---

### User Story 2 - Dashboard Overview and Quick Insights (Priority: P2)

A user wants to see a summary dashboard when they open the app, showing total items tracked, how many are expired, and which items are expiring soon, so they can quickly assess their inventory status without scrolling through lists.

**Why this priority**: The dashboard provides immediate value and improves user experience by surfacing critical information at a glance. However, users can still manage items without a dashboard, making this secondary to core tracking functionality.

**Independent Test**: Can be fully tested by adding multiple food items with various expiry dates (past, near future, far future), then verifying the dashboard displays accurate counts for total items, expired items, and upcoming expiring items (within 7 days).

**Acceptance Scenarios**:

1. **Given** a user has 10 food items (3 expired, 2 expiring within 7 days, 5 safe), **When** they view the dashboard, **Then** they see "Total Items: 10", "Expired: 3", "Expiring Soon: 2", "Safe: 5".

2. **Given** a user views the dashboard, **When** they tap on "Expired: 3", **Then** they are taken to a filtered list showing only the 3 expired items.

3. **Given** a user views the dashboard, **When** they tap on "Expiring Soon: 2", **Then** they are taken to a filtered list showing only the 2 items expiring within 7 days, sorted by expiry date (soonest first).

4. **Given** a user has no items tracked, **When** they view the dashboard, **Then** they see a welcome message with a call-to-action button to "Add Your First Item".

5. **Given** a user views the dashboard, **When** the data changes (item added, deleted, or expiry date passes), **Then** the dashboard counts update automatically without requiring manual refresh.

---

### User Story 3 - Track Important Documents with Expiry Dates (Priority: P3)

A user wants to track important documents (passport, driver's license, insurance policies, medical records) with expiry dates and receive notifications before renewal deadlines to avoid penalties and legal issues.

**Why this priority**: Document tracking extends the app's value beyond food items and addresses a different user need (avoiding penalties vs. reducing waste). However, food tracking alone provides sufficient MVP value, making document tracking an enhancement.

**Independent Test**: Can be fully tested by adding document items with type (e.g., "Passport"), document number, expiry date, and optional file upload (photo/scan), then verifying notifications are received before expiry and documents can be viewed, edited, and deleted.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they add a new document with type "Passport", number "AB1234567", expiry date "2028-06-30", and upload a photo of the passport, **Then** the document is saved with the uploaded file and appears in their documents list.

2. **Given** a user viewing a document, **When** they tap on the document, **Then** they can view the uploaded file (if any), see all document details, and access edit/delete options.

3. **Given** a document with expiry date 30 days from today, **When** the notification scheduler runs, **Then** the user receives a push notification stating "Passport (AB1234567) expires in 30 days - renew soon".

4. **Given** a user adding a document, **When** they choose not to upload a file, **Then** the document is saved without a file attachment and displays a placeholder icon.

5. **Given** a user editing a document, **When** they upload a new file, **Then** the previous file (if any) is replaced with the new file.

6. **Given** a document with expiry date in the past, **When** the user views their documents list, **Then** the document displays status "Expired" with prominent visual indication.

---

### User Story 4 - User Authentication and Account Management (Priority: P1)

A user wants to create an account with email and password, log in securely, and have their data protected and accessible only to them, ensuring privacy and data security across devices.

**Why this priority**: Authentication is foundational infrastructure required for all other features. Without secure authentication, users cannot access the app or protect their sensitive data. This must be implemented first but is not independently valuable without tracking features.

**Independent Test**: Can be fully tested by registering a new account with email and password, logging out, logging back in with correct credentials, attempting login with incorrect credentials, and verifying that data is isolated per user account.

**Acceptance Scenarios**:

1. **Given** a new user on the registration screen, **When** they enter email "user@example.com", password "SecurePass123!", and confirm password "SecurePass123!", **Then** their account is created, they are logged in automatically, and redirected to the dashboard.

2. **Given** a user on the registration screen, **When** they enter an email that already exists, **Then** they see an error message "This email is already registered. Please log in or use a different email."

3. **Given** a user on the registration screen, **When** they enter a weak password (e.g., "123"), **Then** they see an error message "Password must be at least 8 characters with uppercase, lowercase, and numbers."

4. **Given** a registered user on the login screen, **When** they enter correct email and password, **Then** they are authenticated, receive a JWT token, and are redirected to the dashboard.

5. **Given** a registered user on the login screen, **When** they enter incorrect password, **Then** they see an error message "Invalid email or password" and remain on the login screen.

6. **Given** a logged-in user, **When** they close the app and reopen it within the token validity period, **Then** they remain logged in and see their dashboard without re-entering credentials.

7. **Given** a logged-in user, **When** they tap "Log Out", **Then** their session is terminated, JWT token is cleared, and they are redirected to the login screen.

---

### User Story 5 - Admin Panel for User and Usage Management (Priority: P4)

An administrator wants to view all registered users, see usage statistics (total items tracked, active users, notification delivery rates), and manage user accounts to ensure system health and support users effectively.

**Why this priority**: Admin functionality is important for system management but not required for end-user value delivery. The app can function fully without admin features, making this the lowest priority for MVP.

**Independent Test**: Can be fully tested by logging in with an admin account, viewing the list of all users with their registration dates and item counts, viewing system-wide statistics, and performing admin actions like viewing user details or deactivating accounts.

**Acceptance Scenarios**:

1. **Given** an admin user logged in, **When** they access the admin panel, **Then** they see a list of all registered users with columns: email, registration date, total items tracked, last login date.

2. **Given** an admin viewing the admin panel, **When** they view the usage statistics section, **Then** they see metrics: total registered users, total items tracked (food + documents), total notifications sent (last 30 days), active users (logged in within 7 days).

3. **Given** an admin viewing the user list, **When** they search for a user by email, **Then** the list filters to show only matching users.

4. **Given** an admin viewing a specific user's details, **When** they view the user profile, **Then** they see the user's email, registration date, list of tracked items (food and documents), and notification history.

5. **Given** an admin viewing a user profile, **When** they select "Deactivate Account", **Then** they are prompted to confirm, and upon confirmation, the user's account is deactivated and they cannot log in (but data is retained for potential reactivation).

---

### Edge Cases

- **What happens when a user sets an expiry date in the past?** The system accepts the date, immediately marks the item as "Expired", and does not schedule any future notifications.

- **What happens when a user's device is offline when a notification should be sent?** Notifications are scheduled locally on the device and will be delivered when the device comes back online, as long as the notification time hasn't passed by more than 24 hours.

- **What happens when a user changes an item's expiry date after notifications have been scheduled?** The system cancels all existing notifications for that item and reschedules new notifications based on the updated expiry date.

- **What happens when a user uploads a very large document file (e.g., 50MB)?** The system validates file size before upload and rejects files larger than 10MB with an error message "File size must be under 10MB. Please compress or use a smaller file."

- **What happens when a user tries to register with an invalid email format?** The system validates email format in real-time and displays an error message "Please enter a valid email address" before allowing form submission.

- **What happens when a user's JWT token expires while they're using the app?** The system detects the expired token on the next API request, displays a message "Your session has expired. Please log in again", and redirects to the login screen.

- **What happens when two users have the same document number (e.g., both have passports)?** The system allows duplicate document numbers since different users can have different documents with the same number format. Document numbers are unique only within a user's account, not globally.

- **What happens when a user deletes an item that has pending notifications?** The system cancels all scheduled notifications for that item before deleting it, ensuring no orphaned notifications remain.

- **What happens when the system time changes (e.g., timezone change, daylight saving)?** The system recalculates remaining days and notification schedules based on the current system time, ensuring accuracy regardless of time changes.

- **What happens when a user tries to add an item without an expiry date?** The system requires expiry date as a mandatory field and displays an error message "Expiry date is required" if the user attempts to save without it.

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Authorization:**

- **FR-001**: System MUST allow users to register with email address and password
- **FR-002**: System MUST validate email format (RFC 5322 standard) during registration
- **FR-003**: System MUST enforce password requirements: minimum 8 characters, at least one uppercase letter, one lowercase letter, and one number
- **FR-004**: System MUST hash passwords using industry-standard algorithm (bcrypt, Argon2) before storage
- **FR-005**: System MUST authenticate users via email and password credentials
- **FR-006**: System MUST issue JWT tokens upon successful authentication with configurable expiration time (default: 7 days)
- **FR-007**: System MUST validate JWT tokens on all protected API endpoints
- **FR-008**: System MUST allow users to log out, invalidating their current session
- **FR-009**: System MUST prevent duplicate email registrations
- **FR-010**: System MUST isolate user data - users can only access their own items and documents

**Food Item Management:**

- **FR-011**: System MUST allow users to create food items with fields: name (required), category (required), expiry date (required), quantity (optional), storage type (required)
- **FR-012**: System MUST provide predefined categories: Dairy, Meat, Vegetables, Fruits, Grains, Beverages, Condiments, Frozen, Canned, Other
- **FR-013**: System MUST provide predefined storage types: Refrigerator, Freezer, Pantry, Counter
- **FR-014**: System MUST allow users to edit all fields of existing food items
- **FR-015**: System MUST allow users to delete food items with confirmation prompt
- **FR-016**: System MUST display list of all food items for the logged-in user
- **FR-017**: System MUST allow users to search/filter food items by name, category, or storage type
- **FR-018**: System MUST allow users to sort food items by expiry date (ascending/descending), name (A-Z), or date added

**Document Management:**

- **FR-019**: System MUST allow users to create document items with fields: type (required), document number (required), expiry date (required), file upload (optional)
- **FR-020**: System MUST provide predefined document types: Passport, Driver License, ID Card, Insurance Policy, Medical Record, Visa, Vehicle Registration, Professional License, Other
- **FR-021**: System MUST allow users to upload document files in formats: PDF, JPG, JPEG, PNG
- **FR-022**: System MUST enforce maximum file size of 10MB per document
- **FR-023**: System MUST allow users to edit all fields of existing documents and replace uploaded files
- **FR-024**: System MUST allow users to delete documents with confirmation prompt, including associated files
- **FR-025**: System MUST display list of all documents for the logged-in user
- **FR-026**: System MUST allow users to view/download uploaded document files
- **FR-027**: System MUST allow users to search/filter documents by type or document number

**Expiry Calculation & Status:**

- **FR-028**: System MUST automatically calculate remaining days until expiry for all items and documents
- **FR-029**: System MUST update remaining days calculation daily at midnight local time
- **FR-030**: System MUST assign status "Expired" to items with expiry date in the past (remaining days < 0)
- **FR-031**: System MUST assign status "Expiring Soon" to items with expiry date within 7 days (0 ≤ remaining days ≤ 7)
- **FR-032**: System MUST assign status "Safe" to items with expiry date more than 7 days away (remaining days > 7)
- **FR-033**: System MUST display status with visual indicators (color coding and/or icons)
- **FR-034**: System MUST recalculate status immediately when expiry date is modified

**Push Notifications:**

- **FR-035**: System MUST schedule push notifications for items at 30 days, 15 days, 7 days, and 1 day before expiry
- **FR-036**: System MUST include item name and remaining days in notification message
- **FR-037**: System MUST cancel all scheduled notifications when an item is deleted
- **FR-038**: System MUST reschedule notifications when an item's expiry date is modified
- **FR-039**: System MUST request notification permissions from users on first app launch
- **FR-040**: System MUST allow users to enable/disable notifications globally in settings
- **FR-041**: System MUST deliver notifications even when app is closed or in background
- **FR-042**: System MUST allow users to tap notification to open app and view the specific item
- **FR-043**: System MUST not send duplicate notifications for the same item and time interval

**Dashboard & Overview:**

- **FR-044**: System MUST display dashboard as the default landing screen after login
- **FR-045**: System MUST show total count of all items (food + documents) on dashboard
- **FR-046**: System MUST show count of expired items (status = "Expired") on dashboard
- **FR-047**: System MUST show count of expiring soon items (status = "Expiring Soon") on dashboard
- **FR-048**: System MUST show count of safe items (status = "Safe") on dashboard
- **FR-049**: System MUST allow users to tap on dashboard counts to view filtered lists
- **FR-050**: System MUST update dashboard counts in real-time when items are added, edited, or deleted
- **FR-051**: System MUST display upcoming expiring items (next 7 days) in a list on dashboard, sorted by expiry date

**Admin Panel:**

- **FR-052**: System MUST provide admin role with elevated permissions
- **FR-053**: System MUST allow admin users to view list of all registered users
- **FR-054**: System MUST display user information: email, registration date, total items tracked, last login date
- **FR-055**: System MUST allow admin users to search users by email
- **FR-056**: System MUST display system-wide statistics: total users, total items tracked, total notifications sent (last 30 days), active users (last 7 days)
- **FR-057**: System MUST allow admin users to view individual user profiles with their tracked items
- **FR-058**: System MUST allow admin users to deactivate user accounts
- **FR-059**: System MUST prevent deactivated users from logging in
- **FR-060**: System MUST restrict admin panel access to users with admin role only

**Data Security & Privacy:**

- **FR-061**: System MUST encrypt sensitive data at rest using AES-256 or equivalent
- **FR-062**: System MUST use TLS 1.3 or higher for all data transmission
- **FR-063**: System MUST store uploaded document files securely with access control
- **FR-064**: System MUST prevent unauthorized access to user data via API endpoints
- **FR-065**: System MUST log all authentication attempts (success and failure) for security auditing
- **FR-066**: System MUST implement rate limiting on authentication endpoints to prevent brute force attacks
- **FR-067**: System MUST allow users to delete their account and all associated data permanently

### Key Entities

- **User**: Represents a registered user account with email, hashed password, registration date, last login date, role (user/admin), and account status (active/deactivated). Each user owns multiple food items and documents.

- **Food Item**: Represents a trackable food item with name, category, expiry date, quantity, storage type, creation date, and last modified date. Belongs to one user. Has calculated fields: remaining days, status (Expired/Expiring Soon/Safe).

- **Document**: Represents an important document with type, document number, expiry date, optional file attachment (path/URL), creation date, and last modified date. Belongs to one user. Has calculated fields: remaining days, status (Expired/Expiring Soon/Safe).

- **Notification**: Represents a scheduled push notification with item reference (food or document), scheduled time, notification message, delivery status (pending/sent/failed), and delivery timestamp. Belongs to one user and one item/document.

- **Category**: Predefined list of food categories (Dairy, Meat, Vegetables, etc.) used for organizing food items.

- **Storage Type**: Predefined list of storage locations (Refrigerator, Freezer, Pantry, Counter) used for organizing food items.

- **Document Type**: Predefined list of document types (Passport, Driver License, etc.) used for organizing documents.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account registration in under 1 minute with valid email and password
- **SC-002**: Users can add a new food item or document in under 30 seconds with all required fields
- **SC-003**: Dashboard loads and displays accurate counts within 2 seconds of user login
- **SC-004**: Notifications are delivered within 5 minutes of scheduled time with 99% reliability
- **SC-005**: Users can view their complete list of items (up to 100 items) within 2 seconds
- **SC-006**: Search and filter operations return results within 1 second for lists up to 500 items
- **SC-007**: 90% of users successfully add their first item within 5 minutes of registration
- **SC-008**: System supports 1,000 concurrent users without performance degradation
- **SC-009**: File uploads complete within 10 seconds for files up to 10MB on standard mobile network
- **SC-010**: Admin panel displays user statistics and lists within 3 seconds
- **SC-011**: Zero unauthorized data access incidents - all user data remains isolated and secure
- **SC-012**: 95% of users receive notifications for expiring items and take action (view/edit/delete) within 24 hours
- **SC-013**: System maintains 99.9% uptime for authentication and core tracking features
- **SC-014**: Password reset process (if implemented) completes in under 2 minutes
- **SC-015**: Users can delete their account and all data is permanently removed within 24 hours

### Assumptions

- Users have smartphones with iOS 13+ or Android 8+ with notification support
- Users have internet connectivity for initial authentication and data sync
- Users grant notification permissions to receive expiry alerts
- Document file uploads are limited to 10MB to balance storage costs and user needs
- JWT token validity period is 7 days, requiring re-authentication after expiration
- "Expiring Soon" threshold is 7 days, which covers the notification intervals (7 days and 1 day)
- Admin users are created manually via database or separate admin registration process (not through public registration)
- System time is based on user's device local time for notification scheduling
- Users are responsible for entering accurate expiry dates
- File storage uses cloud storage service (e.g., AWS S3, Azure Blob) with appropriate security controls

## Out of Scope (for MVP)

The following features are explicitly excluded from this MVP specification and may be considered for future iterations:

- Password reset/forgot password functionality
- Email verification during registration
- Social login (Google, Facebook, Apple)
- Multi-language support
- Barcode scanning for automatic item entry
- Integration with grocery store APIs for automatic expiry date lookup
- Sharing items or lists with other users (family sharing)
- Recipe suggestions based on expiring items
- Shopping list generation
- Export data to CSV/PDF
- Calendar integration
- Custom notification intervals beyond 30/15/7/1 days
- Recurring items (e.g., monthly subscriptions)
- Item photos (separate from document file uploads)
- Batch operations (bulk delete, bulk edit)
- Advanced analytics and trends (waste reduction over time)
- Web application (mobile-only for MVP)
- Offline mode with local-first architecture (requires internet for authentication)

## Dependencies

- Push notification service (Firebase Cloud Messaging for Android, Apple Push Notification Service for iOS)
- Cloud storage service for document file uploads (AWS S3, Azure Blob Storage, or similar)
- Email service for future password reset functionality (out of scope for MVP but infrastructure consideration)
- Mobile platform notification permissions and background task capabilities

## Constraints

- Must comply with constitution principles: Security & Privacy First, Offline-First Architecture (for core features after authentication), Notification Reliability, Data Integrity & Accuracy, Test-First Development
- Must support iOS 13+ and Android 8+ as minimum platform versions
- Must complete cold app launch in under 2 seconds per constitution performance standards
- Must maintain 60fps scrolling for item lists per constitution performance standards
- Must use AES-256 encryption for sensitive data per constitution security requirements
- Must implement biometric authentication (Face ID, Touch ID, fingerprint) per constitution security requirements
- Must schedule notifications using platform-native APIs per constitution notification reliability principle
- Must use ISO 8601 date format (YYYY-MM-DD) per constitution data integrity principle
- Must achieve 80% code coverage for critical paths per constitution test-first principle
