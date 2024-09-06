import { computed } from "vue";
import { useRoute } from "vue-router";
import { db } from "@/db";
import type { RoomSchema } from "@/db";

export const fixedRandomColor =
  "#" + Math.floor(Math.random() * 16777215).toString(16);

export const anonUser = `Anon-${Math.random().toString(36).slice(2, 6)}`;

export function useUserPresenceValue() {
  const route = useRoute();

  const { user } = db.useAuth();
  const userPresence = computed<RoomSchema["chat"]["presence"]>(() => {
    return {
      userId: user.value?.id || anonUser,
      color: fixedRandomColor,
      page: route.fullPath,
    };
  });

  return userPresence;
}
