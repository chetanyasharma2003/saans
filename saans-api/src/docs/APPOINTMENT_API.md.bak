# Appointment Booking API Documentation

## Overview
Complete production-ready API for booking, managing, and tracking therapy appointments. Includes automatic 24-hour reminders and no-show detection.

## Features
- Book appointments with therapist availability checking
- View personal appointment history
- Therapist can view their scheduled appointments
- Update appointment status (SCHEDULED → COMPLETED/CANCELLED/NO_SHOW)
- Reschedule appointments with conflict prevention
- Automatic 24-hour reminder notifications
- Automatic no-show detection (30 minutes after scheduled time)
- Subscription-based session limits enforcement
- Real-time conflict prevention

## Base URL
```
http://localhost:3000/api/appointments
```

## Authentication
All endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Book Appointment
**POST** `/book`

Create a new appointment with a therapist.

#### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "therapistId": "string (required)",
  "scheduledAt": "2024-12-20T14:00:00Z (ISO datetime, required)",
  "duration": 60,
  "reason": "string (optional)",
  "notes": "string (optional)"
}
```

#### Validation Rules
- `therapistId` - Must exist and be available
- `scheduledAt` - Must be >= 24 hours in future
- `duration` - 1-480 minutes (8 hours max)
- No conflicting appointments at that time

#### Response (201 Created)
```json
{
  "success": true,
  "appointment": {
    "id": "clx123abc",
    "scheduledAt": "2024-12-20T14:00:00Z",
    "duration": 60,
    "price": 500,
    "status": "SCHEDULED",
    "therapist": {
      "id": "therapist1",
      "name": "Dr. John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-12-13T10:00:00Z"
  }
}
```

#### Error Responses
- **400** - Invalid input, missing fields, or scheduling conflict
- **401** - Unauthorized (no token)
- **400** - Subscription expired or session limit reached

---

### 2. Get My Appointments
**GET** `/my-appointments`

Retrieve all appointments for the logged-in user (patient view).

#### Query Parameters
- `status` (optional) - Filter by status: `SCHEDULED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`

#### Example Request
```
GET /api/appointments/my-appointments?status=SCHEDULED
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "success": true,
  "count": 3,
  "appointments": [
    {
      "id": "apt123",
      "scheduledAt": "2024-12-20T14:00:00Z",
      "duration": 60,
      "status": "SCHEDULED",
      "price": 500,
      "therapist": {
        "id": "ther1",
        "name": "Dr. Jane Smith",
        "email": "jane@example.com",
        "profileImage": "url",
        "specialization": ["Anxiety", "Depression"],
        "averageRating": 4.8
      },
      "sessionRecord": null,
      "notes": "Anxiety management session",
      "createdAt": "2024-12-13T10:00:00Z"
    }
  ]
}
```

---

### 3. Get Therapist's Appointments
**GET** `/therapist-appointments/:therapistId`

Get all appointments for a specific therapist (therapist view).

#### Path Parameters
- `therapistId` (required) - The therapist's ID

#### Query Parameters
- `status` (optional) - Filter by status

#### Example Request
```
GET /api/appointments/therapist-appointments/ther123?status=SCHEDULED
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "success": true,
  "count": 5,
  "appointments": [
    {
      "id": "apt456",
      "scheduledAt": "2024-12-20T10:00:00Z",
      "duration": 50,
      "status": "SCHEDULED",
      "patient": {
        "id": "user123",
        "name": "John Patient",
        "email": "patient@example.com",
        "profileImage": "url",
        "phoneNumber": "+91-9999999999"
      },
      "sessionRecord": null,
      "notes": "First consultation",
      "createdAt": "2024-12-10T11:30:00Z"
    }
  ]
}
```

---

### 4. Get Appointment Details
**GET** `/:id`

Retrieve detailed information about a specific appointment.

#### Path Parameters
- `id` (required) - Appointment ID

#### Example Request
```
GET /api/appointments/apt123
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "success": true,
  "appointment": {
    "id": "apt123",
    "scheduledAt": "2024-12-20T14:00:00Z",
    "duration": 60,
    "status": "SCHEDULED",
    "price": 500,
    "meetingUrl": "https://meet.google.com/abc-defg",
    "notes": "Session notes",
    "patient": {
      "id": "pat1",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+91-9876543210",
      "profileImage": "url"
    },
    "therapist": {
      "id": "ther1",
      "name": "Dr. Jane Smith",
      "email": "jane@example.com",
      "profileImage": "url"
    },
    "sessionRecord": {
      "id": "sess123",
      "status": "pending",
      "therapistNotes": null,
      "createdAt": null
    },
    "createdAt": "2024-12-13T10:00:00Z",
    "cancelledAt": null,
    "cancelReason": null
  }
}
```

#### Error Responses
- **404** - Appointment not found
- **403** - Forbidden - User cannot access this appointment

---

### 5. Update Appointment Status
**PUT** `/:id/status`

Update the status of an appointment (complete, cancel, or mark as no-show).

#### Path Parameters
- `id` (required) - Appointment ID

#### Request Body
```json
{
  "status": "COMPLETED",
  "cancelReason": "string (only for CANCELLED status)"
}
```

#### Valid Status Transitions
```
SCHEDULED → COMPLETED
SCHEDULED → CANCELLED
SCHEDULED → NO_SHOW
COMPLETED → (none)
CANCELLED → (none)
NO_SHOW → (none)
```

#### Example Request
```
PUT /api/appointments/apt123/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Appointment status updated to COMPLETED",
  "appointment": {
    "id": "apt123",
    "status": "COMPLETED",
    "scheduledAt": "2024-12-20T14:00:00Z"
  }
}
```

#### Error Responses
- **404** - Appointment not found
- **400** - Invalid status transition

---

### 6. Reschedule Appointment
**POST** `/:id/reschedule`

Reschedule an appointment to a new date and time.

#### Path Parameters
- `id` (required) - Appointment ID

#### Request Body
```json
{
  "newDateTime": "2024-12-22T15:00:00Z"
}
```

#### Validation Rules
- New datetime must be >= 24 hours in future
- New datetime must not conflict with therapist's other appointments
- Appointment must be in SCHEDULED status

#### Example Request
```
POST /api/appointments/apt123/reschedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "newDateTime": "2024-12-22T15:00:00Z"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Appointment rescheduled successfully",
  "appointment": {
    "id": "apt123",
    "scheduledAt": "2024-12-22T15:00:00Z",
    "therapistName": "Dr. Jane Smith"
  }
}
```

#### Error Responses
- **404** - Appointment not found
- **400** - Invalid time slot or scheduling conflict
- **400** - Cannot reschedule completed/cancelled appointments

---

### 7. Cancel Appointment
**POST** `/:id/cancel`

Cancel an appointment with an optional reason.

#### Path Parameters
- `id` (required) - Appointment ID

#### Request Body
```json
{
  "reason": "string (optional)"
}
```

#### Example Request
```
POST /api/appointments/apt123/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Emergency came up"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Appointment status updated to CANCELLED",
  "appointment": {
    "id": "apt123",
    "status": "CANCELLED",
    "scheduledAt": "2024-12-20T14:00:00Z"
  }
}
```

---

### 8. Check Therapist Availability
**GET** `/availability/:therapistId`

Check if a therapist is available at a specific date and time.

#### Path Parameters
- `therapistId` (required) - The therapist's ID

#### Query Parameters
- `dateTime` (required) - ISO datetime string
- `duration` (required) - Duration in minutes

#### Example Request
```
GET /api/appointments/availability/ther123?dateTime=2024-12-20T14:00:00Z&duration=60
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "success": true,
  "therapistId": "ther123",
  "dateTime": "2024-12-20T14:00:00Z",
  "duration": 60,
  "available": true
}
```

#### Response (With Conflict)
```json
{
  "success": true,
  "therapistId": "ther123",
  "dateTime": "2024-12-20T14:00:00Z",
  "duration": 60,
  "available": false,
  "conflictingAppointmentId": "apt456"
}
```

---

## Automatic Background Jobs

### 24-Hour Appointment Reminders
- **Frequency**: Every 30 minutes
- **Trigger**: Appointments scheduled between 24-25 hours from now
- **Action**: Creates notifications for both patient and therapist
- **Future Enhancement**: Send email reminders (requires email service setup)

### No-Show Detection
- **Frequency**: Every 60 minutes
- **Trigger**: SCHEDULED appointments that are 30+ minutes past start time
- **Action**: Automatically marks appointment as NO_SHOW
- **Impact**: May affect therapist rating/review count

---

## Appointment Statuses

| Status | Description | Transitions To |
|--------|-------------|----------------|
| SCHEDULED | Appointment is booked but not yet completed | COMPLETED, CANCELLED, NO_SHOW |
| COMPLETED | Appointment was conducted successfully | (final) |
| CANCELLED | Appointment was cancelled by patient or therapist | (final) |
| NO_SHOW | Patient didn't show up for appointment | (final) |

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "therapistId, scheduledAt, and duration are required"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "error": "Appointment not found"
}
```

