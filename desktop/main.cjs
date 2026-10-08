const { app, BrowserWindow, shell } = require('electron')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const fs = require('node:fs')
const path = require('node:path')

let apiServer
let apiPort
let quitting = false

async function createWindow() {
  const envPath = app.isPackaged
    ? path.join(app.getPath('userData'), '.env')
    : path.join(app.getAppPath(), 'backend', '.env')
  dotenv.config({ path: envPath })
  process.env.NODE_ENV = 'production'
  process.env.UPLOADS_DIR = path.join(app.getPath('userData'), 'uploads')
  fs.mkdirSync(process.env.UPLOADS_DIR, { recursive: true })

  if (!apiServer) {
    const { startServer } = await import('../backend/server/index.js')
    const running = await startServer({ port: 0, host: '127.0.0.1' })
    apiServer = running.server
    apiPort = running.port
  }

  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 900,
    minHeight: 650,
    title: 'ApplyReady AI',
    backgroundColor: '#f7f9ff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  })

  const appOrigin = `http://127.0.0.1:${apiPort}`
  window.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const target = new URL(url)
      if (target.protocol === 'https:' || target.protocol === 'http:') shell.openExternal(target.href)
    } catch {}
    return { action: 'deny' }
  })
  window.webContents.on('will-navigate', (event, url) => {
    try {
      const target = new URL(url)
      if (target.origin !== appOrigin) {
        event.preventDefault()
        if (target.protocol === 'https:' || target.protocol === 'http:') shell.openExternal(target.href)
      }
    } catch { event.preventDefault() }
  })

  await window.loadURL(appOrigin)
}

app.whenReady().then(() => {
  app.setPath('userData', path.join(app.getPath('appData'), 'ApplyReady AI'))
  return createWindow()
}).catch(error => {
  console.error('Could not start ApplyReady AI desktop app:', error)
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow().catch(console.error)
})

app.on('before-quit', event => {
  if (quitting || !apiServer) return
  event.preventDefault()
  apiServer.close(async () => {
    await mongoose.disconnect().catch(() => {})
    quitting = true
    app.quit()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
