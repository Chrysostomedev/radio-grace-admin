"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { actualiteService, Actualite } from "@/services/admin/actualite.service";
import ActualiteDetailCard from "@/components/cards/ActualiteDetailCard";
import { toast } from "sonner";

export default function ActualiteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const [actualite, setActualite] = useState<Actualite | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await actualiteService.get(id);
                setActualite(res.data);
            } catch (err: any) {
                toast.error(err?.errorMessage || "Impossible de charger l'actualité");
                router.push("/admin/actualites");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const handleEdit = () => {
        router.push(`/admin/actualites/${id}/edit`);
    };

    const handleDelete = async () => {
        if (!confirm("Voulez-vous vraiment supprimer cette actualité ?")) return;
        try {
            await actualiteService.delete(id);
            toast.success("Actualité supprimée");
            router.push("/admin/actualites");
        } catch {
            toast.error("Erreur lors de la suppression");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3 text-[#163A2C]/40">
                    <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-bold">Chargement...</span>
                </div>
            </div>
        );
    }

    if (!actualite) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-xl bg-white border border-[#163A2C]/10 flex items-center justify-center hover:bg-[#FBF6EA] transition"
                    >
                        <ArrowLeft size={18} className="text-[#163A2C]" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-[#163A2C] tracking-tight">
                            Détail actualité
                        </h1>
                        <p className="text-sm text-[#163A2C]/50">ID #{actualite.id}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#163A2C] text-[#F0A93E] rounded-xl text-sm font-bold hover:opacity-90 transition"
                    >
                        <Edit2 size={16} />
                        Modifier
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-500 rounded-xl text-sm font-bold hover:bg-red-50 transition"
                    >
                        <Trash2 size={16} />
                        Supprimer
                    </button>
                </div>
            </div>

            {/* Card adaptée (RepresentationCard → ActualiteDetailCard) */}
            <ActualiteDetailCard
                actualite={actualite}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Contenu complet */}
            {actualite.contenu && (
                <div className="bg-white rounded-2xl border border-[#163A2C]/10 shadow-sm p-6 md:p-8">
                    <h2 className="text-lg font-black text-[#163A2C] mb-4">Contenu</h2>
                    <div
                        className="prose prose-sm max-w-none text-[#163A2C]/80 leading-relaxed
                       prose-headings:text-[#163A2C] prose-headings:font-black
                       prose-a:text-[#F0A93E]"
                        dangerouslySetInnerHTML={{ __html: actualite.contenu }}
                    />
                </div>
            )}
        </div>
    );
}