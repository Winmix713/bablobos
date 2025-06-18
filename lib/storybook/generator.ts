import { FigmaNode, StoryConfig, StoryVariant } from '@/types';

/**
 * Storybook Story Generator
 * Automatically generates Storybook stories from Figma components
 */
export class StoryGenerator {
  /**
   * Generate Storybook story for a Figma component
   */
  async generate(
    node: FigmaNode,
    options: {
      framework: 'react' | 'vue' | 'svelte' | 'react-native';
      typescript: boolean;
      includeControls: boolean;
      includeActions: boolean;
      includeDocs: boolean;
      includeA11y: boolean;
    }
  ): Promise<string> {
    console.log(`📚 Generating Storybook story for component: ${node.name}`);

    const componentName = this.sanitizeComponentName(node.name || 'Component');
    const storyConfig = this.createStoryConfig(node, options);
    
    switch (options.framework) {
      case 'react':
        return this.generateReactStory(componentName, storyConfig, options);
      case 'vue':
        return this.generateVueStory(componentName, storyConfig, options);
      case 'svelte':
        return this.generateSvelteStory(componentName, storyConfig, options);
      default:
        throw new Error(`Unsupported framework: ${options.framework}`);
    }
  }

  /**
   * Generate multiple story variants for component variations
   */
  async generateVariants(
    node: FigmaNode,
    variants: FigmaNode[],
    options: any
  ): Promise<string[]> {
    console.log(`📚 Generating ${variants.length} story variants for ${node.name}`);
    
    const stories: string[] = [];
    
    for (const variant of variants) {
      const story = await this.generate(variant, options);
      stories.push(story);
    }
    
    return stories;
  }

  /**
   * Generate Storybook configuration files
   */
  async generateConfig(): Promise<{ main: string; preview: string }> {
    const main = this.generateMainConfig();
    const preview = this.generatePreviewConfig();
    
    return { main, preview };
  }

  private createStoryConfig(node: FigmaNode, options: any): StoryConfig {
    const componentName = this.sanitizeComponentName(node.name || 'Component');
    const variants = this.extractVariants(node);
    const controls = this.generateControls(node);
    const actions = this.generateActions(node);

    return {
      component: componentName,
      title: `Components/${componentName}`,
      parameters: {
        docs: {
          description: {
            component: `Generated from Figma component: ${node.name}`
          }
        },
        ...(options.includeA11y && {
          a11y: {
            config: {
              rules: [
                {
                  id: 'color-contrast',
                  enabled: true
                },
                {
                  id: 'keyboard-navigation',
                  enabled: true
                }
              ]
            }
          }
        })
      },
      args: this.extractDefaultProps(node),
      argTypes: controls,
      variants
    };
  }

  private generateReactStory(
    componentName: string,
    config: StoryConfig,
    options: any
  ): string {
    const extension = options.typescript ? 'tsx' : 'jsx';
    const importType = options.typescript ? 'import type { Meta, StoryObj } from' : 'import { Meta, StoryObj } from';
    
    let story = `${importType} '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta${options.typescript ? ': Meta<typeof ' + componentName + '>' : ''} = {
  title: '${config.title}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${config.parameters?.docs?.description?.component || ''}'
      }
    }${config.parameters?.a11y ? ',\n    a11y: ' + JSON.stringify(config.parameters.a11y, null, 4) : ''}
  },
  tags: ['autodocs'],
  argTypes: ${JSON.stringify(config.argTypes || {}, null, 2)}${options.includeActions ? ',\n  ...actions' : ''}
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: ${JSON.stringify(config.args || {}, null, 2)}
};

`;

    // Generate variant stories
    if (config.variants && config.variants.length > 0) {
      config.variants.forEach(variant => {
        story += `export const ${variant.name}: Story = {
  args: ${JSON.stringify(variant.args, null, 2)}${variant.parameters ? ',\n  parameters: ' + JSON.stringify(variant.parameters, null, 2) : ''}
};

`;
      });
    }

    // Generate interactive stories
    story += this.generateInteractiveStories(componentName, config, options);

    // Generate accessibility story
    if (options.includeA11y) {
      story += this.generateA11yStory(componentName, config);
    }

    // Generate responsive stories
    story += this.generateResponsiveStories(componentName, config);

    return story;
  }

  private generateVueStory(
    componentName: string,
    config: StoryConfig,
    options: any
  ): string {
    let story = `import type { Meta, StoryObj } from '@storybook/vue3';
import ${componentName} from './${componentName}.vue';

const meta: Meta<typeof ${componentName}> = {
  title: '${config.title}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${config.parameters?.docs?.description?.component || ''}'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: ${JSON.stringify(config.argTypes || {}, null, 2)}
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: ${JSON.stringify(config.args || {}, null, 2)}
};

`;

    // Generate variant stories for Vue
    if (config.variants && config.variants.length > 0) {
      config.variants.forEach(variant => {
        story += `export const ${variant.name}: Story = {
  args: ${JSON.stringify(variant.args, null, 2)}
};

`;
      });
    }

    return story;
  }

  private generateSvelteStory(
    componentName: string,
    config: StoryConfig,
    options: any
  ): string {
    let story = `import type { Meta, StoryObj } from '@storybook/svelte';
import ${componentName} from './${componentName}.svelte';

const meta: Meta<${componentName}> = {
  title: '${config.title}',
  component: ${componentName},
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: ${JSON.stringify(config.argTypes || {}, null, 2)}
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: ${JSON.stringify(config.args || {}, null, 2)}
};

`;

    return story;
  }

