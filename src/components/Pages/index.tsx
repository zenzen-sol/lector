import { cloneElement, ReactElement, useEffect, useState } from "react";

import { VirtualItem } from "@tanstack/react-virtual";
import useVirtualizerVelocity from "./useVirtualizerVelocity";
import { useVisiblePage } from "./useVisiblePage";
import { usePDF } from "@/lib/internal";

export const easeOutQuint = (t: number) => {
  return 1 - Math.pow(1 - t, 5);
};

export interface PagesProps {
  children: ReactElement;
  virtualizerOptions?: {
    overscan?: number;
  };
}
export const Pages = ({ children }: PagesProps) => {
  const [tempItems, setTempItems] = useState<VirtualItem[]>([]);
  const viewports = usePDF((state) => state.viewports);

  const virtualizer = usePDF((state) => state.getVirtualizer());
  const isPinching = usePDF((state) => state.isPinching);

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

  const { normalizedVelocity } = useVirtualizerVelocity({
    virtualizer,
  });

  const items = tempItems.length ? tempItems : virtualizer.getVirtualItems();

  useVisiblePage({
    items: virtualizer.getVirtualItems(),
  });

  const isScrollingFast = Math.abs(normalizedVelocity) > 1;
  const shouldRender = !isScrollingFast;

  return (
    <>
      {items.map((virtualItem) => {
        const innerBoxWidth =
          viewports && viewports[virtualItem.index]
            ? viewports[virtualItem.index].width
            : 0;

        return (
          <div
            key={virtualItem.key}
            style={{
              // position: "absolute",
              top: 0,
              width: innerBoxWidth,
              height: `0px`,
              background: "white",
            }}
          >
            <div
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {cloneElement(children, {
                key: virtualItem.key,
                pageNumber: virtualItem.index + 1,
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};
