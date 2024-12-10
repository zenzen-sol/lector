import { useCallback } from "react";
import { usePDF } from "../internal";

export const useFitWidth = () => {
  const { viewports, viewportRef, minZoom, maxZoom, updateZoom } = usePDF(
    (state) => ({
      viewports: state.viewports,
      viewportRef: state.viewportRef,
      minZoom: state.zoomOptions.minZoom,
      maxZoom: state.zoomOptions.maxZoom,
      updateZoom: state.updateZoom,
    }),
  );
  const fitToWidth = useCallback(() => {
    if (!viewportRef?.current || !viewports || viewports.length === 0) {
      return;
    }

    // Get the container width
    const containerWidth = viewportRef.current.clientWidth;

    // Get the widest page viewport
    const maxPageWidth = Math.max(
      ...viewports.map((viewport) => viewport.width),
    );

    // Calculate the zoom level needed to fit the width
    // Subtract some padding (40px) to ensure there's a small margin
    const targetZoom = containerWidth / maxPageWidth;

    // Ensure the zoom level stays within bounds
    const clampedZoom = Math.min(Math.max(targetZoom, minZoom), maxZoom);

    updateZoom(clampedZoom);
  }, [viewports, viewportRef, minZoom, maxZoom]);

  return { fitToWidth };
};
