## Riichi Typescript library

Small library to calculate hands and yaku for japanese (riichi) mahjong.

### Usage

Install the library using `npm install riichi-ts` or `yarn add riichi-ts`.
Type definitions for typescript are included in the package.

#### Tiles definition

Tiles are defined by a single integer number according to the following table:

- Man suit: `0` is 1man, ... `8` is 9man
- Pin suit: `9` is 1man, ... `17` is 9man
- Sou suit: `18` is 1man, ... `26` is 9man
- Honors:
  - Winds: `27` is east, ...  `30` is north
  - Dragons: `31` is white, `32` is green, `33` is red

Usage:

```javascript
import { Riichi } from 'riichi-ts';

const hand = new Riichi(
  [10, 10, 10, 11, 11, 12, 12], // closed part of the hand.  Taken tile from the wall should be the last here in case of tsumo.
  [ // melds
    { open: true, tiles: [13, 14, 15] }, // set open: false to mark closed kan (ankan)
    { open: true, tiles: [15, 16, 17] },
  ],
  { 
    bakaze: 27, // round wind
    jikaze: 28 // seat wind
  },
  13, // tile taken from someone's discard. In case of tsumo, set this to null. 
  false, // was this the first take? Used to determine tenhou/chinou/renhou
  true, // does this hand have riichi?
  false, // does this hand have ippatsu?
  false, // does this hand have daburu-riichi?
  false, // is it the last taken tile? Used to determine haitei/houtei
  false, // was it agari after a kan? Used to determine rinshan/chankan
  0, // akadora count in hand
  true, // allow akadora; if this is false, previous parameter is ignored
  true, // allow kuitan?
  false, // use kiriage mangan?
);
hand.disableDoubleyakuman(); // call this to count all yakumans as single
hand.disableYaku('yaku name'); // You can also disable some of the yaku
hand.disableHairi(); // Don't calculate improvements for the non-winning hand
const result = hand.calc();
/*
    Result format:
    {
      error: false, // true if hand couldn't be parsed
      fu: 30,
      han: 6,
      isAgari: true, // will be false if the hand is not winning
      ten: 12000, // amount of points won by the hand
      text: '', // additional info. Will contain 'no yaku' if the hand has no winning points 
      yaku: { // list of found yaku in the hand
       chinitsu: 5, // yaku name and amount of han for certain yaku
       tanyao: 1 
      },
      yakuman: 0, // Count of yakumans found
      hairi: { // shanten count and waits info
         now: 0, // current shanten count. 0 for tenpai.
         wait: [12], // tiles this hand is waiting for to improve or win
         waitsAfterDiscard: { // waits after discarding a certain tile
          12: [13, 14] 
         } 
      }
      hairi7and13: { // same as above but only for chiitoitsu and kokushimusou.
         now: 0,
         wait: [12],
         waitsAfterDiscard: { 12: [13, 14] }
      }
    }
 */
```

#### Full list of yaku names that can be detected:
- menzentsumo
- riichi
- ippatsu
- chankan
- rinshan
- haitei
- houtei
- pinfu
- tanyao
- iipeikou
- own wind east
- own wind south
- own wind west
- own wind north
- round wind east
- round wind south
- round wind west
- round wind north
- haku
- hatsu
- chun
- daburu riichi
- chiitoitsu
- chanta
- ittsu
- sanshoku
- sanshoku doukou
- sankantsu
- toitoi
- sanankou
- shosangen
- honroutou
- ryanpeikou
- junchan
- honitsu
- chinitsu
- renhou
- tenhou
- chihou
- daisangen
- suuankou
- suuankou tanki
- tsuuiisou
- ryuuiisou
- chinroutou
- chuurenpoto
- chuurenpoto 9 sides
- kokushimusou
- kokushimusou 13 sides
- daisuushi
- shosuushi
- suukantsu
- dora
- uradora
- akadora

### Credits

Inspired by and partially taken from following repositories:
- https://github.com/takayama-lily/riichi
- https://github.com/takayama-lily/syanten
- https://github.com/takayama-lily/agari

### Testing on real games data

The library was tested against millions of real-life game logs from Tenhou.net phoenix lobby. Though we don't supply these logs in the repo, you can still download it on Tenhou.net and use it for testing.

Please place zip archives with real replay logs into `logs` folder. The testing script will travers over all zip files there and will try to parse every replay file found.
