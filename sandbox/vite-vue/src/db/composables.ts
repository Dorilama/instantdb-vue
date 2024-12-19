import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { db, chatRoom } from "@/db";
import type { AppSchema } from "@/db";

export const fixedRandomColor =
  "#" + Math.floor(Math.random() * 16777215).toString(16);

export const anonUser = `Anon-${Math.random().toString(36).slice(2, 6)}`;

export function useUserPresenceValue() {
  const route = useRoute();

  const { user } = db.useAuth();
  const userPresence = computed(() => {
    const userId =
      user.value?.id && !route.query.anon ? user.value?.id : anonUser;
    return {
      userId,
      color: fixedRandomColor,
      path: route.path,
    };
  });

  return userPresence;
}

export function usePeerStats() {
  const router = useRouter();
  const routes = router.getRoutes().filter((r) => r.meta.isNav === true);
  const home = routes.find((r) => r.path == "/") || {
    path: "/",
    meta: {} as Record<string, unknown>,
  };
  const { peers, user } = chatRoom.usePresence();

  const count = computed<{
    byPath: Record<(typeof routes)[number]["path"], number>;
    notInHome: number;
    total: number;
  }>(() => {
    return Object.values(peers.value).reduce(
      (count, peer) => {
        if (routes.find((r) => r.meta.isNav && r.path === peer.path)) {
          count.byPath[peer.path] = (count.byPath[peer.path] || 0) + 1;
          if (peer.path !== home.path) {
            count.notInHome += 1;
          }
          count.total += 1;
        }

        return count;
      },
      {
        byPath: {} as Record<(typeof routes)[number]["path"], number>,
        notInHome: 0,
        total: 0,
      }
    );
  });
  return { user, peers, home, routes, count };
}
