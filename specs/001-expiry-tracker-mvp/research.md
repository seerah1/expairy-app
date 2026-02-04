# Research: Expiry Tracker MVP

**Feature**: 001-expiry-tracker-mvp
**Date**: 2026-01-23
**Purpose**: Technology research and best practices for React Native + Expo mobile app with Node.js backend

## Technology Stack Decisions

### Frontend: React Native + Expo

**Decision**: Use React Native with Expo SDK 50+ for cross-platform mobile development

**Rationale**:
- Single codebase for iOS and Android reduces development time
- Expo provides managed workflow with built-in tools (notifications, secure storage, file system)
- Expo Router enables file-based routing similar to Next.js
- Large ecosystem and community support
- Over-the-air updates via Expo Updates
- Simplified build and deployment process

**Alternatives Considered**:
- **Native iOS (Swift) + Native Android (Kotlin)**: Rejected due to doubled development effort and maintenance cost
- **Flutter**: Rejected due to team's JavaScript/TypeScript expertise and React ecosystem familiarity
- **Ionic/Capacitor**: Rejected due to performance concerns for 60fps scrolling requirement

**Best Practices**:
- Use TypeScript for type safety and better developer experience
- Implement Expo Router for navigation (file-based routing)
- Use React Native Paper for Material Design components
- Leverage Expo SecureStore for sensitive data (JWT tokens)
- Use AsyncStorage for offline caching
- Implement FlatList with virtualization for large lists
- Use Expo Notifications for local push notifications
- Follow React Native performance best practices (memoization, lazy loading)

### Backend: Node.js + Express.js

**Decision**: Use Node.js 20.x LTS with Express.js 4.x for REST API backend

**Rationale**:
- JavaScript/TypeScript consistency across frontend and backend
- Express.js is mature, well-documented, and widely adopted
- Large middleware ecosystem (authentication, validation, security)
- Excellent PostgreSQL support via node-postgres (pg)
- Easy deployment to cloud platforms (Vercel, Railway, Render)
- Non-blocking I/O suitable for API workloads

**Alternatives Considered**:
- **NestJS**: Rejected for MVP due to additional complexity and learning curve
- **Fastify**: Rejected due to smaller ecosystem despite better performance
- **Python (FastAPI)**: Rejected to maintain JavaScript/TypeScript consistency
- **Go**: Rejected due to team expertise and ecosystem maturity for rapid MVP development

**Best Practices**:
- Use Express.js middleware pattern for cross-cutting concerns
- Implement JWT-based authentication with refresh tokens (post-MVP)
- Use express-validator for request validation
- Implement rate limiting on authentication endpoints
- Use Helmet.js for security headers
- Structure code with MVC pattern (routes, controllers, services, models)
- Use async/await for database operations
- Implement centralized error handling middleware
- Use environment variables for configuration
- Log requests and errors for debugging

### Database: PostgreSQL (Neon)

**Decision**: Use PostgreSQL 15+ hosted on Neon serverless platform

**Rationale**:
- PostgreSQL is ACID-compliant, ensuring data integrity (constitution requirement)
- Native DATE type supports ISO 8601 format
- Excellent support for indexes, constraints, and transactions
- Neon provides serverless PostgreSQL with automatic scaling
- Connection pooling and branching for development/staging
- Free tier suitable for MVP development
- Easy migration to self-hosted PostgreSQL if needed

**Alternatives Considered**:
- **MongoDB**: Rejected due to lack of ACID guarantees and schema flexibility risks for critical data
- **SQLite**: Rejected for backend (though suitable for offline-first mobile local storage)
- **MySQL**: Rejected due to PostgreSQL's superior JSON support and advanced features
- **Supabase**: Rejected to avoid vendor lock-in and maintain flexibility

**Best Practices**:
- Use connection pooling (pg.Pool) for efficient database connections
- Implement database migrations (node-pg-migrate or raw SQL)
- Create indexes on frequently queried columns (user_id, expiry_date, status)
- Use parameterized queries to prevent SQL injection
- Implement foreign key constraints for referential integrity
- Use transactions for multi-step operations
- Store dates in DATE type (ISO 8601 compliant)
- Use TIMESTAMP WITH TIME ZONE for created_at/updated_at fields
- Implement soft deletes for audit trail (optional for MVP)

### Authentication: JWT

**Decision**: Use JSON Web Tokens (JWT) for stateless authentication

**Rationale**:
- Stateless authentication scales horizontally
- No server-side session storage required
- Works well with mobile apps (store token in SecureStore)
- Industry-standard approach for REST APIs
- Easy to implement with jsonwebtoken library
- Supports expiration and refresh token patterns

