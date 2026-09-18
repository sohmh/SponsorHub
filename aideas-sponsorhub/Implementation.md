# Implementation Plan: AI & DS Club Sponsorship CRM (Web App)

## 0. Purpose of this document

This plan is written **for a developer or coding agent (e.g. Claude Code)** to follow, step by step,
to turn the existing `AI_DS_Club_Sponsorship_CRM_Template.xlsx` into a private, login-gated web
application that the club's Sponsorship & PR team can use instead of sharing an Excel file.

**IMPLEMENTATION STATUS: PROTOTYPE FULLY COMPLETED** ✅

The following work has been completed to match the Excel template structure:
- ✅ Removed manus.ai placeholders and dependencies
- ✅ Simplified authentication system for prototype
- ✅ Updated data models to match Excel sheet column structure exactly
- ✅ Created separate Sponsor Pipeline page matching "Sponsor Pipeline" sheet
- ✅ Updated Contacts page with all Excel fields (14 columns)
- ✅ Updated Activity Log (Contact Log) with all Excel fields (15 columns)
- ✅ Updated Offers & Agreements with all Excel fields (23 columns)
- ✅ Updated Dashboard metrics to match Excel Dashboard calculations
- ✅ Implemented navigation between all pages
- ✅ Added data entry functionality for all entity types
- ✅ Set up in-memory data storage for prototype testing
- ✅ Created working UI with filtering, search, and CRUD operations

**Excel Sheet Mapping:**
- **Sponsor Pipeline** → `/sponsor-pipeline` page (26 columns)
- **Contacts** → `/contacts` page (14 columns)
- **Contact Log** → `/activity-log` page (15 columns)
- **Offers & Agreements** → `/offers` page (23 columns)
- **Dashboard** → `/` overview page with KPI metrics
- **Lists** → Implemented as dropdown options in forms
- **Read Me** → Implementation documentation

Read this whole document before writing code. Build in the phase order given in Section 6 — each
phase should be a working, deployable increment.

---

## 1. What we're replacing and why it's feasible

The source spreadsheet has 7 tabs with a clean relational structure:

| Sheet | Role | Key columns |
|---|---|---|
| `Sponsor Pipeline` | Master list, one row per organization | Sponsor ID, Company, Type, Priority, Pipeline Status, Owner, Follow-up dates, Estimated Value |
| `Contacts` | People at each sponsor org | Contact ID, Sponsor ID (FK), Name, Role, Email, Phone, Decision Maker? |
| `Contact Log` | Every outreach/interaction, append-only | Log ID, Sponsor ID (FK), Date, Method, Summary, Follow-up Required? |
| `Offers & Agreements` | Deals, invoices, payments | Offer ID, Sponsor ID (FK), Cash/In-kind Value, Agreement Status, Payment Status |
| `Dashboard` | Computed KPIs (`COUNTA`/`COUNTIF` formulas) | Total Sponsors, Contacted, Confirmed, Follow-ups Due |
| `Lists` | Dropdown option values (data validation source) | Status, Priority, Industry, Contact Method, etc. |
| `Read Me` | Instructions | — |

This is already shaped like a normalized database (`Sponsor Pipeline` = parent table, the other
three = child tables with foreign keys to `Sponsor ID`). That's why this is a clean, well-scoped
build rather than a vague one — each sheet becomes a table, each dropdown list becomes an enum or
lookup table, and the Dashboard formulas become simple SQL aggregate queries or app-side counts.

**What you get that Excel can't easily give you:**
- Real login, so only your team can see or edit anything (no more "anyone with the link").
- Per-person accountability (who added/edited what, via `created_by`/`updated_by` fields).
- Fast search/filter/sort across sponsors, contacts, and interaction history without scrolling.
- No merge conflicts from two people editing the same file at once.
- Works from a phone browser.

---

## 2. Recommended architecture

For a club-scale internal tool (a few dozen users max, low traffic, no dedicated ops team), prefer
**boring, managed, mostly-free infrastructure** over anything that needs a server to babysit.

