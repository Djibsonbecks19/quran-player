import "./globals.css";
import { PlayerProvider } from "@/lib/PlayerContext";

export const metadata = {
  title: "Tilawa - Quran Player",
  description: "Listen to the Quran with your favourite reciters.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Tilawa", statusBarStyle: "black-translucent" },
};
export const viewport = { themeColor: "#000000", width: "device-width", initialScale: 1 };

// sets light/dark BEFORE first paint so there is no flash
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body><PlayerProvider>{children}</PlayerProvider></body>
    </html>
  );
}
