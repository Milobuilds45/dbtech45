import { stitch } from '@google/stitch-sdk';

const project = stitch.project('12845128506285824527');

const screen = await project.generate(
  `A terminal-style homepage for dbtech45.com with a dark cyberpunk aesthetic. 
  
  Include:
  1) Hero section with glowing green text on black background that looks like a command terminal
  2) Step-by-step OpenClaw setup guide with numbered terminal commands (openclaw install, gateway start, etc.)
  3) Feature cards showing key aspects: Agent Swarm, Gateway Status, Real-time Monitoring, Credential Vault
  4) Each card styled like a terminal window with monospace font and green/amber text
  5) Matrix-style green glow effects on borders
  6) Navigation menu styled like terminal commands ($ home, $ agents, $ docs)
  7) CTA buttons that look like shell prompts (> Get Started, > Deploy Agent)
  8) Footer with system stats display
  
  Desktop layout. Professional yet hacker-aesthetic. Dark mode only.`,
  'DESKTOP'
);

const html = await screen.getHtml();
const image = await screen.getImage();

console.log(JSON.stringify({ 
  id: screen.id, 
  html, 
  image 
}, null, 2));
