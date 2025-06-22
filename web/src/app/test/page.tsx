"use client";
import { Card, Title, Text, Button } from "@tremor/react";
import { getYoutubeSubsData, getYoutubeSubsTranslations, getFullDict, getDictTTS, getHoverDict } from "@/utils/cdn";
import { useState } from "react";
import { SubtitleTabs } from "./components/example";

export default function Page() {
	const [mockJson, setMockJson] = useState(null);
	const handleFetch = async () => {
		try {
			// 1. Get YouTube subtitles
			const subsData = await getYoutubeSubsData("5x178RFs-xw");
			// const data = {
			// 	...subsData,
			// 	data: {
			// 		sourceSubs: {
			// 			...subsData.data.sourceSubs,
			// 			data: {
			// 				...subsData.data.sourceSubs.data,
			// 				nlp: subsData.data.sourceSubs.data.nlp.slice(0, 2),
			// 				subs: subsData.data.sourceSubs.data.subs.slice(0, 2),
			// 			},
			// 		},
			// 	},
			// };
			console.log("YouTube Subs Data:", subsData);
			setMockJson(subsData);

			// 2. Get YouTube subtitle translations
			const subsTranslations = await getYoutubeSubsTranslations("5x178RFs-xw", "en");
			console.log("YouTube Subs Translations:", subsTranslations);

			// 3. Get full dictionary entry
			const fullDict = await getFullDict({
				form: "空调",
				lemma: "",
				sl: "zh-CN",
				tl: "en",
				pos: "NOUN",
				pow: "n",
			});
			console.log("Full Dictionary Entry:", fullDict);

			// 4. Get TTS (audio) blob for a word
			const audioDataUrl = await getDictTTS("zh-CN", "空调");
			console.log("TTS Audio URL:", audioDataUrl);

			const audio = new Audio(audioDataUrl);
			audio.play();

			// 5. Get hover dictionary entry
			const hoverDict = await getHoverDict({
				form: "死",
				lemma: "",
				sl: "zh-CN",
				tl: "en",
				pos: "VERB",
				pow: "n",
			});
			console.log("Hover Dictionary Entry:", hoverDict);
		} catch (err) {
			console.error("Error calling API:", err);
		}
	};

	return (
		<Card className="max-w-3xl mx-auto mt-10 p-6">
			<Title>YouTube Transcript Fetcher</Title>
			<Text className="mb-4">Paste a YouTube URL and select a language to fetch the transcript.</Text>

			<Button onClick={handleFetch} className="mb-4 mr-2">
				Test Api Call
			</Button>

			<SubtitleTabs mockJson={mockJson} />
		</Card>
	);
}
