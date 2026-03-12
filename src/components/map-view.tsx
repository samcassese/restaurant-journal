"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Pin = {
  restaurant_id: string;
  name: string;
  latitude: number;
  longitude: number;
  google_place_id: string;
  type: "visited" | "want";
};

export function MapView({
  visited,
  wantToTry,
}: {
  visited: Pin[];
  wantToTry: Pin[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selected, setSelected] = useState<Pin | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key || !mapRef.current) return;

    const loadScript = () => {
      if (window.google?.maps) {
        const m = new google.maps.Map(mapRef.current!, {
          center: { lat: 47.6062, lng: -122.3321 },
          zoom: 10,
          mapId: undefined,
        });
        setMap(m);
        return;
      }
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
      script.async = true;
      script.onload = () => {
        const m = new google.maps.Map(mapRef.current!, {
          center: { lat: 47.6062, lng: -122.3321 },
          zoom: 10,
        });
        setMap(m);
      };
      document.head.appendChild(script);
    };

    loadScript();
  }, []);

  useEffect(() => {
    if (!map || (!visited.length && !wantToTry.length)) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const all: Pin[] = [...visited, ...wantToTry];
    const bounds = new google.maps.LatLngBounds();

    all.forEach((pin) => {
      const marker = new google.maps.Marker({
        position: { lat: pin.latitude, lng: pin.longitude },
        map,
        title: pin.name,
        icon: pin.type === "visited"
          ? undefined
          : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });
      marker.addListener("click", () => setSelected(pin));
      markersRef.current.push(marker);
      bounds.extend({ lat: pin.latitude, lng: pin.longitude });
    });

    if (all.length > 0) map.fitBounds(bounds, 40);
  }, [map, visited, wantToTry]);

  return (
    <div className="flex-1 relative">
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />
      {selected && (
        <div className="absolute bottom-3 left-3 right-3 z-10 rounded-md border border-stone-200 bg-white p-3">
          <h3 className="text-sm font-medium text-stone-900">{selected.name}</h3>
          <span className="text-xs text-stone-500">
            {selected.type === "visited" ? "Visited" : "Want to try"}
          </span>
          <div className="mt-1.5">
            <Link
              href={`/restaurant/${selected.google_place_id}`}
              className="text-xs text-brand-700 hover:underline"
            >
              View restaurant
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute top-1.5 right-1.5 text-stone-400 hover:text-stone-600 text-sm"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
