/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { cx } from "@/lib/utils";
import { RiFileCopyFill, RiFileCopyLine } from "@remixicon/react";
import { useRef, useState } from "react";

export function CopyButton({ text, className }: { text: string; className?: string }) {
	const [isCopied, setIsCopied] = useState(false);
	const timeoutRef = useRef<any>(0);

	return (
		<button
			onClick={() => {
				clearTimeout(timeoutRef.current);
				navigator.clipboard.writeText(text);
				setIsCopied(true);
				timeoutRef.current = setTimeout(() => {
					setIsCopied(false);
				}, 3000);
			}}
			className={cx("absolute right-4 top-4 opacity-50 active:opacity-100", className)}
		>
			{isCopied ? <RiFileCopyFill /> : <RiFileCopyLine />}
		</button>
	);
}
