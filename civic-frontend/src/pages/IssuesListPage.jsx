// filepath: c:\Users\K Charan Teja\OneDrive\Desktop\project\civic-frontend\src\pages\IssuesListPage.jsx
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
      console.log('Issues Response:', response);
      setIssues(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Fetch Issues Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch issues');
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
      <h1>CiviX Issues</h1>
        <h1>Civic Issues</h1>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            High
          </button>
          <button
            className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter('medium')}
          >
            Medium
          </button>
          <button
            className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            Low
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading issues...</div>
      ) : filteredIssues.length === 0 ? (
        <div className="no-issues">No issues found</div>
      ) : (
        <div className="issues-grid">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

export default IssuesListPage;