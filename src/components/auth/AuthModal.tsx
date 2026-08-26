import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, MOZAMBIQUE_PROVINCES, TECHNICAL_CATEGORIES } from '../../types';
import {
  X,
  User,
  Wrench,
  Building2,
  Shield,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  KeyRound,
  RotateCcw
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'client',
  initialMode = 'login'
}) => {
  const { login, register, resetPassword, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Technician Specific
  const [specialty, setSpecialty] = useState(TECHNICAL_CATEGORIES[0]);
  const [province, setProvince] = useState(MOZAMBIQUE_PROVINCES[0]);
  const [city, setCity] = useState('Maputo');

  // Company Specific
  const [commercialName, setCommercialName] = useState('');
  const [nuit, setNuit] = useState('');
  const [industry, setIndustry] = useState('Energia Solar & Eletricidade');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'forgot_password') {
      if (!email.trim()) {
        setError('Por favor preencha o seu e-mail cadastrado.');
        return;
      }
      const res = await resetPassword(email.trim());
      if (res.success) {
        setSuccess('Instruções de recuperação enviadas para o seu e-mail!');
        setTimeout(() => {
          setMode('login');
        }, 2000);
      } else {
        setError(res.error || 'Erro ao solicitar recuperação de senha.');
      }
      return;
    }

    if (mode === 'login') {
      if (!email.trim()) {
        setError('Por favor preencha o seu e-mail.');
        return;
      }
      const res = await login(email.trim(), password);
      if (res.success) {
        setSuccess('Autenticado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setError(res.error || 'Erro ao iniciar sessão.');
      }
    } else {
      // Registration
      if (!name.trim() || !email.trim() || !phone.trim()) {
        setError('Por favor preencha todos os campos obrigatórios.');
        return;
      }

      if (password && password.length < 6) {
        setError('A palavra-passe deve ter no mínimo 6 caracteres.');
        return;
      }

      const res = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim() || undefined,
        role: selectedRole,
        specialty,
        province,
        city,
        nuit: selectedRole === 'company' ? nuit.trim() || '400000000' : undefined,
        commercialName: selectedRole === 'company' ? commercialName.trim() || name.trim() : undefined,
        industry: selectedRole === 'company' ? industry : undefined,
        address: selectedRole === 'company' ? address.trim() || 'Moçambique' : undefined,
        website: selectedRole === 'company' ? website.trim() : undefined
      });

      if (res.success) {
        setSuccess('Conta criada e autenticada com sucesso na TécnicaMZ!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(res.error || 'Erro ao criar conta.');
      }
    }
  };

  const getRoleTheme = () => {
    switch (selectedRole) {
      case 'technician':
        return {
          title: 'Portal do Profissional Técnico',
          color: 'bg-blue-600 hover:bg-blue-700 text-white',
          headerBg: 'bg-blue-900',
          badge: '🔧 Técnico & Engenheiro'
        };
      case 'company':
        return {
          title: 'Portal Empresarial & Recrutamento',
          color: 'bg-purple-600 hover:bg-purple-700 text-white',
          headerBg: 'bg-purple-900',
          badge: '🏢 Empresa & Indústria'
        };
      case 'admin':
        return {
          title: 'Central de Controlo Administrativa',
          color: 'bg-slate-900 hover:bg-slate-800 text-amber-400',
          headerBg: 'bg-slate-950',
          badge: '🛡️ Gestão & Auditoria'
        };
      default:
        return {
          title: 'Portal do Cliente',
          color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          headerBg: 'bg-emerald-950',
          badge: '👤 Cliente & Particular'
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className={`${theme.headerBg} text-white p-6 flex items-center justify-between transition-colors duration-300`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
              {theme.badge}
            </span>
            <h2 className="text-xl font-black text-white">
              {mode === 'login' && 'Entrar na Conta'}
              {mode === 'register' && 'Criar Nova Conta'}
              {mode === 'forgot_password' && 'Recuperar Palavra-passe'}
            </h2>
            <p className="text-xs text-white/80">Comunidade Técnica de Moçambique • TécnicaMZ</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs (Only on login or register) */}
        {mode !== 'forgot_password' && (
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Selecione o seu Tipo de Acesso:
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-200/70 p-1 rounded-2xl">
              {[
                { role: 'client' as UserRole, label: 'Cliente', icon: <User className="w-3.5 h-3.5" /> },
                { role: 'technician' as UserRole, label: 'Técnico', icon: <Wrench className="w-3.5 h-3.5" /> },
                { role: 'company' as UserRole, label: 'Empresa', icon: <Building2 className="w-3.5 h-3.5" /> },
                { role: 'admin' as UserRole, label: 'Admin', icon: <Shield className="w-3.5 h-3.5" /> }
              ].map(r => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setSelectedRole(r.role)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                    selectedRole === r.role
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r.icon}
                  <span className="text-[10px]">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {mode === 'forgot_password' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Informe o seu e-mail cadastrado na plataforma TécnicaMZ. Enviaremos um link seguro para redefinir sua palavra-passe.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.co.mz"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Profissional</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.co.mz"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Palavra-passe</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot_password')}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                    >
                      Esqueceu a palavra-passe?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Sua palavra-passe de acesso"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Registration Extra Fields */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {selectedRole === 'company' ? 'Razão Social da Empresa' : 'Nome Completo'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={selectedRole === 'company' ? 'Ex: Moz Engenharia & Serviços Lda' : 'Ex: Mateus Nhantumbo'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telefone Principal / WhatsApp (+258)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+258 84 123 4567"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Technician Extra fields */}
                  {selectedRole === 'technician' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Especialidade Principal</label>
                        <select
                          value={specialty}
                          onChange={e => setSpecialty(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        >
                          {TECHNICAL_CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Província de Atuação</label>
                        <select
                          value={province}
                          onChange={e => setProvince(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        >
                          {MOZAMBIQUE_PROVINCES.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Company Extra fields */}
                  {selectedRole === 'company' && (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Nome Comercial</label>
                          <input
                            type="text"
                            value={commercialName}
                            onChange={e => setCommercialName(e.target.value)}
                            placeholder="Ex: MozSolar"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">NUIT Oficial</label>
                          <input
                            type="text"
                            value={nuit}
                            onChange={e => setNuit(e.target.value)}
                            placeholder="Ex: 400123456"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Setor de Atividade</label>
                          <input
                            type="text"
                            value={industry}
                            onChange={e => setIndustry(e.target.value)}
                            placeholder="Ex: Construção Civil & Estruturas"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Província Sede</label>
                          <select
                            value={province}
                            onChange={e => setProvince(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                          >
                            {MOZAMBIQUE_PROVINCES.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md ${theme.color}`}
            >
              <span>
                {isLoading
                  ? 'Processando...'
                  : mode === 'forgot_password'
                  ? 'Enviar Link de Recuperação'
                  : mode === 'login'
                  ? 'Iniciar Sessão Segura'
                  : 'Criar Minha Conta'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle Login / Register / Forgot */}
          <div className="text-center pt-2">
            {mode === 'forgot_password' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
              >
                Voltar para o Início de Sessão
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
              >
                {mode === 'login' ? 'Não possui conta? Cadastre-se gratuitamente' : 'Já possui conta? Inicie sessão'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
