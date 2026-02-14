'use client';

import React, { useState } from 'react';
import styles from './ChatPanel.module.css';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatPanelProps {
  messages: Message[];
  onGenerate: (intent: string, action: 'generate' | 'modify' | 'regenerate') => void;
  loading: boolean;
}

export function ChatPanel({ messages, onGenerate, loading }: ChatPanelProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (action: 'generate' | 'modify' | 'regenerate') => {
    if (!input.trim()) return;
    onGenerate(input, action);
    setInput('');
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>UIForge</h2>
        <p className={styles.subtitle}>Deterministic UI Generator</p>
      </div>

      <div className={styles.messages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
            <div className={styles.messageContent}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.messageContent}>Generating UI...</div>
          </div>
        )}
      </div>

      <div className={styles.inputArea}>
        <textarea
          className={styles.input}
          placeholder="Describe the UI you want to create..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          rows={3}
        />
        <div className={styles.buttons}>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={() => handleSubmit('generate')}
            disabled={loading || !input.trim()}
          >
            Generate
          </button>
          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={() => handleSubmit('modify')}
            disabled={loading || !input.trim() || messages.length === 0}
          >
            Modify
          </button>
          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={() => handleSubmit('regenerate')}
            disabled={loading || !input.trim() || messages.length === 0}
          >
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}
