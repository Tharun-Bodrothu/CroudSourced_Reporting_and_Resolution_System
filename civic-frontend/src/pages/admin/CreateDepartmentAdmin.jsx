import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/civix.css';

export default function CreateDepartmentAdmin() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', departmentId:'' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    adminAPI.getDepartments().then(r => setDepartments(r.data?.data || [])).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.departmentId) { setError('Please select a department'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await adminAPI.createDepartmentAdmin(form);
      setSuccess(`Department admin "${form.name}" created successfully for ${departments.find(d=>d._id===form.departmentId)?.name}`);
      setForm({ name:'', email:'', phone:'', password:'', departmentId:'' });
    } catch (e) { setError(e.response?.data?.message || 'Create failed'); }
    finally { setSaving(false); }
  };

  const fields = [
    { k:'name',     label:'Full Name',          type:'text',     placeholder:'e.g. Ravi Kumar' },
    { k:'email',    label:'Email Address',       type:'email',    placeholder:'ravi@sanitation.gov.in' },
    { k:'phone',    label:'Phone Number',        type:'tel',      placeholder:'+91 98765 43210' },
    { k:'password', label:'Initial Password',    type:'password', placeholder:'Min. 8 characters' },
  ];

  return (
    <div className="cx-page" style={{ maxWidth:680 }}>
      <div className="cx-page-header">
        <h1>Create Department Admin</h1>
        <p>Assign an admin account to a specific department</p>
      </div>

      <div className="cx-card" style={{ padding:'2rem' }}>
        {error && <div className="cx-error">{error}</div>}
        {success && <div className="cx-success">{success}</div>}

        <form onSubmit={submit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>
            {fields.map(f => (
              <div key={f.k}>
                <label className="cx-label">{f.label}</label>
                <input className="cx-input" type={f.type} placeholder={f.placeholder} value={form[f.k]} onChange={set(f.k)} required />
              </div>
            ))}
          </div>

          <div style={{ marginBottom:'1.5rem' }}>
            <label className="cx-label">Assign to Department *</label>
            <select className="cx-select" style={{ width:'100%', padding:'.75rem 1rem' }} value={form.departmentId} onChange={set('departmentId')} required>
              <option value="">Select a department…</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>

          {/* Preview */}
          {form.departmentId && form.name && (
            <div style={{ background:'var(--surface2)', borderRadius:'var(--radius-sm)', padding:'1rem', border:'1px solid var(--border)', marginBottom:'1.5rem', fontSize:'.88rem', color:'var(--text2)' }}>
              <strong style={{ color:'var(--text1)' }}>Preview:</strong> {form.name} will manage the{' '}
              <strong>{departments.find(d=>d._id===form.departmentId)?.name}</strong> department.
            </div>
          )}

          <button type="submit" className="cx-btn cx-btn-primary" disabled={saving} style={{ width:'100%', justifyContent:'center', padding:'.75rem', fontSize:'1rem' }}>
            {saving ? 'Creating account…' : '+ Create Department Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}