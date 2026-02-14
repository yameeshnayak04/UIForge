import React from 'react';
import styles from './Input.module.css';

export interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export function Input({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange,
  label,
  disabled = false 
}: InputProps) {
  return (
    <div className={styles.inputWrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={styles.input}
        disabled={disabled}
      />
    </div>
  );
}
