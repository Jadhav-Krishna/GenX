"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import styled from "styled-components"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 40px;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  text-align: center;
`

const ErrorIcon = styled.div`
  margin-bottom: 24px;
  color: ${(props) => props.theme.colors.error};
`

const ErrorTitle = styled.h1`
  font-size: 24px;
  color: ${(props) => props.theme.colors.error};
  margin-bottom: 16px;
  letter-spacing: 1px;
`

const ErrorMessage = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 32px;
  max-width: 600px;
  line-height: 1.5;
`

const ErrorDetails = styled.details`
  margin-bottom: 32px;
  max-width: 800px;
  
  summary {
    cursor: pointer;
    color: ${(props) => props.theme.colors.accent};
    margin-bottom: 16px;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  pre {
    background: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 4px;
    padding: 16px;
    font-size: 12px;
    color: ${(props) => props.theme.colors.text};
    overflow-x: auto;
    text-align: left;
  }
`

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${(props) => props.theme.colors.accent};
  border: none;
  border-radius: 4px;
  color: ${(props) => props.theme.colors.background};
  font-family: inherit;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${(props) => props.theme.colors.accentHover};
  }
`

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorIcon>
            <AlertTriangle size={64} />
          </ErrorIcon>

          <ErrorTitle>SYSTEM ERROR DETECTED</ErrorTitle>

          <ErrorMessage>
            GenX AI Agent encountered an unexpected error and needs to restart. This could be due to a system conflict
            or corrupted data.
          </ErrorMessage>

          <ErrorDetails>
            <summary>Technical Details</summary>
            <pre>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </ErrorDetails>

          <RetryButton onClick={this.handleRetry}>
            <RefreshCw size={16} />
            RESTART GENX AGENT
          </RetryButton>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
