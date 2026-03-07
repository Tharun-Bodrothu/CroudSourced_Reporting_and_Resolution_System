import { useState, useEffect } from 'react';
import { issuesAPI } from '../services/api';
import IssueCard from '../components/IssueCard';
import './IssuesListPage.css';

function IssuesListPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await issuesAPI.getAllIssues();
      setIssues(response.data?.data || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch issues');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    return issue.severity === filter;
  });

  return (
    <div className="issues-container">
      <div className="issues-header">
        <h1>🏘️ CiviX Issues</h1>
        <p className="subtitle">Track and resolve community issues</p>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Issues
          </button>
          <button
            className={`filter-btn high ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            🔴 High Priority
          </button>
          <button
            className={`filter-btn medium ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter('medium')}
          >
            🟡 Medium Priority
          </button>
          <button
            className={`filter-btn low ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            🟢 Low Priority
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading issues...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="no-issues">
          <p>No issues found</p>
        </div>
      ) : (
        <>
          <p className="issue-count">Found {filteredIssues.length} issue(s)</p>
          <div className="issues-grid">
            {filteredIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default IssuesListPage;
