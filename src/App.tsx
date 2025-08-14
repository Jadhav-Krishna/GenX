"use client"

import { useState, useEffect } from "react"
import styled, { ThemeProvider, createGlobalStyle } from "styled-components"
import { AnimatePresence } from "framer-motion"
import { AIProvider } from "./contexts/AIContext"
import { VoiceProvider } from "./contexts/VoiceContext"
import { SystemProvider } from "./contexts/SystemContext"
import Dashboard from "./components/Dashboard"
import TitleBar from "./components/TitleBar"
import SetupScreen from "./components/SetupScreen"
import { cyberpunkTheme } from "./theme/cyberpunkTheme"
import ErrorBoundary from "./components/ErrorBoundary"

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'JetBrains Mono';
    src: url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
    font-display: swap;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
  }

  body {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    background: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.text};
    overflow: hidden;
    user-select: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
  }

  h1, h2, h3, h4, h5, h6 {
    letter-spacing: 1px;
    line-height: 1.2;
  }

  h1 { font-size: 1.75rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  h4 { font-size: 1.125rem; }
  h5 { font-size: 1rem; }
  h6 { font-size: 0.875rem; }

  p, span, div {
    font-size: 0.875rem;
  }

  small {
    font-size: 0.75rem;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.accent};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.colors.accentHover};
  }
`

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.colors.background};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(90deg, transparent 98%, ${(props) => props.theme.colors.accent}22 100%),
      linear-gradient(0deg, transparent 98%, ${(props) => props.theme.colors.accent}22 100%);
    background-size: 20px 20px;
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      ${(props) => props.theme.colors.accent}11 2px,
      ${(props) => props.theme.colors.accent}11 4px
    );
    pointer-events: none;
    z-index: 2;
    animation: scanlines 2s linear infinite;
  }

  @keyframes scanlines {
    0% { transform: translateY(0); }
    100% { transform: translateY(4px); }
  }
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  z-index: 3;
  overflow: auto;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.25rem;
  color: ${(props) => props.theme.colors.accent};
  letter-spacing: 2px;
  
  &::after {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid ${(props) => props.theme.colors.accent};
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
    margin-left: 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

function App() {
  const [isSetup, setIsSetup] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      try {
        if (window.electronAPI) {
          const settings = await window.electronAPI.configGetSettings()
          setIsSetup(settings.hasGeminiKey)
        }
      } catch (error) {
        console.error("Setup check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    setTimeout(checkSetup, 1000)
  }, [])

  if (isLoading) {
    return (
      <ThemeProvider theme={cyberpunkTheme}>
        <GlobalStyle />
        <AppContainer>
          <LoadingScreen>INITIALIZING GENX AI AGENT</LoadingScreen>
        </AppContainer>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={cyberpunkTheme}>
      <GlobalStyle />
      <ErrorBoundary>
        <SystemProvider>
          <AIProvider>
            <VoiceProvider>
              <AppContainer>
                <TitleBar />
                <MainContent>
                  <AnimatePresence mode="wait">
                    {!isSetup ? (
                      <SetupScreen key="setup" onSetupComplete={() => setIsSetup(true)} />
                    ) : (
                      <Dashboard key="dashboard" />
                    )}
                  </AnimatePresence>
                </MainContent>
              </AppContainer>
            </VoiceProvider>
          </AIProvider>
        </SystemProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
