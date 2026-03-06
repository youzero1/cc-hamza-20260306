'use client';

import { useState } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  type?: 'number' | 'operator' | 'function' | 'clear' | 'equal';
  wide?: boolean;
  active?: boolean;
}

export default function Button({ label, onClick, type = 'number', wide = false, active = false }: ButtonProps) {
  const [pressed, setPressed] = useState(false);

  const handlePointerDown = () => setPressed(true);
  const handlePointerUp = () => {
    setPressed(false);
    onClick();
  };
  const handlePointerLeave = () => setPressed(false);

  let className = `calc-btn ${type}`;
  if (wide) className += ' zero';
  if (pressed) className += ' pressed';
  if (active) className += ' active';

  return (
    <button
      className={className}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      aria-label={label}
    >
      {label}
    </button>
  );
}
