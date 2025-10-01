import { useRouter } from 'expo-router';
import { useLocationModalStore } from '@/src/store/useLocationModalStore';
import { LocationSearchModal } from "@/src/components/modals/LocationSearchModal"
export default function LocationSearchScreen() {
  const router = useRouter();
  const resolve = useLocationModalStore(s => s.resolve);

  return (
    <LocationSearchModal
      visible
      onClose={() => { resolve(null); router.back(); }}
      onSelect={(loc) => { resolve(loc); router.back(); }}
    />
  );
}