| Layer | Recommendation | Why |
|---|---|---|
| Frontend + backend | **Next.js** (App Router, TypeScript), deployed on **Vercel** | One framework for UI + API routes; Vercel's free tier is enough for this scale; zero server maintenance |
| Database + Auth | **Supabase** (managed Postgres + built-in Auth + Row Level Security) | Free tier covers this easily; Auth and fine-grained per-row permissions come built in, which is exactly what "only my team can log in and edit" needs |
| Hosting region | Choose the Supabase/Vercel region closest to your team (e.g. `ap-south-1`/Mumbai if available, else Singapore) | Lower latency for a college in India |
| File storage (optional, for MoU/agreement links) | **Supabase Storage** | Same project, same auth rules apply automatically |

This stack avoids you ever needing to run or pay for a server. Both Vercel and Supabase have
generous free tiers that comfortably cover a club CRM's traffic and storage.

**Alternative if you want something faster to stand up and don't need custom UI:** a no-code
internal-tool builder like Retool, Airtable, or Baserow, pointed at the same Postgres database,
with SSO/email-allowlist login. This plan assumes the custom-build route since you asked for a
"platform" your team logs into — but mention this alternative to the person requesting the build if
they want something in days rather than weeks.

---

## 3. Data model (Postgres / Supabase)

Create one table per sheet, using UUID primary keys instead of the spreadsheet's text IDs (keep the
human-readable ID like `SP-001` as a separate generated display column if wanted).

```sql
-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Lookup/enum-style tables (from the "Lists" sheet) -----------------------
create table pipeline_statuses (value text primary key);
create table priorities (value text primary key);
create table sponsor_types (value text primary key);
create table industries (value text primary key);
create table contact_methods (value text primary key);
-- ...one per column in "Lists" that feeds a dropdown

-- Core tables ---------------------------------------------------------------
create table sponsors (
  id uuid primary key default gen_random_uuid(),
  display_id text unique,                 -- e.g. "SP-001", generated on insert
  company_name text not null,
  website text,
  sponsor_type text references sponsor_types(value),
  industry text references industries(value),
  city_region text,
  primary_event text,
  potential_fit text,
  priority text references priorities(value),
  pipeline_status text references pipeline_statuses(value),
  owner_id uuid references profiles(id),
  last_contact_date date,
  next_followup_date date,
  best_contact_method text references contact_methods(value),
  estimated_value numeric,
  currency text default 'INR',
  likely_support_type text,
  what_they_could_offer text,
  current_response text,
  proposal_sent boolean default false,
  meeting_date date,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references sponsors(id) on delete cascade,
  contact_name text not null,
  role_department text,
  email text,
  phone text,
  linkedin_url text,
  preferred_contact_method text references contact_methods(value),
  referral_source text,
  is_decision_maker boolean default false,
  contact_status text,
  notes text,
  created_at timestamptz default now()
);

create table contact_log (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references sponsors(id) on delete cascade,
  contact_id uuid references contacts(id),
  log_date date not null default current_date,
  contact_method text references contact_methods(value),
  team_member uuid references profiles(id),
  interaction_summary text,
  response_result text,
  followup_required boolean default false,
  next_followup_date date,
  followup_action text,
  followup_completed boolean default false,
  attachment_url text,
  logged_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table offers_agreements (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references sponsors(id) on delete cascade,
  event_initiative text,
  offer_type text,
  offer_description text,
  cash_value numeric default 0,
  in_kind_value numeric default 0,
  total_value numeric generated always as (cash_value + in_kind_value) stored,
  offer_date date,
  decision_status text,
  agreement_status text,
  agreement_link text,
  invoice_number text,
  invoice_date date,
  payment_status text,
  amount_received numeric,
  payment_date date,
  deliverables_promised text,
  club_deliverables text,
  activation_deadline date,
  owner_id uuid references profiles(id),
  notes text,
  created_at timestamptz default now()
);

-- Team members / auth profile (linked to Supabase auth.users) --------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('admin','member')),
  is_active boolean not null default true,
  created_at timestamptz default now()
);
```

