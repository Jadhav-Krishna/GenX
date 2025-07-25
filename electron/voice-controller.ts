import { spawn, type ChildProcess } from "child_process"
import * as os from "os"
import * as path from "path"
import { exec } from "child_process"
import { promises as fs } from "fs"

export interface VoiceOptions {
  rate?: number
  pitch?: number
  volume?: number
  voice?: string
}

export class VoiceController {
  private isListening = false
  private isSpeaking = false
  private recognitionProcess: ChildProcess | null = null
  private speechProcess: ChildProcess | null = null
  private onTranscriptCallback: ((transcript: string) => void) | null = null
  private tempDir: string = os.tmpdir()
  private audioFile: string = path.join(os.tmpdir(), "genx_audio.wav")
  private isInitialized = false

  async initialize(): Promise<void> {
    console.log("Voice Controller initializing...")

    try {
      // Check platform capabilities
      const platform = os.platform()

      if (platform === "darwin") {
        // Check macOS speech capabilities
        await this.execPromise("which say")
        console.log("macOS speech synthesis available")
      } else if (platform === "win32") {
        // Check Windows PowerShell
        await this.execPromise('powershell -Command "Get-Command Add-Type"')
        console.log("Windows PowerShell speech capabilities available")
      } else {
        // Check Linux speech tools
        try {
          await this.execPromise("which espeak")
          console.log("Linux espeak available")
        } catch {
          try {
            await this.execPromise("which festival")
            console.log("Linux festival available")
          } catch {
            console.warn("No Linux TTS tools found")
          }
        }
      }

      this.isInitialized = true
      console.log("Voice Controller initialized successfully")
    } catch (error) {
      console.warn("Voice Controller initialization with limited capabilities:", error)
      this.isInitialized = true // Still allow operation with fallbacks
    }
  }

