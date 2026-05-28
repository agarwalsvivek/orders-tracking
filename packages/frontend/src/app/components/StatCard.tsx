import './stat-card.scss';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => {
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <div
          className="stat-card__icon-container"
          style={{
            background: `${color}22`,
            color: color,
            borderColor: color,
          }}
        >
          {icon}
        </div>
        <span className="stat-card__label">{label}</span>
      </div>
      <div
        className="stat-card__value"
        style={{
          color: color,
        }}
      >
        {value}
      </div>
    </div>
  );
};

export default StatCard;
