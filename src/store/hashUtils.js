/**
 * Simple hash function for educational demonstration.
 * Produces a hex string from arbitrary input - NOT cryptographically secure.
 * Uses MurmurHash3-inspired mixing to ensure uniform hex distribution
 * so that mining difficulty works correctly (leading zeros appear at expected rates).
 * @param {string} input - Data to hash
 * @returns {string} 64-character hex hash string
 */
export function simpleHash(input) {
  // Generate 8 independent 32-bit hashes with different seeds for 64 hex chars
  let result = '';
  for (let chunk = 0; chunk < 8; chunk++) {
    let h = (0x811c9dc5 + chunk * 0x1234567) >>> 0;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    // Avalanche mixing (MurmurHash3 finalizer)
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    result += (h >>> 0).toString(16).padStart(8, '0');
  }
  return result.slice(0, 64);
}

/**
 * Generates a chain of blocks where each block's prevHash references the prior block's hash.
 * @param {number} count - Number of blocks to generate
 * @returns {Array<Object>} Chain of connected blocks
 */
export function generateChain(count = 6) {
  const chain = [];
  let prevHash = '0'.repeat(64);

  for (let i = 0; i < count; i++) {
    const height = 831240 + i;
    const txCount = Math.floor(Math.random() * 150) + 30;
    const data = `Block ${height} | ${txCount} txns | ts:${Date.now() - (count - i) * 60000}`;
    const nonce = Math.floor(Math.random() * 999999);
    const hash = simpleHash(prevHash + data + nonce);

    chain.push({
      height,
      data,
      nonce,
      txCount,
      timestamp: Date.now() - (count - i) * 60000,
      prevHash,
      hash,
      tampered: false,
    });
    prevHash = hash;
  }
  return chain;
}

/**
 * Recalculates hashes for a chain starting from a given index.
 * Used to demonstrate how modifying one block breaks all subsequent blocks.
 * @param {Array<Object>} chain - Block array
 * @param {number} fromIndex - Index to recalculate from
 * @returns {Array<Object>} Updated chain with tamper flags
 */
export function recalcChain(chain, fromIndex) {
  const updated = [...chain];
  for (let i = fromIndex; i < updated.length; i++) {
    const prev = i > 0 ? updated[i - 1].hash : '0'.repeat(64);
    const newHash = simpleHash(prev + updated[i].data + updated[i].nonce);
    const tampered = i > fromIndex ? true : updated[i].tampered;
    updated[i] = { ...updated[i], hash: newHash, prevHash: prev, tampered };
  }
  return updated;
}
