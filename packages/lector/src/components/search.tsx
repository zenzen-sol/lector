import type { PDFPageProxy } from "pdfjs-dist";
// import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { useCallback, useEffect, useState } from "react";

import { usePdf } from "../internal";

interface SearchProps {
	children: React.ReactNode;
	loading?: React.ReactNode;
}

export const Search = ({ children, loading = "Loading..." }: SearchProps) => {
	const [isLoading, setIsLoading] = useState(false);

	const proxies = usePdf((state) => state.pageProxies);
	const setTextContent = usePdf((state) => state.setTextContent);

	const getTextContent = useCallback(
		async (pages: PDFPageProxy[]) => {
			console.debug(
				"[Search Component] [003] getTextContent - Logging RAW items",
			);
			setIsLoading(true);
			const promises = pages.map(async (proxy) => {
				const content = await proxy.getTextContent({
					includeMarkedContent: true,
					disableNormalization: true,
				});

				if (proxy.pageNumber === 2) {
					console.debug("[Raw Items Page 2]", JSON.stringify(content.items));
				}

				const rawText = content.items
					.map((item) => ("str" in item ? item.str : ""))
					.join("");

				return Promise.resolve({
					pageNumber: proxy.pageNumber,
					text: rawText.trim(),
				});
			});
			const textContentsForStore = await Promise.all(promises);

			setIsLoading(false);
			setTextContent(textContentsForStore);
		},
		[setTextContent],
	);

	useEffect(() => {
		getTextContent(proxies);
	}, [proxies, getTextContent]);

	return isLoading ? loading : children;
};
