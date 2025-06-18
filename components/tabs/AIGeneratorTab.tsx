'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Wand2, 
  Sparkles, 
  Code, 
  Download, 
  Copy,
  CheckCircle2,
  Settings,
  Zap,
  Brain,
  RefreshCw,
  MessageSquare,
  Lightbulb
} from 'lucide-react';

export function AIGeneratorTab() {
  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockCode = `import React from 'react';
import { motion } from 'framer-motion';

interface ${prompt.replace(/\s+/g, '')}Props {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const ${prompt.replace(/\s+/g, '')}: React.FC<${prompt.replace(/\s+/g, '')}Props> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

export default ${prompt.replace(/\s+/g, '')};`;

      const mockSuggestions = [
        'Add loading state with spinner animation',
        'Include icon support with proper spacing',
        'Add keyboard navigation support',
        'Implement focus management for accessibility',
        'Add more color variants (success, warning, danger)',
        'Include tooltip support for better UX'
      ];

      setGeneratedCode(mockCode);
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOptimize = async () => {
    setIsGenerating(true);
    // Simulate optimization
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">AI Code Generator</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Generate React components using AI. Describe what you want and get production-ready code with TypeScript, animations, and accessibility features.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <AIPromptInput 
            prompt={prompt}
            onPromptChange={setPrompt}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
          
          <AISettings 
            provider={selectedProvider}
            onProviderChange={setSelectedProvider}
          />
          
          <QuickPrompts onSelectPrompt={setPrompt} />
        </motion.div>

        {/* Output Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {generatedCode ? (
            <>
              <CodeOutput 
                code={generatedCode}
                onCopy={handleCopy}
                copied={copied}
                onOptimize={handleOptimize}
                isOptimizing={isGenerating}
              />
              
              <AISuggestions suggestions={suggestions} />
            </>
          ) : (
            <EmptyState />
          )}
        </motion.div>
      </div>

      {/* AI Features */}
      <AIFeatures />
    </div>
  );
}

function AIPromptInput({ 
  prompt, 
  onPromptChange, 
  onGenerate, 
  isGenerating 
}: {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2" />
        Describe Your Component
      </h3>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe the component you want to create. For example: 'A responsive navigation button with hover effects and accessibility features' or 'A card component with image, title, description and action buttons'"
          className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">
            {prompt.length}/500 characters
          </span>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Code
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function AISettings({ 
  provider, 
  onProviderChange 
}: {
  provider: string;
  onProviderChange: (provider: string) => void;
}) {
  const providers = [
    { value: 'openai', label: 'GPT-4', description: 'Most capable, best for complex components' },
    { value: 'groq', label: 'Groq', description: 'Ultra-fast, great for simple components' }
  ];

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2" />
        AI Settings
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">AI Provider</label>
          <div className="space-y-2">
            {providers.map(p => (
              <label key={p.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value={p.value}
                  checked={provider === p.value}
                  onChange={(e) => onProviderChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{p.label}</div>
                  <div className="text-slate-400 text-sm">{p.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Include TypeScript</span>
          <div className="w-12 h-6 bg-blue-500 rounded-full relative">
            <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Add Animations</span>
          <div className="w-12 h-6 bg-blue-500 rounded-full relative">
            <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Accessibility Features</span>
          <div className="w-12 h-6 bg-blue-500 rounded-full relative">
            <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickPrompts({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) {
  const prompts = [
    'Modern button component with hover effects',
    'Card component with image and call-to-action',
    'Navigation menu with dropdown functionality',
    'Modal dialog with backdrop and animations',
    'Form input with validation states',
    'Loading spinner with customizable colors'
  ];

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Lightbulb className="w-5 h-5 mr-2" />
        Quick Prompts
      </h3>
      
      <div className="space-y-2">
        {prompts.map((promptText, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(promptText)}
            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            {promptText}
          </button>
        ))}
      </div>
    </div>
  );
}

function CodeOutput({ 
  code, 
  onCopy, 
  copied, 
  onOptimize, 
  isOptimizing 
}: {
  code: string;
  onCopy: () => void;
  copied: boolean;
  onOptimize: () => void;
  isOptimizing: boolean;
}) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Code className="w-5 h-5 mr-2" />
          Generated Code
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onOptimize}
            disabled={isOptimizing}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center"
          >
            {isOptimizing ? (
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3 mr-1" />
            )}
            Optimize
          </button>
          
          <button
            onClick={onCopy}
            className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center"
          >
            {copied ? (
              <CheckCircle2 className="w-3 h-3 mr-1 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 mr-1" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          
          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center">
            <Download className="w-3 h-3 mr-1" />
            Download
          </button>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto max-h-96">
        <pre className="text-sm text-slate-100">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function AISuggestions({ suggestions }: { suggestions: string[] }) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Brain className="w-5 h-5 mr-2" />
        AI Suggestions
      </h3>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-300 text-sm">{suggestion}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass-card p-12 rounded-xl text-center">
      <Bot className="w-16 h-16 text-slate-400 mx-auto mb-6" />
      <h3 className="text-xl font-semibold text-white mb-2">Ready to Generate</h3>
      <p className="text-slate-300 mb-6">
        Describe your component and I'll generate production-ready React code with TypeScript, animations, and accessibility features.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-white font-medium mb-1">Lightning Fast</div>
          <div className="text-slate-400">Generate code in seconds</div>
        </div>
        
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-white font-medium mb-1">AI Optimized</div>
          <div className="text-slate-400">Best practices included</div>
        </div>
      </div>
    </div>
  );
}

function AIFeatures() {
  const features = [
    {
      icon: Bot,
      title: 'Multi-Provider AI',
      description: 'Choose between GPT-4 and Groq for different needs and performance requirements.'
    },
    {
      icon: Code,
      title: 'Production Ready',
      description: 'Generated code includes TypeScript, proper typing, and follows React best practices.'
    },
    {
      icon: Sparkles,
      title: 'Smart Optimization',
      description: 'AI automatically optimizes code for performance, accessibility, and maintainability.'
    },
    {
      icon: Zap,
      title: 'Instant Generation',
      description: 'Get complete components in seconds with animations and responsive design.'
    }
  ];

  return (
    <div className="glass-card p-8 rounded-xl">
      <h3 className="text-2xl font-semibold text-white mb-6 text-center">AI-Powered Features</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl w-fit mx-auto mb-4">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}