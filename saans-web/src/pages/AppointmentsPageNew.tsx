import { DashboardHeader } from '../components/DashboardHeader';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, Plus, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { JoinSessionModal } from '../components/Appointments/JoinSessionModal';
import { RescheduleModal } from '../components/Appointments/RescheduleModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AppointmentsPageNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedJoinAppointment, setSelectedJoinAppointment] = useState(null);
  const [selectedRescheduleAppointment, setSelectedRescheduleAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [location]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
  };

  const handleRescheduleSuccess = () => {
    setSelectedRescheduleAppointment(null);
    fetchAppointments();
  };

  const upcomingAppointments = appointments.filter(a =>
    (a.status === 'scheduled' || a.status === 'confirmed') && new Date(a.scheduledAt) > new Date()
  );

  const pastAppointments = appointments.filter(a => a.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        <DashboardHeader title="Sessions" showBackButton={false} />

        <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12 max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
              <button onClick={handleRefresh} className="text-red-400 hover:text-red-300">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button onClick={() => navigate('/therapist')} className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg sm:rounded-2xl hover:shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Book New
                </button>
                <button onClick={handleRefresh} disabled={refreshing} className="px-4 py-3 sm:py-4 bg-slate-800/50 hover:bg-slate-800 text-gray-300 rounded-lg sm:rounded-2xl transition-all border border-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Upcoming Appointments */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Upcoming Appointments ({upcomingAppointments.length})</h2>
                {upcomingAppointments.length === 0 ? (
                  <p className="text-gray-400">No upcoming appointments. Book one now!</p>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {upcomingAppointments.map((apt) => (
                      <div key={apt.id} className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6 sm:p-8 hover:border-purple-500/60 transition-all backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">👨‍⚕️</div>
                            <div>
                              <h3 className="text-white font-bold text-sm sm:text-lg">{apt.therapist?.firstName || 'Therapist'} {apt.therapist?.lastName || ''}</h3>
                              <p className="text-purple-300 text-xs sm:text-sm capitalize">{apt.type} Call</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                          <span className="flex items-center gap-2 text-gray-400 text-sm">
                            <Clock className="w-4 h-4" /> {new Date(apt.scheduledAt).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-2 text-gray-400 text-sm">
                            <Calendar className="w-4 h-4" /> {apt.duration} minutes
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => setSelectedJoinAppointment(apt)}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all text-sm"
                          >
                            Join
                          </button>
                          <button
                            onClick={() => setSelectedRescheduleAppointment(apt)}
                            className="flex-1 px-4 py-2 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-700 transition-all text-sm font-medium"
                          >
                            Reschedule
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Appointments */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Past Appointments ({pastAppointments.length})</h2>
                {pastAppointments.length === 0 ? (
                  <p className="text-gray-400">No past appointments yet</p>
                ) : (
                  <div className="space-y-4">
                    {pastAppointments.map((apt) => (
                      <div key={apt.id} className="bg-slate-800/50 border border-purple-500/20 rounded-2xl p-6 text-left">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="text-3xl">👨‍⚕️</div>
                          <div>
                            <h3 className="text-white font-bold text-sm sm:text-base">{apt.therapist?.firstName || 'Therapist'} {apt.therapist?.lastName || ''}</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">{new Date(apt.scheduledAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-purple-300 text-xs sm:text-sm">Completed ✓</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <JoinSessionModal
        isOpen={!!selectedJoinAppointment}
        appointment={selectedJoinAppointment}
        onClose={() => setSelectedJoinAppointment(null)}
      />
      <RescheduleModal
        isOpen={!!selectedRescheduleAppointment}
        appointment={selectedRescheduleAppointment}
        onClose={() => setSelectedRescheduleAppointment(null)}
        onSuccess={handleRescheduleSuccess}
      />
    </div>
  );
}

export default AppointmentsPageNew;
