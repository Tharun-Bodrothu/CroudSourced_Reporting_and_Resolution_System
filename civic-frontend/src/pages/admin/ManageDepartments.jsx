import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/civix.css';

const DEPT_ICONS = { Roads:'🛣️', Sanitation:'🗑️', Electricity:'⚡', 'Water Supply':'💧', Traffic:'🚦', Environment:'🌿' };
const DEPT_COLORS = { Roads:'#f59e0b', Sanitation:'#10b981', Electricity:'#eab308', 'Water Supply':'#3b82f6', Traffic:'#ef4444', Environment:'#16a34a' };

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name:'', contactEmail:'', contactPhone:'' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const setEdit = k => e => setEditForm(p => ({ ...p, [k]: e.target.value }));

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDepartments();
      setDepartments(res.data?.data || []);
    } catch (e) { setError('Failed to load departments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      await adminAPI.createDepartment(form);
      setSuccess(`"${form.name}" department created`);
      setForm({ name:'', contactEmail:'', contactPhone:'' });
      await load();
    } catch (e) { setError(e.response?.data?.message || 'Create failed'); }
    finally { setSaving(false); }
  };

  const saveEdit = async (id) => {
    try {
      await adminAPI.updateDepartment(id, editForm);
      setEditId(null);
      await load();
    } catch (e) { alert(e.response?.data?.message || 'Update failed'); }
  };

  return (
    <div className="cx-page">
      <div className="cx-page-header">
        <h1>Manage Departments</h1>
        <p>Create and manage city departments — {departments.length} active</p>
      </div>

      {/* Create form */}
      <div className="cx-card" style={{ padding:'1.75rem', marginBottom:'1.5rem' }}>
        <div className="cx-section-title">Create New Department</div>
        {error && <div className="cx-error">{error}</div>}
        {success && <div className="cx-success">{success}</div>}
        <form onSubmit={create}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'1rem' }}>
            <div>
              <label className="cx-label">Department Name *</label>
              <input className="cx-input" placeholder="e.g. Roads" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="cx-label">Contact Email</label>
              <input className="cx-input" type="email" placeholder="dept@city.gov.in" value={form.contactEmail} onChange={set('contactEmail')} />
            </div>
            <div>
              <label className="cx-label">Contact Phone</label>
              <input className="cx-input" placeholder="+91 891 234 5678" value={form.contactPhone} onChange={set('contactPhone')} />
            </div>
          </div>
          <button type="submit" className="cx-btn cx-btn-primary" disabled={saving}>
            {saving ? 'Creating…' : '+ Create Department'}
          </button>
        </form>
      </div>

      {/* Department list */}
      <div className="cx-card" style={{ padding:'1.5rem' }}>
        <div className="cx-section-title">All Departments ({departments.length})</div>
        {loading ? <div className="cx-spinner" /> : departments.length === 0 ? (
          <div className="cx-empty">
            <div className="icon">🏢</div>
            <p>No departments yet. Create one above.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
            {departments.map(d => {
              const isEditing = editId === d._id;
              const color = DEPT_COLORS[d.name] || '#5b4fcf';
              return (
                <div key={d._id} style={{ border:`1.5px solid ${color}33`, borderRadius:'var(--radius-sm)', overflow:'hidden' }}>
                  {isEditing ? (
                    /* Edit row */
                    <div style={{ padding:'1rem 1.25rem', background:'var(--surface2)' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'.75rem', marginBottom:'.75rem' }}>
                        <div>
                          <label className="cx-label">Name</label>
                          <input className="cx-input" value={editForm.name||''} onChange={setEdit('name')} />
                        </div>
                        <div>
                          <label className="cx-label">Email</label>
                          <input className="cx-input" value={editForm.contactEmail||''} onChange={setEdit('contactEmail')} />
                        </div>
                        <div>
                          <label className="cx-label">Phone</label>
                          <input className="cx-input" value={editForm.contactPhone||''} onChange={setEdit('contactPhone')} />
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'.5rem' }}>
                        <button className="cx-btn cx-btn-primary" style={{ fontSize:'.85rem' }} onClick={() => saveEdit(d._id)}>Save</button>
                        <button className="cx-btn cx-btn-ghost" style={{ fontSize:'.85rem' }} onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* Display row */
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.25rem', background:'var(--surface)', flexWrap:'wrap' }}>
                      <div style={{ width:48, height:48, borderRadius:12, background:`${color}20`, border:`2px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>
                        {DEPT_ICONS[d.name] || '🏢'}
                      </div>
                      <div style={{ flex:1, minWidth:120 }}>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color:'var(--text1)', fontSize:'1rem' }}>{d.name}</div>
                        <div style={{ fontSize:'.8rem', color:'var(--text3)', marginTop:'.15rem' }}>
                          {d.contactEmail ? `📧 ${d.contactEmail}` : '📧 No email'}
                          {d.contactPhone ? ` · 📞 ${d.contactPhone}` : ' · 📞 No phone'}
                        </div>
                      </div>
                      <button
                        className="cx-btn cx-btn-ghost"
                        style={{ fontSize:'.82rem' }}
                        onClick={() => { setEditId(d._id); setEditForm({ name:d.name, contactEmail:d.contactEmail||'', contactPhone:d.contactPhone||'' }); }}
                      >
                        ✏️ Edit
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