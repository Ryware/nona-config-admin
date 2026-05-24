---
name: Nona Config Admin
description: An operator-grade configuration console with the clarity of a precision instrument.
colors:
  void-obsidian: "#09090b"
  surface-lowest: "#030303"
  surface-low: "#121214"
  surface: "#18181b"
  surface-high: "#27272a"
  surface-highest: "#3f3f46"
  surface-bright: "#52525b"
  electric-indigo: "#6366f1"
  indigo-glow: "#818cf8"
  indigo-pale: "#c7d2fe"
  console-emerald: "#10b981"
  signal-green: "#34d399"
  on-surface: "#f4f4f5"
  on-surface-muted: "#a1a1aa"
  outline: "#71717a"
  outline-subtle: "#3f3f46"
  alert-crimson: "#f87171"
  caution-amber: "#f59e0b"
typography:
  display:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
  mono:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.electric-indigo}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.indigo-glow}"
    textColor: "#ffffff"
  button-outline:
    backgroundColor: "{colors.surface-low}"
    textColor: "{colors.on-surface-muted}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.outline}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-destructive:
    backgroundColor: "{colors.alert-crimson}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "44px"
  input:
    backgroundColor: "{colors.surface-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: Nona Config Admin

## 1. Overview

**Creative North Star: "The Precise Instrument"**

Nona Config Admin is built for the operator who was handed a system they did not build and must trust it completely. The interface makes no assumptions about technical fluency; instead, it earns trust through precision. Every affordance is immediate and unambiguous. Every action has a visible consequence. The environment never demands context-switching; it holds its state calmly while the user makes decisions.

The visual language is drawn from the same world as Linear, Vercel, and Raycast but adapted deliberately for non-expert operators. Zinc surfaces descend through eight calibrated steps from near-black to near-mid-gray, conveying depth through tone alone. Electric indigo punctuates at high value with deliberate economy. Console emerald marks successful states and positive signals. The interface is dark because its users sit at a workstation with ambient office light, making configuration changes that require focus and exactness; dark reduces glare and removes the visual noise that competes with the data.

This system explicitly rejects: cryptic developer dashboards with code-dump aesthetics; low-contrast SaaS templates that look "modern" but hinder legibility; unvalidated forms that let the user discover errors after submission; flashy animations that celebrate the chrome instead of the content.

**Key Characteristics:**
- Tonal depth without shadows: eight surface layers carry all hierarchical weight
- Electric indigo as the single deliberate accent, used with strict economy
- Two typefaces: Space Grotesk for headings (precision and character), Inter for body (human legibility at 13px)
- JetBrains Mono reserved exclusively for config values, keys, and identifiers
- Motion is brief and directional (0.2-0.3s ease-out only): no bounce, no elastic
- Every interactive state is declared: hover, focus, active, disabled, error

## 2. Colors: The Obsidian Forge Palette

A dark zinc palette with one saturated accent and a semantic signal layer. No neutral surface exists without purpose.

### Primary
- **Electric Indigo** (`#6366f1`, `oklch(60% 0.22 266)`): The single command color. Used on primary actions (buttons, active nav items, focus rings, links that initiate change). Its rarity is the point: when indigo appears, something important is happening.
- **Indigo Glow** (`#818cf8`, `oklch(68% 0.18 266)`): Hover and elevated state of electric indigo. Also used for active navigation labels and focused component halos.
- **Indigo Pale** (`#c7d2fe`, `oklch(87% 0.08 266)`): Highest-lightness indigo variant; used for badge text on dark indigo containers and secondary highlights in low-importance contexts.

### Secondary
- **Console Emerald** (`#10b981`, `oklch(68% 0.18 165)`): Positive signal color. Active or healthy states, success badges, "published" indicators, completion steps.
- **Signal Green** (`#34d399`, `oklch(78% 0.15 165)`): Lighter success state; success toast foregrounds, check icons.

### Semantic
- **Alert Crimson** (`#f87171`, `oklch(73% 0.16 28)`): Errors, destructive actions, kill signals. Used on error states, delete confirmations, critical validation messages.
- **Caution Amber** (`#f59e0b`, `oklch(79% 0.19 80)`): Warnings, degraded states, advisory messages. Used on warning badges and alert components.

