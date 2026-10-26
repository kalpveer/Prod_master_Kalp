# App modules

The marketing site (`/`, `/about`, `/pricing`, …) is public and unchanged. Everything app-like
(`/idea`, `/grants`, more later) is a **module**: a lazy-loaded page that sits behind email sign-in.

## How a module is wired

| Piece | Where |
|---|---|
| Route + auth requirement | one entry in [`src/modules/registry.ts`](../src/modules/registry.ts) |
| Auth (Supabase email sign-in) | handled by [`ModuleHost`](../src/modules/ModuleHost.tsx); the module just calls `useAuth()` |
| Page code | `src/modules/<name>/<Name>Module.tsx` (default export) |
| Server work | `api/<name>/*.ts` (Vercel functions), shared helpers in `api/_lib/` |
| Data | `supabase/migrations/NNNN_<name>.sql` |

Module code is code-split, so the marketing site never downloads it or `@supabase/supabase-js`.

## Adding a module (e.g. `/pitch`)

1. `src/modules/pitch/PitchModule.tsx` — default-export a component. Use `const { user } = useAuth()`.
2. Register it:
   ```ts
   { path: '/pitch', title: 'Pitch Builder', requiresAuth: true, load: () => import('./pitch/PitchModule') }
   ```
3. Add a migration with the module's table(s), following the conventions below.
4. If it needs server-side work or secrets, add `api/pitch/<action>.ts`, and use `requireUser(req)` and `getAdmin()` from `api/_lib`.

## Data conventions

- One table per module, prefixed with the module name (`idea_reports`, `grant_runs`, …).
- Shared account counters live in `account_quotas` (`idea`, `grants`, …). `used` only goes up.
- Every user-owned row has `user_id uuid references auth.users(id) on delete cascade`.
- Row-level security **on**. Users get `SELECT` and `DELETE` on their own rows only.
- **Writes go through the server** (service role), so users cannot forge results or skip limits. No client `INSERT`/`UPDATE` policies.
- Database triggers enforce the idea free-validation cap. Deleting a row does not restore a slot.
- Files go in a private storage bucket per module under `<user_id>/…`, with policies scoped to that folder.

## Long-running work (the `/idea` pattern)

1. Client calls `POST /api/<module>/<action>` with `Authorization: Bearer <access token>`.
2. Server verifies the user, enforces limits, inserts a row with `status = 'running'` and answers `202 { id }`.
3. The job continues in `waitUntil(...)` and writes `done` / `failed` back to the row.
4. The client follows the row (`select` under RLS) and survives tab closes and refreshes.
5. Runs that never finish are treated as failed after 7 minutes (`STALE_RUN_MS`).

## Environment

See [`.env.example`](../.env.example). `SUPABASE_SERVICE_ROLE_KEY` and `PICKAXE_DEPLOYMENT_ID` are server-only.

## Supabase dashboard checklist

- **Authentication → URL Configuration:** Site URL `https://productica.in`; Redirect URLs `https://productica.in/idea`, `https://productica.in/grants`, `http://localhost:5173/idea`, `http://localhost:5173/grants` (or `/**`).
- **Authentication → Email Templates → Magic Link:** include `{{ .Token }}` so the email also shows the 6-digit code the sign-in screen accepts.
- **Authentication → SMTP:** use a custom SMTP provider before launch. The built-in sender is limited to a handful of emails per hour.
- Run `supabase/migrations/0001_idea_module.sql`, then `0002_quotas_and_grants.sql`, in the SQL editor.
