// src/components/Header.jsx
// Premium Bootstrap-only navbar with gradient glass look, active states, and Home link
// Optional: Bootstrap Icons in index.html
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function Header() {
  const navigate = useNavigate();

  const token = (() => {
    // Backward-compat for both legacy 'jwt' and a possible serialized user
    const legacy = localStorage.getItem("jwt");
    if (legacy) return legacy;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.token || null;
    } catch {
      return null;
    }
  })();

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");
    } catch (err) {
      console.error("Logout error:", err);
      // still proceed to clear client state
    } finally {
      localStorage.removeItem("jwt");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const navLinkClass = ({ isActive }) =>
    [
      "nav-link px-3 rounded-3",
      isActive ? "active fw-semibold bg-white bg-opacity-10" : "opacity-85",
    ].join(" ");

  return (
    <>
      <style>{`
        .navbar-gradient {
          background:
            linear-gradient(135deg, rgba(13,110,253,0.95) 0%, rgba(111,66,193,0.95) 60%, rgba(214,51,132,0.95) 100%);
        }
        .navbar-glass { backdrop-filter: saturate(140%) blur(8px); -webkit-backdrop-filter: saturate(140%) blur(8px); }
        .brand-mark { width: 34px; height: 34px; display:grid; place-items:center; }
        .navbar .nav-link:hover { background: rgba(255,255,255,0.12); }
      `}</style>

      <nav className="navbar navbar-expand-lg navbar-dark navbar-gradient navbar-glass shadow-sm">
        <div className="container-fluid px-3 px-md-4">
          <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/home">
            <span className="brand-mark rounded-3 bg-white bg-opacity-15 text-white">
              <i className="bi bi-stars" />
            </span>
            <span className="fw-semibold">LearnSpace</span>
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMain"
            aria-controls="navbarMain"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarMain">
            <ul className="navbar-nav me-auto mt-2 mt-lg-0">
              <li className="nav-item">
                <NavLink to="/home" className={navLinkClass} end>
                  <i className="bi bi-house-door me-1" /> Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/classes" className={navLinkClass}>
                  <i className="bi bi-collection me-1" /> Classes
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/submissions" className={navLinkClass}>
                  <i className="bi bi-inbox me-1" /> Submissions
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/alerts" className={navLinkClass}>
                  <i className="bi bi-megaphone me-1" /> Alerts
                </NavLink>
              </li>
            </ul>

            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <NavLink to="/profile" className={navLinkClass}>
                  <i className="bi bi-person-circle me-1" /> Profile
                </NavLink>
              </li>
              <li className="nav-item d-flex align-items-center ms-lg-2">
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm px-3 rounded-3 border-0 bg-white bg-opacity-10">
                  <i className="bi bi-box-arrow-right me-1" /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
