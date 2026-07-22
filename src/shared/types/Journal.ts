export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  entryType: 'text' | 'voice' | 'mixed';
  mood: 'happy' | 'sad' | 'angry' | 'excited' | 'nervous' | 'content' | 'confused';
  tags: string[];
  isPrivate: boolean;
  relationshipId?: string;
  voiceRecordingUrl?: string;
  photos?: string[];
  aiPrompt?: string;
  aiResponse?: string;
  location?: string;
  weather?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIPrompt {
  id: string;
  category: 'reflection' | 'relationship' | 'growth' | 'conflict' | 'gratitude';
  prompt: string;
  followUpQuestions: string[];
  isActive: boolean;
}

export interface VoiceRecording {
  id: string;
  entryId: string;
  audioUrl: string;
  duration: number;
  transcript?: string;
  createdAt: string;
}