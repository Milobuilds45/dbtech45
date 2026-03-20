import { Stitch, StitchToolClient } from '@google/stitch-sdk';

const client = new StitchToolClient({
  apiKey: 'AQ.Ab8RN6LcJ2MGnHy_jsAXGR4BZ3PwTQ8pqvsW5Zet1DJvvKbnAA',
});

const sdk = new Stitch(client);
const project = sdk.project('12845128506285824527');

console.log('Generating Locals Diner homepage redesign...\n');

const screen = await project.generate(
  `Homepage redesign for Locals Diner - a family-owned breakfast and lunch restaurant in Dracut, MA.
  
  Design should feel warm, welcoming, and community-focused with modern touches.
  
  Include:
  1) Hero section with tagline "Where Locals Become Family" and appetizing breakfast food imagery
  2) Prominent hours display: Wednesday-Sunday 7:30 AM - 2:00 PM (CLOSED Mon-Tue)
  3) Three feature cards highlighting: Great Food, Great Portions, Great People
  4) Loyalty rewards section with visual punch card graphic
  5) Special features: Full lottery license (Keno), party accommodations, local products
  6) Navigation menu: Menu, About, Community, Gallery, Rewards
  7) Warm color palette: reds, creams, wood tones (classic diner aesthetic but modern)
  8) Clear CTA buttons: "View Our Menu" and "Plan Your Visit"
  9) Footer with address (1420 Lakeview Ave, Dracut MA 01826) and map
  10) Community-focused messaging about family legacy and local values
  
  Desktop layout. Style: Modern but approachable, family-friendly, warm diner atmosphere.`,
  'DESKTOP'
);

console.log('✅ Locals Diner redesign generated!');
console.log('Screen ID:', screen.id);
console.log('\nView at: https://stitch.withgoogle.com/projects/12845128506285824527');

await client.close();
