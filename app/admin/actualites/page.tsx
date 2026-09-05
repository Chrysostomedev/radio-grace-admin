"use client";

import { useState, useMemo } from "react";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import ActualiteCard from "@/components/cards/ActualiteCard";
import ReusableForm, { FieldConfig } from "@/components/form/ReusableForm";
import Paginate from "@/components/data/paginate";
import { useActualites } from "@/hooks/admin/useActualites";
import { useCategorieActuQuery } from "@/hooks/admin/useCategorieActu";
import { actualiteService } from "@/services/admin/actualite.service";
import { toast } from "sonner";

export default function ActualitesPage() {
  const { data, meta, loading, filters, setFilters, fetch } = useActualites();
  const { data: categories = [] } = useCategorieActuQuery();
  const [searchLocal, setSearchLocal] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showForm, setShowForm] = useState(false);
  const [editingActualite, setEditingActualite] = useState<any | null>(null);

  // Mapping propre + gestion correcte de l'URL image
  const mapped = useMemo(
    () =>
      data.map((a: any) => {
        let imageUrl: string | undefined;

        if (a.image) {
          if (a.image.startsWith("http")) {
            // Le backend renvoie déjà une URL complète
            imageUrl = a.image;
          } else {
            // Le backend renvoie un chemin relatif (ex: "actualites/xxx.jpg")
            const base =
              process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ??
              "http://127.0.0.1:8000";
            imageUrl = `${base}/storage/${a.image.replace(/^\/?storage\//, "")}`;
          }
        } else {
          imageUrl = "/images/emission (3).jpg";
        }

        return {
          id: a.id,
          name: a.titre,
          initials: a.titre?.slice(0, 2).toUpperCase() || "AC",
          color:
            a.statut === "PUBLIE"
              ? "bg-[#1E9D55]"
              : a.statut === "EN_COURS"
                ? "bg-[#F0A93E]"
                : "bg-[#163A2C]",
          category: a.categorie?.slug || "diocese",
          total: a.vues ?? 0,
          en_cours: a.en_cours ?? 0,
          terminees: a.commentaires_count ?? 0,
          en_retard: 0,
          priority: (a.statut === "PUBLIE" ? "high" : "medium") as any,
          date: new Date(a.created_at).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          }),
          image: imageUrl,
          statut: a.statut,
        };
      }),
    [data]
  );

  const handleSearch = () => setFilters({ ...filters, search: searchLocal });

  const FIELDS: FieldConfig[] = useMemo(() => {
    const categoryOptions = Array.isArray(categories) && categories.length > 0 
      ? categories.map((c: any) => ({ label: c.name || c.titre, value: String(c.id) }))
      : [{ label: "Chargement...", value: "loading" }];

    return [
    { name: "titre", label: "Titre actualité", type: "text", required: true },
    {
      name: "categorie_id",
      label: "Catégorie",
      type: "select",
      required: true,
      options: categoryOptions,
    },
    {
      name: "statut",
      label: "Statut",
      type: "select",
      required: true,
      options: [
        { label: "Publié", value: "PUBLIE" },
        { label: "Brouillon", value: "BROUILLON" },
      ],
    },
    {
      name: "importance",
      label: "Mise en avant",
      type: "select",
      required: true,
      options: [
        { label: "À la une", value: "A_LA_UNE" },
        { label: "Important", value: "IMPORTANT" },
        { label: "Standard", value: "STANDARD" },
      ],
    },
    {
      name: "image",
      label: "Image de couverture",
      type: "image-upload",
      required: true,
      maxImages: 1,
      maxSizeMB: 5,
      gridSpan: 2,
    },
    {
      name: "contenu",
      label: "Contenu",
      type: "rich-text",
      required: true,
      gridSpan: 2,
    },
  ];
  }, [categories]);

  return (
    <>
      <ReusableForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Nouvelle actualité RGE"
        subtitle="Publiez une actualité pour le site et l'app"
        fields={FIELDS}
        onSubmit={async (d: any) => {
          const fd = new FormData();
          fd.append("titre", d.titre);
          fd.append("categorie_id", String(d.categorie_id));
          fd.append("statut", d.statut);
          fd.append("importance", d.importance);
          fd.append("contenu", d.contenu);

          const img = d.image;
          if (Array.isArray(img) && img.length > 0) {
            const file = img[0] instanceof File ? img[0] : img[0]?.file;
            if (file) fd.append("image", file);
          } else if (img instanceof File) {
            fd.append("image", img);
          }

          try {
            await actualiteService.create(fd);
            toast.success("Actualité créée");
            setShowForm(false);
            fetch(1);
          } catch (e: any) {
            toast.error(e?.errorMessage || "Erreur");
          }
        }}
        submitLabel="Publier l'actualité"
      />

      <ReusableForm
        isOpen={showForm && !editingActualite}
        onClose={() => setShowForm(false)}
        title="Nouvelle actualité RGE"
        subtitle="Publiez une actualité pour le site et l'app"
        fields={FIELDS}
        onSubmit={async (d: any) => {
          const fd = new FormData();
          fd.append("titre", d.titre);
          fd.append("categorie_id", String(d.categorie_id));
          fd.append("statut", d.statut);
          fd.append("importance", d.importance);
          fd.append("contenu", d.contenu);

          const img = d.image;
          if (Array.isArray(img) && img.length > 0) {
            const file = img[0] instanceof File ? img[0] : img[0]?.file;
            if (file) fd.append("image", file);
          } else if (img instanceof File) {
            fd.append("image", img);
          }

          try {
            await actualiteService.create(fd);
            toast.success("Actualité créée");
            setShowForm(false);
            fetch(1);
          } catch (e: any) {
            toast.error(e?.errorMessage || "Erreur");
          }
        }}
        submitLabel="Publier l'actualité"
      />

      <ReusableForm
        isOpen={!!editingActualite}
        onClose={() => setEditingActualite(null)}
        title="Modifier l'actualité RGE"
        subtitle="Mettez à jour cette actualité"
        fields={FIELDS}
        initialValues={editingActualite ? {
          titre: editingActualite.titre || "",
          categorie_id: String(editingActualite.categorie_id || ""),
          statut: editingActualite.statut || "BROUILLON",
          importance: editingActualite.importance || "STANDARD",
          contenu: editingActualite.contenu || "",
          image: editingActualite.image ? [{ preview: editingActualite.image }] : undefined,
        } : {}}
        onSubmit={async (d: any) => {
          const fd = new FormData();
          fd.append("titre", d.titre || "");
          fd.append("categorie_id", String(d.categorie_id || ""));
          fd.append("statut", d.statut || "BROUILLON");
          fd.append("importance", d.importance || "STANDARD");
          fd.append("contenu", d.contenu || "");

          const img = d.image;
          if (Array.isArray(img) && img.length > 0) {
            const file = img[0] instanceof File ? img[0] : img[0]?.file;
            if (file) fd.append("image", file);
          } else if (img instanceof File) {
            fd.append("image", img);
          }

          try {
            await actualiteService.update(editingActualite.id, fd);
            toast.success("Actualité mise à jour");
            setEditingActualite(null);
            fetch(meta.current_page);
          } catch (e: any) {
            toast.error(e?.errorMessage || "Erreur");
          }
        }}
        submitLabel="Mettre à jour"
      />

      <div className="space-y-5">
        {/* Barre de recherche + actions */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163A2C]/30"
            />
            <input
              value={searchLocal}
              onChange={(e) => setSearchLocal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Rechercher actualité..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#163A2C]/10 rounded-xl outline-none"
            />
          </div>

          <div className="flex bg-white border border-[#163A2C]/10 rounded-xl p-1">
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg ${view === "list" ? "bg-[#163A2C] text-white" : "text-[#163A2C]/40"
                }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg ${view === "grid" ? "bg-[#F0A93E] text-[#163A2C]" : "text-[#163A2C]/40"
                }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-3 bg-[#F0A93E] text-[#163A2C] rounded-xl font-bold flex items-center gap-2"
          >
            <Plus size={16} /> Nouvelle actu
          </button>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4 animate-pulse">
            <div className="h-64 bg-white rounded-2xl" />
            <div className="h-64 bg-white rounded-2xl" />
            <div className="h-64 bg-white rounded-2xl" />
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mapped.map((a: any, idx: number) => (
              <ActualiteCard 
                key={a.id} 
                actualite={a} 
                onUpdate={() => fetch(meta.current_page)}
                onEdit={() => setEditingActualite(data[idx])}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#FBF6EA]">
                <tr>
                  <th className="p-3 text-left uppercase text-[#163A2C]/50">Titre</th>
                  <th className="p-3 text-left uppercase">Statut</th>
                  <th className="p-3 text-left uppercase">Vues</th>
                </tr>
              </thead>
              <tbody>
                {mapped.map((a: any) => (
                  <tr
                    key={a.id}
                    className="border-t hover:bg-[#FBF6EA]/50 cursor-pointer"
                  >
                    <td className="p-3 font-bold text-[#163A2C]">{a.name}</td>
                    <td className="p-3">{a.statut}</td>
                    <td className="p-3">{a.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center">
          <Paginate
            currentPage={meta.current_page}
            totalPages={meta.last_page}
            onPageChange={fetch}
          />
        </div>
      </div>
    </>
  );
}