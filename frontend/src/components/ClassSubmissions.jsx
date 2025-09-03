// src/pages/class/ClassSubmissions.jsx
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function ClassSubmissions() {
  const { classId, token, email } = useOutletContext();

  const [assignments, setAssignments] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setErr(null);

      // 1) Assignments for this class
      const a = await fetch(`${API_BASE}/api/classes/${classId}/assignments`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (!a.ok) throw new Error(await a.text());
      const assignmentsData = await a.json();
      setAssignments(assignmentsData);

      // preselect first assignment if none selected
      if (assignmentsData?.length && !selectedAssignment) {
        setSelectedAssignment(assignmentsData[0].id);
      }

      // 2) My submissions in this class
      const s = await fetch(`${API_BASE}/api/submissions/my-in-class`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ email, classId }),
      });
      if (!s.ok) throw new Error(await s.text());
      setMine(await s.json());
    } catch (e) {
      setErr(e.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); // eslint-disable-next-line
  }, [classId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedAssignment) return alert("Select an assignment");
    if (!file) return alert("Choose a file");

    try {
      setUploading(true);

      // Send file to backend -> backend uploads to Cloudinary and creates Submission
      const fd = new FormData();
      fd.append("file", file);
      fd.append("studentEmail", email);
      fd.append("assignmentId", String(selectedAssignment));
      fd.append("classId", String(classId));

      const res = await fetch(`${API_BASE}/api/submissions/upload`, {
        method: "POST",
        body: fd,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // DO NOT set Content-Type for multipart; browser will set boundary
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());

      // reset + refresh
      setFile(null);
      await load();
      alert("Submitted!");
    } catch (e) {
      alert(e.message || "Failed to submit");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (err) return <div className="alert alert-danger">{err}</div>;

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-6">
        <div className="card">
          <div className="card-body">
            <h5>Submit Work</h5>
            <form className="row g-3" onSubmit={handleSubmit}>
              <div className="col-12">
                <label className="form-label">Assignment</label>
                <select
                  className="form-select"
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                >
                  <option value="">Select…</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} {a.dueAt ? `• due ${new Date(a.dueAt).toLocaleString()}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">File</label>
                <input
                  className="form-control"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div className="col-12">
                <button className="btn btn-primary" disabled={uploading}>
                  {uploading ? "Uploading…" : "Submit"}
                </button>
              </div>

              <div className="col-12 text-muted">
                <small>The file will be stored in cloud and linked to your submission.</small>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-6">
        <div className="card">
          <div className="card-body">
            <h5>My Submissions</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Status</th>
                    <th>Points</th>
                    <th>Submitted</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody>
  {mine.length > 0 ? (
    mine.map((s) => (
      <tr key={s.id}>
        {/* Assignment Title */}
        <td className="fw-semibold">
          {s.assignmentTitle || `Assignment #${s.assignmentId}`}
        </td>

        {/* Status */}
        <td>
          {s.status ? (
            <span
              className={`badge ${
                s.status === "GRADED"
                  ? "bg-success"
                  : s.status === "SUBMITTED"
                  ? "bg-primary"
                  : "bg-secondary"
              }`}
            >
              {s.status}
            </span>
          ) : (
            "-"
          )}
        </td>

        {/* Grade */}
        <td>{s.gradePoints != null ? s.gradePoints : "-"}</td>

        {/* Submitted At */}
        <td>
          {s.submittedAt
            ? new Date(s.submittedAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "-"}
        </td>

        {/* File Link */}
        <td>
          {s.fileUrl ? (
            <a
              href={s.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-decoration-none"
            >
              📄 {s.fileName || "Download"}
            </a>
          ) : (
            "-"
          )}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={5} className="text-center text-muted py-3">
        No submissions yet
      </td>
    </tr>
  )}
</tbody>

              </table>
            </div>
            <small className="text-muted">
              Instructors will be notified automatically; grading updates will email you.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
