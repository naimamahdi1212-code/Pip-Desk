# Naima's Academy (Pip Desk)

A one-page forex learning hub, built as a teaching project to walk through full-stack web development — from a static frontend to a live site with real user accounts and a managed lessons database.

## Live site

- Frontend: hosted on [Netlify](https://netlify.com)
- Backend: [Appwrite](https://appwrite.io) (Auth, Databases, Teams)

## Features

- **Landing page** introducing the site and core forex concepts (pips, leverage, spread, candlesticks)
- **Login / signup** with email and password, backed by Appwrite Auth
- **Dashboard** — a session-protected page shown after login
- **Lessons** — a list of forex lessons pulled from an Appwrite database table, each with a markdown-rendered detail page
- **Admin panel** — lets team members add, edit, and publish lessons, gated behind an Appwrite Team membership check

## Tech stack

- HTML, CSS, and vanilla JavaScript — no framework or build step
- [Appwrite](https://appwrite.io) for authentication, the database, and team-based permissions
- Hosted on Netlify, deployed automatically on every push to `main`

## Project structure

```
├── index.html            # Landing / marketing page
├── login.html            # Login and signup
├── dashboard.html         # Post-login dashboard
├── lessons.html           # List of published lessons
├── lesson.html             # Single lesson detail (markdown-rendered)
├── admin.html              # Admin panel for managing lessons
├── style.css                # Shared design system (colors, type, layout)
├── appwrite-client.js        # Shared Appwrite client config — endpoint,
│                              project ID, database/table/team IDs
├── auth.js                    # Login and signup logic
├── guard.js                    # Redirects logged-out users away from
│                                protected pages
├── admin-guard.js                # Checks admin Team membership before
│                                  allowing access to admin.html
├── lessons-list.js                 # Fetches and renders the lessons list
├── lesson.js                        # Fetches a single lesson + progress
├── admin.js                          # Create/edit/publish lessons from
│                                      the admin panel
└── README.md
```

## Backend setup (Appwrite)

This project expects the following to exist in your Appwrite project:

1. **A database**, with a table called `lessons`:

   | Column | Type |
   |---|---|
   | `title` | string |
   | `slug` | string |
   | `summary` | string |
   | `image` | string (optional) |
   | `order` | integer |
   | `published` | boolean |
   | `body` | string (long — holds markdown) |

2. **(Optional) A `progress` table**, for the "mark lesson complete" feature:

   | Column | Type |
   |---|---|
   | `userId` | string |
   | `lessonId` | string |
   | `completed` | boolean |
   | `completedAt` | datetime |

3. **A Team** (e.g. "Admins") — members of this team can access `admin.html` and create/edit lessons.

4. **Row/Document Security enabled** on both tables, so per-lesson and per-user permissions are respected.

Once these exist, fill in their IDs in `appwrite-client.js`:

```javascript
window.PIPDESK_DATABASE_ID = "your-database-id";
window.PIPDESK_LESSONS_COLLECTION_ID = "your-lessons-table-id";
window.PIPDESK_PROGRESS_COLLECTION_ID = "your-progress-table-id";
window.PIPDESK_ADMIN_TEAM_ID = "your-admin-team-id";
```

## Running locally

No build step needed — just open `index.html` in a browser, or serve the folder with any static file server:

```bash
npx serve .
```

## Deploying

Push to `main` and Netlify rebuilds and redeploys automatically:

```bash
git add .
git commit -m "describe your change"
git push
```

## Status

🚧 Actively being built as part of a hands-on web development lesson series. Currently wiring up the Appwrite database and admin panel for managing lessons.
