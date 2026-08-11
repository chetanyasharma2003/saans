import React, { useState, useEffect } from 'react';

export function CrisisSupportPage() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const hotlines = [
    {
      title: 'National Suicide Prevention Lifeline',
      number: '1-800-273-8255',
      displayNumber: '1-800-273-8255',
      link: 'tel:1-800-273-8255',
      description: 'Available 24/7. Free, confidential support.',
      icon: '📞',
      color: 'from-red-600/40 to-red-700/40',
    },
    {
      title: 'Crisis Text Line',
      number: '741741',
      displayNumber: 'Text HOME to 741741',
      link: 'sms:741741?body=HOME',
      description: 'Free text-based support, 24/7',
      icon: '💬',
      color: 'from-orange-600/40 to-red-700/40',
    },
    {
      title: 'Emergency Services',
      number: '911',
      displayNumber: '911',
      link: 'tel:911',
      description: 'Immediate life-threatening emergencies',
      icon: '🚨',
      color: 'from-red-700/40 to-orange-600/40',
    },
    {
      title: 'NAMI Helpline',
      number: '1-800-950-NAMI',
      displayNumber: '1-800-950-NAMI',
      link: 'tel:1-800-950-6264',
      description: 'Mental health crisis support',
      icon: '🆘',
      color: 'from-red-600/40 to-pink-700/40',
    },
  ];

  const mentalHealthTips = [
    {
      title: 'Box Breathing',
      description: 'Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4 times.',
      icon: '🌬️',
      steps: ['1. Breathe in slowly', '2. Hold your breath', '3. Exhale slowly', '4. Pause'],
    },
    {
      title: 'Ground Yourself (5-4-3-2-1)',
      description: 'Notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.',
      icon: '🌍',
      steps: ['Name things you notice', 'Engage all senses', 'Return to present moment', 'Feel grounded'],
    },
    {
      title: 'Progressive Muscle Relaxation',
      description: 'Tense and release each muscle group from toes to head.',
      icon: '💪',
      steps: ['Start with your toes', 'Tense for 5 seconds', 'Release and breathe', 'Move up gradually'],
    },
    {
      title: 'Reach Out Now',
      description: 'Contact a trusted friend, family member, or therapist immediately.',
      icon: '🤝',
      steps: ['Choose someone safe', 'Tell them you need support', 'Share your feelings', 'Listen to advice'],
    },
    {
      title: 'Gentle Movement',
      description: 'Take a walk, stretch, or do light exercise to release tension.',
      icon: '🚶',
      steps: ['Start moving slowly', 'Focus on breathing', 'Notice your surroundings', 'Feel your body'],
    },
    {
      title: 'Cold Water Technique',
      description: 'Splash cold water on your face or hold ice to reset your nervous system.',
      icon: '❄️',
      steps: ['Use cold water', 'Take a shock', 'Breathe deeply', 'Feel reset'],
    },
  ];

  const selfHelpResources = [
    {
      title: 'Mental Health Apps',
      description: 'Headspace, Calm, Insight Timer for meditation and mindfulness',
      icon: '📱',
    },
    {
      title: 'Therapy Platforms',
      description: 'BetterHelp, Talkspace, Ginger for online therapy',
      icon: '💻',
    },
    {
      title: 'Support Communities',
      description: 'Reddit mental health communities, 7 Cups online chat support',
      icon: '👥',
    },
    {
      title: 'Helpline Resources',
      description: 'SAMHSA National Helpline: 1-800-662-4357 (free, confidential, 24/7)',
      icon: '📞',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % mentalHealthTips.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [mentalHealthTips.length]);

  const handlePrevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + mentalHealthTips.length) % mentalHealthTips.length);
  };

  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % mentalHealthTips.length);
  };

  const currentTip = mentalHealthTips[currentTipIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Emergency Header with Prominent Button */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 border-b-4 border-red-500 backdrop-blur-xl shadow-2xl shadow-red-500/50">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            {/* 24/7 Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 mb-6">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-white font-bold text-sm">24/7 CRISIS SUPPORT AVAILABLE</span>
            </div>

            {/* Animated Emergency Icon */}
            <div className="inline-block mb-6 animate-bounce-slow">
              <div className="text-9xl animate-pulse-glow drop-shadow-2xl">🆘</div>
            </div>

            <h1 className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">
              Crisis Support
            </h1>
            <p className="text-red-50 text-2xl mb-10 font-semibold">Help is available right now, 24/7</p>

            {/* Primary Emergency Button */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-white via-red-100 to-white rounded-2xl blur-xl opacity-75 animate-pulse-glow-button group-hover:opacity-100 transition duration-300"></div>
              <button
                onClick={() => window.location.href = 'tel:1-800-273-8255'}
                className="relative bg-white text-red-700 font-black px-16 py-6 rounded-2xl text-2xl hover:text-red-800 hover:bg-red-50 transition transform hover:scale-105 shadow-2xl shadow-red-500/50 animate-pulse-emergency"
                aria-label="Call 1-800-273-8255 for suicide prevention support"
              >
                📞 CALL FOR HELP NOW
              </button>
            </div>

            <p className="text-red-100 text-lg font-semibold">
              Tap above to call immediately • Free, Confidential, Anonymous
            </p>
          </div>
        </div>

        {/* Emergency Hotlines Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-5xl font-bold text-white mb-12 text-center drop-shadow-lg">
            Emergency Hotlines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {hotlines.map((hotline, idx) => (
              <a
                key={idx}
                href={hotline.link}
                className="group"
              >
                <div className={`bg-gradient-to-br ${hotline.color} backdrop-blur-xl border-2 border-red-400/50 rounded-2xl p-8 hover:border-red-300 hover:shadow-2xl hover:shadow-red-500/30 transition transform hover:scale-105 duration-300 cursor-pointer`}>
                  <div className="text-7xl mb-4 group-hover:scale-110 transition duration-300">
                    {hotline.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-red-50 transition">
                    {hotline.title}
                  </h3>
                  <p className="text-red-100 mb-6 group-hover:text-white transition">
                    {hotline.description}
                  </p>
                  <div className="bg-white text-red-700 font-black text-xl px-6 py-4 rounded-xl text-center hover:shadow-2xl hover:shadow-red-400/50 transition duration-300 transform group-hover:scale-110 inline-block w-full">
                    {hotline.displayNumber}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center hover:border-white/40 transition">
              <div className="text-4xl mb-2">🔒</div>
              <p className="text-white font-bold text-sm">100% Confidential</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center hover:border-white/40 transition">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-white font-bold text-sm">Completely Free</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center hover:border-white/40 transition">
              <div className="text-4xl mb-2">⏰</div>
              <p className="text-white font-bold text-sm">Always Available</p>
            </div>
          </div>
        </div>

        {/* Quick Mental Health Tips Carousel */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-5xl font-bold text-white mb-12 text-center drop-shadow-lg">
            Immediate Coping Strategies
          </h2>

          <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-xl border-2 border-red-400/50 rounded-3xl p-12 shadow-2xl">
            {/* Carousel Content */}
            <div className="min-h-96 flex flex-col justify-between">
              <div className="text-center mb-8">
                <div className="text-9xl mb-6 animate-float">{currentTip.icon}</div>
                <h3 className="text-4xl font-bold text-white mb-4">{currentTip.title}</h3>
                <p className="text-red-100 text-xl mb-8 leading-relaxed">
                  {currentTip.description}
                </p>

                {/* Steps */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {currentTip.steps.map((step, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:border-white/40 transition">
                      <p className="text-white font-semibold">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center justify-center gap-6 mt-8">
                <button
                  onClick={handlePrevTip}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition transform hover:scale-110"
                  aria-label="Previous coping strategy"
                >
                  ← Previous
                </button>

                {/* Indicators */}
                <div className="flex gap-2">
                  {mentalHealthTips.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentTipIndex(idx)}
                      className={`h-3 rounded-full transition ${
                        idx === currentTipIndex
                          ? 'bg-white w-8'
                          : 'bg-white/30 w-3 hover:bg-white/50'
                      }`}
                      aria-label={`Go to tip ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextTip}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition transform hover:scale-110"
                  aria-label="Next coping strategy"
                >
                  Next →
                </button>
              </div>

              <p className="text-center text-red-200 text-sm mt-6">
                {currentTipIndex + 1} of {mentalHealthTips.length} • Auto-rotating every 6 seconds
              </p>
            </div>
          </div>
        </div>

        {/* Self-Help Resources */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-5xl font-bold text-white mb-12 text-center drop-shadow-lg">
            Self-Help Resources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {selfHelpResources.map((resource, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-xl border border-red-400/30 rounded-2xl p-8 hover:border-red-400/60 hover:shadow-2xl hover:shadow-red-500/20 transition transform hover:scale-110 duration-300"
              >
                <div className="text-6xl mb-4">{resource.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{resource.title}</h3>
                <p className="text-red-200 text-sm leading-relaxed">{resource.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Crisis Chat Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-red-600/30 via-orange-600/30 to-red-600/30 backdrop-blur-xl border-2 border-red-400/50 rounded-3xl p-12 text-center shadow-2xl shadow-red-500/20">
            <h2 className="text-4xl font-bold text-white mb-4">💬 Need to Talk Right Now?</h2>
            <p className="text-red-100 mb-8 text-xl leading-relaxed">
              Chat anonymously with a trained crisis counselor. No judgment, just support.
            </p>
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-gradient-to-r from-white to-red-50 hover:from-red-50 hover:to-white text-red-700 font-black px-12 py-5 rounded-xl transition transform hover:scale-110 shadow-lg text-lg hover:shadow-2xl hover:shadow-red-500/50"
            >
              Start Anonymous Crisis Chat
            </button>
          </div>
        </div>

        {/* Critical Warning Banner */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-xl border-2 border-yellow-500/50 rounded-2xl p-10 shadow-2xl shadow-yellow-500/10">
            <div className="flex items-start gap-6">
              <div className="text-6xl flex-shrink-0">⚠️</div>
              <div>
                <h3 className="text-2xl font-black text-yellow-50 mb-4">Immediate Danger?</h3>
                <p className="text-yellow-100 text-lg leading-relaxed mb-6">
                  If you are in immediate danger, having thoughts of harming yourself or others, or experiencing a severe mental health crisis, please:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                    <p className="text-white font-bold text-lg">📞 Call 911</p>
                    <p className="text-yellow-100 text-sm">Emergency services for immediate help</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                    <p className="text-white font-bold text-lg">🏥 Go to ER</p>
                    <p className="text-yellow-100 text-sm">Visit your nearest emergency room</p>
                  </div>
                </div>
                <p className="text-yellow-50 font-bold text-center mt-6 text-lg">
                  Your life has value. Help is here. You are not alone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Resources */}
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-red-200 text-lg mb-8">
            Remember: Seeking help is a sign of strength, not weakness. You deserve support.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 text-white font-semibold">
              ✓ Confidential
            </span>
            <span className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 text-white font-semibold">
              ✓ Free
            </span>
            <span className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 text-white font-semibold">
              ✓ 24/7 Available
            </span>
            <span className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 text-white font-semibold">
              ✓ No Judgment
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes pulse-emergency {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(239, 68, 68, 0.8);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(10px);
          }
        }

        @keyframes pulse-glow-button {
          0%, 100% {
            opacity: 0.75;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-emergency {
          animation: pulse-emergency 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite;
        }

        .animate-pulse-glow-button {
          animation: pulse-glow-button 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default CrisisSupportPage;
