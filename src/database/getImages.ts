import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/src/config/firebase';

export default async function getImages(dir: string, images: string[]) {
  const urls = await Promise.all(
    images.map(imageId => {
      const imageRef = ref(storage, `${dir}/${imageId}`);
      return getDownloadURL(imageRef);
    })
  );
  return urls;
};