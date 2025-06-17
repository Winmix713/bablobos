import { FigmaNode, DesignToken, DesignTokenCollection, TokenExportFormat } from '@/types';

/**
 * Design Token Extractor
 * Extracts design tokens from Figma nodes and exports them in various formats
 */
export class DesignTokenExtractor {
  private extractedTokens: DesignTokenCollection = {
    colors: [],
    spacing: [],
    typography: [],
    shadows: [],
    borders: [],
    opacity: []
  };

  /**
   * Extract all design tokens from a Figma node tree
   */
  async extract(node: FigmaNode): Promise<DesignTokenCollection> {
    console.log('🎨 Extracting design tokens from Figma node...');
    
    this.extractedTokens = {
      colors: [],
      spacing: [],
      typography: [],
      shadows: [],
      borders: [],
      opacity: []
    };

    this.extractFromNode(node);
    this.deduplicateTokens();
    this.categorizeTokens();

    console.log(`✅ Extracted ${this.getTotalTokenCount()} design tokens`);
    console.log(`   Colors: ${this.extractedTokens.colors.length}`);
    console.log(`   Spacing: ${this.extractedTokens.spacing.length}`);
    console.log(`   Typography: ${this.extractedTokens.typography.length}`);
    console.log(`   Shadows: ${this.extractedTokens.shadows.length}`);
    console.log(`   Borders: ${this.extractedTokens.borders.length}`);
    console.log(`   Opacity: ${this.extractedTokens.opacity.length}`);

    return this.extractedTokens;
  }

  /**
   * Export tokens in various formats
   */
  async export(tokens: DesignTokenCollection, formats: TokenExportFormat): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const outputDir = './design-tokens';
    await fs.mkdir(outputDir, { recursive: true });

    if (formats.json) {
      await this.exportJson(tokens, path.join(outputDir, 'tokens.json'));
    }

    if (formats.css) {
      await this.exportCss(tokens, path.join(outputDir, 'tokens.css'));
    }

    if (formats.scss) {
      await this.exportScss(tokens, path.join(outputDir, 'tokens.scss'));
    }

    if (formats.tailwind) {
      await this.exportTailwind(tokens, path.join(outputDir, 'tailwind.config.js'));
    }

    if (formats.styleDictionary) {
      await this.exportStyleDictionary(tokens, path.join(outputDir, 'style-dictionary.json'));
    }

    if (formats.javascript) {
      await this.exportJavaScript(tokens, path.join(outputDir, 'tokens.js'));
    }

    if (formats.typescript) {
      await this.exportTypeScript(tokens, path.join(outputDir, 'tokens.ts'));
    }

