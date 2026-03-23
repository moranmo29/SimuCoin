import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WalletProvider } from './store/WalletContext';
import Sidebar from './components/Sidebar';
import SimulationBanner from './components/SimulationBanner';
import Dashboard from './pages/Dashboard';
import Exchange from './pages/Exchange';
import TransactionFactory from './pages/TransactionFactory';
import WalletPage from './pages/WalletPage';
import CryptoPortal from './pages/CryptoPortal';
import BlockExplorer from './pages/BlockExplorer';
import MiningHub from './pages/MiningHub';
import NFTStudio from './pages/NFTStudio';
import Forensics from './pages/Forensics';
import MobileWalletDemo from './pages/MobileWalletDemo';

/**
 * Root application component.
 * Wraps the app in WalletProvider and provides sidebar layout, routing, and simulation banner.
 */
export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  const mainMargin = sidebarCollapsed ? '68px' : '240px';

  return (
    <WalletProvider>
      <div className="min-h-screen bg-slate-950">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
        />

        <main
          className="transition-all duration-300 pb-14 min-h-screen"
          style={{
            [isRTL ? 'marginRight' : 'marginLeft']: mainMargin,
          }}
        >
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/exchange" element={<Exchange />} />
              <Route path="/transactions" element={<TransactionFactory />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/portal" element={<CryptoPortal />} />
              <Route path="/explorer" element={<BlockExplorer />} />
              <Route path="/mining" element={<MiningHub />} />
              <Route path="/nft" element={<NFTStudio />} />
              <Route path="/forensics" element={<Forensics />} />
              <Route path="/mobile-wallet" element={<MobileWalletDemo />} />
            </Routes>
          </div>
        </main>

        <SimulationBanner />
      </div>
    </WalletProvider>
  );
}
