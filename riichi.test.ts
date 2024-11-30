import assert from 'node:assert';
import { Riichi } from './riichi';
import { TILES } from './interfaces';
// prettier-ignore
const {
  m1, m2, m3, m4, m5, m6, m7, m8, m9,
  p1, p2, p3, p4, p5, p6, p7, p8, p9,
  s1, s2, s3, s4, s5, s6, s7, s8, s9,
  e, s, w, n, wd, gd, rd
} = TILES;

describe('Should return proper yaku data', () => {
  it('Should parse yakuhai', () => {
    const r = new Riichi(
      [m1, m2, m3, p2, p3, p4, s3, s4, s5, e],
      [{ open: true, tiles: [wd, wd, wd] }],
      { bakaze: e, jikaze: e },
      e
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 30,
      han: 1,
      isAgari: true,
      name: '',
      ten: 1500,
      text: '',
      yaku: { haku: 1 },
      yakuman: 0,
    });
  });

  it('Should parse pinfu+tsumo', () => {
    const r = new Riichi([m1, m2, m3, p2, p3, p4, s3, s4, s5, m7, m8, p5, p5, m9], [], {
      bakaze: e,
      jikaze: e,
    });
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 20,
      han: 2,
      isAgari: true,
      name: '',
      ten: 2100,
      text: '',
      yaku: { pinfu: 1, menzentsumo: 1 },
      yakuman: 0,
    });
  });

  it('Should parse Haku, toitoi', () => {
    const r = new Riichi(
      [m3, m3, m4, m4, m4, s5, s5, s5],
      [
        { open: true, tiles: [wd, wd, wd] },
        { open: true, tiles: [m9, m9, m9] },
      ],
      { bakaze: e, jikaze: e }
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 40,
      han: 3,
      isAgari: true,
      name: '',
      ten: 7800,
      text: '',
      yaku: { haku: 1, toitoi: 2 },
      yakuman: 0,
    });
  });
  it('Should parse Toitoi chinitsu', () => {
    const r = new Riichi(
      [m2, m2, m2, m5, m5],
      [
        { open: true, tiles: [m3, m3, m3] },
        { open: true, tiles: [m4, m4, m4] },
        { open: true, tiles: [m9, m9, m9] },
      ],
      { bakaze: e, jikaze: e }
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 40,
      han: 7,
      isAgari: true,
      name: '',
      ten: 18000,
      text: '',
      yaku: { chinitsu: 5, toitoi: 2 },
      yakuman: 0,
    });
  });
  it('Should parse Chanta tsumo', () => {
    const r = new Riichi([m1, m2, m3, p1, p2, p3, m7, m8, m9, n, n, n, s, s], [], {
      bakaze: e,
      jikaze: w,
    });
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 40,
      han: 3,
      isAgari: true,
      name: '',
      ten: 5200,
      text: '',
      yaku: { chanta: 2, menzentsumo: 1 },
      yakuman: 0,
    });
  });
  it('Should parse Pinfu, ittsu', () => {
    const r = new Riichi([m1, m2, m3, m7, m8, m9, m4, m5, m6, s3, s3, p4, p5, p6], [], {
      bakaze: e,
      jikaze: w,
    });
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 20,
      han: 4,
      isAgari: true,
      name: '',
      ten: 5200,
      text: '',
      yaku: { pinfu: 1, ittsu: 2, menzentsumo: 1 },
      yakuman: 0,
    });
  });
  it('Should parse Haku, toitoi, honroto', () => {
    const r = new Riichi(
      [m1, m1, m1, wd, wd, wd, s, s],
      [
        { open: true, tiles: [p1, p1, p1] },
        { open: true, tiles: [m9, m9, m9] },
      ],
      { bakaze: e, jikaze: w }
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 50,
      han: 5,
      isAgari: true,
      name: '',
      ten: 8000,
      text: '',
      yaku: { haku: 1, honroutou: 2, toitoi: 2 },
      yakuman: 0,
    });
  });
  it('Should parse Pinfu, sanshoku, tanyao', () => {
    const r = new Riichi([p2, p3, p5, p6, p7, m5, m6, m7, s5, s6, s7, s3, s3, p4], [], {
      bakaze: e,
      jikaze: w,
    });
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 20,
      han: 5,
      isAgari: true,
      name: '',
      ten: 8000,
      text: '',
      yaku: { pinfu: 1, menzentsumo: 1, sanshoku: 2, tanyao: 1 },
      yakuman: 0,
    });
  });
  it('Should parse Tanyao, chiitoitsu', () => {
    const r = new Riichi([m2, m2, m3, m3, s3, s3, s4, s4, s5, s5, s8, s8, m8, m8], [], {
      bakaze: e,
      jikaze: w,
    });
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 25,
      han: 4,
      isAgari: true,
      name: '',
      ten: 6400,
      text: '',
      yaku: { tanyao: 1, chiitoitsu: 2, menzentsumo: 1 },
      yakuman: 0,
    });
  });
  it('Should parse east, haku', () => {
    const r = new Riichi(
      [e, e, e, p3, p4, p5, m4, m4, s3, s4, s5],
      [{ open: true, tiles: [wd, wd, wd] }],
      {
        bakaze: e,
        jikaze: w,
      }
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 40,
      han: 2,
      isAgari: true,
      name: '',
      ten: 2700,
      text: '',
      yaku: { haku: 1, 'round wind east': 1 },
      yakuman: 0,
    });
  });
  it('Should parse Ryanpeiko tanyao pinfu', () => {
    const r = new Riichi(
      [p3, p4, p5, p4, p5, s6, s7, s8, s6, s7, s8, p8, p8],
      [],
      { bakaze: e, jikaze: w },
      p3
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 30,
      han: 5,
      isAgari: true,
      name: '',
      ten: 8000,
      text: '',
      yaku: { pinfu: 1, tanyao: 1, ryanpeikou: 3 },
      yakuman: 0,
    });
  });
  it('Should parse haku, east, honitsu', () => {
    const r = new Riichi(
      [wd, wd, wd, p1, p2, p3, p7, p7],
      [
        { open: true, tiles: [e, e, e] },
        { open: true, tiles: [p4, p5, p6] },
      ],
      { bakaze: e, jikaze: w }
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 40,
      han: 4,
      isAgari: true,
      name: '',
      ten: 8000,
      text: '',
      yaku: { haku: 1, 'round wind east': 1, honitsu: 2 },
      yakuman: 0,
    });
  });
  it('Should parse Chinitsu tanyao', () => {
    const r = new Riichi(
      [p2, p2, p2, p3, p3, p4, p4],
      [
        { open: true, tiles: [p4, p5, p6] },
        { open: true, tiles: [p6, p5, p7] },
      ],
      { bakaze: e, jikaze: w },
      p5,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 30,
      han: 6,
      isAgari: true,
      name: '',
      ten: 12000,
      text: '',
      yaku: { chinitsu: 5, tanyao: 1 },
      yakuman: 0,
    });
  });
  it('Should parse east honitsu', () => {
    const r = new Riichi(
      [s1, s1, s1, s3, s4, s5, s7, s8, s9, e, e, e, s],
      [],
      { bakaze: e, jikaze: w },
      s
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 50,
      han: 4,
      isAgari: true,
      name: '',
      ten: 8000,
      text: '',
      yaku: { 'round wind east': 1, honitsu: 3 },
      yakuman: 0,
    });
  });
  it('Should parse hatsu iipeiko', () => {
    const r = new Riichi(
      [p3, p4, p5, p3, p4, p5, m1, m1, m1, gd, gd, gd, m3],
      [],
      { bakaze: e, jikaze: w },
      m3
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 50,
      han: 2,
      isAgari: true,
      name: '',
      ten: 3200,
      text: '',
      yaku: { hatsu: 1, iipeikou: 1 },
      yakuman: 0,
    });
  });
  it('Should parse Honitsu chiitoitsu', () => {
    const r = new Riichi([wd, wd, m1, m1, m4, m4, m3, m3, w, w, m7, m7, m9, m9], [], {
      bakaze: e,
      jikaze: w,
    });
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 25,
      han: 6,
      isAgari: true,
      name: '',
      ten: 12000,
      text: '',
      yaku: { honitsu: 3, menzentsumo: 1, chiitoitsu: 2 },
      yakuman: 0,
    });
  });
  it('Should parse suukantsu', () => {
    const r = new Riichi(
      [m1],
      [
        { open: true, tiles: [s7, s7, s7, s7] },
        { open: false, tiles: [w, w, w, w] },
        { open: true, tiles: [s1, s1, s1, s1] },
        { open: true, tiles: [p4, p4, p4, p4] },
      ],
      { bakaze: e, jikaze: w },
      m1
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 90,
      han: 0,
      isAgari: true,
      name: '',
      ten: 32000,
      text: '',
      yaku: { suukantsu: 13 },
      yakuman: 1,
    });
  });
  it('Should parse chun, sankantsu', () => {
    const r = new Riichi(
      [m3, m3, m3, p4, p4],
      [
        { open: false, tiles: [rd, rd, rd, rd] },
        { open: true, tiles: [s4, s4, s4, s4] },
        { open: true, tiles: [p3, p3, p3, p3] },
      ],
      { bakaze: e, jikaze: w }
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 80,
      han: 5,
      isAgari: true,
      name: '',
      ten: 8000,
      text: '',
      yaku: { chun: 1, sankantsu: 2, toitoi: 2 },
      yakuman: 0,
    });
  });
  it('Should parse haku, toitoi, sanankou', () => {
    const r = new Riichi(
      [m3, m3, m3, m6, m6, m6, wd, wd, wd, p9],
      [{ open: true, tiles: [s4, s4, s4] }],
      { bakaze: e, jikaze: w },
      p9
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 40,
      han: 5,
      isAgari: true,
      name: '',
      ten: 8000,
      text: '',
      yaku: { haku: 1, toitoi: 2, sanankou: 2 },
      yakuman: 0,
    });
  });
  it('Should parse Suuankou', () => {
    const r = new Riichi([m4, m4, m4, p8, p8, p8, s5, s5, s5, s2, s2, m2, m2, s2], [], {
      bakaze: e,
      jikaze: w,
    });
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 40,
      han: 0,
      isAgari: true,
      name: '',
      ten: 32000,
      text: '',
      yaku: { suuankou: 13 },
      yakuman: 1,
    });
  });
  it('Should parse Sanankou chinitsu tanyao', () => {
    const r = new Riichi([s2, s2, s2, s3, s3, s3, s4, s4, s4, s5, s5, s6, s7, s8], [], {
      bakaze: e,
      jikaze: w,
    });
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 40,
      han: 10,
      isAgari: true,
      name: '',
      ten: 16000,
      text: '',
      yaku: { chinitsu: 6, menzentsumo: 1, sanankou: 2, tanyao: 1 },
      yakuman: 0,
    });
  });
  it('Should parse Sanshoku junchan', () => {
    const r = new Riichi(
      [p1, p2, m1, m2, m3, p9, p9, p9, m9, m9],
      [{ open: true, tiles: [s3, s1, s2] }],
      { bakaze: e, jikaze: w },
      p3
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 40,
      han: 5,
      isAgari: true,
      name: '',
      ten: 8000,
      text: '',
      yaku: { junchan: 3, sanshoku: 2 },
      yakuman: 0,
    });
  });
  it('Should parse Pinfu junchan', () => {
    const r = new Riichi(
      [m2, m3, m7, m8, m9, p1, p2, p3, s7, s8, s9, s9, s9],
      [],
      { bakaze: e, jikaze: w },
      m1
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 30,
      han: 4,
      isAgari: true,
      name: '',
      ten: 7700,
      text: '',
      yaku: { pinfu: 1, junchan: 3 },
      yakuman: 0,
    });
  });
  it('Should parse Pinfu iipeiko ittsu chinitsu', () => {
    const r = new Riichi(
      [s1, s1, s2, s2, s3, s3, s4, s4, s5, s6, s7, s8, s9],
      [],
      { bakaze: e, jikaze: w },
      s4
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 30,
      han: 10,
      isAgari: true,
      name: '',
      ten: 16000,
      text: '',
      yaku: { pinfu: 1, iipeikou: 1, ittsu: 2, chinitsu: 6 },
      yakuman: 0,
    });
  });
  it('Should parse Toitoi, sandoko', () => {
    const r = new Riichi(
      [p4, p4, p4, m1],
      [
        { open: true, tiles: [m4, m4, m4] },
        { open: true, tiles: [s4, s4, s4] },
        { open: true, tiles: [m9, m9, m9] },
      ],
      { bakaze: e, jikaze: w },
      m1
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 40,
      han: 4,
      isAgari: true,
      name: '',
      ten: 8000,
      text: '',
      yaku: { toitoi: 2, 'sanshoku doukou': 2 },
      yakuman: 0,
    });
  });
  it('Should parse Daisangen', () => {
    const r = new Riichi(
      [p4, p4, p4, m1],
      [
        { open: true, tiles: [wd, wd, wd] },
        { open: true, tiles: [gd, gd, gd] },
        { open: true, tiles: [rd, rd, rd] },
      ],
      { bakaze: e, jikaze: w },
      m1
    );
    const res = r.calc();
    assert.deepStrictEqual(res, {
      error: false,
      fu: 40,
      han: 0,
      isAgari: true,
      name: '',
      ten: 32000,
      text: '',
      yaku: { daisangen: 13 },
      yakuman: 1,
    });
  });
});
