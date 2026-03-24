import { useEffect, useState } from 'react';
import { issuesAPI } from '../../services/api';
import IssueCard from '../../components/IssueCard';

function MyComplaints() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyIssues = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await issuesAPI.getMyIssues();
        setIssues(res.data?.data || res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchMyIssues();
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading your complaints...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>My Complaints</h2>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {issues.length === 0 ? (
        <p style={{ marginTop: 16 }}>You have not reported any issues yet.</p>
      ) : (
        <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
          {issues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyComplaints;

