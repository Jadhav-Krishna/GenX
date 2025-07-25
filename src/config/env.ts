// Environment configuration helper
export const env = {
  // App info
  APP_NAME: import.meta.env.VITE_APP_NAME || "GenX Tactical Operations",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "2.1.7",
  NODE_ENV: import.meta.env.NODE_ENV || "development",

  // Development flags
  IS_DEV: import.meta.env.NODE_ENV === "development",
  ENABLE_DEV_TOOLS: import.meta.env.VITE_ENABLE_DEV_TOOLS === "true",

  // Mock data settings
  ENABLE_MOCK_AUTH: import.meta.env.VITE_ENABLE_MOCK_AUTH === "false",
  ENABLE_MOCK_AI: import.meta.env.VITE_ENABLE_MOCK_AI === "false",
  ENABLE_MOCK_AGENTS: import.meta.env.VITE_ENABLE_MOCK_AGENTS === "false",
  MOCK_AGENT_COUNT: Number.parseInt(import.meta.env.VITE_MOCK_AGENT_COUNT || "847"),
  MOCK_MISSION_COUNT: Number.parseInt(import.meta.env.VITE_MOCK_MISSION_COUNT || "23"),

  // Theme customization
  THEME: {
    ACCENT_COLOR: import.meta.env.VITE_THEME_ACCENT_COLOR || "#00ffff",
    SUCCESS_COLOR: import.meta.env.VITE_THEME_SUCCESS_COLOR || "#00ff88",
    WARNING_COLOR: import.meta.env.VITE_THEME_WARNING_COLOR || "#ffaa00",
    ERROR_COLOR: import.meta.env.VITE_THEME_ERROR_COLOR || "#ff4444",
    BACKGROUND_COLOR: import.meta.env.VITE_THEME_BACKGROUND_COLOR || "#0a0a0a",
  },

  // Voice settings
  SPEECH: {
    LANG: import.meta.env.VITE_SPEECH_LANG || "en-US",
    CONTINUOUS: import.meta.env.VITE_SPEECH_CONTINUOUS === "true",
    INTERIM_RESULTS: import.meta.env.VITE_SPEECH_INTERIM_RESULTS === "true",
  },

  // API endpoints (for future use)
  API: {
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  },
}

// Type-safe environment checker
export const checkRequiredEnvVars = () => {
  const required = []

  // Add required environment variables here
  // if (!env.API.GOOGLE_CLIENT_ID) required.push('VITE_GOOGLE_CLIENT_ID')
  // if (!env.API.GEMINI_API_KEY) required.push('VITE_GEMINI_API_KEY')

  if (required.length > 0) {
    console.warn("Missing required environment variables:", required)
  }

  return required.length === 0
}
