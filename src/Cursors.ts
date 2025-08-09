import {
  defineComponent,
  h,
  computed,
  onBeforeUnmount,
  ref,
  watch,
  watchEffect,
  type SlotsType,
  type SetupContext,
} from "vue";
import type * as CSS from "csstype";
import { InstantVueRoom } from "./InstantVueRoom";
import type { RoomSchemaShape } from "@instantdb/core";
interface CursorSchema {
  x: number;
  y: number;
  xPercent: number;
  yPercent: number;
  color: string;
}

const Cursor = defineComponent({
  props: { color: String },
  setup(props) {
    const size = 35;
    const fill = computed(() => {
      return props.color || "black";
    });
    return h(
      "svg",
      {
        style: { width: `${size}px`, height: `${size}px` },
        viewBox: `0 0 ${size} ${size}`,
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
      },
      [
        h(
          "g",
          {
            fill: "rgba(0,0,0,.2)",
            transform:
              "matrix(1, 0, 0, 1, -11.999999046325684, -8.406899452209473)",
          },
          [
            h("path", {
              d: "m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z",
            }),
            h("path", {
              d: "m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z",
            }),
          ]
        ),
        h(
          "g",
          {
            fill: "white",
            transform:
              "matrix(1, 0, 0, 1, -11.999999046325684, -8.406899452209473)",
          },
          [
            h("path", {
              d: "m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z",
            }),
            h("path", {
              d: "m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z",
            }),
          ]
        ),
        h(
          "g",
          {
            fill: fill.value,
            transform:
              "matrix(1, 0, 0, 1, -11.999999046325684, -8.406899452209473)",
          },
          [
            h("path", {
              d: "m19.751 24.4155-1.844.774-3.1-7.374 1.841-.775z",
            }),
            h("path", {
              d: "m13 10.814v11.188l2.969-2.866.428-.139h4.768z",
            }),
          ]
        ),
      ]
    );
  },
});

// needs vue v3.3+ for generics
// https://vuejs.org/api/general#function-signature
const Cursors = defineComponent(
  <RoomSchema extends RoomSchemaShape, RoomType extends keyof RoomSchema>(
    props: {
      spaceId?: string;
      room: InstantVueRoom<any, RoomSchema, RoomType>;
      style?: CSS.Properties<string | number>;
      userCursorColor?: string;
      as?: any;
      propagate?: boolean;
      zIndex?: number;
    },
    ctx: any
  ) => {
    const emit = defineEmits<{ error: [value: string] }>();

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

    const { room, propagate, userCursorColor } = props;

    const spaceId = computed(
      () =>
        (props.spaceId ||
          `cursors-space-default--${String(room.type)}-${
            room.id.value
          }`) as keyof RoomSchema[RoomType]["presence"]
    );

    const usePresenceOptions = computed(() => {
      return {
        keys: [spaceId.value],
      };
    });

    // react sdk still does not use db.rooms
    // see https://github.com/instantdb/instant/blob/main/client/packages/react/src/Cursors.tsx
    const cursorsPresence = room.usePresence(usePresenceOptions);

    const isLoadingFirst = ref(true);
    watchEffect(() => {
      if (!isLoadingFirst.value) {
        return;
      }
      isLoadingFirst.value = cursorsPresence.isLoading.value;
    });

    watchEffect(() => {
      if (cursorsPresence.error?.value) {
        emit("error", cursorsPresence.error.value);
      }
    });

    // react sdk still does not use db.rooms
    // see https://github.com/instantdb/instant/blob/main/client/packages/react/src/Cursors.tsx
    const fullPresence = room.usePresence();

    function getCursor(presence: (typeof cursorsPresence.peers.value)[string]) {
      return presence[spaceId.value] as Pick<
        RoomSchema[RoomType]["presence"],
        keyof RoomSchema[RoomType]["presence"]
      > &
        CursorSchema;
    }

    function publishCursor(
      rect: DOMRect,
      touch: { clientX: number; clientY: number }
    ) {
      const x = touch.clientX;
      const y = touch.clientY;
      const xPercent = ((x - rect.left) / rect.width) * 100;
      const yPercent = ((y - rect.top) / rect.height) * 100;

      if (cursorsPresence.isLoading.value) {
        return;
      }

      try {
        cursorsPresence.publishPresence({
          [spaceId.value]: {
            x,
            y,
            xPercent,
            yPercent,
            color: userCursorColor,
          },
        } as RoomSchema[RoomType]["presence"]);
      } catch (error) {
        console.error(error);
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (!propagate) {
        e.stopPropagation();
      }

      if (e.currentTarget instanceof Element) {
        const rect = e.currentTarget.getBoundingClientRect();
        publishCursor(rect, e);
      }
    }

    // note: using it on mouseleave event
    function onMouseOut(e: MouseEvent) {
      clearPresence(spaceId.value);
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length !== 1) {
        return;
      }

      const touch = e.touches[0];

      if (touch.target instanceof Element) {
        if (!propagate) {
          e.stopPropagation();
        }
        const rect = touch.target.getBoundingClientRect();
        publishCursor(rect, touch);
      }
    }

    function onTouchEnd(e: TouchEvent) {
      clearPresence(spaceId.value);
    }

    function clearPresence(_spaceId: typeof spaceId.value) {
      if (isLoadingFirst.value) {
        return;
      }
      try {
        cursorsPresence.publishPresence({
          [_spaceId]: undefined,
        } as RoomSchema[RoomType]["presence"]);
      } catch (error) {
        console.error(error);
      }
    }

    watch(spaceId, (_, oldValue) => {
      clearPresence(oldValue);
    });

    onBeforeUnmount(() => {
      clearPresence(spaceId.value);
    });

    // todo!!! finish render function and fix context types for slots and events
    return () =>
      h(props.as || "div", { style: ["position: relative", props.style] }, [
        ctx.slots.default?.(),
      ]);
  },
  {
    props: [
      "spaceId",
      "room",
      "style",
      "userCursorColor",
      "as",
      "propagate",
      "zIndex",
    ],
    emits: ["error"],
  }
);
