import React, { useState, useEffect } from 'react';
import { X, Clock, Video, Phone, User, AlertCircle, CheckCircle } from 'lucide-react';

interface JoinSessionModalProps {
  isOpen: boolean;
  appointment: any;
  onClose: () => void;
}

export function JoinSessionModal({ isOpen, appointment, onClose }: JoinSessionModalProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!appointment) return;

    const calculateTimeLeft = () => {
      const appointmentTime = new Date(appointment.scheduledAt);
      const now = new Date();
      const difference = appointmentTime.getTime() - now.getTime();

      if (difference < 0) {
        setSessionStarted(true);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const canJoin = sessionStarted || (timeLeft.hours === 0 && timeLeft.minutes <= 15);
  const appointmentDate = new Date(appointment.scheduledAt);
  const therapistName = appointment.therapist?.firstName + ' ' + appointment.therapist?.lastName;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 border border-purple-400/30 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-2xl font-bold text-white">Session Details</h2>
          <p className="text-white/80 text-sm mt-1">Dr. {therapistName}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Therapist Info */}
          <div className="flex items-center gap-4 p-4 bg-purple-600/20 border border-purple-400/30 rounded-xl">
            <div className="text-4xl">👨‍⚕️</div>
            <div>
              <p className="text-white font-bold">Dr. {therapistName}</p>
              <p className="text-purple-300 text-sm capitalize">{appointment.type} Session</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-300">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Appointment Time</p>
                <p className="font-bold text-white">
                  {appointmentDate.toLocaleDateString()} at {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-bold text-white">{appointment.duration} minutes</p>
              </div>
            </div>
          </div>

          {/* Time Remaining */}
          {!sessionStarted ? (
            <div className="p-6 bg-blue-600/20 border border-blue-400/30 rounded-xl text-center">
              <p className="text-blue-300 text-sm mb-2">Time Until Session</p>
              <div className="text-4xl font-bold text-white mb-2">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <p className="text-blue-300 text-sm">
                {timeLeft.hours > 0
                  ? `${timeLeft.hours} hour${timeLeft.hours > 1 ? 's' : ''} ${timeLeft.minutes} min`
                  : `${timeLeft.minutes} minutes ${timeLeft.seconds} seconds`}
              </p>
            </div>
          ) : (
            <div className="p-6 bg-green-600/20 border border-green-400/30 rounded-xl text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 font-bold">Session Time!</p>
              <p className="text-green-300 text-sm mt-1">Your session is ready to start</p>
            </div>
          )}

          {/* Status Alert */}
          {!canJoin && (
            <div className="p-4 bg-yellow-600/20 border border-yellow-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 text-sm font-medium">Early Access</p>
                <p className="text-yellow-300 text-xs mt-1">You can join 15 minutes before the session starts</p>
              </div>
            </div>
          )}

          {/* Join Button */}
          <button
            disabled={!canJoin && !joined}
            onClick={() => setJoined(true)}
            className={`w-full px-6 py-4 font-bold rounded-xl transition-all text-lg flex items-center justify-center gap-2 ${
              joined
                ? 'bg-green-600 border border-green-500 text-white'
                : canJoin
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            }`}
          >
            {appointment.type === 'video' ? (
              <Video className="w-6 h-6" />
            ) : (
              <Phone className="w-6 h-6" />
            )}
            {joined ? '✓ Joined Session' : canJoin ? `Join ${appointment.type === 'video' ? 'Video' : 'Phone'} Call` : 'Not Ready Yet'}
          </button>

          {/* Session Type Info */}
          <div className="p-4 bg-slate-800/50 border border-purple-400/20 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">
              {appointment.type === 'video'
                ? '🎥 Join via video call - Link will appear when you click Join'
                : '📞 Phone call will be initiated immediately after clicking Join'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinSessionModal;
