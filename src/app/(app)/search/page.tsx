"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ placeId: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`/api/restaurants/search?q=${encodeURIComponent(query)}&location=Seattle,WA`);
      const data = await res.json();
      if (data.places) setResults(data.places);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-lg font-medium text-stone-900 mb-3">Search</h1>
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Restaurant name..."
          className="flex-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-900 placeholder:text-stone-400"
        />
        <button
          type="button"
          onClick={search}
          disabled={loading}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>
      <ul className="mt-3 space-y-1">
        {results.map((p) => (
          <li key={p.placeId}>
            <button
              type="button"
              onClick={() => router.push(`/restaurant/${p.placeId}`)}
              className="w-full text-left rounded-md border border-stone-200 bg-white px-3 py-2 text-sm hover:bg-stone-50"
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
