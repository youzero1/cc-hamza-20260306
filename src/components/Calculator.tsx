'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Display from './Display';
import Button from './Button';
import History from './History';
import { calculate } from '@/utils/calculate';

type ButtonDef = {
  label: string;
  action: string;
  variant?: 'number' | 'operator' | 'function' | 'equals';
  isZero?: boolean;
  isSmallText?: boolean;
  isDanger?: boolean;
};

const BUTTONS: ButtonDef[] = [
  { label: 'AC', action: 'AC', variant: 'function' },
  { label: '+/-', action: 'SIGN', variant: 'function' },
  { label: '%', action: '%', variant: 'function' },
  { label: '÷', action: '÷', variant: 'operator' },

  { label: '7', action: '7', variant: 'number' },
  { label: '8', action: '8', variant: 'number' },
  { label: '9', action: '9', variant: 'number' },
  { label: '×', action: '×', variant: 'operator' },

  { label: '4', action: '4', variant: 'number' },
  { label: '5', action: '5', variant: 'number' },
  { label: '6', action: '6', variant: 'number' },
  { label: '−', action: '−', variant: 'operator' },

  { label: '1', action: '1', variant: 'number' },
  { label: '2', action: '2', variant: 'number' },
  { label: '3', action: '3', variant: 'number' },
  { label: '+', action: '+', variant: 'operator' },

  { label: '0', action: '0', variant: 'number', isZero: true },
  { label: '.', action: '.', variant: 'number' },
  { label: '=', action: '=', variant: 'equals' },
];

export default function Calculator() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [hasResult, setHasResult] = useState(false);
  const [lastOp, setLastOp] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const operators = ['÷', '×', '−', '+', '%'];

  const saveCalculation = useCallback(async (expr: string, result: string) => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: expr, result }),
      });
      setHistoryRefresh((n) => n + 1);
    } catch (err) {
      console.error('Failed to save calculation:', err);
    }
  }, []);

  const handleAction = useCallback(
    (action: string) => {
      if (action === 'AC') {
        setExpression('');
        setDisplay('0');
        setHasResult(false);
        setLastOp(null);
        return;
      }

      if (action === 'BACKSPACE') {
        if (hasResult) {
          setExpression('');
          setDisplay('0');
          setHasResult(false);
          return;
        }
        const newExpr = expression.slice(0, -1);
        setExpression(newExpr);
        if (newExpr === '' || newExpr === '-') {
          setDisplay('0');
        } else {
          const lastNum = newExpr.split(/[÷×−+%]/).pop() || '0';
          setDisplay(lastNum || '0');
        }
        return;
      }

      if (action === 'SIGN') {
        if (display === '0' && expression === '') return;
        if (hasResult) {
          const negated = display.startsWith('-') ? display.slice(1) : '-' + display;
          setDisplay(negated);
          setExpression(negated);
          return;
        }
        // Negate last number in expression
        const parts = expression.split(/(?<=[÷×−+])/); // split after operator
        if (parts.length > 0) {
          const lastPart = parts[parts.length - 1];
          const negated = lastPart.startsWith('-') ? lastPart.slice(1) : '-' + lastPart;
          parts[parts.length - 1] = negated;
          const newExpr = parts.join('');
          setExpression(newExpr);
          setDisplay(negated || '0');
        }
        return;
      }

      const isOp = operators.includes(action);
      const isDigit = /^[0-9]$/.test(action);
      const isDot = action === '.';

      if (action === '=') {
        if (!expression && display === '0') return;
        const fullExpr = expression || display;
        if (!fullExpr) return;

        const result = calculate(fullExpr);
        const displayExpr = fullExpr
          .replace(/÷/g, ' ÷ ')
          .replace(/×/g, ' × ')
          .replace(/−/g, ' − ')
          .replace(/\+/g, ' + ')
          .replace(/  +/g, ' ');

        if (!result.startsWith('Error')) {
          saveCalculation(displayExpr.trim(), result);
        }

        setExpression(displayExpr.trim());
        setDisplay(result);
        setHasResult(true);
        setLastOp(null);
        return;
      }

      if (isOp) {
        setLastOp(action);
        if (hasResult) {
          // continue calculation from result
          const newExpr = display + action;
          setExpression(newExpr);
          setHasResult(false);
          return;
        }

        // Replace trailing operator
        const trimmed = expression.replace(/[÷×−+%]$/, '');
        setExpression(trimmed + action);
        return;
      }

      if (isDigit) {
        if (hasResult) {
          // Start fresh
          setExpression(action);
          setDisplay(action);
          setHasResult(false);
          setLastOp(null);
          return;
        }

        const newExpr = expression + action;
        setExpression(newExpr);

        // Update display with last number segment
        const lastNum = newExpr.split(/[÷×−+]/).pop() || action;
        // Prevent leading zeros
        if (lastNum === '0' + action && action !== '0') {
          const fixedExpr = expression.slice(0, -1) + action;
          setExpression(fixedExpr);
          setDisplay(action);
          return;
        }
        setDisplay(lastNum);
        return;
      }

      if (isDot) {
        if (hasResult) {
          setExpression('0.');
          setDisplay('0.');
          setHasResult(false);
          return;
        }
        // Get last segment
        const segments = expression.split(/[÷×−+]/);
        const lastSeg = segments[segments.length - 1];
        if (lastSeg.includes('.')) return; // already has dot
        const newExpr = expression === '' ? '0.' : expression + '.';
        setExpression(newExpr);
        const lastNum = newExpr.split(/[÷×−+]/).pop() || '0.';
        setDisplay(lastNum);
      }
    },
    [expression, display, hasResult, operators, saveCalculation]
  );

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleAction(e.key);
      } else if (e.key === '.') {
        handleAction('.');
      } else if (e.key === '+') {
        handleAction('+');
      } else if (e.key === '-') {
        handleAction('−');
      } else if (e.key === '*') {
        handleAction('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleAction('÷');
      } else if (e.key === '%') {
        handleAction('%');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleAction('=');
      } else if (e.key === 'Backspace') {
        handleAction('BACKSPACE');
      } else if (e.key === 'Escape') {
        handleAction('AC');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction]);

  const displayExpression = expression
    .replace(/÷/g, ' ÷ ')
    .replace(/×/g, ' × ')
    .replace(/−/g, ' − ')
    .replace(/\+/g, ' + ')
    .replace(/  +/g, ' ')
    .trim();

  return (
    <div className="app-container">
      <Display
        expression={hasResult ? displayExpression : displayExpression.replace(/[÷×−+%]?$/, '')}
        result={display}
        onHistoryToggle={() => setShowHistory(true)}
      />
      <div className="buttons-container">
        {BUTTONS.map((btn, idx) => (
          <Button
            key={idx}
            label={btn.label}
            onClick={() => handleAction(btn.action)}
            variant={btn.variant}
            isZero={btn.isZero}
            isSmallText={btn.isSmallText}
            isDanger={btn.isDanger}
            isActiveOp={!hasResult && btn.action === lastOp}
          />
        ))}
      </div>
      {showHistory && (
        <History
          onClose={() => setShowHistory(false)}
          refreshTrigger={historyRefresh}
        />
      )}
    </div>
  );
}
