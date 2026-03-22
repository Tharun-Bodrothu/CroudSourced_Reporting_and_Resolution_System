import PriorityBadge from './PriorityBadge';
import './IssueCard.css';
import { useNavigate } from 'react-router-dom';

function IssueCard({ issue }) {
  const navigate = useNavigate();

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
    <div
      className="issue-card"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/issues/${issue._id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/issues/${issue._id}`)}
    >
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
            <strong>Department:</strong>{" "}
            {typeof issue.department === "string"
              ? issue.department
              : issue.department?.name || "N/A"}
          </span>

          <span className="meta-item">
            <strong>Status:</strong>{" "}
            {issue.status?.toUpperCase() || "REPORTED"}
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