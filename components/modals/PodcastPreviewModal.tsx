"use client";

import { useMemo } from "react";
import { X, Video, Music, ExternalLink } from "lucide-react";
import type { Podcast } from "@/types/admin";

/**
 * Sous-ensemble de Podcast nécessaire à la prévisualisation.
 * Dérivé du type canonique → aucune divergence possible.
 */
type PodcastPreview = Pick<
    Podcast,
    "titre" | "description" | "image" | "audio_url" | "video_url" | "video_provider"
>;

interface Props {
    podcast: PodcastPreview | null;
    onClose: () => void;
}


function detectProvider(url?: string | null): string | null {
  if (!url) return null;
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("facebook.com") || url.includes("fb.watch")) return "facebook";
  if (url.includes("vimeo.com")) return "vimeo";
  if (url.startsWith("http")) return "other";
  return "local"; // chemin storage = fichier local
}

/** Extrait l'ID YouTube pour l'embed */
function getYoutubeEmbed(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

/** Extrait l'URL video Facebook pour l'embed */
function getFacebookEmbed(url: string): string {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
}

export default function PodcastPreviewModal({ podcast, onClose }: Props) {
  const provider = useMemo(() => detectProvider(podcast?.video_url), [podcast?.video_url]);

  if (!podcast) return null;

  const youtubeEmbed = provider === "youtube" ? getYoutubeEmbed(podcast.video_url!) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FFFBF0] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#163A2C]/10 bg-[#FFFBF0] px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-[#0E241C]">{podcast.titre}</h2>
            <p className="text-xs font-bold uppercase tracking-wide text-[#163A2C]/50">
              Aperçu — {provider === "local" || provider === null ? "Média interne" : `Vidéo ${provider}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {podcast.video_url?.startsWith("http") && (
              <a
                href={podcast.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#163A2C] hover:bg-[#163A2C]/5"
              >
                <ExternalLink size={14} /> Ouvrir
              </a>
            )}
            <button onClick={onClose} className="rounded-full p-2 text-[#163A2C]/60 hover:bg-[#163A2C]/10">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* ── LECTEUR VIDÉO ── */}
          {youtubeEmbed ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={youtubeEmbed}
                title={podcast.titre}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : provider === "facebook" ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={getFacebookEmbed(podcast.video_url!)}
                title={podcast.titre}
                className="h-full w-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          ) : provider === "local" && podcast.video_url ? (
            <video
              src={`/storage/${podcast.video_url}`}
              controls
              className="aspect-video w-full rounded-xl bg-black"
            />
          ) : null}

          {/* ── LECTEUR AUDIO (si pas de vidéo) ── */}
          {!podcast.video_url && podcast.audio_url && (
            <div className="rounded-xl bg-white border border-[#163A2C]/10 p-4">
              <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#0E241C]">
                <Music size={15} /> Épisode audio
              </p>
              {podcast.audio_url.startsWith("http") ? (
                <audio src={podcast.audio_url} controls className="w-full" />
              ) : (
                <audio src={`/storage/${podcast.audio_url}`} controls className="w-full" />
              )}
              {podcast.video_url === null && podcast.audio_url === null && null}
            </div>
          )}

          {/* ── Si rien à lire ── */}
          {!podcast.video_url && !podcast.audio_url && (
            <div className="rounded-xl border border-dashed border-[#163A2C]/20 bg-white p-8 text-center">
              <Video size={32} className="mx-auto text-[#163A2C]/30 mb-2" />
              <p className="text-sm text-[#163A2C]/50">Aucun média attaché à ce podcast</p>
            </div>
          )}

          {/* Image de couverture si pas de vidéo */}
          {!podcast.video_url && podcast.image && (
            <img
              src={podcast.image.startsWith("http") ? podcast.image : `/storage/${podcast.image}`}
              alt={podcast.titre}
              className="w-full max-h-72 rounded-xl object-cover border border-[#163A2C]/10"
            />
          )}

          {/* Description */}
          {podcast.description && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#163A2C]/50 mb-1">Description</p>
              <p className="text-sm leading-relaxed text-[#163A2C]/80 whitespace-pre-line">
                {podcast.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
