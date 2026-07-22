import { JournalEntry } from '@/src/shared/types';

// Placeholder API function for saving journal entries
export default async function saveJournalEntry(entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create mock journal entry with generated ID and timestamps
  const newEntry: JournalEntry = {
    id: Math.random().toString(36).substr(2, 9),
    ...entryData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    data: newEntry,
    message: 'Journal entry saved successfully',
  };
}