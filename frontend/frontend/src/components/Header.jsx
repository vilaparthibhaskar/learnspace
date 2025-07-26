import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


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
        navigate("/login");
      })
      .catch((err) => {
        console.error("Logout error:", err);
        alert("Logout failed");
      });
  };


  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/home">LearnSpace</Link>
      
      <div className="collapse navbar-collapse justify-content-end">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/home">Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/profile">Profile</Link>
          </li>
          <li className="nav-item">
            <button onClick={handleLogout} className="btn btn-danger mt-3">
                Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
