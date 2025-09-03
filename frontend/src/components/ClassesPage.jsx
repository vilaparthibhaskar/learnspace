import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyClasses,
  selectClasses,
  selectClassesStatus,
  selectClassesError,
} from "../store/slices/classesSlice";
import Header from "./Header";
import AddClassButton from "./AddClassButton";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function ClassesPage() {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.user?.role) || localStorage.getItem("role");
  const userEmail =
    useSelector((state) => state.user?.email) || localStorage.getItem("email");

  const items = useSelector(selectClasses);
  const status = useSelector(selectClassesStatus);
  const error = useSelector(selectClassesError);

  useEffect(() => {
    dispatch(fetchMyClasses());
  }, [dispatch]);

  const isAdmin = role === "admin";

  function canDelete(c) {
    // these keys depend on what your DTO returns; keep any that apply
    const createdByEmail = c?.createdByEmail || c?.ownerEmail || c?.createdBy?.email;
    const myRole = role || localStorage.getItem("role");
    const isOwner = createdByEmail && userEmail && createdByEmail === userEmail;
    const isInstructor = myRole === "INSTRUCTOR" || myRole === "admin";
    return isAdmin || isOwner || isInstructor;
  }


  async function handleDelete(classId) {
    if (!userEmail) {
      alert("Missing owner email");
      return;
    }
    if (!confirm("Delete this class? This cannot be undone.")) return;

    try {
      const res = await fetch(`${API_BASE}/api/classes/${classId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerEmail: userEmail }), // backend checks owner
      });
      if (!res.ok) {
        const msg = (await res.text()) || res.statusText;
        throw new Error(msg);
      }
      // refetch after delete
      dispatch(fetchMyClasses());
    } catch (e) {
      alert(e.message || "Failed to delete class");
    }
  }


  return (
    <>
      <Header />
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Your Classes</h4>
          {/* If you only want owners/admins to create, keep this check; else remove */}
          {isAdmin && (
            // Make sure your AddClassButton calls onCreated() after success
            <AddClassButton onCreated={() => dispatch(fetchMyClasses())} />
          )}
        </div>

        {status === "loading" && <p>Loading…</p>}
        {status === "failed" && (
          <div className="text-danger">{error || "Failed to load classes"}</div>
        )}
        {status === "succeeded" &&
          (items.length === 0 ? (
            <p>No classes yet.</p>
          ) : (
            <div className="list-group">
          {items.map((c) => (
            <Link key={c.id} to={`/classes/${c.id}`} className="list-group-item list-group-item-action">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div className="flex-grow-1">
                  <h6 className="mb-1">{c.title ?? c.name}</h6>
                  {c.description && <p className="mb-1">{c.description}</p>}
                  <small className="text-muted">
                    Code: {c.code} • Status: {c.status}
                  </small>
                </div>

                {canDelete(c) && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(c.id); }}
                    className="btn btn-sm btn-outline-danger"
                    title="Delete class"
                  >
                    Delete
                  </button>
                )}
              </div>
            </Link>
          ))}
            </div>
          ))}
      </div>
    </>
  );
}

