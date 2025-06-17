import { Plugin, FigmaNode, PluginAPI } from '@/types';

/**
 * React Plugin for Figma to React Converter
 * Handles conversion of Figma nodes to React JSX components
 */
export const reactPlugin: Plugin = {
  name: 'react-converter',
  version: '1.0.0',
  description: 'Converts Figma designs to React components with modern hooks and TypeScript support',
  framework: 'react',
  fileExtension: '.tsx',
  hooks: {
    beforeConversion: (node: FigmaNode) => {
      // Clean up node names for React component names
      if (node.name) {
        node.name = node.name
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
      }
      return node;
    },

    processNode: (node: FigmaNode, api: PluginAPI) => {
      return convertToReactComponent(node, api);
    },

    generateStyles: (node: FigmaNode, api: PluginAPI) => {
      return generateReactStyles(node, api);
    },

    generateTypes: (node: FigmaNode, api: PluginAPI) => {
      return generateReactTypes(node, api);
    },

    afterConversion: (code: string, node: FigmaNode) => {
      // Add React imports and format the component
      const componentName = api.utils.toPascalCase(node.name || 'Component');
      
      return `import React from 'react';
import { cn } from '@/lib/utils';

${code}

export default ${componentName};`;
    }
  },
  config: {
    useModernSyntax: true,
    generatePropTypes: false,
    useTailwind: true,
    generateStories: true,
    accessibility: true
  }
};

function convertToReactComponent(node: FigmaNode, api: PluginAPI): string {
  const componentName = api.utils.toPascalCase(node.name || 'Component');
  const props = extractProps(node);
  const jsx = convertNodeToJSX(node, api);
  const styles = generateInlineStyles(node, api);

  // Generate component with props interface
  return `
interface ${componentName}Props {
  ${props.join(';\n  ')}${props.length > 0 ? ';' : ''}
  className?: string;
  children?: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  ${props.map(prop => prop.split(':')[0].replace('?', '')).join(',\n  ')}${props.length > 0 ? ',' : ''}
  className,
  children,
  ...props
}) => {
  return (
    ${jsx}
  );
};`;
}

function convertNodeToJSX(node: FigmaNode, api: PluginAPI, depth = 0): string {
  const indent = '  '.repeat(depth + 1);
  const elementTag = getElementTag(node);
  const className = generateClassName(node);
  const styles = generateInlineStyles(node, api);
  const attributes = generateAttributes(node);
  
  // Handle text nodes
  if (node.type === 'TEXT' && node.characters) {
    return `${indent}<${elementTag}${className ? ` className="${className}"` : ''}${styles ? ` style={{${styles}}}` : ''}${attributes}>
${indent}  {${node.characters.includes('{') ? node.characters : `"${node.characters}"`}}
${indent}</${elementTag}>`;
  }

  // Handle container nodes with children
  if (node.children && node.children.length > 0) {
    const childrenJSX = node.children
      .map(child => convertNodeToJSX(child, api, depth + 1))
      .join('\n');

    return `${indent}<${elementTag}${className ? ` className="${className}"` : ''}${styles ? ` style={{${styles}}}` : ''}${attributes}>
${childrenJSX}
${indent}</${elementTag}>`;
  }

  // Handle self-closing elements
  return `${indent}<${elementTag}${className ? ` className="${className}"` : ''}${styles ? ` style={{${styles}}}` : ''}${attributes} />`;
}

function getElementTag(node: FigmaNode): string {
  switch (node.type) {
    case 'TEXT':
      return 'span';
    case 'FRAME':
    case 'GROUP':
      return 'div';
    case 'RECTANGLE':
      return 'div';
    case 'ELLIPSE':
      return 'div';
    case 'IMAGE':
      return 'img';
    case 'VECTOR':
      return 'svg';
    case 'COMPONENT':
    case 'INSTANCE':
      return 'div';
    default:
      return 'div';
  }
}

function generateClassName(node: FigmaNode): string {
  const classes: string[] = [];
  
  // Add base classes based on node type
  switch (node.type) {
    case 'FRAME':
      classes.push('flex');
      if (node.layoutMode === 'VERTICAL') {
        classes.push('flex-col');
      }
      break;
    case 'TEXT':
      classes.push('text-base');
      break;
    case 'RECTANGLE':
      classes.push('rounded');
      break;
  }

  // Add responsive classes
  if (node.absoluteBoundingBox) {
    if (node.absoluteBoundingBox.width < 200) {
      classes.push('w-auto');
    }
  }

  return classes.length > 0 ? `cn("${classes.join(' ')}", className)` : 'className';
}

