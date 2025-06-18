// Core Types for Figma to React Converter

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  effects?: FigmaEffect[];
  constraints?: FigmaConstraints;
  characters?: string;
  style?: FigmaTextStyle;
  layoutAlign?: string;
  layoutGrow?: number;
  layoutMode?: string;
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  cornerRadius?: number;
  strokeWeight?: number;
  opacity?: number;
  blendMode?: string;
  visible?: boolean;
  exportSettings?: FigmaExportSetting[];
  componentId?: string;
  componentPropertyDefinitions?: Record<string, FigmaComponentPropertyDefinition>;
  overrides?: Record<string, any>;
}

export interface FigmaFill {
  type: string;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  gradientStops?: FigmaGradientStop[];
  gradientTransform?: number[][];
  imageRef?: string;
  scaleMode?: string;
}

export interface FigmaStroke {
  type: string;
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

export interface FigmaEffect {
  type: string;
  visible: boolean;
  radius?: number;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  offset?: {
    x: number;
    y: number;
  };
  spread?: number;
  blendMode?: string;
}

export interface FigmaGradientStop {
  position: number;
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

export interface FigmaConstraints {
  vertical: string;
  horizontal: string;
}

export interface FigmaTextStyle {
  fontFamily: string;
  fontPostScriptName: string;
  fontWeight: number;
  fontSize: number;
  lineHeightPx: number;
  letterSpacing: number;
  textAlignHorizontal: string;
  textAlignVertical: string;
}

export interface FigmaExportSetting {
  suffix: string;
  format: string;
  constraint: {
    type: string;
    value: number;
  };
}

export interface FigmaComponentPropertyDefinition {
  type: string;
  defaultValue: any;
  variantOptions?: string[];
}

export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  styles: Record<string, FigmaStyle>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
  documentationLinks: FigmaDocumentationLink[];
}

export interface FigmaStyle {
  key: string;
  name: string;
  description: string;
  styleType: string;
}

export interface FigmaDocumentationLink {
  uri: string;
}

// Plugin System Types
export interface PluginAPI {
  convertNode: (node: FigmaNode) => string;
  generateStyles: (node: FigmaNode) => string;
  generateTypes: (node: FigmaNode) => string;
  processChildren: (children: FigmaNode[]) => string[];
  utils: {
    toCamelCase: (str: string) => string;
    toPascalCase: (str: string) => string;
    toKebabCase: (str: string) => string;
    rgbaToHex: (color: any) => string;
    rgbaToCss: (color: any) => string;
  };
}

export interface Plugin {
  name: string;
  version: string;
  description: string;
  framework: 'react' | 'vue' | 'svelte' | 'react-native' | 'angular';
  fileExtension: string;
  hooks: {
    beforeConversion?: (node: FigmaNode) => FigmaNode;
    afterConversion?: (code: string, node: FigmaNode) => string;
    processNode?: (node: FigmaNode, api: PluginAPI) => string;
    generateStyles?: (node: FigmaNode, api: PluginAPI) => string;
    generateTypes?: (node: FigmaNode, api: PluginAPI) => string;
  };
  config?: Record<string, any>;
}

export interface PluginRegistry {
  plugins: Map<string, Plugin>;
  register: (plugin: Plugin) => void;
  unregister: (name: string) => void;
  get: (name: string) => Plugin | undefined;
  list: () => Plugin[];
  execute: (pluginName: string, hook: string, ...args: any[]) => any;
}

// Conversion Options
export interface ConversionOptions {
  framework: 'react' | 'vue' | 'svelte' | 'react-native';
  typescript: boolean;
  styling: 'css' | 'styled-components' | 'tailwind' | 'emotion';
  outputDir: string;
  componentName?: string;
  exportDefault: boolean;
  generateTypes: boolean;
  generateStories: boolean;
  generateTests: boolean;
  optimizeImages: boolean;
  extractDesignTokens: boolean;
  enableAccessibility: boolean;
  customHooks?: string[];
  plugins?: string[];
  ai?: {
    enabled: boolean;
    provider: 'openai' | 'groq';
    optimize: boolean;
    suggestions: boolean;
  };
}

// Design Tokens
export interface DesignToken {
  name: string;
  value: string | number;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'border' | 'opacity';
  category?: string;
  description?: string;
  source?: string;
}

export interface DesignTokenCollection {
  colors: DesignToken[];
  spacing: DesignToken[];
  typography: DesignToken[];
  shadows: DesignToken[];
  borders: DesignToken[];
  opacity: DesignToken[];
}

export interface TokenExportFormat {
  json: boolean;
  css: boolean;
  scss: boolean;
  tailwind: boolean;
  styleDictionary: boolean;
  javascript: boolean;
  typescript: boolean;
}

// Accessibility Types
export interface AccessibilityFeature {
  type: 'aria-label' | 'aria-describedby' | 'role' | 'tabindex' | 'focus-indicator' | 'keyboard-nav';
  value: string;
  reason: string;
  confidence: number;
}

export interface AccessibilityReport {
  score: number;
  features: AccessibilityFeature[];
  warnings: string[];
  suggestions: string[];
  wcagLevel: 'A' | 'AA' | 'AAA';
}

// CLI Types
export interface CLIConfig {
  figmaToken: string;
  outputDir: string;
  framework: string;
  typescript: boolean;
  styling: string;
  plugins: string[];
  caching: boolean;
  accessibility: boolean;
  designTokens: boolean;
  storybook: boolean;
  ai: {
    enabled: boolean;
    provider: string;
    apiKey?: string;
  };
}

// Cache Types
export interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  hash: string;
  ttl: number;
}

