"use client"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { Activity, HardDrive, Wifi, Cpu, RefreshCw } from "lucide-react"
import { useSystem } from "../contexts/SystemContext"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { formatBytes, formatUptime } from "../utils/helpers"
import LoadingSpinner from "./LoadingSpinner"

const MonitorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 300px;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`

const StatCard = styled.div`
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  padding: 12px;
  text-align: center;
  position: relative;
  overflow: hidden;
`

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.accent};
  margin-bottom: 4px;
`

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`

const ChartContainer = styled.div`
  height: 100px;
  width: 100%;
  margin-top: -10px;
`

const SystemInfo = styled.div`
  flex: 1;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  padding: 12px;
  overflow-y: auto;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.border}44;
  font-size: 0.75rem;

  &:last-child {
    border-bottom: none;
  }
`

const InfoLabel = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
`

const InfoValue = styled.span`
  color: ${(props) => props.theme.colors.text};
  font-weight: bold;
`

const RefreshButton = styled.button`
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

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    color: ${(props) => props.theme.colors.accent};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    // Simulate CPU usage and network activity
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

  const memoryUsagePercent = systemInfo ? Math.round((systemInfo.memory.used / systemInfo.memory.total) * 100) : 0
  const memoryFreePercent = 100 - memoryUsagePercent

  const cpuData = [
    { name: "Used", value: cpuUsage },
    { name: "Free", value: 100 - cpuUsage },
  ]

  const memoryData = [
    { name: "Used", value: memoryUsagePercent },
    { name: "Free", value: memoryFreePercent },
  ]

  const networkData = [
    { name: "Activity", value: networkActivity },
    { name: "Idle", value: 100 - networkActivity },
  ]

  const diskData = [
    { name: "Used", value: 65 },
    { name: "Free", value: 35 },
  ]

  // Color schemes for charts
  const COLORS = {
    cpu: ["#00ffff", "#1a1a1a"],
    memory: ["#00ff88", "#1a1a1a"],
    network: ["#ffaa00", "#1a1a1a"],
    disk: ["#ff6b35", "#1a1a1a"],
  }

  return (
    <MonitorContainer>
      <RefreshButton onClick={handleRefresh} disabled={isRefreshing || isLoading}>
        <RefreshCw size={10} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
        Refresh
      </RefreshButton>

      <StatsGrid>
        <StatCard>
          <StatValue>{cpuUsage}%</StatValue>
          <StatLabel>
            <Cpu size={10} style={{ marginRight: "4px", verticalAlign: "middle" }} />
            CPU Usage
          </StatLabel>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cpuData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {cpuData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.cpu[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </StatCard>

        <StatCard>
          <StatValue>{memoryUsagePercent}%</StatValue>
          <StatLabel>
            <Activity size={10} style={{ marginRight: "4px", verticalAlign: "middle" }} />
            Memory
          </StatLabel>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {memoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.memory[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </StatCard>

        <StatCard>
          <StatValue>{networkActivity}%</StatValue>
          <StatLabel>
            <Wifi size={10} style={{ marginRight: "4px", verticalAlign: "middle" }} />
            Network
          </StatLabel>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={networkData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {networkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.network[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </StatCard>

        <StatCard>
          <StatValue>{systemInfo?.cpus || 0}</StatValue>
          <StatLabel>
            <HardDrive size={10} style={{ marginRight: "4px", verticalAlign: "middle" }} />
            CPU Cores
          </StatLabel>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {diskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.disk[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </StatCard>
      </StatsGrid>

      <SystemInfo>
        {systemInfo ? (
          <>
            <InfoRow>
              <InfoLabel>Platform</InfoLabel>
              <InfoValue>
                {systemInfo.platform} ({systemInfo.arch})
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Hostname</InfoLabel>
              <InfoValue>{systemInfo.hostname}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Username</InfoLabel>
              <InfoValue>{systemInfo.username}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Total Memory</InfoLabel>
              <InfoValue>{formatBytes(systemInfo.memory.total)}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Free Memory</InfoLabel>
              <InfoValue>{formatBytes(systemInfo.memory.free)}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Used Memory</InfoLabel>
              <InfoValue>{formatBytes(systemInfo.memory.used)}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Uptime</InfoLabel>
              <InfoValue>{formatUptime(systemInfo.uptime)}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Home Directory</InfoLabel>
              <InfoValue>{systemInfo.homeDir}</InfoValue>
            </InfoRow>
          </>
        ) : (
          <div
            style={{
              color: "#666",
              fontSize: "0.75rem",
              textAlign: "center",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size={20} />
                <span>Loading system information...</span>
              </>
            ) : (
              "System information unavailable"
            )}
          </div>
        )}
      </SystemInfo>
    </MonitorContainer>
  )
}

export default SystemMonitor
