import React, { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";

/**
 * Leaderboard page - shows all-time and last 30 days standings.
 */
export default function Leaderboard() {
  const [top, setTop] = useState(10);
  const [data, setData] = useState({ all_time: [], last_30_days: [] });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.getLeaderboard({ top });
      setData(res || { all_time: [], last_30_days: [] });
    } catch (ex) {
      const message = ex instanceof ApiError ? ex.message : "Failed to load leaderboard";
      setErr(message);
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
              {data.all_time.map((x) => (
                <li key={`${x.user_id}-all`}>
                  {x.email} — {x.total_minutes} min
                </li>
              ))}
              {(!data.all_time || data.all_time.length === 0) && <p>No data.</p>}
            </ol>
          </section>
          <section>
            <h2>Last 30 days</h2>
            <ol>
              {data.last_30_days.map((x) => (
                <li key={`${x.user_id}-30`}>
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
