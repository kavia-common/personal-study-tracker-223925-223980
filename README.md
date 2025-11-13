# personal-study-tracker-223925-223980

This repository contains the Web Frontend for the Personal Study Tracker.

Quick start:
- Copy `WebFrontend/.env.example` to `WebFrontend/.env` and set:
  - `REACT_APP_API_BASE` to your Backend API base URL (e.g., http://localhost:3001).
  - Optional (required for Scores page):
    - `REACT_APP_SUPABASE_URL` to your Supabase project URL.
    - `REACT_APP_SUPABASE_KEY` to your Supabase anon public key.
- From `WebFrontend/`, run `npm install` and `npm start`.

Implemented pages:
- /login, /register, /study, /sessions, /leaderboard

Auth:
- JWT-based, token is stored in-memory with localStorage persistence.