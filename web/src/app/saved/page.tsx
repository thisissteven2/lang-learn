"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Card,
	Text,
	Title,
	Select,
	SelectItem,
	TabGroup,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	Button,
} from "@tremor/react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { DictEntryProvider, useDictEntry } from "../transcripts/[videoId]/provider/dict-entry";
import { DictEntry } from "../transcripts/[videoId]/components/react/dict-entry";

export interface WordStatusData {
	word: string;
	pos: string;
	lang: string;
	transliteration: string;
}

const LOCAL_KEY = "wordStatus";
const POS_OPTIONS = [
	"ALL",
	"NOUN",
	"VERB",
	"ADJ",
	"ADV",
	"PRON",
	"PROPN",
	"NUM",
	"ADP",
	"PART",
	"CCONJ",
	"SCONJ",
	"DET",
	"AUX",
	"INTJ",
	"SYM",
	"X",
	"PUNCT",
];

const LANG_OPTIONS = ["ALL", "zh-CN", "es", "ja", "ko"];

export default function Page() {
	return (
		<DictEntryProvider>
			<PageContent />
		</DictEntryProvider>
	);
}

function PageContent() {
	const [data, setData] = useState<Record<string, WordStatusData[]>>({ known: [], learning: [] });
	const [posFilter, setPosFilter] = usePersistedState("posFilter", "ALL");
	const [langFilter, setLangFilter] = usePersistedState("langFilter", "ALL");
	const [lang, setLang] = useState("ALL");

	const { setDictParams, setDrawerOpen, setToken } = useDictEntry();

	useEffect(() => {
		const raw = localStorage.getItem(LOCAL_KEY);
		if (raw) {
			setData(JSON.parse(raw));
		}
	}, []);

	const filterWords = useCallback(
		(words: WordStatusData[]) => {
			return words.filter((entry) => {
				return (posFilter === "ALL" || entry.pos === posFilter) && (langFilter === "ALL" || entry.lang === langFilter);
			});
		},
		[langFilter, posFilter]
	);

	const knownData = useMemo(() => filterWords(data.known), [data.known, filterWords]);
	const learningData = useMemo(() => filterWords(data.learning), [data.learning, filterWords]);

	return (
		<div className="sm:p-4">
			<DictEntry lang={lang === "ALL" ? "" : lang} />

			<Card className="max-w-6xl max-sm:rounded-none max-sm:p-4 mx-auto h-dvh sm:min-h-[calc(100vh-32px)]">
				<Title>📚 Word Review</Title>

				<div className="flex flex-wrap gap-4 mt-4">
					<div>
						<Text className="text-sm font-medium mb-1">Filter by POS</Text>
						<Select value={posFilter} onValueChange={setPosFilter} className="w-40">
							{POS_OPTIONS.map((pos) => (
								<SelectItem key={pos} value={pos}>
									{pos}
								</SelectItem>
							))}
						</Select>
					</div>

					<div>
						<Text className="text-sm font-medium mb-1">Filter by Language</Text>
						<Select value={langFilter} onValueChange={setLangFilter} className="w-40">
							{LANG_OPTIONS.map((lang) => (
								<SelectItem key={lang} value={lang}>
									{lang.toUpperCase()}
								</SelectItem>
							))}
						</Select>
					</div>
				</div>

				<TabGroup>
					<TabList className="pt-2 sticky top-0 z-10 bg-white dark:bg-[#111827]">
						<Tab>
							★ Known <span className="text-sm">({knownData.length})</span>
						</Tab>
						<Tab>
							🧠 Learning <span className="text-sm">({learningData.length})</span>
						</Tab>
					</TabList>

					<TabPanels className="mt-3">
						<TabPanel>
							<div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-3">
								{knownData.map((entry, idx) => (
									<Button
										key={idx}
										onClick={() => {
											setDictParams(`${entry.word},${entry.pos},${entry.lang}`);
											setToken(`${entry.word},${entry.transliteration}`);
											setDrawerOpen(true);
											setLang(entry.lang);
										}}
										variant="secondary"
										className="relative justify-start rounded border border-gray-200 dark:border-gray-700 p-2 text-gray-700 dark:text-gray-200"
									>
										<span className="text-xl">{entry.word}</span>{" "}
										<span className="text-sm text-gray-500 dark:text-gray-400">[{entry.pos}]</span>
										<div className="absolute right-0 top-0 py-1.5 px-2 text-xs text-gray-500 dark:text-gray-400">
											{entry.lang}
										</div>
									</Button>
								))}
							</div>
						</TabPanel>

						<TabPanel>
							<div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-3">
								{learningData.map((entry, idx) => (
									<Button
										key={idx}
										onClick={() => {
											setDictParams(`${entry.word},${entry.pos},${entry.lang}`);
											setToken(`${entry.word},${entry.transliteration}`);
											setDrawerOpen(true);
											setLang(entry.lang);
										}}
										variant="secondary"
										className="relative justify-start rounded border border-gray-200 dark:border-gray-700 p-2 text-gray-700 dark:text-gray-200"
									>
										<span className="text-xl">{entry.word}</span>{" "}
										<span className="text-sm text-gray-500 dark:text-gray-400">[{entry.pos}]</span>
										<div className="absolute right-0 top-0 py-1.5 px-2 text-xs text-gray-500 dark:text-gray-400">
											{entry.lang}
										</div>
									</Button>
								))}
							</div>
						</TabPanel>
					</TabPanels>
				</TabGroup>
			</Card>
		</div>
	);
}