    console.log(`💾 Design tokens exported to ${outputDir}`);
  }

  private extractFromNode(node: FigmaNode, depth = 0): void {
    // Extract colors from fills
    if (node.fills) {
      node.fills.forEach((fill, index) => {
        if (fill.type === 'SOLID' && fill.color) {
          this.extractedTokens.colors.push({
            name: this.generateColorName(node.name, index),
            value: this.rgbaToHex(fill.color),
            type: 'color',
            category: this.inferColorCategory(node.name),
            source: `${node.name} (fill)`
          });
        }
      });
    }

    // Extract colors from strokes
    if (node.strokes) {
      node.strokes.forEach((stroke, index) => {
        if (stroke.color) {
          this.extractedTokens.colors.push({
            name: this.generateStrokeName(node.name, index),
            value: this.rgbaToHex(stroke.color),
            type: 'color',
            category: 'borders',
            source: `${node.name} (stroke)`
          });
        }
      });
    }

    // Extract spacing from layout properties
    if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
      ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'].forEach(property => {
        const value = node[property as keyof FigmaNode] as number;
        if (value && value > 0) {
          this.extractedTokens.spacing.push({
            name: this.generateSpacingName(node.name, property),
            value: `${value}px`,
            type: 'spacing',
            category: 'padding',
            source: `${node.name} (${property})`
          });
        }
      });
    }

    // Extract item spacing
    if (node.itemSpacing) {
      this.extractedTokens.spacing.push({
        name: this.generateSpacingName(node.name, 'gap'),
        value: `${node.itemSpacing}px`,
        type: 'spacing',
        category: 'gap',
        source: `${node.name} (item spacing)`
      });
    }

    // Extract typography from text styles
    if (node.style && node.type === 'TEXT') {
      this.extractedTokens.typography.push({
        name: this.generateTypographyName(node.name),
        value: this.generateTypographyValue(node.style),
        type: 'typography',
        category: this.inferTypographyCategory(node.name),
        source: `${node.name} (text style)`
      });
    }

    // Extract shadows from effects
    if (node.effects) {
      node.effects.forEach((effect, index) => {
        if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
          this.extractedTokens.shadows.push({
            name: this.generateShadowName(node.name, index),
            value: this.generateShadowValue(effect),
            type: 'shadow',
            category: effect.type === 'DROP_SHADOW' ? 'drop-shadow' : 'inner-shadow',
            source: `${node.name} (${effect.type.toLowerCase()})`
          });
        }
      });
    }

    // Extract border radius
    if (node.cornerRadius) {
      this.extractedTokens.borders.push({
        name: this.generateBorderName(node.name, 'radius'),
        value: `${node.cornerRadius}px`,
        type: 'border',
        category: 'radius',
        source: `${node.name} (corner radius)`
      });
    }

    // Extract opacity
    if (node.opacity && node.opacity < 1) {
      this.extractedTokens.opacity.push({
        name: this.generateOpacityName(node.name),
        value: node.opacity.toString(),
        type: 'opacity',
        category: 'transparency',
        source: `${node.name} (opacity)`
      });
    }

    // Recursively extract from children
    if (node.children) {
      node.children.forEach(child => this.extractFromNode(child, depth + 1));
    }
  }

  private deduplicateTokens(): void {
    // Remove duplicate tokens based on name and value
    Object.keys(this.extractedTokens).forEach(category => {
      const tokens = this.extractedTokens[category as keyof DesignTokenCollection];
      const seen = new Set();
      this.extractedTokens[category as keyof DesignTokenCollection] = tokens.filter(token => {
        const key = `${token.name}-${token.value}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    });
  }

  private categorizeTokens(): void {
    // Enhance categorization based on semantic analysis
    this.extractedTokens.colors.forEach(token => {
      if (!token.category) {
        token.category = this.inferColorCategory(token.name);
      }
    });

    this.extractedTokens.spacing.forEach(token => {
      if (!token.category) {
        token.category = this.inferSpacingCategory(token.name);
      }
    });

    this.extractedTokens.typography.forEach(token => {
      if (!token.category) {
        token.category = this.inferTypographyCategory(token.name);
      }
    });
  }

  // Name generation methods
  private generateColorName(nodeName: string, index: number): string {
    const baseName = this.sanitizeName(nodeName);
    return index > 0 ? `${baseName}-color-${index + 1}` : `${baseName}-color`;
  }

  private generateStrokeName(nodeName: string, index: number): string {
    const baseName = this.sanitizeName(nodeName);
    return index > 0 ? `${baseName}-border-${index + 1}` : `${baseName}-border`;
  }

  private generateSpacingName(nodeName: string, property: string): string {
    const baseName = this.sanitizeName(nodeName);
    const spacingType = property.replace('padding', '').toLowerCase() || property;
    return `${baseName}-${spacingType}`;
  }

  private generateTypographyName(nodeName: string): string {
    const baseName = this.sanitizeName(nodeName);
    return `${baseName}-typography`;
  }

  private generateShadowName(nodeName: string, index: number): string {
    const baseName = this.sanitizeName(nodeName);
    return index > 0 ? `${baseName}-shadow-${index + 1}` : `${baseName}-shadow`;
  }

  private generateBorderName(nodeName: string, property: string): string {
    const baseName = this.sanitizeName(nodeName);
    return `${baseName}-${property}`;
  }

  private generateOpacityName(nodeName: string): string {
    const baseName = this.sanitizeName(nodeName);
    return `${baseName}-opacity`;
  }

  private sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Value generation methods
  private generateTypographyValue(style: any): string {
    const properties = [];
    
    if (style.fontFamily) properties.push(`font-family: '${style.fontFamily}'`);
    if (style.fontSize) properties.push(`font-size: ${style.fontSize}px`);
    if (style.fontWeight) properties.push(`font-weight: ${style.fontWeight}`);
    if (style.lineHeightPx) properties.push(`line-height: ${style.lineHeightPx}px`);
    if (style.letterSpacing) properties.push(`letter-spacing: ${style.letterSpacing}px`);
    
    return properties.join('; ');
  }

  private generateShadowValue(effect: any): string {
    const { offset, radius, color } = effect;
    const colorValue = color ? this.rgbaToHex(color) : '#000000';
    const x = offset?.x || 0;
    const y = offset?.y || 0;
    const blur = radius || 0;
    const spread = effect.spread || 0;
    
    return `${x}px ${y}px ${blur}px ${spread}px ${colorValue}`;
  }

  // Category inference methods
  private inferColorCategory(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('primary') || lowerName.includes('brand')) return 'primary';
    if (lowerName.includes('secondary')) return 'secondary';
    if (lowerName.includes('accent')) return 'accent';
    if (lowerName.includes('neutral') || lowerName.includes('gray') || lowerName.includes('grey')) return 'neutral';
    if (lowerName.includes('success') || lowerName.includes('green')) return 'success';
    if (lowerName.includes('warning') || lowerName.includes('yellow') || lowerName.includes('orange')) return 'warning';
    if (lowerName.includes('error') || lowerName.includes('danger') || lowerName.includes('red')) return 'error';
    if (lowerName.includes('info') || lowerName.includes('blue')) return 'info';
    if (lowerName.includes('background') || lowerName.includes('bg')) return 'background';
    if (lowerName.includes('text') || lowerName.includes('foreground')) return 'text';
    if (lowerName.includes('border')) return 'border';
    
    return 'misc';
  }

  private inferSpacingCategory(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('padding') || lowerName.includes('pad')) return 'padding';
    if (lowerName.includes('margin')) return 'margin';
    if (lowerName.includes('gap') || lowerName.includes('space')) return 'gap';
    
    return 'spacing';
  }

  private inferTypographyCategory(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('heading') || lowerName.includes('title') || lowerName.includes('h1') || lowerName.includes('h2')) return 'heading';
    if (lowerName.includes('body') || lowerName.includes('paragraph') || lowerName.includes('text')) return 'body';
    if (lowerName.includes('caption') || lowerName.includes('small')) return 'caption';
    if (lowerName.includes('label')) return 'label';
    if (lowerName.includes('button')) return 'button';
    
    return 'text';
  }

  // Export format methods
  private async exportJson(tokens: DesignTokenCollection, filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const formattedTokens = this.formatTokensForJson(tokens);
    await fs.writeFile(filePath, JSON.stringify(formattedTokens, null, 2));
  }

  private async exportCss(tokens: DesignTokenCollection, filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    let css = ':root {\n';
    
    Object.values(tokens).flat().forEach(token => {
      css += `  --${token.name}: ${token.value};\n`;
    });
    
    css += '}\n';
    await fs.writeFile(filePath, css);
  }

  private async exportScss(tokens: DesignTokenCollection, filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    let scss = '// Design Tokens\n\n';
    
    Object.entries(tokens).forEach(([category, categoryTokens]) => {
      scss += `// ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
      categoryTokens.forEach(token => {
        scss += `$${token.name}: ${token.value};\n`;
      });
      scss += '\n';
    });
    
    await fs.writeFile(filePath, scss);
  }

  private async exportTailwind(tokens: DesignTokenCollection, filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const tailwindConfig = this.formatTokensForTailwind(tokens);
    
    const content = `module.exports = {
  theme: {
    extend: ${JSON.stringify(tailwindConfig, null, 6)}
  }
};`;
    
    await fs.writeFile(filePath, content);
  }

  private async exportStyleDictionary(tokens: DesignTokenCollection, filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const styleDictionaryTokens = this.formatTokensForStyleDictionary(tokens);
    await fs.writeFile(filePath, JSON.stringify(styleDictionaryTokens, null, 2));
  }

  private async exportJavaScript(tokens: DesignTokenCollection, filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const jsTokens = this.formatTokensForJs(tokens);
    
    const content = `// Design Tokens
export const tokens = ${JSON.stringify(jsTokens, null, 2)};

export default tokens;`;
    
    await fs.writeFile(filePath, content);
  }

  private async exportTypeScript(tokens: DesignTokenCollection, filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const tsTokens = this.formatTokensForJs(tokens);
    const types = this.generateTokenTypes(tokens);
    
    const content = `// Design Tokens
${types}

export const tokens: DesignTokens = ${JSON.stringify(tsTokens, null, 2)};

export default tokens;`;
    
    await fs.writeFile(filePath, content);
  }

  // Format methods for different export formats
  private formatTokensForJson(tokens: DesignTokenCollection): any {
    const formatted: any = {};
    
    Object.entries(tokens).forEach(([category, categoryTokens]) => {
      formatted[category] = {};
      categoryTokens.forEach(token => {
        formatted[category][token.name] = {
          value: token.value,
          type: token.type,
          category: token.category,
          source: token.source
        };
      });
    });
    
    return formatted;
  }

  private formatTokensForTailwind(tokens: DesignTokenCollection): any {
    const tailwindConfig: any = {
      colors: {},
      spacing: {},
      fontFamily: {},
      fontSize: {},
      boxShadow: {},
      borderRadius: {}
    };
    
    tokens.colors.forEach(token => {
      tailwindConfig.colors[token.name] = token.value;
    });
    
    tokens.spacing.forEach(token => {
      tailwindConfig.spacing[token.name] = token.value;
    });
    
    tokens.shadows.forEach(token => {
      tailwindConfig.boxShadow[token.name] = token.value;
    });
    
    tokens.borders.forEach(token => {
      if (token.name.includes('radius')) {
        tailwindConfig.borderRadius[token.name] = token.value;
      }
    });
    
    return tailwindConfig;
  }

  private formatTokensForStyleDictionary(tokens: DesignTokenCollection): any {
    const formatted: any = {};
    
    Object.entries(tokens).forEach(([category, categoryTokens]) => {
      categoryTokens.forEach(token => {
        const path = token.name.split('-');
        let current = formatted;
        
        path.forEach((segment, index) => {
          if (index === path.length - 1) {
            current[segment] = {
              value: token.value,
              type: token.type,
              attributes: {
                category: token.category,
                source: token.source
              }
            };
          } else {
            current[segment] = current[segment] || {};
            current = current[segment];
          }
        });
      });
    });
    
    return formatted;
  }

  private formatTokensForJs(tokens: DesignTokenCollection): any {
    const formatted: any = {};
    
    Object.entries(tokens).forEach(([category, categoryTokens]) => {
      formatted[category] = {};
      categoryTokens.forEach(token => {
        formatted[category][token.name.replace(/-/g, '_')] = token.value;
      });
    });
    
    return formatted;
  }

  private generateTokenTypes(tokens: DesignTokenCollection): string {
    let types = 'export interface DesignTokens {\n';
    
    Object.keys(tokens).forEach(category => {
      types += `  ${category}: {\n`;
      tokens[category as keyof DesignTokenCollection].forEach(token => {
        const safeName = token.name.replace(/-/g, '_');
        types += `    ${safeName}: string;\n`;
      });
      types += '  };\n';
    });
    
    types += '}';
    return types;
  }

  // Utility methods
  private rgbaToHex(color: any): string {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }

  private getTotalTokenCount(): number {
    return Object.values(this.extractedTokens).reduce((sum, tokens) => sum + tokens.length, 0);
  }
}

// Export singleton instance
export const designTokenExtractor = new DesignTokenExtractor();