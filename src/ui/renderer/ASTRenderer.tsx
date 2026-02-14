import React from 'react';
import { UINode } from '@/types';
import * as Components from '../components';
import styles from './ASTRenderer.module.css';

export interface ASTRendererProps {
  ast: UINode;
}

export function ASTRenderer({ ast }: ASTRendererProps) {
  const renderNode = (node: UINode): React.ReactNode => {
    const Component = (Components as any)[node.type];
    
    if (!Component) {
      return (
        <div className={styles.unknown}>
          Unknown component: {node.type}
        </div>
      );
    }

    const children = node.children?.map((child) => (
      <React.Fragment key={child.id}>
        {renderNode(child)}
      </React.Fragment>
    ));

    return (
      <Component key={node.id} {...node.props}>
        {children}
      </Component>
    );
  };

  return <>{renderNode(ast)}</>;
}
