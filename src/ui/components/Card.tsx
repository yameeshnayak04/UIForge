import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  elevated?: boolean;
}

export function Card({ header, footer, children, elevated = false }: CardProps) {
  return (
    <div className={`${styles.card} ${elevated ? styles.elevated : ''}`}>
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
