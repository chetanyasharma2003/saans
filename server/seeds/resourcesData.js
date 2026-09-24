// Comprehensive mental health resource guides
// Evidence-based information for various conditions

const resources = [
  // DEPRESSION
  {
    condition: {
      name: 'Depression',
      icd10Code: 'F32',
      description: 'A persistent feeling of sadness and loss of interest in activities. Major Depressive Disorder (MDD) affects mood, sleep, appetite, energy, and self-worth.',
      severity: 'moderate',
      prevalence: '1 in 5 people experience depression at some point in their lives',
      demographics: 'Can affect anyone, but more common in women, young adults, and people with family history'
    },
    symptoms: [
      {
        name: 'Persistent sadness',
        description: 'Feeling sad or empty most of the day',
        category: 'emotional'
      },
      {
        name: 'Loss of interest',
        description: 'No longer enjoying activities you loved (anhedonia)',
        category: 'emotional'
      },
      {
        name: 'Sleep changes',
        description: 'Sleeping too much or too little',
        category: 'physical'
      },
      {
        name: 'Fatigue',
        description: 'Persistent lack of energy',
        category: 'physical'
      },
      {
        name: 'Feelings of worthlessness',
        description: 'Excessive guilt or self-blame',
        category: 'cognitive'
      },
      {
        name: 'Concentration issues',
        description: 'Difficulty focusing or making decisions',
        category: 'cognitive'
      }
    ],
    causes: [
      {
        type: 'Genetic predisposition',
        description: 'Family history of depression increases risk',
        likelihood: 40
      },
      {
        type: 'Life events',
        description: 'Loss, trauma, major changes',
        likelihood: 35
      },
      {
        type: 'Brain chemistry',
        description: 'Imbalance in neurotransmitters (serotonin, dopamine)',
        likelihood: 50
      },
      {
        type: 'Medical conditions',
        description: 'Thyroid problems, chronic illness',
        likelihood: 25
      }
    ],
    treatments: [
      {
        type: 'therapy',
        name: 'Cognitive Behavioral Therapy (CBT)',
        description: 'Identify and change negative thought patterns',
        effectiveness: 85,
        timeToEffect: '4-8 weeks',
        pros: ['No medication', 'Teaches lasting skills', 'Evidence-based'],
        cons: ['Requires effort', 'Needs trained therapist'],
        access: 'Available in India',
        cost: '₹1000-₹2500 per session'
      },
      {
        type: 'medication',
        name: 'SSRIs (Selective Serotonin Reuptake Inhibitors)',
        description: 'Antidepressants like Sertraline, Fluoxetine',
        effectiveness: 70,
        timeToEffect: '4-6 weeks',
        sideEffects: ['Nausea', 'Sleep issues', 'Sexual dysfunction'],
        pros: ['Proven effective', 'Relatively safe', 'Available in India'],
        cons: ['Side effects possible', 'Needs doctor supervision'],
        access: 'Available in India',
        cost: '₹200-₹500 per month'
      },
      {
        type: 'lifestyle',
        name: 'Exercise & Sunlight',
        description: 'Regular physical activity and natural light exposure',
        effectiveness: 65,
        timeToEffect: '2-4 weeks',
        pros: ['Free', 'Multiple health benefits', 'No side effects'],
        cons: ['Requires consistency', 'Hard to start when depressed'],
        access: 'Always available',
        cost: 'Free'
      }
    ],
    selfHelpTips: [
      {
        title: 'Start small with activities',
        description: 'Do 1 small thing today that brings you joy',
        steps: ['Pick one thing', 'Set a time', 'Do it even if unmotivated'],
        duration: 'daily',
        difficulty: 'easy',
        frequency: '5x per week'
      },
      {
        title: 'Challenge negative thoughts',
        description: 'Use thought records to question automatic negative thoughts',
        steps: ['Write the thought', 'Question if true', 'Find evidence against it', 'Write realistic thought'],
        duration: '10-15 mins',
        difficulty: 'moderate',
        frequency: '3x per week'
      },
      {
        title: 'Move your body',
        description: 'Any movement counts - walk, dance, stretch',
        steps: ['Start with 5-10 mins', 'Do something you enjoy', 'Increase gradually'],
        duration: '20-30 mins',
        difficulty: 'easy',
        frequency: 'daily'
      }
    ],
    crisisResources: [
      {
        name: 'AASRA',
        description: 'Mental health helpline',
        phone: '9820466726',
        website: 'www.aasra.info',
        country: 'India',
        availability: '24/7',
        type: 'helpline',
        language: ['English', 'Hindi'],
        cost: 'Free'
      },
      {
        name: 'iCall',
        description: 'Mental health support for youth',
        phone: '9152987821',
        website: 'www.icallhelpline.org',
        country: 'India',
        availability: '24/7',
        type: 'helpline',
        language: ['English', 'Hindi'],
        cost: 'Free'
      }
    ],
    whenToSeekHelp: {
      redFlags: [
        'Sadness lasting more than 2 weeks',
        'Unable to work or study',
        'Loss of appetite or weight loss',
        'Thoughts of harming yourself',
        'Isolation from friends and family'
      ],
      emergencySignals: [
        'Thoughts of suicide',
        'Attempted self-harm',
        'Suicidal planning or preparation'
      ]
    },
    faqs: [
      {
        question: 'Is depression the same as sadness?',
        answer: 'No. Sadness is normal and temporary. Depression is persistent (2+ weeks), affects daily functioning, and doesn\'t respond to usual coping strategies.'
      },
      {
        question: 'Can depression go away on its own?',
        answer: 'Some mild cases may improve, but most clinical depression requires treatment. Getting help faster leads to better outcomes.'
      },
      {
        question: 'Is medication the only treatment?',
        answer: 'No. Therapy, lifestyle changes, and often a combination work well. Medication is one tool, not the only option.'
      }
    ],
    relatedConditions: ['Anxiety', 'PTSD', 'Bipolar Disorder'],
    views: 2341,
    shares: 156,
    saves: 423,
    status: 'published'
  },

  // ANXIETY
  {
    condition: {
      name: 'Anxiety',
      icd10Code: 'F41',
      description: 'Excessive worry and fear that interferes with daily life. Generalized Anxiety Disorder involves persistent worry about multiple areas.',
      severity: 'moderate',
      prevalence: '1 in 13 people globally have anxiety disorders',
      demographics: 'Twice as common in women; can start in childhood or adulthood'
    },
    symptoms: [
      {
        name: 'Excessive worry',
        description: 'Persistent worry that\'s hard to control',
        category: 'cognitive'
      },
      {
        name: 'Physical tension',
        description: 'Muscle tension, headaches, jaw clenching',
        category: 'physical'
      },
      {
        name: 'Panic episodes',
        description: 'Sudden intense fear with physical symptoms',
        category: 'emotional'
      },
      {
        name: 'Sleep problems',
        description: 'Difficulty falling or staying asleep',
        category: 'physical'
      },
      {
        name: 'Avoidance',
        description: 'Avoiding situations that trigger anxiety',
        category: 'behavioral'
      }
    ],
    causes: [
      {
        type: 'Genetics',
        description: 'Inherited predisposition to anxiety',
        likelihood: 30
      },
      {
        type: 'Stress',
        description: 'Work pressure, relationships, life changes',
        likelihood: 60
      },
      {
        type: 'Brain chemistry',
        description: 'Low GABA and serotonin levels',
        likelihood: 40
      }
    ],
    treatments: [
      {
        type: 'therapy',
        name: 'Cognitive Behavioral Therapy (CBT)',
        description: 'Challenge anxious thoughts and face fears gradually',
        effectiveness: 85,
        timeToEffect: '6-12 weeks',
        pros: ['Most effective', 'Teaches coping skills', 'Long-lasting'],
        cons: ['Requires effort', 'Can be intense'],
        access: 'Available in India',
        cost: '₹1000-₹2500 per session'
      }
    ],
    selfHelpTips: [
      {
        title: '4-7-8 Breathing',
        description: 'Calming breath technique',
        steps: ['Breathe in for 4 counts', 'Hold for 7 counts', 'Exhale for 8 counts', 'Repeat 4 times'],
        duration: '5 mins',
        difficulty: 'easy',
        effectiveness: 90
      }
    ],
    crisisResources: [
      {
        name: 'AASRA',
        phone: '9820466726',
        website: 'www.aasra.info',
        country: 'India',
        availability: '24/7',
        type: 'helpline',
        language: ['English', 'Hindi'],
        cost: 'Free'
      }
    ],
    whenToSeekHelp: {
      redFlags: [
        'Anxiety affecting work or relationships',
        'Avoiding situations due to fear',
        'Physical symptoms lasting weeks'
      ],
      emergencySignals: [
        'Thoughts of harming yourself'
      ]
    },
    faqs: [
      {
        question: 'Can anxiety kill me?',
        answer: 'No. While panic attacks feel terrifying, they are not dangerous. Your body is having a fear response, not a medical emergency.'
      },
      {
        question: 'Is anxiety permanent?',
        answer: 'No. With proper treatment (therapy, lifestyle changes), most people significantly improve or recover completely.'
      }
    ],
    relatedConditions: ['Panic Disorder', 'OCD', 'Depression'],
    views: 3421,
    shares: 234,
    saves: 567,
    status: 'published'
  },

  // SLEEP ISSUES
  {
    condition: {
      name: 'Sleep Issues',
      icd10Code: 'F51',
      description: 'Difficulty falling asleep, staying asleep, or poor sleep quality. Insomnia is the most common sleep disorder.',
      severity: 'moderate',
      prevalence: '1 in 4 adults experience insomnia',
      demographics: 'More common with age, women, and those with stress'
    },
    symptoms: [
      {
        name: 'Difficulty falling asleep',
        description: 'Takes 30+ minutes to fall asleep',
        category: 'physical'
      },
      {
        name: 'Frequent waking',
        description: 'Waking multiple times during night',
        category: 'physical'
      },
      {
        name: 'Daytime fatigue',
        description: 'Tired throughout the day',
        category: 'physical'
      },
      {
        name: 'Anxiety about sleep',
        description: 'Worry about not sleeping',
        category: 'cognitive'
      }
    ],
    causes: [
      {
        type: 'Stress and anxiety',
        description: 'Work pressure, life events',
        likelihood: 70
      },
      {
        type: 'Poor sleep habits',
        description: 'Screen time, caffeine, irregular schedule',
        likelihood: 60
      },
      {
        type: 'Medical conditions',
        description: 'Sleep apnea, restless legs, thyroid',
        likelihood: 40
      }
    ],
    treatments: [
      {
        type: 'therapy',
        name: 'CBT-I (Cognitive Behavioral Therapy for Insomnia)',
        description: 'Restructure sleep thoughts and habits',
        effectiveness: 90,
        timeToEffect: '2-4 weeks',
        pros: ['Most effective', 'No medication', 'Long-lasting'],
        cons: ['Requires effort and consistency'],
        access: 'Available in India',
        cost: '₹1500-₹3000 per session'
      }
    ],
    selfHelpTips: [
      {
        title: 'Sleep Restriction Therapy',
        description: 'Reduce bed time to match actual sleep',
        steps: ['Week 1: Go to bed only when tired', 'Week 2: Add 30 mins', 'Increase gradually'],
        duration: '8 weeks',
        difficulty: 'hard',
        effectiveness: 85
      },
      {
        title: '10-3-2-1-0 Formula',
        description: '10 hours before bed: no caffeine, 3 hours: no large meals, 2 hours: no work, 1 hour: no screens, 0: times hitting snooze',
        duration: 'daily routine',
        difficulty: 'moderate',
        effectiveness: 75
      }
    ],
    crisisResources: [],
    whenToSeekHelp: {
      redFlags: [
        'Sleep problems lasting 3+ weeks',
        'Affecting daytime functioning',
        'Tried sleep hygiene without improvement'
      ],
      emergencySignals: []
    },
    faqs: [
      {
        question: 'How much sleep do I need?',
        answer: 'Most adults need 7-9 hours. Quality matters more than quantity. If you feel rested with 7, that\'s fine.'
      },
      {
        question: 'Is melatonin a good solution?',
        answer: 'Melatonin can help short-term, but therapy is more effective long-term. Use melatonin as a bridge, not a permanent solution.'
      }
    ],
    relatedConditions: ['Anxiety', 'Depression'],
    views: 2156,
    shares: 134,
    saves: 345,
    status: 'published'
  },

  // STRESS MANAGEMENT
  {
    condition: {
      name: 'Stress Management',
      icd10Code: 'F43.1',
      description: 'Excessive stress response to life events. Chronic stress affects physical and mental health.',
      severity: 'mild',
      prevalence: '8 in 10 adults report significant stress',
      demographics: 'Most common in working adults and students'
    },
    symptoms: [
      {
        name: 'Tension and irritability',
        description: 'Feeling on edge, snapping at others',
        category: 'emotional'
      },
      {
        name: 'Physical symptoms',
        description: 'Headaches, stomach issues, muscle tension',
        category: 'physical'
      },
      {
        name: 'Difficulty concentrating',
        description: 'Mind feels foggy or scattered',
        category: 'cognitive'
      }
    ],
    causes: [
      {
        type: 'Work pressure',
        description: 'Deadlines, difficult boss, job insecurity',
        likelihood: 80
      },
      {
        type: 'Relationships',
        description: 'Family conflicts, breakups',
        likelihood: 60
      }
    ],
    treatments: [
      {
        type: 'lifestyle',
        name: 'Regular Exercise',
        description: 'Physical activity reduces stress hormones',
        effectiveness: 80,
        timeToEffect: '1-2 weeks',
        pros: ['Immediate benefit', 'Multiple health benefits', 'Free'],
        cons: ['Requires consistency'],
        access: 'Always available',
        cost: 'Free'
      }
    ],
    selfHelpTips: [
      {
        title: 'Progressive Muscle Relaxation',
        description: 'Tense and release muscle groups',
        steps: ['Start with toes', 'Tense for 5 seconds', 'Release', 'Move up body'],
        duration: '10-15 mins',
        difficulty: 'easy',
        effectiveness: 85
      },
      {
        title: 'Time Management',
        description: 'Prioritize and organize tasks',
        steps: ['List all tasks', 'Identify urgent vs important', 'Schedule blocks of time', 'Take breaks'],
        duration: 'daily',
        difficulty: 'moderate',
        effectiveness: 75
      }
    ],
    crisisResources: [],
    whenToSeekHelp: {
      redFlags: [
        'Stress affecting work or relationships',
        'Physical symptoms not improving',
        'Feeling unable to cope'
      ],
      emergencySignals: []
    },
    faqs: [
      {
        question: 'Is some stress good?',
        answer: 'Yes! Acute stress can improve performance. But chronic stress damages health. The key is managing it well.'
      }
    ],
    relatedConditions: ['Anxiety', 'Burnout'],
    views: 4123,
    shares: 287,
    saves: 612,
    status: 'published'
  },

  // PTSD
  {
    condition: {
      name: 'PTSD',
      icd10Code: 'F43.1',
      description: 'Post-Traumatic Stress Disorder develops after exposure to traumatic events. Involves flashbacks, hypervigilance, and avoidance.',
      severity: 'severe',
      prevalence: '1 in 11 people will develop PTSD in their lifetime',
      demographics: 'Can occur at any age; more common after combat, accidents, assault'
    },
    symptoms: [
      {
        name: 'Flashbacks',
        description: 'Reliving the traumatic event as if it\'s happening now',
        category: 'emotional'
      },
      {
        name: 'Nightmares',
        description: 'Vivid nightmares related to trauma',
        category: 'physical'
      },
      {
        name: 'Hypervigilance',
        description: 'Always on alert, easily startled',
        category: 'behavioral'
      },
      {
        name: 'Avoidance',
        description: 'Avoiding reminders of trauma',
        category: 'behavioral'
      }
    ],
    causes: [
      {
        type: 'Traumatic event',
        description: 'Combat, assault, accident, disaster',
        likelihood: 100
      }
    ],
    treatments: [
      {
        type: 'therapy',
        name: 'EMDR (Eye Movement Desensitization & Reprocessing)',
        description: 'Process trauma through bilateral stimulation',
        effectiveness: 90,
        timeToEffect: '8-12 weeks',
        pros: ['Highly effective for PTSD', 'Relatively short treatment', 'No medication'],
        cons: ['Needs trained specialist', 'Can be intense'],
        access: 'Available in India, limited specialists',
        cost: '₹2000-₹5000 per session'
      },
      {
        type: 'therapy',
        name: 'CPT (Cognitive Processing Therapy)',
        description: 'Change how you process trauma memories',
        effectiveness: 85,
        timeToEffect: '12 weeks',
        pros: ['Evidence-based', 'Structured program'],
        cons: ['Requires commitment', 'Homework involved'],
        access: 'Available in India',
        cost: '₹1500-₹3000 per session'
      }
    ],
    selfHelpTips: [
      {
        title: 'Grounding Techniques',
        description: 'Bring yourself back to present moment',
        steps: ['Name 5 things you see', '4 you can touch', '3 you hear', '2 you smell', '1 you taste'],
        duration: '5-10 mins',
        difficulty: 'easy',
        effectiveness: 80
      }
    ],
    crisisResources: [
      {
        name: 'AASRA',
        phone: '9820466726',
        website: 'www.aasra.info',
        country: 'India',
        availability: '24/7',
        type: 'helpline',
        language: ['English', 'Hindi'],
        cost: 'Free'
      }
    ],
    whenToSeekHelp: {
      redFlags: [
        'Symptoms lasting more than 1 month',
        'Unable to work or maintain relationships',
        'Increasing substance use'
      ],
      emergencySignals: [
        'Suicidal thoughts',
        'Aggressive behavior'
      ]
    },
    faqs: [
      {
        question: 'Will I ever feel normal again?',
        answer: 'Yes. With proper treatment, most PTSD sufferers recover or significantly improve. Recovery takes time and effort, but it\'s very possible.'
      },
      {
        question: 'Is PTSD only from war?',
        answer: 'No. Any traumatic event can cause PTSD - accidents, assault, illness, loss, or natural disasters.'
      }
    ],
    relatedConditions: ['Anxiety', 'Depression', 'Sleep Issues'],
    views: 1876,
    shares: 123,
    saves: 289,
    status: 'published'
  }
];

module.exports = resources;
