"use client"

import type React from "react"

import styled, { keyframes } from "styled-components"

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`

const SpinnerContainer = styled.div<{ size?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => props.size || 24}px;
  height: ${(props) => props.size || 24}px;
`

const Spinner = styled.div<{ size?: number }>`
  width: ${(props) => props.size || 24}px;
  height: ${(props) => props.size || 24}px;
  border: 2px solid ${(props) => props.theme.colors.border};
  border-top: 2px solid ${(props) => props.theme.colors.accent};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`

const PulseSpinner = styled.div<{ size?: number }>`
  width: ${(props) => props.size || 24}px;
  height: ${(props) => props.size || 24}px;
  background: ${(props) => props.theme.colors.accent};
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
`

interface LoadingSpinnerProps {
  size?: number
  variant?: "spin" | "pulse"
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, variant = "spin" }) => {
  return (
    <SpinnerContainer size={size}>
      {variant === "spin" ? <Spinner size={size} /> : <PulseSpinner size={size} />}
    </SpinnerContainer>
  )
}

export default LoadingSpinner