  private extractVariants(node: FigmaNode): StoryVariant[] {
    const variants: StoryVariant[] = [];

    // Extract variants from component property definitions
    if (node.componentPropertyDefinitions) {
      Object.entries(node.componentPropertyDefinitions).forEach(([key, definition]) => {
        if (definition.type === 'VARIANT' && definition.variantOptions) {
          definition.variantOptions.forEach(option => {
            variants.push({
              name: `${this.capitalize(key)}${this.capitalize(option)}`,
              args: {
                [key]: option
              }
            });
          });
        }
      });
    }

    // Generate common variants
    variants.push(
      {
        name: 'Small',
        args: { size: 'small' }
      },
      {
        name: 'Large',
        args: { size: 'large' }
      },
      {
        name: 'Disabled',
        args: { disabled: true }
      }
    );

    return variants;
  }

  private generateControls(node: FigmaNode): Record<string, any> {
    const controls: Record<string, any> = {};

    // Generate controls from component properties
    if (node.componentPropertyDefinitions) {
      Object.entries(node.componentPropertyDefinitions).forEach(([key, definition]) => {
        switch (definition.type) {
          case 'BOOLEAN':
            controls[key] = {
              control: 'boolean',
              description: `Toggle ${key}`
            };
            break;
          case 'TEXT':
            controls[key] = {
              control: 'text',
              description: `Text content for ${key}`
            };
            break;
          case 'VARIANT':
            controls[key] = {
              control: 'select',
              options: definition.variantOptions || [],
              description: `Select ${key} variant`
            };
            break;
        }
      });
    }

    // Add common controls
    controls.children = {
      control: 'text',
      description: 'Child content'
    };

    controls.className = {
      control: 'text',
      description: 'Additional CSS classes'
    };

    // Add design token controls based on node properties
    if (node.fills && node.fills.length > 0) {
      controls.backgroundColor = {
        control: 'color',
        description: 'Background color'
      };
    }

    if (node.style?.fontSize) {
      controls.fontSize = {
        control: { type: 'range', min: 12, max: 48, step: 1 },
        description: 'Font size in pixels'
      };
    }

    return controls;
  }

  private generateActions(node: FigmaNode): Record<string, any> {
    const actions: Record<string, any> = {};

    // Generate actions for interactive elements
    if (this.isInteractiveElement(node)) {
      actions.onClick = { action: 'clicked' };
      actions.onFocus = { action: 'focused' };
      actions.onBlur = { action: 'blurred' };
    }

    // Add form-specific actions
    if (this.isFormElement(node)) {
      actions.onChange = { action: 'changed' };
      actions.onSubmit = { action: 'submitted' };
    }

    return actions;
  }

  private extractDefaultProps(node: FigmaNode): Record<string, any> {
    const props: Record<string, any> = {};

    // Extract from component property definitions
    if (node.componentPropertyDefinitions) {
      Object.entries(node.componentPropertyDefinitions).forEach(([key, definition]) => {
        props[key] = definition.defaultValue;
      });
    }

    // Set common defaults
    if (node.type === 'TEXT' && node.characters) {
      props.children = node.characters;
    }

    props.children = props.children || 'Component content';

    return props;
  }

  private generateInteractiveStories(
    componentName: string,
    config: StoryConfig,
    options: any
  ): string {
    if (!this.isInteractiveElement({ name: componentName } as FigmaNode)) {
      return '';
    }

    return `// Interactive stories
export const WithHover: Story = {
  args: {
    ...Default.args
  },
  parameters: {
    pseudo: { hover: true }
  }
};

export const WithFocus: Story = {
  args: {
    ...Default.args
  },
  parameters: {
    pseudo: { focus: true }
  }
};

export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true
  }
};

`;
  }

  private generateA11yStory(componentName: string, config: StoryConfig): string {
    return `// Accessibility story
export const AccessibilityTest: Story = {
  args: {
    ...Default.args
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true
          },
          {
            id: 'keyboard-navigation', 
            enabled: true
          },
          {
            id: 'focus-management',
            enabled: true
          }
        ]
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test keyboard navigation
    const element = canvas.getByRole('button') || canvas.getByText(/${componentName}/);
    await userEvent.tab();
    expect(element).toHaveFocus();
    
    // Test click interaction
    await userEvent.click(element);
  }
};

`;
  }

  private generateResponsiveStories(componentName: string, config: StoryConfig): string {
    return `// Responsive stories
export const Mobile: Story = {
  args: {
    ...Default.args
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
};

export const Tablet: Story = {
  args: {
    ...Default.args
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    }
  }
};

export const Desktop: Story = {
  args: {
    ...Default.args
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop'
    }
  }
};

`;
  }

  private generateMainConfig(): string {
    return `import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-controls',
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true)
    }
  }
};

export default config;`;
  }

  private generatePreviewConfig(): string {
    return `import type { Preview } from '@storybook/react';
import '../src/index.css'; // Import your global styles

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    docs: {
      toc: true
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true
          },
          {
            id: 'keyboard-navigation',
            enabled: true
          }
        ]
      }
    }
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['light', 'dark'],
        dynamicTitle: true
      }
    }
  }
};

export default preview;`;
  }

  // Utility methods
  private sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private isInteractiveElement(node: FigmaNode): boolean {
    if (!node.name) return false;
    
    const name = node.name.toLowerCase();
    return (
      name.includes('button') ||
      name.includes('btn') ||
      name.includes('link') ||
      name.includes('clickable') ||
      name.includes('interactive') ||
      node.type === 'INSTANCE'
    );
  }

  private isFormElement(node: FigmaNode): boolean {
    if (!node.name) return false;
    
    const name = node.name.toLowerCase();
    return (
      name.includes('input') ||
      name.includes('form') ||
      name.includes('field') ||
      name.includes('textarea') ||
      name.includes('select')
    );
  }
}

// Export singleton instance
export const storyGenerator = new StoryGenerator();