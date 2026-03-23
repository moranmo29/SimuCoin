/**
 * Extended token data for the Mobile Wallet Demo.
 * Includes additional tokens beyond the core simulationData set.
 * All values are simulated for educational purposes.
 */
export const mobileTokens = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.04215, price: 67432.18, change24h: 2.34, icon: '₿', color: '#f7931a', network: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', balance: 1.8732, price: 3521.47, change24h: -1.12, icon: 'Ξ', color: '#627eea', network: 'Ethereum' },
  { symbol: 'BNB', name: 'BNB', balance: 12.45, price: 612.83, change24h: 0.87, icon: '◆', color: '#f3ba2f', network: 'BSC' },
  { symbol: 'SOL', name: 'Solana', balance: 24.5, price: 178.93, change24h: 5.67, icon: '◎', color: '#00ffa3', network: 'Solana' },
  { symbol: 'XRP', name: 'XRP', balance: 1250.0, price: 0.632, change24h: 1.45, icon: '✕', color: '#346aa9', network: 'XRP Ledger' },
  { symbol: 'DOGE', name: 'Dogecoin', balance: 5000, price: 0.1847, change24h: -2.31, icon: 'Ð', color: '#c3a634', network: 'Dogecoin' },
  { symbol: 'USDT', name: 'Tether', balance: 2500.0, price: 1.0, change24h: 0.01, icon: '₮', color: '#26a17b', network: 'Ethereum' },
  { symbol: 'USDC', name: 'USD Coin', balance: 1800.0, price: 1.0, change24h: -0.01, icon: '$', color: '#2775ca', network: 'Ethereum' },
  { symbol: 'ADA', name: 'Cardano', balance: 3200, price: 0.642, change24h: -0.85, icon: '₳', color: '#0033ad', network: 'Cardano' },
  { symbol: 'PEPE', name: 'PEPE', balance: 12500000, price: 0.00001243, change24h: 12.8, icon: '🐸', color: '#4c9141', network: 'Ethereum' },
  { symbol: 'DOT', name: 'Polkadot', balance: 185, price: 8.24, change24h: 1.93, icon: '●', color: '#e6007a', network: 'Polkadot' },
  { symbol: 'AVAX', name: 'Avalanche', balance: 42.8, price: 42.16, change24h: 3.28, icon: '▲', color: '#e84142', network: 'Avalanche' },
];

/**
 * Simulated user profile for the Mobile Wallet Demo.
 */
export const userProfile = {
  uid: '384729156',
  email: 'satoshi@chainlab.demo',
  vipLevel: 2,
  kycVerified: true,
  joinDate: '2023-06-15',
  referralCode: 'CHAINLAB2024',
  twoFactorEnabled: true,
};

/**
 * Simulated recent activity for the wallet.
 */
export const recentActivity = [
  { id: 1, type: 'receive', symbol: 'BTC', amount: 0.012, from: '0x7a3b...f1e2', timestamp: Date.now() - 3600000, status: 'confirmed' },
  { id: 2, type: 'send', symbol: 'ETH', amount: 0.5, to: '0x9c4d...a3b8', timestamp: Date.now() - 7200000, status: 'confirmed' },
  { id: 3, type: 'swap', symbol: 'SOL', amount: 10, toSymbol: 'USDT', toAmount: 1789.3, timestamp: Date.now() - 14400000, status: 'confirmed' },
  { id: 4, type: 'receive', symbol: 'USDT', amount: 500, from: '0x1e5f...c7d4', timestamp: Date.now() - 28800000, status: 'confirmed' },
  { id: 5, type: 'send', symbol: 'BNB', amount: 2.5, to: '0x3b8a...e9f0', timestamp: Date.now() - 43200000, status: 'confirmed' },
  { id: 6, type: 'swap', symbol: 'DOGE', amount: 1000, toSymbol: 'BTC', toAmount: 0.00274, timestamp: Date.now() - 86400000, status: 'confirmed' },
];

/**
 * Sorts tokens by different criteria.
 * @param {Array} tokens - Token array
 * @param {'value'|'name'|'change'} mode - Sort mode
 * @returns {Array} Sorted copy
 */
export function sortTokens(tokens, mode = 'value') {
  const sorted = [...tokens];
  switch (mode) {
    case 'value':
      return sorted.sort((a, b) => (b.balance * b.price) - (a.balance * a.price));
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'change':
      return sorted.sort((a, b) => b.change24h - a.change24h);
    default:
      return sorted;
  }
}

/**
 * Generates a simulated sparkline data array.
 * @param {number} points - Number of data points
 * @param {number} basePrice - Starting price
 * @returns {Array<number>} Price points
 */
export function generateSparkline(points = 20, basePrice = 100) {
  const data = [basePrice];
  for (let i = 1; i < points; i++) {
    const change = (Math.random() - 0.48) * basePrice * 0.03;
    data.push(data[i - 1] + change);
  }
  return data;
}
