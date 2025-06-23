/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Card, Title, Text, Button, Divider } from "@tremor/react";
import ReactPlayer from "react-player/youtube";
import { SubtitleSettings } from "./components/react/settings";
import { SubtitleSettingsProvider, useSubtitleSettings } from "./provider/subtitle-settings";
import { SubtitleTabs } from "./components/react/tabs";
import { Drawer } from "vaul";
import { DictEntryProvider, useDictEntry } from "./provider/dict-entry";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { cx } from "@/lib/utils"; // Or just use clsx directly
import { RiVolumeUpLine, RiCloseLine } from "@remixicon/react";

export default function TranscriptPage() {
	return (
		<DictEntryProvider>
			<DrawerComponent />
			<SubtitleSettingsProvider>
				<TranscriptComponent />
			</SubtitleSettingsProvider>
		</DictEntryProvider>
	);
}

function DrawerComponent() {
	const { drawerOpen, setDrawerOpen, setSentenceParams, isLoading, audio, sentenceAudio, dictEntry, token } =
		useDictEntry();
	const { play } = useAudioPlayer(audio);
	const { play: playSentence } = useAudioPlayer(sentenceAudio);

	const [isDesktop, setIsDesktop] = useState(false);

	useEffect(() => {
		const handleResize = () => setIsDesktop(window.innerWidth > 768);
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const [word, transliteration] = token.split(",");

	return (
		<Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen} direction={isDesktop ? "right" : "bottom"}>
			<Drawer.Portal>
				<Drawer.Overlay className="fixed inset-0 bg-black/40 z-30" />
				<Drawer.Content
					className={cx(
						"bg-white dark:bg-[#030712] fixed z-40 shadow-lg rounded-none sm:h-full sm:w-[28rem] max-h-[100vh] w-full transition-transform",
						isDesktop ? "right-0 top-0 bottom-0" : "bottom-0 left-0 right-0"
					)}
				>
					<div className="overflow-y-auto p-4 h-full max-h-[100vh]">
						{/* Header */}
						<div className="flex justify-between items-start mb-4">
							<Drawer.Title asChild>
								<div className="flex justify-between items-end gap-4">
									<div className="flex flex-col items-center w-fit">
										<Text className="text-sm text-green-600 dark:text-green-400 italic">{transliteration}</Text>
										<Title className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{word}</Title>
									</div>
									<Button icon={RiVolumeUpLine} variant="light" size="xl" onClick={play} className="mb-1" />
								</div>
							</Drawer.Title>
							<button
								onClick={() => setDrawerOpen(false)}
								className="p-2 text-gray-600 hover:text-black dark:hover:text-white"
							>
								<RiCloseLine />
							</button>
						</div>

						{/* Definitions */}
						{!isLoading && (
							<>
								<div className="mb-4 space-y-2">
									{dictEntry?.renderData?.fullDictRenderData?.entries?.[0]?.posGroups.map((group, idx) => (
										<div key={idx}>
											<Text className="text-sm text-gray-500 italic">{group.pos ? `(${group.pos})` : ""}</Text>
											<Text className="text-sm text-black dark:text-white">{group.translations.join(", ")}</Text>
										</div>
									))}
								</div>

								<div className="flex items-center mt-2 gap-2">
									<Button size="xs" variant="secondary">
										★ Known
									</Button>
									<Button size="xs" variant="secondary">
										🧠 Learning
									</Button>
								</div>

								<Divider />

								{/* Example Sentences */}
								<div className="mt-4">
									<Text className="text-xs text-gray-500 uppercase tracking-wide mb-2">Examples by Part of Speech</Text>

									{dictEntry?.tatoebaExamples &&
										Object.entries(dictEntry.tatoebaExamples).map(([pos, examples]) => (
											<div key={pos} className="mb-4">
												<Text className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">{pos}</Text>

												{examples.map((example: any, index: number) => {
													const pinyin = example.nlp
														.map((token: any) => token.form?.pinyin?.join("") ?? "")
														.join(" ")
														.trim();

													const sentenceParams = `${example.text},${example.textHash}`;

													return (
														<Card
															key={index}
															className="bg-gray-50 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 mb-2"
														>
															<div className="flex justify-between items-center">
																<Text className="text-black dark:text-white text-xl">{example.text}</Text>
																<Button
																	variant="light"
																	className="text-gray-500 hover:text-blue-600"
																	onClick={() => {
																		setSentenceParams(sentenceParams);
																		playSentence();
																	}}
																>
																	<RiVolumeUpLine className="w-6 h-6" />
																</Button>
															</div>
															<Text className="text-gray-500 italic">{pinyin}</Text>
															<Text className="text-blue-800 dark:text-blue-400 mt-2">{example.translation?.text}</Text>
															<Text className="text-xs text-gray-500 mt-1">Frequency Rank: {example.avgFreqRank}</Text>
														</Card>
													);
												})}
											</div>
										))}
								</div>
							</>
						)}
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
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

	return (
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
						onProgress={({}) => {
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
				<SubtitleTabs
					getCurrentTime={getCurrentTime}
					onTimestampClick={(timestamp: number) => {
						const wasPlaying = playing;

						playerRef.current?.seekTo(timestamp / 1000, "seconds");

						if (wasPlaying || wasPlaying == null) {
							setPlaying(true);
						}
					}}
				/>
			</Card>

			{/* Mobile-only: Subtitle Panel */}
			<div
				className="sm:hidden px-3 overflow-hidden space-y-2"
				style={{
					height: "calc(100vh - 56.25vw)", // 16:9 video aspect ratio: 9/16 = 0.5625
				}}
			>
				<SubtitleTabs
					getCurrentTime={getCurrentTime}
					onTimestampClick={(timestamp: number) => {
						const wasPlaying = playing;

						playerRef.current?.seekTo(timestamp / 1000, "seconds");

						if (wasPlaying || wasPlaying == null) {
							setPlaying(true);
						}
					}}
				/>
			</div>
		</div>
	);
}
