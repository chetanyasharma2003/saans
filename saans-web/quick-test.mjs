import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function testRegister() {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name: 'Quick Test ' + Date.now(),
      email: `quicktest${Date.now()}@example.com`,
      password: 'TestPass123!',
      city: 'Mumbai',
      role: 'PATIENT',
    });

    console.log('Registration successful:', response.status);
    console.log('Token received:', !!response.data.accessToken);
    console.log('User email:', response.data.user.email);
  } catch (error) {
    console.error('Registration failed:', error.response?.status, error.response?.data);
  }
}

testRegister();
