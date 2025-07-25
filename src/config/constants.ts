export const APP_CONFIG = {
  name: "GenX AI Agent",
  version: "1.0.0",
  description: "Your Personal Desktop Assistant with Real AI Integration",
  author: "Krishna",

  // Voice settings
  voice: {
    defaultLanguage: "en-US",
    defaultHotkey: "CommandOrControl+Shift+G",
    recognitionTimeout: 30000,
    speechRate: 1.0,
    speechPitch: 1.0,
    speechVolume: 1.0,
  },

  // AI settings
  ai: {
    geminiModel: "gemini-pro",
    maxTokens: 2048,
    temperature: 0.7,
    timeout: 30000,
  },

  // System settings
  system: {
    refreshInterval: 5000,
    commandTimeout: 30000,
    maxHistoryItems: 100,
  },

  // UI settings
  ui: {
    animationDuration: 0.3,
    debounceDelay: 300,
    toastDuration: 3000,
  },

  // Security settings
  security: {
    allowFileOperations: true,
    allowSystemCommands: true,
    allowNetworkAccess: true,
    encryptStorage: true,
  },
}

export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

export const VOICE_COMMANDS = {
  WAKE_WORDS: ["genx", "hey genx", "computer"],
  SYSTEM_COMMANDS: [
    "open",
    "launch",
    "start",
    "run",
    "execute",
    "create",
    "make",
    "new",
    "file",
    "folder",
    "delete",
    "remove",
    "move",
    "copy",
    "shutdown",
    "restart",
    "sleep",
    "volume",
    "brightness",
    "wifi",
  ],
  QUERY_COMMANDS: ["what", "how", "when", "where", "why", "tell me", "show me", "explain", "help"],
}

export const SYSTEM_APPS = {
  windows: {
    calculator: "calc",
    notepad: "notepad",
    browser: "msedge",
    chrome: "chrome",
    firefox: "firefox",
    vscode: "code",
    terminal: "cmd",
    explorer: "explorer",
    taskmanager: "taskmgr",
  },
  darwin: {
    calculator: "Calculator",
    notepad: "TextEdit",
    browser: "Safari",
    chrome: "Google Chrome",
    firefox: "Firefox",
    vscode: "Visual Studio Code",
    terminal: "Terminal",
    finder: "Finder",
    activitymonitor: "Activity Monitor",
  },
  linux: {
    calculator: "gnome-calculator",
    notepad: "gedit",
    browser: "firefox",
    chrome: "google-chrome",
    firefox: "firefox",
    vscode: "code",
    terminal: "gnome-terminal",
    filemanager: "nautilus",
    systemmonitor: "gnome-system-monitor",
  },
}
