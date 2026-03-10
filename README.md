# Findem Backend API

A comprehensive user authentication and management system built with Node.js, Express, TypeScript, and Firebase.

## Features

- ✅ User Registration (Email/Password & Google OAuth)
- ✅ User Login (Email/Password & Google OAuth)
- ✅ JWT Authentication
- ✅ User Verification
- ✅ Profile Updates
- ✅ Password Changes
- ✅ User Blocking/Unblocking (Admin)
- ✅ Soft & Hard Delete Users
- ✅ Input Validation
- ✅ Role-based Access Control

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth + JWT
- **Validation**: Express Validator
- **Password Hashing**: bcryptjs

## API Endpoints

### Public Routes

#### Register User
```
POST /api/user/register/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe",
  "identityNumber": "1234567890123"
}
```

#### Register with Google
```
POST /api/user/register/google
Content-Type: application/json

{
  "idToken": "google_id_token_here"
}
```

#### Login User
```
POST /api/user/login/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login with Google
```
POST /api/user/login/google
Content-Type: application/json

{
  "idToken": "google_id_token_here"
}
```

### Protected Routes (Require JWT Token)

#### Verify User Email
```
POST /api/user/verify
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "uid": "firebase_user_uid"
}
```

#### Update Profile
```
PUT /api/user/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "displayName": "Updated Name",
  "phoneNumber": "+1234567890",
  "province": "Province",
  "city": "City",
  "identityNumber": "1234567890123"
}
```

#### Change Password
```
PUT /api/user/password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Delete User (Soft Delete)
```
DELETE /api/user/delete
Authorization: Bearer <jwt_token>
```

### Admin Routes (Require Admin Role)

#### Block User
```
POST /api/user/block
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "uid": "user_uid_to_block"
}
```

#### Unblock User
```
POST /api/user/unblock
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "uid": "user_uid_to_unblock"
}
```

#### Hard Delete User
```
DELETE /api/user/hard-delete
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "uid": "user_uid_to_delete"
}
```

## User Model

```typescript
interface User {
  id?: number;
  email: string;
  password?: string; // Not stored for Google users
  displayName?: string;
  identityNumber: string;
  phoneNumber: string;
  province: string;
  city: string;
  role?: "user" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
  DTO: {
    isVerfied: boolean;
    isBlocked: boolean;
    isActive: boolean;
    isDeleted: boolean;
  };
  hoursActive?: number;
}
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env` and configure your Firebase credentials
   - Set a secure JWT secret

3. **Build & Run**
   ```bash
   npm run build
   npm start
   ```

4. **Development**
   ```bash
   npm run dev
   ```

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Input validation and sanitization
- ✅ Role-based access control
- ✅ User blocking/unblocking
- ✅ Soft delete functionality
- ✅ Firebase Auth integration

## Error Handling

The API returns standardized error responses:

```json
{
  "message": "Error description",
  "errors": ["Validation errors"] // For validation failures
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Notes

- All user operations include proper validation
- Google OAuth users are auto-verified
- Blocked users cannot login
- Deleted users (soft delete) cannot access protected routes
- Admin role required for user management operations
- JWT tokens expire in 7 days

## TODO

- [ ] Email verification system
- [ ] Password reset functionality
- [ ] User profile pictures
- [ ] Two-factor authentication
- [ ] Rate limiting
- [ ] Audit logs