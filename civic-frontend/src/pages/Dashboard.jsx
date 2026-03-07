import { useState, useEffect } from 'react';
import { issuesAPI } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import './Dashboard.css';

function Dashboard() {
  const [analytics, setAnalytics] = useState({
    totalIssues: 0,
    reported: 0,
    acknowledged: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [priorityRanking, setPriorityRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsRes, priorityRes] = await Promise.all([
        issuesAPI.getAnalytics(),
        issuesAPI.getPriorityRanking(),
      ]);

      setAnalytics(analyticsRes.data?.data || analyticsRes.data || {});
      setPriorityRanking(priorityRes.data?.data || priorityRes.data || []);
    } catch (err) {
      console.error('Dashboard Error:', err);
      setError(err.response?.data?.message || 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p className="subtitle">CiviX Issue Management System</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Analytics Cards */}
      <div className="analytics-section">
        <h2>Issue Statistics</h2>
        <div className="analytics-grid">
          <div className="analytics-card total">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <p className="card-label">Total Issues</p>
              <h3>{analytics.totalIssues || 0}</h3>
            </div>
          </div>

          <div className="analytics-card reported">
            <div className="card-icon">🆕</div>
            <div className="card-content">
              <p className="card-label">Reported</p>
              <h3>{analytics.reported || 0}</h3>
            </div>
          </div>

          <div className="analytics-card acknowledged">
            <div className="card-icon">👀</div>
            <div className="card-content">
              <p className="card-label">Acknowledged</p>
              <h3>{analytics.acknowledged || 0}</h3>
            </div>
          </div>

          <div className="analytics-card inprogress">
            <div className="card-icon">⚙️</div>
            <div className="card-content">
              <p className="card-label">In Progress</p>
              <h3>{analytics.inProgress || 0}</h3>
            </div>
          </div>

          <div className="analytics-card resolved">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <p className="card-label">Resolved</p>
              <h3>{analytics.resolved || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Ranking Table */}
      <div className="ranking-section">
        <h2>🎯 Priority Ranking</h2>
        {priorityRanking.length === 0 ? (
          <div className="no-data">
            <p>No issues reported yet. Start making a difference!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Issue Title</th>
                  <th>Priority</th>
                  <th>Severity</th>
                  <th>Upvotes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {priorityRanking.slice(0, 10).map((issue, index) => (
                  <tr key={issue._id}>
                    <td className="rank">
                      <span className="rank-badge">{index + 1}</span>
                    </td>
                    <td className="title">{issue.title || 'Untitled'}</td>
                    <td className="priority">
                      <PriorityBadge score={issue.priorityScore || 0} />
                    </td>
                    <td className="severity">
                      <span className={`severity-badge ${issue.severity}`}>
                        {issue.severity?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="upvotes">👍 {issue.upvoteCount || 0}</td>
                    <td className="status">
                      <span className={`status-badge ${issue.status}`}>
                        {issue.status?.toUpperCase() || 'REPORTED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
