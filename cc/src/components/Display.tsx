'use client';

import React from 'react';

interface DisplayProps {
  expression: string;
  value: string;
}

export default function Display({ expression, value }: DisplayProps) {
  const fontSize =
    value.length > 12 ? '1.4rem' : value.length > 9 ? '1.8rem' : '2.4rem';

  return (
    <div
      style={{
        background: 'var(--bg-display)',
        borderRadius: 'var(--border-radius)',
        padding: '20px 20px 16px',
        marginBottom: '12px',
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '0.85rem',
          color: 'var(--text-expression)',
          minHeight: '20px',
          wordBreak: 'break-all',
          textAlign: 'right',
          marginBottom: '8px',
          opacity: 0.75,
        }}
      >
        {expression || '\u00A0'}
      </div>
      <div
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize,
          color: 'var(--text-display)',
          fontWeight: '300',
          wordBreak: 'break-all',
          textAlign: 'right',
          lineHeight: 1.2,
          transition: 'font-size 0.15s ease',
        }}
      >
        {value}
      </div>
    </div>
  );
}
