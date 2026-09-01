import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, MOZAMBIQUE_PROVINCES, TECHNICAL_CATEGORIES } from '../../types';
import { ComprarSeloTab } from './ComprarSeloTab';
import { uploadProfilePhoto } from '../../utils/imageUpload';
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
  ShieldCheck,
  MessageCircle,
  HelpCircle,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Camera,
  Upload,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { TopBackNav } from '../common/TopBackNav';

interface SettingsPanelProps {
  onNavigateTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  initialSubTab?: 'perfil' | 'selo_mz' | 'aparencia' | 'suporte' | 'seguranca';
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onNavigateTab,
  isDarkMode,
  onToggleDarkMode,
  initialSubTab = 'perfil'
}) => {
  const {
    currentUser,
    currentTechProfile,
    currentCompanyProfile,
    temSeloMZ,
    statusSelo,
    updateCurrentUserProfile,
    updateCurrentTechProfile,
    updateCurrentCompanyProfile,
    switchUserRole,
    changePassword,
    logout
  } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'perfil' | 'selo_mz' | 'aparencia' | 'suporte' | 'seguranca'>(initialSubTab);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form States
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [idade, setIdade] = useState<number | string>(currentUser?.idade || 28);
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || currentUser?.photoURL || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setIsUploadingPhoto(true);
      const uploadedUrl = await uploadProfilePhoto(currentUser.uid, file);
      setAvatarUrl(uploadedUrl);

      // Auto update profile with new photo
      await updateCurrentUserProfile({
        avatarUrl: uploadedUrl,
        photoURL: uploadedUrl
      });

      if (currentUser.role === 'technician') {
        await updateCurrentTechProfile({
          avatarUrl: uploadedUrl,
          photoURL: uploadedUrl
        });
      }

      setProfileSuccess('Foto de perfil atualizada com sucesso!');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao enviar foto:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileSuccess(null);

    try {
      const parsedAge = Number(idade) || 28;

      await updateCurrentUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        idade: parsedAge,
        avatarUrl: avatarUrl.trim() || undefined,
        photoURL: avatarUrl.trim() || undefined
      });

      if (currentUser?.role === 'technician') {
        const cleanDigits = phone.replace(/\D/g, '');
        const cleanWhatsapp = cleanDigits ? (cleanDigits.startsWith('258') ? cleanDigits : `258${cleanDigits}`) : '';

        await updateCurrentTechProfile({
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: cleanWhatsapp,
          idade: parsedAge,
          avatarUrl: avatarUrl.trim() || undefined,
          photoURL: avatarUrl.trim() || undefined,
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
          Gerencie seus dados pessoais, Selo MZ de verificação, preferências, segurança e suporte oficial.
        </p>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('perfil')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 transition cursor-pointer ${
            activeSubTab === 'perfil'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Perfil & Contatos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('selo_mz')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 transition cursor-pointer ${
            activeSubTab === 'selo_mz'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : temSeloMZ
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Comprar Selo MZ</span>
          {temSeloMZ ? (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase">
              Ativo
            </span>
          ) : statusSelo === 'pendente_aprovacao' ? (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-600 text-white text-[9px] font-black uppercase">
              Pendente
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-black uppercase">
              50 MT
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('aparencia')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 transition cursor-pointer ${
            activeSubTab === 'aparencia'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {isDarkMode ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          <span>Aparência</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('suporte')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 transition cursor-pointer ${
            activeSubTab === 'suporte'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>Suporte Oficial</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('seguranca')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 transition cursor-pointer ${
            activeSubTab === 'seguranca'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Lock className="w-4 h-4 text-red-500" />
          <span>Segurança</span>
        </button>
      </div>

      {profileSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {/* SELO MZ TAB */}
      {activeSubTab === 'selo_mz' && (
        <ComprarSeloTab />
      )}

      {/* 1. EDITAR PERFIL */}
      {activeSubTab === 'perfil' && (
        <div className="space-y-6">
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
          {/* Avatar / Photo Upload */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
            <label className="text-[11px] font-bold text-slate-700 block">
              Foto de Perfil
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden flex items-center justify-center font-black text-slate-700 text-lg shadow-sm shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Carregando foto...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>Escolher Foto da Galeria</span>
                      </>
                    )}
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="px-3 py-2 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Remover Foto
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">Ou URL direta:</span>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    placeholder="https://exemplo.com/foto.jpg"
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Name, Phone & Idade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Idade (Anos)</label>
              <input
                type="number"
                required
                min={18}
                max={99}
                value={idade}
                onChange={e => setIdade(e.target.value)}
                placeholder="28"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Número de Celular / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="841234567"
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

      {/* 2. INFORMAÇÃO DE PERFIL PERMANENTE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Tipo de Perfil Registado</h2>
            <p className="text-[11px] text-slate-500">Definição permanente estabelecida na criação da conta</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
              currentUser?.role === 'client' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}>
              {currentUser?.role === 'client' ? <User className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  {currentUser?.role === 'client' ? 'Conta de Cliente (Contratar Serviços)' : 'Conta de Técnico Profissional / Empresa'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                  Permanente
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentUser?.role === 'client'
                  ? 'Acesso simplificado para orçamentos, pedidos de serviço, pesquisa no directório e mercado.'
                  : 'Acesso a ferramentas avançadas, ordens de serviço, dimensionamentos e Sara IA.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* 3. APARÊNCIA: MODO CLARO / ESCURO AZULADO */}
      {activeSubTab === 'aparencia' && (
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
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                isDarkMode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isDarkMode ? 'Ativado' : 'Ativar Modo Escuro'}
            </button>
          </div>
        </div>
      )}

      {/* 4. SUPORTE DIRETO OFICIAL */}
      {activeSubTab === 'suporte' && (
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
      )}

      {/* 5. SEGURANÇA E SESSÃO */}
      {activeSubTab === 'seguranca' && (
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
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Terminar Sessão</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition shadow-xs cursor-pointer"
              >
                Atualizar Palavra-passe
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