#### 403 Forbidden
```json
{
  "error": "Forbidden - you cannot access this appointment"
}
```

---

## Business Rules

1. **Minimum Advance Booking**: 24 hours in advance
2. **Session Duration**: 1-480 minutes (max 8 hours)
3. **No Double Booking**: Therapist cannot have overlapping appointments
4. **Subscription Enforcement**: Patient must have active subscription with available sessions
5. **Cancellation**: Only SCHEDULED appointments can be cancelled
6. **Rescheduling**: Only SCHEDULED appointments can be rescheduled

---

## Example Workflow

### 1. Book an Appointment
```bash
curl -X POST http://localhost:3000/api/appointments/book \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "ther123",
    "scheduledAt": "2024-12-20T14:00:00Z",
    "duration": 60,
    "notes": "Anxiety consultation"
  }'
```

### 2. View Your Appointments
```bash
curl http://localhost:3000/api/appointments/my-appointments \
  -H "Authorization: Bearer token"
```

### 3. Get Appointment Details
```bash
curl http://localhost:3000/api/appointments/apt123 \
  -H "Authorization: Bearer token"
```

### 4. Reschedule
```bash
curl -X POST http://localhost:3000/api/appointments/apt123/reschedule \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "newDateTime": "2024-12-22T10:00:00Z"
  }'
```

