import { FigmaNode, TestConfig } from '@/types';

/**
 * Test Generator for Generated Components
 * Creates unit tests, integration tests, and accessibility tests
 */
export class TestGenerator {
  /**
   * Generate comprehensive tests for a component
   */
  async generate(
    node: FigmaNode,
    options: {
      framework: 'react' | 'vue' | 'svelte' | 'react-native';
      typescript: boolean;
      accessibility: boolean;
      visual: boolean;
      integration: boolean;
    }
  ): Promise<string> {
    console.log(`🧪 Generating tests for component: ${node.name}`);

    const componentName = this.sanitizeComponentName(node.name || 'Component');
    
    switch (options.framework) {
      case 'react':
        return this.generateReactTests(componentName, node, options);
      case 'vue':
        return this.generateVueTests(componentName, node, options);
      case 'svelte':
        return this.generateSvelteTests(componentName, node, options);
      default:
        throw new Error(`Unsupported framework: ${options.framework}`);
    }
  }

  /**
   * Generate test configuration files
   */
  async generateTestConfig(framework: string): Promise<{ vitest?: string; jest?: string; playwright?: string }> {
    const configs: any = {};

    configs.vitest = this.generateVitestConfig();
    configs.jest = this.generateJestConfig();
    
    if (framework === 'react') {
      configs.playwright = this.generatePlaywrightConfig();
    }

    return configs;
  }

  /**
   * Generate test utilities and helpers
   */
  async generateTestUtils(framework: string): Promise<string> {
    return this.generateTestUtilities(framework);
  }

  private generateReactTests(
    componentName: string,
    node: FigmaNode,
    options: any
  ): string {
    const isTypeScript = options.typescript;
    const extension = isTypeScript ? 'tsx' : 'jsx';
    
    let testFile = `import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
${options.accessibility ? "import { axe, toHaveNoViolations } from 'jest-axe';" : ''}
import { ${componentName} } from './${componentName}';

${options.accessibility ? 'expect.extend(toHaveNoViolations);' : ''}

describe('${componentName}', () => {
  // Smoke test
  it('renders without crashing', () => {
    render(<${componentName} />);
    expect(screen.getByTestId('${this.generateTestId(node.name)}')).toBeInTheDocument();
  });

  // Props test
  it('renders with custom props', () => {
    const customProps = ${this.generateMockProps(node, isTypeScript)};
    render(<${componentName} {...customProps} />);
    
    ${this.generatePropAssertions(node)}
  });

  // Content test
  ${node.type === 'TEXT' ? this.generateTextTests(componentName, node) : ''}

  // Interaction tests
  ${this.isInteractiveElement(node) ? this.generateInteractionTests(componentName, node) : ''}

  // Style tests
  it('applies custom className', () => {
    const customClass = 'custom-test-class';
    render(<${componentName} className={customClass} />);
    
    const element = screen.getByTestId('${this.generateTestId(node.name)}');
    expect(element).toHaveClass(customClass);
  });

  // Snapshot test
  it('matches snapshot', () => {
    const { container } = render(<${componentName} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  ${options.accessibility ? this.generateAccessibilityTests(componentName, node) : ''}

  ${options.visual ? this.generateVisualRegressionTests(componentName, node) : ''}

  ${options.integration ? this.generateIntegrationTests(componentName, node) : ''}

  // Error boundary tests
  it('handles errors gracefully', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    expect(() => {
      render(
        <${componentName}>
          <ThrowError />
        </${componentName}>
      );
    }).not.toThrow();
    
    consoleError.mockRestore();
  });

  // Performance tests
  it('renders efficiently', async () => {
    const startTime = performance.now();
    
    render(<${componentName} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render in less than 50ms
    expect(renderTime).toBeLessThan(50);
  });
});

// Component-specific test suites
${this.generateComponentSpecificTests(componentName, node, options)}
`;

    return testFile;
  }

