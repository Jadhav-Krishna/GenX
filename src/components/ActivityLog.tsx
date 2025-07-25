"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { motion } from "framer-motion"

const LogContainer = styled(motion.div)`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 10px ${(props) => props.theme.colors.accent}22;
  display: flex;
  flex-direction: column;
`

const Title = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  margin-bottom: 20px;
  text-transform: uppercase;
`

const LogList = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
`

const LogEntry = styled(motion.div)`
  padding: 12px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.border}44;
  font-size: 11px;
  line-height: 1.4;

  &:last-child {
    border-bottom: none;
  }
`

const LogTime = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
  margin-right: 12px;
  font-family: monospace;
`

const LogAgent = styled.span`
  color: ${(props) => props.theme.colors.accent};
  font-weight: bold;
  margin-right: 8px;
`

const LogAction = styled.span`
  color: ${(props) => props.theme.colors.text};
`

const LogLocation = styled.span`
  color: ${(props) => props.theme.colors.warning};
  font-weight: bold;
`

interface LogEntry {
  time: string
  agent: string
  action: string
  target: string
  id: number
}

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      time: "09:29",
      agent: "ghost_Fire",
      action: "completed mission in Berlin with agent",
      target: "zero_Night",
      id: 1,
    },
    {
      time: "08:12",
      agent: "viper_Vain",
      action: "extracted high-value target in",
      target: "Cairo",
      id: 2,
    },
    {
      time: "07:55",
      agent: "snake_Shade",
      action: "lost communication in",
      target: "Havana",
      id: 3,
    },
    {
      time: "21:33",
      agent: "phantom_Raven",
      action: "initiated surveillance in",
      target: "Tokyo",
      id: 4,
    },
    {
      time: "19:45",
      agent: "void_Void",
      action: "compromised security in Moscow with agent",
      target: "dark_Matrix",
      id: 5,
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        time: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        agent: `agent_${Math.random().toString(36).substr(2, 6)}`,
        action: "status update from",
        target: ["Berlin", "Tokyo", "Moscow", "Cairo", "London"][Math.floor(Math.random() * 5)],
        id: Date.now(),
      }

      setLogs((prev) => [newLog, ...prev.slice(0, 9)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <LogContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Title>Activity Log</Title>
      <LogList>
        {logs.map((log, index) => (
          <LogEntry
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <LogTime>{log.time}</LogTime>
            <LogAgent>{log.agent}</LogAgent>
            <LogAction>{log.action} </LogAction>
            <LogLocation>{log.target}</LogLocation>
          </LogEntry>
        ))}
      </LogList>
    </LogContainer>
  )
}

export default ActivityLog
