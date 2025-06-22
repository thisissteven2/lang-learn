import { ranges } from "./hook";
import { NLPGroup, Token } from "./types";

type CategorizedGroups = {
	[label: string]: Token[];
};

export function groupTokensByFreq(nlp: NLPGroup[]): CategorizedGroups {
	const categorized: CategorizedGroups = {};
	const seenForms: Set<string> = new Set();

	for (const sentence of nlp) {
		for (const token of sentence) {
			const freq = typeof token.freq === "number" ? token.freq : null;
			if (freq === null) continue;

			const formText = token.form.text;
			if (seenForms.has(formText)) continue;
			seenForms.add(formText);

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
