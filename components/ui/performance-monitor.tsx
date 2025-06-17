"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Cpu, HardDrive } from "lucide-react"

export function PerformanceMonitorPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [metrics, setMetrics] = useState({
    memory: 0,
    cpu: 0,
    fps: 60
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        memory: Math.floor(Math.random() * 100),
        cpu: Math.floor(Math.random() * 100),
        fps: 60 - Math.floor(Math.random() * 10)
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setIsVisible(true)}
          className="w-8 h-8 bg-background/80 backdrop-blur-sm border border-border rounded-lg flex items-center justify-center hover:bg-background/90 transition-colors"
        >
          <Activity className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <Card className="w-64 p-3 glass-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Performance</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-3 h-3" />
              <span className="text-xs">Memory</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics.memory}%
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-3 h-3" />
              <span className="text-xs">CPU</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics.cpu}%
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-3 h-3" />
              <span className="text-xs">FPS</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics.fps}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}