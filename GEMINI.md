# Hearth Design System (Gemini)

## 1. Design Philosophy
**"Professional Minimalism"**
The Hearth interface should feel clean, spacious, and highly functional. We avoid clutter and unnecessary decoration. The aesthetic is grounded in a strong neutral geometric foundation. **Interactions are monochromatic** (black/gray/white) to maintain a serious, premium feel. Color is reserved strictily for primary call-to-actions.

### Core Tenets
-   **Content First**: UI chrome recedes; content stands out.
-   **Precision**: Alignments are exact. Spacing is rhythmic (8px grid).
-   **Monochromatic Interactions**: Hover, focus, and active states use neutral tones, not brand colors.
-   **Accessibility**: High contrast and clear hierarchy are non-negotiable.

---

## 2. Color Palette

### Neutrals (The Foundation)
We use a sophisticated neutral scale that avoids "dead" grays.
-   **Background**: `white` / `#0A0A0A` (Dark)
-   **Surface**: `#FAFAFA` / `#171717` (Dark)
-   **Border**: `#E5E5E5` / `#262626` (Dark)
-   **Text Primary**: `#171717` / `#EDEDED` (Dark)
-   **Text Secondary**: `#737373` / `#A3A3A3` (Dark)

### Brand Accent (The "Blue")
Used strictly for the Primary Action.
-   **Primary**: `#475569` (Slate-600) — *Professional, Muted, "Steel Blue"*
    -   *Dark Mode*: `#94A3B8` (Slate-400)
-   **Primary Subtle**: `#F1F5F9` / `#1E293B` (Slate-100/800)

*Note: If the "Hearth" name implies something else, we can swap this for a Deep Indigo depending on preference. For now, we lean into the "Hearth" warmth.*

### Semantic Colors
-   **Success**: `#10B981` (Emerald-500)
-   **Error**: `#EF4444` (Red-500)
-   **Warning**: `#F59E0B` (Amber-500)

---

## 3. Typography
Font Family: **Geist Sans** (Clean, modern, highly legible).

| Role | Weight | Size | Line Height |
| :--- | :--- | :--- | :--- |
| **H1** | SemiBold (600) | 2.25rem (36px) | 1.2 |
| **H2** | Medium (500) | 1.5rem (24px) | 1.3 |
| **H3** | Medium (500) | 1.25rem (20px) | 1.4 |
| **Body** | Regular (400) | 1rem (16px) | 1.5 |
| **Small** | Regular (400) | 0.875rem (14px) | 1.4 |
| **Tiny** | Medium (500) | 0.75rem (12px) | 1.4 |

---

## 4. Spacing & Layout
**The 4px / 8px Rule.**
All margins, paddings, and sizing should be multiples of 4, preferably 8.
-   **xs**: 4px
-   **sm**: 8px
-   **md**: 16px
-   **lg**: 24px
-   **xl**: 32px
-   **2xl**: 48px

**Border Radius**:
-   **sm**: 4px (Inputs, small buttons)
-   **md**: 8px (Cards, standard buttons)
-   **lg**: 12px (Modals, large containers)

---

## 5. UI Components

### Buttons
**Primary**:
-   Solid Brand Color background.
-   White text (or appropriate contrast).
-   Subtle hover lift or brightness shift.
-   Height: 40px (Medium).

**Secondary / Outline**:
-   Transparent background.
-   Border 1px solid `var(--border)`.
-   Text Primary.
-   Hover: Slight gray background `#F5F5F5` / `#262626`.

**Ghost**:
-   No border, no background.
-   Text Secondary -> Primary on hover.
-   Hover: Subtle background.

### Inputs
-   Height: 40px.
-   Border: 1px solid `var(--border)`.
-   Background: Transparent or very subtle off-white.
-   Focus: Ring with Brand Color (2px offset).
-   Radius: 6px or 8px.

### Cards
-   Background: Surface color or White.
-   Border: 1px solid `var(--border)`.
-   Shadow: `shadow-sm` (very subtle) or none.
-   Hover: Optional `shadow-md` for interactive cards.

---

## 6. Iconography
Use **Lucide React** or similar clean, stroke-based icons.
-   Stroke width: 1.5px or 2px.
-   Size: typically 16px (sm) or 20px (md).
