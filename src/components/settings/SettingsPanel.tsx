import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, MOZAMBIQUE_PROVINCES, TECHNICAL_CATEGORIES } from '../../types';
import {
  User,
  Wrench,
  Building2,
  Mail,
  Phone,
  MapPin,
  Lock,
  Moon,
  Sun,
  Shield,
  MessageCircle,
  HelpCircle,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Camera,
  ExternalLink
} from 'lucide-react';
import { TopBackNav } from '../common/TopBackNav';

interface SettingsPanelProps {
  onNavigateTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onNavigateTab,
  isDarkMode,
  onToggleDarkMode
}) => {
  const {
    currentUser,
    currentTechProfile,
    currentCompanyProfile,
    updateCurrentUserProfile,
    updateCurrentTechProfile,
    updateCurrentCompanyProfile,
    switchUserRole,
    changePassword,
    logout
  } = useAuth();

  // Profile Form States
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [province, setProvince] = useState(currentTechProfile?.province || 'Maputo Cidade');
  const [city, setCity] = useState(currentTechProfile?.city || 'Maputo');
  const [specialty, setSpecialty] = useState(
    currentTechProfile?.specialties?.[0] || TECHNICAL_CATEGORIES[0] || 'Eletricidade'
  );
  const [bio, setBio] = useState(currentTechProfile?.bio || '');

  // Role Toggle State
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser?.role || 'client');

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status Alerts
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileSuccess(null);

    try {
      await updateCurrentUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim() || undefined
      });

      if (currentUser?.role === 'technician') {
        const cleanDigits = phone.replace(/\D/g, '');
        const cleanWhatsapp = cleanDigits ? (cleanDigits.startsWith('258') ? cleanDigits : `258${cleanDigits}`) : '';

        await updateCurrentTechProfile({
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: cleanWhatsapp,
          province,
          city: city.trim(),
          specialties: [specialty],
          bio: bio.trim()
        });
      }

      setProfileSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: any) {
      console.error('Save profile error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (newRole: UserRole) => {
    setSelectedRole(newRole);
    await switchUserRole(newRole);
    setProfileSuccess(`Papel da conta alterado para ${newRole === 'technician' ? 'Técnico' : newRole === 'company' ? 'Empresa' : 'Cliente'}!`);
    setTimeout(() => setProfileSuccess(null), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('A nova palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As palavras-passes não coincidem.');
      return;
    }

    const res = await changePassword(newPassword);
    if (res.success) {
      setPasswordSuccess('Palavra-passe alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 3000);
    } else {
      setPasswordError(res.error || 'Erro ao alterar a palavra-passe.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Back Navigation Bar */}
      <TopBackNav
        title="Definições da Conta & Segurança"
        category="Configurações"
        onBack={() => onNavigateTab('community')}
        backLabel="Voltar ao Mural"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Definições da Conta</h1>
        <p className="text-xs text-slate-500 mt-1">
          Gerencie seus dados pessoais, preferências de perfil, segurança e suporte oficial TécnicaMZ Pro.
        </p>
      </div>

      {profileSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {/* 1. EDITAR PERFIL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Editar Perfil & Contatos</h2>
            <p className="text-[11px] text-slate-500">Atualize suas informações visíveis na comunidade</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar URL / Image */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Foto de Perfil (URL da Imagem)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-black text-slate-700 shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <input
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://exemplo.com/minha-foto.jpg"
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Número de Celular / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+258 84 123 4567"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">E-mail Cadastrado</label>
            <input
              type="email"
              disabled
              value={currentUser?.email || ''}
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono cursor-not-allowed"
            />
          </div>

          {/* Tech Profile Extra Fields */}
          {currentUser?.role === 'technician' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Especialidade Principal</label>
                  <select
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {TECHNICAL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Província</label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {MOZAMBIQUE_PROVINCES.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Cidade</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Biografia Profissional</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Descreva suas competências e experiência técnica..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. PREFERÊNCIAS: ALTERNAR PAPEL DA CONTA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Preferências de Papel</h2>
            <p className="text-[11px] text-slate-500">Alterne facilmente entre modo Cliente e modo Técnico</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleRoleChange('client')}
            className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
              currentUser?.role === 'client'
                ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <User className={`w-5 h-5 shrink-0 mt-0.5 ${currentUser?.role === 'client' ? 'text-blue-600' : 'text-slate-400'}`} />
            <div>
              <h3 className="text-xs font-black text-slate-900">Modo Cliente / Consumidor</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ideal para pesquisar técnicos, contratar serviços e solicitar orçamentos.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('technician')}
            className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
              currentUser?.role === 'technician'
                ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <Wrench className={`w-5 h-5 shrink-0 mt-0.5 ${currentUser?.role === 'technician' ? 'text-blue-600' : 'text-slate-400'}`} />
            <div>
              <h3 className="text-xs font-black text-slate-900">Modo Técnico Profissional</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Acesso a gerador de ordens de serviço (OS), cálculo de projetos e listagem no diretório.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. APARÊNCIA: MODO CLARO / ESCURO AZULADO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Aparência do Sistema</h2>
            <p className="text-[11px] text-slate-500">Escolha o tema de cores de sua preferência</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-sky-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <div>
              <p className="text-xs font-bold text-slate-900">
                {isDarkMode ? 'Modo Escuro (Azul Noite)' : 'Modo Claro (Padrão #F0F2F5)'}
              </p>
              <p className="text-[11px] text-slate-500">
                {isDarkMode ? 'Interface com fundo azul-marinho profundo.' : 'Interface clara com alto contraste.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              isDarkMode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isDarkMode ? 'Ativado' : 'Ativar Modo Escuro'}
          </button>
        </div>
      </div>

      {/* 4. SUPORTE DIRETO OFICIAL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Suporte Técnico Oficial TécnicaMZ Pro</h2>
            <p className="text-[11px] text-slate-500">Canais diretos de atendimento e suporte aos membros</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://wa.me/258851949159"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-2xl transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-emerald-950">WhatsApp Oficial</p>
                <p className="text-[11px] font-mono text-emerald-700 font-bold">851949159</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <a
            href="mailto:tecnicamzpro@gmail.com"
            className="p-4 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 rounded-2xl transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-blue-950">E-mail de Suporte</p>
                <p className="text-[11px] font-mono text-blue-700 font-bold">tecnicamzpro@gmail.com</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* 5. SEGURANÇA E SESSÃO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Segurança & Palavra-passe</h2>
            <p className="text-[11px] text-slate-500">Altere sua senha ou encerre sua sessão</p>
          </div>
        </div>

        {passwordError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Nova Palavra-passe</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 dígitos"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Confirmar Nova Palavra-passe</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a palavra-passe"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Terminar Sessão</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition shadow-xs"
            >
              Atualizar Palavra-passe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
