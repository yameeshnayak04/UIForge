import React from 'react';
import styles from './Sidebar.module.css';

export interface SidebarProps {
  children: React.ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ children, collapsed = false, onToggle }: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {onToggle && (
        <button className={styles.toggleButton} onClick={onToggle}>
          {collapsed ? '→' : '←'}
        </button>
      )}
      <div className={styles.content}>
        {children}
      </div>
    </aside>
  );
};
