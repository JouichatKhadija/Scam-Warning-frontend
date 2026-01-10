# API Setup Guide

## Prerequisites
- Node.js 18+ 
- npm or yarn

## Backend API Configuration

The frontend connects to a .NET backend API. Update the base URL in `src/config.js`:

```javascript
export const API_BASE_URL = 'http://YOUR_BACKEND_IP:5000/api';
```

## Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure API URL in `src/config.js`
4. Run the app: `npx expo start`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login |
| `/auth/register` | POST | User registration |
| `/warnings` | GET | Get all warnings |
| `/warnings` | POST | Create new warning |
| `/warnings/{id}` | GET | Get warning details |
| `/admin/pending` | GET | Get pending warnings (admin) |
| `/admin/approve/{id}` | POST | Approve warning (admin) |

## Running with Backend

1. Start the backend server first
2. Update `API_BASE_URL` with your backend IP
3. Start the Expo app
4. Scan QR code with Expo Go app
