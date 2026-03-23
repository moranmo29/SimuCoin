import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Blocks,
  ChevronDown,
  ChevronUp,
  Link2,
  AlertTriangle,
  Edit3,
  RotateCcw,
  Hash,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { generateChain, simpleHash, recalcChain } from '../store/hashUtils';
import HelpTooltip from '../components/HelpTooltip';

/**
 * Block Explorer page with horizontal chain visualization.
 * Features an "Edit Data" button that demonstrates blockchain immutability
 * by breaking the hash chain when data is tampered with.
 */
export default function BlockExplorer() {
  const { t } = useTranslation();
  const [chain, setChain] = useState(() => generateChain(6));
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);
  const [editData, setEditData] = useState('');
  const [chainBroken, setChainBroken] = useState(false);
  const scrollRef = useRef(null);

  /** Initiates data editing on a block. */
  function startEdit(index) {
    setEditingBlock(index);
    setEditData(chain[index].data);
  }

  /** Applies the tampered data, recalculates affected hashes, marks broken blocks. */
  function applyTamper() {
    if (editingBlock === null) return;
    const updated = [...chain];
    updated[editingBlock] = { ...updated[editingBlock], data: editData, tampered: true };
    // Recalculate this block's hash
    const newHash = simpleHash(updated[editingBlock].prevHash + editData + updated[editingBlock].nonce);
    updated[editingBlock].hash = newHash;
    // All subsequent blocks now have mismatched prevHash => broken
    for (let i = editingBlock + 1; i < updated.length; i++) {
      updated[i] = { ...updated[i], tampered: true };
      // Their stored prevHash no longer matches the actual previous block hash
    }
    setChain(updated);
    setChainBroken(true);
    setEditingBlock(null);
    setEditData('');
  }

  /** Resets the chain to a fresh valid state. */
  function resetChain() {
    setChain(generateChain(6));
    setChainBroken(false);
    setEditingBlock(null);
    setExpandedBlock(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t('explorer.title')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('explorer.subtitle')}</p>
        </div>
        <button onClick={resetChain} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg transition-colors">
          <RotateCcw className="w-3.5 h-3.5" />{t('explorer.reset')}
        </button>
      </div>

      {/* Chain Integrity Status */}
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${chainBroken ? 'bg-red/5 border-red/30' : 'bg-emerald/5 border-emerald/30'}`}>
        {chainBroken ? <ShieldAlert className="w-5 h-5 text-red shrink-0" /> : <ShieldCheck className="w-5 h-5 text-emerald shrink-0" />}
        <div>
          <span className={`text-sm font-semibold ${chainBroken ? 'text-red' : 'text-emerald'}`}>
            {chainBroken ? t('explorer.chainBroken') : t('explorer.chainValid')}
          </span>
          <p className="text-xs text-slate-500">{chainBroken ? t('explorer.chainBrokenDesc') : t('explorer.chainValidDesc')}</p>
        </div>
      </div>

      {/* Horizontal Chain Visualizer */}
      <div ref={scrollRef} className="overflow-x-auto pb-4">
        <div className="flex items-start gap-0 min-w-max">
          {chain.map((block, index) => {
            const isExpanded = expandedBlock === index;
            const isBroken = chainBroken && index > (chain.findIndex((b) => b.tampered)) && chain.findIndex((b) => b.tampered) >= 0;
            const isTampered = block.tampered;
            const prevBlock = index > 0 ? chain[index - 1] : null;
            const hashMismatch = prevBlock && block.prevHash !== prevBlock.hash;

            return (
              <div key={block.height} className="flex items-start">
                {/* Chain Link Arrow */}
                {index > 0 && (
                  <div className="flex flex-col items-center justify-center pt-12 px-1">
                    <div className={`w-8 h-0.5 ${hashMismatch || isBroken ? 'bg-red' : 'bg-emerald/40'}`} />
                    {hashMismatch && (
                      <div className="mt-1">
                        <AlertTriangle className="w-3 h-3 text-red animate-pulse" />
                      </div>
                    )}
                  </div>
                )}

                {/* Block Card */}
                <div className={`w-[220px] shrink-0 rounded-xl border-2 transition-all duration-500 ${
                  isTampered ? 'border-red/60 bg-red/5 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                }`}>
                  {/* Block Header */}
                  <div className={`px-3 py-2.5 border-b ${isTampered ? 'border-red/30' : 'border-slate-800'} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Blocks className={`w-4 h-4 ${isTampered ? 'text-red' : 'text-cyber'}`} />
                      <span className={`text-sm font-mono font-semibold ${isTampered ? 'text-red' : 'text-white'}`}>
                        #{block.height.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-600">{block.txCount} txns</span>
                  </div>

                  {/* Hash Display */}
                  <div className="px-3 py-2 space-y-2">
                    <div>
                      <span className="text-[9px] text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <Hash className="w-2.5 h-2.5" />{t('explorer.blockHash')}
                      </span>
                      <p className={`text-[10px] font-mono break-all ${isTampered ? 'text-red/80' : 'text-cyber/80'}`}>
                        {block.hash.slice(0, 20)}...
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <Link2 className="w-2.5 h-2.5" />{t('explorer.prevHash')}
                        <HelpTooltip term={t('explorer.helpPrevHash')} explanation={t('explorer.helpPrevHashDesc')} size="w-2.5 h-2.5" />
                      </span>
                      <p className={`text-[10px] font-mono break-all ${hashMismatch ? 'text-red/60 line-through' : 'text-slate-500'}`}>
                        {block.prevHash.slice(0, 20)}...
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-3 py-2 border-t border-slate-800/50 flex gap-2">
                    <button onClick={() => setExpandedBlock(isExpanded ? null : index)} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-white transition-colors">
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {t('explorer.details')}
                    </button>
                    {index < chain.length - 1 && (
                      <button onClick={() => startEdit(index)} className="flex items-center gap-1 text-[10px] text-amber hover:text-amber/80 transition-colors ml-auto">
                        <Edit3 className="w-3 h-3" />{t('explorer.editData')}
                      </button>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-3 py-2 border-t border-slate-800/50 space-y-1.5 text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-600">Nonce<HelpTooltip term="Nonce" explanation={t('txFactory.helpNonceDesc')} size="w-2 h-2" /></span><span className="text-slate-300 font-mono">{block.nonce.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">{t('explorer.timestamp')}</span><span className="text-slate-300 font-mono">{new Date(block.timestamp).toLocaleTimeString()}</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">{t('explorer.txCount')}</span><span className="text-slate-300 font-mono">{block.txCount}</span></div>
                      <div><span className="text-slate-600">{t('explorer.data')}</span><p className="text-slate-400 font-mono mt-0.5 break-all">{block.data}</p></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {editingBlock !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber/30 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber" />
              <h3 className="text-lg font-semibold text-white">{t('explorer.tamperTitle')}</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">{t('explorer.tamperDesc')}</p>
            <label className="block text-xs text-slate-500 mb-1">{t('explorer.blockData')} (Block #{chain[editingBlock].height})</label>
            <textarea
              value={editData}
              onChange={(e) => setEditData(e.target.value)}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber/50 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={applyTamper} className="flex-1 bg-red hover:bg-red/80 text-white font-semibold py-2 rounded-lg text-sm transition-colors">
                {t('explorer.tamperApply')}
              </button>
              <button onClick={() => { setEditingBlock(null); setEditData(''); }} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-lg text-sm transition-colors">
                {t('explorer.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
