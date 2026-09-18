const assert = require('node:assert/strict');
const g = require('../WebDemo/game.js');
const board = stars => { const cells=Array(36).fill(0); stars.forEach(i=>cells[i]=1); return cells; };
const expected=[720,90,3,2,1];
const all=[];
function permute(p){if(p.length===6){all.push(p.map((c,r)=>r*6+c));return}for(let c=0;c<6;c++)if(!p.includes(c))permute([...p,c])}permute([]);
for(const [index,level] of g.levels.entries()){
  const answers=g.answersFor(level);
  assert.equal(answers.length,expected[index]);
  assert.equal(all.filter(a=>g.evaluate(board(a),level).won).length,expected[index]);
  assert.equal(g.evaluate(board([]),level).won,false);
  for(const answer of answers){
    assert.equal(g.evaluate(board(answer),level).won,true);
    for(let length=0;length<6;length++){
      const cells=board(answer.slice(0,length)),copy=[...cells],hint=g.suggest(cells,level);
      assert.deepEqual(cells,copy);assert.equal(hint.kind,'extend');
      cells[hint.index]=hint.value;
      assert.ok(answers.some(a=>cells.every((v,i)=>v!==1||a.includes(i))));
    }
  }
}
for(const pair of [[0,1],[0,6],[0,7],[7,2],[7,12],[7,14]])assert.ok(g.evaluate(board(pair),g.levels[1]).conflicts.size);
assert.equal(g.evaluate(board([5,6]),g.levels[1]).statuses.find(s=>s.id==='NO_TOUCH').error,false);
const filled=Array(36).fill(1);
for(let attempts=0;attempts<60&&!g.evaluate(filled,g.levels[4]).won;attempts++){const hint=g.suggest(filled,g.levels[4]);assert.ok(hint);filled[hint.index]=hint.value}
assert.equal(g.evaluate(filled,g.levels[4]).won,true);
assert.equal(g.dateKey(new Date('2026-09-18T15:59:59Z')),'2026-09-18');
assert.equal(g.dateKey(new Date('2026-09-18T16:00:00Z')),'2026-09-19');
function connected(regions){for(let r=0;r<6;r++){const cells=new Set(regions.flatMap((v,i)=>v===r?[i]:[])),first=cells.values().next().value,seen=new Set([first]),todo=[first];while(todo.length){const i=todo.pop();for(const j of [i-6,i+6,...(i%6?[i-1]:[]),...(i%6<5?[i+1]:[])])if(cells.has(j)&&!seen.has(j)){seen.add(j);todo.push(j)}}assert.ok(cells.size>=3);assert.equal(seen.size,cells.size)}}
const dailyResults=[];
for(let i=0;i<31;i++){
  const day=new Date(Date.UTC(2026,8,18+i)).toISOString().slice(0,10),daily=g.dailyLevels(day),[easy,hard]=daily;
  assert.ok(g.answersFor(easy).length>1);assert.equal(g.answersFor(hard).length,1);connected(hard.regions);
  for(const level of daily){
    const cells=board(level.givens||[]);
    for(let k=0;k<6&&!g.evaluate(cells,level).won;k++){const hint=g.suggest(cells,level);assert.ok(hint);cells[hint.index]=hint.value}
    assert.equal(g.evaluate(cells,level).won,true);
  }
  dailyResults.push({day,regions:hard.regions,givens:easy.givens,source:hard.source});
}
const again=g.dailyLevels('2026-09-18');assert.deepEqual(again[1].regions,dailyResults[0].regions);assert.deepEqual(again[0].givens,dailyResults[0].givens);
assert.ok(new Set(dailyResults.map(d=>JSON.stringify(d.regions))).size>20);
const valid=board([0]);
assert.deepEqual(g.cleanSave({version:1}).settings,{sound:false,motion:true,letters:true});
const clean=g.cleanSave({version:2,settings:{sound:true,letters:'false'},sessions:{'path-01':{cells:valid,moves:1,hints:0},'path-02':{cells:[9],moves:1,hints:0}},completed:{'path-01':true,garbage:true}});
assert.equal(clean.settings.sound,true);assert.equal(clean.settings.letters,true);assert.equal(Object.keys(clean.sessions).length,1);assert.equal(Object.keys(clean.completed).length,1);
console.log(JSON.stringify({status:'PASS',normalSolutionCounts:expected,dailyDates:dailyResults.length,uniqueDailyBoards:new Set(dailyResults.map(d=>JSON.stringify(d.regions))).size,fallbacks:dailyResults.filter(d=>d.source==='fallback').length,checks:'all answers, alternative-path hints, conflicts, convergence, date rollover, connected regions, save validation'}));
