"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  Github, 
  Star, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Figma,
  Palette,
  Code,
  Bot
} from "lucide-react"

export default function Header() {
  const [githubStars] = useState(1247)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Figma className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Figma2React
                </h1>
                <p className="text-xs text-muted-foreground">AI-Powered Converter</p>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <Card className="px-3 py-1 glass-card border-0">
                <div className="flex items-center space-x-2 text-sm">
                  <Bot className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">AI-Enhanced</span>
                </div>
              </Card>
              
              <Card className="px-3 py-1 glass-card border-0">
                <div className="flex items-center space-x-2 text-sm">
                  <Code className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">TypeScript</span>
                </div>
              </Card>
              
              <Card className="px-3 py-1 glass-card border-0">
                <div className="flex items-center space-x-2 text-sm">
                  <Palette className="w-4 h-4 text-purple-500" />
                  <span className="text-muted-foreground">Tailwind CSS</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="hidden sm:flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>v2.0</span>
            </Badge>

            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Github className="w-4 h-4 mr-2" />
              <span>{githubStars}</span>
              <Star className="w-3 h-3 ml-1" />
            </Button>

            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <span className="hidden sm:inline">Get Started</span>
              <ArrowRight className="w-4 h-4 sm:ml-2" />
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Ready</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <span>•</span>
                <span>Multi-provider AI support</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span>•</span>
                <span>Enterprise-grade security</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Pro Features
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}