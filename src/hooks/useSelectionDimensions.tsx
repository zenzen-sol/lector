import { HighlightArea } from "@/components";
import { HighlightRect } from "@/components/Highlight";
import { useEffect, useState } from "react";

interface SelectionRect {
  width: number;
  height: number;
  top: number;
  left: number;
  pageNumber: number;
  textLayerElement: Element;
}

export const useSelectionDimensions = () => {
  const getDimension = () => {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const highlights: HighlightArea[] = [];
    const textLayerMap = new Map<number, HighlightRect[]>();

    // Get all client rects for the range
    const clientRects = Array.from(range.getClientRects());

    clientRects.forEach((clientRect) => {
      // Find the text layer for this rect
      const element = document.elementFromPoint(
        clientRect.left + clientRect.width / 2,
        clientRect.top + clientRect.height / 2,
      );

      const textLayer = element?.closest(".textLayer");
      if (!textLayer) return;

      const pageNumber = parseInt(
        textLayer.getAttribute("data-page-number") || "1",
        10,
      );
      const textLayerRect = textLayer.getBoundingClientRect();

      const rect: HighlightRect = {
        width: clientRect.width,
        height: clientRect.height,
        // Calculate position relative to the text layer
        top: clientRect.top - textLayerRect.top,
        left: clientRect.left - textLayerRect.left,
        pageNumber,
      };

      if (!textLayerMap.has(pageNumber)) {
        textLayerMap.set(pageNumber, []);
      }
      textLayerMap.get(pageNumber)?.push(rect);
    });

    // Convert map to array of HighlightAreas
    textLayerMap.forEach((rects, pageNumber) => {
      highlights.push({
        pageNumber,
        rects: rects.sort((a, b) => a.top - b.top || a.left - b.left),
      });
    });

    // Sort highlights by page number
    highlights.sort((a, b) => a.pageNumber - b.pageNumber);

    return {
      highlights,
      text: range.toString().trim(),
      isCollapsed: false,
    };
  };

  return { getDimension };
};
