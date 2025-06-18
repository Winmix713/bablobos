'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Download, 
  Eye, 
  Star, 
  Search, 
  Filter,
  Code,
  Smartphone,
  Monitor,
  ShoppingBag,
  Users,
  BarChart3,
  FileText,
  Settings,
  Heart
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  preview: string;
  downloads: number;
  rating: number;
  framework: 'react' | 'vue' | 'svelte';
  featured: boolean;
}

export function TemplatesTab() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);

  const templates: Template[] = [
    {
      id: '1',
      name: 'Dashboard Card',
      description: 'Modern dashboard card with statistics and charts',
      category: 'dashboard',
      tags: ['statistics', 'charts', 'analytics'],
      preview: '/api/placeholder/400/250',
      downloads: 1234,
      rating: 4.8,
      framework: 'react',
      featured: true
    },
    {
      id: '2',
      name: 'Product Card',
      description: 'E-commerce product card with image, price, and actions',
      category: 'ecommerce',
      tags: ['product', 'shopping', 'card'],
      preview: '/api/placeholder/400/250',
      downloads: 2156,
      rating: 4.9,
      framework: 'react',
      featured: true
    },
    {
      id: '3',
      name: 'User Profile',
      description: 'Complete user profile component with avatar and info',
      category: 'profile',
      tags: ['user', 'avatar', 'profile'],
      preview: '/api/placeholder/400/250',
      downloads: 876,
      rating: 4.7,
      framework: 'vue',
      featured: false
    },
    {
      id: '4',
      name: 'Navigation Menu',
      description: 'Responsive navigation menu with dropdown support',
      category: 'navigation',
      tags: ['menu', 'navigation', 'responsive'],
      preview: '/api/placeholder/400/250',
      downloads: 3421,
      rating: 4.6,
      framework: 'react',
      featured: true
    },
    {
      id: '5',
      name: 'Contact Form',
      description: 'Contact form with validation and success states',
      category: 'forms',
      tags: ['form', 'contact', 'validation'],
      preview: '/api/placeholder/400/250',
      downloads: 1543,
      rating: 4.5,
      framework: 'svelte',
      featured: false
    },
    {
      id: '6',
      name: 'Pricing Table',
      description: 'Pricing table with featured plan highlighting',
      category: 'pricing',
      tags: ['pricing', 'table', 'plans'],
      preview: '/api/placeholder/400/250',
      downloads: 987,
      rating: 4.4,
      framework: 'react',
      featured: false
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories', icon: Layers },
    { value: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { value: 'ecommerce', label: 'E-commerce', icon: ShoppingBag },
    { value: 'profile', label: 'Profile', icon: Users },
    { value: 'navigation', label: 'Navigation', icon: Monitor },
    { value: 'forms', label: 'Forms', icon: FileText },
    { value: 'pricing', label: 'Pricing', icon: Settings }
  ];

  const filteredTemplates = templates.filter(template => {
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
    const frameworkMatch = selectedFramework === 'all' || template.framework === selectedFramework;
    const searchMatch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && frameworkMatch && searchMatch;
  });

  const toggleFavorite = (templateId: string) => {
    setFavoriteTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Component Templates</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Pre-built, production-ready component templates to accelerate your development workflow.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Frameworks</option>
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="svelte">Svelte</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-slate-300">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Templates */}
      {selectedCategory === 'all' && (
        <FeaturedTemplates 
          templates={templates.filter(t => t.featured)} 
          onToggleFavorite={toggleFavorite}
          favoriteTemplates={favoriteTemplates}
        />
      )}

      {/* Template Grid */}
      <TemplateGrid 
        templates={filteredTemplates}
        onToggleFavorite={toggleFavorite}
        favoriteTemplates={favoriteTemplates}
      />

      {/* Template Categories Overview */}
      <TemplateStats templates={templates} />
    </div>
  );
}

function FeaturedTemplates({ 
  templates, 
  onToggleFavorite, 
  favoriteTemplates 
}: {
  templates: Template[];
  onToggleFavorite: (id: string) => void;
  favoriteTemplates: string[];
}) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Star className="w-5 h-5 mr-2 text-yellow-400" />
        Featured Templates
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favoriteTemplates.includes(template.id)}
            size="large"
          />
        ))}
      </div>
    </div>
  );
}

function TemplateGrid({ 
  templates, 
  onToggleFavorite, 
  favoriteTemplates 
}: {
  templates: Template[];
  onToggleFavorite: (id: string) => void;
  favoriteTemplates: string[];
}) {
  if (templates.length === 0) {
    return (
      <div className="glass-card p-12 rounded-xl text-center">
        <Layers className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Templates Found</h3>
        <p className="text-slate-300">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6">All Templates</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favoriteTemplates.includes(template.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({ 
  template, 
  onToggleFavorite, 
  isFavorite, 
  size = 'normal' 
}: {
  template: Template;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  size?: 'normal' | 'large';
}) {
  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'react': return 'bg-blue-500';
      case 'vue': return 'bg-green-500';
      case 'svelte': return 'bg-orange-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-all group"
    >
      {/* Preview Image */}
      <div className="relative aspect-video bg-slate-700">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <Code className="w-12 h-12 text-white/50" />
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(template.id)}
          className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-400 fill-current' : 'text-white'}`} />
        </button>

        {/* Framework Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 ${getFrameworkColor(template.framework)} rounded text-white text-xs font-medium`}>
          {template.framework}
        </div>

        {/* Featured Badge */}
        {template.featured && (
          <div className="absolute bottom-3 left-3 flex items-center px-2 py-1 bg-yellow-500 rounded text-black text-xs font-medium">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors">
          {template.name}
        </h4>
        <p className="text-slate-300 text-sm mb-3 line-clamp-2">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-yellow-400">
              <Star className="w-3 h-3 mr-1" />
              {template.rating}
            </div>
            <div className="text-slate-400">
              {template.downloads.toLocaleString()} downloads
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 mt-4">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center">
            <Download className="w-3 h-3 mr-1" />
            Use Template
          </button>
          <button className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded transition-colors">
            <Eye className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function TemplateStats({ templates }: { templates: Template[] }) {
  const stats = [
    {
      label: 'Total Templates',
      value: templates.length,
      icon: Layers,
      color: 'text-blue-400'
    },
    {
      label: 'Featured',
      value: templates.filter(t => t.featured).length,
      icon: Star,
      color: 'text-yellow-400'
    },
    {
      label: 'Total Downloads',
      value: templates.reduce((sum, t) => sum + t.downloads, 0).toLocaleString(),
      icon: Download,
      color: 'text-green-400'
    },
    {
      label: 'Avg Rating',
      value: (templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1),
      icon: Heart,
      color: 'text-red-400'
    }
  ];

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6 text-center">Template Library Stats</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className={`${stat.color} mb-2`}>
              <stat.icon className="w-8 h-8 mx-auto" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-300">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}