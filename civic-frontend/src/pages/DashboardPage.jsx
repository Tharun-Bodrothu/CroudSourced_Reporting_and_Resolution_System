import { useState, useEffect } from 'react';
import { issuesAPI } from '../services/api';
import './DashboardPage.css';

function DashboardPage() {
  const [analytics, setAnalytics] = useState({
    totalIssues: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
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
      console.log('Analytics Response:', analyticsRes);
      console.log('Priority Response:', priorityRes);
      
      setAnalytics(analyticsRes.data?.data || analyticsRes.data || {});
      setPriorityRanking(priorityRes.data?.data || priorityRes.data || []);
    } catch (err) {
      console.error('Dashboard Error:', err);
      console.error('Error Details:', err.response?.data);
      setError(err.response?.data?.message || 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-container"><div className="loading">Loading dashboard...</div></div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="analytics-cards">
        <div className="analytics-card">
          <h3>Total Issues</h3>
          <p className="analytics-value">{analytics.totalIssues || 0}</p>
        </div>
        <div className="analytics-card">
          <h3>High Priority</h3>
          <p className="analytics-value high">{analytics.highPriority || 0}</p>
        </div>
        <div className="analytics-card">
          <h3>Medium Priority</h3>
          <p className="analytics-value medium">{analytics.mediumPriority || 0}</p>
        </div>
        <div className="analytics-card">
          <h3>Low Priority</h3>
          <p className="analytics-value low">{analytics.lowPriority || 0}</p>
        </div>
      </div>

      <div className="ranking-section">
        <h2>Priority Ranking</h2>
        {priorityRanking.length === 0 ? (
          <p>No issues reported yet</p>
        ) : (
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Title</th>
                <th>Priority Score</th>
                <th>Severity</th>
                <th>Upvotes</th>
              </tr>
            </thead>
            <tbody>
              {priorityRanking.map((issue, index) => (
                <tr key={issue._id}>
                  <td className="rank">{index + 1}</td>
                  <td className="title">{issue.title}</td>
                  <td className="score">{issue.priorityScore}/10</td>
                  <td>
                    <span className={`severity ${issue.severity}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                  </td>
                  <td>{issue.upvoteCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;