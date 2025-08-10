![GenX logo](https://github.com/Jadhav-Krishna/GenX/blob/main/assets/GenX_%20icon.png?raw=true)


# GenX Tactical Operations

A cyberpunk-themed desktop application built with Electron, React, and TypeScript.

## 🚀 Quick Start

1. **Clone and Install**
   \`\`\`bash
   git clone <https://github.com/Jadhav-Krishna/GenX.git>
   cd genx
   npm install
   \`\`\`

2. **Environment Setup**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Development**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🔧 Environment Variables

### Required for Production
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GEMINI_API_KEY` - Google Gemini API key

### Optional Configuration
- `THEME_ACCENT_COLOR` - Customize the cyberpunk accent color
- `WINDOW_WIDTH/HEIGHT` - Default window dimensions
- `SPEECH_LANG` - Voice recognition language

### Development Only
- `ENABLE_MOCK_AUTH=true` - Use mock authentication
- `ENABLE_MOCK_AI=true` - Use mock AI responses
- `ENABLE_DEV_TOOLS=true` - Enable Electron dev tools

## 📁 Project Structure

\`\`\`
genx-electron-app/
├── .env.example          # Environment template
├── .env                  # Your local environment (git-ignored)
├── electron/             # Electron main process
├── src/                  # React renderer process
│   ├── config/           # Configuration helpers
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   └── styles/           # Themes and styles
└── package.json          # Dependencies and scripts
\`\`\`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run dist` - Create distributable packages
- `npm run dist:win` - Windows build
- `npm run dist:mac` - macOS build
- `npm run dist:linux` - Linux build

## 🔐 Security Notes

- Never commit `.env` files to version control
- Use strong encryption keys in production
- Enable proper CSP headers for security
- Validate all environment variables on startup

## 🎨 Customization

You can customize the cyberpunk theme by setting environment variables:

\`\`\`env
THEME_ACCENT_COLOR=#ff0080      # Hot pink accent
THEME_SUCCESS_COLOR=#00ff00     # Bright green
THEME_WARNING_COLOR=#ffff00     # Yellow warning
THEME_ERROR_COLOR=#ff0000       # Red error
\`\`\`
