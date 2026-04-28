# Stezix AI (Web MVP)

A web-first chatbot with:
- text chat
- voice input (browser speech recognition)
- voice output (browser speech synthesis)
- streaming assistant response
- hold-to-talk (push-to-talk) button
- privacy mode (no chat persistence in browser)

## 1) Prerequisites

- Node.js 20+ with `npm` available in terminal.
- A Groq API key.

## 2) Setup

1. Copy env file:
   - `copy .env.example .env.local` (PowerShell: `Copy-Item .env.example .env.local`)
2. Set `GROQ_API_KEY` in `.env.local`.
3. Install dependencies:
   - `npm install`
4. Run dev server:
   - `npm run dev`
5. Open `http://localhost:3000`.

## 3) API Routes

- `POST /api/chat-stream` - streams assistant text token-by-token from Groq

## 4) Deploy (Vercel)

1. Push code to GitHub.
2. Import repo in Vercel.
3. Add environment variables:
   - `GROQ_API_KEY`
   - `GROQ_MODEL` (optional, default `llama-3.3-70b-versatile`)
4. Deploy and test voice permissions over HTTPS.

## 5) Notes

- Browser microphone usage needs HTTPS in production.
- Speech recognition quality depends on browser support (Chrome/Edge recommended).
- Keep API keys server-only; never expose them in client code.
- Privacy mode defaults:
  - chat history is not stored in localStorage
  - only last 12 messages are sent to model for context
  - basic sensitive values (email/phone/long numbers/API-like tokens) are redacted before model call
