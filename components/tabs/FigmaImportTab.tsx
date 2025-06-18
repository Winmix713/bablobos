'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Link, 
  FileText, 
  Download, 
  Zap, 
  Settings, 
  Check,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

export function FigmaImportTab() {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [figmaToken, setFigmaToken] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [conversionResult, setConversionResult] = useState<any>(null);

  const handleConvert = useCallback(async () => {
    if (!figmaUrl || !figmaToken) {
      alert('Please provide both Figma URL and access token');
      return;
    }

    setIsConverting(true);
    setConversionStatus('idle');

    try {
      // Simulate conversion process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult = {
        success: true,
        files: [
          { name: 'Button.tsx', type: 'component', size: '2.4 KB' },
          { name: 'Button.stories.tsx', type: 'story', size: '1.8 KB' },
          { name: 'Button.test.tsx', type: 'test', size: '1.2 KB' },
          { name: 'tokens.json', type: 'tokens', size: '0.9 KB' }
        ],
        metrics: {
          conversionTime: '2.8s',
          accessibilityScore: 94,
          componentsGenerated: 1,
          tokensExtracted: 12
        }
      };

      setConversionResult(mockResult);
      setConversionStatus('success');
    } catch (error) {
      setConversionStatus('error');
    } finally {
      setIsConverting(false);
    }
  }, [figmaUrl, figmaToken]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Import from Figma</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Convert your Figma designs into production-ready React components with TypeScript, 
          Storybook stories, and comprehensive testing.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Link className="w-5 h-5 mr-2" />
              Figma Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Figma File URL
                </label>
                <input
                  type="url"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  placeholder="https://www.figma.com/file/..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Figma Access Token
                </label>
                <input
                  type="password"
                  value={figmaToken}
                  onChange={(e) => setFigmaToken(e.target.value)}
                  placeholder="Enter your Figma access token"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">
                  <ExternalLink className="w-3 h-3 inline mr-1" />
                  <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                    Get your token from Figma
                  </a>
                </p>
              </div>
            </div>
          </div>

          <ConversionSettings />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Conversion Action */}
          <div className="glass-card p-6 rounded-xl text-center">
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full w-fit mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Convert</h3>
              <p className="text-slate-300 text-sm">
                Convert your Figma design to production-ready React components
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConvert}
              disabled={isConverting || !figmaUrl || !figmaToken}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center disabled:cursor-not-allowed"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Convert to React
                </>
              )}
            </motion.button>
          </div>

          {/* Conversion Status */}
          {conversionStatus !== 'idle' && (
            <ConversionStatus status={conversionStatus} result={conversionResult} />
          )}
        </motion.div>
      </div>

      {/* Quick Start Guide */}
      <QuickStartGuide />
    </div>
  );
}

function ConversionSettings() {
  const [framework, setFramework] = useState('react');
  const [typescript, setTypescript] = useState(true);
  const [styling, setStyling] = useState('tailwind');
  const [features, setFeatures] = useState({
    storybook: true,
    tests: true,
    tokens: true,
    accessibility: true,
    ai: false
  });

  const toggleFeature = (feature: string) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature as keyof typeof prev]
    }));
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2" />
        Conversion Settings
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Framework</label>
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="react">React</option>
            <option value="vue">Vue 3</option>
            <option value="svelte">Svelte</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Styling</label>
          <select
            value={styling}
            onChange={(e) => setStyling(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="tailwind">Tailwind CSS</option>
            <option value="styled-components">Styled Components</option>
            <option value="css">CSS Modules</option>
            <option value="emotion">Emotion</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-300">TypeScript</span>
          <button
            onClick={() => setTypescript(!typescript)}
            className={`w-12 h-6 rounded-full transition-colors ${
              typescript ? 'bg-blue-500' : 'bg-slate-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              typescript ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Additional Features</label>
          {Object.entries(features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center justify-between">
              <span className="text-slate-300 capitalize">{feature === 'ai' ? 'AI Enhancement' : feature}</span>
              <button
                onClick={() => toggleFeature(feature)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  enabled ? 'bg-blue-500' : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConversionStatus({ status, result }: { status: 'success' | 'error', result: any }) {
  if (status === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-xl border-red-500/20"
      >
        <div className="flex items-center text-red-400 mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="font-semibold">Conversion Failed</span>
        </div>
        <p className="text-slate-300 text-sm">
          There was an error converting your Figma file. Please check your URL and token.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-xl border-green-500/20"
    >
      <div className="flex items-center text-green-400 mb-4">
        <Check className="w-5 h-5 mr-2" />
        <span className="font-semibold">Conversion Successful!</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{result.metrics.conversionTime}</div>
          <div className="text-xs text-slate-400">Conversion Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{result.metrics.accessibilityScore}%</div>
          <div className="text-xs text-slate-400">A11y Score</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium text-white">Generated Files:</h4>
        {result.files.map((file: any, index: number) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-slate-300">{file.name}</span>
            <span className="text-slate-400">{file.size}</span>
          </div>
        ))}
      </div>

      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
        <Download className="w-4 h-4 mr-2" />
        Download Components
      </button>
    </motion.div>
  );
}

function QuickStartGuide() {
  const steps = [
    {
      number: 1,
      title: 'Get Figma Token',
      description: 'Generate a personal access token from your Figma account settings'
    },
    {
      number: 2,
      title: 'Copy File URL',
      description: 'Copy the URL of your Figma file or specific frame you want to convert'
    },
    {
      number: 3,
      title: 'Configure Settings',
      description: 'Choose your preferred framework, styling approach, and additional features'
    },
    {
      number: 4,
      title: 'Convert & Download',
      description: 'Click convert and download your production-ready React components'
    }
  ];

  return (
    <div className="glass-card p-8 rounded-xl">
      <h3 className="text-2xl font-semibold text-white mb-6 text-center">Quick Start Guide</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: step.number * 0.1 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
              {step.number}
            </div>
            <h4 className="text-white font-semibold mb-2">{step.title}</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}