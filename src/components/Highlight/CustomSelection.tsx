import { usePDF } from "@/lib/internal";
import { usePDFPageNumber } from "@/lib/pdf/page";
import React from "react";

interface CustomSelectionProps {
  textColor?: string;
  bgColor?: string;
}

export const CustomSelection = ({
  textColor = "#017aff",
  bgColor = "#ebf4ff94",
}: CustomSelectionProps) => {
  const customSelectionRects = usePDF((state) => state.customSelectionRects);

  const pageNumber = usePDFPageNumber();

  const area = customSelectionRects.find(
    (area) => area.pageNumber === pageNumber,
  );

  if (!area || !area.rects.length) return null;

  return (
    <>
      {area.rects.map((rect, index) => (
        <span
          key={index}
          style={{
            position: "absolute",
            top: rect.top,
            left: rect.left,
            height: rect.height,
            width: rect.width,
            pointerEvents: "none",
            zIndex: 30,
            background: textColor,
            mixBlendMode: "color",
          }}
        />
      ))}
      {area.rects.map((rect, index) => (
        <span
          key={`bg-${index}`}
          style={{
            position: "absolute",
            top: rect.top,
            left: rect.left,
            height: rect.height,
            width: rect.width,
            pointerEvents: "none",
            background: bgColor,
            mixBlendMode: "multiply",
          }}
        />
      ))}
    </>
  );
};
