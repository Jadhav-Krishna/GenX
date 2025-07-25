import { spawn, type ChildProcess } from "child_process"
import { promises as fs } from "fs"
import * as os from "os"

export interface SystemInfo {
  platform: string
  arch: string
  cpus: number
  memory: {
    total: number
    free: number
    used: number
  }
  uptime: number
  hostname: string
  username: string
  homeDir: string
  tempDir: string
}

export interface CommandResult {
  success: boolean
  output: string
  error?: string
  exitCode?: number
}

export class SystemController {
  private runningProcesses: Map<string, ChildProcess> = new Map()

  async executeCommand(command: string, args?: string[]): Promise<CommandResult> {
    return new Promise((resolve) => {
      const processId = Date.now().toString()

      try {
        const childProcess = spawn(command, args || [], {
          stdio: ["pipe", "pipe", "pipe"],
          shell: true,
        })

        this.runningProcesses.set(processId, childProcess)

        let output = ""
        let error = ""

        childProcess.stdout?.on("data", (data) => {
          output += data.toString()
        })

        childProcess.stderr?.on("data", (data) => {
          error += data.toString()
        })

        childProcess.on("close", (code) => {
          this.runningProcesses.delete(processId)
          resolve({
            success: code === 0,
            output: output.trim(),
            error: error.trim() || undefined,
            exitCode: code || undefined,
          })
        })

        childProcess.on("error", (err) => {
          this.runningProcesses.delete(processId)
          resolve({
            success: false,
            output: "",
            error: err.message,
          })
        })

        // Set timeout for long-running commands
        setTimeout(() => {
          if (this.runningProcesses.has(processId)) {
            childProcess.kill()
            this.runningProcesses.delete(processId)
            resolve({
              success: false,
              output: output.trim(),
              error: "Command timeout",
            })
          }
        }, 30000) // 30 second timeout
      } catch (error) {
        resolve({
          success: false,
          output: "",
          error: (error as Error).message,
        })
      }
    })
  }

  async fileOperation(operation: string, path: string, data?: any): Promise<CommandResult> {
    try {
      switch (operation) {
        case "read":
          const content = await fs.readFile(path, "utf-8")
          return {
            success: true,
            output: content,
          }

        case "write":
          await fs.writeFile(path, data || "", "utf-8")
          return {
            success: true,
            output: `File written to ${path}`,
          }

        case "create":
          await fs.writeFile(path, "", "utf-8")
          return {
            success: true,
            output: `File created at ${path}`,
          }

        case "mkdir":
          await fs.mkdir(path, { recursive: true })
          return {
            success: true,
            output: `Directory created at ${path}`,
          }

        case "delete":
          await fs.unlink(path)
          return {
            success: true,
            output: `File deleted: ${path}`,
          }

        case "rmdir":
          await fs.rmdir(path, { recursive: true })
          return {
            success: true,
            output: `Directory deleted: ${path}`,
          }

        case "list":
          const files = await fs.readdir(path)
          return {
            success: true,
            output: files.join("\n"),
          }

        case "stat":
          const stats = await fs.stat(path)
          return {
            success: true,
            output: JSON.stringify(
              {
                size: stats.size,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory(),
                modified: stats.mtime,
                created: stats.birthtime,
              },
              null,
              2,
            ),
          }

        case "copy":
          await fs.copyFile(path, data)
          return {
            success: true,
            output: `File copied from ${path} to ${data}`,
          }

        case "move":
          await fs.rename(path, data)
          return {
            success: true,
            output: `File moved from ${path} to ${data}`,
          }

        default:
          return {
            success: false,
            output: "",
            error: `Unknown file operation: ${operation}`,
          }
      }
    } catch (error) {
      return {
        success: false,
        output: "",
        error: (error as Error).message,
      }
    }
  }

  async getSystemInfo(): Promise<SystemInfo> {
    const cpus = os.cpus()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()

    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: cpus.length,
      memory: {
        total: totalMemory,
        free: freeMemory,
        used: totalMemory - freeMemory,
      },
      uptime: os.uptime(),
      hostname: os.hostname(),
      username: os.userInfo().username,
      homeDir: os.homedir(),
      tempDir: os.tmpdir(),
    }
  }

  async openApplication(appName: string): Promise<CommandResult> {
    let command: string
    let args: string[] = []

    switch (os.platform()) {
      case "win32":
        command = "start"
        args = ["", appName]
        break
      case "darwin":
        command = "open"
        args = ["-a", appName]
        break
      case "linux":
        command = appName.toLowerCase()
        break
      default:
        return {
          success: false,
          output: "",
          error: "Unsupported platform",
        }
    }

    return await this.executeCommand(command, args)
  }

  async getRunningProcesses(): Promise<CommandResult> {
    const command = os.platform() === "win32" ? "tasklist" : "ps aux"
    return await this.executeCommand(command)
  }

  async killProcess(processName: string): Promise<CommandResult> {
    const command = os.platform() === "win32" ? "taskkill" : "pkill"
    const args = os.platform() === "win32" ? ["/F", "/IM", processName] : [processName]
    return await this.executeCommand(command, args)
  }

  async getNetworkInfo(): Promise<CommandResult> {
    const command = os.platform() === "win32" ? "ipconfig" : "ifconfig"
    return await this.executeCommand(command)
  }

  async getDiskUsage(): Promise<CommandResult> {
    const command = os.platform() === "win32" ? "dir" : "df -h"
    return await this.executeCommand(command)
  }

  cleanup(): void {
    // Kill all running processes
    for (const [id, process] of this.runningProcesses) {
      try {
        process.kill()
      } catch (error) {
        console.error(`Failed to kill process ${id}:`, error)
      }
    }
    this.runningProcesses.clear()
  }
}
