# Advanced CSS Features Implementation Guide

## Overview
This guide explains all the advanced CSS features added to the SAANS Mental Health Platform. These features include animations, glassmorphism effects, gradients, hover effects, and scroll animations.

---

## 1. Global Animation Keyframes

### Available Animations

#### Pulse Animation
```jsx
<div className="animate-pulse-smooth">
  This element pulses smoothly
</div>
```

#### Bounce Animation
```jsx
<button className="animate-bounce-smooth">
  Click me
</button>
```

#### Slide Animations
```jsx
<div className="animate-slide-in-left">Left slide</div>
<div className="animate-slide-in-right">Right slide</div>
<div className="animate-slide-in-top">Top slide</div>
<div className="animate-slide-in-bottom">Bottom slide</div>
```

#### Fade Animations
```jsx
<div className="animate-fade-in">Fades in</div>
```

#### Scale Animation
```jsx
<div className="animate-scale-in">Scales in smoothly</div>
```

#### Blob Animation (for background elements)
```jsx
<div className="animate-blob">
  Background blob animation
</div>
```

#### Float Animation
```jsx
<div className="animate-float">
  Floating element
</div>
```

#### Shimmer Animation
```jsx
<div className="animate-shimmer">
  Shimmer effect
</div>
```

#### Rotate Animation
```jsx
<div className="animate-rotate-360">
  Spinning element
</div>
```

---

## 2. Animation Delays

Use these classes to stagger animations for multiple elements:

```jsx
<div className="animate-fade-in animation-delay-100">First</div>
<div className="animate-fade-in animation-delay-200">Second</div>
<div className="animate-fade-in animation-delay-300">Third</div>
<div className="animate-fade-in animation-delay-500">Fourth</div>
<div className="animate-fade-in animation-delay-700">Fifth</div>
<div className="animate-fade-in animation-delay-1000">Sixth</div>
<div className="animate-fade-in animation-delay-2000">Seventh</div>
<div className="animate-fade-in animation-delay-4000">Eighth</div>
```

---

## 3. Glassmorphism Effects

### Simple Glass Effect
```jsx
<div className="glass-effect rounded-lg p-4">
  This has a glass effect
</div>
```

### Strong Glass Effect
```jsx
<div className="glass-effect-strong rounded-xl p-6">
  This has a stronger glass effect
</div>
```

### Glass Card
```jsx
<div className="glass-card">
  <h3>Glass Card</h3>
  <p>Automatically includes hover effects</p>
</div>
```

### Glass Card Strong
```jsx
<div className="glass-card-strong">
  <h3>Strong Glass Card</h3>
  <p>More pronounced blur effect</p>
</div>
```

---

## 4. Gradient Backgrounds

### Pre-built Gradients
```jsx
// Warm gradient
<div className="gradient-warm">Warm colors</div>

// Cool gradient
<div className="gradient-cool">Cool colors</div>

// Calm gradient
<div className="gradient-calm">Calming colors</div>

// Nature gradient
<div className="gradient-nature">Green nature colors</div>

// Sunset gradient
<div className="gradient-sunset">Sunset colors</div>

// Ocean gradient
<div className="gradient-ocean">Ocean colors</div>

// Animated mesh gradient
<div className="gradient-mesh">
  Animated mesh background
</div>
```

### Gradient Text
```jsx
<h1 className="gradient-text">
  This text has a gradient color
</h1>
```

### Per-Page Gradients (using React Router)
Each page automatically gets a unique gradient. See `usePageGradient()` hook for mapping.

**Current page gradients:**
- Dashboard: Slate blue
- AI Counselor: Purple
- Find Therapist: Blue/Cyan
- Mood Tracker: Green
- Community: Orange/Yellow
- Crisis Support: Red
- Profile: Indigo/Purple
- Login/Register: Teal

---

## 5. Hover Effects

### Lift Effect
```jsx
<div className="hover-lift">
  Lifts up on hover
</div>
```

### Scale Effect
```jsx
<div className="hover-scale">
  Scales up to 1.05x
</div>

<div className="hover-scale-sm">
  Scales up to 1.02x (subtle)
</div>
```

### Glow Effects
```jsx
<div className="hover-glow">
  Glows blue on hover
</div>

<div className="hover-glow-purple">
  Glows purple on hover
</div>

<div className="hover-glow-pink">
  Glows pink on hover
</div>
```

### Blur Effect
```jsx
<div className="hover-blur">
  Increases blur on hover
</div>
```

---

## 6. Cursor Feedback

### Glow Cursor Effect
```jsx
<button className="cursor-glow">
  Button with glow effect on hover
</button>
```

### Interactive Element
```jsx
<div className="interactive-element">
  Click me - I scale down when clicked
</div>
```

---

## 7. Scroll Animations

### Fade In on Scroll
```jsx
<div className="scroll-fade-in">
  This fades in when scrolled into view
</div>
```

### Fade In From Directions
```jsx
<div className="scroll-fade-in-up">
  Fades in from bottom
</div>

<div className="scroll-fade-in-left">
  Fades in from left
</div>

<div className="scroll-fade-in-right">
  Fades in from right
</div>
```

### Zoom In on Scroll
```jsx
<div className="scroll-zoom-in">
  Zooms in when scrolled into view
</div>
```

### Rotate In on Scroll
```jsx
<div className="scroll-rotate-in">
  Rotates and scales in when scrolled
</div>
```

