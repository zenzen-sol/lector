import { useGesture } from "@use-gesture/react";
import {
  createContext,
  createRef,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { PageViewport } from "pdfjs-dist//types/src/display/display_utils";
import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { clamp, firstMemo } from "./utils";
import { PagesAPI } from "@/components";

export const useVisibility = ({
  elementRef,
}: {
  elementRef: RefObject<HTMLElement>;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    });

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [elementRef.current]);

  return { visible };
};

export const useDPR = () => {
  const [dpr, setDPR] = useState(
    !window ? 1 : Math.min(window.devicePixelRatio, 2),
  );

  useEffect(() => {
    if (!window) {
      return;
    }

    const handleDPRChange = () => {
      setDPR(window.devicePixelRatio);
    };

    const windowMatch = window.matchMedia(
      `screen and (min-resolution: ${dpr}dppx)`,
    );

    windowMatch.addEventListener("change", handleDPRChange);

    return () => {
      windowMatch.removeEventListener("change", handleDPRChange);
    };
  }, []);

  return dpr;
};

export interface ViewportContextType {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  setZoom: (zoom: number | ((prevZoom: number) => number)) => void;
  translateX: number;
  setTranslateX: (
    translateX: number | ((prevTranslateX: number) => number),
  ) => void;
  translateY: number;
  setTranslateY: (
    translateY: number | ((prevTranslateY: number) => number),
  ) => void;
  pages: Map<number, { containerRef: RefObject<HTMLDivElement> }>;
  setPageRef: (
    pageNumber: number,
    containerRef: RefObject<HTMLDivElement>,
  ) => void;
  currentPage: number;
  setCurrentPage: (pageNumber: number) => void;
  setViewportRef: (ref: RefObject<HTMLDivElement>) => void;
  viewportRef: RefObject<HTMLDivElement> | undefined;
  zoomRef: RefObject<number>;
  isPinching: boolean;
  setIsPinching: (isPinching: boolean) => void;
  viewports: Array<PageViewport> | null;
  pageProxies: Array<PDFPageProxy> | null;
  isViewportsReady: boolean;
  pagesAPI: PagesAPI | null;
  setPagesAPI: (api: PagesAPI) => void;
}

export const defaultViewportContext = {
  zoom: 1,
  minZoom: 0.5,
  maxZoom: 10,
  setZoom: () => {
    throw new Error("Viewport context not initialized");
  },
  translateX: 0,
  setTranslateX: () => {
    throw new Error("Viewport context not initialized");
  },
  translateY: 0,
  setTranslateY: () => {
    throw new Error("Viewport context not initialized");
  },
  pages: new Map(),
  currentPage: 1,
  setCurrentPage() {
    throw new Error("Viewport context not initialized");
  },
  setPageRef() {
    throw new Error("Viewport context not initialized");
  },

  setViewportRef() {
    throw new Error("Viewport context not initialized");
  },
  viewportRef: undefined,
  zoomRef: createRef<number>(),
  isPinching: false,
  setIsPinching() {
    throw new Error("Viewport context not initialized");
  },
  viewports: null,
  pageProxies: null,
  isViewportsReady: false,
  pagesAPI: null,
  setPagesAPI() {
    throw new Error("Viewport context not initialized");
  },
} satisfies ViewportContextType;

export const ViewportContext = createContext<ViewportContextType>(
  defaultViewportContext,
);

interface ViewportProps {
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
  initialRotation?: number;
  pdfDocumentProxy: PDFDocumentProxy | null;
}

export const useViewportContext = ({
  minZoom = 0.5,
  maxZoom = 5,
  defaultZoom = 1,
  initialRotation = 0,
  pdfDocumentProxy,
}: ViewportProps) => {
  const zoomRef = useRef(defaultZoom);
  const [zoom, setZoom] = useState(defaultZoom);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isPinching, setIsPinching] = useState(false);
  const [pagesAPI, setPagesAPI] = useState<PagesAPI | null>(null);

  const pages = useRef(
    new Map<number, { containerRef: RefObject<HTMLDivElement> }>(),
  );

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [viewports, setPageViewports] = useState<Array<PageViewport> | null>(
    null,
  );
  const [pageProxies, setPageProxies] = useState<Array<PDFPageProxy> | null>(
    null,
  );
  const [isViewportsReady, setViewportsReady] = useState(false);

  const [rotation, setRotation] = useState<number>(initialRotation);
  const [defaultRotations, setDefaultRotations] = useState<number[] | null>();

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

    setZoom(clampedZoom);
  }, [viewports, viewportRef, setZoom, minZoom, maxZoom]);

  useEffect(() => {
    fitToWidth();
  }, [fitToWidth]);

  useEffect(() => {
    if (!pdfDocumentProxy) return;

    const pdf = pdfDocumentProxy;

    const calculateViewports = async () => {
      let pageProxies: Array<PDFPageProxy> = [];
      const viewports = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, index) => {
          const page = await pdf.getPage(index + 1);
          // sometimes there is information about the default rotation of the document
          // stored in page.rotate. we need to always add that additional rotaton offset
          const deltaRotate = page.rotate || 0;
          const viewport = page.getViewport({
            scale: 1,
            rotation: rotation + deltaRotate,
          });
          pageProxies.push(page);
          return viewport;
        }),
      );

      const rotations = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, index) => {
          const page = await pdf.getPage(index + 1);
          return page.rotate || 0; // Default to 0 if no rotation metadata
        }),
      );
      setDefaultRotations(rotations);
      setPageViewports(viewports);
      setPageProxies(pageProxies);
      setViewportsReady(true);
    };

    setViewportsReady(false);
    calculateViewports();
  }, [pdfDocumentProxy, rotation]);

  return {
    viewports,
    zoom,
    zoomRef,
    minZoom,
    maxZoom,
    setZoom: (zoom) => {
      setZoom((prevZoom) => {
        if (typeof zoom === "function") {
          const newZoom = clamp(zoom(prevZoom), minZoom, maxZoom);
          zoomRef.current = newZoom;
          return newZoom;
        }
        const newZoom = clamp(zoom, minZoom, maxZoom);
        zoomRef.current = newZoom;
        return newZoom;
      });
    },
    translateX,
    setTranslateX,
    translateY,
    setTranslateY,
    pages: pages.current,
    setPageRef: (pageNumber, containerRef) => {
      pages.current.set(pageNumber, { containerRef });
    },

    pagesAPI,

    currentPage,
    setCurrentPage,

    setViewportRef: (ref) => {
      viewportRef.current = ref.current;
    },
    viewportRef,
    isPinching,
    setIsPinching,
    pageProxies,
    isViewportsReady,
    setPagesAPI,
  } satisfies ViewportContextType;
};

export const useViewport = () => {
  return useContext(ViewportContext);
};

export const usePageViewport = ({
  pageContainerRef,
  pageNumber,
}: {
  pageContainerRef: RefObject<HTMLDivElement>;
  pageNumber: number;
}) => {
  const { setPageRef } = useViewport();

  useEffect(() => {
    setPageRef(pageNumber, pageContainerRef);
  }, [pageNumber, pageContainerRef.current]);
};
