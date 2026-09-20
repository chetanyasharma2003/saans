import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import medicalRecordsService from '../services/medicalRecordsService.js';

const router = Router();

// Get medical record
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const record = await medicalRecordsService.getMedicalRecord(userId);
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Add medication
router.post('/medications/add', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const medication = await medicalRecordsService.addMedication(userId, req.body);
    res.json({ success: true, data: medication });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Get medications
router.get('/medications', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const record = await medicalRecordsService.getMedicalRecord(userId);
    res.json({ success: true, data: record.currentMedications });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Update medication
router.put('/medications/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const medication = await medicalRecordsService.updateMedication(req.params.id, req.body);
    res.json({ success: true, data: medication });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Delete medication
router.delete('/medications/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    await medicalRecordsService.deleteMedication(req.params.id);
    res.json({ success: true, message: 'Medication deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Add diagnosis
router.post('/diagnosis/add', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const diagnosis = await medicalRecordsService.addDiagnosis(userId, req.body);
    res.json({ success: true, data: diagnosis });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Get therapy notes
router.get('/therapy-notes', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notes = await medicalRecordsService.getTherapyNotes(userId);
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

// Export medical records
router.get('/export', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const exported = await medicalRecordsService.exportMedicalRecords(userId);
    res.json({ success: true, data: exported });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error' });
  }
});

export default router;
