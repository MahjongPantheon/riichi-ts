// Inspired by and partially taken from https://github.com/takayama-lily/agari

import { digest, KOKUSHI_IDX, sliceBySuit, SUIT, sum, sumArr, VAL } from './interfaces';

export const check7 = (haipai: Int8Array) => {
  let s = 0;
  for (let i = 0; i < haipai.length; i++) {
    if (haipai[i] && haipai[i] != 2) {
      return false;
    }
    s += haipai[i];
  }
  return s == 14;
};

export const check13 = (haipai: Int8Array) => {
  let arr = KOKUSHI_IDX.map((i) => haipai[i]);
  return !arr.includes(0) && sumArr(arr) == 14;
};

const _check = (haipai: Int8Array, isJihai = false) => {
  haipai = haipai.slice(); // clone
  let s = sum(haipai);
  if (s === 0) {
    return true;
  }
  if (s % 3 === 2) {
    for (let i = 0; i < haipai.length; i++) {
      if (haipai[i] >= 2) {
        haipai[i] -= 2;
      } else {
        continue;
      }
      if (!_check(haipai, isJihai)) {
        haipai[i] += 2;
      } else {
        return true;
      }
    }
    return false;
  }
  for (let i = 0; i < haipai.length; i++) {
    if (haipai[i] === 0) {
      continue;
    }
    if (haipai[i] === 3) {
      haipai[i] = 0;
    } else {
      if (isJihai || i >= 7) {
        return false;
      }
      if (haipai[i] === 4) {
        haipai[i] -= 3;
      }
      haipai[i + 1] -= haipai[i];
      haipai[i + 2] -= haipai[i];
      if (haipai[i + 1] < 0 || haipai[i + 2] < 0) {
        return false;
      }
      haipai[i] = 0;
    }
  }
  return true;
};

export const check = (haipai: Int8Array) => {
  let j = 0;

  for (let i = 0; i < 4; i++) {
    // Summing by suit
    const sliceSum = sum(haipai.slice(i * 9, (i + 1) * 9));

    if (sliceSum % 3 === 1) {
      return false;
    }

    j += sliceSum % 3 === 2 ? 1 : 0;
  }

  const slices = sliceBySuit(haipai);
  return (
    j === 1 &&
    _check(slices[SUIT.HONOR], true) &&
    _check(slices[SUIT.MAN]) &&
    _check(slices[SUIT.PIN]) &&
    _check(slices[SUIT.SOU])
  );
};

export const checkAll = (haipai: Int8Array) => {
  return check7(haipai) || check13(haipai) || check(haipai);
};

// Finds indices in hand where kotsu is detected
// Doesn't find kantsu.
// Mutates original array!
export const findKotsu = (haipai: Int8Array) => {
  let res = [];
  for (let i = 0; i < haipai.length; i++) {
    if (haipai[i] >= 3) {
      haipai[i] -= 3;
      if (check(haipai)) {
        res.push([i, i, i]);
      } else {
        haipai[i] += 3;
      }
    }
  }
  return res;
};

// Finds arrays of indices in hand where shuntsu is detected
// Mutates original array!
export const findShuntsu = (haipai: Int8Array) => {
  let res = [];

  // Don't consider honors (last 7).
  for (let i = 0; i < haipai.length - 7; i++) {
    // Also skip last two suit tiles, because there can't be any shuntsu starting from 8 or 9.
    if (
      i === SUIT.MAN * 9 + VAL.N8 ||
      i === SUIT.MAN * 9 + VAL.N9 ||
      i === SUIT.PIN * 9 + VAL.N8 ||
      i === SUIT.PIN * 9 + VAL.N9 ||
      i === SUIT.SOU * 9 + VAL.N8 ||
      i === SUIT.SOU * 9 + VAL.N9
    ) {
      continue;
    }
    while (haipai[i] >= 1 && haipai[i + 1] >= 1 && haipai[i + 2] >= 1) {
      haipai[i]--;
      haipai[i + 1]--;
      haipai[i + 2]--;

      if (check(haipai)) {
        res.push([i, i + 1, i + 2]);
      } else {
        haipai[i]++;
        haipai[i + 1]++;
        haipai[i + 2]++;
        break;
      }
    }
  }

  return res;
};

