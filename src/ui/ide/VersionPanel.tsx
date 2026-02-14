'use client';

import React from 'react';
import { Version } from '@/lib/storage/versions';
import styles from './VersionPanel.module.css';

export interface VersionPanelProps {
  versions: Version[];
  currentVersion: string | null;
  onRestore: (versionId: string) => void;
}

export function VersionPanel({ versions, currentVersion, onRestore }: VersionPanelProps) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Version History</h3>
      {versions.length === 0 && (
        <p className={styles.empty}>No versions yet</p>
      )}
      <div className={styles.list}>
        {versions.map((version) => (
          <div
            key={version.id}
            className={`${styles.item} ${version.id === currentVersion ? styles.itemActive : ''}`}
            onClick={() => onRestore(version.id)}
          >
            <div className={styles.itemId}>{version.id}</div>
            <div className={styles.itemIntent}>
              {version.intent.slice(0, 40)}...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
