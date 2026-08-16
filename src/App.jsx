import { useState, useEffect, useRef } from "react";
import {
  MapPin, DollarSign, Clock, Smartphone, Sparkles, CheckCircle2, Circle,
  TrendingUp, ArrowRight, Plus, Wrench, Car, Wifi, Laptop, Target, Flame,
  ChevronRight, ThumbsUp, ThumbsDown, Rocket, CalendarClock, Hammer, Store,
} from "lucide-react";

import PowerButton from "./components/PowerButton.jsx";
import ChargeRing from "./components/ChargeRing.jsx";
import TopBar from "./components/TopBar.jsx";
import BottomNav from "./components/BottomNav.jsx";
import DifficultyBadge from "./components/DifficultyBadge.jsx";
import TemplateCard from "./components/TemplateCard.jsx";
import { SectionLabel, StatCard, EmptyNote } from "./components/Misc.jsx";

import { generatePlan, generateActionPlan, generateMarketingCopy, generateBusinessStarter } from "./lib/api.js";
import { getState, setState as persistState } from "./lib/storage.js";

const EQUIPMENT_OPTIONS = [
  { key: "Phone", icon: Smartphone },
  { key: "Laptop", icon: Laptop },
  { key: "Internet", icon: Wifi },
  { key: "Car / bike", icon: Car },
  { key: "Tools / equipment", icon: Wrench },
];

const STEPS = [
  { key: "country", label: "Where are you based?", sub: "Opportunities differ by country.", type: "text", icon: MapPin, placeholder: "e.g. Zambia" },
  { key: "goalAmount", label: "How much do you want to make?", sub: "A real number helps us aim right.", type: "text", icon: DollarSign, placeholder: "e.g. $50 or K500" },
  { key: "timeframe", label: "How soon do you need it?", sub: "Be honest — this changes the plan.", type: "select", icon: Clock, options: ["Today", "This week", "This month", "No rush — building long-term"] },
  { key: "skills", label: "What skills do you have?", sub: "Even small ones count.", type: "text", icon: Sparkles, placeholder: "e.g. writing, design, coding, sales, fixing things" },
  { key: "equipment", label: "What do you have access to?", sub: "Pick everything that applies.", type: "multiselect", icon: Smartphone },
  { key: "hours", label: "How many hours can you give?", sub: "We'll size the plan to fit your day.", type: "select", icon: Clock, options: ["Under 1 hr/day", "1–3 hrs/day", "3–6 hrs/day", "Full-time"] },
];

