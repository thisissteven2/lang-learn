/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Card, Title, Text, TextInput, Button, Select, SelectItem } from "@tremor/react";
import { getYouTubeVideoId } from "@/utils/transcripts";

const LANG_OPTIONS = [
	{ code: "en", label: "English" },
	{ code: "es", label: "Spanish" },
	{ code: "ja", label: "Japanese" },
	{ code: "ko", label: "Korean" },
];

export default function Page() {
	const [url, setUrl] = useState("");
	const [lang, setLang] = useState("en");
	const [transcript, setTranscript] = useState<any>(null);
	const [error, setError] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	const handleFetch = async () => {
		setLoading(true);
		setError(null);
		setTranscript(null);

		const videoId = getYouTubeVideoId(url);
		if (!videoId) {
			setError("Invalid YouTube URL.");
			setLoading(false);
			return;
		}

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_TRANSCRIPTS_URL}/${lang}?videoId=${encodeURIComponent(videoId)}`
			);
			if (!res.ok) throw new Error("Failed to fetch transcript");
			const data = await res.json();
			setTranscript(data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDownload = () => {
		if (!transcript) return;
		const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `transcript_${lang}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<Card className="max-w-3xl mx-auto mt-10 p-6">
			<Title>YouTube Transcript Fetcher</Title>
			<Text className="mb-4">Paste a YouTube URL and select a language to fetch the transcript.</Text>

			<TextInput
				placeholder="Enter YouTube URL"
				value={url}
				onChange={(e) => setUrl(e.target.value)}
				className="mb-4"
			/>

			<Select value={lang} onValueChange={setLang} className="mb-4">
				{LANG_OPTIONS.map((opt) => (
					<SelectItem key={opt.code} value={opt.code}>
						{opt.label}
					</SelectItem>
				))}
			</Select>

			<Button onClick={handleFetch} loading={loading} className="mb-4 mr-2">
				Fetch Transcript
			</Button>

			{error && <Text className="text-red-500 mb-2">❌ {error}</Text>}

			{transcript && (
				<>
					<Button variant="secondary" onClick={handleDownload} className="mb-4">
						Download Transcript
					</Button>
					<Card className="max-h-80 overflow-auto bg-gray-50 p-4 border border-gray-200">
						<pre className="text-xs whitespace-pre-wrap">
							{JSON.stringify(transcript.transcripts?.[lang] || transcript.transcripts, null, 2)}
						</pre>
					</Card>
				</>
			)}
		</Card>
	);
}
