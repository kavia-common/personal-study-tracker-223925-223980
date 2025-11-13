# Personal Study Tracker - Web Frontend

React SPA that connects to the Backend API to support:
- Register and Login (JWT-based)
- Create and manage study sessions
- View leaderboard (all-time and last 30 days)

## Routes
- /login
- /register
- /study (protected)
- /sessions (protected)
- /leaderboard

## Environment
Create a `.env` file from `.env.example` and set:

```
REACT_APP_API_BASE=http://localhost:3001
```

Do not hardcode configuration in code. This value is read at runtime via `process.env.REACT_APP_API_BASE`.

## API Client and Auth
- `src/api/client.js` provides a small wrapper for calling the backend.
- JWT is stored in-memory with a localStorage fallback for persistence.
- Authorization header is added automatically for protected endpoints.

## Getting Started

Install deps and run:

```
npm install
npm start
```

The app will be available at http://localhost:3000. Ensure the Backend API is running and accessible at `REACT_APP_API_BASE`.

## Build and Test

```
npm run build
npm test
```

## Accessibility & Validation
- Basic client-side validation is implemented on forms.
- Errors from backend are surfaced as user-friendly messages.

## Security Notes
- No secrets are hardcoded.
- Only JWT is stored (localStorage fallback). Consider rotating/short-lived tokens and refresh tokens in production environments.
