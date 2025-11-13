import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, ApiError } from "../api/client";

/**
 * Registration screen to create a new user.
 */
export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");
    try {
      await api.register({ email, password });
      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (ex) {
      const message = ex instanceof ApiError ? ex.message : "Registration failed";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={onSubmit} style={styles.form} noValidate>
        {error && <div role="alert" style={styles.error}>{error}</div>}
        {success && <div role="status" style={styles.success}>{success}</div>}
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={styles.input}
          />
        </label>
        <button className="btn" disabled={busy} style={styles.button}>
          {busy ? "Registering..." : "Create account"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
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
  success: { color: "#0f5132", background: "#d1e7dd", padding: 10, borderRadius: 6 },
};
