"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { CafeMarker, SidebarView } from "@/types";
import Sidebar from "@/components/sidebar/Sidebar";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <div className="flex-1 bg-zinc-100 animate-pulse" />,
});

interface PagedResult {
  cafes: CafeMarker[];
  nextPageToken?: string;
}

export default function Home() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [cafes, setCafes] = useState<CafeMarker[]>([]);
  const [sidebarView, setSidebarView] = useState<SidebarView>("prompt");
  const [selectedCafe, setSelectedCafe] = useState<CafeMarker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [prevTokens, setPrevTokens] = useState<(string | undefined)[]>([]);
  const [currentToken, setCurrentToken] = useState<string | undefined>(undefined);

  async function fetchPage(district: string, pageToken: string | undefined) {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ district });
      if (pageToken) params.set("page_token", pageToken);
      const res = await fetch(`/api/places/text-search?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PagedResult = await res.json();
      setCafes(data.cafes ?? []);
      setNextPageToken(data.nextPageToken);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDistrictClick(districtName: string) {
    setSelectedDistrict(districtName);
    setSidebarView("list");
    setSelectedCafe(null);
    setPrevTokens([]);
    setCurrentToken(undefined);
    setNextPageToken(undefined);
    await fetchPage(districtName, undefined);
  }

  async function handleNextPage() {
    if (!selectedDistrict || !nextPageToken) return;
    setPrevTokens((prev) => [...prev, currentToken]);
    setCurrentToken(nextPageToken);
    await fetchPage(selectedDistrict, nextPageToken);
  }

  async function handlePrevPage() {
    if (!selectedDistrict || prevTokens.length === 0) return;
    const prevToken = prevTokens[prevTokens.length - 1];
    setPrevTokens((prev) => prev.slice(0, -1));
    setCurrentToken(prevToken);
    await fetchPage(selectedDistrict, prevToken);
  }

  function handleCafeClick(cafe: CafeMarker) {
    setSelectedCafe(cafe);
    setSidebarView("detail");
  }

  function handleBackToList() {
    setSidebarView("list");
    setSelectedCafe(null);
  }

  return (
    <main className="flex h-screen overflow-hidden">
      <div className="flex-1 relative">
        <MapView
          selectedDistrict={selectedDistrict}
          cafes={cafes}
          onDistrictClick={handleDistrictClick}
          onCafeClick={handleCafeClick}
        />
      </div>
      <Sidebar
        view={sidebarView}
        district={selectedDistrict}
        cafes={cafes}
        selectedCafe={selectedCafe}
        isLoading={isLoading}
        hasPrev={prevTokens.length > 0}
        hasNext={!!nextPageToken}
        onCafeClick={handleCafeClick}
        onBack={handleBackToList}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
      />
    </main>
  );
}
