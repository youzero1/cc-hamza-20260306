'use client';

import { useState, useEffect, useCallback } from 'react';
import Display from './Display';
import Button from './Button';
import History from './History';
import { calculate } from '@/utils/calculate';

interface HistoryItem {
  id: number;
  expression: string;
  result: string;
  createdAt: string;
}

type CalcState = 'input' | 'result';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [state, setState] = useState<CalcState>('input');
  const [activeOp, setActiveOp] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const saveHistory = useCallback(async (expr: string, result: string) => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: expr, result }),
      });
      await fetchHistory();
    } catch {
      // silently fail
    }
  }, [fetchHistory]);

  const clearHistory = useCallback(async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistory([]);
    } catch {
      // silently fail
    }
  }, []);

  const handleNumber = useCallback((num: string) => {
    if (state === 'result') {
      setDisplay(num);
      setExpression('');
      setState('input');
      setActiveOp(null);
      return;
    }
    setDisplay(prev => {
      if (prev === '0' && num !== '.') return num;
      if (num === '.' && prev.includes('.')) return prev;
      if (prev.length >= 15) return prev;
      return prev + num;
    });
    setActiveOp(null);
  }, [state]);

  const handleOperator = useCallback((op: string) => {
    setActiveOp(op);
    if (state === 'result') {
      setExpression(display + ' ' + op);
      setState('input');
      setDisplay('0');
      return;
    }
    if (expression && display === '0' && state === 'input') {
      // Replace the last operator
      setExpression(prev => prev.trim().slice(0, -1) + op);
      return;
    }
    setExpression(prev => prev + display + ' ' + op + ' ');
    setDisplay('0');
    setState('input');
  }, [display, expression, state]);

  const handleEqual = useCallback(() => {
    const fullExpr = expression + display;
    const result = calculate(fullExpr);
    const displayExpr = fullExpr.replace(/\*/g, '×').replace(/\//g, '÷');
    setDisplay(result);
    setExpression(displayExpr + ' =');
    setState('result');
    setActiveOp(null);
    if (result !== 'Error') {
      saveHistory(displayExpr, result);
    }
  }, [display, expression, saveHistory]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setState('input');
    setActiveOp(null);
  }, []);

  const handleToggleSign = useCallback(() => {
    setDisplay(prev => {
      if (prev === '0') return '0';
      if (prev.startsWith('-')) return prev.slice(1);
      return '-' + prev;
    });
  }, []);

  const handlePercent = useCallback(() => {
    setDisplay(prev => {
      const val = parseFloat(prev) / 100;
      return String(val);
    });
  }, []);

  const handleBackspace = useCallback(() => {
    if (state === 'result') {
      handleClear();
      return;
    }
    setDisplay(prev => {
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith('-'))) return '0';
      return prev.slice(0, -1);
    });
  }, [state, handleClear]);

  const handleHistorySelect = useCallback((result: string) => {
    setDisplay(result);
    setExpression('');
    setState('result');
    setActiveOp(null);
  }, []);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= '0' && key <= '9') handleNumber(key);
      else if (key === '.') handleNumber('.');
      else if (key === '+') handleOperator('+');
      else if (key === '-') handleOperator('-');
      else if (key === '*') handleOperator('*');
      else if (key === '/') { e.preventDefault(); handleOperator('/'); }
      else if (key === '%') handlePercent();
      else if (key === 'Enter' || key === '=') handleEqual();
      else if (key === 'Backspace') handleBackspace();
      else if (key === 'Escape') handleClear();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNumber, handleOperator, handleEqual, handleBackspace, handleClear, handlePercent]);

  const isAC = display === '0' && expression === '';

  return (
    <div className="calculator-wrapper">
      <div className="calculator-title">CC Calculator</div>

      <Display value={display} expression={expression} />

      <div className="button-grid">
        {/* Row 1 */}
        <Button label={isAC ? 'AC' : 'C'} type="clear" onClick={isAC ? handleClear : handleClear} />
        <Button label="+/-" type="function" onClick={handleToggleSign} />
        <Button label="%" type="function" onClick={handlePercent} />
        <Button label="⌫" type="function" onClick={handleBackspace} />

        {/* Row 2 */}
        <Button label="7" type="number" onClick={() => handleNumber('7')} />
        <Button label="8" type="number" onClick={() => handleNumber('8')} />
        <Button label="9" type="number" onClick={() => handleNumber('9')} />
        <Button label="÷" type="operator" active={activeOp === '/'} onClick={() => handleOperator('/')} />

        {/* Row 3 */}
        <Button label="4" type="number" onClick={() => handleNumber('4')} />
        <Button label="5" type="number" onClick={() => handleNumber('5')} />
        <Button label="6" type="number" onClick={() => handleNumber('6')} />
        <Button label="×" type="operator" active={activeOp === '*'} onClick={() => handleOperator('*')} />

        {/* Row 4 */}
        <Button label="1" type="number" onClick={() => handleNumber('1')} />
        <Button label="2" type="number" onClick={() => handleNumber('2')} />
        <Button label="3" type="number" onClick={() => handleNumber('3')} />
        <Button label="−" type="operator" active={activeOp === '-'} onClick={() => handleOperator('-')} />

        {/* Row 5 */}
        <Button label="0" type="number" wide onClick={() => handleNumber('0')} />
        <Button label="." type="number" onClick={() => handleNumber('.')} />
        <Button label="+" type="operator" active={activeOp === '+'} onClick={() => handleOperator('+')} />

        {/* Row 6 - Equal spans full row */}
        <Button label="=" type="equal" onClick={handleEqual} />
      </div>

      <History items={history} onClear={clearHistory} onSelect={handleHistorySelect} />
    </div>
  );
}
