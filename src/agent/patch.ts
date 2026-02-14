import { UINode, PatchOperation } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function applyPatches(root: UINode, patches: PatchOperation[]): UINode {
  let result = JSON.parse(JSON.stringify(root));

  for (const patch of patches) {
    result = applyPatch(result, patch);
  }

  return result;
}

function applyPatch(root: UINode, patch: PatchOperation): UINode {
  switch (patch.op) {
    case 'add':
      return addNode(root, patch);
    case 'remove':
      return removeNode(root, patch);
    case 'update':
      return updateNode(root, patch);
    case 'move':
      return moveNode(root, patch);
    default:
      return root;
  }
}

function addNode(root: UINode, patch: PatchOperation): UINode {
  if (!patch.parentId || !patch.node) return root;

  const clone = JSON.parse(JSON.stringify(root));
  const parent = findNode(clone, patch.parentId);

  if (parent) {
    if (!parent.children) {
      parent.children = [];
    }
    const nodeWithId = { ...patch.node, id: patch.node.id || uuidv4() };
    parent.children.push(nodeWithId);
  }

  return clone;
}

function removeNode(root: UINode, patch: PatchOperation): UINode {
  if (!patch.nodeId) return root;

  const clone = JSON.parse(JSON.stringify(root));
  const parent = findParent(clone, patch.nodeId);

  if (parent && parent.children) {
    parent.children = parent.children.filter((child) => child.id !== patch.nodeId);
  }

  return clone;
}

function updateNode(root: UINode, patch: PatchOperation): UINode {
  if (!patch.nodeId) return root;

  const clone = JSON.parse(JSON.stringify(root));
  const node = findNode(clone, patch.nodeId);

  if (node && patch.props) {
    node.props = { ...node.props, ...patch.props };
  }

  return clone;
}

function moveNode(root: UINode, patch: PatchOperation): UINode {
  if (!patch.nodeId || !patch.parentId) return root;

  const clone = JSON.parse(JSON.stringify(root));
  const oldParent = findParent(clone, patch.nodeId);
  const newParent = findNode(clone, patch.parentId);

  if (oldParent && newParent && oldParent.children) {
    const nodeIndex = oldParent.children.findIndex((c) => c.id === patch.nodeId);
    if (nodeIndex >= 0) {
      const [node] = oldParent.children.splice(nodeIndex, 1);
      if (!newParent.children) {
        newParent.children = [];
      }
      newParent.children.push(node);
    }
  }

  return clone;
}

function findNode(root: UINode, id: string): UINode | null {
  if (root.id === id) return root;

  if (root.children) {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }

  return null;
}

function findParent(root: UINode, childId: string): UINode | null {
  if (root.children) {
    for (const child of root.children) {
      if (child.id === childId) return root;
      const found = findParent(child, childId);
      if (found) return found;
    }
  }

  return null;
}
