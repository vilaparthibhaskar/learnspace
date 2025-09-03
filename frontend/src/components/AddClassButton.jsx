// AddClassButton.jsx
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function AddClassButton({ onCreated }) {           // <-- accept prop
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    ownerEmail: "",
    name: "",
    description: "",
    code: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // cache: "no-store", // optional: avoid any caching weirdness
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const msg = (await res.text()) || res.statusText;
        throw new Error(msg);
      }

      const created = await res.json();
      // optional: console.log("Class created:", created);

      // close & reset
      setShowDialog(false);
      setForm({ ownerEmail: "", name: "", description: "", code: "" });

      // 🔔 trigger refetch in parent
      if (typeof onCreated === "function") {
        await onCreated();   // if it's a thunk dispatch, awaiting is fine
      }
    } catch (err) {
      setError(err.message || "Failed to add class");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setShowDialog(true)} className="btn btn-primary">
        Add Class
      </button>

      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-bold mb-4">Create New Class</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                name="ownerEmail"
                placeholder="Owner Email"
                value={form.ownerEmail}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="text"
                name="name"
                placeholder="Class Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="text"
                name="code"
                placeholder="Class Code"
                value={form.code}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="px-3 py-1 rounded bg-gray-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-blue-600 text-white"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
