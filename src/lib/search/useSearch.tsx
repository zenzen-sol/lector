import { PDFPageProxy } from "pdfjs-dist";
import { createZustandContext } from "../zustand";
import { createStore, useStore } from "zustand";
import { TextItem } from "pdfjs-dist/types/src/display/api";

interface SearchState {
  textContents: {
    pageNumber: number;
    text: string;
  }[];
  isSearchEnabled: boolean;
  triggerTextRetrieval: (pageProxies: PDFPageProxy[]) => void;
}

const SearchStore = createZustandContext(() => {
  return createStore<SearchState>((set, get) => ({
    textContents: [],

    isSearchEnabled: false,
    triggerTextRetrieval: async (proxies) => {
      const promises = proxies.map(async (proxy) => {
        const content = await proxy.getTextContent();
        const text = content.items
          .map((item) => (item as TextItem)?.str || "")
          .join("");

        return Promise.resolve({
          pageNumber: proxy.pageNumber,
          text,
        });
      });
      const text = await Promise.all(promises);
      set({ textContents: text });
    },
  }));
});

export const useSearch = <T,>(selector: (state: SearchState) => T) =>
  useStore(SearchStore.useContext(), selector);

export default SearchStore;
