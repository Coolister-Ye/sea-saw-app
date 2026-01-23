import { DrawerDescriptor } from "@react-navigation/drawer/lib/typescript/commonjs/src/types";
import { ReactNode } from "react";

/**
 * Shared types for drawer components
 */

/** Parent node in the nested drawer structure */
export type ParentNode = {
  type: "parent";
  children: NestedDrawerStruct;
};

/** Child node (leaf) in the nested drawer structure */
export type ChildNode = {
  type: "child";
  descriptor: DrawerDescriptor;
};

/** Nested drawer structure mapping */
export type NestedDrawerStruct = Record<string, ParentNode | ChildNode>;

/** Map of parent titles for nested menu items */
export type ParentTitleMap = Record<string, string | ReactNode>;

/** Map of parent icons for nested menu items (Web only) */
export type ParentIconMap = Record<string, ReactNode>;
