import { Stitch, StitchToolClient } from '@google/stitch-sdk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Get access token from gcloud
const { stdout } = await execAsync('gcloud auth application-default print-access-token');
const accessToken = stdout.trim();

// Create client with OAuth
const client = new StitchToolClient({
  accessToken,
  projectId: 'gen-lang-client-0601283339',
});

const sdk = new Stitch(client);

console.log('Listing Stitch projects...');
const projects = await sdk.projects();

console.log(`Found ${projects.length} projects:`);
for (const project of projects) {
  console.log(`  ID: ${project.projectId}`);
  console.log(`  Full ID: ${project.id}`);
}

await client.close();
