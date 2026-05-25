import React from 'react';

interface RowData {
  id: number;
  change: number;
  status: string; //'critical' | 'warning' | 'normal';
  name: string;
  value: number;
}

interface VirtualRowProps {
  data: RowData;
  style: React.CSSProperties;
  isFlashing: boolean;
}

// Virtualized row component
const VirtualRow: React.FC<VirtualRowProps> = ({ data, style, isFlashing }) => {
  const changeColor =
    data.change > 0 ? '#00ff88' : data.change < 0 ? '#ff4466' : '#888';
  const statusColor =
    data.status === 'critical'
      ? '#ff4466'
      : data.status === 'warning'
      ? '#ffaa00'
      : '#00ff88';

  return (
    <div
      role="row"
      aria-label={`Asset ${data.name}, Value $${data.value.toFixed(
        2
      )}, Change ${data.change.toFixed(2)}%, Status ${data.status}`}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'background-color 0.3s ease',
        backgroundColor: isFlashing ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
      }}
    >
      <div
        role="cell"
        style={{
          flex: '0 0 100px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#666',
        }}
      >
        #{data.id.toString().padStart(5, '0')}
      </div>
      <div
        role="cell"
        style={{ flex: '1 1 auto', fontWeight: '600', fontSize: '15px' }}
      >
        {data.name}
      </div>
      <div
        role="cell"
        style={{
          flex: '0 0 150px',
          textAlign: 'right',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '16px',
        }}
      >
        ${data.value.toFixed(2)}
      </div>
      <div
        role="cell"
        style={{
          flex: '0 0 120px',
          textAlign: 'right',
          fontFamily: 'JetBrains Mono, monospace',
          color: changeColor,
          fontWeight: '600',
        }}
      >
        {data.change > 0 ? '+' : ''}
        {data.change.toFixed(2)}%
      </div>
      <div role="cell" style={{ flex: '0 0 100px', textAlign: 'right' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            backgroundColor: statusColor + '22',
            color: statusColor,
            border: `1px solid ${statusColor}`,
          }}
        >
          {data.status}
        </span>
      </div>
    </div>
  );
};

export default VirtualRow;
