// src/pages/HomePage.jsx
// Ultra-stylish Bootstrap-only home with colorful background, glass card, and a warm greeting.
// Matches the visual language used in your Login/Signup premium UIs.

import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import Header from "./Header";

export default function HomePage() {
  const { name } = useSelector((state) => state.user);
  const displayName = name && name.trim() ? name.trim() : "Guest";

  return (
    <>
      <style>{`
        .home-hero-bg { position: fixed; inset: 0; z-index: -1; background:
          radial-gradient(1200px 600px at 0% 0%, rgba(13,110,253,.12), transparent 60%),
          radial-gradient(900px 450px at 100% 0%, rgba(32,201,151,.12), transparent 60%),
          radial-gradient(1000px 500px at 0% 100%, rgba(255,193,7,.12), transparent 60%),
          radial-gradient(1100px 550px at 100% 100%, rgba(214,51,132,.12), transparent 60%),
          linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%); }
        .glass-card { background: rgba(255,255,255,0.75); backdrop-filter: saturate(140%) blur(10px); -webkit-backdrop-filter: saturate(140%) blur(10px); border: 1px solid rgba(0,0,0,0.06); }
        .btn-gradient { background-image: linear-gradient(135deg,#0d6efd 0%,#20c997 40%,#ffc107 70%,#d63384 100%); color:#fff; border:0; }
        .btn-gradient:hover { filter: brightness(1.06); }
        @keyframes rise { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
        .rise { animation: rise .45s ease-out both; }
        .rise-delay { animation: rise .6s ease-out both .08s; }
      `}</style>

      <div className="home-hero-bg" />

      <Header />

      <div className="container py-5 d-flex align-items-center" style={{ minHeight: "80vh" }}>
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-10 col-xxl-8">
            <div className="card glass-card shadow-lg rounded-4 border-0">
              <div className="card-body p-4 p-md-5 text-center">
                <div className="mb-3 rise">
                  <div className="badge text-bg-primary bg-gradient px-3 py-2 rounded-pill">LearnSpace</div>
                </div>
                <h1 className="fw-semibold mb-2 rise">Hi {displayName} 👋</h1>
                <p className="lead text-secondary rise-delay mb-4">
                  Welcome to <strong>LearnSpace</strong> — an education platform where instructors manage classes & assignments, and students submit work and track progress.
                </p>

                <div className="d-flex gap-2 justify-content-center rise-delay">
                  <NavLink to="/classes" className="btn btn-gradient btn-lg">
                    Go to Classes
                  </NavLink>
                  <NavLink to="/submissions" className="btn btn-outline-secondary btn-lg">
                    View Submissions
                  </NavLink>
                </div>
              </div>
            </div>

            <div className="row g-3 g-md-4 mt-3">
              <div className="col-md-4">
                <div className="card shadow-sm rounded-4 border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge rounded-pill text-bg-info">Fast</span>
                    </div>
                    <h6 className="mb-1">Stay organized</h6>
                    <p className="text-secondary small mb-0">Centralize your classes, assignments, and submissions in one place.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-sm rounded-4 border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge rounded-pill text-bg-warning">Simple</span>
                    </div>
                    <h6 className="mb-1">Teach & learn faster</h6>
                    <p className="text-secondary small mb-0">Publish assignments, grade submissions, and get instant feedback.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-sm rounded-4 border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge rounded-pill text-bg-success">Secure</span>
                    </div>
                    <h6 className="mb-1">Safe & reliable</h6>
                    <p className="text-secondary small mb-0">Role‑based access ensures admins, instructors, and students see what matters.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
