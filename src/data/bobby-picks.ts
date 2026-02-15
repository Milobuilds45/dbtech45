/* ═══════════════════════════════════════════════════════════════════════════
   Bobby's Picks — Historical Stock Write-ups & Trade Ideas
   Updated: 2026-02-15
   ═══════════════════════════════════════════════════════════════════════════ */

export interface BobbyPick {
  id: string;
  date: string;                 // YYYY-MM-DD
  symbol: string;
  name: string;
  priceAtPick: number;          // Price when picked
  direction: 'LONG' | 'SHORT' | 'ACCUMULATE';
  type: 'swing' | 'options' | 'earnings' | 'growth' | 'ipo' | 'contrarian';
  conviction: 1 | 2 | 3 | 4 | 5;  // 🔥 flames
  rating: number;               // ⭐ 1-5
  status: 'active' | 'win' | 'loss' | 'expired' | 'watching';
  entry?: string;               // Entry zone
  target?: string;              // Target price/zone
  stop?: string;                // Stop loss
  result?: {
    exitPrice?: number;
    pnl?: string;               // +12.4% or -$140
    exitDate?: string;
    notes?: string;
  };
  thesis: string;               // One-liner
  analysis: string;             // Full write-up (markdown)
  tags: string[];
  source?: string;              // Brief it came from
}

