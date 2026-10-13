# Meridian Corp — Employee Management System

Full-stack employee portal: public registration, role-based login (employee/admin),
a self-service employee profile dashboard, and an admin dashboard to manage every
employee record.

## Tech stack
- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: Node.js + Express
- Database: MySQL
- Auth: express-session (cookie-based sessions) + bcrypt password hashing

## Project structure
```
meridian-ems/
├── backend/          <- run everything from inside here
│   ├── server.js
│   ├── seedAdmin.js  <- creates your first admin account
│   ├── config/db.js
│   ├── routes/        (auth.js, employee.js, admin.js)
│   ├── controllers/   (authController.js, employeeController.js, adminController.js)
│   └── middleware/authMiddleware.js  (requireAuth, requireAdmin)
├── frontend/          <- served automatically by server.js, no separate server needed
│   ├── index.html, register.html, login.html,
│   │   employee-dashboard.html, admin-dashboard.html
│   ├── css/  (style.css, auth.css, dashboard.css)
│   └── js/   (index.js, register.js, login.js, employee.js, admin.js)
└── database/schema.sql
```

## Running locally

1. **Start MySQL** (XAMPP's MySQL alone is fine — Apache is not needed for this project).

2. **Create the database.** In phpMyAdmin's SQL tab, run the contents of `database/schema.sql`.
   This creates `meridian_ems` with two tables: `users` (login + core info, both
   employees and admins) and `employee_profiles` (the extra self-service details,
   one row per employee, linked by `user_id`).

3. **Install dependencies.** From inside `backend/`:
   ```
   npm install
   ```

4. **Set up environment variables.** Copy `backend/.env.example` to `backend/.env` and fill
   in your MySQL credentials. Also set `SESSION_SECRET` to a random string — generate one with:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Create your first admin account.** Registration through the website only ever creates
   employee accounts — that's intentional, so nobody can register as admin from the public
   form. Run this once from inside `backend/`:
   ```
   npm run seed-admin
   ```
   Follow the prompts (name, ID, email, phone, password).

6. **Start the server.**
   ```
   npm start
   ```

7. **Open the site**: `http://localhost:3000`
   - Employee: register via the Register page, then log in on the Employee tab.
   - Admin: log in with the account you just seeded, on the Admin tab.

## How the pieces connect

- `server.js` serves the whole `frontend/` folder as static files AND handles the
  `/auth`, `/employee`, `/admin` API routes — one server, one port, no separate frontend host needed.
- Every employee/admin page's JavaScript (`employee.js`, `admin.js`) first calls
  `GET /auth/me` to confirm there's a valid logged-in session before doing anything else,
  and redirects to `login.html` if not.
- The real security boundary isn't the frontend redirect (that's just convenience/UX) —
  it's `requireAuth` / `requireAdmin` in `backend/middleware/authMiddleware.js`, which runs
  on the server for every protected route, checking the session cookie. A person could
  disable JavaScript entirely and still be blocked from `/admin/*` routes without an admin session.
- Passwords are never stored as typed. `bcrypt.hash()` converts them to a one-way scrambled
  string before saving; `bcrypt.compare()` checks a login attempt against that hash without
  ever "unscrambling" it.

## Deploying online

This needs a host that runs a persistent Node.js server (not a static-only host like GitHub
Pages, and not Vercel's serverless model, which doesn't fit a stateful session-based app well).
**Railway** or **Render** (as a Web Service, with an external/managed MySQL) both work.

Steps, regardless of host:
1. Push this project to GitHub (the `backend/.gitignore` already excludes `node_modules` and `.env`).
2. Create a MySQL database on the host (or a MySQL add-on/service).
3. Run `database/schema.sql` against that remote database (via the host's DB console, or any
   MySQL client pointed at the remote credentials).
4. Set the same environment variables from `.env.example` in the host's dashboard
   (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, SESSION_SECRET, `NODE_ENV=production`).
   `NODE_ENV=production` is what makes session cookies require HTTPS — the host provides that
   automatically once deployed.
5. Set the host's "start command" to `npm start`, and root/working directory to `backend/`.
6. Run `node seedAdmin.js` once against the deployed environment (most hosts offer a way to
   run a one-off shell command against the deployed service) to create your live admin account.
