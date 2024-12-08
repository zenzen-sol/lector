import React, { useState, useEffect, useRef } from "react";

import {
  useFloating,
  useDismiss,
  useInteractions,
  autoUpdate,
} from "@floating-ui/react";

interface SelectionTooltipProps {
  children: React.ReactNode;
}
export const SelectionTooltip = ({ children }: SelectionTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: "bottom",
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  useEffect(() => {
    function handleMouseUp(event: MouseEvent) {
      if (refs.floating.current?.contains(event.target as Element | null)) {
        return;
      }

      setTimeout(() => {
        const selection = window.getSelection();
        const range =
          typeof selection?.rangeCount === "number" && selection.rangeCount > 0
            ? selection.getRangeAt(0)
            : null;

        if (selection?.isCollapsed) {
          setIsOpen(false);
          return;
        }

        if (range) {
          refs.setReference({
            getBoundingClientRect: () => range.getBoundingClientRect(),
            getClientRects: () => range.getClientRects(),
          });
          setIsOpen(true);
        }
      });
    }

    function handleMouseDown(event: MouseEvent) {
      if (refs.floating.current?.contains(event.target as Element | null)) {
        return;
      }

      if (window.getSelection()?.isCollapsed) {
        setIsOpen(false);
      }
    }

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [refs]);

  return (
    <>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
          }}
          {...getFloatingProps()}
        >
          {children}
        </div>
      )}
    </>
  );
};
