"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface SystemInfo {
  platform: string
  arch: string
  cpus: number
  memory: {
    total: number
    free: number
    used: number
  }
  uptime: number
  hostname: string
  username: string
  homeDir: string
  tempDir: string
}

interface CommandResult {
  success: boolean
  output: string
  error?: string
  exitCode?: number
}

interface SystemContextType {
  systemInfo: SystemInfo | null
  isLoading: boolean
  executeCommand: (command: string, args?: string[]) => Promise<CommandResult>
  fileOperation: (operation: string, path: string, data?: any) => Promise<CommandResult>
  openApplication: (appName: string) => Promise<CommandResult>
  getRunningProcesses: () => Promise<CommandResult>
  killProcess: (processName: string) => Promise<CommandResult>
  getNetworkInfo: () => Promise<CommandResult>
  getDiskUsage: () => Promise<CommandResult>
  refreshSystemInfo: () => Promise<void>
}

const SystemContext = createContext<SystemContextType | undefined>(undefined)

export const useSystem = () => {
  const context = useContext(SystemContext)
  if (!context) {
    throw new Error("useSystem must be used within a SystemProvider")
  }
  return context
}

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    refreshSystemInfo()

    // Refresh system info every 30 seconds
    const interval = setInterval(refreshSystemInfo, 30000)
    return () => clearInterval(interval)
  }, [])

  const refreshSystemInfo = async () => {
    try {
      setIsLoading(true)
      if (window.electronAPI) {
        const info = await window.electronAPI.systemGetInfo()
        setSystemInfo(info)
      }
    } catch (error) {
      console.error("Failed to get system info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const executeCommand = async (command: string, args?: string[]): Promise<CommandResult> => {
    try {
      if (window.electronAPI) {
        return await window.electronAPI.systemExecute(command, args)
      }
      throw new Error("System API not available")
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  const fileOperation = async (operation: string, path: string, data?: any): Promise<CommandResult> => {
    try {
      if (window.electronAPI) {
        return await window.electronAPI.systemFileOperation(operation, path, data)
      }
      throw new Error("System API not available")
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  const openApplication = async (appName: string): Promise<CommandResult> => {
    const platform = systemInfo?.platform || process.platform
    let command: string
    let args: string[] = []

    switch (platform) {
      case "win32":
        command = "start"
        args = ["", appName]
        break
      case "darwin":
        command = "open"
        args = ["-a", appName]
        break
      case "linux":
        command = appName.toLowerCase()
        break
      default:
        return {
          success: false,
          output: "",
          error: "Unsupported platform",
        }
    }

    return await executeCommand(command, args)
  }

  const getRunningProcesses = async (): Promise<CommandResult> => {
    const platform = systemInfo?.platform || process.platform
    const command = platform === "win32" ? "tasklist" : "ps aux"
    return await executeCommand(command)
  }

  const killProcess = async (processName: string): Promise<CommandResult> => {
    const platform = systemInfo?.platform || process.platform
    const command = platform === "win32" ? "taskkill" : "pkill"
    const args = platform === "win32" ? ["/F", "/IM", processName] : [processName]
    return await executeCommand(command, args)
  }

  const getNetworkInfo = async (): Promise<CommandResult> => {
    const platform = systemInfo?.platform || process.platform
    const command = platform === "win32" ? "ipconfig" : "ifconfig"
    return await executeCommand(command)
  }

  const getDiskUsage = async (): Promise<CommandResult> => {
    const platform = systemInfo?.platform || process.platform
    const command = platform === "win32" ? "dir" : "df -h"
    return await executeCommand(command)
  }

  const value = {
    systemInfo,
    isLoading,
    executeCommand,
    fileOperation,
    openApplication,
    getRunningProcesses,
    killProcess,
    getNetworkInfo,
    getDiskUsage,
    refreshSystemInfo,
  }

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
}
