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
Create a `.env` file from `.env.example` and set at minimum:

```
REACT_APP_API_BASE=http://localhost:3001
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
```

Do not hardcode configuration in code. These values are read at runtime via `process.env.REACT_APP_*`.

### Supabase Setup (for Scores page)
- Create a Supabase project at supabase.com and obtain:
  - Project URL and anon public key (use anon key only on the frontend).
- Create a table named `scores` with columns:
  - id: bigint (PK) or uuid (default), primary key
  - username: text
  - score: integer
  - level: text
  - created_at: timestamp with timezone (default now())
- Row Level Security (RLS) policies for testing:
  - Enable RLS on `scores`.
  - Add permissive policies allowing:
    - select: true (or for anon role) to read latest scores
    - insert: true (or for anon role) to submit scores
  Note: For production, restrict policies appropriately to your needs.
- This page uses optional anonymous sign-in via supabase-js; ensure policies support your chosen approach.

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
