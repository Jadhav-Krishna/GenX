import { app, BrowserWindow, ipcMain, session, shell, Menu, globalShortcut, Notification } from "electron"
import { join } from "path"
import Store from "electron-store"
import { SystemController } from "./system-controller"
import { VoiceController } from "./voice-controller"
import { GeminiController } from "./gemini-controller"
import { GoogleOAuthHandler, type OAuthConfig } from "./oauth"

app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('disable-frame-rate-limit');

// Initialize store
const store = new Store({
  name: "genx-config",
  defaults: {
    windowBounds: { width: 1400, height: 900 },
    theme: "cyberpunk",
    voiceEnabled: true,
    hotkey: "CommandOrControl+Shift+G",
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    googleAuth: null,
  },
})

class GenXApp {
  private mainWindow: BrowserWindow | null = null
  private isDev: boolean = process.env.NODE_ENV === "development"
  private systemController: SystemController
  private voiceController: VoiceController
  private geminiController: GeminiController
  private googleOAuth: GoogleOAuthHandler | null = null
  private isListening = false

  constructor() {
    this.systemController = new SystemController()
    this.voiceController = new VoiceController()
    this.geminiController = new GeminiController()
    this.initializeOAuth()
    this.initializeApp()
  }

  private initializeOAuth(): void {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/callback"

    if (clientId && clientSecret) {
      const oauthConfig: OAuthConfig = {
        clientId,
        clientSecret,
        redirectUri,
        scopes: ["openid", "profile", "email"],
      }
      this.googleOAuth = new GoogleOAuthHandler(oauthConfig)
      console.log("Google OAuth initialized")
    } else {
      console.log("Google OAuth not configured - using mock auth")
    }
  }

