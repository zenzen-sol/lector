import { HighlightArea, HighlightRect, PDFStore } from "@/lib/internal";
import { useCallback } from "react";

interface SelectionDimensions {
  highlights: HighlightArea[];
  text: string;
  isCollapsed: boolean;
}

const CONSTANTS = {
  OVERLAP_THRESHOLD: 2,
  POSITION_THRESHOLD: 1,
  INLINE_MERGE_THRESHOLD: 3,
  MINIMUM_RECT_SIZE: 1,
  FULL_PAGE_WIDTH_THRESHOLD: 90,
  SELECTION_POINT_OFFSET: 1,
} as const;

// Helper functions remain the same
const areRectsOverlapping = (
  rect1: HighlightRect,
  rect2: HighlightRect,
): boolean => {
  const buffer = 0.1;
  return !(
    rect1.left >= rect2.left + rect2.width - buffer ||
    rect2.left >= rect1.left + rect1.width - buffer ||
    rect1.top >= rect2.top + rect2.height - buffer ||
    rect2.top >= rect1.top + rect1.height - buffer
  );
};

const areSimilarRects = (
  rect1: HighlightRect,
  rect2: HighlightRect,
): boolean => {
  const verticallyAligned =
    Math.abs(rect1.top - rect2.top) < CONSTANTS.POSITION_THRESHOLD &&
    Math.abs(rect1.height - rect2.height) < CONSTANTS.POSITION_THRESHOLD;

  const horizontallyClose =
    Math.abs(rect1.left + rect1.width - rect2.left) <
      CONSTANTS.INLINE_MERGE_THRESHOLD ||
    Math.abs(rect2.left + rect2.width - rect1.left) <
      CONSTANTS.INLINE_MERGE_THRESHOLD;

  const horizontallyOverlapping =
    (rect1.left <= rect2.left && rect1.left + rect1.width >= rect2.left) ||
    (rect2.left <= rect1.left && rect2.left + rect2.width >= rect1.left);

  return verticallyAligned && (horizontallyClose || horizontallyOverlapping);
};

const mergeRects = (
  rect1: HighlightRect,
  rect2: HighlightRect,
): HighlightRect => {
  return {
    left: Math.min(rect1.left, rect2.left),
    top: Math.min(rect1.top, rect2.top),
    width: Math.max(
      Math.max(rect1.left + rect1.width, rect2.left + rect2.width) -
        Math.min(rect1.left, rect2.left),
      0,
    ),
    height: Math.max(
      Math.max(rect1.top + rect1.height, rect2.top + rect2.height) -
        Math.min(rect1.top, rect2.top),
      0,
    ),
    pageNumber: rect1.pageNumber,
  };
};

const consolidateRects = (rects: HighlightRect[]): HighlightRect[] => {
  if (rects.length <= 1) return rects;

  const sortedRects = [...rects].sort(
    (a, b) => a.top - b.top || a.left - b.left,
  );
  let hasChanges = true;
  let currentRects = sortedRects;

  while (hasChanges) {
    hasChanges = false;
    const result: HighlightRect[] = [];
    let currentRect = currentRects[0];

    for (let i = 1; i < currentRects.length; i++) {
      const nextRect = currentRects[i];
      if (
        areRectsOverlapping(currentRect, nextRect) ||
        areSimilarRects(currentRect, nextRect)
      ) {
        currentRect = mergeRects(currentRect, nextRect);
        hasChanges = true;
      } else {
        result.push(currentRect);
        currentRect = nextRect;
      }
    }
    result.push(currentRect);
    currentRects = result;
  }

  return currentRects;
};

