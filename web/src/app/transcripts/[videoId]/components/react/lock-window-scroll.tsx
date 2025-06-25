"use client";

import { RiLockFill, RiLockLine } from "@remixicon/react";
import { Button } from "@tremor/react";
import { useEffect, useState } from "react";

export function LockWindowScroll() {
	const [lock, setLock] = useState(false);

	useEffect(() => {
		if (lock) {
			document.body.style.overflowY = "hidden";
		} else {
			document.body.style.overflowY = "auto";
		}
	}, [lock]);

	return (
		<Button
			size="xs"
			variant="light"
			className="absolute top-1/2 -translate-y-1/2 right-2"
			onClick={() => setLock(!lock)}
		>
			{lock ? <RiLockFill /> : <RiLockLine className="opacity-50" />}
		</Button>
	);
}