### Neutral (Surface Hierarchy)
- **Void Obsidian** (`#09090b`): The floor. App background and page canvas. So dark it is nearly imperceptible as zinc; this is intentional.
- **Surface Lowest** (`#030303`): Beneath inputs; creates the inset effect on text fields.
- **Surface Low** (`#121214`): Raised cards at rest. The primary content surface.
- **Surface** (`#18181b`): Standard panels, drawer bodies.
- **Surface High** (`#27272a`): Dividers, chip backgrounds, active sidebar items.
- **Surface Highest** (`#3f3f46`): Full-opacity borders, badge fills.
- **Surface Bright** (`#52525b`): Outline text, muted labels, ghost-button text at rest.
- **On Surface** (`#f4f4f5`): Primary text on dark backgrounds. Never pure white.
- **On Surface Muted** (`#a1a1aa`): Secondary labels, timestamps, metadata.
- **Outline** (`#71717a`): Input placeholder text; border base color.
- **Outline Subtle** (`#3f3f46`): Low-opacity borders (`/15` to `/30`), dividers.

### Named Rules
**The One Voice Rule.** Electric indigo is used on no more than one primary action per view. If two CTAs compete, the lower-priority one becomes outline or ghost. Indigo's authority comes from restraint.

**The Tonal Staircase Rule.** Depth is expressed through surface layer selection, not through box-shadow. Every new layer of elevation moves one step up the surface hierarchy. Cards use `surface-low`; panel overlays use `surface`; command palette uses `surface-high`.

## 3. Typography

**Display / Headline Font:** Space Grotesk (fallback: sans-serif)
**Body / UI Font:** Inter (fallback: system-ui, -apple-system, sans-serif)
**Code / Config Font:** JetBrains Mono (fallback: ui-monospace, monospace)

**Character:** Space Grotesk carries precision and confidence in headings, its slightly irregular geometry humanizing the technical context. Inter performs seamlessly at 13px with excellent legibility for dense data tables and form labels. JetBrains Mono frames every configuration value as code, establishing clear visual separation between content types.

### Hierarchy
- **Display** (Space Grotesk, 700, 1.5rem, line-height 1.2, tracking -0.02em): Page-level hero text. Used once per view at most. Reserved for auth screens and empty state headings.
- **Headline** (Space Grotesk, 700, 1.125rem/18px, line-height 1.3, tracking -0.01em): Section headings, card titles, page header names.
- **Title** (Inter, 600, 0.9375rem/15px, line-height 1.4): Sidebar project names, table column headers, drawer section labels, sidebar brand wordmark.
- **Body** (Inter, 400, 0.8125rem/13px, line-height 1.6, max 75ch): Default text for descriptions, metadata, table cell content. Line length capped at 75ch in reading contexts.
- **Label** (Inter, 500, 0.6875rem/11px, line-height 1.4, tracking 0.05em): Uppercase-optional small labels, status pills, navigation hints, breadcrumb segments.
- **Mono** (JetBrains Mono, 400, 0.8125rem/13px, line-height 1.6): All configuration keys, environment variable names, API tokens, JSON values, CLI identifiers. Never used for decorative purposes.

### Named Rules
**The Two-Register Rule.** Space Grotesk for headings; Inter for body. Never mix them at the same hierarchical level. JetBrains Mono is reserved exclusively for config identifiers and code values.

**The Weight-Jump Rule.** Adjacent hierarchy levels must differ by at least one full weight step (400 to 600, or 600 to 700). Flat scales (all 400 or all 500) produce dead interfaces.

## 4. Elevation

This system is tonal by doctrine. No ambient shadow is placed on cards at rest. Depth is conveyed entirely through the eight-step zinc surface hierarchy: as a surface rises above its parent, it moves one or two steps up the scale toward lighter zinc.

Shadows appear only as state responses: a glow on the brand logo mark, a ring around a focused input, a soft shadow under filled buttons signaling interactability.

