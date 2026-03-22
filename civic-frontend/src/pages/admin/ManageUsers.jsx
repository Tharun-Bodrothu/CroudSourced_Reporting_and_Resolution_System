import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminAPI.getUsers();
      setUsers(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (u) => {
    try {
      await adminAPI.setUserActive({ userId: u._id, isActive: !u.isActive });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading users...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Users</h2>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table style={{ marginTop: 16, width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">Email</th>
              <th align="left">Role</th>
              <th align="left">Active</th>
              <th align="left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => toggleActive(u)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