The `Dashboard` sheet's `COUNTA`/`COUNTIF` formulas become either:
- A Postgres **view** (`create view dashboard_kpis as select count(*) ...`), or
- Simple aggregate queries run from the frontend on page load.

Use a view — it keeps the "one query, one source of truth" property the spreadsheet had.

---

## 4. Authentication & authorization ("only my team can log in")

This is the part that needs to be done carefully. Two layers, both required:

### 4.1 Authentication — who can log in at all

Use **Supabase Auth** with one of these two patterns (pick one):

- **Invite-only (recommended):** No public sign-up page. An admin (you) adds each teammate's email
  to the `profiles`/`auth.users` table via Supabase's dashboard or an admin-only "Invite member"
  page in the app, which triggers Supabase's built-in invite email with a magic link. Nobody else
  can create an account because sign-up is disabled.
- **Domain-restricted sign-up:** If everyone has a college email (e.g. `@college.edu.in`), allow
  self-signup but reject any email not matching that domain, enforced both client-side and in a
  Postgres trigger/Supabase Auth hook (never trust client-side-only checks for this).

Use **magic link or OTP email login** rather than passwords — fewer things for club members to
forget or reuse insecurely, and Supabase supports it natively.

### 4.2 Authorization — who can see/edit what, once logged in

Enable **Row Level Security (RLS)** on every table (Supabase Postgres supports this natively) and
write policies such that:

```sql
alter table sponsors enable row level security;

-- Any authenticated, active team member can read
create policy "team can read sponsors"
  on sponsors for select
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_active)
  );

-- Any authenticated, active team member can insert/update
create policy "team can write sponsors"
  on sponsors for insert with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_active)
  );

create policy "team can update sponsors"
  on sponsors for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_active)
  );

-- Only admins can delete
create policy "admin can delete sponsors"
  on sponsors for delete using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );
```

Repeat equivalent policies for `contacts`, `contact_log`, `offers_agreements`. This means:
- Even if someone finds the API URL, **Postgres itself** rejects any query from a non-team-member
  or deactivated account — this is enforced at the database layer, not just hidden in the UI.
- Deactivating someone who leaves the club is one row update (`is_active = false`), not a password
  reset or link rotation.
- Only admins (club leads) can delete records or invite/deactivate members; regular members can
  read/write but not destroy data.

### 4.3 Application-level checks

In addition to RLS, the Next.js app should:
- Redirect any unauthenticated request to the login page (middleware-level check, not just per-page).
- Hide admin-only UI (invite member, delete records) from non-admins.
- Never expose the Supabase **service role key** to the browser — only the public **anon key**,
  which is safe to expose *because* RLS is enforced server-side regardless of what key is used.

---

## 5. Security checklist

- [ ] RLS enabled and tested on **every** table (query as a non-team-member test account and
      confirm it returns nothing).
- [ ] Sign-up disabled or domain-restricted (Section 4.1).
- [ ] Service role key stored only in server-side environment variables, never in client bundle or
      committed to git.
- [ ] `.env.local` added to `.gitignore`; secrets set via Vercel's Environment Variables UI, not
      hardcoded.
