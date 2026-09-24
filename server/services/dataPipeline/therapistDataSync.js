const axios = require('axios');
const logger = require('../../utils/logger');
const Therapist = require('../../models/Therapist');
const { geocodeAddress } = require('./locationMatcher');
const dataValidator = require('./dataValidator');

class TherapistDataSync {
  async syncFromMultipleSources() {
    logger.info('Starting therapist data sync from multiple sources');

    let totalSynced = 0;

    // Source 1: Manual partner data (CSV upload)
    try {
      const partnerCount = await this.syncPartnerDatabase();
      totalSynced += partnerCount;
      logger.info(`Synced ${partnerCount} therapists from partner database`);
    } catch (error) {
      logger.error('Error syncing partner database:', { error: error.message });
    }

    // Source 2: Psychology Today API (if available)
    try {
      const ptCount = await this.syncPsychologyTodayData();
      totalSynced += ptCount;
      logger.info(`Synced ${ptCount} therapists from Psychology Today`);
    } catch (error) {
      logger.error('Error syncing Psychology Today:', { error: error.message });
    }

    // Source 3: Local therapist registrations
    try {
      const localCount = await this.processLocalRegistrations();
      totalSynced += localCount;
      logger.info(`Processed ${localCount} local therapist registrations`);
    } catch (error) {
      logger.error('Error processing local registrations:', { error: error.message });
    }

    logger.info(`Therapist sync complete: Total synced = ${totalSynced}`);
    return totalSynced;
  }

  async syncPartnerDatabase() {
    // In production, this would connect to partner CRM/database
    // For now, it's a placeholder
    logger.info('Attempting to sync partner database');
    return 0;
  }

  async syncPsychologyTodayData() {
    // This would connect to Psychology Today API if available
    // Currently a placeholder
    logger.info('Attempting to sync Psychology Today data');
    return 0;
  }

  async processLocalRegistrations() {
    // Process therapists who registered directly on platform
    const unprocessedTherapists = await Therapist.find({
      'verification.status': 'pending'
    }).limit(100);

    let processed = 0;

    for (const therapist of unprocessedTherapists) {
      try {
        // Verify license
        const isLicenseValid = await this.verifyLicense(therapist.license);

        if (isLicenseValid) {
          // Geocode address if needed
          if (!therapist.location.coordinates) {
            therapist.location.coordinates = await geocodeAddress(
              therapist.location.address || therapist.location.city
            );
          }

          // Update verification status
          therapist.verification.status = 'approved';
          therapist.verification.verifiedDate = new Date();
          therapist.isActive = true;

          await therapist.save();
          processed++;

          logger.info(`Verified and activated therapist: ${therapist.firstName} ${therapist.lastName}`);
        } else {
          therapist.verification.status = 'rejected';
          therapist.verification.rejectionReason = 'License verification failed';
          await therapist.save();
        }
      } catch (error) {
        logger.error('Error processing therapist:', {
          error: error.message,
          therapistId: therapist._id
        });
      }
    }

    return processed;
  }

  async verifyLicense(license) {
    // This would connect to Indian Medical Council or state council APIs
    // For now, we'll do basic validation
    if (!license.number || license.number.length < 5) {
      return false;
    }

    // TODO: Integrate with actual verification APIs
    // For now, just log that we would verify
    logger.info(`Would verify license: ${license.number}`);

    return true;
  }

  async updateTherapistStats() {
    logger.info('Updating therapist statistics');

    const therapists = await Therapist.find({ isActive: true });

    for (const therapist of therapists) {
      try {
        // Calculate statistics from appointments and reviews
        const completedSessions = await this.getCompletedSessionCount(therapist._id);
        const cancelledSessions = await this.getCancelledSessionCount(therapist._id);
        const avgRating = await this.calculateAverageRating(therapist._id);

        therapist.stats = {
          totalSessions: completedSessions + cancelledSessions,
          completedSessions,
          cancelledSessions,
          averageSessionDuration: 60, // Default
          clientSatisfactionRate: avgRating * 20 // Convert 5-point to 100-point
        };

        therapist.lastActivityDate = new Date();
        await therapist.save();
      } catch (error) {
        logger.error('Error updating therapist stats:', {
          error: error.message,
          therapistId: therapist._id
        });
      }
    }
  }

  async getCompletedSessionCount(therapistId) {
    // This would query appointment collection
    // Placeholder for now
    return 0;
  }

  async getCancelledSessionCount(therapistId) {
    // Placeholder
    return 0;
  }

  async calculateAverageRating(therapistId) {
    // Placeholder
    return 4.5;
  }

  async importBulkTherapistData(dataArray) {
    logger.info(`Importing ${dataArray.length} therapists`);

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const data of dataArray) {
      try {
        // Validate data
        const validation = dataValidator.validateTherapistData(data);
        if (!validation.isValid) {
          errors.push({
            data,
            reason: validation.errors
          });
          skipped++;
          continue;
        }

        // Check if therapist already exists
        const existing = await Therapist.findOne({ email: data.email });
        if (existing) {
          skipped++;
          continue;
        }

        // Geocode address
        const coordinates = await geocodeAddress(data.location.address || data.location.city);

        // Create therapist
        const therapist = new Therapist({
          ...data,
          location: {
            ...data.location,
            coordinates
          },
          verification: {
            status: 'approved',
            verifiedDate: new Date()
          },
          isActive: true
        });

        await therapist.save();
        imported++;

        logger.info(`Imported therapist: ${therapist.firstName} ${therapist.lastName}`);
      } catch (error) {
        errors.push({
          data,
          reason: error.message
        });
        logger.error('Error importing therapist:', { error: error.message });
      }
    }

    logger.info(`Bulk import complete: ${imported} imported, ${skipped} skipped, ${errors.length} errors`);

    return {
      imported,
      skipped,
      errors
    };
  }

  async deactivateInactiveTherapists(daysInactive = 90) {
    logger.info(`Deactivating therapists inactive for more than ${daysInactive} days`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const result = await Therapist.updateMany(
      {
        isActive: true,
        lastActivityDate: { $lt: cutoffDate }
      },
      {
        isActive: false,
        status: 'inactive'
      }
    );

    logger.info(`Deactivated ${result.modifiedCount} therapists`);
    return result.modifiedCount;
  }
}

module.exports = new TherapistDataSync();
