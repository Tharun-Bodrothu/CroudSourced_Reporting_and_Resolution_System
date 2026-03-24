import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import API from '../services/api';
import '../styles/civix.css';

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [ir, cr] = await Promise.all([issuesAPI.getIssueById(id), API.get(`/issues/${id}/comments`)]);
        setIssue(ir.data?.data || ir.data);
        setComments(cr.data?.comments || []);
      } catch (e) { setError(e.response?.data?.message || 'Failed to load issue'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleUpvote = async () => {
    setUpvoting(true);
    try {
      await API.post(`/issues/${id}/upvote`);
      const r = await issuesAPI.getIssueById(id);
      setIssue(r.data?.data || r.data);
    } catch (e) { alert(e.response?.data?.message || 'Upvote failed'); }
    finally { setUpvoting(false); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const r = await API.post(`/issues/${id}/comments`, { text });
      setComments(prev => [r.data.comment, ...prev]);
      setText('');
    } catch (e) { alert(e.response?.data?.message || 'Comment failed'); }
    finally { setPosting(false); }
  };

  if (loading) return <div className="cx-page"><div className="cx-spinner" /></div>;
  if (error) return <div className="cx-page"><div className="cx-error">{error}</div></div>;
  if (!issue) return <div className="cx-page"><p>Issue not found.</p></div>;

  const deptName = typeof issue.department === 'object' ? issue.department?.name : issue.department || 'N/A';

  return (
    <div className="cx-page" style={{ maxWidth: 860 }}>
      <button onClick={() => navigate(-1)} className="cx-btn cx-btn-ghost" style={{ marginBottom: '1.25rem' }}>
        ← Back
      </button>

      {/* ── Main card ── */}
      <div className="cx-card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--grad)', padding: '2rem 2rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
            <span className={`cx-badge ${issue.severity}`}>{issue.severity}</span>
            <span className={`cx-badge ${issue.status}`}>{issue.status?.replace('_', ' ')}</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.6rem', fontFamily: 'Syne, sans-serif', marginBottom: '.5rem', lineHeight: 1.3 }}>
            {issue.title || 'Untitled Issue'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.88rem' }}>
            Reported by {issue.reportedBy?.name || 'Anonymous'} · {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div style={{ padding: '1.75rem 2rem' }}>
          {/* Meta row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { lbl: 'Department', val: deptName },
              { lbl: 'Priority',   val: `${issue.priorityScore || 0}/10` },
              { lbl: 'Upvotes',    val: issue.upvoteCount || 0 },
              { lbl: 'Comments',   val: issue.commentCount || comments.length },
            ].map(m => (
              <div key={m.lbl} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '.85rem 1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.25rem' }}>{m.lbl}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text1)' }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.5rem' }}>Description</div>
            <p style={{ color: 'var(--text2)', lineHeight: 1.7 }}>{issue.descriptionText}</p>
          </div>

          {/* AI Summary */}
          {issue.aiSummary && (
            <div style={{ background: 'var(--grad-soft)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem', marginBottom: '1.5rem', borderLeft: '3px solid var(--p1)' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--p1)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.3rem' }}>AI Summary</div>
              <p style={{ color: 'var(--text2)', fontSize: '.9rem', lineHeight: 1.6 }}>{issue.aiSummary}</p>
            </div>
          )}

          {/* Images */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {issue.image && (
              <div>
                <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem' }}>Issue Photo</div>
                <img src={`http://localhost:5000${issue.image}`} alt="issue" style={{ maxWidth: 340, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
              </div>
            )}
            {issue.afterImage && (
              <div>
                <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem' }}>Resolution Proof</div>
                <img src={`http://localhost:5000${issue.afterImage}`} alt="resolved" style={{ maxWidth: 340, borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }} />
              </div>
            )}
          </div>

          {/* Upvote */}
          <button className="cx-btn cx-btn-primary" onClick={handleUpvote} disabled={upvoting} style={{ gap: '.5rem' }}>
            {upvoting ? 'Upvoting…' : `👍 Upvote · ${issue.upvoteCount || 0}`}
          </button>
        </div>
      </div>

      {/* ── Comments ── */}
      <div className="cx-card" style={{ padding: '1.5rem' }}>
        <div className="cx-section-title">Comments ({comments.length})</div>

        <form onSubmit={handleComment} style={{ display: 'flex', gap: '.6rem', marginBottom: '1.25rem' }}>
          <input
            className="cx-input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a comment…"
            style={{ flex: 1 }}
          />
          <button type="submit" className="cx-btn cx-btn-primary" disabled={posting || !text.trim()}>
            {posting ? '…' : 'Post'}
          </button>
        </form>

        {comments.length === 0 ? (
          <div className="cx-empty"><div className="icon">💬</div><p>No comments yet. Be the first!</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {comments.map(c => (
              <div key={c._id} style={{ display: 'flex', gap: '.85rem', padding: '.85rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Syne', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                  {(c.user?.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text1)', marginBottom: '.2rem' }}>{c.user?.name || 'User'}</div>
                  <div style={{ fontSize: '.9rem', color: 'var(--text2)', lineHeight: 1.5 }}>{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}