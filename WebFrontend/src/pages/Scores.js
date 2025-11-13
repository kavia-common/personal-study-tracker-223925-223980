import React, { useEffect, useMemo, useState } from "react";
import { getSupabase } from "../api/supabase";

/**
 * Scores page (Supabase only)
 *
 * Features:
 * - Display latest 20 scores from 'scores' table (order by created_at desc)
 * - Add a new score via a simple form (username, score, level)
 * - Handle loading and error states
 * - Uses optional anonymous sign-in (no auth) relying on permissive test policies
 *
 * This page is standalone and does not reuse the FastAPI JWT auth flows.
 */
export default function Scores() {
  const supabase = useMemo(() => getSupabase(), []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Form fields
  const [username, setUsername] = useState("");
  const [score, setScore] = useState("");
  const [level, setLevel] = useState("");

  async function ensureAnonymousSession() {
    // For permissive RLS scenarios, we can sign in anonymously if policies expect an auth context.
    try {
      if (supabase?.auth?.signInAnonymously) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          // Non-fatal if policies allow anon without auth; just warn.
          // eslint-disable-next-line no-console
          console.warn("[Supabase] Anonymous sign-in failed:", error.message);
        } else if (data?.user) {
          // eslint-disable-next-line no-console
          console.log("[Supabase] Anonymous session established");
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[Supabase] Anonymous sign-in exception:", e?.message || e);
    }
  }

  const fetchScores = async () => {
    setLoading(true);
    setErr("");
    try {
      // Query latest 20 scores by created_at desc
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setItems(data || []);
    } catch (ex) {
      setErr(ex?.message || "Failed to load scores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize session (optional) and load data
    (async () => {
      await ensureAnonymousSession();
      await fetchScores();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    if (!username.trim()) return "Username is required";
    const s = Number(score);
    if (!Number.isFinite(s)) return "Score must be a number";
    if (!level.trim()) return "Level is required";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setBusy(true);
    try {
      const payload = {
        username: username.trim(),
        score: Number(score),
        level: level.trim(),
      };
      const { error } = await supabase.from("scores").insert(payload);
      if (error) throw error;
      setUsername("");
      setScore("");
      setLevel("");
      await fetchScores();
    } catch (ex) {
      setErr(ex?.message || "Failed to add score");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Scores</h1>

      <section style={{ marginBottom: 16 }}>
        <h2>Add a Score</h2>
        <form onSubmit={onSubmit} style={styles.form} noValidate>
          {err && <div role="alert" style={styles.error}>{err}</div>}
          <label style={styles.label}>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </label>
          <label style={styles.label}>
            Score
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              style={styles.input}
              required
            />
          </label>
          <label style={styles.label}>
            Level
            <input
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={styles.input}
              required
            />
          </label>
          <button className="btn" disabled={busy} style={styles.button}>
            {busy ? "Saving..." : "Add Score"}
          </button>
        </form>
      </section>

      <section>
        <h2>Latest 20</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {items.length === 0 ? (
              <p>No scores yet.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Score</th>
                    <th style={styles.th}>Level</th>
                    <th style={styles.th}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={`${row.id || row.created_at}-${row.username}-${row.score}`}>
                      <td style={styles.td}>{row.username}</td>
                      <td style={styles.td}>{row.score}</td>
                      <td style={styles.td}>{row.level}</td>
                      <td style={styles.td}>
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </section>
    </div>
  );
}

const styles = {
  form: { display: "grid", gap: 10, maxWidth: 420 },
  label: { display: "grid", gap: 6, textAlign: "left" },
  input: { padding: 10, fontSize: 16 },
  button: { padding: "10px 14px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 8 },
  th: { borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 },
  td: { borderBottom: "1px solid #eee", padding: 8 },
  error: {
    color: "#b00020",
    background: "#fdecea",
    padding: 10,
    borderRadius: 6,
  },
};
