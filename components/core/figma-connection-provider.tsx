"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface FigmaConnectionContextType {
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
}

const FigmaConnectionContext = createContext<FigmaConnectionContextType | undefined>(undefined)

export function FigmaConnectionProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(true) // Default to connected for demo

  return (
    <FigmaConnectionContext.Provider value={{ isConnected, setIsConnected }}>
      {children}
    </FigmaConnectionContext.Provider>
  )
}

export function useFigmaConnection() {
  const context = useContext(FigmaConnectionContext)
  if (context === undefined) {
    throw new Error("useFigmaConnection must be used within a FigmaConnectionProvider")
  }
  return context
}