interface Update {
  id: number;
  value: number;
  status: string; //'critical' | 'warning' | 'normal';
  change: number;
  timestamp: number;
}

export const TOTAL_ROWS = 10;

type OnMessageCallback = (updates: Update[]) => void;

// Mock WebSocket for demonstration - simulates real-time data updates
class MockWebSocket {
  private onMessage: OnMessageCallback;
  private interval: NodeJS.Timeout | null;

  constructor(onMessage: OnMessageCallback) {
    this.onMessage = onMessage;
    this.interval = null;
  }

  connect() {
    // Simulate updates every 100ms
    this.interval = setInterval(() => {
      const updates = [];
      const updateCount = Math.floor(Math.random() * 20) + 5; // 5-25 updates per batch

      for (let i = 0; i < updateCount; i++) {
        const rowIndex = Math.floor(Math.random() * TOTAL_ROWS);
        updates.push({
          id: rowIndex,
          value: Math.random() * 10000,
          status:
            Math.random() > 0.7
              ? 'critical'
              : Math.random() > 0.4
              ? 'warning'
              : 'normal',
          change: (Math.random() - 0.5) * 100,
          timestamp: Date.now(),
        });
      }

      this.onMessage(updates);
    }, 400);
  }

  disconnect() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

export default MockWebSocket;
