import { useMemo, useEffect, useRef, useState } from "react";

interface Subtitle {
	begin: number; // in ms
	end: number;
}

interface SubtitleScrollerProps {
	subtitles: Subtitle[];
	duration: number;
	currentTime: number;
	playing: boolean;
}

const pxPerSecond = 48;

type SubtitleWithGhost = Subtitle & { ghost?: boolean };

function withGhostSubtitles(subtitles: Subtitle[], duration: number): SubtitleWithGhost[] {
	const result: SubtitleWithGhost[] = [];

	for (let i = 0; i < subtitles.length; i++) {
		const current = subtitles[i];
		result.push(current);

		const next = subtitles[i + 1];
		if (next && next.begin > current.end) {
			result.push({ begin: current.end, end: next.begin, ghost: true });
		}
	}

	const last = subtitles[subtitles.length - 1];
	if (last.end < duration * 1000) {
		result.push({ begin: last.end, end: duration * 1000, ghost: true });
	}

	return result;
}

export function SubtitleScroller({ subtitles, duration, currentTime, playing }: SubtitleScrollerProps) {
	const totalWidth = duration * pxPerSecond;
	const [animationKey, setAnimationKey] = useState(0);
	const prevTimeRef = useRef(currentTime);
	const wasPlayingRef = useRef(playing);

	// Only reset animation when seek happens (big jump) or resume from pause
	useEffect(() => {
		const timeDiff = Math.abs(currentTime - prevTimeRef.current);
		const resumedFromPause = !wasPlayingRef.current && playing;

		if (timeDiff > 1.5 || resumedFromPause) {
			setAnimationKey((k) => k + 1); // reset animation
		}

		prevTimeRef.current = currentTime;
		wasPlayingRef.current = playing;
	}, [currentTime, playing]);

	const animationStyle = useMemo(() => {
		if (!playing) return undefined;

		return {
			animation: `scroll-track ${duration}s linear forwards`,
			animationDelay: `-${currentTime}s`,
			animationPlayState: "running",
		};
		// Only regenerate when animation resets
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [animationKey, playing]);

	const displayedSubtitles = useMemo(() => {
		if (subtitles.length > 0) return withGhostSubtitles(subtitles, duration);
		return [];
	}, [subtitles, duration]);

	return (
		<div className="relative overflow-hidden h-4 mt-4">
			{/* Center time indicator */}
			<div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-500 z-10 transform -translate-x-1/2 rounded-full" />

			{/* Timeline container */}
			<div
				key={animationKey}
				className="absolute top-0 left-1/2 h-full will-change-transform"
				style={{
					width: `${totalWidth}px`,
					position: "relative",
					...(animationStyle || {
						transform: `translateX(-${currentTime * pxPerSecond}px)`,
					}),
				}}
			>
				{displayedSubtitles.map((sub, i) => {
					const width = ((sub.end - sub.begin) / 1000) * pxPerSecond;
					const left = (sub.begin / 1000) * pxPerSecond;

					return (
						<div
							key={i}
							className="absolute h-full pr-4"
							style={{
								width: `${width}px`,
								left: `${left}px`,
							}}
						>
							<div className={`h-full w-full rounded-md ${sub.ghost ? "bg-gray-100 opacity-30" : "bg-gray-200"}`} />
						</div>
					);
				})}
			</div>

			<style jsx>{`
				@keyframes marquee {
					from {
						transform: translateX(0);
					}
					to {
						transform: translateX(-${totalWidth}px);
					}
				}

				.animate-marquee {
					animation: marquee 5s linear forwards;
				}
			`}</style>
		</div>
	);
}
