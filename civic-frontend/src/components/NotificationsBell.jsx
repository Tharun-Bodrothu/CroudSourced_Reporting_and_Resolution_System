import { useEffect, useState } from 'react';
import API from '../services/api';

function NotificationsBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const res = await API.get('/notifications');
      setItems(res.data?.data || res.data || []);
    } catch {
      // ignore errors silently for now
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const unreadCount = items.filter((n) => !n.isRead).length;

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ position: 'relative', marginRight: 12 }}>
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) load();
        }}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span style={{ marginLeft: 4, fontSize: 12 }}>({unreadCount})</span>
        )}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '120%',
            background: 'white',
            color: 'black',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: 8,
            maxHeight: 300,
            overflowY: 'auto',
            width: 260,
            zIndex: 10,
          }}
        >
          <strong>Notifications</strong>
          {items.length === 0 ? (
            <p style={{ marginTop: 8 }}>No notifications yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
              {items.map((n) => (
                <li
                  key={n._id}
                  style={{
                    marginBottom: 6,
                    fontWeight: n.isRead ? 'normal' : 'bold',
                    cursor: 'pointer',
                  }}
                  onClick={() => markRead(n._id)}
                >
                  {n.title || n.type}: {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationsBell;

