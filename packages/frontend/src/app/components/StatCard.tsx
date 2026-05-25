interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${color}22`,
            color: color,
            border: `1px solid ${color}`,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: '#888',
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: '28px',
          fontWeight: '800',
          color: color,
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '-0.5px',
        }}
      >
        {value}
      </div>
    </div>
  );
};

export default StatCard;