### Staggered Scroll Animation
```jsx
<div className="grid grid-cols-3 gap-4">
  <div className="scroll-fade-in-up scroll-item-1">Item 1</div>
  <div className="scroll-fade-in-up scroll-item-2">Item 2</div>
  <div className="scroll-fade-in-up scroll-item-3">Item 3</div>
  <div className="scroll-fade-in-up scroll-item-4">Item 4</div>
  <div className="scroll-fade-in-up scroll-item-5">Item 5</div>
  <div className="scroll-fade-in-up scroll-item-6">Item 6</div>
</div>
```

### Using the useScrollAnimation Hook
```jsx
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function MyPage() {
  useScrollAnimation();
  
  return (
    <div>
      <div className="scroll-fade-in">Animates on scroll</div>
      <div className="scroll-fade-in">Animates on scroll</div>
    </div>
  );
}
```

---

## 8. Page Transitions

### Automatic Page Transitions
All pages are already wrapped with PageTransition component in App.tsx. This automatically applies smooth fade-in animations.

### Manual Usage
```jsx
import PageTransition from '../components/PageTransition';

export function MyPage() {
  return (
    <PageTransition>
      <div>Page content that fades in</div>
    </PageTransition>
  );
}
```

### Custom Page Transition
```jsx
<PageTransition className="custom-animation-class">
  <div>Custom transition</div>
</PageTransition>
```

---

## 9. Suspense Loading

All page loads now show a smooth loading spinner while content is being fetched.

### Automatic (already in use)
App.tsx uses `<SuspenseLoading />` as the fallback for all page loads.

### Manual Usage
```jsx
import SuspenseLoading from '../components/SuspenseLoading';

<React.Suspense fallback={<SuspenseLoading />}>
  <YourComponent />
</React.Suspense>
```

### Custom Message
```jsx
<React.Suspense fallback={<SuspenseLoading message="Loading therapists..." />}>
  <TherapistList />
</React.Suspense>
```

---

## 10. Enhanced Button Styles

### Shine Effect on Click
```jsx
<button className="btn-shine bg-blue-500 text-white px-4 py-2 rounded">
  Click for ripple effect
</button>
```

---

## 11. Card Enhancements

### Card Hover Effect
```jsx
<div className="card-hover bg-white rounded-lg p-6">
  <h3>Hover me</h3>
  <p>I lift up on hover</p>
</div>
```

---

## 12. Text Animations

### Shimmer Text
```jsx
<h1 className="text-shimmer">
  Shimmering text effect
</h1>
```

---

## 13. Focus and Active States

### Input Focus Glow
```jsx
<input 
  type="text" 
  className="input-focus-glow border rounded px-3 py-2"
  placeholder="Type here"
/>
```

---

## 14. Loading Skeleton

For loading states of lists or grids:

```jsx
<div className="skeleton rounded-lg h-24 w-full mb-4"></div>
<div className="skeleton rounded-lg h-24 w-full mb-4"></div>
<div className="skeleton rounded-lg h-24 w-full"></div>
```

---

## 15. Using usePageGradient Hook

```jsx
import { usePageGradient } from '../hooks/usePageGradient';

export function MyPage() {
  const gradientClass = usePageGradient();
  
  return (
    <div className={`min-h-screen ${gradientClass}`}>
      Page content
    </div>
  );
}
```

---

## 16. Complete Example: Animated Dashboard Card

```jsx
import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function DashboardCard() {
  useScrollAnimation();

  return (
    <div className="scroll-fade-in-up scroll-item-1">
      <div className="glass-card-strong hover-lift hover-glow cursor-glow">
        <div className="animate-slide-in-top animation-delay-100">
          <h3 className="text-2xl font-bold mb-4">
            <span className="animate-pulse-smooth">🧠</span>
            AI Counselor
          </h3>
        </div>
        
        <p className="mb-6 text-white/80">
          Chat with our advanced AI counselor 24/7
        </p>
        
        <button className="btn-shine w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105">
          Start Chat Now
        </button>
      </div>
    </div>
  );
}
```

---

## Best Practices

1. **Don't overuse animations** - Use them to guide user attention, not distract
2. **Respect prefers-reduced-motion** - Consider users with motion sensitivity
3. **Animation timing** - Keep animations under 1 second for UI feedback
4. **Combine effects** - Layer animations for richer interactions
5. **Test performance** - Monitor FPS on mobile devices
6. **Use appropriate delays** - Stagger animations for visual hierarchy
7. **Keep scrolling smooth** - Avoid heavy computations during scroll events

---

## Troubleshooting

### Animations not showing?
- Ensure the CSS file is imported in your component
- Check that you're using the correct class names
- Verify no conflicting CSS is overriding the animations

### Performance issues?
- Reduce the number of simultaneously animating elements
- Use `will-change` property on frequently animated elements
- Consider disabling animations on low-end devices

### Scroll animations not triggering?
- Ensure `useScrollAnimation()` hook is called in the page component
- Check that elements have the correct class names (scroll-fade-in, etc.)
- Verify the IntersectionObserver is supported in target browsers

---

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with -webkit- prefixes for backdrop-filter)
- Mobile browsers: Full support for most features

---

## Performance Tips

1. Use `transform` and `opacity` for smooth animations
2. Avoid animating `width`, `height`, or `position` properties
3. Use `will-change` sparingly for frequently animated elements
4. Lazy load animations with Intersection Observer
5. Debounce scroll event handlers

---

## Future Enhancements

- Add more gradient presets
- Implement motion preferences detection
- Add animation presets library
- Create animation builder utility
- Add accessibility improvements for animations

---

For more information or to add new animations, edit the `/src/index.css` file and the respective hooks in `/src/hooks/`.
