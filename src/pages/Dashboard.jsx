import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  Boxes,
  Gauge,
  Clock,
  Fuel,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { cryptoAssets, networkStats, generateBlock, generatePriceHistory } from '../store/simulationData';

/**
 * Global Dashboard page displaying simulated crypto market data,
 * network statistics, a live price chart, and recent blocks.
 */
export default function Dashboard() {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState(() =>
    Array.from({ length: 5 }, (_, i) => generateBlock(networkStats.blockHeight - i))
  );
  const [priceData] = useState(() => generatePriceHistory(24));

  /** Simulates new blocks arriving every 8 seconds. */
  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks((prev) => {
        const newHeight = prev[0].height + 1;
        return [generateBlock(newHeight), ...prev.slice(0, 4)];
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  /** Returns formatted time-ago string for a block timestamp. */
  function timeAgo(ts) {
    const seconds = Math.floor((Date.now() - ts) / 1000);
    return t('dashboard.timeAgo', { seconds });
  }

  const stats = [
    { label: t('dashboard.difficulty'), value: networkStats.difficulty, icon: Gauge, accent: 'text-cyber' },
    { label: t('dashboard.blockHeight'), value: networkStats.blockHeight.toLocaleString(), icon: Boxes, accent: 'text-cyber' },
    { label: t('dashboard.hashRate'), value: networkStats.hashRate, icon: Activity, accent: 'text-emerald' },
    { label: t('dashboard.pendingTx'), value: networkStats.pendingTx.toLocaleString(), icon: Clock, accent: 'text-amber' },
    { label: t('dashboard.gasPrice'), value: networkStats.gasPrice, icon: Fuel, accent: 'text-cyber' },
    { label: t('dashboard.totalWallets'), value: networkStats.totalWallets.toLocaleString(), icon: Users, accent: 'text-emerald' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white">{t('dashboard.title')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('app.subtitle')}</p>
      </div>

      {/* Network Stats Grid */}
      <section>
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
          {t('dashboard.networkStats')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* Chart + Market Table */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Price Chart */}
        <section className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            BTC {t('dashboard.price')} (24h)
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={['dataMin - 500', 'dataMax + 500']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '12px',
                  }}
                  formatter={(v) => [`$${v.toLocaleString()}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="url(#priceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Market Overview Table */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            {t('dashboard.marketOverview')}
          </h3>
          <div className="space-y-3">
            {cryptoAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: asset.color + '30', color: asset.color }}
                  >
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{asset.name}</p>
                    <p className="text-xs text-slate-500">{asset.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-white">
                    ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p
                    className={`text-xs font-mono flex items-center justify-end gap-1 ${
                      asset.change24h >= 0 ? 'text-emerald' : 'text-red'
                    }`}
                  >
                    {asset.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Live Chain - Recent Blocks */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            {t('dashboard.liveChain')}
          </h3>
          <button className="text-xs text-cyber hover:text-cyber/80 flex items-center gap-1 transition-colors">
            {t('dashboard.viewAll')} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {blocks.map((block, i) => (
            <div
              key={block.height}
              className={`shrink-0 w-[200px] bg-slate-800/50 border rounded-lg p-3 transition-all ${
                i === 0 ? 'border-cyber/40 shadow-[0_0_15px_rgba(56,189,248,0.1)]' : 'border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-cyber font-semibold">
                  #{block.height.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500">{timeAgo(block.timestamp)}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{t('dashboard.transactions')}</span>
                  <span className="text-slate-300 font-mono">{block.txCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{t('dashboard.miner')}</span>
                  <span className="text-slate-300 font-mono text-[11px]">{block.miner}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Size</span>
                  <span className="text-slate-300 font-mono">{block.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Chain connection line */}
        <div className="flex items-center justify-center mt-3 gap-1">
          {blocks.map((_, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-cyber' : 'bg-slate-700'}`} />
              {i < blocks.length - 1 && <div className="w-8 h-px bg-slate-700" />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
