import { useEffect } from "react";
import { HighlightArea } from "../Highlight";
import { getOffsetForHighlight } from "./utils";
import { Virtualizer } from "@tanstack/react-virtual";
import { useViewport } from "@/lib/viewport";

export interface PagesAPI {
  jumpToPage: (
    pageIndex: number,
    options?: {
      align?: "start" | "center" | "end" | "auto";
      behavior?: "auto" | "smooth";
    },
  ) => void;
  jumpToOffset: (offset: number) => void;
  jumpToHighlightArea: (area: HighlightArea) => void;
}

type UsePagesAPI = {
  virtualizer: Virtualizer<any, any>;
  estimateSize: (index: number) => number;
  setReaderAPI?: (api: PagesAPI) => void;
};

export const usePagesAPI = ({
  estimateSize,
  virtualizer,
  setReaderAPI,
}: UsePagesAPI) => {
  const { setPagesAPI } = useViewport();
  useEffect(() => {
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
      virtualizer.scrollToIndex(pageIndex - 1, finalOptions);
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

      console.log(largestRect);
      const offset = getOffsetForHighlight({
        ...largestRect,
        itemHeight: itemHeight - 10, // accounts for padding top and bottom
        startOffset: startOffset - 5, // accounts for padding on top
      });
      console.log(offset);
      virtualizer.scrollToOffset(offset, {
        align: "start",
        behavior: "smooth",
      });
    };

    const api = {
      jumpToPage,
      jumpToOffset,
      jumpToHighlightArea,
    };

    setPagesAPI?.(api);
    setReaderAPI?.(api);
  }, [virtualizer, setPagesAPI, setReaderAPI]);

  return null;
};
