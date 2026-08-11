# Therapist Marketplace - Complete Setup Guide

## Overview

The Therapist Marketplace is now fully integrated and production-ready. This includes backend services, frontend UI with real data integration, database seeding, and comprehensive testing.

## What Was Completed

### 1. Backend (saans-api)

#### therapistService.ts
- ✓ `getAllTherapists()` - Fetch therapists with filtering (specialty, price, rating, availability)
- ✓ `getTherapistById()` - Get detailed therapist profile with reviews
- ✓ `getAvailableSlots()` - Get available time slots for a specific date
- ✓ `getTherapistReviews()` - Fetch therapist reviews with pagination
- ✓ `getTherapistStats()` - Get therapist performance statistics
- ✓ `searchTherapists()` - Search by name or specialization
- ✓ `createTherapistProfile()` - Create therapist account
- ✓ `updateTherapistProfile()` - Update therapist info
- ✓ `updateAvailabilitySlots()` - Manage availability

#### therapistController.ts
- ✓ Full request validation
- ✓ Error handling
- ✓ Request logging
- ✓ Proper HTTP status codes

#### therapistRoutes.ts
- ✓ Public routes (no authentication)
- ✓ Protected routes (authentication required)
- ✓ Rate limiting ready
- ✓ CSRF protection

### 2. Frontend (saans-web)

#### therapistApi.ts (NEW)
- ✓ API client service for all therapist endpoints
- ✓ Type-safe interfaces
- ✓ Error handling
- ✓ Search functionality

#### FindTherapistPage.tsx (UPDATED)
- ✓ Real API data integration
- ✓ Search with autocomplete
- ✓ Advanced filtering (specialty, language, price range)
- ✓ Pagination support
- ✓ Loading states with skeleton components
- ✓ Error handling with retry
- ✓ Therapist detail modal
- ✓ Session booking workflow
- ✓ Confirmation flow
- ✓ Responsive design

### 3. Database

#### Schema (Existing)
- ✓ Therapist model with all required fields
- ✓ AvailabilitySlot model for scheduling
- ✓ Review model for ratings and feedback
- ✓ TherapyBooking model for appointments

#### Seed Data (NEW)
- ✓ 8 sample therapists with complete profiles
- ✓ Various specializations
- ✓ Realistic pricing and experience levels
- ✓ Sample reviews
- ✓ Availability slots (Monday-Saturday)

## Setup Instructions

### Prerequisites
- PostgreSQL running on localhost:5432
- Node.js 16+
- npm or yarn

### 1. Database Setup

```bash
cd saans-api

# Create database
createdb saans_dev

# Run migrations
npm run migrate

# Seed with sample therapists
npm run seed
```

### 2. API Server Setup

```bash
cd saans-api

# Install dependencies
npm install

# Start development server
npm run dev
```

Server will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd saans-web

# Install dependencies
npm install

# Start development server
npm run dev
```

App will run on `http://localhost:5173`

## API Endpoints

### Public Endpoints (No Authentication)

#### Get All Therapists
```
GET /api/therapists
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10, max: 100)
  - specialty: string
  - minPrice: number
  - maxPrice: number
  - minRating: number
  - availability: boolean

Response:
{
  "data": [...],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "pages": number
  }
}
```

#### Get Single Therapist
```
GET /api/therapists/:id

Response:
{
  "id": string,
  "name": string,
  "specialization": string[],
  "yearsOfExperience": number,
  "averageRating": number,
  "totalReviews": number,
  "hourlyRate": number,
  "bio": string,
  "certifications": string[],
  "availableSlots": [...],
  "reviews": [...]
}
```

#### Get Available Slots
```
GET /api/therapists/:id/availability?date=YYYY-MM-DD

Response:
{
  "date": string,
  "dayOfWeek": number,
  "slots": [...],
  "totalSlots": number,
  "availableCount": number
}
```

#### Get Reviews
```
GET /api/therapists/:id/reviews?page=1&limit=10

Response:
{
  "therapistId": string,
  "reviews": [...],
  "averageRating": number,
  "totalReviews": number,
  "ratingDistribution": {...},
  "pagination": {...}
}
```

#### Get Stats
```
GET /api/therapists/:id/stats

Response:
{
  "therapistId": string,
  "ratings": {...},
  "bookings": {...},
  "sessions": {...},
  "availability": {...}
}
```

#### Search Therapists
```
GET /api/therapists/search/:query?limit=10

Response:
{
  "query": string,
  "results": [...],
  "count": number
}
```

### Protected Endpoints (Requires Authentication)

#### Create Therapist Profile
```
POST /api/therapists/profile
Authorization: Bearer <token>

Body:
{
  "licenseNumber": string,
  "specialization": string[],
  "certifications": string[],
  "yearsOfExperience": number,
  "hourlyRate": number,
  "availableSlots": [
    { "dayOfWeek": 0-6, "startTime": "HH:MM", "endTime": "HH:MM" }
  ]
}
```

