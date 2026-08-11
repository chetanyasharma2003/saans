import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, Brain, BarChart3, Users, MessageSquare, Zap, Check, Star } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-blob-2 {
          animation: blob 7s infinite 2s;
        }
        .animate-blob-3 {
          animation: blob 7s infinite 4s;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-slideIn {
          animation: slideIn 0.8s ease-out;
        }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .pricing-card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pricing-card-hover:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 50px rgba(139, 92, 246, 0.3);
        }
        .gradient-text {
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glow-effect {
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.2), inset 0 0 20px rgba(139, 92, 246, 0.1);
        }
        .header-hover:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-2"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-3"></div>

      {/* Header/Navigation */}
      <header className="relative z-50 backdrop-blur-lg border-b border-indigo-400/20">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold gradient-text">SAANS</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg text-indigo-200 hover:text-white transition header-hover"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold transition transform hover:scale-105"
            >
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slideIn">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span>Your Mental</span>
                <br />
                <span className="gradient-text">Health Matters</span>
              </h1>
              <p className="text-lg md:text-xl text-indigo-200 leading-relaxed">
                Access professional therapists, AI-powered counseling, and track your emotional wellness journey—all in one secure platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold text-lg transition transform hover:scale-105 active:scale-95"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 rounded-lg border-2 border-indigo-400 hover:bg-indigo-400/10 font-semibold text-lg transition"
              >
                View Plans
              </button>
            </div>

            <p className="text-sm text-indigo-300">✓ No credit card required • ✓ 7 days free access</p>
          </div>

          <div className="relative h-96 md:h-full min-h-96 animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/30 to-purple-600/30 rounded-3xl blur-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl backdrop-blur-xl border border-indigo-400/30 flex items-center justify-center glow-effect">
              <div className="text-center space-y-6">
                <Heart className="w-24 h-24 mx-auto text-pink-400 animate-pulse" />
                <div>
                  <p className="text-3xl font-bold gradient-text">Built for India</p>
                  <p className="text-indigo-300">Affordable • Secure • Trustworthy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - Honest & Genuine */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { number: '₹99', label: 'Starting Monthly', icon: Users },
            { number: '24/7', label: 'AI Support Available', icon: Heart },
            { number: 'India-Based', label: 'Therapists & Doctors', icon: MessageSquare },
            { number: '100%', label: 'Data Privacy Secured', icon: Star },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-400/20 rounded-2xl p-6 backdrop-blur-xl hover:border-indigo-400/50 transition">
                  <Icon className="w-8 h-8 text-indigo-400 mb-3" />
                  <p className="text-3xl font-bold gradient-text mb-2">{stat.number}</p>
                  <p className="text-indigo-300 text-sm">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need for <span className="gradient-text">Mental Wellness</span>
          </h2>
          <p className="text-lg text-indigo-300 max-w-2xl mx-auto">
            Comprehensive tools and support designed to help you navigate your mental health journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'AI Counselor',
              description: 'Chat with our advanced AI counselor available 24/7 for instant support and guidance.',
              icon: Brain,
              color: 'from-blue-400 to-cyan-400',
            },
            {
              title: 'Find Therapists',
              description: 'Connect with verified, licensed therapists specialized in various mental health areas.',
              icon: Heart,
              color: 'from-pink-400 to-rose-400',
            },
            {
              title: 'Mood Tracking',
              description: 'Monitor your emotional patterns and get personalized insights into your mental wellness.',
              icon: BarChart3,
              color: 'from-purple-400 to-indigo-400',
            },
            {
              title: 'Community Support',
              description: 'Join supportive communities, share experiences, and grow together with peers.',
              icon: Users,
              color: 'from-green-400 to-emerald-400',
            },
            {
              title: 'Crisis Support',
              description: 'Immediate access to crisis counselors and emergency mental health resources.',
              icon: Zap,
              color: 'from-orange-400 to-red-400',
            },
            {
              title: 'Progress Analytics',
              description: 'Track your growth with detailed analytics and progress reports over time.',
              icon: BarChart3,
              color: 'from-indigo-400 to-purple-400',
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="animate-fadeInUp group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-indigo-400/20 rounded-2xl p-8 backdrop-blur-xl hover:border-indigo-400/50 transition h-full glow-effect">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4 group-hover:scale-110 transition`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-indigo-200">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-lg text-indigo-300 max-w-2xl mx-auto">
            Choose the plan that works best for your mental health journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Starter',
              price: '₹99',
              period: '/month',
              description: 'Perfect for beginners',
              features: [
                'AI Counselor (50 chats/month)',
                'Mood tracking',
                'Limited community access',
                'Weekly insights',
              ],
              cta: 'Get Started',
            },
            {
              name: 'Professional',
              price: '₹299',
              period: '/month',
              description: 'Most popular choice',
              features: [
                'Everything in Starter',
                'Unlimited AI Counselor',
                'Connect with 3 therapists',
                'Priority crisis support',
                'Advanced analytics',
                'Personalized wellness plans',
              ],
              cta: 'Start Free Trial',
              popular: true,
            },
            {
              name: 'Premium',
              price: '₹499',
              period: '/month',
              description: 'Complete wellness suite',
              features: [
                'Everything in Professional',
                'Unlimited therapists',
                'One-on-one coaching',
                'VIP 24/7 support',
                'Custom treatment plans',
                'Family plan (3 members)',
                'Exclusive workshops',
              ],
              cta: 'Start Free Trial',
            },
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`pricing-card-hover animate-fadeInUp transform transition ${
                plan.popular ? 'md:scale-105' : ''
              }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div
                className={`relative rounded-3xl p-8 backdrop-blur-xl h-full ${
                  plan.popular
                    ? 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-2 border-indigo-400 glow-effect'
                    : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-indigo-400/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-indigo-300 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-indigo-300">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                      <span className="text-indigo-100">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-3 rounded-lg font-semibold transition transform hover:scale-105 active:scale-95 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                      : 'border-2 border-indigo-400 hover:bg-indigo-400/10'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loved by <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-lg text-indigo-300">Real stories from real people on their healing journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Priya Sharma',
              role: 'Student',
              image: '🧑‍🎓',
              text: 'SAANS helped me manage my anxiety during college. The AI counselor is like having someone to talk to anytime.',
              rating: 5,
            },
            {
              name: 'Rajesh Kumar',
              role: 'Professional',
              image: '💼',
              text: 'The mood tracking feature helped me identify patterns in my stress. My therapist found it incredibly useful.',
              rating: 5,
            },
            {
              name: 'Meera Patel',
              role: 'Homemaker',
              image: '👩‍💼',
              text: 'The community support section made me feel less alone. Connecting with others going through similar struggles is powerful.',
              rating: 5,
            },
          ].map((testimonial, idx) => (
            <div
              key={idx}
              className="animate-fadeInUp"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-indigo-400/20 rounded-2xl p-8 backdrop-blur-xl hover:border-indigo-400/50 transition glow-effect h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-indigo-300">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-indigo-200">{testimonial.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-lg text-indigo-300">Everything you need to know about SAANS</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Is my data secure and private?',
              a: 'Yes, we use end-to-end encryption and follow strict HIPAA compliance standards. Your mental health data is protected with military-grade security.',
            },
            {
              q: 'Can I cancel my subscription anytime?',
              a: 'Absolutely! You can cancel your subscription at any time without any penalties or hidden charges.',
            },
            {
              q: 'Are the therapists verified and licensed?',
              a: 'Yes, all therapists on our platform are verified, licensed professionals. We conduct thorough background checks.',
            },
            {
              q: 'What if I\'m in crisis?',
              a: 'We have 24/7 crisis support available. You can immediately connect with a crisis counselor or emergency mental health services.',
            },
            {
              q: 'Do you offer family plans?',
              a: 'Yes! Our Premium plan includes family options for up to 3 members. Individual plans can also be upgraded.',
            },
            {
              q: 'How does the AI counselor work?',
              a: 'Our AI uses advanced machine learning to provide evidence-based support. It\'s trained by mental health professionals and complements (not replaces) human therapy.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="animate-fadeInUp"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-indigo-400/20 rounded-xl p-6 backdrop-blur-xl hover:border-indigo-400/50 transition text-left glow-effect group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{faq.q}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-indigo-400 transition transform ${
                      expandedFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {expandedFaq === idx && (
                  <p className="text-indigo-200 mt-4 animate-slideIn">{faq.a}</p>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-400/50 rounded-3xl p-12 md:p-16 backdrop-blur-xl glow-effect text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your <span className="gradient-text">Wellness Journey?</span>
          </h2>
          <p className="text-xl text-indigo-200 mb-8 max-w-2xl mx-auto">
            Join thousands of people already improving their mental health with SAANS
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold text-lg transition transform hover:scale-105 active:scale-95"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-lg border-2 border-indigo-400 hover:bg-indigo-400/10 font-semibold text-lg transition"
            >
              Sign In
            </button>
          </div>

          <p className="text-sm text-indigo-300 mt-6">7 days free • No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-indigo-400/20 backdrop-blur-lg mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="font-bold gradient-text">SAANS</span>
              </div>
              <p className="text-indigo-300 text-sm">
                Your trusted mental health companion
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-indigo-300">
                <li><a href="#" className="hover:text-indigo-100 transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-indigo-100 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-100 transition">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-indigo-300">
                <li><a href="#" className="hover:text-indigo-100 transition">About</a></li>
                <li><a href="#" className="hover:text-indigo-100 transition">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-100 transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-indigo-300">
                <li><a href="#" className="hover:text-indigo-100 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-indigo-100 transition">Terms</a></li>
                <li><a href="#" className="hover:text-indigo-100 transition">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-indigo-400/20 pt-8 text-center text-indigo-300 text-sm">
            <p>© 2024 SAANS Mental Health Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
