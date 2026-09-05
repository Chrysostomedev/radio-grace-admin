'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/admin/useProfile';
import { User, Mail, Phone, MapPin, Lock, Save, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilPage() {
  const { profile, isLoadingProfile, updateProfile, isUpdatingProfile, updatePassword, isUpdatingPassword } = useProfile();

  // State pour le formulaire infos
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    phone: '',
  });

  // State pour le formulaire mot de passe
  const [passwordForm, setPasswordForm] = useState({
    password_actuel: '',
    password: '',
    password_confirmation: '',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Initialiser le formulaire quand le profil est chargé
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  if (profile && !isFormInitialized) {
    setFormData({
      prenom: profile.prenom || '',
      nom: profile.nom || '',
      email: profile.email || '',
      phone: profile.phone || '',
    });
    setIsFormInitialized(true);
  }

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier que les champs requis sont remplis
    if (!formData.prenom || !formData.nom || !formData.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    updateProfile(formData);
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!passwordForm.password_actuel || !passwordForm.password || !passwordForm.password_confirmation) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    updatePassword(passwordForm);

    // Réinitialiser le formulaire
    setPasswordForm({
      password_actuel: '',
      password: '',
      password_confirmation: '',
    });
    setShowPasswordForm(false);
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-[#163A2C]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-4 pb-6 border-b border-[#163A2C]/10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F0A93E] to-[#CA8A04] flex items-center justify-center text-white text-2xl font-black">
          {profile?.prenom?.[0]}{profile?.nom?.[0]}
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#163A2C]">Mon Profil</h1>
          <p className="text-[#163A2C]/60 text-sm mt-1">
            {profile?.roles?.map((r) => r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()).join(' • ')}
          </p>
        </div>
      </div>

      {/* Formulaire infos personnelles */}
      <form onSubmit={handleSubmitProfile} className="bg-white rounded-2xl border border-[#163A2C]/10 p-8 space-y-6">
        <h2 className="text-xl font-black text-[#163A2C] flex items-center gap-2">
          <User size={20} /> Informations personnelles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Prénom */}
          <div>
            <label className="block text-sm font-bold text-[#163A2C] mb-2">Prénom *</label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#163A2C]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0A93E]"
              placeholder="Votre prénom"
              required
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-bold text-[#163A2C] mb-2">Nom *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#163A2C]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0A93E]"
              placeholder="Votre nom"
              required
            />
          </div>

          {/* Email */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-[#163A2C] mb-2 flex items-center gap-2">
              <Mail size={16} /> Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#163A2C]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0A93E]"
              placeholder="votre.email@exemple.com"
              required
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-bold text-[#163A2C] mb-2 flex items-center gap-2">
              <Phone size={16} /> Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#163A2C]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0A93E]"
              placeholder="+225 0X XX XX XX"
            />
          </div>
        </div>

        {/* Bouton submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-[#F0A93E] to-[#CA8A04] hover:from-[#CA8A04] hover:to-[#9A6A1E] text-[#163A2C] font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUpdatingProfile ? (
              <>
                <Loader size={18} className="animate-spin" />
                Mise à jour...
              </>
            ) : (
              <>
                <Save size={18} />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>

      {/* Formulaire mot de passe */}
      <div className="bg-white rounded-2xl border border-[#163A2C]/10 p-8 space-y-6">
        <h2 className="text-xl font-black text-[#163A2C] flex items-center gap-2">
          <Lock size={20} /> Sécurité
        </h2>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="px-6 py-3 bg-[#163A2C]/10 hover:bg-[#163A2C]/20 text-[#163A2C] font-bold rounded-lg transition-all"
          >
            Changer le mot de passe
          </button>
        ) : (
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">Mot de passe actuel *</label>
              <input
                type="password"
                value={passwordForm.password_actuel}
                onChange={(e) => setPasswordForm({ ...passwordForm, password_actuel: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#163A2C]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0A93E]"
                placeholder="Entrez votre mot de passe actuel"
                required
              />
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">Nouveau mot de passe *</label>
              <input
                type="password"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#163A2C]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0A93E]"
                placeholder="Minimum 8 caractères, majuscules, minuscules, chiffres et symboles"
                required
              />
              <p className="text-xs text-[#163A2C]/60 mt-2">
                Doit contenir: majuscules, minuscules, chiffres et caractères spéciaux
              </p>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label className="block text-sm font-bold text-[#163A2C] mb-2">Confirmer le mot de passe *</label>
              <input
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#163A2C]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0A93E]"
                placeholder="Confirmez le nouveau mot de passe"
                required
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F0A93E] to-[#CA8A04] hover:from-[#CA8A04] hover:to-[#9A6A1E] text-[#163A2C] font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Changer le mot de passe
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({
                    password_actuel: '',
                    password: '',
                    password_confirmation: '',
                  });
                }}
                className="px-4 py-3 bg-[#163A2C]/10 hover:bg-[#163A2C]/20 text-[#163A2C] font-bold rounded-lg transition-all"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Infos supplémentaires */}
      {profile && (
        <div className="bg-[#FBF6EA] rounded-2xl border border-[#163A2C]/10 p-6 space-y-3 text-sm text-[#163A2C]/70">
          <p>
            <span className="font-bold">Compte créé:</span> {new Date(profile.created_at).toLocaleDateString('fr-FR')}
          </p>
          <p>
            <span className="font-bold">Dernière modification:</span> {new Date(profile.updated_at).toLocaleDateString('fr-FR')}
          </p>
          <p>
            <span className="font-bold">ID utilisateur:</span> {profile.id}
          </p>
        </div>
      )}
    </div>
  );
}
