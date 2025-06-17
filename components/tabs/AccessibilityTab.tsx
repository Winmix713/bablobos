'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Accessibility, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Keyboard,
  MousePointer,
  Volume2,
  Brain,
  FileText,
  Download,
  RefreshCw,
  Info,
  XCircle
} from 'lucide-react';

interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  rule: string;
  description: string;
  element: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  wcagLevel: 'A' | 'AA' | 'AAA';
  howToFix: string;
}

interface AccessibilityReport {
  score: number;
  wcagLevel: 'A' | 'AA' | 'AAA';
  issues: AccessibilityIssue[];
  passedRules: number;
  totalRules: number;
  categories: {
    [key: string]: {
      passed: number;
      failed: number;
      score: number;
    };
  };
}

export function AccessibilityTab() {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    // Simulate initial analysis
    generateMockReport();
  }, []);

  const generateMockReport = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockReport: AccessibilityReport = {
      score: 87,
      wcagLevel: 'AA',
      passedRules: 43,
      totalRules: 50,
      issues: [
        {
          id: '1',
          type: 'error',
          rule: 'color-contrast',
          description: 'Text color does not have sufficient contrast against background',
          element: 'Button "Submit"',
          severity: 'serious',
          wcagLevel: 'AA',
          howToFix: 'Increase color contrast ratio to at least 4.5:1 for normal text'
        },
        {
          id: '2',
          type: 'warning',
          rule: 'aria-label',
          description: 'Interactive element missing accessible name',
          element: 'Icon button',
          severity: 'moderate',
          wcagLevel: 'A',
          howToFix: 'Add aria-label or aria-labelledby attribute to provide accessible name'
        },
        {
          id: '3',
          type: 'error',
          rule: 'keyboard-navigation',
          description: 'Element is not reachable via keyboard navigation',
          element: 'Custom dropdown',
          severity: 'critical',
          wcagLevel: 'A',
          howToFix: 'Ensure all interactive elements are keyboard accessible with proper tabindex'
        },
        {
          id: '4',
          type: 'warning',
          rule: 'alt-text',
          description: 'Image missing alternative text',
          element: 'Logo image',
          severity: 'moderate',
          wcagLevel: 'A',
          howToFix: 'Add meaningful alt text that describes the purpose of the image'
        },
        {
          id: '5',
          type: 'info',
          rule: 'heading-structure',
          description: 'Heading levels should increase by one',
          element: 'Section heading',
          severity: 'minor',
          wcagLevel: 'AA',
          howToFix: 'Use proper heading hierarchy (h1, h2, h3, etc.) in logical order'
        }
      ],
      categories: {
        'Color & Contrast': { passed: 8, failed: 2, score: 80 },
        'Keyboard Navigation': { passed: 12, failed: 1, score: 92 },
        'Screen Reader': { passed: 15, failed: 2, score: 88 },
        'Focus Management': { passed: 8, failed: 2, score: 80 }
      }
    };

    setReport(mockReport);
    setIsAnalyzing(false);
  };

  const handleReanalyze = () => {
    generateMockReport();
  };

  const filteredIssues = report?.issues.filter(issue => {
    const categoryMatch = selectedCategory === 'all' || 
      (selectedCategory === 'error' && issue.type === 'error') ||
      (selectedCategory === 'warning' && issue.type === 'warning') ||
      (selectedCategory === 'info' && issue.type === 'info');
    
    const severityMatch = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    
    return categoryMatch && severityMatch;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Accessibility Analysis</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Comprehensive WCAG compliance analysis with automated testing and actionable recommendations.
        </p>
      </div>

      {/* Analysis Controls */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleReanalyze}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </button>

            {report && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-300">Filters:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                >
                  <option value="all">All Issues</option>
                  <option value="error">Errors</option>
                  <option value="warning">Warnings</option>
                  <option value="info">Info</option>
                </select>
                
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="serious">Serious</option>
                  <option value="moderate">Moderate</option>
                  <option value="minor">Minor</option>
                </select>
              </div>
            )}
          </div>

          {report && (
            <div className="flex items-center space-x-2">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
              
              <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                View Guide
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {report && (
        <>
          {/* Score Overview */}
          <ScoreOverview report={report} />

          {/* Category Breakdown */}
          <CategoryBreakdown categories={report.categories} />

          {/* Issues List */}
          <IssuesList issues={filteredIssues} />
        </>
      )}
      
      {/* Accessibility Guidelines */}
      <AccessibilityGuidelines />
    </div>
  );
}

function ScoreOverview({ report }: { report: AccessibilityReport }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return CheckCircle2;
    if (score >= 70) return AlertTriangle;
    return XCircle;
  };

  const ScoreIcon = getScoreIcon(report.score);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 rounded-xl text-center md:col-span-2"
      >
        <div className="flex items-center justify-center mb-4">
          <ScoreIcon className={`w-8 h-8 mr-3 ${getScoreColor(report.score)}`} />
          <div>
            <div className={`text-4xl font-bold ${getScoreColor(report.score)}`}>
              {report.score}%
            </div>
            <div className="text-slate-300 text-sm">Accessibility Score</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">WCAG Level</span>
            <span className="text-white font-medium">{report.wcagLevel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Rules Passed</span>
            <span className="text-white font-medium">{report.passedRules}/{report.totalRules}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card p-6 rounded-xl text-center"
      >
        <div className="text-2xl font-bold text-red-400 mb-2">
          {report.issues.filter(i => i.type === 'error').length}
        </div>
        <div className="text-slate-300 text-sm">Errors</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 rounded-xl text-center"
      >
        <div className="text-2xl font-bold text-yellow-400 mb-2">
          {report.issues.filter(i => i.type === 'warning').length}
        </div>
        <div className="text-slate-300 text-sm">Warnings</div>
      </motion.div>
    </div>
  );
}

