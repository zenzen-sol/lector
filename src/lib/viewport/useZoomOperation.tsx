import { PageViewport } from "pdfjs-dist";
import { useViewport, ViewportContextType } from "./useViewport";

export const ZoomOperations = {
  fitToWidth: (
    viewportRef: React.RefObject<HTMLDivElement>,
    viewports: Array<PageViewport> | null,
    minZoom: number,
    maxZoom: number,
  ): number => {
    if (!viewportRef?.current || !viewports || viewports.length === 0) {
      return 1; // Default zoom if we can't calculate
    }

    const containerWidth = viewportRef.current.clientWidth;
    const maxPageWidth = Math.max(
      ...viewports.map((viewport) => viewport.width),
    );

    const targetZoom = containerWidth / maxPageWidth;

    // Clamp zoom level
    return Math.min(Math.max(targetZoom, minZoom), maxZoom);
  },

  zoomIn: (currentZoom: number, maxZoom: number): number => {
    return Math.min(currentZoom * 1.25, maxZoom);
  },

  zoomOut: (currentZoom: number, minZoom: number): number => {
    return Math.max(currentZoom * 0.8, minZoom);
  },

  resetZoom: (): number => {
    return 1;
  },

  // Custom zoom level with bounds checking
  setCustomZoom: (zoom: number, minZoom: number, maxZoom: number): number => {
    return Math.min(Math.max(zoom, minZoom), maxZoom);
  },
};

// Higher-order function to create bound zoom operations
export const createBoundZoomOperations = (context: ViewportContextType) => ({
  fitToWidth: () => {
    const newZoom = ZoomOperations.fitToWidth(
      context.viewportRef!,
      context.viewports,
      context.minZoom,
      context.maxZoom,
    );
    context.setZoom(newZoom);
    return newZoom;
  },

  zoomIn: () => {
    const newZoom = ZoomOperations.zoomIn(context.zoom, context.maxZoom);
    context.setZoom(newZoom);
    return newZoom;
  },

  zoomOut: () => {
    const newZoom = ZoomOperations.zoomOut(context.zoom, context.minZoom);
    context.setZoom(newZoom);
    return newZoom;
  },

  resetZoom: () => {
    const newZoom = ZoomOperations.resetZoom();
    context.setZoom(newZoom);
    return newZoom;
  },

  setCustomZoom: (zoom: number) => {
    const newZoom = ZoomOperations.setCustomZoom(
      zoom,
      context.minZoom,
      context.maxZoom,
    );
    context.setZoom(newZoom);
    return newZoom;
  },
});

// Hook to use zoom operations
export const useZoomOperations = () => {
  const context = useViewport();
  return createBoundZoomOperations(context);
};
