import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Crisis keywords that trigger detection
const CRISIS_KEYWORDS = {
  CRITICAL: [
    'suicide', 'kill myself', 'die', 'dead', 'hang myself', 'overdose',
    'cut myself', 'self harm', 'hurt myself', 'end my life', 'no point living',
    'just want to die', 'better off dead', 'take my life', 'would be better off dead',
    'jump', 'slit', 'rope', 'poison', 'drown', 'crash', 'stab',
    'everyone would be better off without me', 'world would be better without me'
  ],
  HIGH: [
    'suicidal', 'suicide attempt', 'depressed', 'severe anxiety', 'panic attack',
    'breakdown', 'mental breakdown', 'losing control', 'can\'t cope', 'too much',
    'hopeless', 'meaningless', 'worthless', 'failure', 'nobody cares',
    'alone', 'lonely', 'isolated', 'desperate', 'unbearable', 'intolerable',
    'dark thoughts', 'intrusive thoughts', 'hear voices', 'hallucinating'
  ],
  MEDIUM: [
    'depressed', 'depression', 'anxious', 'anxiety', 'stress', 'overwhelmed',
    'worried', 'afraid', 'scared', 'sad', 'upset', 'angry', 'frustrated',
    'can\'t sleep', 'insomnia', 'trouble sleeping', 'panic', 'spiraling',
    'struggling', 'difficult', 'hard time', 'not feeling well'
  ]
};

// India emergency hotline numbers
const INDIA_HOTLINES = [
  {
    name: 'National Suicide Prevention Hotline (AASRA)',
    number: '+91-22-27546669',
    city: 'Mumbai',
    availability: '24/7',
    languages: ['Hindi', 'English', 'Marathi']
  },
  {
    name: 'iCall - Emotional Support Helpline',
    number: '9152987821',
    city: 'Pan India',
    availability: '24/7',
    languages: ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Malayalam']
  },
  {
    name: 'Vandrevala Foundation',
    number: '9999 666 555',
    city: 'Pan India',
    availability: '24/7',
    languages: ['English', 'Hindi']
  },
  {
    name: 'iMind - Mental Health Support',
    number: '+91-92924-64169',
    city: 'Pan India',
    availability: 'Mon-Sat, 10AM-6PM',
    languages: ['English', 'Hindi']
  },
  {
    name: 'AASRA Crisis Helpline',
    number: '+91-22-2754-6669',
    city: 'Pan India',
    availability: '24/7',
    languages: ['English', 'Hindi', 'Marathi']
  },
  {
    name: 'Befrienders India - Chennai',
    number: '+91-44-2464-0050',
    city: 'Chennai',
    availability: '24/7',
    languages: ['English', 'Tamil']
  },
  {
    name: 'Befrienders India - Bangalore',
    number: '+91-80-2533-9174',
    city: 'Bangalore',
    availability: '24/7',
    languages: ['English', 'Kannada']
  },
  {
    name: 'Samvedna Crisis Helpline',
    number: '98256-98256',
    city: 'Pan India',
    availability: '24/7',
    languages: ['English', 'Hindi', 'Punjabi']
  },
  {
    name: 'Project RoshniSurakshe',
    number: '+91-80-2558-9999',
    city: 'Pan India',
    availability: '10AM-8PM',
    languages: ['English', 'Hindi', 'Kannada']
  },
  {
    name: 'The Samaritans - Pune',
    number: '+91-20-5605-0505',
    city: 'Pune',
    availability: '24/7',
    languages: ['English', 'Marathi']
  },
  {
    name: 'National Mental Health Programme',
    number: '1800-599-0019',
    city: 'Pan India',
    availability: '24/7',
    languages: ['English', 'Hindi']
  },
  {
    name: 'AASRA WhatsApp Support',
    number: '+91-7506-191-191',
    city: 'Pan India',
    availability: '24/7',
    languages: ['English', 'Hindi']
  }
];

interface CrisisDetectionResult {
  isCrisis: boolean;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  matchedKeywords: string[];
  confidence: number;
}

