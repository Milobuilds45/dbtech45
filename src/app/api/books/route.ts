import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BOOKS_DIR = 'C:\\Users\\derek\\OneDrive\\Desktop\\books';

// Known author mappings from filename patterns we can confidently extract
const KNOWN_AUTHORS: Record<string, string> = {
  'Beyond_Candlesticks-Steve_Nison.pdf': 'Steve Nison',
  'Japanese_Candlestick_Charting_Techniques-Steve_Nison.pdf': 'Steve Nison',
  'The_Candlestick_Course-Steve_Nison.pdf': 'Steve Nison',
  'Edwin_LeFevre_Reminiscences_of_a_Stock_Operator.pdf': 'Edwin LeFevre',
  'Al_Brooks_-_Trading_Price_Action_Trends.pdf': 'Al Brooks',
  'Oliver_Velez_-_Swing_Trading_Tactics-min_1_1.pdf': 'Oliver Velez',
  'Mark_Douglas_-_Trading_in_the_Zone_complete_and_formatted.pdf': 'Mark Douglas',
  'Trading_in_the_Zone_-_Mark_Douglas.pdf': 'Mark Douglas',
  'John_J_Murphy_-_Intermarket_Technical_Analysis_-_Trading_Strategies.pdf': 'John J. Murphy',
  'KEN_WOLFF_-_Trading_On_Momentum_Advanced_Techniques_For_High_Percentage_Day_TRADING-MCGRAW_HILL.pdf': 'Ken Wolff',
  'LARRY_WILLIAMS_-_LONG_TERM_SECRETS_FOR_SHORT_TERM_TRADING.pdf': 'Larry Williams',
  'RICHARD_D_WYCOFF_-_THE_DAY_TRADERS_BIBLE-63_PAGES.pdf': 'Richard D. Wyckoff',
  'Robert_Fisher_-_Fibonacci_Applications_and_Strategies_for_Traders.pdf': 'Robert Fischer',
  'Sheldon_Natenberg-Option_Volatility_and_Pricing__Advanced_Trading_Strategies_and_Techniques-McGraw-H.pdf': 'Sheldon Natenberg',
  'Dynamic_Hedging-Taleb.pdf': 'Nassim Nicholas Taleb',
  'Best_Loser_Wins-Tom_Hougaard.pdf': 'Tom Hougaard',
  'Cant_Hurt_Me_-_David_Goggins(1).pdf': 'David Goggins',
  'Deep-Work-Cal-Newport-2016-Grand-Central-Publishing-9a88b43326d3a69ad595042a1bacdd55-Annas-Archive.pdf': 'Cal Newport',
  'A_Complete_Guide_To_Volume_Price_Analysis-Anna_Coulling.pdf': 'Anna Coulling',
  'A_Complete_Guide_to_Volume_Price_Analysis_by_Anna_Coulling.pdf': 'Anna Coulling',
  'Anna_Couling_Complete_Guide_to_Volume_Price_Analysis_key_points.pdf': 'Anna Coulling',
  'The_Psychology_of_Trading_Tools_and_Techniques_for_Minding_the_Markets_by_Brett_Steenbarger.pdf': 'Brett Steenbarger',
  'The_Mental_Game_of_Trading_A_System_for_Solving_Problems_with_Greed_Fear_Anger_Confidence_and_Discipline_Jared_Tendler_z-lib.org.pdf': 'Jared Tendler',
  'William_ONeil_-_How_to_Make_Money_in_Stocks._A_Wining_System_in_Good_Times_or_Bad.pdf': 'William O\'Neil',
  'Oliver_Kell_-_Victory_in_stock_market.pdf': 'Oliver Kell',
  'Wiley_Trading_James_F._Dalton_Eric_T._Jones_Robert_B._Dalton_-_Mind_Over_Markets__Power_Trading_with_Market_Generated_Information_Updated_Edition-Wiley_2013.pdf': 'James F. Dalton',
  'Chen_Jun__Tsang_Edward_-_Detecting_regime_change_in_computational_finance__data_science_machine_learning_and_algorithmic_trading-CRC_Press_2021Z-Lib.io.pdf': 'Chen Jun & Edward Tsang',
  'Technical_Analysis_for_the_Trading_Professional_Second_Edition_Strategies_and_Techniques_for_Todays_Turbulent_Global_Constance_Brown.pdf': 'Constance Brown',
  'The_Little_Book_of_Stock_Market_Cycles_by_Jeffery_Hirsch.pdf': 'Jeffrey Hirsch',
  'Fibonacci_Trading_How_to_Master_the_Time_and_Price_Advantage.pdf': 'Carolyn Boroden',
  'The_Daily_Trading_Coach_-_PDF_Room.pdf': 'Brett Steenbarger',
  'Weinstein_Secrets_to_Profiting_in_Markets_.pdf': 'Stan Weinstein',
  'The_Secrets_of_Economic_Indicators.pdf': 'Bernard Baumohl',
  'epdf.pub_street-smarts-high-probability-short-term-trading-strategies.pdf': 'Laurence Connors & Linda Raschke',
  'mastering-the-trade.pdf': 'John Carter',
  'The_Economics_of_Money_Banking_and_Financial_Markets.pdf': 'Frederic Mishkin',
};

