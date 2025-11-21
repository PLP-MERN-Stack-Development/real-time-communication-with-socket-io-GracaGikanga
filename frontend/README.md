# Real-Time Chat App - Frontend

This is the **frontend** of a real-time chat application built with **React**, **Socket.IO**, and **Vite**.  
It supports **global chat**, **private messaging**, **typing indicators**, and **message reactions**.

---

## Features

- Global chat room for all users
- Private one-on-one chat
- Typing indicators for active users
- Message reactions
- File attachments (optional)

---

## Tech Stack

- React (functional components + hooks)
- Socket.IO client
- Vite for development
- Axios / Fetch for API requests

---

## Getting Started

### 1. Clone the repository

```bash
git clone <frontend-repo-url>
cd frontend


2. Install dependencies
npm install


3. Environment Variables
Create a .env file in the root:
VITE_BACKEND_URL=http://localhost:5000

4. Run the development server
npm run dev

Project Structure
frontend/
├─ src/
│  ├─ components/     # UI components (ChatBox, MessageList, etc.)
│  ├─ hooks/          # Custom hooks (useChat)
│  ├─ pages/          # Pages (Login, Dashboard, Chat)
│  ├─ socket.js       # Socket.IO client setup
│  └─ main.jsx        # App entry point
├─ public/            # Static assets
├─ package.json
└─ vite.config.js