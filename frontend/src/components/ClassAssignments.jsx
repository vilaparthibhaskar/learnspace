// src/pages/class/ClassAssignments.jsx
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// helpers
function toInstantOrNull(dtLocal) {
  if (!dtLocal) return null;
  const asDate = new Date(dtLocal);
  return asDate.toISOString(); // backend expects Instant.parse(...)
}
function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
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

  // NEW: attachment state
  const [file, setFile] = useState(null); // File | null
  const [existingAttachmentUrl, setExistingAttachmentUrl] = useState(""); // string
  const [removeAttachment, setRemoveAttachment] = useState(false);

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

  useEffect(() => {
    load(); // eslint-disable-next-line
  }, [classId]);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setDueAt("");
    setMaxPoints("100");
    setFormErr("");
    setFile(null);
    setExistingAttachmentUrl("");
    setRemoveAttachment(false);
    setShowDlg(true);
  }
  function openEdit(a) {
    setEditing(a);
    setTitle(a.title || "");
    setDescription(a.description || "");
    setDueAt(toLocalInputValue(a.dueAt));
    setMaxPoints(String(a.maxPoints ?? "100"));
    setFormErr("");
    setFile(null);
    setExistingAttachmentUrl(a.attachmentUrl || "");
    setRemoveAttachment(false);
    setShowDlg(true);
  }

  // NEW: upload helper (multipart/form-data)
  async function uploadLocal(file) {
    const fd = new FormData();
    fd.append("file", file);
    // (Optional) you can include meta if your backend accepts it:
    // fd.append("folder", "assignments");
    const res = await fetch(`${API_BASE}/api/uploads/local`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // DO NOT set Content-Type for FormData; browser sets boundary
      },
      credentials: "include",
      body: fd,
    });
    const text = await res.text(); // robust parse (supports text or JSON)
    if (!res.ok) throw new Error(text || "Upload failed");
    let url = text.trim();
    try {
      const json = JSON.parse(text);
      url = json.url || json.path || json.location || url;
    } catch {
      // plain text is fine (already in url)
    }
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      throw new Error("Upload did not return a valid URL");
    }
    // normalize absolute URL if backend returns relative like "/files/.."
    if (url.startsWith("/")) url = `${API_BASE}${url}`;
    return url;
  }

  async function saveAssignment(e) {
    e.preventDefault();
    setFormErr("");
    setSaving(true);

    try {
      // 1) Create or patch the core assignment fields
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

      const baseRes = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!baseRes.ok) throw new Error(await baseRes.text());

      // Parse the latest assignment (need id for follow-up operations)
      const saved = await baseRes.json(); // expect returned assignment JSON
      const assignmentId = saved.id ?? (editing && editing.id);
      if (!assignmentId) throw new Error("Assignment saved but id not returned");

      // 2) Determine attachment changes:
      //    - If file selected -> upload, then PATCH assignment with attachmentUrl
      //    - Else if editing and removeAttachment checked -> clear attachmentUrl
      if (file) {
        // basic client-side guard
        if (file.type !== "application/pdf") {
          throw new Error("Only PDF files are allowed");
        }
        const fileUrl = await uploadLocal(file);

        // PATCH to persist attachmentUrl on assignment
        const patchRes = await fetch(
          `${API_BASE}/api/classes/${classId}/assignments/${assignmentId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
            body: JSON.stringify({
              editorEmail: email,
              attachmentUrl: fileUrl,
            }),
          }
        );
        if (!patchRes.ok) throw new Error(await patchRes.text());
      } else if (editing && removeAttachment && existingAttachmentUrl) {
        // Clear attachment if requested
        const clearRes = await fetch(
          `${API_BASE}/api/classes/${classId}/assignments/${assignmentId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
            body: JSON.stringify({
              editorEmail: email,
              attachmentUrl: "", // backend should treat empty as remove
            }),
          }
        );
        if (!clearRes.ok) throw new Error(await clearRes.text());
      }

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
      const res = await fetch(
        `${API_BASE}/api/classes/${classId}/assignments/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ requesterEmail: email }),
        }
      );
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
          <button className="btn btn-primary" onClick={openCreate}>
            + New Assignment
          </button>
        )}
      </div>

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Title</th>
              <th>Due</th>
              <th>Max Points</th>
              <th>File</th> {/* NEW */}
              {canManage && <th style={{ width: 200 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.dueAt ? new Date(a.dueAt).toLocaleString() : "-"}</td>
                <td>{a.maxPoints ?? "-"}</td>
                <td>
                  {a.attachmentUrl ? (
                    <a
                      href={a.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="link-primary"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                {canManage && (
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => openEdit(a)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteAssignment(a.id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td
                  colSpan={canManage ? 5 : 4}
                  className="text-center text-muted"
                >
                  No assignments
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit dialog */}
      {showDlg && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}
        >
          <div
            className="bg-white rounded shadow p-4"
            style={{ width: 560, maxWidth: "92vw" }}
          >
            <h5 className="mb-3">
              {editing ? "Edit Assignment" : "New Assignment"}
            </h5>
            <form className="d-grid gap-3" onSubmit={saveAssignment}>
              <div>
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Due</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Max Points</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(e.target.value)}
                  />
                </div>
              </div>

              {/* NEW: Attachment section */}
              <div className="border rounded p-3">
                <label className="form-label d-block">Attach PDF (optional)</label>
                {existingAttachmentUrl && (
                  <div className="mb-2 small">
                    <span className="me-2">Current:</span>
                    <a
                      href={existingAttachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View existing file
                    </a>
                  </div>
                )}

                <input
                  type="file"
                  className="form-control"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />

                {editing && existingAttachmentUrl && !file && (
                  <div className="form-check mt-2">
                    <input
                      id="removeAttachment"
                      type="checkbox"
                      className="form-check-input"
                      checked={removeAttachment}
                      onChange={(e) => setRemoveAttachment(e.target.checked)}
                    />
                    <label htmlFor="removeAttachment" className="form-check-label">
                      Remove existing attachment
                    </label>
                  </div>
                )}
                {file && (
                  <div className="small text-muted mt-2">
                    Selected: {file.name} ({Math.ceil(file.size / 1024)} KB)
                  </div>
                )}
              </div>

              {formErr && <div className="text-danger small">{formErr}</div>}

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDlg(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
