import React from "react";
import { Link, NavLink } from "react-router-dom";
import { authStore } from "../api/client";

/**
 * Simple app layout with top navigation.
 * Shows different actions based on authentication state.
 */
export default function Layout({ children }) {
  const authed = authStore.isAuthenticated();

  const handleLogout = () => {
    authStore.setToken(null);
    // hard redirect to login to reset state
    window.location.href = "/login";
  };

  return (
    <div className="App">
      <nav className="navbar" style={styles.nav}>
        <Link to="/" style={styles.brand}>Personal Study Tracker</Link>
        <div style={styles.links}>
          <NavLink to="/study" style={styles.link}>Study</NavLink>
          <NavLink to="/sessions" style={styles.link}>My Sessions</NavLink>
          <NavLink to="/leaderboard" style={styles.link}>Leaderboard</NavLink>
        </div>
        <div>
          {authed ? (
            <button onClick={handleLogout} className="btn" style={styles.btn}>Logout</button>
          ) : (
            <>
              <NavLink to="/login" style={styles.link}>Login</NavLink>
              <NavLink to="/register" style={styles.link}>Register</NavLink>
            </>
          )}
        </div>
      </nav>
      <main className="container" style={styles.container}>{children}</main>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    borderBottom: "1px solid var(--border-color, #e9ecef)",
    background: "var(--bg-secondary, #f8f9fa)",
  },
  brand: { textDecoration: "none", fontWeight: 700, color: "var(--text-primary, #282c34)" },
  links: { display: "inline-flex", gap: 12, marginRight: 12 },
  link: { textDecoration: "none", color: "var(--text-primary, #282c34)" },
  btn: { padding: "8px 12px", cursor: "pointer" },
  container: { padding: 20, maxWidth: 900, margin: "0 auto" },
};
