"use client"

import type React from "react"
import styled from "styled-components"
import { motion } from "framer-motion"

const ChatContainer = styled(motion.div)`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 10px ${(props) => props.theme.colors.accent}22;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Title = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  margin-bottom: 20px;
  text-transform: uppercase;
  align-self: flex-start;
`

const RadarContainer = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  margin: 20px 0;
`

const RadarCircle = styled.div<{ $size: number; $delay: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  border: 2px solid ${(props) => props.theme.colors.accent}44;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse ${(props) => 2 + props.$delay}s infinite ease-in-out;

  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
  }
`

const RadarSweep = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, ${(props) => props.theme.colors.accent});
  transform-origin: left center;
  transform: translate(0, -50%);
  animation: sweep 3s linear infinite;

  @keyframes sweep {
    0% { transform: translate(0, -50%) rotate(0deg); }
    100% { transform: translate(0, -50%) rotate(360deg); }
  }
`

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  margin-top: 20px;
`

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  padding: 8px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.border}44;
`

const StatusLabel = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
  text-transform: uppercase;
`

const StatusValue = styled.span`
  color: ${(props) => props.theme.colors.accent};
  font-weight: bold;
`

const SecurityStatus = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: ${(props) => props.theme.colors.background};
  border-radius: 4px;
  font-size: 10px;
  color: ${(props) => props.theme.colors.success};
  text-align: center;
  letter-spacing: 1px;
`

const EncryptedChat: React.FC = () => {
  return (
    <ChatContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Title>Encrypted Chat Activity</Title>

      <RadarContainer>
        <RadarCircle $size={60} $delay={0} />
        <RadarCircle $size={120} $delay={0.5} />
        <RadarCircle $size={180} $delay={1} />
        <RadarSweep />
      </RadarContainer>

      <StatusGrid>
        <StatusItem>
          <StatusLabel>Encryption</StatusLabel>
          <StatusValue>AES-256</StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Channels</StatusLabel>
          <StatusValue>47</StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Active</StatusLabel>
          <StatusValue>23</StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Secure</StatusLabel>
          <StatusValue>100%</StatusValue>
        </StatusItem>
      </StatusGrid>

      <SecurityStatus>🔒 QUANTUM ENCRYPTION ACTIVE • ALL CHANNELS SECURED</SecurityStatus>
    </ChatContainer>
  )
}

export default EncryptedChat
