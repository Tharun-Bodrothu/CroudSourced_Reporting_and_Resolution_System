import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await adminAPI.getAnalytics();
      setAnalytics(res.data?.data || res.data || {});
    } catch (err) {
      console.error("Admin dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>🛠️ Admin Dashboard</h1>

      {/* ✅ SYSTEM STATS */}
      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        <div>👥 Users: {analytics.totalUsers || 0}</div>
        <div>🏢 Departments: {analytics.totalDepartments || 0}</div>
        <div>📋 Issues: {analytics.totalIssues || 0}</div>
      </div>

      {/* ✅ ISSUE STATUS */}
      <div style={{ marginTop: 30 }}>
        <h3>Issue Status Overview</h3>
        <ul>
          <li>Reported: {analytics.reported || 0}</li>
          <li>In Progress: {analytics.inProgress || 0}</li>
          <li>Resolved: {analytics.resolved || 0}</li>
        </ul>
      </div>
    </div>
  );
}