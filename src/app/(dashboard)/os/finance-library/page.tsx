'use client';

import { useEffect, useState } from 'react';
import BookCover from '@/components/BookCover';

interface Book {
  title: string;
  author: string;
  year: string;
  filename: string;
  category: string;
  path: string;
}

interface Category {
  name: string;
  books: Book[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Algo & Quant Trading': '#6366f1',
  'Candlesticks': '#f59e0b',
  'Chart Patterns': '#10b981',
  'Day Trading': '#ef4444',
  'Economic Indicators': '#3b82f6',
  'Fibonacci & Harmonics': '#f97316',
  'Finance & Investing': '#14b8a6',
  'Forex & Currencies': '#06b6d4',
  'Futures & Commodities': '#eab308',
  'Hedge Funds': '#a855f7',
  'Options': '#ec4899',
  'Personal Development': '#22c55e',
  'Short Selling': '#f43f5e',
  'Swing & Trend Trading': '#0ea5e9',
  'Technical Analysis': '#d946ef',
  'Trading Psychology': '#64748b',
  'Volume & Market Profile': '#84cc16',
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Algo & Quant Trading': 'Algorithmic strategies, machine learning for markets, and quantitative finance methods.',
  'Candlesticks': 'Japanese candlestick charting techniques, patterns, and formations for price action trading.',
  'Chart Patterns': 'Classic and advanced chart pattern recognition for identifying trade setups.',
  'Day Trading': 'Intraday strategies, momentum trading, and high-probability short-term setups.',
  'Economic Indicators': 'Understanding how economic data releases impact markets and trading decisions.',
  'Fibonacci & Harmonics': 'Fibonacci retracements, extensions, harmonic patterns, and Elliott Wave analysis.',
  'Finance & Investing': 'Foundational investing, corporate finance, stock analysis, and portfolio management.',
  'Forex & Currencies': 'Foreign exchange trading strategies, currency pair analysis, and forex market mechanics.',
  'Futures & Commodities': 'Futures contract trading, commodity markets, and hedging strategies.',
  'Hedge Funds': 'Hedge fund strategies, structure, alpha generation, and alternative investments.',
  'Options': 'Options pricing, volatility trading, hedging strategies, and Greeks management.',
  'Personal Development': 'Mindset, discipline, deep work, and mental toughness for peak performance.',
  'Short Selling': 'Short selling strategies, risk management, and profiting from market declines.',
  'Swing & Trend Trading': 'Multi-day to multi-week trading strategies following market trends and swings.',
  'Technical Analysis': 'Chart reading, indicators, intermarket analysis, and technical trading systems.',
  'Trading Psychology': 'Mental game of trading, emotional discipline, and developing a winning mindset.',
  'Volume & Market Profile': 'Volume price analysis, market profile, COT reports, and institutional order flow.',
};

// Individual book descriptions keyed by filename
const BOOK_DESCRIPTIONS: Record<string, string> = {
  // Algo & Quant Trading
  'Chen_Jun__Tsang_Edward_-_Detecting_regime_change_in_computational_finance__data_science_machine_learning_and_algorithmic_trading-CRC_Press_2021Z-Lib.io.pdf':
    'Covers how to detect market regime changes using data science and machine learning. Teaches computational methods for identifying when markets shift between trending, mean-reverting, and volatile states — critical for adapting algo strategies in real time.',
  'Quantitative Finance (2007).pdf':
    'A comprehensive introduction to quantitative finance covering derivatives pricing, risk management, stochastic calculus, and portfolio optimization. The mathematical foundation behind modern trading systems and financial engineering.',

  // CFA Study Materials
  '2018 FinQuiz CFA Level 2 Study Plan.pdf': 'Structured study plan for CFA Level 2 covering equity valuation, fixed income, derivatives, portfolio management, and financial reporting analysis. Includes timeline and topic weighting.',
  '2018 FinQuiz CFA Level 3 Study Plan.pdf': 'Study plan for CFA Level 3 focused on portfolio management, wealth planning, behavioral finance, and institutional investment. The final step to the CFA charter.',
  'CFA_Level1_2018_curriculum_updates.pdf': 'Overview of curriculum changes for CFA Level 1 covering ethics, quantitative methods, economics, financial reporting, and investment tools.',
  'CFA_Level2_2018_curriculum_updates.pdf': 'Curriculum updates for CFA Level 2 highlighting changes in equity valuation, alternative investments, and derivatives analysis.',
  'CFA_Level3_2018_curriculum_updates.pdf': 'Curriculum updates for CFA Level 3 with changes to portfolio management, risk management, and private wealth topics.',

  // Candlesticks
  '17 Money Making Candle Formations (2008).pdf': 'Breaks down 17 specific candlestick formations that signal high-probability trade entries. Each pattern includes real chart examples, entry/exit rules, and win rate statistics.',
  '7369608-Mastering-Candlestick-Charts-Part-I.pdf': 'Part 1 of a deep dive into candlestick charting. Covers the foundational single and dual candlestick patterns, how to read them in context, and combine them with volume for confirmation.',
  '7369609-Mastering-Candlestick-Charts-Part-2.pdf': 'Part 2 covers advanced multi-candle patterns, complex formations, and how to integrate candlestick analysis with Western technical indicators for stronger trade signals.',
  'Beyond_Candlesticks-Steve_Nison.pdf': 'Steve Nison goes beyond basic candlesticks into Kagi charts, Renko charts, and Three-Line Break charts. These lesser-known Japanese charting methods filter noise and reveal trend structure most traders miss.',
  'Candlesticks - The Basics (2000).pdf': 'A beginner-friendly introduction to candlestick charting. Covers how to read individual candles, basic patterns like doji, hammer, and engulfing, and what they reveal about buyer/seller psychology.',
  'Candlesticks Every Trader Should Know (2006).pdf': 'A curated collection of the most reliable and frequently occurring candlestick patterns. Focuses on the patterns that actually matter for daily trading decisions with clear visual examples.',
  'Candlesticks for Support and Resistance (2000).pdf': 'Shows how to use candlestick patterns specifically at support and resistance levels. When a reversal candle forms at a key level, the probability of a successful trade increases dramatically.',
  'Japanese_Candlestick_Charting_Techniques-Steve_Nison.pdf': 'THE definitive book on candlestick charting by the man who introduced Japanese candlesticks to the Western world. Covers every pattern, their psychology, and how to combine them with Western technical analysis. A must-read.',
  'The_Candlestick_Course-Steve_Nison.pdf': 'A practical workbook companion to Nison\'s main book. Includes exercises, quizzes, and real chart examples to drill candlestick pattern recognition until it becomes second nature.',
  'Top 12 Candlesticks (2000).pdf': 'Focuses on the 12 highest-probability candlestick patterns. Cuts through the noise of 50+ patterns and highlights the ones that consistently deliver edge in real markets.',

  // Chart Patterns
  'Chart_Patterns_Support_and_Resistance_Trendlines_.pdf': 'Teaches how chart patterns, support/resistance levels, and trendlines work together to create a complete technical framework. The building blocks every chart trader needs.',
  'Chart_Your_Way_to_Profits.pdf': 'A practical guide to using chart analysis for profitable trading. Covers pattern identification, breakout trading, and how to set targets and stops based on chart structure.',
  'Encyclopedia_Of_Chart_Patterns_2nd_Edition.pdf': 'Thomas Bulkowski\'s legendary reference covering 60+ chart patterns with statistical performance data. Each pattern includes failure rates, average moves, and volume characteristics. The most data-driven chart pattern book ever written.',
  'Investors_Guide_To_Buying_Stocks_Using_Launch_Pad_Chart_Patterns.pdf': 'Focuses on "launch pad" patterns — specific base formations that precede explosive upside moves. Teaches how to identify stocks building energy before a major breakout.',
  'Trade_Chart_Patterns_Like_the_Pros.pdf': 'Takes chart pattern trading from textbook to real-world execution. Covers professional-grade entry timing, position sizing for pattern trades, and how to handle pattern failures.',
  'Trade_What_You_See_How_to_Profit_from_Pattern_Recognition.pdf': 'Teaches objective pattern recognition without bias. Covers how to see what the chart is actually showing rather than what you want it to show — a critical skill for consistent profitability.',
  'Trading_Classic_Chart_Patterns.pdf': 'Focuses on the time-tested classic patterns: head and shoulders, double tops/bottoms, triangles, flags, and wedges. Includes statistical edge data and proper trade management for each.',
  'Visual_Guide_to_Chart_Patterns.pdf': 'A highly visual reference making chart patterns easy to identify in real time. Heavy on annotated chart examples with clear markup showing entries, stops, and targets.',
  'visual_Guide_to_Chart_Patterns_1.pdf': 'Additional visual chart pattern reference with more annotated examples across different markets and timeframes.',

  // Day Trading
  '25 Rules Of Day Trading (2003).pdf': '25 essential rules that separate profitable day traders from the 90% who fail. Covers risk management, position sizing, emotional discipline, and when to walk away.',
  'A Complete Guide to Day Trading (2008).pdf': 'Comprehensive A-to-Z guide covering everything from setting up your trading desk to developing a complete day trading system. Includes strategies, risk management, and the business side of trading.',
  'After-Hours_Trader.pdf': 'Covers strategies for trading in pre-market and after-hours sessions. These thinner markets offer unique opportunities but require different tactics than regular hours trading.',
  'Breakout_Trading_Simple_Proven_Strategies.pdf': 'Focuses specifically on breakout setups — how to identify them, confirm them, enter with proper risk, and ride the momentum. Simple, repeatable strategies for capturing explosive moves.',
  'Day Trading Ebook (2000).pdf': 'An early day trading guide covering the fundamentals of intraday speculation, Level II quotes, order routing, and basic scalping strategies.',
  'Day Trading University (2001).pdf': 'A structured course-style guide to day trading covering market mechanics, order types, basic strategies, and the psychological demands of intraday trading.',
  'Daytrading University - Advanced Daytrading Two-Day Seminar (2001).pdf': 'Advanced seminar material covering professional day trading techniques, tape reading, momentum strategies, and managing multiple positions intraday.',
  'High_Probability_Trading_Strategies_Entry_to_Exit_Tactics_for_the_Forex_Futures_and_Stock_Markets.pdf': 'Robert Miner\'s method combining multiple timeframe momentum, pattern recognition, and Fibonacci analysis to identify high-probability trades across forex, futures, and stocks. Covers the complete trade lifecycle from entry to exit.',
  'High_probability_trading.pdf': 'Marcel Link\'s guide to developing a trading edge through proper preparation, risk management, and systematic approach. Explains why most traders lose and how to join the winning minority.',
  'KEN_WOLFF_-_Trading_On_Momentum_Advanced_Techniques_For_High_Percentage_Day_TRADING-MCGRAW_HILL.pdf': 'Ken Wolff\'s advanced momentum trading techniques for day traders. Covers identifying momentum stocks, optimal entry timing, and scaling in/out of positions for maximum profit capture.',
  'The_Complete_Guide_to_Day_Trading_-_A_Practical_Manual_from_A_Professional_Day_Trading_Coach.pdf': 'A professional trading coach\'s practical manual covering strategy development, trade execution, journaling, and continuous improvement. Built around real coaching experience with hundreds of traders.',
  'RICHARD_D_WYCOFF_-_THE_DAY_TRADERS_BIBLE-63_PAGES.pdf': 'Richard Wyckoff\'s classic work on tape reading and understanding market dynamics through price and volume. The foundational text that influenced generations of traders on reading supply and demand in real time.',
  'LARRY_WILLIAMS_-_LONG_TERM_SECRETS_FOR_SHORT_TERM_TRADING.pdf': 'Larry Williams reveals the patterns and setups he used to turn $10,000 into $1.1 million in a single year of trading. Covers his proprietary indicators, market timing methods, and money management rules.',
  'Learn Day Trading (2000).pdf': 'Beginner-friendly introduction to day trading covering market basics, order types, chart reading, and developing your first trading strategy.',
  'The Day Trading Course (2000).pdf': 'A structured course taking you from day trading fundamentals through strategy development to execution. Includes exercises and simulated trade scenarios.',
  'Winning_the_Day_Trading_Game.pdf': 'Practical strategies for consistent day trading profitability. Focuses on the game-like aspects of trading: preparation, execution, adaptation, and scoring your performance.',
  'mastering-the-trade.pdf': 'John Carter\'s proven strategies for day and swing trading. Covers his squeeze setup, tick fade, and other professional techniques with real trade examples. One of the most practical trading books written.',
  'epdf.pub_street-smarts-high-probability-short-term-trading-strategies.pdf': 'Laurence Connors and Linda Raschke\'s collection of 20+ short-term trading strategies with specific rules for entry, exit, and stops. Each strategy is backtested and includes real chart examples. A trading desk classic.',
  'Professional_Trading_Strategies(2).pdf': 'Advanced trading strategies used by professional traders including institutional-level setups, order flow analysis, and multi-timeframe approaches.',
  'Professional_Trading_Strategies.pdf': 'Professional-grade trading strategies covering market structure, price action, and systematic approaches used by full-time traders.',
  'Technical Analysis for Short Term Traders (2000).pdf': 'Applies technical analysis specifically to short-term trading timeframes. Covers which indicators work best for intraday and swing setups versus longer-term analysis.',
  'The Stock Market Course (2001).pdf': 'A comprehensive stock market education covering fundamental analysis, technical analysis, options basics, and portfolio construction in a structured course format.',
  'Trading on Momentum (2002).pdf': 'Strategies for identifying and riding momentum in stocks. Covers relative strength, volume confirmation, and timing entries to capture the strongest portion of a move.',
  'Oliver_Kell_-_Victory_in_stock_market.pdf': 'Oliver Kell\'s approach to stock trading that won him the U.S. Investing Championship. Covers his process for finding winning stocks, timing entries, and managing risk.',

  // Economic Indicators
  'Guide_to_Economic_Indicators.pdf': 'A reference guide explaining what each major economic indicator measures, when it\'s released, and how markets typically react. Essential for trading around economic data.',
  'The Pocketbook of Economic Indicators (2002).pdf': 'A compact but thorough reference covering GDP, employment, inflation, housing, manufacturing, and consumer data. Explains how each indicator fits into the bigger economic picture.',
  'The_Pocket_Book_Of_Economic_Indicators.pdf': 'Quick-reference guide to understanding the most market-moving economic releases. Covers what to watch, consensus expectations, and how surprises drive price action.',
  'The_Secrets_of_Economic_Indicators.pdf': 'Bernard Baumohl reveals how to interpret economic indicators before Wall Street reacts. Teaches you to read the data like a professional economist and anticipate market-moving releases.',
  'The_Traders_Guide_to_Key_Economic_Indicators.pdf': 'Written specifically for traders, this covers which economic indicators actually move markets, how to position ahead of releases, and how to trade the reaction.',
  'Using_Economic_Indicators_to_Improve_Investment_Analysis.pdf': 'Shows how to integrate economic indicator analysis into your investment process. Covers leading, lagging, and coincident indicators and how to build a macro framework.',

  // Fibonacci & Harmonics
  'Fibonacci_Analysis.pdf': 'Comprehensive guide to using Fibonacci ratios in trading. Covers retracements, extensions, projections, time analysis, and how to identify high-probability confluence zones.',
  'Fibonacci_Trading_How_to_Master_the_Time_and_Price_Advantage.pdf': 'Carolyn Boroden\'s practical guide to Fibonacci trading. Shows how to use Fibonacci time and price clusters to identify precise entry points. One of the best Fibonacci books for active traders.',
  'Fibonacci_and_Chart_Pattern_trading_tools.pdf': 'Combines Fibonacci analysis with chart pattern recognition for higher-probability setups. When a chart pattern completes at a Fibonacci level, the trade probability increases significantly.',
  'Harmonic_Trading_Volume_1.pdf': 'Scott Carney\'s foundational work on harmonic patterns — Gartley, Bat, Butterfly, and Crab patterns. Covers the specific Fibonacci ratios that define each pattern and the trading rules for each.',
  'Harmonic_Trading_Volume_2.pdf': 'Advanced harmonic patterns including the Shark, 5-0, and alternate bat patterns. Covers pattern validation, completion zones, and how to manage harmonic trades from entry to exit.',
  'How_To_Identify_High-Profit_Elliott_Wave_Trades_in_Real_Time.pdf': 'Practical Elliott Wave analysis focused on identifying the most profitable wave structures in real time. Cuts through Elliott Wave complexity to focus on the setups that actually make money.',
  'Robert_Fisher_-_Fibonacci_Applications_and_Strategies_for_Traders.pdf': 'Robert Fischer\'s systematic approach to applying Fibonacci ratios across different markets. Covers his unique methods for combining Fibonacci with candlestick patterns and moving averages.',

  // Finance & Investing
  'A First Course in Corporate Finance (2006).pdf': 'Foundational corporate finance covering capital budgeting, valuation, capital structure, dividend policy, and mergers. The analytical framework behind how companies make financial decisions.',
  'Accounting for Decision Making (2011).pdf': 'Teaches how to read and interpret financial statements for investment decision-making. Covers income statements, balance sheets, cash flow analysis, and ratio analysis.',
  'Edwin_LeFevre_Reminiscences_of_a_Stock_Operator.pdf': 'The thinly veiled biography of Jesse Livermore, the greatest stock trader who ever lived. Timeless lessons on speculation, market psychology, and why human nature never changes. Required reading for every trader.',
  'Financial Accounting and Reporting (2011).pdf': 'Comprehensive financial accounting covering GAAP/IFRS standards, revenue recognition, asset valuation, and consolidated financial statements.',
  'Financial Analysis Using Excel  (2002).pdf': 'Practical guide to building financial models in Excel. Covers DCF analysis, sensitivity tables, scenario analysis, and automating financial calculations.',
  'Financial Management (1998).pdf': 'Core financial management principles covering capital structure, working capital management, investment appraisal, and financial planning for businesses.',
  'Fire Your Stock Analyst - Analysing Stocks on Your Own (2006).pdf': 'Teaches you to do your own equity research instead of relying on Wall Street analysts. Covers fundamental analysis, reading 10-Ks, competitive analysis, and building your own stock ratings.',
  'Getting Started in Bonds (2003).pdf': 'Introduction to bond markets covering Treasury bonds, corporate bonds, municipals, yield curves, duration, and how interest rates affect bond prices.',
  'Investments (2003).pdf': 'Academic-level investments textbook covering modern portfolio theory, CAPM, efficient markets, equity and fixed income valuation, and derivatives.',
  'Investments (2005).pdf': 'Updated investments textbook covering asset allocation, security analysis, portfolio optimization, and performance measurement.',
  'Investments - An Introduction (2014).pdf': 'Contemporary introduction to investments covering stocks, bonds, mutual funds, ETFs, real estate, and alternative investments with modern market context.',
  'Mastering Corporate Finance (2010).pdf': 'Advanced corporate finance covering M&A valuation, LBO modeling, restructuring, and complex capital structure decisions used by investment bankers and PE professionals.',
  'Principles of Economics (2003).pdf': 'Foundational economics covering micro and macroeconomic principles — supply/demand, market structures, monetary policy, fiscal policy, and international trade.',
  'Protecting Your Wealth In Good Times And Bad (2003).pdf': 'Asset protection and wealth preservation strategies covering diversification, asset allocation through market cycles, tax optimization, and estate planning.',
  'The Economist - Guide to Investment Strategy (2006).pdf': 'The Economist\'s practical guide to building an investment strategy. Covers asset allocation, risk budgeting, behavioral biases, and constructing a portfolio aligned with your goals.',
  'The_Economics_of_Money_Banking_and_Financial_Markets.pdf': 'Frederic Mishkin\'s comprehensive text on how the financial system works — central banking, money supply, interest rate determination, and the transmission mechanism of monetary policy to markets.',
  'The_Little_Book_of_Bull_Moves_in_Bear_Markets_How_to_keep_your_portfolio_up_when_the_market_is_down.pdf': 'Peter Schiff\'s strategies for protecting and growing wealth during bear markets. Covers defensive positioning, short selling, commodities, foreign stocks, and contrarian investing.',
  'The_Little_Book_of_Stock_Market_Cycles_by_Jeffery_Hirsch.pdf': 'Jeffrey Hirsch\'s analysis of seasonal patterns, presidential cycles, and historical market patterns that repeat. The data-driven case for market timing based on calendar effects and cycles.',
  'The Mathematics Of Financial Modeling And Investment Management (2004).pdf': 'Advanced mathematical foundations of finance including stochastic processes, optimization, Monte Carlo simulation, and the math behind derivatives pricing and risk management.',
  'Understanding Stocks (2004).pdf': 'Beginner-friendly guide to understanding how stocks work, how to evaluate them, and how the stock market operates. A solid first book for new investors.',
  'Using Excel for Business Analysis (2012).pdf': 'Practical Excel techniques for business and financial analysis including modeling, scenario planning, data visualization, and decision analysis tools.',
  'Using the Financial Pages (2006).pdf': 'How to read and interpret financial news, stock tables, earnings reports, and economic data releases. Turns financial media from noise into actionable intelligence.',
  'William_ONeil_-_How_to_Make_Money_in_Stocks._A_Wining_System_in_Good_Times_or_Bad.pdf': 'William O\'Neil\'s legendary CAN SLIM system for identifying winning growth stocks. Covers the 7 characteristics of every great stock winner and how to time entries using cup-with-handle and other bases. A classic.',
  'Weinstein_Secrets_to_Profiting_in_Markets_.pdf': 'Stan Weinstein\'s stage analysis method for identifying stocks in Stage 2 uptrends and avoiding Stage 4 declines. A simple but powerful framework for riding the big trends and avoiding catastrophic losses.',

  // Forex & Currencies
  '17 Proven Currency Trading Strategies (2013).pdf': '17 tested forex strategies each with specific entry/exit rules, timeframes, and currency pairs. Includes trend-following, counter-trend, and range-bound approaches.',
  'Amazing Forex System (2004).pdf': 'A mechanical forex trading system with defined rules for entry, exit, and risk management. Designed for traders who want a systematic, emotions-free approach to currency trading.',
  'Currency Strategy (2002).pdf': 'Institutional-level currency analysis covering fundamental valuation models, flow analysis, central bank policy impacts, and how global macro factors drive currency markets.',
  'Essentails of Foreign Exchange Trading (2009).pdf': 'Covers the essentials of forex trading: pip calculations, lot sizing, leverage management, major and minor pairs, and the 24-hour market structure.',
  'Forex - Online Manual for Successful Trading (2000).pdf': 'Early comprehensive guide to online forex trading covering platform basics, technical analysis for currencies, and risk management for leveraged trading.',
  'Forex Trading Techniques (2003).pdf': 'Technical and fundamental forex trading techniques including chart patterns specific to currencies, news trading strategies, and carry trade setups.',
  'Getting Started in Currency Trading (2008).pdf': 'Beginner\'s guide to the forex market covering how currencies are quoted, reading forex charts, choosing a broker, and developing a trading plan.',
  'Successful Foreign Exchange Dealing  (2001).pdf': 'Professional forex dealing techniques covering interbank market dynamics, order flow, and the institutional side of currency trading.',
  'Sure Fire Forex Trading (2000).pdf': 'A collection of forex trading strategies designed for consistency. Covers specific setups, money management rules, and how to build a reliable forex trading business.',
  'The Forex Market Phenomena (2000).pdf': 'Explores unique characteristics of the forex market — why it behaves differently from stocks, how central banks create trends, and the phenomena that create tradeable patterns.',
  'The Forex Trading Course (2008).pdf': 'A structured course covering forex fundamentals through advanced strategies. Includes chart analysis, indicator techniques, and building a complete forex trading plan.',

  // Futures & Commodities
  'Commodities Demystified  (2008).pdf': 'Breaks down commodity markets into plain language — how futures contracts work, what drives commodity prices, and how to trade or invest in gold, oil, grains, and other commodities.',
  'Getting Started in Futures (2005).pdf': 'Introduction to futures markets covering contract specifications, margin requirements, hedging vs speculation, and how to place your first futures trade. Essential for anyone moving from stocks to futures.',
  'The Four Biggest Mistakes In Futures Trading (2000).pdf': 'Identifies the four critical mistakes that wipe out most futures traders: overtrading, undercapitalization, failure to use stops, and not having a plan. Short, actionable, and potentially account-saving.',

  // Hedge Funds
  'Create Your Own Hedge Fund (2005).pdf': 'Practical guide to structuring and launching your own hedge fund. Covers legal structure, capital raising, strategy selection, risk management, and operational setup.',
  'Getting Started in Hedge Funds (2005).pdf': 'Introduction to hedge fund investing covering fund structures, strategies (long/short, event-driven, macro, quant), due diligence, and how to evaluate hedge fund performance.',
  'Hedge Fund Alpha (2009).pdf': 'Examines the sources of alpha in hedge fund strategies. Covers what actually drives hedge fund returns, how to identify skilled managers, and the role of alternative investments in portfolios.',
  'Hedge Funds - Strategies _ Techniques (2003).pdf': 'Deep dive into hedge fund strategies including equity long/short, global macro, convertible arbitrage, distressed debt, and statistical arbitrage. Explains the mechanics behind each approach.',
  'Hedges On Hedge Funds (2005).pdf': 'Jerry Parker and other top hedge fund managers share their insights on running successful hedge funds. Covers risk management philosophy, strategy adaptation, and building a lasting fund.',
  'Profiting from Hedge Funds (2013).pdf': 'Shows how individual investors can profit from hedge fund strategies without investing in actual hedge funds. Covers replicating long/short, merger arb, and other strategies in your own portfolio.',
  'The Hedge Fund Book (2010).pdf': 'A comprehensive overview of the hedge fund industry covering history, major strategies, key players, regulation, and the evolving role of hedge funds in global markets.',
  'The Hedge Fund Course (2005).pdf': 'A structured educational course on hedge funds covering portfolio construction, performance attribution, risk metrics, and manager selection for institutional allocators.',
  'Trade Like a Hedge Fund (2004).pdf': 'James Altucher reveals 20 unconventional trading strategies used by hedge funds. Each strategy includes specific rules, backtesting results, and implementation details accessible to individual traders.',
  'Visual Guide to Hedge Funds (2014).pdf': 'A highly visual, infographic-style guide making complex hedge fund strategies accessible. Covers payoff diagrams, strategy mechanics, and risk characteristics through clear visual explanations.',

  // Options
  'Buy and Hedge (2012).pdf': 'Shows how to use options to hedge your stock portfolio instead of pure speculation. Covers protective puts, collars, and other strategies that let you stay invested while limiting downside risk.',
  'Dynamic_Hedging-Taleb.pdf': 'Nassim Taleb\'s advanced masterwork on managing options portfolios. Covers real-world hedging of Greeks (delta, gamma, vega, theta), volatility surface trading, and the non-linear risks most traders miss. Written by the man who profited from Black Swan events.',
  'Options_for_Volatile_Markets_Managing.pdf': 'Strategies for trading options in high-volatility environments. Covers how volatility affects option pricing, strategies that benefit from volatility expansion/contraction, and managing positions through turbulent markets.',
  'Sheldon_Natenberg-Option_Volatility_and_Pricing__Advanced_Trading_Strategies_and_Techniques-McGraw-H.pdf': 'THE options bible. Sheldon Natenberg\'s comprehensive guide to option pricing theory, volatility analysis, and advanced trading strategies. Every professional options trader has read this. Covers Black-Scholes, the Greeks, volatility skew, and spread strategies.',
  'Simple_Options_Trading.pdf': 'A straightforward guide to options trading for beginners. Covers calls, puts, basic spreads, and how to use options for income generation and portfolio protection without the complex math.',
  'Ultimate-Strategy-Guide-Option-Alpha-compressed.pdf': 'Option Alpha\'s complete strategy guide covering credit spreads, iron condors, strangles, and other high-probability options strategies. Includes trade management rules, adjustment techniques, and position sizing.',

  // Personal Development
  'Cant_Hurt_Me_-_David_Goggins(1).pdf': 'David Goggins\' raw, unfiltered account of transforming from a broken, overweight man into a Navy SEAL and ultra-endurance athlete. The 40% Rule: when your mind says you\'re done, you\'re only 40% there. A manual for mental toughness that applies directly to trading discipline.',
  'Deep-Work-Cal-Newport-2016-Grand-Central-Publishing-9a88b43326d3a69ad595042a1bacdd55-Annas-Archive.pdf': 'Cal Newport\'s case for focused, distraction-free work as the ultimate competitive advantage. In a world of constant notifications, the ability to do deep, concentrated work on trading analysis, strategy development, or business building is a superpower.',
  'Soft_War.pdf': 'Explores the concept of soft warfare — influence, information warfare, and psychological operations in modern contexts. Relevant to understanding market manipulation, media narratives, and the information landscape around financial markets.',

  // Short Selling
  'Short Selling - Strategies, Risks _ Rewards (2004).pdf': 'Comprehensive guide to short selling covering the mechanics, borrowing shares, margin requirements, short squeeze risk, and strategies for identifying overvalued stocks ripe for shorting.',
  'Short Selling Stocks with ConnorsRSI  (2013).pdf': 'Larry Connors\' quantitative approach to short selling using his proprietary ConnorsRSI indicator. Includes specific entry/exit rules, backtesting results, and position sizing for systematic short selling.',

  // Swing & Trend Trading
  'A_Complete_Guide_to_Trading.pdf': 'Covers the full spectrum of trading from market selection and strategy development through execution and risk management. A complete system-building resource.',
  'Al_Brooks_-_Trading_Price_Action_Trends.pdf': 'Al Brooks\' meticulous analysis of how to read price action during trending markets. Covers how to identify trends, when to enter pullbacks, how to recognize trend exhaustion, and pure price action trading without indicators.',
  'Nail the Market.pdf': 'Actionable strategies for timing market entries and exits. Focuses on high-conviction setups where multiple factors align to create asymmetric risk/reward opportunities.',
  'Oliver_Velez_-_Swing_Trading_Tactics-min_1_1.pdf': 'Oliver Velez\'s tactical swing trading approach. Covers his specific setups for 2-5 day trades, candlestick-based entries, and how to capture the "meat" of a swing move while keeping risk tight.',
  'Tactical_Trend_Trading.pdf': 'A systematic approach to trend following with tactical entries. Covers how to identify emerging trends early, pyramiding into winners, and trailing stops that let trends run.',
  'The_Complete_Trading_Course_-_Wiley.pdf': 'A comprehensive Wiley trading course covering technical analysis, fundamental analysis, risk management, and trading psychology in a structured curriculum.',
  'The_Complete_Turtle_Trader.pdf': 'The story of Richard Dennis\'s famous Turtle Trading experiment — proving that trading can be taught. Reveals the specific trend-following rules the Turtles used to make hundreds of millions. Shows that a simple system with discipline beats complexity.',
  'The_Trend_Following_Bible.pdf': 'A comprehensive guide to trend following as a trading methodology. Covers the philosophy, the systems, the money management, and the psychology of riding trends in any market.',
  'Trading_for_a_Living.pdf': 'Alexander Elder\'s classic combining technical analysis, trading psychology, and money management into one framework. His Triple Screen trading system uses three timeframes to filter trades. A foundational book for any serious trader.',
  'Trend_Trading_Timing_Market_Tides.pdf': 'Covers timing techniques for trend traders — how to identify the start and end of trends, optimal entry points within trends, and when the tide is turning.',

  // Technical Analysis
  'A_Complete_Guide_to_Technical_Trading_Tactics.pdf': 'Full tactical guide to technical analysis covering indicators, pattern recognition, oscillators, and how to combine multiple technical tools into a coherent trading system.',
  'John_J_Murphy_-_Intermarket_Technical_Analysis_-_Trading_Strategies.pdf': 'John Murphy\'s groundbreaking work on how markets are interconnected. Shows how bonds, currencies, commodities, and stocks influence each other and how to use intermarket analysis to anticipate market turns before they happen.',
  'Technical_Analysis.pdf': 'Core technical analysis reference covering chart types, trend analysis, support/resistance, indicators, and the foundational principles of technical trading.',
  'Technical_Analysis_For_Dummies.pdf': 'Accessible introduction to technical analysis for beginners. Covers chart reading, basic indicators, pattern recognition, and how to develop a technical trading approach.',
  'Technical_Analysis_for_the_Trading_Professional_Second_Edition_Strategies_and_Techniques_for_Todays_Turbulent_Global_Constance_Brown.pdf': 'Constance Brown\'s professional-level technical analysis. Covers advanced RSI interpretation, Fibonacci confluence, composite indicators, and institutional-grade analysis techniques most retail traders never learn.',
  'Technical_Analysis_of_Stock_Trends_9th_Edition.pdf': 'Edwards and Magee\'s legendary work — the original "bible" of technical analysis first published in 1948. Covers Dow Theory, chart patterns, trendlines, volume analysis, and the foundational principles the entire field is built on.',
  'The_Art_and_Science_of_Technical_Analysis.pdf': 'Adam Grimes\' modern take on technical analysis backed by rigorous statistical testing. Separates what actually works from market myths and shows how to develop a genuine edge.',
  'Trading_with_Ichimoku_Clouds.pdf': 'Complete guide to Ichimoku Kinko Hyo — the Japanese "one-glance equilibrium chart." Covers the five Ichimoku components, cloud trading strategies, and how this single indicator can replace an entire dashboard of tools.',
  'technical-analysis-masterclass_1.pdf': 'Masterclass-level technical analysis covering advanced pattern analysis, multi-timeframe approaches, and professional chart interpretation.',

  // Trading Psychology
  'Avoiding_Emotional_Trading_1.pdf': 'Practical techniques for removing emotions from trading decisions. Covers common emotional traps — revenge trading, FOMO, fear of pulling the trigger — and specific methods to overcome each one.',
  'Best_Loser_Wins-Tom_Hougaard.pdf': 'Tom Hougaard\'s contrarian take on trading psychology. The best traders are the best losers — they cut losses without ego and let winners run without fear. A mindset shift that separates consistently profitable traders from everyone else.',
  'Disciplined_Trader.pdf': 'Mark Douglas\'s first book on trading psychology. Lays the foundation for understanding why traders sabotage themselves and how to develop the mental discipline required for consistent profitability.',
  'Mark_Douglas_-_Trading_in_the_Zone_complete_and_formatted.pdf': 'Mark Douglas\'s masterpiece on trading psychology. Explains why thinking in probabilities is the key to consistent trading success. Covers the five fundamental truths of trading and how to achieve a carefree state of mind. Arguably the most important trading book ever written.',
  'Trading_in_the_Zone_-_Mark_Douglas.pdf': 'Mark Douglas\'s masterpiece on trading psychology. The key insight: you need to think in probabilities and accept risk to trade without fear. The five fundamental truths of trading that free you from emotional decision-making.',
  'Secrets_of_Successful_Traders_1.pdf': 'Distills the common traits, habits, and mental frameworks shared by consistently profitable traders. Identifies what separates the top performers from the rest.',
  'The_Daily_Trading_Coach_-_PDF_Room.pdf': 'Brett Steenbarger\'s 101 lessons for becoming your own trading coach. Practical daily exercises for improving discipline, managing stress, and developing peak performance habits as a trader.',
  'The_Disciplined_Trader.pdf': 'Mark Douglas\'s foundational work on why discipline is the #1 factor in trading success. Covers mental frameworks for consistent execution and overcoming the psychological barriers to profitability.',
  'The_Mental_Game_of_Trading_A_System_for_Solving_Problems_with_Greed_Fear_Anger_Confidence_and_Discipline_Jared_Tendler_z-lib.org.pdf': 'Jared Tendler applies his mental game coaching (originally for poker pros) to trading. A systematic approach to solving specific psychological problems: greed, fear, anger, overconfidence, and lack of discipline.',
  'The_Psychology_of_Trading_Tools_and_Techniques_for_Minding_the_Markets_by_Brett_Steenbarger.pdf': 'Brett Steenbarger combines clinical psychology with trading to help traders understand and overcome their psychological barriers. Covers cognitive behavioral techniques specifically adapted for market participants.',
  'Trading_Without_Gambling_Develop_a_Game_Plan_for_Ultimate_Trading_Success.pdf': 'Draws the clear line between trading and gambling. Covers how to develop a statistical edge, test it, and execute it with discipline — turning trading from a gamble into a business.',

  // Volume & Market Profile
  'A_Complete_Guide_To_Volume_Price_Analysis-Anna_Coulling.pdf': 'Anna Coulling\'s definitive guide to reading volume alongside price. Shows how to identify smart money accumulation and distribution, spot divergences between price and volume, and use volume to confirm or deny breakouts.',
  'A_Complete_Guide_to_Volume_Price_Analysis_by_Anna_Coulling.pdf': 'Anna Coulling\'s comprehensive VPA method showing how volume reveals institutional intent. When price rises on high volume, it\'s real. When it rises on low volume, it\'s a trap. This book teaches you to read that.',
  'Anna_Couling_Complete_Guide_to_Volume_Price_Analysis_key_points.pdf': 'Condensed key points from Anna Coulling\'s VPA methodology. A quick-reference summary of the most important volume-price relationships and what they signal.',
  'Commitments_of_Traders_Bible.pdf': 'Complete guide to using the weekly COT report — the only data showing what commercial hedgers, large speculators, and small traders are actually positioning. Shows how to read the report and identify major turning points.',
  'Commitments_of_Traders_Strategies_for_Tracking_the_Market_and_Trading_Profitably.pdf': 'Trading strategies built around the COT report. Covers how to track smart money positioning, identify extreme readings, and time entries based on what the biggest players are doing.',
  'Trade_Stocks_and_Commodities_With_the_Insiders_Secrets_of_the_COT_Report.pdf': 'Larry Williams reveals how to use the COT report to trade alongside the insiders. Shows the specific patterns in commercial and speculative positioning that precede major market moves.',
  'Volume-Profile-The-Insiders-Guide-to-TradingTradersLibrary.pdf': 'Inside guide to Volume Profile analysis — understanding where the most trading volume occurs at specific price levels. Covers value areas, point of control, and how to trade using volume-based support and resistance.',
  'Volume_Price_Analysis.pdf': 'Core VPA methodology covering how to interpret volume bars, identify climactic volume events, and read the story that volume tells about institutional buying and selling pressure.',
  'Wiley_Trading_James_F._Dalton_Eric_T._Jones_Robert_B._Dalton_-_Mind_Over_Markets__Power_Trading_with_Market_Generated_Information_Updated_Edition-Wiley_2013.pdf': 'Dalton\'s "Mind Over Markets" — the definitive guide to Market Profile. Explains how markets auction, what the profile reveals about buyer/seller balance, and how to use market-generated information for trading decisions. The gold standard of market profile education.',
};

const voidColors = {
  void: '#000000', carbon: '#111111', graphite: '#1A1A1A',
  amber: '#F59E0B', amberLight: '#FBBF24', amberDark: '#D97706',
  white: '#FFFFFF', silver: '#A3A3A3', smoke: '#737373',
  success: '#10B981', border: '#222222',
};

const cyberColors = {
  void: '#050e07', carbon: '#07120a', graphite: '#0a1a0e',
  amber: '#10ca78', amberLight: '#39ff7e', amberDark: '#0a9e5a',
  white: '#f0f0f0', silver: '#A3A3A3', smoke: '#737373',
  success: '#39ff7e', border: 'rgba(16, 202, 120, 0.2)',
};

// ─── Bobby Axelrod Summaries (pre-generated key takeaways) ──
function getAxelrodSummary(filename: string, title: string, category: string): string {
  // All 161 books should have specific entries — return it
  const specific = AXELROD_SUMMARIES[filename];
  if (specific) return specific;

  // Safety net — should never hit this since all books are covered
  return `I haven't read this one yet. But if it's on this shelf, it's here for a reason. Crack it open, pull out the three most actionable ideas, and test them. Knowledge without execution is just entertainment. And we're not in the entertainment business.`;
}

const AXELROD_SUMMARIES: Record<string, string> = {
  // ── ALGO & QUANT TRADING ──
  'Chen_Jun__Tsang_Edward_-_Detecting_regime_change_in_computational_finance__data_science_machine_learning_and_algorithmic_trading-CRC_Press_2021Z-Lib.io.pdf': `Markets don't stay the same — they shift regimes. Trending becomes mean-reverting, quiet becomes volatile. This book teaches you to DETECT those shifts with machine learning before your P&L does. Key move: the strategy that worked last month might kill you this month. Regime detection is your early warning system.`,
  'Quantitative Finance (2007).pdf': `The math behind the money. Stochastic calculus, derivatives pricing, portfolio optimization — this is the language Wall Street actually speaks. You don't need to be a PhD, but you need to understand why your Black-Scholes model breaks in a crisis. This gives you that.`,

  // ── CFA STUDY MATERIALS ──
  '2018 FinQuiz CFA Level 2 Study Plan.pdf': `CFA Level 2 is where they separate the tourists from the professionals. Equity valuation, fixed income analytics, derivatives — this is the structured path through the material. The credential opens doors, but the knowledge is what keeps you in the room.`,
  '2018 FinQuiz CFA Level 3 Study Plan.pdf': `Level 3 is portfolio management — the endgame. This is where you learn to think like an allocator, not just an analyst. Behavioral finance, wealth planning, institutional investment. The stuff that makes you dangerous in a boardroom.`,
  'CFA_Level1_2018_curriculum_updates.pdf': `Level 1 is the foundation. Ethics, quant methods, economics, financial reporting. Boring? Maybe. Essential? Absolutely. You can't build a skyscraper on sand.`,
  'CFA_Level2_2018_curriculum_updates.pdf': `The Level 2 updates keep the curriculum sharp. Equity valuation and derivatives are where the real edge lives. Stay current or get left behind.`,
  'CFA_Level3_2018_curriculum_updates.pdf': `Portfolio management and private wealth — this is where theory meets the real world. The updates here reflect how the industry actually operates, not how textbooks wish it did.`,

  // ── CANDLESTICKS ──
  '17 Money Making Candle Formations (2008).pdf': `17 patterns, each with entry rules, exit rules, and win rates from real data. No fluff. This is a playbook, not a textbook. Memorize these 17, drill them until they're automatic, and you'll see setups the crowd misses.`,
  '7369608-Mastering-Candlestick-Charts-Part-I.pdf': `Part 1 — the singles and doubles. Doji, hammer, engulfing. These are the building blocks. Master them with volume confirmation and you've got a language the market speaks every single day.`,
  '7369609-Mastering-Candlestick-Charts-Part-2.pdf': `Part 2 — the complex formations. Multi-candle patterns that tell bigger stories. When you combine these with Western indicators, you're playing chess while everyone else plays checkers.`,
  'Beyond_Candlesticks-Steve_Nison.pdf': `Nison goes beyond the basics into Kagi, Renko, and Three-Line Break charts. These Japanese methods filter out noise that candlesticks can't. It's like putting on noise-canceling headphones in a crowded trading floor. Suddenly you hear the signal.`,
  'Candlesticks - The Basics (2000).pdf': `Start here if you're new. Every candle is a story — who showed up, who blinked, who's in control. Once you read candles fluently, you never look at a chart the same way again.`,
  'Candlesticks Every Trader Should Know (2006).pdf': `The greatest hits. Not all 50+ patterns matter — these are the ones that actually show up and actually work. Quality over quantity. Learn these cold and skip the rest.`,
  'Candlesticks for Support and Resistance (2000).pdf': `A reversal candle in the middle of nowhere? Noise. A reversal candle AT a key support level? That's a trade. Context is everything. This book teaches you to read candles where they matter most.`,
  'The_Candlestick_Course-Steve_Nison.pdf': `The workbook companion. Reading about patterns is one thing — drilling them until recognition is instant is another. This turns knowledge into reflex. That speed difference is the edge.`,
  'Top 12 Candlesticks (2000).pdf': `Twelve patterns. That's all you need. The Pareto principle applies to candlesticks — 20% of patterns generate 80% of the signals worth taking. These are that 20%.`,

  // ── CHART PATTERNS ──
  'Chart_Patterns_Support_and_Resistance_Trendlines_.pdf': `The holy trinity of technical analysis: patterns, support/resistance, trendlines. This integrates all three into one framework. When they align, you have a trade. When they conflict, you sit on your hands.`,
  'Chart_Your_Way_to_Profits.pdf': `Practical chart trading — not theory, execution. How to identify the pattern, set the entry, define the stop, and calculate the target. That's a complete trade plan from one chart. Do that consistently and you win.`,
  'Investors_Guide_To_Buying_Stocks_Using_Launch_Pad_Chart_Patterns.pdf': `Launch pad patterns are bases — tight, coiled energy waiting to release. Think of it like a spring compressed to maximum. When it lets go, the move is explosive. This teaches you to spot the compression before the launch.`,
  'Trade_Chart_Patterns_Like_the_Pros.pdf': `The gap between knowing a pattern and profiting from it is execution. Entry timing, position sizing, handling failures — this is the professional playbook for turning pattern knowledge into P&L.`,
  'Trade_What_You_See_How_to_Profit_from_Pattern_Recognition.pdf': `The hardest skill in trading: seeing what IS, not what you WANT to see. Confirmation bias kills more accounts than bad strategy. This teaches objectivity. If you can master that, you're already ahead of 90% of traders.`,
  'Trading_Classic_Chart_Patterns.pdf': `Head and shoulders, double tops, triangles, flags, wedges — the classics never go out of style because human psychology never changes. Each one has statistical edge and proper management rules. Know them.`,
  'Visual_Guide_to_Chart_Patterns.pdf': `Heavy on visuals, annotated charts, clear markups. Pattern recognition is a visual skill — you train it with repetition, not reading. Use this as your flash card deck.`,
  'visual_Guide_to_Chart_Patterns_1.pdf': `More annotated examples across different markets and timeframes. The more charts you study, the faster your pattern recognition becomes. Speed of recognition = edge.`,

  // ── DAY TRADING ──
  '25 Rules Of Day Trading (2003).pdf': `25 rules. Break any three and you're done. The big ones: never risk more than 2% per trade, always use stops, don't revenge trade, and when in doubt, get out. Tape these to your monitor.`,
  'A Complete Guide to Day Trading (2008).pdf': `A to Z — desk setup to system development. The business of day trading, not just the strategy. Most people fail because they treat it like a hobby. This treats it like what it is: a profession.`,
  'After-Hours_Trader.pdf': `The after-hours market is a different animal — thinner, wider spreads, different players. But that's where the edge lives for those who understand the mechanics. Earnings reactions, news plays, gap setups — all born in after-hours.`,
  'Breakout_Trading_Simple_Proven_Strategies.pdf': `Breakouts are the bread and butter. Consolidation, then expansion. The trick is confirmation — volume, retest, momentum. Fake breakouts kill rookies. This teaches you to tell the difference.`,
  'Day Trading Ebook (2000).pdf': `Early-era day trading fundamentals. Level II, order routing, basic scalping. The technology has changed but the principles haven't. Supply, demand, and the speed to act on both.`,
  'Day Trading University (2001).pdf': `Structured like a course. Market mechanics, order types, basic strategies, psychological demands. Before you put real money on the line, go through this program. Paper trading is for amateurs; education is for professionals.`,
  'Daytrading University - Advanced Daytrading Two-Day Seminar (2001).pdf': `The advanced course. Tape reading, momentum strategies, managing multiple positions simultaneously. This is what the seminar costs thousands to attend. You've got it on your shelf.`,
  'High_Probability_Trading_Strategies_Entry_to_Exit_Tactics_for_the_Forex_Futures_and_Stock_Markets.pdf': `Robert Miner's method: multiple timeframe momentum + pattern recognition + Fibonacci = high probability. The complete trade lifecycle — entry trigger, stop placement, target projection, exit management. Complete and systematic.`,
  'High_probability_trading.pdf': `Marcel Link nails the preparation game. Why do most traders lose? Because they show up unprepared. This fixes that. Risk management, systematic thinking, and the discipline to follow the process.`,
  'KEN_WOLFF_-_Trading_On_Momentum_Advanced_Techniques_For_High_Percentage_Day_TRADING-MCGRAW_HILL.pdf': `Wolff's momentum techniques — finding the stocks that are moving NOW, timing the entry for maximum capture, scaling in and out. Momentum trading is about being in the right place at the right time. This teaches you how to be there.`,
  'The_Complete_Guide_to_Day_Trading_-_A_Practical_Manual_from_A_Professional_Day_Trading_Coach.pdf': `Written by a coach, not a guru. Built from real experience watching hundreds of traders succeed and fail. The patterns of failure are more valuable than the patterns of success — because avoiding the former guarantees the latter.`,
  'RICHARD_D_WYCOFF_-_THE_DAY_TRADERS_BIBLE-63_PAGES.pdf': `Wyckoff wrote this over a century ago and it still hits. Tape reading — understanding supply and demand through price and volume in real time. Every electronic order book is just a modern tape. Read it like Wyckoff and you're reading the intentions of every buyer and seller in the market.`,
  'Learn Day Trading (2000).pdf': `First steps. Market basics, order types, chart reading, your first strategy. Everyone starts somewhere. Start here, but don't stay here. The basics are the floor, not the ceiling.`,
  'The Day Trading Course (2000).pdf': `Structured progression from fundamentals through execution. Includes simulated trade scenarios. Practice under controlled conditions before the market teaches you the hard way.`,
  'Winning_the_Day_Trading_Game.pdf': `Trading as a game — preparation, execution, adaptation, scoring. The game metaphor works because the best traders approach it with the same discipline as elite athletes. Prepare, perform, review, improve. Repeat.`,
  'Professional_Trading_Strategies(2).pdf': `Institutional-level setups, order flow analysis, multi-timeframe approaches. This is how the professionals actually trade — not the simplified version they show on YouTube.`,
  'Professional_Trading_Strategies.pdf': `Market structure, price action, systematic approaches used by full-time traders. The difference between amateur and professional isn't the strategy — it's the process around the strategy.`,
  'Technical Analysis for Short Term Traders (2000).pdf': `Not all indicators work on all timeframes. This filters technical analysis for intraday and swing trading specifically. The moving average that works on a daily chart is useless on a 5-minute. Know the difference.`,
  'The Stock Market Course (2001).pdf': `A comprehensive stock market education. Fundamental analysis, technical analysis, options basics, portfolio construction. Think of it as your MBA in markets — without the $200K tuition and the two years of your life.`,
  'Trading on Momentum (2002).pdf': `Relative strength, volume confirmation, timing entries to capture the strongest moves. Momentum isn't about chasing — it's about arriving early and riding the wave. This teaches you the difference.`,
  'Oliver_Kell_-_Victory_in_stock_market.pdf': `Kell won the U.S. Investing Championship. Not theory — results. His process for finding winning stocks, timing entries, and managing risk is documented here. Study what winners do, not what losers teach.`,

  // ── ECONOMIC INDICATORS ──
  'Guide_to_Economic_Indicators.pdf': `Every number the government releases moves markets. This tells you which ones matter, when they drop, and how to position. The traders who understand macro eat the ones who only read charts.`,
  'The Pocketbook of Economic Indicators (2002).pdf': `GDP, employment, inflation, housing, manufacturing — how each fits the bigger picture. Compact but thorough. Keep this on your desk for data release days.`,
  'The_Pocket_Book_Of_Economic_Indicators.pdf': `Quick reference for the numbers that move markets. What to watch, what the consensus expects, and what happens when reality surprises. The spread between expectation and reality — that's where the move lives.`,
  'The_Secrets_of_Economic_Indicators.pdf': `Baumohl teaches you to read the data BEFORE Wall Street prices it in. That's the edge — interpretation speed. By the time CNBC explains the number, the move is over. Read it yourself, react faster.`,
  'The_Traders_Guide_to_Key_Economic_Indicators.pdf': `Written for traders, not economists. Which indicators actually move YOUR markets, how to position ahead of releases, and how to trade the reaction. Practical, not academic.`,
  'Using_Economic_Indicators_to_Improve_Investment_Analysis.pdf': `Leading, lagging, coincident indicators — and how to build a macro framework from them. The economy is the tide. You want to swim WITH it, not against it. This teaches you to read the current.`,

  // ── FIBONACCI & HARMONICS ──
  'Fibonacci_Analysis.pdf': `Retracements, extensions, projections, time analysis, confluence zones. When multiple Fib levels stack at the same price, that's not coincidence — that's institutional interest. This teaches you to find those zones.`,
  'Fibonacci_Trading_How_to_Master_the_Time_and_Price_Advantage.pdf': `Carolyn Boroden — the "Fibonacci Queen." She uses time AND price Fibonacci clusters to pinpoint entries. When time and price converge at a Fib level, the probability spikes. That's precision trading.`,
  'Fibonacci_and_Chart_Pattern_trading_tools.pdf': `Fibonacci + chart patterns = higher probability. A cup-with-handle completing at a 61.8% retracement? That's two independent signals pointing the same direction. Stack the odds.`,
  'Harmonic_Trading_Volume_1.pdf': `Scott Carney's Gartley, Bat, Butterfly, and Crab patterns. Specific Fibonacci ratios define each pattern. When the math lines up, you enter. When it doesn't, you don't. Rules-based, emotion-free.`,
  'Harmonic_Trading_Volume_2.pdf': `Advanced harmonics — Shark, 5-0, alternate bat. Pattern validation, completion zones, and trade management. This is the graduate-level course for those who mastered Volume 1.`,
  'How_To_Identify_High-Profit_Elliott_Wave_Trades_in_Real_Time.pdf': `Elliott Wave theory is complicated. This cuts through the noise to focus on the PROFITABLE wave structures — Wave 3 extensions and Wave C completions. Forget counting every micro-wave. Find the big money moves.`,
  'Robert_Fisher_-_Fibonacci_Applications_and_Strategies_for_Traders.pdf': `Fischer's systematic Fibonacci approach across markets. His unique combination of Fib ratios with candlestick patterns and moving averages creates a multi-confirmation system. More confirmation = higher probability.`,

  // ── FINANCE & INVESTING ──
  'A First Course in Corporate Finance (2006).pdf': `Capital budgeting, valuation, capital structure — this is how companies make financial decisions. Understanding this makes you a better investor because you understand what drives the stocks you're trading.`,
  'Accounting for Decision Making (2011).pdf': `If you can't read a balance sheet, you're trading blind. Income statements, cash flow analysis, ratio analysis — this is the financial literacy that separates investors from gamblers.`,
  'Edwin_LeFevre_Reminiscences_of_a_Stock_Operator.pdf': `Livermore was the GOAT. Made and lost fortunes multiple times. Key lessons that still hit 100 years later: "It never was my thinking that made the big money for me. It always was my sitting." Patience IS the trade. The market will tell you when to move — your job is to shut up and listen. Also: never average down on a loser. Livermore broke that rule and it broke him.`,
  'Financial Accounting and Reporting (2011).pdf': `GAAP, IFRS, revenue recognition, asset valuation — the language of financial reporting. Companies tell you everything in their filings. Most people just don't know how to read it. Now you will.`,
  'Financial Analysis Using Excel  (2002).pdf': `DCF models, sensitivity analysis, scenario planning — all in Excel. The hedge fund associate's toolkit. Build models, stress test assumptions, and make decisions backed by numbers, not feelings.`,
  'Financial Management (1998).pdf': `Capital structure, working capital, investment appraisal. The fundamentals of how businesses manage money. Every company you trade is running these calculations. Understand them and you understand the company.`,
  'Fire Your Stock Analyst - Analysing Stocks on Your Own (2006).pdf': `Stop outsourcing your thinking. Wall Street analysts have conflicts of interest you don't. This teaches you to do your own equity research — read the 10-K, analyze the competition, build your own thesis. Independence is alpha.`,
  'Getting Started in Bonds (2003).pdf': `Bonds drive the world. Treasury yields move EVERYTHING — stocks, forex, commodities. Understanding bonds isn't optional. Duration, yield curves, credit spreads — this is the foundation of macro trading.`,
  'Investments (2003).pdf': `Academic-level: modern portfolio theory, CAPM, efficient markets, valuation. Know the theory so you know when the market is violating it. Those violations are your opportunities.`,
  'Investments (2005).pdf': `Updated with asset allocation, security analysis, performance measurement. The institutional approach to managing money. Think like a fund, not like a retail trader.`,
  'Investments - An Introduction (2014).pdf': `Contemporary introduction covering stocks, bonds, ETFs, real estate, alternatives. The investing landscape has changed — this gives you the modern map.`,
  'Mastering Corporate Finance (2010).pdf': `M&A valuation, LBO modeling, restructuring. This is investment banker territory. Understanding how deals get done gives you an edge in event-driven trading.`,
  'Principles of Economics (2003).pdf': `Supply, demand, monetary policy, fiscal policy, trade. The macro forces that move markets. Ignore economics at your own risk — it's the current your boat is floating on.`,
  'Protecting Your Wealth In Good Times And Bad (2003).pdf': `Making money is one thing. Keeping it is another game entirely. Diversification, tax optimization, estate planning. The smartest trade you'll ever make is protecting what you've already won.`,
  'The Economist - Guide to Investment Strategy (2006).pdf': `Asset allocation, risk budgeting, behavioral biases. From The Economist — no hype, just data-driven strategy. Build a portfolio aligned with your goals, not your emotions.`,
  'The_Economics_of_Money_Banking_and_Financial_Markets.pdf': `Mishkin's bible on how the financial system works. Central banking, money supply, interest rates, monetary transmission. Understanding the Fed isn't optional — it's survival. This is your decoder ring.`,
  'The_Little_Book_of_Bull_Moves_in_Bear_Markets_How_to_keep_your_portfolio_up_when_the_market_is_down.pdf': `Schiff's strategies for bear markets — defensive positioning, short selling, commodities, foreign stocks. The time to learn this is BEFORE the bear market, not during it. Build the ark before the flood.`,
  'The_Little_Book_of_Stock_Market_Cycles_by_Jeffery_Hirsch.pdf': `Seasonal patterns, presidential cycles, calendar effects — backed by decades of data. "Sell in May" isn't folklore, it's statistics. The market has rhythms. This teaches you to hear them.`,
  'The Mathematics Of Financial Modeling And Investment Management (2004).pdf': `Stochastic processes, Monte Carlo simulation, optimization, derivatives math. Heavy? Yes. Necessary? If you want to understand why your models work (and when they'll break), absolutely.`,
  'Understanding Stocks (2004).pdf': `Beginner-friendly but don't skip it. How stocks work, how to evaluate them, how the market operates. Everyone thinks they know this stuff. Most don't. Foundations matter.`,
  'Using Excel for Business Analysis (2012).pdf': `Financial modeling, scenario planning, data visualization in Excel. Your spreadsheet is your cockpit. Master it and you fly blind no more.`,
  'Using the Financial Pages (2006).pdf': `How to read financial news, stock tables, earnings reports. Turns the financial media from noise into actionable intelligence. Most people watch the news. You'll read it for edge.`,
  'William_ONeil_-_How_to_Make_Money_in_Stocks._A_Wining_System_in_Good_Times_or_Bad.pdf': `CAN SLIM. Seven letters that built a fortune. O'Neil's system for finding monster growth stocks: Current earnings, Annual earnings, New products/management, Supply and demand, Leader or laggard, Institutional sponsorship, Market direction. It's a checklist. Run every stock through it. The ones that pass ALL seven? Those are your positions.`,
  'Weinstein_Secrets_to_Profiting_in_Markets_.pdf': `Weinstein's stage analysis is beautifully simple. Stage 1: basing. Stage 2: advancing — this is where you BUY. Stage 3: topping. Stage 4: declining — this is where you SHORT or get out. That's it. Four stages. Know which one you're in, and you'll never hold a stock through a crash again.`,

  // ── FOREX & CURRENCIES ──
  '17 Proven Currency Trading Strategies (2013).pdf': `17 strategies with specific rules. Trend-following, counter-trend, range-bound. The forex market doesn't care about your opinion — it cares about your system. Pick the strategy that fits your personality and execute it religiously.`,
  'Amazing Forex System (2004).pdf': `A mechanical system with defined rules. No discretion, no emotions. Entry rules, exit rules, risk management. The beauty of mechanical systems? They don't panic at 3 AM when the yen is spiking.`,
  'Currency Strategy (2002).pdf': `Institutional-level currency analysis. Fundamental valuation models, flow analysis, central bank impacts. This is how the banks trade forex — not with RSI crosses on a 15-minute chart.`,
  'Essentails of Foreign Exchange Trading (2009).pdf': `Pip calculations, lot sizing, leverage management. The mechanical skills of forex trading. Get these wrong and no strategy on earth will save you. Get them right and you have a foundation.`,
  'Forex - Online Manual for Successful Trading (2000).pdf': `Early comprehensive guide to online forex. Platform basics, technical analysis for currencies, risk management for leveraged trading. The tech has evolved but the leverage will still eat you alive if you're not careful.`,
  'Forex Trading Techniques (2003).pdf': `Technical and fundamental forex techniques. Chart patterns for currencies, news trading, carry trades. Currencies have their own personality — this teaches you to read it.`,
  'Getting Started in Currency Trading (2008).pdf': `How currencies are quoted, reading forex charts, choosing a broker, building a plan. The forex market is the biggest in the world. Respect it or it will humble you faster than any other market.`,
  'Successful Foreign Exchange Dealing  (2001).pdf': `Professional forex dealing — interbank dynamics, order flow, institutional mechanics. This is the other side of your trade. Understanding who's on the other end changes everything.`,
  'Sure Fire Forex Trading (2000).pdf': `Consistency-focused strategies. Money management rules that protect your capital. The goal isn't to hit home runs — it's to show up tomorrow. Capital preservation first, profits second.`,
  'The Forex Market Phenomena (2000).pdf': `Why forex behaves differently from stocks. Central bank-created trends, unique market phenomena, tradeable patterns. The 24-hour market has its own rhythm. This teaches you to dance to it.`,
  'The Forex Trading Course (2008).pdf': `Fundamentals through advanced strategies. Building a complete forex trading plan. A course, not a book — treat it like one. Do the work, build the plan, execute the plan.`,

  // ── FUTURES & COMMODITIES ──
  'Commodities Demystified  (2008).pdf': `How futures contracts work, what drives commodity prices, how to trade gold, oil, grains. Commodities are the raw materials of the economy. Understanding them gives you a macro edge nobody can take away.`,
  'Getting Started in Futures (2005).pdf': `Contract specs, margin requirements, hedging vs speculation. Essential for anyone moving from stocks to futures. The leverage is real, the risk is real, and the opportunity is massive — if you respect the instrument.`,
  'The Four Biggest Mistakes In Futures Trading (2000).pdf': `Overtrading, undercapitalization, no stops, no plan. Four mistakes, four account killers. Short read, potentially the most valuable book on this shelf per word. Read it, memorize it, never make these mistakes.`,

  // ── HEDGE FUNDS ──
  'Create Your Own Hedge Fund (2005).pdf': `Structure, capital raising, strategy selection, risk management, operations. If you're going to run money, you need to run it like a business. This is the blueprint for building that business.`,
  'Getting Started in Hedge Funds (2005).pdf': `Fund structures, strategies, due diligence, performance evaluation. Understand the vehicle before you invest in it — or build one yourself. The hedge fund wrapper is a tool. Use it correctly.`,
  'Hedge Fund Alpha (2009).pdf': `Where does alpha actually come from? Skill, timing, risk management, or just leverage? This examines what drives hedge fund returns. Some of it is real. A lot of it isn't. Know the difference.`,
  'Hedge Funds - Strategies _ Techniques (2003).pdf': `Long/short, global macro, convertible arb, distressed debt, stat arb. The mechanics behind each approach. Every strategy has a sweet spot and a blow-up scenario. Know both before you deploy capital.`,
  'Hedges On Hedge Funds (2005).pdf': `Top managers sharing their insights on running successful funds. Risk management philosophy, strategy adaptation, building something that lasts. The best funds survive drawdowns. This teaches you how.`,
  'Profiting from Hedge Funds (2013).pdf': `Replicate hedge fund strategies in your own portfolio without the 2-and-20 fees. Long/short, merger arb, other strategies — accessible to individual traders. Why pay someone else's Hamptons mortgage?`,
  'The Hedge Fund Book (2010).pdf': `History, strategies, players, regulation. The comprehensive overview. If you want to understand the industry — who the players are, how they think, what drives them — start here.`,
  'The Hedge Fund Course (2005).pdf': `Portfolio construction, performance attribution, risk metrics, manager selection. How institutional allocators evaluate hedge funds. Think like the people writing the checks.`,
  'Trade Like a Hedge Fund (2004).pdf': `Altucher reveals 20 unconventional strategies. Each with rules, backtesting, implementation details. These aren't the strategies everyone knows — that's the point. Edge comes from doing what others don't.`,
  'Visual Guide to Hedge Funds (2014).pdf': `Infographic-style breakdowns of complex strategies. Payoff diagrams, risk characteristics, visual explanations. Sometimes seeing it is faster than reading it. This makes the complex accessible.`,

  // ── OPTIONS ──
  'Sheldon_Natenberg-Option_Volatility_and_Pricing__Advanced_Trading_Strategies_and_Techniques-McGraw-H.pdf': `Every options desk on Wall Street has this book. Natenberg breaks down how options are REALLY priced — not the textbook garbage, the actual mechanics. Key takeaways: volatility is the only variable that matters, the Greeks are your risk dashboard, and selling premium works until it doesn't. Know your Greeks or they'll know you.`,
  'Dynamic_Hedging-Taleb.pdf': `Taleb wrote this before Black Swan made him famous, and honestly it's the better book for traders. This is the manual for managing non-linear risk. Key insight: the risks that blow up accounts are the ones that don't show up in normal distributions. Tail risk isn't theoretical — it's Tuesday. Hedge accordingly.`,
  'Buy and Hedge (2012).pdf': `Use options to PROTECT your stock portfolio, not just speculate. Protective puts, collars, hedged equity. Stay invested, sleep at night. The insurance costs a few percent a year. The alternative is watching a 40% drawdown and panic selling at the bottom.`,
  'Options_for_Volatile_Markets_Managing.pdf': `When VIX spikes, most traders freeze. This teaches you to thrive. Strategies that benefit from vol expansion, position management through turbulence, and how to size for the unknown. Volatility isn't risk — not understanding it is.`,
  'Simple_Options_Trading.pdf': `Calls, puts, basic spreads, income generation. No complex math, just practical application. Options don't have to be complicated. Start simple, execute consistently, add complexity as you grow. The simple strategies make money too.`,
  'Ultimate-Strategy-Guide-Option-Alpha-compressed.pdf': `Credit spreads, iron condors, strangles — high-probability options strategies with specific management rules. Option Alpha's approach: sell premium, manage risk, let probability do the work. It's not sexy, but it's profitable.`,

  // ── PERSONAL DEVELOPMENT ──
  'Cant_Hurt_Me_-_David_Goggins(1).pdf': `Goggins isn't a trader but he trades in the currency that matters most — mental toughness. The 40% rule alone is worth the read: when your mind says quit, you're only at 40%. Apply that to taking losses, sticking to your plan when it's ugly, and showing up at 5 AM when you'd rather sleep. This is the pre-market prep for your soul.`,
  'Deep-Work-Cal-Newport-2016-Grand-Central-Publishing-9a88b43326d3a69ad595042a1bacdd55-Annas-Archive.pdf': `Newport makes the case that deep, focused work is a superpower in an age of distraction. For traders: your analysis quality is directly proportional to your focus quality. Every notification you check during market hours is money you're leaving on the table. Build a fortress around your attention. That's alpha.`,
  'Soft_War.pdf': `Influence, information warfare, psychological operations. Relevant because the market IS an information war. Media narratives, fake breakouts, institutional deception — understanding psychological warfare makes you harder to manipulate. And the market manipulates everyone.`,

  // ── SHORT SELLING ──
  'Short Selling - Strategies, Risks _ Rewards (2004).pdf': `The mechanics, the risks, the short squeeze danger, and strategies for finding overvalued stocks. Making money when everyone else is losing — that's power. But short selling will humble you faster than anything if you don't respect the infinite risk. This teaches you to respect it.`,
  'Short Selling Stocks with ConnorsRSI  (2013).pdf': `Connors' quantitative short selling approach. Specific entry/exit rules, backtesting results, position sizing. Systematic, not emotional. When the model says short, you short. When it says cover, you cover. No opinions required.`,

  // ── SWING & TREND TRADING ──
  'A_Complete_Guide_to_Trading.pdf': `Market selection, strategy development, execution, risk management. A complete system-building resource. The traders who build systems survive. The traders who wing it don't.`,
  'Al_Brooks_-_Trading_Price_Action_Trends.pdf': `Brooks is meticulous to the point of obsession — and that's why he's good. Pure price action, no indicators, just reading what the market is telling you bar by bar during trends. Dense, challenging, and worth every page if you commit to learning it.`,
  'Nail the Market.pdf': `High-conviction setups where multiple factors align. Asymmetric risk/reward opportunities. When everything lines up — pattern, level, momentum, volume — that's when you bet big. This teaches you to recognize those moments.`,
  'Oliver_Velez_-_Swing_Trading_Tactics-min_1_1.pdf': `Velez's tactical approach to 2-5 day trades. Candlestick-based entries, capturing the meat of the swing. Not trying to catch the whole move — just the highest-probability chunk. Take the best part and move on.`,
  'Tactical_Trend_Trading.pdf': `Identify emerging trends early, pyramid into winners, trail stops that let trends run. Systematic trend following with tactical entries. The trend is free money — if you have the patience to ride it.`,
  'The_Complete_Trading_Course_-_Wiley.pdf': `Technical, fundamental, risk management, psychology — all in one structured curriculum. Wiley doesn't mess around. Comprehensive, thorough, and worth the time investment.`,
  'The_Complete_Turtle_Trader.pdf': `Richard Dennis bet a million bucks he could teach anyone to trade. He won that bet. The Turtles proved that a simple trend-following system, executed with discipline, beats genius. The system is in here. But the real lesson? It's not the system — it's having the guts to follow it when you're in a drawdown and everyone thinks you're an idiot.`,
  'The_Trend_Following_Bible.pdf': `The philosophy, the systems, the money management, the psychology of trend following. Trends happen in every market, every timeframe. This is the complete guide to capturing them systematically.`,
  'Trading_for_a_Living.pdf': `Elder's Triple Screen system is elegant: use three timeframes, let the longer timeframe set direction, use the middle for strategy, and the shortest for execution. But the real gem is his psychology framework — the market is a crowd, and crowds are predictable. Just don't become one of them.`,
  'Trend_Trading_Timing_Market_Tides.pdf': `Timing the start and end of trends, optimal entry points within trends, and recognizing when the tide is turning. The money is in the trend. The skill is in the timing.`,

  // ── TECHNICAL ANALYSIS ──
  'A_Complete_Guide_to_Technical_Trading_Tactics.pdf': `Indicators, patterns, oscillators — and how to combine them into a coherent system. Most traders throw indicators on a chart randomly. This teaches you to build a toolkit where each tool has a specific purpose.`,
  'John_J_Murphy_-_Intermarket_Technical_Analysis_-_Trading_Strategies.pdf': `Murphy's masterpiece on market interconnections. Bonds, currencies, commodities, stocks — they're all connected. When bonds break down, stocks follow. When the dollar rallies, commodities fall. Understanding these relationships gives you a 10-second head start on every move.`,
  'Technical_Analysis.pdf': `The core reference. Chart types, trend analysis, support/resistance, indicators. The foundation everything else is built on. Don't skip the fundamentals.`,
  'Technical_Analysis_For_Dummies.pdf': `Accessible? Yes. Dumb? No. Covers chart reading, basic indicators, pattern recognition. Everyone starts somewhere. No shame in starting at the beginning — shame is in staying there.`,
  'Technical_Analysis_for_the_Trading_Professional_Second_Edition_Strategies_and_Techniques_for_Todays_Turbulent_Global_Constance_Brown.pdf': `Constance Brown's professional-level work. Advanced RSI interpretation, Fibonacci confluence, composite indicators. This is what the institutional analysts use that retail traders never learn. The edge is in the details most people skip.`,
  'Technical_Analysis_of_Stock_Trends_9th_Edition.pdf': `Edwards and Magee — the ORIGINAL bible of technical analysis. First published 1948. Dow Theory, chart patterns, trendlines, volume. The entire field is built on this book. Read it like scripture.`,
  'The_Art_and_Science_of_Technical_Analysis.pdf': `Adam Grimes backs up technical analysis with rigorous statistics. What works, what doesn't, and what's just market mythology. This is the scientific method applied to trading. Evidence over belief.`,
  'Trading_with_Ichimoku_Clouds.pdf': `One indicator to replace an entire dashboard. The cloud shows support/resistance, trend direction, momentum, and signal triggers simultaneously. Japanese traders used this for decades before the West caught on. Learn it and simplify your charts.`,
  'technical-analysis-masterclass_1.pdf': `Advanced pattern analysis, multi-timeframe approaches, professional chart interpretation. Masterclass-level means going deeper than the surface — reading the chart's story, not just its patterns.`,

  // ── TRADING PSYCHOLOGY ──
  'Mark_Douglas_-_Trading_in_the_Zone_complete_and_formatted.pdf': `This is THE book. If you only read one thing on this shelf, make it this. Douglas nails the one truth 95% of traders never get: the market doesn't care about your feelings. Key moves — Think in probabilities. Accept the risk BEFORE you enter. Every trade is independent. Your job isn't to be right, it's to follow your edge. The five fundamental truths in here will rewire how you think about every single trade.`,
  'Trading_in_the_Zone_-_Mark_Douglas.pdf': `Douglas figured out what separates winners from losers, and it's not strategy — it's belief structure. The five truths: anything can happen, you don't need to know what happens next, there's a random distribution of wins and losses, an edge is just a probability, every moment is unique. Tattoo that on your forearm.`,
  'Best_Loser_Wins-Tom_Hougaard.pdf': `The title says it all. The best traders aren't the best winners — they're the best losers. Hougaard flips the script: embrace the loss, make it small, make it fast, and move on. The P&L takes care of itself when you stop trying to be right and start trying to be disciplined. This is the book most traders need but won't read because the truth hurts.`,
  'Avoiding_Emotional_Trading_1.pdf': `Revenge trading, FOMO, fear of pulling the trigger — every emotional trap that kills accounts, with specific techniques to overcome each one. Your emotions are the market's best weapon against you. Disarm them.`,
  'Disciplined_Trader.pdf': `Douglas's first book. The foundation for Trading in the Zone. Why traders sabotage themselves and how to develop the mental discipline required. If Zone is the masterpiece, this is the sketches that led to it. Both are essential.`,
  'Secrets_of_Successful_Traders_1.pdf': `The common traits of consistently profitable traders. Spoiler: it's not intelligence or strategy. It's discipline, process, and the ability to take a loss without it affecting the next trade. Simple. Brutally hard.`,
  'The_Daily_Trading_Coach_-_PDF_Room.pdf': `Steenbarger's 101 daily exercises for becoming your own coach. Improving discipline, managing stress, building peak performance habits. One lesson per day. In 101 days, you're a different trader.`,
  'The_Disciplined_Trader.pdf': `Discipline isn't a personality trait — it's a skill. Mark Douglas's framework for building that skill from the ground up. The single most important factor in trading success. Period.`,
  'The_Mental_Game_of_Trading_A_System_for_Solving_Problems_with_Greed_Fear_Anger_Confidence_and_Discipline_Jared_Tendler_z-lib.org.pdf': `Tendler coached poker pros to World Series wins, then brought the same system to trading. A systematic approach to solving SPECIFIC psychological problems — not vague "be disciplined" advice. Greed, fear, anger, overconfidence — each gets its own diagnosis and treatment. This is psychology with a prescription.`,
  'The_Psychology_of_Trading_Tools_and_Techniques_for_Minding_the_Markets_by_Brett_Steenbarger.pdf': `Clinical psychology meets trading. Steenbarger combines cognitive behavioral techniques with market experience. Understanding WHY you make the mistakes you make is the first step to not making them again.`,
  'Trading_Without_Gambling_Develop_a_Game_Plan_for_Ultimate_Trading_Success.pdf': `The line between trading and gambling is a plan. This book draws that line clearly. Statistical edge, testing, disciplined execution. Trading is a business. Gambling is entertainment. Choose one.`,

  // ── VOLUME & MARKET PROFILE ──
  'A_Complete_Guide_To_Volume_Price_Analysis-Anna_Coulling.pdf': `Coulling's VPA method: when price rises on high volume, it's real. When it rises on low volume, it's a trap. This teaches you to spot smart money accumulation and distribution before the move happens. Volume is the one indicator that doesn't lie.`,
  'A_Complete_Guide_to_Volume_Price_Analysis_by_Anna_Coulling.pdf': `The comprehensive VPA guide. Institutional intent revealed through volume. When you see the big players loading up, you follow. When you see them distributing, you step aside. Simple concept, powerful execution.`,
  'Anna_Couling_Complete_Guide_to_Volume_Price_Analysis_key_points.pdf': `The cheat sheet. Key volume-price relationships distilled into quick reference. Pin this to your monitor. When price does X and volume does Y, you do Z. No thinking required.`,
  'Commitments_of_Traders_Bible.pdf': `The COT report — the ONLY public data showing what commercials, large specs, and small traders are actually doing. When commercials are extreme one way, the market turns the other. It's the closest thing to insider information that's legal.`,
  'Commitments_of_Traders_Strategies_for_Tracking_the_Market_and_Trading_Profitably.pdf': `Trading strategies built on COT data. Track smart money positioning, identify extreme readings, time entries based on what the biggest players are doing. Why guess when you can follow the money?`,
  'Trade_Stocks_and_Commodities_With_the_Insiders_Secrets_of_the_COT_Report.pdf': `Larry Williams on using COT data to trade alongside the insiders. The specific patterns in commercial and speculative positioning that precede major moves. This is legal insider trading. Use it.`,
  'Volume-Profile-The-Insiders-Guide-to-TradingTradersLibrary.pdf': `Volume Profile — where the most trading occurs at specific price levels. Value areas, point of control, high-volume nodes. These are the levels institutional traders defend. Know them and you're trading at the same table.`,
  'Volume_Price_Analysis.pdf': `Core VPA — reading volume bars, identifying climactic events, understanding the story volume tells. Every big move starts with volume. Every fake move happens without it. This teaches you to see the difference.`,
  'Wiley_Trading_James_F._Dalton_Eric_T._Jones_Robert_B._Dalton_-_Mind_Over_Markets__Power_Trading_with_Market_Generated_Information_Updated_Edition-Wiley_2013.pdf': `Dalton's "Mind Over Markets" — THE definitive Market Profile guide. How markets auction, what the profile reveals about balance and imbalance, and how to trade using market-generated information. If the market is telling you a story, Market Profile is the language it's speaking in.`,

  // ── DAY TRADING CLASSICS ──
  'mastering-the-trade.pdf': `John Carter's squeeze setup alone is worth the price of admission. When Bollinger Bands go inside Keltner Channels, the market is coiling. When it releases, you ride. But beyond the setups, Carter teaches the business of trading — managing risk, position sizing, and knowing when the market is giving you nothing. Those days you don't trade? Those are your most profitable days.`,
  'epdf.pub_street-smarts-high-probability-short-term-trading-strategies.pdf': `Connors and Raschke packed 20+ strategies with SPECIFIC rules into this book. No hand-waving, no "use your judgment." Entry at X, stop at Y, target at Z. That's what separates this from 90% of trading books. The Holy Grail setup and the Turtle Soup pattern alone have paid for this book a thousand times over.`,
  'Encyclopedia_Of_Chart_Patterns_2nd_Edition.pdf': `Bulkowski did what nobody else bothered to do — he backtested every chart pattern with real data. This isn't theory, it's stats. Head and shoulders works 83% of the time. Double bottoms, 78%. But here's the kicker: the failure rates are just as important as the success rates. Know both, and you have an edge nobody can take from you.`,
  'Japanese_Candlestick_Charting_Techniques-Steve_Nison.pdf': `Nison brought these techniques from Japan to Wall Street and changed the game. Every candle is a battle between buyers and sellers. A hammer at support isn't just a pattern — it's fear capitulating. A doji at resistance is indecision turning to panic. Read the psychology behind the wax, and you're reading the room.`,
  'LARRY_WILLIAMS_-_LONG_TERM_SECRETS_FOR_SHORT_TERM_TRADING.pdf': `Williams turned $10K into $1.1 million in one year. That's not theory — that's execution. His secret? Large sample size thinking, proper position sizing, and trading patterns that have edge over hundreds of occurrences. This isn't about one killer trade. It's about a thousand good ones.`,
};

export default function FinanceLibraryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedTab, setExpandedTab] = useState<Record<string, 'about' | 'summarize'>>({});
  const [colorMode, setColorMode] = useState<'void' | 'cyber'>('void');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dbtech-color-mode');
      if (stored === 'cyber') setColorMode('cyber');
    } catch {}
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('dbtech-color-mode');
        setColorMode(stored === 'cyber' ? 'cyber' : 'void');
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 500);
    return () => { window.removeEventListener('storage', handleStorage); clearInterval(interval); };
  }, []);

  const b = colorMode === 'cyber' ? cyberColors : voidColors;

  useEffect(() => {
    fetch('/api/books')
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setCategories(data.categories);
          setTotalBooks(data.totalBooks);
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load library'); setLoading(false); });
  }, []);

  const filteredCategories = categories
    .map(cat => ({
      ...cat,
      books: cat.books.filter(book => {
        const matchesCategory = !activeCategory || cat.name === activeCategory;
        if (!matchesCategory) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.category.toLowerCase().includes(q) ||
          book.filename.toLowerCase().includes(q)
        );
      }),
    }))
    .filter(cat => cat.books.length > 0);

  const filteredTotal = filteredCategories.reduce((sum, c) => sum + c.books.length, 0);

  if (loading) {
    return (
      <div style={{ padding: '60px 30px', textAlign: 'center', color: b.smoke }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: b.amber }}>Loading Finance Library...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px 30px', textAlign: 'center', color: '#ef4444' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 30px', maxWidth: '1400px' }}>
      <style>{`@keyframes bookSpin { to { transform: rotate(360deg); } }`}</style>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          fontSize: '28px', fontWeight: 700, color: b.white,
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          textTransform: 'uppercase', letterSpacing: '-0.02em',
        }}>
          Finance Library
        </div>
        <div style={{ color: b.smoke, marginTop: '4px', fontSize: '14px' }}>
          {totalBooks} books across {categories.length} categories
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search books, authors, categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: '500px', padding: '12px 16px',
            background: b.carbon, border: `1px solid ${b.border}`,
            borderRadius: '8px', color: b.white, fontSize: '14px',
            outline: 'none', fontFamily: "'JetBrains Mono', monospace",
          }}
        />
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            border: `1px solid ${!activeCategory ? b.amber : b.border}`,
            background: !activeCategory ? b.amber : 'transparent',
            color: !activeCategory ? b.void : b.smoke,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          All ({totalBooks})
        </button>
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              border: `1px solid ${activeCategory === cat.name ? (CATEGORY_COLORS[cat.name] || b.amber) : b.border}`,
              background: activeCategory === cat.name ? (CATEGORY_COLORS[cat.name] || b.amber) : 'transparent',
              color: activeCategory === cat.name ? '#fff' : b.smoke,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {cat.name} ({cat.books.length})
          </button>
        ))}
      </div>

      {/* Results count */}
      {(search || activeCategory) && (
        <div style={{ marginBottom: '16px', fontSize: '13px', color: b.smoke }}>
          Showing {filteredTotal} of {totalBooks} books
          {activeCategory && <span> in <strong style={{ color: CATEGORY_COLORS[activeCategory] || b.amber }}>{activeCategory}</strong></span>}
          {search && <span> matching &quot;{search}&quot;</span>}
        </div>
      )}

      {/* Books by Category */}
      {filteredCategories.map(cat => (
        <div key={cat.name} style={{ marginBottom: '40px' }}>
          {/* Category Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '4px', height: '24px', borderRadius: '2px',
              background: CATEGORY_COLORS[cat.name] || b.amber,
            }} />
            <h2 style={{
              fontSize: '18px', fontWeight: 700, color: b.white, margin: 0,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
            }}>
              {cat.name}
            </h2>
            <span style={{
              fontSize: '11px', color: b.smoke, fontFamily: "'JetBrains Mono', monospace",
              background: b.graphite, padding: '2px 8px', borderRadius: '4px',
            }}>
              {cat.books.length}
            </span>
          </div>

          {/* Category Description */}
          {CATEGORY_DESCRIPTIONS[cat.name] && (
            <div style={{ fontSize: '13px', color: b.smoke, marginBottom: '16px', marginLeft: '16px' }}>
              {CATEGORY_DESCRIPTIONS[cat.name]}
            </div>
          )}

          {/* Book Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
          }}>
            {cat.books.map(book => {
              const catColor = CATEGORY_COLORS[book.category] || b.amber;
              const currentTab = expandedTab[book.path];
              const isExpanded = !!currentTab;
              const isPdf = book.filename.toLowerCase().endsWith('.pdf');

              return (
                <div
                  key={book.path}
                  style={{
                    background: b.carbon,
                    border: `1px solid ${isExpanded ? catColor : b.border}`,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Book Cover */}
                  <a
                    href={`/api/books?file=${encodeURIComponent(book.path)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <BookCover
                      pdfUrl={`/api/books?file=${encodeURIComponent(book.path)}`}
                      fallbackColor={catColor}
                      title={book.title}
                      author={book.author}
                      year={book.year}
                      isPdf={isPdf}
                    />
                  </a>

                  {/* Book Info — flex-grow pushes buttons to bottom */}
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{
                      fontSize: '12px', fontWeight: 600, color: b.silver,
                      lineHeight: '1.3', marginBottom: '4px',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                      minHeight: '32px',
                    }}>
                      {book.title}
                    </div>
                    <div style={{ fontSize: '11px', color: book.author ? b.smoke : 'transparent', marginBottom: '6px', userSelect: book.author ? 'auto' : 'none' }}>
                      {book.author || '\u00A0'}
                    </div>

                    {/* Spacer pushes buttons to bottom of card */}
                    <div style={{ flex: 1 }} />

                    {/* Tab Buttons — About & Summarize side by side */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setExpandedTab(prev => {
                            const copy = { ...prev };
                            if (copy[book.path] === 'about') { delete copy[book.path]; } else { copy[book.path] = 'about'; }
                            return copy;
                          });
                        }}
                        style={{
                          flex: 1, padding: '6px',
                          background: currentTab === 'about' ? `${catColor}22` : b.graphite,
                          border: `1px solid ${currentTab === 'about' ? catColor : b.border}`,
                          borderRadius: '6px', cursor: 'pointer',
                          color: currentTab === 'about' ? catColor : b.smoke,
                          fontSize: '10px', fontWeight: 600,
                          fontFamily: "'Space Grotesk', sans-serif",
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '3px',
                          transition: 'all 0.15s',
                        }}
                      >
                        📖 About
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setExpandedTab(prev => {
                            const copy = { ...prev };
                            if (copy[book.path] === 'summarize') { delete copy[book.path]; } else { copy[book.path] = 'summarize'; }
                            return copy;
                          });
                        }}
                        style={{
                          flex: 1, padding: '6px',
                          background: currentTab === 'summarize' ? `${catColor}22` : b.graphite,
                          border: `1px solid ${currentTab === 'summarize' ? catColor : b.border}`,
                          borderRadius: '6px', cursor: 'pointer',
                          color: currentTab === 'summarize' ? catColor : b.smoke,
                          fontSize: '10px', fontWeight: 600,
                          fontFamily: "'Space Grotesk', sans-serif",
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '3px',
                          transition: 'all 0.15s',
                        }}
                      >
                        🪓 Axe Take
                      </button>
                    </div>

                    {/* About Panel */}
                    {currentTab === 'about' && (
                      <div style={{
                        marginTop: '10px', padding: '10px',
                        background: b.graphite, borderRadius: '6px',
                        fontSize: '12px', lineHeight: '1.5', color: b.silver,
                      }}>
                        <div style={{ marginBottom: '6px' }}>
                          <span style={{ color: b.smoke, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</span>
                          <div style={{ color: catColor, fontWeight: 600 }}>{book.category}</div>
                        </div>
                        {book.author && (
                          <div style={{ marginBottom: '6px' }}>
                            <span style={{ color: b.smoke, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Author</span>
                            <div>{book.author}</div>
                          </div>
                        )}
                        {book.year && (
                          <div style={{ marginBottom: '6px' }}>
                            <span style={{ color: b.smoke, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Published</span>
                            <div>{book.year}</div>
                          </div>
                        )}
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ color: b.smoke, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>About This Book</span>
                          <div style={{ color: b.silver, lineHeight: '1.6' }}>
                            {BOOK_DESCRIPTIONS[book.filename] || `Part of the ${book.category} collection. Click to open and explore.`}
                          </div>
                        </div>
                        <a
                          href={`/api/books?file=${encodeURIComponent(book.path)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'block', textAlign: 'center',
                            padding: '8px', borderRadius: '6px',
                            background: catColor, color: '#fff',
                            textDecoration: 'none', fontWeight: 700,
                            fontSize: '12px',
                          }}
                        >
                          {isPdf ? 'Open PDF' : 'Play Audio'}
                        </a>
                      </div>
                    )}

                    {/* Summarize Panel — Bobby Axelrod style */}
                    {currentTab === 'summarize' && (
                      <div style={{
                        marginTop: '10px', padding: '12px',
                        background: b.graphite, borderRadius: '6px',
                        fontSize: '12px', lineHeight: '1.6', color: b.silver,
                        borderLeft: `3px solid ${catColor}`,
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          marginBottom: '8px', fontSize: '10px', fontWeight: 700,
                          color: catColor, textTransform: 'uppercase', letterSpacing: '1px',
                        }}>
                          🪓 AXE&apos;S TAKE
                        </div>
                        <div style={{ color: b.silver, lineHeight: '1.7', fontStyle: 'italic' }}>
                          {getAxelrodSummary(book.filename, book.title, book.category)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div style={{ marginTop: '40px', textAlign: 'center', color: b.smoke, fontSize: '13px', paddingBottom: '40px' }}>
        <p>{totalBooks} books | {categories.length} categories | Finance Library v1.0</p>
      </div>
    </div>
  );
}
