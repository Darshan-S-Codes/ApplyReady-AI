# ApplyReady AI

**From opportunity to application-ready — in seconds.**

ApplyReady AI turns a job, internship, scholarship or fellowship description into a personalized readiness review. It extracts requirements and skills, compares them with a student's profile and document vault, and returns an action plan with the official application link and deadline.

## Project structure

```text
frontend/   React, Vite, Tailwind CSS, React Router, Recharts
backend/    Express REST API, MongoDB/Mongoose, JWT authentication, AI service
```

Each application has its own `package.json`. The root package.json configures both as npm workspaces so one install and one dev command run the full stack.

## Run locally

1. Install Node.js 20 or newer and make a MongoDB Atlas cluster available (or install MongoDB locally).
2. Copy `backend/.env.example` to `backend/.env` and set a long random `JWT_SECRET`, your `MONGODB_URI`, and `TAVILY_API_KEY` for live opportunity search. For Atlas, ensure the cluster is running and your current IP address is allowed under Network Access.
3. From the project root, run `npm install`.
4. Run `npm run dev` from the root.
5. Open the local Vite URL reported in the terminal (for example `http://localhost:5173` or the next available port if that one is already occupied).

The app automatically falls back to the next available port if 5000 or 5173 are already in use, and Vite proxies `/api` to the matching backend port. Find Opportunities uses Tavily when `TAVILY_API_KEY` is configured and otherwise searches the live Arbeitnow public job board; results link to their source listings. AI analysis requires `AI_PROVIDER=openai` and `AI_API_KEY`; when these are missing, the API reports a configuration error rather than returning fabricated analysis. Optionally set `AI_MODEL` / `AI_BASE_URL` in `backend/.env` to use an OpenAI-compatible chat completions endpoint.

The app does not seed demo profiles, documents, or opportunities. Personal workspace pages display only records belonging to the signed-in account; an empty account starts with empty lists.

Open `http://localhost:5173/demo` to try the public interactive prototype without signing in. Its example listings, saved items, tracker edits, and profile changes are temporary in-memory demo state and are not sent to the API or stored in MongoDB. Create an account or log in to use the persistent workspace; `http://localhost:5173/prototype` takes signed-in users to that workspace.

Live job and internship search results are saved as account-owned MongoDB opportunities when the user selects **Save opportunity**. Saving the same listing URL again reuses the existing record. The application tracker reads those records and persists status, next-step, and notes edits; submitting an application records the submission date.

Projects and certifications added from the profile are saved to the signed-in user record. Project attachments accept PDF, DOC, DOCX, JPG and PNG files up to 10 MB each and are stored as private account documents.

You can also run each side independently from the root:

```sh
npm run dev --workspace backend
npm run dev --workspace frontend
```

## Desktop app (Windows)

The desktop build wraps the existing React interface and starts the Express API on a private loopback port. MongoDB and AI credentials stay outside the installer. The app stores uploaded files in Electron's per-user application data folder.

1. Install dependencies with `npm install`.
2. Build and open the desktop app with `npm run desktop:dev`.
3. Copy `backend/.env.example` to `%APPDATA%\ApplyReady AI\.env`. Set `MONGODB_URI` to a reachable MongoDB database and replace `JWT_SECRET` with a long random value. Add `AI_API_KEY` if you want AI analysis. Restart the desktop app after editing the file.
4. Create a Windows installer with `npm run desktop:pack`. The installer is written to `desktop-installer/`.

The desktop app uses `%APPDATA%\ApplyReady AI` for its private settings and uploaded files. It uses MongoDB for account and tracker data; it does not bundle a database server. Keep `.env` private and out of source control. The renderer runs with Node integration disabled, context isolation enabled, and sandboxing enabled.

## Build and production

Run `npm run build` from the root. To serve the frontend build from Express, set `NODE_ENV=production` and start the backend with `npm start`.

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PATCH /api/auth/me`
- `POST /api/opportunities/search`, `POST /api/opportunities/analyze`, `GET /api/opportunities`, `POST /api/opportunities/save`, `PATCH /api/opportunities/:id`, `DELETE /api/opportunities/:id`
- `GET /api/documents`, `POST /api/documents`, `GET /api/documents/:id/download`, `DELETE /api/documents/:id`
- `GET /api/health`

Protected endpoints use `Authorization: Bearer <token>`. Document and project-attachment uploads accept PDF, DOC, DOCX, JPG and PNG files up to 10 MB. Files are served only through authenticated, account-checked download endpoints. Uploaded files are stored on the server in development; production deployments should use private object storage, HTTPS, encryption at rest, rate limiting and malware scanning.
