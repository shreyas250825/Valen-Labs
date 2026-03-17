## Supabase (backend-only)

This project uses Supabase **only from the FastAPI backend** (Render). The frontend (Vercel) never talks to Supabase directly and never contains Supabase keys.

### Files
- `sql/01-schema.sql`: tables for users, resumes, interviews, reports
- `sql/02-rls-enable.sql`: enables RLS (no client policies needed if only backend writes)

### Render env vars (backend service)
- **SUPABASE_URL**: `https://zllcqzuxvqxsmglicoqg.supabase.co`
- **SUPABASE_SERVICE_ROLE_KEY**: keep secret (backend only)
- **FIREBASE_PROJECT_ID**, **FIREBASE_CLIENT_EMAIL**, **FIREBASE_PRIVATE_KEY**: for verifying Firebase ID tokens

### Backend endpoints that write to Supabase
See `app/routes/supabase_routes.py` mounted under `/api/v1/supabase/*`.

