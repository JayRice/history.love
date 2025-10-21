import { useUserStore } from '@/src/store/userStore';

export function getPartnerName(name?: string | null ){
  let { user } = useUserStore.getState();
  let partnerName = name ? name?.split(" ")[0] : (user?.partner?.name?.split(" ")[0] ?? "Your Partner");

  if (name) {
    partnerName = partnerName[0].toUpperCase().trim() + partnerName.substring(1);
  }

  return partnerName;
}