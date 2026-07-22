import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/src/config/firebase';


export default async function getImages(dir: string, images: string[]) {
  const urls = await Promise.all(
    images.map(async (imageId) => {
      try {
        const imageRef = ref(storage, `${dir}/${imageId}`);
        return await getDownloadURL(imageRef);
      } catch (err) {
        // Storage errors can embed signed URLs and object paths; log the code only.
        console.warn("getImages failed:", (err as { code?: string })?.code ?? "unknown");
        return null;
      }
    })
  );

  // filter out any nulls so you only get valid URLs
  return urls.filter((url): url is string => !!url);
}