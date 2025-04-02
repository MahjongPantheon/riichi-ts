import assert from 'node:assert';
import { calc, Meld, Tile, Yaku } from 'riichi-rs-node';
import { readdir, stat } from 'fs/promises';
import { writeFileSync } from 'fs';
import { prepareTestData, readZipFile } from './logs/helpers';
import { resolve } from 'path';

let failed = 0;
let success = 0;
let total = 0;
let logsProcessed = 0;
const failedLogs: string[] = [];

const toRrsOne = (inp: number) => (inp + 1) as Tile;
const toRrs = (inp: number[]) => inp.map(toRrsOne);

describe('Real games data', () => {
  it(
    'Should properly parse real data',
    async () => {
      const dir = await readdir('./logs/');
      for (let item of dir) {
        item = resolve('./logs/', item);
        if ((await stat(item)).isDirectory() || !item.endsWith('.zip')) {
          continue;
        }
        await readZipFile(item, 0, (filename, content) => {
          const hands = prepareTestData(content);
          for (const idx in hands) {
            const data = hands[idx];
            try {
              const options = {
                bakaze: toRrsOne(data.bakaze),
                jikaze: toRrsOne(data.jikaze),
                dora: toRrs(data.doraTiles),
                tile_discarded_by_someone:
                  data.takenTile === undefined ? -1 : toRrsOne(data.takenTile),
                first_take:
                  data.yakuman.includes('tenhou') ||
                  data.yakuman.includes('chihou') ||
                  data.yakuman.includes('renhou'),
                riichi: data.yaku.includes('riichi'),
                ippatsu: data.yaku.includes('ippatsu'),
                double_riichi: data.yaku.includes('daburu riichi'),
                last_tile: data.yaku.includes('haitei') || data.yaku.includes('houtei'),
                after_kan: data.yaku.includes('rinshan') || data.yaku.includes('chankan'),
                aka_count: data.aka,
                allow_aka: data.withAka,
                allow_kuitan: data.withKuitan,
                with_kiriage: data.withKiriage,
                allow_double_yakuman: false,
              } as const;
              const res = calc({
                closed_part: toRrs(data.closedPart),
                open_part: data.openPart.map((meld: number[]) => {
                  const o: [boolean, Tile[]] = [
                    meld[4] === undefined,
                    [(meld[0] + 1) as Tile, (meld[1] + 1) as Tile, (meld[2] + 1) as Tile],
                  ];
                  if (meld[3] !== undefined) {
                    o[1].push((meld[3] + 1) as Tile);
                  }
                  return o as Meld;
                }),
                options,
                calc_hairi: false,
              });

              if (data.yakuman.length === 0) {
                assert.equal(res.fu, data.fu);
              }
              assert.equal(res.ten, data.ten);
              assert.deepEqual(
                Object.keys(res.yaku).map(toYakuNames).sort(),
                [...data.yaku, ...data.yakuman, ...(data.dora > 0 ? ['dora'] : [])].sort()
              );
              success++;
            } catch (e: any) {
              failed++;
              failedLogs.push(filename + '|hand ' + idx + '|log ' + logsProcessed);
              writeFileSync('./logs/' + filename, content);
            }
            total++;
            if (total % 1000 === 0) {
              console.log('Processed: ' + total + ' (' + success + '/' + failed + ')');
              console.log(failedLogs);
            }
          }
          logsProcessed++;
        });
      }
    },
    1000 * 60 * 60 * 3
  );

  assert.equal(failed, 0);
});

function toYakuNames(y: string): string {
  switch (parseInt(y, 10) as Yaku) {
    case Yaku.Kokushimusou13Sides:
      return 'kokushimusou 13 sides';
    case Yaku.Kokushimusou:
      return 'kokushimusou';
    case Yaku.Chuurenpoto9Sides:
      return 'chuurenpoto 9 sides';
    case Yaku.Chuurenpoto:
      return 'chuurenpoto';
    case Yaku.SuuankouTanki:
      return 'suuankou tanki';
    case Yaku.Suuankou:
      return 'suuankou';
    case Yaku.Daisuushi:
      return 'daisuushi';
    case Yaku.Shosuushi:
      return 'shosuushi';
    case Yaku.Daisangen:
      return 'daisangen';
    case Yaku.Tsuuiisou:
      return 'tsuuiisou';
    case Yaku.Ryuuiisou:
      return 'ryuuiisou';
    case Yaku.Chinroutou:
      return 'chinroutou';
    case Yaku.Suukantsu:
      return 'suukantsu';
    case Yaku.Tenhou:
      return 'tenhou';
    case Yaku.Chihou:
      return 'chihou';
    case Yaku.Renhou:
      return 'renhou';
    case Yaku.Daisharin:
      return '';
    case Yaku.Chinitsu:
      return 'chinitsu';
    case Yaku.Honitsu:
      return 'honitsu';
    case Yaku.Ryanpeikou:
      return 'ryanpeikou';
    case Yaku.Junchan:
      return 'junchan';
    case Yaku.Chanta:
      return 'chanta';
    case Yaku.Toitoi:
      return 'toitoi';
    case Yaku.Honroutou:
      return 'honroutou';
    case Yaku.Sankantsu:
      return 'sankantsu';
    case Yaku.Shosangen:
      return 'shosangen';
    case Yaku.SanshokuDoukou:
      return 'sanshoku doukou';
    case Yaku.Sanankou:
      return 'sanankou';
    case Yaku.Chiitoitsu:
      return 'chiitoitsu';
    case Yaku.DaburuRiichi:
      return 'daburu riichi';
    case Yaku.Ittsu:
      return 'ittsu';
    case Yaku.Sanshoku:
      return 'sanshoku';
    case Yaku.Tanyao:
      return 'tanyao';
    case Yaku.Pinfu:
      return 'pinfu';
    case Yaku.Iipeikou:
      return 'iipeikou';
    case Yaku.Menzentsumo:
      return 'menzentsumo';
    case Yaku.Riichi:
      return 'riichi';
    case Yaku.Ippatsu:
      return 'ippatsu';
    case Yaku.Rinshan:
      return 'rinshan';
    case Yaku.Chankan:
      return 'chankan';
    case Yaku.Haitei:
      return 'haitei';
    case Yaku.Houtei:
      return 'houtei';
    case Yaku.RoundWindEast:
      return 'round wind east';
    case Yaku.RoundWindSouth:
      return 'round wind south';
    case Yaku.RoundWindWest:
      return 'round wind west';
    case Yaku.RoundWindNorth:
      return 'round wind north';
    case Yaku.OwnWindEast:
      return 'own wind east';
    case Yaku.OwnWindSouth:
      return 'own wind south';
    case Yaku.OwnWindWest:
      return 'own wind west';
    case Yaku.OwnWindNorth:
      return 'own wind north';
    case Yaku.Haku:
      return 'haku';
    case Yaku.Hatsu:
      return 'hatsu';
    case Yaku.Chun:
      return 'chun';
    case Yaku.Dora:
      return 'dora';
    case Yaku.Uradora:
      return 'uradora';
    case Yaku.Akadora:
      return 'akadora';
    default:
      return '';
  }
}
