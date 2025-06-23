/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useRef, useState } from "react";
import { Card, Title, Text } from "@tremor/react";
import ReactPlayer from "react-player/youtube";
import { SubtitleSettings } from "./components/react/settings";
import { SubtitleSettingsProvider, useSubtitleSettings } from "./provider/subtitle-settings";
import { SubtitleTabs } from "./components/react/tabs";
import { DictEntryProvider, useDictEntry } from "./provider/dict-entry";
import { DictEntry } from "./components/react/dict-entry";
import { useSearchParams } from "next/navigation";
import { useYouTubeHistory } from "@/hooks/useYoutubeHistory";
import { ReactPlayerContext } from "./provider/react-player";

export default function TranscriptPage() {
	return (
		<DictEntryProvider>
			<SubtitleSettingsProvider>
				<TranscriptComponent />
			</SubtitleSettingsProvider>
		</DictEntryProvider>
	);
}

function TranscriptComponent() {
	const playerRef = useRef<ReactPlayer>(null);
	const subtitleSettingsRef = useRef<HTMLDivElement>(null);

	// const [currentTime, setCurrentTime] = useState(0);
	const [playing, setPlaying] = useState<any>(null);

	const { videoId } = useSubtitleSettings();

	const getCurrentTime = useCallback(() => {
		if (!playerRef.current) return null;
		const seconds = playerRef.current.getCurrentTime();
		return seconds;
	}, []);

	const { updateHistory } = useYouTubeHistory();

	const searchParams = useSearchParams();
	const lang = searchParams.get("lang") ?? "es";
	const lastWatched = parseInt(searchParams.get("last_watched") ?? "0");

	const { setDrawerOpen } = useDictEntry();

	const onTimestampClick = useCallback(
		(timestamp: number) => {
			setDrawerOpen((prevDrawerOpen) => {
				if (prevDrawerOpen) {
					setPlaying(() => {
						playerRef.current?.seekTo(timestamp / 1000, "seconds");
						return true; // drawer is open, autoplay timestamp
					});
					return false; // drawer is open, close drawer
				}

				// drwaer not open, proceed as usual
				setPlaying((prevPlaying: boolean) => {
					const wasPlaying = prevPlaying;

					playerRef.current?.seekTo(timestamp / 1000, "seconds");

					if (wasPlaying || wasPlaying == null) {
						return true;
					}

					return false;
				});
				return prevDrawerOpen; // drawer not open, do nothing
			});
		},
		[setDrawerOpen]
	);

	console.log("render");

	return (
		<ReactPlayerContext.Provider
			value={{
				onTimestampClick,
			}}
		>
			<DictEntry lang={lang} withExamplesFromSubtitles />

			<div className="max-w-7xl mx-auto flex flex-col sm:flex-row max-md:gap-2 gap-6 p-0 max-sm:pb-3 sm:p-3 md:p-6">
				{/* Left Column (md+): Video + Card */}
				<div className="flex-1 w-full sm:w-2/3 px-0 sm:px-0">
					<div ref={subtitleSettingsRef}>
						<SubtitleSettings />
					</div>
					{/* Video */}
					<div className="aspect-video w-full sm:rounded-lg sm:overflow-hidden sm:mt-6">
						<ReactPlayer
							ref={playerRef}
							url={`https://www.youtube.com/watch?v=${videoId}`}
							playing={playing}
							width="100%"
							height="100%"
							controls
							onReady={() => {
								if (lastWatched) {
									playerRef?.current?.seekTo(lastWatched);
								}
							}}
							onPlay={() => {
								setPlaying(true);

								if (subtitleSettingsRef.current) {
									const offsetTop = subtitleSettingsRef.current.offsetTop;
									const height = subtitleSettingsRef.current.offsetHeight;
									const scrollToY = offsetTop + height; // 16px below the component

									const additionalPixel = window.innerWidth < 768 ? 2 : 0;

									window.scrollTo({
										top: scrollToY + additionalPixel,
										behavior: "smooth",
									});
								}
							}}
							onPause={() => setPlaying(false)}
							onProgress={async ({ playedSeconds }) => {
								await updateHistory(videoId, lang, playedSeconds);
								// 	setCurrentTime(playedSeconds);
							}}
						/>
					</div>

					{/* Right Panel (md+ only) */}
					<Card className="hidden sm:block mt-3">
						<Title>Right Panel</Title>
						<Text>Reserved for future features.</Text>
					</Card>
				</div>

				{/* Right Column (md+): Subtitles */}
				<Card
					className="max-sm:hidden sticky sm:top-2 md:top-6 w-full sm:w-1/3 sm:p-2 md:p-4 overflow-hidden"
					style={{
						height: `calc(100vh - ${window?.innerWidth < 768 ? 20 : 48}px)`,
					}}
				>
					<SubtitleTabs setPlaying={setPlaying} getCurrentTime={getCurrentTime} onTimestampClick={onTimestampClick} />
				</Card>

				{/* Mobile-only: Subtitle Panel */}
				<div
					className="sm:hidden px-3 overflow-hidden space-y-2"
					style={{
						height: "calc(100vh - 56.25vw)", // 16:9 video aspect ratio: 9/16 = 0.5625
					}}
				>
					<SubtitleTabs setPlaying={setPlaying} getCurrentTime={getCurrentTime} onTimestampClick={onTimestampClick} />
				</div>
			</div>
		</ReactPlayerContext.Provider>
	);
}
