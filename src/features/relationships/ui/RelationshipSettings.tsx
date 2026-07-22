import { PrimaryButton } from '@/src/shared/ui/buttons/PrimaryButton';
import { getPartnerName } from '@/src/shared/lib/utils/getPartnerName';
import { ConfirmOverlay } from '@/src/shared/ui/feedback/ConfirmOverlay';
import { Screen } from '@/src/shared/ui/layout/Screen';
import { useState } from 'react';
import unpairUsers from '../data/legacy/unpairUsers';

export function RelationshipSettings(){
  const [open, setOpen] = useState(false);
  const [loading ,setLoading] = useState(false);

  const partnerName = getPartnerName()
  return (
    <Screen backButton style={{ flex: 1 }}>
      <PrimaryButton onPress={() => setOpen(true)}>Unpair with {partnerName}</PrimaryButton>
      <ConfirmOverlay
        visible={open}
        loading={loading}
        variant="danger"
        title={`Unpair with ${partnerName}?`}
        message={`This will unpair you and ${partnerName}. You can’t undo this. `}
        confirmLabel="Unpair"
        cancelLabel="Cancel"
        onConfirm={async () => {
          setLoading(true)
          await unpairUsers();
          setLoading(false);
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </Screen>
  );
}