/* ── LoginPage.jsx ── */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/civix.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'department_admin') navigate('/department');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return <AuthLayout title="Welcome back" subtitle="Sign in to your CiviX account">
    <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {error && <div className="cx-error">{error}</div>}
      <div>
        <label style={labelStyle}>Email</label>
        <input className="cx-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label style={labelStyle}>Password</label>
        <input className="cx-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" className="cx-btn cx-btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:'.75rem', marginTop:'.25rem', fontSize:'1rem' }}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
    <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'.9rem', color:'var(--text3)' }}>
      No account? <Link to="/register" style={{ color:'var(--p1)', fontWeight:600, textDecoration:'none' }}>Register here</Link>
    </p>
  </AuthLayout>;
}

export function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.register(form.name, form.email, form.phone, form.password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return <AuthLayout title="Create account" subtitle="Join CiviX and report civic issues">
    <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {error && <div className="cx-error">{error}</div>}
      {[
        { k:'name',     label:'Full Name',     type:'text',     placeholder:'John Doe' },
        { k:'email',    label:'Email',          type:'email',    placeholder:'you@example.com' },
        { k:'phone',    label:'Phone',          type:'tel',      placeholder:'+91 98765 43210' },
        { k:'password', label:'Password',       type:'password', placeholder:'Min. 8 characters' },
      ].map(f => (
        <div key={f.k}>
          <label style={labelStyle}>{f.label}</label>
          <input className="cx-input" type={f.type} placeholder={f.placeholder} value={form[f.k]} onChange={set(f.k)} required />
        </div>
      ))}
      <button type="submit" className="cx-btn cx-btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:'.75rem', marginTop:'.25rem', fontSize:'1rem' }}>
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
    <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'.9rem', color:'var(--text3)' }}>
      Already registered? <Link to="/login" style={{ color:'var(--p1)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
    </p>
  </AuthLayout>;
}

/* ── Shared auth layout ── */
function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface2)',
      padding: '2rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56, height: 56,
            borderRadius: 16,
            background: 'var(--grad)',
            fontSize: '1.6rem',
            marginBottom: '.75rem',
            boxShadow: '0 8px 24px rgba(91,79,207,.35)',
          }}>🏛️</div>
          <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.6rem', fontWeight:800, color:'var(--text1)', margin:0 }}>CiviX</h1>
        </div>

        {/* Card */}
        <div className="cx-card" style={{ padding:'2rem' }}>
          <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.25rem', fontWeight:700, color:'var(--text1)', marginBottom:'.25rem' }}>{title}</h2>
          <p style={{ color:'var(--text3)', fontSize:'.88rem', marginBottom:'1.5rem' }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '.78rem',
  fontWeight: 700,
  color: 'var(--text2)',
  textTransform: 'uppercase',
  letterSpacing: '.05em',
  marginBottom: '.4rem',
};

export default LoginPage;