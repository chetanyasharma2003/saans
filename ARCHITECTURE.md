# SAANS Architecture Documentation

## System Overview

```
┌─────────────────┐
│   React App     │
│  (Vite Build)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Vercel  │  (Frontend)
    │  CDN    │
    └────┬────┘
         │
         │ HTTPS
         │
    ┌────┴────────────┐
    │  Express.js     │
    │  API Server     │  (Render)
    └────┬────────────┘
         │
    ┌────┴─────────────┐
    │  PostgreSQL      │
    │  Database        │
    └──────────────────┘
```

## Frontend Architecture

### Project Structure
```
saans-web/
├── src/
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── services/        # API & utility services
│   ├── schemas/         # Zod validation schemas
│   ├── hooks/           # Custom React hooks
│   ├── test/            # Test setup & utils
│   └── App.tsx          # Main app component
├── cypress/             # E2E tests
├── public/              # Static assets
├── vitest.config.ts     # Unit test config
└── vite.config.ts       # Build config
```

### Data Flow
```
User Event → Component → Service (API Call)
                          ↓
                       Axios Interceptor
                          ↓
                       Token Refresh (if needed)
                          ↓
                       Backend API
                          ↓
                       State Update (React)
                          ↓
                       Re-render Component
```

### State Management
- **Local State**: React `useState` for component-level state
- **Context API**: For global user/auth state
- **LocalStorage**: For token persistence
- **No Redux**: Unnecessary complexity for current scale

### Authentication Flow
```
Login → JWT Token → localStorage → Axios Interceptor
                         ↓
                    6-min Auto-Refresh
                         ↓
                    401 Error → New Token
                         ↓
                    Retry Request
```

## Backend Architecture

### Project Structure
```
server/
├── routes/              # API endpoints
├── models/              # Database models (Sequelize)
├── middleware/          # Custom middleware
├── config/              # Configuration files
├── services/            # Business logic
├── schemas/             # Zod validation
├── migrations/          # Database migrations
└── server.js            # Entry point
```

### Request Processing Pipeline
```
HTTP Request
    ↓
CORS Middleware
    ↓
Rate Limiter
    ↓
Auth Middleware (JWT validation)
    ↓
Zod Validation
    ↓
CSRF Protection
    ↓
Route Handler
    ↓
Database Query (Sequelize)
    ↓
Error Handler
    ↓
JSON Response
    ↓
Sentry (if error)
```

### Database Schema

#### Users Table
```sql
id (UUID) - PRIMARY KEY
firstName (String)
lastName (String)
email (String) - UNIQUE
password (String) - hashed
phone (String)
bio (Text)
avatar (String) - URL
gender (Enum: male, female, other)
dateOfBirth (Date)
address (String)
city (String)
state (String)
zipCode (String)
conditions (JSON array)
twoFactorEnabled (Boolean)
isActive (Boolean)
isVerified (Boolean)
lastLogin (Timestamp)
createdAt (Timestamp)
updatedAt (Timestamp)
```

#### Therapists Table
```sql
id (UUID)
userId (FK to Users)
specializations (JSON array)
hourlyRate (Decimal)
rating (Float)
bio (Text)
languages (JSON array)
responseTime (Integer) - minutes
sessionCount (Integer)
verified (Boolean)
```

#### Appointments Table
```sql
id (UUID)
userId (FK to Users)
therapistId (FK to Therapists)
sessionType (Enum: video, phone)
scheduledAt (Timestamp)
duration (Integer) - minutes
price (Decimal)
status (Enum: scheduled, confirmed, completed, cancelled)
notes (Text)
recordingUrl (String)
```

#### MoodEntries Table
```sql
id (UUID)
userId (FK to Users)
mood (Integer 1-5)
energy (Integer 1-5)
stress (Integer 1-5)
anxiety (Integer 1-5)
notes (Text)
date (Date)
```

#### Resources Table
```sql
id (UUID)
title (String)
description (Text)
category (String)
type (Enum: text, video, audio, interactive)
conditions (JSON array)
tags (JSON array)
difficulty (String)
duration (Integer) - minutes
author (String)
rating (Float)
helpfulCount (Integer)
viewCount (Integer)
status (Enum: published, draft, archived)
```

