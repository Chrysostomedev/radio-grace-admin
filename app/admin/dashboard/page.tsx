"use client";
import ListCard from "@/components/cards/ListCard";
import DonutCard from "@/components/cards/DonutCard";
import StatsCard from "@/components/cards/StatsCard";
import { useDashboard } from "@/hooks/admin/useDashboard";

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Jui",
    "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc",
  ];
  return `${d.getDate()} ${months[d.getMonth()] ?? "Jan"}`;
}

const ROLE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  ADMIN: { label: "Admin", bg: "bg-[#163A2C]/15", text: "text-[#163A2C]" },
  ANIMATEUR: { label: "Animateur", bg: "bg-[#F0A93E]/15", text: "text-[#9A6A1E]" },
  REDACTEUR: { label: "Rédacteur", bg: "bg-[#1E9D55]/15", text: "text-[#1E5A3D]" },
  AUDITEUR: { label: "Auditeur", bg: "bg-[#163A2C]/8", text: "text-[#163A2C]/60" },
};

export default function AdminDashboardPage() {
  const { data, loading } = useDashboard();

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-white rounded-2xl" />
          <div className="h-24 bg-white rounded-2xl" />
          <div className="h-24 bg-white rounded-2xl" />
        </div>
      </div>
    );
  }

  const compteurs = data?.compteurs;
  const users = data?.utilisateurs;
  const actualites = data?.actualites;

  return (
    <div className="space-y-5">
      {/* ── Stats principaux ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          label="Nombre total de Contenus"
          value={compteurs?.total_contenus ?? 0}
        />
        <StatsCard
          label="Émissions actives"
          value={pad(compteurs?.emissions_actives ?? 0)}
        />
        <StatsCard
          label="Événements à venir"
          value={pad(compteurs?.evenements_a_venir ?? 0)}
        />
      </div>

      {/* ── Stats actualités ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Actualités totales" value={pad(actualites?.total ?? 0)} />
        <StatsCard label="En cours de rédaction" value={pad(actualites?.en_cours ?? 0)} />
        <StatsCard label="Publiées" value={pad(actualites?.publiees ?? 0)} />
        <StatsCard label="En retard / à corriger" value={pad(actualites?.en_retard ?? 0)} />
      </div>

      {/* ── Stats utilisateurs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total utilisateurs" value={pad(users?.total_users ?? 0)} />
        <StatsCard label="Actifs" value={pad(users?.users_actifs ?? 0)} />
        <StatsCard label="Admins" value={pad(users?.par_role?.admins ?? 0)} />
        <StatsCard label="Auditeurs" value={pad(users?.par_role?.auditeurs ?? 0)} />
      </div>

      {/* ── Programmes + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ListCard
          title="Programmes récents"
          viewAllHref="/admin/emissions"
          viewAllText="Voir tous"
          items={(data?.emissions_recentes ?? []).map((p) => ({
            id: p.id,
            name: p.titre,
            subText: `${p.nombre_contenus} Contenus`,
            href: `/admin/emissions/${p.id}`,
          }))}
        />
        <DonutCard
          title="Répartition contenus"
          subtitle="Publiés sur Total"
          viewAllHref="/admin/actualites"
          viewAllText="Voir tous"
          segments={(data?.repartition_contenus ?? []).map((ps, i) => ({
            label: ps.label,
            done: ps.publies,
            total: ps.total,
            color: ["#F0A93E", "#1E9D55", "#163A2C"][i] || "#F0A93E",
          }))}
        />
      </div>

      {/* ── Tableau utilisateurs récents ── */}
      <div className="bg-white rounded-2xl border border-[#163A2C]/10 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-3 flex items-center justify-between">
          <h3 className="font-black text-[#163A2C]">Utilisateurs récents</h3>
          <a
            href="/admin/utilisateurs"
            className="text-sm font-bold text-[#F0A93E] hover:underline"
          >
            Voir tous
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F0A93E]/15">
                {["Nom complet", "Email", "Rôle", "Statut", "Inscrit le"].map(
                  (c) => (
                    <th
                      key={c}
                      className="px-4 py-3 text-left text-xs font-black text-[#163A2C]/60 uppercase tracking-wide"
                    >
                      {c}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#163A2C]/5">
              {(users?.utilisateurs_recents ?? []).length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-[#163A2C]/40"
                  >
                    Aucun utilisateur pour le moment
                  </td>
                </tr>
              ) : (
                (users?.utilisateurs_recents ?? []).map((u) => {
                  const role =
                    ROLE_CONFIG[u.role] ?? ROLE_CONFIG.AUDITEUR;
                  return (
                    <tr key={u.id} className="hover:bg-[#FBF6EA]/80">
                      <td className="px-4 py-4 text-sm font-semibold text-[#163A2C]">
                        {u.nom_complet}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#163A2C]/60">
                        {u.email}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase ${role.bg} ${role.text}`}
                        >
                          {role.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-black ${
                            u.actif
                              ? "bg-[#1E9D55]/15 text-[#1E5A3D]"
                              : "bg-[#163A2C]/10 text-[#163A2C]/50"
                          }`}
                        >
                          {u.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#163A2C]/60">
                        {formatDate(u.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}