export const posColorMap: Record<string, string> = {
	NOUN: "text-blue-500",
	VERB: "text-green-500",
	ADJ: "text-red-500",
	ADV: "text-purple-500",
	PRON: "text-amber-600",
	PROPN: "text-yellow-600", // proper noun
	NUM: "text-pink-500", // numerals
	ADP: "text-teal-500", // adpositions (in, on, etc.)
	PART: "text-indigo-500", // particles (e.g. “to” in “to go”)
	CCONJ: "text-cyan-600", // coordinating conjunctions (and, but)
	SCONJ: "text-cyan-800", // subordinating conjunctions (because, although)
	DET: "text-fuchsia-600", // determiners (a, the, some)
	AUX: "text-lime-600", // auxiliary verbs (is, was, will)
	INTJ: "text-rose-500", // interjections (oh, wow)
	SYM: "text-gray-600", // symbols
	X: "text-gray-400", // unknown
	PUNCT: "text-gray-500", // punctuation
};

export const posReadableMap: Record<string, string> = {
	NOUN: "Noun",
	VERB: "Verb",
	ADJ: "Adjective",
	ADV: "Adverb",
	PRON: "Pronoun",
	PROPN: "Proper Noun",
	NUM: "Numeral",
	ADP: "Adposition", // includes prepositions and postpositions
	PART: "Particle",
	CCONJ: "Coordinating Conjunction",
	SCONJ: "Subordinating Conjunction",
	DET: "Determiner",
	AUX: "Auxiliary Verb",
	INTJ: "Interjection",
	SYM: "Symbol",
	X: "Unknown",
	PUNCT: "Punctuation",
};

export const freqColorMap: Record<string, string> = {
	"1-100": "text-red-600",
	"101-200": "text-orange-600",
	"201-500": "text-yellow-600",
	"501-1000": "text-green-600",
	"1001-2000": "text-blue-500",
	"2001-3500": "text-blue-700",
	"3501-5000": "text-blue-800",
	"5001-8000": "text-purple-500",
	"8001+": "text-purple-700",
};

export const LANGUAGES = ["es", "zh-CN", "zh-TW", "ja", "ko"];
