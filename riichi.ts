import { checkAll, findAllAgariPatterns } from './agari';
import { hairi } from './shanten';
import { YAKU } from './yaku';
import { ceil10, ceil100, is19, isProperOpenSet } from './interfaces';

type Options = {
  dora?: number[];
  firstTake?: boolean; // tenhou/chihou/renhou
  riichi?: boolean;
  ippatsu?: boolean;
  daburuRiichi?: boolean;
  lastTake?: boolean; // haitei/houtei
  afterKan?: boolean; // chankan/rinshan
  bakaze: number;
  jikaze: number;
};

type Result = {
  isAgari: boolean;
  yakuman: number;
  yaku: Record<string, number>;
  han: number;
  fu: number;
  ten: number;
  outgoingTen?: { oya: number; ko: number };
  name: string;
  text: string;
  error: boolean;
  hairi?: ReturnType<typeof hairi>;
  hairi7and13?: ReturnType<typeof hairi>;
};

const sortByInt = (a1: number, a2: number) => a1 - a2;

export class Riichi {
  public hai: number[] = [];
  public haipai: Int8Array = new Int8Array(
    // prettier-ignore
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ]
  );
  // Open tiles
  // Closed kan will be with minus sign in tile values
  public furo: number[][] = [];
  public takenTile: number | null = null;
  public dora: number[] = [];
  public extra = {
    text: '',
    firstTake: false,
    riichi: false,
    ippatsu: false,
    doubleRiichi: false,
    lastTile: false,
    afterKan: false,
  };
  public isTsumo = true;
  public bakaze = 1;
  public jikaze = 2;
  public aka = 0;
  public agariPatterns: number[][][] = [];
  public currentPattern: number[][] | null = null;
  public tmpResult: Result = {
    isAgari: false,
    yakuman: 0,
    yaku: {},
    han: 0,
    fu: 0,
    ten: 0,
    name: '',
    text: '',
    error: true,
  };
  public finalResult: Result | undefined;
  public allLocalEnabled = false;
  public localEnabled: string[] = [];
  public disabled: string[] = [];
  public allowDoubleYakuman = true;
  public allowKuitan = true;
  public withKiriage = false;
  public allowAka = true;
  public hairi = true;

  constructor(
    closedPart: number[],
    openPart: Array<{ open: boolean; tiles: number[] }>,
    options: Options,
    tileDiscardedBySomeone?: number,
    firstTake?: boolean,
    riichi?: boolean,
    ippatsu?: boolean,
    doubleRiichi?: boolean,
    lastTile?: boolean,
    afterKan?: boolean,
    akaCount?: number,
    allowAka?: boolean,
    allowKuitan?: boolean,
    withKiriage?: boolean
  ) {
    this.extra.firstTake = firstTake ?? false;
    this.extra.riichi = riichi ?? false;
    this.extra.ippatsu = ippatsu ?? false;
    this.extra.doubleRiichi = doubleRiichi ?? false;
    this.extra.lastTile = lastTile ?? false;
    this.extra.afterKan = afterKan ?? false;
    this.allowAka = allowAka ?? false;
    this.allowKuitan = allowKuitan ?? false;
    this.withKiriage = withKiriage ?? false;
    this.hai = closedPart;
    this.aka += akaCount ?? 0;

    this.dora = options.dora ?? [];
    if (tileDiscardedBySomeone !== undefined && tileDiscardedBySomeone !== null) {
      this.takenTile = tileDiscardedBySomeone;
      this.hai.push(this.takenTile);
      this.isTsumo = false;
    } else {
      this.takenTile = this.hai.slice(-1)[0];
    }

    for (const vv of openPart) {
      if (isProperOpenSet(vv.tiles)) {
        this.furo.push([...vv.tiles.map((v) => (vv.open ? v : -v))].sort(sortByInt));
      } else {
        // TODO: not sure this is proper; there shouldn't be any incorrect sets
        this.hai = this.hai.concat(vv.tiles);
      }
    }

    if (this.hai.length % 3 === 0) {
      // Incorrect number of tiles
      return;
    }

    if (this.hai.length + this.furo.length * 3 > 14) {
      // incorrect number of tiles
      return;
    }

    for (const v of this.hai) {
      this.haipai[v]++;
    }

    this.jikaze = options.jikaze;
    this.bakaze = options.bakaze;
    this.tmpResult.error = false;
    this.finalResult = JSON.parse(JSON.stringify(this.tmpResult));
  }

  isMenzen() {
    for (const v of this.furo) {
      if (v.length > 2) {
        // closed kan
        if (v[0] === v[1] && 1 / v[0] < 0) {
          // hack: check infinity sign to support 1m closed kan
          continue;
        }
        return false;
      }
    }
    return true;
  }

  calcDora() {
    if (!this.tmpResult.han) {
      return;
    }

    let dora = 0;
    for (const v of this.hai) {
      for (const d of this.dora) {
        // loop over to detect multiple dora
        if (v === d) {
          dora++;
        }
      }
    }

    for (const v of this.furo) {
      for (const vv of v) {
        for (const d of this.dora) {
          // loop over to detect multiple dora
          if (Math.abs(vv) === d) {
            dora++;
          }
        }
      }
    }

    if (dora) {
      this.tmpResult.han += dora;
      this.tmpResult.yaku.dora = dora;
    }

    if (this.allowAka && this.aka) {
      this.tmpResult.han += this.aka;
      this.tmpResult.yaku.akadora = this.aka;
    }
  }

  calcTen() {
    let base;
    if (this.tmpResult.yakuman) {
      base = 8000 * this.tmpResult.yakuman;
    } else {
      if (!this.tmpResult.han) return;
      base = this.tmpResult.fu * Math.pow(2, this.tmpResult.han + 2);
      if (base > 2000) {
        if (this.tmpResult.han >= 13) {
          base = 8000;
        } else if (this.tmpResult.han >= 11) {
          base = 6000;
        } else if (this.tmpResult.han >= 8) {
          base = 4000;
        } else if (this.tmpResult.han >= 6) {
          base = 3000;
        } else {
          base = 2000;
        }
      } else {
        if (
          this.withKiriage &&
          ((this.tmpResult.han === 4 && this.tmpResult.fu === 30) ||
            (this.tmpResult.han === 3 && this.tmpResult.fu === 60))
        ) {
          base = 2000;
        }
      }
    }

    this.tmpResult.text += (this.tmpResult.name ? ' ' : '') + this.tmpResult.name;
    let oya = 0;
    let ko = 0;
    let outgoing = { oya: 0, ko: 0 };
    if (this.isTsumo) {
      oya = ceil100(base * 2) + ceil100(base * 2) + ceil100(base * 2);
      ko = ceil100(base * 2) + ceil100(base) + ceil100(base);
      outgoing = { oya: ceil100(base * 2), ko: ceil100(base) };
      this.tmpResult.outgoingTen = outgoing;
    } else {
      oya = ceil100(base * 6);
      ko = ceil100(base * 4);
    }
    this.tmpResult.ten = this.jikaze === 27 ? oya : ko;
  }

  calcFu(haiExceptFuro: number[][], havePinfu = false) {
    let fu: number;
    if (this.tmpResult.yaku.chiitoitsu) {
      fu = 25;
    } else if (this.tmpResult.yaku.kokushimusou || this.tmpResult.yaku['kokushimusou 13 sides']) {
      fu = 0;
    } else if (this.tmpResult.yaku.pinfu) {
      fu = this.isTsumo ? 20 : 30;
    } else {
      fu = 20;
      if (!this.isTsumo && this.isMenzen()) {
        fu += 10;
      }
      if (!this.currentPattern) {
        return;
      }

      // check waiting
      let canBeRyanmen = false;
      let canBeKanchan = false;
      let canBePenchan = false;
      let canBeShanpon = false;
      let canBeTanki = false;
      if (this.takenTile !== undefined && this.takenTile !== null) {
        for (const v of haiExceptFuro ?? []) {
          if (v.length !== 3) {
            if (v.length === 2 && this.takenTile === v[0]) {
              // tanki waits are already handled above
              canBeTanki = true;
            }
            continue;
          }

          if (v[0] === v[1]) {
            if (v[0] === this.takenTile) {
              canBeShanpon = true;
            }
          } else {
            if (
              (v[0] === this.takenTile && !is19(v[2])) ||
              (v[2] === this.takenTile && !is19(v[0]))
            ) {
              canBeRyanmen = true;
            }

            if (
              (v[0] === this.takenTile && is19(v[2])) ||
              (v[2] === this.takenTile && is19(v[0]))
            ) {
              canBePenchan = true;
            }

            if (v[1] === this.takenTile) {
              canBeKanchan = true;
            }
          }
        }
      }

      for (const v of this.furo) {
        if (v.length === 4) {
          // hack: count infinity sign to support closed kan of 1m
          fu += is19(Math.abs(v[0])) ? (1 / v[0] > 0 ? 16 : 32) : 1 / v[0] > 0 ? 8 : 16;
        } else if (v.length === 3 && v[0] === v[1]) {
          fu += is19(v[0]) ? 4 : 2;
        }
      }

      for (const v of haiExceptFuro) {
        if (v.length === 2) {
          if ([this.bakaze, this.jikaze, 31, 32, 33].includes(v[0])) {
            // pair of yakuhai tile
            fu += 2;
          }
          if (this.bakaze === this.jikaze && this.bakaze === v[0]) {
            // pair of own wind which is also a seat wind
            fu += 2;
          }
          if (v[0] === this.takenTile) {
            fu += 2; // fu for tanki agari
          }
        } else if (v.length === 3 && v[0] === v[1]) {
          if (!this.isTsumo && this.takenTile === v[0]) {
            if (canBeRyanmen || canBeKanchan || canBePenchan) {
              fu += is19(v[0]) ? 8 : 4;
            } else {
              fu += is19(v[0]) ? 4 : 2;
            }
          } else {
            fu += is19(v[0]) ? 8 : 4;
          }
        }
      }

      if (canBePenchan || canBeKanchan) {
        if (!havePinfu && !canBeTanki) {
          fu += 2;
        } else if (!canBeShanpon && !canBeRyanmen && !canBeTanki) {
          fu += 2;
        }
      }

      if (this.isTsumo) {
        fu += 2;
      }

      fu = ceil10(fu);
      if (fu < 30) {
        fu = 30;
      }
    }

    this.tmpResult.fu = fu;
  }

  calcYaku() {
    this.tmpResult.yaku = {};
    this.tmpResult.yakuman = 0;
    this.tmpResult.han = 0;
    for (const k in YAKU) {
      const v = YAKU[k as keyof typeof YAKU];
      if (this.disabled.includes(k)) {
        continue;
      }
      if (v.isLocal && !this.allLocalEnabled && !this.localEnabled.includes(k)) {
        continue;
      }
      if (this.tmpResult.yakuman && !v.yakuman) {
        continue;
      }
      if (v.isMenzenOnly && !this.isMenzen()) {
        continue;
      }
      if (v.check(this)) {
        if (v.yakuman) {
          const n = this.allowDoubleYakuman ? v.yakuman : 1;
          this.tmpResult.yakuman += n;
          this.tmpResult.yaku[k] = n > 1 ? 26 : 13; // count double yakuman as 26 han
        } else {
          let n = v.han;
          if (v.isFuroMinus && !this.isMenzen()) {
            n--;
          }
          this.tmpResult.yaku[k] = n;
          this.tmpResult.han += n;
        }
      }
    }
  }

  // api exports ↓ ----------------------------------------------------------------------------------------------------

  disableDoubleyakuman() {
    this.allowDoubleYakuman = false;
    return this;
  }

  disableKuitan() {
    this.allowKuitan = false;
    return this;
  }

  disableAka() {
    this.allowAka = false;
    return this;
  }

  // supported local yaku list;
  // - daisharin
  // - renhou
  enableLocalYaku(name: string) {
    this.localEnabled.push(name);
    return this;
  }

  disableYaku(name: string) {
    this.disabled.push(name);
    return this;
  }

  disableHairi() {
    this.hairi = false;
  }

  /**
   * main
   */
  calc() {
    if (this.tmpResult.error) {
      return this.tmpResult;
    }

    this.tmpResult.isAgari = checkAll(this.haipai);

    if (!this.tmpResult.isAgari || this.hai.length + this.furo.length * 3 !== 14) {
      if (this.hairi) {
        this.tmpResult.hairi = hairi(this.haipai);
        this.tmpResult.hairi7and13 = hairi(this.haipai, true);
      }
      return this.tmpResult;
    }

    if (!this.finalResult) {
      this.finalResult = { ...this.tmpResult };
    }
    this.finalResult.isAgari = true;
    this.agariPatterns = findAllAgariPatterns(this.haipai);

    for (const v of this.agariPatterns) {
      this.currentPattern = [...v, ...this.furo];
      this.calcYaku();
      if (!this.tmpResult.yakuman && !this.tmpResult.han) {
        continue;
      }

      if (this.tmpResult.han || this.tmpResult.yakuman > 0) {
        this.calcDora();
        this.calcFu(v, !!this.tmpResult.yaku.pinfu);
      }

      this.calcTen();
      // Find variant with maximum points

      if (
        this.tmpResult.ten > (this.finalResult?.ten ?? 0) ||
        (this.tmpResult.ten === this.finalResult?.ten &&
          this.tmpResult.han > this.finalResult?.han) ||
        (this.tmpResult.ten === this.finalResult?.ten &&
          this.tmpResult.han === this.finalResult?.han &&
          this.tmpResult.fu > this.finalResult?.fu)
      ) {
        this.finalResult = JSON.parse(JSON.stringify(this.tmpResult));
      }
    }

    if (this.finalResult && !this.finalResult.ten) {
      this.finalResult.text = 'no yaku';
    }
    return this.finalResult;
  }
}
