import assert from 'assert';
import { check13, check7 } from './agari';
import { Riichi } from './riichi';
import { digest, is19, sliceBySuit, sum } from './interfaces';

const checkAllowed = (o: Riichi, allowed: number[]) => {
  for (const v of o.hai) {
    if (!allowed.includes(v)) {
      return false;
    }
  }
  for (const v of o.furo) {
    for (const vv of v) {
      if (!allowed.includes(Math.abs(vv))) {
        return false;
      }
    }
  }
  return true;
};

const toHand = (pattern: number[][]) => {
  const occurences = pattern.flat();
  const hand = new Int8Array(
    // prettier-ignore
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0]
  );
  for (const tile of occurences) {
    hand[Math.abs(tile)]++;
  }
  return hand;
};

// Get same suit index or -1 if there are more than one suit in hand or hand consists of honors
const getSameSuit = (o: Riichi, excludeHonors = false) => {
  let foundSuit = -1;
  const slices = sliceBySuit(toHand(o.currentPattern ?? []));
  for (const i in slices) {
    if (sum(slices[i]) === 0) {
      continue;
    }
    if (excludeHonors && parseInt(i, 10) === 3) {
      continue;
    }
    if (foundSuit !== -1) {
      // more than one suit in hand
      return -1;
    }
    foundSuit = parseInt(i, 10);
  }
  return foundSuit === 3 ? -1 : foundSuit;
};

const checkChanta = (o: Riichi, allow: number[]) => {
  let hasJyuntsu = false;
  for (const v of o.currentPattern ?? []) {
    if (v.length <= 2 || v[0] === v[1]) {
      if (!allow.includes(Math.abs(v[0]))) {
        return false;
      }
    } else {
      if (v[0] === v[1] && v[0] === v[2]) {
        if (!allow.includes(Math.abs(v[0]))) {
          return false;
        }
      } else {
        hasJyuntsu = true;
        if (!is19(v[0]) && !is19(v[2])) {
          return false;
        }
      }
    }
  }
  return hasJyuntsu;
};

const checkYakuhai = (o: Riichi, which: number) => {
  for (const v of o.currentPattern ?? []) {
    if (
      Math.abs(v[0]) === which &&
      [o.jikaze, o.bakaze, 31, 32, 33].includes(Math.abs(v[0])) &&
      v.length >= 3
    ) {
      return true;
    }
  }
  return false;
};

