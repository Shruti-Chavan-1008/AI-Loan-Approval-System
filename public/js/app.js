const form = document.getElementById('loanForm');
if (form) {
  const $ = (id) => document.getElementById(id);
  const hint = $('hint');
  const update = () => {
    const inc = (+$('income').value || 0) + (+$('coincome').value || 0);
    const amt = +$('loanAmt').value || 0;
    if (inc && amt) {
      const ratio = (amt / inc).toFixed(1);
      hint.className = 'hint w-100' + (ratio > 5 ? ' warn' : '');
      hint.innerHTML = `<i class="bi bi-info-circle"></i> Loan is <b>${ratio}x</b> total income.`;
    }
  };
  ['income', 'coincome', 'loanAmt'].forEach((id) => $(id).addEventListener('input', update));
  form.addEventListener('submit', (e) => {
    let ok = true;
    form.querySelectorAll('[required]').forEach((el) => {
      const bad = !el.value || !el.checkValidity();
      el.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
}
