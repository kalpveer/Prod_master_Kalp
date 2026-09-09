/* eslint-disable */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ArrowRight, Minus, Plus,
  Lightbulb, BarChart2, TrendingUp, Target, Activity, Rocket, DollarSign, Users, Zap,
  BrainCircuit,
} from 'lucide-react';
import { JOURNEYS } from '../data/journeys';
import {
  DASHBOARD_CREDIT_PACKS,
  DASHBOARD_BILLING_URL,
  CREDIT_FX_NOTE,
  formatUsd,
} from '../data/dashboardCreditPacks';
import {
  AGENT_USE_CASES,
  AGENT_DISPLAY_NAMES,
  AGENT_CREDIT_PACKS,
  AGENT_CREDIT_FX_NOTE,
  AGENTS_BUY_CREDITS_URL,
  ULTRAPLANNER_PRICE,
  formatInrPrimary,
  formatUltraPlannerFee,
  estimateCustomGoalCredits,
  type AgentId,
} from '../data/agentCredits';

const DASHBOARD_MODULES = [
  { id: 'idea-validation',       name: 'Idea Validation Advanced',   icon: Lightbulb,  credits: 2 },
  { id: 'market-research',       name: 'Market Research',            icon: BarChart2,  credits: 5 },
  { id: 'competitor-analysis',   name: 'Competition Analysis',       icon: TrendingUp, credits: 7 },
  { id: 'icp',                   name: 'ICP',                        icon: Target,     credits: 4 },
  { id: 'business-model-canvas', name: 'BMC',                        icon: Activity,   credits: 3 },
  { id: 'go-to-market',          name: 'GTM',                        icon: Rocket,     credits: 6 },
  { id: 'finance-estimation',    name: 'Finance Estimation',         icon: DollarSign, credits: 4 },
  { id: 'pitch-investor-hub',    name: 'Pitch Hub & Investor',       icon: Users,      credits: 6 },
  { id: 'startup-health',        name: 'Startup Health Diagnostics', icon: Zap,        credits: 3 },
] as const;

const MODULE_CREDIT_MAP = Object.fromEntries(
  DASHBOARD_MODULES.map((m) => [m.id, m.credits])
) as Record<string, number>;

const MODULE_NAME_MAP = Object.fromEntries(
  DASHBOARD_MODULES.map((m) => [m.id, m.name])
) as Record<string, string>;

const MODULE_ICON_MAP = Object.fromEntries(
  DASHBOARD_MODULES.map((m) => [m.id, m.icon])
) as Record<string, (typeof DASHBOARD_MODULES)[number]['icon']>;

function sumModuleCredits(moduleIds: string[]): number {
  return moduleIds.reduce((sum, id) => sum + (MODULE_CREDIT_MAP[id] ?? 0), 0);
}

/** Goal options → perfect pathway (same bundles as /pricing templates). */
const DASHBOARD_GOALS = JOURNEYS.map((j) => ({
  id: j.id,
  title: j.title,
  description: j.description,
  moduleIds: j.moduleIds,
}));

type PlatformTab = 'dashboard' | 'agents';

