"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const animateurSchema = z.object({
  user_id: z.string().min(1, "Utilisateur requis").refine(
    (val) => !isNaN(Number(val)),
    "ID utilisateur invalide"
  ),
  nom_scene: z.string().min(1, "Nom de scène requis").max(255),
  bio: z.string().optional(),
  photo: z.any().optional(),
  facebook: z.string().url("URL Facebook invalide").optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  is_visible: z.boolean().default(true),
});

type AnimateurFormData = z.infer<typeof animateurSchema>;

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  roles?: Array<{ id: number; name: string }>;
}

interface Props {
  initialData?: Partial<AnimateurFormData>;
  users?: User[];
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export default function AnimateurForm({
  initialData,
  users = [],
  onSubmit,
  onClose,
  isSubmitting = false,
  isEditing = false,
}: Props) {
  const [imagePreview, setImagePreview] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AnimateurFormData>({
    resolver: zodResolver(animateurSchema),
    defaultValues: {
      user_id: initialData?.user_id || "",
      nom_scene: initialData?.nom_scene || "",
      bio: initialData?.bio || "",
      facebook: initialData?.facebook || "",
      whatsapp: initialData?.whatsapp || "",
      is_visible: initialData?.is_visible !== undefined ? initialData.is_visible : true,
    },
  });

  const nom_scene = watch("nom_scene");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("La taille du fichier dépasse 2MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitForm = async (data: AnimateurFormData) => {
    try {
      const formData = new FormData();
      formData.append("user_id", data.user_id);
      formData.append("nom_scene", data.nom_scene);
      formData.append("bio", data.bio || "");
      formData.append("facebook", data.facebook || "");
      formData.append("whatsapp", data.whatsapp || "");
      formData.append("is_visible", data.is_visible ? "1" : "0");

      if (photoFile) {
        formData.append("photo", photoFile);
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
            {isEditing ? "Modifier l'animateur" : "Créer un animateur"}
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
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-6">
              {/* User ID */}
              <div>
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Utilisateur *
                </label>
                {users.length === 0 ? (
                  <div className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-red-600 text-sm">
                    Aucun animateur disponible. Créez d'abord un utilisateur (non-auditeur).
                  </div>
                ) : (
                  <Controller
                    name="user_id"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                      >
                        <option value="">Sélectionner un utilisateur...</option>
                        {users.map((user) => {
                          const roleName = user.role || 
                            (user.roles && user.roles.length > 0 ? user.roles[0].name : "N/A");
                          return (
                            <option key={user.id} value={user.id.toString()}>
                              {user.name} ({roleName}) - {user.email}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  />
                )}
                {errors.user_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.user_id.message}</p>
                )}
              </div>

              {/* Nom de scène */}
              <div>
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Nom de scène *
                </label>
                <Controller
                  name="nom_scene"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Nom de scène..."
                      maxLength={255}
                      className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                    />
                  )}
                />
                {errors.nom_scene && (
                  <p className="mt-1 text-xs text-red-600">{errors.nom_scene.message}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Bio
                </label>
                <Controller
                  name="bio"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder="Bio de l'animateur..."
                      rows={3}
                      className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20 resize-none"
                    />
                  )}
                />
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Photo (max 2MB)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#163A2C]/20 bg-[#FFFBF0] p-4 cursor-pointer hover:border-[#F0A93E]">
                    <Upload size={20} className="text-[#163A2C]/60" />
                    <span className="text-sm text-[#163A2C]/60">Choisir la photo...</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {photoFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setImagePreview("");
                      }}
                      className="px-3 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                {photoFile && (
                  <p className="mt-2 text-xs text-[#163A2C]/60">{photoFile.name}</p>
                )}
              </div>

              {/* Réseaux sociaux */}
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                    Facebook
                  </label>
                  <Controller
                    name="facebook"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="url"
                        placeholder="https://facebook.com/..."
                        className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                      />
                    )}
                  />
                  {errors.facebook && (
                    <p className="mt-1 text-xs text-red-600">{errors.facebook.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                    WhatsApp
                  </label>
                  <Controller
                    name="whatsapp"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="+226..."
                        className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Visibilité */}
              <div>
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Statut
                </label>
                <Controller
                  name="is_visible"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-[#163A2C]/70">Visible</span>
                    </label>
                  )}
                />
              </div>
            </div>

            {/* Right side - Preview */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#0E241C] mb-2">
                  Aperçu photo
                </label>
                <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-[#163A2C] to-[#0E241C] flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={40} className="text-white/20" />
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-[#F0A93E]/10 p-4 space-y-2">
                <p className="text-sm font-semibold text-[#0E241C]">
                  {nom_scene ? `"${nom_scene}"` : "Nom de l'animateur"}
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
              disabled={isSubmitting || users.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#F0A93E] font-semibold text-[#0E241C] hover:bg-[#E0972E] disabled:opacity-50 disabled:cursor-not-allowed"
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
