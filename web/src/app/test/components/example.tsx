/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
};

export const freqColorMap: Record<string, string> = {
	"1-100": "text-red-600",
	"101-200": "text-orange-600",
	"201-500": "text-yellow-600",
	"501-1000": "text-green-600",
	"1001-5000": "text-blue-600",
	"5001+": "text-purple-600",
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

export function SubtitleTabs({ mockJson }: { mockJson: any }) {
	const { categorizedGroups, subtitles, haveWordFrequency } = useParsedSubsData(mockJson);
	const [colorBy, setColorBy] = useState<"none" | "pos" | "freq">("pos");
	const [colorMode, setColorMode] = useState<"text" | "underline">("text");

	const useUnderline = colorMode === "underline";

	return (
		<Card className="max-w-4xl mx-auto mt-6">
			<Title>Subtitle Viewer</Title>

			<div className="flex justify-between items-center mb-4 mt-2">
				<div className="flex gap-4 items-center">
					<Text className="shrink-0">Color by:</Text>
					<Select value={colorBy} onValueChange={(v) => setColorBy(v as "none" | "pos" | "freq")}>
						<SelectItem value="none">No Color</SelectItem>
						<SelectItem value="pos">Part of Speech</SelectItem>
						<SelectItem value="freq">Frequency</SelectItem>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<Text>Use underline</Text>
					<Switch checked={colorMode === "underline"} onChange={(v) => setColorMode(v ? "underline" : "text")} />
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
						<div className="max-h-80 overflow-y-auto mt-4 space-y-2">
							{subtitles.map((sub, i) => (
								<div key={i}>
									<Button variant="light" className="text-sm">
										{formatTime(sub.begin)}
									</Button>
									<Text className="text-lg flex flex-wrap gap-1">
										{sub.tokens.map((token: any, j: number) => {
											let colorClass = "";

											const key = colorBy === "pos" ? token.pos : token.freqRange ?? "unknown";
											colorClass = getColorClass(key, useUnderline, colorBy === "pos" ? posColorMap : freqColorMap);

											return (
												<span key={j} className={cx(colorClass, colorBy === "none" && "text-gray-700")}>
													{token.form.text}
												</span>
											);
										})}
									</Text>
								</div>
							))}
						</div>
					</TabPanel>

					{/* Words */}
					<TabPanel>
						<div className="max-h-96 overflow-y-auto mt-4 space-y-4">
							{Object.entries(categorizedGroups).map(([range, tokens]) => (
								<div key={range}>
									<Title className="text-base">{range}</Title>
									<div className="flex flex-wrap gap-2 mt-2">
										{tokens.map((token, idx) => {
											const key = colorBy === "pos" ? token.pos : range;
											const colorClass = getColorClass(
												key,
												useUnderline,
												colorBy === "pos" ? posColorMap : freqColorMap
											);

											return (
												<span
													key={idx}
													className={cx("px-2 py-1 rounded", colorClass, colorBy === "none" && "text-gray-700")}
												>
													{token.form.text}
												</span>
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
