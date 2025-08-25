import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { fetchMyClasses, selectClasses, selectClassesStatus, selectClassesError } from "../store/classesSlice";
// import { selectCurrentUser } from "../store/authSlice";
// import AddClassButton from "../components/AddClassButton";

export default function ClassesPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const items = useSelector(selectClasses);
  const status = useSelector(selectClassesStatus); // 'idle' | 'loading' | 'succeeded' | 'failed'
  const error = useSelector(selectClassesError);

  useEffect(() => { dispatch(fetchMyClasses()); }, [dispatch]);

  const isAdmin = user?.role === "ADMIN";

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Your Classes</h4>
        {isAdmin && <AddClassButton onCreated={() => dispatch(fetchMyClasses())} />}
      </div>

      {status === "loading" && <p>Loading…</p>}
      {status === "failed" && <div className="text-danger">{error || "Failed to load classes"}</div>}
      {status === "succeeded" && (
        items.length === 0 ? <p>No classes yet.</p> : (
          <div className="list-group">
            {items.map(c => (
              <div key={c.id} className="list-group-item">
                <div className="d-flex justify-content-between">
                  <h6 className="mb-1">{c.title}</h6>
                  <small className="text-muted">{c.code}</small>
                </div>
                {c.description && <p className="mb-1">{c.description}</p>}
                <small className="text-muted">Status: {c.status}</small>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
