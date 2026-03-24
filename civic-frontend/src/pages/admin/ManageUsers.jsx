import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/civix.css';

const ROLE_META = {
  admin:            { label: 'Admin',        bg: '#ede9fe', color: '#4c1d95' },
  department_admin: { label: 'Dept Admin',   bg: '#dbeafe', color: '#1e40af' },
  user:             { label: 'User',         bg: '#f3f4f6', color: '#374151' },
  citizen:          { label: 'User',         bg: '#f3f4f6', color: '#374151' },
  field_staff:      { label: 'Field Staff',  bg: '#fef3c7', color: '#92400e' },
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers();
      setUsers(res.data?.data || []);
    } catch (e) { setError('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (u) => {
    try {
      await adminAPI.setUserActive({ userId: u._id, isActive: !u.isActive });
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isActive: !u.isActive } : x));
    } catch (e) { alert(e.response?.data?.message || 'Update failed'); }
  };

  const filtered = users.filter(u => {
    const mr = filterRole === 'all' || u.role === filterRole || (filterRole === 'user' && (u.role === 'user' || u.role === 'citizen'));
    const mq = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return mr && mq;
  });

  const counts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    department_admin: users.filter(u => u.role === 'department_admin').length,
    user: users.filter(u => u.role === 'user' || u.role === 'citizen').length,
  };

  return (
    <div className="cx-page">
      <div className="cx-page-header">
        <h1>Manage Users</h1>
        <p>{users.length} total users registered in the system</p>
      </div>

      {error && <div className="cx-error">{error}</div>}

      {/* Summary stat cards */}
      {!loading && (
        <div className="cx-stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:'1.5rem' }}>
          {[
            { lbl:'Total',       val: counts.all,              cls:'color-purple' },
            { lbl:'Admins',      val: counts.admin,            cls:'color-violet' },
            { lbl:'Dept Admins', val: counts.department_admin, cls:'color-blue'   },
            { lbl:'Citizens',    val: counts.user,             cls:'color-green'  },
          ].map(c => (
            <div key={c.lbl} className={`cx-stat-card ${c.cls}`}>
              <span className="val">{c.val}</span>
              <span className="lbl">{c.lbl}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="cx-card" style={{ padding:'1.25rem', marginBottom:'1.5rem', display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center' }}>
        <input className="cx-input" style={{ flex:1, minWidth:200 }} placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
          {[['all','All'],['admin','Admins'],['department_admin','Dept Admins'],['user','Citizens']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterRole(val)}
              style={{ padding:'.4rem .9rem', borderRadius:'var(--radius-pill)', border:'1.5px solid', borderColor: filterRole===val ? 'var(--p1)' : 'var(--border)', background: filterRole===val ? 'var(--p4)' : 'var(--surface)', color: filterRole===val ? 'var(--p1)' : 'var(--text2)', fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:'.82rem', cursor:'pointer', transition:'all .2s' }}>
              {label} ({counts[val] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Users list */}
      <div className="cx-card" style={{ padding:'1.5rem' }}>
        <div className="cx-section-title">Users ({filtered.length})</div>
        {loading ? <div className="cx-spinner" /> : filtered.length === 0 ? (
          <div className="cx-empty"><div className="icon">👥</div><p>No users match</p></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
            {filtered.map(u => {
              const rm = ROLE_META[u.role] || { label: u.role, bg: '#f3f4f6', color: '#374151' };
              const isExpanded = expandedId === u._id;
              return (
                <div key={u._id} style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', overflow:'hidden', transition:'box-shadow .2s' }}>
                  {/* Main row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : u._id)}
                    style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'.9rem 1.1rem', background:'var(--surface)', cursor:'pointer', flexWrap:'wrap' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background='var(--surface)'}
                  >
                    {/* Avatar */}
                    <div style={{ width:42, height:42, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'Syne', fontWeight:800, fontSize:'1.1rem', flexShrink:0 }}>
                      {(u.name||'U')[0].toUpperCase()}
                    </div>
                    {/* Name + email */}
                    <div style={{ flex:1, minWidth:140 }}>
                      <div style={{ fontWeight:700, color:'var(--text1)', fontFamily:'Syne,sans-serif' }}>{u.name}</div>
                      <div style={{ fontSize:'.82rem', color:'var(--text3)' }}>{u.email}</div>
                    </div>
                    {/* Role badge */}
                    <span style={{ padding:'3px 12px', borderRadius:99, fontSize:'.72rem', fontWeight:700, background:rm.bg, color:rm.color, whiteSpace:'nowrap' }}>
                      {rm.label}
                    </span>
                    {/* Dept if dept admin */}
                    {u.role === 'department_admin' && u.department && (
                      <span style={{ fontSize:'.8rem', color:'var(--text2)', background:'var(--surface2)', padding:'2px 10px', borderRadius:6, border:'1px solid var(--border)' }}>
                        {typeof u.department === 'object' ? u.department.name : u.department}
                      </span>
                    )}
                    {/* Active status */}
                    <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'.72rem', fontWeight:700, background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#166534' : '#991b1b' }}>
                      {u.isActive ? '● Active' : '● Inactive'}
                    </span>
                    {/* Expand chevron */}
                    <span style={{ color:'var(--text3)', fontSize:'.85rem', transform: isExpanded ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>▼</span>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ padding:'1rem 1.1rem 1.25rem', background:'var(--surface2)', borderTop:'1px solid var(--border)' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'.75rem', marginBottom:'1rem' }}>
                        {[
                          { icon:'📞', label:'Phone',    val: u.phone || 'Not provided' },
                          { icon:'🎭', label:'Role',     val: rm.label },
                          { icon:'🏢', label:'Department', val: u.department ? (typeof u.department === 'object' ? u.department.name : u.department) : 'N/A' },
                          { icon:'📅', label:'Joined',   val: new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) },
                          { icon:'⭐', label:'Civic Score', val: u.civicScore ?? 0 },
                          { icon:'🔐', label:'Status',   val: u.isActive ? 'Active' : 'Deactivated' },
                        ].map(d => (
                          <div key={d.label} style={{ background:'var(--surface)', borderRadius:8, padding:'.65rem .85rem', border:'1px solid var(--border)' }}>
                            <div style={{ fontSize:'.72rem', color:'var(--text3)', marginBottom:'.2rem' }}>{d.icon} {d.label}</div>
                            <div style={{ fontWeight:600, color:'var(--text1)', fontSize:'.88rem' }}>{d.val}</div>
                          </div>
                        ))}
                      </div>
                      <button
                        className={`cx-btn ${u.isActive ? 'cx-btn-danger' : 'cx-btn-ghost'}`}
                        style={{ fontSize:'.85rem' }}
                        onClick={() => toggleActive(u)}
                      >
                        {u.isActive ? '🚫 Deactivate Account' : '✅ Activate Account'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}