export const BOBBY_PICKS: BobbyPick[] = [
  // ═══ SUNDAY GROWTH STOCKS — Feb 15, 2026 ═══
  {
    id: 'growth-inod-20260215',
    date: '2026-02-15',
    symbol: 'INOD',
    name: 'Innodata Inc.',
    priceAtPick: 47.59,
    direction: 'ACCUMULATE',
    type: 'growth',
    conviction: 5,
    rating: 5,
    status: 'active',
    thesis: 'The company that quietly trains every AI you use. AI data annotation TAM: $1.6B → $14.4B by 2033.',
    analysis: `**Business:** AI data annotation & training data for Big Tech. They prepare datasets that train LLMs. Arms dealer in the AI war.

**Why it compounds:** AI training data TAM: $1.6B (2023) → $14.4B by 2033. Every new model needs more, better data. Embedded with hyperscalers.

**Moat:** 20+ global delivery centers, 85+ languages, proprietary low-code AI platforms. Switching costs are massive.

**Financials:**
- Q3 2025 rev: **$62.6M** (+20% YoY)
- YTD rev: **$179.3M** (+61% YoY)
- Adj EBITDA margin: **26%**
- Q2 saw 79% YoY growth, 375% EBITDA growth

**Analyst target:** $91.67 (Strong Buy) — **110% upside**.

Highest conviction pick. Everyone chases ChatGPT clones. This company powers them all.

*Sources: Nasdaq, Yahoo Finance, investor.innodata.com*`,
    tags: ['AI', 'data', 'growth', 'small-cap', 'training-data'],
    source: 'Sunday Growth Stocks Brief — Feb 15, 2026',
  },
  {
    id: 'growth-crdo-20260215',
    date: '2026-02-15',
    symbol: 'CRDO',
    name: 'Credo Technology',
    priceAtPick: 121.43,
    direction: 'ACCUMULATE',
    type: 'growth',
    conviction: 4,
    rating: 4,
    status: 'active',
    entry: '$100-110 on pullback',
    thesis: 'The plumbing of AI data centers. 272% YoY revenue growth. Connects GPU clusters together.',
    analysis: `**Business:** High-speed connectivity — active electrical cables, SerDes chiplets, optical DSPs. They connect AI chips to each other. Without Credo, your GPU cluster is expensive paperweights.

**Why it compounds:** Every data center needs connectivity. Multi-hundred-billion dollar AI buildout cycle. 224G PAM4 tech becoming the standard for inter-rack connections.

**Moat:** Proprietary chip architecture, design wins with MSFT, GOOGL, META. Once designed into a data center, you're there for the lifecycle. Stock up **1,700%** since 2022 IPO.

**Financials:**
- Q2 FY2026 rev: **$268M** (+272% YoY)
- Triple-digit growth sustained
- Market cap: ~$22B, P/E: 106

**Caution:** Not cheap at $121. But 272% growth commands a premium. Any pullback to $100-110 is a gift. Size accordingly.

*Sources: Seeking Alpha, Robinhood, credosemi.com*`,
    tags: ['AI', 'infrastructure', 'connectivity', 'semi', 'data-center'],
    source: 'Sunday Growth Stocks Brief — Feb 15, 2026',
  },
  {
    id: 'growth-acmr-20260215',
    date: '2026-02-15',
    symbol: 'ACMR',
    name: 'ACM Research',
    priceAtPick: 70.68,
    direction: 'ACCUMULATE',
    type: 'growth',
    conviction: 4,
    rating: 4,
    status: 'active',
    thesis: 'China semiconductor equipment play. 32% YoY growth. Access moat Western competitors can\'t touch.',
    analysis: `**Business:** Advanced semiconductor cleaning equipment for chip fab. HQ in Fremont, CA — operates heavily through Shanghai subsidiary. Straddles both worlds.

**Why it compounds:** China spending aggressively on domestic chip capacity. ACM's equipment is essential. One of the few companies with access Western-only competitors can't touch.

**Moat:** Proprietary SAPS megasonic cleaning tech. 25+ years of IP. China operations = access moat.

**Financials:**
- Q3 2025 rev: **$269.2M** (+32% YoY)
- Earnings: **$103.6M** (+34%)
- FY growth guidance: 29-31%
- Trading at all-time highs

**Risk:** China geopolitics. Export controls. Real. But market has repriced this repeatedly and the stock keeps climbing. Analysts with $43 targets getting embarrassed.

*Sources: StockTitan, ACM Research IR, StockAnalysis*`,
    tags: ['semi', 'China', 'equipment', 'growth', 'cleaning'],
    source: 'Sunday Growth Stocks Brief — Feb 15, 2026',
  },
  {
    id: 'growth-orn-20260215',
    date: '2026-02-15',
    symbol: 'ORN',
    name: 'Orion Group Holdings',
    priceAtPick: 13.84,
    direction: 'ACCUMULATE',
    type: 'growth',
    conviction: 4,
    rating: 4,
    status: 'active',
    thesis: 'Infrastructure hidden muscle. $796M revenue, $679M backlog, 100-year operating history.',
    analysis: `**Business:** Marine construction, dredging, concrete, heavy civil. 100-year operating history. Ports, cruise terminals, bridges, seawalls — the physical stuff America needs.

**Why it compounds:** $18B addressable market. IIJA dollars flowing. Pacific defense expansion. AI data centers need physical construction too. New mgmt since 2022 transformed profitability.

**Moat:** Specialized marine construction, massive equipment fleet, century of reputation. Can't just buy boats and start building ports.

**Financials:**
- 2024 rev: **$796M** (+12% YoY)
- Backlog: **$679M**
- Just acquired company for $46M — accretive to 2026 EBITDA
- Raised FY2025 guidance across the board
- Analyst rating: Strong Buy

Boring? Yes. Profitable? Yes. That's the point.

*Sources: StockTitan, Orion Group IR, GlobeNewsWire*`,
    tags: ['infrastructure', 'construction', 'marine', 'defense', 'small-cap'],
    source: 'Sunday Growth Stocks Brief — Feb 15, 2026',
  },
  {
    id: 'growth-plpc-20260215',
    date: '2026-02-15',
    symbol: 'PLPC',
    name: 'Preformed Line Products',
    priceAtPick: 280.41,
    direction: 'ACCUMULATE',
    type: 'growth',
    conviction: 4,
    rating: 4,
    status: 'active',
    thesis: 'Quiet AI infrastructure play. Grid modernization + data center power. Founded 1947, all-time highs.',
    analysis: `**Business:** Products for energy & communications infrastructure. Cables, fiber optic hardware, grid components. If it connects to a wire or grid, PLPC makes a piece of it.

**Why it compounds:** Grid modernization. Broadband expansion. Data center power. Ukraine rebuild (new Poland facility 215mi from border). Every AI data center needs power grid connections.

**Moat:** Founded 1947. Global manufacturing. Boring, essential products nobody else wants to make but everyone needs.

**Financials:**
- Revenue TTM: **$663M**, Gross margin: **32%**
- Q3 2025 rev: **$178M** (+21% YoY)
- Trading at **all-time highs**
- Pays dividends ($0.21/quarter)

**Caution:** Net margin dipped (earnings -41% due to investments). But top-line strong and investing for the future.

*Sources: MacroTrends, CNBC, StockAnalysis*`,
    tags: ['infrastructure', 'energy', 'grid', 'broadband', 'dividend'],
    source: 'Sunday Growth Stocks Brief — Feb 15, 2026',
  },

  // ═══ WEEKLY BRIEF — Feb 5, 2026 ═══
  {
    id: 'swing-amzn-20260205',
    date: '2026-02-05',
    symbol: 'AMZN',
    name: 'Amazon.com',
    priceAtPick: 233,
    direction: 'LONG',
    type: 'earnings',
    conviction: 5,
    rating: 5,
    status: 'expired',
    entry: '$233-235',
    target: '$250-255',
    stop: '$220',
    thesis: 'Amazon earnings Thursday AMC. AWS riding GOOGL Cloud +48% tailwind. Options pricing ~8% move. Asymmetric to upside.',
    analysis: `**The Main Event.** Amazon reports Thursday after close. This is the trade of the week.

- **Current price:** ~$233 (closed $232.99, down 2.36% today)
- **Street expects:** EPS $1.53, Rev $187.3B
- **Why HIGH conviction:** GOOGL just showed Cloud +48%. AWS is bigger. If AWS shows any acceleration, this stock gaps to $250+.
- **Entry:** $233-235 pre-earnings accumulation zone
- **Target:** $250-255 on a beat
- **Stop:** $220 (below recent range)
- **Risk/Reward:** ~3:1

*Source: Barchart, Seeking Alpha, TipRanks — Feb 4, 2026*`,
    tags: ['earnings', 'FAANG', 'cloud', 'AWS', 'options'],
    source: 'Weekly Brief — Feb 5, 2026',
  },
  {
    id: 'swing-crm-20260205',
    date: '2026-02-05',
    symbol: 'CRM',
    name: 'Salesforce',
    priceAtPick: 196,
    direction: 'LONG',
    type: 'contrarian',
    conviction: 4,
    rating: 4,
    status: 'expired',
    entry: '$190-196',
    target: '$230',
    stop: '$180',
    thesis: 'SaaSpocalypse bounce. 52-week low, -26% YTD. Software P/E compressed 30% in a week. Capitulation.',
    analysis: `**SaaSpocalypse Bounce Play.**

- **Current price:** ~$196 (52-week low, -26% YTD)
- **What happened:** Anthropic's new legal AI tool triggered a $830B software selloff. They're calling it the "SaaSpocalypse." Software forward P/E compressed from 33.1x to 23.2x — a 30% multiple contraction in DAYS.
- **Why I like it:** This is capitulation. RSI is oversold. BTIG already calling for a rebound. CRM still does $35B+ in revenue with 25%+ margins.
- **The contrarian take:** Within 90 days, the best SaaS names bounce 25-30% from here.
- **Entry:** $190-196
- **Target:** $230 (pre-selloff levels)
- **Stop:** $180 (hard)
- **Risk/Reward:** ~2:1

*Source: Motley Fool, CNBC, CRM IR — Feb 4, 2026*`,
    tags: ['SaaS', 'contrarian', 'bounce', 'oversold', 'enterprise'],
    source: 'Weekly Brief — Feb 5, 2026',
  },
  {
    id: 'swing-amd-20260205',
    date: '2026-02-05',
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    priceAtPick: 200,
    direction: 'LONG',
    type: 'earnings',
    conviction: 4,
    rating: 4,
    status: 'expired',
    entry: '$195-200',
    target: '$230',
    stop: '$185',
    thesis: 'Beat earnings but dropped 17% on guide. $200 psych support. GOOGL $175-185B capex = chip tailwind.',
    analysis: `**Post-Earnings Bounce.**

- **What happened:** Beat on top ($10.3B rev, +34% YoY) and bottom ($1.53 EPS, +40% YoY). But Q1 guide wasn't hot enough for the AI crowd. Market threw a tantrum.
- **Why I like it:** $200 is psychological support. A 17% drop on a BEAT is the market being stupid. GOOGL just guided $175-185B in AI capex. That money flows to chip companies.
- **The catch:** Need to let it stabilize 1-2 days. Don't catch the knife on the exact day.
- **Entry:** $195-200 if it holds this week
- **Target:** $230 (pre-earnings level)
- **Stop:** $185 (next major support)
- **Risk/Reward:** ~2.5:1

*Source: Motley Fool, CNBC, AMD IR — Feb 4, 2026*`,
    tags: ['semi', 'earnings', 'bounce', 'AI', 'capex'],
    source: 'Weekly Brief — Feb 5, 2026',
  },
  {
    id: 'swing-nvda-20260205',
    date: '2026-02-05',
    symbol: 'NVDA',
    name: 'NVIDIA',
    priceAtPick: 178,
    direction: 'LONG',
    type: 'swing',
    conviction: 4,
    rating: 4,
    status: 'expired',
    entry: '$175-180',
    target: '$255',
    stop: '$165',
    thesis: 'Down from $212 highs. Every hyperscaler doubling AI capex. Sells shovels in gold rush. Analyst avg target: $255.',
    analysis: `**The Shovel Seller.**

- **Current range:** $175-180
- **What's happening:** GOOGL's $175-185B capex guide is a MASSIVE tailwind for NVDA. Market hasn't priced this in yet because it was overshadowed by the software selloff.
- **Entry:** $175-180 (current range)
- **Stop:** $165 (major support)
- **Thesis:** Down from $212 October highs. Every hyperscaler is doubling AI capex. NVDA sells the shovels in a gold rush.
- **Analyst avg target:** $255. That's 42% upside from here.

*Source: TipRanks, CNBC, Barchart — Feb 4, 2026*`,
    tags: ['AI', 'semi', 'capex', 'growth', 'mega-cap'],
    source: 'Weekly Brief — Feb 5, 2026',
  },

  // ═══ MSFT TRADE — Jan 29, 2026 ═══
  {
    id: 'options-msft-20260129',
    date: '2026-01-29',
    symbol: 'MSFT',
    name: 'Microsoft',
    priceAtPick: 423,
    direction: 'LONG',
    type: 'options',
    conviction: 5,
    rating: 5,
    status: 'win',
    entry: '$423 area (fib support)',
    target: '$430-440',
    stop: '$415',
    result: {
      notes: '$430 call ran ~150%. Derek didn\'t take it — was building. System works, execution didn\'t.',
    },
    thesis: 'Mean reversion bounce off 12% crash. -0.618 fib at $423.16 as key support. AAPL earnings sympathy play.',
    analysis: `**The Trade We Nailed (but didn't take).**

1. Flagged MSFT in morning scan — top pick, mean reversion bounce off 12% crash
2. Derek's automated levels showed -0.618 fib at $423.16 as key support
3. MSFT was basing around that key level
4. Used ATR (~$10/day) to size plays: $430 call = scalp, $440 call = lotto

**Thesis:** Apple earnings that night would shake market back up, MSFT rides sympathy

**Execution:**
- Derek wanted to jump early
- I sent caution: "Wait for confirmation"
- Breakout happened — that was the signal
- Derek didn't take it (was deep in building)
- **The $430 call ran ~150%**

**Lesson:** The system works. Pull the trigger when signals fire.`,
    tags: ['options', 'mean-reversion', 'fib', 'earnings-sympathy'],
    source: 'Morning Brief — Jan 29, 2026',
  },

  // ═══ EXECUTED TRADES — Feb 2026 ═══
  {
    id: 'options-tsla-20260202',
    date: '2026-02-02',
    symbol: 'TSLA',
    name: 'Tesla',
    priceAtPick: 414.50,
    direction: 'LONG',
    type: 'options',
    conviction: 4,
    rating: 4,
    status: 'win',
    entry: '$420C 0DTE at $2.53',
    target: '$420.25 on stock',
    stop: '50% loss',
    result: {
      exitPrice: 3.43,
      pnl: '+$89.92 (+32.61%)',
      exitDate: '2026-02-02',
      notes: 'RSI at 14 (extreme oversold), bounced off $414.50. Took profits at target. Chart faded after exit — perfect timing.',
    },
    thesis: 'RSI at 14 extreme oversold. Bounce play off $414.50 support.',
    analysis: `**0DTE Scalp — EXECUTED & WON.**

- **Setup:** RSI at 14 (extreme oversold), bounced off $414.50
- **Entry:** $420C 0DTE at $2.53
- **Exit:** $3.43 at target ($420.25)
- **P&L:** +$89.92 (+32.61%)

**Lesson:** Derek called the bounce, executed the plan, took profits at target. Didn't get greedy. Chart faded after he sold — perfect exit timing.`,
    tags: ['0DTE', 'scalp', 'oversold', 'bounce', 'executed'],
    source: 'Trades Log — Feb 2, 2026',
  },
  {
    id: 'options-amat-20260213',
    date: '2026-02-13',
    symbol: 'AMAT',
    name: 'Applied Materials',
    priceAtPick: 367.44,
    direction: 'LONG',
    type: 'options',
    conviction: 4,
    rating: 4,
    status: 'active',
    entry: '$370C 2/20 at $10.30 ($1,030)',
    target: '$380+ on stock ($18-20+ on contract)',
    stop: '$5.15 (50% loss)',
    thesis: 'Earnings gap momentum. Semi sector sympathy. Cool CPI tailwind.',
    analysis: `**Earnings Gap Play — ACTIVE.**

- **Opened:** Feb 13, 2026 ~9:48 AM
- **Entry:** ~$10.30 ($1,030 total)
- **Breakeven:** $380.30
- **AMAT at entry:** $367.44
- **Stop:** $5.15 (50% loss)
- **Target:** $380+ on stock ($18-20+ on contract)

**Key Levels:**
- Support: $365 (opening pullback low), $361.50 (day low)
- Resistance: $376.32 (day high / new 52wk high)

**Catalysts:**
- Earnings gap momentum (2-3 day runway typical)
- Semi sector sympathy (LRCX +8.7%, KLAC +5.7%, ASML +6.7%)
- Cool CPI tailwind
- US-Taiwan trade deal buzz`,
    tags: ['options', 'semi', 'earnings-gap', 'momentum', 'active'],
    source: 'Active Trades — Feb 13, 2026',
  },

  // ═══ IPO PICKS — Feb 14, 2026 ═══
  {
    id: 'ipo-spacex-20260214',
    date: '2026-02-14',
    symbol: 'SPACEX',
    name: 'SpaceX (Pre-IPO)',
    priceAtPick: 0,
    direction: 'ACCUMULATE',
    type: 'ipo',
    conviction: 5,
    rating: 5,
    status: 'watching',
    thesis: 'Targeting June 2026 IPO. $1.5T valuation. $15-16B revenue. Could be world\'s largest IPO ever.',
    analysis: `**The Big One.**

- **Target:** June 2026 IPO
- **Valuation:** $1.5T (would be world's largest IPO)
- **Revenue:** $15-16B (2025)
- **EBITDA:** $8B (2025)
- **Notable:** Acquired xAI. Starlink dominance. Government contracts.

Not investable yet but absolutely must-watch. When this hits, it moves markets.`,
    tags: ['IPO', 'space', 'mega-cap', 'Starlink', 'pre-IPO'],
    source: 'IPO Research Brief — Feb 14, 2026',
  },
  {
    id: 'ipo-cerebras-20260214',
    date: '2026-02-14',
    symbol: 'CBRS',
    name: 'Cerebras Systems (Pre-IPO)',
    priceAtPick: 0,
    direction: 'ACCUMULATE',
    type: 'ipo',
    conviction: 3,
    rating: 3,
    status: 'watching',
    thesis: 'AI chip company. Q2 2026 IPO planned. $23B valuation. Revenue concentration risk (G42 was 87%).',
    analysis: `**AI Chip Challenger.**

- **Target:** Q2 2026 IPO
- **Valuation:** $23B
- **Notable:** $10B+ OpenAI deal
- **Risk:** Revenue concentration (G42 was 87% of revenue)

Interesting but risky. Revenue concentration is a red flag. Watch the S-1 for diversification.`,
    tags: ['IPO', 'AI', 'chips', 'pre-IPO'],
    source: 'IPO Research Brief — Feb 14, 2026',
  },

  // ═══ BTC RANGE BETS — Jan 30-31, 2026 ═══
  {
    id: 'btc-range-20260130',
    date: '2026-01-30',
    symbol: 'BTC',
    name: 'Bitcoin',
    priceAtPick: 83807,
    direction: 'LONG',
    type: 'swing',
    conviction: 3,
    rating: 3,
    status: 'win',
    entry: '$83,750-$83,999 range',
    result: {
      pnl: '2 WINS',
      exitDate: '2026-01-31',
      notes: 'Friday night chop thesis. "Nothing happening" paid off. BTC at $83,807 and $83,843.56.',
    },
    thesis: 'Friday night range chop. Nothing happening = range bet wins.',
    analysis: `**Range Bets — Both Won.**

- **Midnight bet:** $83,750-$83,999 range — WON (BTC at $83,807)
- **1am bet:** Same range — WON (BTC at $83,843.56)
- **Edge:** Derek called Friday night chop correctly. "Nothing happening" thesis paid off.`,
    tags: ['BTC', 'range', 'weekend', 'chop'],
    source: 'Trades Log — Jan 30-31, 2026',
  },
];

