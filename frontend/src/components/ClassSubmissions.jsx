// src/pages/class/ClassSubmissions.jsx
import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// Client-side guardrails
const ALLOWED_EXT = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"];
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
]);
const MAX_MB = 20;

// Reusable scroll styles (sticky header inside a scrollable container)
const scrollStyles = {
  container: {
    maxHeight: "58vh",
    overflow: "auto",
    border: "1px solid rgba(0,0,0,.075)",
    borderRadius: "0.5rem",
  },
  thead: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    background: "var(--bs-body-bg)",
  },
  filenameCell: {
    maxWidth: 240,
  },
};

export default function ClassSubmissions() {
  const { classId, token, email, isInstructor, isAdmin } = useOutletContext();
  const canGrade = !!(isInstructor || isAdmin);

  const authHeaders = useMemo(
    () => ({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const [assignments, setAssignments] = useState([]);
  const [mine, setMine] = useState([]);
  const [allSubs, setAllSubs] = useState([]); // only for graders
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Grade dialog state (for instructors/admin)
  const [showGradeDlg, setShowGradeDlg] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradePoints, setGradePoints] = useState("");
  const [feedback, setFeedback] = useState("");
  const [gradingTarget, setGradingTarget] = useState(null); // submission row

  // Minimal, useful filters for grader view
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | SUBMITTED | GRADED
  const [assignmentFilter, setAssignmentFilter] = useState(""); // "" = all

  const assignmentOptions = useMemo(() => {
    // prefer titles from assignments list (sorted)
    const titles = assignments
      .map((a) => a.title)
      .filter(Boolean);
    // in case titles missing, fall back to titles present in submissions
    const fromSubs = allSubs
      .map((s) => s.assignmentTitle)
      .filter(Boolean);
    return Array.from(new Set([...titles, ...fromSubs])).sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [assignments, allSubs]);

  const filteredAllSubs = useMemo(() => {
    let out = allSubs;
    if (statusFilter !== "ALL") {
      out = out.filter((s) => (s.status || "").toUpperCase() === statusFilter);
    }
    if (assignmentFilter) {
      out = out.filter((s) => s.assignmentTitle === assignmentFilter);
    }
    return out;
  }, [allSubs, statusFilter, assignmentFilter]);

  async function load() {
    const ac = new AbortController();
    try {
      setLoading(true);
      setErr(null);

      const headers = {
        "Content-Type": "application/json",
        ...authHeaders,
      };

      const corePromises = [
        fetch(`${API_BASE}/api/classes/${classId}/assignments`, {
          headers,
          credentials: "include",
          signal: ac.signal,
        }),
        fetch(`${API_BASE}/api/submissions/my-in-class`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ email, classId: Number(classId) }),
          signal: ac.signal,
        }),
      ];

      if (canGrade) {
        corePromises.push(
          fetch(`${API_BASE}/api/classes/${classId}/submissions`, {
            headers,
            credentials: "include",
            signal: ac.signal,
          })
        );
      }

      const responses = await Promise.all(corePromises);
      const [aRes, sRes, allRes] = responses;

      if (!aRes.ok) throw new Error(await aRes.text());
      if (!sRes.ok) throw new Error(await sRes.text());
      if (canGrade && allRes && !allRes.ok) throw new Error(await allRes.text());

      const assignmentsData = await aRes.json();
      assignmentsData.sort((x, y) => {
        const dx = x?.dueAt ? new Date(x.dueAt).getTime() : Infinity;
        const dy = y?.dueAt ? new Date(y.dueAt).getTime() : Infinity;
        return dx - dy;
      });
      setAssignments(assignmentsData);
      if (assignmentsData.length && !selectedAssignment) {
        setSelectedAssignment(assignmentsData[0].id);
      }

      const mineData = await sRes.json();
      setMine(mineData);

      if (canGrade && allRes) {
        const allData = await allRes.json();
        allData.sort((a, b) => {
          const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          return tb - ta;
        });
        setAllSubs(allData);
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setErr(e.message || "Failed to load submissions");
      }
    } finally {
      setLoading(false);
    }
    return () => ac.abort();
  }

  useEffect(() => {
    let cancel = () => {};
    (async () => {
      cancel = await load();
    })();
    return () => cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, token, email, canGrade]);

  function validateFile(f) {
    if (!f) return "Choose a file";
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_MB) return `File too large (>${MAX_MB} MB)`;
    const okMime = f.type && ALLOWED_MIME.has(f.type);
    const okExt = ALLOWED_EXT.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!okMime && !okExt) return "Unsupported file type";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedAssignment) return alert("Select an assignment");
    const vErr = validateFile(file);
    if (vErr) return alert(vErr);

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("studentEmail", email);
      fd.append("assignmentId", String(selectedAssignment));
      fd.append("classId", String(classId));

      const res = await fetch(`${API_BASE}/api/submissions/upload-local`, {
        method: "POST",
        body: fd,
        headers: {
          ...authHeaders,
          // boundary auto-set
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());

      setFile(null);
      await load();
      alert("Submitted!");
    } catch (e) {
      alert(e.message || "Failed to submit");
    } finally {
      setUploading(false);
    }
  }

  // ----- Grading (instructor/admin) -----
  function openGradeDlg(submission) {
    setGradingTarget(submission);
    setGradePoints(submission.gradePoints ?? "");
    setFeedback(submission.feedback ?? "");
    setShowGradeDlg(true);
  }

  async function saveGrade(e) {
    e.preventDefault();
    if (!gradingTarget) return;

    const num = gradePoints === "" ? null : Number(gradePoints);
    if (gradePoints !== "" && (isNaN(num) || !isFinite(num))) {
      return alert("Enter a valid number for points (or leave blank to clear).");
    }

    try {
      setGrading(true);
      const res = await fetch(`${API_BASE}/api/submissions/${gradingTarget.id}/grade`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        credentials: "include",
        body: JSON.stringify({
          graderEmail: email,
          gradePoints: num,
          feedback: feedback || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      setShowGradeDlg(false);
      setGradingTarget(null);
      await load();
    } catch (e) {
      alert(e.message || "Failed to save grade");
    } finally {
      setGrading(false);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (err) return <div className="alert alert-danger">{err}</div>;

  return (
    <div className="row g-4">
      {/* Submit widget (students) */}
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
                  accept={ALLOWED_EXT.join(",")}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
                {file ? (
                  <small className="text-muted d-block mt-1">
                    Selected: <strong>{file.name}</strong>{" "}
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </small>
                ) : null}
              </div>

              <div className="col-12">
                <button className="btn btn-primary" disabled={uploading}>
                  {uploading ? "Uploading…" : "Submit"}
                </button>
              </div>

              <div className="col-12 text-muted">
                <small>Your file is stored on the server and linked to your submission.</small>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* My submissions (scrolling) */}
      <div className="col-12 col-lg-6">
        <div className="card">
          <div className="card-body">
            <h5 className="mb-3">My Submissions</h5>

            <div style={scrollStyles.container}>
              <table className="table table-hover table-sm align-middle mb-0">
                <thead style={scrollStyles.thead}>
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
                        <td className="fw-semibold">
                          {s.assignmentTitle || `Assignment #${s.assignmentId}`}
                        </td>
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
                        <td>{s.gradePoints != null ? s.gradePoints : "-"}</td>
                        <td>
                          {s.submittedAt
                            ? new Date(s.submittedAt).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "-"}
                        </td>
                        <td style={scrollStyles.filenameCell}>
                          {s.fileUrl ? (
                            <a
                              href={s.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-decoration-none text-truncate d-inline-block"
                              style={{ maxWidth: "100%" }}
                              title={s.fileName || s.fileUrl}
                            >
                              📄 {s.fileName || "View"}
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

            <small className="text-muted d-block mt-2">
              Instructors will be notified automatically; grading updates will email you.
            </small>
          </div>
        </div>
      </div>

      {/* All submissions (grader view, scrolling + compact filters) */}
      {canGrade && (
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
                <h5 className="mb-0">
                  All Submissions in Class{" "}
                  <span className="badge text-bg-light">{filteredAllSubs.length}</span>
                </h5>

                <div className="d-flex flex-wrap gap-2">
                  {/* Status filter */}
                  <div className="btn-group" role="group" aria-label="Status filter">
                    <button
                      type="button"
                      className={`btn btn-sm ${statusFilter === "ALL" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setStatusFilter("ALL")}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${statusFilter === "SUBMITTED" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setStatusFilter("SUBMITTED")}
                    >
                      Submitted
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${statusFilter === "GRADED" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setStatusFilter("GRADED")}
                    >
                      Graded
                    </button>
                  </div>

                  {/* Assignment filter */}
                  <select
                    className="form-select form-select-sm"
                    style={{ minWidth: 200 }}
                    value={assignmentFilter}
                    onChange={(e) => setAssignmentFilter(e.target.value)}
                  >
                    <option value="">All assignments</option>
                    {assignmentOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  {/* Reset */}
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setStatusFilter("ALL");
                      setAssignmentFilter("");
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div style={scrollStyles.container}>
                <table className="table table-hover table-sm align-middle mb-0">
                  <thead style={scrollStyles.thead}>
                    <tr>
                      <th style={{ minWidth: 180 }}>Student</th>
                      <th>Assignment</th>
                      <th>Status</th>
                      <th>Points</th>
                      <th>Submitted</th>
                      <th style={{ minWidth: 180 }}>File</th>
                      <th style={{ width: 140 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAllSubs.length > 0 ? (
                      filteredAllSubs.map((s) => (
                        <tr key={s.id}>
                          <td>{s.studentEmail || s.studentName || "-"}</td>
                          <td className="fw-semibold">{s.assignmentTitle || `#${s.assignmentId}`}</td>
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
                          <td>{s.gradePoints != null ? s.gradePoints : "-"}</td>
                          <td>
                            {s.submittedAt
                              ? new Date(s.submittedAt).toLocaleString("en-US", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "-"}
                          </td>
                          <td style={scrollStyles.filenameCell}>
                            {s.fileUrl ? (
                              <a
                                href={s.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-decoration-none text-truncate d-inline-block"
                                style={{ maxWidth: "100%" }}
                                title={s.fileName || s.fileUrl}
                              >
                                📄 {s.fileName || "View"}
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openGradeDlg(s)}
                            >
                              {s.status === "GRADED" ? "Update Grade" : "Grade"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-3">
                          No submissions match your filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <small className="text-muted d-block mt-2">
                Use the status and assignment filters to narrow the list.
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Grade dialog */}
      {showGradeDlg && gradingTarget && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}
        >
          <div className="bg-white rounded shadow p-4" style={{ width: 420, maxWidth: "92vw" }}>
            <h5 className="mb-3">
              {gradingTarget.status === "GRADED" ? "Update Grade" : "Grade Submission"}
            </h5>
            <form className="d-grid gap-3" onSubmit={saveGrade}>
              <div className="small text-muted">
                <div>
                  <strong>Student:</strong>{" "}
                  {gradingTarget.studentEmail || gradingTarget.studentName || "-"}
                </div>
                <div>
                  <strong>Assignment:</strong>{" "}
                  {gradingTarget.assignmentTitle || `#${gradingTarget.assignmentId}`}
                </div>
              </div>

              <div>
                <label className="form-label">Points</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={gradePoints}
                  onChange={(e) => setGradePoints(e.target.value)}
                  placeholder="e.g., 95"
                />
                <div className="form-text">Leave empty to clear the grade.</div>
              </div>

              <div>
                <label className="form-label">Feedback (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Short feedback for the student"
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowGradeDlg(false)}
                  disabled={grading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={grading}>
                  {grading ? "Saving…" : "Save Grade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
