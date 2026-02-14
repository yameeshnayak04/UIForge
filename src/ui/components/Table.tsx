import React from 'react';
import styles from './Table.module.css';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface TableProps {
  columns: TableColumn[];
  data: Record<string, any>[];
  onSort?: (key: string) => void;
}

export function Table({ columns, data, onSort }: TableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key}  // ✅ Added key here
                className={col.sortable ? styles.sortable : ''}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={`row-${idx}`}>  
              {columns.map((col) => (
                <td key={`${idx}-${col.key}`}>{row[col.key]}</td>  
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
