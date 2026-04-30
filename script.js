let pad = null;
let tonicMidi;
let currentInterval;
let selectedAnswer = null;

const BASE_MIDI = 60;

// 🔥 LISTA COMPLETA DE INTERVALOS
const intervals = [
  { name: "segunda menor", value: 1 },
  { name: "segunda maior", value: 2 },
  { name: "terça menor", value: 3 },
  { name: "terça maior", value: 4 },
  { name: "quarta justa", value: 5 },
  { name: "quarta aumentada", value: 6 },
  { name: "quinta justa", value: 7 },
  { name: "sexta menor", value: 8 },
  { name: "sexta maior", value: 9 },
  { name: "sétima menor", value: 10 },
  { name: "sétima maior", value: 11 },
  { name: "oitava", value: 12 }
];

// ===== UTIL =====
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ===== PAD =====
function startPad() {
  stopPad();

  pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" }
  }).toDestination();

  pad.triggerAttack([
    Tone.Frequency(tonicMidi, "midi"),
    Tone.Frequency(tonicMidi + 7, "midi")
  ]);
}

function stopPad() {
  if (pad) {
    pad.releaseAll();
    pad.dispose();
    pad = null;
  }
}

function togglePad() {
  pad ? stopPad() : startPad();
}

// ===== PLAY INTERVALO =====
function playInterval() {
  const synth = new Tone.Synth({
    oscillator: { type: "triangle" }
  }).toDestination();

  synth.triggerAttackRelease(
    Tone.Frequency(tonicMidi + currentInterval.value, "midi"),
    "1n"
  );
}

// ===== TOCAR RESPOSTA =====
function playAnswer(semitones) {
  const synth = new Tone.Synth({
    oscillator: { type: "triangle" }
  }).toDestination();

  synth.triggerAttackRelease(
    Tone.Frequency(tonicMidi + semitones, "midi"),
    "1n"
  );
}

// ===== ANSWERS =====
function createAnswers() {
  const container = document.getElementById("answers");
  container.innerHTML = "";

  let options = [...Array(12).keys()].map(n => n + 1);
  shuffle(options);

  options.forEach(semi => {
    const div = document.createElement("div");
    div.className = "answer";

    div.onclick = () => {
      playAnswer(semi);        // 🔊 TOCA A NOTA
      selectAnswer(div, semi); // seleciona
    };

    container.appendChild(div);
  });
}

function selectAnswer(el, value) {
  document
    .querySelectorAll(".answer")
    .forEach(a => a.classList.remove("selected"));

  el.classList.add("selected");
  selectedAnswer = value;
}

// ===== CONFIRM =====
function confirmAnswer() {
  if (!selectedAnswer) return;

  const feedback = document.getElementById("feedback");

  feedback.innerText =
    selectedAnswer === currentInterval.value
      ? "Correto!"
      : "Não é esse.";
}

// ===== NEXT =====
function nextExercise() {
  stopPad();
  selectedAnswer = null;
  document.getElementById("feedback").innerText = "";

  tonicMidi = BASE_MIDI + Math.floor(Math.random() * 12);
  currentInterval = intervals[Math.floor(Math.random() * intervals.length)];

  document.getElementById("question").innerText =
    `Ache a ${currentInterval.name}`;

  createAnswers();
}

// START
nextExercise();