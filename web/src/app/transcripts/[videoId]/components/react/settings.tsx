"use client";

import { Card, Text, Title, Switch, Select, SelectItem } from "@tremor/react";
import { useSubtitleSettings } from "../../provider/subtitle-settings";

export function SubtitleSettings() {
	const {
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
	} = useSubtitleSettings();

	return (
		<Card className="max-w-4xl mx-auto max-sm:rounded-none max-sm:shadow-none">
			<Title>Subtitle Settings</Title>

			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 mt-2">
				{/* Left side: Color mode */}
				<div className="flex flex-wrap gap-2 items-center">
					<Text className="shrink-0">Color by:</Text>
					<Select
						value={colorBy}
						onValueChange={(v) => setColorBy(v as "none" | "pos" | "freq")}
						className="min-w-[140px]"
					>
						<SelectItem value="none">No Color</SelectItem>
						<SelectItem value="pos">Part of Speech</SelectItem>
						<SelectItem value="freq">Vocabulary Level</SelectItem>
					</Select>
				</div>

				{/* Right side: Extra config toggles */}
				<div className="flex flex-wrap w-full lg:grid lg:grid-cols-2 gap-4 items-center">
					<div className="flex justify-between shrink-0 w-full gap-2">
						<Text>Underline</Text>
						<Switch checked={colorMode === "underline"} onChange={(v) => setColorMode(v ? "underline" : "text")} />
					</div>

					<div className="flex justify-between shrink-0 w-full gap-2">
						<Text>Audio Only</Text>
						<Switch checked={audioOnly} onChange={(v) => setAudioOnly(v)} />
					</div>

					<div className="flex justify-between shrink-0 w-full gap-2">
						<Text>Show Translation</Text>
						<Switch checked={showTranslation} onChange={(v) => setShowTranslation(v)} />
					</div>

					<div className="flex justify-between shrink-0 w-full gap-2">
						<Text>Show Transliteration</Text>
						<Switch checked={showPinyin} onChange={(v) => setShowPinyin(v)} />
					</div>
				</div>
			</div>
		</Card>
	);
}
