# AxeCap Terminal v5.0 — Design Handoff for Anders

**Date:** 2026-02-14  
**Designer:** Paula  
**Requester:** Bobby  
**Developer:** Anders  

---

## Overview

6 new features for the Markets page (`/os/markets`). Build in priority order.

**Current file:** `src/app/(dashboard)/os/markets/page.tsx`

**Existing APIs you can use:**
- `/api/yfinance-data?type=fundamentals&symbol=X`
- `/api/yfinance-data?type=earnings&symbols=X,Y`
- `/api/yfinance-data?type=earnings-history&symbol=X`
- `/api/options-data?type=chain&symbol=X`
- `/api/axecap?symbols=X,Y&news=true`

---

## Design System (Match Existing)

```typescript
// Colors
const amber = '#F59E0B';      // Primary accent
const green = '#22C55E';      // Positive, gains, calls
const red = '#EF4444';        // Negative, losses, puts
const yellow = '#EAB308';     // Warnings, neutral
const white = '#FAFAFA';      // Primary text
const smoke = '#A1A1AA';      // Secondary text
const graphite = '#18181B';   // Card backgrounds
const border = '#27272A';     // Dividers
const carbon = '#111111';     // Elevated backgrounds

// Typography
const mono = "'JetBrains Mono', 'Fira Code', monospace";
const heading = "'Space Grotesk', system-ui, sans-serif";

// Patterns
- Headers: uppercase, letter-spacing: 0.05em
- Data: monospace, right-aligned numbers
- Labels: 10-11px, smoke color
- Cards: background graphite, border 1px solid border, borderRadius 8px
- Flash on update: amber border pulse (already implemented)
```

---

## Priority 1: Implied Move Calculator

**Location:** Inside ticker detail panel, after fundamentals, before earnings history. Only shows when `earningsDate` is within 14 days.

**New API needed:** `/api/yfinance-data?type=implied-move&symbol=X`

Should return:
```typescript
interface ImpliedMoveData {
  symbol: string;
  currentPrice: number;
  earningsDate: string;
  daysToEarnings: number;
  atmStraddle: {
    callStrike: number;
    callPrice: number;
    putStrike: number;
    putPrice: number;
    totalPremium: number;
    impliedMove: number;      // dollar amount
    impliedMovePercent: number;
  };
  historicalMoves: {
    date: string;
    quarter: string;
    actualMove: number;
    actualMovePercent: number;
    direction: 'up' | 'down';
  }[];
  avgHistoricalMove: number;
  avgHistoricalMovePercent: number;
  edge: 'cheap' | 'fair' | 'expensive';
  edgePercent: number;  // difference between implied and historical
}
```

**Component Wireframe:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 IMPLIED MOVE                              ⏱ 14 days to earnings │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   EXPECTED MOVE         HISTORICAL AVG           EDGE           │
│   ±$12.40               ±$18.20                 ┌─────────────┐ │
│   (±4.2%)               (±6.1%)                 │ CHEAP 🔥    │ │
│   from ATM straddle     last 4 quarters         │ +1.9% gap   │ │
│                                                 └─────────────┘ │
│                                                                 │
│   HISTORICAL EARNINGS MOVES                                     │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                              │
│   │+8.2%│ │-5.1%│ │+12.4│ │+3.8%│                              │
│   │Q4'25│ │Q3'25│ │Q2'25│ │Q1'25│                              │
│   └─────┘ └─────┘ └─────┘ └─────┘                              │
│   (green)  (red)  (green) (green)                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Expected move: Large (20px), amber, monospace
- Historical avg: Large (20px), white, monospace
- Edge badge: 
  - CHEAP: green background rgba(34,197,94,0.15), green text, 🔥 icon
  - FAIR: yellow background, yellow text
  - EXPENSIVE: red background, red text
- Historical bars: green for up, red for down, show % and quarter
- Border-left: 3px solid based on edge (green/yellow/red)

**Component file:** `src/components/markets/ImpliedMoveCard.tsx`

---

## Priority 2: Economic Calendar

**Location:** New section between sector heatmap and watchlist. Collapsible.

**New API needed:** `/api/economic-calendar`

Should return:
```typescript
interface EconomicEvent {
  id: string;
  date: string;           // ISO date
  time: string;           // "8:30 ET"
  name: string;           // "CPI", "FOMC", "NFP"
  impact: 'high' | 'medium' | 'low';
  previous: string | null;
  forecast: string | null;
  actual: string | null;  // filled after release
  surprise: 'beat' | 'miss' | 'inline' | null;
}

interface EconomicCalendarData {
  events: EconomicEvent[];
  weekStart: string;
  weekEnd: string;
}
```

**Data source options:** Scrape from TradingEconomics, ForexFactory, or Investing.com. Or use a free API if available.

