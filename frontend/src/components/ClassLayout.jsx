// src/pages/class/ClassLayout.jsx
// Bootstrap-only premium UI (no Tailwind/shadcn). Uses Bootstrap 5 utilities,
// placeholders, and a custom modal built with Bootstrap classes.
// Assumes Bootstrap CSS is already loaded.
// Optional (nice icons): add Bootstrap Icons to index.html
//   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "./Header"; // adjust if needed
import { getAuth } from "../utils/auth"; // adjust if needed

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
  const [inviteRole, setInviteRole] = useState("STUDENT");
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

  const menu = useMemo(
    () => [
      { to: `/classes/${classId}`, label: "Class Home", icon: "bi-house" },
      { to: `/classes/${classId}/members`, label: "Class Members", icon: "bi-people" },
      { to: `/classes/${classId}/submissions`, label: "Submissions", icon: "bi-inbox" },
      { to: `/classes/${classId}/alerts`, label: "Alerts", icon: "bi-megaphone" },
      { to: `/classes/${classId}/assignments`, label: "Assignments", icon: "bi-journal-text" },
    ],
    [classId]
  );

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
          requesterEmail: email,
          newMemberEmail: inviteEmail,
          role: inviteRole,
        }),
      });
      if (!res.ok) {
        const msg = (await res.text()) || res.statusText;
        throw new Error(msg);
      }
      setShowAdd(false);
      navigate(`/classes/${classId}/members`);
    } catch (e) {
      setFormErr(e.message || "Failed to add member");
    } finally {
      setSaving(false);
    }
  }

  const linkCls = ({ isActive }) =>
    [
      "list-group-item list-group-item-action d-flex align-items-center gap-2 rounded-3 border-0 px-3 py-2",
      isActive ? "active shadow-sm" : "bg-body-tertiary",
    ].join(" ");

  return (
    <>
      <Header />

      {/* Page backdrop accents */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          zIndex: -1,
          background:
            "radial-gradient(1200px 600px at 0% 0%, rgba(13,110,253,.08), transparent 60%)," +
            "radial-gradient(1200px 600px at 100% 0%, rgba(214,51,132,.08), transparent 60%)",
        }}
      />

      <div className="container-fluid mt-3 mt-md-4">
        <div className="row g-3 g-md-4">
          {/* Sidebar */}
          <aside className="col-12 col-md-4 col-lg-3 col-xxl-2">
            <div className="card border-0 shadow-lg overflow-hidden sticky-md-top" style={{ top: 16 }}>
              <div
                className="p-4 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(13,110,253,1) 0%, rgba(111,66,193,1) 60%, rgba(214,51,132,1) 100%)",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-white bg-opacity-25 rounded-3 p-2 d-flex align-items-center justify-content-center">
                    <i className="bi bi-hash fs-5" />
                  </div>
                  <div className="flex-grow-1">
                    <div className="small text-white-50 text-truncate">{cls?.code || (loading ? "•••" : "—")}</div>
                    <h5 className="mb-0 text-truncate">{loading ? "Loading…" : cls?.title ?? cls?.name ?? "Untitled Class"}</h5>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="list-group list-group-flush gap-2">
                  {menu.map((m) => (
                    <NavLink key={m.to} end={m.to === `/classes/${classId}`} to={m.to} className={linkCls}>
                      <i className={`${m.icon} opacity-75`} />
                      <span className="text-truncate">{m.label}</span>
                      <i className="bi bi-chevron-right ms-auto opacity-25" />
                    </NavLink>
                  ))}
                </div>

                <div className="d-flex align-items-center justify-content-between mt-3">
                  <span className={`badge ${isAdmin ? "text-bg-primary" : isInstructor ? "text-bg-secondary" : "text-bg-light text-dark"}`}>
                    {isAdmin ? "ADMIN" : isInstructor ? "INSTRUCTOR" : myRole || "MEMBER"}
                  </span>
                  {canManage && (
                    <button className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2" onClick={openAddDialog}>
                      <i className="bi bi-person-plus" /> Add Member
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="col-12 col-md-8 col-lg-9 col-xxl-10">
            {loading && (
              <div className="vstack gap-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <p className="placeholder-glow mb-2">
                      <span className="placeholder col-5" />
                    </p>
                    <p className="placeholder-glow mb-2">
                      <span className="placeholder col-8" />
                      <span className="placeholder col-6 ms-2" />
                    </p>
                    <p className="placeholder-glow mb-0">
                      <span className="placeholder col-4" />
                    </p>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="placeholder-glow">
                          <span className="placeholder col-12" style={{ height: 112 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="placeholder-glow">
                          <span className="placeholder col-12" style={{ height: 112 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && err && (
              <div className="alert alert-danger shadow-sm" role="alert">{err}</div>
            )}

            {!loading && !err && !cls && (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center text-muted py-5">This class could not be found.</div>
              </div>
            )}

            {!loading && !err && cls && (
              <div className="fade show">
                <Outlet context={{ cls, classId: Number(classId), isInstructor, isAdmin, token, email }} />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ADD MEMBER MODAL (Bootstrap-style without JS) */}
      {showAdd && (
        <>
          {/* Backdrop */}
          <div className="modal-backdrop show" style={{ zIndex: 1050 }} />

          <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header">
                  <h5 className="modal-title">Add Member</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowAdd(false)} />
                </div>

                <form onSubmit={submitAdd}>
                  <div className="modal-body vstack gap-3">
                    <div>
                      <label className="form-label">Email</label>
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
                      <select className="form-select" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                        <option value="STUDENT">STUDENT</option>
                        <option value="INSTRUCTOR">INSTRUCTOR</option>
                      </select>
                    </div>

                    {formErr && <div className="alert alert-danger py-2 mb-0">{formErr}</div>}
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAdd(false)} disabled={saving}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Adding…" : "Add member"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
