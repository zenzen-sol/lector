import { usePDFDocument } from "@/lib/pdf/document";
import { usePDFPage } from "@/lib/pdf/page";
import { ReactNode } from "react";

export type HighlightRect = {
  pageNumber: number;
  top: number;
  left: number;
  height: number;
  width: number;
};

export type HighlightArea = {
  pageNumber: number;
  rects: HighlightRect[];
};

export const HighlightLayer = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const { highlights } = usePDFDocument();
  const { pageNumber } = usePDFPage();

  const area = highlights.find((area) => area.pageNumber === pageNumber);

  if (!area || !area.rects.length) return null;

  return (
    <>
      {area.rects.map((rect, index) => (
        <div
          className={className}
          key={index}
          style={{
            position: "absolute",
            top: rect.top,
            left: rect.left,
            height: rect.height,
            width: rect.width,
            pointerEvents: "none",
          }}
        >
          {children}
        </div>
      ))}
    </>
  );
};
