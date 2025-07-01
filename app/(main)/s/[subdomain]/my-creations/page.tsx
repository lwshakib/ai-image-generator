"use client";

import ModalWithCopyPrompt from "@/components/ModalWithCopyPrompt";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, UserCircle } from "lucide-react";
import { useEffect, useState as useReactState, useState } from "react";

type Favorite = { id: string; imageId: string };

interface ImageCreation {
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
  favoriteId?: string | null;
}

function sliceWords(text: string, maxWords: number) {
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

function MyCreationsPage() {
  const [creations, setCreations] = useState<ImageCreation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ImageCreation | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [pending, setPending] = useState<string[]>([]);
  const [downloaded, setDownloaded] = useReactState(false);
  const [shared, setShared] = useReactState(false);

  useEffect(() => {
    async function fetchCreationsAndFavorites() {
      setLoading(true);
      setError(null);
      try {
        const [creationsRes, favoritesRes] = await Promise.all([
          fetch("/api/user/creations"),
          fetch("/api/user/favorites"),
        ]);
        const creationsJson = await creationsRes.json();
        const favoritesJson = await favoritesRes.json();
        if (creationsJson.success && favoritesJson.success) {
          const favs: Favorite[] = favoritesJson.data;
          setFavorites(favs);
          const creationsWithFav = creationsJson.data.map(
            (img: ImageCreation) => {
              const fav = favs.find((f) => f.imageId === img.id);
              return { ...img, favoriteId: fav ? fav.id : null };
            }
          );
          setCreations(creationsWithFav);
        } else {
          setError("Failed to fetch creations or favorites");
        }
      } catch (err) {
        setError("Failed to fetch creations or favorites");
      } finally {
        setLoading(false);
      }
    }
    fetchCreationsAndFavorites();
  }, []);

  const handleFavoriteToggle = async (
    e: React.MouseEvent,
    image: ImageCreation
  ) => {
    e.stopPropagation();
    setPending((p) => [...p, image.id]);
    if (image.favoriteId) {
      setCreations((cs) =>
        cs.map((img) =>
          img.id === image.id ? { ...img, favoriteId: undefined } : img
        )
      );
      try {
        await fetch("/api/user/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favoriteId: image.favoriteId }),
        });
        setFavorites((favs) => favs.filter((f) => f.imageId !== image.id));
      } catch {}
    } else {
      setCreations((cs) =>
        cs.map((img) =>
          img.id === image.id ? { ...img, favoriteId: "pending" } : img
        )
      );
      try {
        const res = await fetch("/api/user/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId: image.id }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setCreations((cs) =>
            cs.map((img) =>
              img.id === image.id ? { ...img, favoriteId: json.data.id } : img
            )
          );
          setFavorites((favs) => [
            ...favs,
            { id: json.data.id, imageId: image.id },
          ]);
        } else {
          setCreations((cs) =>
            cs.map((img) =>
              img.id === image.id ? { ...img, favoriteId: undefined } : img
            )
          );
        }
      } catch {
        setCreations((cs) =>
          cs.map((img) =>
            img.id === image.id ? { ...img, favoriteId: undefined } : img
          )
        );
      }
    }
    setPending((p) => p.filter((id) => id !== image.id));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(selected!.imageUrl);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `image-${selected!.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 1000);
    } catch {}
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this AI generated image!",
          url: selected!.imageUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 1000);
      } catch {}
    } else {
      // fallback: copy image URL
      try {
        await navigator.clipboard.writeText(selected!.imageUrl);
        setShared(true);
        setTimeout(() => setShared(false), 1000);
      } catch {}
    }
  };

  return (
    <div className="w-full min-h-screen bg-background py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        My Creations
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
      ) : creations.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No creations found.
        </div>
      ) : (
        <div className="masonry-gallery columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4 w-full max-w-6xl mx-auto px-4">
          {creations.map((item) => (
            <Card
              key={item.id}
              className="mb-4 break-inside-avoid p-0 overflow-hidden group relative shadow-lg border-none bg-neutral-900 cursor-pointer"
              onClick={() => setSelected(item)}
            >
              {/* Top overlay: user info and favorite icon */}
              <div className="absolute top-0 left-0 w-full flex justify-between items-start p-3 z-10 pointer-events-none">
                {/* User info (show on hover with animation) */}
                <div
                  className="flex items-center gap-2 bg-black/60 rounded-full px-2 py-1 pointer-events-auto
                  opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out"
                >
                  {item.user?.imageUrl ? (
                    <img
                      src={item.user.imageUrl}
                      alt={item.user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-6 h-6 text-white/80" />
                  )}
                  <span className="text-xs text-white font-medium max-w-[100px] truncate">
                    {sliceWords(item.user?.name || "", 2)}
                  </span>
                </div>
                {/* Favorite icon (show on hover) */}
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full p-1 pointer-events-auto bg-transparent cursor-pointer"
                  style={{ pointerEvents: "auto" }}
                  onClick={(e) => handleFavoriteToggle(e, item)}
                  aria-label={item.favoriteId ? "Unfavorite" : "Favorite"}
                  type="button"
                  disabled={pending.includes(item.id)}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      item.favoriteId
                        ? "fill-red-500 text-red-500"
                        : "text-white"
                    } transition`}
                  />
                </button>
              </div>
              {/* Image fills the card */}
              <img
                src={item.imageUrl}
                alt={item.prompt}
                width={item.width}
                height={item.height}
                className="w-full h-auto block object-cover"
                loading="lazy"
                style={{ aspectRatio: `${item.width} / ${item.height}` }}
              />
              {/* Bottom overlay: prompt (show on hover, no background) */}
              <div className="absolute bottom-0 left-0 w-full z-10 pointer-events-none flex justify-start">
                <span
                  className="text-white text-sm font-medium line-clamp-2 w-full block px-2 py-1
                  opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-auto"
                >
                  {sliceWords(item.prompt, 10)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <ModalWithCopyPrompt
          selected={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default MyCreationsPage;
