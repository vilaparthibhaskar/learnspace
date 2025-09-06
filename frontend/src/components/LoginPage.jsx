// src/pages/auth/LoginPage.jsx
// Bootstrap-only, stylish login with gradient hero, glass card, icons, and subtle animations
// No extra libraries required (optional: Bootstrap Icons link below)
//   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginSuccess } from "../store/slices/userSlice"; // adjust path if needed

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errorTick, setErrorTick] = useState(0); // to replay shake animation
  const [showPassword, setShowPassword] = useState(false);
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
        credentials: "include",
      });

      if (!res.ok) {
        let msg = "Login failed";
        try {
          const data = await res.json();
          msg = data?.message || data?.error || msg;
        } catch {
          try { msg = (await res.text()) || msg; } catch {}
        }
        throw new Error(msg);
      }

      const data = await res.json();
      const payload = {
        token: data.token ?? null,
        name: data.userName ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        phoneNumber: data.phoneNumber ?? data.PhoneNumber ?? "",
        role: (data.role ?? "").toString(),
      };
      dispatch(loginSuccess(payload));
      navigate("/home");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
      setErrorTick((t) => t + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Inline component-scoped styles */}
      <style>{`
        .hero-bg { 
          position: fixed; inset: 0; z-index: -1;
          background:
            radial-gradient(1200px 600px at 0% 0%, rgba(13,110,253,.12), transparent 60%),
            radial-gradient(1000px 500px at 100% 0%, rgba(214,51,132,.12), transparent 60%),
            linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
        }
        .glass-card { 
          background: rgba(255,255,255,0.75);
          backdrop-filter: saturate(140%) blur(10px);
          -webkit-backdrop-filter: saturate(140%) blur(10px);
          border: 1px solid rgba(0,0,0,0.06);
        }
        .btn-gradient { 
          background-image: linear-gradient(135deg, #0d6efd 0%, #6f42c1 60%, #d63384 100%);
          color: #fff; border: 0;
        }
        .btn-gradient:hover { filter: brightness(1.05); }
        .icon-circle { width: 48px; height: 48px; display: grid; place-items: center; }
        @keyframes floaty { 0%{transform:translateY(0)} 50%{transform:translateY(-4px)} 100%{transform:translateY(0)} }
        .floaty { animation: floaty 6s ease-in-out infinite; }
        @keyframes shake { 0%{transform:translateX(0)} 20%{transform:translateX(-3px)} 40%{transform:translateX(3px)} 60%{transform:translateX(-2px)} 80%{transform:translateX(2px)} 100%{transform:translateX(0)} }
        .shake { animation: shake .35s ease-in-out 1; }
      `}</style>

      <div className="hero-bg" />

      <div className="container py-5 py-md-6 d-flex align-items-center" style={{ minHeight: "100vh" }}>
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div key={errorTick} className={`card shadow-lg rounded-4 glass-card ${error ? "shake" : ""}`}>
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="icon-circle rounded-3 bg-primary bg-opacity-10 text-primary floaty">
                    <i className="bi bi-shield-lock fs-4" />
                  </div>
                  <div>
                    <h3 className="mb-0 fw-semibold">Welcome back</h3>
                    <div className="text-secondary small">Sign in to continue</div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium">Email address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-envelope" /></span>
                      <input
                        type="email"
                        className="form-control border-start-0"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="username"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label htmlFor="password" className="form-label fw-medium">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-key" /></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control border-start-0"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword((s) => !s)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="" id="rememberMe" />
                      <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                    </div>
                    <Link className="small" to="/forgot-password">Forgot password?</Link>
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2 mb-3" role="alert">
                      <i className="bi bi-exclamation-triangle me-2" />{error}
                    </div>
                  )}

                  <div className="d-grid">
                    <button type="submit" className="btn btn-gradient btn-lg d-inline-flex align-items-center justify-content-center gap-2" disabled={submitting}>
                      {submitting && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                      {submitting ? "Logging in…" : "Sign in"}
                    </button>
                  </div>
                </form>

                {/* Footer */}
                <div className="text-center mt-4">
                  <small className="text-secondary">Don’t have an account?
                    <Link to="/signup" className="ms-1">Create one</Link>
                  </small>
                </div>
              </div>
            </div>

            {/* Tiny legal / footer brand line */}
            <div className="text-center text-secondary small mt-3">
              <i className="bi bi-shield-check me-1" /> Your credentials are transmitted securely.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