// ─── Helper functions ───
export function getActivePicks(): BobbyPick[] {
  return BOBBY_PICKS.filter(p => p.status === 'active');
}

export function getPicksByDate(): Record<string, BobbyPick[]> {
  const grouped: Record<string, BobbyPick[]> = {};
  for (const pick of BOBBY_PICKS) {
    if (!grouped[pick.date]) grouped[pick.date] = [];
    grouped[pick.date].push(pick);
  }
  return grouped;
}

export function getPicksBySymbol(symbol: string): BobbyPick[] {
  return BOBBY_PICKS.filter(p => p.symbol === symbol);
}

export function getWinRate(): { wins: number; losses: number; rate: number } {
  const wins = BOBBY_PICKS.filter(p => p.status === 'win').length;
  const losses = BOBBY_PICKS.filter(p => p.status === 'loss').length;
  const total = wins + losses;
  return { wins, losses, rate: total > 0 ? Math.round((wins / total) * 100) : 0 };
}

export function getPickStats() {
  const total = BOBBY_PICKS.length;
  const active = BOBBY_PICKS.filter(p => p.status === 'active').length;
  const watching = BOBBY_PICKS.filter(p => p.status === 'watching').length;
  const { wins, losses, rate } = getWinRate();
  return { total, active, watching, wins, losses, winRate: rate };
}
