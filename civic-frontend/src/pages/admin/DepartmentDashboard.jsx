import { useEffect, useState } from 'react';
import { departmentAPI } from '../../services/api';

export default function DepartmentDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await departmentAPI.getMyIssues();
        setIssues(res.data?.data || res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load department issues');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusUpdate = async (issueId, status, file) => {
    try {
      setUpdatingId(issueId);
      const form = new FormData();
      form.append('issueId', issueId);
      form.append('status', status);
      if (file) {
        form.append('afterImage', file);
      }
      const res = await departmentAPI.updateIssueStatus(form);
      const updated = res.data?.issue || res.data;
      setIssues((prev) =>
        prev.map((i) => (i._id === updated._id ? updated : i))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading department dashboard...</div>;
  }

  const areas = Array.from(
    new Set(
      issues
        .map((i) => i.location?.area)
        .filter(Boolean)
        .map((s) => String(s).trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const filtered = issues.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
    if (areaFilter !== 'all' && (i.location?.area || '') !== areaFilter) return false;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      const hay = `${i.title || ''} ${i.descriptionText || ''} ${i.issueType || ''} ${i.issueCategory || ''}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  const stats = filtered.reduce(
    (acc, i) => {
      acc.total += 1;
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    },
    { total: 0 }
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>Department Dashboard</h2>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}

      <div style={{ marginTop: 12 }}>
        <strong>Filtered stats:</strong>{' '}
        Total {stats.total} | Reported {(stats.reported || 0)} | Acknowledged {(stats.acknowledged || 0)} | In Progress {(stats.in_progress || 0)} | Resolved {(stats.resolved || 0)} | Rejected {(stats.rejected || 0)}
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          placeholder="Search title/description/type"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All status</option>
          <option value="reported">Reported</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          <option value="all">All severity</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
          <option value="all">All areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {issues.length === 0 ? (
        <p style={{ marginTop: 16 }}>No issues assigned to this department.</p>
      ) : filtered.length === 0 ? (
        <p style={{ marginTop: 16 }}>No issues match current filters.</p>
      ) : (
        <table style={{ marginTop: 16, width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Title</th>
              <th align="left">Area</th>
              <th align="left">Severity</th>
              <th align="left">Status</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((issue) => (
              <tr key={issue._id}>
                <td>{issue.title || 'Untitled'}</td>
                <td>{issue.location?.area || '-'}</td>
                <td>{issue.severity}</td>
                <td>{issue.status}</td>
                <td>
                  <select
                    defaultValue={issue.status}
                    onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                    disabled={updatingId === issue._id}
                  >
                    <option value="reported">Reported</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleStatusUpdate(issue._id, 'resolved', e.target.files[0])
                    }
                    style={{ marginLeft: 8 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
