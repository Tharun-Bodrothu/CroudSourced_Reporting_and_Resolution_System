import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function CreateDepartmentAdmin() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    departmentId: '',
  });

  useEffect(() => {
    const load = async () => {
      const res = await adminAPI.getDepartments();
      setDepartments(res.data?.data || []);
    };
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createDepartmentAdmin(form);
      alert('Department admin created');
      setForm({ name: '', email: '', phone: '', password: '', departmentId: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Department Admin</h2>
      <form onSubmit={submit} style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 520 }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        <select value={form.departmentId} onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}>
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

