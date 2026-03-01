# 🧠 DevMentor AI
### Real-Time AI Coding Mentor for Beginner Developers

> Built for **WeMakeDevs Hack All February** Hackathon — powered by **Vision Agents SDK** + **Stream** + **Gemini**

[![Stream](https://img.shields.io/badge/Powered%20by-Stream-blue)](https://getstream.io)
[![Gemini](https://img.shields.io/badge/AI-Gemini%20Realtime-green)](https://ai.google.dev)
[![Vision Agents](https://img.shields.io/badge/SDK-Vision%20Agents-purple)](https://getstream.io/video/docs/python/agents/)

---

## 🎯 The Problem

Millions of beginner developers get stuck on simple bugs and concepts — and have **nobody to ask**. Stack Overflow is intimidating. YouTube tutorials don't answer YOUR specific question. Hiring a tutor costs money.

**DevMentor AI solves this** — a real-time AI mentor that listens to your voice, watches your code, and teaches you like a patient senior developer. Free. Always available.

This directly aligns with WeMakeDevs' mission: **"Quality education, free for all."**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎤 **Voice Interaction** | Speak your question naturally — AI responds with voice |
| 👁️ **Screen Monitoring** | AI watches your code in real-time via Stream Video |
| 💬 **Text Chat** | Type questions and get instant AI responses |
| 🌐 **Multi-Language** | Python, JavaScript, Java, C++, C, TypeScript |
| ▶️ **Code Execution** | Run code directly in the browser terminal |
| 📊 **Progress Tracking** | Skill tags, progress bar, session stats |
| ⏱️ **Session Timer** | Live session tracking |
| 🔴 **Live Connection** | Real-time Stream edge connection |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    DevMentor AI                      │
├──────────────────┬──────────────────────────────────┤
│   Frontend       │         Backend                  │
│   React + Vite   │   Vision Agents SDK (Python)     │
│                  │                                  │
│  Stream Video    │   Agent ──► Gemini Realtime      │
│  React SDK       │   Edge  ──► GetStream Edge       │
│                  │   STT   ──► Deepgram             │
│  Voice Input     │                                  │
│  Code Editor     │   Token Server (FastAPI)         │
│  Terminal        │                                  │
└──────────────────┴──────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Vision Agents SDK** — Agent orchestration, voice pipeline, video monitoring
- **Stream Video** — Real-time audio/video edge network (333k free minutes!)
- **Gemini 2.5 Flash Native Audio** — Speech-to-speech AI model
- **Deepgram** — Speech-to-text transcription
- **React + Vite** — Frontend
- **FastAPI** — Token server backend

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11
- Node.js 18+
- API Keys: Stream, Gemini, Deepgram

### 1. Clone the repo
```bash
git clone https://github.com/jass2422/DevMentorAI.git
cd DevMentorAI
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Create `.env` file in backend/
```env
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
GEMINI_API_KEY=your_gemini_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

### 5. Create `frontend/.env.local`
```env
VITE_STREAM_API_KEY=your_stream_api_key
```

### 6. Run Everything

**Terminal 1 — AI Agent:**
```bash
cd backend && python agent.py
```

**Terminal 2 — Token Server:**
```bash
cd backend && python token_server.py
```

**Terminal 3 — Frontend:**
```bash
cd frontend && npm run dev
```

Open **http://localhost:5173** 🎉

---

## 🎬 How It Works

1. Student opens DevMentor AI and enters their name
2. Selects their programming language (Python, JS, Java, C++, C, TypeScript)
3. Joins the live session — connects to Stream's edge network
4. The Vision Agents AI agent is already waiting in the call
5. Student **speaks** their coding question OR **types** it in chat
6. Gemini Realtime processes audio and **responds with voice**
7. Session tracks questions asked, bugs fixed, and skill progress

---

## 💡 Vision Agents SDK Usage

This project showcases multiple Vision Agents SDK features:

```python
# Agent with Gemini Realtime voice
agent = Agent(
    edge=GetStreamEdge(...),       # Stream edge connection
    agent_user=agent_user,         # AI participant
    instructions="...",            # Mentor personality
    llm=GeminiRealtime(            # Voice AI
        model="gemini-2.5-flash-native-audio-preview-12-2025"
    ),
)

# Join the call and listen
async with agent.join(call):
    # AI is now live — listening and responding with voice!
```

---

## 🌍 Impact

- **Free** — powered by free tiers of Stream (333k minutes), Gemini, and Deepgram
- **Accessible** — works in any browser, no install needed
- **Multi-language** — serves developers learning any major language
- **Voice-first** — natural interaction, just like talking to a real mentor

---

## 👩‍💻 Built By

**Jasmeen** — WeMakeDevs Community Member

Built with ❤️ for the WeMakeDevs Hack All February Hackathon 2025

---

## 📄 License

MIT
