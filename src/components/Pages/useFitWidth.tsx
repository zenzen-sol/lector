import { usePDF } from "@/lib/internal";
import { getFitWidthZoom } from "@/lib/zoom";
import React, { useEffect, useLayoutEffect } from "react";

interface UseFitWidth {
  viewportRef: React.RefObject<HTMLDivElement>;
}
export const useFitWidth = ({ viewportRef }: UseFitWidth) => {
  const viewports = usePDF((state) => state.viewports);
  const zoomOptions = usePDF((state) => state.zoomOptions);

  const isFitWidth = usePDF((state) => state.isZoomFitWidth);
  const updateZoom = usePDF((state) => state.updateZoom);

  useLayoutEffect(() => {
    if (viewportRef.current === null || !isFitWidth) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === viewportRef.current) {
          const containerWidth = entry.contentRect.width;
          const newZoom = getFitWidthZoom(
            containerWidth,
            viewports,
            zoomOptions,
          );
          updateZoom(newZoom);
        }
      }
    });

    resizeObserver.observe(viewportRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isFitWidth, viewports, zoomOptions]);

  return null;
};
