"use client";

import { useQuery } from "@tanstack/react-query";
import { TabGroup, TabList, Tab, Card, Title, Text } from "@tremor/react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchTranscripts } from "@/utils/transcripts";

const LANGUAGES = ["es", "zh", "ja", "ko"];
const ITEMS_PER_PAGE = 6;

export default function TranscriptListPage() {
	const [lang, setLang] = useState("es");
	const [page, setPage] = useState(1);

	const { data = [], isLoading } = useQuery({
		queryKey: ["transcripts", lang],
		queryFn: () => fetchTranscripts(lang),
	});

	// Reset page when language changes
	useEffect(() => {
		setPage(1);
	}, [lang]);

	const paginated = useMemo(() => {
		const start = (page - 1) * ITEMS_PER_PAGE;
		return data.slice(start, start + ITEMS_PER_PAGE);
	}, [data, page]);

	return (
		<div className="p-6 max-w-6xl mx-auto space-y-6">
			<Title>Available Transcripts</Title>

			<TabGroup index={LANGUAGES.indexOf(lang)} onIndexChange={(i) => setLang(LANGUAGES[i])}>
				<TabList>
					{LANGUAGES.map((code) => (
						<Tab key={code}>{code.toUpperCase()}</Tab>
					))}
				</TabList>
			</TabGroup>

			{isLoading ? (
				<Text>Loading...</Text>
			) : (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
						{paginated.map((transcript) => (
							<Link
								key={transcript.videoId}
								href={`/transcripts/${transcript.videoId}?lang=${transcript.language_code[0].code}`}
								className="hover:opacity-90 transition"
							>
								<Card className="overflow-hidden p-0">
									<div className="relative w-full h-40">
										<Image
											src={transcript.videoInfo.thumbnailUrl.hqdefault}
											alt={transcript.videoInfo.name}
											fill
											className="object-cover"
										/>
									</div>
									<div className="p-4">
										<Title className="text-base line-clamp-2">{transcript.videoInfo.name}</Title>
										<Text className="text-sm text-gray-500 mt-1">{transcript.videoInfo.author}</Text>
									</div>
								</Card>
							</Link>
						))}
					</div>

					{data.length > ITEMS_PER_PAGE && (
						<div className="flex justify-center items-center gap-4 pt-6">
							<button
								onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
								disabled={page === 1}
								className="px-4 py-2 text-sm bg-gray-200 rounded disabled:opacity-50"
							>
								Previous
							</button>
							<span className="text-sm">
								Page {page} of {Math.ceil(data.length / ITEMS_PER_PAGE)}
							</span>
							<button
								onClick={() => setPage((prev) => Math.min(prev + 1, Math.ceil(data.length / ITEMS_PER_PAGE)))}
								disabled={page === Math.ceil(data.length / ITEMS_PER_PAGE)}
								className="px-4 py-2 text-sm bg-gray-200 rounded disabled:opacity-50"
							>
								Next
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
