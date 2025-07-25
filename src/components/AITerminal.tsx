"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import styled from "styled-components"
import { Send, TerminalIcon, Play, Loader } from "lucide-react"
import { useSystem } from "../contexts/SystemContext"

const TerminalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 300px;
`

const TerminalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.accent};
`

const StatusIndicator = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.625rem;
  color: ${(props) => (props.$active ? props.theme.colors.success : props.theme.colors.textSecondary)};
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: ${(props) => (props.$active ? props.theme.colors.success : props.theme.colors.textSecondary)};
    border-radius: 50%;
    animation: ${(props) => (props.$active ? "pulse 2s infinite" : "none")};
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`

const TerminalOutput = styled.div`
  flex: 1;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  padding: 16px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 0.75rem;
  overflow-y: auto;
  margin-bottom: 16px;
`

const OutputLine = styled.div<{ $type?: "user" | "ai" | "system" | "error" | "success" | "command" }>`
  margin-bottom: 8px;
  line-height: 1.4;
  color: ${(props) =>
    props.$type === "user"
      ? props.theme.colors.accent
      : props.$type === "ai"
        ? props.theme.colors.success
        : props.$type === "error"
          ? props.theme.colors.error
          : props.$type === "success"
            ? props.theme.colors.success
            : props.$type === "command"
              ? props.theme.colors.warning
              : props.theme.colors.textSecondary};
  
  &::before {
    content: ${(props) =>
      props.$type === "user"
        ? '"[USER] "'
        : props.$type === "ai"
          ? '"[AI] "'
          : props.$type === "error"
            ? '"[ERROR] "'
            : props.$type === "success"
              ? '"[SUCCESS] "'
              : props.$type === "command"
                ? '"[CMD] "'
                : '"[SYS] "'};
    font-weight: bold;
    margin-right: 4px;
  }
`

const CommandPreview = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.warning};
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ExecuteButton = styled.button`
  background: ${(props) => props.theme.colors.warning};
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  color: ${(props) => props.theme.colors.background};
  font-size: 0.625rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.warning}cc;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
`

const TerminalInput = styled.input`
  flex: 1;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  padding: 12px;
  color: ${(props) => props.theme.colors.text};
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 0.75rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 0 5px ${(props) => props.theme.colors.accent}44;
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.textSecondary};
  }
`

const SendButton = styled.button`
  background: ${(props) => props.theme.colors.accent};
  border: none;
  border-radius: 4px;
  padding: 12px;
  color: ${(props) => props.theme.colors.background};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

interface Message {
  id: string
  type: "user" | "ai" | "system" | "error" | "success" | "command"
  content: string
  timestamp: Date
  command?: string
}

const AITerminal = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "system",
      content: "GenX AI Agent ready. Just tell me what you want to do!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const { executeCommand } = useSystem()
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing || isExecuting) return

    const userInput = input.trim()
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: userInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // Call Gemini API directly
      const response = await window.electronAPI?.geminiQuery(userInput)

      if (!response) {
        throw new Error("No response from AI")
      }

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.text || response,
        timestamp: new Date(),
        command: response.command,
      }
      setMessages((prev) => [...prev, aiMessage])

      // If there's a command, show it for execution
      if (response.command) {
        const commandMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: "system",
          content: `Command ready: ${response.command}`,
          timestamp: new Date(),
          command: response.command,
        }
        setMessages((prev) => [...prev, commandMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "error",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const executeSystemCommand = async (command: string) => {
    setIsExecuting(true)

    const executingMessage: Message = {
      id: Date.now().toString(),
      type: "command",
      content: `Executing: ${command}`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, executingMessage])

    try {
      // Parse command and arguments
      const parts = command.split(" ")
      const cmd = parts[0]
      const args = parts.slice(1)

      const result = await executeCommand(cmd, args.length > 0 ? args : undefined)

      const resultMessage: Message = {
        id: Date.now().toString(),
        type: result.success ? "success" : "error",
        content: result.success
          ? `✓ Command executed:\n${result.output || "Command completed successfully"}`
          : `✗ Command failed:\n${result.error || "Unknown error"}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, resultMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "error",
        content: `Execution error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <TerminalContainer>
      <TerminalHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <TerminalIcon size={16} />
          GenX AI Terminal
        </div>
        <StatusIndicator $active={!isProcessing && !isExecuting}>
          {isProcessing ? "AI THINKING..." : isExecuting ? "EXECUTING..." : "READY"}
        </StatusIndicator>
      </TerminalHeader>

      <TerminalOutput ref={outputRef}>
        {messages.map((message) => (
          <div key={message.id}>
            <OutputLine $type={message.type}>{message.content}</OutputLine>
            {message.command && (
              <CommandPreview>
                <code>{message.command}</code>
                <ExecuteButton onClick={() => executeSystemCommand(message.command!)} disabled={isExecuting}>
                  <Play size={12} />
                  Execute
                </ExecuteButton>
              </CommandPreview>
            )}
          </div>
        ))}

        {isProcessing && (
          <OutputLine $type="system">
            <Loader size={12} style={{ animation: "spin 1s linear infinite", marginRight: "8px" }} />
            Asking Gemini AI...
          </OutputLine>
        )}
      </TerminalOutput>

      <form onSubmit={handleSubmit}>
        <InputContainer>
          <TerminalInput
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you want to do... (e.g., 'open calculator', 'show files', 'what time is it')"
            disabled={isProcessing || isExecuting}
          />
          <SendButton type="submit" disabled={isProcessing || isExecuting || !input.trim()}>
            <Send size={16} />
          </SendButton>
        </InputContainer>
      </form>
    </TerminalContainer>
  )
}

export default AITerminal
