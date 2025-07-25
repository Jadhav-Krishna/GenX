"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"
import { motion } from "framer-motion"
import { Command, Users, Target, Brain, Settings, Circle } from "lucide-react"

const SidebarContainer = styled.div`
  width: 240px;
  background: ${(props) => props.theme.colors.surface};
  border-right: 2px solid ${(props) => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: 20px 0;
`

const NavItem = styled(motion.div)<{ $active?: boolean }>`
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: ${(props) => (props.$active ? props.theme.colors.accent : props.theme.colors.text)};
  background: ${(props) => (props.$active ? props.theme.colors.accent + "22" : "transparent")};
  border-left: 3px solid ${(props) => (props.$active ? props.theme.colors.accent : "transparent")};
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};
  letter-spacing: 1px;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => props.theme.colors.accent}11;
    color: ${(props) => props.theme.colors.accent};
  }
`

const SystemStatus = styled.div`
  margin-top: auto;
  padding: 20px 24px;
  border-top: 1px solid ${(props) => props.theme.colors.border};
`

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${(props) => props.theme.colors.success};
  margin-bottom: 8px;
`

const StatusText = styled.div`
  font-size: 10px;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.4;
`

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState("command")

  const navItems = [
    { id: "command", label: "COMMAND CENTER", icon: Command },
    { id: "agents", label: "AGENT NETWORK", icon: Users },
    { id: "operations", label: "OPERATIONS", icon: Target },
    { id: "intelligence", label: "INTELLIGENCE", icon: Brain },
    { id: "systems", label: "SYSTEMS", icon: Settings },
  ]

  return (
    <SidebarContainer>
      {navItems.map((item) => (
        <NavItem
          key={item.id}
          $active={activeItem === item.id}
          onClick={() => setActiveItem(item.id)}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <item.icon size={18} />
          {item.label}
        </NavItem>
      ))}

      <SystemStatus>
        <StatusItem>
          <Circle size={8} fill="currentColor" />
          SYSTEM ONLINE
        </StatusItem>
        <StatusText>
          UPTIME: 72:14:32
          <br />
          AGENTS: 847 ACTIVE
          <br />
          MISSIONS: 23 ONGOING
        </StatusText>
      </SystemStatus>
    </SidebarContainer>
  )
}

export default Sidebar
