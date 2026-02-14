import React from 'react';
import styles from './Text.module.css';

export interface TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  children: React.ReactNode;
  color?: 'default' | 'muted' | 'primary';
}

export function Text({ variant = 'body', children, color = 'default' }: TextProps) {
  const Tag = variant === 'body' || variant === 'caption' ? 'p' : variant;
  
  return (
    <Tag className={`${styles[variant]} ${styles[color]}`}>
      {children}
    </Tag>
  );
}
