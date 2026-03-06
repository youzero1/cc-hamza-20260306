'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Display from './Display';
import Button from './Button';
import History from './History';

interface CalculationRecord {
  id: number;
  expression: string;
  result: string;
  createdAt: string;
}

type ButtonVariant = 'number' | 'operator' | 'equals' | 'special' | 'zero';

interface ButtonConfig {
  label: string;
  action: () => void;
  variant: ButtonVariant;
  span?: number;
}

export default function Calculator() {
  const [displayValue, setDisplayValue] = useState('0');
  const [expression, setExpression] = useState('');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.calculations || []);
      }
    } catch {
      // silently fail
    }
  }

  async function saveCalculation(expr: string, result: string) {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: expr, result }),
      });
      fetchHistory();
    } catch {
      // silently fail
    }
  }

  const inputDigit = useCallback(
    (digit: string) => {
      if (waitingForOperand || justCalculated) {
        setDisplayValue(digit);
        setWaitingForOperand(false);
        setJustCalculated(false);
      } else {
        setDisplayValue((prev) =>
          prev === '0' ? digit : prev.length < 15 ? prev + digit : prev
        );
      }
    },
    [waitingForOperand, justCalculated]
  );

  const inputDecimal = useCallback(() => {
    if (waitingForOperand || justCalculated) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      setJustCalculated(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue((prev) => prev + '.');
    }
  }, [waitingForOperand, justCalculated, displayValue]);

  const clear = useCallback(() => {
    setDisplayValue('0');
    setExpression('');
    setStoredValue(null);
    setPendingOp(null);
    setWaitingForOperand(false);
    setJustCalculated(false);
  }, []);

  const toggleSign = useCallback(() => {
    setDisplayValue((prev) =>
      prev.startsWith('-') ? prev.slice(1) : prev === '0' ? '0' : '-' + prev
    );
  }, []);

  const inputPercent = useCallback(() => {
    const val = parseFloat(displayValue);
    if (!isNaN(val)) {
      setDisplayValue(String(val / 100));
    }
  }, [displayValue]);

  const inputSqrt = useCallback(() => {
    const val = parseFloat(displayValue);
    if (val < 0) {
      setDisplayValue('Error');
      return;
    }
    const result = Math.sqrt(val);
    const resultStr = formatResult(result);
    const expr = `√(${displayValue})`;
    setDisplayValue(resultStr);
    setExpression(expr + ' =');
    setJustCalculated(true);
    saveCalculation(expr, resultStr);
  }, [displayValue]);

  function performOperation(
    a: number,
    op: string,
    b: number
  ): number | 'Error' {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        if (b === 0) return 'Error';
        return a / b;
      default:
        return b;
    }
  }

  function formatResult(val: number): string {
    if (!isFinite(val)) return 'Error';
    const str = String(val);
    if (str.length <= 15) return str;
    return parseFloat(val.toPrecision(10)).toString();
  }

  const handleOperator = useCallback(
    (op: string) => {
      const current = parseFloat(displayValue);

      if (storedValue !== null && pendingOp && !waitingForOperand) {
        const result = performOperation(storedValue, pendingOp, current);
        if (result === 'Error') {
          const expr = `${storedValue} ${pendingOp} ${current}`;
          setDisplayValue('Error');
          setExpression(expr + ' = Error');
          setStoredValue(null);
          setPendingOp(null);
          setWaitingForOperand(true);
          setJustCalculated(false);
          return;
        }
        const resultStr = formatResult(result);
        const expr = `${storedValue} ${pendingOp} ${current}`;
        setDisplayValue(resultStr);
        setExpression(expr + ' ' + op);
        setStoredValue(result);
      } else {
        setStoredValue(current);
        setExpression(displayValue + ' ' + op);
      }
      setPendingOp(op);
      setWaitingForOperand(true);
      setJustCalculated(false);
    },
    [displayValue, storedValue, pendingOp, waitingForOperand]
  );

  const calculate = useCallback(() => {
    if (storedValue === null || pendingOp === null) return;
    const current = parseFloat(displayValue);
    if (isNaN(current)) return;

    const result = performOperation(storedValue, pendingOp, current);
    const expr = `${storedValue} ${pendingOp} ${current}`;

    if (result === 'Error') {
      setDisplayValue('Error');
      setExpression(expr + ' = Error');
      setStoredValue(null);
      setPendingOp(null);
      setWaitingForOperand(true);
      setJustCalculated(false);
      saveCalculation(expr, 'Error');
      return;
    }

    const resultStr = formatResult(result);
    setDisplayValue(resultStr);
    setExpression(expr + ' =');
    setStoredValue(null);
    setPendingOp(null);
    setWaitingForOperand(false);
    setJustCalculated(true);
    saveCalculation(expr, resultStr);
  }, [storedValue, pendingOp, displayValue]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const { key } = e;

      if (key >= '0' && key <= '9') {
        inputDigit(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+') {
        handleOperator('+');
      } else if (key === '-') {
        handleOperator('-');
      } else if (key === '*') {
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (key === 'Enter' || key === '=') {
        calculate();
      } else if (key === 'Escape') {
        clear();
      } else if (key === 'Backspace') {
        if (!waitingForOperand && !justCalculated) {
          setDisplayValue((prev) =>
            prev.length > 1 ? prev.slice(0, -1) : '0'
          );
        }
      } else if (key === '%') {
        inputPercent();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, handleOperator, calculate, clear, inputPercent, waitingForOperand, justCalculated]);

  const handleHistorySelect = (result: string) => {
    setDisplayValue(result);
    setJustCalculated(true);
    setWaitingForOperand(false);
  };

  const buttons: ButtonConfig[] = [
    { label: 'AC', action: clear, variant: 'special' },
    { label: '+/-', action: toggleSign, variant: 'special' },
    { label: '%', action: inputPercent, variant: 'special' },
    { label: '÷', action: () => handleOperator('÷'), variant: 'operator' },

    { label: '7', action: () => inputDigit('7'), variant: 'number' },
    { label: '8', action: () => inputDigit('8'), variant: 'number' },
    { label: '9', action: () => inputDigit('9'), variant: 'number' },
    { label: '×', action: () => handleOperator('×'), variant: 'operator' },

    { label: '4', action: () => inputDigit('4'), variant: 'number' },
    { label: '5', action: () => inputDigit('5'), variant: 'number' },
    { label: '6', action: () => inputDigit('6'), variant: 'number' },
    { label: '-', action: () => handleOperator('-'), variant: 'operator' },

    { label: '1', action: () => inputDigit('1'), variant: 'number' },
    { label: '2', action: () => inputDigit('2'), variant: 'number' },
    { label: '3', action: () => inputDigit('3'), variant: 'number' },
    { label: '+', action: () => handleOperator('+'), variant: 'operator' },

    { label: '√', action: inputSqrt, variant: 'special' },
    { label: '0', action: () => inputDigit('0'), variant: 'number' },
    { label: '.', action: inputDecimal, variant: 'number' },
    { label: '=', action: calculate, variant: 'equals' },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '4px',
        }}
      >
        <h1
          style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: 'var(--accent)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {process.env.NEXT_PUBLIC_APP_NAME || 'cc'}
        </h1>
        <button
          onClick={() => setShowHistory((v) => !v)}
          style={{
            background: showHistory ? 'var(--accent)' : 'var(--btn-number)',
            color: '#fff',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '0.8rem',
            fontWeight: '600',
            transition: 'background 0.2s ease',
            letterSpacing: '0.04em',
          }}
        >
          {showHistory ? 'CALC' : 'HISTORY'}
        </button>
      </div>

      <Display expression={expression} value={displayValue} />

      {showHistory ? (
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--border-radius)',
            padding: '12px',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: 'var(--text-expression)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '10px',
              opacity: 0.7,
            }}
          >
            Recent Calculations
          </div>
          <History records={history} onSelect={handleHistorySelect} />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
          }}
        >
          {buttons.map((btn, idx) => (
            <Button
              key={idx}
              label={btn.label}
              onClick={btn.action}
              variant={btn.variant}
              span={btn.span}
            />
          ))}
        </div>
      )}
    </div>
  );
}
