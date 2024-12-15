import { useEffect, useRef } from "react";
import { usePdf } from "../internal";
import { useDPR } from "./viewport/useDPR";
import { cancellable } from "../lib/cancellable";
import { useVisibility } from "./useVisibility";
import { useDebounce } from "use-debounce";

export const useThumbnail = (
  pageNumber: number,

  isFirstPage = false,
) => {
  const pageProxy = usePdf((state) => state.getPdfPageProxy(pageNumber));

  const simpleRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { visible } = useVisibility({
    elementRef: simpleRef,
  });

  const [debouncedVisible] = useDebounce(visible, 50);
  const dpr = useDPR();

  const { maxHeight, maxWidth } = Object.assign(
    {
      maxHeight: 800,
      maxWidth: 400,
    },
    {},
  );

  const forcedVisible = isFirstPage ? true : debouncedVisible;

  useEffect(() => {
    const { cancel } = cancellable(
      (async () => {
        //TODO: opitimize this for thumbnails add virtualization too
        if (!canvasRef.current) {
          return;
        }

        const page = pageProxy;
        const viewport = page.getViewport({ scale: 1 });

        const smallestScale = Math.min(
          maxWidth / viewport.width,
          maxHeight / viewport.height,
        );

        const scale = smallestScale * (forcedVisible ? dpr : 0.5);

        const viewportScaled = page.getViewport({ scale });

        const canvas = canvasRef.current;

        if (!canvas) return;

        canvas.width = viewportScaled.width;
        canvas.height = viewportScaled.height;

        const renderingTask = page.render({
          canvasContext: canvasRef.current.getContext("2d")!,
          viewport: viewportScaled,
        });

        void renderingTask.promise;
      })(),
    );

    return () => {
      cancel();
    };
  }, [pageNumber, pageProxy, forcedVisible]);

  return {
    canvasRef,
    simpleRef,
    visible: forcedVisible,
  };
};