### API Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0
  }
}
```

### Error Handling
```json
{
  "success": false,
  "error": "User not found",
  "code": "USER_NOT_FOUND",
  "details": [
    {
      "path": "email",
      "message": "Email is required"
    }
  ]
}
```

## Security Architecture

### Authentication
- JWT tokens with 1-hour expiry
- Refresh tokens in secure cookies
- Automatic token refresh every 6 minutes
- Password hashing with bcrypt (10 rounds)

### Authorization
- Role-based access control (user, therapist, admin)
- Middleware-level permission checks
- Resource-level authorization on backend

### Input Validation
- Zod schemas on both frontend and backend
- Server-side validation always performed
- Input sanitization for XSS prevention
- SQL injection prevention via ORM

### Rate Limiting
- Global: 100 requests/15 minutes per IP
- Auth: 5 attempts/15 minutes
- Registration: 3 attempts/hour
- Bookings: 5 per minute per user
- API: 30 requests/minute

### CSRF Protection
- Token-based CSRF protection
- Double-submit cookie pattern
- Same-site cookie flags

## Deployment Architecture

### Frontend Deployment (Vercel)
- Automatic builds on git push
- Preview deployments for PRs
- Edge caching for static assets
- Auto-scaling based on traffic
- Environment variables management

### Backend Deployment (Render)
- Docker container deployment
- Auto-scaling with load balancing
- PostgreSQL managed database
- Environment variables management
- Automatic health checks

### CI/CD Pipeline
```
Push to Main
    ↓
GitHub Actions Triggered
    ↓
┌─────────┬─────────┬────────────┐
│ Unit    │ E2E     │ Security   │
│ Tests   │ Tests   │ Scan       │
└────┬────┴────┬────┴─────┬──────┘
     │         │          │
     └────┬────┴────┬─────┘
          │         │
      All Passed?
          ↓
      Build
          ↓
      ┌───┴────┐
      │ Deploy │
      └────────┘
```

## Performance Optimization

### Frontend
- Code splitting with Vite
- Image lazy loading
- Component memoization
- Virtual scrolling for long lists
- Service Worker caching

### Backend
- Database indexing on frequently queried columns
- Query optimization with Sequelize
- Response caching headers
- Pagination for list endpoints
- Connection pooling

### Caching Strategy
- Browser cache: Static assets (1 year)
- API cache: User profile (5 minutes)
- Database cache: Therapist list (1 hour)
- Service Worker: Offline fallbacks

## Monitoring & Logging

### Frontend Monitoring
- Sentry for error tracking
- Web Vitals monitoring
- User session tracking
- API performance monitoring

### Backend Logging
- Pino structured logging
- Log files: app.log, error.log
- Sentry integration for errors
- Request/response logging

### Metrics
- API response time
- Database query time
- Error rate
- User engagement
- Booking conversion rate

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Session/token-based auth
- Database replication ready
- Load balancing support

### Vertical Scaling
- Database optimization (indexing, query optimization)
- Caching layers (Redis ready)
- CDN for static assets
- Compression (gzip/brotli)

### Future Scaling
- Consider Redis for sessions/cache
- Implement database replication
- Add message queue for async jobs
- Microservices architecture when needed

## Technology Decisions

| Decision | Choice | Why | Alternative |
|----------|--------|-----|-------------|
| Database | PostgreSQL | ACID compliance, powerful queries | MongoDB |
| ORM | Sequelize | Type safety, migrations | TypeORM, Prisma |
| Frontend Build | Vite | Fast builds, modern | Webpack, Parcel |
| UI Framework | React | Large ecosystem, DX | Vue, Angular |
| API Style | REST | Simplicity, standards | GraphQL |
| Deployment | Vercel+Render | Easy setup, auto-scaling | AWS, GCP |
| Testing | Vitest+Cypress | Fast, modern | Jest+Playwright |
| Validation | Zod | Type-safe, composable | Joi, Yup |

## Development Workflow

1. **Feature Development**
   - Create feature branch
   - Write tests
   - Implement feature
   - Run linter and tests
   - Create PR

2. **Code Review**
   - Check tests pass
   - Review code quality
   - Verify security
   - Test in staging

3. **Deployment**
   - Merge to main
   - Automatic build & test
   - Deploy to production
   - Monitor for errors

## Environment Configuration

### Development
- Hot module reloading
- Source maps enabled
- Verbose logging
- Mock data

### Staging
- Production build
- Real API integration
- Error tracking enabled
- Performance monitoring

### Production
- Optimized builds
- Error tracking with Sentry
- Rate limiting enforced
- Security headers enabled
- Caching configured

---

**Last Updated**: 2026-10-01
**Architecture Version**: 1.0
**Status**: Production Ready
