"use client";

import React from "react";
import { Root, Pages, Page, CanvasLayer, TextLayer } from "@unriddle-ai/pdf-viewer";
import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const fileURL = "/pdf/pathways.pdf";

export const Basic = () => {
  return (
    <Root
      fileURL={fileURL}
      className='bg-gray-100 border rounded-md overflow-hidden relative h-[500px]'
      loader={<div className='p-4'>Loading...</div>}>
      <Pages className='p-4 h-full'>
        <Page>
          <CanvasLayer />
          <TextLayer />
        </Page>
      </Pages>
    </Root>
  );
};
