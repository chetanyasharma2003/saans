const axios = require('axios');
const logger = require('../../utils/logger');
const Therapist = require('../../models/Therapist');

class LocationMatcher {
  async geocodeAddress(address) {
    try {
      // Using Google Geocoding API (free tier available)
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        logger.warn('Google Maps API key not configured, using default coordinates');
        return [72.8479, 19.0144]; // Default to Mumbai
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address,
          key: apiKey
        }
      });

      if (response.data.results.length === 0) {
        logger.warn(`Could not geocode address: ${address}`);
        return [72.8479, 19.0144]; // Default to Mumbai
      }

      const { lng, lat } = response.data.results[0].geometry.location;
      return [lng, lat]; // MongoDB expects [longitude, latitude]
    } catch (error) {
      logger.error('Geocoding error:', { error: error.message });
      return [72.8479, 19.0144]; // Default to Mumbai
    }
  }

  async findNearbyTherapists(userCoordinates, radiusKm = 50) {
    try {
      const therapists = await Therapist.find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: userCoordinates // [longitude, latitude]
            },
            $maxDistance: radiusKm * 1000 // Convert to meters
          }
        },
        isActive: true,
        'verification.status': 'approved'
      })
        .sort({ 'ratings.average': -1 })
        .limit(50);

      logger.info(`Found ${therapists.length} therapists within ${radiusKm}km`);
      return therapists;
    } catch (error) {
      logger.error('Error finding nearby therapists:', { error: error.message });
      throw error;
    }
  }

  async findTherapistsBySpecialty(specialty, userCoordinates, radiusKm = 50) {
    try {
      const therapists = await Therapist.find({
        specialties: specialty,
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: userCoordinates
            },
            $maxDistance: radiusKm * 1000
          }
        },
        isActive: true,
        'verification.status': 'approved'
      })
        .sort({ 'ratings.average': -1 })
        .limit(50);

      return therapists;
    } catch (error) {
      logger.error('Error finding therapists by specialty:', { error: error.message });
      throw error;
    }
  }

  async findTherapistsByLanguage(language, userCoordinates, radiusKm = 50) {
    try {
      const therapists = await Therapist.find({
        languages: language,
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: userCoordinates
            },
            $maxDistance: radiusKm * 1000
          }
        },
        isActive: true,
        'verification.status': 'approved'
      })
        .sort({ 'ratings.average': -1 })
        .limit(50);

      return therapists;
    } catch (error) {
      logger.error('Error finding therapists by language:', { error: error.message });
      throw error;
    }
  }

  async findTherapistsByMultipleCriteria(filters, userCoordinates, radiusKm = 50) {
    try {
      const query = {
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: userCoordinates
            },
            $maxDistance: radiusKm * 1000
          }
        },
        isActive: true,
        'verification.status': 'approved'
      };

      // Add filters
      if (filters.specialties && filters.specialties.length > 0) {
        query.specialties = { $in: filters.specialties };
      }

      if (filters.languages && filters.languages.length > 0) {
        query.languages = { $in: filters.languages };
      }

      if (filters.minRating) {
        query['ratings.average'] = { $gte: filters.minRating };
      }

      if (filters.maxPrice) {
        query['pricing.perSession'] = { $lte: filters.maxPrice };
      }

      if (filters.sessionFormat) {
        query.sessionFormat = { $in: filters.sessionFormat };
      }

      const therapists = await Therapist.find(query)
        .sort({ 'ratings.average': -1 })
        .limit(50);

      logger.info(`Found ${therapists.length} therapists with filters:`, filters);
      return therapists;
    } catch (error) {
      logger.error('Error finding therapists with multiple criteria:', {
        error: error.message,
        filters
      });
      throw error;
    }
  }

  async getDistanceBetweenCoordinates(coord1, coord2) {
    // Haversine formula to calculate distance
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  async enrichTherapistWithDistance(therapist, userCoordinates) {
    const distance = await this.getDistanceBetweenCoordinates(
      therapist.location.coordinates.coordinates,
      userCoordinates
    );

    return {
      ...therapist.toObject(),
      distanceKm: Math.round(distance * 10) / 10
    };
  }
}

module.exports = new LocationMatcher();
