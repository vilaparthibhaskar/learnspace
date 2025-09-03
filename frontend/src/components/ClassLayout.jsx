// src/pages/class/ClassLayout.jsx
import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth } from "../utils/auth";       // adjust to "../../utils/auth" if this file is under /pages/class
import Header from "./Header";                  // adjust to "../Header" if needed

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function ClassLayout() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { token, email, role } = getAuth();

  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // dialog state
  const [showAdd, setShowAdd] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("STUDENT"); // or INSTRUCTOR
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${API_BASE}/api/classes/${classId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!cancelled) setCls(data);
      } catch (e) {
        if (!cancelled) setErr(e.message || "Failed to load class");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [classId, token]);

  const isAdmin = (role || "").toLowerCase() === "admin";
  const myRole = (cls?.myRole || "").toUpperCase();
  const isInstructor = myRole === "INSTRUCTOR" || isAdmin;
  const canManage = isAdmin || isInstructor;

  const linkCls = ({ isActive }) =>
    `btn text-start ${isActive ? "btn-primary" : "btn-light"}`;

  function openAddDialog() {
    setFormErr("");
    setInviteEmail("");
    setInviteRole("STUDENT");
    setShowAdd(true);
  }

  async function submitAdd(e) {
    e.preventDefault();
    setFormErr("");
    if (!inviteEmail) {
      setFormErr("Student email is required.");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/api/classes/${classId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          requesterEmail: email,     // who is adding
          newMemberEmail: inviteEmail,
          role: inviteRole,          // STUDENT or INSTRUCTOR
        }),
      });
      if (!res.ok) {
        const msg = (await res.text()) || res.statusText;
        throw new Error(msg);
      }
      // success → close and go to Members tab
      setShowAdd(false);
      navigate(`/classes/${classId}/members`);
    } catch (e) {
      setFormErr(e.message || "Failed to add member");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />
      <div className="container-fluid mt-3">
        <div className="row">
          {/* LEFT MENU ALWAYS RENDERS */}
          <aside className="col-12 col-md-3 col-lg-2 mb-3">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h6 className="text-muted">{cls?.code || "…"}</h6>
                <h5 className="mb-3">{cls?.title ?? cls?.name ?? "Loading…"}</h5>

                <nav className="nav flex-column gap-2 mb-3">
                  <NavLink end to={`/classes/${classId}`} className={linkCls}>Class Home</NavLink>
                  <NavLink to={`/classes/${classId}/members`} className={linkCls}>Class Members</NavLink>
                  <NavLink to={`/classes/${classId}/submissions`} className={linkCls}>Submissions</NavLink>
                  <NavLink to={`/classes/${classId}/alerts`} className={linkCls}>Alerts</NavLink>
                  <NavLink to={`/classes/${classId}/assignments`} className={linkCls}>Assignments</NavLink>
                </nav>

                {canManage && (
                  <button
                    className="btn btn-success mt-auto"
                    onClick={openAddDialog}
                  >
                    + Add Student
                  </button>
                )}

                <div className="mt-3">
                  <span className="badge text-bg-secondary">{myRole || "MEMBER"}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <main className="col-12 col-md-9 col-lg-10">
            {loading && <p className="m-3">Loading class…</p>}
            {!loading && err && <p className="m-3 text-danger">Error: {err}</p>}
            {!loading && !err && !cls && (
              <p className="m-3 text-danger">Class not found</p>
            )}
            {!loading && !err && cls && (
              <Outlet context={{ cls, classId: Number(classId), isInstructor, isAdmin, token, email }} />
            )}
          </main>
        </div>
      </div>

      {/* ADD MEMBER DIALOG */}
      {showAdd && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
             style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}>
          <div className="bg-white rounded shadow p-4" style={{ width: 420, maxWidth: "90vw" }}>
            <h5 className="mb-3">Add Member</h5>

            <form onSubmit={submitAdd} className="d-grid gap-3">
              <div>
                <label className="form-label">Student Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                />
              </div>

              <div>
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="INSTRUCTOR">INSTRUCTOR</option>
                </select>
              </div>

              {formErr && <div className="text-danger small">{formErr}</div>}

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAdd(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Adding…" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
