import { AIProvider, AIRequest, AIResponse, FigmaNode } from '@/types';

/**
 * AI Assistant for Code Enhancement and Optimization
 * Supports multiple AI providers (OpenAI, Groq) for code improvement
 */
export class AIAssistant {
  private providers = new Map<string, AIProvider>();
  private currentProvider: string = 'openai';

  constructor() {
    this.initializeProviders();
  }

  /**
   * Optimize generated code using AI
   */
  async optimizeCode(code: string, context: { node: FigmaNode; framework: string }): Promise<AIResponse> {
    console.log('🤖 Optimizing code with AI...');
    
    const request: AIRequest = {
      prompt: this.generateOptimizationPrompt(code, context),
      context,
      type: 'optimize'
    };

    try {
      const response = await this.makeRequest(request);
      console.log(`✅ AI optimization completed (confidence: ${response.confidence})`);
      return response;
    } catch (error) {
      console.warn('⚠️ AI optimization failed, returning original code');
      return {
        code,
        suggestions: ['AI optimization unavailable'],
        confidence: 0,
        reasoning: 'AI service unavailable'
      };
    }
  }

  /**
   * Get AI suggestions for component improvements
   */
  async getSuggestions(code: string, context: { node: FigmaNode; framework: string }): Promise<AIResponse> {
    console.log('🤖 Getting AI suggestions...');
    
    const request: AIRequest = {
      prompt: this.generateSuggestionsPrompt(code, context),
      context,
      type: 'suggest'
    };

    return this.makeRequest(request);
  }

  /**
   * Fix code issues using AI
   */
  async fixCode(code: string, errors: string[], context: { node: FigmaNode; framework: string }): Promise<AIResponse> {
    console.log('🤖 Fixing code issues with AI...');
    
    const request: AIRequest = {
      prompt: this.generateFixPrompt(code, errors, context),
      context,
      type: 'fix'
    };

    return this.makeRequest(request);
  }

  /**
   * Enhance code with modern patterns
   */
  async enhanceCode(code: string, context: { node: FigmaNode; framework: string }): Promise<AIResponse> {
    console.log('🤖 Enhancing code with modern patterns...');
    
    const request: AIRequest = {
      prompt: this.generateEnhancementPrompt(code, context),
      context,
      type: 'enhance'
    };

    return this.makeRequest(request);
  }

  /**
   * Generate component names using AI
   */
  async generateComponentName(node: FigmaNode): Promise<string[]> {
    const prompt = `Generate semantic, meaningful component names for a Figma element with the following properties:
- Name: ${node.name}
- Type: ${node.type}
- Content: ${node.type === 'TEXT' ? node.characters : 'Visual element'}

Please suggest 3-5 appropriate React component names that are:
1. Semantic and descriptive
2. Follow React naming conventions (PascalCase)
3. Are concise but clear
4. Avoid generic names like "Component" or "Element"

Return only the names, one per line.`;

    try {
      const response = await this.makeRequest({
        prompt,
        context: { node, framework: 'react' },
        type: 'suggest'
      });

      return response.suggestions.filter(name => name.trim().length > 0);
    } catch (error) {
      console.warn('Failed to generate AI component names, using fallback');
      return [this.generateFallbackComponentName(node)];
    }
  }

  /**
   * Set active AI provider
   */
  setProvider(providerName: string): void {
    if (!this.providers.has(providerName)) {
      throw new Error(`AI provider '${providerName}' not found`);
    }
    this.currentProvider = providerName;
    console.log(`🤖 Switched to AI provider: ${providerName}`);
  }

  /**
   * Add or update AI provider configuration
   */
  addProvider(name: string, provider: AIProvider): void {
    this.providers.set(name, provider);
    console.log(`🤖 Added AI provider: ${name}`);
  }

