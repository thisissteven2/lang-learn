"use client";

import { Card, Title, Button } from "@tremor/react";
import Link from "next/link";

export default function HomePage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
			<Card className="max-w-md w-full space-y-4">
				<Title className="text-center">LangLearn</Title>
				<Link href="/fetch-transcripts">
					<Button className="w-full mt-4">Fetch Transcript</Button>
				</Link>
				<Link href="/transcripts">
					<Button className="w-full mt-4" variant="secondary">
						View Saved Transcripts
					</Button>
				</Link>
			</Card>
		</main>
	);
}
