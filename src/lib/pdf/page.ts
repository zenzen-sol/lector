import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { usePDFDocument } from "./document";
import { cancellable } from "./utils";
import { useViewport } from "../viewport";

export const usePDFPageContext = (pageNumber: number) => {
  const { pageProxies } = useViewport();

  const pageProxy = useMemo(() => {
    if (!pageProxies) return null;

    return pageProxies?.[pageNumber - 1];
  }, []);

  const getPDFPageProxy = useCallback(() => {
    if (!pageProxy) {
      throw new Error("PDF page not loaded");
    }

    return pageProxy;
  }, [pageProxy]);

  return {
    context: {
      get pdfPageProxy() {
        return getPDFPageProxy();
      },
      pageNumber,
    } satisfies PDFPageContextType,
    pdfPageProxy: pageProxy,
  };
};

export interface PDFPageContextType {
  pageNumber: number;
  pdfPageProxy: PDFPageProxy;
}

export const defaultPDFPageContext: PDFPageContextType = {
  get pdfPageProxy(): PDFPageProxy {
    throw new Error("PDF page not loaded");
  },
  pageNumber: 0,
} satisfies PDFPageContextType;

export const PDFPageContext = createContext(defaultPDFPageContext);

export const usePDFPage = () => {
  return useContext(PDFPageContext);
};
