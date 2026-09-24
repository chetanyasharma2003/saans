let RtcTokenBuilder = null;
let RtcRole = null;
const logger = require('../utils/logger');

try {
  const agoraModule = require('agora-access-token');
  RtcTokenBuilder = agoraModule.RtcTokenBuilder;
  RtcRole = agoraModule.RtcRole;
} catch (e) {
  logger.warn('agora-access-token not installed - video calls disabled for MVP');
}

class VideoCallService {
  constructor() {
    this.appId = process.env.AGORA_APP_ID;
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE;
    this.expirationTimeInSeconds = 3600; // 1 hour

    // Validate Agora credentials
    if (!this.appId || !this.appCertificate) {
      logger.warn('⚠️  Agora credentials not configured. Video calls will fail.');
      logger.warn('Set AGORA_APP_ID and AGORA_APP_CERTIFICATE in .env');
    }
  }

  // Check if video calls are enabled
  isConfigured() {
    return !!(this.appId && this.appCertificate);
  }

  // ==================== TOKEN GENERATION ====================

  generateToken(channelName, userId, role = 'publisher') {
    try {
      if (!RtcTokenBuilder || !RtcRole) {
        logger.warn('Video calls disabled for MVP - Agora not installed');
        return { success: false, message: 'Video calls not available' };
      }
      const rtcRole = role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

      const token = RtcTokenBuilder.buildTokenWithUid(
        this.appId,
        this.appCertificate,
        channelName,
        userId,
        rtcRole,
        this.expirationTimeInSeconds
      );

      logger.info('Video call token generated', { channelName, userId });
      return {
        success: true,
        token,
        channelName,
        appId: this.appId,
        uid: userId
      };
    } catch (error) {
      logger.error('Token generation error', { error: error.message });
      throw error;
    }
  }

  // ==================== SESSION MANAGEMENT ====================

  async startVideoSession(appointmentId, therapistId, userId) {
    try {
      const channelName = `appointment_${appointmentId}`;

      // Generate tokens for both participants
      const therapistToken = this.generateToken(channelName, therapistId, 'publisher');
      const userToken = this.generateToken(channelName, userId, 'publisher');

      const sessionData = {
        channelName,
        appointmentId,
        therapistId,
        userId,
        startTime: new Date(),
        status: 'active',
        tokens: {
          therapist: therapistToken.token,
          user: userToken.token
        }
      };

      logger.info('Video session started', { appointmentId, channelName });
      return {
        success: true,
        session: sessionData,
        therapistToken: therapistToken.token,
        userToken: userToken.token
      };
    } catch (error) {
      logger.error('Video session start error', { error: error.message });
      throw error;
    }
  }

  async endVideoSession(appointmentId, duration, recordingUrl = null) {
    try {
      const sessionData = {
        appointmentId,
        endTime: new Date(),
        duration, // in seconds
        recordingUrl,
        status: 'completed'
      };

      logger.info('Video session ended', { appointmentId, duration });
      return {
        success: true,
        session: sessionData
      };
    } catch (error) {
      logger.error('Video session end error', { error: error.message });
      throw error;
    }
  }

  // ==================== RECORDING MANAGEMENT ====================

  async startRecording(channelName, recordingConfig = {}) {
    try {
      const recording = {
        channelName,
        recordingId: `rec_${Date.now()}`,
        startTime: new Date(),
        config: recordingConfig,
        status: 'recording'
      };

      logger.info('Recording started', { channelName, recordingId: recording.recordingId });
      return {
        success: true,
        recordingId: recording.recordingId,
        status: 'recording'
      };
    } catch (error) {
      logger.error('Recording start error', { error: error.message });
      throw error;
    }
  }

  async stopRecording(recordingId) {
    try {
      const recording = {
        recordingId,
        endTime: new Date(),
        status: 'stopped'
      };

      logger.info('Recording stopped', { recordingId });
      return {
        success: true,
        recordingId,
        status: 'stopped'
      };
    } catch (error) {
      logger.error('Recording stop error', { error: error.message });
      throw error;
    }
  }

  // ==================== CALL QUALITY & ANALYTICS ====================

  async logCallMetrics(appointmentId, metrics) {
    try {
      const qualityMetrics = {
        appointmentId,
        timestamp: new Date(),
        audio: {
          quality: metrics.audioQuality, // 'excellent', 'good', 'fair', 'poor'
          bitrate: metrics.audioBitrate,
          packetLoss: metrics.audioPacketLoss
        },
        video: {
          quality: metrics.videoQuality,
          resolution: metrics.videoResolution,
          fps: metrics.videoFps,
          bitrate: metrics.videoBitrate,
          packetLoss: metrics.videoPacketLoss
        },
        network: {
          delay: metrics.networkDelay,
          jitter: metrics.networkJitter
        }
      };

      logger.info('Call metrics logged', { appointmentId, quality: metrics.audioQuality });
      return { success: true, metrics: qualityMetrics };
    } catch (error) {
      logger.error('Metrics logging error', { error: error.message });
      throw error;
    }
  }

  // ==================== SCREEN SHARING ====================

  generateScreenShareToken(channelName, userId) {
    try {
      const token = this.generateToken(`${channelName}_screen`, userId, 'publisher');

      logger.info('Screen share token generated', { channelName, userId });
      return {
        success: true,
        token: token.token,
        channelName: `${channelName}_screen`,
        uid: userId
      };
    } catch (error) {
      logger.error('Screen share token error', { error: error.message });
      throw error;
    }
  }

  // ==================== PRESENCE & STATUS ====================

  async updateUserStatus(userId, channelName, status) {
    try {
      const statusUpdate = {
        userId,
        channelName,
        status, // 'online', 'offline', 'idle'
        timestamp: new Date()
      };

      logger.info('User status updated', { userId, status });
      return { success: true, statusUpdate };
    } catch (error) {
      logger.error('Status update error', { error: error.message });
      throw error;
    }
  }

  // ==================== FAILOVER & RECONNECTION ====================

  async getBackupToken(channelName, userId, role = 'publisher') {
    try {
      // Generate a new token as backup (in case connection drops)
      const token = this.generateToken(channelName, userId, role);

      logger.info('Backup token generated', { channelName, userId });
      return {
        success: true,
        token: token.token,
        expiresIn: this.expirationTimeInSeconds
      };
    } catch (error) {
      logger.error('Backup token error', { error: error.message });
      throw error;
    }
  }

  // ==================== SESSION RECORDING PERMISSIONS ====================

  async requestRecordingPermission(appointmentId, userId) {
    try {
      const permission = {
        appointmentId,
        userId,
        timestamp: new Date(),
        recordingAllowed: true,
        consentRequired: true
      };

      logger.info('Recording permission requested', { appointmentId, userId });
      return { success: true, permission };
    } catch (error) {
      logger.error('Permission request error', { error: error.message });
      throw error;
    }
  }
}

module.exports = new VideoCallService();