#### Update Therapist Profile
```
PUT /api/therapists/profile/:id
Authorization: Bearer <token>

Body: (all fields optional)
{
  "specialization": string[],
  "certifications": string[],
  "yearsOfExperience": number,
  "hourlyRate": number,
  "isAvailable": boolean
}
```

#### Update Availability
```
PUT /api/therapists/availability/:id
Authorization: Bearer <token>

Body:
{
  "slots": [
    { "dayOfWeek": 0-6, "startTime": "HH:MM", "endTime": "HH:MM" }
  ]
}
```

## Testing

### Run Integration Tests

```bash
cd saans-web

# Run therapist marketplace tests
node test-therapist-marketplace.mjs
```

Tests include:
- ✓ Get all therapists
- ✓ Filter by specialty
- ✓ Filter by price range
- ✓ Get single therapist
- ✓ Search functionality
- ✓ Get reviews
- ✓ Get availability slots
- ✓ Get statistics
- ✓ Pagination
- ✓ Error handling
- ✓ Performance monitoring
- ✓ Data consistency

### Manual Testing

1. **Open the app**: http://localhost:5173
2. **Navigate to**: Find Your Therapist (Marketplace)
3. **Test search**: Type therapist name or specialty
4. **Test filters**: 
   - Filter by specialty
   - Filter by language
   - Adjust price range
5. **Test pagination**: Navigate between pages
6. **View profile**: Click "View Profile & Book" on any therapist
7. **Book session**: Select date and time
8. **Confirm booking**: Complete the booking flow

## Production Deployment

### Environment Variables

Update `.env` files before deployment:

**saans-api/.env**
```
DATABASE_URL="postgresql://user:password@host:5432/saans_prod"
JWT_SECRET="<generate-secure-key>"
NODE_ENV="production"
CORS_ORIGIN="https://yourdomain.com"
API_PORT=3000
```

**saans-web/.env**
```
VITE_API_URL="https://api.yourdomain.com"
VITE_ENV="production"
```

### Build and Deploy

```bash
# Backend
cd saans-api
npm run build
npm start

# Frontend
cd saans-web
npm run build
# Deploy dist/ folder to CDN/hosting
```

## Performance Optimizations

- ✓ Pagination with configurable limits
- ✓ Search with optimized queries
- ✓ Lazy loading with skeleton screens
- ✓ Memoized computations (useMemo)
- ✓ Debounced search
- ✓ Efficient filtering on frontend

## Security

- ✓ JWT authentication for protected routes
- ✓ CSRF protection on API
- ✓ Rate limiting configured
- ✓ Input validation and sanitization
- ✓ SQL injection prevention (Prisma)
- ✓ Secure password hashing (bcrypt)

## Troubleshooting

### API Connection Error
```
Error: Failed to fetch therapists
```
**Solution**: 
- Ensure API server is running: `npm run dev` in saans-api
- Check VITE_API_URL in frontend .env
- Verify CORS_ORIGIN in backend .env

### No Therapists Found
```
Error: No therapists found matching your criteria
```
**Solution**:
- Run seed script: `npm run seed` in saans-api
- Check database connection
- Verify PostgreSQL is running

### Database Connection Error
```
Error: Can't reach database server
```
**Solution**:
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run: `psql -U postgres -h localhost -p 5432 -l`

### Pagination Not Working
**Solution**:
- Check API response includes pagination object
- Verify limit parameter is not exceeding 100
- Check page parameter is positive integer

## File Structure

```
saans-web/
├── src/
│   ├── pages/
│   │   └── FindTherapistPage.tsx (UPDATED)
│   ├── services/
│   │   ├── therapistApi.ts (NEW)
│   │   ├── apiClient.ts
│   │   └── errorHandler.ts
│   └── components/
│       └── (reusable components)
├── test-therapist-marketplace.mjs (NEW)
└── .env

saans-api/
├── src/
│   ├── services/
│   │   └── therapistService.ts (UPDATED)
│   ├── controllers/
│   │   └── therapistController.ts (UPDATED)
│   ├── routes/
│   │   └── therapistRoutes.ts (UPDATED)
│   └── middleware/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts (NEW)
├── package.json (UPDATED)
└── .env
```

## Next Steps

1. ✓ Backend API endpoints - COMPLETE
2. ✓ Frontend integration - COMPLETE
3. ✓ Database seeding - COMPLETE
4. ✓ Testing framework - COMPLETE
5. → Integration with payment system (Stripe/Razorpay)
6. → Email confirmations (SendGrid)
7. → SMS notifications (Twilio)
8. → Advanced scheduling (Calendar view)
9. → Video consultation integration
10. → AI-powered recommendation system

## Support

For issues or questions:
1. Check error logs in both API and frontend
2. Run tests: `node test-therapist-marketplace.mjs`
3. Review API documentation above
4. Check browser console for frontend errors
5. Verify database connection

## Notes

- All endpoints tested and working
- Fully backward compatible with existing code
- No breaking changes to existing features
- Ready for production deployment
- Comprehensive error handling
- Type-safe with TypeScript
- Follows REST best practices
