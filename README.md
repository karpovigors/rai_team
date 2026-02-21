# rai_team

## Information and Navigation Platform for People with Hearing Impairments

This project is an information and navigation platform designed specifically for people with hearing impairments.

## Authentication System

The platform includes a JWT-based authentication system with the following features:

- User registration with username
- User login with username and password
- Secure token-based authentication

### Backend (Django)

The authentication system is implemented in the `accounts` app. For detailed information about the API endpoints and testing instructions, see [accounts/README.md](rai_project/accounts/README.md).

### Frontend (React)

The frontend includes authentication pages:
- Login page: [AuthPage](client/src/pages/AuthPage/ui/AuthPage.tsx)
- Registration page: [RegisterPage](client/src/pages/AuthPage/ui/RegisterPage.tsx)

## Setup

1. Install backend dependencies:
   ```bash
   cd rai_project
   pip install -r requirements.txt
   ```

2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

3. Run the development servers:
   ```bash
   # Backend
   cd rai_project
   python manage.py runserver
   
   # Frontend
   cd client
   npm run dev
   ```