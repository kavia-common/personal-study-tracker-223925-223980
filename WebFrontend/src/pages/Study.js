import React, { useState } from "react";
import { api, ApiError } from "../api/client";

/**
 * Study page - create a new study session.
 */
export default function Study() {
  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!topic) return "Topic is required";
    const m = Number(minutes);
    if (!Number.isInteger(m) || m <= 0) return "Minutes must be a positive integer";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Date must be in YYYY-MM-DD format";
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
    setMsg("");
    try {
      await api.createSession({ topic, minutes: Number(minutes), session_date: date });
      setMsg("Session recorded!");
      setTopic("");
      setMinutes("");
      setDate(new Date().toISOString().slice(0, 10));
    } catch (ex) {
      const message = ex instanceof ApiError ? ex.message : "Failed to create session";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Log Study Session</h1>
      <form onSubmit={onSubmit} style={styles.form} noValidate>
        {error && <div role="alert" style={styles.error}>{error}</div>}
        {msg && <div role="status" style={styles.success}>{msg}</div>}
        <label style={styles.label}>
          Topic
          <input value={topic} onChange={(e) => setTopic(e.target.value)} required style={styles.input} />
        </label>
        <label style={styles.label}>
          Minutes
          <input
            type="number"
            min={1}
            step={1}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            required
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={styles.input} />
        </label>
        <button className="btn" disabled={busy} style={styles.button}>
          {busy ? "Saving..." : "Save Session"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  form: { display: "grid", gap: 12, maxWidth: 520 },
  label: { display: "grid", gap: 6, textAlign: "left" },
  input: { padding: 10, fontSize: 16 },
  button: { padding: "10px 14px", cursor: "pointer" },
  error: { color: "#b00020", background: "#fdecea", padding: 10, borderRadius: 6 },
  success: { color: "#0f5132", background: "#d1e7dd", padding: 10, borderRadius: 6 },
};
