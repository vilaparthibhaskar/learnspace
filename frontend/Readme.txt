LearnSpace — Frontend (React) README

Purpose: This document is the KT (knowledge transfer) guide for the LearnSpace frontend. It explains the tech stack, local setup, configuration, app architecture, common workflows, and troubleshooting so any new engineer can be productive quickly.

--------------------------------------------------------------------

Overview
LearnSpace is a full‑stack class & assignment platform. The frontend is a React single‑page app (SPA) built with Vite, React Router, and Redux Toolkit. It talks to a Spring Boot backend over REST with JWT Bearer auth.

Core capabilities (UI):
- Authenticated experience with role‑based UI (Admin / Instructor / Student)
- Classes list & details; join/create via code
- Assignments: publish, view, submit, grade status
- Submissions: upload, status, feedback & points
- Alerts (class announcements), pinning & read states
- Profile: view/edit basic user info

--------------------------------------------------------------------

Tech Stack
- Language: JavaScript (ES202x)
- Build Tool: Vite (dev server & production build)
- Framework: React 18+
- Routing: React Router
- State: Redux Toolkit (slices: user, classes, assignments, submissions, alerts)
- UI: HTML5/CSS3 + Bootstrap utility classes
- HTTP: fetch with Authorization: Bearer <token> header
- Env Config: Vite import.meta.env.* (e.g., VITE_API_BASE)
- Testing (optional): Vitest + React Testing Library (add as needed)
- Lint/Format (optional): ESLint + Prettier (recommended)

--------------------------------------------------------------------

Prerequisites
- Node.js 18 or 20 (LTS recommended)
- npm 9+ (or pnpm/yarn, adapt scripts accordingly)
- Backend API running locally at http://localhost:8080 or a reachable environment URL

--------------------------------------------------------------------

Configuration
Create .env files at the project root. Vite exposes variables prefixed with VITE_.

.env.example
------------------------------------------------------------
# Base URL of the backend REST API
VITE_API_BASE=http://localhost:8080

# Optional: storage key names (defaults shown)
VITE_AUTH_TOKEN_KEY=accessToken
VITE_APP_NAME=LearnSpace
------------------------------------------------------------

The code typically falls back to http://localhost:8080 if VITE_API_BASE is not provided. Example usage in code:
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

LocalStorage keys used by UI (read/updated on profile & session):
- accessToken (JWT string)
- name, email, phoneNumber, address, role

--------------------------------------------------------------------

Getting Started (Local Dev)
1) Clone the repository and cd into the frontend folder.
2) Install deps:
   npm install
3) Configure env:
   cp .env.example .env
   # Edit .env if your backend isn’t on http://localhost:8080
4) Run dev server:
   npm run dev
   # Vite prints a local URL (usually http://localhost:5173)
5) Smoke test:
   - Open the app, log in, confirm you can see classes.
   - Try creating a class (if your role permits) and refresh to verify state persistence.

Build & Preview (production bundle):
   npm run build
   npm run preview

--------------------------------------------------------------------

Project Structure (reference)
frontend/
├─ public/                      # static assets served as-is
├─ src/
│  ├─ api/
│  │  └─ http.js               # (optional) fetch wrapper & helpers
│  ├─ components/
│  │  ├─ Header.jsx
│  │  ├─ AddClassButton.jsx
│  │  └─ ...
│  ├─ pages/
│  │  ├─ HomePage.jsx
│  │  ├─ AlertsPage.jsx
│  │  ├─ ProfilePage.jsx
│  │  ├─ ClassDetailPage.jsx
│  │  └─ AssignmentDetailPage.jsx
│  ├─ store/
│  │  ├─ index.js               # store setup
│  │  └─ slices/
│  │     ├─ userSlice.js
│  │     ├─ alertsSlice.js
│  │     ├─ classesSlice.js
│  │     ├─ assignmentsSlice.js
│  │     └─ submissionsSlice.js
│  ├─ router.jsx                # React Router config
│  ├─ App.jsx
│  ├─ main.jsx
│  ├─ styles/
│  │  └─ global.css
│  └─ assets/
├─ .env.example
├─ index.html
├─ package.json
└─ vite.config.js

--------------------------------------------------------------------

Authentication Flow
- Login obtains a JWT from the backend and stores it in localStorage under accessToken (or VITE_AUTH_TOKEN_KEY).
- All authenticated API calls include Authorization: Bearer <token>.
- On 401/403, app clears the token and redirects to the login route.
- Basic user info (name, email, role, etc.) is mirrored in Redux + localStorage for refresh resilience (e.g., ProfilePage).

