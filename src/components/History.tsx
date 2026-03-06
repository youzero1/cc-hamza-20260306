'use client';

import { useState } from 'react';

interface HistoryItem {
  id: number;
  expression: string;
  result: string;
  createdAt: string;
}

interface HistoryProps {
  items: HistoryItem[];
  onClear: () => void;
  onSelect: (result: string) => void;
}

export default function History({ items, onClear, onSelect }: HistoryProps) {
  const [collapsed, setCollapsed] = useState(false);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="history-panel">
      <div className="history-header">
        <span className="history-title">History</span>
        <div className="history-header-actions">
          {!collapsed && items.length > 0 && (
            <button className="history-clear-btn" onClick={onClear}>
              Clear
            </button>
          )}
          <button className="history-toggle-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? 'Show' : 'Hide'}
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="history-list">
          {items.length === 0 ? (
            <div className="history-empty">No history yet</div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => onSelect(item.result)}
              >
                <span className="history-expression">{item.expression}</span>
                <span className="history-result">= {item.result}</span>
                <span className="history-time">{formatTime(item.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
