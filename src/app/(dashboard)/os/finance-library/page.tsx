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

export default function FinanceLibraryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
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
              const isExpanded = expandedBook === book.path;
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

                  {/* Book Info Below Cover */}
                  <div style={{ padding: '12px' }}>
                    <div style={{
                      fontSize: '12px', fontWeight: 600, color: b.silver,
                      lineHeight: '1.3', marginBottom: '4px',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                    }}>
                      {book.title}
                    </div>
                    {book.author && (
                      <div style={{ fontSize: '11px', color: b.smoke, marginBottom: '6px' }}>
                        {book.author}
                      </div>
                    )}

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setExpandedBook(isExpanded ? null : book.path);
                      }}
                      style={{
                        width: '100%', padding: '6px', marginTop: '4px',
                        background: isExpanded ? `${catColor}22` : b.graphite,
                        border: `1px solid ${isExpanded ? catColor : b.border}`,
                        borderRadius: '6px', cursor: 'pointer',
                        color: isExpanded ? catColor : b.smoke,
                        fontSize: '11px', fontWeight: 600,
                        fontFamily: "'Space Grotesk', sans-serif",
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '4px',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s', display: 'inline-block',
                      }}>
                        &#9660;
                      </span>
                      {isExpanded ? 'Less' : 'About'}
                    </button>

                    {/* Expanded Info */}
                    {isExpanded && (
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
