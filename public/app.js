/**
 * TécnicaMZ Pro - Client-Side App Logic (app.js)
 * 
 * Sistema Unificado de Engajamento, Ranking e Persistência de Perfil
 * - Persistência Firestore e Sincronização em Tempo Real
 * - Marcar Comentário Útil / Parabenizar (+5 Pontos, badge util +1)
 * - Corações/Likes Unificados (Stories, Mural, Mercado)
 * - Reações de Badges nos Posts (Excelente, Útil, Técnico)
 * - Recalculo de Estrelas e Query de Ranking Nacional
 * - Renderização Compacta do Perfil de Engajamento
 */

// 0. CONTROLE DE INTERFACE POR PAPEL (UI/UX) E CARREGAMENTO DE PAINÉIS
function applyRoleBasedUI(userRole) {
  const role = String(userRole || '').toLowerCase();
  const btnMais = document.querySelector('[data-nav="mais"]') || document.getElementById('btnMais');
  if (btnMais) {
    btnMais.style.display = (role === 'cliente' || role === 'client') ? 'none' : 'flex';
  }
}
window.applyRoleBasedUI = applyRoleBasedUI;

// Funções de carregamento de painéis baseados no tipo de conta
function carregarPainelEmpresa(userData) {
  console.log('[Painel] Carregando Painel da Empresa:', userData?.nome || userData?.name || userData?.companyName || userData?.uid);
  if (typeof window !== 'undefined') {
    if (window.location.hash !== '#empresa') {
      window.location.hash = '#empresa';
    }
  }
  applyRoleBasedUI('empresa');
}
window.carregarPainelEmpresa = carregarPainelEmpresa;

function carregarPainelTecnico(userData) {
  console.log('[Painel] Carregando Painel do Técnico:', userData?.nome || userData?.name || userData?.uid);
  if (typeof window !== 'undefined') {
    if (window.location.hash !== '#tecnico') {
      window.location.hash = '#tecnico';
    }
  }
  applyRoleBasedUI('tecnico');
}
window.carregarPainelTecnico = carregarPainelTecnico;

function carregarPainelCliente(userData) {
  console.log('[Painel] Carregando Painel do Cliente:', userData?.nome || userData?.name || userData?.uid);
  if (typeof window !== 'undefined') {
    if (window.location.hash !== '#cliente') {
      window.location.hash = '#cliente';
    }
  }
  applyRoleBasedUI('cliente');
}
window.carregarPainelCliente = carregarPainelCliente;

// Variável global de controle para pausar o listener global durante o cadastro
window.isRegistering = false;

