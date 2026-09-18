# AI & DS Club — SponsorHub CRM

Private, login-gated full-stack CRM built for the college **AI & DS Club Sponsorship & PR Team** to manage corporate relationships, student hackathon funding, MoUs, deliverables, and commercial pipelines.

This web application replaces the previous `AI_DS_Club_Sponsorship_CRM_Template.xlsx` spreadsheet with a multi-user, real-time database with role-based access control.

---

## 🚀 Quick Start

### 1. Installation & Local Development

```powershell
# In the project directory
cd d:\sponsorhub\aideas-sponsorhub

# Install dependencies (if needed)
pnpm install

# Start the full-stack dev server (Vite frontend + Express/tRPC backend)
npm run dev
```

The application will start on **http://localhost:3000** (or the next available port).

### 2. Running Automated Tests & Type Checks

```powershell
# Run Vitest test suite (Auth, RBAC, Sponsors, Contacts, Activity Log, Offers)
npm test

# Run TypeScript compiler validation
npm run check
```

---

## 👥 Authentication & Roles

Access is login-gated. Unauthenticated requests are automatically redirected to the `/login` portal.

### Built-in Committee Roles

| Name | Role | Permissions |
|---|---|---|
| **Aarav Kapoor** (`aarav@club.edu.in`) | **Admin (Lead)** | Full access: Create, Edit, and Delete Sponsors/Contacts/Offers; Access Team page to invite/deactivate members and promote/demote roles. |
| **Priya Nair** (`priya@club.edu.in`) | **Member (PR)** | Outreach access: Create and Edit Sponsors, Contacts, Activity Logs, and Offers. Cannot delete records or access Team management. |
| **Rohan Patel** (`rohan@club.edu.in`) | **Member** | Standard committee member permissions. |
| **Neha Sharma** (`neha@club.edu.in`) | **Member** | Standard committee member permissions. |

---

## 📊 Modules & Excel Sheet Mapping

Each sheet from `AI_DS_Club_Sponsorship_CRM_Template.xlsx` is mapped to an interactive, responsive view:

| Excel Tab | Web Route | Key Capabilities |
|---|---|---|
| **Dashboard** | `/` | Real KPI formula calculations: Total Sponsors, Outreach % Contacted, Confirmed Partners, Estimated Pipeline Value, Urgent Follow-ups widget, Stage Funnel, and Recent Outreach Stream. |
| **Sponsor Pipeline** | `/sponsor-pipeline` | Full **26-column** registry: Search, Status filter, Priority filter, Sort by value/date, CSV Export, and **Sponsor Detail Drawer** with nested Contacts, Interaction Timeline, and Deals. |
| **Contacts** | `/contacts` | **14-column** stakeholder directory: Decision-maker filter, LinkedIn/Email/Phone quick actions, sponsor company association, and CSV Export. |
| **Contact Log** | `/activity-log` | **15-column** interaction history: 1-click follow-up checklist completion, overdue date highlighting, interaction summary, and CSV Export. |
| **Offers & Agreements** | `/offers` | **23-column** financial ledger: Automatic total calculation (Cash + In-Kind), invoice number tracking, payment status, MoU links, and CSV Export. |
| **Team Management** | `/team` | **Admin-only**: Committee roster, invite new member by email, promote/demote admin roles, deactivate members who graduate. |
| **Global Search** | `Cmd+K` / `Ctrl+K` | Interactive instant search dialog querying across all sponsors, contacts, logs, and deals simultaneously. |

---

## 🛡️ Handoff Notes for Next Year's Team

1. **How to Invite a New Member**:
   - Log in as an Admin (e.g. Aarav Kapoor).
   - Navigate to **Team & Permissions** (`/team`) from the sidebar.
   - Click **Invite Member**, enter their name, college email, and assign their role (`Member` or `Admin`).
   - They can immediately log in with their email address.

2. **How to Offboard / Deactivate Graduating Leads**:
   - Go to `/team`.
   - Click **Deactivate** next to the graduating member's name. This revokes active system status (`isActive: false`) without losing their past logged outreach history.

3. **Data Backups & CSV Exports**:
   - Excel is no longer the live working copy, avoiding sync conflicts.
   - To make weekly backups, use the **Export CSV** button on the **Overview**, **Sponsor Pipeline**, **Contacts**, **Activity Log**, or **Offers** pages.
   - Save the exported CSVs in the club's private Google Drive backup folder.

4. **Production Deployment (Vercel + Supabase/MySQL)**:
   - Deploy frontend and API routes to Vercel.
   - Set environment variables:
     - `SESSION_SECRET`: Random 32+ character string.
     - `DATABASE_URL` (optional): MySQL or Supabase PostgreSQL connection string. (When unset, the app runs with the zero-config in-memory store).
