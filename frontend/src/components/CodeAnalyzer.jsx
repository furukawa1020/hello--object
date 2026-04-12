import React, { useMemo } from 'react';

/**
 * CodeAnalyzer — analyzes the code typed in MagicNote and shows a badge
 * indicating the type of code (method call, class definition, expression…)
 */

const PATTERNS = [
  {
    id: 'class_reopen',
    label: '🔓 クラス再定義（モンキーパッチ）',
    color: '#b060ff',
    test: (c) => /^\s*class\s+\w+/.test(c) && /def\s+\w+/.test(c),
  },
  {
    id: 'class_def',
    label: '📐 クラス定義',
    color: '#c8a0ff',
    test: (c) => /^\s*class\s+\w+/.test(c),
  },
  {
    id: 'method_def',
    label: '🔧 メソッド定義',
    color: '#60d0ff',
    test: (c) => /^\s*def\s+\w+/.test(c),
  },
  {
    id: 'method_chain',
    label: '⛓ メソッドチェーン',
    color: '#ffcc44',
    test: (c) => /\w+\.\w+\.\w+/.test(c),
  },
  {
    id: 'method_call',
    label: '📞 メソッド呼び出し',
    color: '#8aff80',
    test: (c) => /\w+\.\w+/.test(c),
  },
  {
    id: 'assignment',
    label: '📦 変数への代入',
    color: '#ffb86c',
    test: (c) => /\w+\s*=\s*/.test(c) && !/==/.test(c),
  },
  {
    id: 'expression',
    label: '🔢 式',
    color: '#88ccff',
    test: (c) => c.trim().length > 0,
  },
];

const CodeAnalyzer = ({ code }) => {
  const analysis = useMemo(() => {
    if (!code || !code.trim()) return null;
    return PATTERNS.find(p => p.test(code)) || null;
  }, [code]);

  if (!analysis) return null;

  return (
    <div
      className="code-analyzer-badge"
      style={{ '--badge-color': analysis.color }}
    >
      {analysis.label}
    </div>
  );
};

export default CodeAnalyzer;
