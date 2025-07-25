export const cyberpunkTheme = {
  colors: {
    background: "#0a0a0a",
    surface: "#1a1a1a",
    border: "#333333",
    text: "#ffffff",
    textSecondary: "#888888",
    accent: "#ff6b35",
    accentHover: "#00cccc",
    success: "#00ff88",
    warning: "#ffaa00",
    error: "#ff4444",
  },
  fonts: {
    mono: '"Courier New", monospace',
    sans: '"Arial", sans-serif',
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
  },
  shadows: {
    glow: "0 0 10px rgba(0, 255, 255, 0.3)",
    glowStrong: "0 0 20px rgba(0, 255, 255, 0.5)",
  },
}

export type Theme = typeof cyberpunkTheme
