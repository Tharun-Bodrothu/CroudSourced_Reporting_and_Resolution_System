import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [analyticsRes, issuesRes, usersRes, deptsRes] = await Promise.all([
          adminAPI.getAnalytics(),
          adminAPI.getIssues(),
          adminAPI.getUsers(),
          adminAPI.getDepartments(),
        ]);
        setAnalytics(analyticsRes.data?.data || analyticsRes.data || null);
        setIssues(issuesRes.data?.data || issuesRes.data || []);
        setUsers(usersRes.data?.data || usersRes.data || []);
        setDepartments(deptsRes.data?.data || deptsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading admin dashboard...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Super Admin Dashboard</h2>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}

      {analytics && (
        <section style={{ marginTop: 16 }}>
          <h3>System Analytics</h3>
          <ul>
            <li>Total Users: {analytics.totalUsers}</li>
            <li>Total Departments: {analytics.totalDepartments}</li>
            <li>Total Issues: {analytics.totalIssues}</li>
          </ul>
        </section>
      )}

      <section style={{ marginTop: 24 }}>
        <h3>Departments</h3>
        {departments.length === 0 ? (
          <p>No departments created yet.</p>
        ) : (
          <ul>
            {departments.map((d) => (
              <li key={d._id}>{d.name} ({d.contactEmail || 'no email'})</li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Users</h3>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul>
            {users.map((u) => (
              <li key={u._id}>{u.name} - {u.email} ({u.role})</li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Recent Issues</h3>
        {issues.length === 0 ? (
          <p>No issues in the system.</p>
        ) : (
          <ul>
            {issues.slice(0, 10).map((i) => (
              <li key={i._id}>
                {i.title || 'Untitled'} - {i.status} ({i.department || 'No dept'})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
