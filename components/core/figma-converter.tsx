"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Library, Wand2, Settings, Zap, Download, Github, Figma, Bot, Sparkles } from "lucide-react"

interface OutputData {
  figmaData?: any
  jsx: string
  css: string
  figmaCss: string
  figmaUrl: string
}

export default function FigmaConverter() {
  const [output, setOutput] = useState<OutputData | null>(null)
  const [showOutput, setShowOutput] = useState(false)
  const [activeTab, setActiveTab] = useState<"figma" | "converter" | "ai-generator" | "templates" | "settings">("figma")

  const handleReset = () => {
    setOutput(null)
    setShowOutput(false)
    setActiveTab("figma")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 py-8">
      {showOutput && output ? (
        <div className="w-full max-w-7xl space-y-6">
          {/* Success Message */}
          <Card className="glass-card border-green-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-green-400">🎉 Component Ready!</CardTitle>
                    <CardDescription>Your Figma design has been successfully converted to React</CardDescription>
                  </div>
                </div>
                <Button onClick={handleReset} variant="outline">
                  New Conversion
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Output Display */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Generated Component</CardTitle>
              <CardDescription>React component with TypeScript and Tailwind CSS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">JSX Code</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm overflow-auto max-h-64">
                    {output.jsx || "// JSX code will appear here"}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">CSS Styles</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-blue-400 font-mono text-sm overflow-auto max-h-64">
                    {output.css || "/* CSS styles will appear here */"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="w-full max-w-7xl">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-4xl grid-cols-5 glass-card">
                <TabsTrigger value="figma" className="flex items-center gap-2">
                  <Figma className="w-4 h-4" />
                  Figma Import
                </TabsTrigger>
                <TabsTrigger value="ai-generator" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Generator
                </TabsTrigger>
                <TabsTrigger value="converter" className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Manual Convert
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <Library className="w-4 h-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  AI Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="figma" className="mt-0">
              <Card className="glass-card max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Figma className="w-6 h-6 text-purple-500" />
                    Import from Figma
                  </CardTitle>
                  <CardDescription>
                    Paste your Figma design URL to automatically convert it to React
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label htmlFor="figma-url" className="block text-sm font-medium mb-2">
                      Figma URL
                    </label>
                    <input
                      id="figma-url"
                      type="text"
                      placeholder="https://www.figma.com/file/..."
                      className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      data-tour="figma-url-input"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Figma API Connected</span>
                    </div>
                    <Badge variant="secondary">Ready</Badge>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => {
                      // Demo conversion
                      setOutput({
                        jsx: `export default function Button() {\n  return (\n    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">\n      Click me\n    </button>\n  )\n}`,
                        css: `.button {\n  padding: 0.5rem 1rem;\n  background-color: #3b82f6;\n  color: white;\n  border-radius: 0.5rem;\n}\n\n.button:hover {\n  background-color: #2563eb;\n}`,
                        figmaCss: "",
                        figmaUrl: "https://www.figma.com/file/demo",
                        figmaData: { name: "Demo Button" }
                      })
                      setShowOutput(true)
                    }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Convert to React
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-generator" className="mt-0">
              <Card className="glass-card max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Bot className="w-6 h-6 text-blue-500" />
                    AI Component Generator
                  </CardTitle>
                  <CardDescription>
                    Describe the component you want and let AI create it for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label htmlFor="component-description" className="block text-sm font-medium mb-2">
                      Component Description
                    </label>
                    <textarea
                      id="component-description"
                      placeholder="Create a modern card component with a title, description, and action button..."
                      rows={4}
                      className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Framework</label>
                      <select className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>React</option>
                        <option>Next.js</option>
                        <option>Vue</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Styling</label>
                      <select className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Tailwind CSS</option>
                        <option>CSS Modules</option>
                        <option>Styled Components</option>
                      </select>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="converter" className="mt-0">
              <Card className="glass-card max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle>Manual Converter</CardTitle>
                  <CardDescription>
                    Step-by-step guided conversion process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Wand2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Manual converter wizard coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <Card className="glass-card max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle>Component Templates</CardTitle>
                  <CardDescription>
                    Pre-built components ready to use
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Library className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Template library coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card className="glass-card max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle>AI Provider Settings</CardTitle>
                  <CardDescription>
                    Configure your AI providers and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">AI settings panel coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}