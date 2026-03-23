import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Simulated 12-word BIP-39 seed phrase for research demonstration.
 * NOT a real mnemonic - purely educational.
 */
const SIMULATED_SEED = [
  'abandon', 'crystal', 'river', 'forge', 'pulse', 'echo',
  'drift', 'summit', 'blade', 'orbit', 'flame', 'anchor',
];

/** Simulated public wallet address (Ethereum-style). */
const SIMULATED_ADDRESS = '0x7F4e...3A9b2C8d';
const FULL_ADDRESS = '0x7F4e21bC5D8a93E1f6A0b4c7D2e5F8a1B3C9d4E6';

/** Simulated private key (for educational display only). */
const SIMULATED_PRIVATE_KEY = '0x4c0883a6...d7f6e5a9b2c1d8e3f0a7b4c5d6e8f9a0b1c2d3e4';

/**
 * Initial portfolio balances denominated in each crypto asset.
 * The user starts with $10,000 fake USD.
 */
const initialBalances = {
  USD: 10000,
  BTC: 0,
  ETH: 0,
  SOL: 0,
  ADA: 0,
  DOT: 0,
  AVAX: 0,
};

const WalletContext = createContext(null);

/**
 * Provides wallet state (balances, seed phrase, transaction history)
 * to all child components via React context.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function WalletProvider({ children }) {
  const [balances, setBalances] = useState(initialBalances);
  const [transactions, setTransactions] = useState([]);
  const [walletCreated, setWalletCreated] = useState(false);

  /**
   * Simulates buying a cryptocurrency with fake USD.
   * @param {string} symbol - Crypto symbol (e.g. 'BTC')
   * @param {number} amount - Amount of crypto to buy
   * @param {number} price - Current price per unit
   */
  const buyCrypto = useCallback((symbol, amount, price) => {
    const cost = amount * price;
    setBalances((prev) => {
      if (prev.USD < cost) return prev;
      return { ...prev, USD: prev.USD - cost, [symbol]: (prev[symbol] || 0) + amount };
    });
    setTransactions((prev) => [
      {
        id: crypto.randomUUID(),
        type: 'buy',
        symbol,
        amount,
        price,
        total: cost,
        timestamp: Date.now(),
        status: 'confirmed',
        hash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      },
      ...prev,
    ]);
  }, []);

  /**
   * Simulates selling a cryptocurrency back to fake USD.
   * @param {string} symbol - Crypto symbol
   * @param {number} amount - Amount to sell
   * @param {number} price - Current price per unit
   */
  const sellCrypto = useCallback((symbol, amount, price) => {
    const revenue = amount * price;
    setBalances((prev) => {
      if ((prev[symbol] || 0) < amount) return prev;
      return { ...prev, USD: prev.USD + revenue, [symbol]: prev[symbol] - amount };
    });
    setTransactions((prev) => [
      {
        id: crypto.randomUUID(),
        type: 'sell',
        symbol,
        amount,
        price,
        total: revenue,
        timestamp: Date.now(),
        status: 'confirmed',
        hash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      },
      ...prev,
    ]);
  }, []);

  /**
   * Records a send transaction and deducts from balance.
   * @param {Object} tx - Transaction details
   */
  const sendTransaction = useCallback((tx) => {
    setBalances((prev) => {
      const available = prev[tx.symbol] || 0;
      if (available < tx.amount) return prev;
      return { ...prev, [tx.symbol]: available - tx.amount };
    });
    setTransactions((prev) => [{ ...tx, id: crypto.randomUUID(), timestamp: Date.now() }, ...prev]);
  }, []);

  /** Marks the wallet as created (seed phrase acknowledged). */
  const createWallet = useCallback(() => setWalletCreated(true), []);

  return (
    <WalletContext.Provider
      value={{
        balances,
        transactions,
        walletCreated,
        seedPhrase: SIMULATED_SEED,
        address: SIMULATED_ADDRESS,
        fullAddress: FULL_ADDRESS,
        privateKey: SIMULATED_PRIVATE_KEY,
        buyCrypto,
        sellCrypto,
        sendTransaction,
        createWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Hook to access wallet context.
 * @returns {Object} Wallet state and actions
 */
export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
