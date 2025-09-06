// src/pages/ProfilePage.jsx
// Bootstrap-only ✨ premium profile UI
// - Colorful layered background + glass cards
// - Big avatar with gradient ring and initials
// - Read-only view with elegant layout; smooth switch to editable form
// - Input groups with icons, inline validation, save/cancel controls
// - Email shown read-only with quick copy button
// - Polished Change Password card
// Optional (icons):
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import {
  changeUserName,
  changeEmail,
  changePhoneNumber,
  changeAddress,
  changeRole,
} from "../store/slices/userSlice";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function ProfilePage() {
  const dispatch = useDispatch();

  // Read from redux then localStorage (so refresh works)
  const user = useSelector((s) => s.user) || {};
  const name = user?.name || localStorage.getItem("name") || "";
  const email = user?.email || localStorage.getItem("email") || "";
  const phone = user?.phoneNumber || localStorage.getItem("phoneNumber") || "";
  const address = user?.address || localStorage.getItem("address") || "";
  const role = user?.role || localStorage.getItem("role") || "";
  const token = useSelector((s) => s.user?.token) || localStorage.getItem("jwt");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name, phone, address, role });

  const initials = useMemo(() => {
    const base = (name || email || "U").trim();
    const parts = base.split(/\s+/);
    return ((parts[0]?.[0] || "U") + (parts[1]?.[0] || "")).toUpperCase();
  }, [name, email]);

  function startEdit() {
    setForm({ name, phone, address, role });
    setError("");
    setSuccess("");
    setEditing(true);
  }
  function cancelEdit() {
    setEditing(false);
    setError("");
  }
  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/person/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          email, // identity
          name: form.name,
          phone: form.phone,
          address: form.address,
          role: form.role,
        }),
      });

      if (!res.ok) {
        let msg = res.statusText;
        try {
          const data = await res.json();
          msg = data?.message || data?.error || msg;
        } catch {
          try { msg = (await res.text()) || msg; } catch {}
        }
        throw new Error(msg || `HTTP ${res.status}`);
      }

      // Reflect updates locally
      dispatch(changeUserName(form.name));
      dispatch(changePhoneNumber(form.phone));
      dispatch(changeAddress(form.address));
      dispatch(changeRole(form.role));
      localStorage.setItem("name", form.name);
      localStorage.setItem("phoneNumber", form.phone);
      localStorage.setItem("address", form.address);
      localStorage.setItem("role", form.role);

      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setSuccess("Email copied to clipboard.");
    } catch {}
  }

  return (
    <>
      <Header />
      <StyleBlock />
      <div className="prof-hero-bg" />

      <div className="container py-4 py-md-5">
        <div className="row g-4">
          {/* Left: Avatar & identity */}
          <div className="col-12 col-md-4">
            <div className="card glass-card border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="card-body text-center p-4">
                <div className="avatar-wrap mx-auto mb-3">
                  <div className="avatar-circle">{initials}</div>
                </div>
                <h5 className="mb-1 text-truncate">{name || "Unnamed User"}</h5>
                <div className="text-secondary small mb-3 text-break">{email}</div>

                <div className="d-inline-flex align-items-center gap-2 mb-2">
                  <span className="badge text-bg-secondary">{(role || "user").toUpperCase()}</span>
                  <button className="btn btn-sm btn-outline-secondary" onClick={copyEmail}>
                    <i className="bi bi-clipboard me-1" /> Copy email
                  </button>
                </div>

                <hr className="my-3" />
                <div className="text-start small text-secondary">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-telephone me-2" /> <span className="text-dark">{phone || "—"}</span>
                  </div>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-geo-alt me-2 mt-1" />
                    <span className="text-dark" style={{ whiteSpace: "pre-wrap" }}>{address || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Profile form */}
          <div className="col-12 col-md-8">
            <div className="card glass-card border-0 rounded-4 shadow-lg">
              <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                <div>
                  <div className="badge text-bg-primary bg-gradient px-3 py-2 rounded-pill me-2">LearnSpace</div>
                  <span className="fw-semibold">Profile</span>
                </div>
                {!editing ? (
                  <button className="btn btn-sm btn-gradient" onClick={startEdit}>
                    <i className="bi bi-pencil-square me-1" /> Edit
                  </button>
                ) : (
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" type="button" onClick={cancelEdit} disabled={saving}>
                      Cancel
                    </button>
                    <button className="btn btn-sm btn-success" type="submit" form="profile-edit-form" disabled={saving}>
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                )}
              </div>

              <div className="card-body">
                {success && (
                  <div className="alert alert-success py-2" role="alert">
                    <i className="bi bi-check-circle me-1" /> {success}
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger py-2" role="alert">
                    <i className="bi bi-exclamation-triangle me-1" /> {error}
                  </div>
                )}

                {!editing ? (
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Full Name</label>
                      <div className="form-control-plaintext">{name || "—"}</div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Phone</label>
                      <div className="form-control-plaintext">{phone || "—"}</div>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Address</label>
                      <div className="form-control-plaintext" style={{ whiteSpace: "pre-wrap" }}>{address || "—"}</div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Role</label>
                      <div className="form-control-plaintext">{role || "—"}</div>
                    </div>
                  </div>
                ) : (
                  <form id="profile-edit-form" onSubmit={onSave} className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-person" /></span>
                        <input className="form-control border-start-0" name="name" value={form.name} onChange={onChange} required />
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone</label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-telephone" /></span>
                        <input className="form-control border-start-0" name="phone" value={form.phone} onChange={onChange} required />
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-geo" /></span>
                        <textarea className="form-control border-start-0" rows={2} name="address" value={form.address} onChange={onChange} required />
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Role</label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-badge-ad" /></span>
                        <select className="form-select border-start-0" name="role" value={form.role} onChange={onChange} required>
                          <option value="">Select Role</option>
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <ChangePasswordCard email={email} token={token} />
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Change Password ---------- */
function ChangePasswordCard({ email, token }) {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmNew, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    if (!newPassword || newPassword !== confirmNew) {
      setMsg({ type: "danger", text: "New passwords do not match." });
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/api/person/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      setMsg({ type: "success", text: "Password updated." });
      setCurrent(""); setNew(""); setConfirm("");
    } catch (err) {
      setMsg({ type: "danger", text: err.message || "Failed to update password." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card glass-card border-0 rounded-4 shadow-lg mt-4">
      <div className="card-header bg-transparent">
        <h6 className="mb-0"><i className="bi bi-shield-lock me-2" />Change Password</h6>
      </div>
      <div className="card-body">
        <form className="row g-3" onSubmit={submit}>
          <div className="col-12 col-md-6">
            <label className="form-label">Current Password</label>
            <div className="input-group">
              <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-lock" /></span>
              <input type="password" className="form-control border-start-0" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} required />
            </div>
          </div>
          <div className="col-12 col-md-6" />
          <div className="col-12 col-md-6">
            <label className="form-label">New Password</label>
            <div className="input-group">
              <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-shield-check" /></span>
              <input type="password" className="form-control border-start-0" value={newPassword} onChange={(e) => setNew(e.target.value)} required minLength={6} />
            </div>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label">Confirm New Password</label>
            <div className="input-group">
              <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-check2-square" /></span>
              <input type="password" className="form-control border-start-0" value={confirmNew} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
            </div>
          </div>

          {msg && (
            <div className="col-12">
              <div className={`alert alert-${msg.type} py-2 mb-0`}>{msg.text}</div>
            </div>
          )}

          <div className="col-12">
            <button className="btn btn-gradient" disabled={saving}>
              {saving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
function StyleBlock() {
  return (
    <style>{`
      .prof-hero-bg{position:fixed;inset:0;z-index:-1;background:
        radial-gradient(1200px 600px at 0% 0%, rgba(13,110,253,.10), transparent 60%),
        radial-gradient(900px 450px at 100% 0%, rgba(111,66,193,.10), transparent 60%),
        radial-gradient(1000px 500px at 0% 100%, rgba(214,51,132,.08), transparent 60%),
        linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);} 
      .glass-card{background:rgba(255,255,255,.78);backdrop-filter:saturate(140%) blur(10px);-webkit-backdrop-filter:saturate(140%) blur(10px);border:1px solid rgba(0,0,0,.06);} 
      .btn-gradient{background-image:linear-gradient(135deg,#0d6efd 0%,#6f42c1 60%,#d63384 100%);color:#fff;border:0;} 
      .btn-gradient:hover{filter:brightness(1.05);} 
      .avatar-wrap{width:112px;height:112px;border-radius:50%;padding:3px;background:
        conic-gradient(from 0deg, #0d6efd, #6f42c1, #d63384, #20c997, #0d6efd);} 
      .avatar-circle{width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#0b1220;color:#e5e7eb;font-weight:800;font-size:34px;}
    `}</style>
  );
}
