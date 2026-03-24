import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { departmentAPI } from '../../services/api';
import '../../styles/civix.css';

const DEPT_INFO = {
  Roads: {
    icon: '🛣️',
    grad: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    light: '#fef3c7',
    dark: '#92400e',
    description: 'The Roads Department is responsible for maintaining all public roads, footpaths, bridges, and road infrastructure across the city. We handle pothole repairs, road damage, road markings, and ensure safe passage for all citizens.',
    responsibilities: ['Pothole and road damage repair', 'Footpath and sidewalk maintenance', 'Bridge inspection and upkeep', 'Road marking and signage', 'Speed breaker installation', 'Emergency road clearance'],
    contact: { email: 'roads@civix.gov.in', phone: '+91 891-234-5678', office: 'Roads Dept, Municipal Building, Visakhapatnam' },
  },
  Sanitation: {
    icon: '🗑️',
    grad: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    light: '#d1fae5',
    dark: '#065f46',
    description: 'The Sanitation Department ensures clean and hygienic conditions across the city. We manage garbage collection, sewage systems, public toilets, and waste management infrastructure to keep Visakhapatnam clean.',
    responsibilities: ['Daily garbage collection and disposal', 'Sewage and drainage maintenance', 'Public toilet upkeep', 'Open drain cleaning', 'Street sweeping operations', 'Waste segregation drives'],
    contact: { email: 'sanitation@civix.gov.in', phone: '+91 891-234-5679', office: 'Sanitation Dept, Municipal Building, Visakhapatnam' },
  },
  Electricity: {
    icon: '⚡',
    grad: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    light: '#fefce8',
    dark: '#713f12',
    description: 'The Electricity Department manages street lighting, power infrastructure, and electrical safety across public spaces. We ensure well-lit roads and prompt response to electrical hazards affecting citizens.',
    responsibilities: ['Street light installation and repair', 'Electric pole maintenance', 'Transformer upkeep', 'Wire hazard removal', 'Power outage response', 'Public area lighting projects'],
    contact: { email: 'electricity@civix.gov.in', phone: '+91 891-234-5680', office: 'Electricity Dept, Municipal Building, Visakhapatnam' },
  },
  'Water Supply': {
    icon: '💧',
    grad: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    light: '#dbeafe',
    dark: '#1e3a8a',
    description: 'The Water Supply Department ensures clean and reliable water access for all residents. We manage water pipelines, pumping stations, and respond to leakage, contamination, and supply disruption complaints.',
    responsibilities: ['Water pipeline maintenance', 'Leak detection and repair', 'Water quality monitoring', 'Supply schedule management', 'Pump station operations', 'New connection processing'],
    contact: { email: 'water@civix.gov.in', phone: '+91 891-234-5681', office: 'Water Supply Dept, Municipal Building, Visakhapatnam' },
  },
  Traffic: {
    icon: '🚦',
    grad: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    light: '#fee2e2',
    dark: '#7f1d1d',
    description: 'The Traffic Department oversees traffic signal operations, road dividers, parking regulations, and sign boards across the city. We work to ensure smooth and safe traffic flow for all road users in Visakhapatnam.',
    responsibilities: ['Traffic signal maintenance', 'Road divider upkeep', 'Illegal parking enforcement', 'Sign board installation', 'Road marking projects', 'Traffic flow monitoring'],
    contact: { email: 'traffic@civix.gov.in', phone: '+91 891-234-5682', office: 'Traffic Dept, Municipal Building, Visakhapatnam' },
  },
  Environment: {
    icon: '🌿',
    grad: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    light: '#f0fdf4',
    dark: '#14532d',
    description: 'The Environment Department protects and improves the natural environment of Visakhapatnam. We manage parks, trees, pollution control, and respond to environmental hazards to keep the city green and sustainable.',
    responsibilities: ['Tree planting and maintenance', 'Park upkeep and beautification', 'Air and water pollution monitoring', 'Stagnant water removal', 'Noise pollution control', 'Environmental awareness drives'],
    contact: { email: 'environment@civix.gov.in', phone: '+91 891-234-5683', office: 'Environment Dept, Municipal Building, Visakhapatnam' },
  },
};

