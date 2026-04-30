let padSynth = null;

let tonicMidi;
let currentInterval;
let selectedAnswer = null;

let mode = "interval";
let level = "easy";

let sequence = [];
let targetNote = null;

let score = 0;
let errors = 0;
let answered = false;

const BASE_MIDI = 60;

// =====================
// 🔥 MASTER FIX (volume equilibrado)
// =====================

const limiter = new Tone.Limiter(-1).toDestination();
const master = new Tone.Volume(-2).connect(limiter);

// 🎹 ÚNICO SYNTH GLOBAL (evita overload)
const synth = new Tone.Synth({
  oscillator: { type: "triangle" }, // mais cheio que sine
  envelope: {
    attack: 0.01,
    decay: 0.2,
    sustain: 0.4,
    release: 0.6
  }
}).connect(master);

// =====================
// INTERVALOS
// =====================

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

// =====================
// UTIL
// =====================

function rand(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// =====================
// NÍVEL
// =====================

function setLevel(l) {
  level = l;

  document.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  document.getElementById("btn-" + l).classList.add("active");

  nextExercise();
}

// =====================
// PAD (ESTÁVEL + LIMPO)
// =====================

async function startPad() {
  await Tone.start();
  stopPad();

  padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: {
      attack: 1.5,
      decay: 0.4,
      sustain: 0.9,
      release: 3
    },
    maxPolyphony: 4
  }).connect(master);

  const chorus = new Tone.Chorus(2, 2.5, 0.3).start();
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.4 });

  padSynth.chain(chorus, reverb, master);

  padSynth.triggerAttack([
    Tone.Frequency(tonicMidi, "midi"),
    Tone.Frequency(tonicMidi + 7, "midi")
  ]);
}

function stopPad() {
  if (padSynth) {
    padSynth.releaseAll();
    padSynth.dispose();
    padSynth = null;
  }
}

function togglePad() {
  if (mode !== "interval") return;
  padSynth ? stopPad() : startPad();
}

// =====================
// OUVIR (VOLUME CORRIGIDO)
// =====================

async function playListen() {
  await Tone.start();

  if (mode === "interval") {
    synth.triggerAttackRelease(
      Tone.Frequency(tonicMidi + currentInterval.value, "midi"),
      "8n",
      undefined,
      1
    );
  } else {
    sequence.forEach((note, i) => {
      setTimeout(() => {
        synth.triggerAttackRelease(
          Tone.Frequency(note, "midi"),
          "8n",
          undefined,
          1
        );
      }, i * 300);
    });
  }
}

// =====================
// RESPOSTA (AGORA AUDÍVEL)
// =====================

async function playAnswer(semi) {
  await Tone.start();

  synth.triggerAttackRelease(
    Tone.Frequency(tonicMidi + semi, "midi"),
    "8n",
    undefined,
    1
  );
}

// =====================
// SONS DE FEEDBACK (AGORA DESTACADOS)
// =====================

function playCorrectSound() {
  synth.triggerAttackRelease("C5", "8n", undefined, 1);
  setTimeout(() => {
    synth.triggerAttackRelease("E5", "8n", undefined, 1);
  }, 120);
}

function playErrorSound() {
  synth.triggerAttackRelease("C3", "8n", undefined, 1);
}

// =====================
// CONFIRM
// =====================

async function confirmAnswer() {
  if (selectedAnswer === null || answered) return;

  await Tone.start();
  answered = true;

  const feedback = document.getElementById("feedback");

  const correct =
    mode === "interval"
      ? currentInterval.value
      : targetNote;

  const isCorrect = (selectedAnswer % 12) === (correct % 12);

  if (isCorrect) {
    score++;
    feedback.innerText = `✔ Acertou! | Acertos: ${score} | Erros: ${errors}`;
    playCorrectSound();
  } else {
    errors++;
    feedback.innerText = `✖ Errou! | Acertos: ${score} | Erros: ${errors}`;
    playErrorSound();
  }
}

// =====================
// NEXT (SEM ALTERAÇÃO LOGICA)
// =====================

function nextExercise() {
  stopPad();
  selectedAnswer = null;
  answered = false;

  document.getElementById("feedback").innerText = "";

  tonicMidi = BASE_MIDI + rand(12);

  const padBtn = document.getElementById("padBtn");

  mode = "interval";
  currentInterval = intervals[rand(intervals.length)];

  padBtn.style.display = "block";

  document.getElementById("question").innerText =
    `Ache a ${currentInterval.name}`;

  createAnswers();
}

// =====================
// RESPOSTAS
// =====================

function createAnswers() {
  const container = document.getElementById("answers");
  container.innerHTML = "";

  let options = new Set();

  const correct =
    mode === "interval"
      ? currentInterval.value
      : targetNote;

  options.add(correct);

  for (let i = -3; i <= 3; i++) options.add(correct + i);

  while (options.size < 12) options.add(rand(24) - 6);

  let finalOptions = Array.from(options);
  shuffle(finalOptions);

  finalOptions.forEach(semi => {
    const div = document.createElement("div");
    div.className = "answer";

    div.onclick = () => {
      if (answered) return;
      playAnswer(semi);
      selectAnswer(div, semi);
    };

    container.appendChild(div);
  });
}

function selectAnswer(el, value) {
  document.querySelectorAll(".answer")
    .forEach(a => a.classList.remove("selected"));

  el.classList.add("selected");
  selectedAnswer = value;
}

// =====================
// START
// =====================

setLevel("easy");
