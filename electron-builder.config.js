const output = process.env.DESKTOP_BUILD_OUTPUT || 'release'

export default {
  appId: 'ai.applyready.desktop',
  productName: 'ApplyReady AI',
  directories: { output },
  files: [
    'desktop/**/*',
    'backend/server/**/*',
    'frontend/dist/**/*',
    'node_modules/**/*',
    'package.json',
  ],
  asar: true,
  win: { target: 'nsis' },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
  },
}
