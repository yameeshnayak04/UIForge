'use client';

import React, { useState } from 'react';
import styles from './CodePanel.module.css';

export interface CodePanelProps {
  ast: any;
  plan: any;
  code: string;
  explanation: string;
}

export function CodePanel({ ast, plan, code, explanation }: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'ast' | 'plan' | 'explanation'>('code');

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'code' ? styles.active : ''}`}
          onClick={() => setActiveTab('code')}
        >
          Code
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'ast' ? styles.active : ''}`}
          onClick={() => setActiveTab('ast')}
        >
          AST
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'plan' ? styles.active : ''}`}
          onClick={() => setActiveTab('plan')}
        >
          Plan
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'explanation' ? styles.active : ''}`}
          onClick={() => setActiveTab('explanation')}
        >
          Explanation
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'code' && (
          <pre className={styles.code}>{code || '// No code generated yet'}</pre>
        )}
        {activeTab === 'ast' && (
          <pre className={styles.code}>{ast ? JSON.stringify(ast, null, 2) : '// No AST generated yet'}</pre>
        )}
        {activeTab === 'plan' && (
          <pre className={styles.code}>{plan ? JSON.stringify(plan, null, 2) : '// No plan generated yet'}</pre>
        )}
        {activeTab === 'explanation' && (
          <div className={styles.explanation}>{explanation || 'No explanation available yet'}</div>
        )}
      </div>
    </div>
  );
}
