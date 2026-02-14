import { UINode } from '@/types';

export function generateExpandedCode(ast: UINode): string {
  const imports = new Set<string>();
  const constants: string[] = [];
  
  function collectImports(node: UINode) {
    imports.add(node.type);
    if (node.children) {
      node.children.forEach(collectImports);
    }
  }
  
  function generateJSX(node: UINode, indent: number = 2): string {
    const spaces = ' '.repeat(indent);
    const props = Object.entries(node.props || {})
      .filter(([key]) => key !== 'children')
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        }
        if (typeof value === 'boolean') {
          return value ? key : '';
        }
        if (Array.isArray(value) || typeof value === 'object') {
          const constName = `${node.type.toLowerCase()}${key.charAt(0).toUpperCase() + key.slice(1)}`;
          if (!constants.find(c => c.includes(constName))) {
            constants.push(`  const ${constName} = ${JSON.stringify(value, null, 2)};`);
          }
          return `${key}={${constName}}`;
        }
        return `${key}={${JSON.stringify(value)}}`;
      })
      .filter(Boolean)
      .join(' ');

    if (!node.children || node.children.length === 0) {
      if (node.props?.children) {
        return `${spaces}<${node.type}${props ? ' ' + props : ''}>${node.props.children}</${node.type}>`;
      }
      return `${spaces}<${node.type}${props ? ' ' + props : ''} />`;
    }

    const childrenJSX = node.children
      .map(child => generateJSX(child, indent + 2))
      .join('\n');

    return `${spaces}<${node.type}${props ? ' ' + props : ''}>
${childrenJSX}
${spaces}</${node.type}>`;
  }

  collectImports(ast);

  const importStatement = `import { ${Array.from(imports).sort().join(', ')} } from '@/ui/components';`;
  
  const jsxCode = generateJSX(ast, 2);
  
  const constantsBlock = constants.length > 0 ? '\n' + constants.join('\n') + '\n' : '';

  return `${importStatement}

export default function GeneratedUI() {${constantsBlock}
  return (
${jsxCode}
  );
}`;
}
