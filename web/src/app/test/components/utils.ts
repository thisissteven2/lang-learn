import { NLPGroup, Token } from "./types";

type FrequencyRange = {
	label: string;
	min: number;
	max: number;
};

const ranges: FrequencyRange[] = [
	{ label: "1-100", min: 1, max: 100 },
	{ label: "101-200", min: 101, max: 200 },
	{ label: "201-500", min: 201, max: 500 },
	{ label: "501-1000", min: 501, max: 1000 },
	{ label: "1001-5000", min: 1001, max: 5000 },
	{ label: "5001+", min: 5001, max: Infinity },
];

type CategorizedGroups = {
	[label: string]: Token[];
};

export function groupTokensByFreq(nlp: NLPGroup[]): CategorizedGroups {
	const categorized: CategorizedGroups = {};

	for (const sentence of nlp) {
		for (const token of sentence) {
			const freq = typeof token.freq === "number" ? token.freq : null;
			if (freq === null) continue;

			const range = ranges.find((r) => freq >= r.min && freq <= r.max);
			if (!range) continue;

			if (!categorized[range.label]) {
				categorized[range.label] = [];
			}
			categorized[range.label].push(token);
		}
	}

	return categorized;
}
