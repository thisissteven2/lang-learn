"use client";

import * as React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";

export function QueryProvider({ children }: { children: ReactNode }) {
	const [client] = useState(() => new QueryClient());
	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function ScrollLockHandler() {
	const pathname = usePathname();

	React.useEffect(() => {
		const isTranscriptPage = /^\/transcripts\/[^/]+$/.test(pathname);
		if (!isTranscriptPage) {
			document.body.style.overflowY = "auto";
		}
	}, [pathname]);

	return null;
}