### 5. Mark as Complete
```bash
curl -X PUT http://localhost:3000/api/appointments/apt123/status \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'
```

---

## Database Schema

### TherapyBooking Model
```typescript
model TherapyBooking {
  id               String    @id @default(cuid())
  userId           String
  therapistId      String
  scheduledAt      DateTime
  duration         Int       // in minutes
  status           BookingStatus @default(SCHEDULED)
  price            Float
  notes            String?
  cancelledAt      DateTime?
  cancelReason     String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relations
  user             User      @relation(fields: [userId], references: [id])
  therapist        Therapist @relation(fields: [therapistId], references: [id])
  sessionRecord    SessionRecord?
}
```

---

## Performance Considerations

1. **Database Indexes**: 
   - TherapyBooking indexed on (userId, scheduledAt)
   - TherapyBooking indexed on (therapistId, scheduledAt)
   - TherapyBooking indexed on status for filtering

2. **Caching**: Redis used for reminder scheduling and job coordination

3. **Query Optimization**: Uses `.include()` to reduce N+1 queries

4. **Pagination**: (Future enhancement) Implement pagination for large result sets

---

## Security Considerations

1. **Authorization**: All endpoints verify user has access to appointment
2. **Input Validation**: All inputs validated before database operations
3. **SQL Injection Prevention**: Using Prisma ORM
4. **Rate Limiting**: (Future enhancement) Implement per-user rate limits
5. **Audit Logging**: (Future enhancement) Log all appointment changes

---

## Future Enhancements

1. Email reminder service integration
2. SMS notifications
3. Video call integration (meeting URL generation)
4. Appointment rescheduling suggestions
5. Cancellation reason analytics
6. Therapist availability calendar view
7. Bulk appointment booking
8. Appointment series/recurring bookings
9. In-app chat before appointment
10. Post-appointment feedback forms