  /**
   * Get available AI providers
   */
  getProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Test AI provider connection
   */
  async testProvider(providerName?: string): Promise<boolean> {
    const provider = providerName || this.currentProvider;
    
    try {
      const response = await this.makeRequest({
        prompt: 'Hello, please respond with "OK" to test the connection.',
        context: { node: { id: 'test', name: 'test', type: 'TEST' } as FigmaNode, framework: 'react' },
        type: 'suggest'
      }, provider);
      
      return response.suggestions.some(s => s.toLowerCase().includes('ok'));
    } catch (error) {
      console.error(`AI provider test failed: ${error}`);
      return false;
    }
  }

  private async makeRequest(request: AIRequest, providerName?: string): Promise<AIResponse> {
    const provider = this.providers.get(providerName || this.currentProvider);
    
    if (!provider) {
      throw new Error(`AI provider '${providerName || this.currentProvider}' not configured`);
    }

    if (provider.name === 'openai') {
      return this.makeOpenAIRequest(request, provider);
    } else if (provider.name === 'groq') {
      return this.makeGroqRequest(request, provider);
    } else {
      throw new Error(`Unsupported AI provider: ${provider.name}`);
    }
  }

  private async makeOpenAIRequest(request: AIRequest, provider: AIProvider): Promise<AIResponse> {
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({
        apiKey: provider.apiKey,
        baseURL: provider.baseUrl
      });

      const completion = await openai.chat.completions.create({
        model: provider.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request.type, request.context.framework)
          },
          {
            role: 'user',
            content: request.prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content || '';
      return this.parseAIResponse(response, request.type);
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI request failed: ${error}`);
    }
  }

  private async makeGroqRequest(request: AIRequest, provider: AIProvider): Promise<AIResponse> {
    try {
      const Groq = (await import('groq-sdk')).default;
      const groq = new Groq({
        apiKey: provider.apiKey
      });

      const completion = await groq.chat.completions.create({
        model: provider.model || 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request.type, request.context.framework)
          },
          {
            role: 'user',
            content: request.prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content || '';
      return this.parseAIResponse(response, request.type);
      
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error(`Groq request failed: ${error}`);
    }
  }

  private getSystemPrompt(type: string, framework: string): string {
    const basePrompt = `You are an expert frontend developer specializing in ${framework} components. You help optimize, enhance, and fix component code.`;
    
    switch (type) {
      case 'optimize':
        return `${basePrompt} Focus on performance, readability, and best practices. Provide clean, optimized code.`;
      
      case 'suggest':
        return `${basePrompt} Provide helpful suggestions for improvement. Be specific and actionable.`;
      
      case 'fix':
        return `${basePrompt} Fix the provided code issues while maintaining functionality. Explain your changes.`;
      
      case 'enhance':
        return `${basePrompt} Enhance the code with modern patterns, accessibility improvements, and better structure.`;
      
      default:
        return basePrompt;
    }
  }

  private generateOptimizationPrompt(code: string, context: { node: FigmaNode; framework: string }): string {
    return `Please optimize this ${context.framework} component code for performance and best practices:

Component Name: ${context.node.name}
Component Type: ${context.node.type}

Current Code:
\`\`\`${context.framework === 'react' ? 'tsx' : context.framework}
${code}
\`\`\`

Please provide:
1. Optimized code that follows modern ${context.framework} best practices
2. Explanations for the optimizations made
3. Any performance improvements
4. Accessibility enhancements

Format your response as:
OPTIMIZED_CODE:
\`\`\`
[optimized code here]
\`\`\`

IMPROVEMENTS:
- [list of improvements made]

REASONING:
[explanation of changes]`;
  }

  private generateSuggestionsPrompt(code: string, context: { node: FigmaNode; framework: string }): string {
    return `Please review this ${context.framework} component and provide improvement suggestions:

Component: ${context.node.name} (${context.node.type})

Code:
\`\`\`${context.framework === 'react' ? 'tsx' : context.framework}
${code}
\`\`\`

Please suggest improvements for:
1. Code structure and organization
2. Performance optimizations
3. Accessibility enhancements
4. Modern ${context.framework} patterns
5. Type safety (if TypeScript)

Provide specific, actionable suggestions.`;
  }

  private generateFixPrompt(code: string, errors: string[], context: { node: FigmaNode; framework: string }): string {
    return `Please fix the following errors in this ${context.framework} component:

Errors:
${errors.map(error => `- ${error}`).join('\n')}

Current Code:
\`\`\`${context.framework === 'react' ? 'tsx' : context.framework}
${code}
\`\`\`

Please provide:
1. Fixed code that resolves all errors
2. Explanation of what was wrong and how it was fixed

Format as:
FIXED_CODE:
\`\`\`
[fixed code here]
\`\`\`

FIXES:
- [list of fixes applied]`;
  }

  private generateEnhancementPrompt(code: string, context: { node: FigmaNode; framework: string }): string {
    return `Please enhance this ${context.framework} component with modern patterns and best practices:

Component: ${context.node.name}

Current Code:
\`\`\`${context.framework === 'react' ? 'tsx' : context.framework}
${code}
\`\`\`

Please enhance with:
1. Modern ${context.framework} patterns (hooks, composition, etc.)
2. Better TypeScript types and interfaces
3. Accessibility improvements
4. Error boundaries and error handling
5. Performance optimizations
6. Better prop validation and defaults

Provide enhanced code with explanations.`;
  }

  private parseAIResponse(response: string, type: string): AIResponse {
    const suggestions: string[] = [];
    let code = '';
    let reasoning = '';

    // Extract code blocks
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    if (codeMatch) {
      code = codeMatch[1].trim();
    }

    // Extract suggestions/improvements
    const improvementsMatch = response.match(/(?:IMPROVEMENTS|SUGGESTIONS|FIXES):\s*([\s\S]*?)(?:\n\n|REASONING|$)/);
    if (improvementsMatch) {
      const improvementText = improvementsMatch[1];
      suggestions.push(...improvementText.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '').trim()));
    }

