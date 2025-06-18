import { FigmaNode, FigmaFile, ConversionOptions, ConversionReport, GeneratedFile, ConversionError } from '@/types';
import { pluginManager } from '@/lib/plugins/manager';
import { designTokenExtractor } from '@/lib/design-tokens/extractor';
import { accessibilityAnalyzer } from '@/lib/accessibility/analyzer';
import { cacheManager } from '@/lib/cache/manager';
import { storyGenerator } from '@/lib/storybook/generator';
import { testGenerator } from '@/lib/testing/generator';
import { aiAssistant } from '@/lib/ai/assistant';

/**
 * Main Figma to Code Converter
 * Orchestrates the entire conversion process with all advanced features
 */
export class FigmaConverter {
  private startTime: number = 0;
  private apiCallCount: number = 0;
  private cacheHitCount: number = 0;
  private generatedFiles: GeneratedFile[] = [];
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Convert a Figma file to code with all advanced features
   */
  async convert(figmaData: FigmaFile | FigmaNode, options: ConversionOptions): Promise<ConversionReport> {
    try {
      this.startTime = Date.now();
      this.reset();

      console.log('🚀 Starting Figma to Code conversion...');
      console.log(`Framework: ${options.framework}`);
      console.log(`TypeScript: ${options.typescript ? 'Yes' : 'No'}`);
      console.log(`Styling: ${options.styling}`);

      // Step 1: Extract and cache the main node
      const mainNode = this.extractMainNode(figmaData);
      const cacheKey = this.generateCacheKey(mainNode, options);
      
      // Check cache first
      const cachedResult = await cacheManager.get(cacheKey);
      if (cachedResult && !this.hasNodeChanged(mainNode, cachedResult.hash)) {
        console.log('✅ Using cached conversion result');
        this.cacheHitCount++;
        return cachedResult.data;
      }

      // Step 2: Pre-process with plugins
      let processedNode = mainNode;
      const plugins = pluginManager.getByFramework(options.framework);
      
      if (plugins.length > 0) {
        const plugin = plugins[0];
        if (plugin.hooks.beforeConversion) {
          processedNode = plugin.hooks.beforeConversion(mainNode);
        }
      }

      // Step 3: Extract design tokens (if enabled)
      let designTokens = null;
      if (options.extractDesignTokens) {
        console.log('🎨 Extracting design tokens...');
        designTokens = await designTokenExtractor.extract(processedNode);
        await designTokenExtractor.export(designTokens, {
          json: true,
          css: true,
          scss: false,
          tailwind: options.styling === 'tailwind',
          styleDictionary: false,
          javascript: false,
          typescript: options.typescript
        });
      }

      // Step 4: Generate main component code
      console.log('⚙️ Generating component code...');
      const api = pluginManager.createAPI();
      const componentCode = await pluginManager.convertNode(processedNode, options.framework, api);
      
      // Step 5: Apply AI optimization (if enabled)
      let optimizedCode = componentCode;
      if (options.ai?.enabled && options.ai?.optimize) {
        console.log('🤖 Applying AI optimization...');
        const aiResult = await aiAssistant.optimizeCode(componentCode, {
          node: processedNode,
          framework: options.framework
        });
        if (aiResult.code) {
          optimizedCode = aiResult.code;
        }
      }

      // Step 6: Generate TypeScript types (if enabled)
      let typesCode = '';
      if (options.generateTypes) {
        console.log('📝 Generating TypeScript types...');
        typesCode = await this.generateTypes(processedNode, options, api);
      }

      // Step 7: Analyze accessibility (if enabled)
      let accessibilityReport = null;
      if (options.enableAccessibility) {
        console.log('♿ Analyzing accessibility...');
        accessibilityReport = await accessibilityAnalyzer.analyze(processedNode);
        
        // Apply accessibility enhancements to code
        optimizedCode = await accessibilityAnalyzer.enhanceCode(optimizedCode, accessibilityReport);
      }

      // Step 8: Generate Storybook stories (if enabled)
      let storiesCode = '';
      if (options.generateStories) {
        console.log('📚 Generating Storybook stories...');
        storiesCode = await storyGenerator.generate(processedNode, {
          framework: options.framework,
          typescript: options.typescript,
          includeControls: true,
          includeActions: true,
          includeDocs: true,
          includeA11y: options.enableAccessibility
        });
      }

      // Step 9: Generate tests (if enabled)
      let testsCode = '';
      if (options.generateTests) {
        console.log('🧪 Generating tests...');
        testsCode = await testGenerator.generate(processedNode, {
          framework: options.framework,
          typescript: options.typescript,
          accessibility: options.enableAccessibility,
          visual: true,
          integration: true
        });
      }

      // Step 10: Write files to output directory
      await this.writeFiles(optimizedCode, typesCode, storiesCode, testsCode, options);

      // Step 11: Generate conversion report
      const report = this.generateReport(figmaData, options, designTokens, accessibilityReport);

      // Step 12: Cache the result
      await cacheManager.set(cacheKey, report, this.generateNodeHash(mainNode));

      console.log('✅ Conversion completed successfully!');
      console.log(`📁 Generated ${this.generatedFiles.length} files`);
      console.log(`⏱️ Conversion time: ${Date.now() - this.startTime}ms`);

      return report;

    } catch (error) {
      const conversionError: ConversionError = {
        type: 'conversion',
        message: error instanceof Error ? error.message : 'Unknown conversion error',
        stack: error instanceof Error ? error.stack : undefined
      };
      
      this.errors.push(conversionError.message);
      console.error('❌ Conversion failed:', conversionError);
      throw conversionError;
    }
  }

