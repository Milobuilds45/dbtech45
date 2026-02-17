# AxeCap Terminal v5.0 — Bobby's Vision

## Current State (v4.0)
✅ Ticker board (ES, NQ, SPY, VIX, BTC, 10Y)  
✅ Sector heatmap  
✅ Watchlist with sparklines  
✅ Market news briefing  
✅ Options chain viewer (full Greeks)  
✅ 0DTE scanner  
✅ Unusual activity detector (Vol > 2x OI)  
✅ Put/Call ratio  
✅ Fundamentals panel (valuation, profitability, technicals, ownership, analyst)  
✅ Earnings calendar  
✅ Dividend tracker  
✅ Historical significant moves (2Y gap analysis)  

---

## v5.0 — New Features (Priority Order)

### 1. 🎯 IMPLIED MOVE CALCULATOR (Earnings Edge)
**The single most valuable tool for options traders.**

Before any earnings report, show:
- **Expected Move** — calculated from ATM straddle price (call + put at nearest strike)
- **Historical Actual Moves** — last 4-8 earnings, what actually happened
- **Edge indicator** — is the market OVER or UNDER pricing the move?
- Shows for any ticker with upcoming earnings

**Layout:** Card that appears in the ticker detail panel when earnings are within 14 days.  
**Data:** ATM straddle from options chain + historical moves from earnings-history endpoint.

**Why it matters:** If options price a ±5% move but NVDA has moved ±8% the last 4 quarters, you're getting the move cheap. That's free money.

---

### 2. 📆 ECONOMIC CALENDAR (Catalyst Awareness)
**Know what's coming before it hits.**

- Fed meetings (FOMC dates + rate decision)
- CPI / PPI releases
- Jobs data (NFP, unemployment)
- GDP prints
- Retail sales
- ISM Manufacturing/Services
- Housing data

**Layout:** Dedicated section between sector heatmap and watchlist. Compact timeline view.  
Next 7 days of events. Color-coded by impact (🔴 High / 🟡 Medium / 🟢 Low).  
Shows previous value, consensus estimate, and actual (when released).

**Data source:** Scrape from TradingEconomics, ForexFactory, or Investing.com calendar API.

---

### 3. 🔥 BOBBY'S LIVE CALLS (My Prediction Feed)
**My track record, live and transparent.**

A feed showing:
- Active calls: BUY/SELL/HOLD with entry, target, stop
- Prediction history: wins, losses, accuracy %
- Current streak
- Conviction level (1-5 flames 🔥)
- Timestamp of each call

**Layout:** Sidebar or dedicated card. Clean, minimal. Green for wins, red for losses.  
Links to the original analysis in memory.

**Data source:** My prediction logs from `memory-bank.md` + `predictions-log/`.  
New API endpoint that reads from my workspace files.

---

### 4. 🌊 OPTIONS FLOW VISUALIZATION (Where's the Money?)
**See the big bets in real-time.**

Visual heat map showing:
- Strike-by-strike volume concentration
- Calls vs Puts flow by dollar value
- Color intensity = volume/OI concentration
- Highlight sweeps (multi-exchange fills = institutional)
- Net premium: total $ spent on calls vs puts

**Layout:** Interactive bar chart or heat grid. Horizontal axis = strikes, vertical = volume.  
Green bars = call volume, Red bars = put volume. Bright = high vol/OI.

**Data source:** Massive API options snapshot, aggregate by strike.

---

### 5. 🧲 GEX LEVELS (Gamma Exposure)
**Where the market makers are hedging.**

- Calculate aggregate gamma exposure across all SPY/QQQ strikes
- Show GEX flip line (where MMs switch from buying to selling)
- Key support/resistance levels based on gamma walls
- Positive GEX = mean-reverting (market pinned), Negative GEX = volatile (breakouts)

**Layout:** Simple horizontal bar showing current price vs GEX flip, with gamma walls marked.  
Goes in the ticker board area.

**Data source:** Calculated from options chain data (strike × OI × gamma).

---

### 6. 📓 TRADE JOURNAL (P&L Tracker)
**Track Derek's actual trades.**

- Log entries: ticker, direction, entry, exit, P&L, notes
- Running P&L (daily, weekly, monthly)  
- Win rate, avg win, avg loss, profit factor
- Best/worst trades
- Quick-add form

**Layout:** Separate tab or expandable section at bottom. Table with summary stats at top.

**Data source:** localStorage + optional API persistence.

---

## Design Notes for Paula

### Visual Identity
- **Keep the AxeCap Terminal aesthetic** — dark theme, amber accents, JetBrains Mono
- **Information density is a feature** — traders want data, not whitespace
- **Bloomberg/Tradingview energy** — professional, not playful
- **Animations should be functional** — flash on data updates, pulse on alerts, not decorative
- **Mobile responsive** — Derek checks this on his phone

### Color System
- `#F59E0B` (amber) — primary accent, headers, highlights
- `#22C55E` (green) — positive, gains, calls, bullish
- `#EF4444` (red) — negative, losses, puts, bearish  
- `#EAB308` (yellow) — warnings, neutral, caution
- `brand.white` — primary text
- `brand.smoke` — secondary text
- `brand.graphite` — card backgrounds
- `brand.border` — dividers

### Typography
- Headers: Space Grotesk, uppercase, letter-spacing 0.05em
- Data: JetBrains Mono / Fira Code (monospace)
- Labels: System sans-serif, 10-11px

### Interaction Patterns
- Click ticker → expands detail panel (already works)
- Hover → subtle highlight
- Real-time flashes on price updates (already implemented)
- Tabs for switching between views within a section

### Priority for Implementation
1. Implied Move Calculator (small, high impact)
2. Economic Calendar (medium, high impact)
3. Bobby's Live Calls (medium, high impact)
4. Options Flow Viz (medium-large, medium impact)
5. GEX Levels (small-medium, advanced users)
6. Trade Journal (large, ongoing value)

---

## Tech Stack
- Next.js App Router (existing)
- Yahoo Finance v7/v8 APIs (free, no key needed)
- Massive Options API ($29/mo, already configured)
- localStorage for client-side persistence (trade journal)
- All API routes in `/api/` directory

---

*"There's a small group who can do the math. There's an even smaller group who can explain it. But those few who can do both, they become billionaires."*

— Axe