export interface CacheOptions {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size in MB
  directory: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'connection' | 'file-update' | 'node-update' | 'style-update' | 'component-update' | 
        'file-watch-started' | 'update-result' | 'update-error' | 'preview-options-updated' | 
        'server-shutdown';
  data: any;
  timestamp: number;
}

// Live Preview Types
export interface PreviewOptions {
  device: 'mobile' | 'tablet' | 'desktop';
  theme: 'light' | 'dark';
  hotReload: boolean;
  autoRefresh: boolean;
}

// Storybook Types
export interface StoryConfig {
  component: string;
  title: string;
  parameters?: Record<string, any>;
  args?: Record<string, any>;
  argTypes?: Record<string, any>;
  variants?: StoryVariant[];
}

export interface StoryVariant {
  name: string;
  args: Record<string, any>;
  parameters?: Record<string, any>;
}

// Test Generation Types
export interface TestConfig {
  framework: 'vitest' | 'jest';
  library: 'testing-library' | 'enzyme';
  snapshot: boolean;
  accessibility: boolean;
  visual: boolean;
}

// AI Types
export interface AIProvider {
  name: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface AIRequest {
  prompt: string;
  context: {
    node: FigmaNode;
    code?: string;
    framework: string;
  };
  type: 'optimize' | 'suggest' | 'fix' | 'enhance';
}

export interface AIResponse {
  code?: string;
  suggestions: string[];
  confidence: number;
  reasoning: string;
}

// Report Types
export interface ConversionReport {
  timestamp: string;
  input: {
    figmaUrl: string;
    nodeCount: number;
    fileSize: string;
  };
  output: {
    files: GeneratedFile[];
    totalSize: string;
    framework: string;
  };
  performance: {
    conversionTime: number;
    apiCalls: number;
    cacheHits: number;
    memoryUsage: number;
  };
  accessibility: AccessibilityReport;
  designTokens: {
    extracted: number;
    categories: string[];
  };
  warnings: string[];
  errors: string[];
}

export interface GeneratedFile {
  path: string;
  size: number;
  type: 'component' | 'style' | 'type' | 'story' | 'test';
  lines: number;
}

// Error Types
export interface ConversionError {
  type: 'figma-api' | 'conversion' | 'plugin' | 'file-system' | 'validation';
  message: string;
  node?: FigmaNode;
  stack?: string;
  code?: string;
}

// Configuration Types
export interface AppConfig {
  figma: {
    apiKey: string;
    baseUrl: string;
  };
  ai: {
    openai?: {
      apiKey: string;
      model: string;
    };
    groq?: {
      apiKey: string;
      model: string;
    };
  };
  cache: CacheOptions;
  plugins: {
    directory: string;
    autoload: boolean;
  };
  output: {
    directory: string;
    cleanBefore: boolean;
  };
  features: {
    accessibility: boolean;
    designTokens: boolean;
    storybook: boolean;
    testing: boolean;
    ai: boolean;
    hotReload: boolean;
  };
}

// Export utility type for component props
export type ComponentProps<T = Record<string, any>> = T & {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
};

// Plugin hook types
export type PluginHook = 'beforeConversion' | 'afterConversion' | 'processNode' | 'generateStyles' | 'generateTypes';

// Framework-specific types
export interface ReactComponent {
  name: string;
  props: Record<string, any>;
  jsx: string;
  imports: string[];
  exports: string[];
}

export interface VueComponent {
  name: string;
  template: string;
  script: string;
  style: string;
  props: Record<string, any>;
}

// Validation types
export interface ValidationRule {
  name: string;
  check: (node: FigmaNode) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}