import { createStore, useStore } from "zustand";
import { createZustandContext } from "./zustand";
import { PageViewport, PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { clamp } from "./viewport/utils";
import { createRef, Ref } from "react";
import { Virtualizer } from "@tanstack/react-virtual";

interface PDFState {
  pdfDocumentProxy: PDFDocumentProxy;

  zoom: number;
  updateZoom: (zoom: number | ((prevZoom: number) => number)) => void;

  isPinching: boolean;
  setIsPinching: (isPinching: boolean) => void;

  currentPage: number;
  setCurrentPage: (pageNumber: number) => void;

  viewports: Array<PageViewport>;
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;

  pageProxies: PDFPageProxy[];

  zoomOptions: {
    minZoom: number;
    maxZoom: number;
  };

  virtualizer: PDFVirtualizer | null;
  setVirtualizer: (virtualizer: PDFVirtualizer) => void;

  getPdfPageProxy: (pageNumber: number) => PDFPageProxy;
}

export type PDFVirtualizer = Virtualizer<any, any>;

export const PDFStore = createZustandContext(
  ({
    pageProxies,
    pdfDocumentProxy,
  }: Pick<PDFState, "pdfDocumentProxy" | "pageProxies">) => {
    return createStore<PDFState>((set, get) => ({
      pdfDocumentProxy,

      zoom: 1,
      zoomOptions: {
        minZoom: 0.5,
        maxZoom: 10,
      },

      viewportRef: createRef<HTMLDivElement>(),
      viewports: [],

      updateZoom: (zoom) => {
        const { minZoom, maxZoom } = get().zoomOptions;
        set((state) => {
          if (typeof zoom === "function") {
            const newZoom = clamp(zoom(state.zoom), minZoom, maxZoom);
            return { zoom: newZoom };
          }
          const newZoom = clamp(zoom, minZoom, maxZoom);
          return { zoom: newZoom };
        });
      },

      currentPage: 1,
      setCurrentPage: (val) => {
        set({
          currentPage: val,
        });
      },

      isPinching: false,
      setIsPinching: (val) => {
        set({
          isPinching: val,
        });
      },

      virtualizer: null,
      setVirtualizer: (val) => {
        set({
          virtualizer: val,
        });
      },

      pageProxies,
      getPdfPageProxy: (pageNumber) => {
        const proxy = get().pageProxies[pageNumber - 1];
        return proxy;
      },
    }));
  },
);

export const usePDF = <T>(selector: (state: PDFState) => T) =>
  useStore(PDFStore.useContext(), selector);
