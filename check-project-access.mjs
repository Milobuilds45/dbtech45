import { Stitch, StitchToolClient } from '@google/stitch-sdk';

const client = new StitchToolClient({
  apiKey: 'AQ.Ab8RN6LcJ2MGnHy_jsAXGR4BZ3PwTQ8pqvsW5Zet1DJvvKbnAA',
});

const sdk = new Stitch(client);

console.log('Listing all projects accessible with this API key:\n');

const projects = await sdk.projects();

console.log(`Found ${projects.length} projects:\n`);

for (const project of projects) {
  console.log(`Title: ${project.title || 'Untitled'}`);
  console.log(`ID: ${project.projectId}`);
  console.log(`URL: https://stitch.withgoogle.com/projects/${project.projectId}`);
  console.log('---\n');
}

await client.close();
