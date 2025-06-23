"use client";

import { Card, Title, Button, TextInput, Select, SelectItem, Flex, Callout } from "@tremor/react";
import Link from "next/link";
import React, { useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import {
	RiSunLine,
	RiMoonLine,
	RiContrastLine,
	RiSearchLine,
	RiErrorWarningLine,
	RiLoader4Line,
} from "@remixicon/react";

const isDev = process.env.NODE_ENV === "development";

function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<Flex alignItems="center" justifyContent="end" className="w-full">
			<Select className="w-fit" defaultValue={theme} onValueChange={(value) => setTheme(value)}>
				<SelectItem value="light" icon={RiSunLine}>
					Light
				</SelectItem>
				<SelectItem value="dark" icon={RiMoonLine}>
					Dark
				</SelectItem>
				<SelectItem value="system" icon={RiContrastLine}>
					System
				</SelectItem>
			</Select>
		</Flex>
	);
}

function extractYouTubeVideoId(url: string): string | null {
	try {
		const parsed = new URL(url);
		if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
		if (parsed.hostname.includes("youtube.com")) {
			return parsed.searchParams.get("v");
		}
		return null;
	} catch {
		return null;
	}
}

export default function HomePage() {
	const [lang, setLang] = useState("");
	const [url, setUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleWatchVideo = () => {
		setError(null);
		setLoading(true);

		// Small delay for UX smoothness
		setTimeout(() => {
			const videoId = extractYouTubeVideoId(url);
			if (videoId) {
				router.push(`/transcripts/${videoId}?lang=${lang}`);
			} else {
				setError("Please enter a valid YouTube URL.");
				setLoading(false);
			}
		}, 300);
	};

	return (
		<main className="flex min-h-screen items-center justify-center p-6 flex-col space-y-6">
			<Card className="max-w-md w-full space-y-4">
				<Title className="text-center">LangLearn</Title>
				{isDev && (
					<Link href="/fetch-transcripts">
						<Button className="w-full mt-4">Fetch Transcript</Button>
					</Link>
				)}
				{isDev && (
					<Link href="/fetch-ollama">
						<Button className="w-full mt-4">Fetch Ollama</Button>
					</Link>
				)}
				<Link href="/saved">
					<Button className="w-full mt-4" variant="secondary">
						📚 Word Review
					</Button>
				</Link>
				<Link href="/transcripts">
					<Button className="w-full mt-4" variant="secondary">
						🎥 Videos
					</Button>
				</Link>
				<ThemeToggle />
			</Card>

			<Card className="max-w-md w-full space-y-4">
				<Title className="text-center">Watch a YouTube Video</Title>

				<Select value={lang} onValueChange={setLang} placeholder="Select Video Language">
					<SelectItem value="ja">Japanese</SelectItem>
					<SelectItem value="ko">Korean</SelectItem>
					<SelectItem value="es">Spanish</SelectItem>
					<SelectItem value="zh-CN">Chinese Simplified</SelectItem>
					<SelectItem value="zh-TW">Chinese Traditional</SelectItem>
				</Select>

				<TextInput
					disabled={!lang}
					icon={RiSearchLine}
					placeholder="Paste YouTube link here"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					error={!!error}
				/>

				{error && (
					<Callout title="Invalid link" color="rose" icon={RiErrorWarningLine}>
						{error}
					</Callout>
				)}

				<Button
					className="w-full"
					onClick={handleWatchVideo}
					disabled={loading}
					icon={loading ? RiLoader4Line : undefined}
					iconPosition="right"
				>
					{loading ? "Loading..." : "▶️ Watch Video"}
				</Button>

				<Button variant="secondary" className="w-full" onClick={() => router.push("/history")}>
					🕘 Watch History
				</Button>
			</Card>
		</main>
	);
}
