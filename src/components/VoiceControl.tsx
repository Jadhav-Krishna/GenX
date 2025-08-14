"use client"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { motion } from "framer-motion"
import { Mic, MicOff, Volume2, VolumeX, Trash2 } from "lucide-react"
import { useVoice } from "../contexts/VoiceContext"

// --- Responsive Styling ---
const VoiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 300px;
  padding: 8px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 16px;
  }
`

const VoiceVisualizer = styled.div`
  width: 100%;
  flex-shrink: 0;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin: 15px 0;

  @media (max-width: 480px) {
    height: 40px;
    margin: 12px 0;
  }
`

const VisualizerBar = styled(motion.div)<{ $active: boolean }>`
  flex: 0 0 4px;
  background: ${(props) => (props.$active ? props.theme.colors.accent : props.theme.colors.border)};
  border-radius: 2px;
  height: ${(props) => (props.$active ? "40px" : "10px")};
  transition: all 0.2s ease;

  @media (max-width: 480px) {
    flex: 0 0 3px;
  }
`

const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin: 15px 0;

  @media (max-width: 480px) {
    gap: 8px;
    margin: 12px 0;
  }
`

const ControlButton = styled.button<{ $active?: boolean }>`
  flex: 0 0 auto;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.$active ? props.theme.colors.accent : props.theme.colors.border)};
  background: ${(props) => (props.$active ? props.theme.colors.accent + "22" : "transparent")};
  color: ${(props) => (props.$active ? props.theme.colors.accent : props.theme.colors.text)};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 0 10px ${(props) => props.theme.colors.accent}44;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
  }
`

const StatusText = styled.div`
  font-size: 12px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin-top: 5px;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    font-size: 10px;
    margin-bottom: 8px;
  }
`

const CommandHistory = styled.div`
  flex: 1;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
  min-height: 100px; 
`

const CommandItem = styled.div`
  font-size: 11px;
  margin-bottom: 12px;
  padding: 8px;
  background: ${(props) => props.theme.colors.surface};
  border-radius: 4px;
  border-left: 3px solid ${(props) => props.theme.colors.accent};

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 6px;
  }
`

const CommandText = styled.div`
  color: ${(props) => props.theme.colors.accent};
  font-weight: bold;
  margin-bottom: 4px;
`

const ResponseText = styled.div`
  color: ${(props) => props.theme.colors.text};
  font-size: 10px;
  line-height: 1.4;
`

const CommandTime = styled.div`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 9px;
  margin-top: 4px;
`

const ClearButton = styled.button`
  background: transparent;
  border: 1px solid ${(props) => props.theme.colors.border};
  color: ${(props) => props.theme.colors.textSecondary};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  align-self: flex-end;

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    color: ${(props) => props.theme.colors.accent};
  }
`

// --- Your Original Logic & JSX Below ---
const VoiceControl = () => {
  const { isListening, isSpeaking, commandHistory, startListening, stopListening, speak, stopSpeaking, clearHistory } =
    useVoice()
  const [visualizerBars, setVisualizerBars] = useState(Array.from({ length: 20 }, () => false))

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setVisualizerBars((prev) => prev.map(() => Math.random() > 0.5))
      }, 100)
      return () => clearInterval(interval)
    } else {
      setVisualizerBars(Array.from({ length: 20 }, () => false))
    }
  }, [isListening])

  const handleMicToggle = async () => {
    if (isListening) {
      await stopListening()
    } else {
      await startListening()
    }
  }

  const handleSpeakToggle = async () => {
    if (isSpeaking) {
      await stopSpeaking()
    } else {
      await speak("Voice control system active. Ready for commands.")
    }
  }

  return (
    <VoiceContainer>
      <VoiceVisualizer>
        {visualizerBars.map((active, index) => (
          <VisualizerBar
            key={index}
            $active={active}
            animate={{
              height: active ? `${20 + Math.random() * 40}px` : "10px",
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </VoiceVisualizer>

      <ControlsContainer>
        <ControlButton
          $active={isListening}
          onClick={handleMicToggle}
          title={isListening ? "Stop Listening" : "Start Listening (Ctrl+Shift+G)"}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </ControlButton>

        <ControlButton
          $active={isSpeaking}
          onClick={handleSpeakToggle}
          title={isSpeaking ? "Stop Speaking" : "Test Voice"}
        >
          {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </ControlButton>
      </ControlsContainer>

      <StatusText>
        {isListening ? "LISTENING FOR COMMANDS..." : isSpeaking ? "VOICE OUTPUT ACTIVE" : "VOICE SYSTEM STANDBY"}
        <br />
        <span style={{ fontSize: "10px", opacity: 0.7 }}>Press Ctrl+Shift+G globally or click the mic button</span>
      </StatusText>

      {commandHistory.length > 0 && (
        <ClearButton onClick={clearHistory}>
          <Trash2 size={10} />
          Clear History
        </ClearButton>
      )}

      <CommandHistory>
        {commandHistory.length === 0 ? (
          <div style={{ color: "#666", fontSize: "11px", textAlign: "center", padding: "20px" }}>
            No voice commands yet. Try saying "What time is it?" or "Open calculator"
          </div>
        ) : (
          commandHistory.map((item, index) => (
            <CommandItem key={index}>
              <CommandText>"{item.command}"</CommandText>
              <ResponseText>{item.response}</ResponseText>
              <CommandTime>{item.timestamp.toLocaleTimeString()}</CommandTime>
            </CommandItem>
          ))
        )}
      </CommandHistory>
    </VoiceContainer>
  )
}

export default VoiceControl
