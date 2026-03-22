import { useState, useEffect } from 'react';
import { issuesAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const fetchMyIssues = async () => {
    try {
      const res = await issuesAPI.getMyIssues(); // ✅ IMPORTANT
      setMyIssues(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Error fetching user issues:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CALCULATIONS (USER SPECIFIC)
  const total = myIssues.length;
  const reported = myIssues.filter(i => i.status === "reported").length;
  const inProgress = myIssues.filter(i => i.status === "in_progress").length;
  const resolved = myIssues.filter(i => i.status === "resolved").length;

  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>📊 My Dashboard</h1>

      {/* ✅ STATS */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Issues</h3>
          <p>{total}</p>
        </div>

        <div className="analytics-card">
          <h3>Reported</h3>
          <p>{reported}</p>
        </div>

        <div className="analytics-card">
          <h3>In Progress</h3>
          <p>{inProgress}</p>
        </div>

        <div className="analytics-card">
          <h3>Resolved</h3>
          <p>{resolved}</p>
        </div>
      </div>

      {/* ✅ RECENT ISSUES */}
      <div className="recent-section">
        <h2>My Recent Issues</h2>

        {myIssues.length === 0 ? (
          <p>No issues reported yet</p>
        ) : (
          <ul>
            {myIssues.slice(0, 5).map(issue => (
              <li key={issue._id}>
                {issue.title} — {issue.status}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;