function agentLabel(agentId: AgentId) {
  const name = AGENT_DISPLAY_NAMES[agentId];
  return agentId === 'ultraplan' ? `${name} · ${formatUltraPlannerFee()}` : name;
}
function DashboardCredits() {
  const [goalId, setGoalId] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [promptCredits, setPromptCredits] = useState(0);

  const selectedList = useMemo(() => Array.from(selectedModules), [selectedModules]);
  const moduleCredits = sumModuleCredits(selectedList);
  const requiredPromptCredits = selectedList.length;
  const totalCredits = moduleCredits + requiredPromptCredits + promptCredits;

  const applyGoal = (id: string) => {
    const goal = DASHBOARD_GOALS.find((g) => g.id === id);
    if (!goal) return;
    if (goalId === id) {
      setGoalId(null);
      setSelectedModules(new Set());
      return;
    }
    setGoalId(id);
    setSelectedModules(new Set(goal.moduleIds));
  };

  const toggleModule = (id: string) => {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setGoalId(null);
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Credit packs */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h3 className="text-xl md:text-2xl font-light tracking-tight text-white mb-2">
            Buy <span className="font-semibold">Productica One</span> credits
          </h3>
          <p className="text-white/45 text-sm">
            Priced in USD, with indicative INR in brackets.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {DASHBOARD_CREDIT_PACKS.map((pack) => (
            <a
              key={pack.id}
              href={DASHBOARD_BILLING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative flex flex-col gap-4 p-5 rounded-2xl border transition-all ${
                pack.popular
                  ? 'border-white/40 bg-white/[0.07]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]'
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white text-black text-[9px] font-semibold tracking-[0.14em] uppercase">
                  Most popular
                </span>
              )}
              <div>
                <p className="text-2xl font-semibold text-white tracking-tight">
                  {pack.credits.toLocaleString()}{' '}
                  <span className="text-sm font-medium text-white/45">credits</span>
                </p>
                <p className="text-xs text-white/40 mt-1.5 leading-relaxed">{pack.description}</p>
              </div>
              <p className="text-lg font-semibold text-white tabular-nums">
                {formatUsd(pack.usdPrice)}{' '}
                <span className="text-sm font-medium text-white/45">({pack.inrRange})</span>
              </p>
              <ul className="flex flex-col gap-1.5">
                {pack.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/55">
                    <Check className="w-3 h-3 text-white/70 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <span
                className={`mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold ${
                  pack.popular
                    ? 'bg-white text-black'
                    : 'border border-white/20 text-white/70'
                }`}
              >
                Buy now <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </a>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-white/35 leading-relaxed max-w-2xl mx-auto">
          {CREDIT_FX_NOTE}
        </p>
      </div>

      {/* 1. Goals first */}
      <div className="text-center max-w-xl mx-auto">
        <h3 className="text-xl md:text-2xl font-light tracking-tight text-white mb-2">
          What do you want to <span className="font-semibold">achieve?</span>
        </h3>
        <p className="text-white/45 text-sm">
          Pick a goal to load the perfect pathway — or skip ahead and choose modules yourself. Nothing is preselected.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DASHBOARD_GOALS.map((g) => {
          const selected = goalId === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => applyGoal(g.id)}
              className={`text-left p-5 rounded-2xl border transition-all ${
                selected
                  ? 'border-white/40 bg-white/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/25'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/8 border border-white/10 text-white/40">
                  {g.moduleIds.length} modules
                </span>
                {selected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/15 border border-white/25 text-white/70">
                    Active
                  </span>
                )}
              </div>
              <p className={`text-sm font-semibold mb-1 ${selected ? 'text-white' : 'text-white/80'}`}>
                {g.title}
              </p>
              <p className="text-xs text-white/40 leading-relaxed">{g.description}</p>
            </button>
          );
        })}
      </div>

      {/* Perfect pathway when a goal is active */}
      <AnimatePresence>
        {goalId && (
          <motion.div
            key={`pathway-${goalId}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 md:p-8"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35 mb-4">
              Perfect pathway · {DASHBOARD_GOALS.find((g) => g.id === goalId)?.title}
            </p>
            <div className="flex flex-col gap-0">
              {(DASHBOARD_GOALS.find((g) => g.id === goalId)?.moduleIds ?? []).map((id, idx, arr) => {
                const Icon = MODULE_ICON_MAP[id] || Lightbulb;
                const credits = MODULE_CREDIT_MAP[id] ?? 0;
                return (
                  <div key={id} className="flex flex-col">
                    <div className="flex items-center gap-4 py-3">
                      <span className="text-[10px] font-mono text-white/30 w-8 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-white/70" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium text-white truncate">{MODULE_NAME_MAP[id]}</p>
                      </div>
                      <span className="text-xs text-white/50 tabular-nums shrink-0">
                        {credits} {credits === 1 ? 'credit' : 'credits'}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="ml-[3.25rem] w-px h-3 bg-white/15" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Module options + estimate (same as before) */}
      <div>
        <div className="text-center mb-8">
          <h3 className="text-xl md:text-2xl font-light tracking-tight text-white mb-2">
            Or pick <span className="font-semibold">modules</span>
          </h3>
          <p className="text-white/45 text-sm">
            Select the modules you need and we’ll calculate your total credits.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          <div className="flex flex-col gap-4">
            <div
              role="group"
              aria-label="Select dashboard modules"
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {DASHBOARD_MODULES.map((mod) => {
                const Icon = mod.icon;
                const isSelected = selectedModules.has(mod.id);
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    aria-pressed={isSelected}
                    className={`relative flex flex-col gap-3 p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-white/40 bg-white/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-white/8'}`}>
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-white/50'}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border tabular-nums ${
                          isSelected
                            ? 'bg-white/15 border-white/25 text-white/80'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}>
                          {mod.credits} Cr
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-black" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs font-medium leading-snug ${isSelected ? 'text-white' : 'text-white/60'}`}>
                      {mod.name}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.03]">
              <div>
                <p className="text-sm font-medium text-white/80 mb-0.5">Extra prompt credits</p>
                <p className="text-xs text-white/40">Optional — 1 credit each</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={promptCredits <= 0}
                  onClick={() => setPromptCredits((p) => Math.max(0, p - 1))}
                  className="w-8 h-8 rounded-lg border border-white/15 flex items-center justify-center text-white/60 disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-white tabular-nums w-6 text-center text-sm font-semibold">
                  {promptCredits}
                </span>
                <button
                  type="button"
                  onClick={() => setPromptCredits((p) => p + 1)}
                  className="w-8 h-8 rounded-lg border border-white/15 flex items-center justify-center text-white/60"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="sticky top-28 p-6 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-white/30 mb-5 font-medium">Summary</p>
            {selectedList.length === 0 ? (
              <p className="text-sm text-white/40 mb-6">
                Select a goal or modules to see your credit total.
              </p>
            ) : (
              <div className="flex flex-col gap-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-white/50">Modules ({selectedList.length})</span>
                  <span className="text-white tabular-nums">{moduleCredits} credits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Required prompts</span>
                  <span className="text-white tabular-nums">{requiredPromptCredits} credits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Extra prompts</span>
                  <span className="text-white tabular-nums">{promptCredits} credits</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-baseline">
                  <span className="text-white/70 font-medium">Total</span>
                  <span className="text-2xl font-semibold text-white tabular-nums">
                    {totalCredits}{' '}
                    <span className="text-sm font-medium text-white/50">
                      {totalCredits === 1 ? 'credit' : 'credits'}
                    </span>
                  </span>
                </div>
              </div>
            )}
            <a
              href={DASHBOARD_BILLING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-opacity ${
                selectedList.length === 0
                  ? 'bg-white/20 text-white/40 pointer-events-none'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              Buy credits <ArrowRight className="w-4 h-4" />
            </a>
            <p className="mt-3 text-[11px] text-white/30 text-center">
              Checkout on app.productica.in/billing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentsCredits() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customGoal, setCustomGoal] = useState('');

  const customEstimate = useMemo(
    () => estimateCustomGoalCredits(customGoal),
    [customGoal]
  );

  const selectedList = useMemo(
    () => AGENT_USE_CASES.filter((u) => selected.has(u.id)),
    [selected]
  );

  const presetMin = selectedList.reduce((s, u) => s + u.minCredits, 0);
  const presetMax = selectedList.reduce((s, u) => s + u.maxCredits, 0);
  const customMin = customEstimate?.minCredits ?? 0;
  const customMax = customEstimate?.maxCredits ?? 0;
  const totalMin = presetMin + customMin;
  const totalMax = presetMax + customMax;
  const hasEstimate = selectedList.length > 0 || !!customEstimate;
  const needsUltra =
    selectedList.some((u) => u.agentId === 'ultraplan') ||
    customEstimate?.agentId === 'ultraplan';

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="text-center max-w-xl mx-auto">
        <h3 className="text-xl md:text-2xl font-light tracking-tight text-white mb-2">
          Productica Teams <span className="font-semibold">credit bundles</span>
        </h3>
        <p className="text-white/45 text-sm">
          Priced in INR (indicative), with USD in brackets.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {AGENT_CREDIT_PACKS.map((pack) => (
          <a
            key={pack.id}
            href={AGENTS_BUY_CREDITS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06] transition-all"
          >
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35 mb-2">
                {pack.name}
              </p>
              <p className="text-2xl font-semibold text-white tracking-tight">
                {pack.credits}{' '}
                <span className="text-sm font-medium text-white/45">credits</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-white/30 line-through mb-0.5 tabular-nums">
                {formatInrPrimary(pack.inrWasRange, pack.usdWas)}
              </p>
              <p className="text-lg font-semibold text-white tabular-nums">
                {pack.inrRange}{' '}
                <span className="text-sm font-medium text-white/45">({formatUsd(pack.usdPrice)})</span>
              </p>
            </div>
          </a>
        ))}
      </div>
      <p className="text-center text-[11px] text-white/35 leading-relaxed max-w-2xl mx-auto -mt-4">
        {AGENT_CREDIT_FX_NOTE}
      </p>

      <div className="text-center max-w-xl mx-auto">
        <h3 className="text-xl md:text-2xl font-light tracking-tight text-white mb-2">
          Productica Teams use cases
        </h3>
        <p className="text-white/45 text-sm">
          Select outcomes or describe a custom goal — same credit logic as /pricing.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {AGENT_USE_CASES.map((u) => {
              const isOn = selected.has(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggle(u.id)}
                  aria-pressed={isOn}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isOn
                      ? 'border-white/40 bg-white/10'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className={`text-sm font-semibold ${isOn ? 'text-white' : 'text-white/75'}`}>
                        {u.name}
                      </p>
                      <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                        {u.description}
                      </p>
                    </div>
                    {isOn && (
                      <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-black" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md border border-white/10 text-white/40">
                      {agentLabel(u.agentId)}
                    </span>
                    <span className="text-xs font-mono text-white/50 tabular-nums">
                      {u.minCredits}–{u.maxCredits} credits
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
            <label htmlFor="home-custom-agent-goal" className="block">
              <p className="text-sm font-medium text-white/80 mb-0.5">What do you want to achieve?</p>
              <p className="text-xs text-white/40 mb-3 leading-relaxed">
                Describe a custom goal — we’ll estimate credits from similar use cases.
              </p>
            </label>
            <textarea
              id="home-custom-agent-goal"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              rows={3}
              placeholder="e.g. Help me prepare a seed pitch and refine my pricing story…"
              className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-colors"
            />
            <AnimatePresence>
              {customEstimate && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <span className="text-white/45">
                    Estimated for{' '}
                    <span className="text-white/75 font-medium">
                      {AGENT_DISPLAY_NAMES[customEstimate.agentId]}
                    </span>
                    {customEstimate.agentId === 'ultraplan' && (
                      <span className="text-white/55">
                        {' '}· {formatUltraPlannerFee()}
                      </span>
                    )}
                    {customEstimate.matchedUseCase && (
                      <span className="text-white/35">
                        {' '}· similar to {customEstimate.matchedUseCase}
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-white/80 tabular-nums">
                    {customEstimate.minCredits}–{customEstimate.maxCredits} Cr
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="sticky top-28 p-6 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.18em] text-white/30 mb-5 font-medium">Summary</p>
          {!hasEstimate ? (
            <p className="text-sm text-white/35 mb-6">
              Select use cases or describe a custom goal to estimate your credits.
            </p>
          ) : (
            <div className="flex flex-col gap-3 text-sm mb-6">
              {selectedList.map((u) => (
                <div key={u.id} className="flex justify-between gap-2">
                  <div>
                    <p className="text-white/70">{u.name}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      {AGENT_DISPLAY_NAMES[u.agentId]}
                    </p>
                  </div>
                  <span className="text-white/50 tabular-nums shrink-0">
                    {u.minCredits}–{u.maxCredits}
                  </span>
                </div>
              ))}
              {customEstimate && (
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-white/70">Custom goal</p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      {AGENT_DISPLAY_NAMES[customEstimate.agentId]}
                    </p>
                  </div>
                  <span className="text-white/50 tabular-nums shrink-0">
                    {customEstimate.minCredits}–{customEstimate.maxCredits}
                  </span>
                </div>
              )}
              {needsUltra && (
                <div className="flex justify-between text-sm gap-3">
                  <span className="text-white/50">UltraPlanner agent</span>
                  <span className="text-white/80 tabular-nums text-right">{formatUltraPlannerFee()}</span>
                </div>
              )}
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-baseline">
                <span className="text-white/70 font-medium">Estimated</span>
                <span className="text-2xl font-semibold text-white tabular-nums">
                  {totalMin === totalMax ? totalMin : `${totalMin}–${totalMax}`}{' '}
                  <span className="text-sm font-medium text-white/50">credits</span>
                </span>
              </div>
            </div>
          )}
          <a
            href={AGENTS_BUY_CREDITS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              sessionStorage.setItem(
                'productica_agent_estimate',
                JSON.stringify({
                  useCases: selectedList.map((u) => u.id),
                  customGoal: customGoal.trim() || null,
                  customEstimate,
                  needsUltraPlanner: needsUltra,
                  ultraPlannerPrice: needsUltra ? ULTRAPLANNER_PRICE : null,
                  totalMin,
                  totalMax,
                  timestamp: Date.now(),
                })
              );
            }}
            className="flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90"
          >
            {hasEstimate
              ? `Buy credits (${totalMin === totalMax ? totalMin : `${totalMin}–${totalMax}`})`
              : 'Buy credits'}
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="mt-3 text-[11px] text-white/30 text-center">
            Checkout on agents.productica.in
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const [tab, setTab] = useState<PlatformTab>('agents');

  return (
    <section
      id="pricing-section"
      className="py-24 md:py-32 px-6 md:px-12 bg-black text-white relative z-10 overflow-hidden border-t border-white/10"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 block mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-white mb-4">
            Productica Teams &{' '}
            <span className="font-semibold">Productica One.</span>
          </h2>
          <p className="text-white/45 text-base font-light">
            Estimate Productica Teams or Productica One, then buy the pack that fits.
          </p>
        </div>

        <div className="flex justify-center mb-14">
          <div
            role="tablist"
            className="inline-flex items-center gap-1 p-1 rounded-2xl border border-white/10 bg-white/[0.04]"
          >
            {([
              { id: 'agents' as const, label: 'Productica Teams', icon: BrainCircuit },
              { id: 'dashboard' as const, label: 'Productica One', icon: Lightbulb },
            ]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                  tab === id ? 'text-black' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {tab === id && (
                  <motion.div
                    layoutId="home-pricing-tab"
                    className="absolute inset-0 rounded-xl bg-white"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'agents' ? (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <AgentsCredits />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <DashboardCredits />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
