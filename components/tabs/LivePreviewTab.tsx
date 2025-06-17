'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Monitor, 
  Tablet, 
  Smartphone, 
  RefreshCw, 
  Play, 
  Pause,
  Settings,
  Download,
  Share2,
  Code,
  Zap,
  Layers,
  Sun,
  Moon
} from 'lucide-react';

export function LivePreviewTab() {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [previewContent, setPreviewContent] = useState('sample-button');

  // Simulate WebSocket connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
      setLastUpdate(new Date());
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(() => {
    setLastUpdate(new Date());
  }, []);

  const deviceConfig = {
    desktop: { width: '100%', height: '600px', icon: Monitor, label: 'Desktop' },
    tablet: { width: '768px', height: '600px', icon: Tablet, label: 'Tablet' },
    mobile: { width: '375px', height: '600px', icon: Smartphone, label: 'Mobile' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Live Preview</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Real-time component preview with hot-reload, multi-device testing, and WebSocket synchronization.
        </p>
      </div>

      {/* Control Panel */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Device Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-300 mr-2">Device:</span>
            {Object.entries(deviceConfig).map(([device, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={device}
                  onClick={() => setSelectedDevice(device as any)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDevice === device
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-300">Theme:</span>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                theme === 'light' 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-slate-700 text-white'
              }`}
            >
              {theme === 'light' ? <Sun className="w-4 h-4 mr-1" /> : <Moon className="w-4 h-4 mr-1" />}
              {theme === 'light' ? 'Light' : 'Dark'}
            </button>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-300">Auto-refresh:</span>
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isAutoRefresh
                  ? 'bg-green-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {isAutoRefresh ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
              {isAutoRefresh ? 'On' : 'Off'}
            </button>
          </div>

          {/* Manual Refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Preview Area */}
        <div className="xl:col-span-3">
          <PreviewArea 
            device={selectedDevice}
            theme={theme}
            isConnected={isConnected}
            lastUpdate={lastUpdate}
            content={previewContent}
          />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <ConnectionStatus isConnected={isConnected} lastUpdate={lastUpdate} />
          <ComponentSelector value={previewContent} onChange={setPreviewContent} />
          <PreviewActions />
        </div>
      </div>
    </div>
  );
}

function PreviewArea({ 
  device, 
  theme, 
  isConnected, 
  lastUpdate,
  content 
}: {
  device: 'desktop' | 'tablet' | 'mobile';
  theme: 'light' | 'dark';
  isConnected: boolean;
  lastUpdate: Date | null;
  content: string;
}) {
  const deviceConfig = {
    desktop: { width: '100%', height: '600px' },
    tablet: { width: '768px', height: '600px' },
    mobile: { width: '375px', height: '600px' }
  };

  const config = deviceConfig[device];

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Component Preview
        </h3>
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-slate-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {lastUpdate && (
            <span className="text-slate-400">
              • Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 min-h-[500px] flex items-center justify-center">
        <motion.div
          key={`${device}-${theme}-${content}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto"
          style={{ 
            width: config.width, 
            maxWidth: '100%',
            height: config.height 
          }}
        >
          <div className={`w-full h-full rounded-lg border-2 ${
            theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'
          } overflow-hidden`}>
            <PreviewContent theme={theme} content={content} />
          </div>
        </motion.div>
      </div>

      {/* Device Frame */}
      {device !== 'desktop' && (
        <div className="text-center mt-4">
          <span className="text-sm text-slate-400">
            {device === 'tablet' ? '768px × 600px' : '375px × 600px'}
          </span>
        </div>
      )}
    </div>
  );
}

function PreviewContent({ theme, content }: { theme: 'light' | 'dark'; content: string }) {
  const components = {
    'sample-button': (
      <div className={`p-8 ${theme === 'light' ? 'bg-white' : 'bg-gray-900'} h-full flex items-center justify-center`}>
        <button className={`px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 ${
          theme === 'light' 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}>
          Sample Button
        </button>
      </div>
    ),
    'sample-card': (
      <div className={`p-8 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'} h-full flex items-center justify-center`}>
        <div className={`p-6 rounded-xl shadow-lg max-w-sm w-full ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}>
          <div className={`w-full h-32 rounded-lg mb-4 ${
            theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            Sample Card
          </h3>
          <p className={`text-sm ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            This is a sample card component with responsive design and theming support.
          </p>
        </div>
      </div>
    ),
    'sample-form': (
      <div className={`p-8 ${theme === 'light' ? 'bg-white' : 'bg-gray-900'} h-full flex items-center justify-center`}>
        <div className="max-w-md w-full space-y-4">
          <input 
            type="text" 
            placeholder="Email" 
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'light' 
                ? 'border-gray-300 bg-white text-gray-900' 
                : 'border-gray-600 bg-gray-800 text-white'
            }`}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'light' 
                ? 'border-gray-300 bg-white text-gray-900' 
                : 'border-gray-600 bg-gray-800 text-white'
            }`}
          />
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors">
            Sign In
          </button>
        </div>
      </div>
    )
  };

  return components[content as keyof typeof components] || components['sample-button'];
}

function ConnectionStatus({ isConnected, lastUpdate }: { isConnected: boolean; lastUpdate: Date | null }) {
  return (
    <div className="glass-card p-4 rounded-xl">
      <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
        <Zap className="w-4 h-4 mr-2" />
        Live Connection
      </h4>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Status</span>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {lastUpdate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Last Update</span>
            <span className="text-sm text-slate-400">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Auto-sync</span>
          <span className="text-sm text-green-400">Enabled</span>
        </div>
      </div>
    </div>
  );
}

function ComponentSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const components = [
    { value: 'sample-button', label: 'Button Component' },
    { value: 'sample-card', label: 'Card Component' },
    { value: 'sample-form', label: 'Form Component' }
  ];

  return (
    <div className="glass-card p-4 rounded-xl">
      <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
        <Layers className="w-4 h-4 mr-2" />
        Components
      </h4>
      
      <div className="space-y-2">
        {components.map((component) => (
          <button
            key={component.value}
            onClick={() => onChange(component.value)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
              value === component.value
                ? 'bg-blue-500 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            {component.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewActions() {
  return (
    <div className="glass-card p-4 rounded-xl">
      <h4 className="text-sm font-semibold text-white mb-3">Actions</h4>
      
      <div className="space-y-2">
        <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-all">
          <Code className="w-4 h-4 mr-2" />
          View Code
        </button>
        
        <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-all">
          <Download className="w-4 h-4 mr-2" />
          Export Component
        </button>
        
        <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-all">
          <Share2 className="w-4 h-4 mr-2" />
          Share Preview
        </button>
        
        <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-all">
          <Settings className="w-4 h-4 mr-2" />
          Preview Settings
        </button>
      </div>
    </div>
  );
}