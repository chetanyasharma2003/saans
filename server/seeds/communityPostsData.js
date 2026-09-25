// Real community posts seed data
// Mix of mental health topics with realistic engagement

const posts = [
  // DEPRESSION Posts
  { userId: new (require('mongoose')).Types.ObjectId('507f1f77bcf86cd799439010'),
    title: 'How I stopped my negative self-talk - 6 months later',
    content: `I posted 6 months ago about struggling with constant negative self-talk. I said I would try cognitive behavioral therapy techniques. I'm happy to report that it's actually working!

The key thing that helped was keeping a thought record. Every time I caught myself thinking something negative, I wrote it down and asked myself: "Is this true? What's the evidence?"

At first it felt awkward and mechanical. But after a few weeks, I started catching negative thoughts automatically. Now, 6 months later, I genuinely think less negatively. My anxiety has decreased significantly.

To anyone struggling - it does get better. Therapy works if you're willing to put in the effort. Don't give up!`,
    category: 'depression',
    tags: ['cbt', 'recovery', 'therapy', 'self-talk'],
    source: 'user',
    engagement: {
      upvotes: 342,
      comments: 28,
      shares: 15,
      saves: 87
    }
  },
  { userId: new (require('mongoose')).Types.ObjectId('507f1f77bcf86cd799439010'),
    title: "I've been depressed for 5 years. Just started medication yesterday.",
    content: `I'm 28 years old and have been struggling with depression since I was 23. I tried everything - exercise, meditation, therapy, changing my diet. Nothing worked.

Finally convinced myself to see a psychiatrist last month. They diagnosed me with major depressive disorder and prescribed Sertraline 50mg.

Yesterday was my first day. I know it takes 4-6 weeks to feel effects, but I'm hopeful for the first time in years. Just wanted to share in case someone is hesitant about medication like I was.

Anyone else on SSRIs? What was your experience?`,
    category: 'depression',
    tags: ['medication', 'sertraline', 'ssri', 'mental-health'],
    source: 'user',
    engagement: {
      upvotes: 512,
      comments: 156,
      shares: 42,
      saves: 203
    }
  },
  { userId: new (require('mongoose')).Types.ObjectId('507f1f77bcf86cd799439010'),
    title: 'Depression lies to you - remember this',
    content: `Depression told me I'm a burden.
Depression told me I'm not good enough.
Depression told me no one cares.
Depression told me it will never get better.

Every single one of these was a lie.

I'm not a burden - my friends and family love me.
I AM good enough - I've accomplished so much.
People DO care - they've shown me over and over.
It HAS gotten better - I'm living proof.

If you're struggling, remember: your brain is lying to you. Depression is a liar. You deserve to recover and you WILL.`,
    category: 'depression',
    tags: ['motivation', 'recovery', 'mindset', 'hope'],
    source: 'user',
    engagement: {
      upvotes: 1240,
      comments: 89,
      shares: 156,
      saves: 312
    }
  },

  // ANXIETY Posts
  { userId: new (require('mongoose')).Types.ObjectId('507f1f77bcf86cd799439010'),
    title: "My panic attack routine that actually helps",
    content: `I used to have 3-4 panic attacks per week. Now I have them maybe once a month. Here's what my therapist taught me:

When it starts:
1. Notice the panic (don't fight it)
2. Name it: "This is anxiety, this is not danger"
3. Ground yourself: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste
4. Breathe: 4 count in, 6 count out (repeat 10 times)
5. Move: Walk around, do jumping jacks, anything

The key is NOT to fight the panic. Accept it, ground yourself, and let it pass. They always pass.

It took 3 months of practice, but now when I feel one coming, I'm not afraid. That removes most of the panic.

If anyone wants to talk about anxiety, I'm here. You're not alone.`,
    category: 'anxiety',
    tags: ['panic-attacks', 'coping', 'grounding', 'techniques'],
    source: 'user',
    engagement: {
      upvotes: 892,
      comments: 145,
      shares: 78,
      saves: 267
    }
  },
  { userId: new (require('mongoose')).Types.ObjectId('507f1f77bcf86cd799439010'),
    title: 'Anxiety ruined my job interview',
    content: `I had an interview for my dream job yesterday. I was so anxious before it that I:

- Couldn't eat breakfast
- My hands were shaking
- I went to the bathroom 5 times
- Forgot what I was going to say multiple times

I know I didn't perform well. The interviewer probably noticed my anxiety. I feel like I blew my chance.

Has anyone else struggled with interview anxiety? How do you manage it?`,
    category: 'anxiety',
    tags: ['interview', 'job', 'performance-anxiety'],
    source: 'user',
    engagement: {
      upvotes: 234,
      comments: 67,
      shares: 12,
      saves: 89
    }
  },

  // STRESS Posts
  { userId: new (require('mongoose')).Types.ObjectId('507f1f77bcf86cd799439010'),
    title: 'Work stress is destroying my health',
    content: `I work in IT, 60 hour weeks, constant deadlines. For the past year:

- My sleep quality is terrible
- I've gained 15kg
- My blood pressure is elevated
- I snap at my family
- I have tension headaches constantly

My doctor said I need to reduce stress or risk serious health problems. But I don't know how - I need this job to pay bills.

Is anyone else trapped in this cycle? How do you manage work stress when you can't leave?`,
    category: 'stress',
    tags: ['work-stress', 'burnout', 'health'],
    source: 'user',
    engagement: {
      upvotes: 567,
      comments: 98,
      shares: 34,
      saves: 145
    }
  },

  // RELATIONSHIPS Posts
  { userId: new (require('mongoose')).Types.ObjectId('507f1f77bcf86cd799439010'),
    title: "I think my relationship is over",
    content: `Been with my girlfriend for 4 years. We used to be so close, but for the past 8 months we barely talk.

We communicate only about logistics (bills, groceries, etc). We don't laugh together anymore. We haven't been intimate in 6 months.

I've tried talking to her about it, but she says "everything is fine" while avoiding any real conversation.

I love her, but I'm so sad all the time. I don't know if we can come back from this. Should I end it?`,
    category: 'relationships',
    tags: ['relationship', 'communication', 'breakup'],
    source: 'user',
    engagement: {
      upvotes: 423,
      comments: 156,
      shares: 28,
      saves: 112
    }
  },

  // TRAUMA Posts
  { userId: new (require('mongoose')).Types.ObjectId('507f1f77bcf86cd799439010'),
    title: 'PTSD from car accident - 1 year update',
    content: `One year ago, I was in a serious car accident. For months after, I couldn't:
- Drive
- Be in a car without panicking
- Sleep without nightmares
- See cars without flashbacks

With EMDR therapy (Eye Movement Desensitization and Reprocessing), I have made huge progress:

✅ I can drive again (short distances)
✅ Panic attacks are much rarer
✅ Nightmares decreased 80%
✅ I'm starting to feel normal again

EMDR felt weird at first, but it really works. If you have PTSD, I highly recommend finding a therapist trained in it.

Recovery is possible. Don't give up.`,
    category: 'trauma',
    tags: ['ptsd', 'emdr', 'recovery', 'trauma'],
    source: 'user',
    engagement: {
      upvotes: 1089,
      comments: 203,
      shares: 156,
      saves: 421
    }
  },

  // SLEEP Posts
  { userId: new (require('mongoose')).Types.ObjectId('507f1f77bcf86cd799439010'),
    title: 'Finally sleeping through the night - here is what worked',
    content: `I've had insomnia for 10 years. Every night: 2-3 hours of sleep. I tried everything.

Last month, I started "Sleep Restriction Therapy" with my therapist. Here's how it works:

Week 1-2: Only go to bed when you're actually tired (I was in bed 6 hours)
Week 3-4: Add 30 min each week when you hit 90% sleep efficiency

The first 2 weeks were brutal - exhausting - but my brain forgot its anxiety response to bed.

By week 4, I was sleeping 7 hours. Now (week 8), I'm sleeping 8 hours most nights and falling asleep in 15 minutes.

It's not instant, but it WORKS. Don't give up on sleep recovery!`,
    category: 'sleep',
    tags: ['insomnia', 'sleep-therapy', 'sleep-restriction'],
    source: 'user',
    engagement: {
      upvotes: 756,
      comments: 92,
      shares: 64,
      saves: 198
    }
  },

  // SELF-ESTEEM Posts
  { userId: new (require('mongoose')).Types.ObjectId('507f1f77bcf86cd799439010'),
    title: "I'm finally learning to love myself",
    content: `I spent 25 years hating myself. Criticizing my looks, my abilities, my voice, everything.

6 months ago I started working with a therapist on self-compassion. We practice:

1. Self-compassion meditation
2. Catching negative self-talk and reframing
3. Celebrating small wins
4. Treating myself like I'd treat a good friend

It sounds simple but it's been life-changing. I'm starting to:
- Feel more confident
- Make better decisions
- Take more risks
- Actually enjoy life

If you struggle with self-esteem like I did, know that it CAN change. You don't have to hate yourself forever.`,
    category: 'self-esteem',
    tags: ['self-love', 'self-compassion', 'therapy'],
    source: 'user',
    engagement: {
      upvotes: 1456,
      comments: 267,
      shares: 189,
      saves: 534
    }
  },

  // WORK Posts
  { userId: new (require('mongoose')).Types.ObjectId('507f1f77bcf86cd799439010'),
    title: 'Changed jobs and my mental health improved instantly',
    content: `I spent 3 years at a toxic company with:
- Micromanaging boss
- Impossible deadlines
- No work-life balance
- Constant criticism

My mental health suffered. I developed anxiety at work.

Last month I quit and got a new job. The difference is NIGHT AND DAY:

✅ Boss actually listens
✅ Reasonable deadlines
✅ People actually care about each other
✅ Work-life balance is real

I wish I'd left sooner. If your work is affecting your mental health, seriously consider leaving. Your health is more important than any job.

If you're job hunting, feel free to ask me questions!`,
    category: 'work',
    tags: ['job-change', 'toxic-workplace', 'mental-health'],
    source: 'user',
    engagement: {
      upvotes: 892,
      comments: 178,
      shares: 145,
      saves: 289
    }
  },

  // COMMUNITY WISDOM Posts
  { userId: new (require('mongoose')).Types.ObjectId('507f1f77bcf86cd799439010'),
    title: 'What helped you the most in your mental health recovery?',
    content: `I'm starting therapy next week and I'm both excited and nervous. I'd love to hear from this community:

What was the single biggest thing that helped you recover?

Was it:
- Therapy?
- Medication?
- Exercise?
- Talking to friends?
- Something else?

I'm hoping to go in with realistic expectations. Thanks for sharing!`,
    category: 'general',
    tags: ['recovery', 'therapy', 'advice'],
    source: 'user',
    engagement: {
      upvotes: 432,
      comments: 213,
      shares: 87,
      saves: 156
    }
  }
];

module.exports = posts;
