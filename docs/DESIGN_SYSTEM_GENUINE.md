# SAANS v2.0 - Genuine Mental Health Platform Design System

## Philosophy
Transform SAANS into a platform that feels like it's from someone who understands mental health struggles. Every design decision should communicate safety, trustworthiness, and hope.

**Core Principle**: Design for *people in pain*, not for beauty. If a design choice makes someone with anxiety or depression feel comfortable, it's good design.

---

## 1. Color Psychology & Usage

### Primary Color: Soft Teal (#2D6A6A)
- **Meaning**: Trust, calm, healing, water
- **Psychology**: Associated with tranquility, emotional balance, and healing
- **Usage**: 
  - Main buttons and CTAs
  - Header and navigation
  - Key UI elements
  - Doctor verification badges
- **Don't use for**: Danger, errors, or urgent warnings

### Secondary Color: Warm Beige (#D4C5B9)
- **Meaning**: Safety, warmth, human connection
- **Psychology**: Evokes comfort, nest-building, belonging
- **Usage**:
  - Secondary buttons
  - Accents and highlights
  - Card backgrounds
  - Call-to-action emphasis
- **Don't use for**: Primary actions or harsh warnings

### Accent Color: Soft Green (#7BA99C)
- **Meaning**: Growth, wellness, hope, recovery
- **Psychology**: Suggests renewal, healing, positive progress
- **Usage**:
  - Progress indicators
  - Positive milestones
  - Success messages
  - Recovery trajectories
  - Growth metrics
- **When used**: Always associated with progress or improvement

### Background Color: Off-white (#F7F5F3)
- **Meaning**: Clean, peaceful, breathing room
- **Psychology**: Feels calm and organized, not clinical
- **Usage**:
  - Primary background
  - Creates visual rest
  - Reduces eye strain for anxious users