### Shadow Vocabulary
- **Focus Ring** (`outline: 2px solid #6366f1; outline-offset: 2px`): Every focusable element. The only mandatory elevation signal in the system.
- **Focus Halo** (`box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2)`): Inputs and selects on focus; a soft ring beyond the 2px outline.
- **Brand Glow** (`box-shadow: 0 0 15px rgba(99, 102, 241, 0.2)`): The sidebar brand icon only. Marks the app's identity without making it structural.
- **Button Shadow** (`box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)`): Filled buttons at rest; collapsed on press via `scale(0.98)`. Signals interactability, not elevation.

### Named Rules
**The Flat-By-Default Rule.** Cards, panels, and list rows are flat at rest. A surface is elevated by its background color choice, not by a shadow. Shadows appear only when an element must assert its position above a sibling (floating tooltip, dropdown, command palette).

## 5. Components

Components are refined and precise: corners are deliberate (not maximum radius), padding is calibrated to content density, and every interactive state is declared before shipping.

### Buttons
- **Shape:** `rounded-lg` (8px). Never pill-shaped; never square.
- **Primary:** Electric indigo background, white text, 44px height, 24px horizontal padding. 13px Inter bold, tracking-tight. Active: `scale(0.98)`. Hover: `brightness(1.05)`.
- **Focus:** 2px solid indigo ring at 2px offset, plus 20% opacity halo.
- **Outline:** `surface-low` background, `outline-variant/30` border, `on-surface-muted` text. Hover: `surface` background, `on-surface` text.
- **Ghost:** Transparent background, `outline` text. Hover: `surface-container-low` background, `on-surface` text. Used for icon-only toolbar actions and non-critical secondary controls.
- **Destructive:** `alert-crimson` background, white text. Same shape and padding as primary. Appears only inside confirm dialogs, never as a first-click action.
- **Disabled:** 40% opacity, `pointer-events: none`.

### Inputs / Fields
- **Style:** `rounded-xl` (12px), 44px height, `surface-lowest` fill, `outline-variant/30` border.
- **Focus:** Border shifts to electric indigo; 2px ring at 20% opacity extends outward.
- **Placeholder:** `outline/60` opacity. Never below 60% (contrast minimum).
- **Hover:** Border shifts to `white/20`.
- **Disabled:** 40% opacity, `not-allowed` cursor.
- **Error:** Border shifts to `alert-crimson`; error message appears directly below in `alert-crimson` at 13px.
- **Date inputs:** `color-scheme: dark` applied globally so native pickers inherit the dark theme.

### Select
- **Style:** `rounded-lg` (8px), 38px height, `surface-container-low` fill, `outline-variant/15` border, JetBrains Mono font.
- **Focus:** Same indigo ring as Input.
- **Custom chevron:** `expand_more` Material Symbol at 16px, `outline` color, non-interactive overlay. Prevents browser default arrow.

### Cards / Containers
- **Corner Style:** `rounded-2xl` (16px).
- **Background:** `surface-low` (`#121214`).
- **Shadow Strategy:** None at rest (see Flat-By-Default Rule).
- **Border:** `outline-variant/15` (present for visual containment, nearly invisible).
- **Internal Padding:** 24px (`p-6`).

### Navigation (Sidebar)
- **Background:** `surface-lowest` (`#030303`), one step below cards.
- **Width states:** 64px (collapsed, icon-only) / 256px (expanded), animated with `0.25s ease`.
- **Active item:** `surface-high` background, electric indigo icon (FILL 1) + indigo-glow text. Never a left-stripe border accent.
- **Hover:** `surface-low` background, `on-surface` text.
- **Brand mark:** `rounded-lg` icon with indigo gradient fill, brand glow shadow.
- **User card (expanded):** Avatar initials circle (`surface-high` bg), email in Body, role in Label uppercase.
- **Logout:** Icon-only button when collapsed; inline in user card when expanded.
- **Mobile:** Full-width drawer with `bg-black/60 backdrop-blur-sm` overlay.