interface CreateIncidentInput {
  userId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

interface AlertContactsInput {
  userId: string;
  incidentId: string;
  incident: any;
}

export class CrisisService {
  /**
   * Detect crisis keywords in user message
   * Returns crisis level and matched keywords
   */
  detectCrisisKeywords(message: string): CrisisDetectionResult {
    const lowerMessage = message.toLowerCase();
    const matchedKeywords: string[] = [];
    let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    // Check critical keywords first (highest priority)
    for (const keyword of CRISIS_KEYWORDS.CRITICAL) {
      if (lowerMessage.includes(keyword)) {
        matchedKeywords.push(keyword);
        level = 'HIGH';
      }
    }

    // If no critical keywords, check high-level
    if (matchedKeywords.length === 0) {
      for (const keyword of CRISIS_KEYWORDS.HIGH) {
        if (lowerMessage.includes(keyword)) {
          matchedKeywords.push(keyword);
          level = 'MEDIUM';
        }
      }
    }

    // If no high-level keywords, check medium-level
    if (matchedKeywords.length === 0) {
      for (const keyword of CRISIS_KEYWORDS.MEDIUM) {
        if (lowerMessage.includes(keyword)) {
          matchedKeywords.push(keyword);
          level = 'MEDIUM';
        }
      }
    }

    // Calculate confidence based on number of matched keywords
    const confidence = Math.min(matchedKeywords.length * 0.3, 1);

    return {
      isCrisis: matchedKeywords.length > 0,
      level,
      matchedKeywords: [...new Set(matchedKeywords)], // Remove duplicates
      confidence
    };
  }

  /**
   * Create a new crisis incident record
   */
  async createCrisisIncident(input: CreateIncidentInput) {
    try {
      const incident = await prisma.crisisIncident.create({
        data: {
          userId: input.userId,
          level: input.severity,
          content: input.description,
          status: 'ACTIVE',
          detectedAt: new Date(),
          emergencyAlertSent: false,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phoneNumber: true,
            }
          }
        }
      });

      console.log(`[Crisis] Incident created: ${incident.id} for user ${input.userId} with level ${input.severity}`);