### Status Colors
- **Success** (#5A9E8F): Soft, muted green - healing and progress
- **Warning** (#D4A574): Warm amber - careful attention without alarm
- **Error** (#C97C7C): Dusty rose - compassionate, not aggressive
- **Info** (#7BA99C): Soft teal - gentle guidance

---

## 2. Typography

### Font Family
- **Primary**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- **Why**: Familiar, accessible, fast to load
- **Fallback**: Arial, sans-serif for maximum compatibility

### Font Sizes & Hierarchy
```
Display: 48px - Page hero headlines
Heading 1: 36px - Major section headers
Heading 2: 28px - Section subheaders
Heading 3: 20px - Subsection headers
Body Large: 18px - Important content
Body: 16px - Primary text
Body Small: 14px - Secondary text, labels
Caption: 12px - Tertiary information, timestamps
```

### Line Height
- **Headers**: 1.2 - Tight, confident
- **Body**: 1.6 - Generous, readable for anxious readers
- **Caption**: 1.4 - Comfortable for small text

### Font Weight
- **Regular (400)**: Body text, primary content
- **Medium (500)**: Labels, secondary headers
- **Semibold (600)**: Headers, button text
- **Bold (700)**: Major headings, emphasis

### Readability for Mental Health Users
- Avoid all-caps text (feels like shouting)
- Use sufficient contrast (WCAG AAA target)
- Never use light gray text (hard to read for anxious users)
- Line length max 70 characters for body text (easier to follow)
- Generous margin between elements (reduces cognitive load)

---

## 3. Spacing & Whitespace

**Philosophy**: Mental health users need *breathing room*. Whitespace is healing.

### Spacing Scale
```
xs: 4px   - Micro-spacing
sm: 8px   - Small gaps
md: 12px  - Standard spacing
lg: 16px  - Generous spacing
xl: 24px  - Comfortable breathing room
2xl: 32px - Section separation
3xl: 48px - Major section gaps
4xl: 64px - Full section separation
```

### Padding Guidelines
- **Buttons**: 10px vertical, 20px horizontal (generous, not cramped)
- **Cards**: 24px padding (breathing room inside)
- **Section padding**: 48px top/bottom (generous spacing)
- **Container padding**: 16px on mobile, 24px on desktop

### Margins
- Never allow margins to collapse completely
- Use consistent spacing rhythm
- Avoid single-line gaps between sections (feels cramped)
- Stack sections with 48px+ gaps

---

## 4. Border Radius (Softness)

**Philosophy**: Soft corners reduce visual stress. Harsh 90° angles feel clinical and cold.

```
xs: 4px       - Minimal softness (small elements)
sm: 6px       - Subtle softening
md: 8px       - Comfortable softness
lg: 12px      - Noticeably soft
xl: 16px      - Very soft (cards, major elements)
2xl: 20px     - Very rounded (hero sections)
full: 9999px  - Perfect circles
```

### When to use each
- **0-4px**: Form inputs, small badges (exceptions when must be sharp)
- **8-12px**: Most buttons and cards
- **16px+**: Hero sections, major UI blocks
- **full**: Icons, avatars, perfect badges

---

## 5. Shadows (Softness & Depth)

**Philosophy**: Use soft shadows to create depth without harshness. No sharp shadows.

### Shadow Scale
```
xs: 0 1px 2px rgba(45, 106, 106, 0.05)
    - Subtle depth for minimal elements

sm: 0 1px 3px rgba(45, 106, 106, 0.1), 0 1px 2px rgba(45, 106, 106, 0.06)
    - Small cards, input fields

md: 0 4px 6px rgba(45, 106, 106, 0.1), 0 2px 4px rgba(45, 106, 106, 0.06)
    - Standard cards, buttons

lg: 0 10px 15px rgba(45, 106, 106, 0.1), 0 4px 6px rgba(45, 106, 106, 0.05)
    - Prominent cards, modals

xl: 0 20px 25px rgba(45, 106, 106, 0.15), 0 10px 10px rgba(45, 106, 106, 0.05)
    - Hero sections, floating elements
```

### Shadow Rules
- Use teal as base shadow color (feels warm, not cold/black)
- Soften all shadows with transparency
- Avoid hard, black shadows (feels clinical)
- On hover: increase shadow by one level (tactile feedback)

---

## 6. Animation Principles

**Philosophy**: Animations should feel human and calming, not frantic or jarring.

### Breathing Animation
```css
@keyframes breathe {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}
```
- **Use for**: Meditation guidance, relaxation prompts, subtle focus elements
- **Duration**: 4 seconds (matches human breathing)
- **Effect**: Very subtle - only 2% scale change

### Gentle Pulse
```css
@keyframes gentle-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```
- **Use for**: Important notifications, SOS button, crisis alerts
- **Duration**: 2 seconds (gets attention without being jarring)
- **Effect**: Subtle opacity change (never more than 30%)

### Soft Fade In
```css
@keyframes soft-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```
- **Use for**: Page loads, new content appearing
- **Duration**: 0.5 seconds (not too fast, not too slow)
- **Translate**: 8px vertical (gentle, not dramatic)

### Transition Timings
- **Fast**: 150ms (hover effects, micro-interactions)
- **Base**: 300ms (standard transitions, button clicks)
- **Slow**: 500ms (page transitions, loading states)

### Animation Rules
- Never use more than 300ms for user interactions (feels sluggish after that)
- Use ease-out timing (starts fast, ends slow - natural)
- Avoid simultaneous animations (feels frantic)
- Animations should feel like breathing, not racing

---

## 7. Components

### Button Styles

**Gentle Primary Button**
- Background: Soft teal
- Padding: 10px vertical, 20px horizontal (generous)
- Border radius: 12px
- Shadow: xs (minimal depth)
- Hover: Lighter shade + increased shadow + slight lift
- Transition: 300ms

**Gentle Secondary Button**
- Background: Warm beige
- Color: Soft teal text
- Padding: Same as primary
- Border: 1px soft border (optional)
- Hover: Lighter background + increased shadow

**Danger/Crisis Button**
- Background: Dusty rose (#C97C7C)
- Animation: Gentle pulse (not aggressive)
- Shadow: md (visible but not harsh)
- On hover: Scale up slightly (feels welcoming, not threatening)

### Cards
- Background: White with 1px border
- Padding: 24px (generous)
- Border radius: 16px
- Shadow: sm (subtle depth)
- Hover: Shadow increases to md + slight lift (2px)
- Transition: all 300ms

### Input Fields
- Background: Off-white with subtle border
- Padding: 12px 16px (comfortable)
- Border radius: 8px
- Border: 1px solid light gray
- Focus: Border color → soft teal + shadow md
- Placeholder: Soft gray (not dark)

### Doctor/Therapist Cards
- Include verification badge
- Show rating and review count
- Display languages and specializations
- Show response time guarantee
- Insurance acceptance visible
- "Book appointment" button prominent

### Trust Badges
- Background: Soft green + light background
- Icon: Checkmark or verification symbol
- Padding: 6px 12px (compact, informational)
- Border radius: 9999px (pill shape)
- Text: Soft teal text on green background

### SOS/Crisis Button
- Always visible (sticky or footer)
- Background: Dusty rose
- Animation: Gentle pulse
- Text: "SOS" or "Crisis Support"
- On click: Open crisis resources modal (not redirect)
- Never hide or de-emphasize

---

## 8. Real Imagery Guidelines

### Photography Style
- **Real people** - Not models. Authentic faces with authentic emotions.
- **Diversity** - Represent all ethnicities, ages, abilities, gender expressions
- **Emotions** - Show real struggles (not just smiling faces)
- **Connection** - People supporting each other, not alone
- **Nature** - Water, forests, peaceful natural scenes for healing
- **Color**: Use images that complement the soft teal/beige/green palette

### When to Use Real Photos
- Doctor/therapist profiles (must have real photo)
- Patient testimonials (optional, privacy-first)
- Hero sections (peaceful, healing imagery)
- Recovery stories (authentic transformation)

### When NOT to Use Photos
- Avoid stock photo models (feels inauthentic)
- Never use photos of people in distress without context
- Avoid clinical/medical imagery (feels cold)
- Skip photos in dense UI (reduces readability)

### Illustrations
- Soft, rounded style (not sharp/angular)
- Warm color palette (use design colors)
- Diverse representation
- Meaningful (not just decorative)
- Use for: Meditation, breathing exercises, wellness tips

---

## 9. Accessibility Requirements (Target: WCAG AAA)

### Color Contrast
- **AA Minimum**: 4.5:1 for normal text
- **AAA Target**: 7:1 for normal text
- **Large text**: 3:1 (AA), 4.5:1 (AAA)
- All status colors must meet AAA for body text

### Text & Readability
- Minimum font size: 14px (no tiny text)
- Line height minimum: 1.5
- Line length maximum: 70 characters (body text)
- All caps text: Avoid (feels like shouting)
- Avoid light gray text (hard for dyslexic readers)

### Motion & Animation
- Respect `prefers-reduced-motion` media query
- All animations must be pausable
- No auto-playing videos or audio
- Blinking elements: Maximum 3 times then stop

### Forms
- Labels always visible (never placeholder-only)
- Error messages clear and specific
- Focus outline: Always visible and clear
- Required fields: Marked with asterisk AND aria-required

### Navigation
- Keyboard accessible (all elements reachable via Tab)
- Focus order logical and visible
- Skip navigation links (for screen readers)
- Mobile-friendly touch targets (48px minimum)

### Images
- Alt text for all meaningful images
- Descriptions for complex visualizations
- Decorative images: `alt=""` (hidden from screen readers)

---

## 10. Dark Mode Support

SAANS should work beautifully in both light and dark modes. Use CSS custom properties:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #1A2626;
    --color-bg-secondary: #232E2E;
    --color-text-primary: #EDF0F0;
  }
}
```

- **Dark backgrounds**: Use teal-tinted very dark colors (not pure black)
- **Dark text**: Use off-white (not pure white - easier on eyes)
- **Colors**: Stay consistent - primary color should be same in light/dark
- **Shadows**: Use lighter shadows on dark backgrounds

---

## 11. Component Library (To Build)

### Phase 1: Core Components
- [ ] SafetyHeader - Crisis hotline always visible
- [ ] TrustBadge - Doctor verified badge
- [ ] VerificationCheck - License/credential indicator
- [ ] CalmAnimation - Breathing animation component
- [ ] PatientStory - Testimonial display
- [ ] DoctorCard - Enhanced doctor profile card
- [ ] MoodCheckin - Gentle mood tracking
- [ ] CrisisButton - SOS button (always visible)

### Phase 2: Advanced Components
- [ ] ProgressChart - Recovery milestone visualization
- [ ] SafetyPlan - Personal crisis plan builder
- [ ] AppointmentCalendar - Easy booking interface
- [ ] ReviewRating - Star rating with verified badge
- [ ] MedicationTracker - Health history visualization
- [ ] SupportGroup - Peer connection interface

---

## 12. Common Patterns

### Page Structure
```
SafetyHeader (always visible)
  ↓
Main Content (generous padding)
  ↓
CallToAction Section (centered, warm colors)
  ↓
Footer (trust & resources)
```

### Card Section Pattern
```
Card Title (28px, semibold)
  ↓
Card Subtitle (16px, secondary color)
  ↓
Card Body (generous padding, line-height 1.6)
  ↓
Card Action (button or link)
```

### Doctor Discovery Flow
```
1. Search/Filter (location, specialty, language, insurance)
  ↓
2. Doctor List (cards with trust badges)
  ↓
3. Doctor Detail (verification, reviews, availability)
  ↓
4. Book Appointment (calendar, confirmation)
```

---

## 13. Token Values

All CSS custom properties are defined in `/saans-web/src/styles/colors-genuine.css`

```css
--color-primary: #2D6A6A
--color-accent: #7BA99C
--color-secondary: #D4C5B9
--color-bg-primary: #F7F5F3
--color-text-primary: #2D3E3E
--radius-lg: 12px
--space-xl: 24px
--shadow-md: 0 4px 6px rgba(...)
--transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

Use these throughout all components for consistency.

---

## 14. Success Criteria

A component is "genuine" when it:
- ✓ Feels warm and human (not clinical)
- ✓ Uses soft colors and rounded shapes
- ✓ Provides generous whitespace
- ✓ Works for someone with anxiety (calm, not jarring)
- ✓ Meets WCAG AAA accessibility
- ✓ Shows real people and real credentials
- ✓ Prioritizes trust over beauty
- ✓ Always provides crisis support access
- ✓ Uses natural, breathing animations
- ✓ Communicates healing and hope

---

## 15. Implementation Checklist

### Frontend Components
- [ ] Update LandingPage with new colors and messaging
- [ ] Create SafetyHeader component
- [ ] Create DoctorCard component with trust badges
- [ ] Create PatientStory component
- [ ] Create CrisisButton component
- [ ] Create MoodCheckin component
- [ ] Redesign FindTherapistPage with map + filters
- [ ] Create StoriesPage with timeline view

### Backend Data Models
- [ ] Enhance Therapist model (credentials, languages, insurance, verification)
- [ ] Create PatientStory model
- [ ] Create DoctorReview model (verified reviews only)
- [ ] Create MedicalRecord model (HIPAA-compliant)
- [ ] Create MedicationHistory model

### Services & APIs
- [ ] DoctorDiscoveryService (find, filter, match doctors)
- [ ] DoctorVerificationService (license checking, background verification)
- [ ] StoriesService (create, verify, display patient stories)
- [ ] ProgressTrackingService (milestone visualization)
- [ ] MedicalRecordsService (secure health history)

### Pages to Create/Redesign
- [ ] LandingPage - Genuine, empathetic redesign
- [ ] FindDoctorPage - Map-based discovery with filters
- [ ] StoriesPage - Browse inspiring recovery stories
- [ ] AssessmentPage - Quick mental health assessment
- [ ] SafetyPlanPage - Emergency preparedness tool
- [ ] TrustCenterPage - Transparency & credibility
- [ ] MedicalRecordsPage - Secure health history (HIPAA)
- [ ] ProgressPage - Recovery visualization

---

**Next Steps**: Start implementing Phase 1 components and landing page redesign.
