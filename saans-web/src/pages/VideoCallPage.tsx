import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';
import { AlertCircle, Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardHeader } from '../components/DashboardHeader';
import { apiClient } from '../services/apiClient';

interface VideoSession {
  success: boolean;
  data: {
    appId: string;
    channelName: string;
    token: string;
    uid: number;
    type: 'video' | 'audio';
  };
}

type LocalTrack = ILocalAudioTrack | ILocalVideoTrack;

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

export function VideoCallPage() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || '';
  const [callStarted, setCallStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [remoteParticipantJoined, setRemoteParticipantJoined] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState('');
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localTracksRef = useRef<LocalTrack[]>([]);
  const serverSessionStartedRef = useRef(false);
  const serverSessionEndingRef = useRef(false);
  const callDurationRef = useRef(0);

  useEffect(() => {
    callDurationRef.current = callDuration;
  }, [callDuration]);

  useEffect(() => {
    if (!callStarted) return undefined;
    const timer = window.setInterval(() => setCallDuration((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [callStarted]);

  useEffect(() => () => {
    localTracksRef.current.forEach((track) => track.close());
    void clientRef.current?.leave();
    if (serverSessionStartedRef.current && !serverSessionEndingRef.current) {
      serverSessionEndingRef.current = true;
      void apiClient.post('/api/video-calls/end', {
        appointmentId,
        duration: callDurationRef.current,
      }).catch((cleanupError) => {
        console.error('Unable to end the session after leaving the call page:', cleanupError);
      });
      serverSessionStartedRef.current = false;
    }
  }, []);

  const startCall = async () => {
    if (!appointmentId || loading || callStarted) return;
    setLoading(true);
    setError('');

    try {
      const session = await apiClient.post<VideoSession>('/api/video-calls/start', { appointmentId });
      setIsAudioOnly(session.data.type === 'audio');
      const tracks: LocalTrack[] = await (session.data.type === 'audio'
        ? Promise.all([AgoraRTC.createMicrophoneAudioTrack()])
        : AgoraRTC.createMicrophoneAndCameraTracks());
      localTracksRef.current = tracks;

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        setRemoteParticipantJoined(true);
        if (mediaType === 'video' && remoteVideoRef.current) {
          remoteUser.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === 'audio') remoteUser.audioTrack?.play();
      });

      client.on('user-unpublished', (remoteUser, mediaType) => {
        if (mediaType === 'video') remoteUser.videoTrack?.stop();
      });
      client.on('user-left', () => setRemoteParticipantJoined(false));

      await client.join(
        session.data.appId,
        session.data.channelName,
        session.data.token,
        session.data.uid
      );
      await client.publish(tracks);
      await apiClient.post('/api/video-calls/connected', { appointmentId });
      serverSessionStartedRef.current = true;

      const localVideoTrack = tracks.find((track) => track.trackMediaType === 'video');
      if (localVideoTrack && localVideoRef.current) localVideoTrack.play(localVideoRef.current);
      setCallStarted(true);
    } catch (requestError: unknown) {
      setError(getErrorMessage(
        requestError,
        'Unable to join the session. Check your camera/microphone permissions and try again.'
      ));
      serverSessionStartedRef.current = false;
      setRemoteParticipantJoined(false);
      localTracksRef.current.forEach((track) => track.close());
      localTracksRef.current = [];
      await clientRef.current?.leave().catch(() => undefined);
      clientRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const endCall = async () => {
    setLoading(true);
    setError('');
    serverSessionEndingRef.current = true;
    try {
      await clientRef.current?.leave();
      localTracksRef.current.forEach((track) => track.close());
      localTracksRef.current = [];
      await apiClient.post('/api/video-calls/end', { appointmentId, duration: callDuration });
      serverSessionStartedRef.current = false;
      serverSessionEndingRef.current = false;
      setCallStarted(false);
    } catch (requestError: unknown) {
      serverSessionEndingRef.current = false;
      setError(getErrorMessage(requestError, 'Unable to end the session cleanly.'));
    } finally {
      setLoading(false);
    }
  };

  const toggleMicrophone = async () => {
    const track = localTracksRef.current.find((item) => item.trackMediaType === 'audio') as ILocalAudioTrack | undefined;
    if (!track) return;
    await track.setEnabled(!isAudioOn);
    setIsAudioOn(!isAudioOn);
  };

  const toggleCamera = async () => {
    const track = localTracksRef.current.find((item) => item.trackMediaType === 'video') as ILocalVideoTrack | undefined;
    if (!track) return;
    await track.setEnabled(!isVideoOn);
    setIsVideoOn(!isVideoOn);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardHeader title={isAudioOnly ? 'Audio Session' : 'Video Session'} showBackButton />
      <main className="mx-auto max-w-5xl px-4 py-10">
        {!appointmentId && (
          <div role="alert" className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            Open this page from a booked appointment to join a session.
          </div>
        )}
        {error && (
          <div role="alert" className="mb-5 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {isAudioOnly ? (
          <div className="mb-6 rounded-2xl border border-purple-400/30 bg-slate-950/60 p-10 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-700/40">
              <Phone className="h-9 w-9 text-purple-200" />
            </div>
            <h2 className="text-xl font-semibold text-white">Audio session</h2>
            <p className="mt-2 text-gray-400">
              {remoteParticipantJoined ? 'Your therapist has joined the call.' : 'Waiting for the other participant to join.'}
            </p>
          </div>
        ) : (
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
              <div ref={localVideoRef} className="absolute inset-0" />
              {!callStarted && <div className="absolute inset-0 flex items-center justify-center text-gray-400">Your camera preview appears when you join</div>}
              <span className="absolute bottom-3 left-3 rounded bg-black/60 px-3 py-1 text-sm text-white">You</span>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
              <div ref={remoteVideoRef} className="absolute inset-0" />
              {!remoteParticipantJoined && <div className="absolute inset-0 flex items-center justify-center text-gray-400">Waiting for the other participant</div>}
              <span className="absolute bottom-3 left-3 rounded bg-black/60 px-3 py-1 text-sm text-white">Therapist / participant</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button type="button" onClick={toggleMicrophone} disabled={!callStarted} aria-label={isAudioOn ? 'Mute microphone' : 'Unmute microphone'} className="rounded-full bg-purple-700 p-4 text-white disabled:opacity-40">
            {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>
          {!isAudioOnly && (
            <button type="button" onClick={toggleCamera} disabled={!callStarted} aria-label={isVideoOn ? 'Turn camera off' : 'Turn camera on'} className="rounded-full bg-purple-700 p-4 text-white disabled:opacity-40">
              {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </button>
          )}
          {callStarted && <span className="font-mono text-lg text-white">{formatTime(callDuration)}</span>}
          {!callStarted ? (
            <button type="button" onClick={startCall} disabled={!appointmentId || loading} className="flex items-center gap-2 rounded-full bg-green-600 px-7 py-4 font-bold text-white disabled:opacity-50">
              <Phone className="h-5 w-5" />{loading ? 'Connecting...' : 'Join session'}
            </button>
          ) : (
            <button type="button" onClick={endCall} disabled={loading} className="flex items-center gap-2 rounded-full bg-red-600 px-7 py-4 font-bold text-white disabled:opacity-50">
              <PhoneOff className="h-5 w-5" />{loading ? 'Ending...' : 'End session'}
            </button>
          )}
        </div>
        <p className="mt-5 text-center text-sm text-gray-400">
          Audio/video calling requires the Agora app ID and certificate to be configured by the service owner.
        </p>
      </main>
    </div>
  );
}

export default VideoCallPage;
