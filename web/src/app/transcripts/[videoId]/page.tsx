"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Title, Text, Button } from "@tremor/react";
import ReactPlayer from "react-player/youtube";
import { fetchTranscript, TranscriptData } from "@/utils/transcripts";

function parseTimeString(time: string) {
	const [h, m, s] = time.split(":").map(Number);
	return h * 3600 + m * 60 + s;
}

export default function TranscriptPage() {
	const { videoId } = useParams();
	const searchParams = useSearchParams();
	const lang = searchParams.get("lang") ?? "es";

	const playerRef = useRef<ReactPlayer>(null);

	const desktopSubtitleWrapperRef = useRef<HTMLDivElement>(null);
	const mobileSubtitleWrapperRef = useRef<HTMLDivElement>(null);

	const mobileActiveRef = useRef<HTMLDivElement>(null);
	const desktopActiveRef = useRef<HTMLDivElement>(null);
	const [currentTime, setCurrentTime] = useState(0);

	const { data, isLoading } = useQuery<TranscriptData>({
		queryKey: ["transcript", videoId, lang],
		queryFn: () => fetchTranscript(lang, videoId as string),
		enabled: typeof videoId === "string" && !!videoId,
	});

	const transcript = data?.transcripts?.[lang] ?? [];

	const activeIndex = transcript.findIndex((entry) => {
		const start = parseTimeString(entry.start);
		const end = parseTimeString(entry.end);
		return currentTime >= start && currentTime < end;
	});

	useEffect(() => {
		const activeMobileEl = mobileActiveRef.current;
		const activeDesktopEl = desktopActiveRef.current;
		const desktopWrapper = desktopSubtitleWrapperRef.current;
		const mobileWrapper = mobileSubtitleWrapperRef.current;

		const isMobile = window.innerWidth < 768;
		const wrapper = isMobile ? mobileWrapper : desktopWrapper;

		if (!activeDesktopEl && !isMobile) return;

		if (!wrapper) return;

		if (isMobile && activeMobileEl) {
			const scrollTopOffset =
				activeMobileEl.offsetTop - wrapper.offsetTop - (wrapper.clientHeight / 2 - activeMobileEl.clientHeight / 2);

			wrapper.scrollTo({
				top: scrollTopOffset,
				behavior: "smooth",
			});
		}

		if (!isMobile && activeDesktopEl) {
			const scrollTopOffset = activeDesktopEl.offsetTop - (wrapper.clientHeight / 2 - activeDesktopEl.clientHeight / 2);

			wrapper.scrollTo({
				top: scrollTopOffset,
				behavior: "smooth",
			});
		}
	}, [activeIndex]);

	const handleExport = () => {
		if (!data) return;
		const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(file);
		a.download = `${videoId}-${lang}.json`;
		a.click();
	};

	return (
		<div className="max-w-7xl mx-auto flex flex-col sm:flex-row max-md:gap-3 gap-6 p-0 max-sm:pb-3 sm:p-3 md:p-6">
			{/* Left Column (md+): Video + Card */}
			<div className="flex-1 w-full sm:w-2/3 px-0 sm:px-0">
				{/* Desktop Title */}
				<Title className="hidden sm:block mb-4">{data?.videoInfo?.name ?? "Loading..."}</Title>

				{/* Video */}
				<div className="aspect-video w-full sm:rounded-none sm:px-0">
					<ReactPlayer
						ref={playerRef}
						url={`https://www.youtube.com/watch?v=${videoId}`}
						width="100%"
						height="100%"
						controls
						onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
					/>
				</div>

				{/* Desktop Export Button */}
				<Button className="mt-3 hidden sm:inline-block" onClick={handleExport}>
					Export Transcript
				</Button>

				{/* Right Panel (md+ only) */}
				<Card className="hidden sm:block mt-3">
					<Title>Right Panel</Title>
					<Text>Reserved for future features.</Text>
				</Card>
			</div>

			{/* Right Column (md+): Subtitles */}
			<div
				className="max-sm:hidden w-full sm:w-1/3 border rounded bg-white p-4 overflow-y-auto space-y-2"
				style={{ height: "calc(100vh - 42px)" }}
				ref={desktopSubtitleWrapperRef}
			>
				{isLoading ? (
					<Text>Loading transcript...</Text>
				) : (
					transcript.map((entry, idx) => (
						<div
							key={idx}
							ref={idx === activeIndex ? desktopActiveRef : null}
							className={`subtitle p-2 rounded cursor-pointer transition-colors ${
								idx === activeIndex ? "bg-blue-100" : "hover:bg-gray-100"
							}`}
							onClick={() => playerRef.current?.seekTo(parseTimeString(entry.start), "seconds")}
						>
							<Text className="text-sm text-gray-600">{entry.start}</Text>
							<Text>{entry.text}</Text>
						</div>
					))
				)}
			</div>

			{/* Mobile-only: Subtitle Panel */}
			<div
				className="sm:hidden px-4 overflow-y-auto space-y-2"
				style={{
					height: "calc(100vh - 56.25vw)", // 16:9 video aspect ratio: 9/16 = 0.5625
				}}
				ref={mobileSubtitleWrapperRef}
			>
				{isLoading ? (
					<Text>Loading transcript...</Text>
				) : (
					transcript.map((entry, idx) => (
						<div
							key={idx}
							ref={idx === activeIndex ? mobileActiveRef : null}
							className={`subtitle p-2 rounded cursor-pointer transition-colors ${
								idx === activeIndex ? "bg-blue-100" : "hover:bg-gray-100"
							}`}
							onClick={() => playerRef.current?.seekTo(parseTimeString(entry.start), "seconds")}
						>
							<Text className="text-sm text-gray-600">{entry.start}</Text>
							<Text>{entry.text}</Text>
						</div>
					))
				)}
			</div>

			{/* Mobile-only: Export + Right Panel */}
			<div className="sm:hidden px-4 mt-4 space-y-4">
				<Button onClick={handleExport}>Export Transcript</Button>
				<Card>
					<Title>Right Panel</Title>
					<Text>Reserved for future features.</Text>
				</Card>
			</div>
		</div>
	);
}
