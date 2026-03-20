import { Stitch, StitchToolClient } from '@google/stitch-sdk';

const client = new StitchToolClient({
  apiKey: 'AQ.Ab8RN6LcJ2MGnHy_jsAXGR4BZ3PwTQ8pqvsW5Zet1DJvvKbnAA',
});

const sdk = new Stitch(client);
const project = sdk.project('12845128506285824527');

console.log('Fetching screens from DBTech45 OS project...\n');

const screens = await project.screens();

console.log(`Found ${screens.length} screens:\n`);

for (const screen of screens) {
  console.log(`Screen ID: ${screen.screenId}`);
  console.log(`Project ID: ${screen.projectId}`);
  console.log(`URL: https://stitch.withgoogle.com/projects/${screen.projectId}/screens/${screen.screenId}`);
  console.log('---');
}

await client.close();
