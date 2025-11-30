# Coderoom — Frontend

Frontend for Coderoom — a realtime collaborative code editor UI built with React.

Quick overview
- React app (Create React App / Vite style)
- Socket.io client for realtime collaboration (rooms, user join/leave, code sync)
- Integrated compile UI that calls backend /compile endpoint
- Uses these notable packages:
  - react, react-dom, react-router-dom
  - axios
  - react-hot-toast
  - react-nice-avatar
  - (monaco/ace or simple textarea used for editor)

Repository layout (important files)
- src/
  - components/
    - Home.js — room creation / join UI (two-column layout, banner)
    - EditorPage.js — main editor layout, sidebar, language selector, compiler toggle
    - Editor.js — editor component (initializes editor instance)
    - Client.js — small component for rendering a connected user (avatar + name)
    - components.css — shared styles for pages and compiler/resizer UI
  - services/
    - api.js — central axios instance and compileCode() helper used by UI
  - Socket.js — socket initialization helper (used by EditorPage)
  - Actions.js — socket event constants
  - index.js / App.js — app entry and routes
- public/
  - images/ — logos and banner images used by Home & Editor

Environment
- Create a .env file at the frontend root for local development:
  - REACT_APP_BACKEND_URL=http://localhost:5000
  - (Optional) other CRA/Vite variables as needed
- The frontend uses REACT_APP_BACKEND_URL to call backend APIs (see src/services/api.js).

Scripts (typical)
- npm install
- npm start        # run dev server (localhost:3000 by default)
- npm run build    # build production bundle
- npm test         # (if tests added)

How the compile flow works
1. EditorPage calls compileCode(code, language) from src/services/api.js.
2. api.js posts to `${REACT_APP_BACKEND_URL}/compile`.
3. Backend proxies the request to JDoodle (or configured executor) and returns output/error.
4. EditorPage displays output in the resizable compiler panel.

Styling & Layout notes
- components.css holds layout tweaks: banner column, resizable compiler panel, .lang-select styles, and sidebar appearance.
- Compiler panel is implemented as a fixed bottom overlay that is horizontally offset to avoid covering the left sidebar; it is resizable by dragging the top handle (min 10% — max 75% of viewport height).

Common troubleshooting
- Blank compile output / 500 from /compile:
  - Ensure backend is running and REACT_APP_BACKEND_URL points to it.
- Socket connection fails:
  - Confirm backend allowed origin (in backend/.env PRODUCTION_URL or localhost setting).
  - Make sure frontend and backend use compatible socket.io versions.
- CSS changes not taking effect:
  - Confirm components.css is imported in the component file(s).
  - Check for Bootstrap utility classes that can override custom styles (e.g., container padding, column gutters).

Deployment
- Build frontend: npm run build
- Serve build with static host (Netlify, Vercel) or configure your Render/webserver to serve static assets.
- Set REACT_APP_BACKEND_URL in production to your backend Render service URL.