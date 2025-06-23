"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Title, Text, Grid, TabGroup, TabList, Tab, SearchSelect, SearchSelectItem } from "@tremor/react";
import { DocsMetadaum, fetchMediaDocs, fetchMediaPlaylists } from "@/utils/media";
import Image from "next/image";
import Link from "next/link";
import { usePersistedState } from "@/hooks/usePersistedState";

const LANGUAGES = ["es", "zh-CN", "zh-TW", "ja", "ko"];

const YoutubeCard = ({ doc }: { doc: DocsMetadaum }) => {
	const [error, setError] = useState(false);

	if (error) return null;

	return (
		<Link
			key={doc.diocoDocId}
			href={`/transcripts/${doc.info.videoId}?lang=${doc.lang_G}`}
			className="hover:opacity-90 transition"
		>
			<Card className="overflow-hidden p-0">
				<div className="relative w-full h-40">
					<Image
						onError={() => setError(true)}
						src={error ? "https://placehold.co/320x180" : doc.image.src}
						alt="thumbnail"
						className="w-full h-full object-cover"
						width={480}
						height={480}
					/>
				</div>
				<div className="p-3">
					<Title className="text-base line-clamp-2">
						{doc.diocoDocName_translation?.translation || doc.diocoDocName}
					</Title>
					<Text className="text-sm text-gray-500 mt-1">
						{new Date(doc.publishDate.timestamp_unixms).toLocaleDateString()} • {doc.info.viewCount} views
					</Text>
					<Text className="text-sm mt-1 text-purple-700">{doc.freqRank95}</Text>
				</div>
			</Card>
		</Link>
	);
};

export default function Page() {
	const [lang, setLang] = usePersistedState("lang", "zh-CN");

	const [selectedPlaylistId, setSelectedPlaylistId] = usePersistedState<string | undefined>(
		"selectedPlaylistId",
		undefined
	);
	const [vocabRange] = useState<number[]>([0, 100000]);

	const { data: playlists, isLoading: isLoadingPlaylists } = useQuery({
		queryKey: ["playlists", lang],
		queryFn: () => fetchMediaPlaylists({ freq95: { min: vocabRange[0], max: vocabRange[1] }, lang_G: lang }),
	});

	const { data: docs, isLoading: isLoadingDocs } = useQuery({
		queryKey: ["docs", selectedPlaylistId, vocabRange, lang],
		queryFn: () =>
			selectedPlaylistId
				? fetchMediaDocs({
						diocoPlaylistId: selectedPlaylistId,
						freq95: { min: vocabRange[0], max: vocabRange[1] },
						lang_G: lang,
				  })
				: fetchMediaDocs({
						diocoPlaylistId: `t_yt_all_${lang}`,
						freq95: { min: vocabRange[0], max: vocabRange[1] },
						lang_G: lang,
				  }),
	});

	return (
		<div className="pb-6 max-w-6xl mx-auto space-y-4">
			<div className="sticky top-0 pt-3 space-y-3 px-4 sm:pt-6 sm:px-6 sm:space-y-4 z-10 bg-white dark:bg-[#030712]">
				<Title>🎥 Videos</Title>

				<div className="space-y-2">
					<Text className="mb-2">Channel / Playlist</Text>
					<SearchSelect
						value={selectedPlaylistId}
						onValueChange={(val) => setSelectedPlaylistId(val)}
						placeholder="Select a playlist"
						className="mb-6 max-w-sm"
						disabled={isLoadingPlaylists}
					>
						{playlists?.data?.playlists.map((playlist) => (
							<SearchSelectItem key={playlist.diocoPlaylistId} value={playlist.diocoPlaylistId}>
								{/* <div className="flex gap-2 items-center">
									<div className="w-10 h-10 relative rounded-full overflow-hidden shrink-0">
										<Image
											src={playlist.image_small?.src || "https://placehold.co/320x180"}
											alt="thumbnail"
											fill
											className="w-full h-full object-cover"
										/>
									</div>
									{playlist.title}
								</div> */}

								{playlist.title}
							</SearchSelectItem>
						))}
					</SearchSelect>
				</div>

				<TabGroup
					index={LANGUAGES.indexOf(lang)}
					onIndexChange={(i) => {
						setLang(LANGUAGES[i]);
						setSelectedPlaylistId(undefined);
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
				{isLoadingDocs ? (
					<Text>Loading...</Text>
				) : (
					<Grid numItemsMd={2} numItemsLg={3} className="gap-4">
						{docs?.data?.docs_metadata.map((doc) => {
							return <YoutubeCard key={doc.diocoDocId} doc={doc} />;
						})}
					</Grid>
				)}
			</div>
		</div>
	);
}
