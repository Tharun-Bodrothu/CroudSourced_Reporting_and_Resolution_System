import { useEffect, useState } from 'react';
import { issuesAPI } from '../../services/api';

export default function DepartmentDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentIssues();
  }, []);

  const fetchDepartmentIssues = async () => {
    try {
      const res = await issuesAPI.getDepartmentIssues(); // ✅ IMPORTANT
      setIssues(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Department dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CALCULATIONS
  const total = issues.length;
  const reported = issues.filter(i => i.status === "reported").length;
  const inProgress = issues.filter(i => i.status === "in_progress").length;
  const resolved = issues.filter(i => i.status === "resolved").length;

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>🏢 Department Dashboard</h1>

      {/* ✅ STATS */}
      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        <div>Total: {total}</div>
        <div>Reported: {reported}</div>
        <div>In Progress: {inProgress}</div>
        <div>Resolved: {resolved}</div>
      </div>

      {/* ✅ ISSUE LIST */}
      <div style={{ marginTop: 30 }}>
        <h3>Department Issues</h3>

        {issues.length === 0 ? (
          <p>No issues assigned</p>
        ) : (
          <ul>
            {issues.slice(0, 10).map(issue => (
              <li key={issue._id}>
                {issue.title} — {issue.status}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}