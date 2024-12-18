"use client";

import { CanvasLayer, Page, Pages, Root } from "@unriddle-ai/pdf-viewer";
import React from "react";

const fileUrl = "/pdf/pathways.pdf";

import "pdfjs-dist/web/pdf_viewer.css";
import { GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const Basic = () => {
  return (
    <Root
      fileURL={fileUrl}
      className='bg-gray-100 border rounded-md overflow-hidden relative h-[500px]'
      loader={<div className='p-4'>Loading...</div>}>
      <Pages className='p-4 h-full'>
        <Page>
          <CanvasLayer />
        </Page>
      </Pages>
    </Root>
  );
};

export default Basic;
