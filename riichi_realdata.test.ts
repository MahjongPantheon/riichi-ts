import assert from 'node:assert';
import { Riichi } from './riichi';
import { readdir, stat } from 'fs/promises';
import { writeFileSync } from 'fs';
import { prepareTestData, readZipFile } from './logs/helpers';
import { resolve } from 'path';

let failed = 0;
let success = 0;
let total = 0;
let logsProcessed = 0;
let failedLogs: string[] = [];

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
          for (let idx in hands) {
            const data = hands[idx];
            try {
              const r = new Riichi(
                data.closedPart,
                data.openPart.map((meld: number[]) => {
                  const o = {
                    open: meld[4] === undefined,
                    tiles: [meld[0], meld[1], meld[2]],
                  };
                  if (meld[3] !== undefined) {
                    o.tiles.push(meld[3]);
                  }
                  return o;
                }),
                { bakaze: data.bakaze, jikaze: data.jikaze, dora: data.doraTiles },
                data.takenTile,
                data.yakuman.includes('tenhou') ||
                  data.yakuman.includes('chihou') ||
                  data.yakuman.includes('renhou'),
                data.yaku.includes('riichi'),
                data.yaku.includes('ippatsu'),
                data.yaku.includes('daburu riichi'),
                data.yaku.includes('haitei') || data.yaku.includes('houtei'),
                data.yaku.includes('rinshan') || data.yaku.includes('chankan'),
                data.aka,
                data.withAka,
                data.withKuitan,
                data.withKiriage
              );
              r.disableDoubleyakuman();
              const res = r.calc();
              assert.equal(res.error, false);
              if (data.yakuman.length === 0) {
                assert.equal(res.fu, data.fu);
              }
              assert.equal(res.ten, data.ten);
              assert.deepEqual(
                Object.keys(res.yaku).sort(),
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
