# Community Connect

Community Connect is a social development events platform for discovering, hosting, and joining local volunteer activities. Better Auth is hosted by the Next.js App Router at `/api/auth`; it keeps sessions in HTTP-only cookies and issues short-lived JWTs for protected Express API requests.

**Live website:** https://community-connect-client-xi.vercel.app

This is the **client** repository. The Express API lives in the [server repository](https://github.com/Maidul-057/CommunityConnectServer).

## Project links

| | Link |
| --- | --- |
| Live website (Vercel) | https://community-connect-client-xi.vercel.app |
| Live API (Render) | https://communityconnectserver-i8x6.onrender.com |
| Client repository (Next.js) | https://github.com/Maidul-057/CommunityConnect-Client |
| Server repository (Express) | https://github.com/Maidul-057/CommunityConnectServer |

## Features

- Browse upcoming community events in a responsive grid; events whose date has passed never appear.
- View full event details without logging in; joining an event requires an account.
- Register with name, email, photo URL, and a password (uppercase, lowercase, and at least six characters), or sign in with email/password or GitHub OAuth when configured.
- Create events with a title, description, event type, thumbnail URL, location, and a future-only date; every form is validated and reports problems through toast notifications.
- Manage the events you host: edit them or delete them after a confirmation. Only the creator can change or remove an event.
- Join events and review your joined events, sorted by event date.
- View and update your profile name and photo.
- Switch between light and dark themes across the whole application.
- Loading skeletons while event data is fetched.
- Home page with a banner, a how-it-works section, the six soonest upcoming events, a photo gallery, and a newsletter sign-up section (design only).
- Protected API: the Next.js app issues short-lived Better Auth JWTs and the Express API verifies them against the JWKS endpoint on every protected request.

## Technology

Next.js App Router, React, TypeScript, Better Auth, Express, MongoDB, and Sonner notifications.

## Routes

- `/` — homepage and six latest upcoming events
- `/upcoming-events` and `/events/[id]` — event discovery and details
- `/login` and `/register` — email/password authentication and GitHub sign-in
- `/create-event`, `/manage-events`, `/joined-events`, and `/profile` — authenticated pages

## Local development

Start MongoDB and the Express API first. See the [server README](https://github.com/Maidul-057/CommunityConnectServer#readme) for API configuration. The Next.js server also connects to that same MongoDB database for Better Auth user, session, account, and signing-key collections.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

`NEXT_PUBLIC_API_URL` is the public Express API origin (local default `http://localhost:5000`) and is the only public client variable. The Next.js server also needs `MONGODB_URI`, `MONGODB_DB`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_JWT_ISSUER`, `BETTER_AUTH_JWT_AUDIENCE`, and `CLIENT_URL`. GitHub OAuth uses optional server-only `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Copy `.env.example` to `.env.local`; never prefix secrets with `NEXT_PUBLIC_` or commit `.env.local`.

## Production and route refreshes

Run the built Next.js server with `npm run build` and `npm start`; do not serve this App Router application as a static SPA. Next.js serves `/api/auth/*` and app pages. Express serves application data under `/api/*` on its separate origin. Set `NEXT_PUBLIC_API_URL` to that Express origin at build time; set `BETTER_AUTH_URL` to the Next.js origin (without `/api/auth`) and point Express `BETTER_AUTH_JWKS_URL` at `<BETTER_AUTH_URL>/api/auth/jwks`. Use HTTPS and matching issuer/audience values in both repositories.

Keep `BETTER_AUTH_SECRET` stable and use the same MongoDB URI/database in both apps so existing Better Auth records and JWT signing keys remain available. Configure the GitHub callback as `<BETTER_AUTH_URL>/api/auth/callback/github`. Since auth cookies now belong to the Next.js origin, existing browser sessions previously issued by Express may need one fresh sign-in after this endpoint move.

## Deployment configuration

Variable names below come from the source code. A variable that starts with `NEXT_PUBLIC_` is compiled into the browser bundle at build time, so changing it requires a new build. Changing any Vercel variable needs a redeploy; an existing deployment keeps its old values.

**Vercel (this repository), Production environment**

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | The Express API origin, for example `https://communityconnectserver-i8x6.onrender.com` |
| `MONGODB_URI` and `MONGODB_DB` | The same database used by the API (`community-connect`) |
| `BETTER_AUTH_SECRET` | A long random secret; keep it stable |
| `BETTER_AUTH_URL` | `https://community-connect-client-xi.vercel.app` (no trailing slash, no `/api/auth`) |
| `BETTER_AUTH_JWT_ISSUER` | Same value as `BETTER_AUTH_URL` |
| `BETTER_AUTH_JWT_AUDIENCE` | Same value as `BETTER_AUTH_URL` |
| `CLIENT_URL` | Same value as `BETTER_AUTH_URL` |
| `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` | Optional, only for GitHub sign-in |

In production the server refuses to handle authentication requests if `BETTER_AUTH_URL`, `BETTER_AUTH_JWT_ISSUER`, or `BETTER_AUTH_JWT_AUDIENCE` points to localhost. The Express API (Render) needs `BETTER_AUTH_JWT_ISSUER` and `BETTER_AUTH_JWT_AUDIENCE` set to exactly the same values, plus `BETTER_AUTH_JWKS_URL=https://community-connect-client-xi.vercel.app/api/auth/jwks`. See the [server README](https://github.com/Maidul-057/CommunityConnectServer#readme).

**Verifying a deployment:** sign in, open `/api/auth/token`, and decode the JWT. Its `iss` and `aud` claims must equal the Vercel URL above. If the API answers `401` with "Invalid or expired authentication token", the Render logs print the expected and received issuer and audience.

## Commands

```powershell
npm run dev
npm run lint
npm run build
npm start
```