"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  verified?: boolean
}

interface AuthData {
  token: string
  refreshToken?: string
  user: User
  expiresAt?: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (credentials?: any) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  isLoading: boolean
  authData: AuthData | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()

    // Set up token refresh interval
    const refreshInterval = setInterval(
      () => {
        if (authData?.refreshToken && shouldRefreshToken()) {
          refreshAuth()
        }
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes

    return () => clearInterval(refreshInterval)
  }, [authData])

  const checkAuth = async () => {
    try {
      if (window.electronAPI) {
        const stored = await window.electronAPI.storeGet("genx-auth")
        if (stored) {
          setAuthData(stored)
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const shouldRefreshToken = (): boolean => {
    if (!authData?.expiresAt) return false

    // Refresh if token expires in the next 10 minutes
    const tenMinutesFromNow = Date.now() + 10 * 60 * 1000
    return authData.expiresAt < tenMinutesFromNow
  }

  const login = async (credentials?: any) => {
    setIsLoading(true)
    try {
      const result = await window.electronAPI?.googleOAuth()
      if (result) {
        const authData: AuthData = {
          token: result.token,
          refreshToken: result.refreshToken,
          user: result.user,
          expiresAt: result.refreshToken ? Date.now() + 3600 * 1000 : undefined, // 1 hour for real tokens
        }

        setAuthData(authData)
        await window.electronAPI?.storeSet("genx-auth", authData)
      }
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAuth = async () => {
    if (!authData?.refreshToken) {
      console.log("No refresh token available")
      return
    }

    try {
      console.log("Refreshing access token...")
      const refreshResult = await window.electronAPI?.refreshToken(authData.refreshToken)

      if (refreshResult) {
        const updatedAuthData: AuthData = {
          ...authData,
          token: refreshResult.accessToken,
          expiresAt: Date.now() + refreshResult.expiresIn * 1000,
        }

        setAuthData(updatedAuthData)
        await window.electronAPI?.storeSet("genx-auth", updatedAuthData)
        console.log("Token refreshed successfully")
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      // If refresh fails, logout the user
      await logout()
    }
  }

  const logout = async () => {
    try {
      if (authData?.token && window.electronAPI) {
        await window.electronAPI.logout(authData.token)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setAuthData(null)
      if (window.electronAPI) {
        await window.electronAPI.storeDelete("genx-auth")
      }
    }
  }

  const value = {
    user: authData?.user || null,
    isAuthenticated: !!authData?.user,
    login,
    logout,
    refreshAuth,
    isLoading,
    authData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