export default function DepartmentAbout() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentAPI.getStats()
      .then(r => setStats(r.data?.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const info = DEPT_INFO[stats.departmentName] || null;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading) return <div className="cx-page"><div className="cx-spinner" /></div>;

  return (
    <div className="cx-page" style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/department" className="cx-btn cx-btn-ghost" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>← Back to Dashboard</Link>
      </div>

      {/* Hero banner */}
      <div style={{ background: info?.grad || 'var(--grad)', borderRadius: 20, padding: '2.5rem 2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: '8rem', opacity: .12, userSelect: 'none' }}>{info?.icon || '🏢'}</div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '3rem', marginBottom: '.75rem' }}>{info?.icon || '🏢'}</div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '.4rem' }}>
            {stats.departmentName || 'Your'} Department
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', maxWidth: 500 }}>
            {info?.description || 'Municipal department serving the citizens of Visakhapatnam.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Stats card */}
        <div className="cx-card" style={{ padding: '1.5rem' }}>
          <div className="cx-section-title">Issue Statistics</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {[
              { label: 'Total Assigned',  val: stats.total ?? 0,        color: '#5b4fcf' },
              { label: 'Pending',         val: stats.reported ?? 0,     color: '#10b981' },
              { label: 'Acknowledged',    val: stats.acknowledged ?? 0, color: '#3b82f6' },
              { label: 'In Progress',     val: stats.inProgress ?? 0,   color: '#f59e0b' },
              { label: 'Resolved',        val: stats.resolved ?? 0,     color: '#7c3aed' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem .85rem', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '.88rem', color: 'var(--text2)' }}>{s.label}</span>
                </div>
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin info card */}
        <div className="cx-card" style={{ padding: '1.5rem' }}>
          <div className="cx-section-title">Department Admin</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '1rem', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: info?.grad || 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0 }}>
              {(user.name || 'A')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: 'var(--text1)', fontSize: '1rem' }}>{user.name || 'Admin'}</div>
              <div style={{ fontSize: '.82rem', color: 'var(--text3)' }}>{user.email || ''}</div>
              <div style={{ marginTop: '.3rem' }}><span className="cx-badge department_admin">Department Admin</span></div>
            </div>
          </div>

          {/* Contact info */}
          {info?.contact && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {[
                { icon: '📧', val: info.contact.email },
                { icon: '📞', val: info.contact.phone },
                { icon: '🏢', val: info.contact.office },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '.6rem', fontSize: '.84rem', color: 'var(--text2)' }}>
                  <span style={{ flexShrink: 0 }}>{c.icon}</span>
                  <span>{c.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Responsibilities */}
      {info?.responsibilities && (
        <div className="cx-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div className="cx-section-title">Responsibilities</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '.75rem' }}>
            {info.responsibilities.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.65rem', padding: '.7rem .9rem', background: info.light || 'var(--surface2)', borderRadius: 10, border: `1px solid ${info.light || 'var(--border)'}` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: info.dark || 'var(--p1)', flexShrink: 0 }} />
                <span style={{ fontSize: '.86rem', color: info.dark || 'var(--text2)', fontWeight: 500 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow guide */}
      <div className="cx-card" style={{ padding: '1.5rem' }}>
        <div className="cx-section-title">Your Workflow</div>
        <div style={{ display: 'flex', gap: '0', overflowX: 'auto', paddingBottom: '.5rem' }}>
          {[
            { step: '1', icon: '📥', title: 'Issue Reported',    desc: 'Citizen reports an issue — it arrives here as Pending',     color: '#10b981' },
            { step: '2', icon: '✓',  title: 'You Acknowledge',   desc: 'Review the issue and click Acknowledge to accept it',       color: '#3b82f6' },
            { step: '3', icon: '🔧', title: 'Mark In Progress',  desc: 'When work begins, mark the issue as In Progress',           color: '#f59e0b' },
            { step: '4', icon: '⭐', title: 'Admin Resolves',    desc: 'System admin reviews and marks the issue as Resolved',      color: '#7c3aed' },
          ].map((s, i, arr) => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 160 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '.75rem .5rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', margin: '0 auto .6rem', color: '#fff', fontFamily: 'Syne', fontWeight: 800 }}>
                  {s.icon}
                </div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '.88rem', color: 'var(--text1)', marginBottom: '.25rem' }}>{s.title}</div>
                <div style={{ fontSize: '.76rem', color: 'var(--text3)', lineHeight: 1.4 }}>{s.desc}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ color: 'var(--text3)', fontSize: '1.2rem', flexShrink: 0, padding: '0 .25rem' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}