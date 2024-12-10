import { useSearch } from "@/lib/search/useSearch";
import { useEffect } from "react";

export const Search = () => {
  const { triggerTextRetrieval } = useSearch((state) => state);
};