// Known clean titles for filenames that don't parse well
const KNOWN_TITLES: Record<string, string> = {
  'Beyond_Candlesticks-Steve_Nison.pdf': 'Beyond Candlesticks',
  'Japanese_Candlestick_Charting_Techniques-Steve_Nison.pdf': 'Japanese Candlestick Charting Techniques',
  'The_Candlestick_Course-Steve_Nison.pdf': 'The Candlestick Course',
  'Edwin_LeFevre_Reminiscences_of_a_Stock_Operator.pdf': 'Reminiscences of a Stock Operator',
  'Al_Brooks_-_Trading_Price_Action_Trends.pdf': 'Trading Price Action Trends',
  'Oliver_Velez_-_Swing_Trading_Tactics-min_1_1.pdf': 'Swing Trading Tactics',
  'Mark_Douglas_-_Trading_in_the_Zone_complete_and_formatted.pdf': 'Trading in the Zone',
  'Trading_in_the_Zone_-_Mark_Douglas.pdf': 'Trading in the Zone',
  'John_J_Murphy_-_Intermarket_Technical_Analysis_-_Trading_Strategies.pdf': 'Intermarket Technical Analysis',
  'KEN_WOLFF_-_Trading_On_Momentum_Advanced_Techniques_For_High_Percentage_Day_TRADING-MCGRAW_HILL.pdf': 'Trading On Momentum',
  'LARRY_WILLIAMS_-_LONG_TERM_SECRETS_FOR_SHORT_TERM_TRADING.pdf': 'Long Term Secrets for Short Term Trading',
  'RICHARD_D_WYCOFF_-_THE_DAY_TRADERS_BIBLE-63_PAGES.pdf': 'The Day Trader\'s Bible',
  'Robert_Fisher_-_Fibonacci_Applications_and_Strategies_for_Traders.pdf': 'Fibonacci Applications and Strategies for Traders',
  'Sheldon_Natenberg-Option_Volatility_and_Pricing__Advanced_Trading_Strategies_and_Techniques-McGraw-H.pdf': 'Option Volatility and Pricing',
  'Dynamic_Hedging-Taleb.pdf': 'Dynamic Hedging',
  'Best_Loser_Wins-Tom_Hougaard.pdf': 'Best Loser Wins',
  'Cant_Hurt_Me_-_David_Goggins(1).pdf': 'Can\'t Hurt Me',
  'Deep-Work-Cal-Newport-2016-Grand-Central-Publishing-9a88b43326d3a69ad595042a1bacdd55-Annas-Archive.pdf': 'Deep Work',
  'A_Complete_Guide_To_Volume_Price_Analysis-Anna_Coulling.pdf': 'A Complete Guide to Volume Price Analysis',
  'A_Complete_Guide_to_Volume_Price_Analysis_by_Anna_Coulling.pdf': 'A Complete Guide to Volume Price Analysis',
  'Anna_Couling_Complete_Guide_to_Volume_Price_Analysis_key_points.pdf': 'Volume Price Analysis - Key Points',
  'William_ONeil_-_How_to_Make_Money_in_Stocks._A_Wining_System_in_Good_Times_or_Bad.pdf': 'How to Make Money in Stocks',
  'Oliver_Kell_-_Victory_in_stock_market.pdf': 'Victory in the Stock Market',
  'Wiley_Trading_James_F._Dalton_Eric_T._Jones_Robert_B._Dalton_-_Mind_Over_Markets__Power_Trading_with_Market_Generated_Information_Updated_Edition-Wiley_2013.pdf': 'Mind Over Markets',
  'Chen_Jun__Tsang_Edward_-_Detecting_regime_change_in_computational_finance__data_science_machine_learning_and_algorithmic_trading-CRC_Press_2021Z-Lib.io.pdf': 'Detecting Regime Change in Computational Finance',
  'Technical_Analysis_for_the_Trading_Professional_Second_Edition_Strategies_and_Techniques_for_Todays_Turbulent_Global_Constance_Brown.pdf': 'Technical Analysis for the Trading Professional',
  'The_Little_Book_of_Stock_Market_Cycles_by_Jeffery_Hirsch.pdf': 'The Little Book of Stock Market Cycles',
  'The_Mental_Game_of_Trading_A_System_for_Solving_Problems_with_Greed_Fear_Anger_Confidence_and_Discipline_Jared_Tendler_z-lib.org.pdf': 'The Mental Game of Trading',
  'The_Psychology_of_Trading_Tools_and_Techniques_for_Minding_the_Markets_by_Brett_Steenbarger.pdf': 'The Psychology of Trading',
  'The_Daily_Trading_Coach_-_PDF_Room.pdf': 'The Daily Trading Coach',
  'Fibonacci_Trading_How_to_Master_the_Time_and_Price_Advantage.pdf': 'Fibonacci Trading: How to Master the Time and Price Advantage',
  'The_Little_Book_of_Bull_Moves_in_Bear_Markets_How_to_keep_your_portfolio_up_when_the_market_is_down.pdf': 'The Little Book of Bull Moves in Bear Markets',
  'High_Probability_Trading_Strategies_Entry_to_Exit_Tactics_for_the_Forex_Futures_and_Stock_Markets.pdf': 'High Probability Trading Strategies',
  'Trading_Without_Gambling_Develop_a_Game_Plan_for_Ultimate_Trading_Success.pdf': 'Trading Without Gambling',
  'The_Complete_Guide_to_Day_Trading_-_A_Practical_Manual_from_A_Professional_Day_Trading_Coach.pdf': 'The Complete Guide to Day Trading',
  'Weinstein_Secrets_to_Profiting_in_Markets_.pdf': 'Secrets to Profiting in Bull and Bear Markets',
  'The_Economics_of_Money_Banking_and_Financial_Markets.pdf': 'The Economics of Money, Banking, and Financial Markets',
  'epdf.pub_street-smarts-high-probability-short-term-trading-strategies.pdf': 'Street Smarts: High Probability Short-Term Trading Strategies',
  'mastering-the-trade.pdf': 'Mastering the Trade',
  'The_Secrets_of_Economic_Indicators.pdf': 'The Secrets of Economic Indicators',
  'Ultimate-Strategy-Guide-Option-Alpha-compressed.pdf': 'Ultimate Strategy Guide - Option Alpha',
  'Volume-Profile-The-Insiders-Guide-to-TradingTradersLibrary.pdf': 'Volume Profile: The Insider\'s Guide to Trading',
  '7369608-Mastering-Candlestick-Charts-Part-I.pdf': 'Mastering Candlestick Charts - Part I',
  '7369609-Mastering-Candlestick-Charts-Part-2.pdf': 'Mastering Candlestick Charts - Part II',
  'Unlearn_101_Simple_Truths_for_a_Better_Life.mp3': 'Unlearn: 101 Simple Truths for a Better Life',
  'technical-analysis-masterclass_1.pdf': 'Technical Analysis Masterclass',
  'Candlesticks - The Basics (2000).pdf': 'Candlesticks: The Basics',
  'Candlesticks for Support and Resistance (2000).pdf': 'Candlesticks for Support and Resistance',
  'Daytrading University - Advanced Daytrading Two-Day Seminar (2001).pdf': 'Advanced Day Trading Two-Day Seminar',
  'Fire Your Stock Analyst - Analysing Stocks on Your Own (2006).pdf': 'Fire Your Stock Analyst',
  'Hedge Funds - Strategies _ Techniques (2003).pdf': 'Hedge Funds: Strategies & Techniques',
  'Short Selling - Strategies, Risks _ Rewards (2004).pdf': 'Short Selling: Strategies, Risks & Rewards',
  'Forex - Online Manual for Successful Trading (2000).pdf': 'Forex: Online Manual for Successful Trading',
  'The Mathematics Of Financial Modeling And Investment Management (2004).pdf': 'The Mathematics of Financial Modeling and Investment Management',
  'The_Disciplined_Trader.pdf': 'The Disciplined Trader',
  'Disciplined_Trader.pdf': 'The Disciplined Trader',
  'Professional_Trading_Strategies(2).pdf': 'Professional Trading Strategies',
  'Professional_Trading_Strategies.pdf': 'Professional Trading Strategies',
  'visual_Guide_to_Chart_Patterns_1.pdf': 'Visual Guide to Chart Patterns',
  'Visual_Guide_to_Chart_Patterns.pdf': 'Visual Guide to Chart Patterns',
  'Trading on Momentum (2002).pdf': 'Trading on Momentum',
};

