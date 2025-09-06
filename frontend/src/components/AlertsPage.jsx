import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyAlerts, selectAlerts, selectAlertsStatus, selectAlertsError } from "../store/slices/alertsSlice";
import Header from "./Header";

/**
 * AlertsPage – Bootstrap-only premium UI/UX
 * - Polished header card with count + refresh
 * - Search (title/body), class filter, sort (newest/oldest)
 * - Loading skeletons (Bootstrap placeholders)
 * - Error card with retry
 * - Friendly empty state
 * - Alert cards with avatar initials, class badge, relative time, Read more/less
 */

export default function AlertsPage() {
  const dispatch = useDispatch();
  const items  = useSelector(selectAlerts);
  const status = useSelector(selectAlertsStatus);
  const error  = useSelector(selectAlertsError);

  const [q, setQ] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [expanded, setExpanded] = useState(() => new Set()); // ids expanded

  useEffect(() => { dispatch(fetchMyAlerts()); }, [dispatch]);

  const classOptions = useMemo(() => {
    const set = new Set((items || []).map(a => a.classCode).filter(Boolean));
    return ["all", ...Array.from(set).sort((a,b)=>String(a).localeCompare(String(b)))];
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let arr = Array.isArray(items) ? [...items] : [];
    if (needle) {
      arr = arr.filter(a =>
        String(a.title || "").toLowerCase().includes(needle) ||
        String(a.body  || "").toLowerCase().includes(needle) ||
        String(a.createdByName || "").toLowerCase().includes(needle)
      );
    }
    if (classFilter !== "all") arr = arr.filter(a => a.classCode === classFilter);
    arr.sort((x, y) => {
      const dx = new Date(x.createdAt).getTime() || 0;
      const dy = new Date(y.createdAt).getTime() || 0;
      return sort === "newest" ? dy - dx : dx - dy;
    });
    return arr;
  }, [items, q, classFilter, sort]);

  function toggleExpanded(id) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const countLabel = `${filtered.length} alert${filtered.length === 1 ? "" : "s"}`;

  return (
    <>
      <Header />

      {/* Header card with controls */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
            <div>
              <h4 className="mb-1">Your Alerts</h4>
              <div className="text-muted small">Announcements from your classes.</div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge text-bg-light border">{countLabel}</span>
              <button
                onClick={() => dispatch(fetchMyAlerts())}
                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center"
                disabled={status === "loading"}
              >
                {status === "loading" && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="row g-2 mt-3">
            <div className="col-12 col-md-6">
              <div className="input-group">
                <span className="input-group-text">🔎</span>
                <input
                  className="form-control"
                  placeholder="Search title, message, author…"
                  value={q}
                  onChange={(e)=>setQ(e.target.value)}
                />
                {!!q && (
                  <button className="btn btn-outline-secondary" onClick={()=>setQ("")}>Clear</button>
                )}
              </div>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={classFilter} onChange={(e)=>setClassFilter(e.target.value)}>
                {classOptions.map(opt => <option key={opt} value={opt}>{opt === "all" ? "All classes" : opt}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={sort} onChange={(e)=>setSort(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* States */}
      {status === "loading" && <SkeletonList />}

      {status === "failed" && (
        <div className="card border-danger-subtle mb-3">
          <div className="card-body">
            <div className="d-flex">
              <div className="me-3 text-danger">⚠️</div>
              <div className="flex-grow-1">
                <div className="fw-semibold">Couldn't load alerts</div>
                <div className="text-danger small mb-2">{error || "Something went wrong."}</div>
                <button onClick={()=>dispatch(fetchMyAlerts())} className="btn btn-danger btn-sm">
                  <span className="spinner-border spinner-border-sm me-2" />Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {status === "succeeded" && filtered.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center">
            <div className="mx-auto mb-2 rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
              🔔
            </div>
            <div className="fw-semibold">No alerts match your filters</div>
            <div className="text-muted small">Try clearing the search or changing class/sort.</div>
            <div className="mt-3 d-flex justify-content-center gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={()=>{ setQ(""); setClassFilter("all"); setSort("newest"); }}>Clear filters</button>
              <button className="btn btn-outline-primary btn-sm" onClick={()=>dispatch(fetchMyAlerts())}>Refresh</button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {status === "succeeded" && filtered.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {filtered.map(a => (
            <AlertCard
              key={a.id}
              alert={a}
              expanded={expanded.has(a.id)}
              onToggle={() => toggleExpanded(a.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function AlertCard({ alert, expanded, onToggle }) {
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
            </div>

            <p className="mt-2 mb-0 text-break" style={{ whiteSpace: 'pre-wrap' }}>{displayBody}</p>
            {tooLong && (
              <button onClick={onToggle} className="btn btn-link btn-sm ps-0">
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
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join("") || "?";
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
    [60 * 1000, 1000, "second"],
    [60 * 60 * 1000, 60 * 1000, "minute"],
    [24 * 60 * 60 * 1000, 60 * 60 * 1000, "hour"],
    [7 * 24 * 60 * 60 * 1000, 24 * 60 * 60 * 1000, "day"],
    [30 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000, "week"],
    [365 * 24 * 60 * 60 * 1000, 30 * 24 * 60 * 60 * 1000, "month"],
  ];
  for (const [limit, unitMs, unit] of map) {
    if (abs < limit) return rtf.format(Math.round(diffMs / unitMs), unit);
  }
  return rtf.format(Math.round(diffMs / (365 * 24 * 60 * 60 * 1000)), "year");
}
