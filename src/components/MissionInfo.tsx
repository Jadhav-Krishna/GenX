"use client"

import type React from "react"
import styled from "styled-components"
import { motion } from "framer-motion"
import { CheckCircle, XCircle } from "lucide-react"

const InfoContainer = styled(motion.div)`
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

const MissionGroup = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`

const GroupTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 12px;
  text-transform: uppercase;
`

const MissionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const MissionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: ${(props) => props.theme.colors.background};
  border-radius: 4px;
  font-size: 11px;
`

const MissionLabel = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
`

const MissionCount = styled.span`
  color: ${(props) => props.theme.colors.accent};
  font-weight: bold;
  font-size: 14px;
`

const MissionInfo: React.FC = () => {
  const successMissions = [
    { label: "High Risk Missions", count: 190 },
    { label: "Medium Risk Missions", count: 426 },
    { label: "Low Risk Missions", count: 920 },
  ]

  const failedMissions = [
    { label: "High Risk Missions", count: 190 },
    { label: "Medium Risk Missions", count: 426 },
    { label: "Low Risk Missions", count: 920 },
  ]

  return (
    <InfoContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
      <Title>Mission Information</Title>

      <MissionGroup>
        <GroupTitle>
          <CheckCircle size={16} color="#00ff88" />
          Successful Missions
        </GroupTitle>
        <MissionList>
          {successMissions.map((mission, index) => (
            <MissionItem key={index}>
              <MissionLabel>{mission.label}</MissionLabel>
              <MissionCount>{mission.count}</MissionCount>
            </MissionItem>
          ))}
        </MissionList>
      </MissionGroup>

      <MissionGroup>
        <GroupTitle>
          <XCircle size={16} color="#ff4444" />
          Failed Missions
        </GroupTitle>
        <MissionList>
          {failedMissions.map((mission, index) => (
            <MissionItem key={index}>
              <MissionLabel>{mission.label}</MissionLabel>
              <MissionCount>{mission.count}</MissionCount>
            </MissionItem>
          ))}
        </MissionList>
      </MissionGroup>
    </InfoContainer>
  )
}

export default MissionInfo
