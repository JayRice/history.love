// LEGACY: the six Firestore listeners that mirror server documents into
// Zustand, extracted verbatim from src/app/_layout.tsx (Phase 0B, task 6).
// Behavior-preserving move only: effect order, dependency arrays, store
// subscriptions (including ones whose values are unused, which affect
// re-render timing), and the pre-existing `as any` casts are unchanged.
//
// Death plan: each listener is replaced by TanStack Query hooks over
// Supabase repositories (user/relationship/memories/calendar in Phases
// 3-4, notifications/game in Phase 6). This file must not gain new
// functionality.
import { useEffect, useState } from 'react';
import { collection, doc, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

import { db } from '@/src/shared/config/firebase';
import getImages from '@/src/shared/lib/legacy/getImages';
import { logger } from '@/src/shared/lib/logger';
import { useUserStore } from '@/src/store/userStore';
import { useRelationshipStore } from '@/src/store/relationshipStore';
import { useImagesStore } from '@/src/store/imagesStore';
import { useNotificationsStore } from '@/src/store/notificationsStore';
import { useMemoryImageStore } from '@/src/store/memoryImageStore';
import { Notification } from '@/src/shared/types/Notification';
import Memory from '@/src/shared/types/Memory';
import { CalendarEvent } from '@/src/shared/types/Calendar';
import { Game } from '@/src/shared/types/Game';

export function useLegacyFirebaseSync(
  authUser: FirebaseUser | null,
  authUserLoading: boolean,
) {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((s) => s.setUser);

  const relationship = useRelationshipStore((s) => s.relationship);
  const setRelationship = useRelationshipStore((s) => s.setRelationship);

  const memories = useRelationshipStore((s) => s.memories);
  const setMemories = useRelationshipStore((s) => s.setMemories);

  const setCalendarEvents = useRelationshipStore(s => s.setCalendarEvents);


  const setProfileImage = useImagesStore((s) => s.setProfileImage);
  const setPartnerProfileImage = useImagesStore((s) => s.setPartnerProfileImage);

  const notifications = useNotificationsStore(s => s.notifications);
  const setNotifications = useNotificationsStore(s => s.setNotifications)

  const memoryImages = useMemoryImageStore(s => s.memoryImages);
  const setMemoryImage = useMemoryImageStore(s => s.setMemoryImage);


  const [profileLoading, setProfileLoading] = useState(true);

  const setCurrentGame = useRelationshipStore(s => s.setCurrentGame);


  async function fetchProfileImage(imageId: string, uid: string) {
    if (!authUser || !user?.profile?.profileImage?.name) return null;
    const urls = await getImages(`profile-images/${uid}`, [imageId]);
    return urls[0];
  }
  async function fetchMemoryImages(memories: Memory[]) {
    if (!authUser || !memories || !user) return null;
    memories.forEach((memory) => {
      if (!memory.photos) {return}

      memory.photos.forEach(async (photo) => {
        if (!photo.name) {return}

        // already cached
        if (memoryImages[photo.name]) {return}

        const urls = await getImages(`memory-images/${user?.partner?.relationship_id}/${memory.id}`, [photo.name])
        const downloadURL = urls?.[0]
        if (downloadURL){
          setMemoryImage(photo.name, downloadURL);
        }else{
          delete memoryImages[photo.name]
        }
      })
    })

  }

  useEffect(() => {

    if (!relationship || !relationship?.activeGame) {return}

    const activeGameId = relationship.activeGame;
    const unsubGame = onSnapshot(doc(db, "relationships", relationship.id, "games", activeGameId), (snap) => {
      if (snap.exists()) {
        const game = snap.data() as Game;
        setCurrentGame(game);
      } else {
        setCurrentGame(null)
      }


    });

    return unsubGame;

  }, [relationship?.activeGame]);

  useEffect(() => {
    if (!user || !authUser || !user?.partner?.relationship_id ) return;


    const unsubMemory = onSnapshot(collection(db, "relationships", user?.partner?.relationship_id, "memories"), (snap) => {
      const memories = snap.docs.map(d => ({  ...d.data() } as Memory));

      try {
        fetchMemoryImages(memories)
        setMemories(memories);
      } catch(err) {
        logger.warn("Failed to fetch memory images");
      }

    });

    const unsubCalendarEvents = onSnapshot(collection(db, "relationships", user?.partner?.relationship_id, "calendarEvents"), (snap) => {
      const calendarEvents = snap.docs.map(d => ({  ...d.data() } as CalendarEvent));

      setCalendarEvents(calendarEvents);
    });

    const q = query(
      collection(db, "users", user.id, "notifications"),
      where("readAt", "==", null),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubNoti = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(d => ({  ...d.data() } as Notification));
      setNotifications(notifs);
    });



    return () => {
      unsubNoti();
      unsubMemory();
      unsubCalendarEvents();
    };


  }, [user?.id, authUser]);


  // Get partners profile image
  useEffect(() => {
    if (!relationship || !authUser) return;



    const partnerUID = relationship.users.filter((u) => u!=authUser.uid)[0]

    const partnerImage = relationship?.profileImageIds[partnerUID];
    if (!partnerImage) return;

    fetchProfileImage(partnerImage, partnerUID).then((profileImage) => {
      setPartnerProfileImage(profileImage );
    })
  }, [relationship]);

  // Get users profile image
  useEffect(() => {
    if (!authUser || !user?.profile?.profileImage || !user?.profile?.profileImage?.name) return;

    fetchProfileImage(user?.profile?.profileImage?.name, authUser.uid).then((profileImage) => {
      setProfileImage(profileImage );
    })
  }, [user?.id, user?.profile?.profileImage])

  useEffect(() => {
   const relationship_id = user?.partner?.relationship_id;

   if (!relationship_id) return;


    const unsub = onSnapshot(doc(db, "relationships", relationship_id), (snap) => {
      setRelationship(snap.exists() ? (snap.data() as any) : null);
    });
    return unsub;

  }, [authUser, user?.partner, user?.partner?.relationship_id]);
  // Live subscribe to the user doc when signed in
  useEffect(() => {
    if (authUserLoading) return;

    if (!authUser) {
      setUser(undefined as any);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const unsub = onSnapshot(doc(db, "users", authUser.uid), (snap) => {
      setUser(snap.exists() ? (snap.data() as any) : null);
      setProfileLoading(false);
    });
    return unsub;
  }, [authUser, authUserLoading, setUser]);

  return { user, profileLoading };
}
