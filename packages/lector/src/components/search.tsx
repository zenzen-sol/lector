import type { PDFPageProxy } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
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
				"[Search Component] [002] getTextContent called for initial text extraction and normalization.",
			);
			setIsLoading(true);
			const promises = pages.map(async (proxy) => {
				const content = await proxy.getTextContent({
					includeMarkedContent: true,
					disableNormalization: true,
				});

				let normalizedText = "";
				let lastY = Number.NEGATIVE_INFINITY;
				let lastX = Number.NEGATIVE_INFINITY;
				let lastItemStr = "";

				const sortedItems = content.items
					.filter(
						(item): item is TextItem => "transform" in item && "str" in item,
					)
					.sort((a, b) => {
						const yDiff = a.transform[5] - b.transform[5];
						if (Math.abs(yDiff) > 1) {
							return yDiff;
						}
						return a.transform[4] - b.transform[4];
					});

				for (const item of sortedItems) {
					const currentStr = item.str || "";
					if (!currentStr.trim()) continue;

					const currentY = item.transform[5];
					const currentX = item.transform[4];

					const isNewLine = currentY > lastY + (item.height || 5);

					if (
						isNewLine &&
						lastItemStr &&
						!lastItemStr.endsWith("-") &&
						!currentStr.startsWith(" ")
					) {
						normalizedText += " ";
					} else if (
						!isNewLine &&
						lastItemStr &&
						currentX > lastX + 1 &&
						!lastItemStr.endsWith(" ") &&
						!currentStr.startsWith(" ")
					) {
						// Optional: Add space for horizontal gaps on the same line
						// Might need tuning based on typical spacing vs word gaps
						// normalizedText += " ";
					}

					normalizedText += currentStr;

					lastY = currentY;
					lastX = currentX;
					lastItemStr = currentStr.trimEnd();
				}

				return Promise.resolve({
					pageNumber: proxy.pageNumber,
					text: normalizedText.trim(),
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
