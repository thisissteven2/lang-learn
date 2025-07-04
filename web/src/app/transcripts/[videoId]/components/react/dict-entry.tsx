/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { Card, Title, Text, Button, Divider } from "@tremor/react";
import { Drawer } from "vaul";
import { useDictEntry } from "../../provider/dict-entry";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { cx } from "@/lib/utils";
import { RiVolumeUpLine, RiCloseLine } from "@remixicon/react";
import { getSentenceTransliteration, getTransliteration } from "../../components/utils";
import { posReadableMap } from "../../components/constants";
import { WordStatusButtons } from "../../components/react/word-status-buttons";
import { useSubtitleSettings } from "../../provider/subtitle-settings";
import { formatTime } from "@/utils/transcripts";
import { useReactPlayer } from "../../provider/react-player";
import { CopyButton } from "./copy-button";

function SentencesExamples({ word }: { word: string }) {
	const { subtitles, subsTranslations } = useSubtitleSettings();

	const sentencesExamplesFromSubtitles = useMemo(() => {
		if (word && subtitles && subsTranslations) {
			const examples = [];
			for (let i = 0; i < subtitles.length; i++) {
				if (examples.length === 3) break;
				const subtitle = subtitles[i];

				const transliteration = subtitle.tokens.map(getTransliteration).join(" ").trim();

				const sentenceChunks = subtitle.text
					.split(word ? word : "")
					.flatMap((chunk, i, arr) => (i < arr.length - 1 ? [chunk, word] : [chunk]));

				const translation = subsTranslations[i];

				if (subtitle.text.includes(word) && examples.length < 3) {
					examples.push({
						index: i,
						transliteration,
						sentenceChunks,
						translation,
						...subtitle,
					});
				}
			}
			return examples;
		} else {
			return [];
		}
	}, [subsTranslations, subtitles, word]);

	const { onTimestampClick } = useReactPlayer();

	if (sentencesExamplesFromSubtitles.length === 0) {
		return null;
	}

	return (
		<>
			<div className="mt-4">
				<Text className="text-xs text-gray-500 uppercase tracking-wide mb-2">Examples from Subtitles</Text>

				<div>
					{sentencesExamplesFromSubtitles.map((sentence, index) => {
						return (
							<Card
								key={index}
								className="relative bg-gray-50 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 mb-2"
							>
								<CopyButton
									className="-bottom-16 right-3 top-0"
									text={`${word}: \n\n${sentence.text}\n${sentence.translation}\n- - - - -\n`}
								/>
								<Button
									onClick={() => onTimestampClick(sentence.begin, sentence.end)}
									variant="light"
									className="text-sm"
								>
									{formatTime(sentence.begin)}
								</Button>
								<div className="flex justify-between items-center">
									<Text className="text-black dark:text-white text-xl">
										{sentence.sentenceChunks.map((text, index) => {
											const isActive = text === word;
											return (
												<span key={index} className={isActive ? "text-yellow-600 dark:text-yellow-500" : ""}>
													{text}
												</span>
											);
										})}
									</Text>
								</div>
								<Text className="text-gray-500 dark:text-gray-400 italic">{sentence.transliteration}</Text>
								<Text className="text-blue-800 pr-8 dark:text-blue-400 mt-2">{sentence.translation}</Text>
							</Card>
						);
					})}
				</div>
			</div>
			<Divider />
		</>
	);
}