  /**
   * Batch convert multiple Figma files
   */
  async batchConvert(
    figmaDataList: (FigmaFile | FigmaNode)[],
    options: ConversionOptions
  ): Promise<ConversionReport[]> {
    console.log(`🔄 Starting batch conversion of ${figmaDataList.length} files...`);
    
    const reports: ConversionReport[] = [];
    const concurrency = 3; // Process 3 files at a time
    
    for (let i = 0; i < figmaDataList.length; i += concurrency) {
      const batch = figmaDataList.slice(i, i + concurrency);
      const batchPromises = batch.map(async (figmaData, index) => {
        try {
          console.log(`📄 Converting file ${i + index + 1}/${figmaDataList.length}`);
          return await this.convert(figmaData, {
            ...options,
            outputDir: `${options.outputDir}/file-${i + index + 1}`
          });
        } catch (error) {
          console.error(`❌ Failed to convert file ${i + index + 1}:`, error);
          throw error;
        }
      });
      
      const batchReports = await Promise.allSettled(batchPromises);
      batchReports.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          reports.push(result.value);
        } else {
          console.error(`Failed to process file ${i + index + 1}:`, result.reason);
        }
      });
    }
    
    console.log(`✅ Batch conversion completed. ${reports.length}/${figmaDataList.length} files converted successfully.`);
    return reports;
  }

  /**
   * Get conversion status and metrics
   */
  getStatus() {
    return {
      isConverting: this.startTime > 0,
      startTime: this.startTime,
      apiCalls: this.apiCallCount,
      cacheHits: this.cacheHitCount,
      filesGenerated: this.generatedFiles.length,
      warnings: this.warnings.length,
      errors: this.errors.length,
      plugins: pluginManager.getStatus()
    };
  }

  private extractMainNode(figmaData: FigmaFile | FigmaNode): FigmaNode {
    if ('document' in figmaData) {
      return figmaData.document;
    }
    return figmaData;
  }

  private generateCacheKey(node: FigmaNode, options: ConversionOptions): string {
    const keyData = {
      nodeId: node.id,
      nodeName: node.name,
      framework: options.framework,
      typescript: options.typescript,
      styling: options.styling,
      plugins: options.plugins?.sort() || []
    };
    
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  private generateNodeHash(node: FigmaNode): string {
    const nodeString = JSON.stringify({
      id: node.id,
      name: node.name,
      type: node.type,
      absoluteBoundingBox: node.absoluteBoundingBox,
      fills: node.fills,
      children: node.children?.map(child => ({
        id: child.id,
        name: child.name,
        type: child.type
      }))
    });
    
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < nodeString.length; i++) {
      const char = nodeString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  }

  private hasNodeChanged(node: FigmaNode, cachedHash: string): boolean {
    const currentHash = this.generateNodeHash(node);
    return currentHash !== cachedHash;
  }

  private async generateTypes(node: FigmaNode, options: ConversionOptions, api: any): Promise<string> {
    const plugins = pluginManager.getByFramework(options.framework);
    
    if (plugins.length > 0 && plugins[0].hooks.generateTypes) {
      return plugins[0].hooks.generateTypes(node, api);
    }
    
    // Fallback type generation
    const componentName = api.utils.toPascalCase(node.name || 'Component');
    return `export interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}`;
  }

  private async writeFiles(
    componentCode: string,
    typesCode: string,
    storiesCode: string,
    testsCode: string,
    options: ConversionOptions
  ): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Ensure output directory exists
    await fs.mkdir(options.outputDir, { recursive: true });
    
    const componentName = 'Component'; // Extract from code or use default
    const extension = options.typescript ? 'tsx' : 'jsx';
    
    // Write main component file
    if (componentCode) {
      const componentPath = path.join(options.outputDir, `${componentName}.${extension}`);
      await fs.writeFile(componentPath, componentCode);
      this.generatedFiles.push({
        path: componentPath,
        size: Buffer.byteLength(componentCode),
        type: 'component',
        lines: componentCode.split('\n').length
      });
    }
    
    // Write types file
    if (typesCode && options.typescript) {
      const typesPath = path.join(options.outputDir, `${componentName}.types.ts`);
      await fs.writeFile(typesPath, typesCode);
      this.generatedFiles.push({
        path: typesPath,
        size: Buffer.byteLength(typesCode),
        type: 'type',
        lines: typesCode.split('\n').length
      });
    }
    
    // Write stories file
    if (storiesCode) {
      const storiesPath = path.join(options.outputDir, `${componentName}.stories.${extension}`);
      await fs.writeFile(storiesPath, storiesCode);
      this.generatedFiles.push({
        path: storiesPath,
        size: Buffer.byteLength(storiesCode),
        type: 'story',
        lines: storiesCode.split('\n').length
      });
    }
    
    // Write tests file
    if (testsCode) {
      const testsPath = path.join(options.outputDir, `${componentName}.test.${extension}`);
      await fs.writeFile(testsPath, testsCode);
      this.generatedFiles.push({
        path: testsPath,
        size: Buffer.byteLength(testsCode),
        type: 'test',
        lines: testsCode.split('\n').length
      });
    }
  }

  private generateReport(
    figmaData: FigmaFile | FigmaNode,
    options: ConversionOptions,
    designTokens: any,
    accessibilityReport: any
  ): ConversionReport {
    const totalSize = this.generatedFiles.reduce((sum, file) => sum + file.size, 0);
    
    return {
      timestamp: new Date().toISOString(),
      input: {
        figmaUrl: 'document' in figmaData ? `figma://file/${figmaData.name}` : 'node',
        nodeCount: this.countNodes(this.extractMainNode(figmaData)),
        fileSize: '0 KB' // Would be calculated from actual Figma file
      },
      output: {
        files: this.generatedFiles,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        framework: options.framework
      },
      performance: {
        conversionTime: Date.now() - this.startTime,
        apiCalls: this.apiCallCount,
        cacheHits: this.cacheHitCount,
        memoryUsage: process.memoryUsage().heapUsed
      },
      accessibility: accessibilityReport || {
        score: 0,
        features: [],
        warnings: [],
        suggestions: [],
        wcagLevel: 'A' as const
      },
      designTokens: {
        extracted: designTokens?.colors?.length || 0,
        categories: designTokens ? Object.keys(designTokens) : []
      },
      warnings: this.warnings,
      errors: this.errors
    };
  }

  private countNodes(node: FigmaNode): number {
    let count = 1;
    if (node.children) {
      count += node.children.reduce((sum, child) => sum + this.countNodes(child), 0);
    }
    return count;
  }

  private reset(): void {
    this.apiCallCount = 0;
    this.cacheHitCount = 0;
    this.generatedFiles = [];
    this.warnings = [];
    this.errors = [];
  }
}

// Export singleton instance
export const figmaConverter = new FigmaConverter();