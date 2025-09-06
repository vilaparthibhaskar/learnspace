// src/pages/SubmissionsPage.jsx
// Bootstrap-only ✨ premium UI for submissions — with robust scrolling
// - Colorful background + glass hero card
// - Quick stats (total / graded / pending), client-side search & filters
// - Polished, responsive table with sticky header and status badges
// - NEW: Dedicated scroll container with sticky header that works everywhere
// - Safety: ensure body scroll isn't locked by stray modals
// - Optional: Bootstrap Icons
//   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import {
  fetchMySubmissions,
  selectSubmissions,
  selectSubmissionsStatus,
  selectSubmissionsError,
} from "../store/slices/submissionsSlice";

export default function SubmissionsPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectSubmissions) || [];
  const status = useSelector(selectSubmissionsStatus);
  const error = useSelector(selectSubmissionsError);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dateDesc");

  useEffect(() => {
    // kick off load
    dispatch(fetchMySubmissions());
    // 🔒 safety: if a previous modal left body locked, unlock it here
    document.body.classList.remove("modal-open");
  }, [dispatch]);

  const stats = useMemo(() => {
    const total = items.length;
    const graded = items.filter((s) => isGraded(s.status)).length;
    const pending = items.filter((s) => !isGraded(s.status)).length;
    const points = items.map((s) => Number(s.gradePoints)).filter((n) => !Number.isNaN(n));
    const avg = points.length ? points.reduce((a, b) => a + b, 0) / points.length : null;
    return { total, graded, pending, avg };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const subset = items.filter((s) => {
      const matchQ =
        !q ||
        (s.classTitle || s.classCode || "").toLowerCase().includes(q) ||
        (s.assignmentTitle || "").toLowerCase().includes(q);
      const st = (s.status || "").toString().toLowerCase();
      const matchS = statusFilter === "all" || st === statusFilter;
      return matchQ && matchS;
    });

    const sorted = [...subset].sort((a, b) => {
      const da = new Date(a.submittedAt).getTime() || 0;
      const db = new Date(b.submittedAt).getTime() || 0;
      const pa = Number(a.gradePoints);
      const pb = Number(b.gradePoints);
      switch (sortBy) {
        case "dateAsc":
          return da - db;
        case "pointsDesc":
          return (Number.isNaN(pb) ? -Infinity : pb) - (Number.isNaN(pa) ? -Infinity : pa);
        case "pointsAsc":
          return (Number.isNaN(pa) ? Infinity : pa) - (Number.isNaN(pb) ? Infinity : pb);
        default:
          return db - da; // dateDesc
      }
    });
    return sorted;
  }, [items, query, statusFilter, sortBy]);

  if (status === "loading")
    return (
      <>
        <Header />
        <StyleBlock />
        <div className="sub-hero-bg" />
        <div className="container py-4 py-md-5">
          <HeroCard loading stats={stats} />
          <div className="row g-3 g-md-4 mt-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="col-12" key={i}>
                <div className="card border-0 rounded-4 shadow-sm p-3">
                  <div className="skel h18 mb-2" />
                  <div className="skel h18 w-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );

  if (status === "failed")
    return (
      <>
        <Header />
        <StyleBlock />
        <div className="sub-hero-bg" />
        <div className="container py-4 py-md-5">
          <HeroCard stats={stats} />
          <div className="alert alert-danger shadow-sm mt-3" role="alert">
            <i className="bi bi-exclamation-triangle me-1" /> {error || "Failed to load submissions"}
          </div>
        </div>
      </>
    );

  if (!items?.length)
    return (
      <>
        <Header />
        <StyleBlock />
        <div className="sub-hero-bg" />
        <div className="container py-4 py-md-5">
          <HeroCard stats={stats} />
          <div className="card border-0 rounded-4 shadow-sm text-center p-5 mt-3">
            <div className="mb-2">
              <i className="bi bi-clipboard-check fs-3 opacity-75" />
            </div>
            <h5 className="mb-1">No submissions yet</h5>
            <p className="text-secondary mb-0">
              Your submissions will show up here once you start turning in assignments.
            </p>
          </div>
        </div>
      </>
    );

  return (
    <>
      <Header />
      <StyleBlock />
      <div className="sub-hero-bg" />

      <div className="container py-4 py-md-5">
        <HeroCard
          stats={stats}
          query={query}
          setQuery={setQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/*
          Scrolling fix:
          - We use a dedicated scroll container (.sub-table-scroll) with max-height
          - Sticky header applied via CSS (thead.sticky-head)
          - Removed overflow-hidden from card to avoid clipping
        */}
        <div className="card border-0 rounded-4 shadow-lg">
          <div className="sub-table-scroll">
            <table className="table align-middle mb-0 table-hover table-nowrap">
              <thead className="sticky-head">
                <tr>
                  <th>Class</th>
                  <th>Assignment</th>
                  <th>Status</th>
                  <th className="text-end">Points</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td className="fw-medium">{s.classTitle || s.classCode}</td>
                    <td>{s.assignmentTitle}</td>
                    <td>{renderStatusBadge(s.status)}</td>
                    <td className="text-end">{s.gradePoints ?? "-"}</td>
                    <td>{formatDate(s.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Pieces ---------- */

function HeroCard({ loading, stats, query, setQuery, statusFilter, setStatusFilter, sortBy, setSortBy, onExport }) {
  return (
    <div className="card glass-card border-0 rounded-4 shadow-lg">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap flex-md-nowrap">
          <div className="min-w-0">
            <div className="badge text-bg-primary bg-gradient px-3 py-2 rounded-pill mb-2">LearnSpace</div>
            <h3 className="mb-0 fw-semibold text-truncate">Your Submissions</h3>
            <small className="text-secondary d-none d-sm-inline">
              Track what you’ve turned in, what’s graded, and what’s pending.
            </small>
          </div>

          {/* {!loading && (
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={onExport}>
                <i className="bi bi-download me-1" /> Export CSV
              </button>
            </div>
          )} */}
        </div>

        {/* Stats & Controls */}
        <div className="row g-2 mt-3">
          {/* Stats */}
          <div className="col-12 col-lg-5">
            <div className="row g-2">
              <div className="col-4">
                <MiniStat label="Total" value={stats.total} tone="info" />
              </div>
              <div className="col-4">
                <MiniStat label="Graded" value={stats.graded} tone="success" />
              </div>
              <div className="col-4">
                <MiniStat label="Pending" value={stats.pending} tone="warning" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="col-12 col-lg-7">
            <div className="row g-2">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-body-tertiary border-end-0">
                    <i className="bi bi-search" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by class or assignment…"
                    value={query || ""}
                    onChange={(e) => setQuery?.(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter || "all"}
                  onChange={(e) => setStatusFilter?.(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="graded">Graded</option>
                  <option value="pending">Pending</option>
                  <option value="review">Review</option>
                  <option value="late">Late</option>
                  <option value="missing">Missing</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={sortBy || "dateDesc"}
                  onChange={(e) => setSortBy?.(e.target.value)}
                >
                  <option value="dateDesc">Newest</option>
                  <option value="dateAsc">Oldest</option>
                  <option value="pointsDesc">Points ↓</option>
                  <option value="pointsAsc">Points ↑</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone = "info" }) {
  const toneClass = {
    info: "bg-info bg-opacity-10 text-info border-info",
    success: "bg-success bg-opacity-10 text-success border-success",
    warning: "bg-warning bg-opacity-10 text-warning border-warning",
  }[tone] || "bg-body-secondary";
  return (
    <div className={`stat-tile rounded-3 border ${toneClass} px-3 py-2 h-100 d-flex flex-column justify-content-center`}>
      <div className="small text-secondary-emphasis">{label}</div>
      <div className="fs-5 fw-bold">{value ?? "-"}</div>
    </div>
  );
}

function renderStatusBadge(status) {
  const st = (status || "").toString().toLowerCase();
  const map = {
    graded: "success",
    submitted: "primary",
    review: "info",
    pending: "warning",
    late: "danger",
    missing: "secondary",
  };
  const color = map[st] || "secondary";
  const label = st ? st.charAt(0).toUpperCase() + st.slice(1) : "-";
  return <span className={`badge text-bg-${color}`}>{label}</span>;
}

function isGraded(status) {
  return (status || "").toString().toLowerCase() === "graded";
}

function safeStr(x) {
  return (x ?? "").toString().replaceAll("", " ");
}
function escapeCSV(val) {
  const s = String(val ?? "");
  if (/[",]/.test(s)) return '"' + s.replaceAll('"', '""') + '"';
  return s;
}
function formatDate(d) {
  const t = new Date(d);
  return isNaN(t) ? "-" : t.toLocaleString();
}

function StyleBlock() {
  return (
    <style>{`
      .sub-hero-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;background:
        radial-gradient(1200px 600px at 0% 0%, rgba(13,110,253,.10), transparent 60%),
        radial-gradient(900px 450px at 100% 0%, rgba(32,201,151,.10), transparent 60%),
        radial-gradient(1000px 500px at 0% 100%, rgba(214,51,132,.08), transparent 60%),
        linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);} 
      .glass-card{background:rgba(255,255,255,.78);backdrop-filter:saturate(140%) blur(10px);-webkit-backdrop-filter:saturate(140%) blur(10px);border:1px solid rgba(0,0,0,.06);} 
      .table-nowrap td, .table-nowrap th { white-space: nowrap; }
      .skel{position:relative;overflow:hidden;background:#f1f5f9;border-radius:12px;} 
      .skel::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent);animation:shine 1.1s infinite;} 
      .h18{height:18px;} 
      @keyframes shine{100%{transform:translateX(100%);}} 
      .stat-tile{border-width:1px;}
      /* New scroll container for the table */
      .sub-table-scroll{max-height:70vh; overflow:auto;}
      /* Sticky header inside that scroll area */
      .sticky-head{position:sticky; top:0; z-index:2; background:var(--bs-body-bg);} 
    `}</style>
  );
}
