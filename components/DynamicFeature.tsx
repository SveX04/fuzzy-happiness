"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Particle = { id: number; x: number; y: number; vx: number; vy: number; size: number; hue: number };
type Todo = { id: number; text: string; done: boolean };
type Stat = { label: string; value: number; target: number; color: string };

export default function DynamicFeature() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [fontSize, setFontSize] = useState(16);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoInput, setTodoInput] = useState("");
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [quote, setQuote] = useState("Stay curious, keep building.");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [ballPos, setBallPos] = useState({ x: 50, y: 50 });
  const [ballDir, setBallDir] = useState({ x: 1, y: 1 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState<Stat[]>([
    { label: "Engagement", value: 0, target: 87, color: "bg-blue-500" },
    { label: "Performance", value: 0, target: 94, color: "bg-emerald-500" },
    { label: "Creativity", value: 0, target: 72, color: "bg-purple-500" },
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [mood, setMood] = useState("😎");
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  const quotes = [
    "Stay curious, keep building.",
    "Code is poetry in logic.",
    "Ship it, then improve it.",
    "The best code is no code.",
    "Break it to fix it.",
    "Simplicity is the ultimate sophistication.",
    "Make it work, make it right, make it fast.",
  ];

  const gameRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const particleId = useRef(0);

  const isDark = theme === "dark";

  const bg = isDark ? "bg-slate-900" : "bg-slate-100";
  const cardBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300";
  const text = isDark ? "text-white" : "text-slate-900";
  const subtext = isDark ? "text-slate-300" : "text-slate-600";

  // Timer
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  // Quote rotation
  useEffect(() => {
    const id = setInterval(() => setQuoteIndex((i) => (i + 1) % quotes.length), 4000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {