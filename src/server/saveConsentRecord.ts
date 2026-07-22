import { ConsentRecord } from '@/src/shared/types';

// Placeholder API function for saving consent records
export default async function saveConsentRecord(consentData: Omit<ConsentRecord, 'id' | 'createdAt' | 'updatedAt'>) {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Create mock consent record with generated ID and timestamps
  const newRecord: ConsentRecord = {
    id: Math.random().toString(36).substr(2, 9),
    ...consentData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    data: newRecord,
    message: 'Consent record created successfully',
  };
}