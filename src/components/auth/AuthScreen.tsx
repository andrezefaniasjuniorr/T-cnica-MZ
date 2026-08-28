import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, MOZAMBIQUE_PROVINCES, TECHNICAL_CATEGORIES } from '../../types';
import {
  Wrench,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  HelpCircle
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

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Tech / Company Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState<string>(TECHNICAL_CATEGORIES[0] || 'Eletricidade');
  const [province, setProvince] = useState<string>(MOZAMBIQUE_PROVINCES[0] || 'Maputo Cidade');
  const [city, setCity] = useState('Maputo');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. FORGOT PASSWORD
    if (mode === 'forgot_password') {
      if (!email.trim()) {
        setError('Por favor preencha o seu e-mail cadastrado.');
        return;
      }
      const res = await resetPassword(email.trim());
      if (res.success) {
        setSuccess('Instruções de recuperação enviadas para o seu e-mail!');
        setTimeout(() => setMode('login'), 2000);
      } else {
        setError(res.error || 'Erro ao solicitar recuperação de senha.');
      }
      return;
    }

    // 2. LOGIN FLOW
    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('Por favor insira o seu e-mail e palavra-passe.');
        return;
      }
      const res = await login(email.trim(), password);
      if (res.success) {
        setSuccess('Sessão iniciada com sucesso!');
      } else {
        setError(res.error || 'Erro ao iniciar sessão. Verifique as credenciais.');
      }
      return;
    }

    // 3. REGISTER FLOW
    if (selectedRole === 'client') {
      // Cliente / Usuário Comum: Apenas E-mail e Palavra-passe
      if (!email.trim()) {
        setError('Por favor insira um e-mail válido.');
        return;
      }
      if (!password || password.length < 6) {
        setError('A palavra-passe deve ter no mínimo 6 caracteres.');
        return;
      }

      const res = await register({
        name: email.split('@')[0],
        email: email.trim(),
        phone: '',
        password: password.trim(),
        role: 'client'
      });

      if (res.success) {
        setSuccess('Conta de cliente criada com sucesso na TécnicaMZ Pro!');
      } else {
        setError(res.error || 'Este e-mail ou número de celular já existe.');
      }
    } else {
      // Técnico ou Empresa: Nome Completo, E-mail, Celular, Palavra-passe, Especialidade, Cidade
      if (!name.trim()) {
        setError('Por favor insira o Nome Completo.');
        return;
      }
      if (!email.trim()) {
        setError('Por favor insira o seu E-mail.');
        return;
      }
      if (!phone.trim()) {
        setError('Por favor insira o seu Número de Celular.');
        return;
      }
      if (!password || password.length < 6) {
        setError('A palavra-passe deve ter pelo menos 6 caracteres.');
        return;
      }

      const res = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(),
        role: selectedRole,
        specialty,
        province,
        city: city.trim() || 'Maputo'
      });

      if (res.success) {
        setSuccess(`Conta de ${selectedRole === 'technician' ? 'Técnico' : 'Empresa'} criada com sucesso!`);
      } else {
        setError(res.error || 'Este e-mail ou número de celular já existe.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 flex flex-col justify-between items-center px-4 py-8 sm:py-12 selection:bg-blue-500 selection:text-white">
      {/* Top spacing */}
      <div className="w-full max-w-md flex flex-col items-center mb-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Técnica<span className="text-blue-600">MZ</span>
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-600 text-white tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Comunidade Técnica de Moçambique
            </p>
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 transition-all">
        {/* Tab switch: Entrar na sua conta vs Criar nova conta */}
        {mode !== 'forgot_password' && (
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrar na sua conta
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Criar nova conta
            </button>
          </div>
        )}

        {/* Forgot password title */}
        {mode === 'forgot_password' && (
          <div className="mb-6 text-center">
            <h2 className="text-lg font-black text-slate-900">Recuperar Palavra-passe</h2>
            <p className="text-xs text-slate-500 mt-1">
              Insira o seu e-mail cadastrado para redefinir a sua senha.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-bold animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{success}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ========================================================= */}
          {/* REGISTRATION ROLE SELECTOR */}
          {/* ========================================================= */}
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Tipo de Conta
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('client')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    selectedRole === 'client'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-black'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="text-[11px]">Cliente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('technician')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    selectedRole === 'technician'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-black'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span className="text-[11px]">Técnico</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('company')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    selectedRole === 'company'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-black'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="text-[11px]">Empresa</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FIELDS FOR TECHNICIAN / COMPANY */}
          {/* ========================================================= */}
          {mode === 'register' && selectedRole !== 'client' && (
            <>
              {/* Full Name */}
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
                    placeholder={selectedRole === 'technician' ? 'Ex: Mateus Sitoe' : 'Ex: EletroTec Moçambique Lda'}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                  Número de Celular <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Ex: 84 123 4567 ou 851949159"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              {/* Specialty */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                  Área de Atuação / Especialidade <span className="text-red-500">*</span>
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

              {/* Province & City */}
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
                    Cidade
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

          {/* ========================================================= */}
          {/* COMMON FIELDS: EMAIL & PASSWORD */}
          {/* ========================================================= */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 block">
              E-mail <span className="text-red-500">*</span>
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

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Palavra-passe <span className="text-red-500">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 hover:shadow-lg transition cursor-pointer mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </span>
            ) : mode === 'login' ? (
              <>
                <span>Entrar na sua conta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'register' ? (
              <>
                <span>Criar Conta na TécnicaMZ Pro</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Enviar Link de Recuperação</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Back to login from forgot password */}
          {mode === 'forgot_password' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccess(null);
              }}
              className="w-full text-center py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Voltar ao Início de Sessão
            </button>
          )}
        </form>
      </div>

      {/* Official Technical Support Footer */}
      <div className="w-full max-w-md mt-6 pt-4 border-t border-slate-200/80 text-center">
        <p className="text-[11px] font-bold text-slate-600 mb-2">
          Suporte Técnico Oficial TécnicaMZ Pro:
        </p>
        <div className="flex items-center justify-center gap-4 text-xs font-bold">
          <a
            href="https://wa.me/258851949159"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp: 851949159</span>
          </a>
          <a
            href="mailto:tecnicamzpro@gmail.com"
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200/80 transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>tecnicamzpro@gmail.com</span>
          </a>
        </div>
      </div>
    </div>
  );
};
