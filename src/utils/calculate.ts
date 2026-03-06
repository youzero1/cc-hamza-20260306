type Token = { type: 'number'; value: number } | { type: 'op'; value: string };

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const expr = expression.replace(/\s+/g, '');

  while (i < expr.length) {
    const ch = expr[i];

    if (ch === '-' && (i === 0 || tokens[tokens.length - 1]?.type === 'op')) {
      // Unary minus
      let numStr = '-';
      i++;
      while (i < expr.length && (expr[i] === '.' || (expr[i] >= '0' && expr[i] <= '9'))) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(numStr) });
    } else if (ch === '.' || (ch >= '0' && ch <= '9')) {
      let numStr = '';
      while (i < expr.length && (expr[i] === '.' || (expr[i] >= '0' && expr[i] <= '9'))) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(numStr) });
    } else if (['+', '-', '*', '/', '%'].includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
    } else {
      i++;
    }
  }

  return tokens;
}

function applyOp(op: string, a: number, b: number): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    case '%':
      if (b === 0) throw new Error('Division by zero');
      return a % b;
    default:
      throw new Error(`Unknown operator: ${op}`);
  }
}

function precedence(op: string): number {
  if (op === '+' || op === '-') return 1;
  if (op === '*' || op === '/' || op === '%') return 2;
  return 0;
}

export function calculate(expression: string): string {
  try {
    const tokens = tokenize(expression);
    if (tokens.length === 0) return 'Error';

    const outputQueue: number[] = [];
    const operatorStack: string[] = [];

    for (const token of tokens) {
      if (token.type === 'number') {
        outputQueue.push(token.value);
      } else {
        const op = token.value;
        while (
          operatorStack.length > 0 &&
          precedence(operatorStack[operatorStack.length - 1]) >= precedence(op)
        ) {
          const topOp = operatorStack.pop()!;
          const b = outputQueue.pop()!;
          const a = outputQueue.pop()!;
          outputQueue.push(applyOp(topOp, a, b));
        }
        operatorStack.push(op);
      }
    }

    while (operatorStack.length > 0) {
      const topOp = operatorStack.pop()!;
      const b = outputQueue.pop()!;
      const a = outputQueue.pop()!;
      outputQueue.push(applyOp(topOp, a, b));
    }

    const result = outputQueue[0];
    if (result === undefined || isNaN(result)) return 'Error';
    if (!isFinite(result)) return 'Error';

    // Format the result: avoid floating point noise
    const formatted = parseFloat(result.toPrecision(12));
    return String(formatted);
  } catch {
    return 'Error';
  }
}
