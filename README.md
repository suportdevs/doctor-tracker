# Doctor Tracker

**Doctor Tracker is a secure admin web app for clinics.** Staff can manage doctors and their patients, follow each patient's condition, and see live analytics on one dashboard. The same admin panel also runs the clinic's **public website**. Every page, menu, colour, contact detail and SEO tag on the site is managed from the admin with a visual page builder, so nobody has to touch code. Parts of the site, such as the doctor directory, specialties and headline numbers, are **live views of the clinic database**: when a doctor is added in the admin, the website shows them.

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, SWR, Recharts
- **Backend:** Node.js, Express 4 (standalone REST API), Zod validation, JWT auth
- **Database:** MongoDB 7 with Mongoose 8
- **DevOps:** Docker Compose (MongoDB + API + Next.js)

---

## Contents

1. [Features](#features)
2. [Setup guide](#setup-guide)
3. [System architecture](#system-architecture)
4. [Technical decisions](#technical-decisions)
5. [Visual evidence](#visual-evidence)
6. [API reference](#api-reference)
7. [Project structure](#project-structure)

---

## Features

| Area | What you get |
| --- | --- |
| **Authentication** | JWT login with bcrypt-hashed passwords, a rate-limited login endpoint, sessions checked on every request (disabled users are locked out immediately), and every API route protected. **Forgot / reset password** by email (single-use, 30-minute link). **Two-factor authentication** with a 6-digit email code (10 minutes, 5 tries). Changing or resetting a password signs out every other session. |
| **Authorization** | Three roles defined in code (`admin`, `manager`, `editor`) and checked by `authorize()` middleware on every route. The sidebar and pages hide what a role can't use. |
| **Doctors** | Create, edit and delete doctors (name, **photo**, specialization, hospital, phone, email, status, join date). Search; filter by specialization, hospital, status and **join-date range**; sort; paginate. A patient count is shown on every row. Switch between a **table and a photo grid** view. |
| **Doctor detail** | Profile card plus that doctor's patients, with search, filters and pagination. You can **add patients under the doctor** and **remove them from the doctor's list**. |
| **Patients** | A dedicated page listing every patient. Edit and delete patients. Search by name, phone, email or diagnosis. Filter by **visit-date range**, **condition**, gender, age group and doctor. Sort and paginate. |
| **Dashboard** | Total and active doctors, total patients, visits in the selected range with growth vs the previous period (plus a sparkline), critical patients, a **patient visits over time** chart (7d / 30d / 90d / 12m), **patients per doctor** (a ranked list with each doctor's photo), patients by specialty, condition mix, age and gender demographics, and recent visits. |
| **Global search** | Press **Ctrl/⌘ + K** anywhere in the admin to search doctors, patients and pages at once, with keyboard navigation. It reuses the normal list endpoints, so permissions and indexes apply as usual. |
| **Website CMS** *(extra feature)* | A visual **page builder** with 14 block types (hero, features, image + text, rich text, numbers, steps, **doctors**, **specialties**, testimonials, FAQ, gallery, call to action, **contact / appointment form**), a live preview, reordering, hide, duplicate, draft/publish and per-page SEO. Also **header and footer menus** with dropdowns, a **media library**, and **site settings** (name, logo, favicon, home page, brand colours, corner radius, header button, announcement bar, contact details, social links, default SEO, admin-panel branding). |
| **Messages** | The website's contact and appointment forms (with spam protection) save into **Admin → Messages**, where staff can read, reply, mark and delete them. |
| **Menus** *(extra)* | **Drag and drop** links to reorder them or move them into a dropdown (plus keyboard-friendly up/down buttons). Built-in header and footer menus plus **any number of custom menus**; Site settings choose which menu shows in the header and footer. |
| **Home page demos** *(extra)* | Three extra home page designs built only from page-builder blocks — **Bold** (full-screen photo, dark sections, quote carousel), **Minimal** (centered, calm) and **Bento** (grid of live numbers and real doctor photos). Pick one in Site settings → General → Home page, or open `/home-bold`, `/home-minimal`, `/home-bento`. New block styles: full-screen and bento heroes, numbered feature list, quote carousel, scrolling strip. |
| **Website motion** *(extra)* | Sections fade up as they scroll in (staggered), numbers count up, a reading-progress bar, hover effects on cards, **specialty filter buttons** on the doctors list and a **gallery lightbox** (← / → / Esc). Motion is turned off for people who prefer reduced motion. |
| **Admin Customize panel** *(extra)* | A side panel (gear icon) where each user picks **light / dark / system theme**, **accent colour**, **vertical sidebar or horizontal top menu**, sidebar **left / right** and **collapsed**, **font**, **font size** and **zoom** — saved to their account, so it follows them to any device. Colours and fonts are CSS variables, so a change applies instantly without a reload. |
| **UX** | Admin: light indigo design by default. Website: its own theme driven by the site colour settings, Bricolage Grotesque headings. Responsive at every size (tables become cards on phones, filters fold behind a toggle), dark mode in the admin, filters kept in the URL (shareable, survive refresh), debounced search, skeleton loaders, toasts, confirm dialogs, unsaved-changes warnings, and Ctrl/⌘+S to save a page. |

### Demo accounts

All accounts use the password **`Admin@123`**:

| Email | Role | Can access |
| --- | --- | --- |
| `admin@doctortracker.dev` | Administrator | Everything |
| `manager@doctortracker.dev` | Clinic manager | Dashboard, doctors, patients, messages |
| `editor@doctortracker.dev` | Website editor | Dashboard, website (pages, menus, media, settings), messages |

The seed creates **40 doctors with real photos** in 12 specialties and **1,800 patients** spread over the past year, so the charts and filters have realistic data. Patient data is consistent: diagnoses match the doctor's specialty, ages fit the department (pediatrics 0–17), names match gender, and many patients have a short clinical note. It also creates the 6 website pages (with real clinic photography) and 2 menus.

> **Image credits:** doctor portraits and clinic photos are from [Unsplash](https://unsplash.com/license) (free to use) and [randomuser.me](https://randomuser.me/). They are stored in `client/public/images`, so the demo works offline.

---

## Setup guide

### Option A: Docker (recommended, one command)

Requirements: Docker Desktop.

```bash
git clone <repo-url> doctor-tracker
cd doctor-tracker
cp .env.example .env          # optional: every value has a safe local default
docker compose up -d --build
```

| URL | What |
| --- | --- |
| http://localhost:3000 | Public website |
| http://localhost:3000/admin | Admin panel (log in with a demo account above) |
| http://localhost:4000/api/health | API health check |

On the first start the API sees an empty database and seeds the demo data (`SEED_ON_START=true`). MongoDB is published on **localhost:27018**, so it doesn't clash with a local MongoDB on 27017.

```bash
docker compose logs -f server                     # API logs
docker compose exec server node src/seeders/run.js --fresh   # reset demo data
docker compose down                               # stop (data is kept in Docker volumes)
docker compose down -v                            # stop and delete all data
```

### Option B: Run locally with npm (for development)

Requirements: Node 18+ and Docker (used for MongoDB only), or any MongoDB 6+ instance.

```bash
# 1. Database
docker compose up -d mongo              # MongoDB on localhost:27018

# 2. API (terminal 1)
cd server
cp .env.example .env                    # set a long random JWT_SECRET
npm install
npm run dev                             # http://localhost:4000 (seeds demo data on first run)

# 3. Website + admin (terminal 2)
cd client
cp .env.example .env.local
npm install
npm run dev                             # http://localhost:3000
```

Useful scripts: `npm run seed` (fill empty collections) and `npm run seed:fresh` (wipe and re-seed), both run in `server/`.

### Environment variables

There are three `.env.example` files, one for each way of running the app:

| File | Used by | Key variables |
| --- | --- | --- |
| [.env.example](.env.example) | `docker compose` | `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `PUBLIC_API_URL`, `MONGO_PORT`, `SEED_ON_START` |
| [server/.env.example](server/.env.example) | `npm run dev` in `server/` | `MONGO_URI`, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (CORS + links in emails), `SEED_ON_START`, `SMTP_HOST/PORT/USER/PASS`, `MAIL_FROM`, `MAIL_PREVIEW` |
| [client/.env.example](client/.env.example) | `npm run dev` in `client/` | `NEXT_PUBLIC_API_URL` (browser → API), `API_URL` (Next.js server → API), `NEXT_PUBLIC_SITE_URL` |

> **Production:** set a long random `JWT_SECRET`, set `SEED_ON_START=false` once real data exists, and set `CLIENT_URL` / `PUBLIC_API_URL` to your real domains.

---

## System architecture

```
                         ┌──────────────────────────── Next.js (client/) ──────────────────────────┐
  Visitor ──────────────►│ Public website  app/(site)                                               │
                         │  Server Components → services/server-api.js → fetch(API, 60s, tag "cms")  │──┐
                         │  BlockRenderer turns page JSON into sections                              │  │
                         │                                                                           │  │
  Staff ────────────────►│ Admin panel  app/admin                                                    │  │
                         │  Client Components → SWR (hooks/useApi.js) → services/api.js + JWT        │──┤ REST / JSON
                         │  After a website edit → POST /api/revalidate → revalidateTag("cms")       │  │
                         └───────────────────────────────────────────────────────────────────────────┘  │
                                                                                                         ▼
                         ┌──────────────────────────── Express API (server/) ───────────────────────────┐
                         │ helmet · cors · compression · rate limits                                    │
                         │ route → authenticate (JWT) → authorize(permission) → controller              │
                         │        controller → Zod validator → service (queries / aggregations) → model │
                         │ /api/auth  /api/dashboard  /api/doctors  /api/patients  /api/users            │
                         │ /api/pages /api/menus /api/settings /api/media /api/messages  (website CMS)   │
                         │ /api/public/*  (no auth: bootstrap, pages, live data, contact form)           │
                         │ errorHandler → consistent { message, errors[] } responses                     │
                         └──────────────────────────────────────┬────────────────────────────────────────┘
                                                                │ Mongoose
                                                                ▼
                         ┌───────────────────────────── MongoDB ─────────────────────────────────────────┐
                         │ doctors · patients · users · pages · menus · settings · media · messages      │
                         │ compound indexes for each filter + sort combination                           │
                         └───────────────────────────────────────────────────────────────────────────────┘
```

### Request flows

**Admin, for example "patients filtered by condition":**
1. The filter change updates the URL (`?condition=critical&page=1`) through `useUrlFilters`.
2. SWR requests `GET /api/patients?condition=critical&page=1`. It shows the previous page dimmed while loading, so the table doesn't flash.
3. Express checks the JWT (`authenticate`) and the `patients` permission (`authorize`), then builds the Mongo filter.
4. `find().sort().skip().limit()` and `countDocuments()` run **in parallel**, both using the `{ condition: 1, visitDate: -1 }` index. A single `populate` (one `$in` query) adds the doctor names.
5. The API responds with `{ items, meta: { total, page, limit, pages } }`.

**Website, for example a visitor opening `/about`:**
1. The Next.js server component calls `GET /api/public/pages/about`. The response holds the page's **blocks** plus **live data** (active doctors, specialties, totals), which the API caches in memory for 60 seconds.
2. `BlockRenderer` maps each block's `type` to a React component. The HTML is cached by Next.js (ISR) for 60 seconds.
3. When an editor saves a page, menu or setting, the admin calls `POST /api/revalidate`. That route checks the user's token and `website` permission, then calls `revalidateTag('cms')`, so **the change is live on the next request**.

**Dynamic content model:** a page is just `{ title, slug, status, seo…, blocks: [{ id, type, data, style }] }`. The list of block types and their form fields lives in one file, [client/src/config/blocks.js](client/src/config/blocks.js). The admin builds its editing forms **from that schema**, and the website and the builder preview render with the **same components**, so the preview always matches the live site. Adding a new block type never needs a database migration.

---

## Technical decisions

### 1. Why SWR + URL search params instead of Redux (or a big Context)

Almost all state in this app is **server state**: lists, totals and records that live in MongoDB. The only real client state is "which filters and page am I looking at?".

- **Filters live in the URL** ([client/src/hooks/useUrlFilters.js](client/src/hooks/useUrlFilters.js)). Refresh, back/forward and sharing a link all keep the exact view. For example, the dashboard's "View critical patients" is just a link to `/admin/patients?condition=critical`. Changing any filter resets to page 1, and default values are left out to keep URLs clean.
- **SWR owns server data.** The cache key is `[path, params]`, so every filter combination is cached separately: going back to page 1 is instant. Identical requests are de-duplicated (two components asking for `/doctors/options` make one request). `keepPreviousData` keeps the old rows visible (dimmed) while the next page loads. After a write we call `mutate()` on the affected list instead of hand-updating a global store.
- **Context only for auth.** `AuthProvider` holds the signed-in user and a memoised `can(permission)` helper. That value rarely changes, so it doesn't cause re-renders.

Redux would have meant writing actions, reducers, loading flags and cache invalidation by hand for data SWR already handles. It would also have added a store that duplicates the URL. **Trade-off:** there is no single global state tree to inspect, but each page is easier to read: its state is its URL, plus the data for that URL.

Re-renders are also kept down with `React.memo` table rows and `useCallback` handlers (editing one row doesn't re-render the others), a 350 ms debounced search, and lazily loaded charts (`next/dynamic`), so Recharts is only downloaded on the dashboard.

### 2. Why the query and index design looks the way it does (MongoDB)

Every list screen is "filter by X, sort by date, return page N", so the indexes are **compound indexes ordered `{ filterField, dateField }`**:

| Collection | Index | Serves |
| --- | --- | --- |
| patients | `{ doctor: 1, visitDate: -1 }` | a doctor's patient list; the patients-per-doctor `$group`; per-page patient counts |
| patients | `{ condition: 1, visitDate: -1 }` | condition filter + newest-first sort |
| patients | `{ gender: 1, visitDate: -1 }`, `{ visitDate: -1 }` | gender filter; date-range filter, dashboard time series |
| doctors | `{ specialization: 1, joinedAt: -1 }`, `{ hospital: 1, joinedAt: -1 }`, `{ status: 1, joinedAt: -1 }`, `{ joinedAt: -1 }`, `{ name: 1 }`, `email` (unique) | each doctor filter + default sort, name sort, filter dropdowns via `distinct` |

With the index matching both the filter and the sort, MongoDB reads documents in order and stops after `limit`; it never sorts in memory. Verified with `explain('executionStats')` on the seeded data:

```
patients by condition : condition_1_visitDate_-1      docsExamined=10   (page size 10)
patients of a doctor  : doctor_1_visitDate_-1         docsExamined=10
patients date range   : visitDate_-1                  docsExamined=10
doctors by specialty  : specialization_1_joinedAt_-1  docsExamined=4
```

Other query patterns:
- **No N+1 queries.** The doctors list gets the patient counts for a whole page with **one** `$group` over `{ doctor }` instead of one count per row. Patient lists use one `populate` (`$in`) for doctor names.
- **The dashboard is a handful of parallel queries**, not dozens. One `$facet` returns the condition, gender, age-bucket (`$bucket`) and critical-count breakdowns in a single round trip. `$dateTrunc` groups the time series by day, week or month, and empty buckets are filled in JavaScript so charts don't skip days. Totals use `estimatedDocumentCount()`, which reads collection metadata.
- **Lean reads and projections:** list endpoints use `.lean()`, page lists leave out the heavy `blocks` field, and public endpoints only return public fields.
- **Search** is a case-insensitive "contains" match with the user's text escaped as a regex. It is combined with the indexed filters, so it scans only within an already-narrowed range. *Trade-off:* a leading-wildcard regex can't use an index on its own. For a few thousand records per clinic it is instant and supports partial words ("card" finds "Cardiology"), which a `$text` index doesn't. At a much larger scale the plan is MongoDB Atlas Search (n-gram autocomplete), which only changes `searchFilter()` in [server/src/utils/queryFilters.js](server/src/utils/queryFilters.js).
- **Pagination** uses `skip/limit` with a parallel `countDocuments`, because the UI needs page numbers and a total. For very deep pages, keyset ("after this date") pagination would be the upgrade path.

### Smaller decisions worth knowing

- **Validation in one place:** one Zod schema file per resource ([server/src/validators](server/src/validators)) returns `422 { message, errors: [{ path, message }] }`. The admin's `useForm` maps those errors onto the matching fields. Malformed ids return 400 before any query runs (`router.param` + `validateObjectId`), and duplicate emails return 409.
- **Security:** helmet, CORS limited to `CLIENT_URL`, a login rate limit (20 per 15 min), a contact-form rate limit and honeypot, rich-text HTML sanitized on save (`sanitize-html`), SVG uploads refused (they can carry scripts), and the API never returns password hashes. Deleting a doctor who still has patients is refused (409), so no patient is left without a doctor.
- **Password reset & 2FA:** reset tokens and one-time codes are random (`crypto`), stored only as SHA-256 hashes, expire (30 / 10 minutes) and work once; a code allows 5 wrong tries, and those endpoints have their own rate limit. "Forgot password" answers the same way for unknown emails, so accounts can't be discovered. After the password step a 2FA user gets a 10-minute *challenge* token that the API refuses as a session. Every token issued before a password change/reset stops working (`passwordChangedAt`). Without SMTP the API logs the email, and with `MAIL_PREVIEW=true` (demo default) shows the link/code on screen — **set `MAIL_PREVIEW=false` in production**.
- **Permissions are code, not data** ([server/src/constants/roles.js](server/src/constants/roles.js)): adding a role or permission is a one-line change with no migration.
- **Settings without migrations:** each settings group is stored as one document and deep-merged over the defaults in [server/src/services/settings.service.js](server/src/services/settings.service.js), so a new option only needs a default value. Unknown keys are dropped on save.
- **JWT in `localStorage` (Bearer header):** this keeps the API stateless and lets the Next.js app and the API run on different domains without cross-site cookie setup. The trade-off is exposure to XSS, which is reduced by React's escaping, sanitized rich text and a short token lifetime (`JWT_EXPIRES_IN=1d`). An httpOnly cookie on a shared parent domain is the upgrade path.

---

## Visual evidence

All screenshots are from the seeded demo, captured at 1440×900 (desktop) and 390×844 (mobile). The files are in [docs/screenshots](docs/screenshots).

### Admin dashboard
| Desktop | Mobile |
| --- | --- |
| ![Dashboard desktop](docs/screenshots/admin-dashboard-desktop.png) | ![Dashboard mobile](docs/screenshots/admin-dashboard-mobile.png) |

### Doctors: list and detail with that doctor's patients
| Desktop | Mobile |
| --- | --- |
| ![Doctors desktop](docs/screenshots/admin-doctors-desktop.png) | ![Doctors mobile](docs/screenshots/admin-doctors-mobile.png) |
| ![Doctor detail desktop](docs/screenshots/admin-doctor-detail-desktop.png) | ![Doctor detail mobile](docs/screenshots/admin-doctor-detail-mobile.png) |

### Doctors photo grid and global search (Ctrl/⌘ + K)
| Grid view | Global search |
| --- | --- |
| ![Doctors grid](docs/screenshots/admin-doctors-grid-desktop.png) | ![Global search](docs/screenshots/admin-search-desktop.png) |

### Patients (filtered to critical)
| Desktop | Mobile |
| --- | --- |
| ![Patients desktop](docs/screenshots/admin-patients-desktop.png) | ![Patients mobile](docs/screenshots/admin-patients-mobile.png) |

### Collapsible sidebar (left or right) and drag-and-drop menus
| Collapsed | Sidebar on the right |
| --- | --- |
| ![Collapsed sidebar](docs/screenshots/admin-sidebar-collapsed-desktop.png) | ![Sidebar on the right](docs/screenshots/admin-sidebar-right-desktop.png) |

![Menus](docs/screenshots/admin-menus-desktop.png)

### Admin Customize panel (saved per user)
| Customize panel | Horizontal menu + rose accent |
| --- | --- |
| ![Customize panel](docs/screenshots/admin-customizer.png) | ![Horizontal layout](docs/screenshots/admin-horizontal-rose.png) |
| ![Dark + emerald + DM Sans, large text](docs/screenshots/admin-dark-emerald.png) | ![Profile with two-factor authentication](docs/screenshots/admin-profile.png) |

### Home page demos
| Bold | Minimal | Bento |
| --- | --- | --- |
| ![Home Bold](docs/screenshots/site-home-bold.png) | ![Home Minimal](docs/screenshots/site-home-minimal.png) | ![Home Bento](docs/screenshots/site-home-bento.png) |

### Gallery lightbox and forgot password (demo mode)
| Gallery lightbox | Forgot password |
| --- | --- |
| ![Gallery lightbox](docs/screenshots/site-gallery-lightbox-desktop.png) | ![Forgot password](docs/screenshots/auth-forgot.png) |

### Website page builder and site settings
| Page builder | Site settings |
| --- | --- |
| ![Page builder](docs/screenshots/admin-page-builder-desktop.png) | ![Settings](docs/screenshots/admin-settings-desktop.png) |

### Public website (fully managed from the admin)
| Desktop | Mobile |
| --- | --- |
| ![Website home desktop](docs/screenshots/site-home-desktop.png) | ![Website home mobile](docs/screenshots/site-home-mobile.png) |
| ![Doctors page](docs/screenshots/site-doctors-desktop.png) | ![Contact page mobile](docs/screenshots/site-contact-mobile.png) |
| ![About page](docs/screenshots/site-about-desktop.png) | ![About page mobile](docs/screenshots/site-about-mobile.png) |

### Login
| Desktop | Mobile |
| --- | --- |
| ![Login desktop](docs/screenshots/admin-login-desktop.png) | ![Login mobile](docs/screenshots/admin-login-mobile.png) |

---

## API reference

All responses are JSON. Errors always look like `{ "message": "…", "errors"?: [{ "path", "message" }] }`. Lists return `{ items, meta: { total, page, limit, pages } }` and accept `page` and `limit` (max 100).

| Method & path | Permission | Notes |
| --- | --- | --- |
| `POST /api/auth/login` | public (rate-limited) | `{ email, password }` → `{ token, user }`, or `{ twoFactor, challenge }` when 2FA is on |
| `POST /api/auth/login/verify` · `POST /api/auth/login/resend` | public (rate-limited) | 2FA step: `{ challenge, code }` → `{ token, user }` |
| `POST /api/auth/forgot-password` · `POST /api/auth/reset-password` | public (rate-limited) | `{ email }` → email with link · `{ token, password }` |
| `GET /api/auth/me` · `PUT /api/auth/me` · `PUT /api/auth/me/password` · `PUT /api/auth/me/preferences` | signed in | profile, password (returns a fresh token), Customize panel |
| `POST /api/auth/me/2fa/setup` · `/enable` · `/disable` | signed in | turn email 2FA on (confirm a code) or off (needs password) |
| `GET /api/dashboard?range=7d\|30d\|90d\|12m` | dashboard | all analytics in one response |
| `GET /api/doctors` | doctors | `q, specialization, hospital, status, from, to, sort=newest\|oldest\|name` |
| `GET /api/doctors/filters` · `GET /api/doctors/options` | doctors · doctors or patients | dropdown values |
| `POST /api/doctors` · `GET/PUT/DELETE /api/doctors/:id` | doctors | delete returns 409 while the doctor has patients |
| `GET/POST /api/doctors/:id/patients` · `DELETE /api/doctors/:id/patients/:patientId` | doctors | a doctor's patients |
| `GET /api/patients` | patients | `q, condition, gender, doctor, from, to, minAge, maxAge, sort=newest\|oldest\|name\|age` |
| `POST /api/patients` · `GET/PUT/DELETE /api/patients/:id` | patients | |
| `GET/POST /api/users` · `PUT/DELETE /api/users/:id` | users | can't disable or delete yourself |
| `GET/POST /api/pages` · `GET/PUT/DELETE /api/pages/:id` · `POST /api/pages/:id/duplicate` | website | page builder |
| `GET/POST /api/menus` · `PUT/DELETE /api/menus/:location` | website | built-in `header`, `footer` (can't be deleted) + custom menus |
| `GET /api/settings` · `PUT /api/settings/:group` · `POST /api/settings/:group/reset` | website | groups: general, appearance, contact, social, seo, admin |
| `GET/POST /api/media` · `PUT/DELETE /api/media/:id` | website | images only, 5 MB max |
| `GET /api/messages` · `PATCH/DELETE /api/messages/:id` | messages | website form submissions |
| `GET /api/public/bootstrap · /home · /pages · /pages/:slug · /live · /admin-brand` | public | website data |
| `POST /api/public/messages` | public (rate-limited) | contact / appointment form |

---

## Project structure

Both apps follow the usual layout for their framework.
- **API (layered):** a request flows **route → middleware → controller → service → model**. Each layer has one job:

| Layer | Job | Example |
| --- | --- | --- |
| `routes/` | URL + HTTP method → middleware + controller. No logic. | `router.route('/:id').get(getPatient)` |
| `middlewares/` | Cross-cutting checks: JWT, permissions, rate limits, uploads, id format, errors | `authorize('patients')` |
| `controllers/` | Read the request, validate it, call a service or model, send the response | `createPatient` |
| `validators/` | Zod schemas, one file per resource | `patientSchema` |
| `services/` | Reusable query and business logic shared by several controllers | `listPatients`, `getDashboardStats` |
| `models/` | Mongoose schemas and **indexes** | `Patient` |

- **Client:** standard Next.js `src/` layout. Pages live in `app/`, reusable pieces in `components/` (grouped by feature), plus hooks, context, services (API calls), config and constants.

```
doctor-tracker/
├── docker-compose.yml               MongoDB + API + client
├── .env.example                     variables for docker compose
├── docs/screenshots/                README images (desktop & mobile)
│
├── server/                          Express REST API
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
│       ├── server.js                entry: connect DB → seed if empty → listen
│       ├── app.js                   Express app: security middleware, /api routes, error handler
│       ├── config/
│       │   ├── index.js             all environment variables, read in one place
│       │   └── db.js                MongoDB connection + index sync
│       ├── constants/               roles & permissions, patient conditions & genders
│       ├── routes/
│       │   ├── index.js             mounts every resource under /api
│       │   └── *.routes.js          auth, dashboard, doctor, patient, user, page, menu, setting, media, message, public
│       ├── middlewares/             auth (JWT + authorize), error, rateLimit, upload, validateObjectId
│       ├── controllers/             *.controller.js — one per resource
│       ├── validators/              *.validator.js — Zod schemas per resource (+ common pieces)
│       ├── services/                dashboard, doctor, patient, page, public (live data), settings
│       ├── models/                  Doctor, Patient, User, Page, Menu, Setting, Media, Message
│       ├── utils/                   HttpError, asyncHandler, pagination, queryFilters, slugify, permissions
│       └── seeders/
│           ├── index.js             seedIfEmpty / seedFresh
│           ├── run.js               CLI: npm run seed / seed:fresh
│           └── data/                demo clinic data generator, demo website pages & menus
│
└── client/                          Next.js 14 (public website + admin panel)
    ├── Dockerfile                   multi-stage build, standalone output
    ├── .env.example
    ├── public/images/               doctor portraits + clinic photos used by the demo data
    └── src/
        ├── app/                     routes (App Router)
        │   ├── (site)/              public website: layout, home, [slug] CMS pages
        │   ├── admin/login/
        │   ├── admin/(panel)/       dashboard, doctors, patients, messages, users, profile, website/*
        │   ├── api/revalidate/      refreshes cached website pages after admin edits
        │   └── layout.js, globals.css, sitemap.js, robots.js, not-found.js
        ├── components/
        │   ├── ui/                  design system: Badge, Modal, Pagination, Select, StatCard… (one file each)
        │   ├── layout/              AdminShell, Customizer (admin look & feel), CommandPalette (Ctrl/⌘+K), SiteHeader, SiteFooter
        │   ├── auth/                RequirePermission, AuthLayout, CodeInput, MailPreview
        │   ├── common/              FilterBar (+ DateRange)
        │   ├── dashboard/           Charts (Recharts), TopDoctors (patients-per-doctor ranking)
        │   ├── doctors/             DoctorForm
        │   ├── patients/            PatientForm, PatientsTable
        │   ├── cms/                 PageBuilder, FieldRenderer, MediaLibrary
        │   └── site/                BlockRenderer, Section, Reveal (scroll animation), CountUp, blocks/* (website sections)
        ├── context/                 AuthContext (signed-in user + can(permission))
        ├── hooks/                   useApi (SWR), useUrlFilters, useDebounce, useForm, useUnsavedWarning, useSaveShortcut
        ├── services/                api.js (browser → API), server-api.js (Next.js server → API, cached)
        ├── config/                  blocks.js (page-builder block registry), navigation.js (admin sidebar)
        ├── constants/               labels & colours for conditions, genders, roles, sorts
        └── lib/                     utils, theme (settings → CSS variables), icons
```
# doctor-tracker
