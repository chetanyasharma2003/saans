# Therapist API Documentation

Complete production-ready API for managing therapist profiles, availability, and bookings.

## Base URL
```
/api/therapists
```

## Authentication
- Public routes: No authentication required
- Protected routes: Require JWT token in `Authorization: Bearer <token>` header
- Token validation handled by `verifyToken` and `isAuthenticated` middleware

---

## PUBLIC ENDPOINTS

### 1. List All Therapists
**GET** `/`

List all therapists with filtering, sorting, and pagination support.

**Query Parameters:**
- `specialty` (string, optional): Filter by specialization (e.g., "depression", "anxiety")
- `minPrice` (number, optional): Minimum hourly rate (default: 0)
- `maxPrice` (number, optional): Maximum hourly rate (default: 10000)
- `minRating` (number, optional): Minimum average rating (default: 0)
- `availability` (boolean, optional): Filter by availability status (default: true)
- `page` (number, optional): Page number for pagination (default: 1, min: 1)
- `limit` (number, optional): Results per page (default: 10, max: 100)

**Example Request:**
```bash
GET /api/therapists?specialty=anxiety&minPrice=500&maxPrice=2000&minRating=4&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "therapist_id_1",
      "userId": "user_id_1",
      "licenseNumber": "LIC123456",
      "specialization": ["anxiety", "depression"],
      "certifications": ["CBT", "DBT"],
      "yearsOfExperience": 8,
      "averageRating": 4.8,
      "totalReviews": 45,
      "hourlyRate": 1500,
      "isAvailable": true,
      "user": {
        "id": "user_id_1",
        "name": "Dr. Sarah Johnson",
        "profileImage": "url",
        "bio": "Experienced therapist...",
        "city": "New York",
        "state": "NY"
      }
    }
  ],
  "pagination": {
    "total": 125,
    "page": 1,
    "limit": 10,
    "pages": 13
  }
}
```

**Error Responses:**
- `400`: Invalid pagination or price range parameters
- `500`: Server error

---

### 2. Get Single Therapist Details
**GET** `/:id`

Retrieve detailed information about a specific therapist including recent reviews and available slots.

**Parameters:**
- `id` (path): Therapist ID (required)

**Example Request:**
```bash
GET /api/therapists/therapist_id_1
```

**Response (200 OK):**
```json
{
  "id": "therapist_id_1",
  "userId": "user_id_1",
  "licenseNumber": "LIC123456",
  "specialization": ["anxiety", "depression"],
  "certifications": ["CBT", "DBT"],
  "yearsOfExperience": 8,
  "averageRating": 4.8,
  "totalReviews": 45,
  "hourlyRate": 1500,
  "isAvailable": true,
  "user": {
    "id": "user_id_1",
    "email": "dr.sarah@example.com",
    "name": "Dr. Sarah Johnson",
    "profileImage": "url",
    "bio": "Experienced therapist specializing...",
    "phoneNumber": "+1234567890",
    "city": "New York",
    "state": "NY",
    "gender": "Female",
    "dateOfBirth": "1985-03-15"
  },
  "reviews": [
    {
      "id": "review_id_1",
      "rating": 5,
      "content": "Excellent therapist, very helpful",
      "createdAt": "2024-08-01T10:30:00Z",
      "user": {
        "name": "John Doe",
        "profileImage": "url"
      }
    }
  ],
  "availableSlots": [
    {
      "id": "slot_id_1",
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isBooked": false
    }
  ]
}
```

**Error Responses:**
- `404`: Therapist not found
- `500`: Server error

---

### 3. Get Available Slots
**GET** `/availability/:id`

Get available time slots for a therapist on a specific date.

**Parameters:**
- `id` (path): Therapist ID (required)
- `date` (query): Date in format YYYY-MM-DD (required)

**Example Request:**
```bash
GET /api/therapists/availability/therapist_id_1?date=2024-08-15
```

**Response (200 OK):**
```json
{
  "date": "2024-08-15",
  "dayOfWeek": 3,
  "therapistId": "therapist_id_1",
  "slots": [
    {
      "id": "slot_id_1",
      "dayOfWeek": 3,
      "startTime": "09:00",
      "endTime": "10:00",
      "isBooked": false
    },
    {
      "id": "slot_id_2",
      "dayOfWeek": 3,
      "startTime": "14:00",
      "endTime": "15:00",
      "isBooked": false
    }
  ],
  "totalSlots": 8,
  "availableCount": 6
}
```

**Error Responses:**
- `400`: Missing or invalid date parameter
- `404`: Therapist not found
- `500`: Server error

---

### 4. Get Therapist Reviews
**GET** `/reviews/:id`

Retrieve paginated reviews for a therapist with rating distribution.

**Parameters:**
- `id` (path): Therapist ID (required)
- `page` (query): Page number (default: 1)
- `limit` (query): Reviews per page (default: 10, max: 100)