function generateInlineStyles(node: FigmaNode, api: PluginAPI): string {
  const styles: string[] = [];

  // Dimensions
  if (node.absoluteBoundingBox) {
    if (node.absoluteBoundingBox.width) {
      styles.push(`width: '${node.absoluteBoundingBox.width}px'`);
    }
    if (node.absoluteBoundingBox.height) {
      styles.push(`height: '${node.absoluteBoundingBox.height}px'`);
    }
  }

  // Background color
  if (node.fills && node.fills[0]?.color) {
    const color = api.utils.rgbaToCss(node.fills[0].color);
    styles.push(`backgroundColor: '${color}'`);
  }

  // Border radius
  if (node.cornerRadius) {
    styles.push(`borderRadius: '${node.cornerRadius}px'`);
  }

  // Opacity
  if (node.opacity && node.opacity < 1) {
    styles.push(`opacity: ${node.opacity}`);
  }

  // Typography for text nodes
  if (node.style) {
    if (node.style.fontSize) {
      styles.push(`fontSize: '${node.style.fontSize}px'`);
    }
    if (node.style.fontWeight) {
      styles.push(`fontWeight: ${node.style.fontWeight}`);
    }
    if (node.style.fontFamily) {
      styles.push(`fontFamily: '${node.style.fontFamily}'`);
    }
    if (node.style.lineHeightPx) {
      styles.push(`lineHeight: '${node.style.lineHeightPx}px'`);
    }
    if (node.style.letterSpacing) {
      styles.push(`letterSpacing: '${node.style.letterSpacing}px'`);
    }
  }

  // Layout properties
  if (node.layoutAlign) {
    switch (node.layoutAlign) {
      case 'CENTER':
        styles.push(`alignSelf: 'center'`);
        break;
      case 'MIN':
        styles.push(`alignSelf: 'flex-start'`);
        break;
      case 'MAX':
        styles.push(`alignSelf: 'flex-end'`);
        break;
    }
  }

  // Padding
  if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
    const padding = [
      node.paddingTop || 0,
      node.paddingRight || 0,
      node.paddingBottom || 0,
      node.paddingLeft || 0
    ].join('px ') + 'px';
    styles.push(`padding: '${padding}'`);
  }

  // Item spacing for flex containers
  if (node.itemSpacing) {
    styles.push(`gap: '${node.itemSpacing}px'`);
  }

  return styles.join(', ');
}

function generateAttributes(node: FigmaNode): string {
  const attributes: string[] = [];

  // Accessibility attributes
  if (node.name) {
    const cleanName = node.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    attributes.push(`data-testid="${cleanName}"`);
  }

  // ARIA attributes based on node type and name
  if (node.type === 'TEXT' && node.name?.toLowerCase().includes('button')) {
    attributes.push(`role="button"`);
    attributes.push(`tabIndex={0}`);
  }

  if (node.type === 'IMAGE') {
    attributes.push(`alt="${node.name || 'Image'}"`);
  }

  // Semantic HTML attributes
  if (node.name?.toLowerCase().includes('heading')) {
    attributes.push(`role="heading"`);
  }

  return attributes.length > 0 ? ' ' + attributes.join(' ') : '';
}

function extractProps(node: FigmaNode): string[] {
  const props: string[] = [];

  // Extract props from component property definitions
  if (node.componentPropertyDefinitions) {
    Object.entries(node.componentPropertyDefinitions).forEach(([key, definition]) => {
      const propType = getTypeScriptType(definition.type, definition.defaultValue);
      props.push(`${key}?: ${propType}`);
    });
  }

  // Add common props based on node type
  if (node.type === 'TEXT') {
    props.push('text?: string');
  }

  if (node.type === 'IMAGE') {
    props.push('src?: string');
    props.push('alt?: string');
  }

  // Add variant props for components with variants
  if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    props.push('variant?: string');
  }

  return props;
}

function getTypeScriptType(figmaType: string, defaultValue: any): string {
  switch (figmaType) {
    case 'BOOLEAN':
      return 'boolean';
    case 'TEXT':
      return 'string';
    case 'VARIANT':
      return 'string';
    case 'INSTANCE_SWAP':
      return 'React.ComponentType';
    default:
      if (typeof defaultValue === 'string') return 'string';
      if (typeof defaultValue === 'number') return 'number';
      if (typeof defaultValue === 'boolean') return 'boolean';
      return 'any';
  }
}

function generateReactStyles(node: FigmaNode, api: PluginAPI): string {
  // Generate CSS-in-JS or styled-components styles
  const styles = generateInlineStyles(node, api);
  
  if (!styles) return '';

  return `
const styles = {
  ${styles}
};`;
}

function generateReactTypes(node: FigmaNode, api: PluginAPI): string {
  const componentName = api.utils.toPascalCase(node.name || 'Component');
  const props = extractProps(node);

  return `
export interface ${componentName}Props {
  ${props.join(';\n  ')}${props.length > 0 ? ';' : ''}
  className?: string;
  children?: React.ReactNode;
}`;
}