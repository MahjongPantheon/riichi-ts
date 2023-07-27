import yauzl from 'yauzl-promise';
import { Parser } from 'htmlparser2';

export const readZipFile = async (
  path: string,
  skip: number,
  cb: (fileName: string, content: string) => void
) => {
  const zip = await yauzl.open(path);
  let entry: yauzl.Entry;
  let counter = 0;
  while ((entry = await zip.readEntry())) {
    counter++;
    if (counter < skip) {
      continue;
    }
    const fn = (entry as any).filename; // bad typings in the lib
    entry.openReadStream().then((stream) => {
      let content = '';
      stream.on('data', (chunk) => {
        content += chunk.toString();
      });
      stream.on('end', () => {
        cb(fn, content);
      });
    });
  }
};

const yaku = [
  'menzentsumo',
  'riichi',
  'ippatsu',
  'chankan',
  'rinshan',
  'haitei',
  'houtei',
  'pinfu',
  'tanyao',
  'iipeikou',
  'own wind east',
  'own wind south',
  'own wind west',
  'own wind north',
  'round wind east',
  'round wind south',
  'round wind west',
  'round wind north',
  'haku',
  'hatsu',
  'chun',
  'daburu riichi',
  'chiitoitsu',
  'chanta',
  'ittsu',
  'sanshoku',
  'sanshoku doukou',
  'sankantsu',
  'toitoi',
  'sanankou',
  'shosangen',
  'honroutou',
  'ryanpeikou',
  'junchan',
  'honitsu',
  'chinitsu',
  'renhou',
  'tenhou',
  'chihou',
  'daisangen',
  'suuankou',
  'suuankou tanki',
  'tsuuiisou',
  'ryuuiisou',
  'chinroutou',
  'chuurenpoto',
  'chuurenpoto 9 sides',
  'kokushimusou',
  'kokushimusou 13 sides',
  'daisuushi',
  'shosuushi',
  'suukantsu',
  'dora',
  'uradora',
  'akadora',
];

const FIVE_RED_MAN = 16;
const FIVE_RED_PIN = 52;
const FIVE_RED_SOU = 88;
const toTiles = (tile: number) => Math.floor(tile / 4);

const decodeMeld: (meldStr: string) => [number[], number] = (meldStr) => {
  let akaCount = 0;
  const meld = parseInt(meldStr, 10);
  if (Number.isNaN(meld)) {
    return [[], 0];
  }
  if (meld & 0x4) {
    // decode chi
    const t0 = (meld >> 3) & 0x3;
    const t1 = (meld >> 5) & 0x3;
    const t2 = (meld >> 7) & 0x3;
    let base = Math.floor((meld >> 10) / 3);
    base = Math.floor(base / 7) * 9 + (base % 7);
    const tiles = [t0 + 4 * base /* + 0*/, t1 + 4 * (base + 1), t2 + 4 * (base + 2)];
    for (let tile of tiles) {
      if (tile === FIVE_RED_MAN || tile === FIVE_RED_PIN || tile === FIVE_RED_SOU) {
        akaCount++;
      }
    }
    return [tiles.map(toTiles), akaCount];
  } else if (meld & 0x18) {
    // decode pon / daiminkan
    const t4 = (meld >> 5) & 0x3;
    const [t0, t1, t2] = [
      [1, 2, 3],
      [0, 2, 3],
      [0, 1, 3],
      [0, 1, 2],
    ][t4];
    const base = Math.floor((meld >> 9) / 3);
    const tiles =
      meld & 0x8
        ? [t0 + 4 * base, t1 + 4 * base, t2 + 4 * base]
        : [t0 + 4 * base, t1 + 4 * base, t2 + 4 * base, t4 + 4 * base];

    for (let tile of tiles) {
      if (tile === FIVE_RED_MAN || tile === FIVE_RED_PIN || tile === FIVE_RED_SOU) {
        akaCount++;
      }
    }
    return [tiles.map(toTiles), akaCount];
  } else if (meld & 0x20) {
    // decode nuki (?)
    return [[], 0];
  } else {
    // decode ankan / shominkan
    const fromPlayer = meld & 0x3;
    const base = Math.floor((meld >> 8) / 4);
    const tiles = [4 * base, 1 + 4 * base, 2 + 4 * base, 3 + 4 * base];
    for (let tile of tiles) {
      if (tile === FIVE_RED_MAN || tile === FIVE_RED_PIN || tile === FIVE_RED_SOU) {
        akaCount++;
      }
    }
    if (fromPlayer) {
      return [tiles.map(toTiles), akaCount];
    } else {
      return [[...tiles.map(toTiles), -1], akaCount]; // 5th element is -1 for closed kan
    }
  }
};

