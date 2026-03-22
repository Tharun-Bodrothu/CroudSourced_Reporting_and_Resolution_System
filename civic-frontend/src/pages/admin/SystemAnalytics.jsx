import { useEffect, useState } from 'react';
import API, { adminAPI } from '../../services/api';

export default function SystemAnalytics() {
  const [summary, setSummary] = useState(null);
  const [byDept, setByDept] = useState([]);
  const [byArea, setByArea] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [summaryRes, deptRes, areaRes] = await Promise.all([
          adminAPI.getAnalytics(),
          API.get('/issues/analytics/departments'),
          API.get('/issues/analytics/areas'),
        ]);
        setSummary(summaryRes.data?.data || summaryRes.data || null);
        setByDept(deptRes.data || []);
        setByArea(areaRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading analytics...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>System Analytics</h2>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}

      {summary && (
        <section style={{ marginTop: 16 }}>
          <h3>Summary</h3>
          <ul>
            <li>Total Users: {summary.totalUsers}</li>
            <li>Total Departments: {summary.totalDepartments}</li>
            <li>Total Issues: {summary.totalIssues}</li>
          </ul>
          {Array.isArray(summary.byStatus) && (
            <>
              <h4 style={{ marginTop: 12 }}>Issues by Status</h4>
              <ul>
                {summary.byStatus.map((s) => (
                  <li key={s._id}>{s._id}: {s.count}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <section style={{ marginTop: 24 }}>
        <h3>Issues by Department</h3>
        {byDept.length === 0 ? (
          <p>No data.</p>
        ) : (
          <ul>
            {byDept.map((d) => (
              <li key={d._id || 'unknown'}>{d._id || 'Unknown'}: {d.count}</li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Issues by Area</h3>
        {byArea.length === 0 ? (
          <p>No data.</p>
        ) : (
          <ul>
            {byArea.map((a) => (
              <li key={a._id || 'unknown'}>{a._id || 'Unknown'}: {a.count}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