// 2. CORREÇÃO DA LÓGICA DE CADASTRO (auth.js / register.js):
// Aguardar explicitamente a gravação no Firestore ANTES de permitir que o ouvinte processe o login
async function cadastrarEmpresa(email, senha, dadosEmpresa) {
  try {
    window.isRegistering = true;
    // 1. Variáveis globais de controle para pausar o listener durante o cadastro
    window.isCreatingAccount = true;
    window.isRegistering = true;
    const authInstance = window.auth;
    const dbInstance = window.db;

    // Se a função do React/AuthContext já estiver vinculada, prioriza para sincronia do estado
    if (window.TecnicaProAuth && typeof window.TecnicaProAuth.cadastrarEmpresa === 'function') {
      const result = await window.TecnicaProAuth.cadastrarEmpresa(email, senha, dadosEmpresa);
      window.isCreatingAccount = false;
      window.isRegistering = false;
      return result;
    }

    // 1. Cria a conta no Firebase Auth
    let user = null;
    if (authInstance && senha) {
      const { createUserWithEmailAndPassword } = window.firebaseAuth || (await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js'));
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, senha);
      user = userCredential.user;
    } else {
      user = { uid: 'company_' + Date.now(), email };
    }

    const nomeEmpresa = (typeof dadosEmpresa === 'object' ? (dadosEmpresa?.nome || dadosEmpresa?.name || dadosEmpresa?.companyName) : dadosEmpresa) || email.split('@')[0];
    const nuitEmpresa = (typeof dadosEmpresa === 'object' ? (dadosEmpresa?.nuit || dadosEmpresa?.nuir) : '') || '400000000';

    // 2. OBRIGATÓRIO: Salva os dados no Firestore ANTES de qualquer redirecionamento
    if (dbInstance) {
      const { doc, setDoc } = window.firebaseFirestore || (await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'));
      await setDoc(doc(dbInstance, "users", user.uid), {
        uid: user.uid,
        nome: nomeEmpresa,
        email: email,
        tipo: "empresa", // <--- Garantir que não está salvando "tecnico"
        criadoEm: new Date()
      });

      await setDoc(doc(dbInstance, "companies", user.uid), {
        userId: user.uid,
        companyName: nomeEmpresa,
        email: email,
        nuit: nuitEmpresa,
        tipo: "empresa",
        tipoConta: "empresa",
        role: "company",
        createdAt: new Date().toISOString()
      }, { merge: true });
    }

    // 3. Libera o monitoramento global e redireciona manualmente
    window.isCreatingAccount = false;
    window.isRegistering = false;
    carregarPainelEmpresa({ uid: user.uid, nome: nomeEmpresa, email, tipo: "empresa" });
    window.location.replace("painel-empresa.html");
    return { success: true, user };

  } catch (error) {
    window.isCreatingAccount = false;
    window.isRegistering = false;
    console.error("Erro no cadastro da empresa:", error);
    return { success: false, error: error.message };
  }
}
window.cadastrarEmpresa = cadastrarEmpresa;

// 2. ESTRUTURA DE CORREÇÃO DO FORMULÁRIO DE CADASTRO:
// Garante o binding com e.preventDefault() obrigatório
function setupCadastroEmpresaForm() {
  const form = document.getElementById('form-cadastro-empresa');
  if (!form || form.dataset.boundSubmit === 'true') return;
  form.dataset.boundSubmit = 'true';

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // OBRIGATÓRIO: Impede o recarregamento da página

    const emailEl = document.getElementById('email');
    const senhaEl = document.getElementById('senha') || document.getElementById('password');
    const nomeEmpresaEl = document.getElementById('nomeEmpresa') || document.getElementById('companyName');

    const email = emailEl ? emailEl.value : '';
    const senha = senhaEl ? senhaEl.value : '';
    const nomeEmpresa = nomeEmpresaEl ? nomeEmpresaEl.value : '';

    try {
      window.isCreatingAccount = true;
      window.isRegistering = true;
      const auth = window.auth;
      const db = window.db;

      // 1. Cria a conta no Auth
      let user = null;
      if (auth && senha) {
        const { createUserWithEmailAndPassword } = window.firebaseAuth || (await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js'));
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        user = userCredential.user;
      } else {
        user = { uid: 'company_' + Date.now(), email };
      }

      // 2. Aguarda OBRIGATORIAMENTE salvar o tipo 'empresa' no Firestore
      if (db) {
        const { doc, setDoc } = window.firebaseFirestore || (await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'));
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          nome: nomeEmpresa,
          email: email,
          tipo: "empresa", // <--- Garantir que não está salvando "tecnico"
          criadoEm: new Date()
        });

        await setDoc(doc(db, "companies", user.uid), {
          userId: user.uid,
          companyName: nomeEmpresa,
          email: email,
          tipo: "empresa",
          criadoEm: new Date()
        }, { merge: true });
      }

      window.isCreatingAccount = false;
      window.isRegistering = false;

      // 3. Redireciona EXPLICITAMENTE para o painel da empresa
      window.location.replace("painel-empresa.html");

    } catch (error) {
      window.isCreatingAccount = false;
      window.isRegistering = false;
      console.error("Erro ao cadastrar empresa:", error);
      alert("Erro ao criar conta: " + error.message);
    }
  });
}

// 2. AJUSTE NO LOGIN (login.js / auth.js / app.js):
async function fazerLogin(email, senha) {
  try {
    const auth = window.auth;
    const db = window.db;
    if (!auth) throw new Error("Firebase Auth não inicializado.");

    const { signInWithEmailAndPassword } = window.firebaseAuth || (await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js'));
    const { doc, getDoc } = window.firebaseFirestore || (await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'));

    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Busca o perfil gravado no Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // REDIRECIONAMENTO DE LOGIN BASEADO NO TIPO:
      if (userData.tipo === "empresa" || userData.role === "empresa" || userData.role === "company") {
        window.location.replace("painel-empresa.html");
      } else if (userData.tipo === "tecnico" || userData.role === "tecnico" || userData.role === "technician") {
        window.location.replace("painel-tecnico.html");
      } else if (userData.tipo === "cliente" || userData.role === "cliente" || userData.role === "client") {
        window.location.replace("painel-cliente.html");
      } else {
        alert("Tipo de conta inválido ou não cadastrado.");
      }
    } else {
      alert("Perfil do usuário não encontrado.");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Falha ao efetuar login: " + error.message);
  }
}
window.fazerLogin = fazerLogin;

// Inicializa a escuta no carregamento e monitora o DOM para formulários dinâmicos
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCadastroEmpresaForm);
  } else {
    setupCadastroEmpresaForm();
  }
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      setupCadastroEmpresaForm();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}

