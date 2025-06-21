import OpenAI from "openai";

const openrouterClient = new OpenAI({
	apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
	baseURL: "https://openrouter.ai/api/v1",
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
		model: "anthropic/claude-3.5-sonnet-20240620",
		max_tokens: 1800,
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

3. Return only the result in this JSON format, no extra explanation:

${jsonFormatMap[lang]}

Text to analyze:
${text}`,
			},
		],
	});

	return completion.choices[0].message?.content || "{}";
}
