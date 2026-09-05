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
