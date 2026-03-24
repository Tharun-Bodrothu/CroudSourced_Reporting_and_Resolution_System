import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import API from '../../services/api';
import '../../styles/civix.css';

export default function SystemAnalytics() {
  const [summary, setSummary] = useState(null);
  const [byArea, setByArea] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // ✅ adminAPI.getAnalytics() already returns byDepartment — no need for second dept call
        const [sr, ar] = await Promise.all([
          adminAPI.getAnalytics(),
          API.get('/issues/analytics/areas'),
        ]);
        setSummary(sr.data?.data || null);
        setByArea(ar.data || []);
      } catch (e) {
        setError(`Failed to load analytics. (${e.response?.data?.message || e.message})`);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="cx-page"><div className="cx-spinner" /></div>;

  const statusData = summary ? [
    { label:'Reported',     val: summary.reported || 0,     color:'#10b981', cls:'reported'     },
    { label:'Acknowledged', val: summary.acknowledged || 0, color:'#3b82f6', cls:'acknowledged' },
    { label:'In Progress',  val: summary.inProgress || 0,   color:'#f59e0b', cls:'in_progress'  },
    { label:'Resolved',     val: summary.resolved || 0,     color:'#7c3aed', cls:'resolved'     },
    { label:'Rejected',     val: summary.rejected || 0,     color:'#ef4444', cls:'rejected'     },
  ] : [];
  const total = statusData.reduce((s, d) => s + d.val, 0);

  return (
    <div className="cx-page">
      <div className="cx-page-header">
        <h1>System Analytics</h1>
        <p>City-wide issue intelligence and department performance</p>
      </div>

      {error && <div className="cx-error">{error}</div>}

      {summary ? (
        <>
          {/* Overview stat cards */}
          <div className="cx-stat-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))' }}>
            {[
              { lbl:'Users',        val: summary.totalUsers,       cls:'color-purple' },
              { lbl:'Departments',  val: summary.totalDepartments, cls:'color-violet' },
              { lbl:'Total Issues', val: summary.totalIssues,      cls:'color-blue'   },
              { lbl:'Resolved',     val: summary.resolved,         cls:'color-green'  },
              { lbl:'In Progress',  val: summary.inProgress,       cls:'color-amber'  },
              { lbl:'Reported',     val: summary.reported,         cls:'color-red'    },
            ].map(c => (
              <div key={c.lbl} className={`cx-stat-card ${c.cls}`}>
                <span className="val">{c.val ?? 0}</span>
                <span className="lbl">{c.lbl}</span>
              </div>
            ))}
          </div>

          {/* Status distribution bar */}
          {total > 0 && (
            <div className="cx-card" style={{ padding:'1.5rem', marginBottom:'1.5rem' }}>
              <div className="cx-section-title">Status Distribution</div>
              <div style={{ display:'flex', height:32, borderRadius:99, overflow:'hidden', gap:2, marginBottom:'1rem' }}>
                {statusData.filter(d => d.val > 0).map(d => (
                  <div key={d.label} title={`${d.label}: ${d.val}`}
                    style={{ flex: d.val, background: d.color, minWidth: 4, transition:'flex .4s' }} />
                ))}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.75rem' }}>
                {statusData.map(d => (
                  <div key={d.label} style={{ display:'flex', alignItems:'center', gap:'.4rem', fontSize:'.85rem' }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:d.color, flexShrink:0 }} />
                    <span style={{ color:'var(--text2)' }}>{d.label}</span>
                    <strong style={{ color:'var(--text1)' }}>{d.val}</strong>
                    <span style={{ color:'var(--text3)' }}>({total > 0 ? Math.round(d.val/total*100) : 0}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dept performance */}
          {Array.isArray(summary.byDepartment) && summary.byDepartment.length > 0 && (
            <div className="cx-card" style={{ padding:'1.5rem', marginBottom:'1.5rem' }}>
              <div className="cx-section-title">Department Performance</div>
              <div style={{ overflowX:'auto' }}>
                <table className="cx-table">
                  <thead><tr><th>Department</th><th>Total</th><th>Reported</th><th>In Progress</th><th>Resolved</th><th>Resolution Rate</th></tr></thead>
                  <tbody>
                    {summary.byDepartment.map(d => {
                      const pct = d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0;
                      return (
                        <tr key={d.departmentId || d.departmentName}>
                          <td style={{ fontWeight:600, color:'var(--text1)' }}>{d.departmentName || 'Unknown'}</td>
                          <td>{d.total}</td>
                          <td><span className="cx-badge reported">{d.reported}</span></td>
                          <td><span className="cx-badge in_progress">{d.inProgress}</span></td>
                          <td><span className="cx-badge resolved">{d.resolved}</span></td>
                          <td style={{ minWidth:140 }}>
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
        </>
      ) : (
        !error && <div className="cx-empty"><div className="icon">📊</div><p>No data yet — report some issues first.</p></div>
      )}

      {/* By area */}
      {byArea.length > 0 && (
        <div className="cx-card" style={{ padding:'1.5rem' }}>
          <div className="cx-section-title">Issues by Area</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'1rem' }}>
            {byArea.slice(0,12).map(a => {
              const maxCount = Math.max(...byArea.map(x => x.count));
              const pct = maxCount > 0 ? Math.round((a.count / maxCount) * 100) : 0;
              return (
                <div key={a._id||'unknown'} style={{ background:'var(--surface2)', borderRadius:'var(--radius-sm)', padding:'.85rem 1rem', border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text2)', marginBottom:'.4rem' }}>{a._id||'Unknown'}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                    <div className="cx-progress-wrap">
                      <div className="cx-progress-bar" style={{ width:`${pct}%`, background:'var(--p1)' }} />
                    </div>
                    <span style={{ fontSize:'.82rem', fontWeight:700, color:'var(--p1)' }}>{a.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}