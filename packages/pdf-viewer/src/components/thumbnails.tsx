import { cloneElement, type HTMLProps, type ReactElement } from "react";
import { usePDFJump } from "../hooks/pages/usePdfJump";
import { Primitive } from "./primitive";
import { usePdf } from "../internal";
import { useThumbnail } from "../hooks/useThumbnail";

export const Thumbnail = ({
  pageNumber = 1,
  ...props
}: HTMLProps<HTMLCanvasElement> & { pageNumber?: number }) => {
  const { canvasRef, simpleRef, visible } = useThumbnail(
    pageNumber,
    pageNumber < 5,
  );
  const { jumpToPage } = usePDFJump();

  return (
    <div ref={simpleRef} style={{ minHeight: "150px", minWidth: "10px" }}>
      {visible && (
        <Primitive.canvas
          {...props}
          role="button"
          tabIndex={0}
          onClick={(e: any) => {
            if (props.onClick) {
              props.onClick(e);
            }

            jumpToPage(pageNumber, { behavior: "auto" });
          }}
          onKeyDown={(e: any) => {
            if (props.onKeyDown) {
              props.onKeyDown(e);
            }

            if (e.key === "Enter") {
              jumpToPage(pageNumber, { behavior: "auto" });
            }
          }}
          ref={canvasRef}
        />
      )}
    </div>
  );
};

export const Thumbnails = ({
  children,
  ...props
}: HTMLProps<HTMLDivElement> & {
  children: ReactElement<typeof Thumbnail>;
}) => {
  const pageCount = usePdf((state) => state.pdfDocumentProxy.numPages);

  return (
    <Primitive.div {...props}>
      {Array.from({
        length: pageCount,
      }).map((_, index) => {
        //@ts-expect-error pageNumber is not a valid react key
        return cloneElement(children, { key: index, pageNumber: index + 1 });
      })}
    </Primitive.div>
  );
};
