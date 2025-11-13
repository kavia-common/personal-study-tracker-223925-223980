//
// Supabase client initialization for the Web Frontend.
// Reads configuration from environment variables:
// - REACT_APP_SUPABASE_URL
// - REACT_APP_SUPABASE_KEY
//
// This module is self-contained and does not interfere with existing FastAPI auth flows.
// It is intended for lightweight features like the Scores page.
//

import { createClient } from "@supabase/supabase-js";

/**
 * Validate and read environment variables safely at runtime.
 * Notes:
 * - Do not hardcode secrets.
 * - These values must be provided via WebFrontend/.env
 */
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

// Guard: Provide a minimal fallback behavior with helpful console warnings.
if (!SUPABASE_URL || !SUPABASE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY. " +
      "Scores page will not function until these are set in .env."
  );
}

// PUBLIC_INTERFACE
export function getSupabase() {
  /** Returns a singleton Supabase client instance configured from environment. */
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Create a dummy client-like object to fail fast on calls when config is missing.
    return {
      from() {
        throw new Error(
          "Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY."
        );
      },
      auth: {
        signInAnonymously: async () => ({
          data: null,
          error: new Error(
            "Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY."
          ),
        }),
      },
    };
  }
  // Create and return a supabase-js client
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false, // keep this self-contained and ephemeral
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
