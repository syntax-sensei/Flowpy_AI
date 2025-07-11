# 🚀 Quick Setup Guide

## 🔧 Setup Steps:

### 1. Set your OpenAI API key
Edit `server/.env` and replace `your-openai-api-key-here` with your actual API key:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3001
```

### 2. Start both servers
Run this command to start both frontend and backend:
```bash
npm run dev:full
```

Or start them separately:
- Backend: `cd server && npm run dev`
- Frontend: `npm run dev`

### 3. Access the app
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

