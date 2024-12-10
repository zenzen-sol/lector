import { usePDFDocument } from "@/lib/pdf/document";
import {
  cloneElement,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  VirtualItem,
  Virtualizer,
  VirtualizerOptions,
  debounce,
  elementScroll,
  useVirtualizer,
} from "@tanstack/react-virtual";
import useVirtualizerVelocity from "./useVirtualizerVelocity";
import { useViewport } from "@/lib/viewport";
import { PagesAPI, usePagesAPI } from "./usePagesAPI";
import { useVisiblePage } from "./useVisiblePage";

export const VIRTUAL_ITEM_GAP = 10;
export const DEFAULT_HEIGHT = 600;
export const EXTRA_HEIGHT = 0;

export const easeOutQuint = (t: number) => {
  return 1 - Math.pow(1 - t, 5);
};

const supportsScrollend =
  typeof window == "undefined" ? true : "onscrollend" in window;

type ObserveOffsetCallBack = (offset: number, isScrolling: boolean) => void;

const addEventListenerOptions = {
  passive: true,
};

export interface PagesProps {
  children: ReactElement;
  virtualizerOptions?: {
    overscan?: number;
  };
  setReaderAPI?: (api: PagesAPI) => void;
}
export const Pages = ({
  children,
  virtualizerOptions = { overscan: 10 },
  setReaderAPI,
}: PagesProps) => {
  const { pdfDocumentProxy } = usePDFDocument();

  const scrollingRef = useRef<number | null>(null);
  const numPages = pdfDocumentProxy.numPages;

  const { viewportRef, zoomRef, isPinching, viewports, setCurrentPage } =
    useViewport();

  const scrollToFn: VirtualizerOptions<any, any>["scrollToFn"] = useCallback(
    (_offset, canSmooth, instance) => {
      const duration = 400;
      const start = viewportRef?.current?.scrollTop || 0;
      const startTime = (scrollingRef.current = Date.now());

      let offset = _offset * (zoomRef.current ?? 1);
      // if we are in auto scroll mode, then immediately scroll
      // to the offset and not display any animation. For example if scroll
      // immediately to a rescaled offset if zoom/scale has just been changed
      if (canSmooth.behavior === "auto") {
        elementScroll(offset, canSmooth, instance);
        return;
      }

      // if we are in smooth mode then we scroll auto using our ease out schedule
      const run = () => {
        if (scrollingRef.current !== startTime) return;
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = easeOutQuint(Math.min(elapsed / duration, 1));
        const interpolated = start + (offset - start) * progress;

        if (elapsed < duration) {
          elementScroll(interpolated, { behavior: "auto" }, instance);
          requestAnimationFrame(run);
        } else {
          elementScroll(interpolated, { behavior: "auto" }, instance);
        }
      };

      requestAnimationFrame(run);
    },
    [viewportRef],
  );

  const estimateSize = useCallback(
    (index: number) => {
      if (!viewports || !viewports[index]) return DEFAULT_HEIGHT;
      return viewports[index].height + EXTRA_HEIGHT;
    },
    [viewports],
  );

  const observeElementOffset = <T extends Element>(
    instance: Virtualizer<T, any>,
    cb: ObserveOffsetCallBack,
  ) => {
    const element = instance.scrollElement;
    if (!element) {
      return;
    }
    const targetWindow = instance.targetWindow;
    if (!targetWindow) {
      return;
    }

    let offset = 0;
    const fallback =
      instance.options.useScrollendEvent && supportsScrollend
        ? () => undefined
        : debounce(
            targetWindow,
            () => {
              cb(offset, false);
            },
            instance.options.isScrollingResetDelay,
          );

    const createHandler = (isScrolling: boolean) => () => {
      const { horizontal, isRtl } = instance.options;
      offset = horizontal
        ? element["scrollLeft"] * ((isRtl && -1) || 1)
        : element["scrollTop"];

      offset = offset / (zoomRef.current ?? 1);
      fallback();

      cb(offset, isScrolling);
    };
    const handler = createHandler(true);
    const endHandler = createHandler(false);
    endHandler();

    element.addEventListener("scroll", handler, addEventListenerOptions);
    element.addEventListener("scrollend", endHandler, addEventListenerOptions);

    return () => {
      element.removeEventListener("scroll", handler);
      element.removeEventListener("scrollend", endHandler);
    };
  };

  const virtualizer = useVirtualizer({
    count: numPages || 0,
    getScrollElement: () => viewportRef?.current,
    estimateSize,
    observeElementOffset,
    overscan: virtualizerOptions?.overscan ?? 0,
    scrollToFn,
    gap: VIRTUAL_ITEM_GAP,
  });

  const [tempItems, setTempItems] = useState<VirtualItem[]>([]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const virtualized = virtualizer.getVirtualItems();

    if (!isPinching) {
      virtualizer.measure();

      timeout = setTimeout(() => {
        setTempItems([]);
      }, 200);
    } else if (virtualized.length > 0) {
      setTempItems(virtualizer.getVirtualItems());
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isPinching]);

  usePagesAPI({ virtualizer, estimateSize, setReaderAPI });

  const { normalizedVelocity } = useVirtualizerVelocity({
    virtualizer,
    estimateSize,
  });

  const items = tempItems.length ? tempItems : virtualizer.getVirtualItems();

  const { currentPageIndex } = useVisiblePage({
    items: virtualizer.getVirtualItems(),
  });

  const isScrollingFast = Math.abs(normalizedVelocity) > 1;
  const shouldRender = !isScrollingFast;

  return (
    <div
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: "100%",
        position: "relative",
      }}
    >
      {items.map((virtualItem) => {
        const innerBoxWidth =
          viewports && viewports[virtualItem.index]
            ? viewports[virtualItem.index].width
            : 0;

        return (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              width: innerBoxWidth,
              height: `${virtualItem.size}px`,
              transform: `translateX(-50%) translateY(${virtualItem.start}px)`,
              background: "white",
            }}
          >
            {cloneElement(children, {
              key: virtualItem.key,
              pageNumber: virtualItem.index + 1,
            })}
          </div>
        );
      })}
    </div>
  );
};
