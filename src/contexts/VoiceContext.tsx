"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"

interface VoiceCommand {
  command: string
  response: string
  timestamp: Date
}

interface VoiceContextType {
  isListening: boolean
  isSpeaking: boolean
  lastCommand: string | null
  commandHistory: VoiceCommand[]
  startListening: () => Promise<boolean>
  stopListening: () => Promise<boolean>
  speak: (text: string, options?: any) => Promise<boolean>
  stopSpeaking: () => Promise<boolean>
  clearHistory: () => void
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined)

export const useVoice = () => {
  const context = useContext(VoiceContext)
  if (!context) {
    throw new Error("useVoice must be used within a VoiceProvider")
  }
  return context
}

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([])

  useEffect(() => {
    // Listen for voice events from main process
    if (window.electronAPI) {
      window.electronAPI.onVoiceListeningStarted(() => {
        setIsListening(true)
      })

      window.electronAPI.onVoiceListeningStopped(() => {
        setIsListening(false)
      })

      window.electronAPI.onVoiceCommandProcessed((data) => {
        setLastCommand(data.command)
        setCommandHistory((prev) => [
          {
            command: data.command,
            response: data.response,
            timestamp: new Date(data.timestamp),
          },
          ...prev.slice(0, 9), // Keep last 10 commands
        ])
      })
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners("voice-listening-started")
        window.electronAPI.removeAllListeners("voice-listening-stopped")
        window.electronAPI.removeAllListeners("voice-command-processed")
      }
    }
  }, [])

  const startListening = useCallback(async (): Promise<boolean> => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.voiceStartListening()
        return result
      }
      return false
    } catch (error) {
      console.error("Failed to start listening:", error)
      return false
    }
  }, [])

  const stopListening = useCallback(async (): Promise<boolean> => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.voiceStopListening()
        return result
      }
      return false
    } catch (error) {
      console.error("Failed to stop listening:", error)
      return false
    }
  }, [])

  const speak = useCallback(async (text: string, options?: any): Promise<boolean> => {
    try {
      setIsSpeaking(true)
      if (window.electronAPI) {
        const result = await window.electronAPI.voiceSpeak(text, options)
        return result
      }
      return false
    } catch (error) {
      console.error("Failed to speak:", error)
      return false
    } finally {
      setIsSpeaking(false)
    }
  }, [])

  const stopSpeaking = useCallback(async (): Promise<boolean> => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.voiceStopSpeaking()
        setIsSpeaking(false)
        return result
      }
      return false
    } catch (error) {
      console.error("Failed to stop speaking:", error)
      return false
    }
  }, [])

  const clearHistory = useCallback(() => {
    setCommandHistory([])
    setLastCommand(null)
  }, [])

  const value = {
    isListening,
    isSpeaking,
    lastCommand,
    commandHistory,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearHistory,
  }

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
}
