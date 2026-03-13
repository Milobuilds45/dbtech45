// Auto-restart wrapper for Next.js dev server
// Works around Next.js 16 + Node 23 crash bug on Windows
const { spawn } = require('child_process');

let restartCount = 0;
const MAX_RESTARTS = 50;

function startServer() {
  restartCount++;
  
  if (restartCount > MAX_RESTARTS) {
    console.log('\n❌ Too many restarts. Something is seriously wrong.');
    process.exit(1);
  }
  
  if (restartCount > 1) {
    console.log(`\n🔄 Auto-restarting dev server (restart #${restartCount - 1})...\n`);
  }

  const child = spawn('npx', ['next', 'dev'], {
    cwd: __dirname + '/..',
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
  });

  child.on('exit', (code, signal) => {
    if (signal === 'SIGINT' || signal === 'SIGTERM') {
      console.log('\nDev server stopped.');
      process.exit(0);
    }
    
    console.log(`\n⚠️  Dev server crashed (code ${code}). Restarting in 1s...`);
    setTimeout(startServer, 1000);
  });

  child.on('error', (err) => {
    console.error('Spawn error:', err);
    setTimeout(startServer, 2000);
  });
}

// Forward SIGINT/SIGTERM to child
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

console.log('🚀 Dev server auto-restart wrapper active\n');
startServer();
