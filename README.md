# Community Connect

Community Connect is a social development events platform for discovering, hosting, and joining local volunteer activities. Better Auth is hosted by the Next.js App Router at `/api/auth`; it keeps sessions in HTTP-only cookies and issues short-lived JWTs for protected Express API requests.

**Live website:** Deployment pending.

## Features

- Browse upcoming community events and view event details.
- Register or sign in with email/password, or use GitHub OAuth when configured.
- Create events and manage events you host.
- Join events and view your joined event calendar.
- Update your profile and profile photo.
- Use the light or dark theme across the application.

## Technology

Next.js App Router, React, TypeScript, Better Auth, Express, MongoDB, and Sonner notifications.

## Routes

- `/` — homepage and six latest upcoming events
- `/upcoming-events` and `/events/[id]` — event discovery and details
- `/login` and `/register` — email/password authentication and GitHub sign-in
- `/create-event`, `/manage-events`, `/joined-events`, and `/profile` — authenticated pages

## Local development

Start MongoDB and the Express API first. See [the server README](../server/README.md) for API configuration. The Next.js server also connects to that same MongoDB database for Better Auth user, session, account, and signing-key collections.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

`NEXT_PUBLIC_API_URL` is the public Express API origin (local default `http://localhost:5000`) and is the only public client variable. The Next.js server also needs `MONGODB_URI`, `MONGODB_DB`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_JWT_ISSUER`, `BETTER_AUTH_JWT_AUDIENCE`, and `CLIENT_URL`. GitHub OAuth uses optional server-only `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Copy `.env.example` to `.env.local`; never prefix secrets with `NEXT_PUBLIC_` or commit `.env.local`.

## Production and route refreshes

Run the built Next.js server with `npm run build` and `npm start`; do not serve this App Router application as a static SPA. Next.js serves `/api/auth/*` and app pages. Express serves application data under `/api/*` on its separate origin. Set `NEXT_PUBLIC_API_URL` to that Express origin at build time; set `BETTER_AUTH_URL` to the Next.js origin (without `/api/auth`) and point Express `BETTER_AUTH_JWKS_URL` at `<BETTER_AUTH_URL>/api/auth/jwks`. Use HTTPS and matching issuer/audience values in both repositories.

Keep `BETTER_AUTH_SECRET` stable and use the same MongoDB URI/database in both apps so existing Better Auth records and JWT signing keys remain available. Configure the GitHub callback as `<BETTER_AUTH_URL>/api/auth/callback/github`. Since auth cookies now belong to the Next.js origin, existing browser sessions previously issued by Express may need one fresh sign-in after this endpoint move.

## Commands

```powershell
npm run dev
npm run lint
npm run build
npm start
```
