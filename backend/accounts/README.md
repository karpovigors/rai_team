# Accounts App

This Django app provides JWT-based authentication for the RAI platform.

## Features

- User registration
- User login with JWT tokens
- Custom user model with username as the primary identifier
- Profile management (username, email, password)
- Avatar upload and management
- Moderator role management

## API Endpoints

### Register
- **URL**: `/api/auth/register/`
- **Method**: `POST`
- **Data**:
  ```json
  {
    "username": "testuser",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "refresh": "refresh_token",
    "access": "access_token",
    "user": {
      "id": 1,
      "username": "testuser"
    }
  }
  ```

### Login
- **URL**: `/api/auth/login/`
- **Method**: `POST`
- **Data**:
  ```json
  {
    "username": "testuser",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "refresh": "refresh_token",
    "access": "access_token",
    "user": {
      "id": 1,
      "username": "testuser"
    }
  }
  ```

## Documentation

This module includes Doxygen-style documentation for all public classes, methods, and functions. To generate the documentation, run:

```bash
cd backend
doxygen Doxyfile
```

Documentation will be generated in the `docs/html` directory.

## Testing

To test the authentication flow:

1. Start the Django server:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. Start the React frontend:
   ```bash
   cd client
   npm run dev
   ```

3. Navigate to the auth page in the browser and try registering/logging in.
