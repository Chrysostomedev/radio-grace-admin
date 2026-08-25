"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

const podcastSchema = z.object({
  programme_id: z.string().min(1, "Programme requis"),
  titre: z.string().min(1, "Titre requis").max(255),
  description: z.string().optional(),
  duree: z.number().optional(),
  is_premium: z.boolean().optional(),
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
  const toast = useToast();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PodcastFormData>({
    resolver: zodResolver(podcastSchema),
    defaultValues: initialData || {
      statut: "BROUILLON",
    },
  });

  const titre = watch("titre");
  const statut = watch("statut");

  const onSubmitForm = async (data: PodcastFormData) => {
    try {
      const formData = new FormData();
      formData.append("programme_id", data.programme_id);
      formData.append("titre", data.titre);
      formData.append("description", data.description || "");
      formData.append("statut", data.statut);

      await onSubmit(formData);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FFFBF0] shadow-2xl">
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

        <form onSubmit={handleSubmit(onSubmitForm)} className="p-8 space-y-6">
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
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.programme_id && (
              <p className="mt-1 text-xs text-red-600">
                {errors.programme_id.message}
              </p>
            )}
          </div>

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
          </div>

          <div className="rounded-lg bg-[#F0A93E]/10 p-4">
            <p className="text-sm font-semibold text-[#0E241C]">
              {titre ? `"${titre}"` : "Titre du podcast"}
            </p>
            <p className="text-xs text-[#163A2C]/70 mt-2">
              Statut:{" "}
              <span
                className={
                  statut === "PUBLIE"
                    ? "text-[#1E9D55] font-bold"
                    : statut === "BROUILLON"
                      ? "text-[#F0A93E] font-bold"
                      : "text-[#163A2C]/60 font-bold"
                }
              >
                {statut === "PUBLIE"
                  ? "Publié"
                  : statut === "BROUILLON"
                    ? "Brouillon"
                    : "Archivé"}
              </span>
            </p>
          </div>

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
              ) : isEditing ? (
                "Modifier"
              ) : (
                "Créer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
