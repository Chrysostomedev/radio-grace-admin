"use client";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload, Music, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const podcastSchema = z.object({
  programme_id: z.string().min(1, "Programme requis"),
  titre: z.string().min(1, "Titre requis").max(255),
  description: z.string().optional(),
  audio_url: z.any().optional(),
  video_url: z.any().optional(),
  image: z.any().optional(),
  duree: z.number().optional(),
  is_premium: z.boolean().default(false),
  statut: z.enum(["BROUILLON", "PUBLIE", "ARCHIVE"]),
});

type PodcastFormData = z.infer<typeof podcastSchema>;

interface Props {
  initialData?: Partial<PodcastFormData>;
  programmes?: Array<{ id: string; name: string }>;
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export default function PodcastForm({
  initialData,
  programmes = [],
  onSubmit,
  onClose,
  isSubmitting = false,
  isEditing = false,
}: Props) {
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<PodcastFormData>({
    resolver: zodResolver(podcastSchema),
    defaultValues: {
      programme_id: initialData?.programme_id || "",
      titre: initialData?.titre || "",
      description: initialData?.description || "",
      duree: initialData?.duree || undefined,
      is_premium: initialData?.is_premium || false,
      statut: initialData?.statut || "BROUILLON",
    },
  });

  const titre = watch("titre");
  const statut = watch("statut");

  // Prévisualiser l'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("La taille du fichier dépasse 100MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Prévisualiser l'audio
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("La taille du fichier dépasse 100MB");
        return;
      }
      setAudioFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAudioPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Récupérer la durée
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        setValue("duree", Math.floor(audio.duration));
      };
      audio.src = event.target?.result as string;
    }
  };

  const onSubmitForm = async (data: PodcastFormData) => {
    try {
      const formData = new FormData();
      formData.append("programme_id", data.programme_id);
      formData.append("titre", data.titre);
      formData.append("description", data.description || "");
      formData.append("duree", data.duree?.toString() || "0");
      formData.append("is_premium", data.is_premium ? "1" : "0");
      formData.append("statut", data.statut);

      if (data.audio_url) {
        formData.append("audio_url", data.audio_url);
      } else if (audioFile) {
        formData.append("audio_url", audioFile);
      }

      if (data.video_url) {
        formData.append("video_url", data.video_url);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await onSubmit(formData);
    } catch (err: any) {
      toast.error(err?.message || "Erreur");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FFFBF0] shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 border-b border-[#163A2C]/10 bg-[#FFFBF0] px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0E241C]">
            {isEditing ? "Modifier le podcast" : "Créer un podcast"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#163A2C]/60 hover:bg-[#163A2C]/10"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmitForm)} className="p-8 space-y-8">
          
          {/* Left side - Form fields */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Programme */}
              <div>
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Programme *
                </label>
                <Controller
                  name="programme_id"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                    >
                      <option value="">Sélectionner...</option>
                      {programmes.map(p => (
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
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Titre *
                </label>
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
                {errors.titre && (
                  <p className="mt-1 text-xs text-red-600">{errors.titre.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Description
                </label>
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

              {/* Audio & Video URLs (External) */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                    Lien SoundCloud (Audio)
                  </label>
                  <Controller
                    name="audio_url"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="url"
                        placeholder="https://soundcloud.com/..."
                        className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                    Lien YouTube (Vidéo)
                  </label>
                  <Controller
                    name="video_url"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Audio Upload (Commented out to reduce VPS load) 
              <div>
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Audio (mp3, wav, m4a - max 100MB)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#163A2C]/20 bg-[#FFFBF0] p-4 cursor-pointer hover:border-[#F0A93E]">
                    <Music size={20} className="text-[#163A2C]/60" />
                    <span className="text-sm text-[#163A2C]/60">Choisir l'audio...</span>
                    <input
                      type="file"
                      accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"
                      onChange={handleAudioChange}
                      className="hidden"
                    />
                  </label>
                  {audioFile && (
                    <button
                      type="button"
                      onClick={() => { setAudioFile(null); setAudioPreview(""); }}
                      className="px-3 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                {audioFile && (
                  <p className="mt-2 text-xs text-[#163A2C]/60">{audioFile.name}</p>
                )}
              </div>
              */}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Image (max 2MB)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#163A2C]/20 bg-[#FFFBF0] p-4 cursor-pointer hover:border-[#F0A93E]">
                    <ImageIcon size={20} className="text-[#163A2C]/60" />
                    <span className="text-sm text-[#163A2C]/60">Choisir l'image...</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imageFile && (
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(""); }}
                      className="px-3 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                {imageFile && (
                  <p className="mt-2 text-xs text-[#163A2C]/60">{imageFile.name}</p>
                )}
              </div>

              {/* Status & Premium */}
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                    Statut *
                  </label>
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

                <div>
                  <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                    Premium
                  </label>
                  <Controller
                    name="is_premium"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-[#163A2C]/70">Premium</span>
                      </label>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Right side - Previews */}
            <div className="space-y-6">
              
              {/* Image Preview */}
              <div>
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Aperçu image
                </label>
                <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-[#163A2C] to-[#0E241C] flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={40} className="text-white/20" />
                  )}
                </div>
              </div>

              {/* Audio Preview */}
              <div>
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Aperçu audio
                </label>
                {audioPreview ? (
                  <div className="rounded-lg bg-[#FFFBF0] border border-[#163A2C]/10 p-3">
                    <audio
                      src={audioPreview}
                      controls
                      className="w-full"
                    />
                    <p className="mt-2 text-xs text-[#163A2C]/60 text-center">
                      {audioFile?.name}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-[#FFFBF0] border-2 border-dashed border-[#163A2C]/20 flex items-center justify-center p-6">
                    <Music size={32} className="text-[#163A2C]/20" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="rounded-lg bg-[#F0A93E]/10 p-4 space-y-2">
                <p className="text-sm font-semibold text-[#0E241C]">
                  {titre ? `"${titre}"` : "Titre du podcast"}
                </p>
                <p className="text-xs text-[#163A2C]/70">
                  Statut: <span className={
                    statut === "PUBLIE" ? "text-[#1E9D55] font-bold" :
                    statut === "BROUILLON" ? "text-[#F0A93E] font-bold" :
                    "text-[#163A2C]/60 font-bold"
                  }>
                    {statut === "PUBLIE" ? "Publié" : statut === "BROUILLON" ? "Brouillon" : "Archivé"}
                  </span>
                </p>
              </div>
            </div>
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
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                isEditing ? "Modifier" : "Créer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
