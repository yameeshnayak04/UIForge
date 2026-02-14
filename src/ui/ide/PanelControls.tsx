'use client';

import React from 'react';
import styles from './PanelControls.module.css';

export interface PanelControlsProps {
  onReset: () => void;
}

export function PanelControls({ onReset }: PanelControlsProps) {
  return (
    <div className={styles.bar}>
      <span className={styles.hint}>
        💡 Drag the dividers to resize panels
      </span>
      <button onClick={onReset} className={styles.button}>
        Reset Layout
      </button>
    </div>
  );
}