// 3. MANUTENÇÃO DE SESSÃO AUTOMÁTICA (onAuthStateChanged em app.js):
function initAuthListener(auth, db) {
  if (!auth) return;
  auth.onAuthStateChanged(async (user) => {
    // Ignora se estiver no processo de criação de conta
    if (window.isCreatingAccount || window.isRegistering) {
      console.log('[Auth] Ignorando onAuthStateChanged durante cadastro');
      return;
    }

    if (user) {
      try {
        const firestore = window.firebaseFirestore || (await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'));
        const dbInstance = db || window.db;
        if (firestore && dbInstance) {
          const { doc, getDoc } = firestore;

          // Se o usuário JÁ ESTÁ logado, busca o perfil antes de tomar qualquer decisão de rota
          const userDoc = await getDoc(doc(dbInstance, "users", user.uid));
          
          if (userDoc && userDoc.exists()) {
            const userData = userDoc.data();
            
            // Se estiver na tela de login/cadastro ou na raiz, direciona para o painel correto
            const paginaAtual = window.location.pathname;
            if (paginaAtual.includes('login') || paginaAtual.includes('cadastro') || paginaAtual === '/' || paginaAtual.includes('index')) {
              if (userData.tipo === "empresa" || userData.role === "empresa" || userData.role === "company") {
                window.location.replace("painel-empresa.html");
                return;
              } else if (userData.tipo === "tecnico" || userData.role === "tecnico" || userData.role === "technician") {
                window.location.replace("painel-tecnico.html");
                return;
              } else if (userData.tipo === "cliente" || userData.role === "cliente" || userData.role === "client") {
                window.location.replace("painel-cliente.html");
                return;
              }
            }

            if (userData.tipo === "empresa" || userData.role === "empresa" || userData.role === "company") {
              carregarPainelEmpresa(userData);
            } else if (userData.tipo === "tecnico" || userData.role === "tecnico" || userData.role === "technician") {
              carregarPainelTecnico(userData);
            } else if (userData.tipo === "cliente" || userData.role === "cliente" || userData.role === "client") {
              carregarPainelCliente(userData);
            } else {
              console.error("Tipo de conta desconhecido:", userData.tipo);
              carregarPainelTecnico(userData);
            }
          }
        }
      } catch (err) {
        console.warn('initAuthListener warning:', err);
      }
    }
  });
}
window.initAuthListener = initAuthListener;

// 6. CÁLCULO LENTO DE ESTRELAS E RANKING (app.js)
// stars = Math.min(5, Math.floor(points / 200))
async function recalculateUserStarsAndRanking(userId) {
  if (!userId) return { stars: 0, points: 0 };
  
  if (window.TecnicaProEngagement && typeof window.TecnicaProEngagement.recalculateUserStarsAndRanking === 'function') {
    return window.TecnicaProEngagement.recalculateUserStarsAndRanking(userId);
  }

  // Fallback direto via window.db
  if (window.db) {
    try {
      const { doc, getDoc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const userRef = doc(window.db, 'users', userId);
      const userSnap = await getDoc(userRef);
      let points = 0;
      if (userSnap.exists()) {
        const d = userSnap.data();
        points = d.points ?? d.pontos ?? 0;
      }
      const stars = Math.min(5, Math.floor(Math.max(0, points) / 200));
      await updateDoc(userRef, { stars, updatedAt: serverTimestamp() }).catch(() => {});
      return { stars, points };
    } catch (e) {
      console.warn('recalculateUserStarsAndRanking fallback error:', e);
    }
  }

  return { stars: 0, points: 0 };
}
window.recalculateUserStarsAndRanking = recalculateUserStarsAndRanking;

// 6. RETORNA QUERY DO RANKING NACIONAL (app.js)
// query da coleção 'users' ordenada por 'points' em ordem decrescente (limit 50)
function getNationalRankingQuery() {
  if (window.TecnicaProEngagement && typeof window.TecnicaProEngagement.getNationalRankingQuery === 'function') {
    return window.TecnicaProEngagement.getNationalRankingQuery();
  }

  if (window.db) {
    try {
      const { collection, query, orderBy, limit } = window.firebaseFirestore || {};
      if (collection && query && orderBy && limit) {
        return query(collection(window.db, 'users'), orderBy('points', 'desc'), limit(50));
      }
    } catch (e) {
      console.warn('getNationalRankingQuery error:', e);
    }
  }
  return null;
}
window.getNationalRankingQuery = getNationalRankingQuery;

// 3. MARCAR COMENTÁRIO ÚTIL / PARABENIZAR (+5 PONTOS) (app.js)
// - Valide se currentUserId === postAuthorId. Se falso, bloqueie a ação.
// - Execute Transaction no Firestore:
//   a) Salve no post: solvedCommentId: commentId.
//   b) Adicione +5 em points e +1 em badges.util no documento do commentAuthorId no Firestore.
// - Execute recalculateUserStarsAndRanking(commentAuthorId).
async function markCommentAsUseful(postId, postAuthorId, commentId, commentAuthorId, currentUserId) {
  // Validação obrigatória de autoria
  if (!currentUserId || currentUserId !== postAuthorId) {
    const msg = 'Ação bloqueada: Apenas o autor do post pode marcar um comentário como útil.';
    console.warn('[app.js markCommentAsUseful]', msg);
    return { success: false, error: msg };
  }

  if (window.TecnicaProEngagement && typeof window.TecnicaProEngagement.markCommentAsUseful === 'function') {
    return window.TecnicaProEngagement.markCommentAsUseful(postId, postAuthorId, commentId, commentAuthorId, currentUserId);
  }

  if (window.db) {
    try {
      const { doc, runTransaction, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const postRef = doc(window.db, 'mural_posts', postId);
      const userRef = doc(window.db, 'users', commentAuthorId);

      await runTransaction(window.db, async (t) => {
        const uDoc = await t.get(userRef);
        const pDoc = await t.get(postRef);

        const curPoints = uDoc.exists() ? (uDoc.data().points ?? uDoc.data().pontos ?? 0) : 0;
        const curBadges = uDoc.exists() && uDoc.data().badges ? uDoc.data().badges : { excelente: 0, util: 0, tecnico: 0 };
        const newPoints = curPoints + 5;
        const newBadges = { ...curBadges, util: (curBadges.util || 0) + 1 };

        if (pDoc.exists()) {
          t.update(postRef, {
            solvedCommentId: commentId,
            comentarioSolucaoId: commentId,
            solucaoAceita: true,
            updatedAt: serverTimestamp()
          });
        }

        if (uDoc.exists()) {
          t.update(userRef, {
            points: newPoints,
            pontos: newPoints,
            badges: newBadges,
            updatedAt: serverTimestamp()
          });
        } else {
          t.set(userRef, {
            points: newPoints,
            pontos: newPoints,
            badges: newBadges,
            likesCount: 0,
            stars: Math.min(5, Math.floor(newPoints / 200)),
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      });

      await recalculateUserStarsAndRanking(commentAuthorId);
      return { success: true, solvedCommentId: commentId, pointsAdded: 5 };
    } catch (err) {
      console.error('markCommentAsUseful transaction error:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'Database não conectado' };
}
window.markCommentAsUseful = markCommentAsUseful;

// 4. CORAÇÕES/LIKES UNIFICADOS (STORIES, MURAL, MERCADO) (app.js)
// - Atualize no Firestore: adicione/remova +1 em likesCount e +1 em points no perfil de targetAuthorId.
// - Execute recalculateUserStarsAndRanking(targetAuthorId).
async function giveHeartOrLike(targetAuthorId, isLiking = true) {
  if (!targetAuthorId) return { success: false, error: 'targetAuthorId ausente' };

  if (window.TecnicaProEngagement && typeof window.TecnicaProEngagement.giveHeartOrLike === 'function') {
    return window.TecnicaProEngagement.giveHeartOrLike(targetAuthorId, isLiking);
  }

  if (window.db) {
    try {
      const { doc, runTransaction, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const userRef = doc(window.db, 'users', targetAuthorId);

      const delta = isLiking ? 1 : -1;
      let finalPoints = 0;
      let finalLikes = 0;

      await runTransaction(window.db, async (t) => {
        const uDoc = await t.get(userRef);
        const curLikes = uDoc.exists() ? (uDoc.data().likesCount ?? uDoc.data().totalLikes ?? 0) : 0;
        const curPoints = uDoc.exists() ? (uDoc.data().points ?? uDoc.data().pontos ?? 0) : 0;

        finalLikes = Math.max(0, curLikes + delta);
        finalPoints = Math.max(0, curPoints + delta);

        const payload = {
          likesCount: finalLikes,
          totalLikes: finalLikes,
          points: finalPoints,
          pontos: finalPoints,
          updatedAt: serverTimestamp()
        };

        if (uDoc.exists()) {
          t.update(userRef, payload);
        } else {
          t.set(userRef, { ...payload, badges: { excelente: 0, util: 0, tecnico: 0 }, stars: 0 }, { merge: true });
        }
      });

      await recalculateUserStarsAndRanking(targetAuthorId);
      return { success: true, likesCount: finalLikes, points: finalPoints };
    } catch (err) {
      console.warn('giveHeartOrLike error:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'Database não conectado' };
}
window.giveHeartOrLike = giveHeartOrLike;

// 5. REAÇÕES DE BADGES NOS POSTS (app.js)
// - Salve no Firestore: incremente badges[reactionType] (+1) e points (+2) no perfil de postAuthorId.
// - Execute recalculateUserStarsAndRanking(postAuthorId).
async function reactToPost(postAuthorId, reactionType) {
  if (!postAuthorId) return { success: false, error: 'postAuthorId ausente' };

  if (window.TecnicaProEngagement && typeof window.TecnicaProEngagement.reactToPost === 'function') {
    return window.TecnicaProEngagement.reactToPost(postAuthorId, reactionType);
  }

  const validTypes = ['excelente', 'util', 'tecnico'];
  const safeType = validTypes.includes(reactionType) ? reactionType : 'util';

  if (window.db) {
    try {
      const { doc, runTransaction, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const userRef = doc(window.db, 'users', postAuthorId);

      await runTransaction(window.db, async (t) => {
        const uDoc = await t.get(userRef);
        const curPoints = uDoc.exists() ? (uDoc.data().points ?? uDoc.data().pontos ?? 0) : 0;
        const curBadges = uDoc.exists() && uDoc.data().badges ? uDoc.data().badges : { excelente: 0, util: 0, tecnico: 0 };

        const newPoints = curPoints + 2;
        const newBadges = { ...curBadges, [safeType]: (curBadges[safeType] || 0) + 1 };

        const payload = {
          points: newPoints,
          pontos: newPoints,
          badges: newBadges,
          updatedAt: serverTimestamp()
        };

        if (uDoc.exists()) {
          t.update(userRef, payload);
        } else {
          t.set(userRef, { ...payload, likesCount: 0, stars: Math.min(5, Math.floor(newPoints / 200)) }, { merge: true });
        }
      });

      await recalculateUserStarsAndRanking(postAuthorId);
      return { success: true, reactionType: safeType, pointsAdded: 2 };
    } catch (err) {
      console.warn('reactToPost error:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'Database não conectado' };
}
window.reactToPost = reactToPost;

// 7. INTERFACE DO PERFIL DO TÉCNICO (UI Component)
// - Função: renderProfileEngagement(userData)
// - Retorne HTML compacto que exiba persistentemente:
//   - Estrelas: '⭐'.repeat(userData.stars || 0) + ' (X/5)'
//   - Acumuladores: 🏆 Points, ❤️ Likes, 🔥 Excelente, 💡 Útil, 🛠️ Técnico.
function renderProfileEngagement(userData) {
  if (!userData) return '';

  const starsCount = Math.max(0, Math.min(5, Number(userData.stars ?? Math.floor(((userData.points ?? userData.pontos ?? 0) / 200)))));
  const points = Number(userData.points ?? userData.pontos ?? userData.scoreEngajamento ?? 0);
  const likes = Number(userData.likesCount ?? userData.totalLikes ?? 0);
  const badges = {
    excelente: Number(userData.badges?.excelente ?? 0),
    util: Number(userData.badges?.util ?? 0),
    tecnico: Number(userData.badges?.tecnico ?? 0)
  };

  const starsString = '⭐'.repeat(starsCount) + ` (${starsCount}/5)`;

  return `
<div class="profile-engagement-card bg-slate-50 border border-slate-200 rounded-xl p-3 my-2 text-slate-800 shadow-2xs font-sans">
  <div class="engagement-stars flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200">
    <div class="flex items-center gap-1">
      <span class="text-sm tracking-tight select-none font-bold text-amber-500">${starsString}</span>
    </div>
    <span class="text-[10px] uppercase font-black text-slate-500 tracking-wider">Engajamento & Reputação</span>
  </div>
  <div class="engagement-accumulators flex flex-wrap items-center gap-1.5 text-xs">
    <span class="inline-flex items-center gap-1 px-2 py-1 bg-amber-100/70 border border-amber-300 text-amber-900 rounded-lg font-bold text-[11px]" title="Pontos Acumulados">
      <span>🏆</span> <strong>${points}</strong> Points
    </span>
    <span class="inline-flex items-center gap-1 px-2 py-1 bg-rose-100/70 border border-rose-300 text-rose-900 rounded-lg font-bold text-[11px]" title="Corações e Curtidas">
      <span>❤️</span> <strong>${likes}</strong> Likes
    </span>
    <span class="inline-flex items-center gap-1 px-2 py-1 bg-orange-100/70 border border-orange-300 text-orange-900 rounded-lg font-semibold text-[11px]" title="Distintivo Excelente">
      <span>🔥</span> <strong>${badges.excelente}</strong> Excelente
    </span>
    <span class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100/70 border border-yellow-300 text-yellow-900 rounded-lg font-semibold text-[11px]" title="Distintivo Útil">
      <span>💡</span> <strong>${badges.util}</strong> Útil
    </span>
    <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100/70 border border-blue-300 text-blue-900 rounded-lg font-semibold text-[11px]" title="Distintivo Técnico">
      <span>🛠️</span> <strong>${badges.tecnico}</strong> Técnico
    </span>
  </div>
</div>
`.trim();
}
window.renderProfileEngagement = renderProfileEngagement;

// =========================================================================
// GESTÃO ADMINISTRATIVA E CONTROLE DE USUÁRIOS (Admin Actions)
// =========================================================================

// 1. Função utilitária para capturar inicial (tratamento seguro de nulo/undefined)
function getInitial(str) {
  if (!str || typeof str !== 'string') return '?';
  const trimmed = str.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';
}
window.getInitial = getInitial;

// 1. Ao renderizar a lista de gestão de usuários:
function renderAdminUserList(usersList) {
  if (!Array.isArray(usersList)) return '';

  return usersList.map(user => {
    const userId = user.id || user.uid || '';
    const userName = user.name || user.displayName || 'Usuário Sem Nome';
    const userEmail = user.email || 'Sem email';
    const userRole = user.tipo || user.role || user.tipoConta || 'cliente';
    const isBanned = user.status === 'banned' || user.status === 'blocked' || user.statusConta === 'bloqueada';
    const hasSelo = user.hasSeloMZ === true || user.temSeloMZ === true || user.statusSelo === 'aprovado';

    return `
      <div class="admin-user-card" data-id="${userId}">
        <div class="user-avatar-circle">${getInitial(userName)}</div>
        <div class="user-info">
          <h4>${userName}</h4>
          <p>${userEmail} • <span class="badge">${String(userRole).toUpperCase()}</span></p>
        </div>
        <div class="admin-actions">
          <button onclick="toggleUserStatus('${userId}', ${!isBanned})">
            ${isBanned ? 'Desbanir' : 'Bloquear/Banir'}
          </button>
          <button onclick="toggleSeloMZ('${userId}', ${!hasSelo})">
            ${hasSelo ? 'Remover Selo' : 'Conceder Selo'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}
window.renderAdminUserList = renderAdminUserList;

// 2. Bloquear / Banir Usuário
async function toggleUserStatus(userId, shouldBan) {
  if (!userId) {
    console.warn('[toggleUserStatus] userId ausente');
    return;
  }

  try {
    if (window.TecnicaProAdmin && typeof window.TecnicaProAdmin.toggleUserStatus === 'function') {
      return await window.TecnicaProAdmin.toggleUserStatus(userId, shouldBan);
    }

    const firestore = window.firebaseFirestore;
    const dbInstance = window.db;

    if (firestore && dbInstance) {
      const { doc, updateDoc } = firestore;
      const userRef = doc(dbInstance, 'users', userId);
      await updateDoc(userRef, {
        status: shouldBan ? 'banned' : 'active',
        statusConta: shouldBan ? 'bloqueada' : 'ativa',
        updatedAt: new Date().toISOString()
      });
    } else {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      if (window.db) {
        const userRef = doc(window.db, 'users', userId);
        await updateDoc(userRef, {
          status: shouldBan ? 'banned' : 'active',
          statusConta: shouldBan ? 'bloqueada' : 'ativa',
          updatedAt: new Date().toISOString()
        });
      }
    }
    alert(shouldBan ? 'Usuário bloqueado com sucesso!' : 'Usuário desbloqueado!');
  } catch (err) {
    console.error('Erro ao alterar status:', err);
    alert('Erro ao alterar status: ' + (err.message || err));
  }
}
window.toggleUserStatus = toggleUserStatus;

// 2. Adicionar / Remover Selo MZ
async function toggleSeloMZ(userId, giveSelo) {
  if (!userId) {
    console.warn('[toggleSeloMZ] userId ausente');
    return;
  }

  try {
    if (window.TecnicaProAdmin && typeof window.TecnicaProAdmin.toggleSeloMZ === 'function') {
      return await window.TecnicaProAdmin.toggleSeloMZ(userId, giveSelo);
    }

    const firestore = window.firebaseFirestore;
    const dbInstance = window.db;

    if (firestore && dbInstance) {
      const { doc, updateDoc } = firestore;
      const userRef = doc(dbInstance, 'users', userId);
      await updateDoc(userRef, {
        hasSeloMZ: giveSelo,
        temSeloMZ: giveSelo,
        isVerified: giveSelo,
        statusSelo: giveSelo ? 'aprovado' : 'rejeitado',
        seloGrantedAt: giveSelo ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      });
    } else {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      if (window.db) {
        const userRef = doc(window.db, 'users', userId);
        await updateDoc(userRef, {
          hasSeloMZ: giveSelo,
          temSeloMZ: giveSelo,
          isVerified: giveSelo,
          statusSelo: giveSelo ? 'aprovado' : 'rejeitado',
          seloGrantedAt: giveSelo ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        });
      }
    }
    alert(giveSelo ? 'Selo MZ concedido!' : 'Selo MZ removido!');
  } catch (err) {
    console.error('Erro ao alterar Selo MZ:', err);
    alert('Erro ao alterar Selo MZ: ' + (err.message || err));
  }
}
window.toggleSeloMZ = toggleSeloMZ;

// Auto-execução ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
  try {
    const cachedUser = localStorage.getItem('tecnica_user');
    if (cachedUser) {
      const user = JSON.parse(cachedUser);
      applyRoleBasedUI(user.tipo || user.role || user.tipoConta);
    }
  } catch (e) {
    console.debug('Role check initialization:', e);
  }
  initDashboardTabs();
});

// =========================================================================
// NAVEGAÇÃO POR ABAS DO PAINEL DO PROFISSIONAL
// =========================================================================
function initDashboardTabs() {
  const tabButtons = document.querySelectorAll('.dashboard-tabs .tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  if (!tabButtons.length) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTabId = btn.getAttribute('data-tab');
      if (!targetTabId) return;

      // Remove estado ativo de todos os botões e oculta os conteúdos
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
      });

      // Ativa o botão clicado e mostra a seção correta
      btn.classList.add('active');
      const targetContent = document.getElementById(targetTabId);
      if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
      }
    });
  });
}
window.initDashboardTabs = initDashboardTabs;

// Delegação global de eventos para SPAs re-renderizadas dinamicamente
document.addEventListener('click', (e) => {
  const btn = e.target && e.target.closest ? e.target.closest('.dashboard-tabs .tab-btn') : null;
  if (!btn) return;
  const targetTabId = btn.getAttribute('data-tab');
  if (!targetTabId) return;

  const tabButtons = document.querySelectorAll('.dashboard-tabs .tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(b => b.classList.remove('active'));
  tabContents.forEach(c => {
    c.classList.remove('active');
    c.style.display = 'none';
  });

  btn.classList.add('active');
  const targetContent = document.getElementById(targetTabId);
  if (targetContent) {
    targetContent.classList.add('active');
    targetContent.style.display = 'block';
  }
});

/* =========================================================================
   SISTEMA DE INTERCEPTAÇÃO E MODAL SELO MZ NECESSÁRIO (Vanilla JavaScript)
   ========================================================================= */

/**
 * Checa no localStorage se o técnico possui o Selo MZ verificado
 * @returns {boolean}
 */
function verificarTecnicoSeloMZ() {
  try {
    return localStorage.getItem('tecnico_verificado') === 'true';
  } catch (e) {
    return false;
  }
}
window.verificarTecnicoSeloMZ = verificarTecnicoSeloMZ;

/**
 * Abre o Modal "Selo MZ Necessário"
 * @param {string} [featureName='Ferramentas & Recursos']
 */
function abrirModalSeloMZ(featureName) {
  const nomeRecurso = featureName || 'Ferramentas & Recursos';

  // 1. Dispara evento para componente React caso o app React esteja ativo
  window.dispatchEvent(new CustomEvent('tecnicamz:abrir_selo_modal', {
    detail: { featureName: nomeRecurso }
  }));

  // 2. Procura ou injeta o Modal Vanilla no DOM
  let modal = document.getElementById('modal-selo-mz-overlay');
  if (!modal) {
    modal = criarEstruturaModalSeloVanilla(nomeRecurso);
  } else {
    const titleFeature = modal.querySelector('.feature-title-slot');
    if (titleFeature) {
      titleFeature.textContent = nomeRecurso.toUpperCase();
    }
  }

  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}
window.abrirModalSeloMZ = abrirModalSeloMZ;

/**
 * Fecha o Modal "Selo MZ Necessário"
 */
function fecharModalSeloMZ() {
  window.dispatchEvent(new CustomEvent('tecnicamz:fechar_selo_modal'));
  const modal = document.getElementById('modal-selo-mz-overlay');
  if (modal) {
    modal.style.display = 'none';
  }
  document.body.style.overflow = '';
}
window.fecharModalSeloMZ = fecharModalSeloMZ;

/**
 * Redireciona o usuário para as Definições da Conta para ativar o Selo MZ
 */
function navegarParaDefinicoesSelo() {
  fecharModalSeloMZ();
  window.dispatchEvent(new CustomEvent('tecnicamz:navegar', { detail: { tab: 'settings' } }));
  if (typeof window !== 'undefined') {
    window.location.hash = '#definicoes';
  }
}
window.navegarParaDefinicoesSelo = navegarParaDefinicoesSelo;

/**
 * Cria a estrutura HTML semântica do Modal Selo MZ no DOM
 * @param {string} featureName
 * @returns {HTMLElement}
 */
function criarEstruturaModalSeloVanilla(featureName) {
  const overlay = document.createElement('div');
  overlay.id = 'modal-selo-mz-overlay';
  overlay.className = 'modal-selo-mz-overlay';
  overlay.innerHTML = `
    <div class="modal-selo-mz-container" role="dialog" aria-modal="true" aria-labelledby="titulo-modal-selo">
      <!-- CABEÇALHO (GRADIENTE AZUL PREMIUM) -->
      <header class="modal-selo-header">
        <button type="button" class="btn-fechar-modal-x" onclick="fecharModalSeloMZ()" aria-label="Fechar">✕</button>
        <div class="header-content-wrapper">
          <div class="escudo-badge-wrapper">
            <svg class="escudo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <div class="header-text-group">
            <span class="badge-verificacao-oficial">✨ VERIFICAÇÃO OFICIAL TÉCNICAMZ</span>
            <h2 id="titulo-modal-selo" class="modal-selo-title">Selo MZ Necessário</h2>
          </div>
        </div>
      </header>

      <!-- CORPO DO MODAL (FUNDO BRANCO CLEAN) -->
      <main class="modal-selo-body">
        <!-- Caixa de Alerta (Amarelo Claro / Muted) -->
        <div class="alerta-restricao-box">
          <div class="alerta-lock-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="alerta-texto">
            <h3 class="alerta-titulo">ACESSO RESTRITO A '<span class="feature-title-slot">${(featureName || 'FERRAMENTAS & RECURSOS').toUpperCase()}</span>'</h3>
            <p class="alerta-desc">
              Ative o seu <strong>Selo MZ</strong> nas Definições da sua conta para liberar todas as ferramentas, solicitações de clientes e a Sara IA!
            </p>
          </div>
        </div>

        <!-- Lista de Benefícios Desbloqueados -->
        <section class="beneficios-secao">
          <h4 class="beneficios-titulo">O QUE VOCÊ DESBLOQUEIA COM O SELO MZ:</h4>
          <div class="beneficios-grid">
            <div class="beneficio-item">
              <span class="check-icon">✓</span>
              <span>Publicar no Mural & Mercado</span>
            </div>
            <div class="beneficio-item">
              <span class="check-icon">✓</span>
              <span>Solicitações & Contatos</span>
            </div>
            <div class="beneficio-item">
              <span class="check-icon">✓</span>
              <span>Status & Histórias 24h</span>
            </div>
            <div class="beneficio-item">
              <span class="check-icon">✓</span>
              <span>Ferramentas & Calculadoras</span>
            </div>
            <div class="beneficio-item beneficio-full">
              <span class="check-icon">✓</span>
              <span>Sara IA: Engenharia, Dimensionamento & Foto Análise</span>
            </div>
          </div>
        </section>

        <!-- Caixa de Pagamento / Taxa de Ativação -->
        <div class="taxa-ativacao-card">
          <div class="taxa-info">
            <p class="taxa-label">Taxa Única de Ativação do Selo</p>
            <p class="taxa-valor">50 MT <span class="taxa-metodo">via M-Pesa ou e-Mola</span></p>
          </div>
          <span class="badge-liberacao">Liberação Rápida</span>
        </div>

        <!-- BOTÕES DE AÇÃO -->
        <footer class="modal-selo-actions">
          <button type="button" class="btn-ativar-selo-principal" onclick="navegarParaDefinicoesSelo()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <span>Ativar Selo MZ nas Definições</span>
            <span class="seta-acao">→</span>
          </button>
          <button type="button" class="btn-fechar-discreto" onclick="fecharModalSeloMZ()">
            Talvez depois
          </button>
        </footer>
      </main>
    </div>
  `;

  // Fechar ao clicar fora do conteúdo
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      fecharModalSeloMZ();
    }
  });

  document.body.appendChild(overlay);
  return overlay;
}

// 4. Interceptador Global de Acesso a Ferramentas e Recursos Restritos
document.addEventListener('click', (e) => {
  const target = e.target;
  if (!target) return;

  const trigger = target.closest && (
    target.closest('#btn-nav-ferramentas') ||
    target.closest('[data-nav="tools"]') ||
    target.closest('[data-tab="tools"]') ||
    target.closest('[data-nav="ferramentas"]') ||
    target.closest('.requires-selo-mz')
  );

  if (trigger) {
    if (!verificarTecnicoSeloMZ()) {
      e.preventDefault();
      e.stopPropagation();
      abrirModalSeloMZ('Ferramentas & Recursos');
      return false;
    }
  }
}, true);

