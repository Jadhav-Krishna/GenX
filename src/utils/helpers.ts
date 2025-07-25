import { APP_CONFIG } from "../config/constants"

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = APP_CONFIG.ui.debounceDelay,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const sanitizeCommand = (command: string): string => {
  // Remove potentially dangerous characters
  return command.replace(/[;&|`$(){}[\]]/g, "").trim()
}

export const isValidApiKey = (apiKey: string): boolean => {
  // Basic validation for Gemini API key format
  return /^[A-Za-z0-9_-]{39}$/.test(apiKey)
}

export const getSystemIcon = (platform: string): string => {
  switch (platform) {
    case "win32":
      return "🪟"
    case "darwin":
      return "🍎"
    case "linux":
      return "🐧"
    default:
      return "💻"
  }
}

export const getPlatformName = (platform: string): string => {
  switch (platform) {
    case "win32":
      return "Windows"
    case "darwin":
      return "macOS"
    case "linux":
      return "Linux"
    default:
      return "Unknown"
  }
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}

export const downloadFile = (content: string, filename: string, contentType = "text/plain"): void => {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const parseVoiceCommand = (command: string): { action: string; target?: string; params?: string[] } => {
  const words = command.toLowerCase().split(" ")
  const action = words[0]
  const target = words[1]
  const params = words.slice(2)

  return { action, target, params }
}

export const isSystemCommand = (command: string): boolean => {
  const lowerCommand = command.toLowerCase()
  return APP_CONFIG.voice.systemCommands?.some((keyword) => lowerCommand.includes(keyword)) || false
}

export const extractAppName = (command: string, platform: string): string | null => {
  const lowerCommand = command.toLowerCase()
  const systemApps = (APP_CONFIG as any).systemApps?.[platform] || {}

  for (const [keyword, appName] of Object.entries(systemApps)) {
    if (lowerCommand.includes(keyword)) {
      return appName as string
    }
  }

  return null
}
