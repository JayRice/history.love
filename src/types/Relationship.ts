// Relationship Event
import { RelationshipType } from './User';
import { RelationshipMood } from '@/src/types/Moods';

export interface RelationshipEvent {
  id: string;
  relationshipId: string;
  title: string;
  description: string;
  eventType:
    | 'milestone'
    | 'memory'
    | 'conflict'
    | 'resolution'
    | 'special-date'
    | 'breakup';
  date: string; // ISO string or toISOString()
  location?: string;
  photos?: string[];
  tags: string[];
  mood:
    | 'happy'
    | 'sad'
    | 'angry'
    | 'excited'
    | 'nervous'
    | 'content'
    | 'confused';
  privateNotes?: string;
  createdAt: string;
  updatedAt: string;
}


// Relationship Doc
export default interface Relationship {
  id: string; // document ID, often = pairKey
  users: [string, string]; // both user UIDs
  pairKey: string; // e.g. [uid, otherUid].sort().join("_")



  // Core partner info
  goals: string[];
  status: 'active' | 'ended' | 'complicated';
  relationshipType: RelationshipType;

  // Dates
  updatedAt?: string;
  startDate: string;
  endDate?: string;

  // Content
  events?: RelationshipEvent[];
  notes?: string;
  isPrivate?: boolean;

  moods?: Record<string, RelationshipMood>;

  profileImageIds: Record<string, string | null>;

  activeGame?: string;



}

// Filters for querying timelines
export interface TimelineFilter {
  startDate?: string;
  endDate?: string;
  eventTypes?: RelationshipEvent['eventType'][];
  relationshipIds?: string[];
  moods?: RelationshipEvent['mood'][];
}