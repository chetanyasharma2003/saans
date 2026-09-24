import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, MapPin, Video, Phone, ChevronRight, Plus } from 'lucide-react';

export function AppointmentsPageNew() {
  const navigate = useNavigate();

  const upcomingAppointments = [
    { id: 1, therapist: 'Dr. Priya Singh', time: 'Today at 3:00 PM', type: 'Video Call', avatar: '👩‍⚕️' },
    { id: 2, therapist: 'Dr. Rajesh Patel', time: 'Tomorrow at 10:00 AM', type: 'Phone Call', avatar: '👨‍⚕️' },
  ];

  const pastAppointments = [
    { id: 1, therapist: 'Dr. Meera Kapoor', time: 'Sep 20 at 2:00 PM', notes: 'Great session!', avatar: '👩‍⚕️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-purple-500/20">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6">
            <button onClick={() => navigate('/dashboard')} className="text-purple-400 text-sm sm:text-base mb-4">← Back</button>
            <h1 className="text-2xl sm:text-4xl font-bold text-white">Appointments</h1>
          </div>
        </header>

        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12 max-w-4xl mx-auto">
          {/* Book New */}
          <button className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg sm:rounded-2xl hover:shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Book New Appointment
          </button>

          {/* Upcoming */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Upcoming Appointments</h2>
            <div className="space-y-4 sm:space-y-6">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6 sm:p-8 hover:border-purple-500/60 transition-all backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{apt.avatar}</div>
                      <div>
                        <h3 className="text-white font-bold text-sm sm:text-lg">{apt.therapist}</h3>
                        <p className="text-purple-300 text-xs sm:text-sm">{apt.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <span className="flex items-center gap-2 text-gray-400 text-sm"><Clock className="w-4 h-4" /> {apt.time}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all text-sm">Join</button>
                    <button className="flex-1 px-4 py-2 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-700 transition-all text-sm">Reschedule</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Past Appointments</h2>
            <div className="space-y-4">
              {pastAppointments.map((apt) => (
                <div key={apt.id} className="bg-slate-800/50 border border-purple-500/20 rounded-2xl p-6 text-left">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-3xl">{apt.avatar}</div>
                    <div>
                      <h3 className="text-white font-bold text-sm sm:text-base">{apt.therapist}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">{apt.time}</p>
                    </div>
                  </div>
                  <p className="text-purple-300 text-xs sm:text-sm">Notes: {apt.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppointmentsPageNew;
