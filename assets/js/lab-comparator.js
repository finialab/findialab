/* Laboratorio de pruebas de IA financiera — local-only manual record keeping. */
(() => {
  const fields = [
    ['lab-source', 'Fuente primaria'], ['lab-period', 'Fecha, periodo y unidad'],
    ['lab-math', 'Reproducibilidad del cálculo'], ['lab-support', 'La fuente respalda la frase'],
    ['lab-missing', 'Datos ausentes y contradicciones'], ['lab-separate', 'Hecho, cálculo e inferencia'],
    ['lab-scope', 'Prudencia y alcance']
  ];
  const records = [];
  const form = () => document.getElementById('lab-form');
  const el = id => document.getElementById(id);
  const safeText = value => String(value ?? '').trim();
  const csvCell = value => '"' + String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
  const scoresFromForm = f => fields.map(([name, label]) => {
    const chosen = f.querySelector(`input[name="${name}"]:checked`);
    return { name: label, score: chosen ? Number(chosen.value) : 0 };
  });
  function render() {
    const tbody = el('lab-table')?.querySelector('tbody');
    const count = el('lab-summary');
    const exportBtn = el('lab-export');
    const clearBtn = el('lab-clear');
    if (!tbody || !count) return;
    tbody.replaceChildren();
    if (!records.length) {
      const tr = document.createElement('tr'); const td = document.createElement('td');
      td.colSpan = 4; td.textContent = 'Aún no hay registros.'; tr.append(td); tbody.append(tr);
    } else {
      for (const r of records) {
        const tr = document.createElement('tr');
        [r.model, r.task, `${r.total}/14`, r.zeroItems.join(', ') || 'Ninguno'].forEach(value => {
          const td = document.createElement('td'); td.textContent = value; tr.append(td);
        });
        tbody.append(tr);
      }
    }
    count.replaceChildren();
    const strong = document.createElement('strong'); strong.textContent = String(records.length);
    const span = document.createElement('span'); span.textContent = 'evaluaciones registradas';
    const p = document.createElement('p');
    p.textContent = records.length ? `Media de trazabilidad registrada: ${(records.reduce((a,r)=>a+r.total,0)/records.length).toFixed(1)}/14. Esta media depende de tu rúbrica y no representa exactitud ni rentabilidad.` : 'Añade una evaluación para ver el resumen.';
    count.append(strong, span, p);
    if (exportBtn) exportBtn.disabled = !records.length;
    if (clearBtn) clearBtn.disabled = !records.length;
  }
  function register(f) {
    if (!f.reportValidity()) return;
    const scores = scoresFromForm(f);
    const total = scores.reduce((sum, item) => sum + item.score, 0);
    const record = {
      model: safeText(el('lab-model')?.value), version: safeText(el('lab-version')?.value),
      date: safeText(el('lab-date')?.value), task: safeText(el('lab-task')?.value),
      document: safeText(el('lab-document')?.value), prompt: safeText(el('lab-task-prompt')?.value),
      observation: safeText(el('lab-observation')?.value), total, scores,
      zeroItems: scores.filter(s=>s.score===0).map(s=>s.name),
      savedAt: new Date().toISOString()
    };
    records.push(record);
    render();
    const status = el('lab-status');
    if (status) status.textContent = `Evaluación registrada: ${record.model}, ${record.total}/14 puntos de trazabilidad. Guarda el CSV si quieres conservar el resultado.`;
    f.reset();
  }
  function exportCsv() {
    if (!records.length) return;
    const headers = ['asistente','version','fecha_prueba','tipo_tarea','documento_fuente','instruccion','observacion','puntuacion_trazabilidad_sobre_14', ...fields.map(x=>x[1]), 'criterios_con_puntuacion_0','registro_utc'];
    const rows = records.map(r => [r.model,r.version,r.date,r.task,r.document,r.prompt,r.observation,r.total,...r.scores.map(s=>s.score),r.zeroItems.join(' | '),r.savedAt]);
    const csv = '\uFEFF' + [headers,...rows].map(row=>row.map(csvCell).join(';')).join('\r\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href=url; a.download=`finialab-evaluaciones-ia-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    const status=el('lab-status'); if(status) status.textContent='CSV exportado al dispositivo. No se ha enviado ningún dato a FinIA Lab.';
  }
  document.addEventListener('submit', event => {
    if (event.target?.id === 'lab-form') { event.preventDefault(); register(event.target); }
  });
  document.addEventListener('click', event => {
    if (event.target?.closest('#lab-export')) { exportCsv(); }
    if (event.target?.closest('#lab-clear')) { records.length = 0; render(); const status=el('lab-status'); if(status)status.textContent='Se han borrado los registros de esta sesión.'; }
    if (event.target?.closest('#lab-reset-form')) { const f=form(); if(f)f.reset(); const status=el('lab-status'); if(status)status.textContent='Formulario limpio. Los registros existentes siguen en esta sesión.'; }
  });
  render();
})();
