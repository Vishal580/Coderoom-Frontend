# Coderoom — Frontend

Frontend for Coderoom — a realtime collaborative code editor UI built with React.

Quick overview
- React app (Create React App / Vite style)
- Socket.io client for realtime collaboration (rooms, user join/leave, code sync)
- Integrated compile UI that calls backend /compile endpoint
- Built-in AI Assistant (Perplexity) accessible via chat widget
- Uses these notable packages:
  - react, react-dom, react-router-dom
  - axios
  - react-hot-toast
  - react-nice-avatar
  - (monaco/ace or simple textarea used for editor)

AI Assistant (Perplexity)
- Purpose: provide in-editor AI help, code hints and context-aware answers via a chat widget.
- Frontend -> Backend flow:
  - Frontend posts user message to backend POST /chat.
  - Backend forwards the request to Perplexity (server-side) and returns a safe reply plus optional search results.
- Request (frontend):
  - POST /chat
  - Body: { "message": "Your question here" }
- Response (backend):
  - { "reply": "AI answer text", "search_results": [ ... ] }
- Environment:
  - Backend requires PERPLEXITY_API_KEY in backend/.env (do NOT commit).
  - Example backend .env entry:
    PERPLEXITY_API_KEY=sk_...
- Notes:
  - All Perplexity calls are proxied through the backend for security (keys never exposed to clients).
  - Expect rate limits / usage constraints from Perplexity — handle errors gracefully in UI.
  - The chat widget is mounted only on the editor page ( /editor/:roomId ).

Repository layout (important files)
- src/
  - components/
    - Home.js — room creation / join UI (two-column layout, banner)
    - EditorPage.js — main editor layout, sidebar, language selector, compiler toggle, chat widget
    - Editor.js — editor component (initializes editor instance)
    - ChatbotWidget.js — frontend chat UI (draggable, tooltip, messages)
    - Client.js — renders a connected user (avatar + name)
    - components.css, styles/chatbot.css — shared styles
  - services/
    - api.js — central axios instance and compileCode() and chatAPI helpers
  - Socket.js — socket initialization helper (used by EditorPage)
  - Actions.js — socket event constants
  - index.js / App.js — app entry and routes
- public/
  - images/ — logos and banner images used by Home & Editor

Environment
- Create a .env file at the frontend root for local development:
  - REACT_APP_BACKEND_URL=http://localhost:5000
  - (Optional) other CRA/Vite variables as needed
- Backend .env must include PERPLEXITY_API_KEY (see backend README).

Scripts (typical)
- npm install
- npm start        # run dev server (localhost:3000 by default)
- npm run build    # build production bundle
- npm test         # (if tests added)

How the compile & AI flows work
1. EditorPage calls compileCode(code, language) from src/services/api.js for compilation.
2. EditorPage posts chat messages to src/services/api.js -> POST /chat for AI replies.
3. Backend proxies compile to JDoodle and chat to Perplexity and returns structured output.
4. EditorPage displays output in the resizable compiler panel and AI replies in the chat widget.

Testing endpoints locally
- Test chat locally:
```
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I reverse a string in Python?"}'
```
- Test compile locally:
```
curl -X POST http://localhost:5000/compile \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"hi\")","language":"python3"}'
```

Deployment
- Build frontend: npm run build
- Serve build with static host (Netlify, Vercel) or configure Render/webserver to serve static assets.
- Set REACT_APP_BACKEND_URL in production to your backend Render service URL.
- Backend deployed on Render must have PERPLEXITY_API_KEY and JDoodle credentials set in Render environment.

Security & privacy
- API keys are stored only on the server (backend .env / Render env vars).
- Consider trimming or not forwarding sensitive user code to external LLMs if privacy is a concern.