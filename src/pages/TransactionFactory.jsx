import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Send,
  Fuel,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Timer,
  ArrowRight,
  MessageSquare,
  Inbox,
  PackageCheck,
} from 'lucide-react';
import { useWallet } from '../store/WalletContext';
import { cryptoAssets } from '../store/simulationData';
import HelpTooltip from '../components/HelpTooltip';

/** Gas tier config. */
const GAS_TIERS = [
  { key: 'low', gwei: 8, label: 'Low', timeRange: '10-30 min', color: 'text-red', icon: Timer },
  { key: 'standard', gwei: 23, label: 'Standard', timeRange: '1-3 min', color: 'text-amber', icon: Clock },
  { key: 'fast', gwei: 45, label: 'Fast', timeRange: '15-30 sec', color: 'text-emerald', icon: Zap },
  { key: 'instant', gwei: 72, label: 'Instant', timeRange: '< 15 sec', color: 'text-cyber', icon: Zap },
];

/** @returns {string} Random Ethereum-style address. */
function randomAddress() {
  return '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

/**
 * Creates a mempool bubble with random position and gas tier.
 * @param {number} id - Unique identifier
 * @param {boolean} [isUser] - Whether this is the user's own transaction
 * @param {number} [gas] - Override gas value
 */
function generateMempoolTx(id, isUser = false, gas = null) {
  const g = gas ?? GAS_TIERS[Math.floor(Math.random() * GAS_TIERS.length)].gwei;
  return {
    id, isUser,
    amount: (Math.random() * 5 + 0.01).toFixed(4),
    gas: g,
    x: Math.random() * 85 + 5,
    y: isUser ? 50 + Math.random() * 30 : Math.random() * 85 + 5,
    size: isUser ? 32 : Math.random() * 22 + 10,
    speed: g > 50 ? 0.6 : g > 30 ? 0.4 : g > 15 ? 0.2 : 0.05,
    symbol: ['ETH', 'BTC', 'SOL'][Math.floor(Math.random() * 3)],
    phase: 'mempool',
  };
}

/**
 * Returns a live explanation message based on the current transaction state.
 * @param {Object|null} tx - The most recent pending/stuck/confirmed transaction
 * @param {Function} t - i18n translate function
 * @returns {{ icon: JSX.Element, message: string, color: string }}
 */
function getExplanation(tx, t) {
  if (!tx) return { icon: <Inbox className="w-4 h-4 text-slate-600" />, message: t('txFactory.explainIdle'), color: 'border-slate-700' };
  if (tx.status === 'pending') return { icon: <Clock className="w-4 h-4 text-amber animate-pulse" />, message: t('txFactory.explainPending', { gwei: tx.gasGwei }), color: 'border-amber/30' };
  if (tx.status === 'stuck') return { icon: <AlertTriangle className="w-4 h-4 text-red animate-pulse" />, message: t('txFactory.explainStuck'), color: 'border-red/30' };
  if (tx.status === 'confirmed') return { icon: <PackageCheck className="w-4 h-4 text-emerald" />, message: t('txFactory.explainConfirmed'), color: 'border-emerald/30' };
  return { icon: <Inbox className="w-4 h-4 text-slate-600" />, message: '', color: 'border-slate-700' };
}

/**
 * Transaction Factory with live mempool visualization,
 * gas slider, and real-time natural-language explanation panel.
 */
export default function TransactionFactory() {
  const { t } = useTranslation();
  const { balances, address, sendTransaction } = useWallet();

  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [gasIndex, setGasIndex] = useState(1);
  const [pendingTxs, setPendingTxs] = useState([]);
  const [mempoolTxs, setMempoolTxs] = useState(() =>
    Array.from({ length: 18 }, (_, i) => generateMempoolTx(i))
  );
  const [minedBubbles, setMinedBubbles] = useState([]);
  const nextIdRef = useRef(18);

  const gasTier = GAS_TIERS[gasIndex];
  const gasCostUSD = (gasTier.gwei * 21000 * 0.000000001 * 3500).toFixed(4);
  const latestTx = pendingTxs[0] || null;
  const explanation = getExplanation(latestTx, t);

  /** Animate mempool - bubbles float up, high-gas ones move to "Next Block" zone. */
  useEffect(() => {
    const interval = setInterval(() => {
      setMempoolTxs((prev) => {
        return prev.map((tx) => {
          let newY = tx.y - tx.speed;
          // High-gas user bubbles that reach the top => mined
          if (tx.isUser && tx.gas > 30 && newY < 5) {
            setMinedBubbles((mb) => [...mb, { ...tx, minedAt: Date.now() }]);
            return generateMempoolTx(nextIdRef.current++);
          }
          // Low-gas user bubbles oscillate in place (stuck)
          if (tx.isUser && tx.gas <= 15) {
            newY = tx.y + Math.sin(Date.now() / 500) * 0.3;
          }
          if (newY < -5) return generateMempoolTx(nextIdRef.current++);
          return { ...tx, y: newY };
        });
      });
      // Clear old mined bubbles
      setMinedBubbles((mb) => mb.filter((b) => Date.now() - b.minedAt < 3000));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  /** Process pending transactions. */
  useEffect(() => {
    if (pendingTxs.length === 0) return;
    const interval = setInterval(() => {
      setPendingTxs((prev) =>
        prev.map((tx) => {
          if (tx.status !== 'pending') return tx;
          const elapsed = Date.now() - tx.sentAt;
          const tier = GAS_TIERS.find((g) => g.key === tx.gasTier);
          if (tier.key === 'low' && elapsed > 5000 && elapsed < 15000) return { ...tx, status: 'stuck' };
          if (tier.key === 'low' && elapsed > 15000) return Math.random() < 0.5 ? { ...tx, status: 'confirmed', confirmedAt: Date.now() } : { ...tx, status: 'stuck' };
          if (tier.key === 'standard' && elapsed > 4000) return { ...tx, status: 'confirmed', confirmedAt: Date.now() };
          if (tier.key === 'fast' && elapsed > 2000) return { ...tx, status: 'confirmed', confirmedAt: Date.now() };
          if (tier.key === 'instant' && elapsed > 800) return { ...tx, status: 'confirmed', confirmedAt: Date.now() };
          return tx;
        })
      );
    }, 500);
    return () => clearInterval(interval);
  }, [pendingTxs]);

  /** Send transaction: add to pending + inject user bubble into mempool. */
  const handleSend = useCallback(() => {
    const qty = parseFloat(amount);
    if (!qty || qty <= 0 || !toAddress) return;
    if ((balances[selectedAsset] || 0) < qty) return;

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const nonce = Math.floor(Math.random() * 10000);

    sendTransaction({ type: 'send', symbol: selectedAsset, amount: qty, to: toAddress, hash: txHash, status: 'pending', gasTier: gasTier.key, gasGwei: gasTier.gwei, nonce });
    setPendingTxs((prev) => [{ hash: txHash, symbol: selectedAsset, amount: qty, to: toAddress, gasTier: gasTier.key, gasGwei: gasTier.gwei, status: 'pending', sentAt: Date.now(), nonce }, ...prev]);

    // Inject a visible user bubble into the mempool
    setMempoolTxs((prev) => [generateMempoolTx(nextIdRef.current++, true, gasTier.gwei), ...prev.slice(0, -1)]);

    setAmount('');
    setToAddress('');
  }, [amount, toAddress, selectedAsset, gasTier, balances, sendTransaction]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">{t('txFactory.title')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('txFactory.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* === SEND PANEL === */}
        <section className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            <Send className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />{t('txFactory.sendTransaction')}
          </h3>
          <div className="mb-3">
            <label className="block text-xs text-slate-500 mb-1">{t('txFactory.asset')}</label>
            <div className="flex gap-2 flex-wrap">
              {cryptoAssets.slice(0, 4).map((a) => (
                <button key={a.id} onClick={() => setSelectedAsset(a.symbol)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedAsset === a.symbol ? 'bg-cyber/10 text-cyber border border-cyber/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'}`}>{a.symbol}</button>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-1 font-mono">{t('txFactory.available')}: {(balances[selectedAsset] || 0).toFixed(6)} {selectedAsset}</p>
          </div>
          <div className="mb-2">
            <label className="block text-xs text-slate-500 mb-1">{t('txFactory.from')}</label>
            <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-500">{address}</div>
          </div>
          <div className="mb-2">
            <label className="block text-xs text-slate-500 mb-1">{t('txFactory.to')}</label>
            <input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="0x..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyber/50 transition-colors" />
            <button onClick={() => setToAddress(randomAddress())} className="text-[10px] text-cyber hover:text-cyber/80 mt-1">{t('txFactory.generateAddress')}</button>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-slate-500 mb-1">{t('txFactory.amount')}</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="any" min="0" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyber/50 transition-colors" />
          </div>
          {/* Gas Slider */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Fuel className="w-3.5 h-3.5 text-slate-500" />
              <label className="text-xs text-slate-500">{t('txFactory.gasFee')}<HelpTooltip term={t('txFactory.helpGas')} explanation={t('txFactory.helpGasDesc')} /></label>
            </div>
            <input type="range" min="0" max="3" step="1" value={gasIndex} onChange={(e) => setGasIndex(parseInt(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer mb-2" style={{ background: 'linear-gradient(to right, #ef4444, #f59e0b, #10b981, #38bdf8)' }} />
            <div className="flex justify-between mb-2">
              {GAS_TIERS.map((tier, i) => { const Icon = tier.icon; return (
                <button key={tier.key} onClick={() => setGasIndex(i)} className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg transition-all text-center ${gasIndex === i ? `bg-slate-800 border border-slate-700 ${tier.color}` : 'text-slate-600 hover:text-slate-400'}`}>
                  <Icon className="w-3 h-3" /><span className="text-[9px] font-semibold">{tier.label}</span><span className="text-[8px]">{tier.gwei} Gwei</span>
                </button>
              ); })}
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2.5 space-y-1">
              <div className="flex justify-between text-[11px]"><span className="text-slate-500">{t('txFactory.gasPrice')}<HelpTooltip term="Gwei" explanation={t('txFactory.helpGweiDesc')} /></span><span className={`font-mono ${gasTier.color}`}>{gasTier.gwei} Gwei</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-slate-500">{t('txFactory.estimatedCost')}</span><span className="text-white font-mono font-semibold">~${gasCostUSD}</span></div>
              <div className="flex justify-between text-[11px]"><span className="text-slate-500">{t('txFactory.estimatedTime')}</span><span className={`font-mono ${gasTier.color}`}>{gasTier.timeRange}</span></div>
            </div>
          </div>
          <button onClick={handleSend} disabled={!amount || !toAddress || parseFloat(amount) <= 0} className="w-full bg-cyber hover:bg-cyber/80 text-slate-950 font-semibold py-2.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />{t('txFactory.send')}
          </button>
        </section>

        {/* === MEMPOOL + NEXT BLOCK ZONE === */}
        <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{t('txFactory.mempool')}<HelpTooltip term={t('txFactory.helpMempool')} explanation={t('txFactory.helpMempoolDesc')} /></h3>
            <span className="text-xs text-slate-600 font-mono">{mempoolTxs.length} {t('txFactory.pending')}</span>
          </div>

          {/* Mempool + Next Block visual */}
          <div className="relative w-full h-[380px] bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
            {/* "Next Block" zone at top */}
            <div className="absolute top-0 left-0 right-0 h-[60px] bg-emerald/5 border-b border-emerald/20 flex items-center justify-center z-10">
              <span className="text-[10px] text-emerald/60 uppercase tracking-widest font-semibold">{t('txFactory.nextBlock')}</span>
            </div>
            {/* Mined flash bubbles */}
            {minedBubbles.map((b) => (
              <div key={b.id} className="absolute z-20 rounded-full bg-emerald/40 border-2 border-emerald animate-ping" style={{ left: `${b.x}%`, top: '20px', width: '28px', height: '28px' }} />
            ))}
            {/* Grid */}
            <div className="absolute inset-0 opacity-5">
              {Array.from({ length: 8 }).map((_, i) => (<div key={`h-${i}`} className="absolute w-full h-px bg-slate-400" style={{ top: `${(i + 1) * 11}%` }} />))}
              {Array.from({ length: 10 }).map((_, i) => (<div key={`v-${i}`} className="absolute h-full w-px bg-slate-400" style={{ left: `${(i + 1) * 9}%` }} />))}
            </div>
            {/* Bubbles */}
            {mempoolTxs.map((tx) => {
              const tierColor = tx.gas > 50 ? '#38bdf8' : tx.gas > 30 ? '#10b981' : tx.gas > 15 ? '#f59e0b' : '#ef4444';
              return (
                <div key={tx.id} className={`absolute rounded-full flex items-center justify-center transition-all duration-75 ${tx.isUser ? 'ring-2 ring-white/40 shadow-lg' : ''}`}
                  style={{ left: `${tx.x}%`, top: `${tx.y}%`, width: `${tx.size}px`, height: `${tx.size}px`, backgroundColor: tierColor + (tx.isUser ? '40' : '15'), border: `1.5px solid ${tierColor}${tx.isUser ? '80' : '30'}` }}
                  title={`${tx.amount} ${tx.symbol} | ${tx.gas} Gwei${tx.isUser ? ' (YOU)' : ''}`}>
                  {tx.size > 16 && <span className="text-[7px] font-mono font-bold" style={{ color: tierColor }}>{tx.isUser ? 'YOU' : tx.gas}</span>}
                </div>
              );
            })}
            {/* Legend */}
            <div className="absolute bottom-2 left-2 flex gap-2.5 bg-slate-900/80 backdrop-blur-sm rounded-lg px-2.5 py-1 z-10">
              {[{ label: t('txFactory.lowGas'), color: '#ef4444' }, { label: t('txFactory.medGas'), color: '#f59e0b' }, { label: t('txFactory.highGas'), color: '#10b981' }, { label: t('txFactory.urgentGas'), color: '#38bdf8' }].map((item) => (
                <span key={item.label} className="flex items-center gap-1 text-[8px] text-slate-500"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>
              ))}
            </div>
          </div>
        </section>

        {/* === LIVE EXPLANATION PANEL === */}
        <section className="lg:col-span-3 space-y-3">
          {/* Explanation Card */}
          <div className={`bg-slate-900 border ${explanation.color} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-cyber" />
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('txFactory.liveExplainer')}</h3>
            </div>
            <div className="flex items-start gap-2.5">
              {explanation.icon}
              <p className="text-xs text-slate-300 leading-relaxed">{explanation.message}</p>
            </div>
          </div>

          {/* Transaction Status List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">{t('txFactory.txStatus')}</h4>
            {pendingTxs.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-3">{t('txFactory.noTx')}</p>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {pendingTxs.map((tx) => (
                  <div key={tx.hash} className={`py-2 px-2.5 rounded-lg border ${tx.status === 'confirmed' ? 'bg-emerald/5 border-emerald/20' : tx.status === 'stuck' ? 'bg-red/5 border-red/20' : 'bg-slate-800/30 border-slate-700/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {tx.status === 'confirmed' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald" /> : tx.status === 'stuck' ? <AlertTriangle className="w-3.5 h-3.5 text-red" /> : <div className="w-3.5 h-3.5 border-2 border-cyber border-t-transparent rounded-full animate-spin" />}
                      <span className="text-[11px] text-white font-mono">{tx.amount.toFixed(4)} {tx.symbol}</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ml-auto ${tx.status === 'confirmed' ? 'bg-emerald/10 text-emerald' : tx.status === 'stuck' ? 'bg-red/10 text-red' : 'bg-amber/10 text-amber'}`}>
                        {tx.status === 'confirmed' ? t('txFactory.confirmed') : tx.status === 'stuck' ? t('txFactory.stuck') : t('txFactory.pendingStatus')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-600">
                      <span className="font-mono">{tx.hash.slice(0, 10)}...</span>
                      <ArrowRight className="w-2 h-2" />
                      <span className="font-mono">{tx.to.slice(0, 8)}...</span>
                      <span className="ml-auto">{tx.gasGwei} Gwei | Nonce<HelpTooltip term="Nonce" explanation={t('txFactory.helpNonceDesc')} size="w-2 h-2" />: {tx.nonce}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
