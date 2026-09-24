# Portfolio Content Management & Demos Guide

This repository is configured so you can manage your portfolio content, sections, and embedded demos without touching code or redeploying.

---

## 1. Quick Google Sheet Setup

1. Create a new Google Spreadsheet (e.g. named `Portfolio CMS`).
2. Create **three tabs** at the bottom:
   - `Projects`
   - `Expertise`
   - `SiteInfo`

### Tab 1: `Projects`
Add the following headers in row 1:

| id | title | category | year | page_title | description | tags | metrics | demo_id | demo_config |
|---|---|---|---|---|---|---|---|---|---|
| 01 | AUTONOMOUS REASONING SWARM | AGENTIC ARCHITECTURE | 2026 | ARCHITECTURE & DECOMPOSITION | A multi-agent cognitive architecture... | MULTI-AGENT, TOOL EXECUTION | 99.4% EXECUTION COMPLETION | spawn-window | {"title": "SWARM_ALPHA", "spawnX": 25, "spawnY": 15, "pingMs": 32} |
| 01 | | | | RECOVERY PROTOCOLS | Fault-tolerant consensus protocols allowing autonomous subagents... | FAULT TOLERANCE, STATE RECOVERY | SUB-12MS RECOVERY | | |
| 02 | AGENT MEMORY GRAPH ENGINE | KNOWLEDGE & RETRIEVAL | 2025 | | Persistent episodic and semantic memory pipeline... | GRAPH RAG, EPISODIC MEMORY | <45MS RETRIEVAL | | |

*Notes:*
- **Multi-Page Systems:** To create multiple swipeable pages inside a single system, simply add multiple rows with the **same `id`** (e.g. two rows both having `id: 01`).
  - The first row sets the overall Project `title`, `category`, and `year`.
  - Each row defines its own `description`, `tags`, `metrics`, and optional `demo_id`.
  - The Floating CLI will automatically detect the multiple pages and type `cd ./page-02`, `cd ../page-01` as you swipe horizontally!
  - You can optionally specify a `page_title` (e.g. `ARCHITECTURE`, `METRICS`) which will be displayed in brackets `[ PAGE_TITLE ]` above that page's description.
- **Adding/removing sections:** Just add or remove different IDs! The site will automatically update the number of project sections, adjust the counter indicators (e.g., `[ 01 / 05 ]`), and teach the Floating CLI how to navigate to the new section.
- **`tags`:** Separate multiple tags with commas.
- **`demo_id`:** The identifier of the JavaScript demo registered in `src/demos/DemoRegistry.jsx`.
- **`demo_config`:** A JSON string of arguments/props passed directly into your demo function or component.

---

### Tab 2: `Expertise`
Add the following headers in row 1:

| area | title | detail |
|---|---|---|
| 01 \| ARCHITECTURE | AGENTIC WORKFLOWS | Autonomous planning, reflection loops, multi-agent orchestration... |
| 02 \| INTERFACES | TOOL SYNTHESIS | Dynamic API binding, sandboxed code execution... |
| 03 \| FOUNDATIONS | MODEL FINE-TUNING & EVALS | Domain adaptation, synthetic trajectory generation... |

---

### Tab 3: `SiteInfo`
Add the following headers in row 1:

| key | value |
|---|---|
| herosubtitle | \| AI SOLUTIONS DEVELOPER & BUSINESS DRIVER |
| herotitle | CREATIVE \| AGENTIC \| SOLUTIONS. |
| herodescription | Specializing in designing AI-driven solutions for real world problems. |
| contacttag | \| INITIATE TRANSMISSION |
| contactheading1 | LET'S BUILD THE |
| contactheading2 | NEXT PARADIGM. |
| email | contact@example.com |
| github | https://github.com/yourusername |
| twitter | https://x.com/yourusername |
| linkedin | https://linkedin.com/in/yourusername |
| footerleft | ALL PROTOCOLS RESERVED |
| footerright | MONOSPACE \| NO_OS_UI \| SNAP_Y \| 0_RADIUS |

---

## 2. Publishing Your Sheet to Web (CSV)

1. In your Google Sheet, click **File** → **Share** → **Publish to web**.
2. Under "Link":
   - Change **Entire Document** to **Projects**, and change **Web page** to **Comma-separated values (.csv)**. Click **Publish** and copy the URL.
   - Do the same for **Expertise** (select CSV) and copy the URL.
   - Do the same for **SiteInfo** (select CSV) and copy the URL.

---

## 3. Connecting the URLs to Your Site

You can either:
1. Open [`src/config/sheetsConfig.js`](file:///c:/Developer/Random/portfolio-site/src/config/sheetsConfig.js) and paste the URLs directly:
   ```javascript
   export const SHEETS_CONFIG = {
     projectsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv',
     expertiseCsvUrl: 'https://docs.google.com/spreadsheets/d/e/.../pub?gid=123&single=true&output=csv',
     siteInfoCsvUrl: 'https://docs.google.com/spreadsheets/d/e/.../pub?gid=456&single=true&output=csv',
   };
   ```
2. Or create a `.env` file in the project root:
   ```env
   VITE_SHEETS_PROJECTS_CSV_URL=https://docs.google.com/...output=csv
   VITE_SHEETS_EXPERTISE_CSV_URL=https://docs.google.com/...output=csv
   VITE_SHEETS_SITEINFO_CSV_URL=https://docs.google.com/...output=csv
   ```

*Note: If no URLs are provided, or if the user is offline, the site automatically falls back to [`src/data/defaultContent.js`](file:///c:/Developer/Random/portfolio-site/src/data/defaultContent.js) so your portfolio never breaks.*

---

## 4. How to Add New JavaScript Demos with Custom Arguments

Demos are registered in [`src/demos/DemoRegistry.jsx`](file:///c:/Developer/Random/portfolio-site/src/demos/DemoRegistry.jsx).

### Adding a React Demo:
Create your component in `src/demos/MyDemo.jsx`:
```jsx
export default function MyDemo({ spawnX = 0, spawnY = 0, speed = 1 }) {
  // your interactive canvas, terminal, or physics simulation
  return <div>...</div>;
}
```
Register it in `src/demos/DemoRegistry.jsx`:
```javascript
import MyDemo from './MyDemo';

export const DEMO_REGISTRY = {
  'my-demo': MyDemo,
};
```
In your Google Sheet `Projects` tab, set `demo_id` to `my-demo` and `demo_config` to `{"spawnX": 40, "spawnY": 10, "speed": 2}`.

### Adding a Vanilla JavaScript Demo:
In `src/demos/DemoRegistry.jsx`:
```javascript
export const DEMO_REGISTRY = {
  'custom-vanilla': {
    type: 'vanilla',
    init: (containerElement, config) => {
      // containerElement is a raw DOM node
      // config contains your arguments: config.spawnX, config.spawnY
      const canvas = document.createElement('canvas');
      containerElement.appendChild(canvas);

      // Return cleanup function when section unmounts:
      return () => {
        containerElement.innerHTML = '';
      };
    },
  },
};
```
