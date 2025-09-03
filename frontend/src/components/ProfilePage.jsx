import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  changeUserName,
  changeEmail,
  changePhoneNumber,
  changeAddress,
  changeRole,
} from "../store/slices/userSlice";
import Header from "./Header";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function ProfilePage() {
  const dispatch = useDispatch();

  // read from redux first; fall back to localStorage so refresh works
  const user = useSelector((s) => s.user) || {};
  const name = user?.name || localStorage.getItem("name") || "";
  const email = user?.email || localStorage.getItem("email") || "";
  const phone = user?.phoneNumber || localStorage.getItem("phoneNumber") || "";
  const address = user?.address || localStorage.getItem("address") || "";
  const role = user?.role || localStorage.getItem("role") || "";

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name, phone, address, role });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const token = useSelector((s) => s.user?.token) || localStorage.getItem("jwt");

  const initials = useMemo(() => {
    const parts = (name || email || "U").trim().split(/\s+/);
    return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  }, [name, email]);

  function startEdit() {
    setForm({ name, phone, address, role });
    setError(null);
    setEditing(true);
  }
  function cancelEdit() {
    setEditing(false);
    setError(null);
  }
  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Backend expectation: find by email and update fields
      const res = await fetch(`${API_BASE}/api/person/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          email,                // use email as identity (unchanged here)
          name: form.name,
          phone: form.phone,
          address: form.address,
          role: form.role,      // keep if you allow user to edit; otherwise remove
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

      // optionally read updated user back (if endpoint returns it)
      // const updated = await res.json();

      // update redux + localStorage so it persists across reloads
      dispatch(changeUserName(form.name));
      dispatch(changePhoneNumber(form.phone));
      dispatch(changeAddress(form.address));
      dispatch(changeRole(form.role));
      // email unchanged; but if your endpoint allows email change, also dispatch changeEmail

      localStorage.setItem("name", form.name);
      localStorage.setItem("phoneNumber", form.phone);
      localStorage.setItem("address", form.address);
      localStorage.setItem("role", form.role);

      setEditing(false);
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    <Header/>
    <div className="container mt-4">
      <div className="row g-4">
        {/* Left: Avatar + basic info */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
                style={{ width: 96, height: 96, fontSize: 28, fontWeight: 700 }}
              >
                {initials.toUpperCase()}
              </div>
              <h5 className="mb-1">{name || "Unnamed User"}</h5>
              <div className="text-muted mb-3" style={{ wordBreak: "break-all" }}>
                {email}
              </div>
              <span className="badge text-bg-secondary">{(role || "user").toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Right: Details / Edit */}
        <div className="col-12 col-md-8">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Profile</h5>
              {!editing ? (
                <button className="btn btn-sm btn-outline-primary" onClick={startEdit}>
                  Edit
                </button>
              ) : (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-secondary"
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-sm btn-success"
                    type="submit"
                    form="profile-edit-form"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              )}
            </div>

            <div className="card-body">
              {!editing ? (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Full Name</label>
                    <div className="form-control-plaintext">{name || "—"}</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Phone</label>
                    <div className="form-control-plaintext">{phone || "—"}</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <div className="form-control-plaintext" style={{ whiteSpace: "pre-wrap" }}>
                      {address || "—"}
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Role</label>
                    <div className="form-control-plaintext">{role || "—"}</div>
                  </div>
                </div>
              ) : (
                <form id="profile-edit-form" onSubmit={onSave} className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-control"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      name="role"
                      value={form.role}
                      onChange={onChange}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {error && (
                    <div className="col-12">
                      <div className="alert alert-danger py-2 mb-0">{error}</div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Optional: change password card */}
          <ChangePasswordCard email={email} token={token} />
        </div>
      </div>
    </div>
    </>
  );
}

/** Optional password change card (expects backend at /api/person/password) */
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
    <div className="card shadow-sm mt-4">
      <div className="card-header">
        <h6 className="mb-0">Change Password</h6>
      </div>
      <div className="card-body">
        <form className="row g-3" onSubmit={submit}>
          <div className="col-12 col-md-6">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </div>
          <div className="col-12 col-md-6" />
          <div className="col-12 col-md-6">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNew(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmNew}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {msg && (
            <div className="col-12">
              <div className={`alert alert-${msg.type} py-2 mb-0`}>{msg.text}</div>
            </div>
          )}

          <div className="col-12">
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
