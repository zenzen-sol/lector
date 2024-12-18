"use client";
import {
  AnnotationLayer,
  CanvasLayer,
  Page,
  Pages,
  Root,
  TextLayer,
} from "@unriddle-ai/pdf-viewer";
import React from "react";

import "pdfjs-dist/web/pdf_viewer.css";
import { GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const fileUrl = "/pdf/form.pdf";
const PdfFormLayer = () => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formData = new FormData(e.target as any);
        const values = Object.fromEntries(formData.entries());

        alert(`Form values:\n${JSON.stringify(values, null, 2)}`);
      }}>
      <button type='submit'>Get form values</button>
      <Root
        fileURL={fileUrl}
        className='bg-gray-100 border rounded-md overflow-hidden relative h-[500px]'
        loader={<div className='p-4'>Loading...</div>}>
        <Pages className='p-4 h-full'>
          <Page>
            <CanvasLayer />
            <TextLayer />
            <AnnotationLayer />
          </Page>
        </Pages>
      </Root>
    </form>
  );
};

export default PdfFormLayer;
