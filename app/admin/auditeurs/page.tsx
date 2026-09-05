'use client';

import { useState } from 'react';
import { useAuditeurs, useAuditeurDetail } from '@/hooks/admin/useAuditeurs';
import { Users, Search, Eye, TrendingUp, ShoppingCart, Gift, MessageSquare, Loader } from 'lucide-react';

export default function AuditeursPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedAuditeurId, setSelectedAuditeurId] = useState<number | null>(null);

  const { data: auditeursData, isLoading: isLoadingList } = useAuditeurs(page, search);
  const { data: auditeurDetailData, isLoading: isLoadingDetail } = useAuditeurDetail(selectedAuditeurId);

  const auditeurs = auditeursData?.data || [];
  const meta = auditeursData?.meta;
  const auditeurDetail = auditeurDetailData?.data;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#163A2C] flex items-center gap-2">
            <Users size={32} /> Auditeurs
          </h1>
          <p className="mt-1 text-[#163A2C]/60">Gérez les utilisateurs mobiles et leurs stats</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-[#F0A93E]">{meta?.total || 0}</p>
          <p className="text-sm text-[#163A2C]/60">Total auditeurs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des auditeurs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#163A2C]/40" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, phone..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-[#163A2C]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0A93E]"
            />
          </div>

          {/* Liste */}
          <div className="bg-white rounded-2xl border border-[#163A2C]/10 overflow-hidden">
            {isLoadingList ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-[#163A2C]" />
              </div>
            ) : auditeurs.length === 0 ? (
              <div className="text-center py-12 text-[#163A2C]/60">
                <Users size={40} className="mx-auto mb-4 opacity-20" />
                <p>Aucun auditeur trouvé</p>
              </div>
            ) : (
              <div className="divide-y divide-[#163A2C]/5">
                {auditeurs.map((a: any) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAuditeurId(a.id)}
                    className={`w-full text-left px-6 py-4 hover:bg-[#FBF6EA] transition flex items-center justify-between ${
                      selectedAuditeurId === a.id ? 'bg-[#F0A93E]/10 border-l-4 border-[#F0A93E]' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#163A2C] truncate">
                        {a.user?.prenom} {a.user?.nom}
                      </p>
                      <p className="text-sm text-[#163A2C]/60 truncate">{a.user?.email}</p>
                    </div>
                    
                    {/* Stats rapides */}
                    <div className="ml-4 flex gap-3 text-xs font-bold">
                      <span className="text-[#F0A93E]">💝 {a.stats?.dons_count || 0}</span>
                      <span className="text-[#1E9D55]">🙏 {a.stats?.intentions_count || 0}</span>
                      <span className="text-[#163A2C]">🛒 {a.stats?.commandes_count || 0}</span>
                    </div>

                    <Eye className="w-4 h-4 text-[#163A2C]/40 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-[#163A2C]/10 hover:bg-[#163A2C]/20 text-[#163A2C] font-bold rounded-lg disabled:opacity-50"
              >
                ← Précédent
              </button>
              <p className="text-sm text-[#163A2C]/60">
                Page {meta.current_page} sur {meta.last_page}
              </p>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="px-4 py-2 bg-[#163A2C]/10 hover:bg-[#163A2C]/20 text-[#163A2C] font-bold rounded-lg disabled:opacity-50"
              >
                Suivant →
              </button>
            </div>
          )}
        </div>

        {/* Détails auditeur */}
        <div className="lg:col-span-1">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-[#163A2C]" />
            </div>
          ) : auditeurDetail ? (
            <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-6 space-y-6">
              {/* Avatar et infos */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F0A93E] to-[#CA8A04] flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
                  {auditeurDetail.user?.prenom?.[0]}{auditeurDetail.user?.nom?.[0]}
                </div>
                <h3 className="font-bold text-[#163A2C]">
                  {auditeurDetail.user?.prenom} {auditeurDetail.user?.nom}
                </h3>
                <p className="text-xs text-[#163A2C]/60">{auditeurDetail.user?.email}</p>
                {auditeurDetail.user?.phone && (
                  <p className="text-xs text-[#163A2C]/60">{auditeurDetail.user?.phone}</p>
                )}
              </div>

              {/* Stats grille */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FBF6EA] rounded-lg p-3 text-center">
                  <p className="text-2xl font-black text-[#F0A93E]">{auditeurDetail.stats?.dons_total}</p>
                  <p className="text-xs text-[#163A2C]/60">FCFA donnés</p>
                </div>
                <div className="bg-[#FBF6EA] rounded-lg p-3 text-center">
                  <p className="text-2xl font-black text-[#1E9D55]">{auditeurDetail.stats?.dons_count}</p>
                  <p className="text-xs text-[#163A2C]/60">Dons</p>
                </div>
                <div className="bg-[#FBF6EA] rounded-lg p-3 text-center">
                  <p className="text-2xl font-black text-[#163A2C]">{auditeurDetail.stats?.intentions_count}</p>
                  <p className="text-xs text-[#163A2C]/60">Intentions</p>
                </div>
                <div className="bg-[#FBF6EA] rounded-lg p-3 text-center">
                  <p className="text-2xl font-black text-[#CA8A04]">{auditeurDetail.stats?.commandes_count}</p>
                  <p className="text-xs text-[#163A2C]/60">Commandes</p>
                </div>
              </div>

              {/* Activité */}
              <div className="space-y-4">
                <h4 className="font-bold text-[#163A2C] text-sm flex items-center gap-2">
                  <TrendingUp size={16} /> Activité récente (30 jours)
                </h4>

                {/* Dons par jour */}
                {auditeurDetail.activity?.dons_par_jour && auditeurDetail.activity.dons_par_jour.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#163A2C]/60 mb-2 flex items-center gap-1">
                      <Gift size={14} /> Dons
                    </p>
                    <div className="space-y-1">
                      {auditeurDetail.activity.dons_par_jour.slice(0, 5).map((d: any) => (
                        <div key={d.jour} className="flex items-center justify-between text-xs">
                          <span className="text-[#163A2C]/60">{new Date(d.jour).toLocaleDateString('fr-FR', {month: 'short', day: 'numeric'})}</span>
                          <span className="font-bold text-[#F0A93E]">{d.count} don{d.count !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Intentions par jour */}
                {auditeurDetail.activity?.intentions_par_jour && auditeurDetail.activity.intentions_par_jour.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#163A2C]/60 mb-2 flex items-center gap-1">
                      <MessageSquare size={14} /> Intentions
                    </p>
                    <div className="space-y-1">
                      {auditeurDetail.activity.intentions_par_jour.slice(0, 5).map((d: any) => (
                        <div key={d.jour} className="flex items-center justify-between text-xs">
                          <span className="text-[#163A2C]/60">{new Date(d.jour).toLocaleDateString('fr-FR', {month: 'short', day: 'numeric'})}</span>
                          <span className="font-bold text-[#1E9D55]">{d.count} intention{d.count !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Commandes par jour */}
                {auditeurDetail.activity?.commandes_par_jour && auditeurDetail.activity.commandes_par_jour.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#163A2C]/60 mb-2 flex items-center gap-1">
                      <ShoppingCart size={14} /> Commandes
                    </p>
                    <div className="space-y-1">
                      {auditeurDetail.activity.commandes_par_jour.slice(0, 5).map((d: any) => (
                        <div key={d.jour} className="flex items-center justify-between text-xs">
                          <span className="text-[#163A2C]/60">{new Date(d.jour).toLocaleDateString('fr-FR', {month: 'short', day: 'numeric'})}</span>
                          <span className="font-bold text-[#163A2C]">{d.count} cmd{d.count !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="text-xs text-[#163A2C]/60 space-y-1">
                <p>Créé: {new Date(auditeurDetail.created_at).toLocaleDateString('fr-FR')}</p>
                <p>Modifié: {new Date(auditeurDetail.updated_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#FBF6EA] rounded-2xl border border-[#163A2C]/10 p-6 text-center text-[#163A2C]/60">
              <Users size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">Sélectionnez un auditeur pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
