import { HighlightArea, usePDF } from "@/lib/internal";
import { usePDFPageNumber } from "@/lib/pdf/page";
import { Slot } from "@radix-ui/react-slot";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

interface HighlightLayerProps extends ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

export const HighlightLayer = forwardRef<
  ElementRef<"div">,
  HighlightLayerProps
>(({ asChild, className, style, ...props }, ref) => {
  const pageNumber = usePDFPageNumber();
  const highlights = usePDF((state) => state.highlights);

  const Comp = asChild ? Slot : "div";

  const area = highlights.find((area) => area.pageNumber === pageNumber);

  if (!area || !area.rects.length) return null;

  return (
    <>
      {area.rects.map((rect, index) => (
        <Comp
          ref={ref}
          key={`highlight-${pageNumber}-${index}`}
          className={className}
          style={{
            position: "absolute",
            top: rect.top,
            left: rect.left,
            height: rect.height,
            width: rect.width,
            pointerEvents: "none",
            ...style,
          }}
          {...props}
        >
          {props.children}
        </Comp>
      ))}
    </>
  );
});

HighlightLayer.displayName = "HighlightLayer";
