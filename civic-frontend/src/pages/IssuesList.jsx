import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import '../styles/civix.css';

function IssueCard({ issue }) {
  const navigate = useNavigate();
  const deptName = typeof issue.department === 'object' ? issue.department?.name : issue.department || 'N/A';

  return (
    <div
      onClick={() => navigate(`/issues/${issue._id}`)}
      style={{ background:'var(--surface)', borderRadius:'var(--radius)', boxShadow:'var(--shadow-sm)', border:'1px solid var(--border)', overflow:'hidden', cursor:'pointer', transition:'transform .2s, box-shadow .2s', display:'flex', flexDirection:'column' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-lg)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}
    >
      <div style={{ background:'var(--grad)', padding:'1.1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'.75rem' }}>
        <h3 style={{ color:'#fff', fontSize:'1rem', fontFamily:'Syne, sans-serif', fontWeight:700, flex:1, lineHeight:1.3 }}>
          {issue.title || 'Untitled Issue'}
        </h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'.3rem', alignItems:'flex-end' }}>
          <span style={{ background:'rgba(255,255,255,.2)', color:'#fff', padding:'2px 9px', borderRadius:99, fontSize:'.72rem', fontWeight:700 }}>
            {issue.priorityScore || 0}/10
          </span>
          <span className={`cx-badge ${issue.severity}`} style={{ fontSize:'.68rem' }}>{issue.severity || 'low'}</span>
        </div>
      </div>
      <div style={{ padding:'1.1rem 1.25rem', flex:1 }}>
        {issue.aiSummary && (
          <p style={{ fontSize:'.85rem', color:'var(--text2)', lineHeight:1.55, marginBottom:'.85rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {issue.aiSummary}
          </p>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:'.4rem', marginTop:'auto', paddingTop:'.85rem', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem' }}>
            <span style={{ color:'var(--text3)' }}>Department</span>
            <span style={{ color:'var(--text1)', fontWeight:600 }}>{deptName}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem' }}>
            <span style={{ color:'var(--text3)' }}>Status</span>
            <span className={`cx-badge ${issue.status}`}>{issue.status?.replace('_',' ')}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem' }}>
            <span style={{ color:'var(--text3)' }}>Upvotes</span>
            <span style={{ color:'var(--text1)', fontWeight:600 }}>👍 {issue.upvoteCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IssuesList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    issuesAPI.getAllIssues()
      .then(r => setIssues(r.data?.data || r.data || []))
      .catch(e => setError(e.response?.data?.message || 'Failed to fetch issues'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = issues.filter(i => {
    const ms = filterSeverity === 'all' || i.severity === filterSeverity;
    const mst = filterStatus === 'all' || i.status === filterStatus;
    const mq = !search || i.title?.toLowerCase().includes(search.toLowerCase());
    return ms && mst && mq;
  });

  const severityFilters = [
    { val:'all', label:'All Issues' },
    { val:'high', label:'🔴 High' },
    { val:'medium', label:'🟡 Medium' },
    { val:'low', label:'🟢 Low' },
  ];

  return (
    <div className="cx-page">
      <div className="cx-page-header" style={{ textAlign:'center' }}>
        <h1 style={{ fontSize:'2rem' }}>CiviX Issues</h1>
        <p>Track and resolve community issues across Visakhapatnam</p>
      </div>
      <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap', justifyContent:'center', marginBottom:'1.5rem' }}>
        {severityFilters.map(f => (
          <button key={f.val} onClick={() => setFilterSeverity(f.val)}
            style={{ padding:'.5rem 1.2rem', borderRadius:'var(--radius-pill)', border:'2px solid', borderColor:filterSeverity===f.val?'var(--p1)':'var(--border)', background:filterSeverity===f.val?'var(--grad)':'var(--surface)', color:filterSeverity===f.val?'#fff':'var(--text2)', fontFamily:'DM Sans, sans-serif', fontWeight:600, fontSize:'.88rem', cursor:'pointer', transition:'all .2s' }}>
            {f.label}
          </button>
        ))}
        <select className="cx-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="reported">Reported</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <input className="cx-input" style={{ width:200 }} placeholder="Search issues…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {error && <div className="cx-error">{error}</div>}
      {loading ? (
        <div className="cx-spinner" />
      ) : filtered.length === 0 ? (
        <div className="cx-empty"><div className="icon">🏙️</div><p>No issues found</p></div>
      ) : (
        <>
          <p style={{ color:'var(--text3)', fontSize:'.85rem', marginBottom:'1rem', textAlign:'center' }}>
            {filtered.length} issue{filtered.length!==1?'s':''} found
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.25rem' }}>
            {filtered.map(issue => <IssueCard key={issue._id} issue={issue} />)}
          </div>
        </>
      )}
    </div>
  );
}