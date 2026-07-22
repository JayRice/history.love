// TRANSITIONAL: Supabase replacement for the six Firestore listeners.
// Feeds the existing Zustand stores in their legacy document shapes so the
// screens keep working unchanged. Realtime subscriptions trigger refetches
// (RLS filters realtime payloads server-side; refetching keeps mapping in
// one place).
//
// Death plan: replaced by per-feature TanStack Query hooks over
// repositories as screens are rebuilt (Phases 2-6); realtime then narrows
// to games + notifications per the PRD.
import { useEffect, useState } from 'react';
import { supabase } from '@/src/shared/lib/supabase';
import { logger } from '@/src/shared/lib/logger';
import { getSignedUrls } from '@/src/shared/lib/legacy/supabaseAppHelpers';
import { useUserStore } from '@/src/store/userStore';
import { useRelationshipStore } from '@/src/store/relationshipStore';
import { useImagesStore } from '@/src/store/imagesStore';
import { useNotificationsStore } from '@/src/store/notificationsStore';
import { useMemoryImageStore } from '@/src/store/memoryImageStore';
import type { AuthUser } from '@/src/shared/types/auth';
import User from '@/src/shared/types/User';
import Relationship from '@/src/shared/types/Relationship';
import Memory from '@/src/shared/types/Memory';
import { CalendarEvent } from '@/src/shared/types/Calendar';
import { Game } from '@/src/shared/types/Game';
import { Notification } from '@/src/shared/types/Notification';

type Doc = Record<string, unknown>;

