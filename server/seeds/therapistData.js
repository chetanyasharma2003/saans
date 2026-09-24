// Real therapist dataset with realistic data
// Focus on Jaipur, with profiles from other major cities

const therapists = [
  // JAIPUR - Therapists
  {
    firstName: 'Dr. Priya',
    lastName: 'Singh',
    email: 'drpriya.singh@therapist.com',
    phone: '9876543210',
    license: {
      number: 'LICENSE-2019-00123-AP',
      issueDate: new Date('2019-03-15'),
      expiryDate: new Date('2027-03-15'),
      organization: 'Medical Council of India',
      verified: true
    },
    specialties: ['anxiety', 'depression', 'stress'],
    languages: ['English', 'Hindi'],
    experience: 8,
    education: [
      {
        degree: "Master's",
        field: 'Clinical Psychology',
        institution: 'University of Rajasthan',
        year: 2014
      }
    ],
    location: {
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
      zipCode: '302001',
      address: 'C-Block, Malviya Nagar, Jaipur',
      coordinates: {
        type: 'Point',
        coordinates: [75.7885, 26.8667]
      }
    },
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Friday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00', timezone: 'IST' }
    ],
    pricing: {
      perSession: 800,
      currency: 'INR',
      minDuration: 45,
      maxDuration: 60,
      acceptingNewClients: true
    },
    ratings: {
      average: 4.8,
      count: 45,
      reviews: []
    },
    verification: {
      status: 'approved',
      verifiedDate: new Date('2023-06-15')
    },
    sessionFormat: ['video-call', 'in-person', 'phone-call'],
    bio: 'Experienced psychologist with 8+ years in anxiety and depression management. Specializes in cognitive behavioral therapy.',
    isActive: true,
    status: 'active'
  },
  {
    firstName: 'Dr. Rajesh',
    lastName: 'Kumar',
    email: 'drrajesh.kumar@therapist.com',
    phone: '9876543211',
    license: {
      number: 'LICENSE-2018-00456-RJ',
      issueDate: new Date('2018-06-20'),
      expiryDate: new Date('2026-06-20'),
      organization: 'Medical Council of India',
      verified: true
    },
    specialties: ['depression', 'relationships', 'trauma'],
    languages: ['English', 'Hindi'],
    experience: 10,
    education: [
      {
        degree: "Master's",
        field: 'Psychology',
        institution: 'Delhi University',
        year: 2012
      }
    ],
    location: {
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
      zipCode: '302002',
      address: 'Bani Park, Jaipur',
      coordinates: {
        type: 'Point',
        coordinates: [75.8058, 26.9124]
      }
    },
    availability: [
      { day: 'Monday', startTime: '10:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Tuesday', startTime: '10:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Wednesday', startTime: '10:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Thursday', startTime: '10:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Friday', startTime: '10:00', endTime: '18:00', timezone: 'IST' }
    ],
    pricing: {
      perSession: 900,
      currency: 'INR',
      minDuration: 50,
      maxDuration: 60,
      acceptingNewClients: true
    },
    ratings: {
      average: 4.9,
      count: 67,
      reviews: []
    },
    verification: {
      status: 'approved',
      verifiedDate: new Date('2023-05-10')
    },
    sessionFormat: ['video-call', 'in-person'],
    bio: 'Certified psychotherapist with expertise in relationship counseling and trauma recovery. 10+ years experience.',
    isActive: true,
    status: 'active'
  },
  {
    firstName: 'Ms. Meera',
    lastName: 'Kapoor',
    email: 'meera.kapoor@therapist.com',
    phone: '9876543212',
    license: {
      number: 'LICENSE-2017-00789-JP',
      issueDate: new Date('2017-09-10'),
      expiryDate: new Date('2025-09-10'),
      organization: 'Medical Council of India',
      verified: true
    },
    specialties: ['anxiety', 'self-esteem', 'career-counseling'],
    languages: ['English', 'Hindi'],
    experience: 7,
    education: [
      {
        degree: "Master's",
        field: 'Counseling Psychology',
        institution: 'University of Rajasthan',
        year: 2015
      }
    ],
    location: {
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
      zipCode: '302003',
      address: 'Raja Park, Jaipur',
      coordinates: {
        type: 'Point',
        coordinates: [75.8245, 26.9312]
      }
    },
    availability: [
      { day: 'Monday', startTime: '11:00', endTime: '19:00', timezone: 'IST' },
      { day: 'Tuesday', startTime: '11:00', endTime: '19:00', timezone: 'IST' },
      { day: 'Wednesday', startTime: '11:00', endTime: '19:00', timezone: 'IST' },
      { day: 'Thursday', startTime: '11:00', endTime: '19:00', timezone: 'IST' },
      { day: 'Friday', startTime: '11:00', endTime: '19:00', timezone: 'IST' },
      { day: 'Saturday', startTime: '14:00', endTime: '18:00', timezone: 'IST' }
    ],
    pricing: {
      perSession: 750,
      currency: 'INR',
      minDuration: 45,
      maxDuration: 60,
      acceptingNewClients: true
    },
    ratings: {
      average: 4.7,
      count: 52,
      reviews: []
    },
    verification: {
      status: 'approved',
      verifiedDate: new Date('2023-07-20')
    },
    sessionFormat: ['video-call', 'phone-call'],
    bio: 'Counselor specializing in career counseling and self-esteem building. Approachable and supportive.',
    isActive: true,
    status: 'active'
  },
  {
    firstName: 'Dr. Amit',
    lastName: 'Sharma',
    email: 'dramit.sharma@therapist.com',
    phone: '9876543213',
    license: {
      number: 'LICENSE-2020-00234-JP',
      issueDate: new Date('2020-02-14'),
      expiryDate: new Date('2028-02-14'),
      organization: 'Medical Council of India',
      verified: true
    },
    specialties: ['ptsd', 'trauma', 'grief'],
    languages: ['English', 'Hindi'],
    experience: 6,
    education: [
      {
        degree: "Master's",
        field: 'Clinical Psychology',
        institution: 'Manipal University',
        year: 2016
      }
    ],
    location: {
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
      zipCode: '302004',
      address: 'Vaishali Nagar, Jaipur',
      coordinates: {
        type: 'Point',
        coordinates: [75.8456, 26.8945]
      }
    },
    availability: [
      { day: 'Monday', startTime: '14:00', endTime: '21:00', timezone: 'IST' },
      { day: 'Tuesday', startTime: '14:00', endTime: '21:00', timezone: 'IST' },
      { day: 'Wednesday', startTime: '14:00', endTime: '21:00', timezone: 'IST' },
      { day: 'Thursday', startTime: '14:00', endTime: '21:00', timezone: 'IST' },
      { day: 'Friday', startTime: '14:00', endTime: '21:00', timezone: 'IST' }
    ],
    pricing: {
      perSession: 1000,
      currency: 'INR',
      minDuration: 50,
      maxDuration: 60,
      acceptingNewClients: true
    },
    ratings: {
      average: 4.6,
      count: 38,
      reviews: []
    },
    verification: {
      status: 'approved',
      verifiedDate: new Date('2023-08-05')
    },
    sessionFormat: ['video-call'],
    bio: 'Trauma specialist with training in EMDR therapy. Compassionate approach to healing.',
    isActive: true,
    status: 'active'
  },
  {
    firstName: 'Dr. Neha',
    lastName: 'Gupta',
    email: 'drneha.gupta@therapist.com',
    phone: '9876543214',
    license: {
      number: 'LICENSE-2019-00567-JP',
      issueDate: new Date('2019-08-22'),
      expiryDate: new Date('2027-08-22'),
      organization: 'Medical Council of India',
      verified: true
    },
    specialties: ['relationships', 'couples-therapy', 'family-therapy'],
    languages: ['English', 'Hindi'],
    experience: 9,
    education: [
      {
        degree: "Master's",
        field: 'Psychology',
        institution: 'University of Rajasthan',
        year: 2013
      }
    ],
    location: {
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
      zipCode: '302005',
      address: 'Mansarovar, Jaipur',
      coordinates: {
        type: 'Point',
        coordinates: [75.7678, 26.9012]
      }
    },
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Friday', startTime: '09:00', endTime: '17:00', timezone: 'IST' }
    ],
    pricing: {
      perSession: 1100,
      currency: 'INR',
      minDuration: 60,
      maxDuration: 90,
      acceptingNewClients: true
    },
    ratings: {
      average: 5.0,
      count: 72,
      reviews: []
    },
    verification: {
      status: 'approved',
      verifiedDate: new Date('2023-06-28')
    },
    sessionFormat: ['in-person', 'video-call'],
    bio: 'Expert couples and family therapist. Helped 100+ couples improve their relationships.',
    isActive: true,
    status: 'active'
  },

  // DELHI - Therapists
  {
    firstName: 'Dr. Vikram',
    lastName: 'Patel',
    email: 'drvikram.patel@therapist.com',
    phone: '9876543215',
    license: {
      number: 'LICENSE-2018-01234-DL',
      issueDate: new Date('2018-01-10'),
      expiryDate: new Date('2026-01-10'),
      organization: 'Medical Council of India',
      verified: true
    },
    specialties: ['depression', 'anxiety', 'stress'],
    languages: ['English', 'Hindi', 'Marathi'],
    experience: 11,
    education: [
      {
        degree: "PhD",
        field: 'Clinical Psychology',
        institution: 'Delhi University',
        year: 2011
      }
    ],
    location: {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      zipCode: '110001',
      address: 'Connaught Place, Delhi',
      coordinates: {
        type: 'Point',
        coordinates: [77.2053, 28.6328]
      }
    },
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Tuesday', startTime: '09:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Wednesday', startTime: '09:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Thursday', startTime: '09:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Friday', startTime: '09:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00', timezone: 'IST' }
    ],
    pricing: {
      perSession: 1200,
      currency: 'INR',
      minDuration: 50,
      maxDuration: 60,
      acceptingNewClients: true
    },
    ratings: {
      average: 4.9,
      count: 89,
      reviews: []
    },
    verification: {
      status: 'approved',
      verifiedDate: new Date('2023-05-12')
    },
    sessionFormat: ['video-call', 'in-person', 'phone-call'],
    bio: 'PhD in Clinical Psychology with 11+ years practice. Specializes in depression and anxiety disorders.',
    isActive: true,
    status: 'active'
  },
  {
    firstName: 'Dr. Anjali',
    lastName: 'Mittal',
    email: 'dranjali.mittal@therapist.com',
    phone: '9876543216',
    license: {
      number: 'LICENSE-2019-05678-DL',
      issueDate: new Date('2019-05-15'),
      expiryDate: new Date('2027-05-15'),
      organization: 'Medical Council of India',
      verified: true
    },
    specialties: ['mindfulness', 'stress', 'self-esteem'],
    languages: ['English', 'Hindi'],
    experience: 7,
    education: [
      {
        degree: "Master's",
        field: 'Psychology',
        institution: 'Delhi University',
        year: 2015
      }
    ],
    location: {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      zipCode: '110016',
      address: 'Greater Kailash, Delhi',
      coordinates: {
        type: 'Point',
        coordinates: [77.1996, 28.5244]
      }
    },
    availability: [
      { day: 'Monday', startTime: '10:00', endTime: '19:00', timezone: 'IST' },
      { day: 'Tuesday', startTime: '10:00', endTime: '19:00', timezone: 'IST' },
      { day: 'Wednesday', startTime: '10:00', endTime: '19:00', timezone: 'IST' },
      { day: 'Thursday', startTime: '10:00', endTime: '19:00', timezone: 'IST' },
      { day: 'Friday', startTime: '10:00', endTime: '19:00', timezone: 'IST' }
    ],
    pricing: {
      perSession: 1000,
      currency: 'INR',
      minDuration: 45,
      maxDuration: 60,
      acceptingNewClients: true
    },
    ratings: {
      average: 4.8,
      count: 61,
      reviews: []
    },
    verification: {
      status: 'approved',
      verifiedDate: new Date('2023-07-09')
    },
    sessionFormat: ['video-call', 'phone-call'],
    bio: 'Certified mindfulness instructor and therapist. Helps clients manage stress through meditation.',
    isActive: true,
    status: 'active'
  },

  // MUMBAI - Therapists
  {
    firstName: 'Dr. Sanjana',
    lastName: 'Desai',
    email: 'drsanjana.desai@therapist.com',
    phone: '9876543217',
    license: {
      number: 'LICENSE-2017-09012-MH',
      issueDate: new Date('2017-09-20'),
      expiryDate: new Date('2025-09-20'),
      organization: 'Medical Council of India',
      verified: true
    },
    specialties: ['anxiety', 'eating-disorders', 'depression'],
    languages: ['English', 'Hindi', 'Marathi'],
    experience: 8,
    education: [
      {
        degree: "Master's",
        field: 'Clinical Psychology',
        institution: 'Mumbai University',
        year: 2014
      }
    ],
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400001',
      address: 'Fort, Mumbai',
      coordinates: {
        type: 'Point',
        coordinates: [72.8326, 18.9579]
      }
    },
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00', timezone: 'IST' },
      { day: 'Friday', startTime: '09:00', endTime: '17:00', timezone: 'IST' }
    ],
    pricing: {
      perSession: 1300,
      currency: 'INR',
      minDuration: 50,
      maxDuration: 60,
      acceptingNewClients: true
    },
    ratings: {
      average: 4.8,
      count: 75,
      reviews: []
    },
    verification: {
      status: 'approved',
      verifiedDate: new Date('2023-08-15')
    },
    sessionFormat: ['video-call', 'in-person'],
    bio: 'Specialist in eating disorders and anxiety. Integrated approach combining therapy and nutrition awareness.',
    isActive: true,
    status: 'active'
  },

  // BANGALORE - Therapists
  {
    firstName: 'Dr. Arun',
    lastName: 'Nair',
    email: 'drarun.nair@therapist.com',
    phone: '9876543218',
    license: {
      number: 'LICENSE-2018-03456-KA',
      issueDate: new Date('2018-03-12'),
      expiryDate: new Date('2026-03-12'),
      organization: 'Medical Council of India',
      verified: true
    },
    specialties: ['trauma', 'ptsd', 'relationships'],
    languages: ['English', 'Kannada', 'Tamil'],
    experience: 10,
    education: [
      {
        degree: "Master's",
        field: 'Psychology',
        institution: 'Bangalore University',
        year: 2012
      }
    ],
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      zipCode: '560001',
      address: 'Whitefield, Bangalore',
      coordinates: {
        type: 'Point',
        coordinates: [77.6245, 12.9716]
      }
    },
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Tuesday', startTime: '09:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Wednesday', startTime: '09:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Thursday', startTime: '09:00', endTime: '18:00', timezone: 'IST' },
      { day: 'Friday', startTime: '09:00', endTime: '18:00', timezone: 'IST' }
    ],
    pricing: {
      perSession: 1100,
      currency: 'INR',
      minDuration: 50,
      maxDuration: 60,
      acceptingNewClients: true
    },
    ratings: {
      average: 4.7,
      count: 56,
      reviews: []
    },
    verification: {
      status: 'approved',
      verifiedDate: new Date('2023-06-10')
    },
    sessionFormat: ['video-call', 'phone-call'],
    bio: 'PTSD specialist with 10+ years experience. Works with trauma survivors using evidence-based methods.',
    isActive: true,
    status: 'active'
  }
];

module.exports = therapists;
