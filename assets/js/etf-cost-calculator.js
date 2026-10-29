document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('etf-form');
  const out = document.getElementById('etf-results');
  if (!form || !out) return;

  const euro = n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const num = n => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(n);

  function calculate() {
    const capital = Number(document.getElementById('etf-capital').value);
    const years = Number(document.getElementById('etf-years').value);
    const gross = Number(document.getElementById('etf-return').value) / 100;
    const feeA = Number(document.getElementById('etf-fee-a').value) / 100;
    const feeB = Number(document.getElementById('etf-fee-b').value) / 100;

    if (!Number.isFinite(capital + years + gross + feeA + feeB) || capital < 0 || years < 1 || years > 80 || gross <= -1 || feeA < 0 || feeB < 0) {
      out.innerHTML = '<h2>Revisa los valores</h2><p>Introduce un capital no negativo, un horizonte de 1 a 80 años y costes no negativos. La rentabilidad bruta anual debe ser superior a −100 %.</p>';
      return;
    }

    // Simplified convention: fee is applied multiplicatively to each year's gross factor.
    // This is an educational model, not a full fund tracking simulation.
    const netA = (1 + gross) * (1 - feeA) - 1;
    const netB = (1 + gross) * (1 - feeB) - 1;
    const factorA = 1 + netA;
    const factorB = 1 + netB;
    if (factorA <= 0 || factorB <= 0) {
      out.innerHTML = '<h2>Supuestos fuera del modelo</h2><p>Con estos valores, el factor anual resultante no es positivo. Revisa los costes y la rentabilidad hipotética.</p>';
      return;
    }

    const finalA = capital * Math.pow(factorA, years);
    const finalB = capital * Math.pow(factorB, years);
    const difference = finalA - finalB;

    out.innerHTML = `<h2>Escenario matemático, no una previsión</h2>
      <p>Supuestos: capital inicial ${euro(capital)}, rentabilidad bruta constante ${num(gross * 100)} % anual y horizonte de ${years} años. El coste se aplica con la fórmula simplificada <code>(1 + r) × (1 − f) − 1</code>, donde r es la rentabilidad bruta y f el coste anual.</p>
      <div class="ratio-result-grid">
        <div class="ratio-result"><span>Escenario A</span><strong>${euro(finalA)}</strong><small>Coste ${num(feeA * 100)} %; tasa neta modelada ${num(netA * 100)} %</small></div>
        <div class="ratio-result"><span>Escenario B</span><strong>${euro(finalB)}</strong><small>Coste ${num(feeB * 100)} %; tasa neta modelada ${num(netB * 100)} %</small></div>
      </div>
      <p><strong>Diferencia aritmética entre escenarios:</strong> ${euro(difference)}.</p>
      <p><strong>Limitaciones:</strong> rentabilidad constante y coste constante; no incorpora tracking difference, spread, comisiones del intermediario, impuestos, inflación, aportaciones/retiradas, cambios de cartera, divisa ni volatilidad. El TER no representa todos los costes. No es ahorro garantizado ni recomendación de producto; contrasta el KID y los documentos oficiales del ETF.</p>`;
  }

  form.addEventListener('submit', event => { event.preventDefault(); if (form.reportValidity()) calculate(); });
  form.addEventListener('reset', () => setTimeout(calculate, 0));
  calculate();
});
