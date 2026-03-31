# Design System Specification: The Engineering Editorial

## 1. Overview & Creative North Star: "Precision Lithography"
The Creative North Star for this design system is **Precision Lithography**. Unlike generic developer tools that rely on heavy borders and "boxy" grids, this system treats the UI as a high-fidelity printed technical manual. It prioritizes extreme legibility, intentional white space, and structural depth created through tonal shifts rather than lines.

We move beyond "Standard Dashboard" aesthetics by embracing **Architectural Asymmetry**. Instead of centering everything, we lean into strong left-aligned anchors and expansive horizontal breathing room. The goal is a UI that feels "fast" because it removes visual friction—where the eye is guided by weight and color rather than a cage of strokes.

---

## 2. Colors & Surface Logic
The palette is rooted in a "High-Contrast Monochrome" base, punctuated by a surgical application of Indigo (`primary`) and Electric Blue (`secondary`).

### The "No-Line" Rule
**Strict Mandate:** 1px solid borders (`#ccc` or similar) are prohibited for sectioning. 
Structure must be defined by:
1.  **Background Shifts:** Use `surface-container-low` (#f0f4f7) against the main `background` (#f7f9fb) to denote sidebars.
2.  **Tonal Transitions:** Use `surface-container-lowest` (#ffffff) for primary content cards sitting on `surface-container` (#e8eff3) zones.

### Surface Hierarchy & Nesting
To handle complex nested configurations (e.g., JSON editors or cloud infra trees), use the **Nesting Depth Scale**:
*   **Level 0 (Base):** `surface` (#f7f9fb)
*   **Level 1 (Sub-section):** `surface-container-low` (#f0f4f7)
*   **Level 2 (Active Card):** `surface-container-lowest` (#ffffff)
*   **Level 3 (Pop-overs/Modals):** `surface-bright` (#f7f9fb) with Glassmorphism.

### The "Glass & Gradient" Rule
For high-interaction CTAs or Hero sections, apply a **Signature Texture**:
*   **Main CTA:** A linear gradient from `secondary` (#005bc4) to `primary` (#565e74) at a 135° angle.
*   **Overlays:** Use `surface-container-lowest` at 80% opacity with a `backdrop-blur` of 12px. This prevents the "pasted-on" look and keeps the developer in the context of their code.

---

## 3. Typography: The Editorial Hierarchy
We utilize **Inter** to create a system that feels functional yet premium. The hierarchy relies on extreme scale contrast.

*   **The Power Scale:** Use `display-md` (2.75rem) for main dashboard headers to provide an authoritative, editorial feel. 
*   **The Data Grid:** `body-sm` (0.75rem) using `on-surface-variant` (#566166) is the workhorse for metadata.
*   **Labeling:** `label-md` (0.75rem) should always be uppercase with a letter-spacing of 0.05rem when used for technical keys/tags to differentiate from human-readable prose.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "heavy" for a precision tool. We replace them with **Ambient Lifts**.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-highest` (#d9e4ea) element should be used for "pressed" states or deeply nested child configurations, creating a "carved out" effect.
*   **Ambient Shadows:** For floating menus, use: `box-shadow: 0 12px 40px -10px rgba(42, 52, 57, 0.08)`. The shadow color is a tint of `on-surface` (#2a3439), not pure black.
*   **The Ghost Border:** If accessibility requires a container boundary, use `outline-variant` (#a9b4b9) at **15% opacity**. This provides a "hint" of a boundary without cluttering the scan-path.

---

## 5. Components

### Buttons
*   **Primary:** Background: `secondary` (#005bc4); Text: `on-secondary` (#f9f8ff); Radius: `md` (0.375rem). Use a subtle 1px inner-top-light for a "beveled" high-end feel.
*   **Tertiary (Ghost):** No background. Text: `primary` (#565e74). Interaction state uses `surface-container-high` (#e1e9ee) background on hover.

### Cards & Data Lists
*   **Forbidden:** `border-bottom` or `hr` tags.
*   **Replacement:** Use the Spacing Scale `4` (0.9rem) to separate items. Distinguish rows by alternating `surface-container-lowest` and `surface-container-low`.

### Input Fields
*   **Style:** `surface-container-lowest` background with a `px` (1px) `outline-variant` at 20% opacity. 
*   **Focus State:** Shift border to `secondary` (#005bc4) and add a 2px spread of `secondary_container` at 30% opacity.

### Specialized Dev Components
*   **Code Blocks:** Use `inverse_surface` (#0b0f10) with `on_tertiary_fixed` (#3c3650) for syntax highlighting.
*   **Status Indicators:** Instead of large banners, use small "Lume" dots (4px circles) using `secondary` (Online) or `error` (Alert) next to `label-sm` text.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use `spacing-10` (2.25rem) or higher for margins between major functional blocks. Emptiness is a sign of organization.
*   **Do** use `tertiary` (#625b77) for "Non-destructive actions" like "View Logs" or "Docs" to keep the primary blue reserved for deployment/creation.
*   **Do** use `roundedness-xl` (0.75rem) for large container wrappers, but `roundedness-sm` (0.125rem) for internal code snippets to maintain a "technical" edge.

### Don’t
*   **Don’t** use pure black (#000) for text. Always use `on-surface` (#2a3439) to maintain a premium, ink-on-paper look.
*   **Don’t** use center-aligned text for anything other than empty states. Developer tools are read left-to-right, top-to-bottom.
*   **Don’t** use icons without labels in primary navigation. Clarity precedes "minimalism."