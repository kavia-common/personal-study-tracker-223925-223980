import React, { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";

/**
 * Sessions page - list and manage user's study sessions.
 */
export default function Sessions() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [topicFilter, setTopicFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.listSessions({ page, size, topic: topicFilter || undefined });
      setItems(res.items || []);
      setTotal(res.total || 0);
      setTotalMinutes(res.total_minutes || 0);
    } catch (ex) {
      const message = ex instanceof ApiError ? ex.message : "Failed to load sessions";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await api.deleteSession(id);
      await fetchData();
    } catch (ex) {
      alert(ex.message || "Delete failed");
    }
  };

  const onInlineUpdate = async (id, prev) => {
    const topic = window.prompt("Topic:", prev.topic);
    if (!topic) return;
    const minutesStr = window.prompt("Minutes:", String(prev.minutes));
    const minutes = Number(minutesStr);
    if (!Number.isInteger(minutes) || minutes <= 0) {
      alert("Minutes must be a positive integer");
      return;
    }
    const date = window.prompt("Date (YYYY-MM-DD):", prev.session_date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      alert("Invalid date format");
      return;
    }
    try {
      await api.updateSession(id, { topic, minutes, session_date: date });
      await fetchData();
    } catch (ex) {
      alert(ex.message || "Update failed");
    }
  };

  return (
    <div>
      <h1>My Sessions</h1>
      <div style={{ marginBottom: 12 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchData();
          }}
          style={{ display: "inline-flex", gap: 8 }}
        >
          <input
            placeholder="Filter by topic"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            style={{ padding: 8 }}
          />
          <button className="btn" type="submit">Filter</button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setTopicFilter("");
              setPage(1);
              fetchData();
            }}
          >
            Clear
          </button>
        </form>
      </div>
      {err && <div role="alert" style={styles.error}>{err}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Total Sessions: {total} • Total Minutes: {totalMinutes}</p>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Topic</th>
                <th style={styles.th}>Minutes</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td style={styles.td}>{s.id}</td>
                  <td style={styles.td}>{s.topic}</td>
                  <td style={styles.td}>{s.minutes}</td>
                  <td style={styles.td}>{s.session_date}</td>
                  <td style={styles.td}>
                    <button className="btn" onClick={() => onInlineUpdate(s.id, s)} style={{ marginRight: 8 }}>
                      Edit
                    </button>
                    <button className="btn" onClick={() => onDelete(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td style={styles.td} colSpan={5}>No sessions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Prev
            </button>
            <span>Page {page}</span>
            <button
              className="btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={items.length < size}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  table: { width: "100%", borderCollapse: "collapse" },
  th: { borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 },
  td: { borderBottom: "1px solid #eee", padding: 8 },
  error: { color: "#b00020", background: "#fdecea", padding: 10, borderRadius: 6, marginBottom: 12 },
};
