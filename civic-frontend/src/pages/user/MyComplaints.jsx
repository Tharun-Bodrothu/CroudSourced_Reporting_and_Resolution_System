import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesAPI } from '../../services/api';
import '../../styles/civix.css';

const STATUS_META = {
  reported:     { label: 'Reported',     bg: '#dcfce7', color: '#166534' },
  acknowledged: { label: 'Acknowledged', bg: '#dbeafe', color: '#1e40af' },
  in_progress:  { label: 'In Progress',  bg: '#fef3c7', color: '#92400e' },
  resolved:     { label: 'Resolved',     bg: '#ede9fe', color: '#4c1d95' },
  rejected:     { label: 'Rejected',     bg: '#fee2e2', color: '#991b1b' },
};

const SEVERITY_META = {
  high:   { bg: '#fee2e2', color: '#991b1b' },
  medium: { bg: '#fef3c7', color: '#92400e' },
  low:    { bg: '#dcfce7', color: '#166534' },
};

export default function MyComplaints() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    issuesAPI.getMyIssues()
      .then(r => {
        // ✅ Sort newest first
        const sorted = (r.data?.data || r.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setIssues(sorted);
      })
      .catch(e => setError(e.response?.data?.message || 'Failed to load complaints'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? issues : issues.filter(i => i.status === filter);

  return (
    <div className="cx-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.9rem', fontWeight: 800 }}>My Complaints</h1>
          <p style={{ color: 'var(--text3)', marginTop: '.25rem' }}>{issues.length} issue{issues.length !== 1 ? 's' : ''} reported — newest first</p>
        </div>
        <button className="cx-btn cx-btn-primary" onClick={() => navigate('/report')}>+ Report New Issue</button>
      </div>

      {error && <div className="cx-error">{error}</div>}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: 'fit-content', flexWrap: 'wrap' }}>
        {[
          { key: 'all',         label: `All (${issues.length})` },
          { key: 'reported',    label: `Reported (${issues.filter(i => i.status === 'reported').length})` },
          { key: 'acknowledged',label: `Acknowledged (${issues.filter(i => i.status === 'acknowledged').length})` },
          { key: 'in_progress', label: `In Progress (${issues.filter(i => i.status === 'in_progress').length})` },
          { key: 'resolved',    label: `Resolved (${issues.filter(i => i.status === 'resolved').length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            style={{ padding: '.5rem 1rem', border: 'none', fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: '.84rem', cursor: 'pointer', background: filter === t.key ? 'var(--grad)' : 'var(--surface)', color: filter === t.key ? '#fff' : 'var(--text2)', transition: 'all .2s', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="cx-spinner" /> : filtered.length === 0 ? (
        <div className="cx-empty">
          <div className="icon">📝</div>
          <p>{filter === 'all' ? 'No issues reported yet.' : `No ${filter.replace('_', ' ')} issues.`}</p>
          {filter === 'all' && (
            <button className="cx-btn cx-btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/report')}>
              Report your first issue
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((issue, idx) => {
            const sm = STATUS_META[issue.status] || { label: issue.status, bg: '#f3f4f6', color: '#374151' };
            const sv = SEVERITY_META[issue.severity] || { bg: '#f3f4f6', color: '#374151' };
            // ✅ department is now populated object {_id, name}
            const deptName = typeof issue.department === 'object'
              ? issue.department?.name
              : issue.department || 'N/A';

            return (
              <div key={issue._id}
                onClick={() => navigate(`/issues/${issue._id}`)}
                className="cx-card"
                style={{ overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Card header */}
                <div style={{ background: 'var(--grad)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,.65)', fontSize: '.75rem', fontWeight: 600, marginBottom: '.25rem' }}>
                      #{issues.length - idx} · {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <h3 style={{ color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
                      {issue.title || 'Untitled Issue'}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem', alignItems: 'flex-end', flexShrink: 0 }}>
                    <span style={{ background: 'rgba(255,255,255,.2)', color: '#fff', padding: '2px 10px', borderRadius: 99, fontSize: '.72rem', fontWeight: 700 }}>
                      {issue.priorityScore || 0}/10
                    </span>
                    <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: '.72rem', fontWeight: 700, background: sv.bg, color: sv.color }}>
                      {(issue.severity || 'low').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>Department</div>
                      {/* ✅ Shows name not ObjectId */}
                      <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text1)' }}>{deptName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>Type</div>
                      <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text1)' }}>{issue.issueType || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>Upvotes</div>
                      <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text1)' }}>👍 {issue.upvoteCount || 0}</div>
                    </div>
                  </div>
                  <span style={{ padding: '5px 14px', borderRadius: 99, fontSize: '.78rem', fontWeight: 700, background: sm.bg, color: sm.color }}>
                    {sm.label}
                  </span>
                </div>

                {/* AI summary if exists */}
                {issue.aiSummary && (
                  <div style={{ padding: '0 1.25rem 1rem', borderTop: '1px solid var(--border)', paddingTop: '.85rem' }}>
                    <p style={{ fontSize: '.84rem', color: 'var(--text3)', lineHeight: 1.55, margin: 0 }}>{issue.aiSummary}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}