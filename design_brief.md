# Design Brief: Kursverwaltungssystem

## 1. App Analysis
- **What:** A comprehensive course management system for managing courses, instructors, participants, rooms, and registrations
- **Who:** Administrative staff at educational institutions, training centers, or course providers
- **The ONE thing:** Getting a clear overview of all courses and their status at a glance
- **Primary actions:** Add new course, register participant, mark payment as done

## 2. What Makes This Design Distinctive
- **Visual identity:** Deep navy sidebar with amber accent — serious yet approachable, like a premium SaaS edu-platform
- **Layout strategy:** Fixed sidebar navigation + scrollable content area. Dashboard hero shows 5 KPI cards in a slightly asymmetric layout with the most important metric larger
- **Unique element:** Animated status pills for payment state (paid/unpaid) with a subtle pulse on unpaid items

## 3. Theme & Colors
- **Font:** Plus Jakarta Sans — confident, modern, slightly geometric. Used for both headings and body.
- **Google Fonts URL:** https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap
- **Color palette:**
  - Background: hsl(220, 20%, 97%) — cool off-white
  - Sidebar: hsl(222, 47%, 11%) — deep navy
  - Sidebar text: hsl(215, 20%, 65%)
  - Sidebar active: hsl(38, 92%, 50%) — warm amber
  - Primary accent: hsl(38, 92%, 50%) — amber
  - Card background: hsl(0, 0%, 100%)
  - Border: hsl(220, 13%, 91%)
  - Text primary: hsl(222, 47%, 11%)
  - Text secondary: hsl(220, 9%, 46%)
  - Success: hsl(142, 71%, 45%)
  - Warning: hsl(38, 92%, 50%)
  - Danger: hsl(0, 72%, 51%)

## 4. Mobile Layout
- Collapsible sidebar (hamburger menu)
- Single column content
- Sticky header with page title
- Bottom tab bar for main navigation on mobile

## 5. Desktop Layout
- Fixed 240px sidebar, content fills remaining width
- Content area: max-w-7xl, centered with padding
- Tables with horizontal scroll on smaller viewports
- Modal dialogs for create/edit forms

## 6. Components
- **Hero KPI:** Total active courses (large number, prominent)
- **Secondary KPIs:** Dozenten count, Teilnehmer count, Räume count, Anmeldungen today
- **Tables:** Sortable data tables with action buttons per row
- **Forms:** Modal-based forms with validation feedback
- **Status badges:** Paid/Unpaid, with color coding
- **Primary Action Button:** "+ Neu hinzufügen" — amber, prominent, top-right of each section

## 7. Visual Details
- Border radius: 12px for cards, 8px for inputs, 6px for badges
- Shadows: 0 1px 3px rgba(0,0,0,0.08) for cards, 0 8px 24px rgba(0,0,0,0.12) for modals
- Sidebar items: 8px border-radius, amber left border on active
- Transitions: 200ms ease for hover states, 300ms for sidebar collapse
- Table rows: subtle hover background
- Empty states: illustrated placeholder with action button

## 8. CSS Variables
```css
--background: 220 20% 97%;
--foreground: 222 47% 11%;
--card: 0 0% 100%;
--card-foreground: 222 47% 11%;
--primary: 38 92% 50%;
--primary-foreground: 222 47% 11%;
--secondary: 220 13% 91%;
--secondary-foreground: 222 47% 11%;
--muted: 220 13% 94%;
--muted-foreground: 220 9% 46%;
--accent: 38 92% 50%;
--accent-foreground: 222 47% 11%;
--border: 220 13% 91%;
--sidebar-bg: 222 47% 11%;
--sidebar-text: 215 20% 65%;
--sidebar-active: 38 92% 50%;
--success: 142 71% 45%;
--danger: 0 72% 51%;
```
