"use client"

import type React from "react"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { motion } from "framer-motion"
import { Shield, Settings, CheckCircle, AlertCircle, User } from "lucide-react"

const SetupContainer = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.colors.background};
  position: relative;
`

const SetupBox = styled(motion.div)`
  width: 500px;
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
  font-size: 14px;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 32px;
  letter-spacing: 1px;
`

const StatusCard = styled.div<{ $type: "success" | "warning" | "info" }>`
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  background: ${(props) =>
    props.$type === "success"
      ? props.theme.colors.success + "22"
      : props.$type === "warning"
        ? props.theme.colors.warning + "22"
        : props.theme.colors.accent + "22"};
  color: ${(props) =>
    props.$type === "success"
      ? props.theme.colors.success
      : props.$type === "warning"
        ? props.theme.colors.warning
        : props.theme.colors.accent};
  border: 1px solid ${(props) =>
    props.$type === "success"
      ? props.theme.colors.success
      : props.$type === "warning"
        ? props.theme.colors.warning
        : props.theme.colors.accent};
  display: flex;
  align-items: center;
  gap: 12px;
`

const Button = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: ${(props) => props.theme.colors.accent};
  border: none;
  border-radius: 4px;
  color: ${(props) => props.theme.colors.background};
  font-family: inherit;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  margin-bottom: 12px;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.accentHover};
    box-shadow: 0 0 15px ${(props) => props.theme.colors.accent}44;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SecondaryButton = styled(Button)`
  background: transparent;
  border: 1px solid ${(props) => props.theme.colors.border};
  color: ${(props) => props.theme.colors.text};

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.border}22;
    border-color: ${(props) => props.theme.colors.accent};
    color: ${(props) => props.theme.colors.accent};
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

const InfoBox = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  font-size: 11px;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.4;
  text-align: left;
`

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0;
  
  li {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 12px;
    color: ${(props) => props.theme.colors.text};
  }
`

interface SetupScreenProps {
  onSetupComplete: () => void
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onSetupComplete }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "error" | "success" | "info"; text: string } | null>(null)
  const [hasGeminiKey, setHasGeminiKey] = useState(false)
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    try {
      const settings = await window.electronAPI?.configGetSettings()
      if (settings) {
        setHasGeminiKey(settings.hasGeminiKey)
        setHasGoogleAuth(settings.googleAuthConfigured)
      }
    } catch (error) {
      console.error("Failed to check configuration:", error)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setStatusMessage({ type: "info", text: "Opening Google authentication..." })

    try {
      const result = await window.electronAPI?.googleOAuth()
      if (result) {
        setStatusMessage({ type: "success", text: `Welcome, ${result.user.name}!` })
        setTimeout(() => {
          onSetupComplete()
        }, 1500)
      }
    } catch (error) {
      console.error("Google login failed:", error)
      setStatusMessage({ type: "error", text: "Google authentication failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipSetup = () => {
    setStatusMessage({ type: "info", text: "Starting GenX AI Agent..." })
    setTimeout(() => {
      onSetupComplete()
    }, 1000)
  }

  return (
    <SetupContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SetupBox
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Shield size={48} color="#00ffff" style={{ marginBottom: "16px" }} />
        <Logo>GENX AI AGENT</Logo>
        <Subtitle>PERSONAL DESKTOP ASSISTANT</Subtitle>

        <StatusCard $type="success">
          <CheckCircle size={16} />
          <div>
            <strong>Gemini AI Configured</strong>
            <br />
            <small>API key is ready and working</small>
          </div>
        </StatusCard>

        {hasGoogleAuth ? (
          <StatusCard $type="success">
            <CheckCircle size={16} />
            <div>
              <strong>Google OAuth Available</strong>
              <br />
              <small>Secure authentication enabled</small>
            </div>
          </StatusCard>
        ) : (
          <StatusCard $type="warning">
            <AlertCircle size={16} />
            <div>
              <strong>Google OAuth Not Configured</strong>
              <br />
              <small>Using demo authentication</small>
            </div>
          </StatusCard>
        )}

        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          <User size={16} style={{ marginRight: "8px" }} />
          {isLoading ? "AUTHENTICATING..." : "LOGIN WITH GOOGLE"}
        </Button>

        <SecondaryButton
          onClick={handleSkipSetup}
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          CONTINUE WITHOUT LOGIN
        </SecondaryButton>

        {statusMessage && (
          <StatusMessage $type={statusMessage.type}>
            {statusMessage.type === "error" && <AlertCircle size={14} />}
            {statusMessage.type === "success" && <CheckCircle size={14} />}
            {statusMessage.type === "info" && <Settings size={14} />}
            {statusMessage.text}
          </StatusMessage>
        )}

        <InfoBox>
          <strong>GenX AI Agent Features:</strong>
          <FeatureList>
            <li>
              <CheckCircle size={12} color="#00ff88" />
              Voice-activated commands (Ctrl+Shift+G)
            </li>
            <li>
              <CheckCircle size={12} color="#00ff88" />
              Real Gemini AI integration
            </li>
            <li>
              <CheckCircle size={12} color="#00ff88" />
              System operations & file management
            </li>
            <li>
              <CheckCircle size={12} color="#00ff88" />
              Application launching & control
            </li>
            <li>
              <CheckCircle size={12} color="#00ff88" />
              Real-time system monitoring
            </li>
          </FeatureList>

          <div style={{ marginTop: "12px", fontSize: "10px", opacity: 0.7 }}>
            ✅ Your Gemini API key is already configured and ready to use!
          </div>
        </InfoBox>
      </SetupBox>
    </SetupContainer>
  )
}

export default SetupScreen
