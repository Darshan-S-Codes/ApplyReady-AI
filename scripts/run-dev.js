import { spawn } from 'node:child_process'
import net from 'node:net'

const DEFAULT_BACKEND_PORT = 5000

function isWindows() {
  return process.platform === 'win32'
}

async function findAvailablePort(startPort = DEFAULT_BACKEND_PORT) {
  const preferredPort = Number(startPort) || DEFAULT_BACKEND_PORT

  for (let port = preferredPort; port < preferredPort + 20; port += 1) {
    const available = await new Promise(resolve => {
      const tester = net.createServer()
      tester.once('error', () => resolve(false))
      tester.once('listening', () => {
        tester.close(() => resolve(true))
      })
      tester.listen(port, '127.0.0.1')
    })

    if (available) return port
  }

  return preferredPort
}

const backendPort = await findAvailablePort(process.env.PORT || DEFAULT_BACKEND_PORT)
const backendEnv = { ...process.env, PORT: String(backendPort) }
const frontendEnv = { ...process.env, PORT: String(backendPort), VITE_API_TARGET: `http://localhost:${backendPort}` }

const runNpm = (args, env) => {
  if (process.env.npm_execpath) {
    return spawn(process.execPath, [process.env.npm_execpath, ...args], { stdio: 'inherit', env })
  }

  if (isWindows()) {
    return spawn('cmd.exe', ['/d', '/s', '/c', `npm ${args.join(' ')}`], { stdio: 'inherit', env })
  }

  return spawn('npm', args, { stdio: 'inherit', env })
}

const backend = runNpm(['run', 'dev', '--workspace', 'backend'], backendEnv)
const frontend = runNpm(['run', 'dev', '--workspace', 'frontend'], frontendEnv)

backend.on('exit', code => {
  frontend.kill(code ? 'SIGTERM' : 'SIGINT')
  process.exit(code ?? 0)
})

frontend.on('exit', code => {
  backend.kill(code ? 'SIGTERM' : 'SIGINT')
  process.exit(code ?? 0)
})
