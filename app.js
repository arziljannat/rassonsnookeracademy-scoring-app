const state = {
  frame: 1,
  scores: [0, 0],
  players: ["Player 1", "Player 2"],
  turn: 0,
  redsRemaining: 15,
  phase: "red",
  tablePoints: 0,
  break: 0,
  history: [],
  started: false
};

const $ = (id) => document.getElementById(id);

function render() {
  $("player1Name").textContent = state.players[0].toUpperCase();
  $("player2Name").textContent = state.players[1].toUpperCase();
  $("score1").textContent = state.scores[0];
  $("score2").textContent = state.scores[1];
  $("frameNumber").textContent = state.frame;
  $("turnIndicator").textContent = state.players[state.turn].toUpperCase();
  $("tablePoints").textContent = state.tablePoints;
  $("sequenceLabel").textContent =
    state.phase === "red" ? "RED" :
    state.phase === "colour" ? "COLOUR" : "COLOURS ONLY";

  $("playerCard1").classList.toggle("active", state.turn === 0);
  $("playerCard2").classList.toggle("active", state.turn === 1);
  $("turn1").textContent = state.turn === 0 ? "YOUR TURN" : "WAITING";
  $("turn2").textContent = state.turn === 1 ? "YOUR TURN" : "WAITING";

  document.querySelectorAll(".ball").forEach(btn => {
    const ball = btn.dataset.ball;
    let disabled = false;
    if (state.phase === "red") {
      disabled = ball !== "red";
    } else if (state.phase === "colour") {
      disabled = ball === "red";
    } else {
      disabled = ball === "red";
    }
    btn.disabled = disabled;
    btn.style.opacity = disabled ? "0.35" : "1";
  });

  $("breakHistory").innerHTML = state.history.length
    ? state.history.map(item =>
      '<div class="history-item"><span>' + item.player +
      '</span><strong>' + item.points + ' pts</strong></div>').join("")
    : '<div class="subtle">No break recorded yet.</div>';
}

function startFrame() {
  state.players[0] = $("player1Input").value.trim() || "Player 1";
  state.players[1] = $("player2Input").value.trim() || "Player 2";
  state.started = true;
  $("setupCard").classList.add("hidden");
  $("scoreboard").classList.remove("hidden");
  $("tableCard").classList.remove("hidden");
  $("historyCard").classList.remove("hidden");
  $("controls").classList.remove("hidden");
  render();
}

function switchTurn() {
  if (state.tablePoints > 0) {
    state.history.unshift({
      player: state.players[state.turn],
      points: state.tablePoints
    });
    state.break = 0;
  }
  state.tablePoints = 0;
  state.turn = state.turn === 0 ? 1 : 0;
  render();
}

function scoreBall(ball, points) {
  if (state.phase === "red" && ball !== "red") return;
  if (state.phase !== "red" && ball === "red") return;

  state.scores[state.turn] += points;
  state.tablePoints += points;

  if (state.phase === "red" && ball === "red") {
    state.phase = "colour";
    state.redsRemaining -= 1;
  } else if (state.phase === "colour" && state.redsRemaining > 0) {
    state.phase = "red";
  } else if (state.redsRemaining <= 0) {
    state.phase = "colours";
  }
  render();
}

function newFrame() {
  state.frame += 1;
  state.scores = [0, 0];
  state.turn = 0;
  state.redsRemaining = 15;
  state.phase = "red";
  state.tablePoints = 0;
  state.break = 0;
  state.history = [];
  render();
}

function resetMatch() {
  state.frame = 1;
  state.scores = [0, 0];
  state.turn = 0;
  state.redsRemaining = 15;
  state.phase = "red";
  state.tablePoints = 0;
  state.break = 0;
  state.history = [];
  state.started = false;
  $("setupCard").classList.remove("hidden");
  $("scoreboard").classList.add("hidden");
  $("tableCard").classList.add("hidden");
  $("historyCard").classList.add("hidden");
  $("controls").classList.add("hidden");
}

document.addEventListener("click", (event) => {
  const ball = event.target.closest(".ball");
  if (ball && !ball.disabled) {
    scoreBall(ball.dataset.ball, Number(ball.dataset.points));
    return;
  }

  if (event.target.id === "startBtn") startFrame();
  if (event.target.id === "missBtn") switchTurn();
  if (event.target.id === "undoBtn") {
    // Simple safe undo: reload current browser session state from history is intentionally
    // deferred until the full event log is added in the next professional rules pass.
    alert("UNDO will be connected to the full event log in the next rules-engine update.");
  }
  if (event.target.id === "newFrameBtn") newFrame();
  if (event.target.id === "resetMatchBtn") resetMatch();
  if (event.target.id === "foulBtn") $("foulModal").classList.remove("hidden");
  if (event.target.id === "cancelFoul") $("foulModal").classList.add("hidden");

  const foul = event.target.closest("[data-foul]");
  if (foul) {
    const points = Number(foul.dataset.foul);
    state.scores[state.turn === 0 ? 1 : 0] += points;
    $("foulModal").classList.add("hidden");
    switchTurn();
  }
});

render();