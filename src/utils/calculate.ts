type Token =
  | { type: 'number'; value: number }
  | { type: 'operator'; value: string };

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const expr = expression.trim();

  while (i < expr.length) {
    const ch = expr[i];

    if (ch === ' ') {
      i++;
      continue;
    }

    if (ch === '-' && (tokens.length === 0 || tokens[tokens.length - 1].type === 'operator')) {
      // unary minus
      let numStr = '-';
      i++;
      while (i < expr.length && (expr[i] === '.' || (expr[i] >= '0' && expr[i] <= '9'))) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(numStr) });
      continue;
    }

    if (ch >= '0' && ch <= '9' || ch === '.') {
      let numStr = '';
      while (i < expr.length && (expr[i] === '.' || (expr[i] >= '0' && expr[i] <= '9'))) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(numStr) });
      continue;
    }

    if (['+', '-', '*', '/', '%'].includes(ch)) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    throw new Error(`Unknown character: ${ch}`);
  }

  return tokens;
}

function precedence(op: string): number {
  if (op === '+' || op === '-') return 1;
  if (op === '*' || op === '/' || op === '%') return 2;
  return 0;
}

function applyOp(a: number, op: string, b: number): number {
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

function evaluateTokens(tokens: Token[]): number {
  const values: number[] = [];
  const ops: string[] = [];

  const processTop = () => {
    const op = ops.pop()!;
    const b = values.pop()!;
    const a = values.pop()!;
    values.push(applyOp(a, op, b));
  };

  for (const token of tokens) {
    if (token.type === 'number') {
      values.push(token.value);
    } else {
      while (
        ops.length > 0 &&
        precedence(ops[ops.length - 1]) >= precedence(token.value)
      ) {
        processTop();
      }
      ops.push(token.value);
    }
  }

  while (ops.length > 0) {
    processTop();
  }

  if (values.length !== 1) {
    throw new Error('Invalid expression');
  }

  return values[0];
}

export function calculate(expression: string): string {
  try {
    const cleaned = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .trim();

    if (!cleaned) return '0';

    const tokens = tokenize(cleaned);

    if (tokens.length === 0) return '0';

    // Check for trailing operator
    const last = tokens[tokens.length - 1];
    if (last.type === 'operator') {
      tokens.pop();
    }

    if (tokens.length === 0) return '0';

    const result = evaluateTokens(tokens);

    if (!isFinite(result)) {
      return 'Error';
    }

    // Format result: avoid floating point noise
    const rounded = parseFloat(result.toPrecision(12));
    return String(rounded);
  } catch (err) {
    if (err instanceof Error && err.message === 'Division by zero') {
      return 'Error: Div/0';
    }
    return 'Error';
  }
}
