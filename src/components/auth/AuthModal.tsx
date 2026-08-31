import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, MOZAMBIQUE_PROVINCES, TECHNICAL_CATEGORIES } from '../../types';
import {
  X,
  User as UserIcon,
  Wrench,
  Building2,
  Briefcase,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  LogIn,
  UserPlus
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

  if (!isOpen) return null;

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
        setSuccess('Instruções enviadas para o seu e-mail!');
        setTimeout(() => setIsForgotPassword(false), 2000);
      } else {
        setError(res.error || 'Erro ao solicitar recuperação de senha.');
      }
      return;
    }

    // 2. SECTION A: CLIENT
    if (activeSection === 'client') {
      if (clientOption === 'client_login') {
        if (!email.trim() || !password.trim()) {
          setError('Por favor insira seu e-mail e palavra-passe.');
          return;
        }
        const res = await login(email.trim(), password);
        if (res.success) {
          setSuccess('Sessão iniciada!');
          setTimeout(() => onClose(), 600);
        } else {
          setError(res.error || 'Credenciais inválidas.');
        }
      } else {
        if (!name.trim()) {
          setError('Por favor insira o seu Nome Completo.');
          return;
        }
        if (!email.trim()) {
          setError('Por favor insira o seu E-mail.');
          return;
        }
        if (!password || password.length < 6) {
          setError('A palavra-passe deve ter pelo menos 6 caracteres.');
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
          setSuccess('Conta criada com sucesso!');
          setTimeout(() => onClose(), 800);
        } else {
          setError(res.error || 'Erro ao criar conta de cliente.');
        }
      }
      return;
    }

    // 3. SECTION B: PRO (TECHNICIAN / COMPANY)
    if (activeSection === 'pro') {
      if (proOption === 'tech_login') {
        if (!email.trim() || !password.trim()) {
          setError('Por favor insira seu e-mail e palavra-passe de Técnico.');
          return;
        }
        const res = await login(email.trim(), password);
        if (res.success) {
          setSuccess('Acesso ao Painel do Técnico autorizado!');
          setTimeout(() => onClose(), 600);
        } else {
          setError(res.error || 'Credenciais de Técnico incorretas.');
        }
      } else if (proOption === 'company_login') {
        if (!email.trim() || !password.trim()) {
          setError('Por favor insira o e-mail corporativo e palavra-passe.');
          return;
        }
        const res = await login(email.trim(), password);
        if (res.success) {
          setSuccess('Acesso ao Portal da Empresa autorizado!');
          setTimeout(() => onClose(), 600);
        } else {
          setError(res.error || 'Credenciais de Empresa incorretas.');
        }
      } else if (proOption === 'tech_register') {
        if (!name.trim()) {
          setError('Por favor insira o Nome Completo.');
          return;
        }
        if (!email.trim()) {
          setError('Por favor insira o seu E-mail.');
          return;
        }
        if (!phone.trim()) {
          setError('Por favor insira o seu Celular / WhatsApp.');
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
          setSuccess('Registo de Técnico efetuado com sucesso!');
          setTimeout(() => onClose(), 800);
        } else {
          setError(res.error || 'Erro ao registar conta de técnico.');
        }
      } else if (proOption === 'company_register') {
        if (!name.trim()) {
          setError('Por favor insira a Razão Social da Empresa.');
          return;
        }
        if (!email.trim()) {
          setError('Por favor insira o E-mail da Empresa.');
          return;
        }
        if (!phone.trim()) {
          setError('Por favor insira o Telefone / WhatsApp Corporativo.');
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
          setSuccess('Registo Empresarial efetuado com sucesso!');
          setTimeout(() => onClose(), 800);
        } else {
          setError(res.error || 'Erro ao registar conta empresarial.');
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">
              Técnica<span className="text-blue-600">MZ</span> PRO
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Acesso à Plataforma de Serviços Técnicos
            </p>
          </div>
        </div>

        {/* 1. Main 2-Section Tabs */}
        {!isForgotPassword && (
          <div className="mb-5">
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('client');
                  setError(null);
                }}
                className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition ${
                  activeSection === 'client'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <span>Sou Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSection('pro');
                  setError(null);
                }}
                className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition ${
                  activeSection === 'pro'
                    ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Técnico / Empresa</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. Sub-options */}
        {!isForgotPassword && activeSection === 'client' && (
          <div className="mb-5 p-1 bg-emerald-50/80 border border-emerald-100 rounded-2xl flex">
            <button
              type="button"
              onClick={() => {
                setClientOption('client_login');
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                clientOption === 'client_login'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-950'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Cliente</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setClientOption('client_register');
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                clientOption === 'client_register'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-950'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastro Cliente</span>
            </button>
          </div>
        )}

        {!isForgotPassword && activeSection === 'pro' && (
          <div className="mb-5 grid grid-cols-2 gap-1.5 p-1 bg-blue-50/80 border border-blue-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setProOption('tech_login');
                setError(null);
              }}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 ${
                proOption === 'tech_login'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-900 bg-white/60'
              }`}
            >
              <Wrench className="w-3 h-3" />
              <span>1. Login Técnico</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setProOption('company_login');
                setError(null);
              }}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 ${
                proOption === 'company_login'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-900 bg-white/60'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>2. Login Empresa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setProOption('tech_register');
                setError(null);
              }}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 ${
                proOption === 'tech_register'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-900 bg-white/60'
              }`}
            >
              <UserPlus className="w-3 h-3" />
              <span>3. Cadastrar Técnico</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setProOption('company_register');
                setError(null);
              }}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 ${
                proOption === 'company_register'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-900 bg-white/60'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>4. Cadastrar Empresa</span>
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 font-bold">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">
                <p>{error}</p>
                {isEmailDuplicateError && (
                  <button
                    type="button"
                    onClick={handleSwitchToLoginWithEmail}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-[10px] transition"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Fazer Login com este E-mail</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2 text-xs text-emerald-900 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>{success}</div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Client Register */}
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

          {/* Tech Register */}
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
                <select
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                >
                  {TECHNICAL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">Província</label>
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
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">Cidade</label>
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

          {/* Company Register */}
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
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">Nome Comercial</label>
                  <input
                    type="text"
                    value={commercialName}
                    onChange={e => setCommercialName(e.target.value)}
                    placeholder="Ex: EletroTec MZ"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">NUIT</label>
                  <input
                    type="text"
                    value={nuit}
                    onChange={e => setNuit(e.target.value)}
                    placeholder="Ex: 400123456"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
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

          {/* Email */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 block">
              Endereço de E-mail <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          {/* Password */}
          {!isForgotPassword && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Palavra-passe <span className="text-red-500">*</span>
                </label>
                {(clientOption === 'client_login' || proOption === 'tech_login' || proOption === 'company_login') && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Esqueceu?
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
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

          {/* Confirm Password */}
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            {isForgotPassword ? (
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md shadow-amber-600/20"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Recuperar Palavra-passe</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Voltar
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md ${
                  activeSection === 'client'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {activeSection === 'client' && clientOption === 'client_login' && 'Entrar como Cliente'}
                      {activeSection === 'client' && clientOption === 'client_register' && 'Criar Conta de Cliente'}
                      {activeSection === 'pro' && proOption === 'tech_login' && 'Entrar no Painel do Técnico'}
                      {activeSection === 'pro' && proOption === 'company_login' && 'Entrar no Painel da Empresa'}
                      {activeSection === 'pro' && proOption === 'tech_register' && 'Cadastrar como Técnico'}
                      {activeSection === 'pro' && proOption === 'company_register' && 'Cadastrar como Empresa'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
