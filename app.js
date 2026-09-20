const state = {
  frame: 1, scores: [0, 0], players: ["Player 1", "Player 2"], turn: 0,
  redsRemaining: 15, phase: "red", colourIndex: 0, tablePoints: 0,
  history: [], events: [], started: false
};
const COLOURS = [
  { ball: "yellow", points: 2 }, { ball: "green", points: 3 }, { ball: "brown", points: 4 },
  { ball: "blue", points: 5 }, { ball: "pink", points: 6 }, { ball: "black", points: 7 }
];
const $ = id => document.getElementById(id);
function snapshot(){return JSON.parse(JSON.stringify({scores:state.scores,turn:state.turn,redsRemaining:state.redsRemaining,phase:state.phase,colourIndex:state.colourIndex,tablePoints:state.tablePoints,history:state.history}));}
function saveEvent(label){state.events.push({label,before:snapshot()});}
function finishTurn(){if(state.tablePoints>0)state.history.unshift({player:state.players[state.turn],points:state.tablePoints});state.tablePoints=0;state.turn=state.turn===0?1:0;}
function render(){
  $("player1Name").textContent=state.players[0].toUpperCase();$("player2Name").textContent=state.players[1].toUpperCase();
  $("score1").textContent=state.scores[0];$("score2").textContent=state.scores[1];$("frameNumber").textContent=state.frame;
  $("turnIndicator").textContent=state.players[state.turn].toUpperCase();$("tablePoints").textContent=state.tablePoints;
  $("sequenceLabel").textContent=state.phase==="red"?"RED":state.phase==="colour"?"COLOUR":`COLOURS ONLY: ${COLOURS[state.colourIndex]?.ball?.toUpperCase()||"COMPLETE"}`;
  $("playerCard1").classList.toggle("active",state.turn===0);$("playerCard2").classList.toggle("active",state.turn===1);
  $("turn1").textContent=state.turn===0?"YOUR TURN":"WAITING";$("turn2").textContent=state.turn===1?"YOUR TURN":"WAITING";
  $("turnBadge1").textContent=state.turn===0?"AT TABLE":"WAITING";$("turnBadge2").textContent=state.turn===1?"AT TABLE":"WAITING";
  $("turnBadge1").classList.toggle("waiting",state.turn!==0);$("turnBadge2").classList.toggle("waiting",state.turn!==1);
  [1,2].forEach((n,i)=>{const s=state.scores[i];const score=$("score"+n);if(score)score.textContent=s;const p=$("points"+n);if(p)p.textContent=s;});
  document.querySelectorAll(".ball").forEach(btn=>{const ball=btn.dataset.ball;let allowed=false;if(state.phase==="red")allowed=ball==="red";if(state.phase==="colour")allowed=ball!=="red";if(state.phase==="colours")allowed=ball===COLOURS[state.colourIndex]?.ball;btn.disabled=!allowed;btn.style.opacity=allowed?"1":".35";});
  $("breakHistory").innerHTML=state.history.length?state.history.map(x=>`<div class="history-item"><span>${x.player}</span><strong>${x.points} pts</strong></div>`).join(""): '<div class="subtle">No break recorded yet.</div>';
}
function startFrame(){state.players[0]=$("player1Input").value.trim()||"Player 1";state.players[1]=$("player2Input").value.trim()||"Player 2";state.started=true;["scoreboard","tableCard","historyCard","controls"].forEach(id=>$(id).classList.remove("hidden"));$("setupCard").classList.add("hidden");render();}
function scoreBall(ball,points){const valid=(state.phase==="red"&&ball==="red")||(state.phase==="colour"&&ball!=="red")||(state.phase==="colours"&&ball===COLOURS[state.colourIndex]?.ball);if(!valid)return;saveEvent(`Scored ${points}`);state.scores[state.turn]+=points;state.tablePoints+=points;if(state.phase==="red"){state.redsRemaining--;state.phase="colour";}else if(state.phase==="colour"){state.phase=state.redsRemaining>0?"red":"colours";if(state.phase==="colours")state.colourIndex=0;}else if(state.phase==="colours"){state.colourIndex++;if(state.colourIndex>=COLOURS.length)state.phase="complete";}render();}
function quickScore(points){saveEvent(`Quick score ${points}`);state.scores[state.turn]+=points;state.tablePoints+=points;render();}
function switchTurn(){saveEvent("End turn");finishTurn();render();}
function applyFoul(points){saveEvent(`Foul ${points}`);state.scores[state.turn===0?1:0]+=points;finishTurn();$("foulModal").classList.add("hidden");render();}
function undo(){const event=state.events.pop();if(!event)return alert("Nothing to undo.");Object.assign(state,event.before);render();}
function newFrame(){state.frame++;state.scores=[0,0];state.turn=0;state.redsRemaining=15;state.phase="red";state.colourIndex=0;state.tablePoints=0;state.history=[];state.events=[];render();}
function resetMatch(){state.frame=1;state.scores=[0,0];state.turn=0;state.redsRemaining=15;state.phase="red";state.colourIndex=0;state.tablePoints=0;state.history=[];state.events=[];state.started=false;$("setupCard").classList.remove("hidden");["scoreboard","tableCard","historyCard","controls"].forEach(id=>$(id).classList.add("hidden"));render();}
document.addEventListener("click",event=>{
  const ball=event.target.closest(".ball");if(ball&&!ball.disabled)return scoreBall(ball.dataset.ball,Number(ball.dataset.points));
  const quick=event.target.closest("[data-quick-score]");if(quick)return quickScore(Number(quick.dataset.quickScore));
  if(["startBtn"].includes(event.target.id))startFrame();
  if(["missBtn","endFrameBtn","nextTurnBtn"].includes(event.target.id))switchTurn();
  if(["undoBtn","undoBtn1","undoBtn2"].includes(event.target.id))undo();
  if(event.target.id==="newFrameBtn")newFrame();if(["resetMatchBtn","resetCenterBtn"].includes(event.target.id))resetMatch();
  if(["foulBtn","foulBtn1","foulBtn2"].includes(event.target.id))$("foulModal").classList.remove("hidden");
  if(event.target.id==="cancelFoul")$("foulModal").classList.add("hidden");
  const foul=event.target.closest("[data-foul]");if(foul)applyFoul(Number(foul.dataset.foul));
});
render();