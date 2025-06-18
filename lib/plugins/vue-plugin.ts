import { Plugin, FigmaNode, PluginAPI } from '@/types';

/**
 * Vue Plugin for Figma to Vue Converter
 * Handles conversion of Figma nodes to Vue 3 components with Composition API
 */
export const vuePlugin: Plugin = {
  name: 'vue-converter',
  version: '1.0.0',
  description: 'Converts Figma designs to Vue 3 components with Composition API and TypeScript support',
  framework: 'vue',
  fileExtension: '.vue',
  hooks: {
    beforeConversion: (node: FigmaNode) => {
      // Clean up node names for Vue component names
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
      return convertToVueComponent(node, api);
    },

    generateStyles: (node: FigmaNode, api: PluginAPI) => {
      return generateVueStyles(node, api);
    },

    generateTypes: (node: FigmaNode, api: PluginAPI) => {
      return generateVueTypes(node, api);
    },

    afterConversion: (code: string, node: FigmaNode) => {
      return code;
    }
  },
  config: {
    useCompositionApi: true,
    generatePropTypes: true,
    useTailwind: true,
    generateStories: true,
    accessibility: true
  }
};

function convertToVueComponent(node: FigmaNode, api: PluginAPI): string {
  const componentName = api.utils.toPascalCase(node.name || 'Component');
  const props = extractVueProps(node);
  const template = convertNodeToTemplate(node, api);
  const script = generateVueScript(node, props, api);
  const styles = generateVueStyles(node, api);

  return `<template>
${template}
</template>

<script setup lang="ts">
${script}
</script>

<style scoped>
${styles}
</style>`;
}

function convertNodeToTemplate(node: FigmaNode, api: PluginAPI, depth = 0): string {
  const indent = '  '.repeat(depth);
  const elementTag = getVueElementTag(node);
  const className = generateVueClassName(node);
  const attributes = generateVueAttributes(node);
  const bindings = generateVueBindings(node);
  
  // Handle text nodes
  if (node.type === 'TEXT' && node.characters) {
    return `${indent}<${elementTag}${className ? ` class="${className}"` : ''}${attributes}${bindings}>
${indent}  {{ ${getTextBinding(node.characters)} }}
${indent}</${elementTag}>`;
  }

  // Handle container nodes with children
  if (node.children && node.children.length > 0) {
    const childrenTemplate = node.children
      .map(child => convertNodeToTemplate(child, api, depth + 1))
      .join('\n');

    return `${indent}<${elementTag}${className ? ` class="${className}"` : ''}${attributes}${bindings}>
${childrenTemplate}
${indent}</${elementTag}>`;
  }

  // Handle self-closing elements
  if (elementTag === 'img') {
    return `${indent}<${elementTag}${className ? ` class="${className}"` : ''}${attributes}${bindings} />`;
  }

  return `${indent}<${elementTag}${className ? ` class="${className}"` : ''}${attributes}${bindings}></${elementTag}>`;
}

