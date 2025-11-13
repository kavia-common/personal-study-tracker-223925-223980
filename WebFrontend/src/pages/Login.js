import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, ApiError } from "../api/client";

/**
 * Login screen to obtain JWT from backend.
 */
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email || !password) return "Email and password are required";
    if (!/.+@.+\..+/.test(email)) return "Enter a valid email address";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.login({ email, password });
      navigate("/study");
    } catch (ex) {
      const message = ex instanceof ApiError ? ex.message : "Login failed";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={onSubmit} style={styles.form} noValidate>
        {error && <div role="alert" style={styles.error}>{error}</div>}
        <label style={styles.label}>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={styles.input}
          />
        </label>
        <button className="btn" disabled={busy} style={styles.button}>
          {busy ? "Signing in..." : "Login"}
        </button>
      </form>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

const styles = {
  form: { display: "grid", gap: 12, maxWidth: 420 },
  label: { display: "grid", gap: 6, textAlign: "left" },
  input: { padding: 10, fontSize: 16 },
  button: { padding: "10px 14px", cursor: "pointer" },
  error: { color: "#b00020", background: "#fdecea", padding: 10, borderRadius: 6 },
};
