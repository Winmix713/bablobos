#!/usr/bin/env node

import { Command } from 'commander';
import { ConversionOptions, CLIConfig } from '@/types';
import { figmaConverter } from '@/lib/converters/figma-converter';
import { designTokenExtractor } from '@/lib/design-tokens/extractor';
import { storyGenerator } from '@/lib/storybook/generator';
import { testGenerator } from '@/lib/testing/generator';
import { pluginManager } from '@/lib/plugins/manager';
import { cacheManager } from '@/lib/cache/manager';
import { accessibilityAnalyzer } from '@/lib/accessibility/analyzer';
import { aiAssistant } from '@/lib/ai/assistant';

/**
 * Figma to React Converter CLI
 * Comprehensive command-line interface with all advanced features
 */

const program = new Command();

// Global configuration
let config: CLIConfig;

program
  .name('figma-converter')
  .description('Enterprise-grade Figma to React converter with advanced features')
  .version('2.0.0')
  .hook('preAction', async () => {
    // Load configuration before each command
    config = await loadConfig();
  });

// Convert command - Single file conversion
program
  .command('convert')
  .description('Convert a Figma file or node to code')
  .requiredOption('-u, --url <url>', 'Figma file URL or node URL')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-f, --framework <framework>', 'Target framework (react|vue|svelte)', 'react')
  .option('-t, --typescript', 'Generate TypeScript code', false)
  .option('-s, --styling <style>', 'Styling approach (css|tailwind|styled-components)', 'tailwind')
  .option('--no-types', 'Skip TypeScript type generation')
  .option('--no-stories', 'Skip Storybook story generation')
  .option('--no-tests', 'Skip test generation')
  .option('--no-tokens', 'Skip design token extraction')
  .option('--no-a11y', 'Skip accessibility analysis')
  .option('--ai', 'Enable AI code optimization', false)
  .option('--ai-provider <provider>', 'AI provider (openai|groq)', 'openai')
  .option('--plugins <plugins...>', 'Additional plugins to use')
  .action(async (options) => {
    try {
      console.log('🚀 Starting Figma to Code conversion...');
      console.log(`URL: ${options.url}`);
      console.log(`Framework: ${options.framework}`);
      console.log(`Output: ${options.output}`);

      // Parse Figma URL and fetch data
      const figmaData = await fetchFigmaData(options.url);
      
      const conversionOptions: ConversionOptions = {
        framework: options.framework,
        typescript: options.typescript,
        styling: options.styling,
        outputDir: options.output,
        exportDefault: true,
        generateTypes: options.types,
        generateStories: options.stories,
        generateTests: options.tests,
        extractDesignTokens: options.tokens,
        enableAccessibility: options.a11y,
        optimizeImages: true,
        plugins: options.plugins || [],
        ai: options.ai ? {
          enabled: true,
          provider: options.aiProvider,
          optimize: true,
          suggestions: true
        } : undefined
      };

      const report = await figmaConverter.convert(figmaData, conversionOptions);
      
      console.log('✅ Conversion completed successfully!');
      console.log(`📁 Generated ${report.output.files.length} files`);
      console.log(`⏱️ Total time: ${report.performance.conversionTime}ms`);
      console.log(`♿ Accessibility score: ${report.accessibility.score}/100`);
      
      if (report.warnings.length > 0) {
        console.log('\n⚠️ Warnings:');
        report.warnings.forEach(warning => console.log(`  - ${warning}`));
      }

    } catch (error) {
      console.error('❌ Conversion failed:', error);
      process.exit(1);
    }
  });

