(()=>{'use strict';
const list=document.getElementById('evidence-list');if(!list)return;
const fields=[
 ['claim','Afirmación concreta','textarea','Ej.: La deuda neta del ejercicio fue de 145 M€'],
 ['source','URL de la fuente primaria','url','https://…'],
 ['sourceDetail','Página, tabla o sección','text','Ej.: Informe anual 2025, nota 12, p. 84'],
 ['period','Periodo, fecha y unidad','text','Ej.: ejercicio 2025 · millones de euros'],
 ['evidence','Extracto o dato observado','textarea','Copia solo el fragmento necesario y conserva el contexto'],
 ['calculation','Cálculo reproducido','textarea','Fórmula, valores de entrada, resultado y redondeo'],
 ['interpretation','Interpretación y límites','textarea','Qué puede concluirse y qué no'],
 ['counter','Dudas, contradicciones o evidencia en contra','textarea','¿Qué dato podría cambiar esta conclusión?']
];
let entries=[];let nextId=1;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const make=(tag,attrs={},text='')=>{const el=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(text)el.textContent=text;return el};
function render(){list.innerHTML='';if(!entries.length){const e=make('div',{class:'evidence-empty'});e.innerHTML='<strong>Aún no has añadido afirmaciones.</strong><p>Empieza con una cifra o conclusión de una respuesta de IA que quieras comprobar.</p>';list.append(e)}
entries.forEach((entry,index)=>{const card=make('article',{class:'evidence-card'});const head=make('div',{class:'evidence-card-head'});head.append(make('h3',{},`Afirmación ${index+1}`));const del=make('button',{type:'button',class:'btn btn-secondary evidence-remove','aria-label':`Eliminar afirmación ${index+1}`},'Eliminar');del.addEventListener('click',()=>{entries=entries.filter(e=>e.id!==entry.id);render()});head.append(del);card.append(head);
const grid=make('div',{class:'evidence-fields'});
fields.forEach(([key,label,type,placeholder])=>{const wrap=make('div',{class:'evidence-field'+(['claim','evidence','calculation','interpretation','counter'].includes(key)?' evidence-field-wide':'')});const id=`ev-${entry.id}-${key}`;const lab=make('label',{for:id},label);let input;if(type==='textarea'){input=make('textarea',{id,name:key,rows:key==='claim'?2:3,placeholder});input.value=entry[key]||''}else{input=make('input',{id,name:key,type,placeholder,autocomplete:'off'});input.value=entry[key]||'';if(type==='url')input.inputMode='url'}input.addEventListener('input',()=>{entry[key]=input.value});wrap.append(lab,input);grid.append(wrap)});
const statusWrap=make('div',{class:'evidence-field'});const statusId=`ev-${entry.id}-status`;statusWrap.append(make('label',{for:statusId},'Estado de comprobación'));const select=make('select',{id:statusId});[['pending','Pendiente'],['partial','Parcial'],['verified','Verificado'],['contradicted','Contradicho']].forEach(([v,l])=>select.append(make('option',{value:v},l)));select.value=entry.status||'pending';select.addEventListener('change',()=>entry.status=select.value);statusWrap.append(select);grid.append(statusWrap);
const notes=make('div',{class:'evidence-field'});notes.append(make('label',{for:`ev-${entry.id}-reviewer`},'Fecha de revisión (opcional)'));const date=make('input',{id:`ev-${entry.id}-reviewer`,type:'date'});date.value=entry.reviewDate||'';date.addEventListener('change',()=>entry.reviewDate=date.value);notes.append(date);grid.append(notes);card.append(grid);list.append(card)});
document.getElementById('evidence-count').textContent=`${entries.length} ${entries.length===1?'afirmación registrada':'afirmaciones registradas'}`;
}
function add(){entries.push({id:nextId++,status:'pending',reviewDate:''});render();const first=list.querySelector('.evidence-card:last-child textarea');if(first)first.focus()}
function csvCell(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=make('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportCsv(){if(!entries.length){alert('Añade al menos una afirmación antes de exportar.');return}const headers=['Afirmación','URL fuente primaria','Página/tabla/sección','Periodo/fecha/unidad','Extracto o dato observado','Cálculo reproducido','Interpretación y límites','Dudas o evidencia en contra','Estado','Fecha de revisión'];const keys=['claim','source','sourceDetail','period','evidence','calculation','interpretation','counter','status','reviewDate'];const rows=[headers,...entries.map(e=>keys.map(k=>e[k]||''))];download('finialab-ficha-evidencia.csv','\ufeff'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8')}
function exportJson(){if(!entries.length){alert('Añade al menos una afirmación antes de exportar.');return}const clean=entries.map(({id,...rest})=>rest);download('finialab-ficha-evidencia.json',JSON.stringify({tool:'FinIA Lab · Ficha de evidencia financiera',exportedAt:new Date().toISOString(),entries:clean},null,2),'application/json;charset=utf-8')}
document.getElementById('add-evidence').addEventListener('click',add);document.getElementById('add-evidence-bottom').addEventListener('click',add);document.getElementById('export-evidence').addEventListener('click',exportCsv);document.getElementById('export-json').addEventListener('click',exportJson);document.getElementById('clear-evidence').addEventListener('click',()=>{if(!entries.length)return;if(confirm('¿Borrar todas las afirmaciones de esta ficha? Esta acción no se puede deshacer.')){entries=[];render()}});render();
})();