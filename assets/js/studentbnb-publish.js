document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('publish-studentbnb');
  const panel = document.getElementById('studentbnb-pricing-panel');
  const monthly = document.getElementById('price');
  const uplift = document.getElementById('studentbnb-uplift');
  const p7 = document.getElementById('studentbnb-price-7');
  const p14 = document.getElementById('studentbnb-price-14');
  const p30 = document.getElementById('studentbnb-price-30');
  const summary = document.getElementById('studentbnb-price-summary');

  if (!toggle || !panel || !monthly || !uplift || !p7 || !p14 || !p30) return;

  const money = value => new Intl.NumberFormat('it-IT', {style:'currency', currency:'EUR', maximumFractionDigits:0}).format(value || 0);

  function calculate(force = false) {
    const base = Number(monthly.value || 0);
    const pct = Number(uplift.value || 25);
    if (!base) {
      if (summary) summary.textContent = 'Inserisci prima il canone mensile CasaStudent.';
      return;
    }
    const testMonth = Math.round(base * (1 + pct / 100));
    // Settimane proporzionate sul mese commerciale, arrotondate per semplicità.
    const suggested7 = Math.round(testMonth / 4);
    const suggested14 = Math.round(testMonth / 2);
    if (force || !p7.dataset.edited) p7.value = suggested7;
    if (force || !p14.dataset.edited) p14.value = suggested14;
    if (force || !p30.dataset.edited) p30.value = testMonth;
    if (summary) summary.textContent = `Canone CasaStudent ${money(base)} → riferimento StudentBnB +${pct}%: ${money(testMonth)} / 30 giorni.`;
  }

  function syncVisibility() {
    panel.hidden = !toggle.checked;
    panel.classList.toggle('hidden', !toggle.checked);
    [p7,p14,p30].forEach(el => el.required = toggle.checked);
    if (toggle.checked) calculate(true);
  }

  toggle.addEventListener('change', syncVisibility);
  monthly.addEventListener('input', () => calculate(false));
  uplift.addEventListener('change', () => {
    [p7,p14,p30].forEach(el => delete el.dataset.edited);
    calculate(true);
  });
  [p7,p14,p30].forEach(el => el.addEventListener('input', () => { el.dataset.edited = '1'; }));
  syncVisibility();
});
