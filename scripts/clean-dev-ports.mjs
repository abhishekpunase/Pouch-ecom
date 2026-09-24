import { execFileSync, execSync } from 'node:child_process'
import process from 'node:process'

const ports = [5173, 8787]

function windowsPids(port) {
  const output = execSync('netstat -ano -p tcp', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  return [...new Set(
    output
      .split(/\r?\n/)
      .filter((line) => line.includes(`:${port}`) && /LISTENING\s+\d+\s*$/.test(line))
      .map((line) => line.trim().split(/\s+/).at(-1))
      .filter((pid) => pid && pid !== String(process.pid)),
  )]
}

function unixPids(port) {
  try {
    return execSync(`lsof -ti :${port}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split(/\r?\n/)
      .filter(Boolean)
  } catch {
    return []
  }
}

for (const port of ports) {
  const pids = process.platform === 'win32' ? windowsPids(port) : unixPids(port)
  for (const pid of pids) {
    try {
      if (process.platform === 'win32') execFileSync('taskkill', ['/PID', pid, '/T', '/F'], { stdio: 'ignore' })
      else process.kill(Number(pid), 'SIGTERM')
    } catch {
      // The process may have exited between discovery and cleanup.
    }
  }
}
