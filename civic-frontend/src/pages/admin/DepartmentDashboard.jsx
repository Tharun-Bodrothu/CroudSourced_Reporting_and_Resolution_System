import { useEffect, useState } from 'react';
import { departmentAPI } from '../../services/api';

export default function DepartmentDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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

  return (
    <div style={{ padding: 20 }}>
      <h2>Department Dashboard</h2>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {issues.length === 0 ? (
        <p style={{ marginTop: 16 }}>No issues assigned to this department.</p>
      ) : (
        <table style={{ marginTop: 16, width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Title</th>
              <th align="left">Severity</th>
              <th align="left">Status</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue._id}>
                <td>{issue.title || 'Untitled'}</td>
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
