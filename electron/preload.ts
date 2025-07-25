import { contextBridge, ipcRenderer } from "electron"

// Define the API interface
interface ElectronAPI {
  // Window controls
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  isMaximized: () => Promise<boolean>

  // Store operations
  storeGet: (key: string) => Promise<any>
  storeSet: (key: string, value: any) => Promise<boolean>
  storeDelete: (key: string) => Promise<boolean>

  // Google OAuth
  googleOAuth: () => Promise<any>
  refreshToken: (refreshToken: string) => Promise<any>
  logout: (accessToken: string) => Promise<boolean>

  // AI Integration
  geminiQuery: (query: string, options?: any) => Promise<any>

  // System Operations
  systemExecute: (command: string, args?: string[]) => Promise<any>
  systemFileOperation: (operation: string, path: string, data?: any) => Promise<any>
  systemGetInfo: () => Promise<any>

  // Voice Control
  voiceStartListening: () => Promise<boolean>
  voiceStopListening: () => Promise<boolean>
  voiceSpeak: (text: string, options?: any) => Promise<boolean>
  voiceStopSpeaking: () => Promise<boolean>

  // Configuration
  configSetGeminiKey: (apiKey: string) => Promise<boolean>
  configGetSettings: () => Promise<any>
  configUpdateSettings: (settings: any) => Promise<boolean>

  // System info
  getSystemInfo: () => Promise<any>
  getAppVersion: () => Promise<string>

  // Event listeners
  onVoiceListeningStarted: (callback: () => void) => void
  onVoiceListeningStopped: (callback: () => void) => void
  onVoiceCommandProcessed: (callback: (data: any) => void) => void

  // Remove event listeners
  removeAllListeners: (channel: string) => void
}

// Create the API object
const electronAPI: ElectronAPI = {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke("window-minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window-maximize"),
  closeWindow: () => ipcRenderer.invoke("window-close"),
  isMaximized: () => ipcRenderer.invoke("window-is-maximized"),

  // Store operations
  storeGet: (key: string) => ipcRenderer.invoke("store-get", key),
  storeSet: (key: string, value: any) => ipcRenderer.invoke("store-set", key, value),
  storeDelete: (key: string) => ipcRenderer.invoke("store-delete", key),

  // Google OAuth
  googleOAuth: () => ipcRenderer.invoke("google-oauth"),
  refreshToken: (refreshToken: string) => ipcRenderer.invoke("refresh-token", refreshToken),
  logout: (accessToken: string) => ipcRenderer.invoke("logout", accessToken),

  // AI Integration
  geminiQuery: (query: string, options?: any) => ipcRenderer.invoke("gemini-query", query, options),

  // System Operations
  systemExecute: (command: string, args?: string[]) => ipcRenderer.invoke("system-execute", command, args),
  systemFileOperation: (operation: string, path: string, data?: any) =>
    ipcRenderer.invoke("system-file-operation", operation, path, data),
  systemGetInfo: () => ipcRenderer.invoke("system-get-info"),

  // Voice Control
  voiceStartListening: () => ipcRenderer.invoke("voice-start-listening"),
  voiceStopListening: () => ipcRenderer.invoke("voice-stop-listening"),
  voiceSpeak: (text: string, options?: any) => ipcRenderer.invoke("voice-speak", text, options),
  voiceStopSpeaking: () => ipcRenderer.invoke("voice-stop-speaking"),

  // Configuration
  configSetGeminiKey: (apiKey: string) => ipcRenderer.invoke("config-set-gemini-key", apiKey),
  configGetSettings: () => ipcRenderer.invoke("config-get-settings"),
  configUpdateSettings: (settings: any) => ipcRenderer.invoke("config-update-settings", settings),

  // System info
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Event listeners
  onVoiceListeningStarted: (callback: () => void) => {
    ipcRenderer.on("voice-listening-started", callback)
  },
  onVoiceListeningStopped: (callback: () => void) => {
    ipcRenderer.on("voice-listening-stopped", callback)
  },
  onVoiceCommandProcessed: (callback: (data: any) => void) => {
    ipcRenderer.on("voice-command-processed", (event, data) => callback(data))
  },

  // Remove event listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", electronAPI)

// Export the type for use in renderer
export type { ElectronAPI }
