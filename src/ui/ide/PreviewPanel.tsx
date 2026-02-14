'use client';

import React from 'react';
import { ASTRenderer } from '../renderer/ASTRenderer';
import { UINode } from '@/types';
import styles from './PreviewPanel.module.css';

export interface PreviewPanelProps {
  ast: UINode | null;
  error?: string;
}

export function PreviewPanel({ ast, error }: PreviewPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Live Preview</h3>
      </div>
      <div className={styles.viewport}>
        {error && (
          <div className={styles.error}>
            <h4>Error</h4>
            <p>{error}</p>
          </div>
        )}
        {!error && ast && <ASTRenderer ast={ast} />}
        {!error && !ast && (
          <div className={styles.empty}>
            <p>No UI generated yet. Enter a prompt to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
