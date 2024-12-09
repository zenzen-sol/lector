import { usePDFDocument } from "@/lib/pdf/document";
import {
  cloneElement,
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
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
import { HighlightArea } from "../Highlight";
import { getOffsetForHighlight } from "./utils";

export const VIRTUAL_ITEM_GAP = 10;
export const BASE_PAGE_HEIGHT = 595; // Default A4 height

export const easeOutQuint = (t: number) => {
  return 1 - Math.pow(1 - t, 5);
};

const supportsScrollend =
  typeof window == "undefined" ? true : "onscrollend" in window;

type ObserveOffsetCallBack = (offset: number, isScrolling: boolean) => void;

const addEventListenerOptions = {
  passive: true,
};

interface HighlightAPI {
  jumpToPage: (pageIndex: number, options?: any) => void;
  jumpToOffset: (offset: number) => void;
  jumpToHighlightArea: (area: HighlightArea) => void;
}

interface PagesProps {
  children: ReactElement;
  virtualizerOptions?: {
    overscan?: number;
  };
  onHighlightAPI?: (api: HighlightAPI) => void;
}
export const Pages = ({
  children,
  virtualizerOptions = { overscan: 10 },
}: PagesProps) => {
  const { pdfDocumentProxy, pageHeight } = usePDFDocument();

  const scrollingRef = useRef<number | null>(null);
  const numPages = pdfDocumentProxy.numPages;

  const { viewportRef, zoomRef, isPinching } = useViewport();

  const scrollToFn: VirtualizerOptions<any, any>["scrollToFn"] = useCallback(
    (offset, canSmooth, instance) => {
      const duration = 400;
      const start = viewportRef?.current?.scrollTop || 0;
      const startTime = (scrollingRef.current = Date.now());

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

  const estimateSize = (index: number) => pageHeight;

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

  const items = tempItems.length ? tempItems : virtualizer.getVirtualItems();

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

  const jumpToPage = (
    pageIndex: number,
    options?: {
      align?: "start" | "center" | "end" | "auto";
      behavior?: "auto" | "smooth";
    },
  ) => {
    // Define default options
    const defaultOptions = {
      align: "start",
      behavior: "smooth",
    };

    // Merge default options with any provided options
    const finalOptions = { ...defaultOptions, ...options };
    // @ts-ignore
    virtualizer.scrollToIndex(pageIndex, finalOptions);
  };

  const jumpToOffset = (offset: number) => {
    virtualizer.scrollToOffset(offset, {
      align: "start",
      behavior: "smooth",
    });
  };

  const jumpToHighlightArea = (area: HighlightArea) => {
    const startOffset = virtualizer.getOffsetForIndex?.(
      area.pageNumber,
      "start",
    )?.[0];

    if (startOffset == null) return;

    const itemHeight = estimateSize(area.pageNumber);

    const largestRect = area.rects.reduce((a, b) => {
      return a.height > b.height ? a : b;
    });
    const offset = getOffsetForHighlight({
      ...largestRect,
      itemHeight: itemHeight - 10, // accounts for padding top and bottom
      startOffset: startOffset - 5, // accounts for padding on top
    });

    virtualizer.scrollToOffset(offset, {
      align: "start",
      behavior: "smooth",
    });
  };

  const { normalizedVelocity } = useVirtualizerVelocity({
    virtualizer,
    estimateSize,
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
      {items.map((virtualItem) => (
        <div
          key={virtualItem.key}
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: "fit",
            height: `${virtualItem.size}px`,
            transform: `translateX(-50%) translateY(${virtualItem.start}px)`,
          }}
        >
          {cloneElement(children, {
            key: virtualItem.key,
            pageNumber: virtualItem.index + 1,
          })}
        </div>
      ))}
    </div>
  );
};
