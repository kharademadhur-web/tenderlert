# TenderLert Design Guidelines

## Design Approach
**System-Based Approach**: Following modern SaaS patterns with Linear's clean typography, Stripe's professional restraint, and Notion's approachable UI. The platform serves Indian businesses seeking government tenders - design must balance professionalism with accessibility.

## Core Design Principles
1. **Business Credibility**: Professional, trustworthy interface for B2B users
2. **Information Clarity**: Dense data presentation (tenders, dates, amounts) must be scannable
3. **Efficiency First**: Quick access to critical tender information without decorative friction

## Typography System
**Font Stack**: Inter (via Google Fonts)
- **Display/Hero**: 48px (text-5xl), font-bold, tracking-tight
- **Page Headings**: 36px (text-4xl), font-semibold
- **Section Headings**: 24px (text-2xl), font-semibold
- **Card Titles**: 18px (text-lg), font-medium
- **Body Text**: 16px (text-base), font-normal
- **Small/Meta**: 14px (text-sm), font-normal
- **Micro/Labels**: 12px (text-xs), font-medium, uppercase, tracking-wide

## Layout System
**Spacing Units**: Use Tailwind units 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-6 to gap-8
- Container max-width: max-w-7xl

## Component Library

### Navigation
**Header**: Sticky top navigation with logo left, nav links center, CTA buttons right
- Background: backdrop-blur with subtle border
- Height: h-16
- Padding: px-6
- Links: text-sm with hover underline effect

### Marketing Pages

**Home Page Structure**:
1. Hero Section (90vh): Compelling headline + subheadline + dual CTA (Get Daily Alerts + View Pricing)
2. How It Works: 4-step process (Scrape → Classify → Match → Email) with icon cards
3. Supported Portals: 3-column grid showcasing GeM, eProcure, MahaTenders with logos/badges
4. Benefits: 3 key value propositions with illustrations
5. CTA Section: Strong final conversion prompt
6. Footer: Multi-column with links, contact, social

**Pricing Page**: 3-column comparison cards
- Card structure: rounded-2xl, border, p-8
- Highlight middle tier with border-blue-600 and subtle shadow
- Feature lists with checkmark icons
- Prominent CTA button in each card

**Contact Page**: Two-column layout
- Left: Contact form with Input fields (name, email, message textarea)
- Right: Contact information, office hours, support channels

**Register Page**: Centered form card (max-w-2xl)
- Clean single-column form with grouped sections
- Dropdown for Category selection with clear labels
- Progress indicator if multi-step
- Clear CTA: "Start Receiving Alerts"

### Dashboard Components

**Data Tables**: Clean, scannable tender listings
- Alternating row backgrounds (hover states)
- Compact row height with clear cell padding (px-4 py-3)
- Sticky header row
- Status badges for urgent/closing soon tenders
- Clickable rows with subtle hover lift

**Filter Controls**: 
- Pill-style category filters with active states
- Date range picker
- Portal selector (radio or pills)
- Applied filters with clear dismiss (x) buttons

**Stat Cards**: Dashboard metrics
- 4-column grid on desktop, stack on mobile
- Icon + number + label format
- Subtle background with border
- Compact padding (p-6)

**Admin Controls**:
- Action buttons with icons (Re-run categorization, Send alerts, Add tender)
- Danger actions (delete) with red accent
- Confirmation modals for destructive actions

### Forms & Inputs
**Input Fields**: Consistent styling
- Border: border-slate-300, rounded-lg
- Focus: ring-2, ring-blue-500
- Padding: px-4 py-2.5
- Labels: text-sm, font-medium, mb-2

**Buttons**:
- Primary: bg-blue-600, hover:bg-blue-700, text-white, rounded-lg, px-6 py-2.5
- Secondary: border-slate-300, hover:bg-slate-50, rounded-lg
- Disabled: opacity-50, cursor-not-allowed

## Images

**Hero Section**: Large hero image showing Indian professionals reviewing documents/laptops with tender portals visible on screens. Image should convey professionalism, government business context. Use as background with overlay gradient for text readability. Position: bg-cover with gradient overlay (from-blue-900/80 to-slate-900/60).

**How It Works Section**: Custom illustrations for each of 4 steps - consider using simple line icons or isometric illustrations showing the automated workflow.

**Benefits Section**: 3 supporting images or icons representing time-saving, comprehensive coverage, and smart categorization.

## Visual Treatment
- Subtle shadows for elevation (shadow-sm for cards, shadow-lg for modals)
- Rounded corners: rounded-lg for cards, rounded-xl for major sections
- Border treatments: border-slate-200 for light mode separation
- Backdrop blur effects on overlays and sticky navigation
- Minimal animations: smooth transitions on hover (transition-all duration-200)

## Responsive Breakpoints
- Mobile: Single column, stacked cards, hamburger menu
- Tablet (md): 2-column grids, condensed navigation
- Desktop (lg+): Full multi-column layouts, expanded navigation