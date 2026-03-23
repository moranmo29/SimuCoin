/**
 * Simulated market data for the dashboard.
 * All values are fake and for educational purposes only.
 */
export const cryptoAssets = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 67432.18, change24h: 2.34, marketCap: '1.32T', volume: '28.4B', color: '#f7931a' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3521.47, change24h: -1.12, marketCap: '423.1B', volume: '14.7B', color: '#627eea' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 178.93, change24h: 5.67, marketCap: '78.2B', volume: '3.1B', color: '#00ffa3' },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', price: 0.642, change24h: -0.85, marketCap: '22.8B', volume: '612M', color: '#0033ad' },
  { id: 'dot', name: 'Polkadot', symbol: 'DOT', price: 8.24, change24h: 1.93, marketCap: '10.7B', volume: '389M', color: '#e6007a' },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAX', price: 42.16, change24h: 3.28, marketCap: '15.8B', volume: '721M', color: '#e84142' },
];

/**
 * Simulated network statistics for the blockchain.
 */
export const networkStats = {
  difficulty: '72.01 T',
  blockHeight: 831247,
  hashRate: '512.3 EH/s',
  pendingTx: 4218,
  gasPrice: '23 Gwei',
  totalWallets: 1847293,
};

/**
 * Generates a simulated recent block with random data.
 * @param {number} height - Block height number
 * @returns {Object} Simulated block data
 */
export function generateBlock(height) {
  const miners = ['0x7a3b...f1e2', '0x9c4d...a3b8', '0x1e5f...c7d4', '0x3b8a...e9f0', '0x5d2c...b6a1'];
  return {
    height,
    txCount: Math.floor(Math.random() * 200) + 50,
    miner: miners[Math.floor(Math.random() * miners.length)],
    timestamp: Date.now() - Math.floor(Math.random() * 120) * 1000,
    size: (Math.random() * 1.5 + 0.5).toFixed(2) + ' MB',
    reward: '3.125 BTC',
  };
}

/**
 * Generates simulated price history data for chart rendering.
 * @param {number} points - Number of data points to generate
 * @returns {Array} Array of {time, price} objects
 */
export function generatePriceHistory(points = 24) {
  let price = 67000;
  return Array.from({ length: points }, (_, i) => {
    price += (Math.random() - 0.48) * 800;
    return { time: `${String(i).padStart(2, '0')}:00`, price: Math.round(price) };
  });
}

/**
 * Curated list of crypto resource links for the portal page.
 */
export const portalLinks = {
  explorers: [
    { name: 'Etherscan', url: 'https://etherscan.io', description: 'Ethereum blockchain explorer and analytics platform', icon: '🔍' },
    { name: 'Blockchain.com', url: 'https://www.blockchain.com/explorer', description: 'Bitcoin and multi-chain block explorer', icon: '⛓️' },
    { name: 'Solscan', url: 'https://solscan.io', description: 'Solana blockchain explorer with DeFi analytics', icon: '☀️' },
    { name: 'Polygonscan', url: 'https://polygonscan.com', description: 'Polygon (MATIC) network explorer', icon: '🟣' },
    { name: 'BscScan', url: 'https://bscscan.com', description: 'BNB Smart Chain explorer by Etherscan team', icon: '🟡' },
  ],
  data: [
    { name: 'CoinMarketCap', url: 'https://coinmarketcap.com', description: 'Cryptocurrency prices, charts, and market capitalization', icon: '📊' },
    { name: 'DeFi Llama', url: 'https://defillama.com', description: 'DeFi TVL aggregator and analytics dashboard', icon: '🦙' },
    { name: 'CoinGecko', url: 'https://www.coingecko.com', description: 'Crypto market data with developer and community metrics', icon: '🦎' },
    { name: 'Dune Analytics', url: 'https://dune.com', description: 'Community-powered blockchain analytics platform', icon: '📈' },
    { name: 'Glassnode', url: 'https://glassnode.com', description: 'On-chain market intelligence and metrics', icon: '🔮' },
  ],
  news: [
    { name: 'CoinDesk', url: 'https://www.coindesk.com', description: 'Leading digital media and events company for crypto', icon: '📰' },
    { name: 'The Block', url: 'https://www.theblock.co', description: 'Crypto-focused financial news and research', icon: '🗞️' },
    { name: 'Decrypt', url: 'https://decrypt.co', description: 'Web3 news, guides, and educational content', icon: '🔓' },
    { name: 'Messari', url: 'https://messari.io', description: 'Crypto research, data, and tools for professionals', icon: '🔬' },
  ],
  tools: [
    { name: 'Revoke.cash', url: 'https://revoke.cash', description: 'Review and revoke token approvals for wallet safety', icon: '🛡️' },
    { name: 'Chainlist', url: 'https://chainlist.org', description: 'EVM network directory - add chains to your wallet', icon: '🔗' },
    { name: 'DeBank', url: 'https://debank.com', description: 'Multi-chain portfolio tracker and DeFi dashboard', icon: '🏦' },
    { name: 'Tenderly', url: 'https://tenderly.co', description: 'Smart contract debugging, simulation, and monitoring', icon: '🔧' },
  ],
};
