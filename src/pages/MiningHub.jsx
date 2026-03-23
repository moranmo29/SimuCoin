import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Hammer,
  Play,
  Square,
  Trophy,
  Cpu,
  Zap,
  Target,
  Hash,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { simpleHash } from '../store/hashUtils';
import HelpTooltip from '../components/HelpTooltip';

/**
 * Mining/Validators page with interactive Proof-of-Work mining simulation
 * and Proof-of-Stake educational comparison.
 */
export default function MiningHub() {
  const { t } = useTranslation();
  const [mode, setMode] = useState('pow');
  const [mining, setMining] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [difficulty, setDifficulty] = useState(3);
  const [currentHash, setCurrentHash] = useState('');
  const [blockData, setBlockData] = useState('Block #831,248 | 142 txns | reward: 3.125 BTC');
  const [found, setFound] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hashRate, setHashRate] = useState(0);
  const [minedBlocks, setMinedBlocks] = useState([]);
  const [stakeAmount, setStakeAmount] = useState(32);
  const [stakeSelected, setStakeSelected] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const nonceRef = useRef(0);
  const countRef = useRef(0);

  const target = '0'.repeat(difficulty);

  /** Runs the PoW mining loop: rapidly increments nonce until hash starts with target zeros. */
  useEffect(() => {
    if (!mining || found) return;
    startTimeRef.current = Date.now();
    nonceRef.current = 0;
    countRef.current = 0;

    intervalRef.current = setInterval(() => {
      const batchSize = 50;
      for (let i = 0; i < batchSize; i++) {
        nonceRef.current++;
        countRef.current++;
        const hash = simpleHash(blockData + nonceRef.current);
        if (hash.startsWith(target)) {
          setNonce(nonceRef.current);
          setCurrentHash(hash);
          setFound(true);
          setMining(false);
          setAttempts(countRef.current);
          setMinedBlocks((prev) => [{ nonce: nonceRef.current, hash, time: ((Date.now() - startTimeRef.current) / 1000).toFixed(2), attempts: countRef.current }, ...prev.slice(0, 4)]);
          clearInterval(intervalRef.current);
          return;
        }
      }
      setNonce(nonceRef.current);
      setCurrentHash(simpleHash(blockData + nonceRef.current));
      setAttempts(countRef.current);
      setHashRate(Math.round(countRef.current / ((Date.now() - startTimeRef.current) / 1000)));
    }, 16);

    return () => clearInterval(intervalRef.current);
  }, [mining, found, blockData, target]);

  /** Starts the mining process. */
  function startMining() {
    setNonce(0);
    setFound(false);
    setAttempts(0);
    setHashRate(0);
    setCurrentHash('');
    setMining(true);
  }

  /** Stops mining. */
  function stopMining() {
    setMining(false);
    clearInterval(intervalRef.current);
  }

  /** Resets everything. */
  function reset() {
    stopMining();
    setNonce(0);
    setFound(false);
    setAttempts(0);
    setHashRate(0);
    setCurrentHash('');
  }

  /** Simulates PoS validator selection. */
  function simulateStake() {
    setStakeSelected(true);
    setTimeout(() => setStakeSelected(false), 4000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t('mining.title')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('mining.subtitle')}</p>
        </div>
        {/* PoW / PoS Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button onClick={() => { setMode('pow'); reset(); }} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === 'pow' ? 'bg-amber/10 text-amber' : 'text-slate-500 hover:text-slate-300'}`}>
            <Hammer className="w-3 h-3 inline mr-1 -mt-0.5" />Proof of Work
          </button>
          <button onClick={() => { setMode('pos'); reset(); }} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === 'pos' ? 'bg-emerald/10 text-emerald' : 'text-slate-500 hover:text-slate-300'}`}>
            <Zap className="w-3 h-3 inline mr-1 -mt-0.5" />Proof of Stake
          </button>
        </div>
      </div>

      {mode === 'pow' ? (
        /* === PROOF OF WORK === */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Mining Controls */}
          <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
              <Cpu className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />{t('mining.miningConsole')}
            </h3>

            {/* Block Data */}
            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1">{t('mining.blockData')}</label>
              <input value={blockData} onChange={(e) => { setBlockData(e.target.value); reset(); }} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyber/50" />
            </div>

            {/* Difficulty Selector */}
            <div className="mb-4">
              <label className="block text-xs text-slate-500 mb-1">
                {t('mining.difficulty')}<HelpTooltip term={t('mining.helpDifficulty')} explanation={t('mining.helpDifficultyDesc')} />
              </label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((d) => (
                  <button key={d} onClick={() => { setDifficulty(d); reset(); }} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${difficulty === d ? 'bg-amber/10 text-amber border border-amber/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                    {'0'.repeat(d)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Target Display */}
            <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3.5 h-3.5 text-amber" />
                <span className="text-xs text-slate-500">{t('mining.target')}</span>
              </div>
              <p className="text-xs font-mono text-amber">
                {t('mining.targetDesc', { zeros: difficulty })}:  <span className="text-white">{target}{'x'.repeat(64 - difficulty)}</span>
              </p>
            </div>

            {/* Mining Buttons */}
            <div className="flex gap-2">
              {!mining && !found && (
                <button onClick={startMining} className="flex-1 bg-amber hover:bg-amber/80 text-slate-950 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Play className="w-4 h-4" />{t('mining.startMining')}
                </button>
              )}
              {mining && (
                <button onClick={stopMining} className="flex-1 bg-red hover:bg-red/80 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Square className="w-4 h-4" />{t('mining.stopMining')}
                </button>
              )}
              {found && (
                <button onClick={reset} className="flex-1 bg-emerald hover:bg-emerald/80 text-slate-950 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <RotateCcw className="w-4 h-4" />{t('mining.mineAnother')}
                </button>
              )}
            </div>
          </section>

          {/* Mining Visualization */}
          <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5">
            {/* Found celebration */}
            {found && (
              <div className="bg-emerald/10 border border-emerald/30 rounded-xl p-4 mb-4 text-center animate-pulse">
                <Trophy className="w-10 h-10 text-emerald mx-auto mb-2" />
                <h3 className="text-lg font-bold text-emerald">{t('mining.blockFound')}</h3>
                <p className="text-xs text-slate-400 mt-1">{t('mining.foundDesc', { attempts: attempts.toLocaleString(), time: minedBlocks[0]?.time })}</p>
              </div>
            )}

            {/* Nonce Counter */}
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Nonce<HelpTooltip term="Nonce" explanation={t('mining.helpNonceDesc')} /></span>
                <span className="text-xs text-slate-600 font-mono">{t('mining.attempts')}: {attempts.toLocaleString()}</span>
              </div>
              <p className={`text-4xl font-mono font-bold text-center py-3 ${mining ? 'text-amber animate-pulse' : found ? 'text-emerald' : 'text-slate-600'}`}>
                {nonce.toLocaleString()}
              </p>
              {mining && <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-amber rounded-full animate-pulse" style={{ width: '100%' }} /></div>}
            </div>

            {/* Hash Output */}
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">{t('mining.resultHash')}</span>
                {hashRate > 0 && <span className="text-[10px] text-slate-600 ml-auto font-mono">{hashRate.toLocaleString()} H/s</span>}
              </div>
              <div className="font-mono text-sm break-all leading-relaxed">
                {currentHash ? (
                  <>
                    <span className={`${currentHash.startsWith(target) ? 'text-emerald font-bold' : 'text-red'}`}>
                      {currentHash.slice(0, difficulty)}
                    </span>
                    <span className="text-slate-500">{currentHash.slice(difficulty)}</span>
                  </>
                ) : (
                  <span className="text-slate-700">{'0'.repeat(64)}</span>
                )}
              </div>
            </div>

            {/* Mined Blocks History */}
            {minedBlocks.length > 0 && (
              <div>
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">{t('mining.history')}</h4>
                <div className="space-y-1.5">
                  {minedBlocks.map((b, i) => (
                    <div key={i} className="flex items-center justify-between bg-emerald/5 border border-emerald/20 rounded-lg px-3 py-2">
                      <span className="text-[10px] font-mono text-emerald">{b.hash.slice(0, 24)}...</span>
                      <span className="text-[10px] text-slate-500">Nonce: {b.nonce.toLocaleString()} | {b.time}s | {b.attempts.toLocaleString()} tries</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      ) : (
        /* === PROOF OF STAKE === */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />{t('mining.posTitle')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">{t('mining.posDesc')}</p>
            <div className="mb-4">
              <label className="block text-xs text-slate-500 mb-1">{t('mining.stakeAmount')}</label>
              <input type="range" min="1" max="100" value={stakeAmount} onChange={(e) => setStakeAmount(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #064e3b ${stakeAmount}%, #334155 ${stakeAmount}%)` }} />
              <div className="flex justify-between text-xs mt-1"><span className="text-emerald font-mono">{stakeAmount} ETH</span><span className="text-slate-600">{t('mining.selectionChance')}: {Math.min(99, stakeAmount * 1.5).toFixed(0)}%</span></div>
            </div>
            <button onClick={simulateStake} className="w-full bg-emerald hover:bg-emerald/80 text-slate-950 font-semibold py-3 rounded-lg transition-colors">
              {t('mining.validateBlock')}
            </button>
            {stakeSelected && (
              <div className="mt-3 bg-emerald/10 border border-emerald/30 rounded-lg p-3 text-center animate-pulse">
                <Trophy className="w-6 h-6 text-emerald mx-auto mb-1" />
                <p className="text-xs text-emerald font-semibold">{t('mining.validatorSelected')}</p>
              </div>
            )}
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">{t('mining.comparison')}</h3>
            <div className="space-y-3">
              {[
                { label: t('mining.compEnergy'), pow: t('mining.compEnergyPow'), pos: t('mining.compEnergyPos') },
                { label: t('mining.compSecurity'), pow: t('mining.compSecurityPow'), pos: t('mining.compSecurityPos') },
                { label: t('mining.compHardware'), pow: t('mining.compHardwarePow'), pos: t('mining.compHardwarePos') },
                { label: t('mining.compBarrier'), pow: t('mining.compBarrierPow'), pos: t('mining.compBarrierPos') },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-3 gap-2 text-[11px] py-2 border-b border-slate-800 last:border-0">
                  <span className="text-slate-400 font-medium">{row.label}</span>
                  <span className="text-amber/80">{row.pow}</span>
                  <span className="text-emerald/80">{row.pos}</span>
                </div>
              ))}
              <div className="grid grid-cols-3 text-[9px] text-slate-600 uppercase tracking-wider"><span></span><span>PoW</span><span>PoS</span></div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
