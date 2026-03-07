import './PriorityBadge.css';

function PriorityBadge({ score }) {
  const getColor = (score) => {
    if (score <= 3) return 'green';
    if (score <= 6) return 'yellow';
    if (score <= 8) return 'orange';
    return 'red';
  };

  return (
    <span className={`priority-badge priority-${getColor(score)}`}>
      {score}/10
    </span>
  );
}

export default PriorityBadge;
