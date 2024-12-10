import { HighlightArea } from "@/components";
import { usePDF } from "./internal";
import { getOffsetForHighlight } from "@/components/Pages/utils";

export const usePDFJump = () => {
  const virtualizer = usePDF((state) => state.virtualizer);

  const jumpToPage = (
    pageIndex: number,
    options?: {
      align?: "start" | "center" | "end" | "auto";
      behavior?: "auto" | "smooth";
    },
  ) => {
    if (!virtualizer) return;

    // Define default options
    const defaultOptions = {
      align: "start",
      behavior: "smooth",
    };

    // Merge default options with any provided options

    const finalOptions = { ...defaultOptions, ...options };
    virtualizer.scrollToIndex(pageIndex - 1, finalOptions as any);
  };

  const jumpToOffset = (offset: number) => {
    if (!virtualizer) return;
    virtualizer.scrollToOffset(offset, {
      align: "start",
      behavior: "smooth",
    });
  };

  const jumpToHighlightArea = (area: HighlightArea) => {
    if (!virtualizer) return;

    const startOffset = virtualizer.getOffsetForIndex?.(
      area.pageNumber,
      "start",
    )?.[0];

    if (startOffset == null) return;

    const estimateSize = virtualizer.options.estimateSize;
    const itemHeight = estimateSize(area.pageNumber);

    const largestRect = area.rects.reduce((a, b) => {
      return a.height > b.height ? a : b;
    });

    const offset = getOffsetForHighlight({
      ...largestRect,
      itemHeight: itemHeight - 10, // accounts for padding top and bottom
      startOffset: startOffset - 5, // accounts for padding on top
    });
    virtualizer.scrollToOffset(offset, {
      align: "start",
      behavior: "smooth",
    });
  };

  return { jumpToPage, jumpToOffset, jumpToHighlightArea };
};
