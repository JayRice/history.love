import { useRouter } from 'expo-router';
import StoryModeModal from '@/src/components/modals/StoryModeModal';
import { useStoryModeStore } from '@/src/store/useStoryModeStore';
import { useRelationshipStore } from '@/src/store/relationshipStore';

export default function StoryModeScreen() {
  const router = useRouter();
  const resolve = useStoryModeStore(s => s.resolve);

  const memories = useRelationshipStore(s => s.memories) ;

  if (!memories){
    return null;
  }
  return (
    <StoryModeModal
      memories={memories}
      visible
      onClose={() => { resolve(); }}
    />
  );
}