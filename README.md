# ClientFlow

ClientFlow is a responsive client, project, and task management SaaS portfolio application. It demonstrates server-side API design, relational modelling, owner-scoped data access, input validation, dashboard aggregation, and responsive product UI.

## Runtime note

This version is implemented for Hatchable's native runtime. Hatchable serves static HTML/CSS/JavaScript, provides hosted end-user authentication, runs API handlers in its V8 isolate, and provisions PostgreSQL. It does **not** run a Next.js build or install npm dependencies at deploy time. The original Next.js/Supabase stack is therefore not used by this hosted version; the project keeps the same full-stack learning objectives on the hosting platform available for this build.

## Features

- Passwordless email-code authentication through Hatchable Auth.
- User-owned clients, projects, tasks, and activity records.
- Client creation, editing, search, and deletion when no projects reference the client.
- Project creation, editing, deletion, status and priority tracking, deadlines, and task progress.
- Task creation, editing, deletion, status changes, priority, and deadlines.
- Dashboard metrics for clients, projects, open tasks, overdue tasks, and completion rate.
- Server-side validation and parameterised SQL queries.
- Responsive dark UI with mobile navigation, loading states, empty states, and error feedback.

## Data model

- `clients`: user-owned client contacts.
- `projects`: user-owned projects, with a composite relationship to a client owned by the same user.
- `tasks`: user-owned tasks, with a composite relationship to a project owned by the same user.
- `activity_logs`: recent workspace activity.

The database migration is `migrations/001_initial_schema.sql`. `hatchable.toml` enables email-code authentication and declares owner-scoped row access for the application tables. The platform's row-access rules use a `user_id TEXT` field matching the signed-in end user's identity. The API omits `user_id` on inserts so the platform applies the authenticated owner; it does not accept owner IDs from form input.

## Routes

- `/` — authenticated workspace UI
- `/login` — email-code sign-in
- `/api/clients` — list/create clients
- `/api/clients/:id` — read/update/delete a client
- `/api/projects` — list/create projects
- `/api/projects/:id` — read/update/delete a project
- `/api/tasks` — list/create tasks
- `/api/tasks/:id` — update/delete a task
- `/api/dashboard` — dashboard metrics and recent activity

Every API handler declares `access = 'user'`. Database row access is a separate boundary: routes are gated to signed-in end users and each application table is scoped to the caller's own rows.

## Deploy and operate

1. Open the project in Hatchable.
2. Review `hatchable.toml` and `migrations/001_initial_schema.sql`.
3. Deploy the project. Hatchable runs the migration and registers API handlers.
4. Complete any authentication setup shown in the project console.
5. Open `/login`, enter an email address, retrieve the one-time code, and verify it.
6. Add a client, create a project for that client, and add tasks to the project.
7. Test with a second account and confirm it cannot see the first account's records.
8. In project settings, change visibility if the intended audience should access the hosted site without a Hatchable account. Preview URLs are temporary and are not permanent public links.

## Verification checklist

- [ ] Sign in with an email code and sign out.
- [ ] Create, edit, search, and delete a client with no associated projects.
- [ ] Confirm deleting a client with projects is blocked with a useful message.
- [ ] Create and update projects with valid and invalid date ranges.
- [ ] Create tasks and change task status between `todo`, `in_progress`, and `done`.
- [ ] Confirm task completion percentage and overdue counts reflect database data.
- [ ] Sign in as a second end user and verify all lists and details are isolated.
- [ ] Try invalid IDs, missing names, invalid email addresses, and malformed dates.
- [ ] Test the layout at phone, tablet, and desktop widths.
- [ ] Review API logs for unexpected errors after normal workflows.

## Security notes and current scope

- SQL queries are parameterised and input is validated server-side.
- Ownership is enforced by Hatchable's `access = 'user'` route gate and `read = 'own'` / `write = 'own'` table rules.
- Composite foreign keys prevent cross-owner client/project and project/task relationships.
- The MVP does not implement organisation/team sharing, file uploads, billing, or native mobile apps.
- Activity logs provide recent activity but are not an immutable compliance-grade audit trail.
- Do not enter sensitive client information into a public demo.

## CV description

**ClientFlow — Full-stack Client and Project Management SaaS**

Technologies: JavaScript, HTML, CSS, PostgreSQL, SQL, REST-style APIs, Hatchable Auth, Git, responsive UI.

- Built a responsive client and project management application with user-scoped authentication, client/project/task workflows, and dashboard analytics.
- Designed a relational PostgreSQL schema with constraints, indexes, composite foreign keys, and owner-level data access rules.
- Implemented validated API endpoints using parameterised SQL, status transitions, deadline handling, and dashboard aggregation.
- Documented deployment and security verification steps, including cross-account data isolation tests.

Only claim features and tests that you have personally verified.