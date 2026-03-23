import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  GitBranch,
  Shuffle,
  Eye,
  EyeOff,
  Play,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

/**
 * Generates a short random address.
 * @returns {string} Truncated hex address
 */
function shortAddr() {
  return '0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

/**
 * Investigation graph nodes - simulates a wallet investigation.
 */
const INVESTIGATION_NODES = [
  { id: 'suspect', label: 'Suspect Wallet', x: 50, y: 50, color: '#ef4444', addr: '0x7F4e...3A9b' },
  { id: 'ex1', label: 'Exchange A', x: 200, y: 20, color: '#38bdf8', addr: '0x1a2B...cD3e' },
  { id: 'ex2', label: 'Exchange B', x: 200, y: 80, color: '#38bdf8', addr: '0x9f8E...7d6C' },
  { id: 'defi', label: 'DeFi Protocol', x: 350, y: 30, color: '#10b981', addr: '0x4b5A...eF01' },
  { id: 'anon1', label: 'Unknown 1', x: 350, y: 70, color: '#64748b', addr: '0xdEaD...bEEf' },
  { id: 'mixer', label: 'Mixer', x: 200, y: 130, color: '#f59e0b', addr: '0xMIXR...0001' },
  { id: 'out1', label: 'Cash Out', x: 350, y: 120, color: '#ef4444', addr: '0xa1B2...c3D4' },
  { id: 'out2', label: 'Unknown 2', x: 350, y: 160, color: '#64748b', addr: '0xe5F6...7890' },
];

/** Edges connecting investigation nodes. */
const INVESTIGATION_EDGES = [
  { from: 'suspect', to: 'ex1', amount: '2.5 ETH' },
  { from: 'suspect', to: 'ex2', amount: '1.8 ETH' },
  { from: 'suspect', to: 'mixer', amount: '5.0 ETH' },
  { from: 'ex1', to: 'defi', amount: '2.0 ETH' },
  { from: 'ex2', to: 'anon1', amount: '1.5 ETH' },
  { from: 'mixer', to: 'out1', amount: '?' },
  { from: 'mixer', to: 'out2', amount: '?' },
];

/**
 * Forensics & Privacy page.
 * Features a graph investigation view and an interactive mixer/tumbler animation.
 */
export default function Forensics() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('graph');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [revealedEdges, setRevealedEdges] = useState([]);

  // Mixer state
  const [mixerPhase, setMixerPhase] = useState('idle');
  const [dots, setDots] = useState([]);
  const [inputAmount, setInputAmount] = useState('5.0');
  const [outputWallets, setOutputWallets] = useState([]);
  const animRef = useRef(null);

  /** Progressively reveal edges for the investigation. */
  function revealNext() {
    setRevealedEdges((prev) => {
      if (prev.length >= INVESTIGATION_EDGES.length) return prev;
      return [...prev, INVESTIGATION_EDGES[prev.length]];
    });
  }

  function resetGraph() {
    setRevealedEdges([]);
    setHoveredNode(null);
  }

  /** Gets pixel position for a node. */
  function nodePos(id) {
    const n = INVESTIGATION_NODES.find((n) => n.id === id);
    return n ? { x: n.x * 1.8 + 30, y: n.y * 2.2 + 20 } : { x: 0, y: 0 };
  }

  /** Runs the mixer animation: split -> scatter -> reassemble. */
  function startMixer() {
    setMixerPhase('splitting');
    setOutputWallets([]);
    const count = 50;

    // Create dots at center
    const initial = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 250,
      y: 150,
      targetX: 250,
      targetY: 150,
      color: '#f59e0b',
      size: 4,
    }));
    setDots(initial);

    // Phase 1: Scatter randomly
    setTimeout(() => {
      setDots((prev) =>
        prev.map((d) => ({
          ...d,
          targetX: Math.random() * 450 + 25,
          targetY: Math.random() * 250 + 25,
          x: Math.random() * 450 + 25,
          y: Math.random() * 250 + 25,
          color: ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
        }))
      );
      setMixerPhase('scattering');
    }, 800);

    // Phase 2: Reassemble into new wallets
    setTimeout(() => {
      const wallets = Array.from({ length: 5 }, (_, i) => ({
        addr: shortAddr(),
        amount: (parseFloat(inputAmount) / 5 * (0.8 + Math.random() * 0.4)).toFixed(3),
        x: 80 + i * 90,
        y: 260,
      }));
      setOutputWallets(wallets);

      setDots((prev) => {
        const perWallet = Math.ceil(prev.length / 5);
        return prev.map((d, i) => {
          const walletIdx = Math.min(Math.floor(i / perWallet), 4);
          return {
            ...d,
            targetX: wallets[walletIdx].x,
            targetY: wallets[walletIdx].y - 20,
            x: wallets[walletIdx].x + (Math.random() - 0.5) * 20,
            y: wallets[walletIdx].y - 20 + (Math.random() - 0.5) * 20,
            color: '#10b981',
          };
        });
      });
      setMixerPhase('reassembling');
    }, 3000);

    // Phase 3: Done
    setTimeout(() => {
      setMixerPhase('done');
    }, 4500);
  }

  function resetMixer() {
    setMixerPhase('idle');
    setDots([]);
    setOutputWallets([]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">{t('forensics.title')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('forensics.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('graph')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${tab === 'graph' ? 'bg-cyber/10 text-cyber border border-cyber/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
          <GitBranch className="w-3.5 h-3.5" />{t('forensics.graphTab')}
        </button>
        <button onClick={() => setTab('mixer')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${tab === 'mixer' ? 'bg-amber/10 text-amber border border-amber/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
          <Shuffle className="w-3.5 h-3.5" />{t('forensics.mixerTab')}
        </button>
        <HelpTooltip term={t('forensics.helpMixer')} explanation={t('forensics.helpMixerDesc')} />
      </div>

      {tab === 'graph' ? (
        /* === GRAPH INVESTIGATION === */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <section className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider"><Eye className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />{t('forensics.investigation')}</h3>
              <div className="flex gap-2">
                <button onClick={revealNext} disabled={revealedEdges.length >= INVESTIGATION_EDGES.length} className="text-[10px] text-cyber hover:text-cyber/80 bg-cyber/10 px-2.5 py-1 rounded-lg disabled:opacity-30 flex items-center gap-1">
                  <Search className="w-3 h-3" />{t('forensics.traceNext')}
                </button>
                <button onClick={resetGraph} className="text-[10px] text-slate-500 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />{t('forensics.resetGraph')}
                </button>
              </div>
            </div>

            {/* SVG Graph */}
            <div className="relative bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden" style={{ height: '380px' }}>
              <svg width="100%" height="100%" viewBox="0 0 750 380">
                {/* Edges */}
                {revealedEdges.map((edge, i) => {
                  const from = nodePos(edge.from);
                  const to = nodePos(edge.to);
                  const midX = (from.x + to.x) / 2;
                  const midY = (from.y + to.y) / 2 - 10;
                  return (
                    <g key={i}>
                      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#334155" strokeWidth="1.5" strokeDasharray={edge.amount === '?' ? '4 4' : 'none'} />
                      <circle cx={to.x} cy={to.y} r="3" fill="#334155" />
                      <text x={midX} y={midY} textAnchor="middle" className="text-[9px] fill-slate-500 font-mono">{edge.amount}</text>
                    </g>
                  );
                })}
                {/* Nodes */}
                {INVESTIGATION_NODES.map((node) => {
                  const pos = nodePos(node.id);
                  const isRevealed = node.id === 'suspect' || revealedEdges.some((e) => e.to === node.id || e.from === node.id);
                  if (!isRevealed) return null;
                  return (
                    <g key={node.id} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)} className="cursor-pointer">
                      <circle cx={pos.x} cy={pos.y} r={node.id === 'suspect' ? 22 : 16} fill={node.color + '20'} stroke={node.color} strokeWidth={hoveredNode === node.id ? 2.5 : 1.5} />
                      <text x={pos.x} y={pos.y + 4} textAnchor="middle" className="text-[9px] font-semibold" fill={node.color}>{node.label.split(' ')[0]}</text>
                      {hoveredNode === node.id && (
                        <>
                          <rect x={pos.x - 45} y={pos.y + 24} width="90" height="28" rx="4" fill="#1e293b" stroke="#334155" />
                          <text x={pos.x} y={pos.y + 36} textAnchor="middle" className="text-[8px] font-mono" fill="#94a3b8">{node.addr}</text>
                          <text x={pos.x} y={pos.y + 46} textAnchor="middle" className="text-[7px]" fill="#64748b">{node.label}</text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </section>

          {/* Investigation Log */}
          <section className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">{t('forensics.traceLog')}</h4>
            {revealedEdges.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-4">{t('forensics.clickTrace')}</p>
            ) : (
              <div className="space-y-2">
                {revealedEdges.map((edge, i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2 text-[10px]">
                    <div className="flex items-center gap-1 text-slate-400">
                      <span className="font-mono text-cyber">{INVESTIGATION_NODES.find((n) => n.id === edge.from)?.addr}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
                      <span className="font-mono text-white">{INVESTIGATION_NODES.find((n) => n.id === edge.to)?.addr}</span>
                    </div>
                    <span className="text-amber font-mono">{edge.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* === MIXER / TUMBLER === */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <section className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              <Shuffle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />{t('forensics.mixerVisual')}
            </h3>

            <div className="relative bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden" style={{ height: '340px' }}>
              {/* Input Wallet */}
              {mixerPhase !== 'idle' && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber/10 border border-amber/30 rounded-lg px-3 py-1.5 text-center">
                  <span className="text-[9px] text-amber font-semibold">{t('forensics.inputWallet')}</span>
                  <p className="text-[10px] font-mono text-white">{inputAmount} ETH</p>
                </div>
              )}

              {/* Animated Dots */}
              {dots.map((dot) => (
                <div
                  key={dot.id}
                  className="absolute rounded-full transition-all"
                  style={{
                    left: `${dot.x}px`,
                    top: `${dot.y}px`,
                    width: `${dot.size}px`,
                    height: `${dot.size}px`,
                    backgroundColor: dot.color,
                    boxShadow: `0 0 6px ${dot.color}60`,
                    transitionDuration: mixerPhase === 'splitting' ? '800ms' : mixerPhase === 'scattering' ? '2000ms' : '1500ms',
                  }}
                />
              ))}

              {/* Output Wallets */}
              {outputWallets.map((w, i) => (
                <div key={i} className="absolute bg-emerald/10 border border-emerald/30 rounded-lg px-2.5 py-1.5 text-center" style={{ left: `${w.x - 35}px`, top: `${w.y}px` }}>
                  <span className="text-[8px] font-mono text-slate-500">{w.addr}</span>
                  <p className="text-[10px] font-mono text-emerald">{w.amount} ETH</p>
                </div>
              ))}

              {/* Idle State */}
              {mixerPhase === 'idle' && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-slate-600">{t('forensics.mixerIdle')}</p>
                </div>
              )}

              {/* Phase Indicator */}
              {mixerPhase !== 'idle' && (
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className={`text-[10px] font-semibold ${mixerPhase === 'done' ? 'text-emerald' : 'text-amber animate-pulse'}`}>
                    {mixerPhase === 'splitting' && t('forensics.phaseSplit')}
                    {mixerPhase === 'scattering' && t('forensics.phaseScatter')}
                    {mixerPhase === 'reassembling' && t('forensics.phaseReassemble')}
                    {mixerPhase === 'done' && t('forensics.phaseDone')}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">{t('forensics.mixerControls')}</h3>
            <div className="mb-4">
              <label className="block text-xs text-slate-500 mb-1">{t('forensics.amountToMix')}</label>
              <input type="number" value={inputAmount} onChange={(e) => setInputAmount(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber/50" step="0.1" />
            </div>
            <div className="space-y-2">
              <button onClick={startMixer} disabled={mixerPhase !== 'idle' && mixerPhase !== 'done'} className="w-full bg-amber hover:bg-amber/80 text-slate-950 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-30">
                <Play className="w-4 h-4" />{t('forensics.startMix')}
              </button>
              <button onClick={resetMixer} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
                <RotateCcw className="w-3.5 h-3.5" />{t('forensics.resetMixer')}
              </button>
            </div>
            {mixerPhase === 'done' && (
              <div className="mt-4 p-3 bg-red/5 border border-red/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <EyeOff className="w-4 h-4 text-red shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed">{t('forensics.mixerExplain')}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
