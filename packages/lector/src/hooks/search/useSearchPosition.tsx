import type { PDFPageProxy } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

import type { HighlightRect } from "../../internal";
import type { SearchResult } from "./useSearch";

interface TextPosition {
	pageNumber: number;
	text: string;
	matchIndex: number;
	searchText?: string; // Optional parameter to specify the exact search text to highlight
}

/**
 * Calculates the highlight rectangles for a given text match.
 *
 * @param pageProxy - The PDF page proxy object
 * @param textMatch - An object containing:
 *   - pageNumber: The page number where the match is found
 *   - text: The text content containing the match (usually a larger chunk of text)
 *   - matchIndex: The index within the text where the match starts
 *   - searchText: (Optional) The exact search term to highlight. If provided, only highlights
 *                 this exact term instead of the entire text. If not provided, highlights the full text.
 * @returns An array of HighlightRect objects representing the areas to highlight
 */
export async function calculateHighlightRects(
	pageProxy: PDFPageProxy,
	textMatch: TextPosition,
): Promise<HighlightRect[]> {
	const { pageNumber, matchIndex, searchText, text: contextText } = textMatch;
	const termToFind = searchText || contextText;
	const matchLength = termToFind?.length;

	if (matchIndex === undefined || matchIndex < 0 || !matchLength) {
		console.warn(
			"[calculateHighlightRects] Invalid matchIndex or zero matchLength provided.",
			{ matchIndex, matchLength },
		);
		return [];
	}

	const textContent = await pageProxy.getTextContent({
		disableNormalization: true,
	});
	const items = textContent.items.filter(
		(item): item is TextItem =>
			"str" in item &&
			typeof item.str === "string" &&
			item.str.trim().length > 0 &&
			"transform" in item &&
			Array.isArray(item.transform) &&
			item.transform.length === 6,
	);

	const sortedItems = items.sort((a, b) => {
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

	let startItemIndex = -1;
	let startIndexInItemRaw = -1;
	let normalizedCharCount = 0;
	let lastItem: TextItem | null = null;

	for (let i = 0; i < sortedItems.length; i++) {
		const currentItem = sortedItems[i];
		if (!currentItem) continue;
		const currentItemStrRaw = currentItem.str;

		let spaceToAdd = "";
		if (lastItem) {
			const lastY = lastItem.transform[5];
			const lastHeight = lastItem.height || 8;
			const lastStrRaw = lastItem.str;
			const currentY = currentItem.transform[5];
			const LINE_BREAK_THRESHOLD = lastHeight * 0.7;
			const isNewLine = lastY - currentY > LINE_BREAK_THRESHOLD;

			if (isNewLine && !lastStrRaw.endsWith("-")) {
				spaceToAdd = " ";
			}
		}

		const spaceLen = spaceToAdd.length;
		const itemStrRawLen = currentItemStrRaw.length;

		if (
			matchIndex >= normalizedCharCount &&
			matchIndex < normalizedCharCount + spaceLen + itemStrRawLen
		) {
			startItemIndex = i;

			const offsetNeededNormalized = matchIndex - normalizedCharCount;

			if (offsetNeededNormalized < spaceLen) {
				startIndexInItemRaw = 0;
				console.warn(
					"[calculateHighlightRects] Match start index fell within an inferred space. Highlighting starts at beginning of the raw item string.",
				);
			} else {
				startIndexInItemRaw = offsetNeededNormalized - spaceLen;
			}
			break;
		}

		normalizedCharCount += spaceLen + itemStrRawLen;
		lastItem = currentItem;
	}

	if (startItemIndex === -1) {
		console.warn(
			`[calculateHighlightRects] Could not map normalized matchIndex ${matchIndex} to a raw text item. Total normalized chars: ${normalizedCharCount}`,
		);
		return [];
	}

	const matchRects: HighlightRect[] = [];
	let remainingMatchLength = matchLength;
	const viewport = pageProxy.getViewport({ scale: 1 });

	for (
		let i = startItemIndex;
		i < sortedItems.length && remainingMatchLength > 0;
		i++
	) {
		const item = sortedItems[i];
		if (!item) continue;
		const itemStr = item.str;
		const itemLength = itemStr.length;

		let lengthToHighlightInItemRaw = 0;
		let offsetInItemRaw = 0;

		if (i === startItemIndex) {
			offsetInItemRaw = startIndexInItemRaw;
			lengthToHighlightInItemRaw = Math.min(
				itemLength - startIndexInItemRaw,
				remainingMatchLength,
			);
		} else {
			offsetInItemRaw = 0;
			lengthToHighlightInItemRaw = Math.min(itemLength, remainingMatchLength);
		}

		if (lengthToHighlightInItemRaw <= 0) continue;

		const transform = item.transform;
		const itemWidth = item.width || 0;
		const itemHeight = item.height || 0;
		const y = viewport.height - (transform[5] + itemHeight);
		const widthPerChar = itemLength > 0 ? itemWidth / itemLength : 0;
		const highlightX = transform[4] + offsetInItemRaw * widthPerChar;
		const highlightWidth = lengthToHighlightInItemRaw * widthPerChar;

		if (itemWidth > 0 && itemHeight > 0 && highlightWidth > 0) {
			const rect: HighlightRect = {
				pageNumber: pageNumber,
				left: highlightX,
				top: y,
				width: highlightWidth,
				height: itemHeight,
			};
			matchRects.push(rect);
		}

		remainingMatchLength -= lengthToHighlightInItemRaw;
	}

	return mergeAdjacentRects(matchRects);
}

function mergeAdjacentRects(rects: HighlightRect[]): HighlightRect[] {
	if (rects.length <= 1) return rects;

	const merged: HighlightRect[] = [];
	let current = rects[0];

	if (!current) return rects;

	for (let i = 1; i < rects.length; i++) {
		const next = rects[i];

		if (!next) continue;
		if (
			Math.abs(current.top - next.top) < 2 &&
			Math.abs(current.height - next.height) < 2
		) {
			current = {
				...current,
				width: next.left + next.width - current.left,
			};
		} else {
			merged.push(current);
			current = next;
		}
	}
	merged.push(current);

	return merged;
}

export async function processSearchResults(
	result: SearchResult,
	pageProxy: PDFPageProxy,
	searchText?: string,
) {
	const searchTermToHighlight =
		searchText || (result as { searchText?: string }).searchText;

	const highlights = await calculateHighlightRects(pageProxy, {
		pageNumber: result.pageNumber,
		text: result.text,
		matchIndex: result.matchIndex,
		searchText: searchTermToHighlight,
	});

	return {
		...result,
		highlights,
	};
}
