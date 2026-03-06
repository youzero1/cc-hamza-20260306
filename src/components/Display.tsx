'use client';

interface DisplayProps {
  value: string;
  expression: string;
}

export default function Display({ value, expression }: DisplayProps) {
  const getValueClass = () => {
    if (value.length > 12) return 'display-value very-long';
    if (value.length > 8) return 'display-value long';
    return 'display-value';
  };

  return (
    <div className="display-container">
      <div className="display-expression">{expression || '\u00A0'}</div>
      <div className={getValueClass()}>{value}</div>
    </div>
  );
}
