import { Stitch, StitchToolClient } from '@google/stitch-sdk';

// Use the API key Derek just provided
const client = new StitchToolClient({
  apiKey: 'AQ.Ab8RN6LcJ2MGnHy_jsAXGR4BZ3PwTQ8pqvsW5Zet1DJvvKbnAA',
});

const sdk = new Stitch(client);

console.log('Testing Stitch API key authentication...\n');

// Test 1: List projects
console.log('1. Listing projects:');
const projects = await sdk.projects();
console.log(`   Found ${projects.length} projects`);
for (const project of projects) {
  console.log(`   - ${project.projectId}: ${projects.length} project(s)`);
}

// Test 2: Access Derek's project
console.log('\n2. Accessing DBTech45 OS project:');
const project = sdk.project('12845128506285824527');
const screens = await project.screens();
console.log(`   Found ${screens.length} existing screens`);

// Test 3: Generate the terminal homepage
console.log('\n3. Generating terminal-style homepage...');
const screen = await project.generate(
  `A terminal-style homepage for dbtech45.com with a dark cyberpunk aesthetic. 
  
  Include:
  1) Hero section with glowing green text on black background that looks like a command terminal
  2) Step-by-step OpenClaw setup guide with numbered terminal commands:
     - npm install -g openclaw
     - openclaw init
     - openclaw gateway start
     - openclaw agents create
  3) Feature cards showing: Agent Swarm, Gateway Status, Real-time Monitoring, Credential Vault
  4) Each card styled like a terminal window with monospace font and green/amber text
  5) Matrix-style green glow effects on borders
  6) Navigation menu styled like terminal commands ($ home, $ agents, $ docs)
  7) CTA buttons that look like shell prompts (> Get Started, > Deploy Agent)
  8) Footer with system stats display (uptime, active agents, API calls)
  
  Desktop layout. Professional yet hacker-aesthetic. Dark mode only. Use monospace fonts throughout.`,
  'DESKTOP'
);

console.log(`   ✅ Screen generated! ID: ${screen.id}`);

const html = await screen.getHtml();
const image = await screen.getImage();

console.log(`   HTML URL: ${html}`);
console.log(`   Screenshot URL: ${image}`);

await client.close();

console.log('\n✅ SUCCESS! Stitch API key authentication working!');
