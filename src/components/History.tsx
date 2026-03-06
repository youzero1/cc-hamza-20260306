'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface CalculationRecord {
  id: number;
  expression: string;
  result: string;
  createdAt: string;
}

interface HistoryProps {
  onClose: () => void;
  refreshTrigger: number;
}

const History: React.FC<HistoryProps> = ({ onClose, refreshTrigger }) => {
  const [records, setRecords] = useState<CalculationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  const handleClear = async () => {
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        setRecords([]);
      }
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="history-overlay" onClick={onClose} />
      <div className="history-panel" role="dialog" aria-label="Calculation history">
        <div className="history-header">
          <span className="history-title">History</span>
          <button
            className="history-clear-btn"
            onClick={handleClear}
            type="button"
            disabled={records.length === 0}
          >
            Clear All
          </button>
          <button
            className="history-close-btn"
            onClick={onClose}
            type="button"
          >
            Done
          </button>
        </div>
        <div className="history-list">
          {loading ? (
            <div className="history-empty">Loading...</div>
          ) : records.length === 0 ? (
            <div className="history-empty">No history yet</div>
          ) : (
            records.map((rec) => (
              <div key={rec.id} className="history-item">
                <div className="history-item-expression">{rec.expression}</div>
                <div className="history-item-result">= {rec.result}</div>
                <div className="history-item-time">{formatTime(rec.createdAt)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default History;
