
import Memory from "../../types/Memory"
import fetchServer from "../fetchServer"

export async function addMemory(memoryData: Omit<Memory, "id" | "">) {

  const formData = new FormData();

  memoryData.photos?.forEach((photo, index) => {
    formData.append("memory_photos", {
      uri: photo.uri,
      type: "image/jpeg",
      name: `photo_${index}.jpg`,
    } as any);
  });

  formData.append("memoryData", JSON.stringify(memoryData))

  return await fetchServer("/timeline/add_memory", formData, "POST")

}