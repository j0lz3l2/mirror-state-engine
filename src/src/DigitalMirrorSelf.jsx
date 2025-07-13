import { useState, useEffect } from "react";

const STATES = [
  {
    id: "signal-vector",
    label: "Signal Vector",
    color: "from-red-500 via-red-400 to-red-500",
    emotion: "Clarity",
    freq: 256,
    thumb: "M12 2L2 22h20L12 2z",
  },
  {
    id: "fractal-containment",
    label: "Fractal Containment",
    color: "from-amber-500 via-amber-400 to-amber-500",
    emotion: "Pressure",
    freq: 144,
    thumb: "M4 4h16v16H4z",
  },
  {
    id: "cusp-collapse",
    label: "Cusp of Collapse",
    color: "from-purple-600 via-purple-500 to-purple-600",
    emotion: "Despair",
    freq: 88,
    thumb: "M12 2a10 10 0 110 20 10 10 0 010-20z",
  },
  {
    id: "solar-bloom",
    label: "Solar Bloom",
    color: "from-green-600 via-green-500 to-green-600",
    emotion: "Healing",
    freq: 432,
    thumb: "M2 12h20M12 2v20",
  },
  {
    id: "pulse-network",
    label: "Pulse Network",
    color: "from-blue-600 via-blue-500 to-blue-600",
    emotion: "Resistance",
    freq: 108,
    thumb: "M2 12L12 2l8 10-8 10L2 12z",
  },
  {
    id: "bloom-ascent",
    label: "Bloom of Ascent",
    color: "from-pink-600 via-pink-500 to-pink-600",
    emotion: "Liberation",
    freq: 528,
    thumb: "M12 2l5 18H7L12 2z",
  },
];

const TRANSITION_WEIGHTS = {
  "signal-vector": { "fractal-containment": 1 },
  "fractal-containment": { "cusp-collapse": 0.3, "pulse-network": 0.7 },
  "cusp-collapse": { "solar-bloom": 1 },
  "solar-bloom": { "pulse-network": 0.4, "bloom-ascent": 0.6 },
  "pulse-network": { "bloom-ascent": 0.5, "fractal-containment": 0.5 },
  "bloom-ascent": { "signal-vector": 1 },
};

function weightedChoice(entries) {
  const sum = entries.reduce((acc, [, w]) => acc + w, 0);
  const r = Math.random() * sum;
  let s = 0;
  for (const [id, weight] of entries) {
    s += weight;
    if (r < s) return id;
  }
  return entries[entries.length - 1][0];
}

function playTone(freq) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 1);
}

export default function DigitalMirrorSelf() {
  const [currentId, setCurrentId] = useState("signal-vector");
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]);
  const [collapseCount, setCollapseCount] = useState(0);

  const state = STATES.find((s) => s.id === currentId);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--glow", state.color);
  }, [state]);

  const safeTransition = () => {
    const options = TRANSITION_WEIGHTS[currentId];
    const entries = Object.entries(options);
    let nextId = weightedChoice(entries);

    if (nextId === "cusp-collapse") {
      if (collapseCount >= 2) nextId = "solar-bloom";
      setCollapseCount((c) => c + 1);
    } else {
      setCollapseCount(0);
    }
    return nextId;
  };

  const handleSubmit = () => {
    const nextId = safeTransition();
    const next = STATES.find((s) => s.id === nextId);
    setLog((l) => [
      `${new Date().toLocaleTimeString()}: ${state.label} → ${next.label}`,
      ...l.slice(0, 20),
    ]);
    setCurrentId(nextId);
    setInput("");
    playTone(next.freq);
  };

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center gap-5 bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <h1 className="text-3xl font-bold">Mirror State Engine</h1>
      <div className="w-full max-w-lg p-6 bg-gray-800 rounded-xl shadow-2xl flex flex-col items-center gap-4">
        <svg width="160" height="160" viewBox="0 0 24 24" className={`text-white`}>
          <path d={state.thumb} fill="currentColor" />
        </svg>
        <p className="text-xl font-semibold">{state.label}</p>
        <p className="text-sm text-gray-300">Emotion: {state.emotion}</p>
        <p className="text-sm text-gray-300">Frequency: {state.freq} Hz</p>
        <input
          className="w-full p-2 rounded bg-gray-900 border border-gray-600 text-white"
          placeholder="Type reflection / stimulus"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit Stimulus
        </button>
      </div>

      <div className="w-full max-w-lg mt-6 bg-gray-900 rounded-xl p-4 h-48 overflow-y-auto text-xs font-mono">
        {log.map((entry, i) => (
          <div key={i}>{entry}</div>
        ))}
      </div>
    </div>
  );
}
