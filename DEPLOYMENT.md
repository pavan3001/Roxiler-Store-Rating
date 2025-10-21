Backend deployment and CORS guide

This project includes both frontend (Vite + React) and backend (Express + MySQL).

Purpose
- Ensure the backend accepts requests from the deployed frontend at https://roxiler-rating.netlify.app
- Provide quick env var checklist and deploy guidance for common hosts (Render / Railway / Vercel)

Key environment variables
- NODE_ENV=production
- PORT=5000 (or host-provided port)
- JWT_SECRET=your_jwt_secret_here
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (or a single MYSQL_URL / MYSQL_PUBLIC_URL)
- FRONTEND_URL or FRONTEND_URLS (comma separated)
  - Example: FRONTEND_URLS=https://roxiler-rating.netlify.app,https://another.example.com

CORS behaviour (what we changed)
- In development (NODE_ENV !== 'production') the server allows any origin (origin: true) for easier local dev with Vite.
- In production, the server uses FRONTEND_URLS or FRONTEND_URL. If none are provided, it will default to:
  - https://roxiler-rating.netlify.app

Recommended steps to deploy backend
1) Choose host
   - Render: fast, easy for Node + MySQL (managed Postgres is separate)
   - Railway: easy and supports managed MySQL
   - Vercel: better for serverless functions; this app expects a long-running server so prefer Render/Railway

2) Set environment variables in the host dashboard
   - Set NODE_ENV=production
   - Set JWT_SECRET (required)
   - Provide DB credentials or MYSQL_URL
   - Set FRONTEND_URLS to the exact origin(s) used by your frontend (for Netlify it's https://roxiler-rating.netlify.app)

3) Deploy
   - Push repository to the host (connect GitHub repo) or deploy via CLI
   - Ensure build command (if required) is `npm install` and start command is `node server/index.js` or `npm run start` depending on hosting

4) Confirm
   - Check logs for: "Server running on port" and "Allowed frontend origins:" lines
   - Hit the health endpoint: https://<your-backend>/api/health should return JSON

Local testing with deployed frontend
- If you want the deployed frontend to hit your local backend for testing, you can:
  1. Expose local server with a tunnel like ngrok: `ngrok http 5000` and set FRONTEND url on Netlify (or modify frontend local dev to point at the tunnel).
  2. Temporarily set FRONTEND_URLS on your backend to include the Netlify URL.

Notes and security
- Do not commit JWT_SECRET or DB credentials to the repo. Use host secret settings.
- For production, consider hashing the default seeded passwords and/or forcing a password reset for seeded accounts.

If you want, I can:
- Add a .env.example file for local testing
- Prepare a Render/Railway deployment step-by-step with screenshots or exact UI fields
- Update the frontend Vite build config to include VITE_API_BASE_URL in Netlify deployment settings

Rendered step-by-step (short)

Render (recommended)
1. Create a new Web Service on Render and connect your GitHub repo.
2. Build command: npm install
3. Start command: node server/index.js
4. Environment:
   - NODE_ENV=production
   - JWT_SECRET=<your_secret>
   - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (or MYSQL_URL)
   - FRONTEND_URLS=https://roxiler-rating.netlify.app
5. Deploy and check logs for the "Allowed frontend origins" line.

Railway (MySQL + Node)
1. Create a new project and add a MySQL plugin (or connect external DB).
2. Add a service: "Deploy from GitHub" -> point to this repo.
3. Start command: node server/index.js
4. Add environment variables as above. Railway will also provide a DATABASE_URL or MYSQL connection string which you can map to MYSQL_URL or MYSQL_PUBLIC_URL.
5. Deploy and confirm logs.

Netlify (frontend)
1. In Netlify site -> Site settings -> Build & deploy -> Environment, add:
   - VITE_API_BASE_URL = https://<your-backend-host>/api
2. Trigger a deploy.

Troubleshooting
- If you see CORS errors in the browser, ensure FRONTEND_URLS includes your frontend origin exactly (no trailing slash).
- If the server exits at startup complaining about JWT_SECRET, set JWT_SECRET in your host environment variables.


