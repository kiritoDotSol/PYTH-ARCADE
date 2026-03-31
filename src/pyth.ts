// =============================================================================
// PYTH ASSETS — Canonical source of truth for all Pyth price feed IDs
// =============================================================================
// All IDs verified against Hermes API: https://hermes.pyth.network/v2/price_feeds
// Games should import from here rather than maintaining their own ID lists.
// =============================================================================

export const PYTH_ASSETS = [
  {
    id: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    symbol: 'BTC',
    name: 'BITCOIN',
    color: '#F7931A',
    basePrice: 65000
  },
  {
    id: 'c96458d393fe9deb7a7d63a0ac41e2898a67a7750dbd166673279e06c868df0a',
    symbol: 'ETH',
    name: 'ETHEREUM',
    color: '#627EEA',
    basePrice: 100
  },
  {
    id: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    symbol: 'SOL',
    name: 'SOLANA',
    color: '#14F195',
    basePrice: 100
  },
  {
    id: '93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
    symbol: 'AVAX',
    name: 'AVALANCHE',
    color: '#E84142',
    basePrice: 100
  },
  {
    id: '8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
    symbol: 'LINK',
    name: 'CHAINLINK',
    color: '#2A5ADA',
    basePrice: 100
  },
  {
    id: '0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff',
    symbol: 'PYTH',
    name: 'PYTH NETWORK',
    color: '#E6DAFE',
    basePrice: 100
  },
  {
    id: 'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
    symbol: 'DOGE',
    name: 'DOGECOIN',
    color: '#C2A633',
    basePrice: 100
  },
  {
    id: '23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
    symbol: 'SUI',
    name: 'SUI',
    color: '#4DA2FF',
    basePrice: 100
  },
  {
    id: '2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
    symbol: 'ADA',
    name: 'CARDANO',
    color: '#eed05b',
    basePrice: 40
  },
  {
    id: 'ca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b',
    symbol: 'DOT',
    name: 'POLKADOT',
    color: '#f59b6a',
    basePrice: 8
  },
  {
    id: '78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
    symbol: 'UNI',
    name: 'UNISWAP',
    color: '#10eac3',
    basePrice: 28
  },
  {
    id: 'b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
    symbol: 'ATOM',
    name: 'COSMOS',
    color: '#b94851',
    basePrice: 56
  },
  {
    id: 'd69731a2e74ac1ce884fc3890f7ee324b6deb66147055249568869ed700882e4',
    symbol: 'PEPE',
    name: 'PEPE',
    color: '#c009df',
    basePrice: 49
  },
  {
    id: 'f0d57deca57b3da2fe63a493f4c25925fdfd8edf834b20f93e1f84dbd1504d4a',
    symbol: 'SHIB',
    name: 'SHIBA INU',
    color: '#bcaa8b',
    basePrice: 46
  },
  {
    id: '385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
    symbol: 'OP',
    name: 'OPTIMISM',
    color: '#de4353',
    basePrice: 100
  },
  {
    id: '3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5',
    symbol: 'ARB',
    name: 'ARBITRUM',
    color: '#96f5d4',
    basePrice: 25
  },
  {
    id: '03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5',
    symbol: 'APT',
    name: 'APTOS',
    color: '#fc6cd1',
    basePrice: 24
  },
  {
    id: 'ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8',
    symbol: 'XRP',
    name: 'RIPPLE',
    color: '#7bd7f6',
    basePrice: 61
  },
  {
    id: '45b75908a1965a86080a26d9f31ab69d045d4dda73d1394e0d3693ce00d40e6f',
    symbol: 'ANIME',
    name: 'ANIMECOIN',
    color: '#d95dd0',
    basePrice: 94
  },
  {
    id: '583015352f5936e099fa7149d496ac087c5bfbfc386ce875be27dc4d69c2e023',
    symbol: 'REX33',
    name: 'ETHEREX LIQUID STAKING TOKEN',
    color: '#b10263',
    basePrice: 21
  },
  {
    id: '44622616f246ce5fc46cf9ebdb879b0c0157275510744cea824ad206e48390b3',
    symbol: 'XEC',
    name: 'ECASH',
    color: '#8bcbaf',
    basePrice: 37
  },
  {
    id: 'f689a76211f3505826357e49ddd683221d9632735e2b27fd07fb1805c47cdace',
    symbol: 'XDC',
    name: 'XDC NETWORK',
    color: '#f210a7',
    basePrice: 88
  },
  {
    id: 'c415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750',
    symbol: 'NEAR',
    name: 'NEAR PROTOCOL',
    color: '#68bdaa',
    basePrice: 18
  },
  {
    id: '8abfa63ae82ca2fbc271861375e497166d8792580fb7c2ffcf014d2a131433f0',
    symbol: 'DMC',
    name: 'DELOREAN',
    color: '#bc76ad',
    basePrice: 74
  },
  {
    id: 'cd4eb98d487478925bb032580ab13e7ccfcb2e814500b526f00bd9fa651cc6b6',
    symbol: 'MSETH',
    name: 'METRONOME SYNTHETIC ETHEREUM',
    color: '#baf688',
    basePrice: 78
  },
  {
    id: '17cd845b16e874485b2684f8b8d1517d744105dbb904eec30222717f4bc9ee0d',
    symbol: 'AFSUI',
    name: 'AFTERMATH STAKED SUI',
    color: '#1ee6d2',
    basePrice: 17
  },
  {
    id: '97cfe19da9153ef7d647b011c5e355142280ddb16004378573e6494e499879f3',
    symbol: 'RON',
    name: 'RONIN',
    color: '#74449c',
    basePrice: 85
  },
  {
    id: '178a6f73a5aede9d0d682e86b0047c9f333ed0efe5c6537ca937565219c4054d',
    symbol: 'QQQX',
    name: 'NASDAQ XSTOCK',
    color: '#50e700',
    basePrice: 92
  },
  {
    id: 'c4aa2587b3d35cd526b8e7827f78399d16c7861f719331869c07e5fa499606d0',
    symbol: 'AVNT',
    name: 'AVANTIS',
    color: '#e2b713',
    basePrice: 39
  },
  {
    id: 'c591a547856b091560b120ee14b165a84ca58eca23b2ab635df641340bde1f10',
    symbol: 'UP',
    name: 'DOUBLEUP',
    color: '#46f521',
    basePrice: 37
  },
  {
    id: '7265d5cf8ee0e7b5266f75ff19c42c5b7697a9756c9304aa78b6be4fbb8d823d',
    symbol: 'RLP',
    name: 'RESOLV RLP',
    color: '#ebfcc8',
    basePrice: 47
  },
  {
    id: '61fb0189252a49fa08a0f1db3b4c8a4195edd994ed8934b971d62c9d34c74084',
    symbol: 'KTA',
    name: 'KEETA',
    color: '#8d2ca7',
    basePrice: 2
  },
  {
    id: 'c7b72e5d860034288c9335d4d325da4272fe50c92ab72249d58f6cbba30e4c44',
    symbol: 'IOTA',
    name: 'IOTA MOTA',
    color: '#f7746a',
    basePrice: 78
  },
  {
    id: 'ef8382df144cd3289a754b07bfb51acbe5bbc47444c36f727169c06387469ac6',
    symbol: 'OM',
    name: 'MANTRA (OLD)',
    color: '#e150f8',
    basePrice: 52
  },
  {
    id: '27cac3c00ed32285b8686611bbc4a654279c1ea11ab4dc90822c2edd20734bca',
    symbol: 'MCDX',
    name: 'MCDONALDS XSTOCK ',
    color: '#591732',
    basePrice: 48
  },
  {
    id: '273717b49430906f4b0c230e99aa1007f83758e3199edbc887c0d06c3e332494',
    symbol: 'PAXG',
    name: 'PAX GOLD',
    color: '#23476d',
    basePrice: 26
  },
  {
    id: '1c83f1a39a4f8fa59fe3644f960ed172216527b681ef530eb591149c0087f900',
    symbol: 'VANA',
    name: 'VANA',
    color: '#6b2824',
    basePrice: 68
  },
  {
    id: 'b620ba83044577029da7e4ded7a2abccf8e6afc2a0d4d26d89ccdd39ec109025',
    symbol: 'IP',
    name: 'STORY PROTOCOL',
    color: '#bf7118',
    basePrice: 33
  },
  {
    id: '05ecd4597cd48fe13d6cc3596c62af4f9675aee06e2e0b94c06d8bee2b659e05',
    symbol: 'TNSR',
    name: 'TENSOR',
    color: '#f26cdf',
    basePrice: 58
  },
  {
    id: 'ccca1d2b0d9a9ca72aa2c849329520a378aea0ec7ef14497e67da4050d6cf578',
    symbol: 'ALICE',
    name: 'MY NEIGHBOR ALICE',
    color: '#4fc838',
    basePrice: 31
  },
  {
    id: '656cc2a39dd795bdecb59de810d4f4d1e74c25fe4c42d0bf1c65a38d74df48e9',
    symbol: 'FWOG',
    name: 'FWOG',
    color: '#d7740e',
    basePrice: 69
  },
  {
    id: 'a57e29fe0a3e6165a55a42675d94aaf27e1b0183e7dfa1b7e9e3514c70f622d0',
    symbol: 'LION',
    name: 'LOADED LIONS',
    color: '#82177d',
    basePrice: 63
  },
  {
    id: '7302dee641a08507c297a7b0c8b3efa74a48a3baa6c040acab1e5209692b7e59',
    symbol: 'KAITO',
    name: 'KAITO',
    color: '#5ada0e',
    basePrice: 57
  },
  {
    id: '9c93e4a22c56885af427ac4277437e756e7ec403fbc892f975d497383bb33560',
    symbol: 'DEGEN',
    name: 'DEGEN (BASE)',
    color: '#7eeaea',
    basePrice: 25
  },
  {
    id: 'f85d863ce3b640bf85307be333dedc563aa3a27961c9042f89ed8300ebd3c855',
    symbol: 'USDB',
    name: 'BUCKET USD',
    color: '#c994f2',
    basePrice: 95
  },
  {
    id: '20b242d5efefcba3d3bd7f3ab02fbdfc4fbda23a3809dd2f48a1f9cff9d5410e',
    symbol: 'ECHO',
    name: 'ECHO PROTOCOL',
    color: '#2b71c0',
    basePrice: 27
  },
  {
    id: '807df1ed343907c4d97790334338c5df6e360036b3c95f880450d078569b5481',
    symbol: 'H',
    name: 'HUMANITY',
    color: '#a4feb5',
    basePrice: 1
  },
  {
    id: '2805c8894235111024c54253267f2b325be23763d534d2051742e39234b5835a',
    symbol: 'LL',
    name: 'LIGHTLINK',
    color: '#79f835',
    basePrice: 79
  },
  {
    id: '941320a8989414874de5aa2fc340a75d5ed91fdff1613dd55f83844d52ea63a2',
    symbol: 'IMX',
    name: 'IMMUTABLE',
    color: '#8920c5',
    basePrice: 87
  },
  {
    id: '0ebdf945e158d0071a25ddd19f95ee76e15feae608b4bb1af8e325ee03572db6',
    symbol: 'P33',
    name: 'PHARAOH LIQUID STAKING TOKEN',
    color: '#b64c13',
    basePrice: 36
  }
];