export const prepareTestData = (content: string) => {
  const tags = Array.from(content.matchAll(/<(AGARI|UN|INIT|RYUUKYOKU|GO)(.*?)\/>/g)).map((tag) => {
    return tag[0].replace(/owari=.*?owari=/, 'owari=');
  });

  let akaCount = 0;
  let currentDealer = 0;
  let bakaze = 27;
  let jikaze = 27;
  let foundHands = 0;
  let withAka = false;
  let withKuitan = false;
  let hands: Array<{
    openPart: number[][];
    closedPart: number[];
    isTsumo: boolean;
    yaku: string[];
    yakuman: string[];
    fu: number;
    ten: number;
    dora: number;
    doraTiles: number[];
    takenTile?: number;
    bakaze: number;
    jikaze: number;
    aka: number;
    withAka: boolean;
    withKuitan: boolean;
  }> = [];
  let isSanma = false;
  const parser = new Parser({
    onopentag(name: string, attribs: { [p: string]: string }) {
      switch (name) {
        case 'un':
          if (!attribs.n3) {
            // hiroshima/sanma, skip this one
            isSanma = true;
          }
          break;
        case 'go':
          if (isSanma) {
            break;
          }
          const type = parseInt(attribs.type, 10);
          withAka = !(type & 0x2);
          withKuitan = !(type & 0x4);
          break;
        case 'init':
          if (attribs.oya === undefined || isSanma) {
            break;
          }
          if (parseInt(attribs.oya, 10) === 0 && currentDealer !== 0) {
            bakaze++;
          }
          currentDealer = parseInt(attribs.oya, 10);
          break;
        case 'agari':
          if (isSanma) {
            break;
          }
          const hai = attribs.hai.split(',').map((t) => parseInt(t, 10));
          for (let tile of hai) {
            if (tile === FIVE_RED_MAN || tile === FIVE_RED_PIN || tile === FIVE_RED_SOU) {
              akaCount++;
            }
          }
          const isTsumo = attribs.who === attribs.fromwho;
          jikaze = [27, 28, 29, 30, 27, 28, 29, 30][4 - currentDealer + parseInt(attribs.who, 10)];
          let takenTile: number | undefined = toTiles(parseInt(attribs.machi, 10));

          const melds = (attribs.m ?? '').split(',');
          const openPart = [];
          for (let meld of melds) {
            const [meldDec, aka] = decodeMeld(meld);
            if (meldDec.length === 0) {
              continue;
            }
            openPart.push(meldDec);
            akaCount += aka;
          }

          let closedPart = hai.map(toTiles);
          for (let i = 0; i < closedPart.length; i++) {
            if (closedPart[i] === takenTile) {
              closedPart.splice(i, 1);
              break;
            }
          }
          if (isTsumo) {
            closedPart.push(takenTile);
            takenTile = undefined;
          }

          const [fu, ten] = (attribs.ten ?? '').split(',').map((t) => parseInt(t, 10));

          // Parse dora/uradora indicators
          let doraTiles = (attribs.dorahai ?? '').split(',').map((t) => toTiles(parseInt(t, 10)));
          if (attribs.dorahaiura !== undefined) {
            doraTiles = [
              ...doraTiles,
              ...attribs.dorahaiura.split(',').map((t) => toTiles(parseInt(t, 10))),
            ];
          }

          // Make proper doras according to suit
          for (let i = 0; i < doraTiles.length; i++) {
            doraTiles[i]++;
            if (doraTiles[i] === 9) {
              doraTiles[i] = 0;
            }
            if (doraTiles[i] === 18) {
              doraTiles[i] = 9;
            }
            if (doraTiles[i] === 27) {
              doraTiles[i] = 18;
            }
            if (doraTiles[i] === 31) {
              doraTiles[i] = 27;
            }
            if (doraTiles[i] === 34) {
              doraTiles[i] = 31;
            }
          }

          const yakuList: string[] = [];
          let doraCount = 0;
          if (attribs.yaku !== undefined) {
            const yakuParsed = attribs.yaku.split(',').map((t) => parseInt(t, 10));
            for (let i = 0; i < yakuParsed.length; i += 2) {
              if (yakuParsed[i] === 52 || yakuParsed[i] === 53) {
                doraCount += yakuParsed[i + 1];
              } else {
                yakuList.push(yaku[yakuParsed[i]]);
              }
            }
          }

          let yakumanList: string[] = [];
          if (attribs.yakuman !== undefined) {
            yakumanList = attribs.yakuman.split(',').map((yakuStr) => {
              return yaku[parseInt(yakuStr, 10)];
            });
          }

          foundHands++;
          hands.push({
            openPart: openPart,
            closedPart: closedPart,
            isTsumo: isTsumo,
            yaku: yakuList,
            yakuman: yakumanList,
            fu: fu,
            ten: ten,
            dora: doraCount,
            doraTiles: doraTiles,
            takenTile: takenTile,
            bakaze: bakaze,
            jikaze: jikaze,
            aka: akaCount,
            withAka: withAka,
            withKuitan: withKuitan,
          });
          akaCount = 0;
          break;
        default:
      }
    },
  });
  parser.write(tags.join(''));
  parser.end();
  return hands;
};
