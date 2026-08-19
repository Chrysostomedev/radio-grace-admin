"use client";

import { useEffect, useState, useMemo } from "react";
import { DollarSign, TrendingUp, Users, Heart } from "lucide-react";
import { toast } from "sonner";
import axios from "@/core/axios";
import ChartLine from "@/components/charts/ChartLine";

interface Don {
  id: number;
  donateur: string;
  montant: number;
  moyen: string;
  statut: string;
  motif?: string;
  transaction_id?: string;
  created_at: string;
}

interface StatsData {
  total: number;
  nombre_dons: number;
  moyenne: number;
  par_moyen: Array<{ moyen: string; total: number; nombre: number; pourcentage: number }>;
}

export default function DonsPage() {
  const [dons, setDons] = useState<Don[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [sortBy, setSortBy] = useState("date_desc");
  const [filtreMoyen, setFiltreMoyen] = useState("");

  // Charger les dons et stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, per_page: 20 };
      if (filtreMoyen) params.moyen = filtreMoyen;

      const [donsRes, statsRes] = await Promise.all([
        axios.get("/admin/dons", { params }),
        axios.get("/admin/dons/statistiques"),
      ]);

      const donsData = donsRes.data || donsRes;
      const statsData = statsRes.data || statsRes;

      setDons(Array.isArray(donsData.data) ? donsData.data : []);
      setLastPage(donsData.meta?.last_page || donsData.last_page || 1);
      setStats(statsData.data || statsData);
    } catch (err) {
      toast.error("Erreur lors du chargement des dons");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, sortBy, filtreMoyen]);

  // Formater la devise FCFA
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat("fr-FR").format(montant) + " FCFA";
  };

  // Tri local
  const sorted = useMemo(() => {
    const arr = [...dons];
    switch (sortBy) {
      case "date_asc":
        return arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "montant_desc":
        return arr.sort((a, b) => b.montant - a.montant);
      case "montant_asc":
        return arr.sort((a, b) => a.montant - b.montant);
      default: // date_desc
        return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [dons, sortBy]);

  const statCards = [
    {
      label: "Total des dons",
      value: stats ? formatMontant(stats.total) : "0 FCFA",
      icon: DollarSign,
      color: "from-[#1E9D55] to-[#0E9D5F]",
    },
    {
      label: "Nombre de dons",
      value: stats?.nombre_dons || 0,
      icon: Users,
      color: "from-[#F0A93E] to-[#E0972E]",
    },
    {
      label: "Montant moyen",
      value: stats ? formatMontant(stats.moyenne) : "0 FCFA",
      icon: TrendingUp,
      color: "from-[#1E5A3D] to-[#163A2C]",
    },
    {
      label: "Moyens de paiement",
      value: stats?.par_moyen?.length || 0,
      icon: Heart,
      color: "from-[#163A2C] to-[#0E241C]",
    },
  ];

  // Données graphique répartition par moyen
  const chartData = useMemo(() => {
    if (!stats?.par_moyen) return [];
    return stats.par_moyen.map((d) => ({
      name: d.moyen,
      Dons: d.total,
    }));
  }, [stats]);

  const statutLabel = (s: string) => {
    switch (s) {
      case "PAYE": return "Payé";
      case "EN_ATTENTE": case "ATTENTE": return "En attente";
      case "ECHEC": return "Échoué";
      default: return s;
    }
  };

  const statutColor = (s: string) => {
    switch (s) {
      case "PAYE": return "bg-[#1E9D55]/20 text-[#1E9D55]";
      case "EN_ATTENTE": case "ATTENTE": return "bg-[#F0A93E]/20 text-[#E0972E]";
      case "ECHEC": return "bg-red-500/20 text-red-600";
      default: return "bg-gray-200 text-gray-600";
    }
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0E241C]">Gestion des Dons</h1>
        <p className="mt-1 text-[#163A2C]/60">Suivi des contributions et statistiques</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`rounded-lg bg-gradient-to-br ${card.color} p-6 text-white shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold">{card.value}</p>
                </div>
                <Icon size={28} className="opacity-20" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Répartition par moyen de paiement */}
      {stats?.par_moyen && stats.par_moyen.length > 0 && (
        <div className="rounded-lg bg-[#FFFBF0] shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#0E241C] mb-4">Répartition par moyen de paiement</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.par_moyen.map((m) => (
              <div key={m.moyen} className="bg-white rounded-xl border border-[#163A2C]/10 p-4">
                <p className="text-xs text-[#163A2C]/60 font-bold uppercase">{m.moyen.replace("_", " ")}</p>
                <p className="text-xl font-black text-[#163A2C] mt-1">{formatMontant(m.total)}</p>
                <p className="text-xs text-[#163A2C]/50 mt-1">{m.nombre} don{m.nombre > 1 ? "s" : ""} • {m.pourcentage}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <ChartLine
          data={chartData}
          title="Dons par moyen de paiement"
          lines={[
            {
              key: "Dons",
              name: "Montant (FCFA)",
              color: "#1E9D55",
            },
          ]}
          showArea
          height={300}
        />
      )}

      {/* DataTable */}
      <div className="rounded-lg bg-[#FFFBF0] shadow-sm overflow-hidden">
        <div className="border-b border-[#163A2C]/10 p-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#0E241C]">Derniers dons</h2>
          <div className="flex items-center gap-3">
            <select
              value={filtreMoyen}
              onChange={(e) => { setFiltreMoyen(e.target.value); setPage(1); }}
              className="rounded border border-[#163A2C]/10 bg-white px-3 py-1.5 text-sm focus:border-[#F0A93E] focus:outline-none"
            >
              <option value="">Tous les moyens</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="CARTE">Carte</option>
              <option value="VIREMENT">Virement</option>
              <option value="CASH">Espèce</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="rounded border border-[#163A2C]/10 bg-white px-3 py-1.5 text-sm focus:border-[#F0A93E] focus:outline-none"
            >
              <option value="date_desc">Les plus récents</option>
              <option value="date_asc">Les plus anciens</option>
              <option value="montant_desc">Montant décroissant</option>
              <option value="montant_asc">Montant croissant</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#163A2C]/20 border-t-[#F0A93E]" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center text-[#163A2C]/60">
            Aucun don enregistré
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#163A2C]/10 bg-[#FFFBF0]">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-[#0E241C]">Donateur</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#0E241C]">Montant</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#0E241C]">Moyen</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#0E241C]">Statut</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#0E241C]">Date</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((don, i) => (
                  <tr key={don.id} className={`border-b border-[#163A2C]/5 ${i % 2 === 0 ? "bg-white" : "bg-[#FFFBF0]/50"} hover:bg-[#FFFBF0]`}>
                    <td className="px-6 py-4 font-medium text-[#0E241C]">{don.donateur || "Anonyme"}</td>
                    <td className="px-6 py-4 font-bold text-[#1E9D55]">
                      {formatMontant(don.montant)}
                    </td>
                    <td className="px-6 py-4 text-[#163A2C]/70">
                      <span className="inline-flex items-center rounded-full bg-[#163A2C]/5 px-2.5 py-1 text-xs font-bold">
                        {don.moyen?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${statutColor(don.statut)}`}
                      >
                        {statutLabel(don.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#163A2C]/70">
                      {new Date(don.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="border-t border-[#163A2C]/10 flex items-center justify-center gap-2 p-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded border border-[#163A2C]/10 px-3 py-1 text-sm disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-sm text-[#163A2C]/60">
              Page {page} / {lastPage}
            </span>
            <button
              onClick={() => setPage(Math.min(lastPage, page + 1))}
              disabled={page === lastPage}
              className="rounded border border-[#163A2C]/10 px-3 py-1 text-sm disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

