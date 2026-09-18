/* StarGrid v2 — 原生脚本，可直接从本地文件打开。 */
(() => {
  'use strict';
  const ROW='ONE_STAR_PER_ROW', COL='ONE_STAR_PER_COLUMN', REGION='ONE_STAR_PER_REGION', TOUCH='NO_TOUCH';
  const BASIC=[ROW,COL], SPACED=[ROW,COL,TOUCH], ALL=[ROW,COL,REGION,TOUCH];
  const original=[0,0,0,0,0,1,0,2,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,3,2,2,4,4,3,3,2,2,4,5,5,5];
  const bands=Array.from({length:36},(_,i)=>Math.floor(i/6));
  const columns=Array.from({length:36},(_,i)=>i%6);
  const levels=[
    {id:'path-01',name:'第一颗微光',rules:BASIC,regions:bands,intro:'每行、每列各放一颗星。相邻也没关系。'},
    {id:'path-02',name:'留一点距离',rules:SPACED,regions:columns,intro:'星星不能挨着，也不能斜向接触。'},
    {id:'path-03',name:'颜色的约定',rules:[ROW,COL,REGION],regions:original,intro:'每种颜色也需要一颗星。本关允许接触。'},
    {id:'path-04',name:'寻找平衡',rules:ALL,regions:original.map((v,i)=>i===12?2:v),intro:'把四条规则放在一起，依然有多种答案。'},
    {id:'path-05',name:'星光花园',rules:ALL,regions:original,intro:'四条规则同时成立，找到唯一的星图。'}
  ].map((level,index)=>({...level,size:6,index,kind:'normal'}));
  const ruleLabels={[ROW]:'每行恰好 1 颗星',[COL]:'每列恰好 1 颗星',[REGION]:'每个颜色区域恰好 1 颗星',[TOUCH]:'星星不能相邻或斜向接触'};

  function evaluate(cells,level=levels[4]) {
    const n=level.size,stars=cells.flatMap((v,i)=>v===1?[i]:[]),conflicts=new Set();
    const statuses=level.rules.map(id=>{
      if(id===TOUCH){let pairs=0;stars.forEach((a,k)=>stars.slice(k+1).forEach(b=>{if(Math.abs(Math.floor(a/n)-Math.floor(b/n))<=1&&Math.abs(a%n-b%n)<=1){pairs++;conflicts.add(a);conflicts.add(b)}}));return{id,done:pairs===0?1:0,total:1,error:pairs>0,pairs}}
      if(![ROW,COL,REGION].includes(id))throw new Error('Unknown rule: '+id);
      const groups=new Map(),groupOf=i=>id===ROW?Math.floor(i/n):id===COL?i%n:level.regions[i];
      for(let i=0;i<n*n;i++)groups.set(groupOf(i),[]);
      stars.forEach(i=>groups.get(groupOf(i)).push(i));
      const lists=[...groups.values()];lists.filter(g=>g.length>1).flat().forEach(i=>conflicts.add(i));
      return{id,done:lists.filter(g=>g.length===1).length,total:lists.length,error:lists.some(g=>g.length>1)};
    });
    return{stars,statuses,conflicts,won:stars.length===n&&statuses.every(s=>s.done===s.total&&!s.error)&&(level.givens||[]).every(i=>cells[i]===1)};
  }

  // 当前 solver 支持 6×6、每行每列一星，加上可选区域和不接触规则。
  // 枚举最多 720 个列排列，答案集也用于兼容玩家当前摆法的提示。
  const solutionCache=new Map();
  function solve(level){
    const key=JSON.stringify([level.size,level.rules,level.regions]);
    if(solutionCache.has(key))return solutionCache.get(key);
    if(level.size!==6||!level.rules.includes(ROW)||!level.rules.includes(COL)||level.rules.some(r=>!ruleLabels[r]))throw new Error('Unsupported level');
    const solutions=[],n=level.size;
    function search(path,usedColumns,usedRegions){
      const row=path.length;
      if(row===n){solutions.push(path.map((col,r)=>r*n+col));return}
      for(let col=0;col<n;col++){
        if(usedColumns.has(col))continue;
        if(level.rules.includes(TOUCH)&&row>0&&Math.abs(path[row-1]-col)<=1)continue;
        const region=level.regions[row*n+col];
        if(level.rules.includes(REGION)&&usedRegions.has(region))continue;
        search([...path,col],new Set([...usedColumns,col]),new Set([...usedRegions,region]));
      }
    }
    search([],new Set(),new Set());
    if(solutionCache.size>80)solutionCache.clear();
    solutionCache.set(key,solutions);return solutions;
  }
  function answersFor(level){return solve(level).filter(a=>(level.givens||[]).every(i=>a.includes(i)))}
  function suggest(cells,level){
    const stars=cells.flatMap((v,i)=>v===1?[i]:[]),solutions=answersFor(level);
    const compatible=solutions.find(answer=>stars.every(i=>answer.includes(i)));
    if(compatible){const index=compatible.find(i=>cells[i]!==1);return index===undefined?null:{index,value:1,kind:'extend'}}
    if(!solutions.length)return null;
    const closest=solutions.reduce((best,answer)=>answer.filter(i=>cells[i]===1).length>best.filter(i=>cells[i]===1).length?answer:best);
    const index=stars.find(i=>!closest.includes(i)&&!level.givens?.includes(i));
    return index===undefined?null:{index,value:0,kind:'repair'};
  }
  function dateKey(now=new Date()){return new Date(now.getTime()+8*3600000).toISOString().slice(0,10)}
  function hash(text){let h=2166136261;for(const char of text)h=Math.imul(h^char.charCodeAt(0),16777619);return h>>>0}
  function random(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
  function transform(regions,variant){
    const result=Array(36);
    regions.forEach((region,i)=>{let r=Math.floor(i/6),c=i%6;if(variant&4)c=5-c;for(let k=0;k<(variant&3);k++){[r,c]=[c,5-r]}result[r*6+c]=region});return result;
  }
  // 有界、固定种子的每日生成；候选由合法星图向外生长为连通区域。
  // 每日困难题必须经 solver 验证唯一解；尝试上限后用已验证模板兜底。
  function generateHard(seed){
    const rng=random(seed),candidates=solve(levels[1]);
    for(let attempt=0;attempt<1600;attempt++){
      const stars=candidates[Math.floor(rng()*candidates.length)],regions=Array(36).fill(-1);
      stars.forEach((index,region)=>regions[index]=region);
      while(regions.includes(-1)){
        const edges=[];
        regions.forEach((v,i)=>{if(v<0)return;for(const j of [i-6,i+6,...(i%6?[i-1]:[]),...(i%6<5?[i+1]:[])])if(j>=0&&j<36&&regions[j]===-1)edges.push([j,v])});
        const [index,value]=edges[Math.floor(rng()*edges.length)];regions[index]=value;
      }
      if(regions.some(region=>regions.filter(v=>v===region).length<3))continue;
      let count=0;
      for(const answer of candidates){if(new Set(answer.map(i=>regions[i])).size===6)count++;if(count>1)break}
      if(count===1)return{regions,source:'generated'};
    }
    return{regions:transform(original,seed%8),source:'fallback'};
  }
  const dailyCache=new Map();
  function dailyLevels(day=dateKey()){
    if(dailyCache.has(day))return dailyCache.get(day);
    const seed=hash('stargrid-v2:'+day),hard=generateHard(seed),variant=seed%8;
    const daily=[
      {id:`daily-${day}-easy`,name:'晨间微光',size:6,kind:'daily',difficulty:'easy',day,rules:SPACED,regions:transform(bands,variant),intro:'有多种合法答案，找出你喜欢的排列。'},
      {id:`daily-${day}-hard`,name:'深夜星图',size:6,kind:'daily',difficulty:'hard',day,rules:ALL,regions:hard.regions,source:hard.source,intro:'每个颜色区域各一星，让四条规则同时成立。'}
    ];
    // 简单题加一个确定的起始星，保留多解，并让每日开局有所变化。
    const answers=solve(daily[0]),answer=answers[seed%answers.length];daily[0].givens=[answer[Math.floor(seed/90)%6]];
    if(dailyCache.size>14)dailyCache.clear();dailyCache.set(day,daily);return daily;
  }
  const DEFAULT_SETTINGS={sound:false,motion:true,letters:true};
  function cleanSave(raw){
    const value=raw&&typeof raw==='object'&&raw.version===2?raw:{};
    const settings={...DEFAULT_SETTINGS};for(const key of Object.keys(settings))if(typeof value.settings?.[key]==='boolean')settings[key]=value.settings[key];
    const completed={};if(value.completed&&typeof value.completed==='object')for(const [key,v] of Object.entries(value.completed).slice(-100))if(/^(path-0[1-5]|daily-\d{4}-\d{2}-\d{2}-(easy|hard))$/.test(key)&&v===true)completed[key]=true;
    const sessions={};if(value.sessions&&typeof value.sessions==='object')for(const [key,v] of Object.entries(value.sessions).slice(-40))if(/^(path-0[1-5]|daily-\d{4}-\d{2}-\d{2}-(easy|hard))$/.test(key)&&v&&Array.isArray(v.cells)&&v.cells.length===36&&v.cells.every(c=>c===0||c===1)&&Number.isSafeInteger(v.moves)&&v.moves>=0&&Number.isSafeInteger(v.hints)&&v.hints>=0)sessions[key]={cells:[...v.cells],moves:v.moves,hints:v.hints};
    return{version:2,settings,completed,sessions};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={levels,evaluate,solve,suggest,dateKey,dailyLevels,answersFor,cleanSave,transform};
  if(typeof document==='undefined')return;

  const $=id=>document.getElementById(id),SAVE_KEY='stargrid-v2';
  let save,storageOk=true;
  try{save=cleanSave(JSON.parse(localStorage.getItem(SAVE_KEY)))}catch{save=cleanSave(null);storageOk=false}
  let screen='home',settingsReturn='home',current=null,cells=[],moves=0,hints=0,completed=false,highlight=-1,buttons=[],audioContext;
  const colors=['#e8d1b9','#e9deab','#c6dabc','#b9d8db','#cfc7e3','#e9c7cc'];
  function storageNotice(){ $('storage-status').hidden=storageOk;$('storage-status').textContent='当前无法保存进度；本次仍可正常游玩。请勿关闭或刷新页面。' }
  function persist(){
    save.sessions=Object.fromEntries(Object.entries(save.sessions).slice(-40));
    const normals=Object.entries(save.completed).filter(([key])=>key.startsWith('path-'));
    const dailies=Object.entries(save.completed).filter(([key])=>key.startsWith('daily-')).slice(-90);
    save.completed=Object.fromEntries([...normals,...dailies]);
    try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));storageOk=true}catch{storageOk=false}storageNotice();
  }
  function saveSession(){if(!current)return;delete save.sessions[current.id];save.sessions[current.id]={cells:[...cells],moves,hints};persist()}
  function beep(won=false){
    if(!save.settings.sound)return;
    try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});const t=audioContext.currentTime;(won?[523,659,784]:[523]).forEach((hz,k)=>{const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.frequency.value=hz;gain.gain.setValueAtTime(.0001,t+k*.12);gain.gain.exponentialRampToValueAtTime(.06,t+k*.12+.01);gain.gain.exponentialRampToValueAtTime(.0001,t+k*.12+.16);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(t+k*.12);oscillator.stop(t+k*.12+.18)})}catch{/* 无音频支持时仍可游玩。 */}
  }
  function applySettings(){document.body.classList.toggle('no-motion',!save.settings.motion);document.body.classList.toggle('hide-letters',!save.settings.letters);for(const key of Object.keys(DEFAULT_SETTINGS))$(key+'-setting').checked=save.settings[key]}
  function show(name){
    screen=name;for(const id of ['home','daily','game','settings'])$(id+'-screen').hidden=id!==name;
    if(name==='home')renderHome();if(name==='daily')renderDaily();
    $(name+'-title')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
  }
  function renderHome(){
    const next=levels.find(level=>!save.completed[level.id])||levels[0],count=levels.filter(level=>save.completed[level.id]).length;
    $('start-label').textContent=count===5?'重温旅程':save.sessions[next.id]?'继续旅程':'开始旅程';
    $('home-progress').textContent=`初见星光 · 已完成 ${count} / 5 关`;
    $('level-list').replaceChildren();levels.forEach((level,i)=>{const button=document.createElement('button');button.className='level-button'+(save.completed[level.id]?' done':level.id===next.id?' recommended':'');button.textContent=String(i+1).padStart(2,'0');button.setAttribute('aria-label',`第 ${i+1} 关 ${level.name}${save.completed[level.id]?'，已完成':''}`);if(save.completed[level.id]){const check=document.createElement('small');check.textContent='✓';button.append(check)}button.onclick=()=>startLevel(level);$('level-list').append(button)});
    $('start').onclick=()=>startLevel(next);
  }
  function renderDaily(){
    const day=dateKey();$('daily-date').textContent=day.replaceAll('-',' / ')+' · 每天两道小挑战';
    dailyLevels(day).forEach(level=>{const kind=level.difficulty;$(kind+'-status').textContent=save.completed[level.id]?'✓ 已完成':save.sessions[level.id]?'继续挑战':'等待点亮';$('daily-'+kind).onclick=()=>startLevel(dailyLevels(dateKey())[kind==='easy'?0:1])})
  }
  function startLevel(level,fresh=false){
    current=level;const prior=fresh?null:save.sessions[level.id];cells=prior?[...prior.cells]:Array(36).fill(0);moves=prior?.moves||0;hints=prior?.hints||0;
    (level.givens||[]).forEach(i=>cells[i]=1);highlight=-1;completed=evaluate(cells,level).won;
    $('game-title').textContent=level.name;$('game-kind').textContent=level.kind==='daily'?'每日挑战':'普通闯关';
    $('level-number').textContent=level.kind==='daily'?`${level.day} / ${level.difficulty==='easy'?'简单':'困难'}`:`CHAPTER 01 / 第 ${String(level.index+1).padStart(2,'0')} 关`;
    $('solution-kind').textContent=answersFor(level).length===1?'唯一解':'多解关卡';$('level-intro').textContent=level.intro;
    $('game-back').textContent=level.kind==='daily'?'← 每日挑战':'← 返回首页';
    $('legend').textContent=level.rules.includes(REGION)?'同色 / 同字母为一区域，每区各一颗星':'本关颜色仅作装饰，无颜色区域限制';
    $('board').replaceChildren();buttons=cells.map((_,i)=>{
      const button=document.createElement('button');button.className='cell';button.style.setProperty('--color',colors[level.regions[i]]);
      const region=document.createElement('span');region.className='region';region.setAttribute('aria-hidden','true');
      const symbol=document.createElement('span');symbol.className='symbol';symbol.setAttribute('aria-hidden','true');button.append(region,symbol);
      button.onclick=()=>play(i);
      button.onkeydown=e=>{const r=Math.floor(i/6),c=i%6,dest={ArrowLeft:r*6+Math.max(0,c-1),ArrowRight:r*6+Math.min(5,c+1),ArrowUp:Math.max(0,r-1)*6+c,ArrowDown:Math.min(5,r+1)*6+c}[e.key];if(dest!==undefined){e.preventDefault();buttons[dest].focus()}};
      $('board').append(button);return button;
    });
    say(completed?'这张星图已完成，可以继续下一关。':level.givens?.length?'带圆点的星是今日起始线索，点击其他格子开始。':'直接点击格子，找出满足规则的星图。');
    renderBoard();saveSession();show('game');
  }
  function say(text){$('message').textContent=text}
  function play(index){
    if(completed)return;
    if(current.givens?.includes(index)){say('这是今日起始线索，保留它，试试其他格子。');return}
    cells[index]=cells[index]===1?0:1;moves++;highlight=-1;beep();afterMove();
  }
  function renderBoard(){
    const result=evaluate(cells,current);
    buttons.forEach((button,i)=>{
      const fixed=current.givens?.includes(i);button.querySelector('.symbol').textContent=cells[i]?'★':'';button.querySelector('.region').textContent=fixed?'●':current.rules.includes(REGION)?String.fromCharCode(65+current.regions[i]):'';
      button.classList.toggle('fixed',!!fixed);button.classList.toggle('conflict',result.conflicts.has(i));button.classList.toggle('hinted',i===highlight);
      button.setAttribute('aria-label',`第 ${Math.floor(i/6)+1} 行，第 ${i%6+1} 列，${cells[i]?'星星':'空白'}${current.rules.includes(REGION)?'，区域 '+String.fromCharCode(65+current.regions[i]):''}${fixed?'，固定线索':''}${result.conflicts.has(i)?'，规则冲突':''}`);
      button.setAttribute('aria-pressed',String(cells[i]===1));button.setAttribute('aria-disabled',String(completed||!!fixed));
    });
    $('rules').innerHTML=result.statuses.map(s=>`<li class="${s.error?'error':s.done===s.total?'ok':''}"><span class="dot">${s.error?'!':s.done===s.total?'✓':'·'}</span>${ruleLabels[s.id]}<span class="count">${s.id===TOUCH?(s.error?s.pairs+' 处接触':'无接触'):s.done+' / '+s.total}</span></li>`).join('');
    $('progress').textContent=`${result.stars.length} / 6 颗星`;$('moves').textContent=`${moves} 次操作`;$('hint').disabled=completed;$('completed-next').hidden=!completed;$('completed-next').textContent=nextLabel();return result;
  }
  function afterMove(message){
    const result=renderBoard();
    if(result.won){completed=true;save.completed[current.id]=true;renderBoard();say('全部规则满足，你的答案成立！');$('win-description').textContent=answersFor(current).length>1?'你找到了一种合法答案，每一种正确摆法都算通关。':'你找到了这片星空唯一的排列。';$('win-moves').textContent=moves;$('win-hints').textContent=hints;$('next').textContent=nextLabel();$('win').showModal();beep(true)}
    else say(message||(result.conflicts.size?'红框中的星星违反了当前规则，再点一下即可取消。':'没有冲突，继续寻找下一颗星的位置。'));
    saveSession();
  }
  function nextLabel(){return current?.kind==='daily'?(current.difficulty==='easy'&&current.day===dateKey()?'下一关 · 困难挑战 →':'返回每日挑战 →'):current?.index<levels.length-1?'下一关 →':'旅程完成 · 返回首页 →'}
  function nextLevel(){
    if($('win').open)$('win').close();
    if(current.kind==='daily'){if(current.difficulty==='easy'&&current.day===dateKey())startLevel(dailyLevels(current.day)[1]);else show('daily')}
    else if(current.index<levels.length-1)startLevel(levels[current.index+1]);else show('home');
  }
  $('hint').onclick=()=>{
    if(completed)return;const advice=suggest(cells,current);if(!advice){say('暂时没有可用提示。');return}
    cells[advice.index]=advice.value;highlight=advice.index;moves++;hints++;
    afterMove(advice.kind==='extend'?'沿着你现在的摆法，这里可以再放一颗星。它是一种可行选择。':'当前组合无法补成合法答案。先移除这颗星，换一条思路。');
  };
  $('reset').onclick=()=>$('reset-dialog').showModal();$('cancel-reset').onclick=()=>$('reset-dialog').close();$('confirm-reset').onclick=()=>{$('reset-dialog').close();startLevel(current,true)};
  $('next').onclick=nextLevel;$('completed-next').onclick=nextLevel;$('review').onclick=()=>$('win').close();
  $('brand').onclick=()=>show('home');$('daily-entry').onclick=()=>show('daily');$('daily-back').onclick=()=>show('home');$('game-back').onclick=()=>show(current.kind==='daily'?'daily':'home');
  $('open-settings').onclick=()=>{if(screen!=='settings')settingsReturn=screen;show('settings')};$('settings-back').onclick=()=>show(settingsReturn);
  for(const key of Object.keys(DEFAULT_SETTINGS))$(key+'-setting').onchange=e=>{save.settings[key]=e.target.checked;applySettings();persist();if(key==='sound'&&save.settings.sound)beep()};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&screen==='daily')renderDaily()});
  window.addEventListener('focus',()=>{if(screen==='daily')renderDaily()});
  applySettings();storageNotice();renderHome();
})();
