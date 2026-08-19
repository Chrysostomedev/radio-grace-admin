"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRoles } from "@/app/admin/hooks/useRoles";

const userSchema = z.object({
  name: z.string().min(1, "Nom requis").max(255),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").optional().or(z.literal("")),
  role_id: z.string().min(1, "Rôle requis"),
  is_active: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userSchema>;

interface Props {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export default function UserForm({
  initialData,
  onSubmit,
  onClose,
  isSubmitting = false,
  isEditing = false,
}: Props) {
  const { roles, loading: rolesLoading, error: rolesError } = useRoles();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      password: "",
      role_id: initialData?.role_id || "",
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    },
  });

  const role_id = watch("role_id");
  const is_active = watch("is_active");

  const onSubmitForm = async (data: UserFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone || "");
      if (data.password) {
        formData.append("password", data.password);
      }
      formData.append("role_id", data.role_id);
      formData.append("is_active", data.is_active ? "1" : "0");

      await onSubmit(formData);
    } catch (err: any) {
      toast.error(err?.message || "Erreur");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FFFBF0] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 border-b border-[#163A2C]/10 bg-[#FFFBF0] px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0E241C]">
            {isEditing ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#163A2C]/60 hover:bg-[#163A2C]/10"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmitForm)} className="p-8 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-[#0E241C] mb-2">
              Nom *
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Nom complet..."
                  maxLength={255}
                  className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                />
              )}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-[#0E241C] mb-2">
              Email *
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  placeholder="email@example.com"
                  className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                />
              )}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-[#0E241C] mb-2">
              Téléphone
            </label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="tel"
                  placeholder="+226..."
                  className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                />
              )}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-[#0E241C] mb-2">
              Mot de passe {!isEditing && "*"}
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  placeholder={isEditing ? "Laisser vide pour conserver le mot de passe" : "Minimum 8 caractères"}
                  className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                />
              )}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Rôle */}
          <div>
            <label className="block text-sm font-semibold text-[#0E241C] mb-2">
              Rôle *
            </label>
            {rolesLoading ? (
              <div className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 text-[#163A2C]/60 text-sm">
                Chargement des rôles...
              </div>
            ) : rolesError ? (
              <div className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-red-600 text-sm">
                Erreur: {rolesError}
              </div>
            ) : roles.length === 0 ? (
              <div className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-red-600 text-sm">
                Aucun rôle disponible.
              </div>
            ) : (
              <Controller
                name="role_id"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full rounded-lg border border-[#163A2C]/10 bg-white px-4 py-2.5 focus:border-[#F0A93E] focus:outline-none focus:ring-1 focus:ring-[#F0A93E]/20"
                  >
                    <option value="">Sélectionner un rôle...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id.toString()}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            )}
            {errors.role_id && (
              <p className="mt-1 text-xs text-red-600">{errors.role_id.message}</p>
            )}
          </div>

          {/* Actif */}
          <div>
            <label className="block text-sm font-semibold text-[#0E241C] mb-2">
              Statut
            </label>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-[#163A2C]/70">
                    {is_active ? "Compte actif" : "Compte désactivé"}
                  </span>
                </label>
              )}
            />
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-[#F0A93E]/10 p-4 space-y-2">
            <p className="text-sm font-semibold text-[#0E241C]">Résumé</p>
            <div className="text-xs text-[#163A2C]/70 space-y-1">
              <p>Rôle : <span className="font-semibold">
                {roles.find(r => r.id.toString() === role_id)?.name || "Non sélectionné"}
              </span></p>
              <p>Statut : <span className={`font-semibold ${is_active ? "text-[#1E9D55]" : "text-[#163A2C]/60"}`}>
                {is_active ? "Actif" : "Inactif"}
              </span></p>
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
              disabled={isSubmitting || rolesLoading || roles.length === 0}
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
