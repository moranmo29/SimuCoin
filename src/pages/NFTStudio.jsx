import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Palette,
  Upload,
  Sparkles,
  Code2,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

/**
 * Solidity-style smart contract code lines for the minting animation.
 * Each line will highlight sequentially during the "minting" process.
 */
const CONTRACT_LINES = [
  { code: '// SPDX-License-Identifier: MIT', type: 'comment' },
  { code: 'pragma solidity ^0.8.20;', type: 'keyword' },
  { code: '', type: 'blank' },
  { code: 'import "@openzeppelin/ERC721.sol";', type: 'import' },
  { code: '', type: 'blank' },
  { code: 'contract ChainLabNFT is ERC721 {', type: 'keyword' },
  { code: '    uint256 private _tokenIds;', type: 'variable' },
  { code: '', type: 'blank' },
  { code: '    constructor() ERC721("{{name}}", "{{symbol}}") {}', type: 'keyword' },
  { code: '', type: 'blank' },
  { code: '    function mint(address to)', type: 'function' },
  { code: '        public returns (uint256)', type: 'function' },
  { code: '    {', type: 'bracket' },
  { code: '        _tokenIds++;', type: 'exec' },
  { code: '        uint256 newItemId = _tokenIds;', type: 'exec' },
  { code: '        _mint(msg.sender, newItemId);', type: 'exec' },
  { code: '        _setTokenURI(newItemId, tokenURI);', type: 'exec' },
  { code: '        emit Transfer(address(0), to, newItemId);', type: 'exec' },
  { code: '        return newItemId;', type: 'exec' },
  { code: '    }', type: 'bracket' },
  { code: '}', type: 'bracket' },
];

/**
 * NFT & Token Studio page.
 * Allows the user to "mint" an NFT or token, showing the smart contract
 * code executing line-by-line during the minting animation.
 */
