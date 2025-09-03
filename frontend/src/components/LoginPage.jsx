import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginSuccess } from "../store/slices/userSlice";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // try to extract message
        let msg;
        try {
          const data = await res.json();
          msg = data?.message || data?.error;
        } catch {
          msg = await res.text();
        }
        throw new Error("Login failed");
      }

      const data = await res.json();
      // backend fields: token, userName, email, address, PhoneNumber, role
      const payload = {
        token: data.token ?? null,
        name: data.userName ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        phoneNumber: data.phoneNumber ?? data.PhoneNumber ?? "", // handle both
        role: (data.role ?? "").toString(), // keep original
      };

      // persist to Redux + localStorage in one action
      dispatch(loginSuccess(payload));

      // optional: quick toast/alert
      // alert("Login successful!");

      navigate("/home");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header text-center">
              <h3>Login</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="alert alert-danger py-2" role="alert">
                    {error}
                  </div>
                )}

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Logging in..." : "Login"}
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center">
              <small>
                Don’t have an account?
                <Link to="/signup"> Register</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