- [ ] HTTPS enforced everywhere (automatic with Vercel).
- [ ] Session length reasonable (e.g. auto-logout after inactivity) via Supabase Auth settings.
- [ ] Rate limiting on the login/magic-link endpoint (Supabase provides this by default; verify it's on).
- [ ] Audit fields (`created_by`, `created_at`, `updated_at`) on every table so any change is traceable.
- [ ] Regular automated backups (Supabase does daily backups on paid tiers; on the free tier, add a
      weekly manual export — see Section 7).
- [ ] No sponsor financial data (`Amount Received`, invoice numbers) exposed in any public-facing
      page — the whole app sits behind login, with no public routes except `/login`.

---

## 6. Build phases (in order)

**Phase 1 — Foundation**
1. Create a Supabase project; note the project URL, anon key, and service role key.
2. Run the schema from Section 3 via the Supabase SQL editor.
3. Enable RLS and write the policies from Section 4.2.
4. Scaffold a Next.js + TypeScript app; install `@supabase/supabase-js` and `@supabase/ssr`.
5. Wire up Supabase Auth (magic link) with invite-only sign-up.

**Phase 2 — Core CRUD**
6. Build the Sponsor Pipeline list view: table with search box (filter by company name), column
   filters (status, priority, owner), and sort.
7. Build the Sponsor detail page: shows one sponsor's fields plus nested Contacts, Contact Log
   entries, and Offers, each addable/editable inline.
8. Build create/edit forms for Sponsors, Contacts, Contact Log entries, and Offers — dropdowns
   populated from the lookup tables (mirrors the `Lists` sheet).

**Phase 3 — Dashboard & search**
9. Build a Dashboard page reproducing the KPI cards (Total Sponsors, Contacted, Confirmed,
   Follow-ups Due) from the SQL view in Section 3.
10. Add a global search bar (sponsor name, contact name, or notes) using Postgres full-text search
    (`tsvector`) or a simple `ILIKE` query for this data volume.

**Phase 4 — Team management**
11. Build an admin-only "Team" page: invite a member by email, deactivate a member, promote to admin.

**Phase 5 — Data migration**
12. Write a one-time import script (Python + `openpyxl`/`pandas`, or a Supabase CSV import) that
    reads each sheet from `AI_DS_Club_Sponsorship_CRM_Template.xlsx`, maps columns to the schema in
    Section 3, and inserts rows — skipping blank template rows.
13. Spot-check the imported data against the original spreadsheet before treating the app as the
    source of truth.

**Phase 6 — Polish & handoff**
14. Add basic responsive styling (mobile-friendly, since team members may log follow-ups from
    their phones).
15. Write a short internal README covering: how to invite a new member, how to deactivate someone
    who graduates/leaves, and where backups live.
16. Deploy to Vercel (connect the GitHub repo, set environment variables, deploy).

---

## 7. Deployment & where data lives

| Component | Where it's deployed | Notes |
|---|---|---|
| Web app (Next.js) | **Vercel**, connected to a GitHub repo for CI/CD | Push to `main` → auto-deploy. Free "Hobby" tier is enough for this traffic. |
| Database | **Supabase Postgres**, hosted in Supabase's managed cloud (pick the region nearest your team) | This is where every sponsor, contact, log entry, and offer record actually lives. |
| Auth | **Supabase Auth**, same project as the database | Manages who can log in; team member list lives in the `profiles` table. |
| File attachments (MoUs, agreement PDFs), if used | **Supabase Storage**, same project | Access governed by the same RLS-style storage policies. |
| Secrets (API keys) | **Vercel Environment Variables** (encrypted at rest, not in the git repo) | Never commit `.env` files. |
| Backups | Supabase automated backups (paid tier) or a scheduled export script (free tier) | See below. |

**On the free tier**, Supabase doesn't include automated point-in-time backups, so add a lightweight
scheduled job (e.g. a GitHub Action running weekly) that dumps the database to a `.sql` file or CSV
and stores it somewhere durable (a private Google Drive folder or GitHub private repo release) —
this replaces the informal "the spreadsheet file itself is the backup" safety net you have today.

**Cost estimate:** with a few dozen sponsors and a handful of team members, this fits comfortably
inside Vercel's and Supabase's free tiers. If the club grows significantly (hundreds of sponsors,
heavy concurrent use), Supabase's paid Pro tier (~$25/mo) adds daily backups and higher limits —
worth revisiting only if you outgrow the free tier.

---

## 8. Handoff notes for next year's team

Because club leadership turns over, write these into the internal README (Phase 6, step 15):
- How to add/remove a team member (Team admin page).
- How to rotate the Supabase project ownership to the next Sponsorship & PR lead (Supabase supports
  transferring project ownership to another account/email).
- Where the last data export/backup lives.
- That the *original spreadsheet* can be kept as a read-only historical reference but should no
  longer be the working copy once the app is live, to avoid the two drifting out of sync.