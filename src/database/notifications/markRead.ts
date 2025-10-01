import { doc, updateDoc } from '@firebase/firestore';
import { db } from '@/src/config/firebase';

export default async function markRead(uid: string, notificationId: string) {

  console.log(uid, notificationId);
  try {
    await updateDoc(doc(db, "users", uid, "notifications", notificationId), {
      readAt: new Date()
    });
  }catch(e){
    console.error(e);
  }

}