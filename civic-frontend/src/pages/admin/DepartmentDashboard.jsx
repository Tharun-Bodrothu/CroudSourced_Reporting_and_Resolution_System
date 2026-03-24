import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { departmentAPI } from '../../services/api';
import '../../styles/civix.css';

const ALLOWED_STATUSES = ['acknowledged', 'in_progress'];

const STATUS_META = {
  reported:     { label: 'Reported',     bg: '#dcfce7', color: '#166534' },
  acknowledged: { label: 'Acknowledged', bg: '#dbeafe', color: '#1e40af' },
  in_progress:  { label: 'In Progress',  bg: '#fef3c7', color: '#92400e' },
  resolved:     { label: 'Resolved',     bg: '#ede9fe', color: '#4c1d95' },
  rejected:     { label: 'Rejected',     bg: '#fee2e2', color: '#991b1b' },
};

export default function DepartmentDashboard() {
  const [stats, setStats] = useState({});
  const [issues, setIssues] = useState([]);
  const [loadingS, setLoadingS] = useState(true);
  const [loadingI, setLoadingI] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // pending | all
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [sr, ir] = await Promise.all([departmentAPI.getStats(), departmentAPI.getMyIssues()]);
      setStats(sr.data?.data || {});
      const sorted = (ir.data?.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setIssues(sorted);
    } catch (e) { setError(e.response?.data?.message || 'Failed to load data'); }
    finally { setLoadingS(false); setLoadingI(false); }
  };

  const handleStatus = async (issueId, status) => {
    if (!ALLOWED_STATUSES.includes(status)) return;
    setUpdatingId(issueId);
    try {
      await departmentAPI.updateIssueStatus(issueId, status);
      setIssues(prev => prev.map(i => i._id === issueId ? { ...i, status } : i));
      departmentAPI.getStats().then(r => setStats(r.data?.data || {}));
    } catch (e) { alert(e.response?.data?.message || 'Update failed'); }
    finally { setUpdatingId(null); }
  };

  // ✅ Pending = issues waiting for dept admin action (reported only)
  const pending = issues.filter(i => i.status === 'reported');
  const displayed = activeTab === 'pending' ? pending : issues;

  const statCards = [
    { lbl: 'Total',        val: stats.total ?? 0,        cls: 'color-purple' },
    { lbl: 'Pending',      val: stats.reported ?? 0,     cls: 'color-green'  },
    { lbl: 'Acknowledged', val: stats.acknowledged ?? 0, cls: 'color-blue'   },
    { lbl: 'In Progress',  val: stats.inProgress ?? 0,   cls: 'color-amber'  },
    { lbl: 'Resolved',     val: stats.resolved ?? 0,     cls: 'color-violet' },
  ];

  return (
    <div className="cx-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.9rem', fontWeight: 800 }}>
            {stats.departmentName || 'Department'} Dashboard
          </h1>
          <p style={{ color: 'var(--text3)', marginTop: '.25rem' }}>Manage and update issues assigned to your department</p>
        </div>
        <Link to="/department/about" className="cx-btn cx-btn-ghost">About Department →</Link>
      </div>

      {error && <div className="cx-error">{error}</div>}

      {/* Stat cards */}
      {loadingS ? <div className="cx-spinner" /> : (
        <div className="cx-stat-grid">
          {statCards.map(c => (
            <div key={c.lbl} className={`cx-stat-card ${c.cls}`}>
              <span className="val">{c.val}</span>
              <span className="lbl">{c.lbl}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pending alert banner */}
      {pending.length > 0 && (
        <div style={{ background: '#fef3c7', border: '1.5px solid #fde047', borderRadius: 'var(--radius-sm)', padding: '.9rem 1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span style={{ fontSize: '1.3rem' }}>⚠️</span>
          <div>
            <strong style={{ color: '#92400e' }}>{pending.length} issue{pending.length > 1 ? 's' : ''} waiting for your acknowledgement</strong>
            <span style={{ color: '#a16207', fontSize: '.88rem', marginLeft: '.5rem' }}>— Click "Acknowledge" to start working on them</span>
          </div>
          <button onClick={() => setActiveTab('pending')} style={{ marginLeft: 'auto', padding: '.35rem .9rem', borderRadius: 'var(--radius-pill)', background: '#f59e0b', color: '#fff', border: 'none', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            View Pending
          </button>
        </div>
      )}

      {/* Issues table */}
      <div className="cx-card" style={{ padding: '1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.25rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: 'fit-content' }}>
          {[
            { key: 'pending', label: `Pending Approval (${pending.length})` },
            { key: 'all',     label: `All Issues (${issues.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding: '.55rem 1.2rem', border: 'none', fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: '.88rem', cursor: 'pointer', background: activeTab === t.key ? 'var(--grad)' : 'var(--surface)', color: activeTab === t.key ? '#fff' : 'var(--text2)', transition: 'all .2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loadingI ? <div className="cx-spinner" /> : displayed.length === 0 ? (
          <div className="cx-empty">
            <div className="icon">{activeTab === 'pending' ? '✅' : '📋'}</div>
            <p>{activeTab === 'pending' ? 'No pending issues — all caught up!' : 'No issues assigned yet'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cx-table">
              <thead>
                <tr><th>#</th><th>Title</th><th>Type</th><th>Severity</th><th>Reporter</th><th>Date</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {displayed.map((issue, idx) => {
                  const sm = STATUS_META[issue.status] || { label: issue.status, bg: '#f3f4f6', color: '#374151' };
                  const canUpdate = issue.status !== 'resolved' && issue.status !== 'rejected';
                  return (
                    <tr key={issue._id}>
                      <td style={{ color: 'var(--text3)', fontSize: '.8rem' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text1)', maxWidth: 200 }}>{issue.title || 'Untitled'}</td>
                      <td style={{ fontSize: '.82rem', color: 'var(--text3)' }}>{issue.issueType || '—'}</td>
                      <td><span className={`cx-badge ${issue.severity}`}>{issue.severity || 'low'}</span></td>
                      <td>{issue.reportedBy?.name || 'N/A'}</td>
                      <td style={{ fontSize: '.8rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '.72rem', fontWeight: 700, background: sm.bg, color: sm.color }}>
                          {sm.label}
                        </span>
                      </td>
                      <td>
                        {canUpdate ? (
                          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                            {issue.status === 'reported' && (
                              <button
                                onClick={() => handleStatus(issue._id, 'acknowledged')}
                                disabled={updatingId === issue._id}
                                style={{ padding: '.35rem .8rem', borderRadius: 6, border: 'none', background: '#dbeafe', color: '#1e40af', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#bfdbfe'}
                                onMouseLeave={e => e.currentTarget.style.background = '#dbeafe'}
                              >
                                ✓ Acknowledge
                              </button>
                            )}
                            {issue.status === 'acknowledged' && (
                              <button
                                onClick={() => handleStatus(issue._id, 'in_progress')}
                                disabled={updatingId === issue._id}
                                style={{ padding: '.35rem .8rem', borderRadius: 6, border: 'none', background: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fde68a'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fef3c7'}
                              >
                                🔧 Start Work
                              </button>
                            )}
                            {issue.status === 'in_progress' && (
                              <span style={{ fontSize: '.78rem', color: '#92400e', fontStyle: 'italic', fontWeight: 600 }}>Working… Admin resolves</span>
                            )}
                            {updatingId === issue._id && <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>saving…</span>}
                          </div>
                        ) : (
                          <span style={{ fontSize: '.78rem', color: 'var(--text3)', fontStyle: 'italic' }}>
                            {issue.status === 'resolved' ? '✅ Resolved' : '❌ Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ marginTop: '1rem', fontSize: '.8rem', color: 'var(--text3)', textAlign: 'center' }}>
        You can Acknowledge and mark In Progress. Only the system admin can mark issues as Resolved or Rejected.
      </p>
    </div>
  );
}