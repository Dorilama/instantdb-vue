<template>
  <div class="flex flex-col items-center pt-4 pb-8 px-2 gap-4">
    <h1 class="text-4xl">Dynamic Rooms</h1>
    <div class="card card-bordered rounded-lg bg-base-100 sm:min-w-96">
      <div class="card-body">
        <div class="form-control">
          <label v-for="r of allRooms" :key="r" class="label cursor-pointer">
            <span class="label-text">{{ r }}</span>
            <input
              type="radio"
              name="radio-room"
              class="radio"
              :value="r"
              v-model="roomId"
            />
          </label>
        </div>
      </div>
      <div class="overflow-x-auto w-full">
        <table
          class="table rounded-t-none rounded-b-lg"
          :class="presence.isLoading.value ? 'skeleton' : ''"
        >
          <!-- head -->
          <thead>
            <tr>
              <th></th>
              <th>Peers</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="presence.isLoading.value">
              <th aria-hidden="true" class="opacity-0">0</th>
              <td aria-hidden="true" class="opacity-0">
                -d73a6a1-368b-4081-a06a-45d86404bdf-
              </td>
            </tr>
            <template v-else>
              <tr v-if="!Object.keys(presence.peers.value).length">
                <th aria-hidden="true" class="opacity-0">0</th>
                <td>No peers in this room, try another one.</td>
              </tr>
              <tr v-for="(peer, n) of Object.values(presence.peers.value)">
                <th>{{ n + 1 }}</th>
                <td>{{ peer.peerId }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div
        v-if="presence.error?.value"
        ref="alert-error"
        role="alert"
        class="alert alert-error rounded-lg rounded-tl-none rounded-tr-none"
      >
        <span
          aria-hidden="true"
          class="icon-[mdi--error-outline] text-2xl"
        ></span>

        <span>Error! {{ presence.error?.value || "unknown error." }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useTemplateRef, watchEffect, watch, ref } from "vue";
import { db } from "@/db";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const allRooms = ["room1", "room2"];
const roomId = ref((route.query.id as string | undefined) || allRooms[0]);

watch(roomId, (id) => {
  router.push({ query: { id: id || undefined } });
});

const room = db.room("chat", roomId);
const presence = room.usePresence();

const alertError = useTemplateRef("alert-error");

watchEffect(() => {
  if (presence.error?.value && alertError.value) {
    alertError.value?.scrollIntoView();
  }
});
</script>

<style scoped></style>