export function useSupabaseAppSync(authUser: AuthUser | null, authUserLoading: boolean) {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const setRelationship = useRelationshipStore((s) => s.setRelationship);
  const setMemories = useRelationshipStore((s) => s.setMemories);
  const setCalendarEvents = useRelationshipStore((s) => s.setCalendarEvents);
  const setCurrentGame = useRelationshipStore((s) => s.setCurrentGame);
  const setProfileImage = useImagesStore((s) => s.setProfileImage);
  const setPartnerProfileImage = useImagesStore((s) => s.setPartnerProfileImage);
  const setNotifications = useNotificationsStore((s) => s.setNotifications);
  const setMemoryImage = useMemoryImageStore((s) => s.setMemoryImage);

  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (authUserLoading) return;

    if (!authUser) {
      setUser(undefined as unknown as User);
      setRelationship(null as unknown as Relationship);
      setMemories(null as unknown as Memory[]);
      setCalendarEvents(null as unknown as CalendarEvent[]);
      setNotifications(null as unknown as Notification[]);
      setCurrentGame(null);
      setPartnerProfileImage(null);
      setProfileImage(null);
      setProfileLoading(false);
      return;
    }

    const uid = authUser.uid;
    const email = authUser.email;
    let cancelled = false;
    let relId: string | null = null;

    async function loadProfileAndRelationship() {
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        logger.warn('profile load failed:', error.message);
        setProfileLoading(false);
        return;
      }

      const { data: memberships } = await supabase
        .from('relationship_members')
        .select('relationship_id')
        .eq('profile_id', uid)
        .eq('member_status', 'active')
        .limit(1);
      if (cancelled) return;
      relId = memberships?.[0]?.relationship_id ?? null;

      const meta = (prof?.legacy_meta ?? null) as Doc | null;
      if (!meta) {
        // Not onboarded yet: the route guard sends this state to /onboarding.
        setUser(null);
      } else {
        const partner = (meta.partner ?? {}) as Doc;
        setUser({
          id: uid,
          email: email ?? '',
          ...meta,
          partner: { ...partner, relationship_id: relId ?? undefined },
        } as unknown as User);
      }
      setProfileLoading(false);

      // Own avatar.
      const avatarPath = prof?.avatar_path;
      if (avatarPath) {
        const urls = await getSignedUrls('profile-images', [avatarPath]);
        if (!cancelled) setProfileImage(urls[avatarPath] ?? null);
      }

      if (relId) {
        await Promise.all([
          loadRelationship(relId),
          loadMemories(relId),
          loadCalendar(relId),
        ]);
      } else {
        setRelationship(null as unknown as Relationship);
        setMemories(null as unknown as Memory[]);
        setCalendarEvents(null as unknown as CalendarEvent[]);
        setCurrentGame(null);
        setPartnerProfileImage(null);
      }
    }

    async function loadRelationship(id: string) {
      const [{ data: rel }, { data: members }] = await Promise.all([
        supabase.from('relationships').select('*').eq('id', id).maybeSingle(),
        supabase.from('relationship_members').select('profile_id').eq('relationship_id', id),
      ]);
      if (cancelled || !rel) return;
      const memberIds = (members ?? []).map((m) => m.profile_id);
      const meta = (rel.legacy_meta ?? {}) as Doc;
      setRelationship({
        id: rel.id,
        users: memberIds as [string, string],
        pairKey: [...memberIds].sort().join('_'),
        goals: [],
        status: rel.status === 'active' || rel.status === 'pending' ? 'active' : 'ended',
        relationshipType: rel.relationship_type,
        startDate: rel.start_date ?? rel.created_at,
        activeGame: rel.active_game_id ?? undefined,
        profileImageIds: {},
        ...meta,
      } as unknown as Relationship);

      if (rel.active_game_id) {
        await loadGame(rel.active_game_id);
      } else {
        setCurrentGame(null);
      }
    }

    async function loadMemories(id: string) {
      const { data } = await supabase
        .from('app_memories')
        .select('id, doc')
        .eq('relationship_id', id)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      const memories = (data ?? []).map(
        (r) => ({ ...(r.doc as Doc), id: r.id }) as unknown as Memory
      );
      setMemories(memories);

      const paths = memories
        .flatMap((m) => m.photos ?? [])
        .map((p) => p.name)
        .filter((n): n is string => !!n);
      if (paths.length) {
        const urls = await getSignedUrls('relationship-media', paths);
        if (cancelled) return;
        for (const [path, url] of Object.entries(urls)) setMemoryImage(path, url);
      }
    }

    async function loadCalendar(id: string) {
      const { data } = await supabase
        .from('app_calendar_events')
        .select('id, doc')
        .eq('relationship_id', id);
      if (cancelled) return;
      setCalendarEvents(
        (data ?? []).map((r) => ({ ...(r.doc as Doc), id: r.id }) as unknown as CalendarEvent)
      );
    }

    async function loadGame(gameId: string) {
      const { data } = await supabase
        .from('app_games')
        .select('id, doc, status')
        .eq('id', gameId)
        .maybeSingle();
      if (cancelled) return;
      setCurrentGame(
        data ? ({ ...(data.doc as Doc), id: data.id, status: data.status } as unknown as Game) : null
      );
    }

    async function loadNotifications() {
      const { data } = await supabase
        .from('app_notifications')
        .select('id, doc, read_at, created_at')
        .eq('recipient_id', uid)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(10);
      if (cancelled) return;
      setNotifications(
        (data ?? []).map(
          (r) => ({ ...(r.doc as Doc), id: r.id, readAt: r.read_at }) as unknown as Notification
        )
      );
    }

    setProfileLoading(true);
    void loadProfileAndRelationship();
    void loadNotifications();

    // One channel, refetch-on-change. RLS scopes what each client can see.
    const channel = supabase
      .channel(`app-sync-${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        void loadProfileAndRelationship();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'relationship_members' }, () => {
        void loadProfileAndRelationship();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'relationships' }, () => {
        if (relId) void loadRelationship(relId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_memories' }, () => {
        if (relId) void loadMemories(relId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_calendar_events' }, () => {
        if (relId) void loadCalendar(relId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_games' }, () => {
        if (relId) void loadRelationship(relId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_notifications' }, () => {
        void loadNotifications();
      })
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.uid, authUserLoading]);

  return { user, profileLoading };
}
