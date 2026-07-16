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
import './realtime-dashboard.scss';

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
    <div className="realtime-dashboard">
      {/* Header */}
      <div className="realtime-dashboard__header">
        <div className="realtime-dashboard__header-top">
          <div>
            <h1 className="realtime-dashboard__title">REALTIME MARKET DATA</h1>
            <div className="realtime-dashboard__subtitle">
              <div className="realtime-dashboard__status-indicator">
                <div
                  className={`realtime-dashboard__status-dot ${
                    isConnected
                      ? 'realtime-dashboard__status-dot--connected'
                      : 'realtime-dashboard__status-dot--disconnected'
                  }`}
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
        <div className="realtime-dashboard__stats-grid">
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
      <div className="realtime-dashboard__table-header" role="row">
        <div
          role="columnheader"
          className="realtime-dashboard__column-header realtime-dashboard__column-header--id"
        >
          ID
        </div>
        <div
          role="columnheader"
          className="realtime-dashboard__column-header realtime-dashboard__column-header--name"
        >
          Asset Name
        </div>
        <div
          role="columnheader"
          className="realtime-dashboard__column-header realtime-dashboard__column-header--value"
        >
          Value
        </div>
        <div
          role="columnheader"
          className="realtime-dashboard__column-header realtime-dashboard__column-header--change"
        >
          Change
        </div>
        <div
          role="columnheader"
          className="realtime-dashboard__column-header realtime-dashboard__column-header--status"
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
        className="realtime-dashboard__table-container"
      >
        <div
          role="rowgroup"
          className="realtime-dashboard__table-body"
          style={{
            height: `${data.length * ROW_HEIGHT}px`,
          }}
        >
          {visibleData.map((row, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <VirtualRow
                key={row.id}
                data={row}
                isFlashing={flashingRows.has(row.id)}
                className="realtime-dashboard__row"
                style={{
                  top: `${actualIndex * ROW_HEIGHT}px`,
                  height: `${ROW_HEIGHT}px`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
