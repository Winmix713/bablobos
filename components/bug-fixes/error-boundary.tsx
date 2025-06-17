"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, RefreshCw, Bug, Copy, Check } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  copied: boolean
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      copied: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Error Boundary Caught an Error")
      console.error("Error:", error)
      console.error("Error Info:", errorInfo)
      console.groupEnd()
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      copied: false,
    })
  }

  handleCopyError = async () => {
    const { error, errorInfo, errorId } = this.state
    const errorReport = `
Error ID: ${errorId}
Time: ${new Date().toISOString()}
Message: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
    `.trim()

    try {
      await navigator.clipboard.writeText(errorReport)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    } catch (err) {
      console.error("Failed to copy error report:", err)
    }
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-lg border-red-500/20 bg-red-500/5">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/10 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-red-900 dark:text-red-100">
                    Something went wrong
                  </CardTitle>
                  <CardDescription>
                    An unexpected error occurred while rendering this component
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="destructive" className="font-mono text-xs">
                  {this.state.errorId}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={this.handleCopyError}
                  className="h-6 px-2 text-xs"
                >
                  {this.state.copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="p-3 bg-red-950/50 border border-red-500/20 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center space-x-2">
                    <Bug className="w-4 h-4" />
                    <span>Error Details (Development)</span>
                  </h4>
                  <div className="text-xs font-mono text-red-300 space-y-1">
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-red-400 hover:text-red-300">
                          Stack Trace
                        </summary>
                        <pre className="mt-1 text-xs text-red-300/80 whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex-1 border-red-500/20 text-red-700 hover:bg-red-500/10 dark:text-red-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="destructive"
                  className="flex-1"
                >
                  Reload Page
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                If this error persists, please contact support with the error ID above.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}