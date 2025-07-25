"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { motion } from "framer-motion"
import { Shield, Mic, MicOff, Terminal, Settings, Activity, Zap } from "lucide-react"
import AITerminal from "./AITerminal"
import VoiceControl from "./VoiceControl"
import SystemMonitor from "./SystemMonitor"
import { useVoice } from "../contexts/VoiceContext"
import { useAI } from "../contexts/AIContext"

const DashboardContainer = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.colors.background};
  padding: 20px;
  overflow-y: auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`

const Title = styled.h1`
  font-size: 28px;
  color: ${(props) => props.theme.colors.accent};
  letter-spacing: 2px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 12px;
`

const StatusIndicator = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${(props) => (props.$active ? props.theme.colors.success : props.theme.colors.textSecondary)};
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: ${(props) => (props.$active ? props.theme.colors.success : props.theme.colors.textSecondary)};
    border-radius: 50%;
    animation: ${(props) => (props.$active ? "pulse 2s infinite" : "none")};
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`

const ActionButton = styled(motion.button)<{ $active?: boolean }>`
  padding: 12px;
  background: ${(props) => (props.$active ? props.theme.colors.accent + "22" : "transparent")};
  border: 2px solid ${(props) => (props.$active ? props.theme.colors.accent : props.theme.colors.border)};
  border-radius: 8px;
  color: ${(props) => (props.$active ? props.theme.colors.accent : props.theme.colors.text)};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 0 10px ${(props) => props.theme.colors.accent}44;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
  flex: 1;
`

const Card = styled(motion.div)`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 0 10px ${(props) => props.theme.colors.accent}22;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 0 20px ${(props) => props.theme.colors.accent}33;
  }
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`

const CardTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
`

const Dashboard = () => {
  const { isListening, startListening, stopListening } = useVoice()
  const { isProcessing } = useAI()
  const [systemStatus, setSystemStatus] = useState({
    cpu: 0,
    memory: 0,
    uptime: 0,
  })

  useEffect(() => {
    // Get initial system info
    const getSystemInfo = async () => {
      try {
        const info = await window.electronAPI?.systemGetInfo()
        if (info) {
          setSystemStatus({
            cpu: Math.round(Math.random() * 100), // Mock CPU usage
            memory: Math.round((info.memory.used / info.memory.total) * 100),
            uptime: info.uptime,
          })
        }
      } catch (error) {
        console.error("Failed to get system info:", error)
      }
    }

    getSystemInfo()
    const interval = setInterval(getSystemInfo, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleVoiceToggle = async () => {
    try {
      if (isListening) {
        await stopListening()
      } else {
        await startListening()
      }
    } catch (error) {
      console.error("Voice toggle failed:", error)
    }
  }

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <DashboardContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Header>
        <Title>
          <Shield size={32} />
          GENX AI AGENT
        </Title>

        <QuickActions>
          <StatusIndicator $active={!isProcessing}>{isProcessing ? "AI PROCESSING..." : "AI READY"}</StatusIndicator>

          <ActionButton
            $active={isListening}
            onClick={handleVoiceToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isListening ? "Stop Listening (Esc)" : "Start Voice Control (Ctrl+Shift+G)"}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </ActionButton>

          <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title="Settings">
            <Settings size={20} />
          </ActionButton>
        </QuickActions>
      </Header>

      <GridContainer>
        <Card initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <CardHeader>
            <Terminal size={20} color="#00ffff" />
            <CardTitle>AI Terminal</CardTitle>
          </CardHeader>
          <AITerminal />
        </Card>

        <Card initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <CardHeader>
            <Mic size={20} color="#00ff88" />
            <CardTitle>Voice Control</CardTitle>
          </CardHeader>
          <VoiceControl />
        </Card>

        <Card initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <CardHeader>
            <Activity size={20} color="#ffaa00" />
            <CardTitle>System Monitor</CardTitle>
          </CardHeader>
          <SystemMonitor />
        </Card>

        <Card initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <CardHeader>
            <Zap size={20} color="#ff6b35" />
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#888" }}>CPU Usage</span>
              <span style={{ fontSize: "18px", color: "#00ffff", fontWeight: "bold" }}>{systemStatus.cpu}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#888" }}>Memory Usage</span>
              <span style={{ fontSize: "18px", color: "#00ff88", fontWeight: "bold" }}>{systemStatus.memory}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#888" }}>Uptime</span>
              <span style={{ fontSize: "18px", color: "#ffaa00", fontWeight: "bold" }}>
                {formatUptime(systemStatus.uptime)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#888" }}>Voice Control</span>
              <span
                style={{
                  fontSize: "14px",
                  color: isListening ? "#00ff88" : "#888",
                  fontWeight: "bold",
                }}
              >
                {isListening ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
          </div>
        </Card>
      </GridContainer>
    </DashboardContainer>
  )
}

export default Dashboard
