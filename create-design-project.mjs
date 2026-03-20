import { StitchToolClient } from '@google/stitch-sdk';

const client = new StitchToolClient({
  apiKey: 'AQ.Ab8RN6LcJ2MGnHy_jsAXGR4BZ3PwTQ8pqvsW5Zet1DJvvKbnAA',
});

console.log('Creating Paula/Anders design workspace project...\n');

const result = await client.callTool('create_project', {
  title: 'Paula & Anders - DBTech45 Design Workspace',
});

console.log('Project created!');
console.log('Result:', JSON.stringify(result, null, 2));

if (result.project && result.project.id) {
  console.log('Project ID:', result.project.id);
  console.log('URL:', `https://stitch.withgoogle.com/projects/${result.project.id}`);
} else {
  console.log('Project ID:', result.id || result.projectId);
  console.log('URL:', `https://stitch.withgoogle.com/projects/${result.id || result.projectId}`);
}

await client.close();