// Fast lookup map for all app feeds, matching the requested architectural pattern
export const FEEDS = {
  BTC: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ETH: "c96458d393fe9deb7a7d63a0ac41e2898a67a7750dbd166673279e06c868df0a",
  SOL: "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  AVAX: "93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7",
  LINK: "8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221",
  PYTH: "0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff",
  DOGE: "dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c",
  SUI: "23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",
  ADA: "2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d",
  DOT: "ca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b",
  UNI: "78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501",
  ATOM: "b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819",
  PEPE: "d69731a2e74ac1ce884fc3890f7ee324b6deb66147055249568869ed700882e4",
  SHIB: "f0d57deca57b3da2fe63a493f4c25925fdfd8edf834b20f93e1f84dbd1504d4a",
  OP: "385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf",
  ARB: "3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5",
  APT: "03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5",
  XRP: "ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8",
  ANIME: "45b75908a1965a86080a26d9f31ab69d045d4dda73d1394e0d3693ce00d40e6f",
  REX33: "583015352f5936e099fa7149d496ac087c5bfbfc386ce875be27dc4d69c2e023",
  XEC: "44622616f246ce5fc46cf9ebdb879b0c0157275510744cea824ad206e48390b3",
  XDC: "f689a76211f3505826357e49ddd683221d9632735e2b27fd07fb1805c47cdace",
  NEAR: "c415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750",
  DMC: "8abfa63ae82ca2fbc271861375e497166d8792580fb7c2ffcf014d2a131433f0",
  MSETH: "cd4eb98d487478925bb032580ab13e7ccfcb2e814500b526f00bd9fa651cc6b6",
  AFSUI: "17cd845b16e874485b2684f8b8d1517d744105dbb904eec30222717f4bc9ee0d",
  RON: "97cfe19da9153ef7d647b011c5e355142280ddb16004378573e6494e499879f3",
  QQQX: "178a6f73a5aede9d0d682e86b0047c9f333ed0efe5c6537ca937565219c4054d",
  AVNT: "c4aa2587b3d35cd526b8e7827f78399d16c7861f719331869c07e5fa499606d0",
  UP: "c591a547856b091560b120ee14b165a84ca58eca23b2ab635df641340bde1f10",
  RLP: "7265d5cf8ee0e7b5266f75ff19c42c5b7697a9756c9304aa78b6be4fbb8d823d",
  KTA: "61fb0189252a49fa08a0f1db3b4c8a4195edd994ed8934b971d62c9d34c74084",
  IOTA: "c7b72e5d860034288c9335d4d325da4272fe50c92ab72249d58f6cbba30e4c44",
  OM: "ef8382df144cd3289a754b07bfb51acbe5bbc47444c36f727169c06387469ac6",
  MCDX: "27cac3c00ed32285b8686611bbc4a654279c1ea11ab4dc90822c2edd20734bca",
  PAXG: "273717b49430906f4b0c230e99aa1007f83758e3199edbc887c0d06c3e332494",
  VANA: "1c83f1a39a4f8fa59fe3644f960ed172216527b681ef530eb591149c0087f900",
  IP: "b620ba83044577029da7e4ded7a2abccf8e6afc2a0d4d26d89ccdd39ec109025",
  TNSR: "05ecd4597cd48fe13d6cc3596c62af4f9675aee06e2e0b94c06d8bee2b659e05",
  ALICE: "ccca1d2b0d9a9ca72aa2c849329520a378aea0ec7ef14497e67da4050d6cf578",
  FWOG: "656cc2a39dd795bdecb59de810d4f4d1e74c25fe4c42d0bf1c65a38d74df48e9",
  LION: "a57e29fe0a3e6165a55a42675d94aaf27e1b0183e7dfa1b7e9e3514c70f622d0",
  KAITO: "7302dee641a08507c297a7b0c8b3efa74a48a3baa6c040acab1e5209692b7e59",
  DEGEN: "9c93e4a22c56885af427ac4277437e756e7ec403fbc892f975d497383bb33560",
  USDB: "f85d863ce3b640bf85307be333dedc563aa3a27961c9042f89ed8300ebd3c855",
  ECHO: "20b242d5efefcba3d3bd7f3ab02fbdfc4fbda23a3809dd2f48a1f9cff9d5410e",
  H: "807df1ed343907c4d97790334338c5df6e360036b3c95f880450d078569b5481",
  LL: "2805c8894235111024c54253267f2b325be23763d534d2051742e39234b5835a",
  IMX: "941320a8989414874de5aa2fc340a75d5ed91fdff1613dd55f83844d52ea63a2",
  P33: "0ebdf945e158d0071a25ddd19f95ee76e15feae608b4bb1af8e325ee03572db6"
};

export interface PriceData {
  price: number;
  conf: number;
  expo: number;
  publishTime: number;
}

export function formatPrice(price: number): string {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
