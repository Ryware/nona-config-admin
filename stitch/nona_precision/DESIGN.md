# Design System: High-Fidelity Configuration Intelligence

## 1. Overview & Creative North Star
**Creative North Star: "The Obsidian Architect"**

This design system moves beyond the "Synthetix Console" era into a sophisticated, high-fidelity environment for **Nona Config**. We are shifting away from generic dashboard patterns toward a "Digital Ledger" aesthetic—one that feels like a premium, dark-mode terminal hybridized with high-end editorial layout principles.

To achieve this, we prioritize **intentional asymmetry** and **tonal depth**. Rather than boxing content into rigid grids, we use the "Obsidian" philosophy: elements emerge from the dark background through subtle shifts in surface luminance. The brand identity of Nona Config must feel authoritative, utilizing the high-contrast `primary` (#a4c9ff) against the deep `surface` (#0e1323) to guide the developer’s eye through complex data sets without visual fatigue.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "Tech-Noir" spectrum, utilizing deep navy-blacks and electric blues to denote hierarchy and action.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. 
*   **Alternative:** Define boundaries through background color shifts. Use `surface-container-low` for secondary sections and `surface-container-high` for elevated modules.
*   **The Transition:** Use a `2.5` (0.5rem) or `3` (0.6rem) spacing gap to let the underlying `surface` color act as a "natural gutter" between elevated containers.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers of polished stone or frosted glass.
*   **Base:** `surface` (#0e1323) – The infinite canvas.
*   **Layout Sections:** `surface-container-low` (#161b2b).
*   **Interactive Cards:** `surface-container-highest` (#2f3446).
*   **The "Glass & Gradient" Rule:** Floating modals and command palettes must use `surface-bright` (#34394a) at 80% opacity with a `backdrop-blur` of 20px. 

### Signature Textures
Main Action buttons and primary "Nona Config" brand moments should utilize a subtle linear gradient: 
`linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)`. 
This adds a "glow" effect that flat colors cannot replicate, signaling high-value interaction points.

---

## 3. Typography: Editorial Utility
The typography system balances the brutalist efficiency of `ui-monospace` with the modern clarity of `Space Grotesk` and `Inter`.

*   **Display & Headline (Space Grotesk):** Used for large-scale brand moments and section headers. High-end editorial feel with tight letter-spacing (-0.02em).
*   **Title & Body (Inter):** Used for the bulk of the configuration data. The focus is on readability.
*   **Label (Inter/ui-monospace):** Smallest scale (`label-sm`: 0.6875rem). Use `ui-monospace` for actual configuration keys or code values to differentiate from UI labels.

**Hierarchy as Identity:** The brand "Nona Config" should always appear in `headline-sm` or `title-lg` using the `primary` color token to ensure prominence against the dark background.

---

## 4. Elevation & Depth
We reject traditional drop shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card (#080d1d) on a `surface-container-low` (#161b2b) background to create a "recessed" look for logs or terminal outputs.
*   **Ambient Shadows:** For high-level floating elements (like dropdowns), use a shadow color derived from `on-surface` at 6% opacity. 
    *   *Spec:* `0px 24px 48px rgba(222, 225, 248, 0.06)`
*   **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use the `outline-variant` token at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons (High-Contrast Focus)
*   **Primary:** Gradient fill (Primary to Primary-Container). Roundedness: `sm` (0.125rem) for a sharp, professional look. Text: `on-primary` (#00315d), bold.
*   **Secondary:** Ghost style. No background. `outline` token at 20% opacity. 
*   **Tertiary:** Text-only, using `primary-fixed` for high legibility on dark surfaces.

### Input Fields & Data Entry
*   **Styling:** Forgo the four-sided box. Use a `surface-container-highest` background with a 2px bottom-accent of `outline-variant`.
*   **Active State:** The bottom-accent transitions to `primary`.

### Cards & Lists (The Ledger View)
*   **Forbid Dividers:** Do not use lines to separate list items. Use a background toggle between `surface-container-low` and `surface-container-lowest` for alternating rows, or simply use `8` (1.75rem) vertical spacing.
*   **Visual Grouping:** Group related configuration sets by nesting them inside a `surface-container-high` wrapper.

### Config Chips
*   **Style:** `surface-variant` background with `on-surface-variant` text. Use `full` roundedness. These should look like small, inert "pills" until hovered.

### Additional Component: "The Monolith" Navigation
*   A vertical sidebar using `surface-container-lowest`. It should feature the "Nona Config" logo at the top with a subtle `primary-container` outer glow to anchor the brand.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a separator. If you think you need a line, add `1.5` (0.3rem) more padding instead.
*   **DO** use `ui-monospace` for any value that a developer might copy-paste.
*   **DO** leverage `surface-bright` for hover states to create a "light-up" effect.

### Don't
*   **DON'T** use pure black (#000000). Always use the `surface` tokens to maintain the deep navy depth.
*   **DON'T** use standard "Material Design" rounded corners. Stick to `sm` (0.125rem) or `none` for a more "engineered" feel.
*   **DON'T** use high-opacity shadows. If the shadow is obvious, it's too heavy.