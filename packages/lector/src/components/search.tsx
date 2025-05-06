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
			setIsLoading(true);
			const promises = pages.map(async (proxy) => {
				const content = await proxy.getTextContent({
					includeMarkedContent: false,
					disableNormalization: true,
				});

				// --- Restore Normalization Logic Start ---
				let normalizedText = "";
				let lastItem: TextItem | null = null;

				// 1. Filter for actual TextItems with content and transform data
				const textItems = content.items.filter(
					(item): item is TextItem =>
						"str" in item &&
						typeof item.str === "string" &&
						item.str.trim().length > 0 &&
						"transform" in item &&
						Array.isArray(item.transform) &&
						item.transform.length === 6,
				);

				// 2. Sort top-to-bottom (desc Y), then left-to-right (asc X)
				const sortedItems = textItems.sort((a, b) => {
					const aY = a.transform[5];
					const bY = b.transform[5];
					const aX = a.transform[4];
					const bX = b.transform[4];
					const Y_TOLERANCE = 1;
					if (Math.abs(aY - bY) > Y_TOLERANCE) {
						return bY - aY;
					}
					return aX - bX;
				});

				// 3. Iterate and Normalize
				for (const currentItem of sortedItems) {
					const currentStr = currentItem.str;

					if (lastItem) {
						const lastY = lastItem.transform[5];
						const lastX = lastItem.transform[4];
						const lastHeight = lastItem.height || 8;
						const lastWidth = lastItem.width || 0;
						const lastStr = lastItem.str;

						const currentY = currentItem.transform[5];
						const currentX = currentItem.transform[4];

						const LINE_BREAK_THRESHOLD = lastHeight * 0.7;
						const isNewLine = lastY - currentY > LINE_BREAK_THRESHOLD;

						const SPACE_WIDTH_ESTIMATE =
							lastWidth && lastStr.length > 0 ? lastWidth / lastStr.length : 2;
						const HORIZONTAL_GAP_THRESHOLD = SPACE_WIDTH_ESTIMATE * 1.5;
						const isHorizontalGap =
							!isNewLine &&
							lastWidth > 0 &&
							currentX > lastX + lastWidth + HORIZONTAL_GAP_THRESHOLD;

						const shouldAddSpace =
							(isNewLine && !lastStr.endsWith("-")) || isHorizontalGap;

						if (shouldAddSpace) {
							if (!normalizedText.endsWith(" ")) {
								normalizedText += " ";
							}
						}
					}

					normalizedText += currentStr;
					lastItem = currentItem;
				}
				// --- Restore Normalization Logic End ---

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