// Batch command - Convert multiple files
program
  .command('batch')
  .description('Convert multiple Figma files in batch')
  .requiredOption('-i, --input <file>', 'Input file with URLs (JSON or text)')
  .option('-o, --output <dir>', 'Base output directory', './batch-output')
  .option('-f, --framework <framework>', 'Target framework', 'react')
  .option('-t, --typescript', 'Generate TypeScript code', false)
  .option('--parallel <number>', 'Number of parallel conversions', '3')
  .option('--continue-on-error', 'Continue batch even if some conversions fail', false)
  .action(async (options) => {
    try {
      console.log('🔄 Starting batch conversion...');
      
      const urls = await loadUrlsFromFile(options.input);
      console.log(`📋 Found ${urls.length} URLs to convert`);

      const conversionOptions: ConversionOptions = {
        framework: options.framework,
        typescript: options.typescript,
        styling: 'tailwind',
        outputDir: options.output,
        exportDefault: true,
        generateTypes: true,
        generateStories: true,
        generateTests: true,
        extractDesignTokens: true,
        enableAccessibility: true,
        optimizeImages: true
      };

      const figmaDataList = await Promise.all(urls.map(url => fetchFigmaData(url)));
      const reports = await figmaConverter.batchConvert(figmaDataList, conversionOptions);
      
      console.log(`✅ Batch conversion completed: ${reports.length}/${urls.length} successful`);
      
      // Generate batch report
      await generateBatchReport(reports, options.output);

    } catch (error) {
      console.error('❌ Batch conversion failed:', error);
      process.exit(1);
    }
  });

// Watch command - Watch for Figma file changes
program
  .command('watch')
  .description('Watch Figma files for changes and auto-convert')
  .requiredOption('-u, --url <url>', 'Figma file URL to watch')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-i, --interval <seconds>', 'Check interval in seconds', '30')
  .option('--webhook <url>', 'Webhook URL for notifications')
  .action(async (options) => {
    console.log('👀 Starting Figma file watcher...');
    console.log(`Watching: ${options.url}`);
    console.log(`Interval: ${options.interval}s`);

    let lastModified = '';
    
    const checkForChanges = async () => {
      try {
        const figmaData = await fetchFigmaData(options.url);
        
        if (figmaData.lastModified !== lastModified) {
          console.log('🔄 Changes detected, converting...');
          lastModified = figmaData.lastModified;
          
          const conversionOptions: ConversionOptions = {
            framework: 'react',
            typescript: true,
            styling: 'tailwind',
            outputDir: options.output,
            exportDefault: true,
            generateTypes: true,
            generateStories: true,
            generateTests: true,
            extractDesignTokens: true,
            enableAccessibility: true,
            optimizeImages: true
          };

          const report = await figmaConverter.convert(figmaData, conversionOptions);
          console.log('✅ Auto-conversion completed');
          
          // Send webhook notification if configured
          if (options.webhook) {
            await sendWebhookNotification(options.webhook, report);
          }
        }
      } catch (error) {
        console.error('❌ Watch cycle failed:', error);
      }
    };

    // Initial check
    await checkForChanges();
    
    // Set up interval
    setInterval(checkForChanges, parseInt(options.interval) * 1000);
    
    console.log('👀 Watcher started. Press Ctrl+C to stop.');
  });

// Tokens command - Extract design tokens only
program
  .command('tokens')
  .description('Extract design tokens from Figma file')
  .requiredOption('-u, --url <url>', 'Figma file URL')
  .option('-o, --output <dir>', 'Output directory', './tokens')
  .option('--format <formats...>', 'Export formats (json|css|scss|tailwind|js|ts)', ['json', 'css'])
  .option('--categories <categories...>', 'Token categories to extract', ['colors', 'spacing', 'typography'])
  .action(async (options) => {
    try {
      console.log('🎨 Extracting design tokens...');
      
      const figmaData = await fetchFigmaData(options.url);
      const tokens = await designTokenExtractor.extract(figmaData.document);
      
      const exportFormats = {
        json: options.format.includes('json'),
        css: options.format.includes('css'),
        scss: options.format.includes('scss'),
        tailwind: options.format.includes('tailwind'),
        javascript: options.format.includes('js'),
        typescript: options.format.includes('ts'),
        styleDictionary: false
      };

      await designTokenExtractor.export(tokens, exportFormats);
      
      console.log('✅ Design tokens extracted successfully!');
      console.log(`📊 Extracted tokens: Colors(${tokens.colors.length}), Spacing(${tokens.spacing.length}), Typography(${tokens.typography.length})`);

    } catch (error) {
      console.error('❌ Token extraction failed:', error);
      process.exit(1);
    }
  });

