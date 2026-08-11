import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

/**
 * EnhancedCardExample Component
 *
 * This is a practical example showing how to combine multiple CSS features
 * to create beautiful, interactive cards. Copy this pattern to your components.
 */
export function EnhancedCardExample() {
  useScrollAnimation();

  return (
    <div className="page-enter">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header with animation */}
          <div className="mb-16 text-center">
            <h1 className="text-5xl font-bold text-white mb-4 animate-slide-in-top">
              Enhanced Card Patterns
            </h1>
            <p className="text-lg text-white/70 animate-slide-in-top animation-delay-200">
              Beautiful examples combining multiple CSS features
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Basic Enhanced Card */}
            <div className="scroll-fade-in-up scroll-item-1">
              <div className="group cursor-pointer h-full">
                <div className="glass-card-strong hover-lift hover-glow cursor-glow h-full flex flex-col">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition duration-300 animate-pulse-smooth">
                    ✨
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Basic Enhanced
                  </h3>
                  <p className="text-white/80 mb-6 flex-grow">
                    This card combines glassmorphism, hover lift, glow effect, and smooth transitions.
                  </p>
                  <button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105">
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Animated Card */}
            <div className="scroll-fade-in-up scroll-item-2 animation-delay-100">
              <div className="group cursor-pointer h-full">
                <div className="glass-card-strong hover-scale hover-glow-purple cursor-glow h-full flex flex-col">
                  <div className="text-6xl mb-4 animate-bounce-smooth">
                    🎯
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 animate-slide-in-left animation-delay-200">
                    Animated Card
                  </h3>
                  <p className="text-white/80 mb-6 flex-grow">
                    Features bouncing icon, scale hover effect, and purple glow. Perfect for CTAs.
                  </p>
                  <button className="btn-shine w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105">
                    Get Started
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Icon Card */}
            <div className="scroll-fade-in-up scroll-item-3 animation-delay-200">
              <div className="group cursor-pointer h-full">
                <div className="glass-card-strong hover-lift hover-glow-pink h-full flex flex-col">
                  <div className="text-6xl mb-4 animate-float">
                    🚀
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Floating Motion
                  </h3>
                  <p className="text-white/80 mb-6 flex-grow">
                    Icon floats gently while card lifts on hover. Creates a premium feel.
                  </p>
                  <button className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105">
                    Explore
                  </button>
                </div>
              </div>
            </div>

            {/* Shimmer Effect Card */}
            <div className="scroll-fade-in-up scroll-item-4 animation-delay-300">
              <div className="group cursor-pointer h-full">
                <div className="glass-card-strong hover-scale cursor-glow h-full flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  <div className="text-6xl mb-4 relative">
                    💎
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 relative">
                    Shimmer Effect
                  </h3>
                  <p className="text-white/80 mb-6 flex-grow relative">
                    Shimmer animation over the entire card. Great for premium features.
                  </p>
                  <button className="relative w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>

            {/* Gradient Text Card */}
            <div className="scroll-fade-in-up scroll-item-5 animation-delay-400">
              <div className="group cursor-pointer h-full">
                <div className="glass-card-strong hover-lift h-full flex flex-col">
                  <div className="text-6xl mb-4 animate-rotate-360">
                    🌈
                  </div>
                  <h2 className="text-2xl font-bold mb-3 gradient-text">
                    Gradient Text
                  </h2>
                  <p className="text-white/80 mb-6 flex-grow">
                    Title has a beautiful gradient color that changes. Perfect for standout content.
                  </p>
                  <button className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105">
                    View More
                  </button>
                </div>
              </div>
            </div>

            {/* Scale In Card */}
            <div className="scroll-fade-in-up scroll-item-6 animation-delay-500">
              <div className="group cursor-pointer h-full">
                <div className="glass-card-strong hover-glow cursor-glow h-full flex flex-col animate-scale-in animation-delay-200">
                  <div className="text-6xl mb-4">
                    🎨
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Scale Animation
                  </h3>
                  <p className="text-white/80 mb-6 flex-grow">
                    Card scales in smoothly on load. Combined with other effects for elegance.
                  </p>
                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105">
                    Discover
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Showcase Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 scroll-fade-in-left">
              Combined Effects
            </h2>

            <div className="scroll-fade-in-up">
              <div className="glass-card-strong hover-lift h-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left side - Features list */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">
                      What Makes These Cards Special?
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3 animate-slide-in-left animation-delay-100">
                        <span className="text-teal-400 text-2xl flex-shrink-0">✓</span>
                        <div>
                          <p className="font-semibold text-white">Glassmorphism</p>
                          <p className="text-white/70 text-sm">Frosted glass effect with backdrop blur</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 animate-slide-in-left animation-delay-200">
                        <span className="text-teal-400 text-2xl flex-shrink-0">✓</span>
                        <div>
                          <p className="font-semibold text-white">Smooth Hover</p>
                          <p className="text-white/70 text-sm">Lift, scale, and glow effects on hover</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 animate-slide-in-left animation-delay-300">
                        <span className="text-teal-400 text-2xl flex-shrink-0">✓</span>
                        <div>
                          <p className="font-semibold text-white">Animated Icons</p>
                          <p className="text-white/70 text-sm">Pulse, bounce, float, and rotate effects</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 animate-slide-in-left animation-delay-400">
                        <span className="text-teal-400 text-2xl flex-shrink-0">✓</span>
                        <div>
                          <p className="font-semibold text-white">Gradients</p>
                          <p className="text-white/70 text-sm">Beautiful color gradients on buttons</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 animate-slide-in-left animation-delay-500">
                        <span className="text-teal-400 text-2xl flex-shrink-0">✓</span>
                        <div>
                          <p className="font-semibold text-white">Scroll Animations</p>
                          <p className="text-white/70 text-sm">Elements animate as you scroll down</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Right side - Code snippet */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                    <p className="text-sm font-semibold text-teal-400 mb-4">Quick Start</p>
                    <pre className="text-white/70 text-xs overflow-auto">
{`<div className="scroll-fade-in-up">
  <div className="glass-card-strong
               hover-lift
               hover-glow
               cursor-glow">
    <div className="text-6xl
                    animate-pulse-smooth">
      ✨
    </div>
    <h3>Title</h3>
    <p>Description</p>
    <button className="hover-scale">
      CTA
    </button>
  </div>
</div>`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 scroll-fade-in-left animation-delay-200">
              Best Practices
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: '⚡',
                  title: 'Performance',
                  description: 'Keep animations under 600ms for UI feedback, use transform and opacity for smooth 60fps animations',
                },
                {
                  icon: '🎯',
                  title: 'Purposeful',
                  description: 'Every animation should guide user attention or provide feedback, not just be decorative',
                },
                {
                  icon: '🎨',
                  title: 'Consistent',
                  description: 'Use the same animation timing and easing functions throughout your app for cohesion',
                },
                {
                  icon: '📱',
                  title: 'Responsive',
                  description: 'Consider reducing animations on mobile or low-end devices for better performance',
                },
              ].map((tip, index) => (
                <div
                  key={index}
                  className={`scroll-fade-in-up scroll-item-${index + 1}`}
                >
                  <div className="glass-card hover-scale">
                    <div className="text-4xl mb-3">{tip.icon}</div>
                    <h3 className="font-bold text-white mb-2">{tip.title}</h3>
                    <p className="text-white/70 text-sm">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default EnhancedCardExample;
