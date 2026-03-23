import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  Key,
  Copy,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useWallet } from '../store/WalletContext';
import { cryptoAssets } from '../store/simulationData';
import HelpTooltip from '../components/HelpTooltip';

/**
 * Wallet page showing seed phrase, address, private key,
 * portfolio balances, and transaction history.
 */
export default function WalletPage() {
  const { t } = useTranslation();
  const {
    balances, transactions, walletCreated, seedPhrase,
    address, fullAddress, privateKey, createWallet,
  } = useWallet();
  const [showSeed, setShowSeed] = useState(false);
  const [showPrivKey, setShowPrivKey] = useState(false);
  const [copied, setCopied] = useState('');

  /** Copies text to clipboard and shows brief confirmation. */
  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  /** Calculates total portfolio value in USD. */
  const portfolioValue = cryptoAssets.reduce((sum, asset) => {
    return sum + (balances[asset.symbol] || 0) * asset.price;
  }, balances.USD);

  if (!walletCreated) {
    return (
      <div className="max-w-lg mx-auto mt-16">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-cyber/10 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-cyber" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">{t('wallet.createTitle')}</h2>
          <p className="text-sm text-slate-500 mb-6">{t('wallet.createDesc')}</p>
          <button
            onClick={createWallet}
            className="bg-gradient-to-r from-cyber to-emerald text-slate-950 font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            {t('wallet.generate')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t('wallet.title')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('wallet.subtitle')}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2">
          <span className="text-xs text-slate-500">{t('wallet.portfolio')}</span>
          <p className="text-lg font-mono font-semibold text-emerald">
            ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Seed Phrase Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-amber" />
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              {t('wallet.seedPhrase')}
              <HelpTooltip term={t('wallet.helpSeed')} explanation={t('wallet.helpSeedDesc')} />
            </h3>
          </div>

          <div className="bg-amber/5 border border-amber/20 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber/80">{t('wallet.seedWarning')}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {seedPhrase.map((word, i) => (
              <div
                key={i}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-center"
              >
                <span className="text-[10px] text-slate-600 mr-1">{i + 1}.</span>
                <span className={`text-xs font-mono ${showSeed ? 'text-white' : 'text-transparent bg-slate-700 rounded select-none'}`}>
                  {showSeed ? word : '------'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSeed((s) => !s)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              {showSeed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showSeed ? t('wallet.hide') : t('wallet.reveal')}
            </button>
            <button
              onClick={() => copyToClipboard(seedPhrase.join(' '), 'seed')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied === 'seed' ? <CheckCircle2 className="w-3 h-3 text-emerald" /> : <Copy className="w-3 h-3" />}
              {copied === 'seed' ? t('wallet.copied') : t('wallet.copy')}
            </button>
          </div>
        </section>

        {/* Address & Keys Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-cyber" />
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              {t('wallet.keysTitle')}
            </h3>
          </div>

          {/* Public Address */}
          <div className="mb-4">
            <span className="text-xs text-slate-500 block mb-1">
              {t('wallet.publicAddress')}
              <HelpTooltip term={t('wallet.helpAddress')} explanation={t('wallet.helpAddressDesc')} />
            </span>
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5">
              <span className="text-xs font-mono text-cyber flex-1 truncate">{fullAddress}</span>
              <button
                onClick={() => copyToClipboard(fullAddress, 'address')}
                className="text-slate-500 hover:text-white transition-colors shrink-0"
              >
                {copied === 'address' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Private Key */}
          <div>
            <span className="text-xs text-slate-500 block mb-1">
              {t('wallet.privateKey')}
              <HelpTooltip term={t('wallet.helpPrivKey')} explanation={t('wallet.helpPrivKeyDesc')} />
            </span>
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5">
              <span className={`text-xs font-mono flex-1 truncate ${showPrivKey ? 'text-red' : 'text-transparent bg-slate-700 rounded select-none'}`}>
                {showPrivKey ? privateKey : '••••••••••••••••••••••••••••••••'}
              </span>
              <button
                onClick={() => setShowPrivKey((s) => !s)}
                className="text-slate-500 hover:text-white transition-colors shrink-0"
              >
                {showPrivKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-red/60 mt-1">{t('wallet.privKeyWarning')}</p>
          </div>
        </section>
      </div>

      {/* Portfolio Balances */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          {t('wallet.balances')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* USD */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
            <span className="text-xs text-slate-500">USD</span>
            <p className="text-lg font-mono font-semibold text-emerald mt-1">
              ${balances.USD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          {/* Crypto Assets */}
          {cryptoAssets.map((asset) => (
            <div key={asset.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
              <span className="text-xs text-slate-500">{asset.symbol}</span>
              <p className="text-lg font-mono font-semibold text-white mt-1">
                {(balances[asset.symbol] || 0).toFixed(6)}
              </p>
              <p className="text-[10px] text-slate-600 font-mono">
                ~${((balances[asset.symbol] || 0) * asset.price).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            {t('wallet.history')}
          </h3>
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    tx.type === 'buy' ? 'bg-emerald/10' : tx.type === 'sell' ? 'bg-red/10' : 'bg-cyber/10'
                  }`}>
                    {tx.type === 'buy' ? (
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald" />
                    ) : tx.type === 'sell' ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-red" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5 text-cyber" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-white">
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} {tx.symbol}
                    </span>
                    <p className="text-[10px] text-slate-600 font-mono">{tx.hash}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-mono ${tx.type === 'buy' ? 'text-emerald' : 'text-red'}`}>
                    {tx.type === 'buy' ? '+' : '-'}{tx.amount.toFixed(6)}
                  </span>
                  <p className="text-[10px] text-slate-600">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
