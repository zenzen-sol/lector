import { HighlightArea, usePDF } from "./internal";

export const usePDFJump = () => {
  const virtualizer = usePDF((state) => state.getVirtualizer());
  const setHighlight = usePDF((state) => state.setHighlight);

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

    setHighlight([area]);

    // Get the start offset of the page in the viewport
    const pageOffset = virtualizer.getOffsetForIndex(area.pageNumber - 1);
    if (pageOffset === null) return;

    // Find the target highlight rect (usually the first one)
    const targetRect = area.rects[0];

    // Calculate absolute scroll position:
    // Page offset + highlight's position within the page
    const isNumber = pageOffset?.[0] != null;

    if (!isNumber) return;

    const scrollOffset = (pageOffset[0] ?? 0) + targetRect.top;

    // Adjust for padding
    const adjustedOffset = Math.max(0, scrollOffset);

    virtualizer.scrollToOffset(adjustedOffset, {
      align: "start",
      behavior: "smooth",
    });
  };

  return { jumpToPage, jumpToOffset, jumpToHighlightArea };
};
