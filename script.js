// ===== CONFIG =====
let selectedAnswer = null;
let currentInterval = null;
let score = 0;

// ===== AUDIO =====
const synth = new Tone.Synth().toDestination();

// ===== INTERVALOS (ajuste conforme seu original se tiver mais) =====
const intervals = [
  { name: "Uníssono", value: 0 },
  { name: "Segunda menor", value: 1 },
  { name: "Segunda maior", value: 2 },
  { name: "Terça menor", value: 3 },
  { name: "Terça maior", value: 4 },
  { name: "Quarta justa", value: 5 },
  { name: "Quinta justa", value: 7 },
  { name: "Sexta maior", value: 9 },
  { name: "Sétima maior", value: 11 },
  { name: "Oitava", value: 12 }
];

// ===== GERAR EXERCÍCIO =====
function nextExercise() {
  selectedAnswer = null;
  document.getElementById("feedback").innerText = "";

  currentInterval = intervals[Math.floor(Math.random() * intervals.length)];

  document.getElementById("question").innerText = "Ouça e identifique o intervalo";

  renderAnswers();
}

// ===== TOCAR INTERVALO =====
function playInterval() {
  if (!currentInterval) return;

  const root = "C4";
  const note = Tone.Frequency(root).transpose(currentInterval.value).toNote();

  synth.triggerAttackRelease(root, "8n");
  setTimeout(() => {
    synth.triggerAttackRelease(note, "8n");
  }, 300);
}

// ===== RENDER RESPOSTAS =====
function renderAnswers() {
  const container = document.getElementById("answers");
  container.innerHTML = "";

  intervals.forEach((interval) => {
    const div = document.createElement("div");
    div.className = "answer";
    div.innerText = interval.name;

    div.onclick = () => {
      selectedAnswer = interval.value;

      document.querySelectorAll(".answer").forEach(el => el.classList.remove("selected"));
      div.classList.add("selected");
    };

    container.appendChild(div);
  });
}

// ===== CONFIRMAR RESPOSTA =====
function confirmAnswer() {
  if (selectedAnswer === null) return;

  const feedback = document.getElementById("feedback");

  if (selectedAnswer === currentInterval.value) {
    score++;

    feedback.innerText = `✓ Excelente! Acertos seguidos: ${score}`;
    feedback.className = "correct";

    // SOM DE ACERTO
    synth.triggerAttackRelease("C5", "8n");
    setTimeout(() => synth.triggerAttackRelease("E5", "8n"), 120);

  } else {
    score = 0;

    feedback.innerText = "✕ Errou... sequência reiniciada.";
    feedback.className = "incorrect";

    // SOM DE ERRO
    synth.triggerAttackRelease("C3", "8n");
  }
}

// ===== PAD (opcional simples) =====
let padOn = false;
let pad;

function togglePad() {
  if (!padOn) {
    pad = new Tone.Synth().toDestination();
    pad.triggerAttack("C3");
    padOn = true;
  } else {
    pad.triggerRelease();
    padOn = false;
  }
}

// ===== INICIAR =====
nextExercise();
