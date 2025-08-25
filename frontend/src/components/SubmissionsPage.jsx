import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { fetchMySubmissions, selectSubmissions, selectSubmissionsStatus, selectSubmissionsError } from "../store/submissionsSlice";

export default function SubmissionsPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectSubmissions);
  const status = useSelector(selectSubmissionsStatus);
  const error = useSelector(selectSubmissionsError);

  useEffect(() => { dispatch(fetchMySubmissions()); }, [dispatch]);

  if (status === "loading") return <p>Loading…</p>;
  if (status === "failed") return <div className="text-danger">{error || "Failed to load submissions"}</div>;
  if (!items?.length) return <p>No submissions found.</p>;

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr><th>Class</th><th>Assignment</th><th>Status</th><th>Points</th><th>Submitted</th></tr>
        </thead>
        <tbody>
          {items.map(s => (
            <tr key={s.id}>
              <td>{s.classTitle || s.classCode}</td>
              <td>{s.assignmentTitle}</td>
              <td>{s.status}</td>
              <td>{s.gradePoints ?? "-"}</td>
              <td>{new Date(s.submittedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
