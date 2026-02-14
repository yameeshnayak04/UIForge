import { z } from 'zod';

const ALLOWED_COMPONENTS = [
  'Button',
  'Card',
  'Input',
  'Table',
  'Modal',
  'Sidebar',
  'Navbar',
  'Chart',
  'Stack',
  'Text',
];

const UINodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum(ALLOWED_COMPONENTS as [string, ...string[]]),
    props: z.record(z.string(), z.any()),
    children: z.array(UINodeSchema).optional(),
  })
);

export const UIRootSchema = z.object({
  version: z.number(),
  title: z.string(),
  description: z.string(),
  tree: UINodeSchema,
});

export const PatchOperationSchema = z.object({
  op: z.enum(['add', 'remove', 'update', 'move']),
  nodeId: z.string().optional(),
  parentId: z.string().optional(),
  node: UINodeSchema.optional(),
  props: z.record(z.string(), z.any()).optional(),
  position: z.number().optional(),
});

export const PlanOutputSchema = z.object({
  intent: z.string(),
  components: z.array(z.enum(ALLOWED_COMPONENTS as [string, ...string[]])),
  layout: z.string(),
  patches: z.array(PatchOperationSchema).optional(),
});

export const GeneratorOutputSchema = z.object({
  ast: UIRootSchema,
  code: z.string(),
});

export const ExplainerOutputSchema = z.object({
  explanation: z.string(),
  changes: z.array(z.string()),
});

export function validateComponentWhitelist(node: any): string[] {
  const errors: string[] = [];
  
  if (!ALLOWED_COMPONENTS.includes(node.type)) {
    errors.push(`Component "${node.type}" is not in the whitelist`);
  }

  if (node.children) {
    for (const child of node.children) {
      errors.push(...validateComponentWhitelist(child));
    }
  }

  return errors;
}

export function validatePropsForDangerousContent(props: Record<string, any>): string[] {
  const errors: string[] = [];
  const dangerous = ['<script', 'javascript:', 'onerror', 'onclick'];

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      for (const pattern of dangerous) {
        if (lower.includes(pattern)) {
          errors.push(`Prop "${key}" contains dangerous content: ${pattern}`);
        }
      }
    }
  }

  return errors;
}

export function validateComponentContracts(node: any): string[] {
  const errors: string[] = [];
  const props = node?.props || {};
  const children = Array.isArray(node?.children) ? node.children : [];

  switch (node?.type) {
    case 'Text': {
      const hasChildrenProp = typeof props.children === 'string' && props.children.trim().length > 0;
      const hasChildNode = children.length > 0;
      if (!hasChildrenProp && !hasChildNode) {
        errors.push(`Text node "${node.id}" must include non-empty content`);
      }
      break;
    }
    case 'Button': {
      const hasLabel = typeof props.children === 'string' && props.children.trim().length > 0;
      const hasChildNode = children.length > 0;
      if (!hasLabel && !hasChildNode) {
        errors.push(`Button node "${node.id}" must include visible label content`);
      }
      break;
    }
    case 'Table': {
      if (!Array.isArray(props.columns) || props.columns.length === 0) {
        errors.push(`Table node "${node.id}" requires non-empty columns`);
      }
      if (!Array.isArray(props.data) || props.data.length === 0) {
        errors.push(`Table node "${node.id}" requires non-empty data`);
      }
      break;
    }
    case 'Chart': {
      if (!['bar', 'line', 'pie'].includes(props.type)) {
        errors.push(`Chart node "${node.id}" requires type: bar | line | pie`);
      }
      if (!Array.isArray(props.data) || props.data.length === 0) {
        errors.push(`Chart node "${node.id}" requires non-empty data`);
      }
      break;
    }
    case 'Input': {
      if (!props.label && !props.placeholder) {
        errors.push(`Input node "${node.id}" should include label or placeholder`);
      }
      break;
    }
    case 'Card': {
      const hasHeader = typeof props.header === 'string' ? props.header.trim().length > 0 : !!props.header;
      const hasChildren = children.length > 0;
      if (!hasHeader && !hasChildren) {
        errors.push(`Card node "${node.id}" requires header or child content`);
      }
      break;
    }
    case 'Modal': {
      if (typeof props.isOpen !== 'boolean') {
        errors.push(`Modal node "${node.id}" requires boolean isOpen`);
      }
      break;
    }
    default:
      break;
  }

  for (const child of children) {
    errors.push(...validateComponentContracts(child));
  }

  return errors;
}
