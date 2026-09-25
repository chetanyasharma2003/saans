import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, MapPin, Video, Phone, ChevronRight, Plus, Loader, AlertCircle, CheckCircle, MapCheck, Trash2, Edit2, Star } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Appointment {
  _id: string;
  therapistId: {
    firstName: string;
    lastName: string;
    specialties?: string[];
    rating?: number;
  };
  scheduledAt: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  type: 'video' | 'audio' | 'chat';
  price?: number;
  feedback?: {
    rating: number;
    comment: string;
  };
}

export function SessionsPageNew() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments
    .filter(a => a.status === 'confirmed' && new Date(a.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const pastAppointments = appointments
    .filter(a => a.status === 'completed')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const handleJoinSession = (appointment: Appointment) => {
    if (appointment.type === 'video') {
      // Navigate to video call page
      navigate(`/video-call/${appointment._id}`);
    } else if (appointment.type === 'audio') {
      // Navigate to audio call page
      navigate(`/audio-call/${appointment._id}`);
    } else {
      // Navigate to chat
      navigate(`/chat/${appointment._id}`);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm('Cancel this appointment?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/api/appointments/${appointmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
      alert('Appointment cancelled');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Failed to cancel appointment');
    }
  };

  const handleReschedule = async (appointmentId: string, newDate: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/api/appointments/${appointmentId}/reschedule`,
        { newScheduledAt: newDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
      setShowRescheduleModal(false);
      alert('Appointment rescheduled!');
    } catch (err) {
      console.error('Error rescheduling:', err);
      alert('Failed to reschedule');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-400" />;
      case 'audio':
        return <Phone className="w-5 h-5 text-green-400" />;
      case 'chat':
        return <MapCheck className="w-5 h-5 text-purple-400" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      <div className="relative z-10">
        <DashboardHeader title="Sessions" showBackButton={false} />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Book New Button */}
          <button
            onClick={() => navigate('/therapist')}
            className="w-full mb-8 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Book New Appointment
          </button>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-purple-300 hover:bg-slate-800'
              }`}
            >
              📅 Upcoming ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'past'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-purple-300 hover:bg-slate-800'
              }`}
            >
              ✅ Past ({pastAppointments.length})
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <>
              {/* UPCOMING APPOINTMENTS */}
              {activeTab === 'upcoming' && (
                <div>
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400 mb-4">No upcoming appointments</p>
                      <button
                        onClick={() => navigate('/therapist')}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Book Now →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {upcomingAppointments.map((apt) => (
                        <div
                          key={apt._id}
                          className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl backdrop-blur-xl p-8 hover:border-purple-500/60 transition-all"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="text-4xl">👨‍⚕️</div>
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold text-white mb-2">
                                  {apt.therapistId?.firstName} {apt.therapistId?.lastName}
                                </h3>
                                {apt.therapistId?.specialties && (
                                  <p className="text-purple-300 text-sm mb-2">
                                    {apt.therapistId?.specialties?.join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                            {apt.therapistId?.rating && (
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="w-4 h-4 fill-yellow-400" />
                                <span className="font-bold">{apt.therapistId?.rating}</span>
                              </div>
                            )}
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Clock className="w-4 h-4 text-purple-400" />
                              <span className="text-sm">{formatDate(apt.scheduledAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              {getTypeIcon(apt.type)}
                              <span className="text-sm capitalize">{apt.type} Call</span>
                            </div>
                            {apt.price && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <span className="text-sm">₹{apt.price}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button
                              onClick={() => handleJoinSession(apt)}
                              className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                              {apt.type === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                              Join
                            </button>
                            <button
                              onClick={() => setShowRescheduleModal(true)}
                              className="px-4 py-3 bg-slate-700 text-gray-300 font-bold rounded-lg hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(apt._id)}
                              className="px-4 py-3 bg-slate-700 text-gray-300 font-bold rounded-lg hover:bg-red-900/50 transition-all flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Cancel
                            </button>
                            <button className="px-4 py-3 bg-slate-700 text-gray-300 font-bold rounded-lg hover:bg-slate-600 transition-all">
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PAST APPOINTMENTS */}
              {activeTab === 'past' && (
                <div>
                  {pastAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No completed appointments yet</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {pastAppointments.map((apt) => (
                        <div
                          key={apt._id}
                          className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-600/30 rounded-2xl backdrop-blur-xl p-6 hover:border-slate-600/60 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="text-3xl">👨‍⚕️</div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-white">
                                  {apt.therapistId?.firstName} {apt.therapistId?.lastName}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                  {formatDate(apt.scheduledAt)}
                                </p>
                              </div>
                            </div>
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          </div>

                          {/* Feedback/Rating */}
                          {apt.feedback && (
                            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-yellow-400">{'⭐'.repeat(apt.feedback.rating)}</span>
                                <span className="text-gray-400">{apt.feedback.rating}/5</span>
                              </div>
                              <p className="text-gray-300 text-sm">{apt.feedback.comment}</p>
                            </div>
                          )}

                          <button className="px-4 py-2 bg-purple-600/50 text-purple-300 rounded-lg hover:bg-purple-600 transition-all text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Reschedule Modal */}
          {showRescheduleModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full">
                <h3 className="text-2xl font-bold text-white mb-4">Reschedule Appointment</h3>
                <p className="text-gray-400 mb-6">Select a new date and time</p>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white mb-4"
                  defaultValue={selectedAppointment?.scheduledAt}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRescheduleModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
                      if (selectedAppointment && input.value) {
                        handleReschedule(selectedAppointment._id, input.value);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default SessionsPageNew;
