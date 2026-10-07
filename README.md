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

1. Install Node.js 20 or newer and MongoDB.
2. Copy `backend/.env.example` to `backend/.env` and set a long random `JWT_SECRET` and your `MONGODB_URI`.
3. From the project root, run `npm install`.
4. Run `npm run dev` from the root.
5. Open `http://localhost:5173`.

The frontend runs on port 5173 and the REST API on port 5000. Vite proxies `/api` and `/uploads` to the backend. `AI_PROVIDER=mock` enables fallback analysis without a provider key. Set `AI_PROVIDER=openai`, `AI_API_KEY`, and optionally `AI_MODEL` / `AI_BASE_URL` in `backend/.env` to use an OpenAI compatible chat completions endpoint.

You can also run each side independently from the root:

```sh
npm run dev --workspace backend
npm run dev --workspace frontend
```

## Build and production

Run `npm run build` from the root. To serve the frontend build from Express, set `NODE_ENV=production` and start the backend with `npm start`.

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PATCH /api/auth/me`
- `POST /api/opportunities/analyze`, `GET /api/opportunities`, `POST /api/opportunities/save`, `PATCH /api/opportunities/:id`, `DELETE /api/opportunities/:id`
- `GET /api/documents`, `POST /api/documents`, `GET /api/documents/:id/download`, `DELETE /api/documents/:id`
- `GET /api/health`

Protected endpoints use `Authorization: Bearer <token>`. Document upload accepts PDF, DOC, DOCX, JPG and PNG files up to 10 MB. Uploaded files are stored on the server in development; production deployments should use private object storage, HTTPS, encryption at rest, rate limiting and malware scanning.
