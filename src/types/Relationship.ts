export interface Relationship {
  id: string;
  userId: string;
  partnerName: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'ended' | 'complicated';
  relationshipType: 'dating' | 'serious' | 'married' | 'casual';
  events: RelationshipEvent[];
  notes: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipEvent {
  id: string;
  relationshipId: string;
  title: string;
  description: string;
  eventType: 'milestone' | 'memory' | 'conflict' | 'resolution' | 'special-date' | 'breakup';
  date: string;
  location?: string;
  photos?: string[];
  tags: string[];
  mood: 'happy' | 'sad' | 'angry' | 'excited' | 'nervous' | 'content' | 'confused';
  privateNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineFilter {
  startDate?: string;
  endDate?: string;
  eventTypes?: string[];
  relationshipIds?: string[];
  moods?: string[];
}