export const useSelectionDimensions = () => {
  const store = PDFStore.useContext();

  const isFullPageRect = useCallback(
    (rect: HighlightRect, textLayer: Element): boolean => {
      if (!textLayer) return false;
      const textLayerRect = textLayer.getBoundingClientRect();
      const textLayerWidth = textLayerRect.width;
      const rectWidthPercentage =
        (rect.width * 100) / (textLayerWidth / store.getState().zoom);
      return rectWidthPercentage > CONSTANTS.FULL_PAGE_WIDTH_THRESHOLD;
    },
    [store],
  );

  const getTextLayerFromPoint = useCallback(
    (x: number, y: number): Element | null => {
      const elements = document.elementsFromPoint(x, y);
      return (
        elements.find((element) => element.classList.contains("textLayer")) ||
        null
      );
    },
    [],
  );

  const processClientRect = useCallback(
    (
      clientRect: DOMRect,
      textLayer: Element,
      zoom: number,
    ): HighlightRect | null => {
      if (!textLayer) return null;

      const textLayerRect = textLayer.getBoundingClientRect();
      const pageNumber = parseInt(
        textLayer.getAttribute("data-page-number") || "1",
        10,
      );

      const rect: HighlightRect = {
        width: Math.max(0, clientRect.width / zoom),
        height: Math.max(0, clientRect.height / zoom),
        top: Math.max(0, (clientRect.top - textLayerRect.top) / zoom),
        left: Math.max(0, (clientRect.left - textLayerRect.left) / zoom),
        pageNumber,
      };

      return rect.width > CONSTANTS.MINIMUM_RECT_SIZE &&
        rect.height > CONSTANTS.MINIMUM_RECT_SIZE
        ? rect
        : null;
    },
    [],
  );

  const handleSelectAll = useCallback((): HighlightArea[] => {
    const zoom = store.getState().zoom;
    const highlights: HighlightArea[] = [];

    // Get all text layers in the document
    const textLayers = document.querySelectorAll(".textLayer");

    textLayers.forEach((textLayer) => {
      const pageNumber = parseInt(
        textLayer.getAttribute("data-page-number") || "1",
        10,
      );
      const textLayerRect = textLayer.getBoundingClientRect();

      // Create a single rect for the entire text layer
      const rect: HighlightRect = {
        width: textLayerRect.width / zoom,
        height: textLayerRect.height / zoom,
        top: 0, // Relative to text layer
        left: 0, // Relative to text layer
        pageNumber,
      };

      highlights.push({
        pageNumber,
        rects: [rect],
      });
    });

    return highlights.sort((a, b) => a.pageNumber - b.pageNumber);
  }, [store]);

  const isSelectAll = useCallback((selection: Selection): boolean => {
    // Check if the selection spans multiple pages
    const textLayers = document.querySelectorAll(".textLayer");
    if (!textLayers.length) return false;

    const selectionString = selection.toString().trim();
    if (!selectionString) return false;

    // Get all text content from the document
    let allText = "";
    textLayers.forEach((layer) => {
      allText += (layer.textContent || "").trim();
    });

    // Compare lengths first for performance
    if (selectionString.length !== allText.length) return false;

    // Compare the actual text
    return selectionString === allText;
  }, []);

  const getDimension = useCallback((): SelectionDimensions | undefined => {
    const selection = window.getSelection();

    console.log(selection);
    if (!selection || selection.isCollapsed) {
      return { highlights: [], text: "", isCollapsed: true };
    }

    // Check if this is a "Select All" operation
    if (isSelectAll(selection)) {
      const highlights = handleSelectAll();
      return {
        highlights,
        text: selection.toString().trim(),
        isCollapsed: false,
      };
    }

    const zoom = store.getState().zoom;
    const textLayerMap = new Map<number, HighlightRect[]>();
    const selectedPages = new Set<number>();

    // Process each range in the selection
    for (let rangeIndex = 0; rangeIndex < selection.rangeCount; rangeIndex++) {
      const range = selection.getRangeAt(rangeIndex);
      const clientRects = Array.from(range.getClientRects());

      for (const clientRect of clientRects) {
        if (clientRect.width === 0 || clientRect.height === 0) continue;

        const checkPoints = [
          {
            x: clientRect.left + CONSTANTS.SELECTION_POINT_OFFSET,
            y: clientRect.top + clientRect.height / 2,
          },
          {
            x: clientRect.right - CONSTANTS.SELECTION_POINT_OFFSET,
            y: clientRect.top + clientRect.height / 2,
          },
          {
            x: clientRect.left + clientRect.width / 2,
            y: clientRect.top + CONSTANTS.SELECTION_POINT_OFFSET,
          },
          {
            x: clientRect.left + clientRect.width / 2,
            y: clientRect.bottom - CONSTANTS.SELECTION_POINT_OFFSET,
          },
        ];

        let foundValidTextLayer = false;
        for (const point of checkPoints) {
          const textLayer = getTextLayerFromPoint(point.x, point.y);
          if (textLayer) {
            const pageNumber = parseInt(
              textLayer.getAttribute("data-page-number") || "1",
              10,
            );
            selectedPages.add(pageNumber);

            const rect = processClientRect(clientRect, textLayer, zoom);
            if (rect) {
              if (!textLayerMap.has(pageNumber)) {
                textLayerMap.set(pageNumber, []);
              }
              textLayerMap.get(pageNumber)?.push(rect);
              foundValidTextLayer = true;
              break;
            }
          }
        }

        if (!foundValidTextLayer) {
          const expandedSearchRadius = 10;
          for (let offset = 1; offset <= expandedSearchRadius; offset++) {
            const textLayer = getTextLayerFromPoint(
              clientRect.left + clientRect.width / 2,
              clientRect.top + clientRect.height / 2 + offset,
            );
            if (textLayer) {
              const pageNumber = parseInt(
                textLayer.getAttribute("data-page-number") || "1",
                10,
              );
              selectedPages.add(pageNumber);
              const rect = processClientRect(clientRect, textLayer, zoom);
              if (rect) {
                if (!textLayerMap.has(pageNumber)) {
                  textLayerMap.set(pageNumber, []);
                }
                textLayerMap.get(pageNumber)?.push(rect);
                break;
              }
            }
          }
        }
      }
    }

    const isMultiPageSelection = selectedPages.size > 1;
    const highlights: HighlightArea[] = [];

    const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
    for (const pageNumber of sortedPages) {
      const rects = textLayerMap.get(pageNumber) || [];
      if (rects.length === 0) continue;

      const textLayer = document.querySelector(
        `[data-page-number="${pageNumber}"]`,
      );
      if (!textLayer) continue;

      const filteredRects = isMultiPageSelection
        ? rects.filter((rect) => !isFullPageRect(rect, textLayer))
        : rects;

      if (filteredRects.length > 0) {
        highlights.push({
          pageNumber,
          rects: consolidateRects(filteredRects),
        });
      }
    }

    return {
      highlights,
      text: selection.toString().trim(),
      isCollapsed: false,
    };
  }, [
    store,
    getTextLayerFromPoint,
    processClientRect,
    isFullPageRect,
    isSelectAll,
    handleSelectAll,
  ]);

  return { getDimension };
};
