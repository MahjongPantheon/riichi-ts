// Hand structure is represented by plain 34-element Int8Array
// Here are some useful methods for calculation or the index in hand array.

export const SUIT = {
  MAN: 0,
  PIN: 1,
  SOU: 2,
  HONOR: 3,
} as const;

export const VAL = {
  TON: 0,
  NAN: 1,
  SHA: 2,
  PEI: 3,
  HAKU: 4,
  HATSU: 5,
  CHUN: 6,

  N1: 0,
  N2: 1,
  N3: 2,
  N4: 3,
  N5: 4,
  N6: 5,
  N7: 6,
  N8: 7,
  N9: 8,
} as const;

export const RET = {
  OK: -1,
  FAIL: -2,
  WRONG_COUNT: -3,
} as const;

export const TILES = {
  m1: SUIT.MAN * 9 + VAL.N1,
  m2: SUIT.MAN * 9 + VAL.N2,
  m3: SUIT.MAN * 9 + VAL.N3,
  m4: SUIT.MAN * 9 + VAL.N4,
  m5: SUIT.MAN * 9 + VAL.N5,
  m6: SUIT.MAN * 9 + VAL.N6,
  m7: SUIT.MAN * 9 + VAL.N7,
  m8: SUIT.MAN * 9 + VAL.N8,
  m9: SUIT.MAN * 9 + VAL.N9,

  p1: SUIT.PIN * 9 + VAL.N1,
  p2: SUIT.PIN * 9 + VAL.N2,
  p3: SUIT.PIN * 9 + VAL.N3,
  p4: SUIT.PIN * 9 + VAL.N4,
  p5: SUIT.PIN * 9 + VAL.N5,
  p6: SUIT.PIN * 9 + VAL.N6,
  p7: SUIT.PIN * 9 + VAL.N7,
  p8: SUIT.PIN * 9 + VAL.N8,
  p9: SUIT.PIN * 9 + VAL.N9,

  s1: SUIT.SOU * 9 + VAL.N1,
  s2: SUIT.SOU * 9 + VAL.N2,
  s3: SUIT.SOU * 9 + VAL.N3,
  s4: SUIT.SOU * 9 + VAL.N4,
  s5: SUIT.SOU * 9 + VAL.N5,
  s6: SUIT.SOU * 9 + VAL.N6,
  s7: SUIT.SOU * 9 + VAL.N7,
  s8: SUIT.SOU * 9 + VAL.N8,
  s9: SUIT.SOU * 9 + VAL.N9,

  e: SUIT.HONOR * 9 + VAL.TON,
  s: SUIT.HONOR * 9 + VAL.NAN,
  w: SUIT.HONOR * 9 + VAL.SHA,
  n: SUIT.HONOR * 9 + VAL.PEI,

  wd: SUIT.HONOR * 9 + VAL.HAKU,
  gd: SUIT.HONOR * 9 + VAL.HATSU,
  rd: SUIT.HONOR * 9 + VAL.CHUN,
} as const;

export const KOKUSHI_IDX = [
  TILES.m1,
  TILES.m9,
  TILES.p1,
  TILES.p9,
  TILES.s1,
  TILES.s9,
  TILES.e,
  TILES.s,
  TILES.w,
  TILES.n,
  TILES.wd,
  TILES.gd,
  TILES.rd,
] as const;

export const idx = (suit: number, val: number) => suit * 9 + val;

export const sum = (haipai: Int8Array) => haipai.reduce((acc, v) => acc + v, 0);
export const sumArr = (haipai: any[]) => haipai.reduce((acc, v) => acc + v, 0);

export const sliceBySuit = (haipai: Int8Array) => [
  haipai.slice(SUIT.MAN * 9, SUIT.MAN * 9 + 9),
  haipai.slice(SUIT.PIN * 9, SUIT.PIN * 9 + 9),
  haipai.slice(SUIT.SOU * 9, SUIT.SOU * 9 + 9),
  haipai.slice(SUIT.HONOR * 9, SUIT.HONOR * 9 + 7),
];

export const joinFromSuits = (suits: Int8Array[]) =>
  suits.reduce(
    (acc, v) => {
      acc.set(v, acc.length);
      return acc;
    },
    new Int8Array(suits.reduce((acc, v) => acc + v.length, 0))
  );

export const sumSuit = (haipai: Int8Array, suit: number) => {
  const lim = suit === SUIT.HONOR ? 7 : 9;
  const start = idx(suit, 0);
  let sum = 0;
  for (let i = 0; i < lim; i++) {
    sum += haipai[start + i];
  }
  return sum;
};

export const ceil10 = (num: number) => {
  return Math.ceil(num / 10) * 10;
};

export const ceil100 = (num: number) => {
  return Math.ceil(num / 100) * 100;
};

export const is19 = (idx: number) => {
  return KOKUSHI_IDX.includes(idx);
};

export const isProperOpenSet = (arr: number[]) => {
  if (arr.length > 4 || arr.length < 2) {
    return false;
  }

  let set = new Set(arr); // unique
  if (set.size === 1) {
    return true;
  } else {
    if (set.size !== 3) {
      return false;
    }
    let minus1 = arr[1] - arr[0];
    let minus2 = arr[2] - arr[1];
    if (minus1 !== minus2 || minus1 !== 1) {
      return false;
    }
  }

  return true;
};

// Create stable digest of a decomposition to use in deduplication code
export const digest = (decomposition: number[][]) => {
  return decomposition
    .map((set) => '|' + set.join(',') + '|')
    .sort() // required to make decomposition stable
    .join('#');
};

export const digestAll = (decompositions: number[][][]) => {
  return decompositions.map((dec) => digest(dec)).join('$');
};
