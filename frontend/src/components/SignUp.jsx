// src/pages/auth/SignupPage.jsx
// Bootstrap-only, luxurious sign-up screen: gradient hero, glass card, icons, validation hints, password toggle & strength bar.
// No new libs needed. (Optional) Add Bootstrap Icons in index.html:
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    role: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [shake, setShake] = useState(0); // replay error animation
  const [showPass, setShowPass] = useState(false);
  const [showCpass, setShowCpass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setError("");
    setOk("");
  };

  // Simple password strength: 0-4
  const passScore = useMemo(() => {
    const p = formData.password || "";
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }, [formData.password]);

  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][passScore] || "";
  const strengthClass = ["bg-danger", "bg-danger", "bg-warning", "bg-info", "bg-success"][passScore] || "bg-secondary";

  const emailsMatch = useMemo(() => /.+@.+\..+/.test(formData.email), [formData.email]);
  const passMatch = useMemo(() => formData.password && formData.password === formData.confirmPassword, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setOk("");

    if (!emailsMatch) {
      setSubmitting(false);
      setError("Please enter a valid email address.");
      setShake((t) => t + 1);
      return;
    }
    if (!passMatch) {
      setSubmitting(false);
      setError("Passwords do not match.");
      setShake((t) => t + 1);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        let msg = await response.text();
        if (!msg) msg = "Signup failed";
        throw new Error(msg);
      }

      const successText = (await response.text()) || "Account created successfully";
      setOk(successText);
      setTimeout(() => navigate("/login"), 650);
    } catch (err) {
      setError(err.message || "Something went wrong during signup.");
      setShake((t) => t + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .hero-bg { position: fixed; inset: 0; z-index: -1; background:
          radial-gradient(1200px 600px at 0% 0%, rgba(13,110,253,.12), transparent 60%),
          radial-gradient(1000px 500px at 100% 0%, rgba(214,51,132,.12), transparent 60%),
          linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%); }
        .glass-card { background: rgba(255,255,255,0.75); backdrop-filter: saturate(140%) blur(10px); -webkit-backdrop-filter: saturate(140%) blur(10px); border: 1px solid rgba(0,0,0,0.06); }
        .btn-gradient { background-image: linear-gradient(135deg,#0d6efd 0%,#6f42c1 60%,#d63384 100%); color:#fff; border:0; }
        .btn-gradient:hover { filter: brightness(1.05); }
        .icon-circle { width:48px; height:48px; display:grid; place-items:center; }
        @keyframes floaty { 0%{transform:translateY(0)} 50%{transform:translateY(-4px)} 100%{transform:translateY(0)} }
        .floaty { animation: floaty 6s ease-in-out infinite; }
        @keyframes shake { 0%{transform:translateX(0)} 20%{transform:translateX(-3px)} 40%{transform:translateX(3px)} 60%{transform:translateX(-2px)} 80%{transform:translateX(2px)} 100%{transform:translateX(0)} }
        .shake { animation: shake .35s ease-in-out 1; }
        .progress-xs { height: .4rem; }
      `}</style>

      <div className="hero-bg" />

      <div className="container py-5 d-flex align-items-center" style={{ minHeight: "100vh" }}>
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-7">
            <div key={shake} className={`card shadow-lg rounded-4 glass-card`}> 
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="icon-circle rounded-3 bg-success bg-opacity-10 text-success floaty">
                    <i className="bi bi-person-plus fs-4" />
                  </div>
                  <div>
                    <h3 className="mb-0 fw-semibold">Create your account</h3>
                    <div className="text-secondary small">Join and start learning in minutes</div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-person" /></span>
                        <input type="text" name="name" className="form-control border-start-0" value={formData.name} onChange={handleChange} required placeholder="Bhaskar Vilaparthi" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-envelope" /></span>
                        <input type="email" name="email" className="form-control border-start-0" value={formData.email} onChange={handleChange} required autoComplete="email" placeholder="you@example.com" />
                      </div>
                      {!emailsMatch && formData.email && <div className="form-text text-danger">Please enter a valid email.</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-key" /></span>
                        <input type={showPass ? "text" : "password"} name="password" className="form-control border-start-0" value={formData.password} onChange={handleChange} required autoComplete="new-password" placeholder="••••••••" />
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPass((s) => !s)} aria-label={showPass ? "Hide password" : "Show password"}>
                          <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                        </button>
                      </div>
                      {formData.password && (
                        <div className="mt-2">
                          <div className="progress progress-xs">
                            <div className={`progress-bar ${strengthClass}`} role="progressbar" style={{ width: `${(passScore/4)*100}%` }} aria-valuenow={(passScore/4)*100} aria-valuemin="0" aria-valuemax="100" />
                          </div>
                          <small className="text-secondary">{strengthLabel}</small>
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">Confirm Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-shield-lock" /></span>
                        <input type={showCpass ? "text" : "password"} name="confirmPassword" className="form-control border-start-0" value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password" placeholder="••••••••" />
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCpass((s) => !s)} aria-label={showCpass ? "Hide password" : "Show password"}>
                          <i className={`bi ${showCpass ? "bi-eye-slash" : "bi-eye"}`} />
                        </button>
                      </div>
                      {formData.confirmPassword && (
                        <div className={`small mt-1 ${passMatch ? "text-success" : "text-danger"}`}>
                          <i className={`bi ${passMatch ? "bi-check-circle" : "bi-x-circle"} me-1`} />
                          {passMatch ? "Passwords match" : "Passwords do not match"}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">Phone</label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-telephone" /></span>
                        <input type="text" name="phone" className="form-control border-start-0" value={formData.phone} onChange={handleChange} required placeholder="(555) 123-4567" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">Role</label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-person-badge" /></span>
                        <select name="role" className="form-select border-start-0" value={formData.role} onChange={handleChange} required>
                          <option value="">Select Role</option>
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium">Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-geo-alt" /></span>
                        <textarea name="address" className="form-control border-start-0" rows={2} value={formData.address} onChange={handleChange} required placeholder="Street, City, State, Zip" />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2 mt-3" role="alert">
                      <i className="bi bi-exclamation-triangle me-1" /> {error}
                    </div>
                  )}
                  {ok && (
                    <div className="alert alert-success py-2 mt-3" role="alert">
                      <i className="bi bi-check-circle me-1" /> {ok}
                    </div>
                  )}

                  <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-gradient btn-lg d-inline-flex align-items-center justify-content-center gap-2" disabled={submitting}>
                      {submitting && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                      {submitting ? "Creating account…" : "Create account"}
                    </button>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-secondary">By signing up, you agree to our <a href="#">Terms</a> & <a href="#">Privacy</a>.</small>
                    <small className="text-secondary">Already have an account? <Link to="/login">Sign in</Link></small>
                  </div>
                </form>
              </div>
            </div>

            <div className="text-center text-secondary small mt-3">
              <i className="bi bi-shield-check me-1" /> We protect your data with industry‑standard security.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
