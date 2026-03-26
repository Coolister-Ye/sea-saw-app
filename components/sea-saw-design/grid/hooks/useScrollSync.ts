import { useRef, useCallback } from "react";
import {
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

export type UseScrollSyncResult = {
  /** Scrollable header — driven by body horizontal position */
  headerScrollRef: React.RefObject<ScrollView>;
  /** Pinned-left body — driven by body vertical position */
  pinnedLeftBodyRef: React.RefObject<ScrollView>;
  /** Pinned-right body — driven by body vertical position */
  pinnedRightBodyRef: React.RefObject<ScrollView>;
  /** Main vertical ScrollView */
  verticalScrollRef: React.RefObject<ScrollView>;
  /** Main horizontal ScrollView (inner) */
  horizontalScrollRef: React.RefObject<ScrollView>;
  /** Vertical scroll handler — syncs pinned-left and pinned-right bodies */
  onVerticalScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Horizontal scroll handler — syncs header */
  onHorizontalScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

/**
 * Manages scroll synchronisation across the grid's fixed and scrollable
 * sections — mirrors ag-grid's GridBodyScrollFeature.
 *
 * Coordinates:
 *   Vertical:    main body → pinned-left body, pinned-right body
 *   Horizontal:  main body inner → scrollable header
 */
export function useScrollSync(): UseScrollSyncResult {
  const headerScrollRef = useRef<ScrollView>(null);
  const pinnedLeftBodyRef = useRef<ScrollView>(null);
  const pinnedRightBodyRef = useRef<ScrollView>(null);
  const verticalScrollRef = useRef<ScrollView>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);

  const onVerticalScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      pinnedLeftBodyRef.current?.scrollTo({ y, animated: false });
      pinnedRightBodyRef.current?.scrollTo({ y, animated: false });
    },
    [],
  );

  const onHorizontalScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      headerScrollRef.current?.scrollTo({
        x: e.nativeEvent.contentOffset.x,
        animated: false,
      });
    },
    [],
  );

  return {
    headerScrollRef,
    pinnedLeftBodyRef,
    pinnedRightBodyRef,
    verticalScrollRef,
    horizontalScrollRef,
    onVerticalScroll,
    onHorizontalScroll,
  };
}
