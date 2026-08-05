"use client";

import { useProducts } from "@/lib/useProducts";
import { parseYouTubeId, youTubeEmbedUrl } from "@/lib/youtube";

/**
 * YouTube-sektion på produktsider — "ekstra info" fra producenten.
 * Adskilt fra uploadede produktvideoer (ProductVideo).
 */
export default function ProductYouTube({ productId, name }: { productId: string; name: string }) {
  const { speakers, addons, rentalProducts } = useProducts();

  const youtubeUrl =
    speakers.find((p) => p.id === productId)?.youtubeUrl ??
    rentalProducts.find((p) => p.id === productId)?.youtubeUrl ??
    addons.find((a) => a.id === productId)?.youtubeUrl;

  const videoId = youtubeUrl ? parseYouTubeId(youtubeUrl) : null;
  if (!videoId) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 pb-16" aria-label={`Video fra producenten om ${name}`}>
      <div className="rounded-2xl border border-white/10 bg-[#0d0c12] p-6 sm:p-8">
        <h2 className="text-xl font-bold sm:text-2xl">Se mere fra producenten</h2>
        <p className="mt-2 text-sm text-white/50">
          Officiel produktvideo om {name} — supplerende info ud over vores egen demo.
        </p>
        <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-black">
          <iframe
            src={youTubeEmbedUrl(videoId)}
            title={`YouTube-video om ${name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
