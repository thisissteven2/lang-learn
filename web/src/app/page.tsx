"use client";

import { Card, Title, Button } from "@tremor/react";
import { Select, SelectItem, Flex } from "@tremor/react";
import Link from "next/link";

import React from "react";
import { useTheme } from "next-themes";
import { RiSunLine, RiMoonLine, RiContrastLine } from "@remixicon/react";

const isDev = process.env.NODE_ENV === "development";

function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<Flex alignItems="center" className="w-fit">
			<Select defaultValue={theme} onValueChange={(value) => setTheme(value)}>
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

export default function HomePage() {
	return (
		<main className="flex min-h-screen items-center justify-center p-6">
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
				<Link href="/transcripts">
					<Button className="w-full mt-4" variant="secondary">
						View Saved Transcripts
					</Button>
				</Link>
				<ThemeToggle />
			</Card>
		</main>
	);
}
