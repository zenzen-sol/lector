import { useViewportContainer } from "@/lib/viewport";
import { HTMLProps, useCallback, useEffect, useRef, useState } from "react";
import { Primitive } from "../Primitive";
import { usePDF } from "@/lib/internal";
import { useScrollFn } from "../Pages/useScrollFn";
import { useObserveElement } from "../Pages/useObserveElement";
import { useVirtualizer } from "@tanstack/react-virtual";

const VIRTUAL_ITEM_GAP = 10;
const DEFAULT_HEIGHT = 600;
const EXTRA_HEIGHT = 0;

export const Viewport = ({
  children,
  virtualizerOptions = { overscan: 3 },
  ...props
}: HTMLProps<HTMLDivElement> & {
  virtualizerOptions?: {
    overscan?: number;
  };
}) => {
  const [isVirtualizerReady, setIsVirtualizerReady] = useState(false);

  const viewports = usePDF((state) => state.viewports);
  const numPages = usePDF((state) => state.pdfDocumentProxy.numPages);

  const elementWrapperRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useViewportContainer({
    elementRef: elementRef,
    elementWrapperRef: elementWrapperRef,
    containerRef,
  });

  const setVirtualizer = usePDF((state) => state.setVirtualizer);

  const { scrollToFn } = useScrollFn();
  const { observeElementOffset } = useObserveElement();

  const estimateSize = useCallback(
    (index: number) => {
      if (!viewports || !viewports[index]) return DEFAULT_HEIGHT;
      return viewports[index].height + EXTRA_HEIGHT;
    },
    [viewports],
  );

  const virtualizer = useVirtualizer({
    count: numPages || 0,
    getScrollElement: () => containerRef?.current,
    estimateSize,
    observeElementOffset,
    overscan: virtualizerOptions?.overscan ?? 0,
    scrollToFn,
    gap: VIRTUAL_ITEM_GAP,
  });

  useEffect(() => {
    setVirtualizer(virtualizer);
    setIsVirtualizerReady(true);
  }, [setVirtualizer, virtualizer]);

  return (
    <Primitive.div
      ref={containerRef}
      {...props}
      style={{
        display: "flex",
        justifyContent: "center",
        ...props.style,
        position: "relative",
        overflow: "auto",
      }}
    >
      <div
        ref={elementWrapperRef}
        style={{
          width: "max-content",
        }}
      >
        <div
          ref={elementRef}
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            transformOrigin: "0 0",
            width: "max-content",
            margin: "0 auto",
          }}
        >
          {isVirtualizerReady ? children : null}
        </div>
      </div>
    </Primitive.div>
  );
};