  private generateVueTests(
    componentName: string,
    node: FigmaNode,
    options: any
  ): string {
    return `import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
${options.accessibility ? "import { axe } from 'jest-axe';" : ''}
import ${componentName} from './${componentName}.vue';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    const wrapper = mount(${componentName});
    expect(wrapper.exists()).toBe(true);
  });

  it('renders with props', () => {
    const props = ${this.generateMockProps(node, false)};
    const wrapper = mount(${componentName}, { props });
    
    ${this.generateVuePropAssertions(node)}
  });

  ${node.type === 'TEXT' ? this.generateVueTextTests(componentName, node) : ''}

  ${this.isInteractiveElement(node) ? this.generateVueInteractionTests(componentName, node) : ''}

  it('matches snapshot', () => {
    const wrapper = mount(${componentName});
    expect(wrapper.html()).toMatchSnapshot();
  });

  ${options.accessibility ? this.generateVueAccessibilityTests(componentName) : ''}
});`;
  }

  private generateSvelteTests(
    componentName: string,
    node: FigmaNode,
    options: any
  ): string {
    return `import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ${componentName} from './${componentName}.svelte';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    const { container } = render(${componentName});
    expect(container).toBeInTheDocument();
  });

  it('renders with props', () => {
    const props = ${this.generateMockProps(node, false)};
    const { getByTestId } = render(${componentName}, props);
    
    expect(getByTestId('${this.generateTestId(node.name)}')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(${componentName});
    expect(container.firstChild).toMatchSnapshot();
  });
});`;
  }

  private generateTextTests(componentName: string, node: FigmaNode): string {
    return `
  // Text content tests
  it('displays text content', () => {
    const text = '${node.characters || 'Test content'}';
    render(<${componentName}>{text}</${componentName}>);
    
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('updates text content when props change', () => {
    const { rerender } = render(<${componentName}>Initial text</${componentName}>);
    expect(screen.getByText('Initial text')).toBeInTheDocument();
    
    rerender(<${componentName}>Updated text</${componentName}>);
    expect(screen.getByText('Updated text')).toBeInTheDocument();
    expect(screen.queryByText('Initial text')).not.toBeInTheDocument();
  });`;
  }

  private generateInteractionTests(componentName: string, node: FigmaNode): string {
    return `
  // Interaction tests
  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<${componentName} onClick={handleClick} />);
    
    const element = screen.getByTestId('${this.generateTestId(node.name)}');
    await userEvent.click(element);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events', async () => {
    const handleClick = vi.fn();
    render(<${componentName} onClick={handleClick} />);
    
    const element = screen.getByTestId('${this.generateTestId(node.name)}');
    element.focus();
    await userEvent.keyboard('{Enter}');
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles focus and blur events', async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    
    render(
      <${componentName} 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
      />
    );
    
    const element = screen.getByTestId('${this.generateTestId(node.name)}');
    
    element.focus();
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    element.blur();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('supports disabled state', () => {
    render(<${componentName} disabled />);
    
    const element = screen.getByTestId('${this.generateTestId(node.name)}');
    expect(element).toBeDisabled();
  });`;
  }

  private generateAccessibilityTests(componentName: string, node: FigmaNode): string {
    return `
  // Accessibility tests
  it('has no accessibility violations', async () => {
    const { container } = render(<${componentName} />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  it('has proper ARIA attributes', () => {
    render(<${componentName} />);
    
    const element = screen.getByTestId('${this.generateTestId(node.name)}');
    
    ${this.generateAriaAssertions(node)}
  });

  it('supports keyboard navigation', async () => {
    render(<${componentName} />);
    
    const element = screen.getByTestId('${this.generateTestId(node.name)}');
    
    // Should be focusable
    element.focus();
    expect(element).toHaveFocus();
    
    // Should respond to keyboard events
    await userEvent.keyboard('{Tab}');
    // Add specific keyboard navigation tests based on component type
  });

  it('has sufficient color contrast', () => {
    const { container } = render(<${componentName} />);
    const element = container.firstChild as HTMLElement;
    
    // This would use a color contrast checking library in a real implementation
    const style = window.getComputedStyle(element);
    expect(style.color).toBeDefined();
    expect(style.backgroundColor).toBeDefined();
  });`;
  }

  private generateVisualRegressionTests(componentName: string, node: FigmaNode): string {
    return `
  // Visual regression tests
  it('maintains visual consistency', async () => {
    const { container } = render(<${componentName} />);
    
    // Wait for any animations or async rendering
    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });
    
    // Visual regression testing would be implemented with tools like Percy, Chromatic, etc.
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders correctly in different states', async () => {
    const states = [
      { props: {}, name: 'default' },
      { props: { disabled: true }, name: 'disabled' },
      { props: { loading: true }, name: 'loading' },
    ];

    for (const state of states) {
      const { container } = render(<${componentName} {...state.props} />);
      expect(container.firstChild).toMatchSnapshot(\`\${state.name} state\`);
    }
  });`;
  }

