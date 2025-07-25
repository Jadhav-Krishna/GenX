"use client"

import type React from "react"
import styled from "styled-components"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"

const ChartContainer = styled(motion.div)`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 10px ${(props) => props.theme.colors.accent}22;
  grid-column: span 2;
`

const Title = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  margin-bottom: 20px;
  text-transform: uppercase;
`

const ChartWrapper = styled.div`
  height: 200px;
  width: 100%;
`

const MissionChart: React.FC = () => {
  const data = [
    { name: "Jan 28", success: 300, failed: 100 },
    { name: "Feb 15", success: 350, failed: 80 },
    { name: "Mar 05", success: 320, failed: 120 },
    { name: "Mar 20", success: 380, failed: 90 },
    { name: "Apr 10", success: 400, failed: 70 },
    { name: "Apr 25", success: 420, failed: 85 },
    { name: "May 12", success: 450, failed: 60 },
  ]

  return (
    <ChartContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Title>Mission Activity Overview</Title>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="success"
              stroke="#00ffff"
              strokeWidth={2}
              dot={{ fill: "#00ffff", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="failed"
              stroke="#ff6b35"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#ff6b35", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  )
}

export default MissionChart
