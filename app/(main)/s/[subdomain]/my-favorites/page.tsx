"use client";

import ModalWithCopyPrompt from "@/components/ModalWithCopyPrompt";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface Favorite {
  id: string;
  imageId: string;
  image: {
    id: string;
    imageUrl: string;
    width: number;
    height: number;
    prompt: string;
    seed: string | number;
    createdAt: string;
    user: {
      imageUrl?: string;
      name: string;
      id: string;
    };
  };
}

function sliceWords(text: string, maxWords: number) {
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

export default function MyFavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Favorite | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/user/favorites");
        const json = await res.json();
        if (json.success) {
          setFavorites(json.data);
        } else {
          setError(json.message || "Failed to fetch favorites");
        }
      } catch (err) {
        setError("Failed to fetch favorites");
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, []);

  return (
    <div className="w-full min-h-screen bg-background py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        My Favorites
      </h1>
      {loading ? (
        <div className="masonry-gallery columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4 w-full max-w-6xl mx-auto px-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="mb-4 break-inside-avoid group relative">
              {/* Top skeleton for user info */}
              <div className="absolute top-0 left-0 w-full flex justify-between items-start p-3 z-10">
                <Skeleton className="w-24 h-8 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              {/* Image skeleton */}
              <Skeleton className="w-full aspect-[1/1.3] rounded-xl" />
              {/* Bottom skeleton for prompt */}
              <div className="absolute bottom-0 left-0 w-full z-10 flex justify-start">
                <Skeleton className="w-3/4 h-6 rounded-md m-2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : favorites.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No favorites found.
        </div>
      ) : (
        <div className="masonry-gallery columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4 w-full max-w-6xl mx-auto px-4">
          {favorites.map((fav) => (
            <Card
              key={fav.id}
              className="mb-4 break-inside-avoid p-0 overflow-hidden group relative shadow-lg border-none bg-neutral-900 cursor-pointer"
              onClick={() => setSelected(fav)}
            >
              {/* Top overlay: user info and favorite icon */}
              <div className="absolute top-0 left-0 w-full flex justify-between items-start p-3 z-10 pointer-events-none">
                {/* User info (show on hover with animation) */}
                <div className="flex items-center gap-2 bg-black/60 rounded-full px-2 py-1 pointer-events-auto opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out">
                  {fav.image.user?.imageUrl ? (
                    <img
                      src={fav.image.user.imageUrl}
                      alt={fav.image.user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-6 h-6 text-white/80" />
                  )}
                  <span className="text-xs text-white font-medium max-w-[100px] truncate">
                    {sliceWords(fav.image.user?.name || "", 2)}
                  </span>
                </div>
                {/* Heart icon always filled for favorite */}
                <span
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await fetch("/api/user/favorites", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ favoriteId: fav.id }),
                      });
                      setFavorites((favorites) =>
                        favorites.filter((f) => f.id !== fav.id)
                      );
                    } catch (err) {
                      // Optionally handle error
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full p-1 pointer-events-auto bg-transparent cursor-pointer"
                >
                  <Heart className="w-6 h-6 fill-red-500 text-red-500 transition" />
                </span>
              </div>
              {/* Image fills the card */}
              <img
                src={fav.image.imageUrl}
                alt={fav.image.prompt}
                width={fav.image.width}
                height={fav.image.height}
                className="w-full h-auto block object-cover"
                loading="lazy"
                style={{
                  aspectRatio: `${fav.image.width} / ${fav.image.height}`,
                }}
              />
              {/* Bottom overlay: prompt (show on hover, no background) */}
              <div className="absolute bottom-0 left-0 w-full z-10 pointer-events-none flex justify-start">
                <span className="text-white text-sm font-medium line-clamp-2 w-full block px-2 py-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-auto">
                  {sliceWords(fav.image.prompt, 10)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for image details */}
      {selected && (
        <ModalWithCopyPrompt
          selected={selected.image}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
