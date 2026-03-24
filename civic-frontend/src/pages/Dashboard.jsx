import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import '../styles/civix.css';

const STATUS_META = {
  reported:     { label: 'Reported',     bg: '#dcfce7', color: '#166534' },
  acknowledged: { label: 'Acknowledged', bg: '#dbeafe', color: '#1e40af' },
  in_progress:  { label: 'In Progress',  bg: '#fef3c7', color: '#92400e' },
  resolved:     { label: 'Resolved',     bg: '#ede9fe', color: '#4c1d95' },
  rejected:     { label: 'Rejected',     bg: '#fee2e2', color: '#991b1b' },
};

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    issuesAPI.getMyIssues()
      .then(r => setIssues(r.data?.data || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total        = issues.length;
  const reported     = issues.filter(i => i.status === 'reported').length;
  const inProgress   = issues.filter(i => i.status === 'in_progress').length;
  const resolved     = issues.filter(i => i.status === 'resolved').length;
  const acknowledged = issues.filter(i => i.status === 'acknowledged').length;

  const statCards = [
    { lbl: 'Total',        val: total,        cls: 'color-purple' },
    { lbl: 'Reported',     val: reported,     cls: 'color-green'  },
    { lbl: 'Acknowledged', val: acknowledged, cls: 'color-blue'   },
    { lbl: 'In Progress',  val: inProgress,   cls: 'color-amber'  },
    { lbl: 'Resolved',     val: resolved,     cls: 'color-violet' },
  ];

  return (
    <div className="cx-page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem', marginBottom:'2rem' }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.9rem', fontWeight:800, color:'var(--text1)' }}>
            Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p style={{ color:'var(--text3)', marginTop:'.25rem' }}>Here's a summary of your reported issues</p>
        </div>
        <button className="cx-btn cx-btn-primary" onClick={() => navigate('/report')}>+ Report New Issue</button>
      </div>

      {/* Stat cards */}
      {loading ? <div className="cx-spinner" /> : (
        <div className="cx-stat-grid">
          {statCards.map(c => (
            <div key={c.lbl} className={`cx-stat-card ${c.cls}`}>
              <span className="val">{c.val}</span>
              <span className="lbl">{c.lbl}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent issues list */}
      <div className="cx-card" style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
          <div className="cx-section-title" style={{ margin:0 }}>Recent Issues</div>
          <button className="cx-btn cx-btn-ghost" style={{ fontSize:'.85rem' }} onClick={() => navigate('/my-complaints')}>View all →</button>
        </div>

        {loading ? <div className="cx-spinner" /> : issues.length === 0 ? (
          <div className="cx-empty">
            <div className="icon">📝</div>
            <p>No issues reported yet.</p>
            <button className="cx-btn cx-btn-primary" style={{ marginTop:'1rem' }} onClick={() => navigate('/report')}>
              Report your first issue
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
            {issues.slice(0, 8).map(issue => {
              const sm = STATUS_META[issue.status] || { label: issue.status, bg: '#f3f4f6', color: '#374151' };
              const deptName = typeof issue.department === 'object' ? issue.department?.name : issue.department || 'N/A';
              return (
                <div key={issue._id}
                  onClick={() => navigate(`/issues/${issue._id}`)}
                  style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.9rem 1rem', background:'var(--surface2)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', cursor:'pointer', transition:'background .15s', flexWrap:'wrap', gap:'.5rem' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--p4)'}
                  onMouseLeave={e => e.currentTarget.style.background='var(--surface2)'}
                >
                  <div style={{ flex:1, minWidth:140 }}>
                    <div style={{ fontWeight:600, color:'var(--text1)', fontSize:'.92rem', marginBottom:'.15rem' }}>{issue.title || 'Untitled'}</div>
                    <div style={{ fontSize:'.78rem', color:'var(--text3)' }}>{deptName} · {new Date(issue.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                  </div>
                  <span style={{ padding:'3px 12px', borderRadius:99, fontSize:'.75rem', fontWeight:700, background:sm.bg, color:sm.color }}>{sm.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}