**Example Request:**
```bash
GET /api/therapists/reviews/therapist_id_1?page=1&limit=10
```

**Response (200 OK):**
```json
{
  "therapistId": "therapist_id_1",
  "reviews": [
    {
      "id": "review_id_1",
      "rating": 5,
      "content": "Excellent therapist, very supportive",
      "createdAt": "2024-08-01T10:30:00Z",
      "user": {
        "id": "user_id_5",
        "name": "John Doe",
        "profileImage": "url"
      }
    }
  ],
  "averageRating": 4.8,
  "totalReviews": 45,
  "ratingDistribution": {
    "5": 38,
    "4": 5,
    "3": 2,
    "2": 0,
    "1": 0
  },
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

**Error Responses:**
- `400`: Invalid pagination parameters
- `404`: Therapist not found
- `500`: Server error

---

### 5. Get Therapist Statistics
**GET** `/stats/:id`

Get comprehensive statistics about a therapist's bookings, sessions, ratings, and performance.

**Parameters:**
- `id` (path): Therapist ID (required)

**Example Request:**
```bash
GET /api/therapists/stats/therapist_id_1
```

**Response (200 OK):**
```json
{
  "therapistId": "therapist_id_1",
  "ratings": {
    "average": 4.8,
    "total": 45
  },
  "bookings": {
    "total": 120,
    "completed": 115,
    "cancelled": 3,
    "upcoming": 2,
    "completionRate": 96
  },
  "sessions": {
    "total": 115,
    "avgDuration": 52
  },
  "availability": {
    "isAvailable": true,
    "hourlyRate": 1500
  },
  "specializations": ["anxiety", "depression"],
  "yearsOfExperience": 8
}
```

**Error Responses:**
- `404`: Therapist not found
- `500`: Server error

---

### 6. Search Therapists
**GET** `/search/:query`

Search therapists by name or specialization.

**Parameters:**
- `query` (path): Search term (name or specialization, required)
- `limit` (query): Maximum results (default: 10, max: 100)

**Example Request:**
```bash
GET /api/therapists/search/anxiety?limit=10
```

**Response (200 OK):**
```json
{
  "query": "anxiety",
  "results": [
    {
      "id": "therapist_id_1",
      "userId": "user_id_1",
      "specialization": ["anxiety", "depression"],
      "yearsOfExperience": 8,
      "averageRating": 4.8,
      "hourlyRate": 1500,
      "user": {
        "name": "Dr. Sarah Johnson",
        "profileImage": "url",
        "city": "New York",
        "state": "NY"
      }
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400`: Missing search query
- `500`: Server error

---

## PROTECTED ENDPOINTS (Requires Authentication)

### 1. Create Therapist Profile
**POST** `/profile`

Create a new therapist profile for the authenticated user. User must have THERAPIST role.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "licenseNumber": "LIC123456",
  "specialization": ["anxiety", "depression"],
  "certifications": ["CBT", "DBT"],
  "yearsOfExperience": 8,
  "hourlyRate": 1500,
  "availableSlots": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    {
      "dayOfWeek": 2,
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

**Parameter Details:**
- `licenseNumber` (string, required): Valid, unique license number
- `specialization` (array, required): At least one specialization
- `certifications` (array, optional): Professional certifications
- `yearsOfExperience` (number, required): Must be >= 0
- `hourlyRate` (number, optional): Default 500 if not provided
- `availableSlots` (array, optional): Weekly availability slots
  - `dayOfWeek` (0-6, 0=Sunday): Day of the week
  - `startTime` (HH:mm): Start time in 24-hour format
  - `endTime` (HH:mm): End time in 24-hour format

**Response (201 Created):**
```json
{
  "message": "Therapist profile created successfully",
  "therapist": {
    "id": "therapist_id_1",
    "userId": "user_id_1",
    "licenseNumber": "LIC123456",
    "specialization": ["anxiety", "depression"],
    "certifications": ["CBT", "DBT"],
    "yearsOfExperience": 8,
    "hourlyRate": 1500,
    "averageRating": 0,
    "totalReviews": 0,
    "isAvailable": true,
    "user": {
      "id": "user_id_1",
      "name": "Dr. Sarah Johnson",
      "email": "dr.sarah@example.com",
      "profileImage": null
    },
    "availableSlots": [
      {
        "id": "slot_id_1",
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ]
  }
}
```

**Error Responses:**
- `400`: Missing/invalid required fields or validation error
- `401`: Unauthorized (no token)
- `409`: Therapist profile already exists or license number already in use
- `500`: Server error

---

### 2. Update Therapist Profile
**PUT** `/profile/:id`

Update an existing therapist profile (specialization, certifications, rate, availability).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Parameters:**
- `id` (path): Therapist ID (required)

**Request Body:**
```json
{
  "specialization": ["anxiety", "depression", "stress"],
  "certifications": ["CBT", "DBT", "EMDR"],
  "yearsOfExperience": 9,
  "hourlyRate": 1800,
  "isAvailable": true
}
```

**Parameter Details:**
- `specialization` (array, optional): Updated specializations
- `certifications` (array, optional): Updated certifications
- `yearsOfExperience` (number, optional): Must be >= 0
- `hourlyRate` (number, optional): Must be > 0
- `isAvailable` (boolean, optional): Availability status

**Response (200 OK):**
```json
{
  "message": "Therapist profile updated successfully",
  "therapist": {
    "id": "therapist_id_1",
    "userId": "user_id_1",
    "specialization": ["anxiety", "depression", "stress"],
    "certifications": ["CBT", "DBT", "EMDR"],
    "yearsOfExperience": 9,
    "hourlyRate": 1800,
    "isAvailable": true,
    "user": {
      "id": "user_id_1",
      "name": "Dr. Sarah Johnson",
      "email": "dr.sarah@example.com",
      "profileImage": null
    }
  }
}
```

**Error Responses:**
- `400`: Invalid input data or validation error
- `401`: Unauthorized (no token)
- `404`: Therapist not found
- `500`: Server error

---

### 3. Update Availability Slots
**PUT** `/availability/:id`

Update weekly availability slots for a therapist. Replaces all existing slots.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Parameters:**
- `id` (path): Therapist ID (required)

**Request Body:**
```json
{
  "slots": [
    {
      "dayOfWeek": 1,
      "startTime": "10:00",
      "endTime": "18:00"
    },
    {
      "dayOfWeek": 2,
      "startTime": "10:00",
      "endTime": "18:00"
    },
    {
      "dayOfWeek": 3,
      "startTime": "14:00",
      "endTime": "20:00"
    }
  ]
}
```

**Parameter Details:**
- `slots` (array, required): Array of availability slots
  - `dayOfWeek` (0-6): Day of week (0=Sunday, 6=Saturday)
  - `startTime` (HH:mm): Start time in 24-hour format
  - `endTime` (HH:mm): End time in 24-hour format

**Response (200 OK):**
```json
{
  "message": "Availability slots updated successfully",
  "count": 3,
  "slots": [
    {
      "id": "slot_id_1",
      "therapistId": "therapist_id_1",
      "dayOfWeek": 1,
      "startTime": "10:00",
      "endTime": "18:00",
      "isBooked": false,
      "createdAt": "2024-08-07T12:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid slot data or validation error
- `401`: Unauthorized (no token)
- `404`: Therapist not found
- `500`: Server error

---

## Error Handling

All endpoints follow standardized error responses:

**400 Bad Request:**
```json
{
  "error": "Description of the validation error"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "error": "Therapist not found"
}
```

**409 Conflict:**
```json
{
  "error": "Therapist profile already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to perform operation"
}
```

---

## Rate Limiting & Best Practices

1. **Pagination**: Use `page` and `limit` parameters for large result sets
2. **Filtering**: Combine filters to reduce result sets and improve performance
3. **Error Handling**: Always handle error responses gracefully
4. **Authentication**: Store tokens securely and refresh before expiry
5. **Caching**: Consider caching therapist lists on the client side

---

## Database Models

### Therapist
- `id`: Unique identifier
- `userId`: Reference to User
- `licenseNumber`: Unique license number
- `specialization`: Array of specializations
- `certifications`: Array of certifications
- `yearsOfExperience`: Number
- `averageRating`: Float (0-5)
- `totalReviews`: Integer
- `hourlyRate`: Float
- `isAvailable`: Boolean

### AvailabilitySlot
- `id`: Unique identifier
- `therapistId`: Reference to Therapist
- `dayOfWeek`: 0-6 (Sunday=0, Saturday=6)
- `startTime`: HH:mm format
- `endTime`: HH:mm format
- `isBooked`: Boolean

### Review
- `id`: Unique identifier
- `userId`: Reference to User
- `therapistId`: Reference to Therapist
- `rating`: 1-5
- `content`: Review text
- `createdAt`: Timestamp

---

## Example Usage (cURL)

### Get all therapists
```bash
curl -X GET "http://localhost:3000/api/therapists?specialty=anxiety&page=1&limit=10"
```

### Get single therapist
```bash
curl -X GET "http://localhost:3000/api/therapists/therapist_id_1"
```

### Create therapist profile
```bash
curl -X POST "http://localhost:3000/api/therapists/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "licenseNumber": "LIC123456",
    "specialization": ["anxiety"],
    "yearsOfExperience": 5,
    "hourlyRate": 1000
  }'
```

### Update availability
```bash
curl -X PUT "http://localhost:3000/api/therapists/availability/therapist_id_1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slots": [
      {"dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00"}
    ]
  }'
```
