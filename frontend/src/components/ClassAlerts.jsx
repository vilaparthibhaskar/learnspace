import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";

/**
 * ClassAlerts – Bootstrap 5 only, polished UI/UX
 * - Drop-in replacement for your src/pages/class/ClassAlerts.jsx
 * - Uses ONLY Bootstrap utilities/components (no Tailwind, no extra deps)
 * - Accessible form with validation, counters, and Ctrl/Cmd+Enter to post
 * - Loading skeletons via Bootstrap placeholders
 * - Friendly error card with retry
 * - Empty state
 * - Compact alert cards with avatar initials, relative time, read more/less
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function ClassAlerts() {
  const { classId, isInstructor, isAdmin, token, email } = useOutletContext();
  const canManage = isInstructor || isAdmin;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const titleMax = 120;
  const bodyMax = 1000;
  const titleOk = title.trim().length > 0 && title.trim().length <= titleMax;
  const bodyOk = body.trim().length > 0 && body.trim().length <= bodyMax;
  const formOk = titleOk && bodyOk && !submitting;

  const controllerRef = useRef(null);
  function abortInFlight() {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  }

  async function load() {
    abortInFlight();
    const ac = new AbortController();
    controllerRef.current = ac;
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`${API_BASE}/api/alerts/class/${classId}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          signal: ac.signal,
        }
      );
      if (!res.ok) throw new Error(await safeText(res) || `Failed: ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.name === "AbortError") return;
      setErr(e.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    return abortInFlight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, token]);

  async function createAlert(e) {
    e.preventDefault();
    if (!formOk) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ creatorEmail: email, classId, title: title.trim(), body: body.trim() }),
      });
      if (!res.ok) throw new Error(await safeText(res) || `Failed: ${res.status}`);
      setTitle("");
      setBody("");
      await load();
    } catch (e) {
      alert(e.message || "Failed to post alert");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteAlert(id) {
    if (!confirm("Delete this alert?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/alerts/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ requesterEmail: email }),
      });
      if (!res.ok) throw new Error(await safeText(res) || `Failed: ${res.status}`);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete alert");
    }
  }

  function onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter" && formOk) {
      createAlert(e);
    }
  }

  const countLabel = useMemo(() => `${items.length} alert${items.length === 1 ? "" : "s"}`,[items.length]);

  return (
    <div className="container px-0" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between">
          <div>
            <h5 className="card-title mb-1">Class Alerts</h5>
            <p className="text-muted small mb-0">Stay up to date with announcements and important notes.</p>
          </div>
          <span className="badge text-bg-light border mt-3 mt-sm-0">{countLabel}</span>
        </div>
      </div>

      {/* Composer */}
      {canManage && (
        <form onSubmit={createAlert} onKeyDown={onKeyDown} className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex align-items-start gap-3">
              <Avatar name="You" />
              <div className="flex-grow-1">
                <div className="mb-3">
                  <label className="form-label small">Title</label>
                  <input
                    className="form-control"
                    value={title}
                    onChange={(e)=> setTitle(e.target.value)}
                    placeholder="Brief, descriptive title"
                    maxLength={titleMax}
                    required
                  />
                  <div className="d-flex justify-content-between small text-muted mt-1">
                    <span>Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to post</span>
                    <span>{title.trim().length}/{titleMax}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small">Message</label>
                  <textarea
                    className="form-control"
                    value={body}
                    onChange={(e)=> setBody(e.target.value)}
                    placeholder="Share details, links, or next steps…"
                    rows={3}
                    maxLength={bodyMax}
                    required
                  />
                  <div className="text-end small text-muted mt-1">{body.trim().length}/{bodyMax}</div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setTitle(""); setBody(""); }}
                    className="btn btn-outline-secondary"
                  >
                    Clear
                  </button>
                  <button
                    disabled={!formOk}
                    className="btn btn-primary d-inline-flex align-items-center"
                  >
                    {submitting && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Content */}
      {loading && <SkeletonList />}

      {!loading && err && (
        <div className="card border-danger-subtle mb-3">
          <div className="card-body">
            <div className="d-flex">
              <div className="me-3 text-danger">⚠️</div>
              <div className="flex-grow-1">
                <div className="fw-semibold">Couldn't load alerts</div>
                <div className="text-danger small mb-2">{err}</div>
                <button onClick={load} className="btn btn-danger btn-sm">
                  <span className="spinner-border spinner-border-sm me-2" />Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body text-center">
            <div className="mx-auto mb-2 rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
              🔔
            </div>
            <div className="fw-semibold">No alerts yet</div>
            <div className="text-muted small">When announcements are posted, they’ll appear here.</div>
            <button onClick={load} className="btn btn-outline-secondary btn-sm mt-3">Refresh</button>
          </div>
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {items.map((a) => (
            <AlertCard key={a.id} alert={a} canManage={canManage} onDelete={() => deleteAlert(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert, canManage, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const createdAt = new Date(alert.createdAt);
  const body = String(alert.body || "");
  const tooLong = body.length > 260;
  const displayBody = expanded || !tooLong ? body : body.slice(0, 260) + "…";

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-start gap-3">
          <Avatar name={alert.createdByName} />
          <div className="flex-grow-1">
            <div className="d-flex align-items-start justify-content-between gap-2">
              <div className="min-w-0">
                <div className="fw-semibold text-truncate">{alert.title}</div>
                <div className="small text-muted">
                  By {alert.createdByName || "Unknown"} • {formatRelativeTime(createdAt)}
                  {alert.classCode && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="badge text-bg-light border">{alert.classCode}</span>
                    </>
                  )}
                </div>
              </div>
              {canManage && (
                <button onClick={onDelete} className="btn btn-outline-danger btn-sm">Delete</button>
              )}
            </div>

            <p className="mt-2 mb-0 text-break" style={{ whiteSpace: 'pre-wrap' }}>{displayBody}</p>
            {tooLong && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="btn btn-link btn-sm ps-0"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="d-flex flex-column gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex align-items-start gap-3 placeholder-glow">
              <div className="rounded-circle bg-secondary-subtle" style={{ width: 40, height: 40 }} />
              <div className="flex-grow-1">
                <div className="placeholder col-4"></div>
                <div className="placeholder col-2 mt-2"></div>
                <div className="placeholder col-12 mt-3"></div>
                <div className="placeholder col-10 mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Avatar({ name = "?" }) {
  const initials = useMemo(() => (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join("") || "?", [name]);
  return (
    <div
      className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
      style={{ width: 40, height: 40, fontSize: 12 }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function formatRelativeTime(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const map = [
    [60 * 1000, 1000, "second"], // < 1 min
    [60 * 60 * 1000, 60 * 1000, "minute"], // < 1 hr
    [24 * 60 * 60 * 1000, 60 * 60 * 1000, "hour"], // < 1 day
    [7 * 24 * 60 * 60 * 1000, 24 * 60 * 60 * 1000, "day"], // < 1 wk
    [30 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000, "week"], // < ~1 mo
    [365 * 24 * 60 * 60 * 1000, 30 * 24 * 60 * 60 * 1000, "month"], // < ~1 yr
  ];
  for (const [limit, unitMs, unit] of map) {
    if (abs < limit) return rtf.format(Math.round(diffMs / unitMs), unit);
  }
  return rtf.format(Math.round(diffMs / (365 * 24 * 60 * 60 * 1000)), "year");
}

async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}
