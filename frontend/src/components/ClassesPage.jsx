// src/pages/ClassesPage.jsx
// Bootstrap-only ✨ ultra-stylish classes listing
// - Gradient hero + glass heading card
// - Search + status filter (client-side)
// - Beautiful card grid with code/status chips & delete button
// - Polished skeletons, empty + error states
// Requires only Bootstrap CSS (optional Bootstrap Icons for nicer visuals)
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Header from "./Header";
import {
  fetchMyClasses,
  selectClasses,
  selectClassesStatus,
  selectClassesError,
} from "../store/slices/classesSlice";
import AddClassButton from "./AddClassButton";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function ClassesPage() {
  const dispatch = useDispatch();
  const role = useSelector((s) => s.user?.role) || localStorage.getItem("role");
  const userEmail = useSelector((s) => s.user?.email) || localStorage.getItem("email");

  const items = useSelector(selectClasses);
  const status = useSelector(selectClassesStatus);
  const error = useSelector(selectClassesError);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const isAdmin = (role || "").toString().toLowerCase() === "admin";

  useEffect(() => {
    dispatch(fetchMyClasses());
  }, [dispatch]);

  function canDelete(c) {
    const createdByEmail = c?.createdByEmail || c?.ownerEmail || c?.createdBy?.email;
    const myRole = role || localStorage.getItem("role");
    const isOwner = createdByEmail && userEmail && createdByEmail === userEmail;
    const isInstructor = (myRole || "").toString().toUpperCase() === "INSTRUCTOR" || (myRole || "").toString().toLowerCase() === "admin";
    return isAdmin || isOwner || isInstructor;
  }

  async function handleDelete(classId) {
    if (!userEmail) return alert("Missing owner email");
    if (!confirm("Delete this class? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/classes/${classId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerEmail: userEmail }),
      });
      if (!res.ok) throw new Error((await res.text()) || res.statusText);
      dispatch(fetchMyClasses());
    } catch (e) {
      alert(e.message || "Failed to delete class");
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || []).filter((c) => {
      const title = (c.title || c.name || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      const code = (c.code || "").toLowerCase();
      const st = (c.status || "").toString().toLowerCase();
      const matchQ = !q || title.includes(q) || desc.includes(q) || code.includes(q);
      const matchS = statusFilter === "all" || st === statusFilter;
      return matchQ && matchS;
    });
  }, [items, query, statusFilter]);

  return (
    <>
      <style>{`
        .cls-hero-bg{position:fixed;inset:0;z-index:-1;background:
          radial-gradient(1200px 600px at 0% 0%, rgba(13,110,253,.10), transparent 60%),
          radial-gradient(900px 450px at 100% 0%, rgba(111,66,193,.10), transparent 60%),
          radial-gradient(1000px 500px at 0% 100%, rgba(214,51,132,.08), transparent 60%),
          linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);} 
        .glass-card{background:rgba(255,255,255,.78);backdrop-filter:saturate(140%) blur(10px);-webkit-backdrop-filter:saturate(140%) blur(10px);border:1px solid rgba(0,0,0,.06);} 
        .btn-gradient{background-image:linear-gradient(135deg,#0d6efd 0%,#6f42c1 60%,#d63384 100%);color:#fff;border:0;} 
        .btn-gradient:hover{filter:brightness(1.05);} 
        .chip{border-radius:999px;padding:.25rem .6rem;font-size:.78rem;} 
        .chip-code{background:#0b1220;color:#e5e7eb;} 
        .chip-status{background:#eef2ff;color:#3730a3;border:1px solid rgba(55,48,163,.18);} 
        .chip-status.ok{background:#ecfdf5;color:#065f46;border-color:rgba(6,95,70,.18);} 
        .chip-status.warn{background:#fff7ed;color:#9a3412;border-color:rgba(154,52,18,.18);} 
        .card-hover{transition:transform .18s ease, box-shadow .18s ease;} 
        .card-hover:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(16,24,40,.12);} 
        .skel{position:relative;overflow:hidden;background:#f1f5f9;border-radius:12px;} 
        .skel::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent);animation:shine 1.1s infinite;} 
        .skel.h40{height:40px;} .skel.h18{height:18px;} .skel.h80{height:80px;} 
        @keyframes shine{100%{transform:translateX(100%);}} 
      `}</style>

      <div className="cls-hero-bg" />

      <Header />

      <div className="container py-4 py-md-5">
        {/* Hero / Heading */}
        <div className="card glass-card border-0 rounded-4 shadow-lg mb-4">
          <div className="card-body p-3 p-md-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <div className="badge text-bg-primary bg-gradient px-3 py-2 rounded-pill mb-2">LearnSpace</div>
                <h3 className="mb-0 fw-semibold">Your Classes</h3>
                <small className="text-secondary">Manage, teach, and track progress — all in one place.</small>
              </div>
              {isAdmin && (
                <div>
                  <AddClassButton onCreated={() => dispatch(fetchMyClasses())} />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="row g-2 mt-3">
              <div className="col-md-7">
                <div className="input-group">
                  <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-search" /></span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by title, description, or code…"
                    value={query}
                    onChange={(e)=>setQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-body-tertiary border-end-0"><i className="bi bi-funnel" /></span>
                  <select className="form-select border-start-0" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="published">Published</option>
                    <option value="live">Live</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="col-md-2 d-grid">
                <button className="btn btn-outline-secondary" onClick={()=>{setQuery("");setStatusFilter("all");}}>Reset</button>
              </div>
            </div>
          </div>
        </div>

        {/* States */}
        {status === "loading" && (
          <div className="row g-3 g-md-4">
            {Array.from({length:6}).map((_,i)=> (
              <div className="col-12 col-md-6 col-lg-4" key={i}>
                <div className="card border-0 rounded-4 shadow-sm p-3 card-hover">
                  <div className="skel h40 mb-2" />
                  <div className="skel h18 mb-2" />
                  <div className="skel h18 w-75" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "failed" && (
          <div className="alert alert-danger shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle me-1" /> {error || "Failed to load classes"}
          </div>
        )}

        {status === "succeeded" && (
          filtered.length === 0 ? (
            <div className="card border-0 rounded-4 shadow-sm">
              <div className="card-body p-5 text-center text-secondary">
                <div className="mb-2"><i className="bi bi-collection fs-3 opacity-75" /></div>
                <h5 className="mb-1">No classes found</h5>
                <p className="mb-3">Try adjusting your search or status filter.</p>
                {isAdmin && <AddClassButton onCreated={() => dispatch(fetchMyClasses())} />}
              </div>
            </div>
          ) : (
            <div className="row g-3 g-md-4">
              {filtered.map((c) => {
                const title = c.title ?? c.name ?? "Untitled";
                const desc = c.description || "";
                const code = c.code || "—";
                const stRaw = (c.status || "").toString().toLowerCase();
                const tone = /active|open|published|live/.test(stRaw) ? "ok" : /archiv|closed|inactive/.test(stRaw) ? "warn" : "";
                return (
                  <div className="col-12 col-md-6 col-lg-4" key={c.id}>
                    <Link to={`/classes/${c.id}`} className="text-decoration-none">
                      <div className="card border-0 rounded-4 shadow-sm h-100 card-hover">
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex align-items-start justify-content-between gap-2">
                            <h5 className="mb-1 text-dark">{title}</h5>
                            {canDelete(c) && (
                              <button
                                onClick={(e)=>{e.preventDefault(); e.stopPropagation(); handleDelete(c.id);} }
                                className="btn btn-sm btn-outline-danger"
                                title="Delete class"
                              >
                                <i className="bi bi-trash" />
                              </button>
                            )}
                          </div>
                          {desc && <p className="text-secondary mb-2" style={{minHeight:48, overflow:"hidden", display:"-webkit-box", WebkitBoxOrient:"vertical", WebkitLineClamp:3}}>{desc}</p>}

                          <div className="mt-auto d-flex flex-wrap gap-2">
                            <span className="chip chip-code">Code: {code}</span>
                            <span className={`chip chip-status ${tone}`}>Status: {c.status ?? "—"}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </>
  );
}
