document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ratio-form');
  const out = document.getElementById('ratio-results');
  if (!form || !out) return;

  const fmt = (n, digits = 2) => Number.isFinite(n)
    ? new Intl.NumberFormat('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
    : 'No calculable';
  const field = id => Number(document.getElementById(id).value);

  function calculate() {
    const revenue = field('ratio-revenue');
    const operating = field('ratio-operating');
    const currentAssets = field('ratio-current-assets');
    const currentLiabilities = field('ratio-current-liabilities');
    const grossDebt = field('ratio-debt');
    const cash = field('ratio-cash');
    const ebitda = field('ratio-ebitda');
    const netIncome = field('ratio-net-income');
    const averageEquity = field('ratio-equity');
    const values = [revenue, operating, currentAssets, currentLiabilities, grossDebt, cash, ebitda, netIncome, averageEquity];

    if (!values.every(Number.isFinite) || revenue < 0 || currentAssets < 0 || currentLiabilities < 0 || grossDebt < 0 || cash < 0 || averageEquity < 0) {
      out.innerHTML = '<h2>Revisa los datos</h2><p>Introduce valores numéricos finitos. Ingresos, activos y pasivos corrientes, deuda bruta, caja y patrimonio medio no pueden ser negativos en este formulario. Para un caso con signos o clasificaciones especiales, analiza el documento original por separado.</p>';
      return;
    }

    const margin = revenue > 0 ? operating / revenue * 100 : NaN;
    const current = currentLiabilities > 0 ? currentAssets / currentLiabilities : NaN;
    const netDebt = grossDebt - cash;
    const leverage = netDebt >= 0 && ebitda > 0 ? netDebt / ebitda : NaN;
    const roe = averageEquity > 0 ? netIncome / averageEquity * 100 : NaN;
    const debtLabel = netDebt < 0
      ? `Caja neta: ${fmt(Math.abs(netDebt))} M de la moneda del informe`
      : ebitda > 0 ? `${fmt(leverage)}x` : 'No interpretable con EBITDA ≤ 0';

    out.innerHTML = `<h2>Ratios calculados</h2>
      <p class="field-hint">El resultado reproduce las fórmulas sobre las cifras introducidas. No valida que las cifras fuente sean correctas ni que las definiciones contables sean comparables.</p>
      <div class="ratio-result-grid">
        <div class="ratio-result"><span>Margen operativo</span><strong>${fmt(margin)} %</strong><small>Resultado operativo ÷ ingresos</small></div>
        <div class="ratio-result"><span>Ratio corriente</span><strong>${fmt(current)}x</strong><small>Activo corriente ÷ pasivo corriente</small></div>
        <div class="ratio-result"><span>Deuda neta / EBITDA</span><strong>${debtLabel}</strong><small>Cuando hay caja neta no se presenta un múltiplo negativo de apalancamiento</small></div>
        <div class="ratio-result"><span>ROE aproximado</span><strong>${fmt(roe)} %</strong><small>Beneficio neto ÷ patrimonio neto medio</small></div>
      </div>
      <p><strong>Antes de interpretar:</strong> confirma periodo, moneda, consolidación y definición de cada partida. Un EBITDA negativo hace que deuda neta/EBITDA pierda su interpretación usual. Un ratio corriente alto no garantiza liquidez si el inventario no se vende o las cuentas a cobrar no se cobran. El ROE puede distorsionarse si el patrimonio medio es muy bajo, negativo o afectado por operaciones extraordinarias. Estos cocientes no son una calificación automática ni una recomendación de inversión.</p>`;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (form.reportValidity()) calculate();
  });
  form.addEventListener('reset', () => setTimeout(calculate, 0));
  calculate();
});
