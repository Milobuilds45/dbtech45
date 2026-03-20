/**
 * Stitch AI Integration
 * 
 * Use Google's Stitch AI to generate UI designs programmatically.
 * 
 * Project: DBTech45 OS
 * Project ID: 12845128506285824527
 * 
 * Authentication: STITCH_API_KEY environment variable
 * (Set via: process.env.STITCH_API_KEY = "AQ.Ab8RN6LcJ2MGnHy_jsAXGR4BZ3PwTQ8pqvsW5Zet1DJvvKbnAA")
 */

import { Stitch, StitchToolClient } from '@google/stitch-sdk';

// Derek's DBTech45 OS project (shared workspace)
export const STITCH_PROJECT_ID = '12845128506285824527';

// Initialize Stitch client with API key
const client = new StitchToolClient({
  apiKey: process.env.STITCH_API_KEY || 'AQ.Ab8RN6LcJ2MGnHy_jsAXGR4BZ3PwTQ8pqvsW5Zet1DJvvKbnAA',
});

const stitchSDK = new Stitch(client);

// Get the project instance
export const getStitchProject = () => {
  return stitchSDK.project(STITCH_PROJECT_ID);
};

// Generate a new screen from a text prompt
export async function generateScreen(prompt: string, deviceType?: 'MOBILE' | 'DESKTOP' | 'TABLET' | 'AGNOSTIC') {
  const project = getStitchProject();
  const screen = await project.generate(prompt, deviceType);
  
  return {
    id: screen.id,
    html: await screen.getHtml(),
    image: await screen.getImage(),
    screen, // Full screen object for further operations
  };
}

// Edit an existing screen
export async function editScreen(screenId: string, editPrompt: string) {
  const project = getStitchProject();
  const screen = await project.getScreen(screenId);
  const edited = await screen.edit(editPrompt);
  
  return {
    id: edited.id,
    html: await edited.getHtml(),
    image: await edited.getImage(),
    screen: edited,
  };
}

// Generate design variants
export async function generateVariants(
  screenId: string,
  variantPrompt: string,
  options?: {
    variantCount?: number; // 1-5
    creativeRange?: 'REFINE' | 'EXPLORE' | 'REIMAGINE';
    aspects?: Array<'LAYOUT' | 'COLOR_SCHEME' | 'IMAGES' | 'TEXT_FONT' | 'TEXT_CONTENT'>;
  }
) {
  const project = getStitchProject();
  const screen = await project.getScreen(screenId);
  const variants = await screen.variants(variantPrompt, options || {});
  
  return Promise.all(
    variants.map(async (variant) => ({
      id: variant.id,
      html: await variant.getHtml(),
      image: await variant.getImage(),
      screen: variant,
    }))
  );
}

// List all screens in the project
export async function listScreens() {
  const project = getStitchProject();
  const screens = await project.screens();
  
  return Promise.all(
    screens.map(async (screen) => ({
      id: screen.id,
      projectId: screen.projectId,
      html: await screen.getHtml(),
      image: await screen.getImage(),
    }))
  );
}

// Example usage:
// 
// import { generateScreen, editScreen, generateVariants } from '@/lib/stitch';
// 
// // Generate a new screen
// const screen = await generateScreen('A modern dashboard with stat cards and charts');
// console.log(screen.html, screen.image);
// 
// // Edit it
// const edited = await editScreen(screen.id, 'Make the background dark and add a sidebar');
// 
// // Generate variants
// const variants = await generateVariants(screen.id, 'Try different color schemes', {
//   variantCount: 3,
//   creativeRange: 'EXPLORE',
//   aspects: ['COLOR_SCHEME', 'LAYOUT'],
// });
