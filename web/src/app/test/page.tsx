"use client";
import { Card, Title, Text, Button } from "@tremor/react";
import { getYoutubeSubsData, getYoutubeSubsTranslations, getFullDict, getDictTTS, getHoverDict } from "@/utils/cdn";
import { SubtitleTabs } from "./components/example";
import { useQuery } from "@tanstack/react-query";

// chinese: 5x178RFs-xw
// japanese: iC8v6Y87vik
// korean: rZUfAQn1icM
// spanish: NHD9_zCNEtM
export default function Page() {
	const videoId = "NHD9_zCNEtM";

	const { data: subsData, isLoading: isSubsDataLoading } = useQuery({
		queryKey: ["subsData", videoId],
		queryFn: () => getYoutubeSubsData(videoId),
	});

	const { data: subsTranslations, isLoading: isSubsTranslationsLoading } = useQuery({
		queryKey: ["subsTranslations", videoId],
		queryFn: () => getYoutubeSubsTranslations(videoId),
	});

	const handleFetch = async () => {
		try {
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

			<SubtitleTabs
				videoId={videoId}
				subsData={subsData}
				subsTranslations={subsTranslations?.data}
				isLoading={isSubsDataLoading && isSubsTranslationsLoading}
			/>
		</Card>
	);
}