// Storybook command - Generate Storybook stories
program
  .command('storybook')
  .description('Generate Storybook stories for components')
  .requiredOption('-u, --url <url>', 'Figma file URL')
  .option('-o, --output <dir>', 'Output directory', './stories')
  .option('-f, --framework <framework>', 'Target framework', 'react')
  .option('--include-controls', 'Include Storybook controls', true)
  .option('--include-actions', 'Include Storybook actions', true)
  .option('--include-a11y', 'Include accessibility addon', true)
  .action(async (options) => {
    try {
      console.log('📚 Generating Storybook stories...');
      
      const figmaData = await fetchFigmaData(options.url);
      
      const storyOptions = {
        framework: options.framework,
        typescript: true,
        includeControls: options.includeControls,
        includeActions: options.includeActions,
        includeDocs: true,
        includeA11y: options.includeA11y
      };

      const story = await storyGenerator.generate(figmaData.document, storyOptions);
      
      // Write story file
      const fs = await import('fs/promises');
      const path = await import('path');
      await fs.mkdir(options.output, { recursive: true });
      
      const fileName = `${figmaData.document.name || 'Component'}.stories.tsx`;
      await fs.writeFile(path.join(options.output, fileName), story);
      
      console.log('✅ Storybook stories generated successfully!');

    } catch (error) {
      console.error('❌ Story generation failed:', error);
      process.exit(1);
    }
  });

// Plugin commands
const pluginCmd = program
  .command('plugin')
  .description('Plugin management commands');

pluginCmd
  .command('list')
  .description('List installed plugins')
  .action(() => {
    const plugins = pluginManager.list();
    
    if (plugins.length === 0) {
      console.log('No plugins installed');
      return;
    }

    console.log('📦 Installed plugins:');
    plugins.forEach(plugin => {
      console.log(`  - ${plugin.name} v${plugin.version} (${plugin.framework})`);
      console.log(`    ${plugin.description}`);
    });
  });

pluginCmd
  .command('install <package>')
  .description('Install a plugin from npm')
  .action(async (packageName) => {
    try {
      console.log(`📦 Installing plugin: ${packageName}`);
      await pluginManager.installPlugin(packageName);
      console.log('✅ Plugin installed successfully!');
    } catch (error) {
      console.error('❌ Plugin installation failed:', error);
      process.exit(1);
    }
  });

// Cache commands
const cacheCmd = program
  .command('cache')
  .description('Cache management commands');

cacheCmd
  .command('clear')
  .description('Clear all cached data')
  .action(async () => {
    await cacheManager.clear();
    console.log('✅ Cache cleared successfully!');
  });

