import { Relationship, RelationshipEvent } from '@/src/types';

// Placeholder API function for getting timeline data
export default async function getTimeline() {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock relationships data
  const relationships: Relationship[] = [
    {
      id: '1',
      userId: 'user1',
      partnerName: 'Alex Johnson',
      startDate: '2023-03-15',
      status: 'active',
      relationshipType: 'serious',
      events: [],
      notes: 'Met through mutual friends at a coffee shop. We connected instantly over our shared love of hiking and photography.',
      isPrivate: false,
      createdAt: '2023-03-15T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
    },
    {
      id: '2',
      userId: 'user1',
      partnerName: 'Sam Mitchell',
      startDate: '2022-06-10',
      endDate: '2023-01-20',
      status: 'ended',
      relationshipType: 'dating',
      events: [],
      notes: 'Beautiful relationship that helped me grow. We ended on good terms.',
      isPrivate: false,
      createdAt: '2022-06-10T09:00:00Z',
      updatedAt: '2023-01-20T16:45:00Z',
    },
  ];

  // Mock timeline events
  const events: RelationshipEvent[] = [
    {
      id: '1',
      relationshipId: '1',
      title: 'First Kiss',
      description: 'Under the stars at the beach after our third date. The moment felt perfect and natural. We both knew something special was happening.',
      eventType: 'milestone',
      date: '2023-03-28',
      location: 'Santa Monica Beach, CA',
      photos: [],
      tags: ['first-kiss', 'beach', 'romantic'],
      mood: 'excited',
      privateNotes: 'I was so nervous but it felt so right. My heart was racing.',
      createdAt: '2023-03-29T08:00:00Z',
      updatedAt: '2023-03-29T08:00:00Z',
    },
    {
      id: '2',
      relationshipId: '1',
      title: 'Meet the Parents',
      description: 'Introduced Alex to my parents over dinner. They loved them! Mom said she hasn\'t seen me this happy in a long time.',
      eventType: 'milestone',
      date: '2023-05-12',
      location: 'My Parents\' House',
      photos: [],
      tags: ['parents', 'family', 'milestone'],
      mood: 'nervous',
      privateNotes: 'Was worried they wouldn\'t get along, but it went perfectly.',
      createdAt: '2023-05-13T10:30:00Z',
      updatedAt: '2023-05-13T10:30:00Z',
    },
    {
      id: '3',
      relationshipId: '1',
      title: 'First Vacation Together',
      description: 'Amazing weekend getaway to Napa Valley. We did wine tasting, took cooking classes, and just enjoyed each other\'s company. This trip really brought us closer.',
      eventType: 'memory',
      date: '2023-07-15',
      location: 'Napa Valley, CA',
      photos: [],
      tags: ['vacation', 'wine-tasting', 'cooking', 'bonding'],
      mood: 'happy',
      privateNotes: 'This is when I knew I was falling in love.',
      createdAt: '2023-07-17T12:00:00Z',
      updatedAt: '2023-07-17T12:00:00Z',
    },
    {
      id: '4',
      relationshipId: '1',
      title: 'First Major Disagreement',
      description: 'Had our first real argument about future plans. It was intense but we talked it through and learned how to communicate better.',
      eventType: 'conflict',
      date: '2023-09-03',
      location: 'Alex\'s Apartment',
      photos: [],
      tags: ['argument', 'communication', 'growth'],
      mood: 'angry',
      privateNotes: 'Scary moment, but glad we worked through it.',
      createdAt: '2023-09-04T09:15:00Z',
      updatedAt: '2023-09-04T09:15:00Z',
    },
    {
      id: '5',
      relationshipId: '1',
      title: 'Moving In Together',
      description: 'Officially moved in together! Found the perfect apartment that feels like home for both of us. Exciting new chapter in our relationship.',
      eventType: 'milestone',
      date: '2023-11-01',
      location: 'Our New Apartment, San Francisco',
      photos: [],
      tags: ['moving-in', 'apartment', 'milestone', 'cohabitation'],
      mood: 'excited',
      privateNotes: 'Can\'t believe we\'re taking this step. So happy and excited for what\'s next.',
      createdAt: '2023-11-02T14:20:00Z',
      updatedAt: '2023-11-02T14:20:00Z',
    },
    {
      id: '6',
      relationshipId: '2',
      title: 'First Date',
      description: 'Coffee date at Blue Bottle. We talked for 3 hours straight! Great conversation and immediate connection.',
      eventType: 'memory',
      date: '2022-06-10',
      location: 'Blue Bottle Coffee, Oakland',
      photos: [],
      tags: ['first-date', 'coffee', 'conversation'],
      mood: 'excited',
      createdAt: '2022-06-11T11:00:00Z',
      updatedAt: '2022-06-11T11:00:00Z',
    },
    {
      id: '7',
      relationshipId: '2',
      title: 'Mutual Decision to Break Up',
      description: 'We both realized we wanted different things in life. It was sad but we ended things amicably and with respect for each other.',
      eventType: 'breakup',
      date: '2023-01-20',
      location: 'Sam\'s Place',
      photos: [],
      tags: ['breakup', 'mutual', 'respect', 'growth'],
      mood: 'sad',
      privateNotes: 'Hard decision but the right one. We both deserve to find what we\'re looking for.',
      createdAt: '2023-01-21T16:30:00Z',
      updatedAt: '2023-01-21T16:30:00Z',
    },
  ];

  // Sort events by date (most recent first)
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    success: true,
    relationships,
    events,
    total: {
      relationships: relationships.length,
      events: events.length,
    },
  };
}

export { getTimeline }