function CategoryBreakdown({ categories }: { categories: AccessibilityReport['categories'] }) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Brain className="w-5 h-5 mr-2" />
        Category Breakdown
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(categories).map(([category, data], index) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
          >
            <CategoryIcon category={category} className="w-6 h-6 text-blue-400 mb-3" />
            <h4 className="text-white font-medium mb-2">{category}</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Passed</span>
                <span className="text-white">{data.passed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-400">Failed</span>
                <span className="text-white">{data.failed}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.score}%` }}
                />
              </div>
              <div className="text-center text-xs text-slate-300">{data.score}%</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  switch (category.toLowerCase()) {
    case 'color & contrast':
      return <Eye className={className} />;
    case 'keyboard navigation':
      return <Keyboard className={className} />;
    case 'screen reader':
      return <Volume2 className={className} />;
    case 'focus management':
      return <MousePointer className={className} />;
    default:
      return <Accessibility className={className} />;
  }
}

function IssuesList({ issues }: { issues: AccessibilityIssue[] }) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2" />
        Issues Found ({issues.length})
      </h3>
      
      {issues.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-white mb-2">No Issues Found</h4>
          <p className="text-slate-300">Great! All accessibility checks passed for the current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

function IssueCard({ issue }: { issue: AccessibilityIssue }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600';
      case 'serious':
        return 'bg-orange-600';
      case 'moderate':
        return 'bg-yellow-600';
      case 'minor':
        return 'bg-blue-600';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          {getIssueIcon(issue.type)}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-white font-medium">{issue.rule}</h4>
              <span className={`px-2 py-1 rounded text-xs text-white font-medium ${getSeverityColor(issue.severity)}`}>
                {issue.severity}
              </span>
              <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300">
                WCAG {issue.wcagLevel}
              </span>
            </div>
            <p className="text-slate-300 text-sm">{issue.description}</p>
            <p className="text-slate-400 text-xs mt-1">Element: {issue.element}</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-slate-700 pt-3 mt-3"
        >
          <h5 className="text-white font-medium mb-2">How to fix:</h5>
          <p className="text-slate-300 text-sm leading-relaxed">{issue.howToFix}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

function AccessibilityGuidelines() {
  const guidelines = [
    {
      title: 'Color & Contrast',
      description: 'Ensure sufficient color contrast for text and interactive elements',
      tips: [
        'Use a contrast ratio of at least 4.5:1 for normal text',
        'Use a contrast ratio of at least 3:1 for large text',
        'Don\'t rely on color alone to convey information'
      ]
    },
    {
      title: 'Keyboard Navigation',
      description: 'Make all interactive elements accessible via keyboard',
      tips: [
        'Ensure all interactive elements are keyboard focusable',
        'Provide clear focus indicators',
        'Implement logical tab order'
      ]
    },
    {
      title: 'Screen Reader Support',
      description: 'Provide proper semantic markup and labels',
      tips: [
        'Use semantic HTML elements',
        'Provide alt text for images',
        'Use ARIA labels for complex interactions'
      ]
    },
    {
      title: 'Focus Management',
      description: 'Manage focus for dynamic content and interactions',
      tips: [
        'Move focus to new content when appropriate',
        'Return focus to logical locations',
        'Avoid focus traps'
      ]
    }
  ];

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2" />
        Accessibility Guidelines
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guidelines.map((guideline, index) => (
          <motion.div
            key={guideline.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
          >
            <h4 className="text-white font-medium mb-2">{guideline.title}</h4>
            <p className="text-slate-300 text-sm mb-3">{guideline.description}</p>
            
            <ul className="space-y-1">
              {guideline.tips.map((tip, tipIndex) => (
                <li key={tipIndex} className="text-slate-400 text-xs flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}