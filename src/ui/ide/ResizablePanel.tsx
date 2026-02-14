'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './ResizablePanel.module.css';

export interface ResizablePanelProps {
  children: [React.ReactNode, React.ReactNode];
  direction?: 'horizontal' | 'vertical';
  defaultSize?: number; // percentage for first panel
  minSize?: number; // minimum percentage
  maxSize?: number; // maximum percentage
}

export function ResizablePanel({
  children,
  direction = 'horizontal',
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      let newSize: number;
      if (direction === 'horizontal') {
        newSize = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        newSize = ((e.clientY - rect.top) / rect.height) * 100;
      }

      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(newSize);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, direction, minSize, maxSize]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${styles[direction]}`}
    >
      <div
        className={styles.panel}
        style={{
          [direction === 'horizontal' ? 'width' : 'height']: `${size}%`,
        }}
      >
        {children[0]}
      </div>

      <div
        className={`${styles.divider} ${styles[direction]} ${isDragging ? styles.dragging : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.dividerHandle} />
      </div>

      <div
        className={styles.panel}
        style={{
          [direction === 'horizontal' ? 'width' : 'height']: `${100 - size}%`,
        }}
      >
        {children[1]}
      </div>
    </div>
  );
}
