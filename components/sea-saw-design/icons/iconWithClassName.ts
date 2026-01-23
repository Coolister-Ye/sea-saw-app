import { cssInterop } from "nativewind";
import type { ComponentType } from "react";

export function iconWithClassName(icon: ComponentType<any>) {
  cssInterop(icon, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  });
}
