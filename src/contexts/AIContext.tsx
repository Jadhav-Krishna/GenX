"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface AIContextType {
  queryAI: (query: string, options?: any) => Promise<string>
  isProcessing: boolean
  history: Array<{ query: string; response: string; timestamp: Date }>
  clearHistory: () => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export const useAI = () => {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error("useAI must be used within an AIProvider")
  }
  return context
}

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState<Array<{ query: string; response: string; timestamp: Date }>>([])

  const queryAI = async (query: string, options?: any): Promise<string> => {
    setIsProcessing(true)
    try {
      let response: string

      if (window.electronAPI?.geminiQuery) {
        response = await window.electronAPI.geminiQuery(query, options)
      } else {
        // Fallback intelligent response
        response = generateIntelligentResponse(query)
      }

      setHistory((prev) => [
        ...prev,
        {
          query,
          response,
          timestamp: new Date(),
        },
      ])

      return response
    } catch (error) {
      const errorMessage = `AI processing error: ${error instanceof Error ? error.message : "Unknown error"}`
      throw new Error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const generateIntelligentResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    // System information queries
    if (lowerQuery.includes("system") || lowerQuery.includes("computer") || lowerQuery.includes("machine")) {
      return "I can help you with system information, file operations, and application management. What would you like to know about your system?"
    }

    // File operations
    if (lowerQuery.includes("file") || lowerQuery.includes("folder") || lowerQuery.includes("directory")) {
      return "I can help you create, read, move, or delete files and folders. What file operation would you like to perform?"
    }

    // Application management
    if (lowerQuery.includes("open") || lowerQuery.includes("launch") || lowerQuery.includes("start")) {
      return "I can help you open applications and files. What would you like to open?"
    }

    // Time and date
    if (lowerQuery.includes("time") || lowerQuery.includes("date")) {
      const now = new Date()
      return `Current time is ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}`
    }

    // Weather (mock)
    if (lowerQuery.includes("weather")) {
      return "I don't have access to weather data yet, but I can help you open a weather website or application."
    }

    // Help and capabilities
    if (lowerQuery.includes("help") || lowerQuery.includes("what can you do")) {
      return `I'm GenX, your AI desktop assistant. I can help you with:
• System operations and monitoring
• File and folder management
• Opening applications
• Voice commands
• System information
• Command execution

Try asking me to "open calculator" or "show system info"!`
    }

    // Default responses
    const responses = [
      `I understand you're asking about "${query}". I'm GenX, your desktop AI assistant. I can help with system operations, file management, and application control.`,
      `Regarding "${query}" - I can assist with various desktop tasks. Would you like me to help with system information, file operations, or opening applications?`,
      `I'm processing your request about "${query}". As your AI agent, I can perform system operations, manage files, and control applications on your machine.`,
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const clearHistory = () => {
    setHistory([])
  }

  const value = {
    queryAI,
    isProcessing,
    history,
    clearHistory,
  }

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>
}