function parseBookInfo(filename: string) {
  // Use known title/author if available
  const knownTitle = KNOWN_TITLES[filename];
  const knownAuthor = KNOWN_AUTHORS[filename] || '';

  if (knownTitle) {
    const yearMatch = filename.match(/\((\d{4})\)/);
    return { title: knownTitle, author: knownAuthor, year: yearMatch ? yearMatch[1] : '', filename };
  }

  // Fallback: clean up the filename into a readable title
  const name = filename.replace(/\.pdf$/i, '').replace(/\.mp3$/i, '');

  let title = name
    .replace(/_/g, ' ')
    .replace(/\s*\(\d{4}\)\s*/g, '')
    .replace(/\s*\(\d+\)\s*$/, '')
    .replace(/\s*z-lib\.org\s*/gi, '')
    .replace(/\s*Z-Lib\.io\s*/gi, '')
    .replace(/\s*Annas-Archive\s*/gi, '')
    .replace(/\s*PDF Room\s*/gi, '')
    .replace(/\s*compressed\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const yearMatch = name.match(/\((\d{4})\)/);
  const year = yearMatch ? yearMatch[1] : '';

  return { title, author: knownAuthor, year, filename };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file');

    // If file param is present, serve the PDF
    if (filePath) {
      const fullPath = path.join(BOOKS_DIR, filePath);
      // Security: ensure the resolved path is within BOOKS_DIR
      const resolved = path.resolve(fullPath);
      if (!resolved.startsWith(path.resolve(BOOKS_DIR))) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
      }
      if (!fs.existsSync(resolved)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      const fileBuffer = fs.readFileSync(resolved);
      const ext = path.extname(resolved).toLowerCase();
      const contentType = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${path.basename(resolved)}"`,
        },
      });
    }

    // Otherwise, list all categories and books
    if (!fs.existsSync(BOOKS_DIR)) {
      return NextResponse.json({ error: 'Books directory not found' }, { status: 404 });
    }

    const HIDDEN_CATEGORIES = ['CFA Study Materials'];
    const entries = fs.readdirSync(BOOKS_DIR, { withFileTypes: true });
    const seenTitles = new Set<string>();
    const categories = entries
      .filter(e => e.isDirectory() && !HIDDEN_CATEGORIES.includes(e.name))
      .map(dir => {
        const dirPath = path.join(BOOKS_DIR, dir.name);
        const files = fs.readdirSync(dirPath).filter(f => f.toLowerCase().endsWith('.pdf') || f.toLowerCase().endsWith('.mp3'));
        const books = files
          .map(f => ({
            ...parseBookInfo(f),
            category: dir.name,
            path: `${dir.name}/${f}`,
          }))
          .filter(book => {
            const key = book.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (seenTitles.has(key)) return false;
            seenTitles.add(key);
            return true;
          });
        return { name: dir.name, books };
      })
      .filter(c => c.books.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    const totalBooks = categories.reduce((sum, c) => sum + c.books.length, 0);

    return NextResponse.json({ categories, totalBooks });
  } catch (err) {
    console.error('Books API error:', err);
    return NextResponse.json({ error: 'Failed to load books' }, { status: 500 });
  }
}
