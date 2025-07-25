"use client"

import type React from "react"
import styled from "styled-components"
import { Minimize2, Maximize2, X, Shield } from "lucide-react"

const TitleBarContainer = styled.div`
  height: 32px;
  background: ${(props) => props.theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  -webkit-app-region: drag;
  z-index: 1000;
`

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${(props) => props.theme.colors.accent};
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
`

const WindowControls = styled.div`
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
`

const ControlButton = styled.button<{ $variant?: "close" }>`
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$variant === "close" ? "#ff4444" : props.theme.colors.accent + "22")};
    color: ${(props) => (props.$variant === "close" ? "white" : props.theme.colors.accent)};
  }
`

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.success};
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`

const TitleBar: React.FC = () => {
  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow()
  }

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow()
  }

  const handleClose = () => {
    window.electronAPI?.closeWindow()
  }

  return (
    <TitleBarContainer>
      <TitleSection>
        <Shield size={16} />
        <StatusIndicator />
        GENX AI AGENT
        <span style={{ fontSize: "10px", opacity: 0.7 }}>v1.0.0 ACTIVE</span>
      </TitleSection>

      <WindowControls>
        <ControlButton onClick={handleMinimize} title="Minimize">
          <Minimize2 size={14} />
        </ControlButton>
        <ControlButton onClick={handleMaximize} title="Maximize">
          <Maximize2 size={14} />
        </ControlButton>
        <ControlButton $variant="close" onClick={handleClose} title="Close">
          <X size={14} />
        </ControlButton>
      </WindowControls>
    </TitleBarContainer>
  )
}

export default TitleBar
