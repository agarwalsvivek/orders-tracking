import { useState, useRef, useEffect, useMemo } from 'react';

import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
} from 'lucide-react';
import MockWebSocket, { TOTAL_ROWS } from './MockWebSocket';
import StatCard from './StatCard';
import VirtualRow from './VirtualRow';

// Main Dashboard Component
export default function RealtimeDashboard() {
  const [data, setData] = useState(() =>
    Array.from({ length: TOTAL_ROWS }, (_, i) => ({
      id: i,
      name: `Asset ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26)}`,
      value: Math.random() * 10000,
      change: (Math.random() - 0.5) * 100,
      status:
        Math.random() > 0.7
          ? 'critical'
          : Math.random() > 0.4
          ? 'warning'
          : 'normal',
      timestamp: Date.now(),
    }))
  );
  const [flashingRows, setFlashingRows] = useState(new Set());
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const wsRef = useRef<MockWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // initial data is created lazily in useState to avoid setting state inside an effect

  // WebSocket connection
  useEffect(() => {
    wsRef.current = new MockWebSocket((updates) => {
      setData((prevData) => {
        const newData = [...prevData];
        const updatedIds = new Set();

        updates.forEach((update) => {
          if (update.id < newData.length) {
            newData[update.id] = {
              ...newData[update.id],
              value: update.value,
              change: update.change,
              status: update.status,
              timestamp: update.timestamp,
            };
            updatedIds.add(update.id);
          }
        });

        // Flash updated rows
        setFlashingRows(updatedIds);
        setTimeout(() => setFlashingRows(new Set()), 300);

        return newData;
      });
    });

    wsRef.current.connect();
    // avoid calling setState synchronously inside effect to prevent cascading renders
    setTimeout(() => setIsConnected(true), 0);

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, []);

  const stats = useMemo(() => {
    const totalValue = data.reduce((sum, row) => sum + row.value, 0);
    const avgChange =
      data.length > 0
        ? data.reduce((sum, row) => sum + row.change, 0) / data.length
        : 0;
    const criticalCount = data.filter(
      (row) => row.status === 'critical'
    ).length;

    return {
      totalValue,
      avgChange,
      criticalCount,
      activeRows: data.length,
    };
  }, [data]);

  // Virtual scrolling
  const ROW_HEIGHT = 56;
  const VISIBLE_ROWS = 15;
  const BUFFER_SIZE = 5;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE
    );
    const endIndex = Math.min(
      data.length,
      Math.ceil((scrollTop + VISIBLE_ROWS * ROW_HEIGHT) / ROW_HEIGHT) +
        BUFFER_SIZE
    );
    return { startIndex, endIndex };
  }, [scrollTop, data.length]);

  const visibleData = useMemo(() => {
    return data.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [data, visibleRange]);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '32px 40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '800',
                letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #00ff88 0%, #00ccff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              REALTIME MARKET DATA
            </h1>
            <div
              style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13px',
                color: '#888',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isConnected ? '#00ff88' : '#ff4466',
                    boxShadow: `0 0 10px ${
                      isConnected ? '#00ff88' : '#ff4466'
                    }`,
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
                <span>{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
              </div>
              <span>•</span>
              <span>{TOTAL_ROWS.toLocaleString()} ASSETS</span>
              <span>•</span>
              <span>LIVE UPDATES</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginTop: '24px',
          }}
        >
          <StatCard
            icon={<DollarSign size={20} />}
            label="Total Value"
            value={`$${(stats.totalValue / 1000000).toFixed(2)}M`}
            color="#00ff88"
          />
          <StatCard
            icon={
              stats.avgChange >= 0 ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )
            }
            label="Avg Change"
            value={`${stats.avgChange >= 0 ? '+' : ''}${stats.avgChange.toFixed(
              2
            )}%`}
            color={stats.avgChange >= 0 ? '#00ff88' : '#ff4466'}
          />
          <StatCard
            icon={<Activity size={20} />}
            label="Critical Alerts"
            value={stats.criticalCount.toString()}
            color="#ff4466"
          />
          <StatCard
            icon={<Users size={20} />}
            label="Active Rows"
            value={stats.activeRows.toLocaleString()}
            color="#00ccff"
          />
        </div>
      </div>

      {/* Table Header */}
      <div
        role="row"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 24px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '2px solid rgba(0, 255, 136, 0.3)',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#888',
        }}
      >
        <div role="columnheader" style={{ flex: '0 0 100px' }}>
          ID
        </div>
        <div role="columnheader" style={{ flex: '1 1 auto' }}>
          Asset Name
        </div>
        <div
          role="columnheader"
          style={{ flex: '0 0 150px', textAlign: 'right' }}
        >
          Value
        </div>
        <div
          role="columnheader"
          style={{ flex: '0 0 120px', textAlign: 'right' }}
        >
          Change
        </div>
        <div
          role="columnheader"
          style={{ flex: '0 0 100px', textAlign: 'right' }}
        >
          Status
        </div>
      </div>

      {/* Virtualized Table */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        role="table"
        aria-label="Real-time market data table"
        aria-rowcount={data.length}
        style={{
          height: `calc(100vh - 320px)`,
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <div
          role="rowgroup"
          style={{
            height: `${data.length * ROW_HEIGHT}px`,
            position: 'relative',
          }}
        >
          {visibleData.map((row, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <VirtualRow
                key={row.id}
                data={row}
                isFlashing={flashingRows.has(row.id)}
                style={{
                  position: 'absolute',
                  top: `${actualIndex * ROW_HEIGHT}px`,
                  left: 0,
                  right: 0,
                  height: `${ROW_HEIGHT}px`,
                }}
              />
            );
          })}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        
        div::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 136, 0.3);
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 136, 0.5);
        }
      `}</style>
    </div>
  );
}
