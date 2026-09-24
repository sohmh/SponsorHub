# AI & DS Club SponsorHub CRM

Private, login gated full stack CRM for the AI and DS Club Sponsorship and PR team. It helps the team manage corporate relationships, student hackathon funding, MoUs, deliverables, and commercial partnerships through a single, secure, and structured platform instead of a shared spreadsheet.

This web application replaces the previous spreadsheet based process with a multi user system that stores sponsor data in a database, enforces access control, and gives the team a cleaner workflow for outreach, tracking, follow up, and reporting.

## 1. Why this platform is being made

The original workflow depended on spreadsheets, scattered notes, and manual tracking across multiple team members. That approach is difficult to maintain as the number of sponsors, contacts, and follow up actions grows. Important information gets fragmented, the same company may be tracked in multiple places, and there is no clear record of who last contacted whom or which sponsor is in which stage of the pipeline.

This platform is being built to solve that operational problem. It centralizes sponsor management into one source of truth, gives the team a consistent workflow, and makes it easier to track outreach progress, follow ups, agreements, and financial value. It also introduces accountability because every action can be associated with a specific user and role. For a student team or small organization, this means less manual overhead, fewer missed opportunities, and a much more professional process for managing partnerships.

The system is designed to support internal collaboration without exposing data to the public. Access is restricted to authorized team members only, which is essential for sponsorship management where private company details, contact information, negotiation status, and funding discussions must remain secure.

## 2. What is the tech stack

The application is built as a modern full stack web product using a simple but scalable architecture.

Frontend: The interface is built with React and TypeScript. The app uses a component driven UI structure with route based pages for the dashboard, sponsor pipeline, contacts, activity log, offers, and team administration. The frontend is designed to be responsive so it can be used on desktop and mobile browsers, which matters for follow up work and quick updates while on the move.

Backend: The backend is built with Node.js and Express, and uses tRPC to expose typed API procedures to the frontend. This keeps the application strongly typed and reduces mismatches between client and server logic. The backend handles CRUD operations for sponsors, contacts, logs, offers, and permissions, while keeping business rules close to the application layer.

Database layer: The project uses a Postgres friendly schema and is designed to work with a managed database environment. It is structured around normalized relationships so that sponsors can be linked to their contacts, outreach logs, and offer records. This is much more maintainable than a flat spreadsheet because the data is organized around real business entities instead of one large table.

ORM and query layer: The project uses Drizzle ORM to define and manage database models. This makes it easier to evolve the schema, perform typed database queries, and keep the data layer consistent with the application model as features grow.

Authentication and authorization: The intended production model uses Supabase Auth for identity and access management. This lets the app support team based login, role assignment, and restricted access to internal data. The design supports admin and member roles, with admin access for team configuration and member access for day to day sponsorship operations. This is essential for keeping the platform private and preventing unauthorized access.

Testing and validation: The project includes automated validation through Vitest for app logic and TypeScript checks through the compiler. This ensures the product remains maintainable as more features are added and helps catch mistakes before deployment.

## 3. How it is deployed and how Auth and Database are managed

The intended deployment model is split between Vercel and Supabase.

Frontend and backend on Vercel: The React app and the API layer are deployed on Vercel. This allows the project to be hosted as a single application environment with a simple deployment flow. Vercel is well suited for frontend hosting, and it also handles the server side runtime needed for the API layer. This keeps deployment simple and reduces infrastructure overhead, which is ideal for a small internal tool.

Database and auth on Supabase: The database and authentication are managed through Supabase. Supabase provides a managed Postgres database with built in authentication and access control capabilities. This allows the team to store sponsor records, contact details, logs, offers, and user profiles in a reliable database while keeping identity management centralized.

Authentication flow: The system is designed to support private, invite based or domain restricted access. In a production setup, only approved team members can sign in, and role based permissions decide what each user is allowed to access and modify. This prevents public or unauthorized access and enforces the internal use case of the platform.

Database flow: Sponsor data, contact records, interaction history, and agreements are stored in structured tables instead of spreadsheet cells. This allows the app to query and aggregate information efficiently, support filtering and search, and enable better reporting and cross reference checks across the entire sponsor pipeline.

Security model: The architecture is designed so that the app is not simply a public web dashboard. It is meant to be a private team platform with restricted access, data ownership boundaries, and permissions enforced at the application and database layers. This is important for academic or student project use where information may include contact details, outreach records, and negotiation related data.

Environment configuration: The project is designed to use environment variables for private configuration such as session secrets and database connection settings. This keeps deployment configuration separate from source code and allows secure setup in production without hard coding sensitive values.

## Setup guide

### Prerequisites

Before starting, make sure you have the following installed on your machine:

1. Node.js version 18 or newer
2. pnpm package manager
3. Git
4. Access to a Supabase project if you want to use production auth and database features
5. A Vercel account if you want to deploy the app to production

### Local installation

From the project root, run the following commands:

```powershell
pnpm install
npm run dev
```

This starts the project in development mode. The frontend and backend are configured to run together so that the app can be tested locally in a browser.

### Environment variables

Create an environment file for local development with the required variables. At minimum, the app should include values for the authentication and database setup if you are connecting to Supabase.

Example variables:

```env
SESSION_SECRET=your_session_secret
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

If these values are not configured, the app can still run in a lightweight local mode, but production usage should rely on the managed Supabase setup for real authentication and persistent data storage.

### Supabase setup

To use the app with real auth and persistent data storage:

1. Create a new Supabase project
2. Configure authentication providers or email based login
3. Create the database tables for sponsors, contacts, logs, offers, team members, and related records
4. Add the Supabase project URL and keys into the environment variables
5. Enable access rules so only approved team members can access internal records

### Vercel deployment setup

To deploy the application:

1. Push the project to GitHub
2. Import the repository into Vercel
3. Add the environment variables required by the app
4. Configure the project to use the frontend and API runtime correctly
5. Connect the deployment to the Supabase project for auth and database access

### Production readiness checklist

Before releasing the app to the full team, confirm the following:

1. Only approved team members can sign in
2. Admin and member roles are enforced correctly
3. Database tables are created and linked properly
4. Sensitive environment variables are stored securely
5. Data export or backup process is documented
6. Team onboarding and offboarding are clearly defined

### Summary

This project is designed to run locally with a simple development flow and scale into a managed deployment using Vercel for hosting and Supabase for authentication and database services. The combination keeps the system fast to build, easy to maintain, and secure for internal team use.

## Summary

This platform is a practical internal SaaS product built to replace spreadsheet based sponsorship management with a secure, scalable, and structured system. It combines a modern frontend, a typed backend, a relational database, and managed authentication so the team can operate more efficiently and professionally. The architecture is intentionally lightweight and maintainable, which makes it a strong fit for an internal team tool that needs to be useful quickly while still being ready to scale in the future.
