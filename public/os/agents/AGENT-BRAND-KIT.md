# Agent Brand Kit — DBTech45 /os

**Last updated:** February 21, 2026  
**Maintained by:** Paula ✦

---

## Agent Icons

| Agent | Role | Color | Hex | Icon Description | File |
|-------|------|-------|-----|-----------------|------|
| Milo | Chief of Staff / Coordination | Silver | `#C0C0C0` | Hub/network node | milo.png |
| Anders | Full-Stack Developer | Orange | `#FF8C00` | Code brackets `</>` | anders.png |
| Bobby | Trading & Markets | Green | `#00A000` | Trending arrow | bobby.png |
| Dax | Data / Newsletter | Cyan | `#00FFFF` | Newspaper layout | dax.png |
| Dwight | Intelligence & Research | Purple | `#7B68EE` | Cloud broadcast | dwight.png |
| Paula | Creative Director | Pink | `#E91E8C` | Pen nib | paula.png |
| Remy | Marketing | Red | `#E53935` | Chef hat | remy.png |
| Tony | Restaurant Operations | Yellow | `#F4D03F` | Spatula | tony.png |
| Webb | Deep Research & Alt Media | Blue | `#2979FF` | Globe/magnifying glass | webb.png |
| Wendy | Personal / Coaching | Lavender | `#B19CD9` | Brain | wendy.png |

---

## Icon Design Rules

- **Style:** Clean functional role icons — NO faces, NO letter logos
- **Background:** Black (#000000) with colored icon strokes
- **Frame:** Consistent circular frame, consistent stroke weight
- **Color:** Each agent has ONE signature color
- **Format:** PNG with transparency where applicable

---

## CSS Variables

```css
:root {
  --agent-milo: #C0C0C0;     /* Silver */
  --agent-anders: #FF8C00;   /* Orange */
  --agent-bobby: #00A000;    /* Green */
  --agent-dax: #00FFFF;      /* Cyan */
  --agent-dwight: #7B68EE;   /* Purple */
  --agent-paula: #E91E8C;    /* Pink */
  --agent-remy: #E53935;     /* Red */
  --agent-tony: #F4D03F;     /* Yellow */
  --agent-webb: #2979FF;     /* Blue */
  --agent-wendy: #B19CD9;    /* Lavender */
}
```

---

## Usage

### Web
```html
<img src="/os/agents/anders.png" alt="Anders - Developer" />
```

### Sizing
| Context | Size |
|---------|------|
| Full display | Original (~1024px) |
| Card | 128px × 128px |
| Avatar | 48px × 48px |
| Small avatar | 32px × 32px |
| Favicon | 16-32px |

### Background Requirements
- Designed for **dark backgrounds** (#000000 or similar)
- On light backgrounds, add a dark circular backdrop or use the colored version with sufficient contrast

### Fallback
When image fails to load, use colored square with 2-letter initials:
- Use agent's signature color as background
- White text, bold, centered

---

## File Locations

| Location | Purpose |
|----------|---------|
| `dbtech45/public/os/agents/` | Production web assets |
| `MILO/agents-images/` | Source/archive files |

---

## Available Files

- anders.png ✅
- bobby.png ✅
- dax.png ✅
- dwight.png ✅
- milo.png ✅ (+ milo.svg)
- paula.png ✅
- remy.png ✅
- tony.png ✅
- webb.png ✅
- wendy.png ✅ (+ wendy.svg)

---

Paula ✦
