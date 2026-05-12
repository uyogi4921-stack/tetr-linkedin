"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ResourceCard from "@/components/ResourceCard";

const RESOURCE_TYPES = ["All", "Guide", "Competition deck", "Company list", "Template", "Video"];

export default function ResourcesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [type, setType] = useState("All");
  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    setLoadingResources(true);
    const params = type === "All" ? "" : `?type=${encodeURIComponent(type)}`;
    fetch(`/api/resources${params}`)
      .then(r => r.json())
      .then(d => { setResources(d.resources || []); setLoadingResources(false); });
  }, [user, loading, router, type]);

  if (loading || !user) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-tetr-gray-light">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-tetr-dark mb-1">Resources</h1>
        <p className="text-sm text-tetr-gray mb-6">
          Guides, templates, competition decks, and more — curated for Tetr students.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {RESOURCE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`badge cursor-pointer text-sm ${
                type === t ? "bg-tetr-green text-white" : "badge-gray hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loadingResources ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-tetr-green border-t-transparent rounded-full animate-spin" /></div>
        ) : resources.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-tetr-gray">No resources found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
