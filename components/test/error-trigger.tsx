"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Zap, Bug } from "lucide-react"

interface ErrorTriggerProps {
  onError?: (error: Error) => void
}

export function ErrorTrigger({ onError }: ErrorTriggerProps) {
  const [shouldThrow, setShouldThrow] = useState(false)

  const triggerSyncError = () => {
    setShouldThrow(true)
  }

  const triggerAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Simulated async error"))
        }, 1000)
      })
    } catch (error) {
      onError?.(error as Error)
    }
  }

  if (shouldThrow) {
    throw new Error("This is a test error triggered by the Error Trigger component")
  }

  return (
    <Card className="max-w-md mx-auto border-orange-500/20 bg-orange-500/5">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bug className="w-5 h-5 text-orange-500" />
          <CardTitle className="text-orange-900 dark:text-orange-100">
            Error Testing
          </CardTitle>
        </div>
        <CardDescription>
          Test the error boundary system with different types of errors
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Badge variant="secondary">Test Environment</Badge>
          <Badge variant="outline">Safe to Use</Badge>
        </div>

        <div className="space-y-2">
          <Button
            onClick={triggerSyncError}
            variant="destructive"
            className="w-full"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Trigger Sync Error
          </Button>

          <Button
            onClick={triggerAsyncError}
            variant="outline"
            className="w-full border-orange-500/20 text-orange-700 hover:bg-orange-500/10 dark:text-orange-300"
          >
            <Zap className="w-4 h-4 mr-2" />
            Trigger Async Error
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          These buttons will trigger test errors to demonstrate the error boundary functionality.
        </p>
      </CardContent>
    </Card>
  )
}