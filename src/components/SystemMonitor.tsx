"use client"
import { useState, useEffect } from "react"
import styled, { keyframes } from "styled-components"
import { Cpu, RefreshCw, HardDrive, Wifi, Activity } from "lucide-react"
import { useSystem } from "../contexts/SystemContext"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import LoadingSpinner from "./LoadingSpinner"

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const MonitorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 300px;
  padding: 8px;
  @media (min-width: 768px) {
    padding: 16px;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 16px;
  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

const StatCard = styled.div`
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 6px;
  padding: 12px;
  text-align: center;
  position: relative;
  overflow: hidden;
  @media (max-width: 480px) {
    padding: 8px;
  }
`

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.accent};
  margin-bottom: 4px;
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  @media (max-width: 480px) {
    font-size: 0.65rem;
  }
`

const ChartContainer = styled.div`
  height: 100px;
  width: 100%;
  margin-top: -10px;
  @media (max-width: 480px) {
    height: 80px;
  }
`

const RefreshButton = styled.button<{ $loading?: boolean }>`
  background: transparent;
  border: 1px solid ${(props) => props.theme.colors.border};
  color: ${(props) => props.theme.colors.textSecondary};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  align-self: flex-start;
  svg {
    animation: ${(props) => (props.$loading ? spin : "none")} 1s linear infinite;
  }
  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    color: ${(props) => props.theme.colors.accent};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (max-width: 480px) {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
`

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #333",
          padding: "8px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        <p>{`${payload[0].name}: ${payload[0].value}%`}</p>
      </div>
    )
  }
  return null
}

const SystemMonitor = () => {
  const { systemInfo, isLoading, refreshSystemInfo } = useSystem()
  const [cpuUsage, setCpuUsage] = useState(0)
  const [networkActivity, setNetworkActivity] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.round(Math.random() * 100))
      setNetworkActivity(Math.round(Math.random() * 100))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshSystemInfo()
    setIsRefreshing(false)
  }

  const memoryUsagePercent =
    systemInfo?.memory?.total && systemInfo?.memory?.used
      ? Math.round((systemInfo.memory.used / systemInfo.memory.total) * 100)
      : 0
  const memoryFreePercent = 100 - memoryUsagePercent

  const COLORS = {
    cpu: ["#00ffff", "#1a1a1a"],
    memory: ["#00ff88", "#1a1a1a"],
    network: ["#ffaa00", "#1a1a1a"],
    disk: ["#ff6b35", "#1a1a1a"],
  }

  const chartData = {
    cpu: [
      { name: "Used", value: cpuUsage },
      { name: "Free", value: 100 - cpuUsage },
    ],
    memory: [
      { name: "Used", value: memoryUsagePercent },
      { name: "Free", value: memoryFreePercent },
    ],
    network: [
      { name: "Activity", value: networkActivity },
      { name: "Idle", value: 100 - networkActivity },
    ],
    disk: [
      { name: "Used", value: 65 },
      { name: "Free", value: 35 },
    ],
  }

  return (
    <MonitorContainer>
      <RefreshButton onClick={handleRefresh} disabled={isRefreshing || isLoading} $loading={isRefreshing}>
        <RefreshCw size={10} />
        Refresh
      </RefreshButton>

      <StatsGrid>
        {Object.entries(chartData).map(([key, data]) => (
          <StatCard key={key}>
            <StatValue>{data[0].value}%</StatValue>
            <StatLabel>
              {key === "cpu" && <Cpu size={10} />}
              {key === "memory" && <HardDrive size={10} />}
              {key === "network" && <Wifi size={10} />}
              {key === "disk" && <Activity size={10} />}
              {key.charAt(0).toUpperCase() + key.slice(1)} Usage
            </StatLabel>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[key as keyof typeof COLORS][index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </StatCard>
        ))}
      </StatsGrid>
    </MonitorContainer>
  )
}

export default SystemMonitor
