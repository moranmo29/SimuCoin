import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Search,
  Bell,
  User,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat2,
  Shield,
  CreditCard,
  HelpCircle,
  Info,
  ChevronRight,
  Copy,
  Check,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wallet,
  Compass,
  LineChart,
  Briefcase,
  Smartphone,
} from 'lucide-react';
import { useWallet } from '../store/WalletContext';
import { mobileTokens, userProfile, recentActivity, sortTokens, generateSparkline } from '../store/mobileWalletData';

/**
 * Mobile Wallet Demo — interactive phone-frame mockup showcasing
 * a Binance-style crypto wallet app with 8 navigable screens.
 */
export default function MobileWalletDemo() {
  const { t } = useTranslation();
  const {
    balances, seedPhrase, address, fullAddress,
    walletCreated, createWallet, sendTransaction,
    buyCrypto, sellCrypto,
  } = useWallet();

  // ── Screen Navigation ──────────────────────────
  const [screen, setScreen] = useState('home');
  const [prevScreen, setPrevScreen] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [history, setHistory] = useState(['home']);

  /** Navigate to a new screen, pushing to history. */
  const navigate = useCallback((to, token = null) => {
    setPrevScreen(screen);
    setScreen(to);
    if (token) setSelectedToken(token);
    setHistory(prev => [...prev, to]);
  }, [screen]);

  /** Navigate back in history. */
  const goBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length <= 1) return prev;
      const newHist = prev.slice(0, -1);
      const target = newHist[newHist.length - 1];
      setPrevScreen(screen);
      setScreen(target);
      return newHist;
    });
  }, [screen]);

  // ── Home Screen State ──────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [coinFilter, setCoinFilter] = useState('all');
  const [bannerIndex, setBannerIndex] = useState(0);

  // Banner carousel auto-rotation
  useEffect(() => {
    const timer = setInterval(() => setBannerIndex(i => (i + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  // ── Email Verification State ───────────────────
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /** Simulates sending a verification code. */
  function handleSendCode() {
    if (!email.includes('@')) return;
    setCodeSent(true);
    setCountdown(60);
    setOtpDigits(['', '', '', '', '', '']);
  }

  /** Handles OTP digit input. */
  function handleOtpChange(index, value) {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  /** Simulates email verification. */
  function handleVerify() {
    if (otpDigits.every(d => d !== '')) {
      setEmailVerified(true);
    }
  }

  // ── Send Screen State ──────────────────────────
  const [sendToken, setSendToken] = useState(null);
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  function handleSend() {
    if (!sendToken || !sendAddress || !sendAmount || Number(sendAmount) <= 0) return;
    sendTransaction({
      type: 'send',
      symbol: sendToken.symbol,
      amount: Number(sendAmount),
      to: sendAddress,
      status: 'confirmed',
      hash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    });
    setSendSuccess(true);
    setTimeout(() => { setSendSuccess(false); navigate('web3wallet'); }, 2000);
  }

  // ── Buy Screen State ───────────────────────────
  const [buyToken, setBuyToken] = useState(null);
  const [buyUsdAmount, setBuyUsdAmount] = useState('');
  const [buyPayment, setBuyPayment] = useState('card');
  const [buySuccess, setBuySuccess] = useState(false);
  const [buyStep, setBuyStep] = useState('form'); // 'form' | 'confirm' | 'processing'

  function handleBuy() {
    const token = buyToken || mobileTokens[0];
    const usd = Number(buyUsdAmount);
    if (!usd || usd <= 0) return;
    setBuyStep('processing');
    setTimeout(() => {
      buyCrypto(token.symbol, usd / token.price, token.price);
      setBuySuccess(true);
      setBuyStep('form');
      setTimeout(() => { setBuySuccess(false); navigate('web3wallet'); }, 2000);
    }, 1500);
  }

  // ── Sell Screen State ──────────────────────────
  const [sellToken, setSellToken] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  const [sellSuccess, setSellSuccess] = useState(false);
  const [sellStep, setSellStep] = useState('form');

  function handleSell() {
    const token = sellToken || mobileTokens[0];
    const amt = Number(sellAmount);
    if (!amt || amt <= 0 || amt > token.balance) return;
    setSellStep('processing');
    setTimeout(() => {
      sellCrypto(token.symbol, amt, token.price);
      setSellSuccess(true);
      setSellStep('form');
      setTimeout(() => { setSellSuccess(false); navigate('web3wallet'); }, 2000);
    }, 1500);
  }

  // ── Swap Screen State ──────────────────────────
  const [swapFrom, setSwapFrom] = useState(null);
  const [swapTo, setSwapTo] = useState(null);
  const [swapAmount, setSwapAmount] = useState('');
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [swapStep, setSwapStep] = useState('form');

  function handleSwap() {
    const from = swapFrom || mobileTokens[0];
    const to = swapTo || mobileTokens[1];
    const amt = Number(swapAmount);
    if (!amt || amt <= 0 || amt > from.balance) return;
    setSwapStep('processing');
    setTimeout(() => {
      const toAmt = (amt * from.price) / to.price;
      sellCrypto(from.symbol, amt, from.price);
      buyCrypto(to.symbol, toAmt, to.price);
      setSwapSuccess(true);
      setSwapStep('form');
      setTimeout(() => { setSwapSuccess(false); navigate('web3wallet'); }, 2000);
    }, 1500);
  }

  // ── Receive Screen State ───────────────────────
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef(null);

  /** Draws a simple QR-code-like pattern on canvas. */
  useEffect(() => {
    if (screen !== 'receive' || !qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 180;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    const cellSize = 6;
    const grid = size / cellSize;

    // Draw finder patterns (3 corners)
    function drawFinder(ox, oy) {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const fill = (y === 0 || y === 6 || x === 0 || x === 6) ||
                       (y >= 2 && y <= 4 && x >= 2 && x <= 4);
          if (fill) ctx.fillRect((ox + x) * cellSize, (oy + y) * cellSize, cellSize, cellSize);
        }
      }
    }
    drawFinder(0, 0);
    drawFinder(grid - 7, 0);
    drawFinder(0, grid - 7);

    // Fill random data pattern
    const addrHash = fullAddress || '0x7F4e21bC5D8a93E1f6A0b4c7D2e5F8a1B3C9d4E6';
    let seed = 0;
    for (let i = 0; i < addrHash.length; i++) seed = ((seed << 5) - seed + addrHash.charCodeAt(i)) | 0;
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        if ((x < 8 && y < 8) || (x >= grid - 8 && y < 8) || (x < 8 && y >= grid - 8)) continue;
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        if (seed % 3 === 0) ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }, [screen, fullAddress]);

  function copyAddress() {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Create Wallet State ────────────────────────
  const [seedRevealed, setSeedRevealed] = useState(false);

  // ── Sparkline Data ─────────────────────────────
  const [sparklines] = useState(() => {
    const map = {};
    mobileTokens.forEach(t => { map[t.symbol] = generateSparkline(20, t.price); });
    return map;
  });

  // ── Token Filtering & Sorting ──────────────────
  const filteredTokens = (() => {
    let tokens = [...mobileTokens];
    if (searchQuery) tokens = tokens.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (coinFilter === 'gainers') tokens = sortTokens(tokens, 'change').filter(t => t.change24h > 0);
    else if (coinFilter === 'new') tokens = tokens.slice(-4).reverse();
    return tokens;
  })();

  // ── Sparkline SVG helper ───────────────────────
  function SparklineSVG({ data, color, width = 60, height = 24 }) {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((v, i) =>
      `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`
    ).join(' ');
    return (
      <svg width={width} height={height} className="shrink-0">
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
    );
  }

  // ── Format helpers ─────────────────────────────
  function formatUSD(v) {
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (v >= 1000) return '$' + v.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (v >= 1) return '$' + v.toFixed(2);
    return '$' + v.toFixed(6);
  }

  function formatBalance(b, symbol) {
    if (b >= 1e6) return (b / 1e6).toFixed(2) + 'M';
    if (b >= 1000) return b.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (b >= 1) return b.toFixed(4);
    return b.toFixed(8);
  }

  const totalBalance = mobileTokens.reduce((sum, t) => sum + t.balance * t.price, 0);

  // ── Time formatting ────────────────────────────
  function timeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  // ── Status Bar ─────────────────────────────────
  function StatusBar() {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return (
      <div className="flex items-center justify-between px-5 py-1.5 text-[11px] font-semibold text-white bg-black">
        <span>{time}</span>
        <div className="flex items-center gap-1">
          <svg width="16" height="11" viewBox="0 0 16 11" fill="white"><rect x="0" y="5" width="3" height="6" rx="0.5"/><rect x="4.5" y="3" width="3" height="8" rx="0.5"/><rect x="9" y="1" width="3" height="10" rx="0.5"/><rect x="13" y="0" width="3" height="11" rx="0.5" opacity="0.3"/></svg>
          <svg width="15" height="11" viewBox="0 0 15 11" fill="white"><path d="M7.5 3.5C9.3 3.5 11 4.2 12.2 5.4L13.6 4C12 2.4 9.8 1.5 7.5 1.5S3 2.4 1.4 4L2.8 5.4C4 4.2 5.7 3.5 7.5 3.5ZM7.5 7C8.3 7 9 7.3 9.6 7.8L7.5 10L5.4 7.8C6 7.3 6.7 7 7.5 7Z"/></svg>
          <svg width="24" height="11" viewBox="0 0 24 11" fill="white"><rect x="0" y="1" width="20" height="9" rx="2" stroke="white" strokeWidth="1" fill="none"/><rect x="21" y="3.5" width="2" height="4" rx="0.5"/><rect x="1.5" y="2.5" width="13" height="6" rx="1" fill="#4ade80"/></svg>
        </div>
      </div>
    );
  }

  // ── Bottom Tab Bar ─────────────────────────────
  function BottomTabs() {
    const tabs = [
      { key: 'home', icon: BarChart3, label: t('mobileWallet.tabMarkets') },
      { key: 'web3wallet', icon: Wallet, label: t('mobileWallet.tabWallet') },
      { key: 'trade', icon: LineChart, label: t('mobileWallet.tabTrade') },
      { key: 'profile', icon: Compass, label: t('mobileWallet.tabDiscover') },
      { key: 'web3wallet', icon: Briefcase, label: t('mobileWallet.tabPortfolio'), altKey: 'portfolio' },
    ];
    return (
      <div className="flex items-center justify-around bg-[#0b0e11] border-t border-slate-800 py-1.5 shrink-0">
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = screen === tab.key || (tab.altKey && screen === tab.altKey);
          return (
            <button
              key={i}
              onClick={() => {
                if (tab.key === 'trade') { navigate('tokenDetail', mobileTokens[0]); }
                else navigate(tab.key);
              }}
              className={`flex flex-col items-center gap-0.5 px-2 py-0.5 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Screen Header ──────────────────────────────
  function ScreenHeader({ title, showBack = false, rightContent = null }) {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-[#0b0e11]">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={goBack} className="text-white p-1 -ml-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="text-white font-semibold text-sm">{title}</span>
        </div>
        {rightContent}
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // SCREEN RENDERERS
  // ═══════════════════════════════════════════════

  /** Home / Markets screen */
  function HomeScreen() {
    const banners = [
      { title: t('mobileWallet.bannerTitle'), desc: t('mobileWallet.bannerDesc'), bg: 'from-amber-500/20 to-amber-600/5' },
      { title: 'Earn up to 12% APY', desc: 'Flexible savings on 100+ assets', bg: 'from-emerald-500/20 to-emerald-600/5' },
      { title: 'Zero-fee trading', desc: 'Selected BTC pairs, limited time', bg: 'from-cyan-500/20 to-cyan-600/5' },
    ];
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0b0e11]">
          <button onClick={() => navigate('profile')} className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-300" />
          </button>
          <div className="flex-1 flex items-center bg-slate-800 rounded-lg px-3 py-1.5 gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('mobileWallet.searchPlaceholder')}
              className="bg-transparent text-xs text-white placeholder:text-slate-500 outline-none flex-1"
            />
          </div>
          <button className="text-slate-400"><Bell className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Banner carousel */}
          <div className="px-4 py-3">
            <div className={`bg-gradient-to-r ${banners[bannerIndex].bg} rounded-xl p-4 transition-all duration-500`}>
              <h3 className="text-white text-sm font-semibold">{banners[bannerIndex].title}</h3>
              <p className="text-slate-400 text-[10px] mt-0.5">{banners[bannerIndex].desc}</p>
              <div className="flex gap-1 mt-2">
                {banners.map((_, i) => (
                  <div key={i} className={`w-4 h-1 rounded-full ${i === bannerIndex ? 'bg-amber-400' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Coin filter tabs */}
          <div className="flex gap-4 px-4 mb-2">
            {[
              { key: 'all', label: t('mobileWallet.allCoins') },
              { key: 'gainers', label: t('mobileWallet.topGainers') },
              { key: 'new', label: t('mobileWallet.newListings') },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setCoinFilter(f.key)}
                className={`text-[11px] pb-1 transition-colors ${coinFilter === f.key ? 'text-amber-400 border-b border-amber-400' : 'text-slate-500'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Coin list */}
          <div className="px-4">
            {filteredTokens.map(token => (
              <button
                key={token.symbol}
                onClick={() => navigate('tokenDetail', token)}
                className="flex items-center w-full py-3 border-b border-slate-800/50 gap-3 text-left"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: token.color + '22' }}>
                  <span style={{ color: token.color }}>{token.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-medium">{token.symbol}</span>
                    <span className="text-white text-xs font-mono">{formatUSD(token.price)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-slate-500 text-[10px]">{token.name}</span>
                    <div className="flex items-center gap-1.5">
                      <SparklineSVG data={sparklines[token.symbol]} color={token.change24h >= 0 ? '#4ade80' : '#f87171'} />
                      <span className={`text-[10px] font-mono ${token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /** Web3 Wallet screen */
  function Web3WalletScreen() {
    return (
      <div className="flex flex-col h-full">
        <ScreenHeader title={t('mobileWallet.walletTitle')} />
        <div className="flex-1 overflow-y-auto">
          {/* Balance card */}
          <div className="px-4 py-4">
            <p className="text-slate-500 text-[10px] uppercase tracking-wider">{t('mobileWallet.totalBalance')}</p>
            <p className="text-white text-2xl font-bold mt-1">${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <div className="flex gap-3 mt-4">
              {[
                { label: t('mobileWallet.send'), icon: ArrowUpRight, action: () => navigate('send') },
                { label: t('mobileWallet.receive'), icon: ArrowDownLeft, action: () => navigate('receive') },
                { label: t('mobileWallet.swap'), icon: Repeat2, action: () => navigate('swap') },
                { label: t('mobileWallet.buy'), icon: TrendingUp, action: () => navigate('buy') },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <btn.icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[9px] text-slate-400">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tokens / NFTs toggle */}
          <div className="flex gap-4 px-4 mb-2 border-b border-slate-800">
            <span className="text-amber-400 text-xs pb-2 border-b border-amber-400">{t('mobileWallet.tokens')}</span>
            <span className="text-slate-500 text-xs pb-2">{t('mobileWallet.nfts')}</span>
          </div>

          {/* Token list */}
          <div className="px-4">
            {sortTokens(mobileTokens, 'value').map(token => {
              const usdValue = token.balance * token.price;
              return (
                <button
                  key={token.symbol}
                  onClick={() => navigate('tokenDetail', token)}
                  className="flex items-center w-full py-3 border-b border-slate-800/50 gap-3 text-left"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: token.color + '22' }}>
                    <span style={{ color: token.color }}>{token.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-medium">{token.symbol}</span>
                      <span className="text-white text-xs font-mono">{formatUSD(usdValue)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-slate-500 text-[10px]">{formatBalance(token.balance)} {token.symbol}</span>
                      <span className={`text-[10px] font-mono ${token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /** Profile screen */
  function ProfileScreen() {
    const menuItems = [
      { icon: Shield, label: t('mobileWallet.security'), value: t('mobileWallet.twoFactor') },
      { icon: CreditCard, label: t('mobileWallet.paymentMethods'), value: '' },
      { icon: Bell, label: t('mobileWallet.notifications'), value: '' },
      { icon: HelpCircle, label: t('mobileWallet.helpCenter'), value: '' },
      { icon: Info, label: t('mobileWallet.about'), value: '' },
    ];
    return (
      <div className="flex flex-col h-full">
        <ScreenHeader title={t('mobileWallet.profileTitle')} />
        <div className="flex-1 overflow-y-auto">
          {/* User card */}
          <div className="px-4 py-4 flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xl font-bold text-black">
              S
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{userProfile.email}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">VIP {userProfile.vipLevel}</span>
                <span className="text-slate-500 text-[10px]">{t('mobileWallet.uid')}: {userProfile.uid}</span>
              </div>
            </div>
          </div>

          {/* KYC status */}
          <div className="mx-4 mb-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-xs">{t('mobileWallet.kycStatus')}: {t('mobileWallet.kycVerified')}</span>
          </div>

          {/* Referral */}
          <div className="mx-4 mb-3 bg-slate-800 rounded-lg px-3 py-2 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-[10px]">{t('mobileWallet.referral')}</span>
              <p className="text-amber-400 text-xs font-mono mt-0.5">{userProfile.referralCode}</p>
            </div>
            <Copy className="w-4 h-4 text-slate-500" />
          </div>

          {/* Menu items */}
          <div className="px-4">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center py-3 border-b border-slate-800/50 gap-3">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="text-white text-xs flex-1">{item.label}</span>
                  {item.value && <span className="text-slate-500 text-[10px]">{item.value}</span>}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="px-4 mt-4 space-y-2 pb-4">
            <button
              onClick={() => navigate('createWallet')}
              className="w-full bg-amber-500 text-black text-xs font-semibold py-2.5 rounded-lg"
            >
              {t('mobileWallet.createWalletTitle')}
            </button>
            <button
              onClick={() => navigate('emailVerify')}
              className="w-full bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-lg"
            >
              {t('mobileWallet.emailVerifyTitle')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /** Create Wallet screen */
  function CreateWalletScreen() {
    return (
      <div className="flex flex-col h-full">
        <ScreenHeader title={t('mobileWallet.createWalletTitle')} showBack />
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-slate-400 text-xs">{t('mobileWallet.createWalletDesc')}</p>
          </div>

          {!walletCreated ? (
            <div className="space-y-3">
              <button
                onClick={createWallet}
                className="w-full bg-amber-500 text-black text-xs font-semibold py-3 rounded-xl"
              >
                {t('mobileWallet.createNew')}
              </button>
              <button className="w-full bg-slate-800 text-white text-xs font-semibold py-3 rounded-xl">
                {t('mobileWallet.importWallet')}
              </button>
            </div>
          ) : (
            <div>
              <h4 className="text-white text-sm font-semibold mb-2">{t('mobileWallet.seedPhraseTitle')}</h4>
              <p className="text-red-400 text-[10px] mb-3">{t('mobileWallet.seedPhraseWarning')}</p>

              <div
                className="relative rounded-xl bg-slate-800 p-4 cursor-pointer"
                onClick={() => setSeedRevealed(true)}
              >
                {!seedRevealed && (
                  <div className="absolute inset-0 bg-slate-800/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <EyeOff className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                      <span className="text-slate-400 text-xs">{t('mobileWallet.tapToReveal')}</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {seedPhrase.map((word, i) => (
                    <div key={i} className="bg-slate-900 rounded-lg px-2 py-1.5 text-center">
                      <span className="text-slate-600 text-[9px]">{i + 1}.</span>
                      <span className="text-white text-[11px] ml-1">{word}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('web3wallet')}
                className="w-full bg-emerald-500 text-black text-xs font-semibold py-3 rounded-xl mt-4"
              >
                {t('mobileWallet.confirmSeed')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /** Email Verification screen */
  function EmailVerifyScreen() {
    return (
      <div className="flex flex-col h-full">
        <ScreenHeader title={t('mobileWallet.emailVerifyTitle')} showBack />
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {emailVerified ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-emerald-400 text-lg font-bold">{t('mobileWallet.verified')}</h3>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-xs mb-4">{t('mobileWallet.emailVerifyDesc')}</p>

              {!codeSent ? (
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('mobileWallet.emailPlaceholder')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-xs text-white placeholder:text-slate-500 outline-none mb-3"
                  />
                  <button
                    onClick={handleSendCode}
                    className="w-full bg-amber-500 text-black text-xs font-semibold py-3 rounded-xl"
                  >
                    {t('mobileWallet.sendCode')}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-slate-400 text-xs mb-4">
                    {t('mobileWallet.codeSent')} <span className="text-white">{email}</span>
                  </p>

                  <p className="text-slate-500 text-[10px] mb-2">{t('mobileWallet.enterCode')}</p>
                  <div className="flex gap-2 justify-center mb-4">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        className="w-10 h-12 bg-slate-800 border border-slate-700 rounded-lg text-center text-white text-lg font-mono outline-none focus:border-amber-500"
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleVerify}
                    className="w-full bg-amber-500 text-black text-xs font-semibold py-3 rounded-xl mb-3"
                  >
                    {t('mobileWallet.verifyButton')}
                  </button>

                  <button
                    onClick={() => { if (countdown === 0) { setCountdown(60); setOtpDigits(['', '', '', '', '', '']); } }}
                    className="w-full text-center text-xs text-slate-500"
                  >
                    {countdown > 0
                      ? `${t('mobileWallet.resendIn')} ${countdown}s`
                      : t('mobileWallet.resendCode')
                    }
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  /** Send screen */
  function SendScreen() {
    const selectedSend = sendToken || mobileTokens[0];
    return (
      <div className="flex flex-col h-full">
        <ScreenHeader title={t('mobileWallet.sendTitle')} showBack />
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {sendSuccess ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-emerald-400 text-lg font-bold">{t('mobileWallet.sendSuccess')}</h3>
            </div>
          ) : (
            <>
              {/* Token selector */}
              <div className="mb-3">
                <label className="text-slate-500 text-[10px] mb-1 block">{t('mobileWallet.selectToken')}</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {mobileTokens.slice(0, 6).map(tok => (
                    <button
                      key={tok.symbol}
                      onClick={() => setSendToken(tok)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs shrink-0 transition-colors ${
                        selectedSend.symbol === tok.symbol ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span style={{ color: tok.color }}>{tok.icon}</span>
                      {tok.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient */}
              <div className="mb-3">
                <label className="text-slate-500 text-[10px] mb-1 block">{t('mobileWallet.recipientAddress')}</label>
                <input
                  value={sendAddress}
                  onChange={e => setSendAddress(e.target.value)}
                  placeholder={t('mobileWallet.addressPlaceholder')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-xs text-white placeholder:text-slate-500 outline-none font-mono"
                />
              </div>

              {/* Amount */}
              <div className="mb-3">
                <label className="text-slate-500 text-[10px] mb-1 block">{t('mobileWallet.amountLabel')}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={e => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-xs text-white placeholder:text-slate-500 outline-none font-mono pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{selectedSend.symbol}</span>
                </div>
                <p className="text-slate-600 text-[10px] mt-1">
                  {t('mobileWallet.availableBalance')}: {formatBalance(selectedSend.balance)} {selectedSend.symbol}
                </p>
              </div>

              {/* Network fee */}
              <div className="bg-slate-800/50 rounded-xl p-3 mb-4">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">{t('mobileWallet.networkFee')}</span>
                  <span className="text-slate-400">~$0.85</span>
                </div>
              </div>

              <button onClick={handleSend} className="w-full bg-amber-500 text-black text-xs font-semibold py-3 rounded-xl">
                {t('mobileWallet.sendButton')}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /** Receive screen */
  function ReceiveScreen() {
    return (
      <div className="flex flex-col h-full">
        <ScreenHeader title={t('mobileWallet.receiveTitle')} showBack />
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="text-center">
            {/* QR Code */}
            <div className="bg-white rounded-2xl p-4 inline-block mb-4">
              <canvas ref={qrCanvasRef} className="w-[180px] h-[180px]" />
            </div>
            <p className="text-slate-500 text-[10px] mb-4">{t('mobileWallet.qrLabel')}</p>

            {/* Network selector */}
            <div className="flex gap-2 justify-center mb-4">
              {['Ethereum', 'BSC', 'Solana'].map(net => (
                <span key={net} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-lg">{net}</span>
              ))}
            </div>

            {/* Address */}
            <div className="bg-slate-800 rounded-xl p-3 mb-3">
              <p className="text-slate-500 text-[10px] mb-1">{t('mobileWallet.yourAddress')}</p>
              <p className="text-white text-[11px] font-mono break-all">{fullAddress}</p>
            </div>

            <button
              onClick={copyAddress}
              className="w-full bg-amber-500 text-black text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('mobileWallet.copied') : t('mobileWallet.copyAddress')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /** Token Detail screen */
  function TokenDetailScreen() {
    const token = selectedToken || mobileTokens[0];
    const sparkData = sparklines[token.symbol] || [];
    const high = sparkData.length ? Math.max(...sparkData).toFixed(2) : 0;
    const low = sparkData.length ? Math.min(...sparkData).toFixed(2) : 0;

    // Build SVG chart path
    const chartW = 327;
    const chartH = 140;
    let chartPath = '';
    if (sparkData.length > 1) {
      const min = Math.min(...sparkData);
      const max = Math.max(...sparkData);
      const range = max - min || 1;
      chartPath = sparkData.map((v, i) =>
        `${(i / (sparkData.length - 1)) * chartW},${chartH - ((v - min) / range) * chartH}`
      ).join(' ');
    }

    const tokenActivity = recentActivity.filter(a => a.symbol === token.symbol);

    return (
      <div className="flex flex-col h-full">
        <ScreenHeader title={token.name} showBack rightContent={
          <span className="text-xs font-mono text-slate-500">{token.network}</span>
        } />
        <div className="flex-1 overflow-y-auto">
          {/* Price header */}
          <div className="px-4 py-3">
            <p className="text-white text-2xl font-bold">{formatUSD(token.price)}</p>
            <span className={`text-xs font-mono ${token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              {token.change24h >= 0 ? <TrendingUp className="w-3 h-3 inline ml-1" /> : <TrendingDown className="w-3 h-3 inline ml-1" />}
            </span>
          </div>

          {/* Chart */}
          <div className="px-4 mb-4">
            <svg width={chartW} height={chartH} className="w-full">
              <defs>
                <linearGradient id={`grad-${token.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={token.change24h >= 0 ? '#4ade80' : '#f87171'} stopOpacity="0.3"/>
                  <stop offset="100%" stopColor={token.change24h >= 0 ? '#4ade80' : '#f87171'} stopOpacity="0"/>
                </linearGradient>
              </defs>
              {chartPath && (
                <>
                  <polygon
                    points={`0,${chartH} ${chartPath} ${chartW},${chartH}`}
                    fill={`url(#grad-${token.symbol})`}
                  />
                  <polyline
                    points={chartPath}
                    fill="none"
                    stroke={token.change24h >= 0 ? '#4ade80' : '#f87171'}
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 px-4 mb-4">
            <div className="bg-slate-800/50 rounded-lg p-2">
              <p className="text-slate-500 text-[9px]">{t('mobileWallet.high24h')}</p>
              <p className="text-white text-xs font-mono">${high}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2">
              <p className="text-slate-500 text-[9px]">{t('mobileWallet.low24h')}</p>
              <p className="text-white text-xs font-mono">${low}</p>
            </div>
          </div>

          {/* Balance */}
          <div className="px-4 mb-4 bg-slate-800/30 py-3">
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">{t('mobileWallet.availableBalance')}</span>
              <span className="text-white text-xs font-mono">{formatBalance(token.balance)} {token.symbol}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-slate-500 text-[10px]">≈ USD</span>
              <span className="text-slate-400 text-xs font-mono">{formatUSD(token.balance * token.price)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-4 gap-2 px-4 mb-4">
            <button onClick={() => { setBuyToken(token); setBuyUsdAmount(''); setBuyStep('form'); setBuySuccess(false); navigate('buy'); }} className="bg-emerald-500 text-black text-[10px] font-semibold py-2 rounded-lg">
              {t('mobileWallet.buy')}
            </button>
            <button onClick={() => { setSellToken(token); setSellAmount(''); setSellStep('form'); setSellSuccess(false); navigate('sell'); }} className="bg-red-500 text-white text-[10px] font-semibold py-2 rounded-lg">
              {t('mobileWallet.sell')}
            </button>
            <button onClick={() => { setSendToken(token); navigate('send'); }} className="bg-amber-500 text-black text-[10px] font-semibold py-2 rounded-lg">
              {t('mobileWallet.send')}
            </button>
            <button onClick={() => navigate('receive')} className="bg-slate-800 text-white text-[10px] font-semibold py-2 rounded-lg">
              {t('mobileWallet.receive')}
            </button>
          </div>

          {/* Recent transactions for this token */}
          <div className="px-4 pb-4">
            <h4 className="text-slate-500 text-[10px] uppercase tracking-wider mb-2">{t('mobileWallet.recentTransactions')}</h4>
            {tokenActivity.length > 0 ? tokenActivity.map(a => (
              <div key={a.id} className="flex items-center py-2 border-b border-slate-800/50 gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${a.type === 'receive' ? 'bg-emerald-500/10' : a.type === 'send' ? 'bg-red-500/10' : 'bg-cyan-500/10'}`}>
                  {a.type === 'receive' ? <ArrowDownLeft className="w-3 h-3 text-emerald-400" /> :
                   a.type === 'send' ? <ArrowUpRight className="w-3 h-3 text-red-400" /> :
                   <Repeat2 className="w-3 h-3 text-cyan-400" />}
                </div>
                <div className="flex-1">
                  <span className="text-white text-[11px] capitalize">{a.type}</span>
                  <span className="text-slate-600 text-[9px] ml-2">{timeAgo(a.timestamp)}</span>
                </div>
                <span className={`text-xs font-mono ${a.type === 'receive' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {a.type === 'receive' ? '+' : '-'}{a.amount} {a.symbol}
                </span>
              </div>
            )) : (
              <p className="text-slate-600 text-xs">{t('mobileWallet.noTransactions')}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /** Buy screen — purchase crypto with simulated USD */
  function BuyScreen() {
    const token = buyToken || mobileTokens[0];
    const usdVal = Number(buyUsdAmount) || 0;
    const cryptoAmount = usdVal / token.price;
    const fee = usdVal * 0.015;
    const totalCost = usdVal + fee;

    return (
      <div className="flex flex-col h-full">
        <ScreenHeader title={t('mobileWallet.buyTitle')} showBack />
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {buySuccess ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-emerald-400 text-lg font-bold">{t('mobileWallet.buySuccess')}</h3>
              <p className="text-slate-400 text-xs mt-2">+{cryptoAmount.toFixed(6)} {token.symbol}</p>
            </div>
          ) : buyStep === 'processing' ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3 animate-spin">
                <Repeat2 className="w-8 h-8 text-amber-400" />
              </div>
              <p className="text-amber-400 text-sm font-semibold animate-pulse">{t('common.loading')}</p>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-xs mb-4">{t('mobileWallet.buyDesc')}</p>

              {/* Token selector */}
              <div className="mb-3">
                <label className="text-slate-500 text-[10px] mb-1 block">{t('mobileWallet.selectToken')}</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {mobileTokens.filter(t => t.symbol !== 'USDT' && t.symbol !== 'USDC').slice(0, 6).map(tok => (
                    <button
                      key={tok.symbol}
                      onClick={() => setBuyToken(tok)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs shrink-0 transition-colors ${
                        token.symbol === tok.symbol ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span style={{ color: tok.color }}>{tok.icon}</span>
                      {tok.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* USD amount */}
              <div className="mb-3">
                <label className="text-slate-500 text-[10px] mb-1 block">{t('mobileWallet.spendAmount')}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={buyUsdAmount}
                    onChange={e => setBuyUsdAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-xs text-white placeholder:text-slate-500 outline-none font-mono pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">USD</span>
                </div>
              </div>

              {/* You receive preview */}
              <div className="bg-slate-800/50 rounded-xl p-3 mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500 text-[10px]">{t('mobileWallet.youReceive')}</span>
                  <span className="text-white text-xs font-mono">{cryptoAmount > 0 ? cryptoAmount.toFixed(6) : '0.00'} {token.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[10px]">{t('mobileWallet.price')}</span>
                  <span className="text-slate-400 text-[10px] font-mono">{formatUSD(token.price)} / {token.symbol}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="mb-3">
                <label className="text-slate-500 text-[10px] mb-1 block">{t('mobileWallet.paymentMethod')}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBuyPayment('card')}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors ${
                      buyPayment === 'card' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />{t('mobileWallet.creditCard')}
                  </button>
                  <button
                    onClick={() => setBuyPayment('bank')}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors ${
                      buyPayment === 'bank' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />{t('mobileWallet.bankTransfer')}
                  </button>
                </div>
              </div>

              {/* Fee summary */}
              <div className="bg-slate-800/30 rounded-xl p-3 mb-4 space-y-1.5">
                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">{t('mobileWallet.feeSummary')}</p>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">{t('mobileWallet.processingFee')} (1.5%)</span>
                  <span className="text-slate-400 font-mono">${fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">{t('mobileWallet.platformFee')}</span>
                  <span className="text-emerald-400 font-mono">$0.00</span>
                </div>
                <div className="border-t border-slate-700 pt-1.5 flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">{t('mobileWallet.total')}</span>
                  <span className="text-white font-mono font-semibold">${totalCost.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleBuy} disabled={!usdVal} className={`w-full text-xs font-semibold py-3 rounded-xl transition-colors ${usdVal > 0 ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-500'}`}>
                {t('mobileWallet.buyNow')}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /** Sell screen — convert crypto back to simulated USD */
  function SellScreen() {
    const token = sellToken || mobileTokens[0];
    const amt = Number(sellAmount) || 0;
    const usdValue = amt * token.price;
    const fee = usdValue * 0.01;
    const netReceive = usdValue - fee;

    return (
      <div className="flex flex-col h-full">
        <ScreenHeader title={t('mobileWallet.sellTitle')} showBack />
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {sellSuccess ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-emerald-400 text-lg font-bold">{t('mobileWallet.sellSuccess')}</h3>
              <p className="text-slate-400 text-xs mt-2">+${netReceive.toFixed(2)} USD</p>
            </div>
          ) : sellStep === 'processing' ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3 animate-spin">
                <Repeat2 className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 text-sm font-semibold animate-pulse">{t('common.loading')}</p>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-xs mb-4">{t('mobileWallet.sellDesc')}</p>

              {/* Token selector */}
              <div className="mb-3">
                <label className="text-slate-500 text-[10px] mb-1 block">{t('mobileWallet.selectToken')}</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {mobileTokens.filter(t => t.balance > 0 && t.symbol !== 'USDT' && t.symbol !== 'USDC').slice(0, 6).map(tok => (
                    <button
                      key={tok.symbol}
                      onClick={() => setSellToken(tok)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs shrink-0 transition-colors ${
                        token.symbol === tok.symbol ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span style={{ color: tok.color }}>{tok.icon}</span>
                      {tok.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount to sell */}
              <div className="mb-3">
                <label className="text-slate-500 text-[10px] mb-1 block">{t('mobileWallet.youSell')}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={sellAmount}
                    onChange={e => setSellAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-xs text-white placeholder:text-slate-500 outline-none font-mono pr-24"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button onClick={() => setSellAmount(String(token.balance))} className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">{t('mobileWallet.max')}</button>
                    <span className="text-xs text-slate-500">{token.symbol}</span>
                  </div>
                </div>
                <p className="text-slate-600 text-[10px] mt-1">
                  {t('mobileWallet.availableBalance')}: {formatBalance(token.balance)} {token.symbol}
                </p>
              </div>

              {/* You receive preview */}
              <div className="bg-slate-800/50 rounded-xl p-3 mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500 text-[10px]">{t('mobileWallet.youGet')}</span>
                  <span className="text-white text-xs font-mono">${usdValue > 0 ? usdValue.toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[10px]">{t('mobileWallet.price')}</span>
                  <span className="text-slate-400 text-[10px] font-mono">{formatUSD(token.price)} / {token.symbol}</span>
                </div>
              </div>

              {/* Fee summary */}
              <div className="bg-slate-800/30 rounded-xl p-3 mb-4 space-y-1.5">
                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">{t('mobileWallet.feeSummary')}</p>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">{t('mobileWallet.processingFee')} (1%)</span>
                  <span className="text-slate-400 font-mono">-${fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-700 pt-1.5 flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">{t('mobileWallet.youGet')}</span>
                  <span className="text-white font-mono font-semibold">${netReceive > 0 ? netReceive.toFixed(2) : '0.00'}</span>
                </div>
              </div>

              <button onClick={handleSell} disabled={!amt || amt > token.balance} className={`w-full text-xs font-semibold py-3 rounded-xl transition-colors ${amt > 0 && amt <= token.balance ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                {t('mobileWallet.sellNow')}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /** Swap screen — exchange one crypto for another */
  function SwapScreen() {
    const from = swapFrom || mobileTokens[0];
    const to = swapTo || mobileTokens[1];
    const amt = Number(swapAmount) || 0;
    const rate = from.price / to.price;
    const toAmount = amt * rate;
    const priceImpact = amt > 0 ? (0.1 + Math.random() * 0.4).toFixed(2) : '0.00';

    function flipTokens() {
      const tempFrom = swapFrom || mobileTokens[0];
      const tempTo = swapTo || mobileTokens[1];
      setSwapFrom(tempTo);
      setSwapTo(tempFrom);
      setSwapAmount('');
    }

    return (
      <div className="flex flex-col h-full">
        <ScreenHeader title={t('mobileWallet.swapTitle')} showBack />
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {swapSuccess ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Check className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-cyan-400 text-lg font-bold">{t('mobileWallet.swapSuccess')}</h3>
              <p className="text-slate-400 text-xs mt-2">{amt.toFixed(4)} {from.symbol} → {toAmount.toFixed(4)} {to.symbol}</p>
            </div>
          ) : swapStep === 'processing' ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-3 animate-spin">
                <Repeat2 className="w-8 h-8 text-cyan-400" />
              </div>
              <p className="text-cyan-400 text-sm font-semibold animate-pulse">{t('common.loading')}</p>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-xs mb-4">{t('mobileWallet.swapDesc')}</p>

              {/* From section */}
              <div className="bg-slate-800 rounded-xl p-3 mb-1">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 text-[10px]">{t('mobileWallet.swapFrom')}</span>
                  <span className="text-slate-600 text-[10px]">{t('mobileWallet.availableBalance')}: {formatBalance(from.balance)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 overflow-x-auto shrink-0">
                    {mobileTokens.slice(0, 5).map(tok => (
                      <button
                        key={tok.symbol}
                        onClick={() => { setSwapFrom(tok); setSwapAmount(''); }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] shrink-0 ${from.symbol === tok.symbol ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'}`}
                      >
                        <span style={{ color: tok.color }}>{tok.icon}</span>{tok.symbol}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative mt-2">
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={e => setSwapAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none font-mono pr-16"
                  />
                  <button onClick={() => setSwapAmount(String(from.balance))} className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">{t('mobileWallet.max')}</button>
                </div>
              </div>

              {/* Swap direction button */}
              <div className="flex justify-center -my-2 relative z-10">
                <button onClick={flipTokens} className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Repeat2 className="w-4 h-4 text-black" />
                </button>
              </div>

              {/* To section */}
              <div className="bg-slate-800 rounded-xl p-3 mt-1 mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 text-[10px]">{t('mobileWallet.swapTo')}</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto mb-2">
                  {mobileTokens.slice(0, 5).filter(tok => tok.symbol !== from.symbol).map(tok => (
                    <button
                      key={tok.symbol}
                      onClick={() => setSwapTo(tok)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] shrink-0 ${to.symbol === tok.symbol ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'}`}
                    >
                      <span style={{ color: tok.color }}>{tok.icon}</span>{tok.symbol}
                    </button>
                  ))}
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5">
                  <span className="text-xs text-white font-mono">{toAmount > 0 ? toAmount.toFixed(6) : '0.00'}</span>
                  <span className="text-xs text-slate-500 ml-2">{to.symbol}</span>
                </div>
              </div>

              {/* Rate info */}
              <div className="bg-slate-800/30 rounded-xl p-3 mb-4 space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">{t('mobileWallet.exchangeRate')}</span>
                  <span className="text-slate-400 font-mono">1 {from.symbol} = {rate.toFixed(6)} {to.symbol}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">{t('mobileWallet.priceImpact')}</span>
                  <span className="text-emerald-400 font-mono">{priceImpact}%</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">{t('mobileWallet.slippage')}</span>
                  <span className="text-slate-400 font-mono">0.5%</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">{t('mobileWallet.networkFee')}</span>
                  <span className="text-slate-400 font-mono">~$1.20</span>
                </div>
              </div>

              <button onClick={handleSwap} disabled={!amt || amt > from.balance} className={`w-full text-xs font-semibold py-3 rounded-xl transition-colors ${amt > 0 && amt <= from.balance ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-slate-500'}`}>
                {t('mobileWallet.swapNow')}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Screen Router ──────────────────────────────
  function renderScreen() {
    switch (screen) {
      case 'home': return <HomeScreen />;
      case 'web3wallet': return <Web3WalletScreen />;
      case 'profile': return <ProfileScreen />;
      case 'createWallet': return <CreateWalletScreen />;
      case 'emailVerify': return <EmailVerifyScreen />;
      case 'send': return <SendScreen />;
      case 'receive': return <ReceiveScreen />;
      case 'tokenDetail': return <TokenDetailScreen />;
      case 'buy': return <BuyScreen />;
      case 'sell': return <SellScreen />;
      case 'swap': return <SwapScreen />;
      default: return <HomeScreen />;
    }
  }

  // ── Main Render ────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-semibold text-white">{t('mobileWallet.title')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('mobileWallet.subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Instruction panel */}
        <div className="lg:w-64 shrink-0 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <Smartphone className="w-6 h-6 text-amber-400 mb-2" />
            <p className="text-xs text-slate-400 leading-relaxed">{t('mobileWallet.instructions')}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Screens</h4>
            <div className="space-y-1">
              {[
                { key: 'home', label: 'Markets' },
                { key: 'web3wallet', label: 'Web3 Wallet' },
                { key: 'profile', label: 'Profile' },
                { key: 'createWallet', label: 'Create Wallet' },
                { key: 'emailVerify', label: 'Email Verify' },
                { key: 'send', label: 'Send' },
                { key: 'receive', label: 'Receive' },
                { key: 'buy', label: 'Buy' },
                { key: 'sell', label: 'Sell' },
                { key: 'swap', label: 'Swap' },
                { key: 'tokenDetail', label: 'Token Detail' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => navigate(s.key)}
                  className={`w-full text-left text-[11px] px-2 py-1.5 rounded-lg transition-colors ${
                    screen === s.key ? 'bg-amber-500/10 text-amber-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Phone Frame */}
        <div className="flex-1 flex justify-center">
          <div className="relative" style={{ width: 375, height: 812 }}>
            {/* Phone outer shell */}
            <div
              className="absolute inset-0 rounded-[3rem] bg-[#1a1a1a] shadow-2xl shadow-black/50"
              style={{ border: '3px solid #333' }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-black rounded-b-2xl z-20" />

              {/* Screen area */}
              <div className="absolute inset-[3px] rounded-[2.7rem] overflow-hidden bg-[#0b0e11] flex flex-col">
                <StatusBar />
                <div className="flex-1 overflow-hidden flex flex-col">
                  {renderScreen()}
                </div>
                <BottomTabs />
              </div>

              {/* Home indicator bar */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
