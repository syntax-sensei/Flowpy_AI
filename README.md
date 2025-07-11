# FlowChart AI

A modern flowchart generator built with React, Vite, Material-UI, and Mermaid.js. Generate, view, and interact with flowcharts, and ask questions about your process using AI.

## Features
- Generate flowcharts from natural language descriptions
- Interactive, zoomable, pannable, and resizable flowchart area
- Ask questions about the flowchart in natural language (LLM-powered Q&A)
- Download flowcharts as SVG, PNG, or JPEG
- Clean, responsive Material-UI design

## Setup

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Set up your OpenAI API key
Create a `.env` file in the `server/` directory:
```
OPENAI_API_KEY=your-openai-api-key-here
PORT=3001
```

### 4. Start the Backend Server
```bash
cd server
npm run dev
```

### 5. Start the Frontend (in a new terminal)
```bash
npm run dev
```

## Usage
- Enter a process description to generate a flowchart
- Zoom, pan, and resize the chart area as needed
- Click "Ask about this flowchart" to get AI-powered answers about any part of the process
- Download your flowchart in multiple formats

---
MIT License
