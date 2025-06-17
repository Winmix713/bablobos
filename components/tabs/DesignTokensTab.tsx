'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Download, 
  Copy, 
  Search, 
  Filter,
  Code,
  FileJson,
  FileCode,
  Settings,
  CheckCircle2,
  Eye,
  RefreshCw
} from 'lucide-react';

interface DesignToken {
  name: string;
  value: string;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'border';
  category: string;
  usage?: string;
}

export function DesignTokensTab() {
  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<DesignToken[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['color', 'spacing', 'typography']);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  useEffect(() => {
    // Simulate token extraction
    const sampleTokens: DesignToken[] = [
      // Colors
      { name: 'primary-500', value: '#3B82F6', type: 'color', category: 'primary', usage: 'Main brand color' },
      { name: 'primary-600', value: '#2563EB', type: 'color', category: 'primary', usage: 'Primary hover state' },
      { name: 'gray-100', value: '#F3F4F6', type: 'color', category: 'neutral', usage: 'Light background' },
      { name: 'gray-900', value: '#111827', type: 'color', category: 'neutral', usage: 'Primary text' },
      { name: 'success-500', value: '#10B981', type: 'color', category: 'semantic', usage: 'Success state' },
      { name: 'warning-500', value: '#F59E0B', type: 'color', category: 'semantic', usage: 'Warning state' },
      { name: 'error-500', value: '#EF4444', type: 'color', category: 'semantic', usage: 'Error state' },
      
      // Spacing
      { name: 'space-1', value: '4px', type: 'spacing', category: 'base', usage: 'Extra small spacing' },
      { name: 'space-2', value: '8px', type: 'spacing', category: 'base', usage: 'Small spacing' },
      { name: 'space-4', value: '16px', type: 'spacing', category: 'base', usage: 'Medium spacing' },
      { name: 'space-6', value: '24px', type: 'spacing', category: 'base', usage: 'Large spacing' },
      { name: 'space-8', value: '32px', type: 'spacing', category: 'base', usage: 'Extra large spacing' },
      
      // Typography
      { name: 'text-xs', value: '12px', type: 'typography', category: 'size', usage: 'Extra small text' },
      { name: 'text-sm', value: '14px', type: 'typography', category: 'size', usage: 'Small text' },
      { name: 'text-base', value: '16px', type: 'typography', category: 'size', usage: 'Base text size' },
      { name: 'text-lg', value: '18px', type: 'typography', category: 'size', usage: 'Large text' },
      { name: 'text-xl', value: '20px', type: 'typography', category: 'size', usage: 'Extra large text' },
      { name: 'font-normal', value: '400', type: 'typography', category: 'weight', usage: 'Normal weight' },
      { name: 'font-medium', value: '500', type: 'typography', category: 'weight', usage: 'Medium weight' },
      { name: 'font-bold', value: '700', type: 'typography', category: 'weight', usage: 'Bold weight' },
      
      // Shadows
      { name: 'shadow-sm', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', type: 'shadow', category: 'elevation', usage: 'Small shadow' },
      { name: 'shadow-md', value: '0 4px 6px -1px rgb(0 0 0 / 0.1)', type: 'shadow', category: 'elevation', usage: 'Medium shadow' },
      { name: 'shadow-lg', value: '0 10px 15px -3px rgb(0 0 0 / 0.1)', type: 'shadow', category: 'elevation', usage: 'Large shadow' },
      
      // Borders
      { name: 'radius-sm', value: '2px', type: 'border', category: 'radius', usage: 'Small border radius' },
      { name: 'radius-md', value: '6px', type: 'border', category: 'radius', usage: 'Medium border radius' },
      { name: 'radius-lg', value: '8px', type: 'border', category: 'radius', usage: 'Large border radius' }
    ];

    setTokens(sampleTokens);
    setFilteredTokens(sampleTokens);
  }, []);

  useEffect(() => {
    let filtered = tokens.filter(token => 
      selectedTypes.includes(token.type) &&
      (token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       token.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredTokens(filtered);
  }, [tokens, selectedTypes, searchQuery]);

  const handleExtractTokens = async () => {
    setIsExtracting(true);
    // Simulate extraction process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExtracting(false);
  };

  const handleExport = () => {
    const exportData = generateExportData(filteredTokens, exportFormat);
    downloadFile(exportData, `design-tokens.${exportFormat}`);
  };

  const tokenTypes = ['color', 'spacing', 'typography', 'shadow', 'border'];
  const tokenStats = tokenTypes.map(type => ({
    type,
    count: tokens.filter(t => t.type === type).length
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Design Tokens</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Extract, organize, and export design tokens from your Figma designs in multiple formats.
        </p>
      </div>

      {/* Stats and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TokenStats stats={tokenStats} />
        <div className="md:col-span-2 lg:col-span-1">
          <ExtractionPanel onExtract={handleExtractTokens} isExtracting={isExtracting} />
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Type:</span>
              {tokenTypes.map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedTypes(prev => 
                      prev.includes(type) 
                        ? prev.filter(t => t !== type)
                        : [...prev, type]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTypes.includes(type)
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <ExportControls 
            format={exportFormat}
            onFormatChange={setExportFormat}
            onExport={handleExport}
            tokenCount={filteredTokens.length}
          />
        </div>

        <TokenGrid tokens={filteredTokens} />
      </div>
    </div>
  );
}

function TokenStats({ stats }: { stats: { type: string; count: number }[] }) {
  return (
    <>
      {stats.map(({ type, count }) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-xl text-center"
        >
          <div className="text-2xl font-bold text-white mb-1">{count}</div>
          <div className="text-sm text-slate-300 capitalize">{type}</div>
        </motion.div>
      ))}
    </>
  );
}

function ExtractionPanel({ onExtract, isExtracting }: { onExtract: () => void; isExtracting: boolean }) {
  return (
    <div className="glass-card p-4 rounded-xl">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
        <Palette className="w-4 h-4 mr-2" />
        Extract Tokens
      </h3>
      
      <button
        onClick={onExtract}
        disabled={isExtracting}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center"
      >
        {isExtracting ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Extracting...
          </>
        ) : (
          <>
            <Palette className="w-4 h-4 mr-2" />
            Extract from Figma
          </>
        )}
      </button>
    </div>
  );
}

function ExportControls({ 
  format, 
  onFormatChange, 
  onExport, 
  tokenCount 
}: { 
  format: string; 
  onFormatChange: (format: string) => void; 
  onExport: () => void;
  tokenCount: number;
}) {
  const formats = [
    { value: 'json', label: 'JSON', icon: FileJson },
    { value: 'css', label: 'CSS', icon: FileCode },
    { value: 'scss', label: 'SCSS', icon: FileCode },
    { value: 'ts', label: 'TypeScript', icon: Code },
    { value: 'tailwind', label: 'Tailwind', icon: Settings }
  ];

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-slate-300">Export as:</span>
        <select
          value={format}
          onChange={(e) => onFormatChange(e.target.value)}
          className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
        >
          {formats.map(fmt => (
            <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
          ))}
        </select>
      </div>
      
      <button
        onClick={onExport}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
      >
        <Download className="w-4 h-4 mr-2" />
        Export ({tokenCount})
      </button>
    </div>
  );
}

function TokenGrid({ tokens }: { tokens: DesignToken[] }) {
  const groupedTokens = tokens.reduce((acc, token) => {
    if (!acc[token.type]) acc[token.type] = [];
    acc[token.type].push(token);
    return acc;
  }, {} as Record<string, DesignToken[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedTokens).map(([type, typeTokens]) => (
        <div key={type}>
          <h3 className="text-lg font-semibold text-white mb-4 capitalize flex items-center">
            <TokenTypeIcon type={type} className="w-5 h-5 mr-2" />
            {type} ({typeTokens.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {typeTokens.map((token) => (
              <TokenCard key={token.name} token={token} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TokenCard({ token }: { token: DesignToken }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{token.name}</h4>
          <p className="text-xs text-slate-400 truncate">{token.category}</p>
        </div>
        
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"
        >
          {copied ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      <TokenPreview token={token} />
      
      <div className="mt-3 flex items-center justify-between">
        <code className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
          {token.value}
        </code>
        
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded">
          <Eye className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      
      {token.usage && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{token.usage}</p>
      )}
    </motion.div>
  );
}

function TokenPreview({ token }: { token: DesignToken }) {
  switch (token.type) {
    case 'color':
      return (
        <div 
          className="w-full h-12 rounded border border-slate-600"
          style={{ backgroundColor: token.value }}
        />
      );
      
    case 'spacing':
      return (
        <div className="bg-slate-700 rounded p-2">
          <div 
            className="bg-blue-500 rounded"
            style={{ width: token.value, height: '8px' }}
          />
        </div>
      );
      
    case 'typography':
      return (
        <div className="bg-slate-700 rounded p-2 text-center">
          <span 
            className="text-white"
            style={{ 
              fontSize: token.name.includes('font-') ? '16px' : token.value,
              fontWeight: token.name.includes('font-') ? token.value : 'normal'
            }}
          >
            Aa
          </span>
        </div>
      );
      
    case 'shadow':
      return (
        <div className="bg-slate-700 rounded p-4 flex justify-center">
          <div 
            className="w-8 h-8 bg-white rounded"
            style={{ boxShadow: token.value }}
          />
        </div>
      );
      
    case 'border':
      return (
        <div className="bg-slate-700 rounded p-4 flex justify-center">
          <div 
            className="w-8 h-8 bg-slate-600 border-2 border-white"
            style={{ borderRadius: token.value }}
          />
        </div>
      );
      
    default:
      return (
        <div className="w-full h-12 bg-slate-700 rounded flex items-center justify-center text-slate-400 text-xs">
          Preview
        </div>
      );
  }
}

function TokenTypeIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'color':
      return <Palette className={className} />;
    case 'spacing':
      return <div className={`border border-current ${className}`} />;
    case 'typography':
      return <div className={`font-bold ${className}`}>T</div>;
    case 'shadow':
      return <div className={`bg-current rounded ${className}`} />;
    case 'border':
      return <div className={`border-2 border-current rounded ${className}`} />;
    default:
      return <Settings className={className} />;
  }
}

function generateExportData(tokens: DesignToken[], format: string): string {
  switch (format) {
    case 'json':
      return JSON.stringify(tokens.reduce((acc, token) => {
        acc[token.name] = {
          value: token.value,
          type: token.type,
          category: token.category
        };
        return acc;
      }, {} as any), null, 2);
      
    case 'css':
      return `:root {\n${tokens.map(token => `  --${token.name}: ${token.value};`).join('\n')}\n}`;
      
    case 'scss':
      return tokens.map(token => `$${token.name}: ${token.value};`).join('\n');
      
    case 'ts':
      return `export const tokens = {\n${tokens.map(token => `  '${token.name}': '${token.value}',`).join('\n')}\n} as const;`;
      
    case 'tailwind':
      const grouped = tokens.reduce((acc, token) => {
        if (!acc[token.type]) acc[token.type] = {};
        acc[token.type][token.name] = token.value;
        return acc;
      }, {} as any);
      
      return `module.exports = {\n  theme: {\n    extend: ${JSON.stringify(grouped, null, 6)}\n  }\n}`;
      
    default:
      return JSON.stringify(tokens, null, 2);
  }
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}