# SponsorHub Deployment Guide

This guide deploys the application in this repository: a Vite React frontend served by an Express/tRPC Node.js server, with Drizzle ORM and a MySQL-compatible database.

## Important: current production status

The checked-in application is still a prototype. Do not place real sponsor, invoice, payment, or personal contact data in a public production deployment until the authentication items below are fixed and tested.

The current code has these deployment limitations:

- The client login flow is a mock login. `startLogin()` only logs a message, and `auth.login` can create a user from an email without verifying ownership of that email.
- The OAuth callback implementation exists, but it is not registered by `server/_core/index.ts` and the client does not start the OAuth flow.
- The tRPC context reads a JSON session cookie directly. It does not verify the JWT session created by the OAuth SDK.
- `server/db.ts` falls back to in-memory data when `DATABASE_URL` is absent or the database connection fails. All data is lost when the process restarts.
- The current database schema and the implementation plan describe different architectures. This repository is not a Next.js/Vercel/Supabase application; deploying it requires a Node host and MySQL-compatible database.

The deployment steps below are suitable for a private prototype or controlled internal demo. Complete the hardening checklist before team-wide operational use.

## 1. Deployment architecture

Use these components:

| Component | Required service |
|---|---|
| Web application | One long-running Node.js web service |
| Database | Managed MySQL or compatible MySQL database |
| Public URL | HTTPS domain or provider URL |
| File storage and external APIs | Forge configuration, only if those features are used |
| Backups | Managed database backups or scheduled database exports |

The application serves both parts from one process:

- `pnpm build` builds the browser bundle into `dist/public` and bundles the server into `dist/index.js`.
- `pnpm start` runs `dist/index.js` in production mode.
- The server serves the SPA and the tRPC API at `/api/trpc`.
- The server listens on `PORT`, defaulting to `3000`.

Do not deploy the frontend as a static-only site. The Node server is required for the API and authentication/session behavior.

## 2. Prerequisites

Install or provision:

- Node.js compatible with the repository dependencies, preferably Node 22 LTS.
- pnpm 10, matching the `packageManager` field in `package.json`.
- A MySQL 8-compatible database, including a database user with permission to create and alter tables.
- A Git repository containing the application.
- A host that supports a persistent Node process and an externally supplied port.
- An HTTPS URL. Use the host's managed TLS certificate or a reverse proxy such as Caddy or Nginx.

Verify locally or on the build machine:

```powershell
node --version
pnpm --version
```

## 3. Create the database

Create a separate database for each environment. At minimum, use one database for staging and another for production.

Record the complete connection string as `DATABASE_URL`. It must be available to both the migration command and the running application. A typical MySQL URL is:

```text
mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME
```

Use the connection string format required by the selected provider. URL-encode special characters in the username or password.

Do not use a personal database account. Create a dedicated application account and restrict database network access where the provider supports it.

## 4. Configure environment variables

Set these variables in the hosting provider's secret/environment-variable settings. Do not commit an `.env` file.

### Required for a persistent prototype deployment

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | Supplied by the host; set it only if the host requires a fixed value |
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | A unique random secret of at least 32 characters |

Generate a secret with a password manager or a local command such as:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Required only when the real OAuth integration is implemented and wired

| Variable | Purpose |
|---|---|
| `VITE_APP_ID` | OAuth/application identifier |
| `OAUTH_SERVER_URL` | OAuth provider base URL |
| `OWNER_OPEN_ID` | Open ID that receives the initial admin role |

These values alone do not activate secure OAuth in the current build. The authentication hardening work in Section 10 is still required.

### Required only for Forge-backed features

| Variable | Purpose |
|---|---|
| `BUILT_IN_FORGE_API_URL` | Forge API base URL |
| `BUILT_IN_FORGE_API_KEY` | Server-side Forge credential |

Set both together when using Forge-backed storage, maps, image generation, data APIs, heartbeat, or voice transcription. Never expose `BUILT_IN_FORGE_API_KEY` to browser code.

## 5. Prepare the application release

From the repository root:

```powershell
cd d:\sponsorhub\aideas-sponsorhub
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

The build is successful only when these files exist:

```text
dist/index.js
dist/public/index.html
```

Use the committed `pnpm-lock.yaml`. Do not switch between npm and pnpm for the deployment unless the team intentionally regenerates and reviews the dependency lockfile.

## 6. Apply database migrations

Run migrations against the target database before starting the production process:

```powershell
$env:DATABASE_URL = "mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME"
pnpm db:push
```

The repository script runs `drizzle-kit generate` followed by `drizzle-kit migrate`. Review the generated migration before applying it to an existing production database. Commit reviewed migration files so staging and production use the same schema history.

After migration, verify that the database contains these tables:

- `users`
- `sponsors`
- `contacts`
- `contactLog`
- `offersAgreements`

The application does not provide a production seed command. The familiar sample users and sponsor records are in-memory fallback data. They are not a reliable database seed and should not be treated as production records.

## 7. Deploy the Node service

Create a web service using the repository's root directory and configure:

| Setting | Value |
|---|---|
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` |
| Start command | `pnpm start` |
| Health/check URL | `/` |
| Port | The host-provided `PORT` |
| Runtime | Node.js |