export function DictEntry({
	lang,
	withExamplesFromSubtitles,
	limitHeight,
}: {
	lang: string;
	withExamplesFromSubtitles?: boolean;
	limitHeight?: boolean;
}) {
	const { drawerOpen, setDrawerOpen, setSentenceParams, isLoading, audio, sentenceAudio, dictEntry, token } =
		useDictEntry();
	const { play } = useAudioPlayer(audio);
	const { play: playSentence } = useAudioPlayer(sentenceAudio);

	const [viewport, setViewport] = useState({ width: 0, height: 0 });

	const { videoSize } = useSubtitleSettings();

	const isDesktop = viewport.width > 640;
	const height =
		isDesktop || !limitHeight || videoSize === "full-screen"
			? `${viewport.height}px`
			: videoSize === "half-screen"
			? `${viewport.height * 0.5}px`
			: `${viewport.height - (viewport.width * 9) / 16}px`;

	const isSmToMd = viewport.width < 768 && viewport.width > 640;
	const isMobile = viewport.width < 640;
	const width = isSmToMd ? "320px" : isMobile ? viewport.width : "448px";

	useEffect(() => {
		const viewportHeight = window.visualViewport?.height || window.innerHeight;
		const handleResize = () =>
			setViewport({
				width: window.innerWidth,
				height: viewportHeight,
			});
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const [word, transliteration] = token.split(",");

	return (
		<Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen} direction={isDesktop ? "right" : "bottom"}>
			<Drawer.Portal>
				<Drawer.Overlay
					className={cx("fixed inset-0 z-30", limitHeight && (!isDesktop || isSmToMd) ? "" : "bg-black/40 ")}
				/>
				<Drawer.Content
					className={cx(
						"bg-white dark:bg-[#030712] rounded-none transition-transform focus:outline-none p-0",
						isDesktop ? "right-0 top-0 bottom-0" : "bottom-0 left-0 right-0",
						"fixed z-40 flex flex-col h-full w-full"
					)}
					style={{
						maxHeight: height,
						maxWidth: width,
					}}
				>
					<div className="p-4 overflow-y-auto">
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
						{isLoading ? (
							"Loading..."
						) : (
							<>
								<div className="mb-4 space-y-2">
									{dictEntry?.renderData?.fullDictRenderData?.entries?.[0]?.posGroups.map((group, idx) => (
										<div key={idx}>
											<Text className="text-sm text-gray-500 italic">{group.pos ? `(${group.pos})` : ""}</Text>
											<Text className="text-sm text-black dark:text-white">{group.translations.join(", ")}</Text>
										</div>
									))}
								</div>

								<WordStatusButtons
									word={word}
									pos={dictEntry?.renderData?.fullDictRenderData?.entries?.[0]?.posGroups?.[0].pos || "X"}
									lang={lang}
									transliteration={transliteration}
								/>

								<Divider />

								{withExamplesFromSubtitles && <SentencesExamples word={word} />}

								{/* Example Sentences */}
								<div className="mt-4">
									<Text className="text-xs text-gray-500 uppercase tracking-wide mb-2">Examples by Part of Speech</Text>

									{!dictEntry?.tatoebaExamples
										? "No Examples found."
										: Object.entries(dictEntry.tatoebaExamples).map(([pos, examples]) => (
												<div key={pos} className="mb-4">
													<Text className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
														{posReadableMap[pos]}
													</Text>

													{examples.map((example: any, index: number) => {
														const transliteration = example.nlp.map(getSentenceTransliteration).join(" ").trim();

														const sentenceParams = `${example.text},${example.textHash}`;

														return (
															<Card
																key={index}
																className="relative bg-gray-50 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 mb-2"
															>
																<CopyButton
																	text={`${word}: \n\n${example.text}\n${example.translation?.text}\n- - - - -\n`}
																	className="-bottom-16 right-3 top-0"
																/>
																<div className="flex justify-between items-center">
																	<Text className="text-black dark:text-white text-xl">
																		{example.nlp.map((token: any, index: number) => {
																			const isActive = token.form.text === word;
																			return (
																				<span
																					key={index}
																					className={isActive ? "text-yellow-600 dark:text-yellow-500" : ""}
																				>
																					{token.form.text}
																				</span>
																			);
																		})}
																	</Text>
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
																<Text className="text-gray-500 dark:text-gray-400 italic">{transliteration}</Text>
																<Text className="text-blue-800 pr-8 dark:text-blue-400 mt-2">
																	{example.translation?.text}
																</Text>
																<Text className="text-xs text-gray-500 mt-1">
																	Frequency Rank: {example.avgFreqRank}
																</Text>
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
