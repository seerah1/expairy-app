# Quickstart Guide: Expiry Tracker MVP

**Feature**: 001-expiry-tracker-mvp
**Date**: 2026-01-23
**Purpose**: Developer setup and getting started guide

## Prerequisites

### Required Software

- **Node.js**: 20.x LTS or higher ([Download](https://nodejs.org/))
- **npm**: 10.x or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Expo CLI**: Install globally via `npm install -g expo-cli`
- **PostgreSQL Client**: For database management (optional, Neon provides web UI)

### Development Tools (Recommended)

- **VS Code**: With extensions:
  - ESLint
  - Prettier
  - React Native Tools
  - PostgreSQL (for database queries)
- **iOS Simulator**: Xcode (macOS only) for iOS development
- **Android Emulator**: Android Studio for Android development
- **Expo Go App**: Install on physical device for testing ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Accounts Required

- **Neon Account**: For PostgreSQL database ([Sign up](https://neon.tech/))
- **Expo Account**: For building and deploying ([Sign up](https://expo.dev/))
- **Cloud Storage**: AWS S3 or similar for file uploads (optional for initial development)

---

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd expairy-tracker-app
git checkout 001-expiry-tracker-mvp
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create `.env` file in `backend/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Storage Configuration (AWS S3 or similar)
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=expiry-tracker-uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:8081,exp://localhost:8081

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Get Neon Database URL**:
1. Go to [Neon Console](https://console.neon.tech/)
2. Create new project: "expiry-tracker-mvp"
3. Copy connection string from dashboard
4. Paste into `DATABASE_URL` in `.env`

#### Run Database Migrations

```bash
# Create tables
npm run migrate:up

# Seed initial data (admin user, categories)
npm run seed
```

**Migration Scripts** (add to `package.json`):
```json
{
  "scripts": {
    "migrate:up": "node scripts/migrate.js up",
    "migrate:down": "node scripts/migrate.js down",
    "seed": "node scripts/seed.js",
    "dev": "nodemon server.js",
    "start": "node server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### Start Backend Server

```bash
npm run dev
```

Server should start at `http://localhost:3000`

**Verify Backend**:
```bash
curl http://localhost:3000/api/health
# Expected: {"success": true, "message": "Server is running"}
```

---

### 3. Mobile App Setup

#### Install Dependencies

```bash
cd mobile
npm install
```

#### Configure Environment Variables

Create `.env` file in `mobile/` directory:

```env
# API Configuration
API_URL=http://localhost:3000/api

# Expo Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

**Note**: For physical device testing, replace `localhost` with your computer's local IP address (e.g., `http://192.168.1.100:3000/api`)

#### Start Expo Development Server

```bash
npx expo start
```

**Options**:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on physical device

---

## Development Workflow

### Running the Full Stack

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Mobile App**:
```bash
cd mobile
npx expo start
```

### Testing

#### Backend Tests

```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

#### Mobile App Tests

```bash
cd mobile
npm test                 # Run all tests
npm run test:watch       # Watch mode
```

### Database Management

#### View Database (Neon Console)

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project
3. Click "SQL Editor"
4. Run queries directly in browser

#### Common Database Commands

```bash
# Connect to database (if using local psql client)
psql $DATABASE_URL

# View all tables
\dt

# View table schema
\d users
\d food_items
\d documents

# Query data
SELECT * FROM users;
SELECT * FROM food_items WHERE user_id = 1;
```

#### Reset Database

```bash
cd backend
npm run migrate:down     # Drop all tables
npm run migrate:up       # Recreate tables
npm run seed             # Seed initial data
```

---

## API Testing

### Using cURL

**Register User**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Get Food Items** (requires token):
```bash
curl -X GET http://localhost:3000/api/food-items \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman/Insomnia

1. Import OpenAPI specs from `specs/001-expiry-tracker-mvp/contracts/`
2. Set base URL to `http://localhost:3000/api`
3. Add Authorization header: `Bearer YOUR_JWT_TOKEN`

---

## Common Issues & Solutions

### Backend Issues

**Issue**: `Error: connect ECONNREFUSED`
**Solution**: Check if backend server is running on correct port

**Issue**: `Database connection failed`
**Solution**:
- Verify `DATABASE_URL` in `.env`
- Check Neon project is active
- Ensure SSL mode is enabled (`?sslmode=require`)

**Issue**: `JWT token invalid`
**Solution**:
- Check `JWT_SECRET` is set in `.env`
- Verify token hasn't expired (7 day default)
- Clear tokens and re-login

### Mobile App Issues

**Issue**: `Network request failed`
**Solution**:
- Check `API_URL` in `.env`
- Use local IP instead of `localhost` for physical devices
- Ensure backend server is running

**Issue**: `Unable to resolve module`
**Solution**:
```bash
cd mobile
rm -rf node_modules
npm install
npx expo start --clear
```

**Issue**: iOS Simulator not opening
**Solution**:
- Ensure Xcode is installed (macOS only)
- Run `sudo xcode-select --switch /Applications/Xcode.app`
- Restart Expo dev server

**Issue**: Android Emulator not opening
**Solution**:
- Ensure Android Studio is installed
- Create AVD (Android Virtual Device) in Android Studio
- Start emulator before running `npx expo start`

---

## Project Structure Overview

```
expairy-tracker-app/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/          # Database, JWT, storage config
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # Database queries
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── validators/      # Request validation
│   ├── migrations/          # Database migrations
│   ├── tests/               # Backend tests
│   ├── .env                 # Environment variables (create this)
│   └── server.js            # Entry point
│
├── mobile/                  # React Native + Expo app
│   ├── app/                 # Expo Router screens
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API calls
│   │   ├── store/           # State management
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript types
│   ├── __tests__/           # Mobile tests
│   ├── .env                 # Environment variables (create this)
│   └── app.json             # Expo configuration
│
└── specs/                   # Feature specifications
    └── 001-expiry-tracker-mvp/
        ├── spec.md          # Feature requirements
        ├── plan.md          # Implementation plan
        ├── data-model.md    # Database schema
        ├── research.md      # Technology research
        ├── quickstart.md    # This file
        └── contracts/       # API contracts (OpenAPI)
```

---

## Development Best Practices

### Code Style

- **Backend**: Use ESLint + Prettier with Airbnb config
- **Mobile**: Use ESLint + Prettier with React Native config
- **Formatting**: Run `npm run format` before committing

### Git Workflow

1. Create feature branch: `git checkout -b feature/add-food-items`
2. Make changes and commit: `git commit -m "feat: add food items CRUD"`
3. Push to remote: `git push origin feature/add-food-items`
4. Create pull request for review

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Examples**:
- `feat(auth): add JWT authentication`
- `fix(food-items): correct expiry date calculation`
- `docs(readme): update setup instructions`

### Testing Strategy

1. **Write tests first** (TDD approach per constitution)
2. **Unit tests**: Test individual functions and services
3. **Integration tests**: Test API endpoints with database
4. **E2E tests**: Test critical user journeys (optional for MVP)

### Security Checklist

- [ ] Never commit `.env` files (add to `.gitignore`)
- [ ] Use strong JWT secret (generate with `openssl rand -base64 32`)
- [ ] Hash passwords with bcrypt (12+ rounds)
- [ ] Validate all user inputs
- [ ] Use parameterized queries (prevent SQL injection)
- [ ] Enable CORS only for trusted origins
- [ ] Use HTTPS in production
- [ ] Implement rate limiting on auth endpoints

---

## Next Steps

1. ✅ Complete backend setup
2. ✅ Complete mobile app setup
3. ⏳ Implement authentication (User Story 4)
4. ⏳ Implement food items CRUD (User Story 1)
5. ⏳ Implement notifications (User Story 1)
6. ⏳ Implement dashboard (User Story 2)
7. ⏳ Implement documents CRUD (User Story 3)
8. ⏳ Implement admin panel (User Story 5)
9. ⏳ Run `/sp.tasks` to generate detailed task list

---

## Useful Commands Reference

### Backend

```bash
npm run dev              # Start development server
npm test                 # Run tests
npm run migrate:up       # Run migrations
npm run migrate:down     # Rollback migrations
npm run seed             # Seed database
npm run format           # Format code
npm run lint             # Lint code
```

### Mobile

```bash
npx expo start           # Start Expo dev server
npx expo start --clear   # Clear cache and start
npm test                 # Run tests
npm run format           # Format code
npm run lint             # Lint code
npx expo build:ios       # Build iOS app (requires EAS)
npx expo build:android   # Build Android app (requires EAS)
```

### Database

```bash
psql $DATABASE_URL       # Connect to database
npm run db:reset         # Reset database (drop + migrate + seed)
npm run db:backup        # Backup database (if script exists)
```

---

## Resources

### Documentation

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Express.js Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Neon Docs](https://neon.tech/docs/introduction)

### API Contracts

- View OpenAPI specs in `specs/001-expiry-tracker-mvp/contracts/`
- Import into Postman/Insomnia for testing

### Support

- **Issues**: Report bugs in GitHub Issues
- **Questions**: Ask in team Slack/Discord
- **Documentation**: Check `specs/` directory for detailed specs

---

## Troubleshooting

### Get Help

1. Check this quickstart guide
2. Review error messages carefully
3. Check backend logs: `cd backend && npm run dev`
4. Check mobile logs: Expo dev tools in browser
5. Search GitHub Issues for similar problems
6. Ask team for help with specific error messages

### Debug Mode

**Backend**:
```bash
DEBUG=* npm run dev      # Enable all debug logs
```

**Mobile**:
- Shake device to open Expo dev menu
- Enable "Debug Remote JS" for Chrome DevTools
- Use React DevTools for component inspection

---

**Last Updated**: 2026-01-23
**Maintainer**: Development Team
**Version**: 1.0.0 (MVP)
