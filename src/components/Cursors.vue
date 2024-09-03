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
        v-for="[id, presence] of Object.entries(cursorsPresence.peers)"
        :key="id"
        :style="{
          ...absStyles,
          transform: `translate(${presence[spaceId].xPercent}%, ${presence[spaceId].yPercent}%)`,
          transformOrigin: '0 0',
          transition: 'transform 100ms',
        }"
      >
        <slot
          name="cursor"
          :color="presence[spaceId].color"
          :presence="fullPresence.peers[id]"
        >
          <Cursor v-bind="presence[spaceId]" />
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
import { computed, shallowRef, watch } from "vue";
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
  () => _spaceId || `cursors-space-default--${String(room.type)}-${room.id}`
);

const usePresenceOptions = computed(() => {
  return {
    keys: [spaceId.value],
  };
});
//@ts-ignore TODO! see InstantVue
const cursorsPresence = room.usePresence(usePresenceOptions);

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