    // Extract reasoning
    const reasoningMatch = response.match(/REASONING:\s*([\s\S]*?)$/);
    if (reasoningMatch) {
      reasoning = reasoningMatch[1].trim();
    }

    // If no structured response, treat the whole response as suggestions
    if (suggestions.length === 0 && !code) {
      suggestions.push(...response.split('\n').filter(line => line.trim().length > 0));
    }

    // Calculate confidence based on response quality
    const confidence = this.calculateConfidence(response, code, suggestions);

    return {
      code: code || undefined,
      suggestions,
      confidence,
      reasoning: reasoning || 'AI analysis completed'
    };
  }

  private calculateConfidence(response: string, code?: string, suggestions?: string[]): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence if code is provided
    if (code && code.length > 50) {
      confidence += 0.3;
    }

    // Boost confidence if suggestions are specific
    if (suggestions && suggestions.length > 0) {
      confidence += 0.1 * Math.min(suggestions.length, 3);
    }

    // Boost confidence if response is well-structured
    if (response.includes('```') && response.includes(':')) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  private generateFallbackComponentName(node: FigmaNode): string {
    if (!node.name) return 'Component';
    
    return node.name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private initializeProviders(): void {
    // Initialize with environment variables if available
    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (openaiKey) {
      this.addProvider('openai', {
        name: 'openai',
        apiKey: openaiKey,
        model: 'gpt-4'
      });
    }

    if (groqKey) {
      this.addProvider('groq', {
        name: 'groq',
        apiKey: groqKey,
        model: 'mixtral-8x7b-32768'
      });
    }

    // Set default provider
    if (this.providers.has('openai')) {
      this.currentProvider = 'openai';
    } else if (this.providers.has('groq')) {
      this.currentProvider = 'groq';
    }
  }
}

// Export singleton instance
export const aiAssistant = new AIAssistant();