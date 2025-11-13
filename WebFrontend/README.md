# Personal Study Tracker - Web Frontend

React SPA that connects to the Backend API to support:
- Register and Login (JWT-based)
- Create and manage study sessions
- View leaderboard (all-time and last 30 days)
- Scores page backed by Supabase (optional)

## Routes
- /login
- /register
- /study (protected)
- /sessions (protected)
- /leaderboard
- /scores (optional, requires Supabase env vars)

## Environment
Create a `.env` file from `.env.example` and set at minimum:

```
REACT_APP_API_BASE=http://localhost:3001
# Scores page (Supabase)
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
```

Notes:
- For Create React App (react-scripts), only variables prefixed with `REACT_APP_` are exposed to the browser build.
- After changing `.env`, you must restart `npm start` to propagate changes.
- Do not hardcode configuration in code. Values are read at runtime via `process.env.REACT_APP_*`.

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
  - Optionally allow anonymous sign-in (the page attempts `auth.signInAnonymously()`); otherwise, allow anon without auth.
  Note: For production, restrict policies appropriately to your needs.

### Troubleshooting the Scores page
- Missing env: A yellow banner appears if `REACT_APP_SUPABASE_URL` or `REACT_APP_SUPABASE_KEY` are not set. Create `WebFrontend/.env`, set both vars, and restart the dev server.
- 401/403 errors or “permission denied”: RLS likely blocks access. Add permissive `select`/`insert` policies for the `anon` role for testing, or implement authenticated policies.
- Network/CORS errors: Verify your Supabase Project URL is correct and accessible from the browser. Open the browser devtools Network tab to inspect failed requests.
- Insert fails but read works: Check that `insert` RLS policy exists for the `scores` table for `anon` or configured auth role.
- Still not working? Check console logs for the [Supabase] messages emitted by the app for hints.

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
- Errors from backend and Supabase are surfaced as user-friendly messages on the pages.

## Security Notes
- No secrets are hardcoded.
- Only JWT is stored (localStorage fallback). Consider rotating/short-lived tokens and refresh tokens in production environments.
- Only the Supabase anon public key is used on the frontend.