**Component Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📆 ECONOMIC CALENDAR                                    This Week    ▼     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   MON 17        TUE 18         WED 19          THU 20          FRI 21      │
│   ────────      ────────       ──────────      ──────────      ────────    │
│                 🔴 CPI         🔴 FOMC         🟡 Jobless      🟢 Existing │
│                 8:30 ET        2:00 PM         8:30 ET         Home Sales  │
│                 Est: 3.1%      Rate Dec        Est: 215K       10:00 ET    │
│                 Prev: 3.2%                     Prev: 212K                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Impact indicators: 🔴 High / 🟡 Medium / 🟢 Low (or colored dots)
- Current day: amber border highlight
- Past events with actuals: Show beat (green) / miss (red) / inline (gray)
- Compact by default, expand on click for more details
- Mobile: Stack vertically

**Component file:** `src/components/markets/EconomicCalendar.tsx`

---

## Priority 3: Bobby's Live Calls

**Location:** Right column, alongside News Briefing. Either:
- Option A: 3-column layout (Watchlist | News | Bobby's Calls)
- Option B: Tabbed panel (News | Bobby's Calls tabs in right column)

Bobby prefers Option B (tabbed) to keep the layout clean.

**New API needed:** `/api/bobby-calls`

Should return:
```typescript
interface BobbyCall {
  id: string;
  ticker: string;
  direction: 'LONG' | 'SHORT' | 'CALL' | 'PUT';
  entry: number;
  target: number;
  stop: number;
  conviction: 1 | 2 | 3 | 4 | 5;  // flames
  status: 'active' | 'won' | 'lost' | 'closed';
  entryDate: string;
  exitDate?: string;
  exitPrice?: number;
  pnlPercent?: number;
  notes?: string;
  analysisLink?: string;
}

interface BobbyCallsData {
  active: BobbyCall[];
  recent: BobbyCall[];  // last 10 closed
  stats: {
    totalWins: number;
    totalLosses: number;
    winRate: number;
    avgWinPercent: number;
    avgLossPercent: number;
    currentStreak: number;
    streakType: 'win' | 'loss';
  };
}
```

**Data source:** Read from Bobby's workspace files or a dedicated JSON file.

**Component Wireframe:**
```
┌────────────────────────────────────────────┐
│  News  │  Bobby's Calls                    │  <- Tabs
├────────────────────────────────────────────┤
│ 🔥 BOBBY'S CALLS            72% Win Rate   │
├────────────────────────────────────────────┤
│ ACTIVE                                     │
│ ┌────────────────────────────────────────┐ │
│ │ NVDA LONG              🔥🔥🔥🔥       │ │
│ │ Entry: $875  Target: $950  Stop: $840  │ │
│ │ Currently: +8.5%  ·  3 days open       │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ RECENT                                     │
│ ✓ TSLA LONG     +12.4%      Feb 10        │
│ ✓ SPY PUT       +8.2%       Feb 8         │
│ ✗ AAPL LONG     -3.1%       Feb 5         │
│                                            │
│ ──────────────────────────────────────     │
│ 18W / 7L  ·  Avg +6.2%  ·  🔥3 streak     │
└────────────────────────────────────────────┘
```

**Styling:**
- Conviction flames: Use 🔥 emoji or custom fire icons
- Active calls: Full card with amber left border
- Recent wins: Green ✓, green P&L
- Recent losses: Red ✗, red P&L
- Stats bar: monospace, bottom of card
- Win rate badge: green if >60%, yellow 50-60%, red <50%

**Component file:** `src/components/markets/BobbyCalls.tsx`

---

## Priority 4: Options Flow Visualization

**Location:** New section in ticker detail panel, below options chain.

**API:** Use existing `/api/options-data?type=chain` data, aggregate client-side.

**Data transformation:**
```typescript
interface FlowBar {
  strike: number;
  callVolume: number;
  putVolume: number;
  callOI: number;
  putOI: number;
  callPremium: number;  // volume × price × 100
  putPremium: number;
  isSweep: boolean;     // volume > 2x OI
}

// Aggregate from chain data
function buildFlowData(calls: OptionContract[], puts: OptionContract[]): FlowBar[]
```

**Component Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🌊 OPTIONS FLOW · SPY · Feb 21 exp                Net Premium: +$42.8M 📈  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│        580    585    590    595    600    605    610    615    620         │
│         │      │      │      │      │      │      │      │      │          │
│         ▓      ▓▓     ▓▓▓    ███    ▓▓     ▓      ▓▓▓    ██     ▓     CALLS│
│    ─────────────────────────────────┼──────────────────────────────────    │
│         ░      ░░     ███    ▓▓     ░░     ░      ░░     ▓▓▓    ░░    PUTS │
│                                     ▲                                       │
│                                   $602                                      │
│                                 (current)                                   │
│                                                                             │
│    ░ Low    ▓ Medium    █ High    ⚡ Sweep                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Calls: Green bars above center line
- Puts: Red bars below center line
- Intensity: Opacity or saturation based on vol/OI ratio
- Sweeps (vol > 2x OI): ⚡ marker or glow effect
- Current price: Dashed vertical line with label
- Net premium badge: Green if calls > puts, red if puts > calls
- Hover: Tooltip with exact numbers

**Component file:** `src/components/markets/OptionsFlow.tsx`

---

## Priority 5: GEX Levels

**Location:** Horizontal strip below ticker board, shows for SPY/QQQ only.

**API:** Calculate client-side from chain data.

**Calculation:**
```typescript
// GEX = Σ (strike × OI × gamma × 100 × spotPrice)
// Positive GEX at strike = MMs sell as price rises (mean-reverting)
// Negative GEX = MMs buy as price rises (volatile)

interface GexData {
  totalGex: number;           // in billions
  flipLevel: number;          // price where GEX flips sign
  currentPrice: number;
  regime: 'pinned' | 'volatile';
  keyLevels: {
    strike: number;
    gex: number;
    type: 'support' | 'resistance' | 'flip';
  }[];
}
```

**Component Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🧲 GEX: +2.4B                                           Regime: PINNED 📌  │
├─────────────────────────────────────────────────────────────────────────────┤
│   ◀────────────────────────●────────▼──────────────────────────────────▶   │
│      590         600       605      610         620         630            │
│                 ┃WALL┃    FLIP     NOW        ┃WALL┃                       │
│                 +1.2B      ━━      ●          +0.8B                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Slim horizontal bar (48-56px height)
- Current price: ● marker
- GEX flip: Dashed vertical line
- Gamma walls: Highlighted zones with amber glow
- Regime badge: 
  - PINNED (positive GEX): green, 📌 icon
  - VOLATILE (negative GEX): red, ⚡ icon
- Total GEX: Large monospace number, green if positive, red if negative

**Component file:** `src/components/markets/GexLevels.tsx`

---

## Priority 6: Trade Journal

**Location:** New tab in markets page OR expandable section at bottom.

**Storage:** localStorage primary, optional API for sync.

**Data structure:**
```typescript
interface Trade {
  id: string;
  date: string;
  ticker: string;
  direction: 'LONG' | 'SHORT' | 'CALL' | 'PUT';
  entry: number;
  exit: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  notes: string;
  tags?: string[];
}

interface JournalStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  bestTrade: Trade;
  worstTrade: Trade;
}

// localStorage key: 'axecap-trade-journal'
```

**Component Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📓 TRADE JOURNAL                                           + NEW TRADE     │
├─────────────────────────────────────────────────────────────────────────────┤
│   TODAY           THIS WEEK        THIS MONTH        ALL TIME              │
│   +$420           +$1,842          +$4,210           +$12,847              │
│   2W / 1L         8W / 3L          22W / 9L          71% Win               │
├─────────────────────────────────────────────────────────────────────────────┤
│   DATE       TICKER    DIR     ENTRY     EXIT      P&L        NOTES        │
│   ─────────  ───────   ─────   ───────   ───────   ────────   ──────────   │
│   Feb 14     NVDA      LONG    $875.00   $912.00   +$370.00   Earnings run │
│   Feb 12     SPY       PUT     $4.20     $5.80     +$160.00   0DTE scalp   │
│   Feb 10     TSLA      LONG    $185.00   $178.00   -$140.00   Stopped out  │
│   ...                                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│   Profit Factor: 2.4   │   Avg Win: +$186   │   Avg Loss: -$94   │   📤    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Period tabs (Today, Week, Month, All)
- Sortable columns (click header)
- Add trade modal with form
- Delete/edit trade
- Export to CSV button (📤)
- P&L color-coded (green positive, red negative)
- Running totals update in real-time

**Component file:** `src/components/markets/TradeJournal.tsx`

---

## File Structure

Create these new files:
```
src/
├── components/
│   └── markets/
│       ├── ImpliedMoveCard.tsx
│       ├── EconomicCalendar.tsx
│       ├── BobbyCalls.tsx
│       ├── OptionsFlow.tsx
│       ├── GexLevels.tsx
│       └── TradeJournal.tsx
├── app/
│   └── api/
│       ├── implied-move/
│       │   └── route.ts        (new)
│       ├── economic-calendar/
│       │   └── route.ts        (new)
│       └── bobby-calls/
│           └── route.ts        (new)
```

---

## Notes

1. **Mobile responsive** — Derek checks on phone. Stack vertically, hide non-essential on mobile.
2. **Loading states** — Use skeleton shimmer, not spinners.
3. **Error handling** — Red banner with retry, don't break the whole page.
4. **Data flash** — Use existing amber pulse pattern on updates.
5. **Existing APIs work** — `/api/yfinance-data` already handles fundamentals/earnings.

---

**Questions? Ping Paula or Bobby.**

— Paula ✦
