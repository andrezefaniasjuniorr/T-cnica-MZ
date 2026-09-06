// =========================================================================
// TÉCNICAMZ PRO - DASHBOARD TABS NAVIGATION (dashboard.js)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initDashboardTabs();
});

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

// Global window assignment
window.initDashboardTabs = initDashboardTabs;

// Event delegation for dynamic React DOM updates
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

// =========================================================================
// NAVEGAÇÃO & CONTROLE DA TELA DE FERRAMENTAS (#btn-nav-ferramentas -> #screen-ferramentas)
// =========================================================================
document.addEventListener('click', (e) => {
  const btnFerramentas = e.target && e.target.closest ? e.target.closest('#btn-nav-ferramentas') : null;
  if (!btnFerramentas) return;

  // Atualiza telas ativas
  const screens = document.querySelectorAll('.screen, [id^="screen-"]');
  screens.forEach(s => s.classList.remove('active'));

  const screenFerramentas = document.getElementById('screen-ferramentas');
  if (screenFerramentas) {
    screenFerramentas.classList.add('active');
  }

  // Sincroniza hash na URL se necessário
  if (window.location.hash !== '#tools' && window.location.hash !== '#ferramentas') {
    window.location.hash = '#tools';
  }
});

/**
 * Função utilitária de busca e filtro de ferramentas
 * @param {string} termo - Texto digitado no input de busca
 * @param {string} categoria - Aba selecionada ('todas', 'existentes', 'faturamento', 'tecnica', 'gestao', 'comunidade')
 */
function filtrarCardsFerramentas(termo = '', categoria = 'todas') {
  const cards = document.querySelectorAll('.card-ferramenta, [data-tool-category]');
  const termoLimpo = (termo || '').trim().toLowerCase();
  const catLimpa = (categoria || 'todas').toLowerCase();

  cards.forEach(card => {
    const cardCat = (card.getAttribute('data-tool-category') || 'existentes').toLowerCase();
    const cardNome = (card.getAttribute('data-tool-name') || card.textContent || '').toLowerCase();

    const matchCategoria = catLimpa === 'todas' || cardCat === catLimpa || (catLimpa === 'ja existentes' && cardCat === 'existentes');
    const matchBusca = !termoLimpo || cardNome.includes(termoLimpo);

    if (matchCategoria && matchBusca) {
      card.style.display = '';
      card.classList.remove('hidden');
    } else {
      card.style.display = 'none';
      card.classList.add('hidden');
    }
  });
}
window.filtrarCardsFerramentas = filtrarCardsFerramentas;

