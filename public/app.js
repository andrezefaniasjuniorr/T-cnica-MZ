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

// 0. CONTROLE DE INTERFACE POR PAPEL (UI/UX)
function applyRoleBasedUI(userRole) {
  const btnMais = document.querySelector('[data-nav="mais"]') || document.getElementById('btnMais');
  if (btnMais) {
    btnMais.style.display = (userRole === 'cliente' || userRole === 'client') ? 'none' : 'flex';
  }
}
window.applyRoleBasedUI = applyRoleBasedUI;

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
    const userRole = user.role || user.tipoConta || 'cliente';
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
      applyRoleBasedUI(user.role || user.tipoConta);
    }
  } catch (e) {
    console.debug('Role check initialization:', e);
  }
});
