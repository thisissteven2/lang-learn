/* eslint-disable @typescript-eslint/no-explicit-any */
interface FreqRange {
	min: number;
	max: number;
}

interface DurationRange {
	min: number | null;
	max: number | null;
}

interface FetchMediaParams {
	freq95?: FreqRange;
	searchText?: string;
	sortBy?: string;
	duration?: DurationRange;
}

interface FetchMediaDocsParams extends FetchMediaParams {
	diocoPlaylistId: string;
	forceIncludeDiocoDocId?: string | null;
}

const BASE_FILTERS = {
	mediaTab: "TAB_YOUTUBE",
	searchText: "",
	duration: { min: null, max: null },
	sortBy: "date",
};

export async function fetchMediaPlaylists({
	freq95 = { min: 0, max: 100000 },
	searchText = "",
	sortBy = "date",
	duration = { min: null, max: null },
}: FetchMediaParams): Promise<any> {
	const payload = {
		auth: null,
		translationLang_G: "en",
		freq95,
		lang_G: "es",
		filters: {
			...BASE_FILTERS,
			searchText,
			sortBy,
			duration,
		},
		pinnedDiocoPlaylistIds: [],
	};

	const response = await fetch("https://api-cdn.dioco.io/base_media_getMediaPlaylists_5", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch media playlists: ${response.statusText}`);
	}

	return response.json();
}

export async function fetchMediaDocs({
	diocoPlaylistId,
	freq95 = { min: 0, max: 100000 },
	searchText = "",
	sortBy = "date",
	duration = { min: null, max: null },
	forceIncludeDiocoDocId = null,
}: FetchMediaDocsParams): Promise<any> {
	const payload = {
		auth: null,
		translationLang_G: "en",
		freq95,
		lang_G: "es",
		filters: {
			...BASE_FILTERS,
			searchText,
			sortBy,
			duration,
		},
		pinnedDiocoPlaylistIds: [],
		diocoPlaylistId,
		forceIncludeDiocoDocId,
	};

	const response = await fetch("https://api-cdn.dioco.io/base_media_getMediaDocs_5", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch media docs: ${response.statusText}`);
	}

	return response.json();
}
