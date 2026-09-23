## 1. Core Philosophy & Vibe
- **No OS UI:** Absolutely no native HTML tooltips, standard browser scrollbars, rounded corners (border-radius: 0), or drop shadows.

## 2. Typography & Colors
- **Font Family:** Strictly Monospace. `font-family: 'Courier New', Courier, monospace;` (or 'Fira Code', 'Consolas').
- **Line Height:** Tight and controlled. `1.0` to `1.2` for grids, up to `1.5` for reading text.
- **Base Palette:**
  - **Background:** Deep espresso black (`#0a0806`).
  - **Foreground (Text):** Bronze grey (`#705a42`).

## 3. Tooltips
- **CRITICAL RULE:** Never use the native HTML `title="..."` attribute. It ruins the terminal immersion with a white OS-level popup.

## 4. Scrollbars
- Hide default scrollbars.
```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #0a0806; border-left: 1px solid #30271d; }
::-webkit-scrollbar-thumb { background: #30271d; }
::-webkit-scrollbar-thumb:hover { background: #705a42; }
```