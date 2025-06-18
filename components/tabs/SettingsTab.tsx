'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Shield, 
  Palette, 
  Code, 
  Zap,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export function SettingsTab() {
  const [settings, setSettings] = useState({
    // General Settings
    figmaToken: '',
    outputDirectory: './output',
    autoSave: true,
    
    // Conversion Settings
    framework: 'react',
    typescript: true,
    styling: 'tailwind',
    
    // Features
    enableStorybook: true,
    enableTests: true,
    enableDesignTokens: true,
    enableAccessibility: true,
    enableAI: false,
    
    // AI Settings
    aiProvider: 'openai',
    aiApiKey: '',
    aiOptimization: true,
    
    // Cache Settings
    enableCaching: true,
    cacheSize: 100,
    cacheTTL: 24,
    
    // Performance
    batchSize: 10,
    parallelProcessing: true,
    memoryLimit: 512,
    
    // Advanced
    customPlugins: [],
    webhookUrl: '',
    debugMode: false
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically save to localStorage, API, etc.
      localStorage.setItem('figma-converter-settings', JSON.stringify(settings));
      
      setSaveStatus('saved');
      setHasChanges(false);
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      // Reset to default values
      setSettings({
        figmaToken: '',
        outputDirectory: './output',
        autoSave: true,
        framework: 'react',
        typescript: true,
        styling: 'tailwind',
        enableStorybook: true,
        enableTests: true,
        enableDesignTokens: true,
        enableAccessibility: true,
        enableAI: false,
        aiProvider: 'openai',
        aiApiKey: '',
        aiOptimization: true,
        enableCaching: true,
        cacheSize: 100,
        cacheTTL: 24,
        batchSize: 10,
        parallelProcessing: true,
        memoryLimit: 512,
        customPlugins: [],
        webhookUrl: '',
        debugMode: false
      });
      setHasChanges(true);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'figma-converter-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings({ ...settings, ...importedSettings });
        setHasChanges(true);
      } catch (error) {
        alert('Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Settings</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Configure your Figma to React converter preferences and advanced options.
        </p>
      </div>

      {/* Save Actions */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <div className="flex items-center text-yellow-400 text-sm">
                <AlertTriangle className="w-4 h-4 mr-1" />
                You have unsaved changes
              </div>
            )}
            
            {saveStatus === 'saved' && (
              <div className="flex items-center text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Settings saved successfully
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            
            <label className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || saveStatus === 'saving'}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center disabled:cursor-not-allowed"
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <GeneralSettings settings={settings} updateSetting={updateSetting} />
        
        {/* Conversion Settings */}
        <ConversionSettings settings={settings} updateSetting={updateSetting} />
        
        {/* Feature Settings */}
        <FeatureSettings settings={settings} updateSetting={updateSetting} />
        
        {/* AI Settings */}
        <AISettings settings={settings} updateSetting={updateSetting} />
        
        {/* Performance Settings */}
        <PerformanceSettings settings={settings} updateSetting={updateSetting} />
        
        {/* Advanced Settings */}
        <AdvancedSettings settings={settings} updateSetting={updateSetting} />
      </div>
    </div>
  );
}

function GeneralSettings({ settings, updateSetting }: any) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Settings className="w-5 h-5 mr-2" />
        General Settings
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Figma Access Token
          </label>
          <input
            type="password"
            value={settings.figmaToken}
            onChange={(e) => updateSetting('figmaToken', e.target.value)}
            placeholder="Enter your Figma access token"
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Output Directory
          </label>
          <input
            type="text"
            value={settings.outputDirectory}
            onChange={(e) => updateSetting('outputDirectory', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Auto-save converted files</span>
          <ToggleSwitch
            checked={settings.autoSave}
            onChange={(checked) => updateSetting('autoSave', checked)}
          />
        </div>
      </div>
    </div>
  );
}

function ConversionSettings({ settings, updateSetting }: any) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Code className="w-5 h-5 mr-2" />
        Conversion Settings
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Target Framework
          </label>
          <select
            value={settings.framework}
            onChange={(e) => updateSetting('framework', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="react">React</option>
            <option value="vue">Vue 3</option>
            <option value="svelte">Svelte</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Styling Approach
          </label>
          <select
            value={settings.styling}
            onChange={(e) => updateSetting('styling', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="tailwind">Tailwind CSS</option>
            <option value="styled-components">Styled Components</option>
            <option value="css">CSS Modules</option>
            <option value="emotion">Emotion</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Use TypeScript</span>
          <ToggleSwitch
            checked={settings.typescript}
            onChange={(checked) => updateSetting('typescript', checked)}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureSettings({ settings, updateSetting }: any) {
  const features = [
    { key: 'enableStorybook', label: 'Generate Storybook stories' },
    { key: 'enableTests', label: 'Generate unit tests' },
    { key: 'enableDesignTokens', label: 'Extract design tokens' },
    { key: 'enableAccessibility', label: 'Accessibility analysis' },
    { key: 'enableAI', label: 'AI code optimization' }
  ];

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Zap className="w-5 h-5 mr-2" />
        Features
      </h3>
      
      <div className="space-y-4">
        {features.map(feature => (
          <div key={feature.key} className="flex items-center justify-between">
            <span className="text-slate-300">{feature.label}</span>
            <ToggleSwitch
              checked={settings[feature.key]}
              onChange={(checked) => updateSetting(feature.key, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AISettings({ settings, updateSetting }: any) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Zap className="w-5 h-5 mr-2" />
        AI Settings
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            AI Provider
          </label>
          <select
            value={settings.aiProvider}
            onChange={(e) => updateSetting('aiProvider', e.target.value)}
            disabled={!settings.enableAI}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="openai">OpenAI GPT-4</option>
            <option value="groq">Groq</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={settings.aiApiKey}
            onChange={(e) => updateSetting('aiApiKey', e.target.value)}
            placeholder="Enter your AI API key"
            disabled={!settings.enableAI}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Code optimization</span>
          <ToggleSwitch
            checked={settings.aiOptimization}
            onChange={(checked) => updateSetting('aiOptimization', checked)}
            disabled={!settings.enableAI}
          />
        </div>
      </div>
    </div>
  );
}

function PerformanceSettings({ settings, updateSetting }: any) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Zap className="w-5 h-5 mr-2" />
        Performance
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Cache Size (MB): {settings.cacheSize}
          </label>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={settings.cacheSize}
            onChange={(e) => updateSetting('cacheSize', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Cache TTL (hours): {settings.cacheTTL}
          </label>
          <input
            type="range"
            min="1"
            max="168"
            value={settings.cacheTTL}
            onChange={(e) => updateSetting('cacheTTL', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Enable caching</span>
          <ToggleSwitch
            checked={settings.enableCaching}
            onChange={(checked) => updateSetting('enableCaching', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Parallel processing</span>
          <ToggleSwitch
            checked={settings.parallelProcessing}
            onChange={(checked) => updateSetting('parallelProcessing', checked)}
          />
        </div>
      </div>
    </div>
  );
}

function AdvancedSettings({ settings, updateSetting }: any) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Shield className="w-5 h-5 mr-2" />
        Advanced
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Webhook URL (optional)
          </label>
          <input
            type="url"
            value={settings.webhookUrl}
            onChange={(e) => updateSetting('webhookUrl', e.target.value)}
            placeholder="https://your-webhook-url.com"
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Debug mode</span>
          <ToggleSwitch
            checked={settings.debugMode}
            onChange={(checked) => updateSetting('debugMode', checked)}
          />
        </div>
        
        <div className="pt-4 border-t border-slate-700">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Cache
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, disabled = false }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-blue-500' : 'bg-slate-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}