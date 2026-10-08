import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(root, 'desktop-installer')
const temporaryOutput = path.join(os.tmpdir(), `ApplyReady-AI-Desktop-${process.pid}-${Date.now()}`)
const npmCli = process.env.npm_execpath
const command = npmCli ? process.execPath : process.platform === 'win32' ? 'npm.cmd' : 'npm'
const args = npmCli
  ? [npmCli, 'exec', 'electron-builder', '--', '--config', 'electron-builder.config.js', '--win', 'nsis']
  : ['exec', 'electron-builder', '--', '--config', 'electron-builder.config.js', '--win', 'nsis']

await fs.mkdir(outputDir, { recursive: true })
await fs.mkdir(temporaryOutput, { recursive: true })

const result = await new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    cwd: root,
    env: { ...process.env, DESKTOP_BUILD_OUTPUT: temporaryOutput },
    stdio: 'inherit',
  })
  child.once('error', reject)
  child.once('exit', code => resolve(code ?? 1))
})

if (result !== 0) process.exit(result)

const artifacts = (await fs.readdir(temporaryOutput, { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.exe'))
if (!artifacts.length) throw new Error('electron-builder completed without producing a Windows installer.')

for (const artifact of artifacts) {
  await fs.copyFile(path.join(temporaryOutput, artifact.name), path.join(outputDir, artifact.name))
}

const resolvedTemporaryOutput = path.resolve(temporaryOutput)
const resolvedTempRoot = path.resolve(os.tmpdir())
if (!resolvedTemporaryOutput.startsWith(`${resolvedTempRoot}${path.sep}`)) {
  throw new Error('Refusing to clean a build path outside the operating system temp directory.')
}
await fs.rm(resolvedTemporaryOutput, { recursive: true, force: true })
console.log(`Windows installer copied to ${outputDir}`)