### Command Palette (Cmd+K)
- **Backdrop:** Full-screen, `backdrop-blur-sm`, `bg-black/60`, animates in at `0.15s ease-out`.
- **Panel:** `surface-high` fill, `rounded-2xl`, max-width 560px, appears at 20% from top. Animates in from `translateY(-10px) scale(0.97)`.
- **Input:** Borderless, `surface-high` bg, 15px Inter medium.
- **Results:** Grouped by type (Navigation, Projects, Users). Active row: `surface-bright` bg, electric indigo icon. Keyboard-navigable with Arrow + Enter.

### Confirm Dialog
- **Backdrop:** Same as command palette.
- **Panel:** `surface` fill, `rounded-2xl`, max-width 400px, `border-outline-variant/15`.
- **Variants:** Danger (destructive confirm button), Warning (amber icon), Info (indigo icon).
- **Confirm button:** Matches variant. Cancel is always `outline`.

### Skeleton Loading
- Gradient shimmer: `surface-high` to `surface-highest` to `surface-high`, 800px sweep, `1.5s ease-in-out infinite`.
- Applied to table rows, card placeholders, sidebar project list items during first load.

### Status Badges
- **Success:** `rgba(16,185,129,0.15)` background, `#10b981` text.
- **Error:** `rgba(248,113,113,0.15)` background, `#f87171` text.
- **Warning:** `rgba(245,158,11,0.15)` background, `#f59e0b` text.
- **Neutral:** `surface-highest/50` background, `on-surface-muted` text.
- Shape: full-radius pill (`rounded-full`), 11px Inter semibold, uppercase, 2px 8px padding.

### Config Key / Value Rows
- Key: JetBrains Mono, 13px, `on-surface` color, min-width 200px.
- Value: JetBrains Mono, 13px, `on-surface-muted` color.
- Row border: `outline-variant/15` bottom border.
- Hover: `surface-low` row background.
- Copy button: ghost icon button appears on row hover; `on-surface-variant` icon.

## 6. Do's and Don'ts

### Do:
- **Do** use the eight-step surface hierarchy to express depth; choose a surface's background by its level in the stack, not by preference.
- **Do** reserve electric indigo for one primary action per view. Rarity is the source of its authority.
- **Do** use JetBrains Mono for every configuration key, environment variable name, API token, and JSON value. Text and code must be visually separated at all times.
- **Do** declare all four states on every interactive element: default, hover, focus, disabled.
- **Do** place 2px solid indigo focus rings on every focusable element, accessible via both keyboard and mouse paths.
- **Do** use `ease-out` curves at 0.2-0.3s for all transitions. Nothing lingers.
- **Do** show skeleton shimmer states before data loads; blank screens without loading feedback feel broken.
- **Do** include a confirmation step for every destructive action; the user must commit twice to delete anything.
- **Do** translate configuration keys and technical fields into plain-language labels with helper hints. Per "Explain, Don't Assume": if a field is confusing without a label, the label is mandatory.

### Don't:
- **Don't** use `border-left` or `border-right` wider than 1px as a colored accent stripe on nav items, cards, or callouts. Use background tints or full borders instead.
- **Don't** use `background-clip: text` with a gradient. Use a single solid indigo or `on-surface` color for emphasis. Weight and size, not color gradients.
- **Don't** use `backdrop-filter: blur` decoratively. It appears only on the command palette backdrop and mobile sidebar overlay, both structural uses.
- **Don't** build a "hero metric" layout (big number, small label, gradient accent). Stat surfaces use icon plus value plus description, all in the same weight range.
- **Don't** build a grid of identical cards with icon, heading, and text repeated identically. Vary affordance: list rows for dense data, cards for navigable entities.
- **Don't** reach for a modal as the first response to a user action. Confirm dialogs are appropriate for destructive actions; for editing, prefer inline expansion or a side drawer.
- **Don't** use cryptic developer jargon in labels, headings, or validation messages. Every text element must be legible to a non-technical administrator.
- **Don't** let placeholder text fall below `outline/60` opacity. Minimum contrast for placeholder is enforced at that value.
- **Don't** animate layout properties (width, height, margin, padding). Only `transform` and `opacity` in CSS transitions.
- **Don't** use `#000000` or `#ffffff`. The darkest surface is `#030303`; the lightest text is `#f4f4f5`.
- **Don't** add glassmorphism to cards or content panels. The system communicates depth through tonal layers, not blur.