      return incident;
    } catch (error) {
      console.error('[Crisis] Error creating incident:', error);
      throw new Error('Failed to create crisis incident');
    }
  }

  /**
   * Alert emergency contacts with notification
   */
  async alertEmergencyContacts(input: AlertContactsInput) {
    try {
      const { userId, incidentId, incident } = input;

      // Fetch emergency contacts for this user
      const emergencyContacts = await prisma.emergencyContact.findMany({
        where: {
          userId,
          alertOnCrisis: true,
        },
      });

      if (emergencyContacts.length === 0) {
        console.log(`[Crisis] No emergency contacts found for user ${userId}`);
        return { contacted: 0, contacts: [] };
      }

      // Create notifications for each emergency contact
      const contactedList = [];

      for (const contact of emergencyContacts) {
        try {
          // Send notification (in production, this would be email/SMS)
          const notification = await prisma.notification.create({
            data: {
              userId: contact.userId,
              type: 'CRISIS_ALERT',
              title: `Crisis Alert: ${incident.user.name}`,
              message: `${incident.user.name} has triggered a crisis alert (${incident.level}). Contact them immediately if safe.`,
              data: {
                incidentId,
                contactName: contact.name,
                relationship: contact.relationship,
                phoneNumber: contact.phoneNumber,
                severity: incident.level,
              } as any,
            },
          });

          // In production, send actual SMS/Email here
          // await this.sendSMS(contact.phoneNumber, `CRISIS ALERT: ${incident.user.name} needs help. Level: ${incident.level}`);
          // await this.sendEmail(contact.email, `Crisis Alert for ${incident.user.name}`, ...);

          contactedList.push({
            contactId: contact.id,
            name: contact.name,
            relationship: contact.relationship,
            phoneNumber: contact.phoneNumber,
            notificationId: notification.id,
          });

          console.log(`[Crisis] Alert notification created for contact: ${contact.name}`);
        } catch (err) {
          console.error(`[Crisis] Failed to alert contact ${contact.name}:`, err);
        }
      }

      // Update incident to mark emergency alert as sent
      await prisma.crisisIncident.update({
        where: { id: incidentId },
        data: { emergencyAlertSent: true },
      });

      return {
        contacted: contactedList.length,
        contacts: contactedList,
      };
    } catch (error) {
      console.error('[Crisis] Error alerting emergency contacts:', error);
      throw new Error('Failed to alert emergency contacts');
    }
  }

  /**
   * Get list of emergency hotline numbers
   */
  getHotlineNumbers() {
    return INDIA_HOTLINES;
  }

  /**
   * Get hotlines for a specific state (if available)
   */
  getHotlinesByCity(city: string) {
    return INDIA_HOTLINES.filter(
      hotline => hotline.city.toLowerCase().includes(city.toLowerCase()) ||
                  hotline.city === 'Pan India'
    );
  }

  /**
   * Escalate incident to therapist for immediate intervention
   */
  async escalateToTherapist(incidentId: string) {
    try {
      const incident = await prisma.crisisIncident.findUnique({
        where: { id: incidentId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          }
        }
      });

      if (!incident) {
        throw new Error('Incident not found');
      }

      // Update incident status to escalated
      const updatedIncident = await prisma.crisisIncident.update({
        where: { id: incidentId },
        data: {
          status: 'ESCALATED_TO_THERAPIST',
          handledBy: 'SYSTEM',
        },
      });

      // Create a high-priority notification for therapists
      // In production, this would notify available therapists
      await prisma.notification.create({
        data: {
          userId: incident.userId,
          type: 'THERAPIST_ESCALATION',
          title: 'Crisis Escalated to Therapist',
          message: 'A therapist has been notified and will contact you shortly. Stay safe.',
          data: {
            incidentId,
            severity: incident.level,
          } as any,
        },
      });

      console.log(`[Crisis] Incident ${incidentId} escalated to therapist`);

      return updatedIncident;
    } catch (error) {
      console.error('[Crisis] Error escalating incident:', error);
      throw new Error('Failed to escalate incident to therapist');
    }
  }

  /**
   * Get all incidents for a user
   */
  async getMyIncidents(userId: string, limit: number = 50) {
    try {
      const incidents = await prisma.crisisIncident.findMany({
        where: { userId },
        orderBy: { detectedAt: 'desc' },
        take: limit,
      });

      return incidents;
    } catch (error) {
      console.error('[Crisis] Error fetching incidents:', error);
      throw new Error('Failed to fetch crisis incidents');
    }
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(incidentId: string, status: string) {
    try {
      const validStatuses = ['ACTIVE', 'RESOLVED', 'ESCALATED_TO_THERAPIST', 'CLOSED'];

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const incident = await prisma.crisisIncident.update({
        where: { id: incidentId },
        data: {
          status,
          resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
        },
      });

      // Create resolution notification
      if (status === 'RESOLVED') {
        await prisma.notification.create({
          data: {
            userId: incident.userId,
            type: 'CRISIS_RESOLVED',
            title: 'Crisis Incident Resolved',
            message: 'Your crisis incident has been marked as resolved. Take care of yourself.',
            data: {
              incidentId,
            } as any,
          },
        });
      }

      console.log(`[Crisis] Incident ${incidentId} status updated to ${status}`);

      return incident;
    } catch (error) {
      console.error('[Crisis] Error updating incident status:', error);
      throw new Error('Failed to update incident status');
    }
  }

  /**
   * Get crisis statistics for admin dashboard
   */
  async getCrisisStatistics(userId?: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const whereClause = userId ? { userId, detectedAt: { gte: startDate } } : { detectedAt: { gte: startDate } };

      const [total, byLevel, byStatus, resolved] = await Promise.all([
        prisma.crisisIncident.count({ where: whereClause }),
        prisma.crisisIncident.groupBy({
          by: ['level'],
          where: whereClause,
          _count: true,
        }),
        prisma.crisisIncident.groupBy({
          by: ['status'],
          where: whereClause,
          _count: true,
        }),
        prisma.crisisIncident.count({
          where: { ...whereClause, status: 'RESOLVED' },
        }),
      ]);

      return {
        totalIncidents: total,
        resolved,
        pending: total - resolved,
        byLevel: Object.fromEntries(byLevel.map(item => [item.level, item._count])),
        byStatus: Object.fromEntries(byStatus.map(item => [item.status, item._count])),
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('[Crisis] Error getting statistics:', error);
      throw new Error('Failed to get crisis statistics');
    }
  }
}

export default new CrisisService();
