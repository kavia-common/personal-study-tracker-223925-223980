//
// Simple API client wrapper that reads base URL from REACT_APP_API_BASE and
// attaches Authorization header when a JWT is available.
//
/* eslint-disable no-console */

// PUBLIC_INTERFACE
export class ApiError extends Error {
  /** Error type used for API failures */
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// In-memory token store with localStorage fallback.
// PUBLIC_INTERFACE
export const authStore = (() => {
  /** In-memory token cache to avoid repeated localStorage access */
  let token = null;

  const STORAGE_KEY = "pst_jwt";

  /** Load initial token from localStorage if present (non-blocking on import) */
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) token = saved;
  } catch (_) {
    // Ignore storage errors (private mode, etc.)
  }

  // PUBLIC_INTERFACE
  function getToken() {
    /** Return current JWT token if present */
    return token;
  }

  // PUBLIC_INTERFACE
  function setToken(newToken) {
    /** Set JWT token and persist to localStorage when available */
    token = newToken || null;
    try {
      if (newToken) {
        window.localStorage.setItem(STORAGE_KEY, newToken);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {
      // ignore storage errors
    }
  }

  // PUBLIC_INTERFACE
  function isAuthenticated() {
    /** Returns true if a token exists */
    return !!token;
  }

  return { getToken, setToken, isAuthenticated };
})();

/**
 * Builds a full URL for the API request.
 * Uses REACT_APP_API_BASE environment variable and ensures there is exactly one slash.
 */
function buildUrl(path) {
  const base = process.env.REACT_APP_API_BASE || "";
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!base) return p; // fallback to relative for dev proxy, if any
  return `${base.replace(/\/+$/, "")}${p}`;
}

/**
 * Perform an HTTP request to the API.
 * - Automatically sets JSON headers
 * - Adds Authorization: Bearer <token> when present
 * - Throws ApiError on non-2xx responses with parsed error when possible
 */
async function request(path, { method = "GET", body, headers = {}, auth = true } = {}) {
  const h = {
    "Content-Type": "application/json",
    ...headers,
  };

  const token = auth ? authStore.getToken() : null;
  if (auth && token) {
    h.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path), {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    // non-JSON
    data = text;
  }

  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, data);
  }
  return data;
}

// PUBLIC_INTERFACE
export const api = {
  /** Auth endpoints */
  async register({ email, password }) {
    if (!email || !password) throw new ApiError("Email and password are required", 400);
    return request("/auth/register", { method: "POST", body: { email, password }, auth: false });
  },
  async login({ email, password }) {
    if (!email || !password) throw new ApiError("Email and password are required", 400);
    const res = await request("/auth/login", { method: "POST", body: { email, password }, auth: false });
    if (res && res.access_token) {
      authStore.setToken(res.access_token);
    }
    return res;
  },
  async me() {
    return request("/me", { method: "GET", auth: true });
  },

  /** Sessions CRUD */
  async createSession({ topic, minutes, session_date }) {
    if (!topic || !minutes || !session_date) throw new ApiError("All fields are required", 400);
    return request("/sessions", { method: "POST", body: { topic, minutes: Number(minutes), session_date } });
  },
  async listSessions({ page = 1, size = 20, topic, start_date, end_date } = {}) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));
    if (topic) params.set("topic", topic);
    if (start_date) params.set("start_date", start_date);
    if (end_date) params.set("end_date", end_date);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request(`/sessions${qs}`, { method: "GET" });
  },
  async updateSession(session_id, { topic, minutes, session_date }) {
    if (!session_id) throw new ApiError("session_id is required", 400);
    return request(`/sessions/${session_id}`, {
      method: "PUT",
      body: { topic, minutes: Number(minutes), session_date },
    });
  },
  async deleteSession(session_id) {
    if (!session_id) throw new ApiError("session_id is required", 400);
    // Backend returns 204 No Content; handle as successful with null body
    try {
      await request(`/sessions/${session_id}`, { method: "DELETE" });
      return { success: true };
    } catch (e) {
      throw e;
    }
  },

  /** Leaderboard */
  async getLeaderboard({ top = 10 } = {}) {
    const qs = top ? `?top=${encodeURIComponent(top)}` : "";
    return request(`/leaderboard${qs}`, { method: "GET", auth: false });
  },
};
