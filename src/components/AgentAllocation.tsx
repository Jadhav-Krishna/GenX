"use client"

import type React from "react"
import styled from "styled-components"
import { motion } from "framer-motion"
import { User } from "lucide-react"

const AllocationContainer = styled(motion.div)`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 10px ${(props) => props.theme.colors.accent}22;
`

const Title = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  margin-bottom: 20px;
  text-transform: uppercase;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
`

const StatCard = styled.div`
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  padding: 16px;
  text-align: center;
`

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.accent};
  margin-bottom: 4px;
`

const StatLabel = styled.div`
  font-size: 11px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`

const AgentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const AgentItem = styled.div<{ $status: "active" | "standby" | "compromised" }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${(props) => props.theme.colors.background};
  border-left: 3px solid ${(props) =>
    props.$status === "active"
      ? props.theme.colors.success
      : props.$status === "standby"
        ? props.theme.colors.warning
        : props.theme.colors.error};
  border-radius: 4px;
  font-size: 12px;
`

const AgentCode = styled.span`
  font-weight: bold;
  color: ${(props) => props.theme.colors.accent};
  min-width: 60px;
`

const AgentStatus = styled.span`
  font-size: 10px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-transform: uppercase;
`

const AgentAllocation: React.FC = () => {
  const agents = [
    { code: "G-07RW", status: "active" as const, mission: "VENGEFUL SPIRIT" },
    { code: "G-09X", status: "standby" as const, mission: "OBSIDIAN SENTINEL" },
    { code: "G-06Y", status: "active" as const, mission: "GHOSTLY FURY" },
    { code: "G-08LZ", status: "compromised" as const, mission: "CURSED REVENANT" },
  ]

  return (
    <AllocationContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Title>Agent Allocation</Title>

      <StatsGrid>
        <StatCard>
          <StatNumber>190</StatNumber>
          <StatLabel>Active Field</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>990</StatNumber>
          <StatLabel>Undercover</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>290</StatNumber>
          <StatLabel>Training</StatLabel>
        </StatCard>
      </StatsGrid>

      <AgentList>
        {agents.map((agent, index) => (
          <motion.div
            key={agent.code}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <AgentItem $status={agent.status}>
              <User size={16} />
              <AgentCode>{agent.code}</AgentCode>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: "11px" }}>{agent.mission}</div>
              </div>
              <AgentStatus>{agent.status}</AgentStatus>
            </AgentItem>
          </motion.div>
        ))}
      </AgentList>
    </AllocationContainer>
  )
}

export default AgentAllocation
