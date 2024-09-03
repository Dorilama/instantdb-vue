// Notice: // adapted from
[@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license
<template>
  <slot></slot>
  <component
    :is="props.as"
    :style="['position: relative', props.style]"
    :class="props.className"
    @mousemove="onMouseMove"
    @mouseout="onMouseOut"
  >
    <div
      :key="spaceId"
      :style="{
        ...absStyles,
        ...inertStyles,
        zIndex: props.zIndex !== undefined ? props.zIndex : defaultZ,
      }"
    >
      <div
        v-for="[id, presence, cursor] of peers"
        :key="id"
        :style="{
          ...absStyles,
          transform: `translate(${cursor.xPercent}%, ${cursor.yPercent}%)`,
          transformOrigin: '0 0',
          transition: 'transform 100ms',
        }"
      >
        <slot
          name="cursor"
          :color="cursor.color"
          :presence="fullPresence.peers[id]"
        >
          <Cursor v-bind:color="cursor.color" />
        </slot>
      </div>
    </div>
  </component>
</template>

<script
  setup
  lang="ts"
  generic="RoomSchema extends RoomSchemaShape, RoomType extends keyof RoomSchema"
>
import type * as CSS from "csstype";
import { computed, shallowRef, watch, watchEffect } from "vue";
import { InstantVueRoom } from "../InstantVue";
import type { RoomSchemaShape } from "@instantdb/core";
import Cursor from "./Cursor.vue";

const props = defineProps<{
  spaceId?: string;
  room: InstantVueRoom<any, RoomSchema, RoomType>;
  style?: CSS.Properties<string | number>;
  userCursorColor?: string;
  as?: any;
  className?: string;
  propagate?: boolean;
  zIndex?: number;
}>();

const absStyles: CSS.Properties = {
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

const inertStyles: CSS.Properties = {
  overflow: "hidden",
  pointerEvents: "none",
  userSelect: "none",
};

const defaultZ = 99999;

const { room, spaceId: _spaceId, propagate, userCursorColor } = props;

const spaceId = computed(
  () =>
    (_spaceId ||
      `cursors-space-default--${String(room.type)}-${
        room.id.value
      }`) as keyof RoomSchema[RoomType]["presence"]
);

const usePresenceOptions = computed(() => {
  return {
    keys: [spaceId.value],
  };
});

const cursorsPresence = room.usePresence(usePresenceOptions);

const peers = computed(() => {
  return Object.entries(cursorsPresence.peers.value)
    .map(([id, presence]) => {
      const cursor = presence[spaceId.value];
      console.log(id, presence, cursor);
      if (cursor) {
        return [id, presence, cursor];
      }
    })
    .filter(Boolean);
});

watchEffect(() => {
  console.log("@@@@", peers.value);
});

function getFullPresence() {
  return room._core._reactor.getPresence(room.type, room.id.value);
}
const fullPresence = shallowRef(getFullPresence());
watch(
  () => props.room.id,
  () => {
    fullPresence.value = getFullPresence();
  }
);

function onMouseMove(e: MouseEvent) {
  console.log("move", e);
  if (!propagate) {
    e.stopPropagation();
  }
  console.log(e);
  e.currentTarget;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  const xPercent = ((x - rect.left) / rect.width) * 100;
  const yPercent = ((y - rect.top) / rect.height) * 100;
  cursorsPresence.publishPresence({
    [spaceId.value]: {
      x,
      y,
      xPercent,
      yPercent,
      color: userCursorColor,
    },
  } as RoomSchema[RoomType]["presence"]);
}

function onMouseOut(e: MouseEvent) {
  cursorsPresence.publishPresence({
    [spaceId.value]: undefined,
  } as RoomSchema[RoomType]["presence"]);
}
</script>

<style scoped></style>
