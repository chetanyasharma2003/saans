import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/colors-genuine.css';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  sideEffects: string[];
}

const MedicalRecordsPage: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    prescribedBy: '',
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await axios.get('/api/medical-records/medications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMedications(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/medical-records/medications/add', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFormData({ name: '', dosage: '', frequency: '', startDate: '', prescribedBy: '' });
      setShowAddForm(false);
      fetchMedications();
    } catch (error) {
      console.error('Failed to add medication:', error);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      await axios.delete(`/api/medical-records/medications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchMedications();
    } catch (error) {
      console.error('Failed to delete medication:', error);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Your Medical Records
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Manage your medications, diagnoses, and therapy notes
          </p>
        </div>

        {/* Medications Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>
              Current Medications
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-lg font-semibold transition"
              style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
              }}
            >
              + Add Medication
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddMedication} className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Medication Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="p-3 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g., 10mg)"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="p-3 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Frequency (e.g., Once daily)"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="p-3 border rounded"
                  required
                />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="p-3 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg font-semibold transition"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                }}
              >
                Save Medication
              </button>
            </form>
          )}

          {loading ? (
            <p>Loading medications...</p>
          ) : medications.length > 0 ? (
            <div className="space-y-4">
              {medications.map((med) => (
                <div key={med.id} className="border-l-4 p-4 rounded" style={{ borderLeftColor: 'var(--primary-color)' }}>
                  <h3 className="text-xl font-bold">{med.name}</h3>
                  <p className="text-gray-600">
                    {med.dosage} - {med.frequency}
                  </p>
                  <p className="text-sm text-gray-500">
                    Started: {new Date(med.startDate).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => handleDeleteMedication(med.id)}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No medications tracked yet</p>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-gradient-to-r p-8 rounded-lg text-white">
          <h3 className="text-xl font-bold mb-2">Export Your Records</h3>
          <p className="mb-4">Download your complete medical records for safekeeping or to share with healthcare providers</p>
          <button
            className="px-6 py-2 bg-white rounded-lg font-semibold transition hover:bg-gray-100"
            style={{ color: 'var(--primary-color)' }}
          >
            Download as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
