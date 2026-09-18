/* 数据与规则独立于 DOM；直接打开 index.html 即可运行。 */
(() => {
  'use strict';
  const level = Object.freeze({id:'garden-01',size:6,name:'星光花园',
    rules:['ONE_STAR_PER_ROW','ONE_STAR_PER_COLUMN','ONE_STAR_PER_REGION','NO_TOUCH'],
    regions:[0,0,0,0,0,1,0,2,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,3,2,2,4,4,3,3,2,2,4,5,5,5],
    solution:[0,9,13,23,26,34]});
  const colors=['#e8cfb8','#eadfac','#c5d9bf','#b9d9dc','#cfc8e3','#ebc6cd'];
  const labels=['每行恰好 1 颗星','每列恰好 1 颗星','每个颜色区域恰好 1 颗星','星星不能相邻或斜向接触'];
  function evaluate(cells, data=level) {
    const n=data.size, stars=cells.flatMap((v,i)=>v===1?[i]:[]), conflicts=new Set();
    const groups=[Array.from({length:n},()=>[]),Array.from({length:n},()=>[]),Array.from({length:n},()=>[])];
    stars.forEach(i=>{groups[0][Math.floor(i/n)].push(i);groups[1][i%n].push(i);groups[2][data.regions[i]].push(i)});
    const statuses=groups.map(group=>{group.filter(g=>g.length>1).flat().forEach(i=>conflicts.add(i));return {done:group.filter(g=>g.length===1).length,total:n,error:group.some(g=>g.length>1)}});
    let touching=0;
    stars.forEach((a,k)=>stars.slice(k+1).forEach(b=>{if(Math.abs(Math.floor(a/n)-Math.floor(b/n))<=1&&Math.abs(a%n-b%n)<=1){touching++;conflicts.add(a);conflicts.add(b)}}));
    statuses.push({done:touching===0?1:0,total:1,error:touching>0});
    return {stars,statuses,conflicts,touching,won:stars.length===n&&statuses.every(s=>s.done===s.total&&!s.error)};
  }
  // 便于无浏览器验证纯规则；浏览器内不依赖任何库。
  if(typeof module!=='undefined'&&module.exports)module.exports={level,evaluate};
  if(typeof document==='undefined')return;
  const $=id=>document.getElementById(id);
  let cells=Array(36).fill(0),history=[],mode=1,moves=0,hints=0,highlight=-1,completed=false;
  const buttons=cells.map((_,i)=>{
    const button=document.createElement('button');button.className='cell';button.style.setProperty('--color',colors[level.regions[i]]);
    button.innerHTML=`<span class="region" aria-hidden="true">${String.fromCharCode(65+level.regions[i])}</span><span class="symbol" aria-hidden="true"></span>`;
    button.addEventListener('click',()=>play(i,mode));
    button.addEventListener('contextmenu',e=>{e.preventDefault();play(i,2)});
    button.addEventListener('keydown',e=>{const r=Math.floor(i/6),c=i%6;const next={ArrowLeft:r*6+Math.max(0,c-1),ArrowRight:r*6+Math.min(5,c+1),ArrowUp:Math.max(0,r-1)*6+c,ArrowDown:Math.min(5,r+1)*6+c}[e.key];if(next!==undefined){e.preventDefault();buttons[next].focus()}});
    $('board').appendChild(button);return button;
  });
  function checkpoint(){history.push({cells:[...cells],moves,hints});highlight=-1;completed=false}
  function say(message){$('message').textContent=message}
  function play(i,value){checkpoint();cells[i]=cells[i]===value?0:value;moves++;render();if(!completed)say(evaluate(cells).conflicts.size?'红框中的星星发生冲突，可以再次点击取消。':'已更新棋盘。X 只是你的笔记，不参与规则判定。')}
  function render(){
    const result=evaluate(cells);
    buttons.forEach((button,i)=>{button.dataset.value=cells[i];button.querySelector('.symbol').textContent=['','★','×'][cells[i]];button.classList.toggle('conflict',result.conflicts.has(i));button.classList.toggle('hinted',i===highlight);button.setAttribute('aria-label',`第 ${Math.floor(i/6)+1} 行，第 ${i%6+1} 列，区域 ${String.fromCharCode(65+level.regions[i])}，${['空白','星星','已排除'][cells[i]]}${result.conflicts.has(i)?'，规则冲突':''}`);button.setAttribute('aria-pressed',String(cells[i]!==0))});
    $('rules').innerHTML=result.statuses.map((s,i)=>`<li class="${s.error?'error':s.done===s.total?'ok':''}"><span class="dot">${s.error?'!':s.done===s.total?'✓':'·'}</span>${labels[i]}<span class="count">${i===3?(s.error?result.touching+' 处接触':'无接触'):s.done+' / '+s.total}</span></li>`).join('');
    $('progress').textContent=`已放置 ${result.stars.length} / 6`;$('moves').textContent=`${moves} 次操作`;$('undo').disabled=!history.length;
    if(result.won&&!completed){completed=true;$('win-stats').textContent=`${moves} 次操作 · 使用 ${hints} 次提示`;say('所有规则已满足，星光花园完成！');$('win').showModal()}
  }
  function setMode(value){mode=value;$('star-mode').setAttribute('aria-pressed',String(value===1));$('cross-mode').setAttribute('aria-pressed',String(value===2))}
  $('star-mode').onclick=()=>setMode(1);$('cross-mode').onclick=()=>setMode(2);
  $('undo').onclick=()=>{if(!history.length)return;const previous=history.pop();cells=previous.cells;moves=previous.moves;hints=previous.hints;highlight=-1;completed=evaluate(cells).won;render();say('已撤销上一步。')};
  function reset(){if(cells.some(Boolean)){checkpoint();cells.fill(0);moves=0;hints=0;render();say('棋盘已重置；可以撤销恢复。')}else say('棋盘已经是空的。')}
  $('reset').onclick=reset;
  $('hint').onclick=()=>{
    if(evaluate(cells).won){say('已经完成了，欣赏一下你的星光吧。');return}
    // 本关唯一解已离线枚举确认；一次提示只修正一个格子。
    const wrong=cells.findIndex((v,i)=>v===1&&!level.solution.includes(i));
    const target=wrong>=0?wrong:level.solution.find(i=>cells[i]!==1);
    if(target===undefined)return;
    checkpoint();hints++;moves++;highlight=target;cells[target]=wrong>=0?0:1;
    say(wrong>=0?`已移除第 ${Math.floor(target/6)+1} 行、第 ${target%6+1} 列的错误星星。`:`提示已放星：第 ${Math.floor(target/6)+1} 行、第 ${target%6+1} 列。这是本关唯一解中的位置。`);render();
  };
  $('review').onclick=()=>$('win').close();$('again').onclick=()=>{$('win').close();reset();setMode(1)};
  render();
})();
