const fs = require('fs');
const path = require('path');

// Import the route file's parsing logic inline
const BOOKS_DIR = 'C:\\Users\\derek\\OneDrive\\Desktop\\books';

const KNOWN_AUTHORS = {
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
  'William_ONeil_-_How_to_Make_Money_in_Stocks._A_Wining_System_in_Good_Times_or_Bad.pdf': "William O'Neil",
  'Oliver_Kell_-_Victory_in_stock_market.pdf': 'Oliver Kell',
  'The_Psychology_of_Trading_Tools_and_Techniques_for_Minding_the_Markets_by_Brett_Steenbarger.pdf': 'Brett Steenbarger',
  'The_Mental_Game_of_Trading_A_System_for_Solving_Problems_with_Greed_Fear_Anger_Confidence_and_Discipline_Jared_Tendler_z-lib.org.pdf': 'Jared Tendler',
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

const HIDDEN = ['CFA Study Materials'];

const entries = fs.readdirSync(BOOKS_DIR, { withFileTypes: true });
const seenTitles = new Set();

const categories = entries
  .filter(e => e.isDirectory() && !HIDDEN.includes(e.name))
  .map(dir => {
    const dirPath = path.join(BOOKS_DIR, dir.name);
    const files = fs.readdirSync(dirPath).filter(f =>
      f.toLowerCase().endsWith('.pdf') || f.toLowerCase().endsWith('.mp3')
    );
    const books = files.map(f => {
      const name = f.replace(/\.pdf$/i, '').replace(/\.mp3$/i, '');
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
      return {
        title,
        author: KNOWN_AUTHORS[f] || '',
        year: yearMatch ? yearMatch[1] : '',
        filename: f,
        category: dir.name,
        path: dir.name + '/' + f,
      };
    }).filter(b => {
      const k = b.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenTitles.has(k)) return false;
      seenTitles.add(k);
      return true;
    });
    return { name: dir.name, books };
  })
  .filter(c => c.books.length > 0)
  .sort((a, b) => a.name.localeCompare(b.name));

const totalBooks = categories.reduce((s, c) => s + c.books.length, 0);

const outPath = path.join(__dirname, '..', 'public', 'data', 'books-catalog.json');
fs.writeFileSync(outPath, JSON.stringify({ categories, totalBooks }, null, 2));
console.log(`Generated catalog: ${totalBooks} books -> ${outPath}`);