Set all environment variables from Section 4 before the first start.

The service must keep running after the deployment command exits. Do not use `pnpm dev` in production; it starts a Vite watch process and is not the production server.

If using a VM instead of a managed web-service host, run the process under a supervisor such as `systemd` or PM2 and place an HTTPS reverse proxy in front of it. Configure the reverse proxy to preserve the `Host`, `X-Forwarded-Proto`, and client connection headers. The session-cookie code uses `X-Forwarded-Proto` to decide whether cookies should be marked secure.

## 8. Configure the domain and HTTPS

1. Attach the production domain to the web service.
2. Complete the provider's DNS instructions.
3. Confirm that HTTP redirects to HTTPS.
4. Confirm that the application loads at the canonical HTTPS URL.
5. Do not put the database or Forge credentials in DNS records, frontend variables, or client-side code.

Use one canonical hostname. Changing between provider hostname, custom domain, and IP address can create confusing cookie and OAuth callback behavior.

## 9. Verify the deployment

Run these checks after the first deploy:

1. Open the public HTTPS URL and confirm the SPA loads.
2. Open browser developer tools and confirm API requests target `/api/trpc` on the same origin.
3. Confirm the service logs show production mode and no database fallback warning.
4. Create a test sponsor, contact, activity log entry, and offer.
5. Restart or redeploy the service.
6. Confirm the test records still exist. If they disappear, `DATABASE_URL` was not active or the database migration/connection is failing.
7. Confirm an admin-only action is rejected for a non-admin test account.
8. Confirm logout removes access to authenticated views.
9. Export a small CSV and verify that it contains the expected test records.
10. Remove test records or reset the staging database before inviting real users.

A successful build is not a successful production verification. Persistence, authentication, authorization, and restart behavior must all be checked separately.

## 10. Required hardening before team-wide use

Treat these as release-blocking tasks:

1. Replace the mock `auth.login` flow with a real provider-backed login. Do not allow a caller to select a user by ID or create an account from an unverified email.
2. Register the OAuth routes in the server entrypoint, or remove the unused OAuth implementation and replace it with a complete authentication design.
3. Make the request context verify signed sessions server-side. Do not trust a client-provided JSON cookie for identity or role.
4. Enforce authorization from the authenticated database user on every protected procedure. The browser must not be able to choose its own role.
5. Ensure deactivated users cannot authenticate or use existing sessions.
6. Confirm `DATABASE_URL` failure is fatal in production instead of silently switching to in-memory storage.
7. Add a real health endpoint that checks application readiness and database connectivity.
8. Add foreign keys, indexes, and an explicit migration review for the production schema.
9. Configure database backups and test restoring one.
10. Review file-upload limits, rate limiting, audit logging, and error logging before storing financial or personal data.

The security recommendations in `Implementation.md` describe a Supabase/RLS design, but that design is not implemented by this repository's current MySQL/Express code. Do not assume those recommendations are active merely because they are documented there.

## 11. Backups and operations

At minimum:

- Enable automated backups on the managed MySQL provider.
- Keep a separate encrypted export on a schedule appropriate for the team, such as weekly.
- Store backups outside the application host and restrict access to club leads.
- Test restoring a backup into a staging database at least once per term.
- Keep production and staging credentials separate.
- Monitor service logs for database connection failures and unexpected restarts.
- Rotate `JWT_SECRET` only with a planned session invalidation event, because rotation invalidates existing sessions.
- Keep migration files in version control and apply them through a reviewed release process.

CSV exports from the UI are useful operational snapshots but are not a substitute for a database backup.

## 12. Release checklist

Before announcing the application to the team:

- [ ] Production database created separately from staging.
- [ ] `DATABASE_URL` tested with migrations and a restart.
- [ ] `JWT_SECRET` set through the host secret manager.
- [ ] Build, type-check, and tests pass.
- [ ] HTTPS and the canonical domain are working.
- [ ] Authentication is real, verified, and server-side.
- [ ] Admin and member permissions tested with separate accounts.
- [ ] Backup and restore procedure documented.
- [ ] Sample data removed from production.
- [ ] Team invitation and offboarding process documented.
- [ ] A named owner is responsible for hosting, database access, backups, and annual handoff.

## 13. Team handoff

Give the team the production URL and a short internal note covering:

- How members sign in.
- Who can invite or deactivate members.
- Where to report access and data issues.
- Where backups are stored.
- Who owns the hosting and database accounts.
- How to export CSV snapshots.
- What to do when the committee changes leadership.

Keep the original spreadsheet as a read-only historical reference during the transition. Once the deployed application is verified and backed up, designate one system as the source of truth so the two records do not drift.
