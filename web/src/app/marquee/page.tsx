"use client";

import { useEffect, useRef, useState } from "react";

export default function Page() {
	const width = 864;
	const duration = 5; // in seconds
	const pxPerSecond = width / duration;

	const [playing, setPlaying] = useState(false);
	const [elapsedTime, setElapsedTime] = useState(0); // in seconds

	const rafRef = useRef<number | null>(null);
	const lastTickRef = useRef<number | null>(null);

	// Animate manually
	useEffect(() => {
		if (!playing) {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
			return;
		}

		function tick(now: number) {
			if (lastTickRef.current === null) lastTickRef.current = now;
			const delta = (now - lastTickRef.current) / 1000;
			lastTickRef.current = now;

			setElapsedTime((t) => Math.min(t + delta, duration));
			rafRef.current = requestAnimationFrame(tick);
		}

		rafRef.current = requestAnimationFrame(tick);
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			lastTickRef.current = null;
		};
	}, [playing]);

	// Skip forward or backward
	function skip(seconds: number) {
		setElapsedTime((t) => {
			const newTime = Math.min(Math.max(t + seconds, 0), duration);
			return newTime;
		});
	}

	const offset = -(elapsedTime * pxPerSecond);

	return (
		<div className="grid gap-4 m-4">
			{/* Buttons */}
			<div className="flex gap-2">
				<button className="px-4 py-1 bg-green-500 text-white rounded" onClick={() => setPlaying(true)}>
					Play
				</button>
				<button className="px-4 py-1 bg-red-500 text-white rounded" onClick={() => setPlaying(false)}>
					Pause
				</button>
				<button className="px-4 py-1 bg-blue-500 text-white rounded" onClick={() => skip(2)}>
					Skip +2s
				</button>
				<button className="px-4 py-1 bg-blue-500 text-white rounded" onClick={() => skip(-2)}>
					Skip -2s
				</button>
			</div>

			<div className="relative overflow-hidden h-4 mt-4 bg-white border rounded">
				{/* Center time indicator */}
				<div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-500 z-10 transform -translate-x-1/2 rounded-full" />

				{/* Timeline container with manual transform */}
				<div
					className="absolute top-0 left-1/2 h-full will-change-transform"
					style={{
						width: `${width}px`,
						transform: `translateX(${offset}px)`,
					}}
				>
					<div className="flex gap-4">
						<div className="bg-gray-200 w-40 h-4 rounded-md shrink-0"></div>
						<div className="bg-gray-200 w-40 h-4 rounded-md shrink-0"></div>
						<div className="bg-gray-200 w-40 h-4 rounded-md shrink-0"></div>
						<div className="bg-gray-200 w-40 h-4 rounded-md shrink-0"></div>
						<div className="bg-gray-200 w-40 h-4 rounded-md shrink-0"></div>
					</div>
				</div>
			</div>
		</div>
	);
}