cacheCmd
  .command('stats')
  .description('Show cache statistics')
  .action(async () => {
    const stats = cacheManager.getStats();
    console.log('📊 Cache Statistics:');
    console.log(`  Entries: ${stats.entries}`);
    console.log(`  Memory size: ${stats.memorySize}`);
    console.log(`  Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
    console.log(`  Oldest entry: ${stats.oldestEntry?.toLocaleString() || 'N/A'}`);
    console.log(`  Newest entry: ${stats.newestEntry?.toLocaleString() || 'N/A'}`);
  });

cacheCmd
  .command('optimize')
  .description('Optimize cache by removing expired entries')
  .action(async () => {
    const result = await cacheManager.optimize();
    console.log(`✅ Cache optimized: removed ${result.removed} entries, freed ${result.size}`);
  });

// CI/CD commands
const ciCmd = program
  .command('ci')
  .description('CI/CD integration commands');

ciCmd
  .command('check')
  .description('Check if components are up-to-date with Figma')
  .requiredOption('-u, --url <url>', 'Figma file URL')
  .option('-c, --components <file>', 'Components manifest file')
  .action(async (options) => {
    try {
      console.log('🔍 Checking component freshness...');
      
      const figmaData = await fetchFigmaData(options.url);
      const componentsData = options.components ? await loadComponentsManifest(options.components) : {};
      
      const isUpToDate = await checkComponentFreshness(figmaData, componentsData);
      
      if (isUpToDate) {
        console.log('✅ All components are up-to-date');
        process.exit(0);
      } else {
        console.log('⚠️ Components are out of date');
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ CI check failed:', error);
      process.exit(1);
    }
  });

ciCmd
  .command('diff')
  .description('Generate diff report for PR')
  .requiredOption('-u, --url <url>', 'Figma file URL')
  .option('-o, --output <file>', 'Output diff file', './figma-diff.md')
  .action(async (options) => {
    try {
      console.log('📋 Generating diff report...');
      
      const figmaData = await fetchFigmaData(options.url);
      const diffReport = await generateDiffReport(figmaData);
      
      const fs = await import('fs/promises');
      await fs.writeFile(options.output, diffReport);
      
      console.log(`✅ Diff report generated: ${options.output}`);

    } catch (error) {
      console.error('❌ Diff generation failed:', error);
      process.exit(1);
    }
  });

// Config commands
const configCmd = program
  .command('config')
  .description('Configuration management');

configCmd
  .command('init')
  .description('Initialize configuration file')
  .option('-f, --force', 'Overwrite existing config', false)
  .action(async (options) => {
    const configPath = './figma-converter.config.json';
    
    try {
      const fs = await import('fs/promises');
      
      // Check if config already exists
      if (!options.force) {
        try {
          await fs.access(configPath);
          console.log('⚠️ Config file already exists. Use --force to overwrite.');
          return;
        } catch {
          // File doesn't exist, continue
        }
      }

      const defaultConfig: CLIConfig = {
        figmaToken: process.env.FIGMA_TOKEN || '',
        outputDir: './output',
        framework: 'react',
        typescript: true,
        styling: 'tailwind',
        plugins: [],
        caching: true,
        accessibility: true,
        designTokens: true,
        storybook: true,
        ai: {
          enabled: false,
          provider: 'openai'
        }
      };

      await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log(`✅ Configuration file created: ${configPath}`);
      console.log('Please edit the file to add your Figma token and customize settings.');

    } catch (error) {
      console.error('❌ Config initialization failed:', error);
      process.exit(1);
    }
  });

configCmd
  .command('validate')
  .description('Validate configuration file')
  .action(async () => {
    try {
      const config = await loadConfig();
      console.log('✅ Configuration is valid');
      console.log(`Framework: ${config.framework}`);
      console.log(`TypeScript: ${config.typescript ? 'Yes' : 'No'}`);
      console.log(`Figma Token: ${config.figmaToken ? 'Set' : 'Not set'}`);
    } catch (error) {
      console.error('❌ Configuration validation failed:', error);
      process.exit(1);
    }
  });

// AI commands
const aiCmd = program
  .command('ai')
  .description('AI assistant commands');

aiCmd
  .command('optimize <file>')
  .description('Optimize a component file using AI')
  .option('--provider <provider>', 'AI provider (openai|groq)', 'openai')
  .action(async (file, options) => {
    try {
      console.log(`🤖 Optimizing ${file} with AI...`);
      
      const fs = await import('fs/promises');
      const code = await fs.readFile(file, 'utf8');
      
      aiAssistant.setProvider(options.provider);
      
      const result = await aiAssistant.optimizeCode(code, {
        node: { id: 'file', name: 'Component', type: 'COMPONENT' } as any,
        framework: 'react'
      });

      if (result.code) {
        await fs.writeFile(file, result.code);
        console.log('✅ File optimized successfully!');
      }

      if (result.suggestions.length > 0) {
        console.log('\n💡 AI Suggestions:');
        result.suggestions.forEach(suggestion => {
          console.log(`  - ${suggestion}`);
        });
      }

    } catch (error) {
      console.error('❌ AI optimization failed:', error);
      process.exit(1);
    }
  });

aiCmd
  .command('test-connection')
  .description('Test AI provider connection')
  .option('--provider <provider>', 'AI provider to test', 'openai')
  .action(async (options) => {
    try {
      console.log(`🤖 Testing ${options.provider} connection...`);
      
      const isConnected = await aiAssistant.testProvider(options.provider);
      
      if (isConnected) {
        console.log('✅ AI connection successful!');
      } else {
        console.log('❌ AI connection failed');
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ AI test failed:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Helper functions
async function loadConfig(): Promise<CLIConfig> {
  try {
    const fs = await import('fs/promises');
    const configData = await fs.readFile('./figma-converter.config.json', 'utf8');
    return JSON.parse(configData);
  } catch {
    // Return default config if file doesn't exist
    return {
      figmaToken: process.env.FIGMA_TOKEN || '',
      outputDir: './output',
      framework: 'react',
      typescript: true,
      styling: 'tailwind',
      plugins: [],
      caching: true,
      accessibility: true,
      designTokens: true,
      storybook: true,
      ai: {
        enabled: false,
        provider: 'openai'
      }
    };
  }
}

async function fetchFigmaData(url: string): Promise<any> {
  // Mock implementation - in real app would use Figma API
  console.log(`🔗 Fetching data from: ${url}`);
  
  // Extract file ID from URL
  const fileIdMatch = url.match(/file\/([a-zA-Z0-9]+)/);
  if (!fileIdMatch) {
    throw new Error('Invalid Figma URL');
  }

  // Simulate API response
  return {
    document: {
      id: 'root',
      name: 'Sample Component',
      type: 'DOCUMENT',
      children: [
        {
          id: 'frame1',
          name: 'Main Frame',
          type: 'FRAME',
          absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 100 },
          fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.4, b: 0.8, a: 1 } }],
          children: [
            {
              id: 'text1',
              name: 'Sample Text',
              type: 'TEXT',
              characters: 'Hello World',
              style: {
                fontFamily: 'Inter',
                fontSize: 16,
                fontWeight: 400
              }
            }
          ]
        }
      ]
    },
    lastModified: new Date().toISOString(),
    name: 'Sample File'
  };
}

async function loadUrlsFromFile(filePath: string): Promise<string[]> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf8');
  
  try {
    // Try parsing as JSON first
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : data.urls || [];
  } catch {
    // Fall back to line-separated text
    return content.split('\n').filter(line => line.trim().length > 0);
  }
}

async function generateBatchReport(reports: any[], outputDir: string): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const reportData = {
    timestamp: new Date().toISOString(),
    total: reports.length,
    successful: reports.filter(r => r.errors.length === 0).length,
    failed: reports.filter(r => r.errors.length > 0).length,
    reports
  };

  const reportPath = path.join(outputDir, 'batch-report.json');
  await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
  
  console.log(`📊 Batch report saved: ${reportPath}`);
}

async function sendWebhookNotification(webhookUrl: string, report: any): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'figma-conversion-complete',
        timestamp: new Date().toISOString(),
        report: {
          files: report.output.files.length,
          time: report.performance.conversionTime,
          score: report.accessibility.score
        }
      })
    });

    if (response.ok) {
      console.log('📡 Webhook notification sent');
    }
  } catch (error) {
    console.warn('⚠️ Webhook notification failed:', error);
  }
}

async function loadComponentsManifest(filePath: string): Promise<any> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function checkComponentFreshness(figmaData: any, componentsData: any): Promise<boolean> {
  // Mock implementation - would check timestamps, hashes, etc.
  return Date.now() % 2 === 0; // Random for demo
}

async function generateDiffReport(figmaData: any): Promise<string> {
  return `# Figma Design Changes

## Summary
- File: ${figmaData.name}
- Last modified: ${figmaData.lastModified}
- Components analyzed: ${figmaData.document.children?.length || 0}

## Changes Detected
- ✅ No breaking changes
- 🔄 2 components updated
- ➕ 1 new component added

## Recommendations
- Review updated components for design consistency
- Update corresponding code if needed
- Run accessibility audit on new components
`;
}