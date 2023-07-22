// Inspired by and partially taken from https://github.com/takayama-lily/syanten

import { KOKUSHI_IDX, RET, sum } from './interfaces';

export const shanten13 = (haipai: Int8Array) => {
  let cnt = sum(haipai);
  if (cnt < 13 || cnt > 14) {
    return RET.WRONG_COUNT;
  }
  let singles = 0;
  let atLeastOnePair = 0;
  for (let i of KOKUSHI_IDX) {
    if (haipai[i] >= 1) {
      singles++;
    }
    if (haipai[i] > 1) {
      atLeastOnePair = 1;
    }
  }

  return 13 - singles - atLeastOnePair;
};

export const shanten7 = (haipai: Int8Array) => {
  let cnt = sum(haipai);
  if (cnt < 13 || cnt > 14) {
    return RET.WRONG_COUNT;
  }

  let pairs = 0;
  let singles = 0;

  for (let i = 0; i < 34; i++) {
    if (haipai[i] >= 2) pairs++;
    if (haipai[i] === 1) singles++;
  }

  if (pairs + singles >= 7) {
    return 6 - pairs;
  } else {
    return 6 - pairs + (7 - pairs - singles);
  }
};

const searchHelper = (
  handPart: Int8Array,
  index: number,
  isJihai = false,
  mentsu: number,
  tatsu: number,
  singles: number
) => {
  let tmp = [0, 0, 0];
  let max = [mentsu, tatsu, singles];
  if (index === (isJihai ? 7 : 9)) {
    return max;
  }
  if (handPart[index] === 0) {
    tmp = searchHelper(handPart, index + 1, isJihai, mentsu, tatsu, singles);
    if (tmp > max) {
      max = tmp;
    }
  }
  if (handPart[index] >= 3) {
    handPart[index] -= 3;
    tmp = searchHelper(handPart, index, isJihai, mentsu + 1, tatsu, singles);
    if (tmp > max) {
      max = tmp;
    }
    handPart[index] += 3;
  }
  if (handPart[index] >= 2) {
    handPart[index] -= 2;
    tmp = searchHelper(handPart, index, isJihai, mentsu, tatsu + 1, singles);
    if (tmp > max) {
      max = tmp;
    }
    handPart[index] += 2;
  }
  if (handPart[index] >= 1) {
    handPart[index] -= 1;
    tmp = searchHelper(handPart, index, isJihai, mentsu, tatsu, singles + 1);
    if (tmp > max) {
      max = tmp;
    }
    handPart[index] += 1;
  }
  if (!isJihai) {
    if (handPart[index] > 0 && handPart[index + 1] > 0 && handPart[index + 2] > 0) {
      handPart[index]--;
      handPart[index + 1]--;
      handPart[index + 2]--;
      tmp = searchHelper(handPart, index, isJihai, mentsu + 1, tatsu, singles);
      if (tmp > max) {
        max = tmp;
      }
      handPart[index]++;
      handPart[index + 1]++;
      handPart[index + 2]++;
    }
    if (handPart[index] > 0 && handPart[index + 2] > 0) {
      handPart[index]--;
      handPart[index + 2]--;
      tmp = searchHelper(handPart, index, isJihai, mentsu, tatsu + 1, singles);
      if (tmp > max) {
        max = tmp;
      }
      handPart[index]++;
      handPart[index + 2]++;
    }
    if (handPart[index] > 0 && handPart[index + 1] > 0) {
      handPart[index]--;
      handPart[index + 1]--;
      tmp = searchHelper(handPart, index, isJihai, mentsu, tatsu + 1, singles);
      if (tmp > max) {
        max = tmp;
      }
      handPart[index]++;
      handPart[index + 1]++;
    }
  }
  return max;
};

export const shanten = (haipai: Int8Array) => {
  let res = 9;
  let mentsu = 0;
  let tatsu = 0;
  let singles = 0;
  let furo = 0;

  const search = (arr: Int8Array, isJihai = false) => {
    let tmp = searchHelper(arr, 0, isJihai, 0, 0, 0);
    mentsu += tmp[0];
    tatsu += tmp[1];
    singles += tmp[2];
  };

  const calc = () => {
    let tmpRes = -1;
    while (mentsu < 4 - furo) {
      if (tatsu && singles) {
        tatsu--;
        singles--;
        mentsu++;
        tmpRes++;
        continue;
      }
      if (tatsu && !singles) {
        tatsu--;
        singles++;
        mentsu++;
        tmpRes++;
        continue;
      }
      if (!tatsu && singles) {
        singles -= 2;
        mentsu++;
        tmpRes += 2;
      }
    }
    if (singles > 0) {
      tmpRes++;
    }
    res = tmpRes < res ? tmpRes : res;
    mentsu = tatsu = singles = 0;
  };

  let s = sum(haipai);
  if (s > 14 || s % 3 === 0) {
    return RET.WRONG_COUNT;
  }

  furo = Math.round((14 - s) / 3);
  haipai = haipai.slice(); // clone

  if (s % 3 === 1) {
    for (let i = 33; ; i--) {
      if (!haipai[i]) {
        haipai[i]++;
        break;
      }
    }
  }

  for (let i = 0; i < 34; i++) {
    if (haipai[i] === 0) {
      continue;
    }
    let t = haipai.slice(); // clone
    t[i] -= haipai[i] >= 2 ? 2 : haipai[i];
    search(t.slice(0, 9));
    search(t.slice(9, 18));
    search(t.slice(18, 27));
    search(t.slice(27, 34), true);
    calc();
  }

  return res;
};

export const hairi = (haipai: Int8Array, is7or13 = false) => {
  let shantenCalc = !is7or13
    ? shanten
    : (haiArr: Int8Array) => Math.min(shanten7(haiArr), shanten13(haiArr));
  let sht = shantenCalc(haipai);
  let res: { now: number; wait?: number[]; waitsAfterDiscard?: Record<number, number[]> } = {
    now: sht,
  };
  if (sht === RET.WRONG_COUNT) {
    return res;
  }

  const calcHairi = (currentTileIndex = -1) => {
    const waits = [];
    for (let i = 0; i < 34; i++) {
      if (i === currentTileIndex) {
        continue;
      }
      if (!is7or13 && i == 3 && haipai[i] === 0) {
        continue;
      }
      if (
        !is7or13 &&
        i < 3 &&
        haipai[i] === 0 &&
        haipai[i - 1] !== 0 &&
        haipai[i - 2] !== 0 &&
        haipai[i + 1] !== 0
      ) {
        continue;
      }
      haipai[i]++;
      if (shantenCalc(haipai) < sht) {
        waits.push(i);
      }
      haipai[i]--;
    }
    return waits;
  };

  // 13-tile hand: calculate hairi once and return waits
  if (sum(haipai) % 3 === 1) {
    res.wait = calcHairi();
    return res;
  }

  // 14-tile non-tempai hand: try to detect possible discards and waits after it
  res.waitsAfterDiscard = {};
  for (let i = 0; i < 34; i++) {
    if (haipai[i] === 0) {
      continue;
    }
    haipai[i]--;
    if (shantenCalc(haipai) === sht) {
      res.waitsAfterDiscard[i] = calcHairi(i);
    }
    haipai[i]++;
  }

  return res;
};
