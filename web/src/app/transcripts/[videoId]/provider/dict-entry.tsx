"use client";

import { DictEntry, getDictTTS, getFullDict, getSentenceTTS } from "@/utils/cdn";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useState } from "react";

interface DictEntryContextType {
	drawerOpen: boolean;
	setDrawerOpen: (value: boolean) => void;
	token: string;
	setToken: (value: string) => void;
	setDictParams: (value: string) => void;
	setSentenceParams: (value: string) => void;
	isLoading: boolean;
	dictEntry?: DictEntry;
	audio?: string;
	sentenceAudio?: string;
	lang: string;
}

const DictEntryContext = createContext<DictEntryContextType | undefined>(undefined);

export const DictEntryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
	const [dictParams, setDictParams] = useState<string>("");
	const [sentenceParams, setSentenceParams] = useState<string>("");
	const [token, setToken] = useState<string>("");

	const searchParams = useSearchParams();
	const lang = searchParams.get("lang") ?? "es";

	const { data: dictEntry, isLoading } = useQuery({
		queryKey: ["dictEntry", dictParams],
		queryFn: () => {
			const [form, pos] = dictParams.split(",");
			return getFullDict({
				form,
				lemma: "",
				sl: lang,
				tl: "en",
				pos,
				pow: "n",
			});
		},
		enabled: dictParams.length > 0,
	});

	const { data: audio } = useQuery({
		queryKey: ["audio", dictParams],
		queryFn: () => {
			const [text] = dictParams.split(",");
			return getDictTTS(lang, text);
		},
		enabled: dictParams.length > 0,
	});

	const { data: sentenceAudio } = useQuery({
		queryKey: ["sentence-audio", sentenceParams],
		queryFn: () => {
			const [text, hash] = sentenceParams.split(",");
			return getSentenceTTS(lang, text, hash);
		},
		enabled: sentenceParams.length > 0,
	});

	return (
		<DictEntryContext.Provider
			value={{
				drawerOpen,
				setDrawerOpen,
				dictEntry: dictEntry?.data,
				isLoading,
				audio,
				setDictParams,
				token,
				setToken,
				setSentenceParams,
				sentenceAudio,
				lang,
			}}
		>
			{children}
		</DictEntryContext.Provider>
	);
};

export function useDictEntry() {
	const context = useContext(DictEntryContext);
	if (!context) {
		throw new Error("useDictEntry must be used within a DictEntryProvider");
	}
	return context;
}
