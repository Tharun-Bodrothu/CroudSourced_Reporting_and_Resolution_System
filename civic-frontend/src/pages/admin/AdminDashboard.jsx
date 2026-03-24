import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import '../../styles/civix.css';

const VALID_STATUSES = ['reported', 'acknowledged', 'in_progress', 'resolved', 'rejected'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({});
  const [issues, setIssues] = useState([]);
  const [loadingA, setLoadingA] = useState(true);
  const [loadingI, setLoadingI] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [ar, ir] = await Promise.all([adminAPI.getAnalytics(), adminAPI.getIssues()]);
      setAnalytics(ar.data?.data || {});
      setIssues(ir.data?.data || []);
    } catch (e) {
      setError(`Failed to load data. Make sure backend is running. (${e.response?.data?.message || e.message})`);
    } finally { setLoadingA(false); setLoadingI(false); }
  };

  const handleStatus = async (issueId, status) => {
    setUpdatingId(issueId);
    try {
      await adminAPI.updateIssueStatus(issueId, status);
      setIssues(prev => prev.map(i => i._id === issueId ? { ...i, status } : i));
      adminAPI.getAnalytics().then(r => setAnalytics(r.data?.data || {}));
    } catch (e) { alert(e.response?.data?.message || 'Update failed'); }
    finally { setUpdatingId(null); }
  };

  const filtered = issues.filter(i => {
    const ms = filterStatus === 'all' || i.status === filterStatus;
    const mq = !search ||
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      (typeof i.department === 'object' ? i.department?.name : i.department)?.toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  const statCards = [
    { lbl: 'Total Issues', val: analytics.totalIssues ?? 0, cls: 'color-purple' },
    { lbl: 'Reported',     val: analytics.reported ?? 0,    cls: 'color-green'  },
    { lbl: 'Acknowledged', val: analytics.acknowledged ?? 0,cls: 'color-blue'   },
    { lbl: 'In Progress',  val: analytics.inProgress ?? 0,  cls: 'color-amber'  },
    { lbl: 'Resolved',     val: analytics.resolved ?? 0,    cls: 'color-violet' },
    { lbl: 'Rejected',     val: analytics.rejected ?? 0,    cls: 'color-red'    },
  ];

  return (
    <div className="cx-page">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem', marginBottom:'2rem' }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.9rem', fontWeight:800 }}>Admin Dashboard</h1>
          <p style={{ color:'var(--text3)', marginTop:'.25rem' }}>
            {analytics.totalDepartments || 0} departments · {analytics.totalUsers || 0} users city-wide
          </p>
        </div>
        <Link to="/admin/create-department-admin" className="cx-btn cx-btn-primary">+ Create Dept Admin</Link>
      </div>

      {error && <div className="cx-error">{error}</div>}

      {/* Stat cards — use cls not inline style */}
      {loadingA ? <div className="cx-spinner" /> : (
        <div className="cx-stat-grid">
          {statCards.map(c => (
            <div key={c.lbl} className={`cx-stat-card ${c.cls}`}>
              <span className="val">{c.val}</span>
              <span className="lbl">{c.lbl}</span>
            </div>
          ))}
        </div>
      )}

      {/* Per-dept breakdown */}
      {Array.isArray(analytics.byDepartment) && analytics.byDepartment.length > 0 && (
        <div className="cx-card" style={{ padding:'1.5rem', marginBottom:'1.5rem' }}>
          <div className="cx-section-title">Department Overview</div>
          <div style={{ overflowX:'auto' }}>
            <table className="cx-table">
              <thead><tr><th>Department</th><th>Total</th><th>Reported</th><th>In Progress</th><th>Resolved</th><th>Progress</th></tr></thead>
              <tbody>
                {analytics.byDepartment.map(d => {
                  const pct = d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0;
                  return (
                    <tr key={d.departmentId || d.departmentName}>
                      <td style={{ fontWeight:600, color:'var(--text1)' }}>{d.departmentName || 'Unknown'}</td>
                      <td><strong>{d.total}</strong></td>
                      <td><span className="cx-badge reported">{d.reported}</span></td>
                      <td><span className="cx-badge in_progress">{d.inProgress}</span></td>
                      <td><span className="cx-badge resolved">{d.resolved}</span></td>
                      <td style={{ minWidth:130 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                          <div className="cx-progress-wrap">
                            <div className="cx-progress-bar" style={{ width:`${pct}%`, background: pct>=75?'#10b981':pct>=40?'#f59e0b':'#ef4444' }} />
                          </div>
                          <span style={{ fontSize:'.78rem', fontWeight:700, minWidth:30 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All issues — admin can set ANY status including resolved */}
      <div className="cx-card" style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem', marginBottom:'1.25rem' }}>
          <div>
            <div className="cx-section-title" style={{ margin:0 }}>All Issues — newest first</div>
            <div style={{ fontSize:'.8rem', color:'var(--text3)', marginTop:'.2rem' }}>
              ✅ You are the final authority — use the dropdown to set any status including <strong>Resolved</strong>
            </div>
          </div>
          <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap' }}>
            <input className="cx-input" style={{ width:220 }} placeholder="Search title or dept…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="cx-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {VALID_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
          </div>
        </div>

        {loadingI ? <div className="cx-spinner" /> : filtered.length === 0 ? (
          <div className="cx-empty"><div className="icon">📋</div><p>No issues yet or no match</p></div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="cx-table">
              <thead>
                <tr><th>#</th><th>Title</th><th>Department</th><th>Severity</th><th>Reporter</th><th>Date</th><th>Status</th><th>Set Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((issue, idx) => (
                  <tr key={issue._id}>
                    <td style={{ color:'var(--text3)', fontSize:'.8rem' }}>{idx+1}</td>
                    <td style={{ fontWeight:600, color:'var(--text1)', maxWidth:180 }}>
                      <Link to={`/issues/${issue._id}`} style={{ color:'var(--p1)', textDecoration:'none' }}>
                        {issue.title || 'Untitled'}
                      </Link>
                    </td>
                    <td>{typeof issue.department === 'object' ? issue.department?.name : issue.department || 'N/A'}</td>
                    <td><span className={`cx-badge ${issue.severity}`}>{issue.severity || 'low'}</span></td>
                    <td>{issue.reportedBy?.name || 'N/A'}</td>
                    <td style={{ fontSize:'.8rem', color:'var(--text3)', whiteSpace:'nowrap' }}>
                      {new Date(issue.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </td>
                    <td><span className={`cx-badge ${issue.status}`}>{issue.status?.replace('_',' ')}</span></td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'.4rem' }}>
                        <select className="cx-select" value={issue.status}
                          disabled={updatingId === issue._id}
                          onChange={e => handleStatus(issue._id, e.target.value)}>
                          {VALID_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                        </select>
                        {updatingId === issue._id && <span style={{ fontSize:'.72rem', color:'var(--text3)' }}>saving…</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop:'.75rem', fontSize:'.8rem', color:'var(--text3)' }}>
          Showing {filtered.length} of {issues.length} issues
        </div>
      </div>
    </div>
  );
}