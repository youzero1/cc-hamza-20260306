'use client';

import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'number' | 'operator' | 'function' | 'equals';
  isZero?: boolean;
  isSmallText?: boolean;
  isDanger?: boolean;
  isActiveOp?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'number',
  isZero = false,
  isSmallText = false,
  isDanger = false,
  isActiveOp = false,
  className = '',
}) => {
  const classes = [
    'calc-btn',
    `btn-${variant}`,
    isZero ? 'btn-zero' : '',
    isSmallText ? 'btn-small-text' : '',
    isDanger ? 'btn-danger' : '',
    isActiveOp ? 'active-op' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      aria-label={label}
      type="button"
    >
      {label}
    </button>
  );
};

export default Button;
