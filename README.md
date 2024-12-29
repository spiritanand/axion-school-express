# School Management System API

A robust RESTful API service for managing schools, classrooms, and students with role-based access control.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Features

- Role-based access control (RBAC)
- Redis-based data persistence
- JWT authentication
- Input validation using Zod
- Rate limiting
- Comprehensive error handling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Redis server
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
pnpm run dev
```

### Environment Variables

```env
JWT_SECRET=your-jwt-secret
CACHE_PREFIX=your-cache-prefix
CACHE_REDIS=redis://localhost:6379
CORTEX_PREFIX=your-cortex-prefix
CORTEX_REDIS=redis://localhost:6379
CORTEX_TYPE=your-service-type
OYSTER_REDIS=redis://localhost:6379
OYSTER_PREFIX=your-oyster-prefix
```

## Authentication

### JWT-based Authentication Flow

1. **Login Request**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "secure-password"
}
```

2. **Response**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-id",
    "role": "superadmin|school_admin",
    "schoolId": "school-id" // for school admins
  }
}
```

3. **Using the Token**

```http
GET /api/schools
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Roles and Permissions

#### Superadmin

- Full access to all schools
- Can create/modify/delete schools
- Can manage school administrators

#### School Administrator

- Access limited to assigned school
- Can manage classrooms and students
- Can view school information
- Cannot modify school settings

## API Endpoints

### Schools

#### List Schools

```http
GET /api/schools
Authorization: Bearer [token]
```

Response:

```json
{
  "schools": [
    {
      "id": "school-id",
      "name": "School Name",
      "address": "School Address",
      "contactEmail": "contact@school.com",
      "contactPhone": "+1234567890",
      "status": "active",
      "maxClassrooms": 50,
      "maxStudentsPerClassroom": 30,
      "createdAt": 1672531200000,
      "updatedAt": 1672531200000
    }
  ]
}
```

#### Create School

```http
POST /api/schools
Authorization: Bearer [token]
Content-Type: application/json

{
  "name": "New School",
  "address": "123 Education St",
  "contactEmail": "contact@newschool.com",
  "contactPhone": "+1234567890",
  "maxClassrooms": 50,
  "maxStudentsPerClassroom": 30
}
```

### Classrooms

#### List Classrooms

```http
GET /api/schools/:schoolId/classrooms
Authorization: Bearer [token]
```

#### Create Classroom

```http
POST /api/schools/:schoolId/classrooms
Authorization: Bearer [token]
Content-Type: application/json

{
  "name": "Class 1-A",
  "capacity": 30,
  "grade": "1",
  "section": "A"
}
```

### Students

#### List Students

```http
GET /api/schools/:schoolId/classrooms/:classroomId/students
Authorization: Bearer [token]
```

#### Create Student

```http
POST /api/schools/:schoolId/classrooms/:classroomId/students
Authorization: Bearer [token]
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2010-01-01",
  "gender": "male",
  "contactInfo": {
    "parentName": "Jane Doe",
    "email": "parent@example.com",
    "phone": "+1234567890",
    "address": "456 Family St"
  }
}
```

## Database Schema

### School

```typescript
{
  id: string;
  name: string;          // min: 2, max: 100 chars
  address: string;       // min: 5, max: 200 chars
  contactEmail: string;  // valid email
  contactPhone: string;  // regex: /^\+?[\d\s-]{10,}$/
  adminIds: string[];
  status: "active" | "inactive" | "suspended";
  maxClassrooms: number;
  maxStudentsPerClassroom: number;
  createdAt: number;
  updatedAt: number;
}
```

### Classroom

```typescript
{
  id: string;
  schoolId: string;
  name: string;         // min: 1, max: 50 chars
  capacity: number;     // positive
  currentStudentCount: number;
  grade: string;
  section: string;
  teacherId?: string;
  status: "active" | "inactive";
  resources?: string[];
  schedule?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}
```

### Student

```typescript
{
  id: string;
  schoolId: string;
  classroomId: string;
  firstName: string;    // min: 2, max: 50 chars
  lastName: string;     // min: 2, max: 50 chars
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  contactInfo: {
    parentName: string;
    email: string;     // valid email
    phone: string;     // regex: /^\+?[\d\s-]{10,}$/
    address: string;
  };
  enrollmentDate: number;
  status: "active" | "inactive" | "transferred" | "graduated";
  academicRecord?: {
    year: string;
    grade: string;
    performance: Record<string, any>;
  }[];
  createdAt: number;
  updatedAt: number;
}
```

## Error Handling

### HTTP Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

### Error Response Format

```json
{
  "error": "Error message",
  "details": {} // Optional additional information
}
```

### Common Error Scenarios

- Invalid input data (400)
- Missing or invalid token (401)
- Insufficient permissions (403)
- Resource not found (404)
- Rate limit exceeded (429)
- Server errors (500)

## Rate Limiting

The API implements rate limiting per IP address:

- Window: 15 minutes
- Max requests: 100 per window
- Headers included in response:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset

## Security Considerations

- All endpoints require authentication
- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- HTTPS required in production
- Input validation on all endpoints
- Rate limiting to prevent abuse
- Role-based access control
- No sensitive data in URLs
