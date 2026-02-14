export interface UINode {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: UINode[];
}

export interface UIRoot {
  version: number;
  title: string;
  description: string;
  tree: UINode;
}

export interface PatchOperation {
  op: 'add' | 'remove' | 'update' | 'move';
  nodeId?: string;
  parentId?: string;
  node?: UINode;
  props?: Record<string, any>;
  position?: number;
}
