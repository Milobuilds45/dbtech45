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

  // ═══ IPO RESEARCH — Feb 15, 2026 ═══
  {
    id: 'ipo-databricks-20260215',
    date: '2026-02-15',
    symbol: 'DATABRICKS',
    name: 'Databricks (Pre-IPO)',
    priceAtPick: 0,
    direction: 'ACCUMULATE',
    type: 'ipo',
    conviction: 5,
    rating: 5,
    status: 'watching',
    thesis: '$5.4B ARR growing 65% YoY. Positive FCF. $1.4B from AI products. Net retention >140%. Best enterprise software IPO candidate.',
    analysis: `**The best enterprise software IPO since Snowflake.**

$134B valuation. Just raised $7B ($5B equity + $2B debt) from JPMorgan and others.

- $5.4B ARR (+65% YoY in Q4) — accelerating, not decelerating
- $1.4B from AI products alone
- Net revenue retention >140% — customers keep spending more
- Positive free cash flow — rare for hypergrowth at this scale
- 12,000+ customers, Data Lakehouse platform

Competes with Snowflake but winning on AI integration. Open-source foundation (Apache Spark) = massive developer loyalty.

**Buy day one if priced under $150B.**

*Sources: CNBC (Feb 9), TechFundingNews, AI Insider*`,
    tags: ['IPO', 'AI', 'data', 'enterprise', 'SaaS', 'pre-IPO'],
    source: 'Saturday IPO Research Brief — Feb 15, 2026',
  },
  {
    id: 'ipo-fps-20260215',
    date: '2026-02-15',
    symbol: 'FPS',
    name: 'Forgent Power Solutions',
    priceAtPick: 33,
    direction: 'ACCUMULATE',
    type: 'ipo',
    conviction: 4,
    rating: 4,
    status: 'active',
    entry: '$30-32 on pullback',
    target: '$35-40',
    thesis: 'AI data center electrical infrastructure. IPO at $27, up 22%. Over-allotment fully exercised. Boring but essential.',
    analysis: `**Already public. Already working.**

IPO'd Feb 5 at $27. Up 22% since. $8.2B valuation. Over-allotment fully exercised — underwriters wanted more shares.

Electrical distribution equipment for commercial/industrial buildings — switchgear, panel boards, power distribution units. Every AI data center needs this.

Competes with Vertiv (VRT), Hubbell (HUBB), Eaton (ETN). Focused on data center buildout specifically.

**Wait for pullback to $30-32, then accumulate.**

*Sources: Seeking Alpha (Feb 6), StockTitan (Feb 12), NYSE*`,
    tags: ['IPO', 'infrastructure', 'data-center', 'electrical', 'recently-listed'],
    source: 'Saturday IPO Research Brief — Feb 15, 2026',
  },
  {
    id: 'ipo-canva-20260215',
    date: '2026-02-15',
    symbol: 'CANVA',
    name: 'Canva (Pre-IPO)',
    priceAtPick: 0,
    direction: 'ACCUMULATE',
    type: 'ipo',
    conviction: 4,
    rating: 4,
    status: 'watching',
    thesis: '$3.5B revenue. 260M monthly users. 95% of Fortune 500. $42B valuation. Australia\'s largest private tech company.',
    analysis: `**Consumer SaaS machine at scale.**

260M monthly active users, 21M paying subscribers. $3.5B revenue (2025). $42B secondary valuation.

95% of Fortune 500 use Canva. 12.47% of the graphics market. AI features (Magic Design) expanding the TAM.

Adobe is the only real competitor at 10x the price. Canva's price point wins the mass market.

**Buy when it lists if priced under $50B.**

*Sources: DemandSage, Dealroom, Backlinko*`,
    tags: ['IPO', 'SaaS', 'design', 'consumer', 'pre-IPO'],
    source: 'Saturday IPO Research Brief — Feb 15, 2026',
  },
  {
    id: 'avoid-klar-20260215',
    date: '2026-02-15',
    symbol: 'KLAR',
    name: 'Klarna Group',
    priceAtPick: 12,
    direction: 'SHORT',
    type: 'contrarian',
    conviction: 4,
    rating: 2,
    status: 'active',
    thesis: 'STAY AWAY. Down 56% from IPO. Class action lawsuits. Credit losses spiked 102%. Earnings Feb 19 could be ugly.',
    analysis: `**Cautionary tale. Do not touch.**

Down 56% from first-day close. Down 37.6% in last 30 days. Class action securities fraud lawsuits filed (Hagens Berman). Credit loss provisions spiked 102%.

BNPL works when the economy is strong. When consumers get squeezed, they stop paying. Klarna's losses are exploding.

Earnings Feb 19 could stabilize or destroy another 20%. Lawsuit deadline Feb 20.

**Only buy scenario: under $10 with clean earnings and lawsuit settlement.**

*Sources: Motley Fool (Feb 15), Simply Wall St, GlobeNewsWire (Feb 11)*`,
    tags: ['IPO', 'fintech', 'BNPL', 'avoid', 'lawsuit', 'recently-listed'],
    source: 'Saturday IPO Research Brief — Feb 15, 2026',
  },

  // ═══ OVERNIGHT PORTFOLIO — Feb 6, 2026 ═══
  {
    id: 'portfolio-nvda-20260206',
    date: '2026-02-06',
    symbol: 'NVDA',
    name: 'NVIDIA',
    priceAtPick: 172.74,
    direction: 'ACCUMULATE',
    type: 'growth',
    conviction: 5,
    rating: 5,
    status: 'active',
    entry: 'DCA: 1/3 now, 1/3 after earnings (Feb 25), 1/3 on dip below $160',
    target: '$350-400 (3-year)',
    stop: '$140 mental stop',
    thesis: 'AI king. Every hyperscaler spending $100B+ on AI infra. Blackwell chips sold out through 2026. Earnings Feb 25.',
    analysis: `**3-Year Hold — $2,000 allocation in $20K portfolio (10%).**

Nvidia makes the chips that power artificial intelligence. Every time you hear about ChatGPT, self-driving cars, or robots — Nvidia's hardware is underneath it. Selling pickaxes during a gold rush. Except this gold rush is real.

**Why It's a Good 3-Year Hold:**
- AI isn't slowing down. Every major tech company spending $100B+ on AI infrastructure
- Wall Street expects ~$4.69 EPS for fiscal 2026
- Next earnings: Feb 25 — major catalyst
- Blackwell chips sold out through 2026

**Bull Case:** AI spending accelerates, data center revenue doubles. 3-Year target: $350-$400
**Bear Case:** Competition from AMD, custom chips eat margins. Worst case: $120-$140

Risk Level: 6/10. Confidence: 8.5/10.

*Source: Benzinga, Feb 5, 2026*`,
    tags: ['AI', 'semi', 'portfolio', '3-year-hold', 'DCA'],
    source: 'Overnight Portfolio Report — Feb 6, 2026',
  },
  {
    id: 'portfolio-amzn-20260206',
    date: '2026-02-06',
    symbol: 'AMZN',
    name: 'Amazon.com',
    priceAtPick: 200,
    direction: 'ACCUMULATE',
    type: 'growth',
    conviction: 5,
    rating: 5,
    status: 'active',
    entry: '$200-210 (post-earnings dip)',
    target: '$320-380 (3-year)',
    stop: '$175 mental stop',
    thesis: 'Post-earnings 10% dip on $200B AI capex guidance. Classic overreaction. AWS accelerating. Buy the fear.',
    analysis: `**3-Year Hold — $3,000 allocation in $20K portfolio (15%).**

AWS is the real money machine. Netflix, Airbnb, government agencies all run on it. Delivery trucks are the sideshow. Cloud is the main event.

**Entry:** BUY THE DIP. Stock dropped 10% after hours on $200B AI capex guidance. Classic overreaction — Google said the same thing, dipped, then recovered.

**Why 3-Year Hold:**
- AWS re-accelerating as AI workloads explode
- Advertising: $50B+ revenue stream nobody talks about
- Amazon is a utility at this point

**Bull Case:** AWS margins expand, AI revenue own segment. Target: $320-$380
**Bear Case:** $200B capex burns cash, AWS growth disappoints. Worst case: $180-$200

Risk Level: 4/10. Confidence: 9/10.

*Source: CNBC, Feb 5, 2026*`,
    tags: ['FAANG', 'cloud', 'AWS', 'portfolio', '3-year-hold', 'dip-buy'],
    source: 'Overnight Portfolio Report — Feb 6, 2026',
  },
  {
    id: 'portfolio-cost-20260206',
    date: '2026-02-06',
    symbol: 'COST',
    name: 'Costco Wholesale',
    priceAtPick: 990,
    direction: 'ACCUMULATE',
    type: 'growth',
    conviction: 4,
    rating: 4,
    status: 'active',
    entry: 'DCA: 1/3 now, 1/3 at $950, 1/3 at $920',
    target: '$1,300-1,500 (3-year)',
    stop: 'None — hold through volatility',
    thesis: '93% membership renewal rate. Recession-proof. Oppenheimer target $1,100, Goldman $1,171.',
    analysis: `**3-Year Hold — Watch/Accumulate.**

Costco makes most profit from $65-$130/yr membership fees, not product sales. 70M+ households pay to shop there. That's recurring revenue.

**Why 3-Year Hold:**
- Recession-proof — people flock TO Costco when times get tough
- 93% membership renewal rate — loyalty money can't buy
- International expansion: China, Japan, Europe
- Oppenheimer target $1,100, Goldman $1,171

**Bull Case:** Membership hits 80M+, international growth. Target: $1,300-$1,500
**Bear Case:** Valuation compresses, Walmart+ competition. Worst case: $800-$850

Risk Level: 3/10. Confidence: 8/10. The "sleep at night" stock.

*Source: Benzinga, Motley Fool, Feb 5, 2026*`,
    tags: ['retail', 'defensive', 'membership', 'recession-proof', '3-year-hold'],
    source: 'Overnight Portfolio Report — Feb 6, 2026',
  },
  {
    id: 'portfolio-voo-20260206',
    date: '2026-02-06',
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    priceAtPick: 624.54,
    direction: 'ACCUMULATE',
    type: 'growth',
    conviction: 5,
    rating: 5,
    status: 'active',
    entry: 'Buy full position immediately — this is your anchor',
    target: 'Long-term hold',
    thesis: 'Foundation of $20K portfolio (35%). 500 biggest US companies. Set it and forget it.',
    analysis: `**Portfolio Foundation — $7,000 allocation (35%).**

The anchor. S&P 500 index. You don't time this, you just own it. Historically returns ~10% annually. In down markets, it's your floor. In up markets, it keeps pace.

No stop loss. No timing. Just buy.`,
    tags: ['ETF', 'index', 'foundation', 'portfolio', 'S&P500'],
    source: 'Overnight Portfolio Report — Feb 6, 2026',
  },
  {
    id: 'portfolio-qqq-20260206',
    date: '2026-02-06',
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    priceAtPick: 605.75,
    direction: 'ACCUMULATE',
    type: 'growth',
    conviction: 4,
    rating: 4,
    status: 'active',
    entry: 'Week 2 — let earnings turbulence settle',
    target: 'Long-term hold',
    thesis: 'Tech/AI growth engine for $20K portfolio (20%). Nasdaq 100 concentrated exposure.',
    analysis: `**Growth Engine — $4,000 allocation (20%).**

Concentrated tech/AI exposure. More aggressive than VOO. Wait for Week 2 (Feb 10-14) to buy — let the Amazon/Google earnings turbulence settle first.

No stop loss on ETFs. Ride them.`,
    tags: ['ETF', 'tech', 'Nasdaq', 'portfolio', 'growth'],
    source: 'Overnight Portfolio Report — Feb 6, 2026',
  },
  {
    id: 'portfolio-schd-20260206',
    date: '2026-02-06',
    symbol: 'SCHD',
    name: 'Schwab US Dividend Equity ETF',
    priceAtPick: 31.01,
    direction: 'ACCUMULATE',
    type: 'growth',
    conviction: 4,
    rating: 4,
    status: 'active',
    entry: 'Buy full position Week 1 — defensive anchor',
    target: 'Hold + reinvest dividends',
    thesis: 'Dividend shield for $20K portfolio (15%). Pays dividends while you wait. Up 12% YTD.',
    analysis: `**Dividend Shield — $3,000 allocation (15%).**

Pays you dividends while you wait. Down market protection. Up 12% YTD in 2026. This is your parachute when tech sells off.

Buy full position Week 1 alongside VOO.`,
    tags: ['ETF', 'dividend', 'defensive', 'portfolio', 'income'],
    source: 'Overnight Portfolio Report — Feb 6, 2026',
  },
  {
    id: 'portfolio-pltr-20260206',
    date: '2026-02-06',
    symbol: 'PLTR',
    name: 'Palantir Technologies',
    priceAtPick: 139.54,
    direction: 'ACCUMULATE',
    type: 'growth',
    conviction: 3,
    rating: 3,
    status: 'active',
    entry: 'Week 3 — let it find a floor after 11% drop',
    target: '$280 (double = take half)',
    stop: '$105 mental stop',
    thesis: 'Speculative AI/defense play (5% of portfolio). Down 11.6% = entry point. If AI defense spending explodes, this rips.',
    analysis: `**Lottery Ticket — $1,000 allocation (5%).**

High-risk, high-reward AI/defense play. Down 11.6% yesterday = entry point. 

Crushed earnings: $1.41B rev (+70% YoY), FY26 guide $7.18B vs $6.22B expected. Karp called it "indisputably the best results in tech in the last decade."

If it doubles ($280), sell half and lock profits. Mental stop at $105. This is speculative — size accordingly.`,
    tags: ['AI', 'defense', 'speculative', 'portfolio', 'high-risk'],
    source: 'Overnight Portfolio Report — Feb 6, 2026',
  },

  // ═══ WEEKEND RESEARCH — Jan 31, 2026 ═══
  {
    id: 'swing-wmb-20260131',
    date: '2026-01-31',
    symbol: 'WMB',
    name: 'Williams Companies',
    priceAtPick: 52,
    direction: 'LONG',
    type: 'swing',
    conviction: 4,
    rating: 4,
    status: 'expired',
    entry: '$52 (breakout level)',
    target: '$60+',
    stop: '$50',
    thesis: 'Just broke to all-time highs. Energy sector leader. Midstream demand + nat gas infrastructure.',
    analysis: `**Breakout Confirmed.**

- **Setup:** Just broke to all-time highs (source: IBD Jan 30)
- **Support:** $52 (prior resistance now support)
- **Target:** $60+ (measured move)
- **Stop:** $50 (below breakout level)
- **Why:** Energy sector leadership, midstream demand, nat gas infrastructure play
- **Trade:** Long stock or Feb calls at $55 strike

*Source: Investor's Business Daily, Jan 30, 2026*`,
    tags: ['energy', 'breakout', 'midstream', 'nat-gas', 'ATH'],
    source: 'Weekend Research — Jan 31, 2026',
  },
  {
    id: 'swing-aapl-20260131',
    date: '2026-01-31',
    symbol: 'AAPL',
    name: 'Apple',
    priceAtPick: 250,
    direction: 'LONG',
    type: 'earnings',
    conviction: 4,
    rating: 4,
    status: 'expired',
    entry: '$250-252 (50-day MA test)',
    target: '$280',
    stop: '$242',
    thesis: 'Post-earnings dip buy. Record iPhone quarter. AI concerns overblown. Buybacks ongoing.',
    analysis: `**Post-Earnings Dip Buy.**

- **Setup:** Record iPhone quarter (+surge in sales), stock faded on AI "memory" concerns
- **Support:** $250 (50-day MA zone)
- **Target:** $280 (prior highs)
- **Stop:** $242 (below recent swing low)
- **Why:** Best quarter ever, AI concerns overblown, buybacks ongoing
- **Trade:** Wait for $250-252 support test, then long

*Source: Apple IR, Reuters, Jan 30, 2026*`,
    tags: ['FAANG', 'earnings', 'dip-buy', 'iPhone', 'buybacks'],
    source: 'Weekend Research — Jan 31, 2026',
  },
  {
    id: 'swing-xle-20260131',
    date: '2026-01-31',
    symbol: 'XLE',
    name: 'Energy Select SPDR ETF',
    priceAtPick: 93,
    direction: 'LONG',
    type: 'swing',
    conviction: 4,
    rating: 4,
    status: 'expired',
    entry: '$92-93 zone',
    target: '$102 (2022 highs)',
    stop: '$89',
    thesis: '+12.24% YTD. Best performing sector. Oil stable, refinery margins strong, ~3.5% dividend yield.',
    analysis: `**Sector Momentum Play.**

- **Setup:** +12.24% YTD, best performing sector
- **Support:** $92-93 zone
- **Target:** $102 (2022 highs)
- **Stop:** $89
- **Why:** Oil stabilizing, refinery margins strong, dividend yield ~3.5%
- **Trade:** Long ETF or energy majors (XOM, CVX)

*Source: Yahoo Finance Sector Dashboard, Jan 30, 2026*`,
    tags: ['ETF', 'energy', 'sector-momentum', 'dividend'],
    source: 'Weekend Research — Jan 31, 2026',
  },
  {
    id: 'short-tsla-20260131',
    date: '2026-01-31',
    symbol: 'TSLA',
    name: 'Tesla',
    priceAtPick: 450,
    direction: 'SHORT',
    type: 'contrarian',
    conviction: 3,
    rating: 3,
    status: 'expired',
    entry: '$450-460 (resistance zone)',
    target: '$380 (gap fill)',
    stop: '$475 (new high)',
    thesis: 'Trading at 632 P/E on core earnings. Overextended. EV competition heating up.',
    analysis: `**Bearish — Overextended.**

- **Setup:** Trading at 632 P/E on "core" earnings (Fortune analysis)
- **Resistance:** $450-460 zone
- **Target:** $380 (gap fill)
- **Stop:** $475 (new high)
- **Why:** Valuation extreme even for Tesla, EV competition heating up
- **Trade:** Put spreads or stay flat

*Source: Fortune Tesla Valuation Analysis, Jan 30, 2026*`,
    tags: ['EV', 'overvalued', 'bearish', 'put-spreads'],
    source: 'Weekend Research — Jan 31, 2026',
  },
  {
    id: 'short-smh-20260131',
    date: '2026-01-31',
    symbol: 'SMH',
    name: 'VanEck Semiconductor ETF',
    priceAtPick: 260,
    direction: 'SHORT',
    type: 'contrarian',
    conviction: 3,
    rating: 3,
    status: 'expired',
    entry: '$260 (broken resistance)',
    target: '$225 if support fails',
    stop: 'Above $260 reclaim',
    thesis: 'Tech weakness. AI chip trade exhausted. Inventory concerns. Hedge long tech with SMH puts.',
    analysis: `**Bearish/Hedge — Tech Weakness.**

- **Setup:** Nasdaq lagging, semis rolling over
- **Support:** $240 (200-day MA)
- **Resistance:** $260 (broken)
- **Target:** $225 if support fails
- **Why:** AI chip trade exhausted, inventory concerns
- **Trade:** Hedge long tech with SMH puts

*Source: Yahoo Finance, Barchart, Jan 30, 2026*`,
    tags: ['ETF', 'semi', 'bearish', 'hedge', 'puts'],
    source: 'Weekend Research — Jan 31, 2026',
  },

  // ═══ BA TRADE PLAN — Jan 30, 2026 ═══
  {
    id: 'options-ba-20260130',
    date: '2026-01-30',
    symbol: 'BA',
    name: 'Boeing',
    priceAtPick: 233,
    direction: 'LONG',
    type: 'options',
    conviction: 4,
    rating: 4,
    status: 'expired',
    entry: '$240C 2/27 at ~$4.80-5.00',
    target: '$248-254',
    stop: 'Daily close below $225',
    thesis: 'Defense sector laggard. Bounced off 50 EMA + 0.618 Fib confluence support at $225. $2.81B F-15 contract catalyst.',
    analysis: `**Defense Sector Laggard Play.**

- **Position:** Long BA $240C 2/27
- **Entry:** Limit $4.80-5.00 (wide spread — NO market orders)
- **Trigger:** Reclaim 21 EMA at $237 = bullish breakout

**Technical Setup:**
- ✅ Bounced off 50 EMA ($225.68) + 0.618 Fib ($225.14) — confluence support held
- ✅ RSI at 49.62 — neutral, basing at 50, curling up
- ❌ Below 21 EMA ($237.05) — needs to reclaim

**Catalysts:**
- $2.81B F-15 Air Force contract
- Air India ordered 30 more 737 MAX jets
- New CEO Ortberg cleaning house
- Aerospace & Defense sector up 46% in 2025

**Targets:** T1: $240 (take 1/3), T2: $248-250 (take 1/3), T3: $254+ (let ride)

*Source: Boeing IR, IBD, Jan 30, 2026*`,
    tags: ['options', 'defense', 'laggard', 'fib', 'catalyst'],
    source: 'BA Trade Plan — Jan 30, 2026',
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
