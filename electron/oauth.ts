import { BrowserWindow, shell } from "electron"
import { URLSearchParams } from "url"

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export interface OAuthResult {
  accessToken: string
  refreshToken?: string
  idToken?: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    verified: boolean
  }
}

export class GoogleOAuthHandler {
  private config: OAuthConfig
  private authWindow: BrowserWindow | null = null

  constructor(config: OAuthConfig) {
    this.config = config
  }

  async authenticate(parentWindow?: BrowserWindow): Promise<OAuthResult> {
    return new Promise((resolve, reject) => {
      // Create auth window
      this.authWindow = new BrowserWindow({
        width: 500,
        height: 700,
        show: false,
        parent: parentWindow,
        modal: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true,
        },
        titleBarStyle: "default",
        resizable: false,
        minimizable: false,
        maximizable: false,
        autoHideMenuBar: true,
      })

      // Build OAuth URL
      const authUrl = this.buildAuthUrl()
      console.log("Starting OAuth flow with URL:", authUrl)

      // Load OAuth URL
      this.authWindow.loadURL(authUrl)
      this.authWindow.show()

      // Handle navigation
      this.authWindow.webContents.on("will-navigate", (event, url) => {
        this.handleNavigation(url, resolve, reject)
      })

      // Handle redirect
      this.authWindow.webContents.on("will-redirect", (event, url) => {
        this.handleNavigation(url, resolve, reject)
      })

      // Handle window closed
      this.authWindow.on("closed", () => {
        this.authWindow = null
        reject(new Error("Authentication cancelled by user"))
      })

      // Handle load errors
      this.authWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
        console.error("OAuth window failed to load:", errorCode, errorDescription)
        reject(new Error(`Failed to load OAuth page: ${errorDescription}`))
      })
    })
  }

  private buildAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: this.config.scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      state: this.generateState(),
    })

    return `https://accounts.google.com/oauth/authorize?${params.toString()}`
  }

  private handleNavigation(url: string, resolve: Function, reject: Function) {
    console.log("OAuth navigation to:", url)

    // Check if this is our redirect URI
    if (url.startsWith(this.config.redirectUri)) {
      const urlObj = new URL(url)
      const code = urlObj.searchParams.get("code")
      const error = urlObj.searchParams.get("error")

      if (error) {
        this.cleanup()
        reject(new Error(`OAuth error: ${error}`))
        return
      }

      if (code) {
        // Exchange code for tokens
        this.exchangeCodeForTokens(code)
          .then(resolve)
          .catch(reject)
          .finally(() => this.cleanup())
        return
      }
    }

    // Handle external links
    if (url.startsWith("http") && !url.includes("accounts.google.com") && !url.includes("localhost")) {
      shell.openExternal(url)
    }
  }

  private async exchangeCodeForTokens(code: string): Promise<OAuthResult> {
    try {
      console.log("Exchanging code for tokens...")

      // Exchange authorization code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: this.config.redirectUri,
        }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        throw new Error(`Token exchange failed: ${errorText}`)
      }

      const tokens = await tokenResponse.json()
      console.log("Received tokens")

      // Get user info
      const userInfo = await this.getUserInfo(tokens.access_token)

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idToken: tokens.id_token,
        user: userInfo,
      }
    } catch (error) {
      console.error("Token exchange error:", error)
      throw error
    }
  }

  private async getUserInfo(accessToken: string) {
    try {
      console.log("Fetching user info...")

      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user info: ${userResponse.statusText}`)
      }

      const userData = await userResponse.json()
      console.log("User data received")

      return {
        id: userData.id,
        name: userData.name || userData.given_name || "User",
        email: userData.email,
        avatar: userData.picture,
        verified: userData.verified_email || false,
      }
    } catch (error) {
      console.error("User info fetch error:", error)
      throw error
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private cleanup() {
    if (this.authWindow) {
      this.authWindow.close()
      this.authWindow = null
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`)
      }

      const tokens = await response.json()
      return {
        accessToken: tokens.access_token,
        expiresIn: tokens.expires_in,
      }
    } catch (error) {
      console.error("Token refresh error:", error)
      throw error
    }
  }

  // Revoke tokens (logout)
  async revokeTokens(accessToken: string): Promise<void> {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Token revocation error:", error)
      // Don't throw - revocation failure shouldn't prevent logout
    }
  }
}
