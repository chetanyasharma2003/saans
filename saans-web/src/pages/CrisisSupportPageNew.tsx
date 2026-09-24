import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Phone, MessageSquare, Heart } from 'lucide-react';

export function CrisisSupportPageNew() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-purple-900 to-slate-900">
      <div className="relative z-10">
        <header className="sticky top-0 z-40 bg-red-950/95 backdrop-blur-md border-b border-red-500/20">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6">
            <button onClick={() => navigate('/dashboard')} className="text-red-400 text-sm sm:text-base mb-4">← Back</button>
            <h1 className="text-2xl sm:text-4xl font-bold text-white flex items-center gap-2"><AlertCircle className="w-8 h-8" /> Crisis Support</h1>
          </div>
        </header>

        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-red-600/40 to-pink-600/40 border-2 border-red-500/50 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">You Are Not Alone</h2>
            <p className="text-red-100 text-base sm:text-lg mb-8">Immediate support available 24/7</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" /> Call Now
              </button>
              <button className="flex-1 px-6 py-4 bg-white/20 border-2 border-white text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" /> Chat Now
              </button>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Emergency Contacts</h3>
            {[
              { name: 'AASRA', number: '9820466726', avatar: '🆘' },
              { name: 'iCall', number: '9152987821', avatar: '📞' },
              { name: 'Vandrevala Foundation', number: '9999 77 6666', avatar: '💜' },
            ].map((contact, idx) => (
              <button key={idx} className="w-full bg-slate-800/50 border border-red-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-red-500/60 transition-all text-left">
                <div className="flex items-center gap-4">
                  <div className="text-3xl sm:text-4xl">{contact.avatar}</div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base">{contact.name}</h4>
                    <p className="text-red-400 font-bold text-lg sm:text-2xl">{contact.number}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg sm:rounded-xl p-6 sm:p-8">
            <p className="text-blue-100 text-sm sm:text-base">
              "If you're in immediate danger, please call emergency services (112) or go to your nearest hospital emergency room."
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CrisisSupportPageNew;
