import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Tag,
  CandlestickChart,
  Clock,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useWallet } from '../store/WalletContext';
import { cryptoAssets, generatePriceHistory } from '../store/simulationData';
import HelpTooltip from '../components/HelpTooltip';

/**
 * Simulated order book entries for visual authenticity.
 * @param {number} basePrice - Center price for the order book
 * @returns {{ bids: Array, asks: Array }} Order book data
 */
function generateOrderBook(basePrice) {
  const bids = Array.from({ length: 8 }, (_, i) => ({
    price: basePrice * (1 - (i + 1) * 0.001),
    amount: (Math.random() * 2 + 0.1).toFixed(4),
    total: (Math.random() * 50000 + 5000).toFixed(2),
  }));
  const asks = Array.from({ length: 8 }, (_, i) => ({
    price: basePrice * (1 + (i + 1) * 0.001),
    amount: (Math.random() * 2 + 0.1).toFixed(4),
    total: (Math.random() * 50000 + 5000).toFixed(2),
  }));
  return { bids, asks };
}

/**
 * CEX-style Exchange page with buy/sell panel, live chart,
 * order book simulation, and recent trade history.
 */
export default function Exchange() {
  const { t } = useTranslation();
  const { balances, buyCrypto, sellCrypto, transactions } = useWallet();
  const [selectedAsset, setSelectedAsset] = useState(cryptoAssets[0]);
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(null);

  const priceData = useMemo(() => generatePriceHistory(48), [selectedAsset.id]);
  const orderBook = useMemo(() => generateOrderBook(selectedAsset.price), [selectedAsset.id]);
  const usdCost = amount ? (parseFloat(amount) * selectedAsset.price).toFixed(2) : '0.00';

  /** Handles the simulated buy/sell order execution. */
  function handleOrder() {
    const qty = parseFloat(amount);
    if (!qty || qty <= 0) return;
    if (side === 'buy') {
      if (balances.USD < qty * selectedAsset.price) return;
      buyCrypto(selectedAsset.symbol, qty, selectedAsset.price);
    } else {
      if ((balances[selectedAsset.symbol] || 0) < qty) return;
      sellCrypto(selectedAsset.symbol, qty, selectedAsset.price);
    }
    setOrderPlaced({ side, symbol: selectedAsset.symbol, qty, price: selectedAsset.price });
    setAmount('');
    setTimeout(() => setOrderPlaced(null), 3000);
  }

  /** Fills the amount field to max available. */
  function handleMax() {
    if (side === 'buy') {
      const maxQty = balances.USD / selectedAsset.price;
      setAmount(maxQty.toFixed(6));
    } else {
      setAmount(String(balances[selectedAsset.symbol] || 0));
    }
  }

  const recentExchangeTx = transactions.filter((tx) => tx.type === 'buy' || tx.type === 'sell').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t('exchange.title')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('exchange.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2">
          <DollarSign className="w-4 h-4 text-emerald" />
          <span className="text-sm text-slate-400">{t('exchange.balance')}:</span>
          <span className="text-sm font-mono font-semibold text-emerald">
            ${balances.USD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Asset Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {cryptoAssets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm shrink-0 transition-colors ${
              selectedAsset.id === asset.id
                ? 'bg-cyber/10 text-cyber border border-cyber/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: asset.color + '30', color: asset.color }}
            >
              {asset.symbol[0]}
            </div>
            <span className="font-medium">{asset.symbol}</span>
            <span className={`text-xs font-mono ${asset.change24h >= 0 ? 'text-emerald' : 'text-red'}`}>
              {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid: Chart + Order Panel + Order Book */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Price Chart */}
        <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CandlestickChart className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                {selectedAsset.symbol}/USD
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-semibold text-white">
                ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-mono flex items-center gap-0.5 ${
                selectedAsset.change24h >= 0 ? 'text-emerald' : 'text-red'
              }`}>
                {selectedAsset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h}%
              </span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="exGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedAsset.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={selectedAsset.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} interval={7} />
                <YAxis
                  domain={['dataMin - 300', 'dataMax + 300']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                  width={52}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' }}
                  formatter={(v) => [`$${v.toLocaleString()}`, 'Price']}
                />
                <Area type="monotone" dataKey="price" stroke={selectedAsset.color} strokeWidth={2} fill="url(#exGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Buy/Sell Order Panel */}
        <section className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
            {t('exchange.placeOrder')}
            <HelpTooltip
              term={t('exchange.helpMarketOrder')}
              explanation={t('exchange.helpMarketOrderDesc')}
            />
          </h3>

          {/* Buy / Sell Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700 mb-4">
            <button
              onClick={() => setSide('buy')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                side === 'buy' ? 'bg-emerald/20 text-emerald' : 'bg-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              {t('exchange.buy')}
            </button>
            <button
              onClick={() => setSide('sell')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                side === 'sell' ? 'bg-red/20 text-red' : 'bg-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Tag className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              {t('exchange.sell')}
            </button>
          </div>

          {/* Available balance */}
          <div className="text-xs text-slate-500 mb-1">
            {t('exchange.available')}:
            <span className="text-slate-300 font-mono ml-1">
              {side === 'buy'
                ? `$${balances.USD.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : `${(balances[selectedAsset.symbol] || 0).toFixed(6)} ${selectedAsset.symbol}`}
            </span>
          </div>

          {/* Amount Input */}
          <div className="relative mb-3">
            <label className="block text-xs text-slate-500 mb-1">
              {t('exchange.amount')} ({selectedAsset.symbol})
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="any"
                min="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyber/50 transition-colors"
              />
              <button
                onClick={handleMax}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-cyber hover:text-cyber/80 bg-cyber/10 px-2 py-0.5 rounded"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Price Display */}
          <div className="bg-slate-800/50 rounded-lg p-3 mb-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{t('exchange.price')}</span>
              <span className="text-slate-300 font-mono">${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{t('exchange.total')}</span>
              <span className="text-white font-mono font-semibold">${usdCost}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">
                {t('exchange.fee')}
                <HelpTooltip term={t('exchange.helpFee')} explanation={t('exchange.helpFeeDesc')} />
              </span>
              <span className="text-slate-400 font-mono">0.1%</span>
            </div>
          </div>

          {/* Execute Button */}
          <button
            onClick={handleOrder}
            disabled={!amount || parseFloat(amount) <= 0}
            className={`w-full py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              side === 'buy'
                ? 'bg-emerald hover:bg-emerald/80 text-slate-950'
                : 'bg-red hover:bg-red/80 text-white'
            }`}
          >
            {side === 'buy' ? t('exchange.buyAction') : t('exchange.sellAction')} {selectedAsset.symbol}
          </button>

          {/* Order Confirmation Toast */}
          {orderPlaced && (
            <div className={`mt-3 p-3 rounded-lg border text-xs animate-pulse ${
              orderPlaced.side === 'buy'
                ? 'bg-emerald/10 border-emerald/30 text-emerald'
                : 'bg-red/10 border-red/30 text-red'
            }`}>
              {orderPlaced.side === 'buy' ? t('exchange.bought') : t('exchange.sold')}{' '}
              {orderPlaced.qty.toFixed(6)} {orderPlaced.symbol} @ ${orderPlaced.price.toLocaleString()}
            </div>
          )}

          {/* Spacer to push content down */}
          <div className="flex-1" />
        </section>

        {/* Order Book */}
        <section className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
            {t('exchange.orderBook')}
            <HelpTooltip term={t('exchange.helpOrderBook')} explanation={t('exchange.helpOrderBookDesc')} />
          </h3>

          {/* Header */}
          <div className="grid grid-cols-3 text-[10px] text-slate-600 uppercase tracking-wider mb-2 px-1">
            <span>{t('exchange.price')} (USD)</span>
            <span className="text-center">{t('exchange.amount')} ({selectedAsset.symbol})</span>
            <span className="text-right">{t('exchange.total')}</span>
          </div>

          {/* Asks (sells) - top, red */}
          <div className="space-y-0.5 mb-2">
            {orderBook.asks.slice().reverse().map((ask, i) => (
              <div key={`ask-${i}`} className="relative grid grid-cols-3 text-xs px-1 py-0.5 rounded">
                <div
                  className="absolute inset-0 bg-red/5 rounded"
                  style={{ width: `${Math.min(100, (parseFloat(ask.amount) / 2) * 100)}%`, right: 0, left: 'auto' }}
                />
                <span className="text-red font-mono relative z-10">${ask.price.toFixed(2)}</span>
                <span className="text-slate-400 font-mono text-center relative z-10">{ask.amount}</span>
                <span className="text-slate-500 font-mono text-right relative z-10">${ask.total}</span>
              </div>
            ))}
          </div>

          {/* Spread / Current Price */}
          <div className="flex items-center justify-center gap-2 py-2 border-y border-slate-800 my-2">
            <span className="text-base font-mono font-semibold text-white">
              ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-500">
              {t('exchange.spread')}: 0.02%
            </span>
          </div>

          {/* Bids (buys) - bottom, green */}
          <div className="space-y-0.5">
            {orderBook.bids.map((bid, i) => (
              <div key={`bid-${i}`} className="relative grid grid-cols-3 text-xs px-1 py-0.5 rounded">
                <div
                  className="absolute inset-0 bg-emerald/5 rounded"
                  style={{ width: `${Math.min(100, (parseFloat(bid.amount) / 2) * 100)}%`, right: 0, left: 'auto' }}
                />
                <span className="text-emerald font-mono relative z-10">${bid.price.toFixed(2)}</span>
                <span className="text-slate-400 font-mono text-center relative z-10">{bid.amount}</span>
                <span className="text-slate-500 font-mono text-right relative z-10">${bid.total}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Trades */}
      {recentExchangeTx.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
            {t('exchange.recentTrades')}
          </h3>
          <div className="space-y-2">
            {recentExchangeTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    tx.type === 'buy' ? 'bg-emerald/10 text-emerald' : 'bg-red/10 text-red'
                  }`}>
                    {tx.type.toUpperCase()}
                  </span>
                  <span className="text-sm text-white font-mono">{tx.amount.toFixed(6)} {tx.symbol}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-slate-300 font-mono">${tx.total.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-600 ml-2">@ ${tx.price.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
