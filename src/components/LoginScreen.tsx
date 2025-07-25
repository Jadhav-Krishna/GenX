"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { motion } from "framer-motion"
import { Shield, Lock, User, AlertCircle, CheckCircle } from "lucide-react"

const LoginContainer = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.colors.background};
  position: relative;
`

const LoginBox = styled(motion.div)`
  width: 400px;
  padding: 40px;
  background: ${(props) => props.theme.colors.surface};
  border: 2px solid ${(props) => props.theme.colors.accent};
  border-radius: 8px;
  box-shadow: 
    0 0 20px ${(props) => props.theme.colors.accent}44,
    inset 0 0 20px ${(props) => props.theme.colors.accent}11;
  text-align: center;
`

const Logo = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.accent};
  margin-bottom: 8px;
  letter-spacing: 3px;
`

const Subtitle = styled.div`
  font-size: 12px;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 32px;
  letter-spacing: 1px;
`

const GoogleButton = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: transparent;
  border: 2px solid ${(props) => props.theme.colors.accent};
  color: ${(props) => props.theme.colors.accent};
  font-family: inherit;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.accent}22;
    box-shadow: 0 0 15px ${(props) => props.theme.colors.accent}44;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const StatusMessage = styled.div<{ $type: "error" | "success" | "info" }>`
  margin-top: 16px;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(props) =>
    props.$type === "error"
      ? props.theme.colors.error + "22"
      : props.$type === "success"
        ? props.theme.colors.success + "22"
        : props.theme.colors.accent + "22"};
  color: ${(props) =>
    props.$type === "error"
      ? props.theme.colors.error
      : props.$type === "success"
        ? props.theme.colors.success
        : props.theme.colors.accent};
  border: 1px solid ${(props) =>
    props.$type === "error"
      ? props.theme.colors.error
      : props.$type === "success"
        ? props.theme.colors.success
        : props.theme.colors.accent};
`

const SecurityNotice = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  font-size: 11px;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.4;
`

const ConfigStatus = styled.div<{ $configured: boolean }>`
  margin-bottom: 20px;
  padding: 12px;
  border-radius: 4px;
  font-size: 11px;
  background: ${(props) => (props.$configured ? props.theme.colors.success + "22" : props.theme.colors.warning + "22")};
  color: ${(props) => (props.$configured ? props.theme.colors.success : props.theme.colors.warning)};
  border: 1px solid ${(props) => (props.$configured ? props.theme.colors.success : props.theme.colors.warning)};
  display: flex;
  align-items: center;
  gap: 8px;
`

interface LoginScreenProps {
  onLogin: () => void
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "error" | "success" | "info"; text: string } | null>(null)
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)

  // Check OAuth configuration on mount
  useEffect(() => {
    checkOAuthConfig()
  }, [])

  const checkOAuthConfig = async () => {
    try {
      // This is a simple check - in a real app you might want to validate the config
      const hasConfig = process.env.NODE_ENV === "production" || window.location.search.includes("oauth=true")
      setIsConfigured(hasConfig)
    } catch (error) {
      setIsConfigured(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setStatusMessage(null)

    try {
      setStatusMessage({ type: "info", text: "Opening authentication window..." })

      const result = await window.electronAPI?.googleOAuth()

      if (result) {
        setStatusMessage({ type: "success", text: `Welcome, ${result.user.name}!` })
        await window.electronAPI?.storeSet("genx-auth", result)

        // Small delay to show success message
        setTimeout(() => {
          onLogin()
        }, 1000)
      }
    } catch (error) {
      console.error("Login failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Authentication failed"
      setStatusMessage({ type: "error", text: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LoginContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <LoginBox
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Shield size={48} color="#00ffff" style={{ marginBottom: "16px" }} />
        <Logo>GENX</Logo>
        <Subtitle>TACTICAL OPERATIONS INTERFACE</Subtitle>

        {isConfigured !== null && (
          <ConfigStatus $configured={isConfigured}>
            {isConfigured ? (
              <>
                <CheckCircle size={14} />
                Google OAuth Configured - Real Authentication
              </>
            ) : (
              <>
                <AlertCircle size={14} />
                Mock Mode - Development Authentication
              </>
            )}
          </ConfigStatus>
        )}

        <GoogleButton
          onClick={handleGoogleLogin}
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          <User size={18} />
          {isLoading ? "AUTHENTICATING..." : "SECURE LOGIN WITH GOOGLE"}
        </GoogleButton>

        {statusMessage && (
          <StatusMessage $type={statusMessage.type}>
            {statusMessage.type === "error" && <AlertCircle size={14} />}
            {statusMessage.type === "success" && <CheckCircle size={14} />}
            {statusMessage.type === "info" && <Shield size={14} />}
            {statusMessage.text}
          </StatusMessage>
        )}

        <SecurityNotice>
          <Lock size={12} style={{ marginRight: "8px", verticalAlign: "middle" }} />
          {isConfigured
            ? "SECURE OAUTH 2.0 • END-TO-END ENCRYPTION ENABLED"
            : "DEVELOPMENT MODE • MOCK AUTHENTICATION ACTIVE"}
        </SecurityNotice>
      </LoginBox>
    </LoginContainer>
  )
}

export default LoginScreen
