import React, { useState } from 'react';
// LOGIC KEPT: Firebase Auth and Firestore imports preserved
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import {
  checkDeviceTrialUsedAsync,
  markDeviceTrialUsed,
  calcularDiasRestantesTrial
} from '../../utils/trial';
import {
  Download,
  Search,
  Wrench,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const PROVINCIAS_MOCAMBIQUE = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Niassa',
  'Cabo Delgado'
];

const ESPECIALIDADES = [
  'Eletricista Residencial',
  'Eletricista Predial',
  'Eletricista Industrial'
];

export const SeloMZRegister = ({ onSwitchToLogin = () => {}, onSuccess = () => {} }) => {
  const { loginAsClient } = useAuth();

  // LOGIC KEPT: State values for registration fields (conditional by tipo_cadastro)
  const [formData, setFormData] = useState({
    tipo_cadastro: 'tecnico', // Default selected is 'tecnico'
    // Cliente & Técnico
    nome_completo: '',
    telefone_whatsapp: '',
    especialidade_principal: '',
    idade: '',
    provincia: '',
    cidade_distrito: '',
    email_acesso: '',
    palavra_passe: '',
    confirmar_palavra_passe: '',
    // Empresa
    nome_empresa: '',
    nuit_empresa: '',
    nome_responsavel: '',
    telefone_empresa: '',
    email_empresa: ''
  });

  // LOGIC KEPT: Loading and status alert states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // UI state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // LOGIC KEPT: Input change handler preserving exact field names/keys
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  // LOGIC KEPT: Form submission with 3 dedicated branches inside the same function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // ==========================================
    // 1. BRANCH: CLIENTE
    // ==========================================
    if (formData.tipo_cadastro === 'cliente') {
      const nome = (formData.nome_completo || '').trim();
      const telefone = (formData.telefone_whatsapp || '').trim();
      const prov = (formData.provincia || '').trim();
      const cidade = (formData.cidade_distrito || '').trim();

      if (!nome) {
        setError('Por favor, informe seu nome completo.');
        return;
      }
      if (!telefone) {
        setError('Por favor, informe seu telefone/WhatsApp.');
        return;
      }

      setLoading(true);

      try {
        const rawPhone = telefone.replace(/\D/g, '');
        const clientId = rawPhone ? `cli_${rawPhone}` : `cli_${Date.now()}`;

        const clientDocData = {
          id: clientId,
          uid: clientId,
          tipo_cadastro: 'cliente',
          nome_completo: nome,
          telefone_whatsapp: telefone,
          provincia: prov,
          cidade_distrito: cidade,
          role: 'client',
          tipo: 'cliente',
          tipoConta: 'cliente',
          criado_em: serverTimestamp ? serverTimestamp() : new Date().toISOString()
        };

        // Salva na coleção "clientes" SEM createUserWithEmailAndPassword
        await setDoc(doc(db, "clientes", clientId), clientDocData);

        // Sincroniza espelho com users e usuarios
        await Promise.allSettled([
          setDoc(doc(db, "users", clientId), clientDocData, { merge: true }),
          setDoc(doc(db, "usuarios", clientId), clientDocData, { merge: true })
        ]);

        // Login direto de cliente via sessão/phone
        if (loginAsClient) {
          loginAsClient(nome);
        } else if (typeof window !== 'undefined') {
          localStorage.setItem('clienteNome', nome);
        }

        setSuccess(`Bem-vindo, ${nome}! Acesso de cliente iniciado com sucesso.`);

        if (onSuccess) {
          onSuccess({ uid: clientId, name: nome, role: 'client' });
        } else {
          setTimeout(() => {
            window.location.hash = '#cliente';
          }, 400);
        }
      } catch (err) {
        console.error('Erro no cadastro de cliente:', err);
        setError(err?.message || 'Falha ao registrar cliente. Verifique sua conexão.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // ==========================================
    // 2. BRANCH: TÉCNICO
    // ==========================================
    if (formData.tipo_cadastro === 'tecnico') {
      const emailTrimmed = (formData.email_acesso || '').trim().toLowerCase();
      const nome = (formData.nome_completo || '').trim();
      const telefone = (formData.telefone_whatsapp || '').trim();

      if (!nome) {
        setError('Por favor, informe seu nome completo.');
        return;
      }
      if (!telefone) {
        setError('Por favor, informe seu telefone/WhatsApp.');
        return;
      }
      if (!emailTrimmed) {
        setError('Por favor, informe o seu e-mail de acesso.');
        return;
      }
      if (!formData.palavra_passe || formData.palavra_passe.length < 6) {
        setError('A palavra-passe deve conter no mínimo 6 caracteres.');
        return;
      }
      if (formData.palavra_passe !== formData.confirmar_palavra_passe) {
        setError('As palavras-passe não coincidem. Verifique a confirmação.');
        return;
      }

      setLoading(true);

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          emailTrimmed,
          formData.palavra_passe
        );

        const uid = userCredential.user.uid;

        // 1. Verifica se este celular já teve trial de 3 dias no dispositivo
        const hasLocalFlag = typeof window !== 'undefined' && localStorage.getItem('tecnicaMZ_trial_usado') === 'true';
        const deviceJaTeveTrial = hasLocalFlag || (await checkDeviceTrialUsedAsync());

        // 2. Se o documento já existe, NUNCA regrave o trialStart
        const existingTecnicoSnap = await getDoc(doc(db, "tecnicos", uid)).catch(() => null);
        const existingData = (existingTecnicoSnap && existingTecnicoSnap.exists()) ? existingTecnicoSnap.data() : null;

        let finalTrialStart = null;
        let finalDiasRestantes = 0;
        let finalTemAcessoTrial = false;
        let finalTrialExpirado = true;

        if (existingData && existingData.trialStart) {
          // Documento já existe: preserva rigorosamente o trialStart original e NUNCA regrava
          finalTrialStart = existingData.trialStart;
          const calc = calcularDiasRestantesTrial(existingData.trialStart);
          finalDiasRestantes = calc.diasRestantes;
          finalTemAcessoTrial = calc.temAcessoTrial;
          finalTrialExpirado = calc.trialExpirado;
        } else if (deviceJaTeveTrial) {
          // SE JÁ TEVE TRIAL NESTE CELULAR: Crie a conta com trialStart = null, diasRestantes = 0, temAcessoTrial = false, trialExpirado = true. NÃO dê 3 dias.
          finalTrialStart = null;
          finalDiasRestantes = 0;
          finalTemAcessoTrial = false;
          finalTrialExpirado = true;
        } else {
          // SE NUNCA TEVE: Dê os 3 dias normalmente e grave a flag
          finalTrialStart = serverTimestamp ? serverTimestamp() : new Date().toISOString();
          finalDiasRestantes = 3;
          finalTemAcessoTrial = true;
          finalTrialExpirado = false;
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('tecnicaMZ_trial_usado', 'true');
            } catch {}
          }
          await markDeviceTrialUsed();
        }

        const createdAtIso = new Date().toISOString();
        const techDocData = {
          uid: uid,
          userId: uid,
          id: uid,
          tipo_cadastro: 'tecnico',
          name: nome,
          nome: nome,
          nome_completo: nome,
          telefone_whatsapp: telefone,
          phone: telefone,
          telefone: telefone,
          whatsapp: telefone,
          especialidade_principal: formData.especialidade_principal || 'Eletricista Residencial',
          specialty: formData.especialidade_principal || 'Eletricidade',
          especialidade: formData.especialidade_principal || 'Eletricidade',
          specialties: [formData.especialidade_principal || 'Eletricidade'],
          idade: formData.idade ? Number(formData.idade) : null,
          provincia: formData.provincia,
          province: formData.provincia,
          cidade_distrito: formData.cidade_distrito.trim(),
          cidade: formData.cidade_distrito.trim(),
          city: formData.cidade_distrito.trim(),
          email_acesso: emailTrimmed,
          email: emailTrimmed,
          role: 'technician',
          tipo: 'tecnico',
          tipoConta: 'tecnico',
          status: 'active',
          statusConta: 'ativa',
          statusAprovacao: 'aprovado',
          verificationStatus: 'none',
          isVerified: false,
          temSeloMZ: false,
          statusSelo: 'nenhum',

          // Controle Estrito dos 3 Dias Grátis
          trialStart: finalTrialStart,
          diasRestantes: finalDiasRestantes,
          diasRestantesTrial: finalDiasRestantes,
          temAcessoTrial: finalTemAcessoTrial,
          trialExpirado: finalTrialExpirado,
          isTrialActive: finalTemAcessoTrial,
          isTrialValid: finalTemAcessoTrial,

          totalLikes: 0,
          curtidas: 0,
          likesCount: 0,
          scoreEngajamento: 0,
          pontos: 0,
          points: 0,
          rating: 5.0,
          reviewsCount: 0,
          completedJobsCount: 0,
          availability: 'available',
          showWhatsappButton: true,
          createdAt: existingData?.createdAt || createdAtIso,
          criado_em: existingData?.criado_em || (serverTimestamp ? serverTimestamp() : createdAtIso)
        };

        // Salva na coleção solicitada "tecnicos"
        await setDoc(doc(db, "tecnicos", uid), techDocData);

        // Sincroniza em paralelo com technicians, users e usuarios para refletir imediatamente no ranking e diretório
        await Promise.allSettled([
          setDoc(doc(db, "technicians", uid), techDocData, { merge: true }),
          setDoc(doc(db, "users", uid), techDocData, { merge: true }),
          setDoc(doc(db, "usuarios", uid), techDocData, { merge: true })
        ]);

        setSuccess('Cadastro concluído com sucesso no SeloMZ! Bem-vindo.');

        if (onSuccess) {
          onSuccess(userCredential.user);
        }
      } catch (err) {
        console.error('Erro no cadastro SeloMZ (Técnico):', err);
        if (err.code === 'auth/email-already-in-use') {
          setError('Este e-mail já está em uso por outra conta cadastrada.');
        } else if (err.code === 'auth/weak-password') {
          setError('A palavra-passe escolhida é muito fraca.');
        } else if (err.code === 'auth/invalid-email') {
          setError('O formato do e-mail inserido é inválido.');
        } else {
          setError(err.message || 'Erro ao processar cadastro de técnico.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // ==========================================
    // 3. BRANCH: EMPRESA
    // ==========================================
    if (formData.tipo_cadastro === 'empresa') {
      const nomeEmpresa = (formData.nome_empresa || '').trim();
      const nuit = (formData.nuit_empresa || '').trim();
      const responsavel = (formData.nome_responsavel || '').trim();
      const telefoneEmpresa = (formData.telefone_empresa || '').trim();
      const emailEmpresa = (formData.email_empresa || '').trim().toLowerCase();

      if (!nomeEmpresa) {
        setError('Por favor, informe o Nome da Empresa.');
        return;
      }
      if (!nuit) {
        setError('Por favor, informe o NUIT da Empresa.');
        return;
      }
      if (!responsavel) {
        setError('Por favor, informe o Nome do Responsável.');
        return;
      }
      if (!telefoneEmpresa) {
        setError('Por favor, informe o Telefone / WhatsApp da Empresa.');
        return;
      }
      if (!emailEmpresa) {
        setError('Por favor, informe o E-mail da Empresa.');
        return;
      }
      if (!formData.palavra_passe || formData.palavra_passe.length < 6) {
        setError('A palavra-passe deve conter no mínimo 6 caracteres.');
        return;
      }
      if (formData.palavra_passe !== formData.confirmar_palavra_passe) {
        setError('As palavras-passe não coincidem. Verifique a confirmação.');
        return;
      }

      setLoading(true);

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          emailEmpresa,
          formData.palavra_passe
        );

        const uid = userCredential.user.uid;

        const createdAtIso = new Date().toISOString();
        const companyDocData = {
          uid: uid,
          userId: uid,
          id: uid,
          tipo_cadastro: 'empresa',
          nome_empresa: nomeEmpresa,
          companyName: nomeEmpresa,
          name: nomeEmpresa,
          nome: nomeEmpresa,
          nuit_empresa: nuit,
          nuit: nuit,
          nome_responsavel: responsavel,
          telefone_empresa: telefoneEmpresa,
          phone: telefoneEmpresa,
          telefone: telefoneEmpresa,
          provincia: formData.provincia,
          province: formData.provincia,
          cidade_distrito: formData.cidade_distrito.trim(),
          cidade: formData.cidade_distrito.trim(),
          city: formData.cidade_distrito.trim(),
          email_empresa: emailEmpresa,
          email: emailEmpresa,
          role: 'company',
          tipo: 'empresa',
          tipoConta: 'empresa',
          temSeloMZ: false,
          statusSelo: 'nenhum',
          statusConta: 'ativa',
          statusAprovacao: 'aprovado',
          status: 'active',
          createdAt: createdAtIso,
          criado_em: serverTimestamp ? serverTimestamp() : createdAtIso
        };

        // Salva na coleção "empresas"
        await setDoc(doc(db, "empresas", uid), companyDocData);

        // Sincroniza espelho com companies, users e usuarios
        await Promise.allSettled([
          setDoc(doc(db, "companies", uid), companyDocData, { merge: true }),
          setDoc(doc(db, "users", uid), companyDocData, { merge: true }),
          setDoc(doc(db, "usuarios", uid), companyDocData, { merge: true })
        ]);

        setSuccess('Cadastro de Empresa concluído com sucesso no SeloMZ!');

        if (onSuccess) {
          onSuccess(userCredential.user);
        }
      } catch (err) {
        console.error('Erro no cadastro SeloMZ (Empresa):', err);
        if (err.code === 'auth/email-already-in-use') {
          setError('Este e-mail já está em uso por outra empresa cadastrada.');
        } else if (err.code === 'auth/weak-password') {
          setError('A palavra-passe escolhida é muito fraca.');
        } else if (err.code === 'auth/invalid-email') {
          setError('O formato do e-mail inserido é inválido.');
        } else {
          setError(err.message || 'Erro ao processar cadastro de empresa.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col justify-center items-center py-8 px-4 font-sans antialiased select-none relative">
      {/* Top Left Actions Bar */}
      <div className="flex items-center gap-2 absolute top-3 left-3 z-50">
        {/* Botão Menu existente - azul */}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition shadow-sm"
          title="Início"
        >
          <Wrench size={18} />
        </button>

        {/* NOVO BOTÃO DOWNLOAD - LADO ESQUERDO */}
        <a
          href="https://drive.google.com/uc?export=download&id=1tzeat0iK5wPsIAqUmkTgJfOTIhMMqEdr"
          className="w-9 h-9 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white shadow-lg transition cursor-pointer"
          title="Baixar Aplicativo"
          download
        >
          <Download size={18} />
        </a>

        <button
          type="button"
          onClick={onSwitchToLogin}
          className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-50 shadow-sm transition cursor-pointer"
          title="Pesquisa"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Container: Max-width 420px centered, mobile first */}
      <div className="w-full max-w-[420px] mx-auto bg-white rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-100 p-6 sm:p-7">
        
        {/* Header: Logo SeloMZ + title + subtitle */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tight text-slate-900">Selo</span>
              <span className="text-2xl font-black tracking-tight text-[#2563EB]">MZ</span>
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-50 text-[#2563EB] tracking-wide border border-blue-200">
                PRO
              </span>
            </div>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {formData.tipo_cadastro === 'cliente'
              ? 'Acesso Rápido de Cliente'
              : formData.tipo_cadastro === 'empresa'
              ? 'Conta Corporativa SeloMZ'
              : 'Crie sua conta profissional'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {formData.tipo_cadastro === 'cliente'
              ? 'Conecte-se com técnicos certificados sem burocracia'
              : 'Em 30 segundos, sem burocracia'}
          </p>
        </div>

        {/* Toggle Type: Segmented control with 3 options, pill-shaped, gray background #F1F5F9 */}
        <div className="mb-6">
          <div className="p-1 bg-[#F1F5F9] rounded-full flex items-center shadow-inner">
            {[
              { id: 'cliente', label: 'Cliente' },
              { id: 'tecnico', label: 'Técnico' },
              { id: 'empresa', label: 'Empresa' }
            ].map((option) => {
              const isSelected = formData.tipo_cadastro === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, tipo_cadastro: option.id }));
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-[#2563EB] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-[#2563EB]" />}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Progress: Visual indicator */}
        <div className="mb-6 px-1">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0">
              <div className="h-full bg-[#2563EB] w-full transition-all duration-300" />
            </div>

            <div className="relative z-10 flex items-center gap-2 bg-white pr-2">
              <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                1
              </span>
              <span className="text-xs font-bold text-slate-800">
                {formData.tipo_cadastro === 'cliente'
                  ? '1. Identificação'
                  : formData.tipo_cadastro === 'empresa'
                  ? '1. Empresa'
                  : '1. Perfil'}
              </span>
            </div>

            <div className="relative z-10 flex items-center gap-2 bg-white pl-2">
              <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                2
              </span>
              <span className="text-xs font-bold text-slate-800">
                {formData.tipo_cadastro === 'cliente' ? '2. Localização' : '2. Acesso'}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span className="font-medium leading-tight">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="font-medium leading-tight">{success}</span>
          </div>
        )}

        {/* ONE <form> tag to not break submit */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ======================================================== */}
          {/* 1. CAMPOS CONDICIONAIS: CLIENTE */}
          {/* ======================================================== */}
          {formData.tipo_cadastro === 'cliente' && (
            <>
              <div>
                <label
                  htmlFor="nome_completo"
                  className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                >
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="nome_completo"
                  name="nome_completo"
                  value={formData.nome_completo}
                  onChange={handleChange}
                  placeholder="Como gostaria de ser chamado?"
                  required
                  className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="telefone_whatsapp"
                  className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                >
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  id="telefone_whatsapp"
                  name="telefone_whatsapp"
                  value={formData.telefone_whatsapp}
                  onChange={handleChange}
                  placeholder="84/85/86/87... (usado para contacto)"
                  required
                  className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="provincia"
                    className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                  >
                    Província
                  </label>
                  <select
                    id="provincia"
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    required
                    className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-3 text-sm text-slate-800 cursor-pointer truncate"
                  >
                    <option value="" disabled>
                      Província
                    </option>
                    {PROVINCIAS_MOCAMBIQUE.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="cidade_distrito"
                    className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                  >
                    Cidade / Distrito
                  </label>
                  <input
                    type="text"
                    id="cidade_distrito"
                    name="cidade_distrito"
                    value={formData.cidade_distrito}
                    onChange={handleChange}
                    placeholder="Ex: Maputo"
                    required
                    className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* 2. CAMPOS CONDICIONAIS: TÉCNICO */}
          {/* ======================================================== */}
          {formData.tipo_cadastro === 'tecnico' && (
            <>
              {/* Row 1: nome_completo (full width) */}
              <div>
                <label
                  htmlFor="nome_completo"
                  className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                >
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="nome_completo"
                  name="nome_completo"
                  value={formData.nome_completo}
                  onChange={handleChange}
                  placeholder="Digite seu nome completo"
                  required
                  className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Row 2: telefone_whatsapp (70%) + idade (30%) in grid-cols-[2fr_1fr] */}
              <div className="grid grid-cols-[2fr_1fr] gap-3">
                <div>
                  <label
                    htmlFor="telefone_whatsapp"
                    className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                  >
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    id="telefone_whatsapp"
                    name="telefone_whatsapp"
                    value={formData.telefone_whatsapp}
                    onChange={handleChange}
                    placeholder="84/85/86/87..."
                    required
                    className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="idade"
                    className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                  >
                    Idade
                  </label>
                  <input
                    type="number"
                    id="idade"
                    name="idade"
                    min="18"
                    max="99"
                    value={formData.idade}
                    onChange={handleChange}
                    placeholder="Ex: 28"
                    className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Row 3: especialidade_principal (full width) */}
              <div>
                <label
                  htmlFor="especialidade_principal"
                  className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                >
                  Especialidade Principal
                </label>
                <select
                  id="especialidade_principal"
                  name="especialidade_principal"
                  value={formData.especialidade_principal}
                  onChange={handleChange}
                  required
                  className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 cursor-pointer"
                >
                  <option value="" disabled>
                    Selecione a especialidade
                  </option>
                  {ESPECIALIDADES.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 4: provincia (50%) + cidade_distrito (50%) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="provincia"
                    className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                  >
                    Província
                  </label>
                  <select
                    id="provincia"
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    required
                    className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-3 text-sm text-slate-800 cursor-pointer truncate"
                  >
                    <option value="" disabled>
                      Província
                    </option>
                    {PROVINCIAS_MOCAMBIQUE.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="cidade_distrito"
                    className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                  >
                    Cidade / Distrito
                  </label>
                  <input
                    type="text"
                    id="cidade_distrito"
                    name="cidade_distrito"
                    value={formData.cidade_distrito}
                    onChange={handleChange}
                    placeholder="Ex: Matola"
                    required
                    className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Row 5: email_acesso (full width) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="email_acesso"
                    className="text-[14px] font-bold text-[#334155] block"
                  >
                    E-mail de Acesso
                  </label>
                  <span className="text-xs text-slate-400 font-medium">Será seu login</span>
                </div>
                <input
                  type="email"
                  id="email_acesso"
                  name="email_acesso"
                  value={formData.email_acesso}
                  onChange={handleChange}
                  placeholder="exemplo@email.com"
                  required
                  className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Row 6: palavra_passe + confirmar_palavra_passe */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="palavra_passe"
                    className="text-[14px] font-bold text-[#334155] mb-1.5 block truncate"
                  >
                    Palavra-passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="palavra_passe"
                      name="palavra_passe"
                      value={formData.palavra_passe}
                      onChange={handleChange}
                      placeholder="Min. 6 dígitos"
                      required
                      className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all pl-4 pr-10 text-sm text-slate-800 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmar_palavra_passe"
                    className="text-[14px] font-bold text-[#334155] mb-1.5 block truncate"
                  >
                    Confirmar
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmar_palavra_passe"
                      name="confirmar_palavra_passe"
                      value={formData.confirmar_palavra_passe}
                      onChange={handleChange}
                      placeholder="Repita a senha"
                      required
                      className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all pl-4 pr-10 text-sm text-slate-800 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* 3. CAMPOS CONDICIONAIS: EMPRESA */}
          {/* ======================================================== */}
          {formData.tipo_cadastro === 'empresa' && (
            <>
              {/* Nome da Empresa */}
              <div>
                <label
                  htmlFor="nome_empresa"
                  className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                >
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  id="nome_empresa"
                  name="nome_empresa"
                  value={formData.nome_empresa}
                  onChange={handleChange}
                  placeholder="Ex: EletroPro Moçambique, Lda."
                  required
                  className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* NUIT da Empresa */}
              <div>
                <label
                  htmlFor="nuit_empresa"
                  className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                >
                  NUIT da Empresa
                </label>
                <input
                  type="text"
                  id="nuit_empresa"
                  name="nuit_empresa"
                  value={formData.nuit_empresa}
                  onChange={handleChange}
                  placeholder="9 dígitos (ex: 400123456)"
                  required
                  className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Nome do Responsável */}
              <div>
                <label
                  htmlFor="nome_responsavel"
                  className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                >
                  Nome do Responsável
                </label>
                <input
                  type="text"
                  id="nome_responsavel"
                  name="nome_responsavel"
                  value={formData.nome_responsavel}
                  onChange={handleChange}
                  placeholder="Nome do gestor ou representante"
                  required
                  className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Telefone da Empresa */}
              <div>
                <label
                  htmlFor="telefone_empresa"
                  className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                >
                  Telefone / WhatsApp Comercial
                </label>
                <input
                  type="tel"
                  id="telefone_empresa"
                  name="telefone_empresa"
                  value={formData.telefone_empresa}
                  onChange={handleChange}
                  placeholder="+258 84/85/86/87 ou 21..."
                  required
                  className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Província + Cidade/Distrito */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="provincia"
                    className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                  >
                    Província
                  </label>
                  <select
                    id="provincia"
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    required
                    className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-3 text-sm text-slate-800 cursor-pointer truncate"
                  >
                    <option value="" disabled>
                      Província Sede
                    </option>
                    {PROVINCIAS_MOCAMBIQUE.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="cidade_distrito"
                    className="text-[14px] font-bold text-[#334155] mb-1.5 block"
                  >
                    Cidade / Distrito
                  </label>
                  <input
                    type="text"
                    id="cidade_distrito"
                    name="cidade_distrito"
                    value={formData.cidade_distrito}
                    onChange={handleChange}
                    placeholder="Ex: Maputo"
                    required
                    className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* E-mail da Empresa */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="email_empresa"
                    className="text-[14px] font-bold text-[#334155] block"
                  >
                    E-mail da Empresa
                  </label>
                  <span className="text-xs text-slate-400 font-medium">Será o login corporativo</span>
                </div>
                <input
                  type="email"
                  id="email_empresa"
                  name="email_empresa"
                  value={formData.email_empresa}
                  onChange={handleChange}
                  placeholder="contacto@empresa.co.mz"
                  required
                  className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all px-4 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Palavra-passe + Confirmar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="palavra_passe"
                    className="text-[14px] font-bold text-[#334155] mb-1.5 block truncate"
                  >
                    Palavra-passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="palavra_passe"
                      name="palavra_passe"
                      value={formData.palavra_passe}
                      onChange={handleChange}
                      placeholder="Min. 6 dígitos"
                      required
                      className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all pl-4 pr-10 text-sm text-slate-800 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmar_palavra_passe"
                    className="text-[14px] font-bold text-[#334155] mb-1.5 block truncate"
                  >
                    Confirmar
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmar_palavra_passe"
                      name="confirmar_palavra_passe"
                      value={formData.confirmar_palavra_passe}
                      onChange={handleChange}
                      placeholder="Repita a senha"
                      required
                      className="w-full h-[48px] rounded-xl border border-slate-200 bg-[#FCFDFF] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 outline-none transition-all pl-4 pr-10 text-sm text-slate-800 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Botão de Conclusão com texto e comportamento individual por tipo */}
          <div className="pt-2">
            <button
              type="submit"
              id="btn_submit_cadastro"
              disabled={loading}
              className="w-full h-[52px] bg-[#2563EB] text-white font-bold rounded-xl shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:bg-blue-700 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : formData.tipo_cadastro === 'cliente' ? (
                <span>Entrar como Cliente</span>
              ) : formData.tipo_cadastro === 'empresa' ? (
                <span>Criar conta de empresa →</span>
              ) : (
                <span>Criar conta de técnico →</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer: link para alternar login */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Já tem conta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-[#2563EB] font-bold hover:underline cursor-pointer transition ml-1"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeloMZRegister;
