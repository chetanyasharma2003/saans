import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

/**
 * CSSFeaturesShowcase Component
 *
 * Demonstrates all available CSS features:
 * - Global animations (pulse, bounce, slide, fade, etc.)
 * - Glassmorphism effects
 * - Gradient backgrounds
 * - Hover effects
 * - Scroll animations
 * - Smooth transitions
 *
 * This is a reference component - use it to understand how to apply
 * these features to your own components.
 */
export function CSSFeaturesShowcase() {
  useScrollAnimation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 text-center mb-20">
        <h1 className="text-5xl font-bold text-white mb-6 animate-slide-in-top">
          <span className="gradient-text">Advanced CSS Features</span>
        </h1>
        <p className="text-xl text-white/70 animate-slide-in-top animation-delay-200">
          Smooth animations, glassmorphism, and interactive effects
        </p>
      </div>

      {/* Animations Section */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold text-white mb-12 scroll-fade-in-left">
          Global Animations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pulse */}
          <div className="scroll-fade-in-up scroll-item-1">
            <div className="glass-card">
              <div className="text-4xl animate-pulse-smooth mb-4">💫</div>
              <h3 className="text-lg font-bold text-white mb-2">Pulse</h3>
              <p className="text-white/70 text-sm">
                Smooth pulsing animation for attention
              </p>
            </div>
          </div>

          {/* Bounce */}
          <div className="scroll-fade-in-up scroll-item-2">
            <div className="glass-card">
              <div className="text-4xl animate-bounce-smooth mb-4">🎾</div>
              <h3 className="text-lg font-bold text-white mb-2">Bounce</h3>
              <p className="text-white/70 text-sm">
                Smooth bouncing motion effect
              </p>
            </div>
          </div>

          {/* Float */}
          <div className="scroll-fade-in-up scroll-item-3">
            <div className="glass-card">
              <div className="text-4xl animate-float mb-4">🪶</div>
              <h3 className="text-lg font-bold text-white mb-2">Float</h3>
              <p className="text-white/70 text-sm">
                Gentle floating animation
              </p>
            </div>
          </div>

          {/* Scale */}
          <div className="scroll-fade-in-up scroll-item-4">
            <div className="glass-card">
              <div className="text-4xl animate-scale-in mb-4">📏</div>
              <h3 className="text-lg font-bold text-white mb-2">Scale</h3>
              <p className="text-white/70 text-sm">
                Smooth scaling animation on load
              </p>
            </div>
          </div>

          {/* Shimmer */}
          <div className="scroll-fade-in-up scroll-item-5">
            <div className="glass-card">
              <div className="text-4xl animate-shimmer mb-4">✨</div>
              <h3 className="text-lg font-bold text-white mb-2">Shimmer</h3>
              <p className="text-white/70 text-sm">
                Shimmer effect for loading states
              </p>
            </div>
          </div>

          {/* Rotate */}
          <div className="scroll-fade-in-up scroll-item-6">
            <div className="glass-card">
              <div className="text-4xl animate-rotate-360 mb-4">🔄</div>
              <h3 className="text-lg font-bold text-white mb-2">Rotate</h3>
              <p className="text-white/70 text-sm">
                Continuous rotation animation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Glassmorphism Section */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold text-white mb-12 scroll-fade-in-left animation-delay-200">
          Glassmorphism Effects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Simple Glass */}
          <div className="scroll-fade-in-right scroll-item-1">
            <div className="glass-effect rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">Simple Glass</h3>
              <p className="text-white/80 mb-4">
                Light frosted glass effect with subtle blur and transparency.
              </p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
                Learn More
              </button>
            </div>
          </div>

          {/* Strong Glass */}
          <div className="scroll-fade-in-right scroll-item-2 animation-delay-200">
            <div className="glass-effect-strong rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">Strong Glass</h3>
              <p className="text-white/80 mb-4">
                More pronounced frosted glass with increased blur effect.
              </p>
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hover Effects Section */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold text-white mb-12 scroll-fade-in-left animation-delay-400">
          Hover Effects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Lift */}
          <div className="scroll-fade-in-up scroll-item-1 animation-delay-100">
            <div className="hover-lift glass-card cursor-pointer">
              <h3 className="text-lg font-bold text-white mb-2">Lift</h3>
              <p className="text-white/70 text-sm mb-4">
                Element lifts up on hover with shadow
              </p>
              <div className="text-3xl animate-float">🚀</div>
            </div>
          </div>

          {/* Scale */}
          <div className="scroll-fade-in-up scroll-item-2 animation-delay-200">
            <div className="hover-scale glass-card cursor-pointer">
              <h3 className="text-lg font-bold text-white mb-2">Scale</h3>
              <p className="text-white/70 text-sm mb-4">
                Element scales up on hover
              </p>
              <div className="text-3xl">📈</div>
            </div>
          </div>

          {/* Glow */}
          <div className="scroll-fade-in-up scroll-item-3 animation-delay-300">
            <div className="hover-glow glass-card cursor-pointer">
              <h3 className="text-lg font-bold text-white mb-2">Glow</h3>
              <p className="text-white/70 text-sm mb-4">
                Element glows on hover
              </p>
              <div className="text-3xl">💡</div>
            </div>
          </div>

          {/* Glow Purple */}
          <div className="scroll-fade-in-up scroll-item-4 animation-delay-400">
            <div className="hover-glow-purple glass-card cursor-pointer">
              <h3 className="text-lg font-bold text-white mb-2">Glow Purple</h3>
              <p className="text-white/70 text-sm mb-4">
                Purple glow on hover
              </p>
              <div className="text-3xl">💜</div>
            </div>
          </div>

          {/* Glow Pink */}
          <div className="scroll-fade-in-up scroll-item-5 animation-delay-500">
            <div className="hover-glow-pink glass-card cursor-pointer">
              <h3 className="text-lg font-bold text-white mb-2">Glow Pink</h3>
              <p className="text-white/70 text-sm mb-4">
                Pink glow on hover
              </p>
              <div className="text-3xl">🌸</div>
            </div>
          </div>

          {/* Scale Small */}
          <div className="scroll-fade-in-up scroll-item-6 animation-delay-700">
            <div className="hover-scale-sm glass-card cursor-pointer">
              <h3 className="text-lg font-bold text-white mb-2">Scale Small</h3>
              <p className="text-white/70 text-sm mb-4">
                Subtle scale effect
              </p>
              <div className="text-3xl">🎯</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gradient Section */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold text-white mb-12 scroll-fade-in-left animation-delay-600">
          Gradient Backgrounds
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Warm */}
          <div className="scroll-zoom-in scroll-item-1">
            <div className="gradient-warm rounded-2xl p-8 h-40 flex items-center justify-center text-white font-bold text-lg">
              Warm Gradient
            </div>
          </div>

          {/* Cool */}
          <div className="scroll-fade-in-zoom scroll-item-2 animation-delay-100">
            <div className="gradient-cool rounded-2xl p-8 h-40 flex items-center justify-center text-white font-bold text-lg">
              Cool Gradient
            </div>
          </div>

          {/* Calm */}
          <div className="scroll-fade-in-zoom scroll-item-3 animation-delay-200">
            <div className="gradient-calm rounded-2xl p-8 h-40 flex items-center justify-center text-white font-bold text-lg">
              Calm Gradient
            </div>
          </div>

          {/* Nature */}
          <div className="scroll-fade-in-zoom scroll-item-4 animation-delay-300">
            <div className="gradient-nature rounded-2xl p-8 h-40 flex items-center justify-center text-white font-bold text-lg">
              Nature Gradient
            </div>
          </div>

          {/* Sunset */}
          <div className="scroll-fade-in-zoom scroll-item-5 animation-delay-400">
            <div className="gradient-sunset rounded-2xl p-8 h-40 flex items-center justify-center text-white font-bold text-lg">
              Sunset Gradient
            </div>
          </div>

          {/* Ocean */}
          <div className="scroll-fade-in-zoom scroll-item-6 animation-delay-500">
            <div className="gradient-ocean rounded-2xl p-8 h-40 flex items-center justify-center text-white font-bold text-lg">
              Ocean Gradient
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Animations Section */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold text-white mb-12 scroll-fade-in-left animation-delay-800">
          Scroll Animations
        </h2>

        <div className="space-y-6">
          <div className="scroll-fade-in-up">
            <div className="glass-card-strong">
              <h3 className="text-lg font-bold text-white mb-2">Fade In Up</h3>
              <p className="text-white/80">
                This element fades in and slides up as you scroll
              </p>
            </div>
          </div>

          <div className="scroll-fade-in-left animation-delay-100">
            <div className="glass-card-strong">
              <h3 className="text-lg font-bold text-white mb-2">Fade In Left</h3>
              <p className="text-white/80">
                This element fades in from the left side
              </p>
            </div>
          </div>

          <div className="scroll-fade-in-right animation-delay-200">
            <div className="glass-card-strong">
              <h3 className="text-lg font-bold text-white mb-2">Fade In Right</h3>
              <p className="text-white/80">
                This element fades in from the right side
              </p>
            </div>
          </div>

          <div className="scroll-zoom-in animation-delay-300">
            <div className="glass-card-strong">
              <h3 className="text-lg font-bold text-white mb-2">Zoom In</h3>
              <p className="text-white/80">
                This element zooms in as you scroll
              </p>
            </div>
          </div>

          <div className="scroll-rotate-in animation-delay-400">
            <div className="glass-card-strong">
              <h3 className="text-lg font-bold text-white mb-2">Rotate In</h3>
              <p className="text-white/80">
                This element rotates and scales in
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="scroll-fade-in-up">
          <div className="glass-card-strong hover-lift cursor-glow">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Use These Features?
            </h2>
            <p className="text-white/80 mb-8">
              Check out the CSS_FEATURES_GUIDE.md file for detailed usage examples and best practices.
            </p>
            <button className="btn-shine bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-xl transition transform hover:scale-105">
              Explore the Guide
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CSSFeaturesShowcase;
