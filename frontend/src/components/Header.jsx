import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const token = localStorage.getItem("jwt");

    fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Logout failed");
        return res.text();
      })
      .then(() => {
        localStorage.removeItem("jwt");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
      })
      .catch((err) => {
        console.error("Logout error:", err);
        alert("Logout failed");
      });
  };

  const navLinkClass = ({ isActive }) =>
    "nav-link" + (isActive ? " active" : "");

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <NavLink className="navbar-brand" to="/classes">
        LearnSpace
      </NavLink>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <NavLink to="/classes" className={navLinkClass}>
              Classes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/submissions" className={navLinkClass}>
              Submissions
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/alerts" className={navLinkClass}>
              Alerts
            </NavLink>
          </li>
        </ul>

        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
          </li>
          <li className="nav-item">
            <button
              onClick={handleLogout}
              className="btn btn-link nav-link text-danger"
              style={{ cursor: "pointer" }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;

