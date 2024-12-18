"use client";

import {
  CanvasLayer,
  HighlightLayer,
  Page,
  Pages,
  Root,
  Search,
  TextLayer,
} from "@unriddle-ai/pdf-viewer";
import { GlobalWorkerOptions } from "pdfjs-dist";

import "pdfjs-dist/web/pdf_viewer.css";
import { SearchUI } from "./custom-search";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const fileUrl = "/pdf/large.pdf";

const ViewerZoomControl = () => {
  return (
    <Root
      fileURL={fileUrl}
      className='flex bg-gray-50 h-[500px]'
      loader={<div className='p-4'>Loading...</div>}>
      <Search>
        <SearchUI />
      </Search>
      <Pages className='p-4 '>
        <Page>
          <CanvasLayer />
          <TextLayer />
          <HighlightLayer className='bg-yellow-200/70' />
        </Page>
      </Pages>
    </Root>
  );
};

export default ViewerZoomControl;