export default function NFTStudio() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [artPreview, setArtPreview] = useState(null);
  const [minting, setMinting] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [minted, setMinted] = useState(false);
  const [mintedTokens, setMintedTokens] = useState([]);
  const fileRef = useRef(null);
  const codeRef = useRef(null);

  /** Handles art image selection. */
  function handleArt(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setArtPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  /** Generates a random colored square as placeholder art. */
  function generateArt() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    // Random gradient art
    const colors = ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)] + '80';
      const x = Math.random() * 150;
      const y = Math.random() * 150;
      const s = Math.random() * 80 + 20;
      if (Math.random() > 0.5) {
        ctx.fillRect(x, y, s, s);
      } else {
        ctx.beginPath();
        ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    setArtPreview(canvas.toDataURL());
  }

  /** Runs the line-by-line minting animation. */
  function startMint() {
    if (!name || !symbol) return;
    setMinting(true);
    setMinted(false);
    setCurrentLine(0);
  }

  /** Advances through contract lines during minting. */
  useEffect(() => {
    if (!minting || currentLine < 0) return;
    if (currentLine >= CONTRACT_LINES.length) {
      setMinting(false);
      setMinted(true);
      setMintedTokens((prev) => [
        { name, symbol, art: artPreview, tokenId: prev.length + 1, hash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''), timestamp: Date.now() },
        ...prev,
      ]);
      return;
    }
    const delay = CONTRACT_LINES[currentLine].type === 'exec' ? 600 : CONTRACT_LINES[currentLine].type === 'blank' ? 100 : 300;
    const timer = setTimeout(() => setCurrentLine((c) => c + 1), delay);
    return () => clearTimeout(timer);
  }, [minting, currentLine, name, symbol, artPreview]);

  /** Scroll code panel to follow current line. */
  useEffect(() => {
    if (codeRef.current && currentLine > 5) {
      codeRef.current.scrollTop = (currentLine - 3) * 24;
    }
  }, [currentLine]);

  /** Returns the contract code with name/symbol substituted. */
  function getCode(line) {
    return line.code.replace('{{name}}', name || 'MyNFT').replace('{{symbol}}', symbol || 'MNFT');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">{t('nft.title')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('nft.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Form + Art */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            <Palette className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />{t('nft.createToken')}
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t('nft.tokenName')}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="A-Eye Token" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyber/50" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                {t('nft.tokenSymbol')}<HelpTooltip term={t('nft.helpSymbol')} explanation={t('nft.helpSymbolDesc')} />
              </label>
              <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="AEY" maxLength={5} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyber/50" />
            </div>
          </div>

          {/* Art Upload */}
          <div className="mb-4">
            <label className="block text-xs text-slate-500 mb-1">{t('nft.artwork')}</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-cyber/40 transition-colors group"
            >
              {artPreview ? (
                <img src={artPreview} alt="NFT art" className="w-32 h-32 object-cover rounded-lg mx-auto" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2 group-hover:text-cyber transition-colors" />
                  <p className="text-xs text-slate-500">{t('nft.uploadArt')}</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleArt} className="hidden" />
            </div>
            <button onClick={generateArt} className="text-[10px] text-cyber hover:text-cyber/80 mt-1">{t('nft.generateArt')}</button>
          </div>

          <button
            onClick={startMint}
            disabled={!name || !symbol || minting}
            className="w-full bg-gradient-to-r from-cyber to-emerald text-slate-950 font-semibold py-3 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />{minting ? t('nft.minting') : t('nft.mintNow')}
          </button>

          {/* Minted Success */}
          {minted && (
            <div className="mt-4 bg-emerald/10 border border-emerald/30 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-emerald">{t('nft.mintSuccess')}</h4>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Token ID: #{mintedTokens[0]?.tokenId} | {mintedTokens[0]?.hash}</p>
            </div>
          )}
        </section>

        {/* Right: Smart Contract Code */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            <Code2 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />{t('nft.smartContract')}
            <HelpTooltip term={t('nft.helpContract')} explanation={t('nft.helpContractDesc')} />
          </h3>

          <div ref={codeRef} className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-y-auto max-h-[400px] font-mono text-xs leading-6 scroll-smooth">
            {CONTRACT_LINES.map((line, i) => {
              const isActive = minting && i === currentLine;
              const isPast = minting && i < currentLine;
              const isExecLine = line.type === 'exec';
              return (
                <div
                  key={i}
                  className={`px-2 py-0.5 rounded transition-all duration-300 ${
                    isActive && isExecLine ? 'bg-emerald/20 border-l-2 border-emerald' :
                    isActive ? 'bg-cyber/10 border-l-2 border-cyber' :
                    isPast ? 'opacity-60' : ''
                  }`}
                >
                  <span className="text-slate-700 select-none w-6 inline-block text-right mr-3">{i + 1}</span>
                  <span className={
                    line.type === 'comment' ? 'text-slate-600' :
                    line.type === 'keyword' ? 'text-cyber' :
                    line.type === 'import' ? 'text-amber' :
                    line.type === 'variable' ? 'text-slate-400' :
                    line.type === 'function' ? 'text-emerald' :
                    line.type === 'exec' ? 'text-emerald' :
                    'text-slate-500'
                  }>{getCode(line)}</span>
                  {isActive && isExecLine && <span className="ml-2 text-emerald animate-pulse text-[10px]">&larr; executing</span>}
                </div>
              );
            })}
          </div>

          {(minting || minted) && (
            <div className="mt-3 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${minting ? 'bg-amber animate-pulse' : 'bg-emerald'}`} />
              <span className="text-[10px] text-slate-500">{minting ? t('nft.deploying') : t('nft.deployed')}</span>
            </div>
          )}
        </section>
      </div>

      {/* Minted Tokens Gallery */}
      {mintedTokens.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">{t('nft.gallery')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mintedTokens.map((token) => (
              <div key={token.tokenId} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
                {token.art ? (
                  <img src={token.art} alt={token.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                ) : (
                  <div className="w-full h-24 bg-slate-700/30 rounded-lg mb-2 flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-600" /></div>
                )}
                <p className="text-xs font-semibold text-white">{token.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{token.symbol} #{token.tokenId}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
