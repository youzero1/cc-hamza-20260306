'use client';

import React from 'react';

interface DisplayProps {
  expression: string;
  result: string;
  onHistoryToggle: () => void;
}

const Display: React.FC<DisplayProps> = ({ expression, result, onHistoryToggle }) => {
  const getResultClass = () => {
    if (result.length > 12) return 'display-result xsmall';
    if (result.length > 8) return 'display-result small';
    return 'display-result';
  };

  return (
    <div className="display-container">
      <button
        className="display-history-btn"
        onClick={onHistoryToggle}
        type="button"
        aria-label="Toggle history"
      >
        History
      </button>
      <div className="display-expression" aria-label="expression">
        {expression || '\u00A0'}
      </div>
      <div className={getResultClass()} aria-label="result" aria-live="polite">
        {result}
      </div>
    </div>
  );
};

export default Display;
