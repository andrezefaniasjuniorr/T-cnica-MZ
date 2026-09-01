import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOZAMBIQUE_PROVINCES, TECHNICAL_CATEGORIES } from '../../types';
import {
  Wrench,
  Building2,
  User as UserIcon,
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
  KeyRound,
  LogIn,
  UserPlus,
  Briefcase,
  MapPin,
  Globe,
  Award
} from 'lucide-react';

interface AuthScreenProps {
  initialMode?: 'login' | 'register';
  initialRole?: 'client' | 'technician' | 'company';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  initialRole = 'client'
}) => {
  const { login, register, loginAsClient, resetPassword, isLoading } = useAuth();

  // Active flow: 'client' (Acesso Rápido) vs 'pro' (Técnico / Empresa)
  const [activeTab, setActiveTab] = useState<'client' | 'pro'>(
    initialRole === 'technician' || initialRole === 'company' ? 'pro' : 'client'
  );

  // Pro mode: 'login' | 'register'
  const [proMode, setProMode] = useState<'login' | 'register'>(initialMode);
  const [proRole, setProRole] = useState<'tecnico' | 'empresa'>(
    initialRole === 'company' ? 'empresa' : 'tecnico'
  );

  // Client Name Form State
  const [clientName, setClientName] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('clienteNome') || '' : '';
  });

  // Pro Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Technician Specific Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idade, setIdade] = useState<number | string>('28');
  const [specialty, setSpecialty] = useState<string>(TECHNICAL_CATEGORIES[0] || 'Eletricidade');
  const [province, setProvince] = useState<string>(MOZAMBIQUE_PROVINCES[0] || 'Maputo Cidade');
  const [city, setCity] = useState('Maputo');

  // Company Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [commercialName, setCommercialName] = useState('');
  const [nuit, setNuit] = useState('');
  const [industry, setIndustry] = useState('Construção & Engenharia Elétrica');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  // Status Alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1. CLIENT ACCESS HANDLER (SEM FIREBASE AUTH / SEM SENHA)
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Null-safe input validation
      const valorClienteNome = (clientName || '').toString().trim();
      if (!valorClienteNome) {
        setError('Por favor, digite o seu nome para continuar.');
        return;
      }

      loginAsClient(valorClienteNome);
      setSuccess(`Bem-vindo, ${valorClienteNome}! Redirecionando para a área do cliente...`);
      setTimeout(() => {
        window.location.hash = '#cliente';
      }, 400);
    } catch (err: any) {
      console.error('Erro no acesso de cliente:', err);
      setError('Ocorreu um erro ao registrar o acesso. Tente novamente.');
    }
  };

  // 2. FORGOT PASSWORD HANDLER
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const valorEmail = (email || '').toString().toLowerCase().trim();
      if (!valorEmail) {
        setError('Por favor, digite o seu e-mail cadastrado.');
        return;
      }

      const res = await resetPassword(valorEmail);
      if (res.success) {
        setSuccess('Instruções de redefinição de palavra-passe enviadas com sucesso para o seu e-mail!');
        setTimeout(() => setIsForgotPassword(false), 3000);
      } else {
        setError(res.error || 'Não foi possível enviar a recuperação de palavra-passe.');
      }
    } catch (err: any) {
      console.error('Erro na recuperação de senha:', err);
      setError(err?.message || 'Erro inesperado ao solicitar redefinição.');
    }
  };

  // 3. PRO LOGIN HANDLER (FIREBASE AUTH + CONSULTA FIRESTORE)
  const handleProLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Defensive input normalization
      const valorEmail = (email || '').toString().toLowerCase().trim();
      const valorSenha = (password || '').toString();

      if (!valorEmail || !valorSenha) {
        setError('Por favor, preencha o seu e-mail e palavra-passe.');
        return;
      }

      const res = await login(valorEmail, valorSenha);
      if (res.success && res.user) {
        setSuccess('Autenticação realizada com sucesso! Redirecionando...');
        if (res.user.role === 'company' || res.user.tipoConta === 'empresa') {
          window.location.hash = '#empresa';
        } else if (res.user.role === 'technician' || res.user.tipoConta === 'tecnico') {
          window.location.hash = '#tecnico';
        } else if (res.user.role === 'super_admin' || res.user.role === 'admin') {
          window.location.hash = '#gestao-pro-mz';
        } else {
          window.location.hash = '#tecnico';
        }
      } else {
        setError(res.error || 'Credenciais inválidas ou conta não encontrada.');
      }
    } catch (err: any) {
      console.error('Erro no login profissional:', err);
      setError(err?.message || 'Falha ao processar login. Verifique sua conexão.');
    }
  };

  // 4. PRO REGISTER HANDLER (CADASTRO EXCLUSIVO DE TÉCNICO OU EMPRESA NO FIREBASE)
  const handleProRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Safe defensive validation on all values
      const valorEmail = (email || '').toString().toLowerCase().trim();
      const valorSenha = (password || '').toString();
      const valorConfirmSenha = (confirmPassword || '').toString();
      const valorRole = (proRole || '').toString().toLowerCase().trim();

      if (!valorEmail) {
        setError('Por favor, informe um endereço de e-mail válido.');
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
        setError('As palavras-passe digitadas não coincidem.');
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
          setError('Por favor, insira o seu número de telefone/WhatsApp.');
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
          setSuccess('Cadastro de Técnico concluído com sucesso! Redirecionando...');
          setTimeout(() => {
            window.location.hash = '#tecnico';
          }, 500);
        } else {
          setError(res.error || 'Erro ao realizar o cadastro de técnico.');
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
          setError('Por favor, insira a denominação social da empresa.');
          return;
        }

        if (!valorTelefone) {
          setError('Por favor, insira o telefone comercial da empresa.');
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
          setSuccess('Cadastro de Empresa concluído com sucesso! Redirecionando...');
          setTimeout(() => {
            window.location.hash = '#empresa';
          }, 500);
        } else {
          setError(res.error || 'Erro ao realizar o cadastro de empresa.');
        }
      }
    } catch (err: any) {
      console.error('Erro na submissão de cadastro:', err);
      setError(err?.message || 'Falha ao processar o cadastro no Firebase.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50/50 flex flex-col justify-center py-8 sm:py-14 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-sky-200/60 via-blue-200/50 to-indigo-200/40 rounded-full blur-[100px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25 mb-4 ring-4 ring-sky-100">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Técnica<span className="text-blue-600">MZ</span> Pro
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Rede Nacional de Profissionais Técnicos e Empresas de Engenharia em Moçambique
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-950/5 border border-sky-100 p-6 sm:p-9 relative overflow-hidden backdrop-blur-sm">
          {/* Top Tabs: CLIENTES vs PROFISSIONAIS */}
          <div className="grid grid-cols-2 p-1.5 bg-sky-50/80 rounded-2xl mb-7 border border-sky-100">
            <button
              id="tab-btn-client"
              type="button"
              onClick={() => {
                setActiveTab('client');
                setError(null);
                setSuccess(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'client'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Sou Cliente</span>
            </button>

            <button
              id="tab-btn-pro"
              type="button"
              onClick={() => {
                setActiveTab('pro');
                setError(null);
                setSuccess(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'pro'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Técnico / Empresa</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div id="auth-error-banner" className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {success && (
            <div id="auth-success-banner" className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium leading-relaxed">{success}</div>
            </div>
          )}

          {/* TAB 1: CLIENT FLOW (NO PASSWORD / NO FIREBASE REGISTRATION) */}
          {activeTab === 'client' && (
            <form id="client-login-form" onSubmit={handleClientSubmit} className="space-y-6">
              <div className="bg-sky-50/60 rounded-2xl p-5 border border-sky-100 text-slate-700 text-sm">
                <div className="flex items-center gap-2 font-bold text-blue-900 mb-1 text-base">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Acesso Imediato para Clientes
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Não é necessário criar conta ou senha no Firebase. Basta informar o seu nome para contactar técnicos certificados, solicitar orçamentos e emitir avaliações.
                </p>
              </div>

              <div>
                <label htmlFor="clientName" className="block text-sm font-bold text-slate-800 mb-2">
                  Como deseja ser chamado? (Seu Nome) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <input
                    id="clientName"
                    name="clientName"
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: João Machel"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 text-base font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-xs"
                  />
                </div>
              </div>

              <button
                id="btn-client-access"
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-extrabold text-base shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Entrar como Cliente</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* TAB 2: PRO FLOW (TÉCNICO / EMPRESA COM FIREBASE AUTH) */}
          {activeTab === 'pro' && (
            <div>
              {/* Forgot Password Mode */}
              {isForgotPassword ? (
                <form id="forgot-password-form" onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-slate-700 text-sm">
                    <h3 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-blue-600" /> Recuperar Palavra-passe
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm">
                      Informe o e-mail da sua conta profissional para receber o link de redefinição de palavra-passe.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-800 mb-1.5">
                      E-mail Profissional *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tecnico@exemplo.co.mz"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      id="btn-send-reset-link"
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50"
                    >
                      {isLoading ? 'Enviando...' : 'Enviar Link de Redefinição'}
                    </button>
                    <button
                      id="btn-cancel-reset"
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  {/* Switch between Iniciar Sessão & Criar Nova Conta */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-mode-login"
                        type="button"
                        onClick={() => {
                          setProMode('login');
                          setError(null);
                          setSuccess(null);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                          proMode === 'login'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <LogIn className="w-4 h-4 inline-block mr-1.5" />
                        Iniciar Sessão
                      </button>

                      <button
                        id="btn-mode-register"
                        type="button"
                        onClick={() => {
                          setProMode('register');
                          setError(null);
                          setSuccess(null);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                          proMode === 'register'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <UserPlus className="w-4 h-4 inline-block mr-1.5" />
                        Criar Nova Conta
                      </button>
                    </div>
                  </div>

                  {/* PRO LOGIN FORM */}
                  {proMode === 'login' && (
                    <form id="pro-login-form" onSubmit={handleProLogin} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-bold text-slate-800 mb-1.5">
                          E-mail Profissional *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-5 h-5 text-blue-500" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu.email@exemplo.co.mz"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="password" className="block text-sm font-bold text-slate-800">
                            Palavra-passe *
                          </label>
                          <button
                            id="btn-forgot-password-link"
                            type="button"
                            onClick={() => setIsForgotPassword(true)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                          >
                            Esqueceu a palavra-passe?
                          </button>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-5 h-5 text-blue-500" />
                          </div>
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Sua palavra-passe"
                            className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                          <button
                            id="btn-toggle-password"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        id="btn-pro-login"
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>{isLoading ? 'Autenticando...' : 'Entrar no Painel Profissional'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* PRO REGISTER FORM (CADASTRO EXCLUSIVO DE TÉCNICO OU EMPRESA) */}
                  {proMode === 'register' && (
                    <form id="pro-register-form" onSubmit={handleProRegister} className="space-y-4">
                      {/* Selection: Técnico Individual vs Empresa de Engenharia */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                          Tipo de Cadastro Profissional *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            id="role-btn-tecnico"
                            type="button"
                            onClick={() => setProRole('tecnico')}
                            className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                              proRole === 'tecnico'
                                ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 text-blue-950'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 ${proRole === 'tecnico' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              <Wrench className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-extrabold text-sm">Técnico</div>
                              <div className="text-xs text-slate-500">Profissional Autônomo</div>
                            </div>
                          </button>

                          <button
                            id="role-btn-empresa"
                            type="button"
                            onClick={() => setProRole('empresa')}
                            className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                              proRole === 'empresa'
                                ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 text-blue-950'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 ${proRole === 'empresa' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-extrabold text-sm">Empresa</div>
                              <div className="text-xs text-slate-500">Prestadora / Empreiteira</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* TECHNICIAN FIELDS (Organized in Side-by-Side 2-Column Responsive Grid) */}
                      {proRole === 'tecnico' && (
                        <div className="space-y-4 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                                Nome Completo *
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                  <UserIcon className="w-4 h-4 text-blue-500" />
                                </div>
                                <input
                                  id="name"
                                  name="name"
                                  type="text"
                                  required
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  placeholder="Ex: Alberto Sitoe"
                                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
                                Telefone / WhatsApp *
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                  <Phone className="w-4 h-4 text-blue-500" />
                                </div>
                                <input
                                  id="phone"
                                  name="phone"
                                  type="tel"
                                  required
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  placeholder="+258 84 123 4567"
                                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="specialty" className="block text-xs font-bold text-slate-700 mb-1">
                                Especialidade Principal *
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                  <Wrench className="w-4 h-4 text-blue-500" />
                                </div>
                                <select
                                  id="specialty"
                                  name="specialty"
                                  value={specialty}
                                  onChange={(e) => setSpecialty(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer"
                                >
                                  {TECHNICAL_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label htmlFor="idade" className="block text-xs font-bold text-slate-700 mb-1">
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
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="province" className="block text-xs font-bold text-slate-700 mb-1">
                                Província *
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                  <MapPin className="w-4 h-4 text-blue-500" />
                                </div>
                                <select
                                  id="province"
                                  name="province"
                                  value={province}
                                  onChange={(e) => setProvince(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer"
                                >
                                  {MOZAMBIQUE_PROVINCES.map(prov => (
                                    <option key={prov} value={prov}>{prov}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label htmlFor="city" className="block text-xs font-bold text-slate-700 mb-1">
                                Cidade / Distrito *
                              </label>
                              <input
                                id="city"
                                name="city"
                                type="text"
                                required
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Ex: Maputo / Matola"
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* COMPANY FIELDS (Organized in Side-by-Side 2-Column Responsive Grid) */}
                      {proRole === 'empresa' && (
                        <div className="space-y-4 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="companyName" className="block text-xs font-bold text-slate-700 mb-1">
                                Denominação Social *
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                  <Building2 className="w-4 h-4 text-blue-500" />
                                </div>
                                <input
                                  id="companyName"
                                  name="companyName"
                                  type="text"
                                  required
                                  value={companyName}
                                  onChange={(e) => setCompanyName(e.target.value)}
                                  placeholder="Ex: Engenharia Austral Lda"
                                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor="commercialName" className="block text-xs font-bold text-slate-700 mb-1">
                                Nome Comercial (Marca)
                              </label>
                              <input
                                id="commercialName"
                                name="commercialName"
                                type="text"
                                value={commercialName}
                                onChange={(e) => setCommercialName(e.target.value)}
                                placeholder="Ex: Austral Clima & Solar"
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="nuit" className="block text-xs font-bold text-slate-700 mb-1">
                                NUIT da Empresa
                              </label>
                              <input
                                id="nuit"
                                name="nuit"
                                type="text"
                                value={nuit}
                                onChange={(e) => setNuit(e.target.value)}
                                placeholder="400XXXXXX"
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                              />
                            </div>

                            <div>
                              <label htmlFor="industry" className="block text-xs font-bold text-slate-700 mb-1">
                                Setor / Indústria *
                              </label>
                              <input
                                id="industry"
                                name="industry"
                                type="text"
                                required
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                placeholder="Ex: Engenharia Elétrica & Solar"
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="province" className="block text-xs font-bold text-slate-700 mb-1">
                                Província Sede *
                              </label>
                              <select
                                id="province"
                                name="province"
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer"
                              >
                                {MOZAMBIQUE_PROVINCES.map(prov => (
                                  <option key={prov} value={prov}>{prov}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
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
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="address" className="block text-xs font-bold text-slate-700 mb-1">
                                Endereço / Sede
                              </label>
                              <input
                                id="address"
                                name="address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Av. 24 de Julho, Maputo"
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                              />
                            </div>

                            <div>
                              <label htmlFor="website" className="block text-xs font-bold text-slate-700 mb-1">
                                Website ou LinkedIn
                              </label>
                              <input
                                id="website"
                                name="website"
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://www.empresa.co.mz"
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SHARED CREDENTIALS: EMAIL & PASSWORD (Side-by-Side on Desktop) */}
                      <div className="pt-2 border-t border-slate-100 space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                            E-mail de Acesso ao Firebase *
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
                              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">
                              Palavra-passe (mínimo 6 caracteres) *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Lock className="w-4 h-4 text-blue-500" />
                              </div>
                              <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                              />
                              <button
                                id="btn-toggle-reg-password"
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 mb-1">
                              Confirmar Palavra-passe *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Lock className="w-4 h-4 text-blue-500" />
                              </div>
                              <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        id="btn-pro-register"
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-3 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>{isLoading ? 'Cadastrando no Firebase...' : `Concluir Cadastro de ${proRole === 'tecnico' ? 'Técnico' : 'Empresa'}`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security & Reliability Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Dados criptografados
          </span>
          <span>•</span>
          <span>Moçambique (Maputo, Beira, Nampula, Tete)</span>
          <span>•</span>
          <span className="font-semibold text-slate-700">TécnicaMZ Pro 2026</span>
        </div>
      </div>
    </div>
  );
};
