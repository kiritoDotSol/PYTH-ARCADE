// Mulberry32 is a simple, fast, 32-bit PRNG
export function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Helper to convert hex string from smart contract to a sequence of seeds
export function hexToSeeds(hex: string): number[] {
    const cleanHex = hex.replace('0x', '');
    const seeds = [];
    for (let i = 0; i < cleanHex.length; i += 8) {
        if (i + 8 <= cleanHex.length) {
            seeds.push(parseInt(cleanHex.substring(i, i + 8), 16));
        }
    }
    return seeds.length > 0 ? seeds : [Date.now()];
}
