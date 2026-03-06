'use client';

import React from 'react';

interface CalculationRecord {
  id: number;
  expression: string;
  result: string;
  createdAt: string;
}

interface HistoryProps {
  records: CalculationRecord[];
  onSelect: (result: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function History({ records, onSelect }: HistoryProps) {
  if (records.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: 'var(--text-expression)',
          fontSize: '0.85rem',
          padding: '20px 0',
          opacity: 0.6,
        }}
      >
        No calculations yet
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        maxHeight: '200px',
        overflowY: 'auto',
        paddingRight: '4px',
      }}
    >
      {records.map((rec) => (
        <button
          key={rec.id}
          onClick={() => onSelect(rec.result)}
          style={{
            background: 'var(--bg-display)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            textAlign: 'right',
            color: 'var(--text-primary)',
            transition: 'background 0.15s ease',
            width: '100%',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              'var(--btn-number-hover)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              'var(--bg-display)')
          }
        >
          <div
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '0.78rem',
              color: 'var(--text-expression)',
              marginBottom: '2px',
              opacity: 0.8,
            }}
          >
            {rec.expression}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--text-expression)', opacity: 0.5 }}>
              {formatDate(rec.createdAt)}
            </span>
            <span
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '1rem',
                color: 'var(--text-display)',
                fontWeight: '600',
              }}
            >
              = {rec.result}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