**Alternatives Considered**:
- **Session-based auth**: Rejected due to server-side state and scaling complexity
- **OAuth2**: Overkill for MVP, can be added post-MVP for social login
- **Firebase Auth**: Rejected to avoid vendor lock-in

**Best Practices**:
- Use bcrypt with 12+ rounds for password hashing
- Set JWT expiration to 7 days (per spec)
- Store JWT in Expo SecureStore (encrypted on device)
- Include user ID and role in JWT payload
- Validate JWT on every protected endpoint
- Implement token refresh mechanism (post-MVP)
- Use HTTPS for all API calls
- Implement rate limiting on login/register endpoints
- Log authentication attempts for security auditing

### Notifications: Expo Notifications

**Decision**: Use Expo Notifications for local push notifications

**Rationale**:
- Cross-platform API for iOS and Android
- Local notifications scheduled on-device (no server dependency)
- Notifications persist through app termination and device restarts
- Simpler implementation than platform-native (FCM/APNS)
- Suitable for MVP timeline
- Can migrate to platform-native post-MVP if needed

**Alternatives Considered**:
- **Firebase Cloud Messaging (FCM)**: Rejected for MVP due to additional server infrastructure
- **Apple Push Notification Service (APNS)**: Rejected due to iOS-only support
- **OneSignal**: Rejected to avoid third-party dependency for local notifications

**Best Practices**:
- Request notification permissions with clear explanation
- Schedule notifications using Expo.Notifications.scheduleNotificationAsync
- Use trigger with date for scheduled notifications
- Cancel notifications when item deleted or updated
- Include item ID in notification data for deep linking
- Test notification delivery on both iOS and Android
- Handle notification permissions denial gracefully
- Provide in-app notification preview/test feature

### File Storage: Cloud Storage

**Decision**: Use AWS S3 or similar cloud storage for document file uploads

**Rationale**:
- Scalable and reliable file storage
- Signed URLs for secure access control
- Pay-per-use pricing suitable for MVP
- Easy integration with Node.js (AWS SDK)
- Supports large files (up to 10MB per spec)

**Alternatives Considered**:
- **Neon Blob Storage**: Evaluate if available, otherwise use S3
- **Local file system**: Rejected due to scaling and backup concerns
- **Database BLOB storage**: Rejected due to performance and size limitations

**Best Practices**:
- Generate unique file names (UUID + original extension)
- Validate file type and size before upload
- Use signed URLs with expiration for secure access
- Implement file compression for images (expo-image-manipulator)
- Store file metadata in PostgreSQL (file_path, size, mime_type)
- Implement file deletion when document deleted
- Use environment variables for storage credentials

## Architecture Patterns

### Mobile App Architecture

**Pattern**: Feature-based structure with service layer

**Structure**:
```
app/                    # Expo Router screens
src/
  components/           # Reusable UI components
  services/             # API calls and business logic
  store/                # State management (Context API)
  utils/                # Utility functions
  types/                # TypeScript types
  constants/            # App constants
```

**Rationale**:
- Clear separation of concerns
- Reusable components and services
- Easy to test and maintain
- Scales well as app grows

### Backend Architecture

**Pattern**: MVC (Model-View-Controller) with service layer

**Structure**:
```
src/
  config/               # Configuration
  middleware/           # Express middleware
  models/               # Database queries
  controllers/          # Request handlers
  routes/               # API routes
  services/             # Business logic
  utils/                # Utility functions
  validators/           # Request validation
```

**Rationale**:
- Industry-standard pattern for Express.js
- Clear separation of concerns
- Easy to test each layer independently
- Supports dependency injection
- Scales well with team growth

### API Design

**Pattern**: RESTful API with resource-based endpoints

**Principles**:
- Use HTTP methods correctly (GET, POST, PUT, DELETE)
- Use plural nouns for resources (/food-items, /documents)
- Use nested routes for relationships (/users/:id/food-items)
- Return appropriate HTTP status codes
- Use consistent error response format
- Version API if needed (/api/v1)

