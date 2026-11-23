const result = document.querySelector('#result');
const expression = document.querySelector('#expression');
const keypad = document.querySelector('.keypad');

const operations = {
  '+': { symbol: '+', apply: (left, right) => left + right },
  '-': { symbol: '−', apply: (left, right) => left - right },
  '*': { symbol: '×', apply: (left, right) => left * right },
  '/': { symbol: '÷', apply: (left, right) => left / right },
};

let entry = '0';
let left = 0;
let pending = null;
let replaceEntry = false;
let completedExpression = '';

function format(value) {
  return Number.isFinite(value) ? String(Number(value.toPrecision(12))) : 'Error';
}

function clear() {
  entry = '0';
  left = 0;
  pending = null;
  replaceEntry = false;
  completedExpression = '';
}

function calculate() {
  const { apply, symbol } = operations[pending];
  completedExpression = `${left} ${symbol} ${entry} =`;
  entry = format(apply(left, Number(entry)));
  pending = null;
  replaceEntry = true;
}

function input(key) {
  if (key === 'clear') {
    clear();
  } else if (/^[0-9.]$/.test(key)) {
    if (replaceEntry || entry === 'Error' || entry.includes('e')) {
      entry = '0';
      replaceEntry = false;
      completedExpression = '';
    }
    if (key === '.') {
      if (!entry.includes('.')) entry += '.';
    } else if (entry.length < 14) {
      entry = entry === '0' ? key : entry + key;
    }
  } else if (entry === 'Error') {
    if (key === 'backspace') clear();
  } else if (Object.hasOwn(operations, key)) {
    if (pending && !replaceEntry) calculate();
    if (entry !== 'Error') {
      left = Number(entry);
      pending = key;
      replaceEntry = true;
    }
  } else if (key === '=' && pending && !replaceEntry) {
    calculate();
  } else if (!pending || !replaceEntry) {
    if (key === 'sign' && Number(entry) !== 0) {
      entry = entry.startsWith('-') ? entry.slice(1) : '-' + entry;
    } else if (key === 'percent') {
      entry = format(Number(entry) / 100);
      replaceEntry = !pending;
    } else if (key === 'backspace' && !replaceEntry) {
      entry = entry.slice(0, -1);
      if (!entry || entry === '-') entry = '0';
    }
  }

  result.textContent = entry;
  expression.textContent = pending ? `${left} ${operations[pending].symbol}` : completedExpression;
  for (const button of keypad.querySelectorAll('.operator')) {
    button.setAttribute('aria-pressed', String(button.dataset.key === pending));
  }
}

keypad.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-key]');
  if (button) input(button.dataset.key);
});

const shortcuts = { Enter: '=', Escape: 'clear', Backspace: 'backspace', '%': 'percent' };

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'Enter' && event.target instanceof HTMLButtonElement) return;

  const key = shortcuts[event.key] ?? event.key;
  if (!/^[0-9.+*/=-]$/.test(key) && !Object.hasOwn(shortcuts, event.key)) return;
  event.preventDefault();
  input(key);
});

input('clear');
