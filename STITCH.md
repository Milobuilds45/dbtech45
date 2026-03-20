# Stitch AI Integration

**Project:** DBTech45 OS  
**Project ID:** `12845128506285824527`  
**Web UI:** https://stitch.withgoogle.com/projects/12845128506285824527

---

## Quick Start

```typescript
import { generateScreen } from '@/lib/stitch';

// Generate a new screen
const screen = await generateScreen('A modern dashboard with stat cards');
console.log(screen.html);  // Download URL for HTML
console.log(screen.image); // Download URL for screenshot
```

---

## Available Functions

### `generateScreen(prompt, deviceType?)`
Generate a new UI screen from a text prompt.

**Parameters:**
- `prompt` (string) - Describe the UI you want
- `deviceType` (optional) - `'MOBILE'`, `'DESKTOP'`, `'TABLET'`, or `'AGNOSTIC'`

**Returns:**
```typescript
{
  id: string,
  html: string,  // Download URL
  image: string, // Download URL
  screen: Screen // Full Stitch Screen object
}
```

**Example:**
```typescript
const screen = await generateScreen('A login page with email and password fields', 'DESKTOP');
```

---

### `editScreen(screenId, editPrompt)`
Edit an existing screen.

**Example:**
```typescript
const edited = await editScreen('screen-id-123', 'Make the background dark and add a sidebar');
```

---

### `generateVariants(screenId, variantPrompt, options?)`
Generate design variants of an existing screen.

**Options:**
- `variantCount` (1-5) - Number of variants
- `creativeRange` - `'REFINE'`, `'EXPLORE'`, or `'REIMAGINE'`
- `aspects` - Array of: `'LAYOUT'`, `'COLOR_SCHEME'`, `'IMAGES'`, `'TEXT_FONT'`, `'TEXT_CONTENT'`

**Example:**
```typescript
const variants = await generateVariants('screen-id-123', 'Try different color schemes', {
  variantCount: 3,
  creativeRange: 'EXPLORE',
  aspects: ['COLOR_SCHEME', 'LAYOUT'],
});
```

---

### `listScreens()`
List all screens in the project.

**Example:**
```typescript
const screens = await listScreens();
for (const screen of screens) {
  console.log(screen.id, screen.html);
}
```

---

## Environment Variables

**Required:**
- `STITCH_API_KEY` - Google API key (already set)

**Optional:**
- `GOOGLE_CLOUD_PROJECT` - `gen-lang-client-0601283339` (for OAuth)

---

## Authentication

Uses the service account credentials at:
```
C:\Users\derek\.openclaw\credentials\google-stitch-service-account.json
```

API key is stored in environment variable `STITCH_API_KEY`.

---

## SDK Documentation

Full SDK docs: https://github.com/google-labs-code/stitch-sdk

---

## Example Use Cases

### Generate a new page design
```typescript
const screen = await generateScreen('A pricing page with three tiers');
// Download HTML and integrate into Next.js
```

### Iterate on existing design
```typescript
const edited = await editScreen(existingScreenId, 'Add a hero section with a CTA button');
```

### Explore design alternatives
```typescript
const variants = await generateVariants(screenId, 'Show me different layouts', {
  variantCount: 5,
  creativeRange: 'REIMAGINE',
  aspects: ['LAYOUT'],
});
```

---

## Notes

- All HTML/image URLs are **download links** (not permanent hosting)
- Screens are stored in the Stitch project at https://stitch.withgoogle.com/
- Use the Stitch web UI to manually refine designs before exporting
