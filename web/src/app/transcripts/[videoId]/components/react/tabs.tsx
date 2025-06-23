/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Title, Text, TabPanel, TabPanels, TabList, Tab, TabGroup, Button } from "@tremor/react";
import { formatTime } from "@/utils/transcripts";
import { getColorClass, getFreqRangeLabel, getTransliteration } from "../../components/utils";
import { freqColorMap, posColorMap } from "../../components/constants";
import { cx } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSubtitleSettings } from "../../provider/subtitle-settings";
import { useParsedSubsData } from "../hook";

type SubtitleTabsProps = {
	getCurrentTime: () => number | null;
	onTimestampClick: (timestamp: number) => void;
};

export function SubtitleTabs({ getCurrentTime, onTimestampClick }: SubtitleTabsProps) {
	const subtitleWrapperRef = useRef<HTMLDivElement>(null);
	const activeRef = useRef<HTMLDivElement>(null);

	const { subsData, subsTranslations, isLoading, colorBy, colorMode, showPinyin, showTranslation } =
		useSubtitleSettings();

	const useUnderline = colorMode === "underline";

	const { ranges, categorizedGroups, subtitles } = useParsedSubsData(subsData);

	const [activeIndex, setActiveIndex] = useState(0);

	const memoizedSubtitles = useMemo(() => {
		return subtitles.map((subtitle) => {
			return {
				start: subtitle.begin / 1000,
				end: subtitle.end / 1000,
			};
		});
	}, [subtitles]);

	const memoizedCategorizedGroups = useMemo(() => {
		return Object.entries(categorizedGroups).sort(([rangeA], [rangeB]) => {
			const startA = parseInt(rangeA.split("-")[0]) || 0;
			const startB = parseInt(rangeB.split("-")[0]) || 0;
			return startA - startB;
		});
	}, [categorizedGroups]);

	useEffect(() => {
		const activeEl = activeRef.current;
		const wrapper = subtitleWrapperRef.current;

		const isMobile = window.innerWidth < 768;

		if (activeEl && wrapper) {
			const scrollTopOffset =
				activeEl.offsetTop -
				(isMobile ? wrapper.offsetTop : 0) -
				(wrapper.clientHeight / 2 - activeEl.clientHeight / 2);

			wrapper.scrollTo({
				top: scrollTopOffset,
				behavior: "smooth",
			});
		}
	}, [activeIndex]);

	useEffect(() => {
		const interval = setInterval(() => {
			const seconds = getCurrentTime();

			if (!seconds) return;

			const activeIndex = memoizedSubtitles.findIndex((subtitle) => {
				return seconds >= subtitle.start && seconds < subtitle.end;
			});

			if (activeIndex != -1) {
				setActiveIndex(activeIndex);
			}
		}, 50);

		return () => clearInterval(interval);
	}, [getCurrentTime, memoizedSubtitles]);

	return (
		<TabGroup className="h-full">
			<TabList>
				<Tab>Transcripts</Tab>
				<Tab>Words</Tab>
			</TabList>

			<TabPanels className="h-full">
				{/* Transcripts */}
				<TabPanel className="h-full mt-0">
					<div ref={subtitleWrapperRef} className="max-h-[calc(100%-48px)] overflow-y-auto space-y-4 pt-2 pr-4 pb-4">
						{subtitles.map((sub, i) => (
							<div
								key={i}
								ref={i === activeIndex ? activeRef : null}
								className={`subtitle p-2 rounded cursor-pointer transition-colors ${
									i === activeIndex ? "bg-blue-50 dark:bg-blue-800/30" : "hover:bg-gray-100 dark:hover:bg-gray-800/40"
								}`}
							>
								<Button onClick={() => onTimestampClick(sub.begin)} variant="light" className="text-sm">
									{formatTime(sub.begin)}
								</Button>

								{/* Tokens */}
								<div className="text-xl flex flex-wrap gap-1">
									{sub.tokens.map((token: any, j: number) => {
										const key = colorBy === "pos" ? token.pos : getFreqRangeLabel(token.freq, ranges) ?? "unknown";
										const colorClass = getColorClass(key, useUnderline, colorBy === "pos" ? posColorMap : freqColorMap);

										const transliteration = getTransliteration(token);

										return (
											<div key={j} className="flex flex-col items-center">
												{showPinyin && (
													<span className="text-xs text-gray-500 dark:text-gray-300">{transliteration}</span>
												)}
												<span className={cx(colorClass, colorBy === "none" && "text-gray-700")}>{token.form.text}</span>
											</div>
										);
									})}
								</div>

								{/* Translation */}
								{showTranslation && subsTranslations && (
									<Text className="text-sm text-gray-400 dark:text-gray-400 italic mt-1">{subsTranslations[i]}</Text>
								)}
							</div>
						))}
					</div>
					{isLoading && <Text>Transcripts will show here.</Text>}
				</TabPanel>

				{/* Words */}
				<TabPanel className="h-full mt-0">
					<div className="max-h-[calc(100%-48px)] overflow-y-auto space-y-4 pt-2 pr-4 pb-4">
						{memoizedCategorizedGroups.map(([range, tokens]) => (
							<div key={range}>
								<Title className="text-base">{range}</Title>
								<div className="flex flex-wrap gap-2 mt-2 text-xl">
									{tokens.map((token, idx) => {
										const key = colorBy === "pos" ? token.pos : range;
										const colorClass = getColorClass(key, useUnderline, colorBy === "pos" ? posColorMap : freqColorMap);

										const transliteration = getTransliteration(token);

										return (
											<div key={idx} className="py-1 flex flex-col items-center">
												{showPinyin && (
													<span className="text-xs text-gray-500 dark:text-gray-300">{transliteration}</span>
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
					{isLoading && <Text>Vocabularies categorized by levels will show here.</Text>}
				</TabPanel>
			</TabPanels>
		</TabGroup>
	);
}
