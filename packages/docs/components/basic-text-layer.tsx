"use client";

import { CanvasLayer, Page, Pages, Root, TextLayer } from "@unriddle-ai/lector";
import "@/lib/setup";

const fileUrl = "/pdf/large.pdf";

const BasicTextLayer = () => {
  return (
    <Root
      fileURL={fileUrl}
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

export default BasicTextLayer;
