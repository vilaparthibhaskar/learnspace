// src/pages/class/ClassAlerts.jsx
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function ClassAlerts() {
  const { classId, isInstructor, isAdmin, token, email } = useOutletContext();
  const canManage = isInstructor || isAdmin;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`${API_BASE}/api/alerts/class/${classId}`, {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      setItems(await res.json());
    } catch (e) {
      setErr(e.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [classId]);

  async function createAlert(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({ creatorEmail: email, classId, title, body }),
      });
      if (!res.ok) throw new Error(await res.text());
      setTitle(""); setBody("");
      await load();
    } catch (e) {
      alert(e.message || "Failed to post alert");
    }
  }

  async function deleteAlert(id) {
    if (!confirm("Delete this alert?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/alerts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({ requesterEmail: email }),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete alert");
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h5>Alerts</h5>

        {canManage && (
          <form className="mb-3" onSubmit={createAlert}>
            <div className="row g-2">
              <div className="col-12 col-md-4">
                <input
                  className="form-control"
                  placeholder="Title"
                  value={title}
                  onChange={(e)=>setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <input
                  className="form-control"
                  placeholder="Message"
                  value={body}
                  onChange={(e)=>setBody(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-md-2">
                <button className="btn btn-primary w-100">Post</button>
              </div>
            </div>
          </form>
        )}

        {loading ? <p>Loading…</p> : err ? (
          <div className="alert alert-danger">{err}</div>
        ) : (
          <div className="list-group">
            {items.map(a => (
              <div key={a.id} className="list-group-item">
                <div className="d-flex justify-content-between">
                  <h6 className="mb-1">{a.title}</h6>
                  <small className="text-muted">{a.classCode}</small>
                </div>
                <p className="mb-1">{a.body}</p>
                <small className="text-muted">
                  By {a.createdByName} • {new Date(a.createdAt).toLocaleString()}
                </small>
                {canManage && (
                  <div className="mt-2 text-end">
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>deleteAlert(a.id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
            {!items.length && <div className="list-group-item text-muted">No alerts</div>}
          </div>
        )}
      </div>
    </div>
  );
}
