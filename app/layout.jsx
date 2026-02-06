import "./globals.css";

export const metadata = {
  title: "ፊደል — Learn Geʽez",
  description: "A gamified app to learn the Geʽez (Ethiopic) alphabet — 26 consonants × 7 vowel forms",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans min-h-dvh overflow-x-hidden" suppressHydrationWarning>
        <a href="#main" className="sr-only-focusable">Skip to main content</a>
        <main id="main" className="min-h-dvh">
          {children}
        </main>
      </body>
    </html>
  );
}
