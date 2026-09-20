import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/colors-genuine.css';

interface SafetyContact {
  id: string;
  name: string;
  phone?: string;
  relationship?: string;
  contactType: string;
}

const SafetyPlanPage: React.FC = () => {
  const [safetyPlan, setSafetyPlan] = useState<any>(null);
  const [contacts, setContacts] = useState<SafetyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
    contactType: 'SOCIAL',
  });

  const crisisHotlines = [
    { name: 'AASRA (Suicide Help)', phone: '9820466726', country: 'India' },
    { name: 'iCall (Emotional Support)', phone: '9152987821', country: 'India' },
    { name: 'Crisis Text Line', phone: 'Text HOME to 741741', country: 'USA' },
    { name: 'National Suicide Prevention Lifeline', phone: '988', country: 'USA' },
  ];

  useEffect(() => {
    fetchSafetyPlan();
  }, []);

  const fetchSafetyPlan = async () => {
    try {
      const response = await axios.get('/api/safety/plan', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSafetyPlan(response.data.data);
      setContacts(response.data.data?.contacts || []);
    } catch (error) {
      console.error('Failed to fetch safety plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/safety/contacts/add', newContact, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNewContact({ name: '', phone: '', relationship: '', contactType: 'SOCIAL' });
      setShowAddContact(false);
      fetchSafetyPlan();
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Your Safety Plan
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            A personalized plan to help you stay safe during difficult times
          </p>
        </div>

        {/* SOS Button */}
        <div className="mb-8">
          <button
            className="w-full py-6 rounded-lg text-white text-2xl font-bold transition transform hover:scale-105"
            style={{ backgroundColor: '#dc2626' }}
          >
            🆘 I NEED HELP NOW
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - My Contacts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>
                  My Safety Contacts
                </h2>
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="px-4 py-2 rounded-lg font-semibold text-white transition"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  + Add Contact
                </button>
              </div>

              {showAddContact && (
                <form onSubmit={handleAddContact} className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="w-full p-3 border rounded"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      className="w-full p-3 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Relationship (e.g., Mom, Best Friend)"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                      className="w-full p-3 border rounded"
                    />
                    <button
                      type="submit"
                      className="w-full px-6 py-2 rounded-lg font-semibold text-white transition"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      Save Contact
                    </button>
                  </div>
                </form>
              )}

              {loading ? (
                <p>Loading...</p>
              ) : contacts.length > 0 ? (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="border-l-4 p-4 rounded" style={{ borderLeftColor: 'var(--primary-color)' }}>
                      <h3 className="text-lg font-bold">{contact.name}</h3>
                      {contact.phone && <p className="text-gray-600">{contact.phone}</p>}
                      {contact.relationship && <p className="text-sm text-gray-500">{contact.relationship}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No contacts added yet. Add people you trust for support.</p>
              )}
            </div>

            {/* Warning Signs */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-color)' }}>
                My Warning Signs
              </h2>
              <p className="text-gray-600 mb-4">
                These are signs that might mean I'm in crisis and need to reach out:
              </p>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-gray-700">Add your personal warning signs to your plan</p>
              </div>
            </div>
          </div>

          {/* Right Column - Crisis Resources */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-color)' }}>
              Crisis Resources
            </h2>

            <div className="space-y-4">
              {crisisHotlines.map((hotline) => (
                <div key={hotline.name} className="border-l-4 p-3 rounded" style={{ borderLeftColor: '#dc2626' }}>
                  <h3 className="font-bold text-sm">{hotline.name}</h3>
                  <p className="text-red-600 font-semibold">{hotline.phone}</p>
                </div>
              ))}
            </div>

            <button
              className="w-full mt-6 px-4 py-3 rounded-lg font-semibold text-white transition"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              View More Resources
            </button>

            {/* Export */}
            <div className="mt-6 pt-6 border-t">
              <button className="w-full px-4 py-2 border rounded-lg font-semibold transition hover:bg-gray-50">
                📋 Print/Export Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyPlanPage;
