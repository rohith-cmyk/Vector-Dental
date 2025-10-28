# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Signup

Create a new user and clinic account.

**Endpoint:** `POST /auth/signup`

**Body:**
```json
{
  "email": "admin@clinic.com",
  "password": "password123",
  "name": "Dr. John Smith",
  "clinicName": "Smith Dental Clinic"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@clinic.com",
      "name": "Dr. John Smith",
      "role": "ADMIN",
      "clinicId": "uuid",
      "clinic": {
        "id": "uuid",
        "name": "Smith Dental Clinic"
      }
    },
    "token": "jwt-token"
  }
}
```

### Login

Login with existing credentials.

**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "admin@clinic.com",
  "password": "password123"
}
```

**Response:** Same as signup

### Get Current User

Get the currently authenticated user's information.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@clinic.com",
    "name": "Dr. John Smith",
    "role": "ADMIN",
    "clinicId": "uuid",
    "clinic": {
      "id": "uuid",
      "name": "Smith Dental Clinic"
    }
  }
}
```

## Contacts

### Get All Contacts

Get all contacts for the authenticated user's clinic.

**Endpoint:** `GET /contacts`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional)
- `specialty` (string, optional)
- `status` (string, optional: "ACTIVE" | "INACTIVE")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Dr. Jane Ortho",
      "specialty": "Orthodontics",
      "phone": "(555) 123-4567",
      "email": "jane@ortho.com",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### Get Contact by ID

**Endpoint:** `GET /contacts/:id`

### Create Contact

**Endpoint:** `POST /contacts`

**Body:**
```json
{
  "name": "Dr. Jane Ortho",
  "specialty": "Orthodontics",
  "phone": "(555) 123-4567",
  "email": "jane@ortho.com",
  "address": "123 Main St",
  "notes": "Specializes in adult braces"
}
```

### Update Contact

**Endpoint:** `PUT /contacts/:id`

**Body:** Same as create (all fields optional)

### Delete Contact

**Endpoint:** `DELETE /contacts/:id`

## Referrals

### Get All Referrals

**Endpoint:** `GET /referrals`

**Query Parameters:**
- `page`, `limit`, `search` (same as contacts)
- `status` (string: "DRAFT" | "SENT" | "ACCEPTED" | "COMPLETED" | "CANCELLED")
- `urgency` (string: "ROUTINE" | "URGENT" | "EMERGENCY")

### Create Referral

**Endpoint:** `POST /referrals`

**Body:**
```json
{
  "contactId": "uuid",
  "patientName": "John Patient",
  "patientDob": "1990-01-01",
  "patientPhone": "(555) 987-6543",
  "patientEmail": "john@email.com",
  "reason": "Needs orthodontic evaluation for braces",
  "urgency": "ROUTINE",
  "notes": "Patient prefers morning appointments"
}
```

### Update Referral

**Endpoint:** `PUT /referrals/:id`

**Body:** Same as create (all fields optional)

### Update Referral Status

**Endpoint:** `PATCH /referrals/:id/status`

**Body:**
```json
{
  "status": "SENT"
}
```

### Delete Referral

**Endpoint:** `DELETE /referrals/:id`

## Dashboard

### Get Dashboard Stats

**Endpoint:** `GET /dashboard/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReferrals": 124,
    "pendingReferrals": 15,
    "completedThisMonth": 23,
    "referralsBySpecialty": [
      {
        "specialty": "Orthodontics",
        "count": 45,
        "percentage": 36
      }
    ],
    "referralTrends": [
      {
        "month": "Jan",
        "count": 12
      }
    ]
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "fieldName": ["Validation error message"]
  }
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

