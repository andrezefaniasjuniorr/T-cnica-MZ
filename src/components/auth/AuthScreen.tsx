import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, MOZAMBIQUE_PROVINCES, TECHNICAL_CATEGORIES } from '../../types';
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
  Briefcase,
  MapPin,
  Globe,
  FileText,
  Check,
  ChevronRight,
  LogIn,
  UserPlus
} from 'lucide-react';

interface AuthScreenProps {
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  initialRole = 'client'
}) => {
  const { login, register, resetPassword, isLoading } = useAuth();

  // Section A: 'client' (Quero solicitar serviços / Sou Cliente)
  // Section B: 'pro' (Sou Técnico / Empresa)
  const [activeSection, setActiveSection] = useState<'client' | 'pro'>(
    initialRole === 'technician' || initialRole === 'company' ? 'pro' : 'client'
  );

  // Sub-options for Section A: 'client_login' | 'client_register'
  const [clientOption, setClientOption] = useState<'client_login' | 'client_register'>(
    initialMode === 'register' ? 'client_register' : 'client_login'
  );

  // Sub-options for Section B: 'tech_login' | 'company_login' | 'tech_register' | 'company_register'
  const [proOption, setProOption] = useState<'tech_login' | 'company_login' | 'tech_register' | 'company_register'>(
    initialRole === 'company'
      ? (initialMode === 'register' ? 'company_register' : 'company_login')
      : (initialMode === 'register' ? 'tech_register' : 'tech_login')
  );

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idade, setIdade] = useState<number | string>('28');

  // Technician Specific
  const [specialty, setSpecialty] = useState<string>(TECHNICAL_CATEGORIES[0] || 'Eletricidade');
  const [province, setProvince] = useState<string>(MOZAMBIQUE_PROVINCES[0] || 'Maputo Cidade');
  const [city, setCity] = useState('Maputo');

  // Company Specific
  const [commercialName, setCommercialName] = useState('');
  const [nuit, setNuit] = useState('');
  const [industry, setIndustry] = useState('Construção & Engenharia Elétrica');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  // Status Alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEmailDuplicateError = error && (
    error.includes('E-mail já existente') ||
    error.includes('já está cadastrado') ||
    error.includes('já está registado') ||
    error.includes('email-already-in-use')
  );

  const handleSwitchToLoginWithEmail = () => {
    setError(null);
    if (activeSection === 'client') {
      setClientOption('client_login');
    } else {
      if (proOption === 'company_register') {
        setProOption('company_login');
      } else {
        setProOption('tech_login');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. FORGOT PASSWORD FLOW
    if (isForgotPassword) {
      if (!email.trim()) {
        setError('Por favor insira o seu e-mail cadastrado.');
        return;
      }
      const res = await resetPassword(email.trim());
      if (res.success) {
        setSuccess('Instruções de redefinição enviadas para o seu e-mail!');
        setTimeout(() => setIsForgotPassword(false), 2500);
      } else {
        setError(res.error || 'Erro ao processar o pedido de recuperação.');
      }
      return;
    }

    // 2. SECTION A: QUERO SOLICITAR SERVIÇOS / SOU CLIENTE
    if (activeSection === 'client') {
      if (clientOption === 'client_login') {
        // Opção 1: Entrar na Conta (Login Cliente)
        if (!email.trim() || !password.trim()) {
          setError('Por favor preencha o seu e-mail e palavra-passe.');
          return;
        }
        const res = await login(email.trim(), password);
        if (res.success) {
          setSuccess('Sessão iniciada com sucesso como Cliente!');
          if (res.user?.tipoConta === 'empresa' || res.user?.role === 'company') {
            window.location.hash = '#empresa';
          } else if (res.user?.tipoConta === 'tecnico' || res.user?.role === 'technician') {
            window.location.hash = '#tecnico';
          } else {
            window.location.hash = '#cliente';
          }
        } else {
          setError(res.error || 'Credenciais de cliente inválidas.');
        }
      } else {
        // Opção 2: Criar Nova Conta (Cadastro de Cliente)
        if (!name.trim()) {
          setError('Por favor insira o seu Nome Completo.');
          return;
        }
        if (!email.trim()) {
          setError('Por favor insira o seu E-mail.');
          return;
        }
        if (!password || password.length < 6) {
          setError('A palavra-passe deve conter pelo menos 6 caracteres.');
          return;
        }
        if (confirmPassword && password !== confirmPassword) {
          setError('As palavras-passe não coincidem.');
          return;
        }

        const res = await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password.trim(),
          role: 'client',
          tipoConta: 'cliente',
          idade: Number(idade) || 28
        });

        if (res.success) {
          setSuccess('Conta de Cliente criada com sucesso! Bem-vindo à TécnicaMZ.');
          window.location.hash = '#cliente';
        } else {
          setError(res.error || 'Não foi possível concluir o registo.');
        }
      }
      return;
    }

    // 3. SECTION B: SOU TÉCNICO / EMPRESA
    if (activeSection === 'pro') {
      if (proOption === 'tech_login') {
        // Opção 1: Entrar como Técnico
        if (!email.trim() || !password.trim()) {
          setError('Por favor insira o seu e-mail e palavra-passe de Técnico.');
          return;
        }
        const res = await login(email.trim(), password);
        if (res.success) {
          setSuccess('Acesso ao Painel do Técnico validado!');
          window.location.hash = '#tecnico';
        } else {
          setError(res.error || 'Credenciais de Técnico incorretas.');
        }
      } else if (proOption === 'company_login') {
        // Opção 2: Entrar como Empresa
        if (!email.trim() || !password.trim()) {
          setError('Por favor insira o e-mail corporativo e palavra-passe da Empresa.');
          return;
        }
        const res = await login(email.trim(), password);
        if (res.success) {
          setSuccess('Acesso ao Painel da Empresa validado!');
          window.location.hash = '#empresa';
        } else {
          setError(res.error || 'Credenciais de Empresa incorretas.');
        }
      } else if (proOption === 'tech_register') {
        // Opção 3: Criar Conta como Técnico
        if (!name.trim()) {
          setError('Por favor insira o Nome Completo do Técnico.');
          return;
        }
        if (!email.trim()) {
          setError('Por favor insira o seu E-mail profissional.');
          return;
        }
        if (!phone.trim()) {
          setError('Por favor insira o seu Número de Celular / WhatsApp.');
          return;
        }
        if (!password || password.length < 6) {
          setError('A palavra-passe deve conter pelo menos 6 caracteres.');
          return;
        }
        if (confirmPassword && password !== confirmPassword) {
          setError('As palavras-passe não coincidem.');
          return;
        }

        const res = await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password.trim(),
          role: 'technician',
          tipoConta: 'tecnico',
          idade: Number(idade) || 28,
          specialty,
          province,
          city: city.trim() || 'Maputo'
        });

        if (res.success) {
          setSuccess('Registo de Técnico submetido com sucesso! Aguarde a validação rápida da equipa.');
          window.location.hash = '#tecnico';
        } else {
          setError(res.error || 'Não foi possível concluir o registo de técnico.');
        }
      } else if (proOption === 'company_register') {
        // Opção 4: Criar Conta como Empresa
        if (!name.trim()) {
          setError('Por favor insira a Razão Social da Empresa.');
          return;
        }
        if (!email.trim()) {
          setError('Por favor insira o E-mail institucional da Empresa.');
          return;
        }
        if (!phone.trim()) {
          setError('Por favor insira o Contacto Telefónico / WhatsApp Corporativo.');
          return;
        }
        if (!password || password.length < 6) {
          setError('A palavra-passe deve conter pelo menos 6 caracteres.');
          return;
        }
        if (confirmPassword && password !== confirmPassword) {
          setError('As palavras-passe não coincidem.');
          return;
        }

        const res = await register({
          name: name.trim(),
          commercialName: commercialName.trim() || name.trim(),
          nuit: nuit.trim() || '400000000',
          industry: industry.trim(),
          address: address.trim() || 'Moçambique',
          website: website.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password.trim(),
          role: 'company',
          tipoConta: 'empresa',
          idade: Number(idade) || 30,
          province,
          city: city.trim() || 'Maputo'
        });

        if (res.success) {
          setSuccess('Registo Empresarial submetido com sucesso! Aceda ao portal da empresa.');
          window.location.hash = '#empresa';
        } else {
          setError(res.error || 'Não foi possível concluir o registo da empresa.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 flex flex-col justify-between items-center px-4 py-8 sm:py-12 selection:bg-blue-600 selection:text-white">
      {/* Brand Header */}
      <div className="w-full max-w-xl flex flex-col items-center mb-6 text-center">
        <div className="inline-flex items-center gap-3 mb-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Técnica<span className="text-blue-600">MZ</span>
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-600 text-white tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Plataforma Oficial de Serviços Técnicos em Moçambique
            </p>
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 transition-all">
        {/* ========================================================================= */}
        {/* 1. MAIN 2-SECTION TABS: CLIENT VS TECHNICIAN/COMPANY                      */}
        {/* ========================================================================= */}
        {!isForgotPassword && (
          <div className="mb-6">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2 text-center">
              Selecione o seu perfil de entrada:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/70">
              {/* SECTION A: CLIENT */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection('client');
                  setError(null);
                  setSuccess(null);
                }}
                className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
                  activeSection === 'client'
                    ? 'bg-white text-emerald-700 shadow-md border border-emerald-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  activeSection === 'client' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-center sm:text-left leading-tight">
                  <span className="block font-black text-xs">Quero Solicitar Serviços</span>
                  <span className="text-[10px] font-semibold opacity-75 hidden sm:inline">Sou Cliente</span>
                </div>
              </button>

              {/* SECTION B: TECHNICIAN / COMPANY */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection('pro');
                  setError(null);
                  setSuccess(null);
                }}
                className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
                  activeSection === 'pro'
                    ? 'bg-white text-blue-700 shadow-md border border-blue-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  activeSection === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div className="text-center sm:text-left leading-tight">
                  <span className="block font-black text-xs">Sou Técnico / Empresa</span>
                  <span className="text-[10px] font-semibold opacity-75 hidden sm:inline">Prestador Profissional</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. SUB-OPTIONS SELECTOR ACCORDING TO SECTION                              */}
        {/* ========================================================================= */}
        {!isForgotPassword && activeSection === 'client' && (
          <div className="mb-6 p-1 bg-emerald-50/80 border border-emerald-100 rounded-2xl flex">
            {/* Opção 1: Entrar na Conta (Login Cliente) */}
            <button
              type="button"
              onClick={() => {
                setClientOption('client_login');
                setError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                clientOption === 'client_login'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-900/80 hover:text-emerald-950'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar na Conta (Login)</span>
            </button>

            {/* Opção 2: Criar Nova Conta (Cadastro de Cliente) */}
            <button
              type="button"
              onClick={() => {
                setClientOption('client_register');
                setError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                clientOption === 'client_register'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-900/80 hover:text-emerald-950'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar Nova Conta (Cadastro)</span>
            </button>
          </div>
        )}

        {!isForgotPassword && activeSection === 'pro' && (
          <div className="mb-6">
            <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Opções para Profissionais e Empresas:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 bg-blue-50/80 border border-blue-100 rounded-2xl">
              {/* Opção 1: Entrar como Técnico */}
              <button
                type="button"
                onClick={() => {
                  setProOption('tech_login');
                  setError(null);
                }}
                className={`py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  proOption === 'tech_login'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-900/80 hover:text-blue-950 bg-white/60'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">1. Login Técnico</span>
              </button>

              {/* Opção 2: Entrar como Empresa */}
              <button
                type="button"
                onClick={() => {
                  setProOption('company_login');
                  setError(null);
                }}
                className={`py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  proOption === 'company_login'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-900/80 hover:text-blue-950 bg-white/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">2. Login Empresa</span>
              </button>

              {/* Opção 3: Criar Conta como Técnico */}
              <button
                type="button"
                onClick={() => {
                  setProOption('tech_register');
                  setError(null);
                }}
                className={`py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  proOption === 'tech_register'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-900/80 hover:text-blue-950 bg-white/60'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">3. Cadastrar Técnico</span>
              </button>

              {/* Opção 4: Criar Conta como Empresa */}
              <button
                type="button"
                onClick={() => {
                  setProOption('company_register');
                  setError(null);
                }}
                className={`py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  proOption === 'company_register'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-900/80 hover:text-blue-950 bg-white/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">4. Cadastrar Empresa</span>
              </button>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD VIEW HEADER */}
        {isForgotPassword && (
          <div className="mb-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-200">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">Recuperar Palavra-passe</h2>
            <p className="text-xs text-slate-500 mt-1">
              Insira o e-mail associado à sua conta para receber instruções de recuperação.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. ALERTS & VALIDATION BANNERS                                            */}
        {/* ========================================================================= */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-xs text-red-800 font-bold">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">
                <p className="font-extrabold text-red-900 mb-0.5">Aviso de Registo / Acesso</p>
                <p>{error}</p>
                {isEmailDuplicateError && (
                  <button
                    type="button"
                    onClick={handleSwitchToLoginWithEmail}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-[11px] transition shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Fazer Login com este E-mail</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-5 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{success}</div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. DYNAMIC FORM FIELDS                                                    */}
        {/* ========================================================================= */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CLIENT REGISTRATION: FULL NAME & IDADE */}
          {!isForgotPassword && activeSection === 'client' && clientOption === 'client_register' && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Carlos Macuácua"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                  Idade (Anos) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={18}
                  max={99}
                  value={idade}
                  onChange={e => setIdade(e.target.value)}
                  placeholder="Ex: 28"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </>
          )}

          {/* TECHNICIAN REGISTRATION: NAME, IDADE, PHONE, SPECIALTY, PROVINCE, CITY */}
          {!isForgotPassword && activeSection === 'pro' && proOption === 'tech_register' && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                  Nome Completo do Técnico <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Mateus Sitoe"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Idade (Anos) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={18}
                    max={99}
                    value={idade}
                    onChange={e => setIdade(e.target.value)}
                    placeholder="Ex: 28"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    WhatsApp / Celular <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="841234567"
                      className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                  Especialidade Técnica Principal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Wrench className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <select
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  >
                    {TECHNICAL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Província
                  </label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  >
                    {MOZAMBIQUE_PROVINCES.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Cidade / Distrito
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Ex: Maputo"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* COMPANY REGISTRATION: RAZÃO SOCIAL, COMMERCIAL NAME, NUIT, INDUSTRY, PHONE, LOCATION */}
          {!isForgotPassword && activeSection === 'pro' && proOption === 'company_register' && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                  Razão Social / Nome da Empresa <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: EletroTec Moçambique, Lda"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Nome Comercial
                  </label>
                  <input
                    type="text"
                    value={commercialName}
                    onChange={e => setCommercialName(e.target.value)}
                    placeholder="Ex: EletroTec MZ"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    NUIT da Empresa
                  </label>
                  <input
                    type="text"
                    value={nuit}
                    onChange={e => setNuit(e.target.value)}
                    placeholder="Ex: 400123456"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                  Telefone / WhatsApp Comercial <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Ex: +258 84 999 0001"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Província Sede
                  </label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  >
                    {MOZAMBIQUE_PROVINCES.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Cidade / Município
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Ex: Maputo"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                  Idade do Representante Legal <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={18}
                  max={99}
                  value={idade}
                  onChange={e => setIdade(e.target.value)}
                  placeholder="Ex: 30"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </>
          )}

          {/* CLIENT REGISTRATION: PHONE (OPTIONAL/RECOMMENDED) */}
          {!isForgotPassword && activeSection === 'client' && clientOption === 'client_register' && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                Número de Celular / WhatsApp <span className="text-slate-400 font-normal">(Recomendado)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ex: 84 123 4567"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>
          )}

          {/* COMMON FIELD: EMAIL */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 block">
              {activeSection === 'pro' && (proOption === 'company_login' || proOption === 'company_register')
                ? 'E-mail Corporativo'
                : 'Endereço de E-mail'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 transition ${
                  activeSection === 'client'
                    ? 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                    : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
            </div>
          </div>

          {/* COMMON FIELD: PASSWORD (WHEN NOT IN FORGOT PASSWORD) */}
          {!isForgotPassword && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Palavra-passe <span className="text-red-500">*</span>
                </label>
                {(clientOption === 'client_login' || proOption === 'tech_login' || proOption === 'company_login') && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Esqueceu a palavra-passe?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 transition ${
                    activeSection === 'client'
                      ? 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'
                  }`}
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
          )}

          {/* CONFIRM PASSWORD ON REGISTRATION */}
          {!isForgotPassword && (
            (activeSection === 'client' && clientOption === 'client_register') ||
            (activeSection === 'pro' && (proOption === 'tech_register' || proOption === 'company_register'))
          ) && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                Confirmar Palavra-passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 transition ${
                    activeSection === 'client'
                      ? 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'
                  }`}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. SUBMIT BUTTON                                                          */}
          {/* ========================================================================= */}
          <div className="pt-2">
            {isForgotPassword ? (
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enviar Instruções de Recuperação</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Voltar ao Login
                </button>
              </div>
            ) : activeSection === 'client' ? (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {clientOption === 'client_login'
                        ? 'Entrar como Cliente'
                        : 'Criar Minha Conta de Cliente'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {proOption === 'tech_login' && 'Entrar no Painel do Técnico'}
                      {proOption === 'company_login' && 'Entrar no Painel da Empresa'}
                      {proOption === 'tech_register' && 'Submeter Cadastro de Técnico'}
                      {proOption === 'company_register' && 'Submeter Registo Empresarial'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Security & Verification Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Acesso Seguro Firebase Auth & Firestore</span>
          </div>
          <span className="font-bold text-slate-400">TécnicaMZ Pro</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 TécnicaMZ Pro Moçambique. Todos os direitos reservados.</p>
      </div>
    </div>
  );
};
