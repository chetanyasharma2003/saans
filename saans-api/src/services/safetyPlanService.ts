import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class SafetyPlanService {
  // Get or create safety plan
  async getSafetyPlan(userId: string) {
    try {
      let plan = await prisma.safetyPlan.findUnique({
        where: { userId },
        include: { contacts: true, therapist: true },
      });

      if (!plan) {
        plan = await prisma.safetyPlan.create({
          data: { userId },
          include: { contacts: true },
        });
      }

      return plan;
    } catch (error) {
      throw new Error(`Failed to get safety plan: ${error}`);
    }
  }

  // Update safety plan
  async updateSafetyPlan(userId: string, data: any) {
    try {
      const plan = await this.getSafetyPlan(userId);

      return await prisma.safetyPlan.update({
        where: { id: plan.id },
        data: {
          ...(data.warningSignsSelf && { warningSignsSelf: data.warningSignsSelf }),
          ...(data.warningSignsOthers && { warningSignsOthers: data.warningSignsOthers }),
          ...(data.copingStrategies && { copingStrategies: data.copingStrategies }),
          ...(data.distressToleranceActivities && { distressToleranceActivities: data.distressToleranceActivities }),
          ...(data.safePlaces && { safePlaces: data.safePlaces }),
          ...(data.safetyActions && { safetyActions: data.safetyActions }),
        },
        include: { contacts: true },
      });
    } catch (error) {
      throw new Error(`Failed to update safety plan: ${error}`);
    }
  }

  // Add contact to safety plan
  async addContact(userId: string, contactData: any) {
    try {
      const plan = await this.getSafetyPlan(userId);

      return await prisma.safetyContact.create({
        data: {
          planId: plan.id,
          name: contactData.name,
          phone: contactData.phone,
          email: contactData.email,
          relationship: contactData.relationship,
          notesAboutPerson: contactData.notesAboutPerson,
          contactType: contactData.contactType || 'SOCIAL',
        },
      });
    } catch (error) {
      throw new Error(`Failed to add contact: ${error}`);
    }
  }

  // Remove contact
  async removeContact(contactId: string) {
    try {
      return await prisma.safetyContact.delete({
        where: { id: contactId },
      });
    } catch (error) {
      throw new Error(`Failed to remove contact: ${error}`);
    }
  }

  // Get crisis resources
  async getCrisisResources(country: string = 'India', resourceType?: string) {
    try {
      return await prisma.crisisResourceLocation.findMany({
        where: {
          country,
          ...(resourceType && { resourceType }),
          isVerified: true,
        },
        take: 20,
      });
    } catch (error) {
      throw new Error(`Failed to get crisis resources: ${error}`);
    }
  }

  // Set therapist mentor for plan
  async setTherapistMentor(userId: string, therapistId: string) {
    try {
      const plan = await this.getSafetyPlan(userId);

      return await prisma.safetyPlan.update({
        where: { id: plan.id },
        data: {
          therapistId,
          lastReviewedAt: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`Failed to set therapist mentor: ${error}`);
    }
  }

  // Export safety plan
  async exportSafetyPlan(userId: string) {
    try {
      const plan = await this.getSafetyPlan(userId);
      return {
        plan,
        exportedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to export safety plan: ${error}`);
    }
  }
}

export default new SafetyPlanService();
