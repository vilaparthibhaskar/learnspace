// src/pages/class/ClassHome.jsx
// Ultra-stylish, Bootstrap-only Class Home
// - Gradient hero with glass overlay
// - Copyable class code, status pill
// - Stats grid + quick actions
// - Polished skeletons
// No extra dependencies (optional: Bootstrap Icons in index.html)
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

import React, { useMemo, useState } from "react";
import { useOutletContext, NavLink } from "react-router-dom";

export default function ClassHome() {
  const outlet = (typeof useOutletContext === "function" ? useOutletContext() : {}) || {};
  const { cls, classId } = outlet;

  if (!cls) return <SkeletonCard />;

  const title = cls.title ?? cls.name ?? "Untitled Class";
  const code = cls.code ?? "—";
  const rawStatus = (cls.status ?? "draft").toString().toLowerCase();
  const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
  const instructor =
    cls.instructorName ?? cls.ownerName ?? cls.owner?.name ?? cls.createdBy ?? null;

  const createdAt = useMemo(() => {
    if (!cls.createdAt) return null;
    const d = new Date(cls.createdAt);
    return isNaN(d) ? null : d.toLocaleString();
  }, [cls?.createdAt]);

  const studentCount = cls.studentCount ?? (Array.isArray(cls.members) ? cls.members.length : null);
  const assignmentCount = cls.assignmentCount ?? null;
  const submissionCount = cls.submissionCount ?? null;

  return (
    <div className="ch-card card rounded-4 border-0 shadow-lg overflow-hidden">
      <div className="ch-hero position-relative">
        <div className="ch-hero-bg" />
        <div className="position-relative p-4 p-md-5">
          <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3 mb-2">
            <h2 className="ch-title mb-0" title={title}>{title}</h2>
            <StatusPill status={status} />
          </div>

          <div className="ch-meta">
            <CopyableCode code={code} />
            <span className="ch-dot" aria-hidden>•</span>
            <span className="ch-meta-item" title="Instructor">
              <InlineIcon name="user" /> {instructor ?? "Instructor N/A"}
            </span>
            {createdAt && (
              <>
                <span className="ch-dot" aria-hidden>•</span>
                <span className="ch-meta-item" title="Created">
                  <InlineIcon name="clock" /> {createdAt}
                </span>
              </>
            )}
          </div>

          {/* Quick actions */}
          <div className="d-flex flex-wrap gap-2 mt-3">
            <NavLink to={`/classes/${classId}/members`} className="btn btn-outline-light btn-sm rounded-3 px-3">
              <i className="bi bi-people me-1" /> Members
            </NavLink>
            <NavLink to={`/classes/${classId}/assignments`} className="btn btn-outline-light btn-sm rounded-3 px-3">
              <i className="bi bi-journal-text me-1" /> Assignments
            </NavLink>
            <NavLink to={`/classes/${classId}/submissions`} className="btn btn-outline-light btn-sm rounded-3 px-3">
              <i className="bi bi-inbox me-1" /> Submissions
            </NavLink>
            <NavLink to={`/classes/${classId}/alerts`} className="btn btn-light btn-sm rounded-3 px-3">
              <i className="bi bi-megaphone me-1" /> Alerts
            </NavLink>
          </div>
        </div>
      </div>

      <div className="card-body ch-body">
        <Description text={cls.description} />

        {(studentCount ?? assignmentCount ?? submissionCount) != null && (
          <div className="ch-grid">
            {studentCount != null && (
              <MiniStat label="Students" value={studentCount} icon="users" />
            )}
            {assignmentCount != null && (
              <MiniStat label="Assignments" value={assignmentCount} icon="file" />
            )}
            {submissionCount != null && (
              <MiniStat label="Submissions" value={submissionCount} icon="inbox" />
            )}
          </div>
        )}
      </div>

      <style>{styles}</style>
    </div>
  );
}

/* ---------- Small Pieces ---------- */

function StatusPill({ status }) {
  const tone = /active|open|published|live/.test(status.toLowerCase())
    ? "ok"
    : /archiv|closed|inactive/.test(status.toLowerCase())
    ? "warn"
    : "neutral";
  return <span className={`ch-status ch-${tone}`}>{status}</span>;
}

function CopyableCode({ code }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }
  return (
    <span className="ch-meta-item">
      <InlineIcon name="hash" />
      <span className="ch-code">{code}</span>
      <button className="ch-copy-btn" onClick={copy} aria-label="Copy class code">
        {copied ? <InlineIcon name="check" /> : <InlineIcon name="copy" />}
      </button>
    </span>
  );
}

