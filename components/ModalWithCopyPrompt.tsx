"use client";

import { formatDistanceToNow } from "date-fns";
import { Download, Share2, UserCircle } from "lucide-react";
import { useState as useReactState } from "react";

interface UserInfo {
  imageUrl?: string;
  name: string;
  id: string;
}

interface ImageLike {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  prompt: string;
  seed: string | number;
  createdAt: string;
  user: UserInfo;
}

function sliceWords(text: string, maxWords: number) {
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

export default function ModalWithCopyPrompt({
  selected,
  onClose,
}: {
  selected: ImageLike;
  onClose: () => void;
}) {
  const [copied, setCopied] = useReactState(false);
  const [downloaded, setDownloaded] = useReactState(false);
  const [shared, setShared] = useReactState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selected.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {}
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = selected.imageUrl;
    link.download = `image-${selected.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 1000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this AI generated image!",
          url: selected.imageUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 1000);
      } catch {}
    } else {
      // fallback: copy image URL
      try {
        await navigator.clipboard.writeText(selected.imageUrl);
        setShared(true);
        setTimeout(() => setShared(false), 1000);
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm dark">
      <div className="relative bg-white dark:bg-neutral-900 rounded-xl shadow-2xl flex flex-col md:flex-row max-w-4xl w-full mx-4 overflow-hidden animate-fadeIn max-h-screen overflow-y-auto hide-scrollbar">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-white text-2xl z-10 hover:text-red-400 transition"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {/* Image section */}
        <div className="flex-1 min-w-[300px] bg-neutral-100 dark:bg-black flex items-center justify-center p-4">
          <img
            src={selected.imageUrl}
            alt={selected.prompt}
            className="rounded-lg max-h-[70vh] w-auto h-auto object-contain shadow-lg"
            style={{ maxWidth: "100%" }}
          />
        </div>
        {/* Details section */}
        <div className="flex-1 flex flex-col gap-4 p-6 text-neutral-900 dark:text-white min-w-[300px] max-w-md">
          {/* User info */}
          <div className="flex items-center gap-3">
            {selected.user?.imageUrl ? (
              <img
                src={selected.user.imageUrl}
                alt={selected.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="w-10 h-10 text-white/80" />
            )}
            <span className="font-semibold text-lg">{selected.user?.name}</span>
          </div>
          {/* Prompt title and copy/download/share buttons */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="text-xl font-bold">
                {sliceWords(selected.prompt, 6)}
              </div>
              <button
                className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition text-white border border-neutral-700 flex items-center gap-1"
                onClick={handleCopy}
                disabled={copied}
                title="Copy prompt"
                aria-label="Copy prompt"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition text-white border border-neutral-700 flex items-center gap-1"
                onClick={handleDownload}
                disabled={downloaded}
                title="Download image"
                aria-label="Download image"
              >
                <Download className="w-4 h-4" />
                {downloaded ? "Downloaded!" : "Download"}
              </button>
              <button
                className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition text-white border border-neutral-700 flex items-center gap-1"
                onClick={handleShare}
                disabled={shared}
                title="Share image"
                aria-label="Share image"
              >
                <Share2 className="w-4 h-4" />
                {shared ? "Shared!" : "Share"}
              </button>
            </div>
            <div className="bg-neutral-200 dark:bg-neutral-800 rounded-lg p-3 text-sm whitespace-pre-line">
              {selected.prompt}
            </div>
          </div>
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-xs mt-2">
            <div>
              <div className="text-neutral-500 dark:text-neutral-400">
                Resolution
              </div>
              <div>
                {selected.width}×{selected.height}
              </div>
            </div>
            <div>
              <div className="text-neutral-500 dark:text-neutral-400">
                Created
              </div>
              <div>
                {formatDistanceToNow(new Date(selected.createdAt), {
                  addSuffix: true,
                })}
              </div>
            </div>
            <div>
              <div className="text-neutral-500 dark:text-neutral-400">Seed</div>
              <div>{selected?.seed}</div>
            </div>
            <div>
              <div className="text-neutral-500 dark:text-neutral-400">ID</div>
              <div className="break-all">{selected.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
