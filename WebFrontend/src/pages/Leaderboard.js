import React, { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";

/**
 * Leaderboard page - shows all-time and last 30 days standings.
 *
 * Defensive behavior:
 * - Normalizes backend payload to avoid crashes on missing keys or wrong types.
 * - Shows empty state with zero values where applicable.
 * - Provides clearer error messages for common network/CORS/base-URL issues.
 */
export default function Leaderboard() {
  const [top, setTop] = useState(10);
  const [data, setData] = useState({ all_time: [], last_30_days: [] });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Normalize any backend response into the expected shape.
  function normalizeLeaderboard(res) {
    const safeArray = (v) => (Array.isArray(v) ? v : []);
    const coerceEntry = (x, idx, suffix) => {
      // Ensure the fields exist to avoid rendering issues.
      const user_id = Number.isFinite(Number(x?.user_id)) ? Number(x.user_id) : idx + 1;
      const email = typeof x?.email === "string" && x.email ? x.email : "Unknown";
      const total_minutes = Number.isFinite(Number(x?.total_minutes)) ? Number(x.total_minutes) : 0;
      return {
        user_id: `${user_id}-${suffix}`, // keep keys unique per list if ids missing
        email,
        total_minutes,
      };
    };

    const allTime = safeArray(res?.all_time).map((x, i) => coerceEntry(x, i, "all"));
    const last30 = safeArray(res?.last_30_days).map((x, i) => coerceEntry(x, i, "30"));

    return {
      all_time: allTime,
      last_30_days: last30,
    };
  }

  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.getLeaderboard({ top });
      setData(normalizeLeaderboard(res));
    } catch (ex) {
      // Provide a more helpful message if it's a network/CORS/base url error.
      const rawMsg = ex instanceof ApiError ? ex.message : (ex?.message || String(ex));
      const friendly =
        /Failed to fetch|NetworkError|CORS|TypeError/i.test(rawMsg)
          ? "Failed to load leaderboard (network/CORS). Verify Backend API is running at REACT_APP_API_BASE and allows the frontend origin."
          : rawMsg || "Failed to load leaderboard";
      setErr(friendly);
      setData({ all_time: [], last_30_days: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1>Leaderboard</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchData();
        }}
        style={{ display: "inline-flex", gap: 8, marginBottom: 12 }}
      >
        <label>
          Top N:&nbsp;
          <input
            type="number"
            min={1}
            max={100}
            value={top}
            onChange={(e) => setTop(Number(e.target.value))}
            style={{ width: 80, padding: 6 }}
            aria-label="Top N"
          />
        </label>
        <button className="btn" type="submit">Refresh</button>
      </form>

      {err && <div role="alert" style={styles.error}>{err}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={styles.grid}>
          <section>
            <h2>All-time</h2>
            <ol>
              {data.all_time.map((x, idx) => (
                <li key={`${x.user_id}-all-${idx}`}>
                  {x.email} — {x.total_minutes} min
                </li>
              ))}
              {(!data.all_time || data.all_time.length === 0) && <p>No data.</p>}
            </ol>
          </section>
          <section>
            <h2>Last 30 days</h2>
            <ol>
              {data.last_30_days.map((x, idx) => (
                <li key={`${x.user_id}-30-${idx}`}>
                  {x.email} — {x.total_minutes} min
                </li>
              ))}
              {(!data.last_30_days || data.last_30_days.length === 0) && <p>No data.</p>}
            </ol>
          </section>
        </div>
      )}
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  error: { color: "#b00020", background: "#fdecea", padding: 10, borderRadius: 6, marginBottom: 12 },
};