function Description({ text }) {
  const [expanded, setExpanded] = useState(false);
  const safe = (text ?? "").trim();
  const show = expanded || safe.length <= 260 ? safe : safe.slice(0, 260) + "…";
  return (
    <div className="mb-3">
      <h6 className="ch-section-title">About this class</h6>
      <p className="ch-desc">{show || "No description."}</p>
      {safe.length > 260 && (
        <button className="btn btn-sm ch-link-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function MiniStat({ label, value, icon }) {
  return (
    <div className="ch-stat">
      <div className="ch-stat-top">
        <InlineIcon name={icon} />
        <span className="ch-stat-value">{value}</span>
      </div>
      <div className="ch-stat-label">{label}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="ch-card card rounded-4 border-0 shadow-lg overflow-hidden">
      <div className="ch-hero position-relative">
        <div className="ch-hero-bg" />
        <div className="position-relative p-4 p-md-5">
          <div className="ch-skel title" />
          <div className="ch-skel row" />
        </div>
      </div>
      <div className="card-body ch-body">
        <div className="ch-skel para" />
        <div className="ch-skel para short" />
        <div className="ch-grid">
          <div className="ch-skel stat" />
          <div className="ch-skel stat" />
          <div className="ch-skel stat" />
        </div>
      </div>
      <style>{styles}</style>
    </div>
  );
}

function InlineIcon({ name }) {
  const paths = {
    user: "M12 12c2.8 0 5-2.2 5-5S14.8 2 12 2 7 4.2 7 7s2.2 5 5 5Zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6Z",
    clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5h-2v6l5 3 1-1.7-4-2.3V7Z",
    hash: "M9 3L8 9H3v2h4.7L7 21h2l.7-10H15l-.7 10h2l.7-10H21V9h-3.3L18 3h-2l-.7 6H9.7L10 3H9Z",
    copy: "M16 1H6C4.9 1 4 1.9 4 3v10h2V3h10V1Zm3 4H10c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2Zm0 14H10V7h9v12Z",
    check: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z",
    users: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm6 8v-1a5 5 0 0 0-10 0v1h10Zm-12 0v-1a6.9 6.9 0 0 1 1.1-3.7A5 5 0 0 0 2 18v2h4Zm16 0v-2a5 5 0 0 0-5.1-4.7A6.9 6.9 0 0 1 18 19v1h4Z",
    file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12V8l-4-6Zm0 2 3 4h-3V4Z",
    inbox: "M20 3H4a2 2 0 0 0-2 2v14h6v-2H4l3-5h6l3 5h-2v2h6V5a2 2 0 0 0-2-2Z",
  };
  return (
    <svg className="ch-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path d={paths[name] || ""}></path>
    </svg>
  );
}

/* ---------- Styles ---------- */

const styles = `
.ch-card { background:#fff; }

.ch-hero { background: transparent; }

.ch-hero-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(1200px 260px at -10% -80%, rgba(13,110,253,0.12), transparent 60%),
    radial-gradient(800px 220px at 110% -70%, rgba(32,201,151,0.12), transparent 60%),
    radial-gradient(900px 260px at 0% 120%, rgba(255,193,7,0.12), transparent 60%),
    linear-gradient(180deg, rgba(2,6,23,0.03), rgba(2,6,23,0.01));
}

.ch-title { font-size: 1.5rem; font-weight: 800; letter-spacing:.2px; }

.ch-status {
  padding: 4px 10px; border-radius: 999px; font-size: .78rem; font-weight: 700; letter-spacing: .2px;
  background:#eef2ff; color:#3730a3; border:1px solid rgba(55,48,163,.15);
}
.ch-ok { background:#ecfdf5; color:#065f46; border-color: rgba(6,95,70,.18); }
.ch-warn { background:#fff7ed; color:#9a3412; border-color: rgba(154,52,18,.18); }
.ch-neutral { background:#eef2ff; color:#3730a3; border-color: rgba(55,48,163,.15); }

.ch-meta { margin-top:8px; display:flex; align-items:center; gap:10px; color:#64748b; font-size:.95rem; flex-wrap:wrap; }
.ch-dot { opacity:.5; }
.ch-meta-item { display:inline-flex; align-items:center; gap:6px; }

.ch-code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background:#0b1220; color:#e5e7eb; padding:2px 8px; border-radius:8px; font-size:.88rem; }

.ch-copy-btn { appearance:none; border:none; background:transparent; padding:2px 4px; cursor:pointer; border-radius:6px; transition: background .15s ease; }
.ch-copy-btn:hover { background: rgba(2,6,23,.06); }

.ch-icon { fill: currentColor; opacity:.9; }

.ch-body { padding: 18px 20px 20px; }

.ch-section-title { margin:0 0 6px; font-weight:800; color:#0f172a; letter-spacing:.2px; }
.ch-desc { margin:0 0 6px; color:#1f2937; white-space:pre-wrap; }

.ch-link-btn { color:#4f46e5; background:transparent; border:1px solid rgba(79,70,229,.18); border-radius:10px; padding:6px 10px; }
.ch-link-btn:hover { background: rgba(79,70,229,.06); }

.ch-grid { margin-top:12px; display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:12px; }
@media (max-width: 720px) { .ch-grid { grid-template-columns: 1fr; } }

.ch-stat { border:1px solid rgba(2,6,23,.08); border-radius:14px; padding:12px 14px; background:#fff; }
.ch-stat-top { display:flex; align-items:center; gap:8px; color:#0f172a; }
.ch-stat-value { font-size:1.1rem; font-weight:800; }
.ch-stat-label { color:#475569; font-size:.86rem; margin-top:4px; }

/* Skeletons */
.ch-skel { position:relative; overflow:hidden; background:#f1f5f9; border-radius:10px; }
.ch-skel::after { content:""; position:absolute; inset:0; transform:translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent); animation: ch-shine 1.15s infinite; }
.ch-skel.title { width: 60%; height: 20px; margin: 6px 0; }
.ch-skel.row { width: 48%; height: 16px; margin-top: 8px; }
.ch-skel.para { width: 100%; height: 14px; margin: 8px 0; }
.ch-skel.para.short { width: 70%; }
.ch-skel.stat { width: 100%; height: 58px; }

@keyframes ch-shine { 100% { transform: translateX(100%); } }
`;