const EMPTY_ANSWERS = { country: "", goalAmount: "", timeframe: "", skills: "", equipment: [], hours: "" };
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [pressed, setPressed] = useState(false);
  const [chargePercent, setChargePercent] = useState(0);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [earnInput, setEarnInput] = useState({ amount: "", note: "" });
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [error, setError] = useState(null);

  // Action Mode + success tracking
  const [startedOpportunities, setStartedOpportunities] = useState([]);
  const [actionPlans, setActionPlans] = useState({});
  const [activeOppIndex, setActiveOppIndex] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [reflections, setReflections] = useState([]);
  const [reflectionInput, setReflectionInput] = useState({ type: "worked", text: "" });

  // Build It / Marketing Copy
  const [marketingCopyMap, setMarketingCopyMap] = useState({});
  const [activeMarketingIndex, setActiveMarketingIndex] = useState(null);
  const [marketingError, setMarketingError] = useState(null);

  // Business Starter
  const [businessStarterMap, setBusinessStarterMap] = useState({});
  const [activeBusinessIndex, setActiveBusinessIndex] = useState(null);
  const [businessError, setBusinessError] = useState(null);

  const chargeTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const saved = await getState();
      if (!saved) return;
      if (saved.plan) setPlan(saved.plan);
      if (saved.tasks) setTasks(saved.tasks);
      if (saved.earnings) setEarnings(saved.earnings);
      if (saved.answers) setAnswers(saved.answers);
      if (saved.paymentMethod) {
        setPaymentMethod(saved.paymentMethod);
        setPaymentSaved(true);
      }
      if (saved.startedOpportunities) setStartedOpportunities(saved.startedOpportunities);
      if (saved.actionPlans) setActionPlans(saved.actionPlans);
      if (saved.reflections) setReflections(saved.reflections);
      if (saved.marketingCopyMap) setMarketingCopyMap(saved.marketingCopyMap);
      if (saved.businessStarterMap) setBusinessStarterMap(saved.businessStarterMap);
      if (saved.plan) setScreen("results");
    })();
  }, []);

  const persist = async (patch) => {
    await persistState({
      plan, tasks, earnings, answers, paymentMethod,
      startedOpportunities, actionPlans, reflections, marketingCopyMap, businessStarterMap,
      ...patch,
    });
  };
  // ---------------- Ignite ----------------
  const ignite = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 140);
    setScreen("igniting");
    setChargePercent(0);
    let p = 0;
    chargeTimer.current = setInterval(() => {
      p += 6 + Math.random() * 8;
      if (p >= 100) {
        p = 100;
        clearInterval(chargeTimer.current);
        setChargePercent(100);
        setTimeout(() => setScreen("form"), 300);
      } else {
        setChargePercent(p);
      }
    }, 90);
  };

  // ---------------- Form ----------------
  const currentStep = STEPS[step];
  const canAdvance = () => {
    const v = answers[currentStep?.key];
    if (currentStep?.type === "multiselect") return true;
    return v && v.toString().trim().length > 0;
  };

  const setAnswer = (key, value) => setAnswers((a) => ({ ...a, [key]: value }));
  const toggleEquipment = (key) => {
    setAnswers((a) => {
      const has = a.equipment.includes(key);
      return { ...a, equipment: has ? a.equipment.filter((e) => e !== key) : [...a.equipment, key] };
    });
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else submitForm();
  };
  const prevStep = () => {
    if (step > 0) setStep((s) => s - 1);
    else setScreen("landing");
  };
  const submitForm = async () => {
    setScreen("loading");
    setError(null);
    try {
      const result = await generatePlan(answers);
      const newTasks = (result.plan || []).map((p, i) => ({ id: `t${i}`, day: p.day, task: p.task, done: false }));
      setPlan(result);
      setTasks(newTasks);
      setStartedOpportunities([]);
      setActionPlans({});
      setMarketingCopyMap({});
      setBusinessStarterMap({});
      setStep(0);
      setScreen("results");
      await persist({ plan: result, tasks: newTasks, answers, startedOpportunities: [], actionPlans: {}, marketingCopyMap: {}, businessStarterMap: {} });
    } catch (e) {
      console.error(e);
      setError(e.message || "Couldn't reach the AI just now. Your answers are saved — try again.");
      setScreen("form");
      setStep(STEPS.length - 1);
    }
  };

  const toggleTask = async (id) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(updated);
    await persist({ tasks: updated });
  };

  const startOpportunity = async (index) => {
    const opportunity = plan.opportunities[index];
    setActiveOppIndex(index);
    setActionError(null);
    setScreen("actionLoading");
    try {
      const result = await generateActionPlan(opportunity, answers);
      const checklist = (result.checklist || []).map((c, i) => ({ id: `c${index}-${i}`, text: c.text, done: false }));
      const builtActionPlan = { ...result, checklist };
      const nextActionPlans = { ...actionPlans, [index]: builtActionPlan };
      setActionPlans(nextActionPlans);
      let nextStarted = startedOpportunities;
      if (!startedOpportunities.some((s) => s.index === index)) {
        nextStarted = [...startedOpportunities, { index, title: opportunity.title, startedAt: new Date().toISOString() }];
        setStartedOpportunities(nextStarted);
      }
      await persist({ actionPlans: nextActionPlans, startedOpportunities: nextStarted });
      setScreen("action");
    } catch (e) {
      console.error(e);
      setActionError(e.message || "Couldn't build your execution kit just now. Try again.");
      setScreen("results");
    }
  };

  const openAction = (index) => {
    setActiveOppIndex(index);
    setScreen("action");
  };

  const toggleActionChecklistItem = async (index, itemId) => {
    const ap = actionPlans[index];
    if (!ap) return;
    const updatedChecklist = ap.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c));
    const nextActionPlans = { ...actionPlans, [index]: { ...ap, checklist: updatedChecklist } };
    setActionPlans(nextActionPlans);
    await persist({ actionPlans: nextActionPlans });
  };

  // ---------------- Build It / Marketing Copy ----------------
  const buildMarketingCopy = async (index) => {
    const opportunity = plan.opportunities[index];
    setActiveMarketingIndex(index);
    setMarketingError(null);
    setScreen("marketingLoading");
    try {
      const result = await generateMarketingCopy(opportunity, answers);
      const nextMap = { ...marketingCopyMap, [index]: result };
      setMarketingCopyMap(nextMap);
      await persist({ marketingCopyMap: nextMap });
      setScreen("marketing");
    } catch (e) {
      console.error(e);
      setMarketingError(e.message || "Couldn't build your marketing copy just now. Try again.");
      setScreen("results");
    }
  };

  const openMarketing = (index) => {
    setActiveMarketingIndex(index);
    setScreen("marketing");
  };

  // ---------------- Business Starter ----------------
  const buildBusinessStarter = async (index) => {
    const opportunity = plan.opportunities[index];
    setActiveBusinessIndex(index);
    setBusinessError(null);
    setScreen("businessLoading");
    try {
      const result = await generateBusinessStarter(opportunity, answers);
      const nextMap = { ...businessStarterMap, [index]: result };
      setBusinessStarterMap(nextMap);
      await persist({ businessStarterMap: nextMap });
      setScreen("business");
    } catch (e) {
      console.error(e);
      setBusinessError(e.message || "Couldn't build your business starter kit just now. Try again.");
      setScreen("results");
    }
  };

  const openBusiness = (index) => {
    setActiveBusinessIndex(index);
    setScreen("business");
  };

  const addEarning = async () => {
    const amt = parseFloat(earnInput.amount);
    if (!amt || amt <= 0) return;
    const updated = [...earnings, { id: Date.now(), amount: amt, note: earnInput.note || "Earning", date: new Date().toISOString() }];
    setEarnings(updated);
    setEarnInput({ amount: "", note: "" });
    await persist({ earnings: updated });
  };

  const addReflection = async () => {
    if (!reflectionInput.text.trim()) return;
    const updated = [...reflections, { id: Date.now(), type: reflectionInput.type, text: reflectionInput.text.trim(), date: new Date().toISOString() }];
    setReflections(updated);
    setReflectionInput({ type: reflectionInput.type, text: "" });
    await persist({ reflections: updated });
  };

  const savePayment = async () => {
    setPaymentSaved(true);
    await persist({ paymentMethod });
  };

  const totalEarned = earnings.reduce((s, e) => s + e.amount, 0);
  const goalNumMatch = (answers.goalAmount || "").match(/[\d,.]+/);
  const goalNum = goalNumMatch ? parseFloat(goalNumMatch[0].replace(/,/g, "")) : null;
  const goalProgress = goalNum ? Math.min(100, (totalEarned / goalNum) * 100) : null;

  const wrap = {
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    background: "#081410",
    fontFamily: "Inter, sans-serif",
    color: "#EAF2EC",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={wrap}>
      {screen === "landing" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, letterSpacing: 3, color: "#FFD23F", textTransform: "uppercase", marginBottom: 18 }}>
            Income Button AI
          </div>
          <PowerButton onPress={ignite} pressed={pressed} />
          <p style={{ marginTop: 34, fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 20, lineHeight: 1.35, maxWidth: 300 }}>
            Tell us what you have.
            <br />
            We guide you to real income.
          </p>
          <p style={{ marginTop: 10, color: "#8AA396", fontSize: 13.5, maxWidth: 280, lineHeight: 1.5 }}>
            One button. Six quick questions. A real, honest plan — and an AI that walks with you while you execute it.
          </p>
          {plan && (
            <button
              onClick={() => setScreen("results")}
              style={{
                marginTop: 28, background: "transparent", border: "1px solid rgba(234,242,236,0.15)",
                color: "#EAF2EC", padding: "10px 18px", borderRadius: 30, fontSize: 13,
                display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
              }}
            >
              Back to your plan <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}

      {screen === "igniting" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
          <ChargeRing percent={chargePercent} label={chargePercent < 100  ? "CHARGING" : "IGNITED"} />
          <p style={{ color: "#8AA396", fontSize: 13, fontFamily: "JetBrains Mono", letterSpacing: 1 }}>
            {chargePercent < 40  ? "Reading your signal…" : chargePercent < 80 ? "Scanning opportunities…" : "Locking it in…"}
          </p>
        </div>
      )}

      {screen === "form" && currentStep && (
        <>
          <TopBar title={`Step ${step + 1} of ${STEPS.length}`} onBack={prevStep} />
          <div style={{ display: "flex", gap: 5, padding: "0 20px 6px" }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? "#22C55E" : "rgba(234,242,236,0.1)" }} />
            ))}
          </div>
          <div className="fu" key={step} style={{ flex: 1, padding: "26px 24px", display: "flex", flexDirection: "column" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "#0F241B", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, border: "1px solid rgba(234,242,236,0.08)" }}>
              <currentStep.icon size={21} color="#FFD23F" />
            </div>
            <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 22, margin: 0 }}>{currentStep.label}</h2>
            <p style={{ color: "#8AA396", fontSize: 13.5, marginTop: 6 }}>{currentStep.sub}</p>

            <div style={{ marginTop: 26 }}>
              {currentStep.type === "text" && (
                <input
                  autoFocus
                  value={answers[currentStep.key]}
                  onChange={(e) => setAnswer(currentStep.key, e.target.value)}
                  placeholder={currentStep.placeholder}
                  style={{ width: "100%", background: "#0F241B", border: "1px solid rgba(234,242,236,0.1)", borderRadius: 12, padding: "15px 16px", color: "#EAF2EC", fontSize: 15.5, outline: "none" }}
                />
              )}
              {currentStep.type === "select" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {currentStep.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswer(currentStep.key, opt)}
                      style={{
                        textAlign: "left", padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                        background: answers[currentStep.key] === opt ? "rgba(34,197,94,0.14)" : "#0F241B",
                        border: answers[currentStep.key] === opt ? "1px solid #22C55E" : "1px solid rgba(234,242,236,0.1)",
                        color: "#EAF2EC", fontSize: 14.5, display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                    >
                      {opt}
                      {answers[currentStep.key] === opt && <CheckCircle2 size={16} color="#22C55E" />}
                    </button>
                  ))}
                </div>
              )}
              {currentStep.type === "multiselect" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {EQUIPMENT_OPTIONS.map((opt) => {
                    const active = answers.equipment.includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        onClick={() => toggleEquipment(opt.key)}
                        style={{
                          padding: "16px 12px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                          background: active ? "rgba(34,197,94,0.14)" : "#0F241B",
                          border: active ? "1px solid #22C55E" : "1px solid rgba(234,242,236,0.1)",
                          display: "flex", flexDirection: "column", gap: 8, color: "#EAF2EC",
                        }}
                      >
                        <opt.icon size={18} color={active ? "#22C55E" : "#8AA396"} />
                        <span style={{ fontSize: 13 }}>{opt.key}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {error && step === STEPS.length - 1 && <p style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 14 }}>{error}</p>}

            <div style={{ flex: 1 }} />
            <button
              onClick={nextStep}
              disabled={!canAdvance()}
              style={{
                marginTop: 24, width: "100%", padding: "16px", borderRadius: 14, border: "none",
                background: canAdvance() ? "#22C55E" : "rgba(34,197,94,0.25)", color: "#081410",
                fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 15.5,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: canAdvance() ? "pointer" : "default",
              }}
            >
              {step === STEPS.length - 1 ? "Find my path" : "Continue"} <ArrowRight size={17} />
            </button>
          </div>
        </>
      )}

      {screen === "loading" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <Spinner />
          <p style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 16 }}>Building your plan…</p>
          <p style={{ color: "#8AA396", fontSize: 13, maxWidth: 240, textAlign: "center" }}>
            Matching your skills and hours against real ways to earn — this takes a few seconds.
          </p>
        </div>
      )}

      {screen === "results" && plan && (
        <>
          <TopBar title="Your path" onBack={() => setScreen("landing")} />
          <div className="fu" style={{ flex: 1, padding: "6px 20px 24px" }}>
            {actionError && (
              <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 12.5, color: "#FCA5A5" }}>
                {actionError}
              </div>
            )}
            {marketingError && (
              <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 12.5, color: "#FCA5A5" }}>
                {marketingError}
              </div>
            )}
            {businessError && (
              <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 12.5, color: "#FCA5A5" }}>
                {businessError}
              </div>
            )}

            {plan.realityCheck && (
              <div style={{ marginBottom: 20 }}>
                <SectionLabel text="Income reality check" />
                <div style={{ background: "#0F241B", border: "1px solid rgba(234,242,236,0.1)", borderRadius: 16, padding: 18 }}>
                  <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: 0, color: "#EAF2EC" }}>{plan.realityCheck.matchSummary}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    <DifficultyBadge level={plan.realityCheck.difficulty} />
                    <span style={{ fontSize: 11.5, color: "#8AA396", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={12} /> {plan.realityCheck.effort}
                    </span>
                    <span style={{
                      fontFamily: "JetBrains Mono", fontSize: 11.5, color: "#22C55E",
                      background: "rgba(34,197,94,0.12)", padding: "3px 9px", borderRadius: 20,
                    }}>
                      {plan.realityCheck.earningRange}
                    </span>
                  </div>
                  <p style={{ fontSize: 11.5, color: "#52685A", marginTop: 12, marginBottom: 0, fontStyle: "italic" }}>
                    {plan.realityCheck.disclaimer}
                  </p>
                </div>
              </div>
            )}

            <div style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(255,210,63,0.08))",
              border: "1px solid rgba(34,197,94,0.3)", borderRadius: 16, padding: 20, marginBottom: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Flame size={15} color="#FFD23F" />
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 10.5, letterSpacing: 1.5, color: "#FFD23F" }}>YOUR FASTEST PATH</span>
              </div>
              <h2 style={{ fontFamily: "Space Grotesk", fontSize: 19, fontWeight: 700, margin: 0, lineHeight: 1.35 }}>{plan.headline}</h2>
              <p style={{ color: "#C7D6CC", fontSize: 13.5, marginTop: 10, lineHeight: 1.55 }}>{plan.summary}</p>
            </div>

            <SectionLabel text="Do this in the next hour" />
            <div style={{ background: "#0F241B", border: "1px solid rgba(255,210,63,0.25)", borderRadius: 14, padding: 16, marginBottom: 22, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Target size={18} color="#FFD23F" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>{plan.firstAction}</p>
            </div>

            <SectionLabel text="Best opportunities for you" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {plan.opportunities?.map((op, i) => {
                const started = startedOpportunities.some((s) => s.index === i);
                const hasMarketing = !!marketingCopyMap[i];
                const hasBusiness = !!businessStarterMap[i];
                return (
                  <div key={i} style={{ background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 15 }}>{op.title}</span>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: 11.5, color: "#22C55E", whiteSpace: "nowrap", background: "rgba(34,197,94,0.12)", padding: "3px 8px", borderRadius: 20 }}>
                        {op.earningRange}
                      </span>
                    </div>
                    <p style={{ color: "#8AA396", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{op.why}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <DifficultyBadge level={op.difficulty} />
                      <span style={{ fontSize: 11.5, color: "#8AA396" }}>{op.effort}</span>
                    </div>
                    <button
                      onClick={() => (started ? openAction(i) : startOpportunity(i))}
                      style={{
                        marginTop: 14, width: "100%", padding: "12px", borderRadius: 12, border: "none",
                        background: started ? "rgba(255,210,63,0.14)" : "#22C55E",
                        color: started ? "#FFD23F" : "#081410",
                        fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 13.5,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer",
                      }}
                    >
                      <Rocket size={15} />
                      {started ? "Continue this path" : "Start This Income Path"}
                    </button>
                    <button
                      onClick={() => (hasMarketing ? openMarketing(i) : buildMarketingCopy(i))}
                      style={{
                        marginTop: 8, width: "100%", padding: "12px", borderRadius: 12,
                        border: "1px solid rgba(255,210,63,0.3)",
                        background: hasMarketing ? "rgba(255,210,63,0.1)" : "transparent",
                        color: "#FFD23F",
                        fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 13.5,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer",
                      }}
                    >
                      <Hammer size={15} />
                      {hasMarketing ? "View your marketing copy" : "Build It — get marketing copy"}
                    </button>
                    <button
                      onClick={() => (hasBusiness ? openBusiness(i) : buildBusinessStarter(i))}
                      style={{
                        marginTop: 8, width: "100%", padding: "12px", borderRadius: 12,
                        border: "1px solid rgba(94,197,197,0.35)",
                        background: hasBusiness ? "rgba(94,197,197,0.1)" : "transparent",
                        color: "#5EC5C5",
                        fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 13.5,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer",
                      }}
                    >
                      <Store size={15} />
                      {hasBusiness ? "View your business starter kit" : "Turn into a business"}
                    </button>
                  </div>
                );
              })}
            </div>

            <SectionLabel text="Tools you'll need" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {plan.tools?.map((t, i) => (
                <span key={i} style={{ fontSize: 12.5, background: "#0F241B", border: "1px solid rgba(234,242,236,0.1)", padding: "7px 12px", borderRadius: 20, color: "#C7D6CC" }}>
                  {t}
                </span>
              ))}
            </div>

            <SectionLabel text="Your step-by-step plan" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  style={{ textAlign: "left", display: "flex", gap: 12, alignItems: "flex-start", background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 12, padding: 14, cursor: "pointer" }}
                >
                  {t.done ? <CheckCircle2 size={18} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} /> : <Circle size={18} color="#52685A" style={{ flexShrink: 0, marginTop: 1 }} />}
                  <div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 10.5, color: "#FFD23F", letterSpacing: 1 }}>{t.day?.toUpperCase()}</div>
                    <div style={{ fontSize: 13.5, marginTop: 3, color: t.done ? "#8AA396" : "#EAF2EC", textDecoration: t.done ? "line-through" : "none" }}>{t.task}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setScreen("dashboard")}
              style={{ marginTop: 24, width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#22C55E", color: "#081410", fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}
            >
              Open my dashboard <ArrowRight size={17} />
            </button>
          </div>
          <BottomNav screen={screen} setScreen={setScreen} hasPlan={!!plan} />
        </>
      )}

      {screen === "actionLoading" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <Spinner />
          <p style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 16 }}>Building your execution kit…</p>
          <p style={{ color: "#8AA396", fontSize: 13, maxWidth: 260, textAlign: "center" }}>
            Today's task, a checklist, and ready-to-send templates — coming up.
          </p>
        </div>
      )}

      {screen === "marketingLoading" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <Spinner />
          <p style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 16 }}>Building your marketing copy…</p>
          <p style={{ color: "#8AA396", fontSize: 13, maxWidth: 260, textAlign: "center" }}>
            A WhatsApp ad, a post, and a description — ready to copy and send.
          </p>
        </div>
      )}

      {screen === "businessLoading" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <Spinner />
          <p style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 16 }}>Building your business starter kit…</p>
          <p style={{ color: "#8AA396", fontSize: 13, maxWidth: 260, textAlign: "center" }}>
            Names, pricing, how to get paid, and your first customers — coming up.
          </p>
        </div>
      )}

      {screen === "marketing" && activeMarketingIndex !== null && marketingCopyMap[activeMarketingIndex] && plan && (
        <>
          <TopBar title="Your marketing copy" onBack={() => setScreen("results")} />
          <div className="fu" style={{ flex: 1, padding: "6px 20px 24px" }}>
            <SectionLabel text="WhatsApp message" />
            <div style={{ marginBottom: 22 }}>
              <TemplateCard name="Send to buyers" content={marketingCopyMap[activeMarketingIndex].whatsappAd} />
            </div>

            <SectionLabel text="Facebook post" />
            <div style={{ marginBottom: 22 }}>
              <TemplateCard name="Post on Facebook" content={marketingCopyMap[activeMarketingIndex].facebookPost} />
            </div>

            <SectionLabel text="Product description" />
            <div style={{ marginBottom: 22 }}>
              <TemplateCard name="Use anywhere" content={marketingCopyMap[activeMarketingIndex].productDescription} />
            </div>

            <button
              onClick={() => setScreen("results")}
              style={{ marginTop: 4, width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#22C55E", color: "#081410", fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}
            >
              Back to your path <ArrowRight size={17} />
            </button>
          </div>
          <BottomNav screen={screen} setScreen={setScreen} hasPlan={!!plan} />
        </>
      )}

      {screen === "business" && activeBusinessIndex !== null && businessStarterMap[activeBusinessIndex] && plan && (
        <>
          <TopBar title="Your business starter kit" onBack={() => setScreen("results")} />
          <div className="fu" style={{ flex: 1, padding: "6px 20px 24px" }}>
            <SectionLabel text="Name ideas" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {businessStarterMap[activeBusinessIndex].businessNames?.map((n, i) => (
                <span key={i} style={{ fontSize: 13, background: "#0F241B", border: "1px solid rgba(94,197,197,0.3)", padding: "8px 14px", borderRadius: 20, color: "#5EC5C5", fontFamily: "Space Grotesk", fontWeight: 700 }}>
                  {n}
                </span>
              ))}
            </div>

            <SectionLabel text="What you need to start" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
              {businessStarterMap[activeBusinessIndex].whatYouNeed?.map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 12, padding: 13 }}>
                  <CheckCircle2 size={16} color="#5EC5C5" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{w}</span>
                </div>
              ))}
            </div>

            <SectionLabel text="How to price it" />
            <div style={{ background: "#0F241B", border: "1px solid rgba(234,242,236,0.1)", borderRadius: 14, padding: 16, marginBottom: 22 }}>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>{businessStarterMap[activeBusinessIndex].howToPrice}</p>
            </div>

            <SectionLabel text="How to get paid" />
            <div style={{ background: "#0F241B", border: "1px solid rgba(234,242,236,0.1)", borderRadius: 14, padding: 16, marginBottom: 22 }}>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>{businessStarterMap[activeBusinessIndex].howToGetPaid}</p>
            </div>

            <SectionLabel text="Getting your first 3 customers" />
            <div style={{ background: "#0F241B", border: "1px solid rgba(255,210,63,0.25)", borderRadius: 14, padding: 16, marginBottom: 22, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Target size={18} color="#FFD23F" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>{businessStarterMap[activeBusinessIndex].firstThreeCustomers}</p>
            </div>

            <SectionLabel text="Simple rules to keep it honest" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
              {businessStarterMap[activeBusinessIndex].simpleRules?.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 12, padding: 13 }}>
                  <Store size={15} color="#5EC5C5" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{r}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setScreen("results")}
              style={{ marginTop: 4, width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#22C55E", color: "#081410", fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}
            >
              Back to your path <ArrowRight size={17} />
            </button>
          </div>
          <BottomNav screen={screen} setScreen={setScreen} hasPlan={!!plan} />
        </>
      )}

      {screen === "action" && activeOppIndex !== null && actionPlans[activeOppIndex] && plan && (
        <>
          <TopBar title={plan.opportunities[activeOppIndex]?.title || "Action mode"} onBack={() => setScreen("results")} />
          <div className="fu" style={{ flex: 1, padding: "6px 20px 24px" }}>
            <SectionLabel text="Do this today" />
            <div style={{ background: "#0F241B", border: "1px solid rgba(255,210,63,0.25)", borderRadius: 14, padding: 16, marginBottom: 22, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Target size={18} color="#FFD23F" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>{actionPlans[activeOppIndex].firstTaskToday}</p>
            </div>

            <SectionLabel text="Checklist" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
              {actionPlans[activeOppIndex].checklist.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleActionChecklistItem(activeOppIndex, c.id)}
                  style={{ textAlign: "left", display: "flex", gap: 10, alignItems: "flex-start", background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 12, padding: 13, cursor: "pointer" }}
                >
                  {c.done ? <CheckCircle2 size={17} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} /> : <Circle size={17} color="#52685A" style={{ flexShrink: 0, marginTop: 1 }} />}
                  <span style={{ fontSize: 13.5, color: c.done ? "#8AA396" : "#EAF2EC", textDecoration: c.done ? "line-through" : "none" }}>{c.text}</span>
                </button>
              ))}
            </div>

            <SectionLabel text="Templates — ready to send" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {actionPlans[activeOppIndex].templates?.map((t, i) => (
                <TemplateCard key={i} name={t.name} content={t.content} />
              ))}
            </div>

            <SectionLabel text="Timeline" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {actionPlans[activeOppIndex].timeline?.map((p, i) => (
                <div key={i} style={{ background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 14, padding: 15, display: "flex", gap: 12 }}>
                  <CalendarClock size={17} color="#8AA396" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 13.5 }}>
                      {p.phase} <span style={{ color: "#8AA396", fontWeight: 500, fontSize: 11.5 }}>· {p.duration}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: "#8AA396", marginTop: 4, lineHeight: 1.5, margin: "4px 0 0" }}>{p.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setScreen("dashboard")}
              style={{ marginTop: 24, width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#22C55E", color: "#081410", fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}
            >
              Track my progress <ArrowRight size={17} />
            </button>
          </div>
          <BottomNav screen={screen} setScreen={setScreen} hasPlan={!!plan} />
        </>
      )}

      {screen === "dashboard" && (
        <>
          <TopBar title="Dashboard" />
          <div className="fu" style={{ flex: 1, padding: "6px 20px 24px" }}>
            <div style={{ background: "#0F241B", borderRadius: 16, padding: 20, marginBottom: 20, border: "1px solid rgba(234,242,236,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#8AA396", fontSize: 12 }}>Current goal</span>
                <TrendingUp size={16} color="#22C55E" />
              </div>
              <div style={{ fontFamily: "Space Grotesk", fontWeight: 800, fontSize: 26, marginTop: 4 }}>{answers.goalAmount || "No goal set"}</div>
              {goalProgress !== null && (
                <>
                  <div style={{ height: 8, background: "rgba(234,242,236,0.08)", borderRadius: 8, marginTop: 14, overflow: "hidden" }}>
                    <div style={{ width: `${goalProgress}%`, height: "100%", background: "linear-gradient(90deg,#22C55E,#FFD23F)", borderRadius: 8, transition: "width 0.3s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#8AA396", fontFamily: "JetBrains Mono" }}>
                    <span>{totalEarned.toLocaleString()} earned</span>
                    <span>{Math.round(goalProgress)}%</span>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 22 }}>
              <StatCard label="Tasks done" value={`${tasks.filter((t) => t.done).length}/${tasks.length}`} />
              <StatCard label="Paths started" value={startedOpportunities.length} />
              <StatCard label="Earnings logged" value={earnings.length} />
            </div>

            <SectionLabel text="Started income paths" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
              {startedOpportunities.length === 0 && <EmptyNote text="Nothing started yet. Open a path from your results and hit Start This Income Path." />}
              {startedOpportunities.map((s) => {
                const ap = actionPlans[s.index];
                const done = ap ? ap.checklist.filter((c) => c.done).length : 0;
                const total = ap ? ap.checklist.length : 0;
                return (
                  <button
                    key={s.index}
                    onClick={() => openAction(s.index)}
                    style={{ textAlign: "left", background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  >
                    <div>
                      <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 13.5 }}>{s.title}</div>
                      <div style={{ fontSize: 11.5, color: "#8AA396", marginTop: 3 }}>
                        Started {new Date(s.startedAt).toLocaleDateString()} · {done}/{total} steps done
                      </div>
                    </div>
                    <ChevronRight size={16} color="#8AA396" />
                  </button>
                );
              })}
            </div>

            <SectionLabel text="Your plan" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
              {tasks.length === 0 && <EmptyNote text="No plan yet. Press the button on Home to generate one." />}
              {tasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  style={{ textAlign: "left", display: "flex", gap: 12, alignItems: "flex-start", background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 12, padding: 14, cursor: "pointer" }}
                >
                  {t.done ? <CheckCircle2 size={18} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} /> : <Circle size={18} color="#52685A" style={{ flexShrink: 0, marginTop: 1 }} />}
                  <div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 10.5, color: "#FFD23F", letterSpacing: 1 }}>{t.day?.toUpperCase()}</div>
                    <div style={{ fontSize: 13.5, marginTop: 3, color: t.done ? "#8AA396" : "#EAF2EC", textDecoration: t.done ? "line-through" : "none" }}>{t.task}</div>
                  </div>
                </button>
              ))}
            </div>

            <SectionLabel text="Log an earning" />
            <div style={{ background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 14, padding: 14, display: "flex", gap: 8, marginBottom: 24 }}>
              <input
                value={earnInput.amount}
                onChange={(e) => setEarnInput((s) => ({ ...s, amount: e.target.value }))}
                placeholder="Amount"
                inputMode="decimal"
                style={{ width: 90, background: "#081410", border: "1px solid rgba(234,242,236,0.1)", borderRadius: 10, padding: "10px 10px", color: "#EAF2EC", fontSize: 14 }}
              />
              <input
                value={earnInput.note}
                onChange={(e) => setEarnInput((s) => ({ ...s, note: e.target.value }))}
                placeholder="What was it for?"
                style={{ flex: 1, background: "#081410", border: "1px solid rgba(234,242,236,0.1)", borderRadius: 10, padding: "10px 10px", color: "#EAF2EC", fontSize: 14 }}
              />
              <button onClick={addEarning} style={{ background: "#22C55E", border: "none", borderRadius: 10, width: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Plus size={18} color="#081410" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {earnings.length === 0 && <EmptyNote text="No earnings logged yet. Add your first one above." />}
              {[...earnings].reverse().map((e) => (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 12, padding: "12px 14px" }}>
                  <span style={{ fontSize: 13.5 }}>{e.note}</span>
                  <span style={{ fontFamily: "JetBrains Mono", color: "#22C55E", fontSize: 14 }}>+{e.amount}</span>
                </div>
              ))}
            </div>

            <SectionLabel text="What worked / what didn't" />
            <div style={{ background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button
                  onClick={() => setReflectionInput((s) => ({ ...s, type: "worked" }))}
                  style={{
                    flex: 1, padding: "8px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    background: reflectionInput.type === "worked" ? "rgba(34,197,94,0.16)" : "#081410",
                    border: reflectionInput.type === "worked" ? "1px solid #22C55E" : "1px solid rgba(234,242,236,0.1)",
                    color: reflectionInput.type === "worked" ? "#4ADE80" : "#8AA396", fontSize: 12.5,
                  }}
                >
                  <ThumbsUp size={13} /> Worked
                </button>
                <button
                  onClick={() => setReflectionInput((s) => ({ ...s, type: "failed" }))}
                  style={{
                    flex: 1, padding: "8px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    background: reflectionInput.type === "failed" ? "rgba(248,113,113,0.14)" : "#081410",
                    border: reflectionInput.type === "failed" ? "1px solid #F87171" : "1px solid rgba(234,242,236,0.1)",
                    color: reflectionInput.type === "failed" ? "#F87171" : "#8AA396", fontSize: 12.5,
                  }}
                >
                  <ThumbsDown size={13} /> Didn't work
                </button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={reflectionInput.text}
                  onChange={(e) => setReflectionInput((s) => ({ ...s, text: e.target.value }))}
                  placeholder="What happened?"
                  style={{ flex: 1, background: "#081410", border: "1px solid rgba(234,242,236,0.1)", borderRadius: 10, padding: "10px 10px", color: "#EAF2EC", fontSize: 13.5 }}
                />
                <button onClick={addReflection} style={{ background: "#22C55E", border: "none", borderRadius: 10, width: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Plus size={18} color="#081410" />
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {reflections.length === 0 && <EmptyNote text="Nothing logged yet. Track what's working as you go." />}
              {[...reflections].reverse().map((r) => (
                <div key={r.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#0F241B", border: "1px solid rgba(234,242,236,0.08)", borderRadius: 12, padding: "12px 14px" }}>
                  {r.type === "worked" ? <ThumbsUp size={15} color="#4ADE80" style={{ marginTop: 1, flexShrink: 0 }} /> : <ThumbsDown size={15} color="#F87171" style={{ marginTop: 1, flexShrink: 0 }} />}
                  <span style={{ fontSize: 13, lineHeight: 1.5 }}>{r.text}</span>
                </div>
              ))}
            </div>
          </div>
          <BottomNav screen={screen} setScreen={setScreen} hasPlan={!!plan} />
        </>
      )}

      {screen === "payment" && (
        <>
          <TopBar title="Get paid" />
          <div className="fu" style={{ flex: 1, padding: "6px 20px 24px" }}>
            <p style={{ color: "#8AA396", fontSize: 13.5, lineHeight: 1.55, marginBottom: 20 }}>
              Choose how you'd like to receive money. Payment processing is coming soon — for now this just saves your preference.
            </p>
            {[
              { key: "airtel", label: "Airtel Money", desc: "Mobile money, instant" },
              { key: "mtn", label: "MTN Money", desc: "Mobile money, instant" },
              { key: "card", label: "Visa / Card", desc: "Bank card or wire" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPaymentMethod(opt.key)}
                style={{
                  width: "100%", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: paymentMethod === opt.key ? "rgba(34,197,94,0.14)" : "#0F241B",
                  border: paymentMethod === opt.key ? "1px solid #22C55E" : "1px solid rgba(234,242,236,0.08)",
                  borderRadius: 14, padding: 16, marginBottom: 10, cursor: "pointer",
                }}
              >
                <div>
                  <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 14.5 }}>{opt.label}</div>
                  <div style={{ color: "#8AA396", fontSize: 12, marginTop: 2 }}>{opt.desc}</div>
                </div>
                {paymentMethod === opt.key ? <CheckCircle2 size={18} color="#22C55E" /> : <Circle size={18} color="#52685A" />}
              </button>
            ))}
            <button
              disabled={!paymentMethod}
              onClick={savePayment}
              style={{
                marginTop: 14, width: "100%", padding: "16px", borderRadius: 14, border: "none",
                background: paymentMethod ? "#22C55E" : "rgba(34,197,94,0.25)", color: "#081410",
                fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 15, cursor: paymentMethod ? "pointer" : "default",
              }}
            >
              Save payout preference
            </button>
            {paymentSaved && paymentMethod && (
              <p style={{ color: "#22C55E", fontSize: 12.5, marginTop: 10, textAlign: "center" }}>Saved. We'll use this once payouts go live.</p>
            )}
          </div>
          <BottomNav screen={screen} setScreen={setScreen} hasPlan={!!plan} />
        </>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 70, height: 70, borderRadius: "50%",
        border: "3px solid rgba(255,210,63,0.2)", borderTopColor: "#FFD23F",
        animation: "spin 0.9s linear infinite",
      }}
    />
  );
}
