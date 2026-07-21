# Design System Document: Precision Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Blueprint Aesthetic"**
Software Quality Assurance is the bridge between chaotic code and clinical precision. This design system moves away from the "generic corporate portfolio" by adopting an editorial layout inspired by high-end architectural blueprints and technical journals. We achieve a "Modern Professional" feel not through standard grids, but through **intentional asymmetry, expansive negative space, and tonal depth.**

The goal is to convey "Precision and Quality" through a UI that feels meticulously calibrated. By utilizing a "Low-Contrast, High-Symmetry" approach, we ensure the SQA Engineer’s work is perceived as methodical, bug-free, and premium.

---

## 2. Colors & Surface Architecture
This system utilizes a sophisticated blue-scale palette to create a sense of trust and technical authority.

### The Color Palette
*   **Primary (`#003f87`):** The "Ink" blue. Used for primary actions and brand anchoring.
*   **Primary Container (`#0056b3`):** The "Action" blue. Used for active states and focal points.
*   **Surface (`#f8f9fa`):** The "Canvas." A crisp, slightly off-white that reduces eye strain compared to pure `#ffffff`.
*   **On-Surface (`#191c1d`):** The "Lead." A deep dark gray for high-readability typography.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Traditional lines create visual clutter that contradicts "minimalism." 
*   **Sectioning:** Define boundaries solely through background color shifts. For example, a `surface-container-low` section should sit directly against a `surface` background.
*   **The Glass & Gradient Rule:** For hero sections or primary CTAs, use a subtle linear gradient from `primary` to `primary-container` (at a 135-degree angle) to provide a "liquid" depth that flat hex codes cannot achieve.

### Surface Hierarchy & Nesting
Treat the UI as a series of layered technical sheets.
*   **Level 0 (Base):** `surface` (`#f8f9fa`)
*   **Level 1 (Sub-sections):** `surface-container-low` (`#f3f4f5`)
*   **Level 2 (Cards/Modules):** `surface-container-lowest` (`#ffffff`)
*   **Level 3 (Floating Elements):** Glassmorphism (Surface color @ 80% opacity + 12px Backdrop Blur).

---

## 3. Typography: The Editorial Scale
We use a dual-font pairing to balance technical precision with modern readability.

*   **Display & Headlines (Manrope):** Chosen for its geometric purity. It feels "engineered" yet approachable.
    *   *Usage:* Use `display-lg` for Hero statements with a `-2%` letter-spacing to create a tight, high-end editorial look.
*   **Body & Labels (Inter):** The industry standard for legibility.
    *   *Usage:* All body text should use `body-md` or `body-lg`. Ensure a line-height of `1.6` for long-form case studies to emphasize "quality and clarity."

**Typography Hierarchy:**
*   **Display-LG (3.5rem):** Reserved for the engineer's name or primary value proposition.
*   **Headline-MD (1.75rem):** Used for project titles.
*   **Label-MD (0.75rem):** Used for technical tags (e.g., "Selenium", "Junit", "CI/CD") in All-Caps with `0.1rem` letter-spacing.

---

## 4. Elevation & Depth: Tonal Layering
In a "Minimalist" system, we avoid heavy shadows. Depth is communicated through light and transparency.

*   **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container` background. This creates a "Natural Lift."
*   **Ambient Shadows:** If an element must float (like a sticky header), use an ultra-diffused shadow:
    *   `box-shadow: 0 10px 40px -10px rgba(0, 63, 135, 0.08);` (A blue-tinted shadow feels more "connected" to the palette than gray).
*   **The "Ghost Border" Fallback:** For interactive inputs, use `outline-variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components & Interaction Patterns

### Buttons
*   **Primary:** Solid `primary` background with `on-primary` text. Use `rounded-md` (0.375rem) for a professional, sharp-but-safe corner.
*   **Secondary:** No background. Use a `ghost-border` (outline-variant @ 20%) and `primary` text.
*   **Hover State:** Shift background from `primary` to `primary-container`. Apply a `4px` vertical lift via transform.

### Precision Cards (Project Displays)
*   **Structure:** No borders. Use `surface-container-lowest` background.
*   **Spacing:** Enforce a strict `2rem` (32px) internal padding. 
*   **Content:** Project title in `headline-sm`, followed by a horizontally scrolling list of "Tech Stack" chips.

### Status Chips (The QA Signature)
*   **Design:** Use `secondary-container` backgrounds with `on-secondary-container` text. 
*   **Visual Cue:** Include a small 4px circular dot (the "Pass/Fail" indicator) to the left of the text to reinforce the SQA identity.

### Input Fields
*   **Style:** Minimalist. Only a bottom border (2px) using `outline-variant`. When focused, the border transitions to `primary` and the label slides up using `label-sm` styling.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use whitespace as a functional tool. If a section feels "crowded," double the padding.
*   **DO** use asymmetrical layouts (e.g., text on the left 60% of the screen, image/graphic overlapping the right 40%).
*   **DO** use "on-surface-variant" for helper text to create a clear visual hierarchy between data and labels.

### Don’t:
*   **DON'T** use pure black (`#000000`). It is too harsh for a "Modern Professional" aesthetic.
*   **DON'T** use 100% opaque dividers. If you must separate content, use a 1px `surface-variant` line at 40% opacity, or simply a 64px gap.
*   **DON'T** use "Standard" blue (`#0000FF`). Only use the defined `primary` and `primary-container` tokens to maintain the premium feel.
*   **DON'T** use "Heavy" rounded corners. Stick to the `md` (0.375rem) scale to keep the design feeling "Engineered."

---

## 7. Responsive Philosophy
*   **Desktop:** Utilize a 12-column grid but intentionally leave columns 1, 2, 11, and 12 empty for most content to create an "Editorial Margin."
*   **Mobile:** Collapse to a single column, but maintain the `surface` shifts to distinguish sections. Typography should scale down by exactly 15% to maintain the "Precision" feel on smaller screens.