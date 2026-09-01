import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOZAMBIQUE_PROVINCES, TECHNICAL_CATEGORIES } from '../../types';
import {
  X,
  User as UserIcon,
  Wrench,
  Building2,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  LogIn,
  UserPlus,
  KeyRound,
  MapPin
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'client' | 'technician' | 'company';
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'client',
  initialMode = 'login'
}) => {
  const { login, register, loginAsClient, resetPassword, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'client' | 'pro'>(
    initialRole === 'technician' || initialRole === 'company' ? 'pro' : 'client'
  );

  const [proMode, setProMode] = useState<'login' | 'register'>(initialMode);
  const [proRole, setProRole] = useState<'tecnico' | 'empresa'>(
    initialRole === 'company' ? 'empresa' : 'tecnico'
  );

  // Client Name Form
  const [clientName, setClientName] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('clienteNome') || '' : '';
  });

  // Pro Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Technician Specific
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idade, setIdade] = useState<number | string>('28');
  const [specialty, setSpecialty] = useState<string>(TECHNICAL_CATEGORIES[0] || 'Eletricidade');
  const [province, setProvince] = useState<string>(MOZAMBIQUE_PROVINCES[0] || 'Maputo Cidade');
  const [city, setCity] = useState('Maputo');

  // Company Specific
  const [companyName, setCompanyName] = useState('');
  const [commercialName, setCommercialName] = useState('');
  const [nuit, setNuit] = useState('');
  const [industry, setIndustry] = useState('Construção & Engenharia Elétrica');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  // Status Alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. CLIENT ACCESS
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const valorClienteNome = (clientName || '').toString().trim();
      if (!valorClienteNome) {
        setError('Por favor, digite seu nome para continuar.');
        return;
      }

      loginAsClient(valorClienteNome);
      setSuccess(`Bem-vindo, ${valorClienteNome}!`);
      setTimeout(() => {
        onClose();
        window.location.hash = '#cliente';
      }, 300);
    } catch (err: any) {
      console.error('Erro no acesso de cliente:', err);
      setError('Erro ao processar acesso. Tente novamente.');
    }
  };

  // 2. FORGOT PASSWORD
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const valorEmail = (email || '').toString().toLowerCase().trim();
      if (!valorEmail) {
        setError('Por favor, insira o seu e-mail cadastrado.');
        return;
      }

      const res = await resetPassword(valorEmail);
      if (res.success) {
        setSuccess('Instruções de redefinição enviadas para o seu e-mail!');
        setTimeout(() => setIsForgotPassword(false), 2500);
      } else {
        setError(res.error || 'Erro ao processar recuperação.');
      }
    } catch (err: any) {
      console.error('Erro na recuperação:', err);
      setError(err?.message || 'Erro inesperado ao solicitar redefinição.');
    }
  };

  // 3. PRO LOGIN
  const handleProLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const valorEmail = (email || '').toString().toLowerCase().trim();
      const valorSenha = (password || '').toString();

      if (!valorEmail || !valorSenha) {
        setError('Por favor, preencha o e-mail e a palavra-passe.');
        return;
      }

      const res = await login(valorEmail, valorSenha);
      if (res.success && res.user) {
        setSuccess('Autenticado com sucesso!');
        setTimeout(() => {
          onClose();
          if (res.user?.role === 'company' || res.user?.tipoConta === 'empresa') {
            window.location.hash = '#empresa';
          } else if (res.user?.role === 'technician' || res.user?.tipoConta === 'tecnico') {
            window.location.hash = '#tecnico';
          } else if (res.user?.role === 'super_admin' || res.user?.role === 'admin') {
            window.location.hash = '#gestao-pro-mz';
          } else {
            window.location.hash = '#tecnico';
          }
        }, 300);
      } else {
        setError(res.error || 'Credenciais inválidas.');
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err?.message || 'Falha ao autenticar.');
    }
  };

  // 4. PRO REGISTER
  const handleProRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const valorEmail = (email || '').toString().toLowerCase().trim();
      const valorSenha = (password || '').toString();
      const valorConfirmSenha = (confirmPassword || '').toString();
      const valorRole = (proRole || '').toString().toLowerCase().trim();

      if (!valorEmail) {
        setError('Por favor, informe um e-mail válido.');
        return;
      }

      if (!valorSenha) {
        setError('Por favor, defina uma palavra-passe.');
        return;
      }

      if (valorSenha.length < 6) {
        setError('A palavra-passe deve ter no mínimo 6 caracteres.');
        return;
      }

      if (valorSenha !== valorConfirmSenha) {
        setError('As palavras-passe não coincidem.');
        return;
      }

      if (valorRole === 'tecnico') {
        const valorNome = (name || '').toString().trim();
        const valorTelefone = (phone || '').toString().trim();
        const valorEspecialidade = (specialty || 'Eletricidade').toString().trim();
        const valorProvincia = (province || 'Maputo Cidade').toString().trim();
        const valorCidade = (city || 'Maputo').toString().trim();
        const valorIdade = Number(idade) || 25;

        if (!valorNome) {
          setError('Por favor, insira o seu nome completo.');
          return;
        }

        if (!valorTelefone) {
          setError('Por favor, insira o seu telefone/WhatsApp.');
          return;
        }

        const res = await register({
          name: valorNome,
          email: valorEmail,
          phone: valorTelefone,
          password: valorSenha,
          role: 'technician',
          tipoConta: 'tecnico',
          idade: valorIdade,
          specialty: valorEspecialidade,
          province: valorProvincia,
          city: valorCidade
        });

        if (res.success) {
          setSuccess('Cadastro concluído com sucesso!');
          setTimeout(() => {
            onClose();
            window.location.hash = '#tecnico';
          }, 350);
        } else {
          setError(res.error || 'Erro ao realizar cadastro.');
        }
      } else {
        // Empresa
        const valorEmpresaNome = (companyName || '').toString().trim();
        const valorComercialNome = (commercialName || valorEmpresaNome).toString().trim();
        const valorTelefone = (phone || '').toString().trim();
        const valorNuit = (nuit || '400000000').toString().trim();
        const valorIndustria = (industry || 'Construção & Engenharia Elétrica').toString().trim();
        const valorProvincia = (province || 'Maputo Cidade').toString().trim();
        const valorCidade = (city || 'Maputo').toString().trim();
        const valorEndereco = (address || 'Moçambique').toString().trim();
        const valorWebsite = (website || '').toString().trim();

        if (!valorEmpresaNome) {
          setError('Por favor, insira o nome da empresa.');
          return;
        }

        if (!valorTelefone) {
          setError('Por favor, insira o telefone da empresa.');
          return;
        }

        const res = await register({
          name: valorEmpresaNome,
          commercialName: valorComercialNome,
          nuit: valorNuit,
          email: valorEmail,
          phone: valorTelefone,
          password: valorSenha,
          role: 'company',
          tipoConta: 'empresa',
          province: valorProvincia,
          city: valorCidade,
          industry: valorIndustria,
          address: valorEndereco,
          website: valorWebsite
        });

        if (res.success) {
          setSuccess('Cadastro de empresa concluído!');
          setTimeout(() => {
            onClose();
            window.location.hash = '#empresa';
          }, 350);
        } else {
          setError(res.error || 'Erro ao realizar cadastro de empresa.');
        }
      }
    } catch (err: any) {
      console.error('Erro no registro modal:', err);
      setError(err?.message || 'Falha ao processar o cadastro.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-sky-100 p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/20 mb-2 ring-4 ring-sky-50">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Técnica<span className="text-blue-600">MZ</span> Pro
          </h2>
          <p className="text-xs text-slate-500 mt-1">Acesso à Plataforma Oficial</p>
        </div>

        {/* Top Tabs */}
        <div className="grid grid-cols-2 p-1 bg-sky-50 rounded-xl mb-6 border border-sky-100">
          <button
            id="modal-tab-client"
            type="button"
            onClick={() => {
              setActiveTab('client');
              setError(null);
              setSuccess(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'client'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Sou Cliente</span>
          </button>

          <button
            id="modal-tab-pro"
            type="button"
            onClick={() => {
              setActiveTab('pro');
              setError(null);
              setSuccess(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'pro'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Técnico / Empresa</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div id="modal-error-banner" className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs sm:text-sm animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div id="modal-success-banner" className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs sm:text-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* TAB 1: CLIENT ACCESS */}
        {activeTab === 'client' && (
          <form id="modal-client-form" onSubmit={handleClientSubmit} className="space-y-4">
            <div className="bg-sky-50/70 rounded-xl p-4 border border-sky-100 text-xs text-slate-600">
              <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Acesso Rápido para Clientes
              </div>
              <p>Digite apenas o seu nome para solicitar orçamentos e contactar técnicos diretamente via WhatsApp.</p>
            </div>

            <div>
              <label htmlFor="clientName" className="block text-xs font-bold text-slate-800 mb-1.5">
                Seu Nome Completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4 text-blue-500" />
                </div>
                <input
                  id="clientName"
                  name="clientName"
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Maria Mabote"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              id="modal-btn-client-enter"
              type="submit"
              className="w-full py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Entrar como Cliente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: PRO FLOW */}
        {activeTab === 'pro' && (
          <div>
            {isForgotPassword ? (
              <form id="modal-forgot-password-form" onSubmit={handleForgotPassword} className="space-y-4">
                <div className="bg-sky-50 rounded-xl p-3.5 border border-sky-100 text-xs text-slate-600">
                  <div className="font-bold text-blue-900 mb-0.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" /> Recuperar Palavra-passe
                  </div>
                  Digite seu e-mail cadastrado para redefinir a palavra-passe.
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-800 mb-1">
                    E-mail Cadastrado *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.co.mz"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    id="modal-btn-send-reset"
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition disabled:opacity-50"
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Link'}
                  </button>
                  <button
                    id="modal-btn-cancel-reset"
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition"
                  >
                    Voltar
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {/* Switch Login / Register */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      id="modal-mode-login"
                      type="button"
                      onClick={() => {
                        setProMode('login');
                        setError(null);
                        setSuccess(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        proMode === 'login'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5 inline mr-1" />
                      Iniciar Sessão
                    </button>

                    <button
                      id="modal-mode-register"
                      type="button"
                      onClick={() => {
                        setProMode('register');
                        setError(null);
                        setSuccess(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        proMode === 'register'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5 inline mr-1" />
                      Criar Conta
                    </button>
                  </div>
                </div>

                {/* PRO LOGIN */}
                {proMode === 'login' && (
                  <form id="modal-pro-login-form" onSubmit={handleProLogin} className="space-y-3.5">
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-slate-800 mb-1">
                        E-mail *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4 text-blue-500" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu.email@exemplo.co.mz"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="password" className="block text-xs font-bold text-slate-800">
                          Palavra-passe *
                        </label>
                        <button
                          id="modal-btn-forgot-password"
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4 text-blue-500" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Sua palavra-passe"
                          className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <button
                          id="modal-toggle-password"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      id="modal-btn-submit-pro-login"
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>{isLoading ? 'Entrando...' : 'Entrar no Painel'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* PRO REGISTER */}
                {proMode === 'register' && (
                  <form id="modal-pro-register-form" onSubmit={handleProRegister} className="space-y-3.5 max-h-[58vh] overflow-y-auto pr-1">
                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        id="modal-role-tecnico"
                        type="button"
                        onClick={() => setProRole('tecnico')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                          proRole === 'tecnico'
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <Wrench className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-xs">Técnico Individual</span>
                      </button>

                      <button
                        id="modal-role-empresa"
                        type="button"
                        onClick={() => setProRole('empresa')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                          proRole === 'empresa'
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-xs">Empresa de Engenharia</span>
                      </button>
                    </div>

                    {/* Technician Specific (Side-by-side) */}
                    {proRole === 'tecnico' && (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label htmlFor="name" className="block text-[11px] font-bold text-slate-700 mb-1">
                              Nome Completo *
                            </label>
                            <input
                              id="name"
                              name="name"
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Seu nome"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="phone" className="block text-[11px] font-bold text-slate-700 mb-1">
                              Telefone / WhatsApp *
                            </label>
                            <input
                              id="phone"
                              name="phone"
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+258 84 000 0000"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label htmlFor="specialty" className="block text-[11px] font-bold text-slate-700 mb-1">
                              Especialidade *
                            </label>
                            <select
                              id="specialty"
                              name="specialty"
                              value={specialty}
                              onChange={(e) => setSpecialty(e.target.value)}
                              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                              {TECHNICAL_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="idade" className="block text-[11px] font-bold text-slate-700 mb-1">
                              Idade *
                            </label>
                            <input
                              id="idade"
                              name="idade"
                              type="number"
                              min="18"
                              max="85"
                              required
                              value={idade}
                              onChange={(e) => setIdade(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label htmlFor="province" className="block text-[11px] font-bold text-slate-700 mb-1">
                              Província *
                            </label>
                            <select
                              id="province"
                              name="province"
                              value={province}
                              onChange={(e) => setProvince(e.target.value)}
                              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                              {MOZAMBIQUE_PROVINCES.map(prov => (
                                <option key={prov} value={prov}>{prov}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="city" className="block text-[11px] font-bold text-slate-700 mb-1">
                              Cidade / Distrito *
                            </label>
                            <input
                              id="city"
                              name="city"
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="Ex: Maputo"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Company Specific (Side-by-side) */}
                    {proRole === 'empresa' && (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label htmlFor="companyName" className="block text-[11px] font-bold text-slate-700 mb-1">
                              Denominação Social *
                            </label>
                            <input
                              id="companyName"
                              name="companyName"
                              type="text"
                              required
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="Nome da empresa"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="phone" className="block text-[11px] font-bold text-slate-700 mb-1">
                              Telefone Comercial *
                            </label>
                            <input
                              id="phone"
                              name="phone"
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+258 84 999 8888"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label htmlFor="industry" className="block text-[11px] font-bold text-slate-700 mb-1">
                              Setor / Ramo *
                            </label>
                            <input
                              id="industry"
                              name="industry"
                              type="text"
                              required
                              value={industry}
                              onChange={(e) => setIndustry(e.target.value)}
                              placeholder="Ex: Engenharia Elétrica"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="province" className="block text-[11px] font-bold text-slate-700 mb-1">
                              Província *
                            </label>
                            <select
                              id="province"
                              name="province"
                              value={province}
                              onChange={(e) => setProvince(e.target.value)}
                              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                              {MOZAMBIQUE_PROVINCES.map(prov => (
                                <option key={prov} value={prov}>{prov}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Shared Email and Passwords */}
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <div>
                        <label htmlFor="email" className="block text-[11px] font-bold text-slate-700 mb-1">
                          E-mail de Cadastro *
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu.email@exemplo.co.mz"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label htmlFor="password" className="block text-[11px] font-bold text-slate-700 mb-1">
                            Palavra-passe *
                          </label>
                          <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 dígitos"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-[11px] font-bold text-slate-700 mb-1">
                            Confirmar Palavra-passe *
                          </label>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repita a senha"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      id="modal-btn-submit-pro-register"
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>{isLoading ? 'Cadastrando...' : `Finalizar Cadastro de ${proRole === 'tecnico' ? 'Técnico' : 'Empresa'}`}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
