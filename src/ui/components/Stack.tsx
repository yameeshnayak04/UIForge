import React from 'react';
import styles from './Stack.module.css';

export interface StackProps {
  direction?: 'horizontal' | 'vertical';
  gap?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  children: React.ReactNode;
}

export function Stack({ 
  direction = 'vertical', 
  gap = 'md', 
  align = 'stretch',
  children 
}: StackProps) {
  return (
    <div className={`${styles.stack} ${styles[direction]} ${styles[gap]} ${styles[align]}`}>
      {children}
    </div>
  );
}