export const YAKU = {
  'kokushimusou 13 sides': {
    isLocal: false,
    yakuman: 2,
    han: 0,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      return (
        check13(o.haipai) &&
        o.hai.reduce((total, v) => (v === o.takenTile ? ++total : total), 0) === 2
      );
    },
  },
  kokushimusou: {
    isLocal: false,
    yakuman: 1,
    han: 0,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      return (
        check13(o.haipai) &&
        o.hai.reduce((total, v) => (v === o.takenTile ? ++total : total), 0) === 1
      );
    },
  },
  'chuurenpoto 9 sides': {
    isLocal: false,
    yakuman: 2,
    han: 0,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      const slices = sliceBySuit(o.haipai);
      const foundSuit = getSameSuit(o);
      if (
        foundSuit === -1 ||
        slices[foundSuit][0] < 3 ||
        slices[foundSuit][8] < 3 ||
        slices[foundSuit].includes(0)
      ) {
        return false;
      }
      return o.takenTile !== null && [2, 4].includes(slices[foundSuit][o.takenTile % 9]);
    },
  },
  chuurenpoto: {
    isLocal: false,
    yakuman: 1,
    han: 0,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      const slices = sliceBySuit(o.haipai);
      const foundSuit = getSameSuit(o);
      if (
        foundSuit === -1 ||
        slices[foundSuit][0] < 3 ||
        slices[foundSuit][8] < 3 ||
        slices[foundSuit].includes(0)
      ) {
        return false;
      }
      return o.takenTile !== null && [1, 3].includes(slices[foundSuit][o.takenTile % 9]);
    },
  },
  'suuankou tanki': {
    isLocal: false,
    yakuman: 2,
    han: 0,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      if (o.furo.length > 0) {
        if (o.furo.some((v) => 1 / v[0] > 0)) {
          // open sets are not allowed
          return false;
        }
      }
      let kotsu = 0;
      for (const v of o.currentPattern ?? []) {
        if (v.length >= 3 && v[0] === v[1]) {
          kotsu++;
        } else {
          if (v[0] !== o.takenTile) {
            return false;
          }
        }
      }
      return kotsu === 4;
    },
  },
  suuankou: {
    isLocal: false,
    yakuman: 1,
    han: 0,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      if (o.furo.length > 0) {
        if (o.furo.some((v) => 1 / v[0] > 0)) {
          // open sets are not allowed
          return false;
        }
      }
      let kotsu = 0;
      for (const v of o.currentPattern ?? []) {
        if (v.length >= 3 && v[0] === v[1]) {
          kotsu++;
        }
      }

      return kotsu === 4 && o.isTsumo && !YAKU['suuankou tanki'].check(o);
    },
  },
  daisuushi: {
    isLocal: false,
    yakuman: 2,
    han: 0,
    isMenzenOnly: false,
    isFuroMinus: false,
    check: (o: Riichi) => {
      const need = [27, 28, 29, 30];
      let res = 0;
      for (const v of o.currentPattern ?? []) {
        if (need.includes(Math.abs(v[0])) && v.length >= 3) {
          res++;
        }
      }
      return res === 4;
    },
  },
  shosuushi: {
    isLocal: false,
    yakuman: 1,
    han: 0,
    isMenzenOnly: false,
    isFuroMinus: false,
    check: (o: Riichi) => {
      const need = [27, 28, 29, 30];
      let kotsu = 0;
      let toitsu = 0;
      for (const v of o.currentPattern ?? []) {
        if (need.includes(Math.abs(v[0])) && v.length >= 3) {
          kotsu++;
        }
        if (need.includes(v[0]) && v.length === 2) {
          toitsu++;
        }
      }
      return kotsu === 3 && toitsu === 1;
    },
  },
  daisangen: {
    isLocal: false,
    yakuman: 1,
    han: 0,
    isMenzenOnly: false,
    isFuroMinus: false,
    check: (o: Riichi) => {
      const need = [31, 32, 33];
      let kotsu = 0;
      for (const v of o.currentPattern ?? []) {
        if (need.includes(Math.abs(v[0])) && v.length >= 3) {
          kotsu++;
        }
      }
      return kotsu === 3;
    },
  },
  tsuuiisou: {
    isLocal: false,
    yakuman: 1,
    han: 0,
    isMenzenOnly: false,
    isFuroMinus: false,
    check: (o: Riichi) => checkAllowed(o, [27, 28, 29, 30, 31, 32, 33]),
  },
  ryuuiisou: {
    isLocal: false,
    yakuman: 1,
    han: 0,
    isMenzenOnly: false,
    isFuroMinus: false,
    check: (o: Riichi) => checkAllowed(o, [19, 20, 21, 23, 25, 32]),
  },
  chinroutou: {
    isLocal: false,
    yakuman: 1,
    han: 0,
    isMenzenOnly: false,
    isFuroMinus: false,
    check: (o: Riichi) => checkAllowed(o, [0, 8, 9, 17, 18, 26]),
  },
  suukantsu: {
    isLocal: false,
    yakuman: 1,
    han: 0,
    isMenzenOnly: false,
    isFuroMinus: false,
    check: (o: Riichi) => {
      let kantsu = 0;
      for (const v of o.currentPattern ?? []) {
        if (v.length === 4) {
          kantsu++;
        }
      }
      return kantsu === 4;
    },
  },
  tenhou: {
    isLocal: false,
    yakuman: 1,
    han: 0,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      return o.extra.firstTake && o.isTsumo && o.jikaze === 27 && !o.furo.length;
    },
  },
  chihou: {
    isLocal: false,
    yakuman: 1,
    han: 0,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      return o.extra.firstTake && o.isTsumo && o.jikaze !== 27 && !o.furo.length;
    },
  },
  renhou: {
    isLocal: true,
    yakuman: 1,
    han: 0,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      return o.extra.firstTake && !o.isTsumo && !o.furo.length;
    },
  },
  daisharin: {
    isLocal: true,
    yakuman: 1,
    han: 0,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      return checkAllowed(o, [27, 28, 29, 30, 31, 32, 33]) && YAKU.chiitoitsu.check(o);
    },
  },
  chinitsu: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 6,
    isFuroMinus: true,
    check: (o: Riichi) => getSameSuit(o) !== -1,
  },
  honitsu: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 3,
    isFuroMinus: true,
    check: (o: Riichi) => {
      return getSameSuit(o, true) !== -1 && !YAKU.chinitsu.check(o);
    },
  },
  ryanpeikou: {
    isLocal: false,
    yakuman: 0,
    han: 3,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      const arr: Record<string, number> = {};
      if (o.furo.length > 0) {
        return false;
      }
      for (const v of o.currentPattern ?? []) {
        if (v.length >= 3 && v[0] === v[1]) {
          return false;
        }
        if (v.length === 3) {
          if (arr[digest([v])]) {
            arr[digest([v])]++;
          } else {
            arr[digest([v])] = 1;
          }
        }
      }
      return Object.values(arr).length > 0 && Object.values(arr).every((v) => v === 2);
    },
  },
  junchan: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 3,
    isFuroMinus: true,
    check: (o: Riichi) => checkChanta(o, [0, 8, 9, 17, 18, 26]),
  },
  chanta: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 2,
    isFuroMinus: true,
    check: (o: Riichi) =>
      checkChanta(o, [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33]) && !YAKU.junchan.check(o),
  },
  toitoi: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 2,
    isFuroMinus: false,
    check: (o: Riichi) => {
      let kotsu = 0;
      for (const v of o.currentPattern ?? []) {
        if (v.length >= 3 && v[0] === v[1]) {
          kotsu++;
        }
      }
      return kotsu === 4;
    },
  },
  honroutou: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 2,
    isFuroMinus: false,
    check: (o: Riichi) => checkAllowed(o, [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33]),
  },
  sankantsu: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 2,
    isFuroMinus: false,
    check: (o: Riichi) => {
      let kantsu = 0;
      for (const v of o.currentPattern ?? []) {
        if (v.length === 4) {
          kantsu++;
        }
      }
      return kantsu === 3;
    },
  },
  shosangen: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 2,
    isFuroMinus: false,
    check: (o: Riichi) => {
      const need = [31, 32, 33];
      let kotsuOrToitsu = 0;
      for (const v of o.currentPattern ?? []) {
        if (need.includes(Math.abs(v[0])) && v[0] === v[1]) {
          kotsuOrToitsu++;
        }
      }
      return kotsuOrToitsu === 3 && !YAKU.daisangen.check(o) && !YAKU.chiitoitsu.check(o);
    },
  },
  'sanshoku doukou': {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 2,
    isFuroMinus: false,
    check: (o: Riichi) => {
      const res: Record<number, number> = {};
      for (const v of o.currentPattern ?? []) {
        if (
          v.length >= 3 &&
          v[0] === v[1] &&
          ![27, 28, 29, 30, 31, 32, 33].includes(Math.abs(v[0]))
        ) {
          const abs = Math.abs(v[0]);
          if (!res[abs % 9]) {
            res[abs % 9] = 1;
          } else {
            res[abs % 9]++;
          }
        }
      }
      return Object.values(res).includes(3);
    },
  },
  sanankou: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 2,
    isFuroMinus: false,
    check: (o: Riichi) => {
      let kotsu = 0;

      // keep here all tiles that are not closed kantsu
      const openKotsu = new Set();
      for (const k of o.furo) {
        if (1 / k[0] > 0 && k[0] === k[1]) {
          // workaround: use 1/k[0] because we can have -0 as a valid value for closed 1m kan
          openKotsu.add(k[0]);
        }
      }

      const closedPart = o.currentPattern?.filter(
        (set) => o.furo.find((meld) => digest([set]) === digest([meld])) === undefined
      );
      for (const v of o.currentPattern ?? []) {
        if (
          openKotsu.has(v[0]) ||
          (v.length >= 3 &&
            !o.isTsumo &&
            o.takenTile !== undefined &&
            o.takenTile !== null &&
            v[0] === v[1] &&
            v.includes(o.takenTile) &&
            closedPart?.find(
              // Taken tile should not be included in any other chi set, otherwise we still count is as kotsu
              (set) => o.takenTile === v[0] && set[0] !== set[1] && set.includes(o.takenTile)
            ) === undefined)
        ) {
          continue;
        }
        if (v.length >= 3 && v[0] === v[1]) {
          kotsu++;
        }
      }

      return kotsu === 3;
    },
  },
  chiitoitsu: {
    isLocal: false,
    yakuman: 0,
    han: 2,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      return check7(o.haipai) && !YAKU.ryanpeikou.check(o);
    },
  },
  'daburu riichi': {
    isLocal: false,
    yakuman: 0,
    han: 2,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => o.extra.doubleRiichi && !o.furo.filter((v) => 1 / v[0] > 0).length,
  },
  ittsu: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 2,
    isFuroMinus: true,
    check: (o: Riichi) => {
      const res = [
        new Int8Array([0, 0, 0]), // man shuntsu
        new Int8Array([0, 0, 0]), // pin shuntsu
        new Int8Array([0, 0, 0]), // sou shuntsu
      ];
      for (const v of o.currentPattern ?? []) {
        if (v[0] === v[1]) {
          continue;
        }
        if ([0, 3, 6, 9, 12, 15, 18, 21, 24].includes(v[0])) {
          res[Math.floor(v[0] / 9)][Math.round((v[0] % 9) / 3)]++;
        }
      }
      return res.some((suit) => suit.every((t) => t >= 1));
    },
  },
  sanshoku: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 2,
    isFuroMinus: true,
    check: (o: Riichi) => {
      const res = [
        new Int8Array([0, 0, 0, 0, 0, 0, 0, 0, 0]), // man shuntsu
        new Int8Array([0, 0, 0, 0, 0, 0, 0, 0, 0]), // pin shuntsu
        new Int8Array([0, 0, 0, 0, 0, 0, 0, 0, 0]), // sou shuntsu
      ];

      for (const v of o.currentPattern ?? []) {
        if (v[0] === v[1]) {
          continue;
        }
        // collect shutsu count starting at current tile
        res[Math.floor(v[0] / 9)][v[0] % 9]++;
      }

      for (let i = 0; i < 9; i++) {
        if (res[0][i] > 0 && res[1][i] > 0 && res[2][i] > 0) {
          return true;
        }
      }

      return false;
    },
  },
  tanyao: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => {
      if (o.furo.filter((v) => v[0] > 0).length > 0 && !o.allowKuitan) {
        return false;
      }
      return checkAllowed(
        o,
        [1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 24, 25]
      );
    },
  },
  pinfu: {
    isLocal: false,
    yakuman: 0,
    han: 1,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      if (o.furo.length > 0) {
        return false;
      }
      let fu = 0;
      let hasPairFu = false;
      for (const v of o.currentPattern ?? []) {
        if (v.length === 4) {
          fu += is19(Math.abs(v[0])) ? (v[0] > 0 ? 16 : 32) : v[0] > 0 ? 8 : 16;
        } else if (v.length === 2) {
          if ([o.bakaze, o.jikaze, 31, 32, 33].includes(v[0])) {
            // pair of yakuhai tile
            fu += 2;
          }
          if (v[0] === o.takenTile) {
            hasPairFu = true;
          }
        } else if (v.length === 3) {
          if (v[0] === v[1]) {
            fu += is19(v[0]) ? 4 : 2;
          }
        }
      }

      // check kanchan/penchan
      let canBeRyanmen = false;
      let canBeShanpon = false;
      let canBeTanki = false;
      if (o.takenTile !== null && o.takenTile !== undefined) {
        for (const v of o.currentPattern ?? []) {
          if (v.length !== 3) {
            if (v.length === 2 && o.takenTile === v[0]) {
              // tanki waits are already handled above
              canBeTanki = true;
            }
            continue;
          }

          if (v[0] === v[1] && v[0] === o.takenTile) {
            canBeShanpon = true;
          }

          if ((v[0] === o.takenTile && !is19(v[2])) || (v[2] === o.takenTile && !is19(v[0]))) {
            canBeRyanmen = true;
          }
        }

        if (!canBeShanpon && !canBeRyanmen && !canBeTanki) {
          fu += 2;
        }
      }

      if (hasPairFu && !canBeRyanmen) {
        fu += 2;
      }

      return fu === 0;
    },
  },
  iipeikou: {
    isLocal: false,
    yakuman: 0,
    han: 1,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => {
      if (YAKU.ryanpeikou.check(o)) return false;
      for (const idx in o.currentPattern) {
        let i = parseInt(idx);
        const v = o.currentPattern[i];
        if (v.length === 3 && v[0] != v[1]) {
          while (i < 4) {
            i++;
            try {
              assert.deepStrictEqual(v, o.currentPattern[i]);
              return true;
            } catch (e) {}
          }
        }
      }
      return false;
    },
  },
  menzentsumo: {
    isLocal: false,
    yakuman: 0,
    han: 1,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => o.isTsumo,
  },
  riichi: {
    isLocal: false,
    yakuman: 0,
    han: 1,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => o.extra.riichi && !YAKU['daburu riichi'].check(o),
  },
  ippatsu: {
    isLocal: false,
    yakuman: 0,
    han: 1,
    isMenzenOnly: true,
    isFuroMinus: false,
    check: (o: Riichi) => o.extra.ippatsu,
  },
  rinshan: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => {
      let hasKantsu = false;
      for (const v of o.furo) {
        if (v.length === 4) {
          hasKantsu = true;
          break;
        }
      }
      return hasKantsu && o.extra.afterKan && !o.extra.lastTile && o.isTsumo;
    },
  },
  chankan: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => o.extra.afterKan && !o.extra.lastTile && !o.isTsumo,
  },
  haitei: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => o.extra.lastTile && o.isTsumo,
  },
  houtei: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => o.extra.lastTile && !o.isTsumo,
  },
  'round wind east': {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => o.bakaze === 27 && checkYakuhai(o, 27),
  },
  'round wind south': {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => o.bakaze === 28 && checkYakuhai(o, 28),
  },
  'round wind west': {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => o.bakaze === 29 && checkYakuhai(o, 29),
  },
  'round wind north': {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => o.bakaze === 30 && checkYakuhai(o, 30),
  },
  'own wind east': {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => o.jikaze === 27 && checkYakuhai(o, 27),
  },
  'own wind south': {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => o.jikaze === 28 && checkYakuhai(o, 28),
  },
  'own wind west': {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => o.jikaze === 29 && checkYakuhai(o, 29),
  },
  'own wind north': {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => o.jikaze === 30 && checkYakuhai(o, 30),
  },
  haku: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => checkYakuhai(o, 31),
  },
  hatsu: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => checkYakuhai(o, 32),
  },
  chun: {
    isLocal: false,
    yakuman: 0,
    isMenzenOnly: false,
    han: 1,
    isFuroMinus: false,
    check: (o: Riichi) => checkYakuhai(o, 33),
  },
};
