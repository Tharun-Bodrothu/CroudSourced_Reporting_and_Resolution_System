import PriorityBadge from './PriorityBadge';
import './IssueCard.css';

function IssueCard({ issue }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="issue-card">
      <div className="card-header">
        <h3>{issue.title || 'Untitled Issue'}</h3>
        <div className="card-badges">
          <PriorityBadge score={issue.priorityScore || 0} />
          <span
            className="severity-badge"
            style={{ backgroundColor: getSeverityColor(issue.severity) }}
          >
            {issue.severity?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
      </div>

      <div className="card-body">
        {issue.aiSummary && (
          <div className="ai-summary">
            <p>{issue.aiSummary}</p>
          </div>
        )}

        <div className="card-meta">
          <span className="meta-item">
            <strong>Department:</strong> {issue.department || 'N/A'}
          </span>
          <span className="meta-item">
            <strong>Status:</strong> {issue.status?.toUpperCase() || 'REPORTED'}
          </span>
          <span className="meta-item">
            <strong>Upvotes:</strong> {issue.upvoteCount || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default IssueCard;