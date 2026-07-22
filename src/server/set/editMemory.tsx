
import Memory from "@/src/shared/types/Memory"
import fetchServer from "@/src/server/fetchServer"

export async function editMemory(memoryData: Memory, shouldDelete: boolean, deletedPhotos : string[]) {

  const formData = new FormData();

  memoryData.photos?.forEach((photo, index) => {
    // if this photo was already taken
    if (photo.downloadURL) {return}
    formData.append("memory_photos", {
      uri: photo.uri,
      type: "image/jpeg",
      name: `photo_${index}.jpg`,
    } as any);
  });
  formData.append("memoryData", JSON.stringify(memoryData))

  formData.append("shouldDelete", JSON.stringify(shouldDelete))

  formData.append("deletedPhotos", JSON.stringify(deletedPhotos))



  return await fetchServer("/timeline/edit_memory", formData, "POST")

}