import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import API from '../services/api';

function IssueDetails() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [issueRes, commentsRes] = await Promise.all([
          issuesAPI.getIssueById(id),
          API.get(`/issues/${id}/comments`),
        ]);
        setIssue(issueRes.data?.data || issueRes.data);
        setComments(commentsRes.data?.comments || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load issue');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpvote = async () => {
    try {
      await API.post(`/issues/${id}/upvote`);
      const refreshed = await issuesAPI.getIssueById(id);
      setIssue(refreshed.data?.data || refreshed.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Upvote failed');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/issues/${id}/comments`, { text });
      setComments((prev) => [res.data.comment, ...prev]);
      setText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Comment failed');
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading issue...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!issue) return <div style={{ padding: 20 }}>Issue not found.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{issue.title || 'Untitled Issue'}</h2>
      <p style={{ marginTop: 8 }}>{issue.descriptionText}</p>
      <div style={{ marginTop: 12 }}>
        <strong>Status:</strong> {issue.status}
        {'  '}|{' '}
        <strong>Department:</strong> {issue.department || 'N/A'}
        {'  '}|{' '}
        <strong>Upvotes:</strong> {issue.upvoteCount || 0}
      </div>

      {issue.image && (
        <div style={{ marginTop: 16 }}>
          <img src={`http://localhost:5000${issue.image}`} alt="issue" style={{ maxWidth: 420 }} />
        </div>
      )}

      {issue.afterImage && (
        <div style={{ marginTop: 16 }}>
          <h4>Resolution Proof</h4>
          <img src={`http://localhost:5000${issue.afterImage}`} alt="resolution" style={{ maxWidth: 420 }} />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button onClick={handleUpvote}>Upvote</button>
      </div>

      <section style={{ marginTop: 24 }}>
        <h3>Comments</h3>
        <form onSubmit={handleComment} style={{ marginTop: 8 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment"
            style={{ width: 320 }}
          />
          <button type="submit" style={{ marginLeft: 8 }}>Post</button>
        </form>
        {comments.length === 0 ? (
          <p style={{ marginTop: 12 }}>No comments yet.</p>
        ) : (
          <ul style={{ marginTop: 12 }}>
            {comments.map((c) => (
              <li key={c._id}>
                <strong>{c.user?.name || 'User'}:</strong> {c.text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default IssueDetails;

