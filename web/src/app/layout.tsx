import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "@/styles/globals.css";
import { QueryProvider } from "./providers";
import { ThemeProvider } from "next-themes";

const lexend = Lexend_Deca({
	weight: ["200", "300", "400", "500", "600", "700"],
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "LangLearn",
	description: "Learn languages through youtube transcripts",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<ThemeProvider attribute="class">
				<body className={`${lexend.className} antialiased dark:bg-[#030712]`}>
					<QueryProvider>{children}</QueryProvider>
				</body>
			</ThemeProvider>
		</html>
	);
}
