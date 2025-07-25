import * as os from "os"
import dotenv from "dotenv"

dotenv.config()

export interface GeminiResponse {
  text: string
  command?: string
}

export class GeminiController {
  private apiKey = ""

  async initialize(): Promise<void> {
    // Load API key from environment or store
    this.apiKey = process.env.GEMINI_API_KEY || ""
    console.log("Gemini API key loaded:", this.apiKey)

    if (this.apiKey) {
      console.log("Gemini Controller initialized with API key")
    } else {
      console.log("Gemini Controller initialized without API key - will need manual setup")
    }
  }

  async setApiKey(apiKey: string): Promise<void> {
    this.apiKey = apiKey
    console.log("Gemini API key updated")
  }

  hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 10
  }

  async processCommand(userInput: string): Promise<GeminiResponse> {
    try {
      if (!this.hasApiKey()) {
        return {
          text: "Please configure your Gemini API key first. Go to Setup to add your key.",
        }
      }

      // Get system info
      const systemInfo = this.getSystemInfo()

      // Create prompt for Gemini
      const prompt = `You are GenX, a desktop AI assistant. The user is on ${systemInfo.platform} system.

User request: "${userInput}"

System Info:
- Platform: ${systemInfo.platform}
- Architecture: ${systemInfo.arch}
- CPU Cores: ${systemInfo.cpus}
- Total Memory: ${Math.round(systemInfo.totalMemory / (1024 * 1024 * 1024))}GB
- Username: ${systemInfo.username}

IMPORTANT: If the user wants to do something that requires a system command, provide ONLY the command to execute.

Platform-specific commands:
${
  systemInfo.platform === "win32"
    ? `
Windows Commands:
- Open calculator: calc
- Open notepad: notepad
- Show files: dir
- Show current time: echo %time%
- Show current date: date /t
- Create file: echo. > filename.txt
- Create folder: mkdir foldername
- Open browser: start chrome
- Open file explorer: explorer
`
    : systemInfo.platform === "darwin"
      ? `
macOS Commands:
- Open calculator: open -a Calculator
- Open text editor: open -a TextEdit
- Show files: ls -la
- Show current time: date
- Create file: touch filename.txt
- Create folder: mkdir foldername
- Open browser: open -a "Google Chrome"
- Open finder: open .
`
      : `
Linux Commands:
- Open calculator: gnome-calculator
- Open text editor: gedit
- Show files: ls -la
- Show current time: date
- Create file: touch filename.txt
- Create folder: mkdir foldername
- Open browser: firefox
- Open file manager: nautilus
`
}

Examples:
- User: "open calculator" → Response: "${systemInfo.platform === "win32" ? "calc" : systemInfo.platform === "darwin" ? "open -a Calculator" : "gnome-calculator"}"
- User: "show files" → Response: "${systemInfo.platform === "win32" ? "dir" : "ls -la"}"
- User: "what time is it" → Response: "${systemInfo.platform === "win32" ? "echo %time%" : "date"}"

If it's a question that doesn't need a command, just answer normally.

Respond with either:
1. Just the command if action is needed
2. A helpful answer if it's just a question`

      const response = await this.callGeminiAPI(prompt)

      // Check if response looks like a command
      const isCommand = this.looksLikeCommand(response, systemInfo.platform)

      return {
        text: response,
        command: isCommand ? response.trim() : undefined,
      }
    } catch (error) {
      console.error("Gemini processing error:", error)
      return {
        text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  private getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      username: os.userInfo().username,
    }
  }

  private looksLikeCommand(response: string, platform: string): boolean {
    const trimmed = response.trim()

    // Don't treat long responses as commands
    if (trimmed.length > 100 || trimmed.includes("\n")) {
      return false
    }

    // Common command patterns
    const commandPatterns = [
      /^[a-zA-Z0-9\-_.]+(\s+[^\n]*)?$/, // Simple command with args
      /^(dir|ls|cat|echo|touch|mkdir|cd|pwd|whoami|date|time)/i, // Common commands
      /^(calc|notepad|code|chrome|firefox|explorer|nautilus)/i, // Applications
      /^(open\s+-a|start\s+)/i, // Platform specific open commands
    ]

    // Windows specific
    if (platform === "win32") {
      if (/^(start|cmd|powershell|tasklist|systeminfo|echo\s+%)/i.test(trimmed)) return true
    }

    // macOS specific
    if (platform === "darwin") {
      if (/^(open|say|osascript)/i.test(trimmed)) return true
    }

    // Linux specific
    if (platform === "linux") {
      if (/^(gnome-|kde-|xdg-open)/i.test(trimmed)) return true
    }

    return commandPatterns.some((pattern) => pattern.test(trimmed))
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    try {
      console.log("Calling Gemini API...")

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 512,
            },
          }),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Gemini API error response:", errorText)
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!result) {
        throw new Error("No response from Gemini API")
      }

      console.log("Gemini API response:", result)
      return result.trim()
    } catch (error) {
      console.error("Gemini API call failed:", error)
      throw error
    }
  }
}