  private generateIntegrationTests(componentName: string, node: FigmaNode): string {
    return `
  // Integration tests
  it('integrates with parent components', () => {
    const ParentComponent = () => (
      <div>
        <h1>Parent Component</h1>
        <${componentName} />
      </div>
    );

    render(<ParentComponent />);
    
    expect(screen.getByText('Parent Component')).toBeInTheDocument();
    expect(screen.getByTestId('${this.generateTestId(node.name)}')).toBeInTheDocument();
  });

  it('handles prop drilling correctly', () => {
    const GrandParent = () => {
      const [value, setValue] = useState('initial');
      
      return (
        <div>
          <button onClick={() => setValue('updated')}>
            Update Value
          </button>
          <${componentName} value={value} />
        </div>
      );
    };

    render(<GrandParent />);
    
    const button = screen.getByText('Update Value');
    fireEvent.click(button);
    
    // Assert that the value was passed down correctly
    // This would depend on the specific component implementation
  });`;
  }

  private generateComponentSpecificTests(
    componentName: string,
    node: FigmaNode,
    options: any
  ): string {
    // Generate tests specific to the component type
    switch (node.type) {
      case 'TEXT':
        return this.generateTextComponentTests(componentName, node);
      case 'RECTANGLE':
      case 'FRAME':
        return this.generateContainerComponentTests(componentName, node);
      case 'IMAGE':
        return this.generateImageComponentTests(componentName, node);
      default:
        return '';
    }
  }

  private generateTextComponentTests(componentName: string, node: FigmaNode): string {
    return `
describe('${componentName} - Text Specific Tests', () => {
  it('handles text overflow correctly', () => {
    const longText = 'This is a very long text that might overflow the container bounds and should be handled gracefully';
    
    render(<${componentName}>{longText}</${componentName}>);
    
    const element = screen.getByTestId('${this.generateTestId(node.name)}');
    const style = window.getComputedStyle(element);
    
    // Check for text overflow handling
    expect(style.textOverflow).toBeDefined();
  });

  it('applies typography styles correctly', () => {
    render(<${componentName} />);
    
    const element = screen.getByTestId('${this.generateTestId(node.name)}');
    const style = window.getComputedStyle(element);
    
    expect(style.fontSize).toBeDefined();
    expect(style.fontFamily).toBeDefined();
    expect(style.lineHeight).toBeDefined();
  });
});`;
  }

  private generateContainerComponentTests(componentName: string, node: FigmaNode): string {
    return `
describe('${componentName} - Container Specific Tests', () => {
  it('handles children correctly', () => {
    const TestChild = () => <div data-testid="test-child">Test Child</div>;
    
    render(
      <${componentName}>
        <TestChild />
      </${componentName}>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('applies layout styles correctly', () => {
    render(<${componentName} />);
    
    const element = screen.getByTestId('${this.generateTestId(node.name)}');
    const style = window.getComputedStyle(element);
    
    // Check for layout properties
    expect(style.display).toBeDefined();
    expect(style.position).toBeDefined();
  });
});`;
  }

  private generateImageComponentTests(componentName: string, node: FigmaNode): string {
    return `
describe('${componentName} - Image Specific Tests', () => {
  it('handles image loading states', async () => {
    render(<${componentName} src="test-image.jpg" alt="Test image" />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test image');
  });

  it('handles image loading errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<${componentName} src="invalid-image.jpg" alt="Test image" />);
    
    const image = screen.getByRole('img');
    
    // Simulate image load error
    fireEvent.error(image);
    
    // Should handle error gracefully
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});`;
  }

  private generateVueTextTests(componentName: string, node: FigmaNode): string {
    return `
  it('displays text content', () => {
    const text = '${node.characters || 'Test content'}';
    const wrapper = mount(${componentName}, {
      slots: { default: text }
    });
    
    expect(wrapper.text()).toContain(text);
  });`;
  }

