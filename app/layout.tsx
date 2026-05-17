import type { Metadata } from "next";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Coffee Map",
  description: "台北咖啡地圖",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full antialiased">
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
