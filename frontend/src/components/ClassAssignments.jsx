// src/pages/class/ClassAssignments.jsx
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// helpers
function toInstantOrNull(dtLocal) {
  if (!dtLocal) return null;
  // dtLocal is "YYYY-MM-DDTHH:mm"
  const asDate = new Date(dtLocal);
  return asDate.toISOString(); // backend expects Instant.parse(...)
}
function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  // format to "YYYY-MM-DDTHH:mm"
  const pad = (n) => (n < 10 ? "0" + n : n);
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function ClassAssignments() {
  const { classId, token, email, isInstructor, isAdmin } = useOutletContext();
  const canManage = isInstructor || isAdmin;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // dialog state
  const [showDlg, setShowDlg] = useState(false);
  const [editing, setEditing] = useState(null); // assignment or null
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState(""); // datetime-local string
  const [maxPoints, setMaxPoints] = useState("100");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`${API_BASE}/api/classes/${classId}/assignments`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      setItems(await res.json());
    } catch (e) {
      setErr(e.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [classId]);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setDueAt("");
    setMaxPoints("100");
    setFormErr("");
    setShowDlg(true);
  }
  function openEdit(a) {
    setEditing(a);
    setTitle(a.title || "");
    setDescription(a.description || "");
    setDueAt(toLocalInputValue(a.dueAt));
    setMaxPoints(String(a.maxPoints ?? "100"));
    setFormErr("");
    setShowDlg(true);
  }

  async function saveAssignment(e) {
    e.preventDefault();
    setFormErr("");
    try {
      setSaving(true);
      const payload = {
        [editing ? "editorEmail" : "creatorEmail"]: email,
        title,
        description,
        dueAt: toInstantOrNull(dueAt) || "",
        maxPoints: maxPoints || "",
      };
      const url = editing
        ? `${API_BASE}/api/classes/${classId}/assignments/${editing.id}`
        : `${API_BASE}/api/classes/${classId}/assignments`;
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setShowDlg(false);
      await load();
    } catch (e) {
      setFormErr(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAssignment(id) {
    if (!confirm("Delete assignment? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/classes/${classId}/assignments/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ requesterEmail: email }),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete");
    }
  }

  if (loading) return <p>Loading…</p>;
  if (err) return <div className="alert alert-danger">{err}</div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Assignments</h5>
        {canManage && (
          <button className="btn btn-primary" onClick={openCreate}>+ New Assignment</button>
        )}
      </div>

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Title</th>
              <th>Due</th>
              <th>Max Points</th>
              {canManage && <th style={{width: 160}}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map(a => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.dueAt ? new Date(a.dueAt).toLocaleString() : "-"}</td>
                <td>{a.maxPoints ?? "-"}</td>
                {canManage && (
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(a)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteAssignment(a.id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {!items.length && (
              <tr><td colSpan={canManage ? 4 : 3} className="text-center text-muted">No assignments</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit dialog */}
      {showDlg && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
             style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}>
          <div className="bg-white rounded shadow p-4" style={{ width: 520, maxWidth: "92vw" }}>
            <h5 className="mb-3">{editing ? "Edit Assignment" : "New Assignment"}</h5>
            <form className="d-grid gap-3" onSubmit={saveAssignment}>
              <div>
                <label className="form-label">Title</label>
                <input className="form-control" value={title} onChange={(e)=>setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={4} value={description} onChange={(e)=>setDescription(e.target.value)} />
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Due</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={dueAt}
                    onChange={(e)=>setDueAt(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Max Points</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={maxPoints}
                    onChange={(e)=>setMaxPoints(e.target.value)}
                  />
                </div>
              </div>

              {formErr && <div className="text-danger small">{formErr}</div>}

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowDlg(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