  private generateVueInteractionTests(componentName: string, node: FigmaNode): string {
    return `
  it('handles click events', async () => {
    const wrapper = mount(${componentName});
    
    await wrapper.trigger('click');
    
    expect(wrapper.emitted('click')).toBeTruthy();
  });`;
  }

  private generateVueAccessibilityTests(componentName: string): string {
    return `
  it('has no accessibility violations', async () => {
    const wrapper = mount(${componentName});
    const results = await axe(wrapper.element);
    
    expect(results.violations).toHaveLength(0);
  });`;
  }

  private generateVuePropAssertions(node: FigmaNode): string {
    return `expect(wrapper.props()).toMatchObject(props);`;
  }

  // Utility methods for test generation
  private generateMockProps(node: FigmaNode, isTypeScript: boolean): string {
    const props: any = {};

    if (node.type === 'TEXT' && node.characters) {
      props.children = `'${node.characters}'`;
    }

    if (this.isInteractiveElement(node)) {
      props.onClick = 'handleClick';
    }

    // Add component-specific props
    if (node.componentPropertyDefinitions) {
      Object.entries(node.componentPropertyDefinitions).forEach(([key, definition]) => {
        switch (definition.type) {
          case 'BOOLEAN':
            props[key] = definition.defaultValue || false;
            break;
          case 'TEXT':
            props[key] = `'${definition.defaultValue || 'test value'}'`;
            break;
          case 'VARIANT':
            props[key] = `'${definition.defaultValue || 'default'}'`;
            break;
        }
      });
    }

    const propsString = Object.entries(props)
      .map(([key, value]) => `${key}: ${value}`)
      .join(',\n    ');

    return isTypeScript ? `{\n    ${propsString}\n  } as const` : `{\n    ${propsString}\n  }`;
  }

  private generatePropAssertions(node: FigmaNode): string {
    const assertions: string[] = [];

    if (node.type === 'TEXT') {
      assertions.push(`expect(screen.getByText(customProps.children)).toBeInTheDocument();`);
    }

    if (assertions.length === 0) {
      assertions.push(`expect(screen.getByTestId('${this.generateTestId(node.name)}')).toBeInTheDocument();`);
    }

    return assertions.join('\n    ');
  }

  private generateAriaAssertions(node: FigmaNode): string {
    const assertions: string[] = [];

    if (this.isInteractiveElement(node)) {
      assertions.push(`expect(element).toHaveAttribute('role', 'button');`);
      assertions.push(`expect(element).toHaveAttribute('tabIndex', '0');`);
    }

    if (node.type === 'TEXT' && node.name?.toLowerCase().includes('heading')) {
      assertions.push(`expect(element).toHaveAttribute('role', 'heading');`);
    }

    if (assertions.length === 0) {
      assertions.push(`// Add specific ARIA assertions based on component functionality`);
    }

    return assertions.join('\n    ');
  }

  private generateTestId(name?: string): string {
    if (!name) return 'component';
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  private sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
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

  private generateVitestConfig(): string {
    return `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/test/**/*'
      ]
    }
  }
});`;
  }

  private generateJestConfig(): string {
    return `module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/test/**/*'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}'
  ]
};`;
  }

  private generatePlaywrightConfig(): string {
    return `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});`;
  }

  private generateTestUtilities(framework: string): string {
    return `// Test Utilities and Helpers
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function with providers
export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <div data-testid="test-wrapper">
        {children}
      </div>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Mock implementations
export const mockIntersectionObserver = () => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    unobserve() {}
  };
};

export const mockResizeObserver = () => {
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    unobserve() {}
  };
};

// Test data factories
export const createMockFigmaNode = (overrides = {}) => ({
  id: 'test-id',
  name: 'Test Component',
  type: 'FRAME',
  children: [],
  ...overrides
});

// Accessibility testing helpers
export const axeMatchers = {
  toHaveNoViolations: expect.extend({
    toHaveNoViolations(received) {
      const violations = received.violations || [];
      const pass = violations.length === 0;
      
      return {
        pass,
        message: () => 
          pass 
            ? 'Expected to have accessibility violations'
            : \`Expected no accessibility violations but got \${violations.length}\`
      };
    }
  })
};`;
  }
}

// Export singleton instance
export const testGenerator = new TestGenerator();