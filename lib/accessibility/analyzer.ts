import { FigmaNode, AccessibilityReport, AccessibilityFeature } from '@/types';

/**
 * Accessibility Analyzer
 * Analyzes Figma designs for accessibility compliance and suggests improvements
 */
export class AccessibilityAnalyzer {
  private rules: AccessibilityRule[] = [];

  constructor() {
    this.initializeRules();
  }

  /**
   * Analyze a Figma node for accessibility compliance
   */
  async analyze(node: FigmaNode): Promise<AccessibilityReport> {
    console.log('♿ Analyzing accessibility compliance...');
    
    const features: AccessibilityFeature[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Run all accessibility checks
    this.analyzeNode(node, features, warnings, suggestions);
    
    // Calculate overall score
    const score = this.calculateAccessibilityScore(features, warnings);
    const wcagLevel = this.determineWCAGLevel(features, warnings);
    
    const report: AccessibilityReport = {
      score,
      features,
      warnings,
      suggestions,
      wcagLevel
    };
    
    console.log(`✅ Accessibility analysis complete. Score: ${score}/100 (WCAG ${wcagLevel})`);
    console.log(`   Features: ${features.length}`);
    console.log(`   Warnings: ${warnings.length}`);
    console.log(`   Suggestions: ${suggestions.length}`);
    
    return report;
  }

  /**
   * Enhance code with accessibility features
   */
  async enhanceCode(code: string, report: AccessibilityReport): Promise<string> {
    let enhancedCode = code;
    
    // Apply accessibility enhancements based on the report
    for (const feature of report.features) {
      enhancedCode = this.applyAccessibilityFeature(enhancedCode, feature);
    }
    
    // Add focus management
    enhancedCode = this.addFocusManagement(enhancedCode);
    
    // Add keyboard navigation
    enhancedCode = this.addKeyboardNavigation(enhancedCode);
    
    // Add ARIA landmarks
    enhancedCode = this.addAriaLandmarks(enhancedCode);
    
    return enhancedCode;
  }

  /**
   * Generate accessibility report in various formats
   */
  async generateReport(report: AccessibilityReport, format: 'json' | 'html' | 'md' = 'json'): Promise<string> {
    switch (format) {
      case 'html':
        return this.generateHtmlReport(report);
      case 'md':
        return this.generateMarkdownReport(report);
      default:
        return JSON.stringify(report, null, 2);
    }
  }

  private analyzeNode(
    node: FigmaNode,
    features: AccessibilityFeature[],
    warnings: string[],
    suggestions: string[],
    depth = 0
  ): void {
    // Check text contrast
    if (node.type === 'TEXT') {
      this.checkTextContrast(node, features, warnings, suggestions);
      this.checkTextSize(node, features, warnings, suggestions);
      this.checkTextElements(node, features, warnings, suggestions);
    }

    // Check interactive elements
    if (this.isInteractiveElement(node)) {
      this.checkInteractiveElements(node, features, warnings, suggestions);
      this.checkFocusIndicators(node, features, warnings, suggestions);
      this.checkTouchTargets(node, features, warnings, suggestions);
    }

    // Check images and media
    if (node.type === 'IMAGE' || node.type === 'VECTOR') {
      this.checkImageAccessibility(node, features, warnings, suggestions);
    }

    // Check semantic structure
    this.checkSemanticStructure(node, features, warnings, suggestions, depth);

    // Check color usage
    this.checkColorAccessibility(node, features, warnings, suggestions);

    // Recursively analyze children
    if (node.children) {
      node.children.forEach(child => {
        this.analyzeNode(child, features, warnings, suggestions, depth + 1);
      });
    }
  }

  private checkTextContrast(
    node: FigmaNode,
    features: AccessibilityFeature[],
    warnings: string[],
    suggestions: string[]
  ): void {
    if (!node.style || !node.fills || !node.fills[0]?.color) return;

    const textColor = node.fills[0].color;
    const fontSize = node.style.fontSize || 16;
    
    // For now, assume white background - in real implementation, 
    // we'd need to calculate against actual background
    const backgroundColor = { r: 1, g: 1, b: 1, a: 1 };
    
    const contrastRatio = this.calculateContrastRatio(textColor, backgroundColor);
    const minRatio = fontSize >= 18 || (fontSize >= 14 && node.style.fontWeight >= 700) ? 3 : 4.5;
    
    if (contrastRatio >= minRatio) {
      features.push({
        type: 'aria-label',
        value: `High contrast text (${contrastRatio.toFixed(2)}:1)`,
        reason: 'Text meets WCAG contrast requirements',
        confidence: 0.9
      });
    } else {
      warnings.push(`Low contrast text in "${node.name}": ${contrastRatio.toFixed(2)}:1 (minimum: ${minRatio}:1)`);
      suggestions.push(`Increase color contrast for "${node.name}" to meet WCAG AA standards`);
    }
  }

  private checkTextSize(
    node: FigmaNode,
    features: AccessibilityFeature[],
    warnings: string[],
    suggestions: string[]
  ): void {
    if (!node.style?.fontSize) return;

    const fontSize = node.style.fontSize;
    
    if (fontSize >= 16) {
      features.push({
        type: 'aria-label',
        value: 'Readable text size',
        reason: 'Text size meets minimum readability standards',
        confidence: 0.8
      });
    } else if (fontSize < 12) {
      warnings.push(`Very small text in "${node.name}": ${fontSize}px (minimum recommended: 16px)`);
      suggestions.push(`Increase text size in "${node.name}" to at least 16px for better readability`);
    }
  }

  private checkTextElements(
    node: FigmaNode,
    features: AccessibilityFeature[],
    warnings: string[],
    suggestions: string[]
  ): void {
    if (!node.name) return;

    const name = node.name.toLowerCase();
    
    // Check for heading-like elements
    if (name.includes('heading') || name.includes('title') || /h[1-6]/.test(name)) {
      const level = this.extractHeadingLevel(name);
      features.push({
        type: 'role',
        value: `heading`,
        reason: 'Identified as heading element',
        confidence: 0.9
      });
      
      if (level) {
        features.push({
          type: 'aria-label',
          value: `aria-level="${level}"`,
          reason: `Heading level ${level} identified`,
          confidence: 0.8
        });
      }
    }

    // Check for button-like elements
    if (name.includes('button') || name.includes('btn') || name.includes('cta')) {
      features.push({
        type: 'role',
        value: 'button',
        reason: 'Identified as button element',
        confidence: 0.9
      });
      
      features.push({
        type: 'tabindex',
        value: '0',
        reason: 'Interactive element needs keyboard access',
        confidence: 0.9
      });
    }

    // Check for label elements
    if (name.includes('label')) {
      features.push({
        type: 'aria-label',
        value: node.characters || name,
        reason: 'Identified as label element',
        confidence: 0.8
      });
    }
  }

  private checkInteractiveElements(
    node: FigmaNode,
    features: AccessibilityFeature[],
    warnings: string[],
    suggestions: string[]
  ): void {
    if (!this.isInteractiveElement(node)) return;

    // Add keyboard accessibility
    features.push({
      type: 'tabindex',
      value: '0',
      reason: 'Interactive element needs keyboard access',
      confidence: 0.9
    });

    // Add role if not already semantic
    if (!this.hasSemanticRole(node)) {
      features.push({
        type: 'role',
        value: 'button',
        reason: 'Interactive element needs semantic role',
        confidence: 0.8
      });
    }

    // Check for accessible name
    if (!node.characters && !node.name) {
      warnings.push(`Interactive element lacks accessible name`);
      suggestions.push(`Add aria-label or visible text to interactive element`);
    } else {
      features.push({
        type: 'aria-label',
        value: node.characters || this.sanitizeName(node.name),
        reason: 'Interactive element has accessible name',
        confidence: 0.9
      });
    }
  }

  private checkFocusIndicators(
    node: FigmaNode,
    features: AccessibilityFeature[],
    warnings: string[],
    suggestions: string[]
  ): void {
    if (!this.isInteractiveElement(node)) return;

    // In a real implementation, we'd check for focus styles
    // For now, we'll suggest adding them
    features.push({
      type: 'focus-indicator',
      value: 'outline: 2px solid var(--focus-color)',
      reason: 'Interactive elements need visible focus indicators',
      confidence: 0.9
    });
  }

  private checkTouchTargets(
    node: FigmaNode,
    features: AccessibilityFeature[],
    warnings: string[],
    suggestions: string[]
  ): void {
    if (!this.isInteractiveElement(node) || !node.absoluteBoundingBox) return;

    const { width, height } = node.absoluteBoundingBox;
    const minSize = 44; // Minimum touch target size in pixels

    if (width >= minSize && height >= minSize) {
      features.push({
        type: 'aria-label',
        value: 'Adequate touch target size',
        reason: 'Touch target meets minimum size requirements',
        confidence: 0.8
      });
    } else {
      warnings.push(`Small touch target in "${node.name}": ${width}x${height}px (minimum: ${minSize}x${minSize}px)`);
      suggestions.push(`Increase touch target size for "${node.name}" to at least ${minSize}x${minSize}px`);
    }
  }

  private checkImageAccessibility(
    node: FigmaNode,
    features: AccessibilityFeature[],
    warnings: string[],
    suggestions: string[]
  ): void {
    // Check for alt text
    if (node.name && !node.name.toLowerCase().includes('decoration')) {
      features.push({
        type: 'aria-label',
        value: this.sanitizeName(node.name),
        reason: 'Image has descriptive name',
        confidence: 0.7
      });
    } else {
      warnings.push(`Image "${node.name}" may need alt text`);
      suggestions.push(`Add descriptive alt text for image "${node.name}"`);
    }

    // Check for decorative images
    if (node.name?.toLowerCase().includes('decoration') || node.name?.toLowerCase().includes('ornament')) {
      features.push({
        type: 'aria-label',
        value: 'alt=""',
        reason: 'Decorative image properly marked',
        confidence: 0.8
      });
    }
  }

  private checkSemanticStructure(
    node: FigmaNode,
    features: AccessibilityFeature[],
    warnings: string[],
    suggestions: string[],
    depth: number
  ): void {
    if (!node.name) return;

    const name = node.name.toLowerCase();
    
    // Check for landmark roles
    if (name.includes('header') || name.includes('nav')) {
      features.push({
        type: 'role',
        value: 'banner',
        reason: 'Header element identified as landmark',
        confidence: 0.8
      });
    } else if (name.includes('footer')) {
      features.push({
        type: 'role',
        value: 'contentinfo',
        reason: 'Footer element identified as landmark',
        confidence: 0.8
      });
    } else if (name.includes('sidebar') || name.includes('aside')) {
      features.push({
        type: 'role',
        value: 'complementary',
        reason: 'Sidebar element identified as landmark',
        confidence: 0.7
      });
    } else if (name.includes('main') || name.includes('content')) {
      features.push({
        type: 'role',
        value: 'main',
        reason: 'Main content area identified',
        confidence: 0.8
      });
    }

    // Check heading hierarchy
    if (name.includes('heading') || name.includes('title')) {
      const level = this.extractHeadingLevel(name) || this.inferHeadingLevel(depth);
      if (level > 1 && depth === 0) {
        warnings.push(`Heading level ${level} used at root level - consider using h1`);
        suggestions.push('Use proper heading hierarchy starting with h1');
      }
    }
  }

  private checkColorAccessibility(
    node: FigmaNode,
    features: AccessibilityFeature[],
    warnings: string[],
    suggestions: string[]
  ): void {
    if (!node.fills || !node.fills[0]?.color) return;

    const color = node.fills[0].color;
    
    // Check if color alone is used to convey information
    if (this.isColorOnlyIndicator(node)) {
      warnings.push(`Element "${node.name}" may rely on color alone to convey information`);
      suggestions.push(`Add text, icons, or patterns alongside color in "${node.name}"`);
    }

    // Check for sufficient color differentiation
    const colorValue = this.rgbaToHex(color);
    features.push({
      type: 'aria-label',
      value: `Color: ${colorValue}`,
      reason: 'Color information captured for accessibility tools',
      confidence: 0.6
    });
  }

  private applyAccessibilityFeature(code: string, feature: AccessibilityFeature): string {
    switch (feature.type) {
      case 'aria-label':
        if (feature.value.includes('aria-')) {
          return code.replace(/(<\w+)/, `$1 ${feature.value}`);
        } else {
          return code.replace(/(<\w+)/, `$1 aria-label="${feature.value}"`);
        }
      
      case 'role':
        return code.replace(/(<\w+)/, `$1 role="${feature.value}"`);
      
      case 'tabindex':
        return code.replace(/(<\w+)/, `$1 tabIndex={${feature.value}}`);
      
      case 'focus-indicator':
        // Add focus styles to className or style
        return code.replace(
          /className="([^"]*)"/, 
          `className="$1 focus:outline-2 focus:outline-blue-500"`
        );
      
      default:
        return code;
    }
  }

  private addFocusManagement(code: string): string {
    // Add useRef and focus management for interactive elements
    if (code.includes('role="button"') || code.includes('tabIndex')) {
      const focusRef = `
  const focusRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        focusRef.current?.click();
      }
    };
    
    const element = focusRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, []);`;

      return code.replace(
        /export const \w+: React\.FC.*?= \(\{/,
        match => match + '\n' + focusRef
      ).replace(/(<div)/, '$1 ref={focusRef}');
    }
    
    return code;
  }

  private addKeyboardNavigation(code: string): string {
    // Add keyboard event handlers for interactive elements
    if (code.includes('tabIndex')) {
      return code.replace(
        /onClick={([^}]+)}/,
        `onClick={$1} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $1(e); } }}`
      );
    }
    
    return code;
  }

  private addAriaLandmarks(code: string): string {
    // Add ARIA landmarks based on semantic structure
    const landmarks = [
      { pattern: /role="banner"/, replacement: 'role="banner" aria-label="Site header"' },
      { pattern: /role="main"/, replacement: 'role="main" aria-label="Main content"' },
      { pattern: /role="contentinfo"/, replacement: 'role="contentinfo" aria-label="Site footer"' },
      { pattern: /role="complementary"/, replacement: 'role="complementary" aria-label="Sidebar"' }
    ];

    landmarks.forEach(({ pattern, replacement }) => {
      code = code.replace(pattern, replacement);
    });

    return code;
  }

  // Utility methods
  private isInteractiveElement(node: FigmaNode): boolean {
    if (!node.name) return false;
    
    const name = node.name.toLowerCase();
    return (
      name.includes('button') ||
      name.includes('btn') ||
      name.includes('link') ||
      name.includes('clickable') ||
      name.includes('interactive') ||
      node.type === 'INSTANCE' ||
      node.componentId !== undefined
    );
  }

  private hasSemanticRole(node: FigmaNode): boolean {
    if (!node.name) return false;
    
    const name = node.name.toLowerCase();
    return (
      name.includes('button') ||
      name.includes('link') ||
      name.includes('heading') ||
      name.includes('nav')
    );
  }

  private extractHeadingLevel(name: string): number | null {
    const match = name.match(/h([1-6])/);
    return match ? parseInt(match[1]) : null;
  }

  private inferHeadingLevel(depth: number): number {
    return Math.min(6, depth + 1);
  }

  private isColorOnlyIndicator(node: FigmaNode): boolean {
    if (!node.name) return false;
    
    const name = node.name.toLowerCase();
    return (
      name.includes('status') ||
      name.includes('error') ||
      name.includes('success') ||
      name.includes('warning') ||
      name.includes('alert')
    );
  }

  private sanitizeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  }

  private calculateContrastRatio(color1: any, color2: any): number {
    const luminance1 = this.calculateLuminance(color1);
    const luminance2 = this.calculateLuminance(color2);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private calculateLuminance(color: any): number {
    const { r, g, b } = color;
    
    const rsRGB = r;
    const gsRGB = g;
    const bsRGB = b;
    
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  private calculateAccessibilityScore(features: AccessibilityFeature[], warnings: string[]): number {
    const baseScore = 100;
    const warningPenalty = warnings.length * 5;
    const featureBonus = features.length * 2;
    
    const score = Math.max(0, Math.min(100, baseScore - warningPenalty + featureBonus));
    return Math.round(score);
  }

  private determineWCAGLevel(features: AccessibilityFeature[], warnings: string[]): 'A' | 'AA' | 'AAA' {
    const score = this.calculateAccessibilityScore(features, warnings);
    
    if (score >= 90 && warnings.length === 0) return 'AAA';
    if (score >= 75 && warnings.length <= 2) return 'AA';
    return 'A';
  }

  private rgbaToHex(color: any): string {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }

  private generateHtmlReport(report: AccessibilityReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .score { font-size: 2em; color: ${report.score >= 75 ? 'green' : 'orange'}; }
        .feature { background: #e8f5e8; padding: 10px; margin: 5px 0; border-radius: 4px; }
        .warning { background: #fff3cd; padding: 10px; margin: 5px 0; border-radius: 4px; }
        .suggestion { background: #d1ecf1; padding: 10px; margin: 5px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Accessibility Report</h1>
    <div class="score">Score: ${report.score}/100 (WCAG ${report.wcagLevel})</div>
    
    <h2>Features (${report.features.length})</h2>
    ${report.features.map(f => `<div class="feature"><strong>${f.type}:</strong> ${f.value} - ${f.reason}</div>`).join('')}
    
    <h2>Warnings (${report.warnings.length})</h2>
    ${report.warnings.map(w => `<div class="warning">${w}</div>`).join('')}
    
    <h2>Suggestions (${report.suggestions.length})</h2>
    ${report.suggestions.map(s => `<div class="suggestion">${s}</div>`).join('')}
</body>
</html>`;
  }

  private generateMarkdownReport(report: AccessibilityReport): string {
    return `# Accessibility Report

## Score: ${report.score}/100 (WCAG ${report.wcagLevel})

## Features (${report.features.length})

${report.features.map(f => `- **${f.type}**: ${f.value} - ${f.reason}`).join('\n')}

## Warnings (${report.warnings.length})

${report.warnings.map(w => `- ⚠️ ${w}`).join('\n')}

## Suggestions (${report.suggestions.length})

${report.suggestions.map(s => `- 💡 ${s}`).join('\n')}
`;
  }

  private initializeRules(): void {
    // Initialize accessibility rules - could be loaded from external config
    this.rules = [
      {
        id: 'contrast-ratio',
        name: 'Text Contrast Ratio',
        description: 'Ensure sufficient color contrast for text elements',
        level: 'AA',
        check: (node: FigmaNode) => {
          // Implementation for contrast checking
          return true;
        }
      },
      {
        id: 'focus-indicators',
        name: 'Focus Indicators',
        description: 'Interactive elements must have visible focus indicators',
        level: 'AA',
        check: (node: FigmaNode) => {
          return true;
        }
      }
      // More rules would be added here
    ];
  }
}

interface AccessibilityRule {
  id: string;
  name: string;
  description: string;
  level: 'A' | 'AA' | 'AAA';
  check: (node: FigmaNode) => boolean;
}

// Export singleton instance
export const accessibilityAnalyzer = new AccessibilityAnalyzer();