  private initializeApp(): void {
    // Set app user model ID for Windows
    if (process.platform === "win32") {
      app.setAppUserModelId("com.genx.app")
    }

    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow()
      this.setupSecurity()
      this.setupIPC()
      this.setupMenu()
      this.setupGlobalShortcuts()
      this.initializeControllers()

      // Handle app activation (macOS)
      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow()
        }
      })
    })

    // Quit when all windows are closed
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit()
      }
    })

    // Cleanup on quit
    app.on("before-quit", () => {
      globalShortcut.unregisterAll()
      this.voiceController.cleanup()
      this.systemController.cleanup()
    })
  }

  private createMainWindow(): void {
    const savedBounds = store.get("windowBounds") as { width: number; height: number }

    this.mainWindow = new BrowserWindow({
      width: savedBounds.width,
      height: savedBounds.height,
      minWidth: 1200,
      minHeight: 800,
      frame: false,
      titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
      backgroundColor: "#0a0a0a",
      show: false,
      icon: this.getIconPath(),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: join(__dirname, "preload.js"),
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        spellcheck: false,
        devTools: this.isDev,
      },
    })

    // Load the React app
    if (this.isDev) {
      this.mainWindow.loadURL("http://localhost:5173")
      this.mainWindow.webContents.openDevTools({ mode: "detach" })
    } else {
      this.mainWindow.loadFile(join(__dirname, "../dist/index.html"))
    }

    // Show window when ready
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow?.show()
      if (this.isDev) {
        this.mainWindow?.focus()
      }
    })

    // Save window bounds on resize
    this.mainWindow.on("resize", () => {
      if (this.mainWindow) {
        const bounds = this.mainWindow.getBounds()
        store.set("windowBounds", { width: bounds.width, height: bounds.height })
      }
    })

    // Handle window closed
    this.mainWindow.on("closed", () => {
      this.mainWindow = null
    })

    // Prevent external navigation
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: "deny" }
    })
  }

  private getIconPath(): string {
    const iconName =
      process.platform === "win32" ? "icon.ico" : process.platform === "darwin" ? "icon.icns" : "icon.png"

    if (this.isDev) {
      return join(process.cwd(), "assets", iconName)
    } else {
      return join(process.resourcesPath, "assets", iconName)
    }
  }

  private setupSecurity(): void {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://generativelanguage.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com; " +
              "img-src 'self' data: https: blob:; " +
              "media-src 'self' data: blob:; " +
              "connect-src 'self' https://generativelanguage.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com;",
          ],
        },
      })
    })
  }

  private setupMenu(): void {
    if (this.isDev) {
      const template = [
        {
          label: "GenX AI Agent",
          submenu: [{ role: "about" }, { type: "separator" }, { role: "quit" }],
        },
        {
          label: "View",
          submenu: [
            { role: "reload" },
            { role: "forceReload" },
            { role: "toggleDevTools" },
            { type: "separator" },
            { role: "resetZoom" },
            { role: "zoomIn" },
            { role: "zoomOut" },
            { type: "separator" },
            { role: "togglefullscreen" },
          ],
        },
      ]

      const menu = Menu.buildFromTemplate(template as any)
      Menu.setApplicationMenu(menu)
    } else {
      Menu.setApplicationMenu(null)
    }
  }

  private setupGlobalShortcuts(): void {
    const hotkey = store.get("hotkey") as string

    globalShortcut.register(hotkey, () => {
      this.toggleVoiceListening()
    })

    globalShortcut.register("Escape", () => {
      if (this.isListening) {
        this.stopVoiceListening()
      }
    })
  }

  private async initializeControllers(): Promise<void> {
    try {
      await this.geminiController.initialize()
      await this.voiceController.initialize()
      console.log("All controllers initialized successfully")
    } catch (error) {
      console.error("Failed to initialize controllers:", error)
    }
  }

  private setupIPC(): void {
    // Window controls
    ipcMain.handle("window-minimize", () => {
      this.mainWindow?.minimize()
    })

    ipcMain.handle("window-maximize", () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize()
      } else {
        this.mainWindow?.maximize()
      }
    })

    ipcMain.handle("window-close", () => {
      this.mainWindow?.close()
    })

    ipcMain.handle("window-is-maximized", () => {
      return this.mainWindow?.isMaximized() || false
    })

    // Store operations
    ipcMain.handle("store-get", (event, key: string) => {
      try {
        return store.get(key)
      } catch (error) {
        console.error("Store get error:", error)
        return null
      }
    })

    ipcMain.handle("store-set", (event, key: string, value: any) => {
      try {
        store.set(key, value)
        return true
      } catch (error) {
        console.error("Store set error:", error)
        return false
      }
    })

    ipcMain.handle("store-delete", (event, key: string) => {
      try {
        store.delete(key)
        return true
      } catch (error) {
        console.error("Store delete error:", error)
        return false
      }
    })

    // Google OAuth
    ipcMain.handle("google-oauth", async () => {
      try {
        if (this.googleOAuth) {
          const result = await this.googleOAuth.authenticate(this.mainWindow || undefined)
          store.set("googleAuth", result)
          return result
        } else {
          // Mock authentication for development
          const mockResult = {
            accessToken: "mock_access_token",
            user: {
              id: "mock_user_id",
              name: "Demo User",
              email: "demo@genx.app",
              avatar: "",
              verified: true,
            },
          }
          store.set("googleAuth", mockResult)
          return mockResult
        }
      } catch (error) {
        console.error("OAuth error:", error)
        throw error
      }
    })

    ipcMain.handle("refresh-token", async (event, refreshToken: string) => {
      try {
        if (this.googleOAuth) {
          return await this.googleOAuth.refreshAccessToken(refreshToken)
        }
        throw new Error("OAuth not configured")
      } catch (error) {
        console.error("Token refresh error:", error)
        throw error
      }
    })

    ipcMain.handle("logout", async (event, accessToken: string) => {
      try {
        if (this.googleOAuth) {
          await this.googleOAuth.revokeTokens(accessToken)
        }
        store.delete("googleAuth")
        return true
      } catch (error) {
        console.error("Logout error:", error)
        return false
      }
    })

    // Gemini query
    ipcMain.handle("gemini-query", async (event, query: string) => {
      try {
        console.log("Processing query:", query)
        return await this.geminiController.processCommand(query)
      } catch (error) {
        console.error("Gemini query error:", error)
        throw error
      }
    })

    // System command execution
    ipcMain.handle("system-execute", async (event, command: string, args?: string[]) => {
      try {
        console.log("Executing command:", command, args)
        return await this.systemController.executeCommand(command, args)
      } catch (error) {
        console.error("System execute error:", error)
        throw error
      }
    })

    ipcMain.handle("system-file-operation", async (event, operation: string, path: string, data?: any) => {
      try {
        return await this.systemController.fileOperation(operation, path, data)
      } catch (error) {
        console.error("File operation error:", error)
        throw error
      }
    })

    ipcMain.handle("system-get-info", async () => {
      try {
        return await this.systemController.getSystemInfo()
      } catch (error) {
        console.error("System info error:", error)
        throw error
      }
    })

    // Voice Control
    ipcMain.handle("voice-start-listening", async () => {
      try {
        return await this.startVoiceListening()
      } catch (error) {
        console.error("Voice start error:", error)
        throw error
      }
    })

    ipcMain.handle("voice-stop-listening", async () => {
      try {
        return await this.stopVoiceListening()
      } catch (error) {
        console.error("Voice stop error:", error)
        throw error
      }
    })

    ipcMain.handle("voice-speak", async (event, text: string, options?: any) => {
      try {
        return await this.voiceController.speak(text, options)
      } catch (error) {
        console.error("Voice speak error:", error)
        throw error
      }
    })

    ipcMain.handle("voice-stop-speaking", async () => {
      try {
        return await this.voiceController.stopSpeaking()
      } catch (error) {
        console.error("Voice stop speaking error:", error)
        throw error
      }
    })

    // Configuration
    ipcMain.handle("config-set-gemini-key", async (event, apiKey: string) => {
      try {
        store.set("geminiApiKey", apiKey)
        await this.geminiController.setApiKey(apiKey)
        return true
      } catch (error) {
        console.error("Config set API key error:", error)
        return false
      }
    })

    ipcMain.handle("config-get-settings", () => {
      return {
        voiceEnabled: store.get("voiceEnabled"),
        hotkey: store.get("hotkey"),
        hasGeminiKey: this.geminiController.hasApiKey(),
        googleAuthConfigured: !!this.googleOAuth,
      }
    })

    ipcMain.handle("config-update-settings", (event, settings: any) => {
      try {
        Object.keys(settings).forEach((key) => {
          store.set(key, settings[key])
        })
        return true
      } catch (error) {
        console.error("Config update error:", error)
        return false
      }
    })

    // System info
    ipcMain.handle("get-system-info", () => {
      return {
        platform: process.platform,
        arch: process.arch,
        version: app.getVersion(),
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node,
        chromeVersion: process.versions.chrome,
      }
    })

    ipcMain.handle("get-app-version", () => {
      return app.getVersion()
    })
  }

  private async toggleVoiceListening(): Promise<void> {
    if (this.isListening) {
      await this.stopVoiceListening()
    } else {
      await this.startVoiceListening()
    }
  }

  private async startVoiceListening(): Promise<boolean> {
    try {
      this.isListening = true

      if (Notification.isSupported()) {
        new Notification({
          title: "GenX AI Agent",
          body: "Listening... Speak your command",
          icon: this.getIconPath(),
        }).show()
      }

      const result = await this.voiceController.startListening(async (transcript: string) => {
        await this.handleVoiceCommand(transcript)
      })

      this.mainWindow?.webContents.send("voice-listening-started")
      return result
    } catch (error) {
      this.isListening = false
      console.error("Failed to start voice listening:", error)
      return false
    }
  }

  private async stopVoiceListening(): Promise<boolean> {
    try {
      this.isListening = false
      const result = await this.voiceController.stopListening()
      this.mainWindow?.webContents.send("voice-listening-stopped")
      return result
    } catch (error) {
      console.error("Failed to stop voice listening:", error)
      return false
    }
  }

  private async handleVoiceCommand(transcript: string): Promise<void> {
    try {
      console.log("Voice command received:", transcript)
      await this.stopVoiceListening()

      // Process with Gemini
      const response = await this.geminiController.processCommand(transcript)

      // Execute command if provided
      if (response.command) {
        console.log("Executing command:", response.command)
        const parts = response.command.split(" ")
        const cmd = parts[0]
        const args = parts.slice(1)

        try {
          const result = await this.systemController.executeCommand(cmd, args.length > 0 ? args : undefined)
          console.log("Command result:", result)
        } catch (error) {
          console.error("Command execution error:", error)
        }
      }

      // Speak the response
      if (response.text) {
        await this.voiceController.speak(response.text)
      }

      // Send to renderer
      this.mainWindow?.webContents.send("voice-command-processed", {
        command: transcript,
        response: response.text,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error handling voice command:", error)
      await this.voiceController.speak("Sorry, I encountered an error processing your command.")
    }
  }
}

// Initialize the app
new GenXApp()
