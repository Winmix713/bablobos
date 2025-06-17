"use client"

import { useFigmaConnection } from "./figma-connection-provider"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

export function FigmaStatusToast() {
  const { isConnected } = useFigmaConnection()

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className="flex items-center space-x-2 px-3 py-2"
      >
        {isConnected ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Figma Connected</span>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4" />
            <span>Figma Disconnected</span>
          </>
        )}
      </Badge>
    </div>
  )
}