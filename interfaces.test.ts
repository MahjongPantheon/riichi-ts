import assert from 'node:assert';
import { idx, SUIT, VAL } from './interfaces';

it('Should find proper index', () => {
  const hand = new Uint8Array(
    // prettier-ignore
    [ 1,  2,  3,  4,  5,  6,  7,  8,  9,
      10, 11, 12, 13, 14, 15, 16, 17, 18,
      19, 20, 21, 22, 23, 24, 25, 26, 27,
      28, 29, 30, 31, 32, 33, 34 ]
  );
  assert.equal(hand[idx(SUIT.MAN, VAL.N1)], 1);
  assert.equal(hand[idx(SUIT.MAN, VAL.N7)], 7);
  assert.equal(hand[idx(SUIT.PIN, VAL.N7)], 16);
  assert.equal(hand[idx(SUIT.PIN, VAL.N9)], 18);
  assert.equal(hand[idx(SUIT.SOU, VAL.N3)], 21);
  assert.equal(hand[idx(SUIT.SOU, VAL.N7)], 25);
  assert.equal(hand[idx(SUIT.HONOR, VAL.NAN)], 29);
  assert.equal(hand[idx(SUIT.HONOR, VAL.HATSU)], 33);
});
