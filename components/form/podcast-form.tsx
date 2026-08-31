"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Link2, Upload, Music, Image as ImageIcon, Video, Link2Icon  } from "lucide-react";
import { useToast } from "@/context/ToastContext";

const podcastSchema = z.object({
  programme_id: z.string().min(1, "Programme requis"),
  titre: z.string().min(1, "Titre requis").max(255),
  description: z.string().optional(),
  duree: z.number().optional(),
  is_premium: z.boolean().optional(),
  statut: z.enum(["BROUILLON", "PUBLIE", "ARCHIVE"]),
  // Lien vidéo externe : doit être une URL valide si rempli
  video_link: z
    .string()
    .optional()
    .refine((v) => !v || v.startsWith("http"), "Le lien doit commencer par http(s)://"),
});

type PodcastFormData = z.infer<typeof podcastSchema>;

interface Props {
  initialData?: Partial<PodcastFormData> & { video_link?: string };
  programmes?: Array<{ id: string; name: string }>;
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

/** Détecte la plateforme d'un lien vidéo (pour le badge UX) */
function detectProvider(url: string): "youtube" | "facebook" | "vimeo" | "other" | null {
  if (!url) return null;
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("facebook.com") || url.includes("fb.watch")) return "facebook";
  if (url.includes("vimeo.com")) return "vimeo";
  return "other";
}

const PROVIDER_LABELS: Record<string, string> = {
  youtube: "YouTube détecté",
  facebook: "Facebook détecté",
  vimeo: "Vimeo détecté",
  other: "Lien vidéo externe",
};

export default function PodcastForm({
  initialData,
  programmes = [],
  onSubmit,
  onClose,
  isSubmitting = false,
  isEditing = false,
}: Props) {
  const toast = useToast();

  // Fichiers (hors react-hook-form, gérés manuellement)
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PodcastFormData>({
    resolver: zodResolver(podcastSchema),
    defaultValues: initialData || { statut: "BROUILLON" },
  });

  const titre = watch("titre");
  const statut = watch("statut");
  const videoLink = watch("video_link") || "";
  const provider = detectProvider(videoLink);

  const onSubmitForm = async (data: PodcastFormData) => {
    try {
      const formData = new FormData();
      formData.append("programme_id", data.programme_id);
      formData.append("titre", data.titre);
      formData.append("description", data.description || "");
      formData.append("statut", data.statut);

      // Audio : fichier (le backend l'upload vers R2 en arrière-plan)
      if (audioFile) {
        formData.append("audio_url", audioFile);
      }

      // Image de couverture
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Vidéo : lien externe OU fichier — un seul des deux
      if (videoLink && audioOrVideoFile()) {
        // rien : géré ci-dessous
      }
      if (videoLink) {
        formData.append("video_url", videoLink); // string → backend détecte le provider
      }

      await onSubmit(formData);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'enregistrement");
    }
  };

  const audioOrVideoFile = () => null; // pas de fichier vidéo pour l'instant — lien uniquement

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FFFBF0] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[#163A2C]/10 bg-[#FFFBF0] px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0E241C]">
            {isEditing ? "Modifier le podcast" : "Créer un podcast"}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-[#163A2C]/60 hover:bg-[#163A2C]/10">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="p-8 space-y-6">
          {/* Programme */}
          <div>
            <label className="block text-sm font-semibold text-[#0E241C] mb-2">Programme *</label>
            <Controller
              name="programme_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                >
                  <option value="">Sélectionner...</option>
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            />
            {errors.programme_id && (
              <p className="mt-1 text-xs text-red-600">{errors.programme_id.message}</p>
            )}
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-[#0E241C] mb-2">Titre *</label>
            <Controller
              name="titre"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Titre du podcast..."
                  maxLength={255}
                  className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                />
              )}
            />
            {errors.titre && <p className="mt-1 text-xs text-red-600">{errors.titre.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#0E241C] mb-2">Description</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="Description..."
                  rows={3}
                  className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20 resize-none"
                />
              )}
            />
          </div>

          {/* ── Fichiers audio + image ── */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {/* Audio */}
            <div>
              <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                <span className="inline-flex items-center gap-1.5"><Music size={14} /> Fichier audio (MP3)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-[#163A2C]/20 bg-white px-4 py-3 hover:border-[#F0A93E] transition">
                <Upload size={16} className="text-[#163A2C]/40" />
                <span className="text-sm text-[#163A2C]/60 truncate">
                  {audioFile ? audioFile.name : "Choisir un fichier..."}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="mt-1 text-[11px] text-[#163A2C]/40">
                Upload vers le cloud en arrière-plan après enregistrement
              </p>
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                <span className="inline-flex items-center gap-1.5"><ImageIcon size={14} /> Image de couverture</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-[#163A2C]/20 bg-white px-4 py-3 hover:border-[#F0A93E] transition">
                <Upload size={16} className="text-[#163A2C]/40" />
                <span className="text-sm text-[#163A2C]/60 truncate">
                  {imageFile ? imageFile.name : "Choisir une image..."}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          {/* ── Lien vidéo externe (YouTube, Facebook...) ── */}
          <div>
            <label className="block text-sm font-semibold text-[#0E241C] mb-2">
              <span className="inline-flex items-center gap-1.5"><Link2 size={14} /> Lien vidéo externe</span>
            </label>
            <Controller
              name="video_link"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                />
              )}
            />
            {/* Badge auto-détection */}
            {provider && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#1E9D55]">
                {provider === "youtube" ? <Link2Icon size={14} /> : provider === "facebook" ? <Link2 size={14} /> : <Video size={14} />}
                {PROVIDER_LABELS[provider]}
              </p>
            )}
            {errors.video_link && (
              <p className="mt-1 text-xs text-red-600">{errors.video_link.message}</p>
            )}
            <p className="mt-1 text-[11px] text-[#163A2C]/40">
              YouTube, Facebook, Vimeo... le lecteur mobile lira la vidéo directement
            </p>
          </div>

          {/* Statut */}
          <div className="grid gap-4 grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[#0E241C] mb-2">Statut *</label>
              <Controller
                name="statut"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                  >
                    <option value="BROUILLON">Brouillon</option>
                    <option value="PUBLIE">Publié</option>
                    <option value="ARCHIVE">Archivé</option>
                  </select>
                )}
              />
            </div>
          </div>

          {/* Aperçu */}
          <div className="rounded-lg bg-[#F0A93E]/10 p-4">
            <p className="text-sm font-semibold text-[#0E241C]">
              {titre ? `"${titre}"` : "Titre du podcast"}
            </p>
            <p className="text-xs text-[#163A2C]/70 mt-2">
              Statut :{" "}
              <span className={
                statut === "PUBLIE" ? "text-[#1E9D55] font-bold"
                : statut === "BROUILLON" ? "text-[#F0A93E] font-bold"
                : "text-[#163A2C]/60 font-bold"
              }>
                {statut === "PUBLIE" ? "Publié" : statut === "BROUILLON" ? "Brouillon" : "Archivé"}
              </span>
              {audioFile && <span className="ml-3">🎵 {audioFile.name}</span>}
              {videoLink && <span className="ml-3">▶️ vidéo externe</span>}
            </p>
          </div>

          {/* Actions */}
          <div className="border-t border-[#163A2C]/10 pt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-[#163A2C]/10 font-semibold text-[#0E241C] hover:bg-[#FFFBF0]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#F0A93E] font-semibold text-[#0E241C] hover:bg-[#E0972E] disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin" /> Enregistrement...</>
              ) : isEditing ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
