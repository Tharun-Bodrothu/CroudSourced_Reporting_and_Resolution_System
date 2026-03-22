import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminAPI.getDepartments();
      setDepartments(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createDepartment({ name, contactEmail, contactPhone });
      setName('');
      setContactEmail('');
      setContactPhone('');
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading departments...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Departments</h2>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}

      <form onSubmit={create} style={{ marginTop: 16 }}>
        <h3>Create Department</h3>
        <input placeholder="Department name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Contact email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} style={{ marginLeft: 8 }} />
        <input placeholder="Contact phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={{ marginLeft: 8 }} />
        <button type="submit" style={{ marginLeft: 8 }}>Create</button>
      </form>

      <section style={{ marginTop: 24 }}>
        <h3>All Departments</h3>
        {departments.length === 0 ? (
          <p>No departments found.</p>
        ) : (
          <ul>
            {departments.map((d) => (
              <li key={d._id}>
                {d.name} — {d.contactEmail || 'no email'} — {d.contactPhone || 'no phone'}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

