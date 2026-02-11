# Supabase Setup for DB Tech OS

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Name: "dbtech45" or "db-tech-os"
4. Database Password: (generate strong password)
5. Region: closest to you
6. Click "Create new project"

### 2. Get Project Credentials
Once project is created:
1. Go to Settings → API
2. Copy these values:

```
Project URL: https://[project-id].supabase.co
Anon key: eyJ[long-key]
Service role key: eyJ[long-service-key]
```

### 3. Update Environment File
Edit `.env.local` and replace placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=eyJ[your-service-role-key]
```

### 4. Run Database Migration
In Supabase Dashboard:
1. Go to SQL Editor
2. Copy/paste contents of `supabase/migrations/001_initial_schema.sql`
3. Click "Run"

This creates all tables:
- ideas_vault (for Ideas Vault persistence)
- goals (Sunday Squares, Soul Solace, etc.)
- todos (Master Todo with assignees)
- activities (real agent activity logs)
- skills (agent capabilities)
- memory_entries (decision tracking)

### 5. Deploy Updated Code
Once environment is set:
```bash
git add .
git commit -m "Add Supabase database integration"
git push
```

## What This Fixes

✅ **Ideas Vault persistence** - entries won't disappear on refresh
✅ **Real goal tracking** - Sunday Squares 95%, actual project status
✅ **Todo management** - assignments persist (Anders, Paula, etc.)
✅ **Activity logging** - real agent work history
✅ **Skills inventory** - track who knows what
✅ **Memory system** - important decisions and context

## After Setup

Your DB Tech OS will have:
- **Persistent data** across page refreshes
- **Real-time sync** across devices
- **Structured data** instead of placeholder text
- **Searchable history** of all activities

**Total setup time: ~5 minutes**
**Result: Fully functional persistent database**