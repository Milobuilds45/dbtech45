const fs = require('fs');
const path = require('path');

const SRC = 'C:\\Users\\derek\\OneDrive\\Desktop\\books\\_new_from_drive';
const BOOKS = 'C:\\Users\\derek\\OneDrive\\Desktop\\books';

// Category mapping for each new book
const SORT_MAP = {
  '[Hoyt_Barber]_Tax_Havens_Today_The_Benefits_and_.pdf': 'Finance & Investing',
  '7 habits of highly effective people.pdf': 'Personal Development',
  'A Random Walk Down Wall Street.pdf': 'Finance & Investing',
  'A Short Course in Technical Trading - PERRY J KAUFMAN.pdf': 'Technical Analysis',
  'Candlesticks Made Easy.pdf': 'Candlesticks',
  'Daniel Reingold- Confessions of Wall Street Insider.pdf': 'Finance & Investing',
  'ElWave.pdf': 'Fibonacci & Harmonics',
  'Fibonacci_Trading___How_to_Master.pdf': null, // already have
  'Following The Rules.pdf': 'Trading Psychology',
  'FOREX THE CORE OF PRICE ACTION WITH 3W SYSTEM - SUMIT DAS.pdf': 'Forex & Currencies',
  'Forex Wave Theory.pdf': 'Forex & Currencies',
  'Getting Started in Bonds.pdf': null, // already have
  'Getting Started in Chart Patterns - Thomas Bulkowski.pdf': null, // already have
  'How to Profit in Gold.pdf': 'Futures & Commodities',
  'Inside a Traders Mind.pdf': 'Trading Psychology',
  'Investment Philosophies - Aswath Damodaran.pdf': 'Finance & Investing',
  'Law of Success.pdf': 'Personal Development',
  'LEFT_Brain_Trading_the_right_mindset.pdf': 'Trading Psychology',
  'MajorSignals.pdf': 'Technical Analysis',
  'Massimo_Giuliodori,_Frederic_S_Mishkin.pdf': null, // already have
  'Minding the Markets.pdf': null, // already have
  'Moving Averages.pdf': 'Technical Analysis',
  'Naked_Forex_High_Probability_Techniques.pdf': null, // already have
  'PA.pdf': 'Day Trading',
  'Price Action Trading.pdf': 'Day Trading',
  'Rich Dad Poor Dad.pdf': 'Personal Development',
  'Risk_Management_in_Trading_Techniques.pdf': 'Day Trading',
  'Secrets of Swiss Banking.pdf': 'Finance & Investing',
  'Secrets of The Millionaire Mind.pdf': 'Personal Development',
  'Sherman,_Howard_J_Economics___an.pdf': 'Economic Indicators',
  'Stephen_Vines_Market_Panic__Wild.pdf': 'Finance & Investing',
  'Supply and Demand.pdf': 'Technical Analysis',
  'The 4 Hour Work Week.pdf': 'Personal Development',
  'The 4 Pillars of Profit Driven Marketing.pdf': 'Finance & Investing',
  'The Blueprint.pdf': 'Day Trading',
  'THE CANDLESTICK TRADING BIBLE.pdf': 'Candlesticks',
  'The Economics of Time and Ignorance.pdf': 'Economic Indicators',
  'The High Frequency Trading Book.pdf': 'Algo & Quant Trading',
  'The Payoff Why Wall Street Always Wins - Jeff Connaughton.pdf': 'Finance & Investing',
  'The personal MBA.pdf': 'Personal Development',
  'The Psychology of Investing 6th.Ed. - John R. Nofsinger.pdf': null, // already have
  'The Theory of Money and Credit.pdf': 'Economic Indicators',
  'Trade Mindfully.pdf': 'Trading Psychology',
  'Trade Your Way to Financial Freedom.pdf': 'Swing & Trend Trading',
  'Trade Your Way to Financial Freedom - PDFDrive.com.pdf': null, // duplicate
  'Trading in the Zone - Mark Douglas.pdf': null, // already have
  'Way of the Turtle.pdf': 'Swing & Trend Trading',
};

let moved = 0;
let skipped = 0;

for (const [file, category] of Object.entries(SORT_MAP)) {
  const src = path.join(SRC, file);
  if (!fs.existsSync(src)) { continue; }
  if (!category) { skipped++; continue; }

  const destDir = path.join(BOOKS, category);
  if (!fs.existsSync(destDir)) { fs.mkdirSync(destDir, { recursive: true }); }

  const dest = path.join(destDir, file);
  if (fs.existsSync(dest)) { skipped++; continue; }

  fs.copyFileSync(src, dest);
  moved++;
  console.log(`✅ ${file} → ${category}`);
}

console.log(`\nDone: ${moved} moved, ${skipped} skipped (duplicates/already have)`);
