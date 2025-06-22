/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getYoutubeSubsData, getYoutubeSubsTranslations } from "@/utils/cdn";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { createContext, useContext, useState } from "react";

type ColorBy = "none" | "pos" | "freq";
type ColorMode = "text" | "underline";

interface SubtitleSettingsContextType {
	colorBy: ColorBy;
	setColorBy: (value: ColorBy) => void;
	colorMode: ColorMode;
	setColorMode: (value: ColorMode) => void;
	audioOnly: boolean;
	setAudioOnly: (value: boolean) => void;
	showPinyin: boolean;
	setShowPinyin: (value: boolean) => void;
	showTranslation: boolean;
	setShowTranslation: (value: boolean) => void;
	videoId: any;
	lang: string;
	subsData: any;
	subsTranslations: any;
	isLoading: boolean;
}

const SubtitleSettingsContext = createContext<SubtitleSettingsContextType | undefined>(undefined);

export const SubtitleSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [colorBy, setColorBy] = useState<ColorBy>("pos");
	const [colorMode, setColorMode] = useState<ColorMode>("text");
	const [audioOnly, setAudioOnly] = useState<boolean>(false);
	const [showPinyin, setShowPinyin] = useState<boolean>(true);
	const [showTranslation, setShowTranslation] = useState<boolean>(false);

	const { videoId } = useParams();
	const searchParams = useSearchParams();
	const lang = searchParams.get("lang") ?? "es";

	const { data: subsData, isLoading: isSubsDataLoading } = useQuery({
		queryKey: ["subsData", videoId],
		queryFn: () => getYoutubeSubsData(videoId as string),
		enabled: typeof videoId === "string" && !!videoId,
	});

	const { data: subsTranslations, isLoading: isSubsTranslationsLoading } = useQuery({
		queryKey: ["subsTranslations", videoId],
		queryFn: () => getYoutubeSubsTranslations(videoId as string),
		enabled: typeof videoId === "string" && !!videoId,
	});

	return (
		<SubtitleSettingsContext.Provider
			value={{
				colorBy,
				setColorBy,
				colorMode,
				setColorMode,
				audioOnly,
				setAudioOnly,
				showPinyin,
				setShowPinyin,
				showTranslation,
				setShowTranslation,
				videoId,
				lang,
				subsData,
				subsTranslations: subsTranslations?.data,
				isLoading: isSubsDataLoading && isSubsTranslationsLoading,
			}}
		>
			{children}
		</SubtitleSettingsContext.Provider>
	);
};

export function useSubtitleSettings() {
	const context = useContext(SubtitleSettingsContext);
	if (!context) {
		throw new Error("useSubtitleSettings must be used within a SubtitleSettingsProvider");
	}
	return context;
}
