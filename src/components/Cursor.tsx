// Notice: // adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license
import { computed, defineComponent, h } from "vue";
import type { RoomSchemaShape } from "@instantdb/core";

export default /*#__PURE__*/ defineComponent(
  <
    RoomSchema extends RoomSchemaShape,
    RoomType extends keyof RoomSchema
  >(props: {
    color: string;
  }) => {
    const size = 35;
    const fill = computed(() => {
      return props.color || "black";
    });

    return () => {
      return (
        <svg
          style={{ width: size, height: size }}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            fill="rgba(0,0,0,.2)"
            transform="matrix(1, 0, 0, 1, -11.999999046325684, -8.406899452209473)"
          >
            <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
            <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
          </g>
          <g
            fill="white"
            transform="matrix(1, 0, 0, 1, -11.999999046325684, -8.406899452209473)"
          >
            <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
            <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
          </g>
          <g
            fill={fill.value}
            transform="matrix(1, 0, 0, 1, -11.999999046325684, -8.406899452209473)"
          >
            <path d="m19.751 24.4155-1.844.774-3.1-7.374 1.841-.775z" />
            <path d="m13 10.814v11.188l2.969-2.866.428-.139h4.768z" />
          </g>
        </svg>
      );
    };
  },
  {
    props: ["color"],
  }
);