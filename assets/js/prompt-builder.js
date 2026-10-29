document.addEventListener('DOMContentLoaded',()=>{
 const asset=document.getElementById('asset'), task=document.getElementById('task'), period=document.getElementById('period'), sources=document.getElementById('sources'), output=document.getElementById('prompt-output'), status=document.getElementById('prompt-status');
 const build=()=>{
  const p=`Actúa como asistente de investigación financiera con finalidad educativa. Quiero ${task.value} sobre ${asset.value}.\n\nALCANCE\n- Periodo/fecha: ${period.value.trim()||'usa solo el periodo que aparezca en las fuentes aportadas; si falta, pregunta o indícalo'}.\n- Fuentes que aportaré: ${sources.value.trim()||'documentos públicos y datos que adjunte en el mensaje'}.\n\nREGLAS DE VERIFICACIÓN\n1. Usa primero las fuentes originales que te proporcione. No inventes datos, referencias, páginas, fechas ni enlaces.\n2. Distingue explícitamente hechos confirmados, cálculos, inferencias e información que no pueda verificarse.\n3. Para cada cifra importante, indica la fuente, la fecha, el periodo, la moneda, la unidad y la fórmula cuando corresponda.\n4. Si falta información o hay contradicciones, escribe “no consta” y explica qué documento hace falta. No rellenes huecos con suposiciones.\n5. Comprueba que los periodos y definiciones sean comparables; advierte sobre posibles datos desactualizados.\n6. Expón riesgos, limitaciones, sesgos y aspectos que una persona debería verificar manualmente.\n7. No predigas precios ni garantices rentabilidades. No me digas que compre, venda o mantenga un activo ni presentes el resultado como asesoramiento personalizado.\n8. Devuelve primero un resumen breve, después una tabla trazable de hallazgos y, al final, una lista de preguntas pendientes.\n\nSi no tienes acceso a una fuente o no puedes abrir un documento, dilo claramente. Una respuesta convincente no sustituye la verificación independiente.`;
  output.textContent=p; status.textContent='Prompt generado. Revísalo y añade las fuentes reales en tu asistente.';
 };
 document.getElementById('generate-prompt').addEventListener('click',build);
 document.getElementById('copy-prompt').addEventListener('click',async()=>{
  if(!output.textContent||output.textContent.startsWith('Selecciona el tipo')) build();
  try{await navigator.clipboard.writeText(output.textContent);status.textContent='Prompt copiado al portapapeles.';}
  catch(e){const r=document.createRange();r.selectNodeContents(output);const s=window.getSelection();s.removeAllRanges();s.addRange(r);status.textContent='Selecciona el texto resaltado y cópialo con Ctrl+C.';}
 });
});
