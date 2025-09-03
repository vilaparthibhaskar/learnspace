// src/pages/class/ClassMembers.jsx
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function ClassMembers() {
  const { classId, isInstructor, isAdmin, token, email } = useOutletContext();
  const canManage = isInstructor || isAdmin;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("STUDENT"); // or INSTRUCTOR

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      // Expect: GET /api/classes/{id}/members
      const res = await fetch(`${API_BASE}/api/classes/${classId}/members`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      setMembers(await res.json());
    } catch (e) {
      setErr(e.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [classId]);

  async function addMember(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/classes/${classId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({ requesterEmail: email, newMemberEmail: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) throw new Error(await res.text());
      setInviteEmail("");
      setInviteRole("STUDENT");
      await load();
    } catch (e) {
      alert(e.message || "Failed to add member");
    }
  }

  async function changeRole(memberId, role) {
    try {
      const res = await fetch(`${API_BASE}/api/classes/${classId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({ requesterEmail: email, role }),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      alert(e.message || "Failed to update role");
    }
  }

  async function removeMember(memberId) {
    if (!confirm("Remove this member from class?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/classes/${classId}/members/${memberId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({ requesterEmail: email }),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      alert(e.message || "Failed to remove member");
    }
  }

  if (loading) return <p>Loading members…</p>;
  if (err) return <div className="alert alert-danger">{err}</div>;

  return (
    <div className="card">
      <div className="card-body">
        <h5>Members</h5>

        {canManage && (
          <form className="row g-2 align-items-end mb-3" onSubmit={addMember}>
            <div className="col-12 col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" value={inviteEmail} onChange={(e)=>setInviteEmail(e.target.value)} required />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Role</label>
              <select className="form-select" value={inviteRole} onChange={(e)=>setInviteRole(e.target.value)}>
                <option value="STUDENT">STUDENT</option>
                <option value="INSTRUCTOR">INSTRUCTOR</option>
              </select>
            </div>
            <div className="col-12 col-md-3">
              <button className="btn btn-primary w-100">Add</button>
            </div>
          </form>
        )}

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>{m.personName}</td>
                  <td>{m.personEmail}</td>
                  <td>
                    {canManage ? (
                      <select
                        className="form-select form-select-sm"
                        value={m.roleInClass}
                        onChange={(e)=>changeRole(m.id, e.target.value)}
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="INSTRUCTOR">INSTRUCTOR</option>
                      </select>
                    ) : (
                      m.roleInClass
                    )}
                  </td>
                  <td>{m.joinedAt ? new Date(m.joinedAt).toLocaleString() : "-"}</td>
                  <td className="text-end">
                    {canManage && (
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>removeMember(m.id)}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!members.length && <tr><td colSpan={5} className="text-center text-muted">No members.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