**Example Endpoints**:
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/food-items
POST   /api/food-items
GET    /api/food-items/:id
PUT    /api/food-items/:id
DELETE /api/food-items/:id
GET    /api/dashboard
GET    /api/admin/users
```

## Security Best Practices

### Backend Security

1. **Input Validation**: Use express-validator for all inputs
2. **SQL Injection Prevention**: Use parameterized queries
3. **XSS Prevention**: Sanitize user inputs, use Helmet.js
4. **CSRF Protection**: Not needed for JWT-based API (no cookies)
5. **Rate Limiting**: Implement on auth endpoints (express-rate-limit)
6. **CORS**: Configure allowed origins
7. **Security Headers**: Use Helmet.js
8. **Password Hashing**: bcrypt with 12+ rounds
9. **JWT Security**: Short expiration, secure storage
10. **HTTPS**: Enforce TLS 1.3 in production

### Mobile Security

1. **Secure Storage**: Use Expo SecureStore for JWT tokens
2. **API Communication**: HTTPS only
3. **Input Validation**: Validate on client and server
4. **Biometric Auth**: Use Expo LocalAuthentication
5. **Code Obfuscation**: Enable in production builds
6. **Certificate Pinning**: Consider for post-MVP
7. **Jailbreak Detection**: Consider for post-MVP

## Performance Optimization

### Mobile App

1. **List Virtualization**: Use FlatList with proper keyExtractor
2. **Image Optimization**: Compress before upload, cache after download
3. **Code Splitting**: Use React.lazy for large components
4. **Memoization**: Use React.memo, useMemo, useCallback
5. **Offline Caching**: Cache API responses in AsyncStorage
6. **Optimistic UI**: Update UI before API response
7. **Debouncing**: Debounce search inputs
8. **Bundle Size**: Analyze and optimize with Expo's tools

### Backend

1. **Database Indexing**: Index user_id, expiry_date, status columns
2. **Connection Pooling**: Use pg.Pool for database connections
3. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries
4. **Caching**: Consider Redis for frequently accessed data (post-MVP)
5. **Pagination**: Implement for list endpoints
6. **Compression**: Use compression middleware for responses
7. **Async Operations**: Use async/await, avoid blocking operations

## Testing Strategy

### Mobile App Testing

1. **Unit Tests**: Jest for utility functions and business logic
2. **Component Tests**: React Native Testing Library
3. **Integration Tests**: Test API service layer with mocked responses
4. **E2E Tests**: Detox for critical user journeys (optional for MVP)
5. **Manual Testing**: Test on real iOS and Android devices

### Backend Testing

1. **Unit Tests**: Jest for services and utilities
2. **Integration Tests**: Supertest for API endpoints
3. **Database Tests**: pg-mem for in-memory PostgreSQL
4. **Security Tests**: Test authentication and authorization
5. **Load Tests**: Artillery or k6 for performance testing (post-MVP)

## Development Workflow

### Environment Setup

1. **Mobile**: Install Node.js, Expo CLI, iOS Simulator/Android Emulator
2. **Backend**: Install Node.js, PostgreSQL client, Neon CLI
3. **Database**: Create Neon project, get connection string
4. **Version Control**: Git with feature branch workflow
5. **CI/CD**: GitHub Actions for automated testing and deployment

### Development Process

1. **Feature Branch**: Create branch from main (001-expiry-tracker-mvp)
2. **TDD**: Write tests first, then implementation
3. **Code Review**: PR review before merge
4. **Testing**: Run all tests before commit
5. **Deployment**: Deploy backend to cloud, mobile via Expo EAS

## Deployment Strategy

### Backend Deployment

**Options**:
1. **Vercel**: Serverless functions, easy deployment, free tier
2. **Railway**: Container-based, PostgreSQL included, simple setup
3. **Render**: Similar to Railway, good free tier
4. **Fly.io**: Global edge deployment, good for low latency

**Recommendation**: Railway or Render for MVP (includes PostgreSQL, simple deployment)

### Mobile Deployment

**Process**:
1. **Development**: Expo Go app for testing
2. **Preview**: Expo EAS Build for internal testing
3. **Production**: Submit to App Store and Google Play via EAS Submit

### Database Deployment

**Neon**: Already cloud-hosted, no additional deployment needed

## Risk Mitigation

### Technical Risks

1. **Offline-First Complexity**: Mitigated by caching + optimistic UI for MVP
2. **Notification Reliability**: Mitigated by using Expo's proven notification system
3. **File Upload Performance**: Mitigated by 10MB limit and compression
4. **Database Scaling**: Mitigated by Neon's auto-scaling
5. **Security Vulnerabilities**: Mitigated by following best practices and audits

### Operational Risks

1. **Third-Party Dependencies**: Pin versions, monitor for vulnerabilities
2. **API Rate Limits**: Implement rate limiting and monitoring
3. **Data Loss**: Implement backups and point-in-time recovery
4. **Performance Degradation**: Monitor with APM tools (post-MVP)

## Next Steps

1. ✅ Complete Phase 0: Research (this document)
2. ⏳ Phase 1: Create data-model.md with database schema
3. ⏳ Phase 1: Create API contracts in contracts/ directory
4. ⏳ Phase 1: Create quickstart.md for developer setup
5. ⏳ Phase 1: Update agent context with technology stack
6. ⏳ Phase 2: Generate tasks.md via /sp.tasks command
