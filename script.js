let pad = null;
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

// ===== INTERVALOS =====
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
};

// ===== UTIL =====
function rand(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ===== NÍVEL =====
function setLevel(l) {
  level = l;

  document.getElementById("btn-easy").classList.remove("active");
  document.getElementById("btn-medium").classList.remove("active");
  document.getElementById("btn-hard").classList.remove("active");

  document.getElementById("btn-" + l).classList.add("active");

  nextExercise();
}

// ===== PAD MELHORADO (WORSHIP) =====
async function startPad() {
  await Tone.start();
  stopPad();

  const reverb = new Tone.Reverb({
    decay: 6,
    wet: 0.5
  }).toDestination();

  const chorus = new Tone.Chorus(2, 2.5, 0.3).start();

  pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "sine"
    },
    envelope: {
      attack: 1.5,
      decay: 0.3,
      sustain: 0.9,
      release: 3
    }
  });

  pad.chain(chorus, reverb);

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
  if (mode !== "interval") return;
  pad ? stopPad() : startPad();
}

// ===== OUVIR (MELODIA MELHORADA) =====
async function playListen() {
  await Tone.start();

  const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.5,
      release: 1
    }
  }).toDestination();

  if (mode === "interval") {
    synth.triggerAttackRelease(
      Tone.Frequency(tonicMidi + currentInterval.value, "midi"),
      "8n"
    );
  } else {
    sequence.forEach((note, i) => {
      setTimeout(() => {
        synth.triggerAttackRelease(
          Tone.Frequency(note, "midi"),
          "8n"
        );
      }, i * 350);
    });
  }
}

// ===== RESPOSTA (SOM MAIS LIMPO) =====
async function playAnswer(semi) {
  await Tone.start();

  const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.3,
      release: 0.8
    }
  }).toDestination();

  synth.triggerAttackRelease(
    Tone.Frequency(tonicMidi + semi, "midi"),
    "8n"
  );
}

// ===== RESPOSTAS =====
function createAnswers() {
  const container = document.getElementById("answers");
  container.innerHTML = "";

  let options = new Set();

  const correct =
    mode === "interval"
      ? currentInterval.value
      : targetNote;

  options.add(correct);

  for (let i = -3; i <= 3; i++) {
    options.add(correct + i);
  }

  while (options.size < 12) {
    options.add(rand(24) - 6);
  }

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

// ===== SONS =====
function playCorrectSound() {
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease("C5", "8n");
  setTimeout(() => synth.triggerAttackRelease("E5", "8n"), 120);
}

function playErrorSound() {
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease("C3", "8n");
}

// ===== CONFIRM =====
async function confirmAnswer() {
  if (selectedAnswer === null || answered) return;

  await Tone.start();
  answered = true;

  const feedback = document.getElementById("feedback");

  const correct =
    mode === "interval"
      ? currentInterval.value
      : targetNote;

  const isCorrect =
    (selectedAnswer % 12) === (correct % 12);

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

// ===== NEXT =====
function nextExercise() {
  stopPad();
  selectedAnswer = null;
  answered = false;

  document.getElementById("feedback").innerText = "";

  tonicMidi = BASE_MIDI + rand(12);

  const padBtn = document.getElementById("padBtn");

  if (level === "easy") {
    mode = "interval";

    const pool = intervals.filter(i =>
      [3, 4, 7, 12].includes(i.value)
    );

    currentInterval = pool[rand(pool.length)];

    padBtn.style.display = "block";

    document.getElementById("question").innerText =
      `Ache a ${currentInterval.name}`;
  }

  else if (level === "medium") {
    mode = Math.random() > 0.5 ? "interval" : "melody";

    if (mode === "interval") {
      currentInterval = intervals[rand(intervals.length)];
      padBtn.style.display = "block";

      document.getElementById("question").innerText =
        `Ache a ${currentInterval.name}`;
    } else {
      padBtn.style.display = "none";

      const size = [3, 4][rand(2)];
      sequence = [];

      for (let i = 0; i < size; i++) {
        sequence.push(tonicMidi + rand(18));
      }

      const pos = rand(size);
      targetNote = sequence[pos] - tonicMidi;

      const nomes = ["PRIMEIRA", "SEGUNDA", "TERCEIRA", "ÚLTIMA"];

      let textoPos = pos === size - 1 ? "ÚLTIMA" : nomes[pos];

      document.getElementById("question").innerText =
        `Ouça ${size} notas — qual é a ${textoPos}?`;
    }
  }

  else if (level === "hard") {
    mode = "melody";

    padBtn.style.display = "none";

    const size = [4, 5][rand(2)];
    sequence = [];

    for (let i = 0; i < size; i++) {
      sequence.push(tonicMidi + rand(24));
    }

    const pos = rand(size);
    targetNote = sequence[pos] - tonicMidi;

    const nomes = ["PRIMEIRA", "SEGUNDA", "TERCEIRA", "QUARTA", "ÚLTIMA"];

    let textoPos = pos === size - 1 ? "ÚLTIMA" : nomes[pos];

    document.getElementById("question").innerText =
      `Ouça ${size} notas — qual é a ${textoPos}?`;
  }

  createAnswers();
}

// START
setLevel("easy");
