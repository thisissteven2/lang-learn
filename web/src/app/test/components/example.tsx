/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import {
	Tab,
	TabGroup,
	TabList,
	TabPanel,
	TabPanels,
	Card,
	Text,
	Title,
	Switch,
	Select,
	SelectItem,
	Button,
} from "@tremor/react";
import { useParsedSubsData } from "./hook";
import { cx } from "@/lib/utils";

export const posColorMap: Record<string, string> = {
	NOUN: "text-blue-500",
	VERB: "text-green-500",
	ADJ: "text-red-500",
	ADV: "text-purple-500",
	PRON: "text-amber-600",
	PROPN: "text-yellow-600", // proper noun
	NUM: "text-pink-500", // numerals
	ADP: "text-teal-500", // adpositions (in, on, etc.)
	PART: "text-indigo-500", // particles (e.g. “to” in “to go”)
	CCONJ: "text-cyan-600", // coordinating conjunctions (and, but)
	SCONJ: "text-cyan-800", // subordinating conjunctions (because, although)
	DET: "text-fuchsia-600", // determiners (a, the, some)
	AUX: "text-lime-600", // auxiliary verbs (is, was, will)
	INTJ: "text-rose-500", // interjections (oh, wow)
	SYM: "text-gray-600", // symbols
	X: "text-gray-400", // unknown
	PUNCT: "text-gray-500", // punctuation
};

export const freqColorMap: Record<string, string> = {
	"1-100": "text-red-600",
	"101-200": "text-orange-600",
	"201-500": "text-yellow-600",
	"501-1000": "text-green-600",
	"1001-2000": "text-blue-500",
	"2001-3500": "text-blue-700",
	"3501-5000": "text-blue-800",
	"5001-8000": "text-purple-500",
	"8001+": "text-purple-700",
};

function formatTime(ms: number): string {
	const totalSeconds = Math.round(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, "0")).join(":");
}

export function getColorClass(key: string, useUnderline: boolean, map: Record<string, string>) {
	const base = map[key] || "";
	return useUnderline ? `${base} underline decoration-[1.5px] underline-offset-4` : base;
}

function getFreqRangeLabel(freq: number | null | undefined, ranges: any[]): string {
	if (typeof freq !== "number") return "unknown";
	const range = ranges.find((r) => freq >= r.min && freq <= r.max);
	return range ? range.label : "unknown";
}

export function SubtitleTabs({ mockJson }: { mockJson: any }) {
	const { ranges, categorizedGroups, subtitles, haveWordFrequency } = useParsedSubsData(mockJson);
	const [colorBy, setColorBy] = useState<"none" | "pos" | "freq">("pos");
	const [colorMode, setColorMode] = useState<"text" | "underline">("text");
	const [showPinyin, setShowPinyin] = useState<boolean>(true);
	const [showTranslation, setShowTranslation] = useState<boolean>(false);

	const useUnderline = colorMode === "underline";

	const memoizedCategorizedGroups = useMemo(() => {
		return Object.entries(categorizedGroups).sort(([rangeA], [rangeB]) => {
			const startA = parseInt(rangeA.split("-")[0]) || 0;
			const startB = parseInt(rangeB.split("-")[0]) || 0;
			return startA - startB;
		});
	}, [categorizedGroups]);

	return (
		<Card className="max-w-4xl mx-auto mt-6">
			<Title>Subtitle Viewer</Title>

			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 mt-2">
				{/* Left side: Color mode */}
				<div className="flex flex-wrap gap-4 items-center">
					<Text className="shrink-0">Color by:</Text>
					<Select
						value={colorBy}
						onValueChange={(v) => setColorBy(v as "none" | "pos" | "freq")}
						className="min-w-[140px]"
					>
						<SelectItem value="none">No Color</SelectItem>
						<SelectItem value="pos">Part of Speech</SelectItem>
						<SelectItem value="freq">Vocabulary Level</SelectItem>
					</Select>
				</div>

				{/* Right side: Extra config toggles */}
				<div className="flex flex-wrap md:grid md:grid-cols-2 gap-4 items-center">
					<div className="flex items-center gap-2">
						<Text>Underline</Text>
						<Switch checked={colorMode === "underline"} onChange={(v) => setColorMode(v ? "underline" : "text")} />
					</div>

					<div className="flex items-center gap-2">
						<Text>Show Transliteration</Text>
						<Switch checked={showPinyin} onChange={(v) => setShowPinyin(v)} />
					</div>

					<div className="flex items-center gap-2">
						<Text>Show Translation</Text>
						<Switch checked={showTranslation} onChange={(v) => setShowTranslation(v)} />
					</div>
				</div>
			</div>

			<TabGroup>
				<TabList>
					<Tab>Transcripts</Tab>
					<Tab>Words</Tab>
				</TabList>

				<TabPanels>
					{/* Transcripts */}
					<TabPanel>
						<div className="max-h-80 overflow-y-auto mt-4 space-y-4">
							{subtitles.map((sub, i) => (
								<div key={i}>
									<Button variant="light" className="text-sm">
										{formatTime(sub.begin)}
									</Button>

									{/* Tokens */}
									<div className="text-lg flex flex-wrap gap-2">
										{sub.tokens.map((token: any, j: number) => {
											if (token.form.text == "大厨") {
												console.log(token);
											}
											const key = colorBy === "pos" ? token.pos : getFreqRangeLabel(token.freq, ranges) ?? "unknown";
											const colorClass = getColorClass(
												key,
												useUnderline,
												colorBy === "pos" ? posColorMap : freqColorMap
											);

											return (
												<div key={j} className="flex flex-col items-center">
													{showPinyin && (
														<span className="text-xs text-gray-500">{token.form.pinyin?.join(" ") || ""}</span>
													)}
													<span className={cx(colorClass, colorBy === "none" && "text-gray-700")}>
														{token.form.text}
													</span>
												</div>
											);
										})}
									</div>

									{/* Dummy Translation */}
									{showTranslation && (
										<Text className="text-sm text-gray-400 italic mt-1">(Dummy translation of: {sub.text})</Text>
									)}
								</div>
							))}
						</div>
					</TabPanel>

					{/* Words */}
					<TabPanel>
						<div className="max-h-96 overflow-y-auto mt-4 space-y-4">
							{memoizedCategorizedGroups.map(([range, tokens]) => (
								<div key={range}>
									<Title className="text-base">{range}</Title>
									<div className="flex flex-wrap gap-2 mt-2 text-lg">
										{tokens.map((token, idx) => {
											const key = colorBy === "pos" ? token.pos : range;
											const colorClass = getColorClass(
												key,
												useUnderline,
												colorBy === "pos" ? posColorMap : freqColorMap
											);

											return (
												<div key={idx} className="py-1 flex flex-col items-center">
													{showPinyin && (
														<span className="text-xs text-gray-500">{token.form.pinyin?.join(" ") || ""}</span>
													)}
													<span
														key={idx}
														className={cx("px-2 rounded", colorClass, colorBy === "none" && "text-gray-700")}
													>
														{token.form.text}
													</span>
												</div>
											);
										})}
									</div>
								</div>
							))}
						</div>
						<Text className="mt-4">Have Word Frequency: {haveWordFrequency ? "Yes" : "No"}</Text>
					</TabPanel>
				</TabPanels>
			</TabGroup>
		</Card>
	);
}
