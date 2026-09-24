const logger = require('../../utils/logger');

class DataValidator {
  validateTherapistData(data) {
    const errors = [];

    // Required fields
    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push('firstName: Must be at least 2 characters');
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push('lastName: Must be at least 2 characters');
    }

    if (!this.isValidEmail(data.email)) {
      errors.push('email: Invalid email format');
    }

    if (!data.phone || !this.isValidPhoneNumber(data.phone)) {
      errors.push('phone: Invalid phone number');
    }

    if (!data.license || !data.license.number) {
      errors.push('license.number: Required');
    }

    if (!data.specialties || data.specialties.length === 0) {
      errors.push('specialties: At least one specialty required');
    }

    if (!data.location || !data.location.city) {
      errors.push('location.city: Required');
    }

    // Experience validation
    if (data.experience && (isNaN(data.experience) || data.experience < 0)) {
      errors.push('experience: Must be a positive number');
    }

    // Education validation
    if (data.education && Array.isArray(data.education)) {
      data.education.forEach((edu, idx) => {
        if (!edu.degree || !edu.institution) {
          errors.push(`education[${idx}]: degree and institution required`);
        }
      });
    }

    // Pricing validation
    if (data.pricing) {
      if (data.pricing.perSession && data.pricing.perSession <= 0) {
        errors.push('pricing.perSession: Must be greater than 0');
      }
      if (data.pricing.minDuration && data.pricing.minDuration <= 0) {
        errors.push('pricing.minDuration: Must be greater than 0');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateCommunityPostData(data) {
    const errors = [];

    if (!data.title || data.title.trim().length < 5) {
      errors.push('title: Must be at least 5 characters');
    }

    if (!data.content || data.content.trim().length < 10) {
      errors.push('content: Must be at least 10 characters');
    }

    if (!data.category) {
      errors.push('category: Required');
    }

    // Check for spam indicators
    const spamScore = this.calculateSpamScore(data.title, data.content);
    if (spamScore > 0.7) {
      errors.push('Post detected as potential spam');
    }

    return {
      isValid: errors.length === 0,
      errors,
      spamScore
    };
  }

  validateResourceData(data) {
    const errors = [];

    if (!data.condition || !data.condition.name) {
      errors.push('condition.name: Required');
    }

    if (!data.symptoms || data.symptoms.length === 0) {
      errors.push('symptoms: At least one symptom required');
    }

    if (!data.treatments || data.treatments.length === 0) {
      errors.push('treatments: At least one treatment option required');
    }

    if (!data.references || data.references.length === 0) {
      errors.push('references: At least one reference required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhoneNumber(phone) {
    // Indian phone number format
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  calculateSpamScore(title, content) {
    let score = 0;

    // Check for repeated characters
    if (/(.)\1{4,}/.test(content)) {
      score += 0.2;
    }

    // Check for excessive links
    const linkCount = (content.match(/https?:\/\//g) || []).length;
    if (linkCount > 3) {
      score += 0.2;
    }

    // Check for promotional keywords
    const promotionalKeywords = [
      'click here',
      'buy now',
      'limited offer',
      'free money',
      'work from home'
    ];
    const text = (title + ' ' + content).toLowerCase();
    const promotionalMatches = promotionalKeywords.filter((keyword) => text.includes(keyword));
    if (promotionalMatches.length > 0) {
      score += 0.2;
    }

    // Check for all caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5) {
      score += 0.2;
    }

    // Check for suspicious patterns
    if (content.length < 20 && title.length > 100) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  validateMoodEntryData(data) {
    const errors = [];

    if (!data.mood || isNaN(data.mood) || data.mood < 1 || data.mood > 5) {
      errors.push('mood: Must be a number between 1 and 5');
    }

    if (data.notes && data.notes.length > 1000) {
      errors.push('notes: Maximum 1000 characters');
    }

    if (data.activities && !Array.isArray(data.activities)) {
      errors.push('activities: Must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  sanitizeInput(input) {
    if (typeof input === 'string') {
      return input
        .trim()
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .substring(0, 10000); // Limit length
    }

    if (Array.isArray(input)) {
      return input.map((item) => this.sanitizeInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  validateBulkData(dataArray, type) {
    const results = {
      total: dataArray.length,
      valid: 0,
      invalid: 0,
      errors: []
    };

    dataArray.forEach((data, index) => {
      let validation;

      switch (type) {
        case 'therapist':
          validation = this.validateTherapistData(data);
          break;
        case 'post':
          validation = this.validateCommunityPostData(data);
          break;
        case 'resource':
          validation = this.validateResourceData(data);
          break;
        case 'mood':
          validation = this.validateMoodEntryData(data);
          break;
        default:
          validation = { isValid: false, errors: ['Unknown type'] };
      }

      if (validation.isValid) {
        results.valid++;
      } else {
        results.invalid++;
        results.errors.push({
          index,
          errors: validation.errors
        });
      }
    });

    logger.info(`Validation complete for ${type}:`, {
      total: results.total,
      valid: results.valid,
      invalid: results.invalid
    });

    return results;
  }
}

module.exports = new DataValidator();
