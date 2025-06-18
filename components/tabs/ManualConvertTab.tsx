'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Upload, 
  Download, 
  Copy, 
  Settings, 
  Eye,
  FileText,
  Zap,
  CheckCircle2
} from 'lucide-react';

export function ManualConvertTab() {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [conversionType, setConversionType] = useState('html-to-react');
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    if (!inputCode.trim()) return;
    
    setIsConverting(true);
    
    // Simulate conversion
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockOutput = `import React from 'react';

export const ConvertedComponent: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Converted Component
      </h2>
      <p className="text-gray-600 leading-relaxed">
        This component was automatically converted from your input code.
      </p>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
        Click me
      </button>
    </div>
  );
};

export default ConvertedComponent;`;
    
    setOutputCode(mockOutput);
    setIsConverting(false);
  };

  const conversionTypes = [
    { value: 'html-to-react', label: 'HTML to React' },
    { value: 'css-to-tailwind', label: 'CSS to Tailwind' },
    { value: 'js-to-ts', label: 'JavaScript to TypeScript' },
    { value: 'class-to-hooks', label: 'Class Components to Hooks' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Manual Code Converter</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Convert existing code between different formats and frameworks with intelligent transformation.
        </p>
      </div>

      {/* Conversion Type Selector */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Conversion Type
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {conversionTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setConversionType(type.value)}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                conversionType === type.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Input Code
              </h3>
              
              <div className="flex items-center space-x-2">
                <button className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Load File
                </button>
                <button className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  Clear
                </button>
              </div>
            </div>
            
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={getPlaceholder(conversionType)}
              className="w-full h-80 p-4 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-slate-400">
                {inputCode.length} characters
              </span>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConvert}
                disabled={isConverting || !inputCode.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center disabled:cursor-not-allowed"
              >
                {isConverting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Convert
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Converted Code
              </h3>
              
              {outputCode && (
                <div className="flex items-center space-x-2">
                  <button className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center">
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </button>
                </div>
              )}
            </div>
            
            {outputCode ? (
              <div className="bg-slate-900 rounded-lg p-4 h-80 overflow-auto">
                <pre className="text-sm text-slate-100 font-mono whitespace-pre-wrap">
                  <code>{outputCode}</code>
                </pre>
              </div>
            ) : (
              <div className="h-80 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Code className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">Converted code will appear here</p>
                </div>
              </div>
            )}
            
            {outputCode && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Conversion completed successfully
                </div>
                <span className="text-sm text-slate-400">
                  {outputCode.length} characters
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversion Examples */}
      <ConversionExamples />
    </div>
  );
}

function getPlaceholder(conversionType: string): string {
  switch (conversionType) {
    case 'html-to-react':
      return `<div class="container">
  <h1>Hello World</h1>
  <p>This will be converted to React</p>
  <button onclick="handleClick()">Click me</button>
</div>`;
    
    case 'css-to-tailwind':
      return `.button {
  padding: 12px 24px;
  background-color: #3b82f6;
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.button:hover {
  background-color: #2563eb;
}`;
    
    case 'js-to-ts':
      return `function Component(props) {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}`;
    
    case 'class-to-hooks':
      return `class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  };
  
  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleClick}>Click</button>
      </div>
    );
  }
}`;
    
    default:
      return 'Paste your code here...';
  }
}

function ConversionExamples() {
  const examples = [
    {
      title: 'HTML to React',
      description: 'Convert HTML markup to JSX with proper React syntax',
      before: `<div class="card">
  <img src="image.jpg" alt="Description">
  <div class="content">
    <h3>Title</h3>
    <p>Description text</p>
  </div>
</div>`,
      after: `<div className="card">
  <img src="image.jpg" alt="Description" />
  <div className="content">
    <h3>Title</h3>
    <p>Description text</p>
  </div>
</div>`
    },
    {
      title: 'CSS to Tailwind',
      description: 'Transform CSS styles to Tailwind utility classes',
      before: `.card {
  padding: 1rem;
  margin: 0.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}`,
      after: `className="p-4 m-2 bg-white rounded-lg shadow-md"`
    }
  ];

  return (
    <div className="glass-card p-8 rounded-xl">
      <h3 className="text-2xl font-semibold text-white mb-6 text-center">Conversion Examples</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {examples.map((example, index) => (
          <motion.div
            key={example.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
          >
            <h4 className="text-lg font-semibold text-white mb-2">{example.title}</h4>
            <p className="text-slate-300 text-sm mb-4">{example.description}</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide">Before</label>
                <pre className="bg-slate-900 p-3 rounded text-sm text-slate-100 overflow-x-auto mt-1">
                  <code>{example.before}</code>
                </pre>
              </div>
              
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide">After</label>
                <pre className="bg-slate-900 p-3 rounded text-sm text-slate-100 overflow-x-auto mt-1">
                  <code>{example.after}</code>
                </pre>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}