// Finds index of first set of repeated tiles or -1 otherwise
// Skip excluded index - it's used below as fake pair
export const findJanto = (haipai: Int8Array, exclude: number = -1) => {
  for (let i = 0; i < haipai.length; i++) {
    if (haipai[i] >= 2 && i !== exclude) {
      return i;
    }
  }
  return -1;
};

// Find hand split variant
// Skip excluded index - it's used below as fake pair
export const calc = (haipai: Int8Array, exclude: number = -1, realPair: number = -1) => {
  const res: number[][][] = [];

  // First pass: find kotsu, then shuntsu
  let clone = haipai.slice();
  let kotsu = findKotsu(clone);
  if (sum(clone) === 2) {
    // toitoi-like
    const janto = realPair !== -1 ? realPair : findJanto(clone, exclude);
    res.push([...kotsu, [janto, janto]]);
  } else if (kotsu.length > 0) {
    const shuntsu = findShuntsu(clone);
    const janto = realPair !== -1 ? realPair : findJanto(clone, exclude);
    res.push([...kotsu, ...shuntsu, [janto, janto]]);
  }

  // Second pass: find shuntsu, then kotsu
  clone = haipai.slice();
  let shuntsu = findShuntsu(clone);
  if (sum(clone) === 2) {
    const janto = realPair !== -1 ? realPair : findJanto(clone, exclude);
    // pinfu-like
    res.push([...shuntsu, [janto, janto]]);
  } else {
    const kotsu = findKotsu(clone);
    const janto = realPair !== -1 ? realPair : findJanto(clone, exclude);
    res.push([...shuntsu, ...kotsu, [janto, janto]]);
  }

  return res;
};

export const findAllAgariPatterns = (haipai: Int8Array) => {
  let res: number[][][] = [];
  haipai = haipai.slice(); // clone

  const canBeKokushi = check13(haipai);
  const canBeChiitoitsu = check7(haipai);
  const canBeBasicForm = check(haipai);
  if (!canBeKokushi && !canBeChiitoitsu && !canBeBasicForm) {
    return res;
  }

  // only a pair left in closed part -> try to detect and return it
  if (sum(haipai) === 2) {
    const found = findJanto(haipai);
    if (found !== -1) {
      res.push([[found, found]]);
    }
    return res;
  }

  // Check kokushi separately
  if (canBeKokushi) {
    res.push([
      haipai.reduce((acc, v, idx) => {
        if (v > 0) {
          acc.push(idx);
          if (v > 1) {
            acc.push(idx);
          }
        }
        return acc;
      }, [] as number[]),
    ]);
  }

  // Some questionable code below :)

  let fakePairIndex: number = -1;
  for (let i = SUIT.HONOR * 9; i < 34; i++) {
    if (haipai[i] === 0) {
      // found first honor tile that is absent in hand
      haipai[i] += 2; // add two fake tiles there so calc() would think the hand is valid when another pair is excluded.
      fakePairIndex = i; // save fake pair index to avoid processing it below
      break;
    }
  }

  // Here we try to iterate over hand and try to exclude any found pair from there.
  // If hand is still valid, this means we found another proper valid hand decomposition.
  // Fake pair added above is required to keep proper tiles count in hand.
  for (let i = 0; i < haipai.length; i++) {
    if (i === fakePairIndex) {
      // Don't process fake pair
      continue;
    }

    if (haipai[i] >= 2) {
      haipai[i] -= 2;
      if (check(haipai)) {
        res = res.concat(calc(haipai, fakePairIndex, i));
      }
      haipai[i] += 2;
    }
  }

  haipai[fakePairIndex] -= 2;

  if (canBeChiitoitsu) {
    res.push(
      haipai.reduce((acc, v, idx) => {
        if (v === 2) {
          acc.push([idx, idx]);
        }
        return acc;
      }, [] as number[][])
    );
  }

  // Finally we try to find and eliminate duplicate decompositions.
  let finalRes = [];
  for (let v of res) {
    let is_duplicate = false;
    const vDigest = digest(v);
    for (let vv of finalRes) {
      if (vDigest === digest(vv)) {
        is_duplicate = true;
      }
    }
    if (!is_duplicate) {
      finalRes.push(v);
    }
  }

  return finalRes;
};
