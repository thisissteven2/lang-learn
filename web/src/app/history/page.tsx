"use client";

import { usePersistedState } from "@/hooks/usePersistedState";
import { useYouTubeHistory } from "@/hooks/useYoutubeHistory";
import { Card, Grid, Tab, TabGroup, TabList, Title, Text } from "@tremor/react";
import { LANGUAGES } from "../transcripts/[videoId]/components/constants";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

function formatTime(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);

	const pad = (num: number) => String(num).padStart(2, "0");

	if (h > 0) {
		return `${h}:${pad(m)}:${pad(s)}`;
	} else {
		return `${m}:${pad(s)}`;
	}
}

export default function Page() {
	const [lang, setLang] = usePersistedState("lang", "zh-CN");

	const { getHistory } = useYouTubeHistory();

	const history = useMemo(() => {
		return getHistory().filter((metadata) => metadata.lang === lang);
	}, [getHistory, lang]);

	return (
		<div className="pb-6 max-w-6xl mx-auto space-y-4">
			<div className="sticky top-0 pt-3 space-y-3 px-4 sm:pt-6 sm:px-6 sm:space-y-4 z-10 bg-white dark:bg-[#030712]">
				<Title>🕘 Watch History</Title>

				<TabGroup
					index={LANGUAGES.indexOf(lang)}
					onIndexChange={(i) => {
						setLang(LANGUAGES[i]);
					}}
				>
					<TabList>
						{LANGUAGES.map((code) => (
							<Tab key={code}>{code.toUpperCase()}</Tab>
						))}
					</TabList>
				</TabGroup>
			</div>

			<div className="px-3 sm:px-5">
				<Grid numItemsMd={2} numItemsLg={3} className="gap-4">
					{history.length === 0 ? (
						<Text className="text-sm">You have watched 0 videos.</Text>
					) : (
						history.map((metadata) => {
							return (
								<Link
									key={metadata.videoId}
									href={`/transcripts/${metadata.videoId}?lang=${metadata.lang}&last_watched=${metadata.lastTimestamp}`}
									className="hover:opacity-90 transition"
								>
									<Card className="overflow-hidden p-0">
										<div className="relative w-full h-40">
											<Image
												src={metadata.thumbnail_url}
												alt="thumbnail"
												className="w-full h-full object-cover"
												width={480}
												height={480}
											/>
											<span className="absolute bottom-1 right-1 inline-flex items-center rounded-md bg-gray-800/80 px-2 py-1 text-xs font-medium text-gray-100 ring-inset">
												{formatTime(metadata.maxTimestamp - metadata.lastTimestamp)}
											</span>
										</div>

										<div className="h-1 w-full bg-gray-300 dark:bg-gray-700">
											<div
												className="bg-red-500 dark:bg-red-500 h-full"
												style={{
													width: `${(metadata.lastTimestamp / metadata.maxTimestamp) * 100}%`,
												}}
											></div>
										</div>
										<div className="p-3">
											<Title className="text-base line-clamp-2">{metadata.title}</Title>
											<Text className="text-sm text-gray-500 mt-1">{metadata.author_name}</Text>
										</div>
									</Card>
								</Link>
							);
						})
					)}
				</Grid>
			</div>
		</div>
	);
}
