import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import '../styles/civix.css';

const DEPARTMENTS = [
  {
    name: 'Roads',
    icon: '🛣️',
    primary: '#d97706',
    light: '#fef3c7',
    mid: '#fde68a',
    dark: '#92400e',
    grad: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    types: ['Pothole', 'Road Damage', 'Footpath Damage', 'Bridge Issue', 'Road Marking', 'Speed Breaker'],
  },
  {
    name: 'Sanitation',
    icon: '🗑️',
    primary: '#059669',
    light: '#d1fae5',
    mid: '#a7f3d0',
    dark: '#065f46',
    grad: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    types: ['Garbage Overflow', 'Open Drain', 'Sewage Leak', 'Public Toilet', 'Street Cleaning', 'Waste Dump'],
  },
  {
    name: 'Electricity',
    icon: '⚡',
    primary: '#ca8a04',
    light: '#fefce8',
    mid: '#fef08a',
    dark: '#713f12',
    grad: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    types: ['Street Light Out', 'Wire Hazard', 'Power Outage', 'Electric Pole Damage', 'Transformer Issue'],
  },
  {
    name: 'Water Supply',
    icon: '💧',
    primary: '#2563eb',
    light: '#dbeafe',
    mid: '#bfdbfe',
    dark: '#1e3a8a',
    grad: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    types: ['Water Leakage', 'No Water Supply', 'Pipe Burst', 'Contaminated Water', 'Low Pressure'],
  },
  {
    name: 'Traffic',
    icon: '🚦',
    primary: '#dc2626',
    light: '#fee2e2',
    mid: '#fecaca',
    dark: '#7f1d1d',
    grad: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    types: ['Signal Fault', 'Road Divider', 'Illegal Parking', 'Missing Sign Board', 'Road Marking Faded'],
  },
  {
    name: 'Environment',
    icon: '🌿',
    primary: '#16a34a',
    light: '#f0fdf4',
    mid: '#bbf7d0',
    dark: '#14532d',
    grad: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    types: ['Tree Fallen', 'Air Pollution', 'Water Pollution', 'Park Maintenance', 'Stagnant Water', 'Noise Pollution'],
  },
];

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [dept, setDept] = useState(null);
  const [form, setForm] = useState({ title: '', descriptionText: '', issueType: '', severity: 'medium' });
  const [coords, setCoords] = useState({ lat: 17.6868, lng: 83.2185 });
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredDept, setHoveredDept] = useState(null);
  const fileRef = useRef(null);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  // Apply page bg color based on hovered or selected dept
  const activeDept = dept || hoveredDept;
  const pageBg = activeDept ? activeDept.light : '#f8f7ff';

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) { setError('Only image files allowed'); return; }
    setPhoto(file); setPreviewUrl(URL.createObjectURL(file)); setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) { setPhoto(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const removePhoto = () => {
    setPhoto(null); setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = null;
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (form.descriptionText.length < 20) return 'Description must be at least 20 characters';
    if (!form.issueType) return 'Please select an issue type';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('descriptionText', form.descriptionText);
      fd.append('issueCategory', dept.name);
      fd.append('issueType', form.issueType);
      fd.append('severity', form.severity);
      fd.append('location[area]', 'User reported area');
      fd.append('location[address]', 'Not specified');
      fd.append('location[coordinates][lat]', coords.lat);
      fd.append('location[coordinates][lng]', coords.lng);
      if (photo) fd.append('photo', photo);
      await issuesAPI.createIssue(fd);
      navigate('/my-complaints');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to submit. Please try again.');
    } finally { setLoading(false); }
  };

  // ─────────────────────────────────────────
  // STEP 1 — Department picker
  // ─────────────────────────────────────────
  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', background: pageBg, transition: 'background 0.4s ease', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: activeDept ? activeDept.grad : 'linear-gradient(135deg,#5b4fcf,#7c3aed)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', boxShadow: `0 10px 30px ${activeDept ? activeDept.primary + '55' : 'rgba(91,79,207,.35)'}`,
              marginBottom: '1rem', transition: 'all 0.4s ease',
            }}>
              {activeDept ? activeDept.icon : '📢'}
            </div>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: '2rem', fontWeight: 800, color: activeDept ? activeDept.dark : '#1a1535', marginBottom: '.4rem', transition: 'color 0.3s' }}>
              Report a Civic Issue
            </h1>
            <p style={{ color: activeDept ? activeDept.primary : '#8b87a8', fontWeight: 500, transition: 'color 0.3s' }}>
              {activeDept ? `You selected: ${activeDept.name}` : 'Hover or click a department to get started'}
            </p>
          </div>

          {/* Department cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {DEPARTMENTS.map(d => {
              const isHovered = hoveredDept?.name === d.name;
              return (
                <div
                  key={d.name}
                  onClick={() => { setDept(d); setForm(p => ({ ...p, issueType: '' })); setStep(2); }}
                  onMouseEnter={() => setHoveredDept(d)}
                  onMouseLeave={() => setHoveredDept(null)}
                  style={{
                    background: isHovered ? d.grad : '#ffffff',
                    borderRadius: 16,
                    border: `2px solid ${isHovered ? 'transparent' : '#e4e1f7'}`,
                    padding: '1.4rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: isHovered ? `0 12px 36px ${d.primary}44` : '0 2px 8px rgba(0,0,0,.05)',
                    transform: isHovered ? 'translateY(-5px) scale(1.02)' : 'none',
                  }}
                >
                  <div style={{
                    width: 54, height: 54, borderRadius: 14,
                    background: isHovered ? 'rgba(255,255,255,0.25)' : d.light,
                    border: `2px solid ${isHovered ? 'rgba(255,255,255,0.4)' : d.mid}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem', flexShrink: 0, transition: 'all 0.25s',
                  }}>
                    {d.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.05rem', color: isHovered ? '#fff' : '#1a1535', marginBottom: '.2rem', transition: 'color 0.2s' }}>
                      {d.name}
                    </div>
                    <div style={{ fontSize: '.78rem', color: isHovered ? 'rgba(255,255,255,0.8)' : '#8b87a8', lineHeight: 1.4, transition: 'color 0.2s' }}>
                      {d.types.slice(0, 2).join(', ')}…
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '.85rem', color: activeDept ? activeDept.primary : '#8b87a8', transition: 'color 0.3s', fontWeight: 500 }}>
            🤖 Our AI will verify and route your issue to the correct department automatically
          </p>
        </div>
      </div>
    );
  }


  const labelStyle = {
    display: 'block',
    fontSize: '1rem',
    fontWeight: 700,
    color: dept ? dept.dark : 'var(--text1)',
    marginBottom: '.5rem',
    fontFamily: 'Syne, sans-serif',
  };

  // ─────────────────────────────────────────
  // STEP 2 — Issue details form (themed)
  // ─────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${dept.light} 0%, #f8f7ff 40%)`, transition: 'background 0.4s', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Back button */}
        <button
          onClick={() => { setStep(1); setDept(null); setError(''); }}
          style={{ background: 'none', border: 'none', color: dept.primary, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: '.95rem', padding: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}
        >
          ← Back to Departments
        </button>

        {/* Dept header banner */}
        <div style={{ background: dept.grad, borderRadius: 18, padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: `0 10px 32px ${dept.primary}44` }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '2px solid rgba(255,255,255,0.3)' }}>
            {dept.icon}
          </div>
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>{dept.name} Department</div>
            <div style={{ fontSize: '.85rem', color: 'rgba(255,255,255,0.8)', marginTop: '.2rem' }}>Fill in the details and we'll get it fixed</div>
          </div>
        </div>

        {/* Form card */}
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: `0 4px 24px ${dept.primary}22`, border: `1px solid ${dept.mid}`, overflow: 'hidden' }}>
          <div style={{ padding: '2rem' }}>
            {error && <div className="cx-error">{error}</div>}

            <form onSubmit={handleSubmit}>

              {/* Title */}
              <div style={{ marginBottom: '1.4rem' }}>
                <label style={labelStyle}>Issue Title <span style={{color:"#ef4444"}}>*</span></label>
                <input
                  className="cx-input"
                  style={{ borderColor: form.title ? dept.primary : undefined, '--focus-color': dept.primary }}
                  placeholder={`e.g. ${dept.types[0]} near main road`}
                  value={form.title} onChange={set('title')} maxLength={120} required
                />
                <div style={{ fontSize: '.75rem', color: '#8b87a8', marginTop: '.3rem', textAlign: 'right' }}>{form.title.length}/120</div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.4rem' }}>
                <label style={labelStyle}>Description <span style={{color:"#ef4444"}}>*</span> <span style={{fontWeight:400,fontSize:'.82rem',color:"#8b87a8"}}>(at least 20 characters)</span></label>
                <textarea
                  className="cx-input"
                  style={{ minHeight: 110, resize: 'vertical' }}
                  placeholder="Where exactly? How bad? Who is affected? Any nearby landmark?"
                  value={form.descriptionText} onChange={set('descriptionText')} required
                />
                <div style={{ fontSize: '.75rem', fontWeight: 600, marginTop: '.3rem', textAlign: 'right', color: form.descriptionText.length < 20 ? '#ef4444' : dept.primary }}>
                  {form.descriptionText.length < 20
                    ? `${form.descriptionText.length}/20 — need ${20 - form.descriptionText.length} more chars`
                    : `✓ ${form.descriptionText.length} characters`}
                </div>
              </div>

              {/* Issue Type pills */}
              <div style={{ marginBottom: '1.4rem' }}>
                <label style={labelStyle}>Issue Type <span style={{color:"#ef4444"}}>*</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                  {dept.types.map(t => (
                    <button key={t} type="button" onClick={() => setForm(p => ({ ...p, issueType: t }))}
                      style={{
                        padding: '.45rem 1rem',
                        borderRadius: 99,
                        border: `2px solid ${form.issueType === t ? dept.primary : '#e4e1f7'}`,
                        background: form.issueType === t ? dept.grad : '#f8f7ff',
                        color: form.issueType === t ? '#fff' : '#4b4669',
                        fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: '.84rem',
                        cursor: 'pointer', transition: 'all .15s',
                        boxShadow: form.issueType === t ? `0 4px 12px ${dept.primary}44` : 'none',
                      }}>
                      {form.issueType === t ? '✓ ' : ''}{t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>How severe is it?</label>
                <div style={{ display: 'flex', gap: '.75rem' }}>
                  {[
                    { val: 'low',    emoji: '🟢', label: 'Low',    desc: 'Minor, not urgent',    bg: '#dcfce7', col: '#166534', brd: '#86efac' },
                    { val: 'medium', emoji: '🟡', label: 'Medium', desc: 'Needs attention soon',  bg: '#fef3c7', col: '#92400e', brd: '#fde047' },
                    { val: 'high',   emoji: '🔴', label: 'High',   desc: 'Urgent / safety risk',  bg: '#fee2e2', col: '#991b1b', brd: '#fca5a5' },
                  ].map(s => (
                    <button key={s.val} type="button" onClick={() => setForm(p => ({ ...p, severity: s.val }))}
                      style={{
                        flex: 1, padding: '.7rem .5rem', borderRadius: 12,
                        border: `2px solid ${form.severity === s.val ? s.brd : '#e4e1f7'}`,
                        background: form.severity === s.val ? s.bg : '#f8f7ff',
                        color: form.severity === s.val ? s.col : '#8b87a8',
                        cursor: 'pointer', transition: 'all .2s', textAlign: 'center',
                        boxShadow: form.severity === s.val ? `0 4px 12px ${s.brd}88` : 'none',
                        transform: form.severity === s.val ? 'scale(1.03)' : 'none',
                      }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: '.2rem' }}>{s.emoji}</div>
                      <div style={{ fontWeight: 700, fontSize: '.88rem', fontFamily: 'DM Sans,sans-serif' }}>{s.label}</div>
                      <div style={{ fontSize: '.7rem', marginTop: '.15rem' }}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo upload */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={labelStyle}>Photo <span style={{fontWeight:400,fontSize:'.82rem',color:"#8b87a8"}}>(optional but helps a lot)</span></label>
                {!previewUrl ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    style={{ border: `2px dashed ${dept.mid}`, borderRadius: 12, padding: '1.75rem 1rem', textAlign: 'center', cursor: 'pointer', background: dept.light, transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = dept.primary; e.currentTarget.style.background = dept.mid; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = dept.mid; e.currentTarget.style.background = dept.light; }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>📸</div>
                    <div style={{ fontWeight: 600, color: dept.dark, marginBottom: '.2rem' }}>Click or drag & drop</div>
                    <div style={{ fontSize: '.78rem', color: dept.primary }}>PNG, JPG up to 5MB</div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                  </div>
                ) : (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                    <img src={previewUrl} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 60%)' }} />
                    <button type="button" onClick={removePhoto}
                      style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer' }}>
                      ✕ Remove
                    </button>
                    <div style={{ position: 'absolute', bottom: 10, left: 12, color: '#fff', fontSize: '.82rem', fontWeight: 600 }}>📎 Photo attached</div>
                  </div>
                )}
              </div>

              {/* AI note */}
              <div style={{ background: dept.light, border: `1px solid ${dept.mid}`, borderRadius: 10, padding: '.9rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '.75rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🤖</span>
                <span style={{ fontSize: '.84rem', color: dept.dark, lineHeight: 1.5 }}>
                  <strong>AI routing:</strong> This will be sent to the <strong>{dept.name}</strong> department. Our AI will verify and may reassign if needed.
                </span>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '.95rem', border: 'none', borderRadius: 12,
                  background: dept.grad, color: '#fff',
                  fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: '1.05rem',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  boxShadow: `0 6px 20px ${dept.primary}55`, transition: 'all .2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                }}>
                {loading ? 'Submitting…' : `${dept.icon} Submit to ${dept.name} Department`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}