function getVueElementTag(node: FigmaNode): string {
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

function generateVueClassName(node: FigmaNode): string {
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

  return classes.join(' ');
}

function generateVueAttributes(node: FigmaNode): string {
  const attributes: string[] = [];

  // Accessibility attributes
  if (node.name) {
    const cleanName = node.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    attributes.push(`data-testid="${cleanName}"`);
  }

  // ARIA attributes based on node type and name
  if (node.type === 'TEXT' && node.name?.toLowerCase().includes('button')) {
    attributes.push(`role="button"`);
    attributes.push(`tabindex="0"`);
  }

  if (node.type === 'IMAGE') {
    attributes.push(`:alt="alt || '${node.name || 'Image'}'"`);
  }

  // Semantic HTML attributes
  if (node.name?.toLowerCase().includes('heading')) {
    attributes.push(`role="heading"`);
  }

  return attributes.length > 0 ? ' ' + attributes.join(' ') : '';
}

function generateVueBindings(node: FigmaNode): string {
  const bindings: string[] = [];

  // Style bindings
  const styleProperties = getVueStyleProperties(node);
  if (styleProperties.length > 0) {
    bindings.push(`:style="{ ${styleProperties.join(', ')} }"`);
  }

  // Dynamic class bindings
  if (node.name?.includes('variant')) {
    bindings.push(`:class="[variantClass]"`);
  }

  // Event bindings for interactive elements
  if (node.name?.toLowerCase().includes('button') || node.type === 'INSTANCE') {
    bindings.push(`@click="handleClick"`);
  }

  return bindings.length > 0 ? ' ' + bindings.join(' ') : '';
}

function getVueStyleProperties(node: FigmaNode): string[] {
  const properties: string[] = [];

  // Dimensions
  if (node.absoluteBoundingBox) {
    if (node.absoluteBoundingBox.width) {
      properties.push(`width: '${node.absoluteBoundingBox.width}px'`);
    }
    if (node.absoluteBoundingBox.height) {
      properties.push(`height: '${node.absoluteBoundingBox.height}px'`);
    }
  }

  // Background color
  if (node.fills && node.fills[0]?.color) {
    const color = rgbaToCss(node.fills[0].color);
    properties.push(`backgroundColor: '${color}'`);
  }

  // Border radius
  if (node.cornerRadius) {
    properties.push(`borderRadius: '${node.cornerRadius}px'`);
  }

  // Opacity
  if (node.opacity && node.opacity < 1) {
    properties.push(`opacity: ${node.opacity}`);
  }

  // Typography for text nodes
  if (node.style) {
    if (node.style.fontSize) {
      properties.push(`fontSize: '${node.style.fontSize}px'`);
    }
    if (node.style.fontWeight) {
      properties.push(`fontWeight: ${node.style.fontWeight}`);
    }
    if (node.style.fontFamily) {
      properties.push(`fontFamily: '${node.style.fontFamily}'`);
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
    properties.push(`padding: '${padding}'`);
  }

  return properties;
}

function getTextBinding(characters: string): string {
  // Check if the text contains template variables
  if (characters.includes('{{') || characters.includes('{')) {
    return characters;
  }
  return `text || '${characters}'`;
}

function generateVueScript(node: FigmaNode, props: string[], api: PluginAPI): string {
  const componentName = api.utils.toPascalCase(node.name || 'Component');
  const imports = ['ref', 'computed', 'defineProps', 'defineEmits'];
  
  let script = `import { ${imports.join(', ')} } from 'vue';\n\n`;

  // Define props interface
  if (props.length > 0) {
    script += `interface Props {\n`;
    script += props.map(prop => `  ${prop}`).join('\n');
    script += `\n}\n\n`;

    script += `const props = withDefaults(defineProps<Props>(), {\n`;
    script += props.map(prop => {
      const [name] = prop.split(':');
      return `  ${name.replace('?', '')}: undefined`;
    }).join(',\n');
    script += `\n});\n\n`;
  }

  // Define emits
  script += `const emit = defineEmits<{\n`;
  script += `  click: [event: MouseEvent];\n`;
  script += `}>();\n\n`;

  // Reactive data
  script += `// Reactive data\n`;
  script += `const isHovered = ref(false);\n`;
  script += `const isPressed = ref(false);\n\n`;

  // Computed properties
  script += `// Computed properties\n`;
  script += `const variantClass = computed(() => {\n`;
  script += `  return props.variant ? \`variant-\${props.variant}\` : '';\n`;
  script += `});\n\n`;

  // Methods
  script += `// Methods\n`;
  script += `const handleClick = (event: MouseEvent) => {\n`;
  script += `  emit('click', event);\n`;
  script += `};\n`;

  return script;
}

function extractVueProps(node: FigmaNode): string[] {
  const props: string[] = [];

  // Extract props from component property definitions
  if (node.componentPropertyDefinitions) {
    Object.entries(node.componentPropertyDefinitions).forEach(([key, definition]) => {
      const propType = getVueTypeScriptType(definition.type, definition.defaultValue);
      props.push(`${key}?: ${propType};`);
    });
  }

  // Add common props based on node type
  if (node.type === 'TEXT') {
    props.push('text?: string;');
  }

  if (node.type === 'IMAGE') {
    props.push('src?: string;');
    props.push('alt?: string;');
  }

  // Add variant props for components with variants
  if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    props.push('variant?: string;');
  }

  // Add common Vue props
  props.push('class?: string;');

  return props;
}

function getVueTypeScriptType(figmaType: string, defaultValue: any): string {
  switch (figmaType) {
    case 'BOOLEAN':
      return 'boolean';
    case 'TEXT':
      return 'string';
    case 'VARIANT':
      return 'string';
    case 'INSTANCE_SWAP':
      return 'Component';
    default:
      if (typeof defaultValue === 'string') return 'string';
      if (typeof defaultValue === 'number') return 'number';
      if (typeof defaultValue === 'boolean') return 'boolean';
      return 'any';
  }
}

function generateVueStyles(node: FigmaNode, api: PluginAPI): string {
  const componentClass = api.utils.toKebabCase(node.name || 'component');
  let styles = `.${componentClass} {\n`;

  // Add component-specific styles
  if (node.absoluteBoundingBox) {
    styles += `  width: ${node.absoluteBoundingBox.width}px;\n`;
    styles += `  height: ${node.absoluteBoundingBox.height}px;\n`;
  }

  if (node.fills && node.fills[0]?.color) {
    const color = rgbaToCss(node.fills[0].color);
    styles += `  background-color: ${color};\n`;
  }

  if (node.cornerRadius) {
    styles += `  border-radius: ${node.cornerRadius}px;\n`;
  }

  // Add responsive styles
  styles += `}\n\n`;

  // Add variant styles
  styles += `.${componentClass}--variant {\n`;
  styles += `  /* Variant styles */\n`;
  styles += `}\n\n`;

  // Add interaction states
  styles += `.${componentClass}:hover {\n`;
  styles += `  /* Hover styles */\n`;
  styles += `}\n\n`;

  styles += `.${componentClass}:focus {\n`;
  styles += `  outline: 2px solid var(--focus-color, #3b82f6);\n`;
  styles += `  outline-offset: 2px;\n`;
  styles += `}\n`;

  return styles;
}

function generateVueTypes(node: FigmaNode, api: PluginAPI): string {
  const componentName = api.utils.toPascalCase(node.name || 'Component');
  const props = extractVueProps(node);

  return `
export interface ${componentName}Props {
  ${props.join('\n  ')}
}

export interface ${componentName}Emits {
  click: [event: MouseEvent];
}`;
}

// Utility function
function rgbaToCss(color: any): string {
  return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a})`;
}