export function getPartnerName(name: string | null){
  let partnerName = name?.split(" ")[0] ?? "Your Partner";

  if (name) {
    partnerName = partnerName[0].toUpperCase().trim() + partnerName.substring(1);
  }

  return partnerName;
}