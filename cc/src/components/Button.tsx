'use client';

import React, { useState } from 'react';

type ButtonVariant = 'number' | 'operator' | 'equals' | 'special' | 'zero';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  span?: number;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  number: {
    background: 'var(--btn-number)',
    color: 'var(--text-primary)',
  },
  operator: {
    background: 'var(--btn-operator)',
    color: '#fff',
  },
  equals: {
    background: 'var(--btn-equals)',
    color: '#fff',
  },
  special: {
    background: 'var(--btn-special)',
    color: '#fff',
  },
  zero: {
    background: 'var(--btn-number)',
    color: 'var(--text-primary)',
  },
};

const variantHover: Record<ButtonVariant, string> = {
  number: 'var(--btn-number-hover)',
  operator: 'var(--btn-operator-hover)',
  equals: 'var(--btn-equals-hover)',
  special: 'var(--btn-special-hover)',
  zero: 'var(--btn-number-hover)',
};

export default function Button({
  label,
  onClick,
  variant = 'number',
  span = 1,
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);

  const baseStyle: React.CSSProperties = {
    ...variantStyles[variant],
    gridColumn: span > 1 ? `span ${span}` : undefined,
    borderRadius: 'var(--border-radius)',
    fontSize: label.length > 3 ? '1rem' : '1.25rem',
    fontWeight: '500',
    padding: '0',
    height: '64px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: pressed
      ? 'inset 0 2px 6px rgba(0,0,0,0.5)'
      : 'var(--shadow)',
    transform: pressed ? 'scale(0.94)' : 'scale(1)',
    transition: 'transform 0.08s ease, box-shadow 0.08s ease, background 0.15s ease',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    background: pressed ? variantHover[variant] : variantStyles[variant].background as string,
    letterSpacing: '0.02em',
  };

  return (
    <button
      style={baseStyle}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => {
        setPressed(false);
        onClick();
      }}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      aria-label={label}
    >
      {label}
    </button>
  );
}
