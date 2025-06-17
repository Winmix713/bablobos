"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Info, X, Bell } from "lucide-react"

export interface Notification {
  id: string
  type: "success" | "warning" | "info" | "error"
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
  persistent?: boolean
  timestamp: number
}

interface SmartNotificationsProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  onDismissAll: () => void
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  maxVisible?: number
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    case "error":
      return <AlertTriangle className="w-5 h-5 text-red-500" />
    case "info":
    default:
      return <Info className="w-5 h-5 text-blue-500" />
  }
}

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return "border-green-500/20 bg-green-500/10"
    case "warning":
      return "border-yellow-500/20 bg-yellow-500/10"
    case "error":
      return "border-red-500/20 bg-red-500/10"
    case "info":
    default:
      return "border-blue-500/20 bg-blue-500/10"
  }
}

export function SmartNotifications({
  notifications,
  onDismiss,
  onDismissAll,
  position = "top-right",
  maxVisible = 3,
}: SmartNotificationsProps) {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  }

  const visibleNotifications = notifications.slice(0, maxVisible)
  const hasMore = notifications.length > maxVisible

  if (notifications.length === 0) return null

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-2 w-96`}>
      {hasMore && (
        <Card className="glass-card">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="text-sm">
                +{notifications.length - maxVisible} more notifications
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismissAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </CardContent>
        </Card>
      )}

      {visibleNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={`glass-card ${getNotificationColor(notification.type)} animate-in slide-in-from-right duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold truncate">
                    {notification.title}
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDismiss(notification.id)}
                    className="h-6 w-6 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                {notification.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={notification.action.onClick}
                    className="mt-2"
                  >
                    {notification.action.label}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function useSmartNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Auto-dismiss non-persistent notifications
    if (!notification.persistent) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, notification.duration || 5000)
    }
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Predefined notification types
  const success = useCallback((title: string, message: string, action?: Notification["action"]) => {
    const notification: Omit<Notification, "id" | "timestamp"> = { type: "success", title, message }
    if (action) notification.action = action
    addNotification(notification)
  }, [addNotification])

  const error = useCallback((title: string, message: string, action?: Notification["action"]) => {
    const notification: Omit<Notification, "id" | "timestamp"> = { type: "error", title, message, persistent: true }
    if (action) notification.action = action
    addNotification(notification)
  }, [addNotification])

  const warning = useCallback((title: string, message: string, action?: Notification["action"]) => {
    const notification: Omit<Notification, "id" | "timestamp"> = { type: "warning", title, message }
    if (action) notification.action = action
    addNotification(notification)
  }, [addNotification])

  const info = useCallback((title: string, message: string, action?: Notification["action"]) => {
    const notification: Omit<Notification, "id" | "timestamp"> = { type: "info", title, message }
    if (action) notification.action = action
    addNotification(notification)
  }, [addNotification])

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAll,
    success,
    error,
    warning,
    info,
  }
}