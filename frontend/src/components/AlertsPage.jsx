import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyAlerts, selectAlerts, selectAlertsStatus, selectAlertsError } from "../store/slices/alertsSlice";
import Header from "./Header";

export default function AlertsPage() {
  const dispatch = useDispatch();
  const items  = useSelector(selectAlerts);
  const status = useSelector(selectAlertsStatus);
  const error  = useSelector(selectAlertsError);

  useEffect(() => { dispatch(fetchMyAlerts()); }, [dispatch]);

  if (status === "loading") return <><Header></Header><p>Loading…</p></>;
  if (status === "failed")  return <><Header/><div className="text-danger">{error || "Failed to load alerts"}</div></>;
  if (!items?.length)       return <><Header/><p>No alerts.</p></>;

  return (
    <>
    <Header />
    <h4>Your Alerts</h4>
    <div className="list-group">
      {items.map(a => (
        <div key={a.id} className="list-group-item">
          <div className="d-flex justify-content-between">
            <h6 className="mb-1">{a.title}</h6>
            <small className="text-muted">{a.classCode}</small>
          </div>
          <p className="mb-1">{a.body}</p>
          <small className="text-muted">
            By {a.createdByName} • {new Date(a.createdAt).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
    </>
  );
}
