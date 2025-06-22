/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { ApiResponse, Subtitle } from "./types";
import { groupTokensByFreq } from "./utils";

function getFrequencyRangeLabel(freq: number): string | null {
	if (!freq) return null;

	if (typeof freq !== "number") {
		const parsed = parseInt(freq as any);
		if (isNaN(parsed)) return null;
		freq = parsed;
	}

	if (freq <= 0) return null;

	if (freq <= 100) return "1-100";
	if (freq <= 200) return "101-200";
	if (freq <= 500) return "201-500";
	if (freq <= 1000) return "501-1000";
	if (freq <= 5000) return "1001-5000";
	return "5001+";
}

export function useParsedSubsData(apiResponse: ApiResponse | null) {
	return useMemo(() => {
		if (!apiResponse || apiResponse.status !== "success") {
			return {
				categorizedGroups: {},
				subtitles: [],
				haveWordFrequency: false,
			};
		}

		const sourceData = apiResponse.data.sourceSubs.data;
		const nlpGroups = sourceData.nlp; // NLPGroup[] = Token[][]
		const plainSubs = sourceData.subs;

		const categorizedGroups = groupTokensByFreq(nlpGroups);

		// Attach tokens to subtitles based on index
		const enrichedSubtitles = plainSubs.map((sub: Subtitle, i: number) => {
			const tokens = (nlpGroups[i] || []).map((token) => ({
				...token,
				freqRange: getFrequencyRangeLabel(
					typeof token.freq === "number" ? token.freq : parseInt(token.diocoFreq as string) || 0
				),
			}));

			return { ...sub, tokens };
		});

		return {
			categorizedGroups,
			subtitles: enrichedSubtitles,
			haveWordFrequency: sourceData.haveWordFrequency,
		};
	}, [apiResponse]);
}
