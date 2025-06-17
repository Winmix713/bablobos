'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Sparkles, 
  Code, 
  Palette, 
  Shield, 
  Rocket,
  ArrowRight,
  Play,
  Download,
  Eye,
  Settings,
  FileText,
  TestTube,
  Accessibility,
  Bot
} from 'lucide-react';

// Import our custom components
import { FigmaImportTab } from '@/components/tabs/FigmaImportTab';
import { LivePreviewTab } from '@/components/tabs/LivePreviewTab';
import { DesignTokensTab } from '@/components/tabs/DesignTokensTab';
import { AccessibilityTab } from '@/components/tabs/AccessibilityTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { AIGeneratorTab } from '@/components/tabs/AIGeneratorTab';
import { ManualConvertTab } from '@/components/tabs/ManualConvertTab';
import { TemplatesTab } from '@/components/tabs/TemplatesTab';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('figma-import');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    {
      id: 'figma-import',
      label: 'Figma Import',
      icon: FileText,
      description: 'Import and convert Figma designs',
      component: FigmaImportTab
    },
    {
      id: 'ai-generator',
      label: 'AI Generator',
      icon: Bot,
      description: 'AI-powered code generation',
      component: AIGeneratorTab
    },
    {
      id: 'live-preview',
      label: 'Live Preview',
      icon: Eye,
      description: 'Real-time component preview',
      component: LivePreviewTab
    },
    {
      id: 'design-tokens',
      label: 'Design Tokens',
      icon: Palette,
      description: 'Extract and export design tokens',
      component: DesignTokensTab
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      icon: Accessibility,
      description: 'WCAG compliance analysis',
      component: AccessibilityTab
    },
    {
      id: 'manual-convert',
      label: 'Manual Convert',
      icon: Code,
      description: 'Manual code conversion tools',
      component: ManualConvertTab
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: TestTube,
      description: 'Pre-built component templates',
      component: TemplatesTab
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configure converter settings',
      component: SettingsTab
    }
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <div className="relative z-10 container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl mr-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Figma to React Converter
              </h1>
            </div>
            
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade converter with AI assistance, live preview, design tokens, 
              accessibility analysis, and comprehensive tooling for modern development workflows.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <FeatureChip icon={Sparkles} text="AI-Powered" />
              <FeatureChip icon={Eye} text="Live Preview" />
              <FeatureChip icon={Palette} text="Design Tokens" />
              <FeatureChip icon={Shield} text="A11y Compliant" />
              <FeatureChip icon={Rocket} text="Enterprise Ready" />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl transition-all duration-300 flex items-center mx-auto"
              onClick={() => setActiveTab('figma-import')}
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Main Application Interface */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card rounded-2xl p-8 shadow-2xl"
          >
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8 p-2 bg-slate-800/50 rounded-xl">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[600px]"
              >
                {(() => {
                  const TabComponent = tabs.find(tab => tab.id === activeTab)?.component;
                  return TabComponent ? <TabComponent /> : null;
                })()}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <FeatureCard
              icon={Code}
              title="17 Advanced Features"
              description="Complete plugin system, live preview, design tokens, AI assistance, and more"
              color="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="Optimized conversion engine with caching and batch processing"
              color="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise Grade"
              description="Production-ready with CI/CD integration and comprehensive testing"
              color="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={Sparkles}
              title="AI Enhanced"
              description="GPT-4 and Groq integration for intelligent code optimization"
              color="from-purple-500 to-pink-500"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-3xl mb-8 inline-block">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="w-12 h-12 text-white" />
          </motion.div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Initializing Converter</h2>
        <p className="text-slate-300">Loading enterprise features...</p>
        
        <div className="mt-8 w-64 h-2 bg-slate-700 rounded-full mx-auto overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2 }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function FeatureChip({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="glass px-4 py-2 rounded-full flex items-center text-white text-sm font-medium"
    >
      <Icon className="w-4 h-4 mr-2" />
      {text}
    </motion.div>
  );
}

function TabButton({ tab, isActive, onClick }: { 
  tab: any, 
  isActive: boolean, 
  onClick: () => void 
}) {
  const Icon = tab.icon;
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
        }
      `}
    >
      <Icon className="w-4 h-4 mr-2" />
      <span className="hidden sm:inline">{tab.label}</span>
    </motion.button>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: {
  icon: any,
  title: string,
  description: string,
  color: string
}) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass-card p-6 rounded-xl transition-all duration-300"
    >
      <div className={`bg-gradient-to-r ${color} p-3 rounded-xl w-fit mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}