// Notice: // adapted from
[@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license
<template>
  <component
    :is="props.as"
    :style="['position: relative', props.style]"
    :class="props.className"
    @mousemove="onMouseMove"
    @mouseout="onMouseOut"
    ><slot></slot>
    <div
      :key="spaceId"
      :style="{
        ...absStyles,
        ...inertStyles,
        zIndex: props.zIndex !== undefined ? props.zIndex : defaultZ,
      }"
    >
      <template
        v-for="[id, presence] of Object.entries(cursorsPresence.peers.value)"
        :key="id"
      >
        <div
          v-if="getCursor(presence)"
          :style="{
            ...absStyles,
            transform: `translate(${getCursor(presence).xPercent}%, ${
              getCursor(presence).yPercent
            }%)`,
            transformOrigin: '0 0',
            transition: 'transform 100ms',
          }"
        >
          <slot
            name="cursor"
            :color="getCursor(presence).color"
            :presence="fullPresence.peers.value[id]"
          >
            <Cursor v-bind:color="getCursor(presence).color" />
          </slot>
        </div>
      </template>
    </div>
  </component>
</template>

<script
  setup
  lang="ts"
  generic="RoomSchema extends RoomSchemaShape, RoomType extends keyof RoomSchema"
>
import type * as CSS from "csstype";
import { computed } from "vue";
import { InstantVueRoom } from "../InstantVue";
import type { RoomSchemaShape } from "@instantdb/core";
import type { CursorSchema } from ".";
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

const fullPresence = room.usePresence();

function getCursor(presence: (typeof cursorsPresence.peers.value)[string]) {
  return presence[spaceId.value] as Pick<
    RoomSchema[RoomType]["presence"],
    keyof RoomSchema[RoomType]["presence"]
  > &
    CursorSchema;
}

function onMouseMove(e: MouseEvent) {
  if (!propagate) {
    e.stopPropagation();
  }
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
