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
import clsx from "clsx";

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

	const { videoId, videoSize, audioOnly } = useSubtitleSettings();

	const getCurrentTime = useCallback(() => {
		if (!playerRef.current) return null;
		const seconds = playerRef.current.getCurrentTime();
		return seconds;
	}, []);

	const { updateHistory } = useYouTubeHistory();

	const searchParams = useSearchParams();
	const lang = searchParams.get("lang") ?? "es";
	const lastWatched = parseInt(searchParams.get("last_watched") ?? "0");

	const { drawerOpen, setDrawerOpen } = useDictEntry();

	const toStopAfterRef = useRef(0);

	const onTimestampClick = useCallback(
		(start: number, end?: number) => {
			setDrawerOpen((prevDrawerOpen) => {
				if (prevDrawerOpen) {
					if (end) {
						const duration = end - start;
						setPlaying(() => {
							playerRef.current?.seekTo(start / 1000, "seconds");
							toStopAfterRef.current = duration;
							return true; // drawer is open, autoplay timestamp
						});
					}
					return true;
				}

				// drwaer not open, proceed as usual
				setPlaying((prevPlaying: boolean) => {
					const wasPlaying = prevPlaying;

					playerRef.current?.seekTo(start / 1000, "seconds");

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

	return (
		<ReactPlayerContext.Provider
			value={{
				onTimestampClick,
			}}
		>
			<DictEntry lang={lang} withExamplesFromSubtitles limitHeight />

			<div className="max-w-7xl mx-auto flex flex-col sm:flex-row md:gap-3 xl:gap-6 p-0 max-sm:pb-3 sm:p-0 md:p-3 xl:p-6">
				{/* Left Column (md+): Video + Card */}
				<div className="h-full w-full sm:w-2/3 px-0 sm:px-0">
					<div ref={subtitleSettingsRef}>
						<SubtitleSettings />
					</div>
					{/* Video */}
					<div
						className={clsx(
							"md:rounded-lg sm:overflow-hidden sm:mt-0 md:mt-3 xl:mt-6",
							videoSize === "default" && "aspect-video w-full",
							videoSize === "half-screen" && "h-[50dvh] w-full",
							videoSize === "full-screen" && "h-[calc(100dvh+4px)] w-full",
							audioOnly && "opacity-0 h-0 w-0"
						)}
					>
						<ReactPlayer
							ref={playerRef}
							url={`https://www.youtube.com/watch?v=${videoId}`}
							playing={playing}
							width="100%"
							height="100%"
							controls={drawerOpen ? false : true}
							onReady={() => {
								if (lastWatched) {
									playerRef?.current?.seekTo(lastWatched);
									setPlaying(true);
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

								if (toStopAfterRef.current) {
									setTimeout(() => {
										setPlaying(false);
									}, toStopAfterRef.current - 300);

									toStopAfterRef.current = 0;
								}
							}}
							onPause={() => setPlaying(false)}
							onProgress={async ({ playedSeconds }) => {
								await updateHistory(videoId, lang, playedSeconds, playerRef.current?.getDuration() as number);
								// 	setCurrentTime(playedSeconds);
							}}
						/>
					</div>

					{/* Right Panel (md+ only) */}
					<Card className="hidden sm:block max-md:rounded-none max-md:shadow-none md:mt-3 xl:mt-6">
						<Title>Right Panel</Title>
						<Text>Reserved for future features.</Text>
					</Card>
				</div>

				{/* Right Column (md+): Subtitles */}
				<Card
					className="max-sm:hidden sticky top-0 max-md:border-l-0 max-md:rounded-none max-md:shadow-none md:top-2 xl:top-4 w-full max-w-xs lg:max-w-sm p-0 xl:p-4 overflow-hidden"
					style={{
						// height: `calc(100vh - ${window?.innerWidth < 768 ? 20 : 48}px)`,
						maxHeight: "100vh",
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
