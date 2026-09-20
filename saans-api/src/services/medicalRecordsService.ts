import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class MedicalRecordsService {
  // Get medical record for user
  async getMedicalRecord(userId: string) {
    try {
      let record = await prisma.medicalRecord.findUnique({
        where: { userId },
        include: {
          currentMedications: true,
          medicationHistory: true,
          diagnosisHistory: true,
          therapyNotes: {
            include: { therapist: true },
          },
          consentLogs: true,
          accessLogs: true,
        },
      });

      if (!record) {
        record = await prisma.medicalRecord.create({
          data: { userId },
          include: {
            currentMedications: true,
            medicationHistory: true,
            diagnosisHistory: true,
            therapyNotes: {
              include: { therapist: true },
            },
            consentLogs: true,
            accessLogs: true,
          },
        });
      }

      return record;
    } catch (error) {
      throw new Error(`Failed to get medical record: ${error}`);
    }
  }

  // Add medication
  async addMedication(userId: string, data: any) {
    try {
      const record = await this.getMedicalRecord(userId);
      return await prisma.medication.create({
        data: {
          recordId: record.id,
          name: data.name,
          dosage: data.dosage,
          frequency: data.frequency,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          prescribedBy: data.prescribedBy,
          sideEffects: data.sideEffects || [],
          notes: data.notes,
        },
      });
    } catch (error) {
      throw new Error(`Failed to add medication: ${error}`);
    }
  }

  // Update medication
  async updateMedication(medicationId: string, data: any) {
    try {
      return await prisma.medication.update({
        where: { id: medicationId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.dosage && { dosage: data.dosage }),
          ...(data.frequency && { frequency: data.frequency }),
          ...(data.endDate && { endDate: new Date(data.endDate) }),
          ...(data.prescribedBy && { prescribedBy: data.prescribedBy }),
          ...(data.sideEffects && { sideEffects: data.sideEffects }),
          ...(data.notes && { notes: data.notes }),
        },
      });
    } catch (error) {
      throw new Error(`Failed to update medication: ${error}`);
    }
  }

  // Delete medication
  async deleteMedication(medicationId: string) {
    try {
      return await prisma.medication.delete({
        where: { id: medicationId },
      });
    } catch (error) {
      throw new Error(`Failed to delete medication: ${error}`);
    }
  }

  // Add diagnosis
  async addDiagnosis(userId: string, data: any) {
    try {
      const record = await this.getMedicalRecord(userId);
      return await prisma.diagnosisHistory.create({
        data: {
          recordId: record.id,
          diagnosisName: data.diagnosisName,
          diagnosisDate: new Date(data.diagnosisDate),
          severity: data.severity || 'MODERATE',
          notes: data.notes,
        },
      });
    } catch (error) {
      throw new Error(`Failed to add diagnosis: ${error}`);
    }
  }

  // Get therapy notes
  async getTherapyNotes(userId: string) {
    try {
      const record = await this.getMedicalRecord(userId);
      return await prisma.therapyNote.findMany({
        where: { recordId: record.id },
        include: { therapist: true },
      });
    } catch (error) {
      throw new Error(`Failed to get therapy notes: ${error}`);
    }
  }

  // Export medical records (PDF format preparation)
  async exportMedicalRecords(userId: string) {
    try {
      const record = await this.getMedicalRecord(userId);
      return {
        medicalRecord: record,
        exportedAt: new Date(),
        format: 'json',
      };
    } catch (error) {
      throw new Error(`Failed to export medical records: ${error}`);
    }
  }

  // Log access for HIPAA compliance
  async logAccess(recordId: string, accessedBy: string, accessType: string, reason?: string) {
    try {
      return await prisma.accessLog.create({
        data: {
          recordId,
          accessedBy,
          accessType,
          accessReason: reason,
          accessTime: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`Failed to log access: ${error}`);
    }
  }
}

export default new MedicalRecordsService();
