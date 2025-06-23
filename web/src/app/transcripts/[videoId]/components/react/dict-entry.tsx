/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { Card, Title, Text, Button, Divider } from "@tremor/react";
import { Drawer } from "vaul";
import { useDictEntry } from "../../provider/dict-entry";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { cx } from "@/lib/utils";
import { RiVolumeUpLine, RiCloseLine } from "@remixicon/react";
import { getSentenceTransliteration } from "../../components/utils";
import { posReadableMap } from "../../components/constants";
import { WordStatusButtons } from "../../components/react/word-status-buttons";
import { useSubtitleSettings } from "../../provider/subtitle-settings";
import { useParsedSubsData } from "../hook";
import { formatTime } from "@/utils/transcripts";
import { useReactPlayer } from "../../provider/react-player";

function SentencesExamples({ word }: { word: string }) {
	const { subsData, subsTranslations } = useSubtitleSettings();
	const { subtitles } = useParsedSubsData(subsData);

	const sentencesExamplesFromSubtitles = useMemo(() => {
		const examples = [];
		for (let i = 0; i < subtitles.length; i++) {
			const subtitle = subtitles[i];
			if (examples.length === 3) break;
			if (subtitle.text.includes(word) && examples.length < 3) {
				examples.push({
					index: i,
					...subtitle,
				});
			}
		}
		return examples;
	}, [subtitles, word]);

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
						const transliteration = sentence.tokens.map(getSentenceTransliteration).join(" ").trim();
						const sentenceChunks = sentence.text
							.split(word)
							.flatMap((chunk, i, arr) => (i < arr.length - 1 ? [chunk, word] : [chunk]));

						return (
							<Card
								key={index}
								className="bg-gray-50 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 mb-2"
							>
								<Button onClick={() => onTimestampClick(sentence.begin)} variant="light" className="text-sm">
									{formatTime(sentence.begin)}
								</Button>
								<div className="flex justify-between items-center">
									<Text className="text-black dark:text-white text-xl">
										{sentenceChunks.map((text, index) => {
											const isActive = text === word;
											return (
												<span key={index} className={isActive ? "text-yellow-600 dark:text-yellow-500" : ""}>
													{text}
												</span>
											);
										})}
									</Text>
								</div>
								<Text className="text-gray-500 dark:text-gray-400 italic">{transliteration}</Text>
								<Text className="text-blue-800 dark:text-blue-400 mt-2">{subsTranslations[sentence.index]}</Text>
							</Card>
						);
					})}
				</div>
			</div>
			<Divider />
		</>
	);
}

export function DictEntry({ lang, withExamplesFromSubtitles }: { lang: string; withExamplesFromSubtitles?: boolean }) {
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
						"bg-white dark:bg-[#030712] fixed z-40 shadow-lg rounded-none sm:h-full md:w-[28rem] max-h-[100vh] w-full transition-transform",
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
																className="bg-gray-50 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 mb-2"
															>
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
																<Text className="text-blue-800 dark:text-blue-400 mt-2">
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
