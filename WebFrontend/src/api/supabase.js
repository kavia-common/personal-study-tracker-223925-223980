/**
 * Supabase client initialization for the Web Frontend.
 *
 * Reads configuration from environment variables:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY (anon public key)
 *
 * This module is self-contained and does not interfere with existing FastAPI auth flows.
 * It is intended for lightweight features like the Scores page.
 *
 * PUBLIC_INTERFACE
 * getSupabase() returns a memoized/singleton supabase-js client or a safe stub
 * when configuration is missing. Never hardcode configuration; provide via .env.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

// Warn during startup when env vars are missing to aid debugging (no secrets logged)
if (!SUPABASE_URL || !SUPABASE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY. " +
      "Scores page will not function until these are set in WebFrontend/.env"
  );
}

let cachedClient = null;

// PUBLIC_INTERFACE
export function getSupabase() {
  /** Returns a singleton Supabase client instance configured from environment. */
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Safe stub: throws on data calls but avoids crashing importers
    return {
      from() {
        throw new Error(
          "Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in WebFrontend/.env and restart."
        );
      },
      auth: {
        signInAnonymously: async () => ({
          data: null,
          error: new Error(
            "Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in WebFrontend/.env and restart."
          ),
        }),
      },
    };
  }

  if (cachedClient) return cachedClient;

  cachedClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false, // keep this self-contained and ephemeral
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      // Optional: identify app for troubleshooting; no PII
      headers: { "X-Client-Info": "pst-web-frontend" },
    },
  });

  return cachedClient;
}
