import { Plugin, PluginRegistry, PluginAPI, FigmaNode } from '@/types';

/**
 * Plugin Manager for the Figma to React Converter
 * Manages registration, execution, and lifecycle of converter plugins
 */
export class PluginManager implements PluginRegistry {
  private plugins = new Map<string, Plugin>();
  private loadedPlugins = new Set<string>();

  constructor() {
    this.loadBuiltinPlugins();
  }

  /**
   * Register a new plugin
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already registered`);
    }

    // Validate plugin structure
    this.validatePlugin(plugin);

    this.plugins.set(plugin.name, plugin);
    this.loadedPlugins.add(plugin.name);
    
    console.log(`✅ Plugin '${plugin.name}' v${plugin.version} registered successfully`);
  }

  /**
   * Unregister a plugin
   */
  unregister(name: string): void {
    if (!this.plugins.has(name)) {
      throw new Error(`Plugin '${name}' is not registered`);
    }

    this.plugins.delete(name);
    this.loadedPlugins.delete(name);
    
    console.log(`❌ Plugin '${name}' unregistered`);
  }

  /**
   * Get a specific plugin
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * List all registered plugins
   */
  list(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Execute a plugin hook
   */
  execute(pluginName: string, hook: string, ...args: any[]): any {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin '${pluginName}' not found`);
    }

    const hookFunction = plugin.hooks[hook as keyof typeof plugin.hooks];
    if (!hookFunction) {
      console.warn(`Hook '${hook}' not found in plugin '${pluginName}'`);
      return args[0]; // Return original input
    }

    try {
      return hookFunction(...args);
    } catch (error) {
      console.error(`Error executing hook '${hook}' in plugin '${pluginName}':`, error);
      throw error;
    }
  }

  /**
   * Execute a hook across all plugins that support it
   */
  executeAll(hook: string, ...args: any[]): any {
    let result = args[0];

    for (const plugin of this.plugins.values()) {
      const hookFunction = plugin.hooks[hook as keyof typeof plugin.hooks];
      if (hookFunction) {
        try {
          result = hookFunction(result, ...args.slice(1));
        } catch (error) {
          console.error(`Error in plugin '${plugin.name}' hook '${hook}':`, error);
        }
      }
    }

    return result;
  }

  /**
   * Get plugins by framework
   */
  getByFramework(framework: string): Plugin[] {
    return this.list().filter(plugin => plugin.framework === framework);
  }

  /**
   * Convert a node using the appropriate plugin
   */
  async convertNode(node: FigmaNode, framework: string, api: PluginAPI): Promise<string> {
    const plugins = this.getByFramework(framework);
    
    if (plugins.length === 0) {
      throw new Error(`No plugins found for framework: ${framework}`);
    }

    // Use the first available plugin for the framework
    const plugin = plugins[0];
    
    try {
      // Execute beforeConversion hook
      let processedNode = node;
      if (plugin.hooks.beforeConversion) {
        processedNode = plugin.hooks.beforeConversion(node);
      }

      // Execute main conversion
      let result = '';
      if (plugin.hooks.processNode) {
        result = plugin.hooks.processNode(processedNode, api);
      } else {
        result = api.convertNode(processedNode);
      }

      // Execute afterConversion hook
      if (plugin.hooks.afterConversion) {
        result = plugin.hooks.afterConversion(result, processedNode);
      }

      return result;
    } catch (error) {
      console.error(`Error converting node with plugin '${plugin.name}':`, error);
      throw error;
    }
  }

  /**
   * Load built-in plugins
   */
  private loadBuiltinPlugins(): void {
    try {
      // These will be loaded from separate files
      import('./react-plugin').then(({ reactPlugin }) => {
        this.register(reactPlugin);
      });

      import('./vue-plugin').then(({ vuePlugin }) => {
        this.register(vuePlugin);
      });
    } catch (error) {
      console.warn('Some built-in plugins could not be loaded:', error);
    }
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: Plugin): void {
    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new Error('Plugin must have a valid name');
    }

    if (!plugin.version || typeof plugin.version !== 'string') {
      throw new Error('Plugin must have a valid version');
    }

    if (!plugin.framework || typeof plugin.framework !== 'string') {
      throw new Error('Plugin must specify a target framework');
    }

    if (!plugin.fileExtension || typeof plugin.fileExtension !== 'string') {
      throw new Error('Plugin must specify a file extension');
    }

    if (!plugin.hooks || typeof plugin.hooks !== 'object') {
      throw new Error('Plugin must have a hooks object');
    }

    // At least one hook must be defined
    const hookCount = Object.keys(plugin.hooks).length;
    if (hookCount === 0) {
      throw new Error('Plugin must define at least one hook');
    }
  }

  /**
   * Get plugin status information
   */
  getStatus(): { total: number; loaded: string[]; available: string[] } {
    return {
      total: this.plugins.size,
      loaded: Array.from(this.loadedPlugins),
      available: this.list().map(p => `${p.name} (${p.framework})`)
    };
  }

  /**
   * Install plugin from npm package
   */
  async installPlugin(packageName: string): Promise<void> {
    try {
      // In a real implementation, this would use npm to install the package
      // For now, we'll simulate the installation
      console.log(`Installing plugin package: ${packageName}`);
      
      // Dynamic import of the plugin
      const pluginModule = await import(packageName);
      const plugin = pluginModule.default || pluginModule.plugin;
      
      if (!plugin) {
        throw new Error(`Invalid plugin package: ${packageName}`);
      }

      this.register(plugin);
      console.log(`✅ Plugin '${plugin.name}' installed successfully`);
    } catch (error) {
      console.error(`Failed to install plugin '${packageName}':`, error);
      throw error;
    }
  }

  /**
   * Create plugin API for use in conversions
   */
  createAPI(): PluginAPI {
    return {
      convertNode: (node: FigmaNode) => {
        // Default node conversion logic
        return this.defaultNodeConversion(node);
      },
      generateStyles: (node: FigmaNode) => {
        return this.generateNodeStyles(node);
      },
      generateTypes: (node: FigmaNode) => {
        return this.generateNodeTypes(node);
      },
      processChildren: (children: FigmaNode[]) => {
        return children.map(child => this.defaultNodeConversion(child));
      },
      utils: {
        toCamelCase: (str: string) => {
          return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        },
        toPascalCase: (str: string) => {
          return str.charAt(0).toUpperCase() + 
                 str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        },
        toKebabCase: (str: string) => {
          return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        },
        rgbaToHex: (color: any) => {
          const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
          return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
        },
        rgbaToCss: (color: any) => {
          return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a})`;
        }
      }
    };
  }

  /**
   * Default node conversion (basic implementation)
   */
  private defaultNodeConversion(node: FigmaNode): string {
    switch (node.type) {
      case 'TEXT':
        return `<span>${node.characters || ''}</span>`;
      case 'RECTANGLE':
      case 'FRAME':
        const children = node.children?.map(child => this.defaultNodeConversion(child)).join('') || '';
        return `<div>${children}</div>`;
      default:
        return `<!-- ${node.type} node: ${node.name} -->`;
    }
  }

  /**
   * Generate styles for a node
   */
  private generateNodeStyles(node: FigmaNode): string {
    const styles: string[] = [];

    if (node.absoluteBoundingBox) {
      styles.push(`width: ${node.absoluteBoundingBox.width}px`);
      styles.push(`height: ${node.absoluteBoundingBox.height}px`);
    }

    if (node.fills && node.fills[0]?.color) {
      const color = node.fills[0].color;
      styles.push(`background-color: rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a})`);
    }

    if (node.cornerRadius) {
      styles.push(`border-radius: ${node.cornerRadius}px`);
    }

    return styles.join('; ');
  }

  /**
   * Generate TypeScript types for a node
   */
  private generateNodeTypes(node: FigmaNode): string {
    const props: string[] = [];

    if (node.characters !== undefined) {
      props.push('text?: string');
    }

    if (node.children && node.children.length > 0) {
      props.push('children?: React.ReactNode');
    }

    return `interface ${node.name.replace(/[^a-zA-Z0-9]/g, '')}Props {
  ${props.join(';\n  ')}${props.length > 0 ? ';' : ''}
  className?: string;
}`;
  }
}

// Global plugin manager instance
export const pluginManager = new PluginManager();