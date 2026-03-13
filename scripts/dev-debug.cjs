// Wrap next dev to catch why it exits
const { spawn } = require('child_process');

const child = spawn('npx', ['next', 'dev'], {
  cwd: __dirname + '/..',
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
});

child.on('exit', (code, signal) => {
  console.log(`\n\n=== DEV SERVER EXITED ===`);
  console.log(`Exit code: ${code}`);
  console.log(`Signal: ${signal}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`========================\n`);
});

child.on('error', (err) => {
  console.error('Spawn error:', err);
});

// Catch uncaught exceptions in this wrapper
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception in wrapper:', err);
});
