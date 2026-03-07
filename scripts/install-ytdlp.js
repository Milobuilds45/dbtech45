#!/usr/bin/env node
// Install yt-dlp binary during build (postinstall hook)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const IS_WINDOWS = process.platform === 'win32';
const BIN_DIR = path.join(__dirname, '..', 'bin');
const YTDLP_PATH = path.join(BIN_DIR, IS_WINDOWS ? 'yt-dlp.exe' : 'yt-dlp');
const YTDLP_URL = IS_WINDOWS
  ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
  : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

console.log('[install-ytdlp] Platform:', process.platform);
console.log('[install-ytdlp] Target:', YTDLP_PATH);

// Check if already installed
if (fs.existsSync(YTDLP_PATH)) {
  console.log('[install-ytdlp] yt-dlp already exists, skipping download');
  process.exit(0);
}

// Create bin directory
if (!fs.existsSync(BIN_DIR)) {
  fs.mkdirSync(BIN_DIR, { recursive: true });
}

console.log('[install-ytdlp] Downloading from:', YTDLP_URL);

function download(url, maxRedirects = 5) {
  if (maxRedirects === 0) {
    console.error('[install-ytdlp] Too many redirects');
    process.exit(1);
  }

  https.get(url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      console.log('[install-ytdlp] Following redirect to:', response.headers.location);
      return download(response.headers.location, maxRedirects - 1);
    }
    
    if (response.statusCode !== 200) {
      console.error('[install-ytdlp] HTTP', response.statusCode);
      process.exit(1);
    }

    const file = fs.createWriteStream(YTDLP_PATH);
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      setTimeout(finishInstall, 500); // Delay to release file lock
    });
    
    file.on('error', (err) => {
      fs.unlinkSync(YTDLP_PATH);
      console.error('[install-ytdlp] Write error:', err.message);
      process.exit(1);
    });
  }).on('error', (err) => {
    console.error('[install-ytdlp] Request error:', err.message);
    process.exit(1);
  });
}

download(YTDLP_URL);

function finishInstall() {
  console.log('[install-ytdlp] Downloaded successfully');
  
  // Make executable on Linux/Mac
  if (!IS_WINDOWS) {
    try {
      fs.chmodSync(YTDLP_PATH, 0o755);
      console.log('[install-ytdlp] Made executable');
    } catch (err) {
      console.error('[install-ytdlp] chmod failed:', err.message);
    }
  }
  
  // Verify it works
  try {
    const cmd = IS_WINDOWS ? `"${YTDLP_PATH}" --version` : `${YTDLP_PATH} --version`;
    const version = execSync(cmd, { encoding: 'utf8' }).trim();
    console.log('[install-ytdlp] yt-dlp version:', version);
    console.log('[install-ytdlp] Installation complete ✓');
  } catch (err) {
    console.error('[install-ytdlp] Verification failed:', err.message);
    console.log('[install-ytdlp] Binary may need manual installation');
  }
}
