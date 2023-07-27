import { assert } from 'chai';

import {
  check,
  check7,
  check13,
  checkAll,
  findJanto,
  findKotsu,
  findShuntsu,
  findAllAgariPatterns,
} from './agari';
import { digestAll } from './interfaces';

describe('Agari detection', () => {
  it('Kokushimusou', () => {
    assert.equal(
      check13(
        new Int8Array(
          // prettier-ignore
          [1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 2, 1, 1, 1, 1]
        )
      ),
      true
    );

    assert.equal(
      check13(
        new Int8Array(
          // prettier-ignore
          [1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1]
        )
      ),
      false
    );
  });

  it('Chiitoitsu', () => {
    assert.equal(
      check7(
        new Int8Array(
          // prettier-ignore
          [0, 0, 2, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 2, 0, 2, 0, 0,
            2, 0, 0, 0, 0, 2, 0, 0, 0,
            0, 0, 2, 0, 2, 0, 0]
        )
      ),
      true
    );

    assert.equal(
      check7(
        new Int8Array(
          // prettier-ignore
          [0, 0, 2, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 2, 0, 2, 0, 0,
            1, 1, 0, 0, 0, 2, 0, 0, 0,
            0, 0, 2, 0, 2, 0, 0]
        )
      ),
      false
    );
  });

  it('Should calculate agari', () => {
    const testCases: Int8Array[] = [
      new Int8Array(
        // prettier-ignore
        [2, 2, 0, 2, 0, 0, 2, 2, 2,
          0, 0, 2, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0]
      ),
      new Int8Array(
        // prettier-ignore
        [1, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 2, 1, 1, 1, 1, 1]
      ),

      new Int8Array(
        // prettier-ignore
        [0, 0, 0, 0, 0, 2, 2, 2, 0,
          0, 0, 0, 0, 0, 0, 1, 1, 1,
          0, 0, 2, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 3, 0]
      ),
      new Int8Array(
        // prettier-ignore
        [2, 2, 2, 2, 0, 0, 2, 2, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0]
      ),
    ];

    assert.deepStrictEqual(check(testCases[0]), false);
    assert.deepStrictEqual(check(testCases[1]), false);
    assert.deepStrictEqual(check(testCases[2]), true);
    assert.deepStrictEqual(check(testCases[3]), true);

    assert.deepStrictEqual(check7(testCases[0]), true);
    assert.deepStrictEqual(check7(testCases[1]), false);
    assert.deepStrictEqual(check7(testCases[2]), false);
    assert.deepStrictEqual(check7(testCases[3]), true);

    assert.deepStrictEqual(check13(testCases[0]), false);
    assert.deepStrictEqual(check13(testCases[1]), true);
    assert.deepStrictEqual(check13(testCases[0]), false);
    assert.deepStrictEqual(check13(testCases[1]), true);

    assert.deepStrictEqual(checkAll(testCases[0]), true);
    assert.deepStrictEqual(checkAll(testCases[1]), true);
    assert.deepStrictEqual(checkAll(testCases[0]), true);
    assert.deepStrictEqual(checkAll(testCases[1]), true);
  });

  it('Find kotsu', () => {
    assert.deepStrictEqual(
      findKotsu(
        new Int8Array(
          // prettier-ignore
          [0, 0, 0, 0, 3, 0, 0, 0, 0,
            0, 0, 0, 3, 0, 0, 0, 2, 0,
            0, 0, 3, 0, 0, 0, 0, 0, 0,
            0, 3, 0, 0, 0, 0, 0]
        )
      ),
      [
        [4, 4, 4],
        [12, 12, 12],
        [20, 20, 20],
        [28, 28, 28],
      ]
    );
  });

  it('Find shuntsu', () => {
    assert.deepStrictEqual(
      findShuntsu(
        new Int8Array(
          // prettier-ignore
          [ 1, 1, 1, 0, 0, 0, 1, 1, 1,
            0, 0, 0, 1, 1, 1, 0, 2, 0,
            0, 0, 1, 1, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0 ]
        )
      ),
      [
        [0, 1, 2],
        [6, 7, 8],
        [12, 13, 14],
        [20, 21, 22],
      ]
    );
    assert.deepStrictEqual(
      findShuntsu(
        new Int8Array(
          // prettier-ignore
          [ 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 3, 2, 1, 0, 2, 0,
            0, 0, 1, 1, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0 ]
        )
      ),
      [
        [10, 11, 12],
        [11, 12, 13],
        [12, 13, 14],
        [20, 21, 22],
      ]
    );
    assert.deepStrictEqual(
      findShuntsu(
        new Int8Array(
          // prettier-ignore
          [ 0, 0, 0, 0, 1, 1, 1, 0, 1,
            1, 1, 0, 1, 1, 1, 0, 2, 0,
            0, 0, 1, 1, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0]
        )
      ),
      [] // no agari form found, should be empty
    );
    assert.deepStrictEqual(
      findShuntsu(
        new Int8Array(
          // prettier-ignore
          [ 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 2, 0,
            0, 0, 1, 1, 1, 0, 0, 0, 0,
            0, 3, 3, 3, 0, 0, 0 ]
        )
      ),
      [
        [20, 21, 22], // only suit shuntsu is detected
      ]
    );
  });

  it('Find janto', () => {
    assert.deepStrictEqual(
      findJanto(
        new Int8Array(
          // prettier-ignore
          [1, 1, 1, 0, 0, 0, 1, 1, 1,
            0, 0, 0, 1, 1, 1, 0, 2, 0,
            0, 0, 1, 1, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0]
        )
      ),
      16
    );
    assert.deepStrictEqual(
      findJanto(
        new Int8Array(
          // prettier-ignore
          [1, 1, 1, 0, 0, 0, 1, 1, 1,
            0, 0, 0, 1, 1, 1, 0, 1, 1,
            0, 0, 1, 1, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0]
        )
      ),
      -1
    );
  });

  it('Find all agari patterns', () => {
    const testCases: Int8Array[] = [
      new Int8Array(
        // prettier-ignore
        [ 2, 2, 0, 2, 0, 0, 2, 2, 2,
          0, 0, 2, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0]
      ),
      new Int8Array(
        // prettier-ignore
        [ 1, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 2, 1, 1, 1, 1, 1]
      ),
      new Int8Array(
        // prettier-ignore
        [ 0, 0, 0, 0, 0, 2, 2, 2, 0,
          0, 0, 0, 0, 0, 0, 1, 1, 1,
          0, 0, 2, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 3, 0]
      ),
      new Int8Array(
        // prettier-ignore
        [ 2, 2, 2, 2, 0, 0, 2, 2, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0]
      ),

      new Int8Array(
        // prettier-ignore
        [ 0, 0, 0, 0, 0, 2, 2, 2, 2,
          0, 0, 0, 0, 0, 0, 1, 1, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 3, 0]
      ),
      new Int8Array(
        // prettier-ignore
        [ 4, 4, 4, 2, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0]
      ),
      new Int8Array(
        // prettier-ignore
        [ 3, 1, 1, 3, 0, 0, 0, 0, 0,
          3, 0, 0, 0, 0, 0, 0, 0, 0,
          3, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0]
      ),
      new Int8Array(
        // prettier-ignore
        [ 0, 2, 2, 2, 2, 2, 2, 2, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0]
      ),
    ];

    assert.equal(
      digestAll(findAllAgariPatterns(testCases[0])),
      digestAll([
        [
          [0, 0],
          [1, 1],
          [11, 11],
          [3, 3],
          [6, 6],
          [7, 7],
          [8, 8],
        ],
      ])
    );
    assert.equal(
      digestAll(findAllAgariPatterns(testCases[1])),
      digestAll([[[0, 8, 9, 17, 18, 26, 27, 28, 28, 29, 30, 31, 32, 33]]])
    );
    assert.equal(
      digestAll(findAllAgariPatterns(testCases[2])),
      digestAll([
        [
          [20, 20],
          [5, 6, 7],
          [5, 6, 7],
          [32, 32, 32],
          [15, 16, 17],
        ],
      ])
    );
    assert.equal(
      digestAll(findAllAgariPatterns(testCases[3])),
      digestAll([
        [
          [0, 0],
          [1, 2, 3],
          [1, 2, 3],
          [6, 7, 8],
          [6, 7, 8],
        ],
        [
          [0, 1, 2],
          [0, 1, 2],
          [3, 3],
          [6, 7, 8],
          [6, 7, 8],
        ],
        [
          [0, 0],
          [1, 1],
          [2, 2],
          [3, 3],
          [6, 6],
          [7, 7],
          [8, 8],
        ],
      ])
    );
    assert.equal(
      digestAll(findAllAgariPatterns(testCases[4])),
      digestAll([
        [
          [5, 5],
          [32, 32, 32],
          [6, 7, 8],
          [6, 7, 8],
          [15, 16, 17],
        ],
        [
          [5, 6, 7],
          [5, 6, 7],
          [32, 32, 32],
          [15, 16, 17],
          [8, 8],
        ],
      ])
    );
    assert.equal(
      digestAll(findAllAgariPatterns(testCases[5])),
      digestAll([
        [
          [0, 0],
          [0, 1, 2],
          [0, 1, 2],
          [1, 2, 3],
          [1, 2, 3],
        ],
        [
          [0, 0, 0],
          [0, 1, 2],
          [1, 1, 1],
          [2, 2, 2],
          [3, 3],
        ],
        [
          [0, 1, 2],
          [0, 1, 2],
          [0, 1, 2],
          [0, 1, 2],
          [3, 3],
        ],
      ])
    );
    assert.equal(
      digestAll(findAllAgariPatterns(testCases[6])),
      digestAll([
        [
          [0, 0],
          [0, 1, 2],
          [9, 9, 9],
          [18, 18, 18],
          [3, 3, 3],
        ],
        [
          [0, 0, 0],
          [9, 9, 9],
          [18, 18, 18],
          [1, 2, 3],
          [3, 3],
        ],
      ])
    );
    assert.equal(
      digestAll(findAllAgariPatterns(testCases[7])),
      digestAll([
        [
          [1, 1],
          [2, 3, 4],
          [2, 3, 4],
          [5, 6, 7],
          [5, 6, 7],
        ],
        [
          [1, 2, 3],
          [1, 2, 3],
          [4, 4],
          [5, 6, 7],
          [5, 6, 7],
        ],
        [
          [1, 2, 3],
          [1, 2, 3],
          [4, 5, 6],
          [4, 5, 6],
          [7, 7],
        ],
        [
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4],
          [5, 5],
          [6, 6],
          [7, 7],
        ],
      ])
    );
  });
});