Example (fetch helper):
------------------------------------------------------------
export async function apiFetch(path, options = {}) {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
  const tokenKey = import.meta.env.VITE_AUTH_TOKEN_KEY || "accessToken";
  const token = localStorage.getItem(tokenKey);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem(tokenKey);
    window.location.assign("/login");
    return Promise.reject(new Error("Unauthorized"));
  }

  return res;
}
------------------------------------------------------------

--------------------------------------------------------------------

Routing
Typical routes (examples):
- /login, /register
- / (dashboard/home)
- /classes , /classes/:id
- /assignments/:id
- /alerts
- /profile

Guarded routes should check the presence of a token and (optionally) the user role.

--------------------------------------------------------------------

Redux Slices (Data & UI State)
- userSlice: identity, role, profile fields; actions to update profile and cache in localStorage.
- classesSlice: list, details, create/join class (e.g., AddClassButton).
- assignmentsSlice: fetch/publish assignments, attach to class.
- submissionsSlice: upload/grade status.
- alertsSlice: class announcements; selectors for items, status, error (see AlertsPage).

Pattern: status = idle | loading | succeeded | failed; error string for UI.

--------------------------------------------------------------------

API Conventions (consumed)
- All endpoints are under ${VITE_API_BASE}/api/...
- Common examples used by the UI:
  - POST /api/auth/login
  - GET  /api/classes , POST /api/classes , GET /api/classes/:id
  - GET  /api/assignments?classId=... , POST /api/assignments
  - GET  /api/submissions?assignmentId=... , POST /api/submissions
  - GET  /api/alerts?classId=... , POST /api/alerts

Exact payloads are defined by the backend; inspect Network tab or backend DTOs when wiring new UI.

--------------------------------------------------------------------

Scripts (package.json typical)
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint --ext .jsx,.js src",
    "test": "vitest"
  }
}
Note: If ESLint/Vitest are not yet installed, you can add them later. The app runs fine with just dev/build/preview.

--------------------------------------------------------------------

Common KT Tasks
1) Add a new page/route
   - Create src/pages/MyPage.jsx.
   - Add route in router.jsx.
   - Link it from Header.jsx nav.

2) Add a new Redux slice
   - Create src/store/slices/mySlice.js with createSlice.
   - Register reducer in src/store/index.js.
   - Use in components via useSelector + useDispatch.

3) Call a secured API
   - Import apiFetch.
   - await apiFetch('/api/xyz', { method: 'GET' });
   - Handle status and error in slice for UI feedback.

4) Add a form dialog (modal)
   - Use local useState for dialog visibility & form data.
   - Validate required fields; show inline errors.
   - On submit, call API; on success, close dialog and refresh list.

--------------------------------------------------------------------

UI Guidelines
- Prefer simple, accessible HTML + Bootstrap utilities.
- Keep forms keyboard‑navigable; label inputs properly.
- Use toasts or inline messages for errors/success.
- Keep lists virtualized only if needed; otherwise paginate.

--------------------------------------------------------------------

Deployment
- npm run build produces static assets in dist/.
- Host on any static server (Nginx, S3+CloudFront, GitHub Pages, Netlify, Vercel).
- Important: set VITE_API_BASE appropriately at build time for the target environment.
- Ensure backend CORS allows the frontend origin.

Nginx example:
location / {
  try_files $uri /index.html;
}

--------------------------------------------------------------------

Troubleshooting
- CORS error: make sure backend allows your dev origin (http://localhost:5173) and methods/headers (Authorization, Content-Type).
- 401/403: token missing/expired; check localStorage.accessToken, re-login.
- Env not applied: Vite reads env at build time; restart npm run dev after changes.
- Port busy: change Vite port in vite.config.js or stop the other process.
- Network 400/500: open DevTools > Network; inspect payload; check backend logs.

--------------------------------------------------------------------

Contributing Workflow
1) Create a feature branch: feat/<short-name>.
2) Commit with clear messages (e.g., Conventional Commits).
3) Open a PR; include screenshots for UI changes.
4) Keep PRs small and focused; add/update KT notes when relevant.

--------------------------------------------------------------------

License
Internal/Personal project. Update if you plan to open‑source.

--------------------------------------------------------------------

Quick Reference
- Dev server: npm run dev → http://localhost:5173
- API base: .env → VITE_API_BASE
- Auth token storage: localStorage.accessToken (configurable)
- Key files: src/store/*, src/pages/*, src/components/*
- Flow to add a feature: route & slice → wire API → add UI → update KT
