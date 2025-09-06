import React, { useState } from "react";
import Modal from "../components/Modal";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function AddClassButton({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ match backend field names
  const [form, setForm] = useState({
    ownerEmail: localStorage.getItem("email") || "",
    name: "",
    description: "",
    code: "",
  });

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ownerEmail: form.ownerEmail.trim(),
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description?.trim() || null,
      };
      if (!payload.ownerEmail || !payload.name || !payload.code) {
        throw new Error("Owner Email, Name, and Code are required.");
      }

      const res = await fetch(`${API_BASE}/api/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Pull a good message from JSON or text
        let msg = res.statusText;
        try {
          const j = await res.json();
          msg =
            j?.message ||
            (Array.isArray(j?.errors) ? j.errors.join("; ") : "") ||
            j?.error ||
            j?.detail ||
            msg;
        } catch {
          msg = (await res.text()) || msg;
        }
        throw new Error(msg);
      }

      await res.json(); // consume
      setOpen(false);
      setForm({
        ownerEmail: localStorage.getItem("email") || "",
        name: "",
        description: "",
        code: "",
      });
      if (typeof onCreated === "function") await onCreated();
    } catch (err) {
      setError(err.message || "Failed to add class");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        <i className="bi bi-plus-lg me-1" /> Add Class
      </button>

      <Modal open={open} onClose={() => !loading && setOpen(false)} width={720}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Create New Class</h5>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => !loading && setOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="card-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="mb-3">
              <label className="fw-bold form-label">Owner Email</label>
              <input
                type="email"
                name="ownerEmail"
                className="form-control"
                value={form.ownerEmail}
                onChange={onChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="fw-bold form-label">Class Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={onChange}
                placeholder="e.g., Data Structures — Fall"
                required
              />
            </div>

            <div className="mb-3">
              <label className="fw-bold form-label">Class Code</label>
              <input
                type="text"
                name="code"
                className="form-control"
                value={form.code}
                onChange={onChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="fw-bold form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows={3}
                value={form.description}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="card-footer d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
