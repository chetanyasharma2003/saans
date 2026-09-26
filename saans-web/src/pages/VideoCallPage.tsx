import React, { useState, useEffect } from 'react';
import { Video, Mic, MicOff, Phone, PhoneOff, Settings, Share2, Maximize2 } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function VideoCallPage() {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callStarted, setCallStarted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [appointmentId, setAppointmentId] = useState(new URLSearchParams(window.location.search).get('appointmentId') || '');

  useEffect(() => {
    let interval;
    if (callStarted) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStarted]);

  const handleStartCall = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_URL}/api/video-calls/start`,
        {
          appointmentId,
          channelName: `call-${appointmentId}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCallStarted(true);
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Failed to start call');
    }
  };

  const handleEndCall = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // Get the video call ID from appointment
      await axios.post(
        `${API_URL}/api/video-calls/end`,
        {
          duration: callDuration,
          recording: null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCallStarted(false);
      setCallDuration(0);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardHeader title="Video Call" showBackButton={true} />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-black rounded-2xl aspect-video mb-8 flex items-center justify-center relative overflow-hidden">
          {/* Video Feed Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black flex items-center justify-center">
            <div className="text-center">
              <Video className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400">Video feed will appear here</p>
              {callStarted && (
                <p className="text-2xl font-bold text-white mt-4">{formatTime(callDuration)}</p>
              )}
            </div>
          </div>

          {/* Remote Participant (Placeholder) */}
          <div className="absolute bottom-4 right-4 w-32 h-32 bg-gradient-to-br from-purple-600 to-slate-800 rounded-lg border-2 border-purple-500 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-8 h-8 text-purple-300 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-gray-300">Therapist</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setIsAudioOn(!isAudioOn)}
            className={`p-4 rounded-full transition-all ${
              isAudioOn
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-full transition-all ${
              isVideoOn
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Video className="w-6 h-6" />
          </button>

          {!callStarted ? (
            <button
              onClick={handleStartCall}
              disabled={!appointmentId}
              className="px-8 py-4 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Phone className="w-6 h-6" />
              Start Call
            </button>
          ) : (
            <button
              onClick={handleEndCall}
              className="px-8 py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <PhoneOff className="w-6 h-6" />
              End Call
            </button>
          )}

          <button className="p-4 rounded-full bg-slate-800 text-gray-300 hover:bg-slate-700 transition-all">
            <Share2 className="w-6 h-6" />
          </button>

          <button className="p-4 rounded-full bg-slate-800 text-gray-300 hover:bg-slate-700 transition-all">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Info */}
        <div className="text-center text-gray-400">
          <p>Appointment ID: {appointmentId || 'Not provided'}</p>
        </div>
      </main>
    </div>
  );
}

export default VideoCallPage;
