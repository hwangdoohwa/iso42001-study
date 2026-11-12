'use strict';
const $=id=>document.getElementById(id);
const KEY='iso42001-study-v1';
let saved={done:[],stars:[]};
try{const value=JSON.parse(localStorage.getItem(KEY)||'null');if(value&&Array.isArray(value.done)&&Array.isArray(value.stars))saved=value;}catch{}
const done=new Set(saved.done),stars=new Set(saved.stars);
let study=false,mixed=false;const revealed=new Set();
const rows=SECTIONS.flatMap((section,si)=>section.items.map((item,ii)=>({...item,id:`${si}-${ii}`,si,section})));
let order=rows.map(r=>r.id);
const text=(tag,content,cls)=>{const e=document.createElement(tag);e.textContent=content;if(cls)e.className=cls;return e;};
function persist(){try{localStorage.setItem(KEY,JSON.stringify({done:[...done],stars:[...stars]}));}catch{$('notice').textContent='기록을 저장할 수 없습니다. 브라우저의 저장 공간 설정을 확인하세요.';}}
SECTIONS.forEach((s,i)=>{const o=text('option',s.title);o.value=i;$('section').append(o);});
SECTIONS.forEach(s=>{const h=text('h3',s.title);$('guide').append(h);s.notes.forEach(n=>$('guide').append(text('p',n)));});
function render(){
 const terms=$('search').value.toLowerCase().trim().split(/\s+/).filter(Boolean),section=$('section').value,status=$('status').value;
 let filtered=rows.filter(r=>(section==='all'||r.si===Number(section))&&terms.every(t=>`${r.question} ${r.target} ${r.reason} ${r.section.title}`.toLowerCase().includes(t))&&(status==='all'||status==='done'&&done.has(r.id)||status==='remaining'&&!done.has(r.id)||status==='star'&&stars.has(r.id)));
 if(mixed)filtered.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
 $('cards').replaceChildren();let previous=-1;
 for(const r of filtered){
  if(!mixed&&previous!==r.si){const head=text('div','','sectionhead');head.append(text('h2',r.section.title));r.section.description.forEach(d=>head.append(text('p',d)));r.section.notes.forEach(n=>head.append(text('div',n,'warning')));$('cards').append(head);previous=r.si;}
  const card=text('article','','card'+(done.has(r.id)?' done':''));
  const top=text('div','','cardtop');top.append(text('span',r.section.title,'tag'));
  const star=text('button',stars.has(r.id)?'★':'☆','star');star.type='button';star.setAttribute('aria-label',`${r.question} 중요 표시`);star.setAttribute('aria-pressed',stars.has(r.id));star.onclick=()=>{stars.has(r.id)?stars.delete(r.id):stars.add(r.id);persist();render();};top.append(star);card.append(top,text('h3',r.question,'question'));
  const answer=text('div','','answer');answer.append(text('p','먼저 찾을 곳','label'),text('p',r.target,'target'),text('p','찾는 이유 · 연관성','label'),text('p',r.reason,'reason'));
  if(study&&!revealed.has(r.id)){answer.hidden=true;const reveal=text('button','조항과 이유 확인','reveal');reveal.onclick=()=>{revealed.add(r.id);answer.hidden=false;reveal.remove();};card.append(reveal);}
  card.append(answer);const label=text('label','','check');const check=document.createElement('input');check.type='checkbox';check.checked=done.has(r.id);check.onchange=()=>{check.checked?done.add(r.id):done.delete(r.id);persist();render();};label.append(check,document.createTextNode('이해했어요'));card.append(label);$('cards').append(card);
 }
 $('count').textContent=`${filtered.length}개 표시 · 전체 ${rows.length}개`;$('empty').hidden=filtered.length>0;$('progress').max=rows.length;$('progress').value=rows.filter(r=>done.has(r.id)).length;$('progressText').textContent=`완료 ${$('progress').value} / ${rows.length}`;
}
['search','section','status'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));
$('clear').onclick=()=>{$('search').value='';render();$('search').focus();};
$('study').onclick=()=>{study=!study;revealed.clear();$('study').setAttribute('aria-pressed',study);$('study').textContent=study?'답 모두 보기':'답 가리고 복습';render();};
$('shuffle').onclick=()=>{mixed=!mixed;if(mixed){for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}}$('shuffle').textContent=mixed?'목차 순서로':'순서 섞기';render();};
$('share').onclick=async()=>{try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);$('notice').textContent='웹앱 주소를 복사했습니다.';}else $('notice').textContent='주소창의 웹앱 주소를 복사해 공유하세요.';}catch(e){if(e.name!=='AbortError')$('notice').textContent='주소창의 웹앱 주소를 복사해 공유하세요.';}};
$('reset').onclick=()=>{if(confirm('이 기기의 완료·중요 표시를 모두 초기화할까요?')){done.clear();stars.clear();persist();render();}};
render();
