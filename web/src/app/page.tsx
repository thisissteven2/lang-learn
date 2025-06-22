"use client";

import { Card, Title, Button } from "@tremor/react";
import Link from "next/link";

const isDev = process.env.NODE_ENV === "development";

export default function HomePage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
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
			</Card>
		</main>
	);
}