  private async execPromise(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve(stdout.trim())
        }
      })
    })
  }

  async startListening(onTranscript: (transcript: string) => void): Promise<boolean> {
    if (this.isListening) {
      return true
    }

    if (!this.isInitialized) {
      console.warn("Voice controller not initialized")
      return false
    }

    try {
      this.onTranscriptCallback = onTranscript
      this.isListening = true
      console.log("Starting voice recognition...")

      // For now, we'll use a simulation approach since real speech recognition
      // requires additional setup and permissions
      return await this.startSimulatedListening()
    } catch (error) {
      console.error("Failed to start listening:", error)
      this.isListening = false
      return false
    }
  }

  private async startSimulatedListening(): Promise<boolean> {
    // Create a more realistic simulation that waits for user input
    console.log("Voice recognition active - simulating speech input...")

    // Simulate listening for 3-5 seconds
    const listenDuration = 3000 + Math.random() * 2000

    setTimeout(() => {
      if (this.isListening && this.onTranscriptCallback) {
        // Use more realistic voice commands
        const realisticCommands = [
          "What time is it?",
          "Open calculator",
          "Show me the files in this folder",
          "What's my system information?",
          "Open Chrome browser",
          "Create a new file",
          "Show CPU usage",
          "What's today's date?",
          "Open Visual Studio Code",
          "List all running processes",
          "Show memory usage",
          "Open file explorer",
          "What's my IP address?",
          "Create a new folder",
          "Open terminal",
        ]

        const command = realisticCommands[Math.floor(Math.random() * realisticCommands.length)]
        console.log("Simulated voice input:", command)
        this.onTranscriptCallback(command)
      }
      this.isListening = false
    }, listenDuration)

    return true
  }

  async stopListening(): Promise<boolean> {
    if (!this.isListening) {
      return true
    }

    try {
      this.isListening = false

      if (this.recognitionProcess) {
        this.recognitionProcess.kill()
        this.recognitionProcess = null
      }

      console.log("Voice recognition stopped")
      return true
    } catch (error) {
      console.error("Failed to stop listening:", error)
      return false
    }
  }

  async speak(text: string, options?: VoiceOptions): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn("Voice controller not initialized")
      return false
    }

    if (this.isSpeaking) {
      await this.stopSpeaking()
    }

    try {
      this.isSpeaking = true
      console.log("Speaking:", text)

      // Use platform-specific text-to-speech
      const platform = os.platform()

      if (platform === "darwin") {
        await this.speakMacOS(text, options)
      } else if (platform === "win32") {
        await this.speakWindows(text, options)
      } else {
        await this.speakLinux(text, options)
      }

      return true
    } catch (error) {
      console.error("Failed to speak:", error)
      this.isSpeaking = false
      return false
    }
  }

  async stopSpeaking(): Promise<boolean> {
    try {
      if (this.speechProcess) {
        this.speechProcess.kill()
        this.speechProcess = null
      }
      this.isSpeaking = false
      return true
    } catch (error) {
      console.error("Failed to stop speaking:", error)
      return false
    }
  }

  private async speakMacOS(text: string, options?: VoiceOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = []

      if (options?.rate) {
        args.push("-r", options.rate.toString())
      }

      if (options?.voice) {
        args.push("-v", options.voice)
      }

      args.push(text)

      this.speechProcess = spawn("say", args)

      this.speechProcess.on("close", (code) => {
        this.isSpeaking = false
        this.speechProcess = null
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Speech process exited with code ${code}`))
        }
      })

      this.speechProcess.on("error", (error) => {
        this.isSpeaking = false
        this.speechProcess = null
        reject(error)
      })
    })
  }

  private async speakWindows(text: string, options?: VoiceOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const rate = options?.rate || 0
      const volume = options?.volume || 100

      // Create PowerShell command for speech
      const psCommand = `
        Add-Type -AssemblyName System.Speech;
        $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $synth.Rate = ${rate};
        $synth.Volume = ${volume};
        $synth.Speak('${text.replace(/'/g, "''")}');
      `

      this.speechProcess = spawn("powershell", ["-Command", psCommand])

      this.speechProcess.on("close", (code) => {
        this.isSpeaking = false
        this.speechProcess = null
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Speech process exited with code ${code}`))
        }
      })

      this.speechProcess.on("error", (error) => {
        this.isSpeaking = false
        this.speechProcess = null
        reject(error)
      })
    })
  }

  private async speakLinux(text: string, options?: VoiceOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      // Try espeak first
      this.speechProcess = spawn("espeak", [text])

      this.speechProcess.on("close", (code) => {
        this.isSpeaking = false
        this.speechProcess = null

        if (code === 0) {
          resolve()
        } else {
          // Try festival as fallback
          this.speechProcess = spawn("bash", ["-c", `echo "${text}" | festival --tts`])

          this.speechProcess.on("close", () => {
            this.isSpeaking = false
            this.speechProcess = null
            resolve() // Don't fail if TTS is not available
          })

          this.speechProcess.on("error", () => {
            this.isSpeaking = false
            this.speechProcess = null
            console.log("TTS not available, but continuing...")
            resolve() // Don't fail if TTS is not available
          })
        }
      })

      this.speechProcess.on("error", () => {
        // Try festival as fallback
        this.speechProcess = spawn("bash", ["-c", `echo "${text}" | festival --tts`])

        this.speechProcess.on("close", () => {
          this.isSpeaking = false
          this.speechProcess = null
          resolve()
        })

        this.speechProcess.on("error", () => {
          this.isSpeaking = false
          this.speechProcess = null
          console.log("TTS not available, but continuing...")
          resolve()
        })
      })
    })
  }

  cleanup(): void {
    if (this.recognitionProcess) {
      this.recognitionProcess.kill()
      this.recognitionProcess = null
    }

    if (this.speechProcess) {
      this.speechProcess.kill()
      this.speechProcess = null
    }

    this.isListening = false
    this.isSpeaking = false

    // Clean up temporary files
    try {
      fs.access(this.audioFile)
        .then(() => {
          fs.unlink(this.audioFile)
        })
        .catch(() => {
          // Ignore errors
        })
    } catch (error) {
      // Ignore errors
    }
  }
}
