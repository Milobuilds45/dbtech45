# Research Page Integration — last30days Skill

**Page:** `/os/research`  
**Skill:** Matt Van Horn's last30days  
**GitHub:** https://github.com/mvanhorn/last30days-skill  
**Installed:** 2026-03-19

---

## Architecture

### Frontend
- **Component:** `src/app/(dashboard)/os/research/page.tsx`
- **Features:**
  - Search bar with trending topics
  - Result cards for YouTube, X, Hacker News, Reddit, Polymarket
  - Database persistence (last 50 searches)
  - Duration + source tracking

### Backend
- **API Route:** `src/app/api/research/route.ts`
- **Script:** `C:\Users\derek\AppData\Roaming\npm\node_modules\openclaw\skills\last30days\last30days.py`
- **Database API:** `src/app/api/research-history/route.ts`

### Database
- **Table:** `research_history` (Supabase)
- **Schema:**
  ```sql
  CREATE TABLE research_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    summary TEXT,
    results JSONB,
    duration INTEGER,
    used_credits BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- **Migration:** `supabase/migrations/20260319_research_history.sql`

---

## Environment Variables

### Required
- `XAI_API_KEY` — X/Twitter search via Grok API ✅ (Derek has key)

### Optional (100 free credits)
- `SCRAPECREATORS_API_KEY` — Reddit, TikTok, Instagram scraping
  - Sign up: https://scrapecreators.com
  - When used, sets `used_credits=true` in database

---

## How It Works

1. User enters query or clicks trending topic
2. Frontend calls `/api/research` with query + `useCredits` flag
3. Backend executes Python script:
   ```bash
   python3 last30days.py "{query}" --emit=compact --no-native-web --sources={x,hn,yt}
   ```
4. Script searches multiple sources (34-80 seconds)
5. Results parsed and returned to frontend
6. Saved to database via `/api/research-history`
7. UI displays cards for each result type

---

## Data Sources

| Source | API Key Needed | Status |
|--------|----------------|--------|
| YouTube | None | ✅ Working |
| Hacker News | None | ✅ Working |
| X/Twitter | XAI_API_KEY | ✅ Working |
| Reddit | SCRAPECREATORS_API_KEY | ⚠️ Optional (100 free) |
| TikTok | SCRAPECREATORS_API_KEY | ⚠️ Optional (100 free) |
| Instagram | SCRAPECREATORS_API_KEY | ⚠️ Optional (100 free) |
| Polymarket | None | ✅ Working |

---

## Trending Topics

**Source:** Brave Search API (Derek's key)  
**Endpoint:** `/api/trending`  
**Queries:**
- "AI tools trending 2026"
- "Claude AI best practices"
- "trading strategies 2026"
- "web development trends"
- "AI coding assistants"

**Fallback:** Hardcoded curated topics if API fails

---

## Performance

- **Average duration:** 34-80 seconds (varies by sources enabled)
- **Typical results:**
  - YouTube: 5-15 videos
  - Hacker News: 20-30 stories
  - X/Twitter: 10-20 posts (when XAI key present)
  - Reddit: 5-10 threads (when SCRAPECREATORS key present)

---

## Deployment Notes

When deploying to production (Coolify/Hetzner):
1. Ensure `.env.local` has `XAI_API_KEY`
2. Optionally add `SCRAPECREATORS_API_KEY` for Reddit/TikTok/IG
3. Run Supabase migration: `supabase/migrations/20260319_research_history.sql`
4. Verify Python + dependencies installed on server
5. Test research endpoint: `curl -X POST https://dbtech45.com/api/research -d '{"query":"test"}'`

---

*Powered by Matt Van Horn's last30days skill — real-time research across social platforms.*
