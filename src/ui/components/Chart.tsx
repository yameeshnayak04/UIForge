import React from 'react';
import styles from './Chart.module.css';

export interface ChartProps {
  type: 'bar' | 'line' | 'pie';
  data: { label: string; value: number }[];
  title?: string;
}

export function Chart({ type, data, title }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={styles.chart}>
      {title && <h3 className={styles.title}>{title}</h3>}
      
      {type === 'bar' && (
        <div className={styles.barChart}>
          {data.map((item, idx) => (
            <div key={idx} className={styles.barItem}>
              <div className={styles.barLabel}>{item.label}</div>
              <div className={styles.barWrapper}>
                <div 
                  className={styles.bar}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <div className={styles.barValue}>{item.value}</div>
            </div>
          ))}
        </div>
      )}
      
      {type === 'line' && (
        <div className={styles.lineChart}>
          <svg viewBox="0 0 400 200" className={styles.svg}>
            <polyline
              points={data.map((item, idx) => 
                `${(idx / (data.length - 1)) * 380 + 10},${190 - (item.value / maxValue) * 170}`
              ).join(' ')}
              className={styles.line}
            />
          </svg>
          <div className={styles.lineLabels}>
            {data.map((item, idx) => (
              <span key={idx}>{item.label}</span>
            ))}
          </div>
        </div>
      )}
      
      {type === 'pie' && (
        <div className={styles.pieChart}>
          <div className={styles.pieCircle}>
            {/* Simplified pie representation */}
            {data.map((item, idx) => (
              <div key={idx} className={styles.pieSegment} />
            ))}
          </div>
          <div className={styles.pieLegend}>
            {data.map((item, idx) => (
              <div key={idx} className={styles.legendItem}>
                <span className={styles.legendColor} />
                <span>{item.label}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
