/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from "openai";

const openrouterClient = new OpenAI({
	apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
	baseURL: "https://openrouter.ai/api/v1",
	dangerouslyAllowBrowser: true,
});

const languageMap = {
	ko: "Korean",
	ja: "Japanese",
	zh: "Chinese",
	es: "Spanish",
};

const jsonFormatMap = {
	es: `{
  "nouns": [
    {
      "word": "cultura",
      "translation": "culture",
      "difficulty": 2,
      "sentence": "España tiene una cultura muy rica.",
      "sentence_translation": "Spain has a very rich culture."
    }
  ],
  "verbs": [
    {
      "word": "estudiar",
      "base": "estudiar",
      "translation": "to study",
      "difficulty": 1,
      "sentence": "Me gusta estudiar español.",
      "sentence_translation": "I like studying Spanish."
    }
  ]
}
`,
	ja: `{
  "nouns": [
    {
      "word": "文化",
      "translation": "culture",
      "difficulty": 2,
      "sentence": "日本には豊かな文化があります。",
      "sentence_translation": "Japan has a rich culture."
    }
  ],
  "verbs": [
    {
      "word": "勉強する",
      "base": "勉強する",
      "translation": "to study",
      "difficulty": 1,
      "sentence": "私は日本語を勉強するのが好きです。",
      "sentence_translation": "I like studying Japanese."
    }
  ]
}
`,
	ko: `{
  "nouns": [
    {
      "word": "문화",
      "translation": "culture",
      "difficulty": 2,
      "sentence": "한국은 풍부한 문화를 가지고 있습니다.",
      "sentence_translation": "Korea has a rich culture."
    }
  ],
  "verbs": [
    {
      "word": "공부하다",
      "base": "공부하다",
      "translation": "to study",
      "difficulty": 1,
      "sentence": "나는 한국어 공부하는 것을 좋아해요.",
      "sentence_translation": "I like studying Korean."
    }
  ]
}
`,
	zh: `{
  "nouns": [
    {
      "word": "文化",
      "translation": "culture",
      "difficulty": 2,
      "sentence": "中国有丰富的文化。",
      "sentence_translation": "China has a rich culture."
    }
  ],
  "verbs": [
    {
      "word": "学习",
      "base": "学习",
      "translation": "to study",
      "difficulty": 1,
      "sentence": "我喜欢学习中文。",
      "sentence_translation": "I like studying Chinese."
    }
  ]
}`,
};

export async function analyzeText(lang: keyof typeof languageMap, text: string) {
	const completion = await openrouterClient.chat.completions.create({
		model: "deepseek/deepseek-chat-v3-0324:free",
		max_tokens: 4096,
		messages: [
			{
				role: "user",
				content: `Please analyze the following ${languageMap[lang]} text.

1. Extract vocabulary and group them by part of speech:
   - nouns
   - verbs
   - adjectives
   - adverbs
   - pronouns
   - particles
   - conjunctions

2. For each word, include:
   - word (in ${languageMap[lang]})
   - translation (in English)
   - difficulty (scale 1-5)
   - base (for verbs/adjectives, if possible)
   - sentence (a simple sentence using the word in ${languageMap[lang]})})
   - sentence_translation (English translation of that sentence)

3. Return only the result as **pure JSON**, without markdown or code blocks.
4. Use the following JSON format:

${jsonFormatMap[lang]}

Text to analyze:
${text}`,
			},
		],
	});

	return completion.choices[0].message?.content || "{}";
}

export async function analyzeTextBatch(
	lang: keyof typeof languageMap,
	segments: { start: string; end: string; text: string }[]
) {
	const batchedText = segments.map(({ start, end, text }) => `[${start} - ${end}]\n${text.trim()}\n`).join("\n");

	const completion = await openrouterClient.chat.completions.create({
		model: "deepseek/deepseek-chat-v3-0324:free",
		max_tokens: 60000,
		messages: [
			{
				role: "user",
				content: `Please analyze the following ${languageMap[lang]} text, grouped by timestamp.

1. For each timestamp range, extract and return vocabulary grouped by part of speech:
   - nouns
   - verbs
   - adjectives
   - adverbs
   - pronouns
   - particles
   - conjunctions

2. For each word, include:
   - word
   - translation (to English)
   - difficulty (1–5)
   - base (for verbs/adjectives)
   - sentence (a simple example in ${languageMap[lang]})
   - sentence_translation (English translation)

3. Return result as **pure JSON**, using this structure:
{
  "[start - end]": {
    nouns: [...],
    verbs: [...],
    ...
  }
}

4. Use this as format reference:

${jsonFormatMap[lang]}

Segments:
${batchedText}`,
			},
		],
	});

	const raw = completion.choices[0].message?.content || "";
	const jsonText = extractJSON(raw);

	return JSON.parse(jsonText);
}

function extractJSON(text: string): string {
	if (!text) return "{}";
	const firstBrace = text.indexOf("{");
	const lastBrace = text.lastIndexOf("}");

	if (firstBrace === -1 || lastBrace === -1 || firstBrace > lastBrace) {
		throw new Error("Could not find JSON braces");
	}

	return text.slice(firstBrace, lastBrace + 1).trim();
}

export async function processTranscript(
	lang: keyof typeof languageMap,
	transcript: { start: string; end: string; text: string }[],
	batchSize = 30
) {
	const finalResult: Record<string, any> = {};

	for (let i = 0; i < transcript.length; i += batchSize) {
		const batch = transcript.slice(i, i + batchSize);
		try {
			const result = await analyzeTextBatch(lang, batch);
			console.log(`Processed batch ${i}-${i + batchSize}`, result);
			Object.assign(finalResult, result);
		} catch (err) {
			console.error(`Error in batch ${i}-${i + batchSize}`, err);
		}
	}

	return finalResult;
}

// Sample usage:
// const chunks = [
// 	{
// 		start: "00:00:14",
// 		end: "00:00:16",
// 		text: "哈喽，大家好",
// 	},
// 	{
// 		start: "00:00:16",
// 		end: "00:00:17",
// 		text: "好久不见",
// 	},
// ];

// const vocabAnalysis = await processTranscript("zh", chunks);
// console.log(JSON.stringify(vocabAnalysis, null, 2));
