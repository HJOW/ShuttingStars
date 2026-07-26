/** 
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0 
*/
/*
 * Shutting Stars
 *     기본 탑재 곡들을 구현하는 파일
 */
import { ShuttingStarsUtility, SSUtil, BrowserDetector, BpmDetector  } from './shuttingstarsutils.js'

let songs = [];
let song;

song = {
        "name": "Third Cup Before Departure",
        "composer": "Lyria",
        "noteWriter": "HJOW",
        "bgaUrl": "",
        "musicUrl": "[RSSC]songs/ai/Third_Cup_Before_Departure.mp3",
        "musicAlterUrl": "",
        "useYoutube": false,
        "youtubeVideoId": "",
        "thumbnailUrl": "",
        "description": "\n|Music: Google Lyria\n|  https://gemini.google/overview/music-generation/\n|License: All license granted by AI Platform.\n",
        "loadingTime": 10,
        "bpm": 85,
        "endTime": 0,
        "timeConstant": 0,
        "timeMultiplier": 1,
        "noteMultiplier": 1,
        "test": false,
        "onlyRandom": false,
        "autoStars": true,
        "serial": "nai4ilaHbn7g563&6482HDRHRgmogogesghefdkgm23GeGERGgD39p4g",
        "decorations": [],
        "difficulties": [
            {
                "index": 0,
                "difficultyLabel": "easy",
                "difficultyLevel": 1,
                "patterns": [
                    {
                        "locationIndex": 5,
                        "time": 147
                    },
                    {
                        "locationIndex": 4,
                        "time": 194
                    },
                    {
                        "locationIndex": 5,
                        "time": 275
                    },
                    {
                        "locationIndex": 3,
                        "time": 322
                    },
                    {
                        "locationIndex": 5,
                        "time": 354
                    },
                    {
                        "locationIndex": 0,
                        "time": 386
                    },
                    {
                        "locationIndex": 1,
                        "time": 418
                    },
                    {
                        "locationIndex": 3,
                        "time": 450
                    },
                    {
                        "locationIndex": 4,
                        "time": 482
                    },
                    {
                        "locationIndex": 5,
                        "time": 514
                    },
                    {
                        "locationIndex": 0,
                        "time": 546
                    },
                    {
                        "locationIndex": 4,
                        "time": 578
                    },
                    {
                        "locationIndex": 1,
                        "time": 610
                    },
                    {
                        "locationIndex": 0,
                        "time": 642
                    },
                    {
                        "locationIndex": 2,
                        "time": 674
                    },
                    {
                        "locationIndex": 3,
                        "time": 706
                    },
                    {
                        "locationIndex": 2,
                        "time": 738
                    },
                    {
                        "locationIndex": 4,
                        "time": 785
                    },
                    {
                        "locationIndex": 3,
                        "time": 818
                    },
                    {
                        "locationIndex": 1,
                        "time": 859
                    },
                    {
                        "locationIndex": 5,
                        "time": 898
                    },
                    {
                        "locationIndex": 0,
                        "time": 930
                    },
                    {
                        "locationIndex": 4,
                        "time": 962
                    },
                    {
                        "locationIndex": 3,
                        "time": 994
                    },
                    {
                        "locationIndex": 1,
                        "time": 994
                    },
                    {
                        "locationIndex": 5,
                        "time": 1026
                    },
                    {
                        "locationIndex": 0,
                        "time": 1072
                    },
                    {
                        "locationIndex": 3,
                        "time": 1115
                    },
                    {
                        "locationIndex": 4,
                        "time": 1154
                    },
                    {
                        "locationIndex": 1,
                        "time": 1186
                    },
                    {
                        "locationIndex": 2,
                        "time": 1218
                    },
                    {
                        "locationIndex": 4,
                        "time": 1250
                    },
                    {
                        "locationIndex": 3,
                        "time": 1282
                    },
                    {
                        "locationIndex": 0,
                        "time": 1314
                    },
                    {
                        "locationIndex": 3,
                        "time": 1346
                    },
                    {
                        "locationIndex": 2,
                        "time": 1378
                    },
                    {
                        "locationIndex": 5,
                        "time": 1423
                    },
                    {
                        "locationIndex": 4,
                        "time": 1458
                    },
                    {
                        "locationIndex": 3,
                        "time": 1490
                    },
                    {
                        "locationIndex": 2,
                        "time": 1522
                    },
                    {
                        "locationIndex": 4,
                        "time": 1555
                    },
                    {
                        "locationIndex": 1,
                        "time": 1590
                    },
                    {
                        "locationIndex": 5,
                        "time": 1634
                    },
                    {
                        "locationIndex": 2,
                        "time": 1666
                    },
                    {
                        "locationIndex": 5,
                        "time": 1698
                    },
                    {
                        "locationIndex": 0,
                        "time": 1730
                    },
                    {
                        "locationIndex": 1,
                        "time": 1762
                    },
                    {
                        "locationIndex": 0,
                        "time": 1794
                    },
                    {
                        "locationIndex": 5,
                        "time": 1826
                    },
                    {
                        "locationIndex": 4,
                        "time": 1858
                    },
                    {
                        "locationIndex": 3,
                        "time": 1890
                    },
                    {
                        "locationIndex": 2,
                        "time": 1922
                    },
                    {
                        "locationIndex": 5,
                        "time": 1954
                    },
                    {
                        "locationIndex": 4,
                        "time": 1986
                    },
                    {
                        "locationIndex": 3,
                        "time": 2018
                    },
                    {
                        "locationIndex": 4,
                        "time": 2066
                    },
                    {
                        "locationIndex": 0,
                        "time": 2098
                    },
                    {
                        "locationIndex": 3,
                        "time": 2146
                    },
                    {
                        "locationIndex": 2,
                        "time": 2178
                    },
                    {
                        "locationIndex": 3,
                        "time": 2210
                    },
                    {
                        "locationIndex": 0,
                        "time": 2254
                    },
                    {
                        "locationIndex": 2,
                        "time": 2290
                    },
                    {
                        "locationIndex": 0,
                        "time": 2322
                    },
                    {
                        "locationIndex": 2,
                        "time": 2354
                    },
                    {
                        "locationIndex": 5,
                        "time": 2386
                    },
                    {
                        "locationIndex": 2,
                        "time": 2418
                    },
                    {
                        "locationIndex": 4,
                        "time": 2466
                    },
                    {
                        "locationIndex": 3,
                        "time": 2498
                    },
                    {
                        "locationIndex": 1,
                        "time": 2530
                    },
                    {
                        "locationIndex": 4,
                        "time": 2562
                    },
                    {
                        "locationIndex": 1,
                        "time": 2594
                    },
                    {
                        "locationIndex": 2,
                        "time": 2626
                    },
                    {
                        "locationIndex": 0,
                        "time": 2669
                    },
                    {
                        "locationIndex": 2,
                        "time": 2708
                    },
                    {
                        "locationIndex": 4,
                        "time": 2747
                    },
                    {
                        "locationIndex": 3,
                        "time": 2781
                    },
                    {
                        "locationIndex": 0,
                        "time": 2781
                    },
                    {
                        "locationIndex": 5,
                        "time": 2833
                    },
                    {
                        "locationIndex": 3,
                        "time": 2915
                    },
                    {
                        "locationIndex": 2,
                        "time": 2949
                    },
                    {
                        "locationIndex": 0,
                        "time": 2992
                    },
                    {
                        "locationIndex": 2,
                        "time": 3038
                    },
                    {
                        "locationIndex": 4,
                        "time": 3153
                    }
                ],
                "autoCreate": false
            },
            {
                "index": 1,
                "difficultyLabel": "normal",
                "difficultyLevel": 4,
                "patterns": [
                    {
                        "locationIndex": 1,
                        "time": 147
                    },
                    {
                        "locationIndex": 0,
                        "time": 184
                    },
                    {
                        "locationIndex": 3,
                        "time": 275
                    },
                    {
                        "locationIndex": 1,
                        "time": 303
                    },
                    {
                        "locationIndex": 2,
                        "time": 322
                    },
                    {
                        "locationIndex": 0,
                        "time": 354
                    },
                    {
                        "locationIndex": 4,
                        "time": 370
                    },
                    {
                        "locationIndex": 3,
                        "time": 386
                    },
                    {
                        "locationIndex": 1,
                        "time": 386
                    },
                    {
                        "locationIndex": 5,
                        "time": 418
                    },
                    {
                        "locationIndex": 4,
                        "time": 434
                    },
                    {
                        "locationIndex": 2,
                        "time": 450
                    },
                    {
                        "locationIndex": 3,
                        "time": 466
                    },
                    {
                        "locationIndex": 4,
                        "time": 482
                    },
                    {
                        "locationIndex": 0,
                        "time": 498
                    },
                    {
                        "locationIndex": 3,
                        "time": 514
                    },
                    {
                        "locationIndex": 1,
                        "time": 531
                    },
                    {
                        "locationIndex": 2,
                        "time": 560
                    },
                    {
                        "locationIndex": 5,
                        "time": 578
                    },
                    {
                        "locationIndex": 4,
                        "time": 610
                    },
                    {
                        "locationIndex": 1,
                        "time": 626
                    },
                    {
                        "locationIndex": 2,
                        "time": 642
                    },
                    {
                        "locationIndex": 4,
                        "time": 674
                    },
                    {
                        "locationIndex": 3,
                        "time": 690
                    },
                    {
                        "locationIndex": 4,
                        "time": 706
                    },
                    {
                        "locationIndex": 1,
                        "time": 737
                    },
                    {
                        "locationIndex": 4,
                        "time": 753
                    },
                    {
                        "locationIndex": 5,
                        "time": 785
                    },
                    {
                        "locationIndex": 1,
                        "time": 785
                    },
                    {
                        "locationIndex": 3,
                        "time": 802
                    },
                    {
                        "locationIndex": 4,
                        "time": 818
                    },
                    {
                        "locationIndex": 5,
                        "time": 834
                    },
                    {
                        "locationIndex": 2,
                        "time": 859
                    },
                    {
                        "locationIndex": 5,
                        "time": 875
                    },
                    {
                        "locationIndex": 3,
                        "time": 898
                    },
                    {
                        "locationIndex": 2,
                        "time": 923
                    },
                    {
                        "locationIndex": 4,
                        "time": 923
                    },
                    {
                        "locationIndex": 0,
                        "time": 939
                    },
                    {
                        "locationIndex": 3,
                        "time": 962
                    },
                    {
                        "locationIndex": 0,
                        "time": 978
                    },
                    {
                        "locationIndex": 3,
                        "time": 994
                    },
                    {
                        "locationIndex": 1,
                        "time": 1010
                    },
                    {
                        "locationIndex": 2,
                        "time": 1026
                    },
                    {
                        "locationIndex": 1,
                        "time": 1043
                    },
                    {
                        "locationIndex": 3,
                        "time": 1072
                    },
                    {
                        "locationIndex": 0,
                        "time": 1090
                    },
                    {
                        "locationIndex": 1,
                        "time": 1115
                    },
                    {
                        "locationIndex": 2,
                        "time": 1131
                    },
                    {
                        "locationIndex": 4,
                        "time": 1131
                    },
                    {
                        "locationIndex": 3,
                        "time": 1154
                    },
                    {
                        "locationIndex": 1,
                        "time": 1179
                    },
                    {
                        "locationIndex": 2,
                        "time": 1195
                    },
                    {
                        "locationIndex": 3,
                        "time": 1195
                    },
                    {
                        "locationIndex": 1,
                        "time": 1218
                    },
                    {
                        "locationIndex": 4,
                        "time": 1234
                    },
                    {
                        "locationIndex": 1,
                        "time": 1250
                    },
                    {
                        "locationIndex": 2,
                        "time": 1266
                    },
                    {
                        "locationIndex": 4,
                        "time": 1282
                    },
                    {
                        "locationIndex": 0,
                        "time": 1299
                    },
                    {
                        "locationIndex": 1,
                        "time": 1299
                    },
                    {
                        "locationIndex": 5,
                        "time": 1318
                    },
                    {
                        "locationIndex": 2,
                        "time": 1336
                    },
                    {
                        "locationIndex": 1,
                        "time": 1378
                    },
                    {
                        "locationIndex": 3,
                        "time": 1394
                    },
                    {
                        "locationIndex": 2,
                        "time": 1410
                    },
                    {
                        "locationIndex": 3,
                        "time": 1427
                    },
                    {
                        "locationIndex": 0,
                        "time": 1453
                    },
                    {
                        "locationIndex": 5,
                        "time": 1474
                    },
                    {
                        "locationIndex": 4,
                        "time": 1490
                    },
                    {
                        "locationIndex": 5,
                        "time": 1506
                    },
                    {
                        "locationIndex": 0,
                        "time": 1522
                    },
                    {
                        "locationIndex": 1,
                        "time": 1522
                    },
                    {
                        "locationIndex": 5,
                        "time": 1538
                    },
                    {
                        "locationIndex": 2,
                        "time": 1555
                    },
                    {
                        "locationIndex": 4,
                        "time": 1584
                    },
                    {
                        "locationIndex": 3,
                        "time": 1584
                    },
                    {
                        "locationIndex": 0,
                        "time": 1602
                    },
                    {
                        "locationIndex": 5,
                        "time": 1634
                    },
                    {
                        "locationIndex": 3,
                        "time": 1650
                    },
                    {
                        "locationIndex": 5,
                        "time": 1666
                    },
                    {
                        "locationIndex": 4,
                        "time": 1698
                    },
                    {
                        "locationIndex": 1,
                        "time": 1714
                    },
                    {
                        "locationIndex": 2,
                        "time": 1730
                    },
                    {
                        "locationIndex": 4,
                        "time": 1746
                    },
                    {
                        "locationIndex": 2,
                        "time": 1762
                    },
                    {
                        "locationIndex": 0,
                        "time": 1778
                    },
                    {
                        "locationIndex": 5,
                        "time": 1778
                    },
                    {
                        "locationIndex": 2,
                        "time": 1794
                    },
                    {
                        "locationIndex": 0,
                        "time": 1811
                    },
                    {
                        "locationIndex": 5,
                        "time": 1832
                    },
                    {
                        "locationIndex": 3,
                        "time": 1858
                    },
                    {
                        "locationIndex": 1,
                        "time": 1890
                    },
                    {
                        "locationIndex": 5,
                        "time": 1906
                    },
                    {
                        "locationIndex": 3,
                        "time": 1922
                    },
                    {
                        "locationIndex": 4,
                        "time": 1938
                    },
                    {
                        "locationIndex": 0,
                        "time": 1954
                    },
                    {
                        "locationIndex": 1,
                        "time": 1970
                    },
                    {
                        "locationIndex": 3,
                        "time": 1986
                    },
                    {
                        "locationIndex": 4,
                        "time": 1986
                    },
                    {
                        "locationIndex": 1,
                        "time": 2002
                    },
                    {
                        "locationIndex": 2,
                        "time": 2018
                    },
                    {
                        "locationIndex": 0,
                        "time": 2018
                    },
                    {
                        "locationIndex": 5,
                        "time": 2034
                    },
                    {
                        "locationIndex": 3,
                        "time": 2066
                    },
                    {
                        "locationIndex": 0,
                        "time": 2082
                    },
                    {
                        "locationIndex": 2,
                        "time": 2098
                    },
                    {
                        "locationIndex": 3,
                        "time": 2098
                    },
                    {
                        "locationIndex": 1,
                        "time": 2114
                    },
                    {
                        "locationIndex": 0,
                        "time": 2146
                    },
                    {
                        "locationIndex": 4,
                        "time": 2162
                    },
                    {
                        "locationIndex": 3,
                        "time": 2178
                    },
                    {
                        "locationIndex": 2,
                        "time": 2210
                    },
                    {
                        "locationIndex": 1,
                        "time": 2226
                    },
                    {
                        "locationIndex": 4,
                        "time": 2242
                    },
                    {
                        "locationIndex": 1,
                        "time": 2258
                    },
                    {
                        "locationIndex": 3,
                        "time": 2274
                    },
                    {
                        "locationIndex": 2,
                        "time": 2290
                    },
                    {
                        "locationIndex": 1,
                        "time": 2306
                    },
                    {
                        "locationIndex": 2,
                        "time": 2322
                    },
                    {
                        "locationIndex": 1,
                        "time": 2338
                    },
                    {
                        "locationIndex": 0,
                        "time": 2354
                    },
                    {
                        "locationIndex": 3,
                        "time": 2370
                    },
                    {
                        "locationIndex": 2,
                        "time": 2402
                    },
                    {
                        "locationIndex": 1,
                        "time": 2418
                    },
                    {
                        "locationIndex": 5,
                        "time": 2434
                    },
                    {
                        "locationIndex": 1,
                        "time": 2466
                    },
                    {
                        "locationIndex": 4,
                        "time": 2482
                    },
                    {
                        "locationIndex": 0,
                        "time": 2498
                    },
                    {
                        "locationIndex": 2,
                        "time": 2514
                    },
                    {
                        "locationIndex": 4,
                        "time": 2530
                    },
                    {
                        "locationIndex": 0,
                        "time": 2546
                    },
                    {
                        "locationIndex": 2,
                        "time": 2562
                    },
                    {
                        "locationIndex": 1,
                        "time": 2579
                    },
                    {
                        "locationIndex": 3,
                        "time": 2608
                    },
                    {
                        "locationIndex": 4,
                        "time": 2608
                    },
                    {
                        "locationIndex": 5,
                        "time": 2626
                    },
                    {
                        "locationIndex": 2,
                        "time": 2669
                    },
                    {
                        "locationIndex": 4,
                        "time": 2708
                    },
                    {
                        "locationIndex": 1,
                        "time": 2739
                    },
                    {
                        "locationIndex": 5,
                        "time": 2776
                    },
                    {
                        "locationIndex": 3,
                        "time": 2794
                    },
                    {
                        "locationIndex": 0,
                        "time": 2833
                    },
                    {
                        "locationIndex": 5,
                        "time": 2864
                    },
                    {
                        "locationIndex": 1,
                        "time": 2915
                    },
                    {
                        "locationIndex": 4,
                        "time": 2954
                    },
                    {
                        "locationIndex": 2,
                        "time": 2992
                    },
                    {
                        "locationIndex": 5,
                        "time": 3067
                    },
                    {
                        "locationIndex": 2,
                        "time": 3132
                    }
                ],
                "autoCreate": false
            }
        ]
    };
songs.push(song);

if(ShuttingStarsUtility.isDateToday('yyyy-12-24') || ShuttingStarsUtility.isDateToday('yyyy-12-25')) {
    song = {
        "name": "Snow on the Town Square",
        "composer": "Lyria",
        "noteWriter": "HJOW",
        "bgaUrl": "",
        "musicUrl": "[RSSC]songs/ai/Snow_on_the_Town_Square.mp3",
        "musicAlterUrl": "",
        "useYoutube": false,
        "youtubeVideoId": "",
        "thumbnailUrl": "",
        "description": "\n|Music: Google Lyria\n|  https://gemini.google/overview/music-generation/\n|License: All license granted by AI Platform.\n",
        "loadingTime": 10,
        "bpm": 75,
        "endTime": 0,
        "timeConstant": 0,
        "timeMultiplier": 1,
        "noteMultiplier": 1,
        "test": false,
        "onlyRandom": false,
        "autoStars": true,
        "serial": "nai4ilaaTEWMB5325WGWIERGWEIGESGSDGsnmdk",
        "decorations": [],
        "difficulties": [
            {
                "index": 0,
                "difficultyLabel": "easy",
                "difficultyLevel": 3,
                "patterns": [
                    {
                        "locationIndex": 0,
                        "time": 146
                    },
                    {
                        "locationIndex": 1,
                        "time": 162
                    },
                    {
                        "locationIndex": 0,
                        "time": 190
                    },
                    {
                        "locationIndex": 2,
                        "time": 206
                    },
                    {
                        "locationIndex": 3,
                        "time": 234
                    },
                    {
                        "locationIndex": 4,
                        "time": 252
                    },
                    {
                        "locationIndex": 0,
                        "time": 278
                    },
                    {
                        "locationIndex": 1,
                        "time": 294
                    },
                    {
                        "locationIndex": 0,
                        "time": 314
                    },
                    {
                        "locationIndex": 3,
                        "time": 330
                    },
                    {
                        "locationIndex": 5,
                        "time": 362
                    },
                    {
                        "locationIndex": 4,
                        "time": 378
                    },
                    {
                        "locationIndex": 1,
                        "time": 394
                    },
                    {
                        "locationIndex": 2,
                        "time": 394
                    },
                    {
                        "locationIndex": 5,
                        "time": 418
                    },
                    {
                        "locationIndex": 1,
                        "time": 434
                    },
                    {
                        "locationIndex": 2,
                        "time": 450
                    },
                    {
                        "locationIndex": 3,
                        "time": 466
                    },
                    {
                        "locationIndex": 2,
                        "time": 482
                    },
                    {
                        "locationIndex": 0,
                        "time": 502
                    },
                    {
                        "locationIndex": 2,
                        "time": 522
                    },
                    {
                        "locationIndex": 3,
                        "time": 538
                    },
                    {
                        "locationIndex": 5,
                        "time": 554
                    },
                    {
                        "locationIndex": 4,
                        "time": 570
                    },
                    {
                        "locationIndex": 5,
                        "time": 586
                    },
                    {
                        "locationIndex": 2,
                        "time": 606
                    },
                    {
                        "locationIndex": 5,
                        "time": 626
                    },
                    {
                        "locationIndex": 2,
                        "time": 642
                    },
                    {
                        "locationIndex": 5,
                        "time": 658
                    },
                    {
                        "locationIndex": 4,
                        "time": 658
                    },
                    {
                        "locationIndex": 1,
                        "time": 674
                    },
                    {
                        "locationIndex": 3,
                        "time": 690
                    },
                    {
                        "locationIndex": 2,
                        "time": 711
                    },
                    {
                        "locationIndex": 0,
                        "time": 730
                    },
                    {
                        "locationIndex": 4,
                        "time": 746
                    },
                    {
                        "locationIndex": 1,
                        "time": 762
                    },
                    {
                        "locationIndex": 3,
                        "time": 762
                    },
                    {
                        "locationIndex": 2,
                        "time": 778
                    },
                    {
                        "locationIndex": 0,
                        "time": 794
                    },
                    {
                        "locationIndex": 1,
                        "time": 818
                    },
                    {
                        "locationIndex": 3,
                        "time": 834
                    },
                    {
                        "locationIndex": 4,
                        "time": 850
                    },
                    {
                        "locationIndex": 3,
                        "time": 866
                    },
                    {
                        "locationIndex": 0,
                        "time": 882
                    },
                    {
                        "locationIndex": 2,
                        "time": 906
                    },
                    {
                        "locationIndex": 3,
                        "time": 922
                    },
                    {
                        "locationIndex": 0,
                        "time": 938
                    },
                    {
                        "locationIndex": 5,
                        "time": 954
                    },
                    {
                        "locationIndex": 0,
                        "time": 970
                    },
                    {
                        "locationIndex": 1,
                        "time": 994
                    },
                    {
                        "locationIndex": 0,
                        "time": 1010
                    },
                    {
                        "locationIndex": 1,
                        "time": 1026
                    },
                    {
                        "locationIndex": 3,
                        "time": 1042
                    },
                    {
                        "locationIndex": 5,
                        "time": 1058
                    },
                    {
                        "locationIndex": 3,
                        "time": 1082
                    },
                    {
                        "locationIndex": 2,
                        "time": 1098
                    },
                    {
                        "locationIndex": 4,
                        "time": 1114
                    },
                    {
                        "locationIndex": 2,
                        "time": 1130
                    },
                    {
                        "locationIndex": 4,
                        "time": 1146
                    },
                    {
                        "locationIndex": 3,
                        "time": 1146
                    },
                    {
                        "locationIndex": 5,
                        "time": 1170
                    },
                    {
                        "locationIndex": 4,
                        "time": 1186
                    },
                    {
                        "locationIndex": 3,
                        "time": 1202
                    },
                    {
                        "locationIndex": 4,
                        "time": 1218
                    },
                    {
                        "locationIndex": 1,
                        "time": 1234
                    },
                    {
                        "locationIndex": 3,
                        "time": 1234
                    },
                    {
                        "locationIndex": 0,
                        "time": 1258
                    },
                    {
                        "locationIndex": 2,
                        "time": 1274
                    },
                    {
                        "locationIndex": 0,
                        "time": 1290
                    },
                    {
                        "locationIndex": 3,
                        "time": 1306
                    },
                    {
                        "locationIndex": 5,
                        "time": 1322
                    },
                    {
                        "locationIndex": 4,
                        "time": 1344
                    },
                    {
                        "locationIndex": 2,
                        "time": 1362
                    },
                    {
                        "locationIndex": 3,
                        "time": 1378
                    },
                    {
                        "locationIndex": 2,
                        "time": 1394
                    },
                    {
                        "locationIndex": 0,
                        "time": 1410
                    },
                    {
                        "locationIndex": 2,
                        "time": 1426
                    },
                    {
                        "locationIndex": 1,
                        "time": 1450
                    },
                    {
                        "locationIndex": 4,
                        "time": 1466
                    },
                    {
                        "locationIndex": 3,
                        "time": 1466
                    },
                    {
                        "locationIndex": 5,
                        "time": 1482
                    },
                    {
                        "locationIndex": 3,
                        "time": 1498
                    },
                    {
                        "locationIndex": 4,
                        "time": 1514
                    },
                    {
                        "locationIndex": 0,
                        "time": 1535
                    },
                    {
                        "locationIndex": 5,
                        "time": 1554
                    },
                    {
                        "locationIndex": 4,
                        "time": 1570
                    },
                    {
                        "locationIndex": 1,
                        "time": 1570
                    },
                    {
                        "locationIndex": 0,
                        "time": 1586
                    },
                    {
                        "locationIndex": 5,
                        "time": 1602
                    },
                    {
                        "locationIndex": 3,
                        "time": 1618
                    },
                    {
                        "locationIndex": 1,
                        "time": 1642
                    },
                    {
                        "locationIndex": 5,
                        "time": 1642
                    },
                    {
                        "locationIndex": 2,
                        "time": 1658
                    },
                    {
                        "locationIndex": 0,
                        "time": 1674
                    },
                    {
                        "locationIndex": 3,
                        "time": 1674
                    },
                    {
                        "locationIndex": 4,
                        "time": 1690
                    },
                    {
                        "locationIndex": 3,
                        "time": 1706
                    },
                    {
                        "locationIndex": 1,
                        "time": 1726
                    },
                    {
                        "locationIndex": 0,
                        "time": 1742
                    },
                    {
                        "locationIndex": 4,
                        "time": 1762
                    },
                    {
                        "locationIndex": 3,
                        "time": 1778
                    },
                    {
                        "locationIndex": 2,
                        "time": 1794
                    },
                    {
                        "locationIndex": 1,
                        "time": 1810
                    },
                    {
                        "locationIndex": 3,
                        "time": 1826
                    },
                    {
                        "locationIndex": 4,
                        "time": 1846
                    },
                    {
                        "locationIndex": 1,
                        "time": 1862
                    },
                    {
                        "locationIndex": 0,
                        "time": 1878
                    },
                    {
                        "locationIndex": 3,
                        "time": 1894
                    },
                    {
                        "locationIndex": 2,
                        "time": 1910
                    },
                    {
                        "locationIndex": 5,
                        "time": 1930
                    },
                    {
                        "locationIndex": 3,
                        "time": 1946
                    },
                    {
                        "locationIndex": 0,
                        "time": 1962
                    },
                    {
                        "locationIndex": 1,
                        "time": 1962
                    },
                    {
                        "locationIndex": 2,
                        "time": 1978
                    },
                    {
                        "locationIndex": 1,
                        "time": 1994
                    },
                    {
                        "locationIndex": 0,
                        "time": 2014
                    },
                    {
                        "locationIndex": 4,
                        "time": 2034
                    },
                    {
                        "locationIndex": 5,
                        "time": 2050
                    },
                    {
                        "locationIndex": 3,
                        "time": 2050
                    },
                    {
                        "locationIndex": 0,
                        "time": 2066
                    },
                    {
                        "locationIndex": 2,
                        "time": 2082
                    },
                    {
                        "locationIndex": 4,
                        "time": 2099
                    },
                    {
                        "locationIndex": 0,
                        "time": 2118
                    },
                    {
                        "locationIndex": 2,
                        "time": 2134
                    },
                    {
                        "locationIndex": 5,
                        "time": 2150
                    },
                    {
                        "locationIndex": 3,
                        "time": 2168
                    },
                    {
                        "locationIndex": 1,
                        "time": 2186
                    },
                    {
                        "locationIndex": 4,
                        "time": 2202
                    },
                    {
                        "locationIndex": 3,
                        "time": 2218
                    },
                    {
                        "locationIndex": 4,
                        "time": 2234
                    },
                    {
                        "locationIndex": 0,
                        "time": 2250
                    },
                    {
                        "locationIndex": 1,
                        "time": 2250
                    },
                    {
                        "locationIndex": 4,
                        "time": 2270
                    },
                    {
                        "locationIndex": 3,
                        "time": 2286
                    },
                    {
                        "locationIndex": 5,
                        "time": 2302
                    },
                    {
                        "locationIndex": 2,
                        "time": 2318
                    },
                    {
                        "locationIndex": 5,
                        "time": 2334
                    },
                    {
                        "locationIndex": 0,
                        "time": 2354
                    },
                    {
                        "locationIndex": 2,
                        "time": 2370
                    },
                    {
                        "locationIndex": 0,
                        "time": 2386
                    },
                    {
                        "locationIndex": 5,
                        "time": 2402
                    },
                    {
                        "locationIndex": 0,
                        "time": 2418
                    },
                    {
                        "locationIndex": 2,
                        "time": 2454
                    },
                    {
                        "locationIndex": 5,
                        "time": 2470
                    },
                    {
                        "locationIndex": 4,
                        "time": 2486
                    },
                    {
                        "locationIndex": 5,
                        "time": 2506
                    },
                    {
                        "locationIndex": 2,
                        "time": 2506
                    },
                    {
                        "locationIndex": 3,
                        "time": 2522
                    },
                    {
                        "locationIndex": 1,
                        "time": 2538
                    },
                    {
                        "locationIndex": 0,
                        "time": 2554
                    },
                    {
                        "locationIndex": 3,
                        "time": 2570
                    },
                    {
                        "locationIndex": 4,
                        "time": 2590
                    },
                    {
                        "locationIndex": 0,
                        "time": 2626
                    },
                    {
                        "locationIndex": 4,
                        "time": 2690
                    }
                ],
                "autoCreate": false
            },
            {
                "index": 1,
                "difficultyLabel": "normal",
                "difficultyLevel": 6,
                "patterns": [
                    {
                        "locationIndex": 0,
                        "time": 146
                    },
                    {
                        "locationIndex": 3,
                        "time": 154
                    },
                    {
                        "locationIndex": 2,
                        "time": 174
                    },
                    {
                        "locationIndex": 3,
                        "time": 186
                    },
                    {
                        "locationIndex": 5,
                        "time": 198
                    },
                    {
                        "locationIndex": 2,
                        "time": 210
                    },
                    {
                        "locationIndex": 1,
                        "time": 234
                    },
                    {
                        "locationIndex": 4,
                        "time": 250
                    },
                    {
                        "locationIndex": 5,
                        "time": 266
                    },
                    {
                        "locationIndex": 1,
                        "time": 282
                    },
                    {
                        "locationIndex": 5,
                        "time": 290
                    },
                    {
                        "locationIndex": 4,
                        "time": 298
                    },
                    {
                        "locationIndex": 2,
                        "time": 310
                    },
                    {
                        "locationIndex": 1,
                        "time": 310
                    },
                    {
                        "locationIndex": 5,
                        "time": 322
                    },
                    {
                        "locationIndex": 4,
                        "time": 330
                    },
                    {
                        "locationIndex": 3,
                        "time": 330
                    },
                    {
                        "locationIndex": 5,
                        "time": 346
                    },
                    {
                        "locationIndex": 0,
                        "time": 354
                    },
                    {
                        "locationIndex": 3,
                        "time": 378
                    },
                    {
                        "locationIndex": 0,
                        "time": 386
                    },
                    {
                        "locationIndex": 4,
                        "time": 402
                    },
                    {
                        "locationIndex": 5,
                        "time": 402
                    },
                    {
                        "locationIndex": 1,
                        "time": 410
                    },
                    {
                        "locationIndex": 0,
                        "time": 418
                    },
                    {
                        "locationIndex": 3,
                        "time": 426
                    },
                    {
                        "locationIndex": 4,
                        "time": 434
                    },
                    {
                        "locationIndex": 2,
                        "time": 442
                    },
                    {
                        "locationIndex": 5,
                        "time": 442
                    },
                    {
                        "locationIndex": 3,
                        "time": 450
                    },
                    {
                        "locationIndex": 1,
                        "time": 458
                    },
                    {
                        "locationIndex": 4,
                        "time": 466
                    },
                    {
                        "locationIndex": 3,
                        "time": 474
                    },
                    {
                        "locationIndex": 4,
                        "time": 482
                    },
                    {
                        "locationIndex": 3,
                        "time": 490
                    },
                    {
                        "locationIndex": 5,
                        "time": 490
                    },
                    {
                        "locationIndex": 1,
                        "time": 498
                    },
                    {
                        "locationIndex": 2,
                        "time": 498
                    },
                    {
                        "locationIndex": 5,
                        "time": 506
                    },
                    {
                        "locationIndex": 3,
                        "time": 514
                    },
                    {
                        "locationIndex": 5,
                        "time": 522
                    },
                    {
                        "locationIndex": 4,
                        "time": 522
                    },
                    {
                        "locationIndex": 3,
                        "time": 530
                    },
                    {
                        "locationIndex": 1,
                        "time": 538
                    },
                    {
                        "locationIndex": 4,
                        "time": 546
                    },
                    {
                        "locationIndex": 2,
                        "time": 554
                    },
                    {
                        "locationIndex": 3,
                        "time": 562
                    },
                    {
                        "locationIndex": 4,
                        "time": 562
                    },
                    {
                        "locationIndex": 0,
                        "time": 570
                    },
                    {
                        "locationIndex": 1,
                        "time": 578
                    },
                    {
                        "locationIndex": 2,
                        "time": 578
                    },
                    {
                        "locationIndex": 5,
                        "time": 586
                    },
                    {
                        "locationIndex": 4,
                        "time": 594
                    },
                    {
                        "locationIndex": 0,
                        "time": 602
                    },
                    {
                        "locationIndex": 3,
                        "time": 602
                    },
                    {
                        "locationIndex": 4,
                        "time": 610
                    },
                    {
                        "locationIndex": 1,
                        "time": 618
                    },
                    {
                        "locationIndex": 3,
                        "time": 626
                    },
                    {
                        "locationIndex": 1,
                        "time": 634
                    },
                    {
                        "locationIndex": 2,
                        "time": 642
                    },
                    {
                        "locationIndex": 1,
                        "time": 650
                    },
                    {
                        "locationIndex": 5,
                        "time": 658
                    },
                    {
                        "locationIndex": 3,
                        "time": 666
                    },
                    {
                        "locationIndex": 4,
                        "time": 682
                    },
                    {
                        "locationIndex": 0,
                        "time": 682
                    },
                    {
                        "locationIndex": 3,
                        "time": 690
                    },
                    {
                        "locationIndex": 5,
                        "time": 698
                    },
                    {
                        "locationIndex": 4,
                        "time": 706
                    },
                    {
                        "locationIndex": 2,
                        "time": 714
                    },
                    {
                        "locationIndex": 0,
                        "time": 714
                    },
                    {
                        "locationIndex": 5,
                        "time": 722
                    },
                    {
                        "locationIndex": 1,
                        "time": 730
                    },
                    {
                        "locationIndex": 2,
                        "time": 738
                    },
                    {
                        "locationIndex": 4,
                        "time": 738
                    },
                    {
                        "locationIndex": 1,
                        "time": 746,
                        "type": "long",
                        "ends": 761
                    },
                    {
                        "locationIndex": 3,
                        "time": 754
                    },
                    {
                        "locationIndex": 4,
                        "time": 762
                    },
                    {
                        "locationIndex": 3,
                        "time": 770
                    },
                    {
                        "locationIndex": 2,
                        "time": 778
                    },
                    {
                        "locationIndex": 0,
                        "time": 786
                    },
                    {
                        "locationIndex": 2,
                        "time": 794
                    },
                    {
                        "locationIndex": 3,
                        "time": 794
                    },
                    {
                        "locationIndex": 4,
                        "time": 802
                    },
                    {
                        "locationIndex": 3,
                        "time": 810
                    },
                    {
                        "locationIndex": 2,
                        "time": 818
                    },
                    {
                        "locationIndex": 3,
                        "time": 826
                    },
                    {
                        "locationIndex": 0,
                        "time": 834
                    },
                    {
                        "locationIndex": 2,
                        "time": 842
                    },
                    {
                        "locationIndex": 4,
                        "time": 850,
                        "type": "long",
                        "ends": 865
                    },
                    {
                        "locationIndex": 0,
                        "time": 850,
                        "type": "long",
                        "ends": 865
                    },
                    {
                        "locationIndex": 5,
                        "time": 858
                    },
                    {
                        "locationIndex": 3,
                        "time": 866
                    },
                    {
                        "locationIndex": 2,
                        "time": 874
                    },
                    {
                        "locationIndex": 5,
                        "time": 874
                    },
                    {
                        "locationIndex": 3,
                        "time": 882
                    },
                    {
                        "locationIndex": 2,
                        "time": 890
                    },
                    {
                        "locationIndex": 1,
                        "time": 898
                    },
                    {
                        "locationIndex": 3,
                        "time": 898
                    },
                    {
                        "locationIndex": 2,
                        "time": 906
                    },
                    {
                        "locationIndex": 1,
                        "time": 914
                    },
                    {
                        "locationIndex": 3,
                        "time": 914
                    },
                    {
                        "locationIndex": 5,
                        "time": 922
                    },
                    {
                        "locationIndex": 1,
                        "time": 930
                    },
                    {
                        "locationIndex": 5,
                        "time": 938
                    },
                    {
                        "locationIndex": 2,
                        "time": 946
                    },
                    {
                        "locationIndex": 1,
                        "time": 954
                    },
                    {
                        "locationIndex": 3,
                        "time": 962
                    },
                    {
                        "locationIndex": 1,
                        "time": 970
                    },
                    {
                        "locationIndex": 3,
                        "time": 978
                    },
                    {
                        "locationIndex": 5,
                        "time": 986
                    },
                    {
                        "locationIndex": 2,
                        "time": 986
                    },
                    {
                        "locationIndex": 4,
                        "time": 994
                    },
                    {
                        "locationIndex": 1,
                        "time": 994
                    },
                    {
                        "locationIndex": 3,
                        "time": 1002
                    },
                    {
                        "locationIndex": 1,
                        "time": 1010,
                        "type": "long",
                        "ends": 1025
                    },
                    {
                        "locationIndex": 4,
                        "time": 1018
                    },
                    {
                        "locationIndex": 0,
                        "time": 1026,
                        "type": "long",
                        "ends": 1041
                    },
                    {
                        "locationIndex": 3,
                        "time": 1034
                    },
                    {
                        "locationIndex": 4,
                        "time": 1042
                    },
                    {
                        "locationIndex": 3,
                        "time": 1050
                    },
                    {
                        "locationIndex": 2,
                        "time": 1050
                    },
                    {
                        "locationIndex": 5,
                        "time": 1058
                    },
                    {
                        "locationIndex": 4,
                        "time": 1066
                    },
                    {
                        "locationIndex": 2,
                        "time": 1074
                    },
                    {
                        "locationIndex": 4,
                        "time": 1082
                    },
                    {
                        "locationIndex": 2,
                        "time": 1090
                    },
                    {
                        "locationIndex": 4,
                        "time": 1098
                    },
                    {
                        "locationIndex": 2,
                        "time": 1106
                    },
                    {
                        "locationIndex": 5,
                        "time": 1106
                    },
                    {
                        "locationIndex": 4,
                        "time": 1114
                    },
                    {
                        "locationIndex": 2,
                        "time": 1122
                    },
                    {
                        "locationIndex": 3,
                        "time": 1130
                    },
                    {
                        "locationIndex": 5,
                        "time": 1138
                    },
                    {
                        "locationIndex": 2,
                        "time": 1146
                    },
                    {
                        "locationIndex": 5,
                        "time": 1154
                    },
                    {
                        "locationIndex": 3,
                        "time": 1162
                    },
                    {
                        "locationIndex": 5,
                        "time": 1170
                    },
                    {
                        "locationIndex": 0,
                        "time": 1178
                    },
                    {
                        "locationIndex": 3,
                        "time": 1186
                    },
                    {
                        "locationIndex": 1,
                        "time": 1194
                    },
                    {
                        "locationIndex": 2,
                        "time": 1194
                    },
                    {
                        "locationIndex": 5,
                        "time": 1202
                    },
                    {
                        "locationIndex": 3,
                        "time": 1210
                    },
                    {
                        "locationIndex": 1,
                        "time": 1218
                    },
                    {
                        "locationIndex": 2,
                        "time": 1226
                    },
                    {
                        "locationIndex": 3,
                        "time": 1234
                    },
                    {
                        "locationIndex": 5,
                        "time": 1242
                    },
                    {
                        "locationIndex": 0,
                        "time": 1250
                    },
                    {
                        "locationIndex": 1,
                        "time": 1250
                    },
                    {
                        "locationIndex": 2,
                        "time": 1258
                    },
                    {
                        "locationIndex": 5,
                        "time": 1266
                    },
                    {
                        "locationIndex": 3,
                        "time": 1274
                    },
                    {
                        "locationIndex": 5,
                        "time": 1282
                    },
                    {
                        "locationIndex": 4,
                        "time": 1290
                    },
                    {
                        "locationIndex": 3,
                        "time": 1298
                    },
                    {
                        "locationIndex": 5,
                        "time": 1298
                    },
                    {
                        "locationIndex": 2,
                        "time": 1306
                    },
                    {
                        "locationIndex": 5,
                        "time": 1314,
                        "type": "long",
                        "ends": 1329
                    },
                    {
                        "locationIndex": 3,
                        "time": 1322
                    },
                    {
                        "locationIndex": 0,
                        "time": 1322
                    },
                    {
                        "locationIndex": 1,
                        "time": 1330
                    },
                    {
                        "locationIndex": 0,
                        "time": 1338
                    },
                    {
                        "locationIndex": 2,
                        "time": 1346,
                        "type": "long",
                        "ends": 1361
                    },
                    {
                        "locationIndex": 0,
                        "time": 1354
                    },
                    {
                        "locationIndex": 4,
                        "time": 1362
                    },
                    {
                        "locationIndex": 3,
                        "time": 1370
                    },
                    {
                        "locationIndex": 1,
                        "time": 1370
                    },
                    {
                        "locationIndex": 0,
                        "time": 1378
                    },
                    {
                        "locationIndex": 4,
                        "time": 1386
                    },
                    {
                        "locationIndex": 3,
                        "time": 1394
                    },
                    {
                        "locationIndex": 1,
                        "time": 1402,
                        "type": "long",
                        "ends": 1417
                    },
                    {
                        "locationIndex": 4,
                        "time": 1410
                    },
                    {
                        "locationIndex": 0,
                        "time": 1418
                    },
                    {
                        "locationIndex": 4,
                        "time": 1426,
                        "type": "long",
                        "ends": 1441
                    },
                    {
                        "locationIndex": 3,
                        "time": 1434
                    },
                    {
                        "locationIndex": 0,
                        "time": 1442
                    },
                    {
                        "locationIndex": 3,
                        "time": 1450
                    },
                    {
                        "locationIndex": 5,
                        "time": 1458,
                        "type": "long",
                        "ends": 1473
                    },
                    {
                        "locationIndex": 0,
                        "time": 1466
                    },
                    {
                        "locationIndex": 3,
                        "time": 1474
                    },
                    {
                        "locationIndex": 0,
                        "time": 1482
                    },
                    {
                        "locationIndex": 2,
                        "time": 1490
                    },
                    {
                        "locationIndex": 0,
                        "time": 1498
                    },
                    {
                        "locationIndex": 3,
                        "time": 1498
                    },
                    {
                        "locationIndex": 2,
                        "time": 1506
                    },
                    {
                        "locationIndex": 3,
                        "time": 1514,
                        "type": "long",
                        "ends": 1529
                    },
                    {
                        "locationIndex": 2,
                        "time": 1522
                    },
                    {
                        "locationIndex": 0,
                        "time": 1522
                    },
                    {
                        "locationIndex": 0,
                        "time": 1535
                    },
                    {
                        "locationIndex": 2,
                        "time": 1535
                    },
                    {
                        "locationIndex": 1,
                        "time": 1546
                    },
                    {
                        "locationIndex": 0,
                        "time": 1554
                    },
                    {
                        "locationIndex": 2,
                        "time": 1562
                    },
                    {
                        "locationIndex": 0,
                        "time": 1570
                    },
                    {
                        "locationIndex": 2,
                        "time": 1578,
                        "type": "long",
                        "ends": 1593
                    },
                    {
                        "locationIndex": 4,
                        "time": 1586
                    },
                    {
                        "locationIndex": 0,
                        "time": 1586
                    },
                    {
                        "locationIndex": 1,
                        "time": 1594
                    },
                    {
                        "locationIndex": 4,
                        "time": 1602
                    },
                    {
                        "locationIndex": 5,
                        "time": 1602
                    },
                    {
                        "locationIndex": 1,
                        "time": 1610
                    },
                    {
                        "locationIndex": 0,
                        "time": 1618
                    },
                    {
                        "locationIndex": 1,
                        "time": 1626
                    },
                    {
                        "locationIndex": 4,
                        "time": 1634
                    },
                    {
                        "locationIndex": 5,
                        "time": 1642
                    },
                    {
                        "locationIndex": 0,
                        "time": 1650
                    },
                    {
                        "locationIndex": 5,
                        "time": 1658
                    },
                    {
                        "locationIndex": 3,
                        "time": 1658
                    },
                    {
                        "locationIndex": 4,
                        "time": 1666
                    },
                    {
                        "locationIndex": 1,
                        "time": 1674
                    },
                    {
                        "locationIndex": 3,
                        "time": 1682
                    },
                    {
                        "locationIndex": 4,
                        "time": 1690
                    },
                    {
                        "locationIndex": 0,
                        "time": 1690
                    },
                    {
                        "locationIndex": 1,
                        "time": 1698
                    },
                    {
                        "locationIndex": 0,
                        "time": 1706
                    },
                    {
                        "locationIndex": 4,
                        "time": 1714
                    },
                    {
                        "locationIndex": 1,
                        "time": 1722,
                        "type": "long",
                        "ends": 1737
                    },
                    {
                        "locationIndex": 0,
                        "time": 1730
                    },
                    {
                        "locationIndex": 3,
                        "time": 1738
                    },
                    {
                        "locationIndex": 5,
                        "time": 1746
                    },
                    {
                        "locationIndex": 4,
                        "time": 1754
                    },
                    {
                        "locationIndex": 0,
                        "time": 1754
                    },
                    {
                        "locationIndex": 3,
                        "time": 1762
                    },
                    {
                        "locationIndex": 5,
                        "time": 1770
                    },
                    {
                        "locationIndex": 0,
                        "time": 1778
                    },
                    {
                        "locationIndex": 5,
                        "time": 1786
                    },
                    {
                        "locationIndex": 2,
                        "time": 1794
                    },
                    {
                        "locationIndex": 5,
                        "time": 1802
                    },
                    {
                        "locationIndex": 3,
                        "time": 1810
                    },
                    {
                        "locationIndex": 5,
                        "time": 1818
                    },
                    {
                        "locationIndex": 4,
                        "time": 1818
                    },
                    {
                        "locationIndex": 2,
                        "time": 1826,
                        "type": "long",
                        "ends": 1841
                    },
                    {
                        "locationIndex": 3,
                        "time": 1834
                    },
                    {
                        "locationIndex": 4,
                        "time": 1846
                    },
                    {
                        "locationIndex": 3,
                        "time": 1858
                    },
                    {
                        "locationIndex": 1,
                        "time": 1866
                    },
                    {
                        "locationIndex": 3,
                        "time": 1874
                    },
                    {
                        "locationIndex": 1,
                        "time": 1882
                    },
                    {
                        "locationIndex": 4,
                        "time": 1882
                    },
                    {
                        "locationIndex": 5,
                        "time": 1890
                    },
                    {
                        "locationIndex": 3,
                        "time": 1898
                    },
                    {
                        "locationIndex": 1,
                        "time": 1906
                    },
                    {
                        "locationIndex": 5,
                        "time": 1914
                    },
                    {
                        "locationIndex": 3,
                        "time": 1922
                    },
                    {
                        "locationIndex": 5,
                        "time": 1930
                    },
                    {
                        "locationIndex": 1,
                        "time": 1938
                    },
                    {
                        "locationIndex": 0,
                        "time": 1938
                    },
                    {
                        "locationIndex": 5,
                        "time": 1946
                    },
                    {
                        "locationIndex": 4,
                        "time": 1954
                    },
                    {
                        "locationIndex": 3,
                        "time": 1962
                    },
                    {
                        "locationIndex": 4,
                        "time": 1970
                    },
                    {
                        "locationIndex": 2,
                        "time": 1978
                    },
                    {
                        "locationIndex": 4,
                        "time": 1986
                    },
                    {
                        "locationIndex": 5,
                        "time": 1994
                    },
                    {
                        "locationIndex": 0,
                        "time": 1994
                    },
                    {
                        "locationIndex": 3,
                        "time": 2002
                    },
                    {
                        "locationIndex": 4,
                        "time": 2010,
                        "type": "long",
                        "ends": 2025
                    },
                    {
                        "locationIndex": 3,
                        "time": 2018
                    },
                    {
                        "locationIndex": 1,
                        "time": 2026
                    },
                    {
                        "locationIndex": 0,
                        "time": 2034
                    },
                    {
                        "locationIndex": 1,
                        "time": 2042
                    },
                    {
                        "locationIndex": 5,
                        "time": 2042
                    },
                    {
                        "locationIndex": 0,
                        "time": 2050
                    },
                    {
                        "locationIndex": 1,
                        "time": 2058
                    },
                    {
                        "locationIndex": 0,
                        "time": 2066
                    },
                    {
                        "locationIndex": 3,
                        "time": 2074
                    },
                    {
                        "locationIndex": 0,
                        "time": 2082
                    },
                    {
                        "locationIndex": 3,
                        "time": 2090
                    },
                    {
                        "locationIndex": 2,
                        "time": 2099
                    },
                    {
                        "locationIndex": 0,
                        "time": 2107
                    },
                    {
                        "locationIndex": 2,
                        "time": 2118
                    },
                    {
                        "locationIndex": 0,
                        "time": 2126
                    },
                    {
                        "locationIndex": 1,
                        "time": 2126
                    },
                    {
                        "locationIndex": 3,
                        "time": 2134,
                        "type": "long",
                        "ends": 2149
                    },
                    {
                        "locationIndex": 2,
                        "time": 2142
                    },
                    {
                        "locationIndex": 1,
                        "time": 2150
                    },
                    {
                        "locationIndex": 5,
                        "time": 2150
                    },
                    {
                        "locationIndex": 4,
                        "time": 2158
                    },
                    {
                        "locationIndex": 0,
                        "time": 2168
                    },
                    {
                        "locationIndex": 1,
                        "time": 2176
                    },
                    {
                        "locationIndex": 2,
                        "time": 2186
                    },
                    {
                        "locationIndex": 1,
                        "time": 2194
                    },
                    {
                        "locationIndex": 5,
                        "time": 2202
                    },
                    {
                        "locationIndex": 4,
                        "time": 2210
                    },
                    {
                        "locationIndex": 5,
                        "time": 2218
                    },
                    {
                        "locationIndex": 1,
                        "time": 2218
                    },
                    {
                        "locationIndex": 0,
                        "time": 2226
                    },
                    {
                        "locationIndex": 1,
                        "time": 2234
                    },
                    {
                        "locationIndex": 5,
                        "time": 2242
                    },
                    {
                        "locationIndex": 4,
                        "time": 2250
                    },
                    {
                        "locationIndex": 2,
                        "time": 2258
                    },
                    {
                        "locationIndex": 0,
                        "time": 2258
                    },
                    {
                        "locationIndex": 5,
                        "time": 2266
                    },
                    {
                        "locationIndex": 0,
                        "time": 2274
                    },
                    {
                        "locationIndex": 2,
                        "time": 2282
                    },
                    {
                        "locationIndex": 0,
                        "time": 2290
                    },
                    {
                        "locationIndex": 2,
                        "time": 2298
                    },
                    {
                        "locationIndex": 3,
                        "time": 2306
                    },
                    {
                        "locationIndex": 2,
                        "time": 2314
                    },
                    {
                        "locationIndex": 1,
                        "time": 2314
                    },
                    {
                        "locationIndex": 5,
                        "time": 2322
                    },
                    {
                        "locationIndex": 1,
                        "time": 2330
                    },
                    {
                        "locationIndex": 3,
                        "time": 2338
                    },
                    {
                        "locationIndex": 1,
                        "time": 2346
                    },
                    {
                        "locationIndex": 4,
                        "time": 2354
                    },
                    {
                        "locationIndex": 0,
                        "time": 2354
                    },
                    {
                        "locationIndex": 5,
                        "time": 2362
                    },
                    {
                        "locationIndex": 0,
                        "time": 2370
                    },
                    {
                        "locationIndex": 5,
                        "time": 2378
                    },
                    {
                        "locationIndex": 3,
                        "time": 2386
                    },
                    {
                        "locationIndex": 4,
                        "time": 2394
                    },
                    {
                        "locationIndex": 0,
                        "time": 2402
                    },
                    {
                        "locationIndex": 1,
                        "time": 2410
                    },
                    {
                        "locationIndex": 2,
                        "time": 2418
                    },
                    {
                        "locationIndex": 0,
                        "time": 2426
                    },
                    {
                        "locationIndex": 4,
                        "time": 2426
                    },
                    {
                        "locationIndex": 3,
                        "time": 2434
                    },
                    {
                        "locationIndex": 1,
                        "time": 2446
                    },
                    {
                        "locationIndex": 5,
                        "time": 2458
                    },
                    {
                        "locationIndex": 1,
                        "time": 2466,
                        "type": "long",
                        "ends": 2481
                    },
                    {
                        "locationIndex": 2,
                        "time": 2478,
                        "type": "long",
                        "ends": 2493
                    },
                    {
                        "locationIndex": 3,
                        "time": 2490
                    },
                    {
                        "locationIndex": 4,
                        "time": 2502
                    },
                    {
                        "locationIndex": 3,
                        "time": 2510
                    },
                    {
                        "locationIndex": 4,
                        "time": 2522
                    },
                    {
                        "locationIndex": 0,
                        "time": 2530
                    },
                    {
                        "locationIndex": 5,
                        "time": 2538
                    },
                    {
                        "locationIndex": 3,
                        "time": 2554
                    },
                    {
                        "locationIndex": 5,
                        "time": 2570
                    },
                    {
                        "locationIndex": 4,
                        "time": 2578
                    },
                    {
                        "locationIndex": 5,
                        "time": 2638
                    },
                    {
                        "locationIndex": 1,
                        "time": 2650
                    },
                    {
                        "locationIndex": 0,
                        "time": 2658
                    },
                    {
                        "locationIndex": 4,
                        "time": 2674
                    },
                    {
                        "locationIndex": 5,
                        "time": 2682
                    },
                    {
                        "locationIndex": 0,
                        "time": 2738
                    },
                    {
                        "locationIndex": 2,
                        "time": 2778
                    }
                ],
                "autoCreate": false
            },
            {
                "index": 2,
                "difficultyLabel": "hard",
                "difficultyLevel": 9,
                "patterns": [
                    {
                        "locationIndex": 1,
                        "time": 146
                    },
                    {
                        "locationIndex": 5,
                        "time": 182
                    },
                    {
                        "locationIndex": 2,
                        "time": 194
                    },
                    {
                        "locationIndex": 1,
                        "time": 198
                    },
                    {
                        "locationIndex": 5,
                        "time": 214
                    },
                    {
                        "locationIndex": 0,
                        "time": 243
                    },
                    {
                        "locationIndex": 1,
                        "time": 258
                    },
                    {
                        "locationIndex": 3,
                        "time": 258
                    },
                    {
                        "locationIndex": 5,
                        "time": 262
                    },
                    {
                        "locationIndex": 0,
                        "time": 270
                    },
                    {
                        "locationIndex": 4,
                        "time": 282
                    },
                    {
                        "locationIndex": 0,
                        "time": 298
                    },
                    {
                        "locationIndex": 2,
                        "time": 310
                    },
                    {
                        "locationIndex": 1,
                        "time": 314
                    },
                    {
                        "locationIndex": 3,
                        "time": 314
                    },
                    {
                        "locationIndex": 5,
                        "time": 318
                    },
                    {
                        "locationIndex": 3,
                        "time": 334,
                        "type": "long",
                        "ends": 349
                    },
                    {
                        "locationIndex": 1,
                        "time": 338
                    },
                    {
                        "locationIndex": 4,
                        "time": 354,
                        "type": "long",
                        "ends": 369
                    },
                    {
                        "locationIndex": 2,
                        "time": 362,
                        "type": "long",
                        "ends": 377
                    },
                    {
                        "locationIndex": 1,
                        "time": 370,
                        "type": "long",
                        "ends": 385
                    },
                    {
                        "locationIndex": 3,
                        "time": 378
                    },
                    {
                        "locationIndex": 5,
                        "time": 378
                    },
                    {
                        "locationIndex": 0,
                        "time": 386,
                        "type": "long",
                        "ends": 401
                    },
                    {
                        "locationIndex": 3,
                        "time": 394
                    },
                    {
                        "locationIndex": 5,
                        "time": 394
                    },
                    {
                        "locationIndex": 4,
                        "time": 394
                    },
                    {
                        "locationIndex": 5,
                        "time": 418
                    },
                    {
                        "locationIndex": 4,
                        "time": 426
                    },
                    {
                        "locationIndex": 5,
                        "time": 434
                    },
                    {
                        "locationIndex": 1,
                        "time": 442
                    },
                    {
                        "locationIndex": 4,
                        "time": 442
                    },
                    {
                        "locationIndex": 0,
                        "time": 446
                    },
                    {
                        "locationIndex": 2,
                        "time": 450
                    },
                    {
                        "locationIndex": 4,
                        "time": 450
                    },
                    {
                        "locationIndex": 3,
                        "time": 458
                    },
                    {
                        "locationIndex": 5,
                        "time": 458
                    },
                    {
                        "locationIndex": 0,
                        "time": 466,
                        "type": "long",
                        "ends": 481
                    },
                    {
                        "locationIndex": 3,
                        "time": 474
                    },
                    {
                        "locationIndex": 4,
                        "time": 474
                    },
                    {
                        "locationIndex": 2,
                        "time": 482
                    },
                    {
                        "locationIndex": 1,
                        "time": 490
                    },
                    {
                        "locationIndex": 3,
                        "time": 490
                    },
                    {
                        "locationIndex": 2,
                        "time": 498
                    },
                    {
                        "locationIndex": 3,
                        "time": 502
                    },
                    {
                        "locationIndex": 5,
                        "time": 502
                    },
                    {
                        "locationIndex": 4,
                        "time": 506
                    },
                    {
                        "locationIndex": 2,
                        "time": 510
                    },
                    {
                        "locationIndex": 5,
                        "time": 510
                    },
                    {
                        "locationIndex": 1,
                        "time": 514
                    },
                    {
                        "locationIndex": 3,
                        "time": 514
                    },
                    {
                        "locationIndex": 2,
                        "time": 522
                    },
                    {
                        "locationIndex": 0,
                        "time": 526
                    },
                    {
                        "locationIndex": 4,
                        "time": 526
                    },
                    {
                        "locationIndex": 1,
                        "time": 530
                    },
                    {
                        "locationIndex": 0,
                        "time": 534
                    },
                    {
                        "locationIndex": 2,
                        "time": 534
                    },
                    {
                        "locationIndex": 4,
                        "time": 534
                    },
                    {
                        "locationIndex": 1,
                        "time": 538
                    },
                    {
                        "locationIndex": 0,
                        "time": 546
                    },
                    {
                        "locationIndex": 4,
                        "time": 546
                    },
                    {
                        "locationIndex": 2,
                        "time": 550
                    },
                    {
                        "locationIndex": 3,
                        "time": 550
                    },
                    {
                        "locationIndex": 5,
                        "time": 554
                    },
                    {
                        "locationIndex": 0,
                        "time": 558
                    },
                    {
                        "locationIndex": 1,
                        "time": 558
                    },
                    {
                        "locationIndex": 2,
                        "time": 562
                    },
                    {
                        "locationIndex": 5,
                        "time": 570
                    },
                    {
                        "locationIndex": 0,
                        "time": 570
                    },
                    {
                        "locationIndex": 3,
                        "time": 574,
                        "type": "long",
                        "ends": 589
                    },
                    {
                        "locationIndex": 1,
                        "time": 578
                    },
                    {
                        "locationIndex": 4,
                        "time": 578
                    },
                    {
                        "locationIndex": 2,
                        "time": 581
                    },
                    {
                        "locationIndex": 0,
                        "time": 586
                    },
                    {
                        "locationIndex": 1,
                        "time": 586
                    },
                    {
                        "locationIndex": 5,
                        "time": 594
                    },
                    {
                        "locationIndex": 4,
                        "time": 594
                    },
                    {
                        "locationIndex": 2,
                        "time": 602
                    },
                    {
                        "locationIndex": 5,
                        "time": 606
                    },
                    {
                        "locationIndex": 1,
                        "time": 606
                    },
                    {
                        "locationIndex": 2,
                        "time": 610,
                        "type": "long",
                        "ends": 625
                    },
                    {
                        "locationIndex": 3,
                        "time": 618
                    },
                    {
                        "locationIndex": 1,
                        "time": 618
                    },
                    {
                        "locationIndex": 4,
                        "time": 626
                    },
                    {
                        "locationIndex": 0,
                        "time": 626
                    },
                    {
                        "locationIndex": 1,
                        "time": 630
                    },
                    {
                        "locationIndex": 5,
                        "time": 630
                    },
                    {
                        "locationIndex": 0,
                        "time": 634
                    },
                    {
                        "locationIndex": 3,
                        "time": 638
                    },
                    {
                        "locationIndex": 5,
                        "time": 638
                    },
                    {
                        "locationIndex": 1,
                        "time": 642,
                        "type": "long",
                        "ends": 657
                    },
                    {
                        "locationIndex": 4,
                        "time": 650
                    },
                    {
                        "locationIndex": 0,
                        "time": 650
                    },
                    {
                        "locationIndex": 3,
                        "time": 655
                    },
                    {
                        "locationIndex": 4,
                        "time": 658
                    },
                    {
                        "locationIndex": 2,
                        "time": 658
                    },
                    {
                        "locationIndex": 3,
                        "time": 666
                    },
                    {
                        "locationIndex": 5,
                        "time": 674
                    },
                    {
                        "locationIndex": 4,
                        "time": 674
                    },
                    {
                        "locationIndex": 3,
                        "time": 682
                    },
                    {
                        "locationIndex": 0,
                        "time": 682
                    },
                    {
                        "locationIndex": 4,
                        "time": 690
                    },
                    {
                        "locationIndex": 5,
                        "time": 694
                    },
                    {
                        "locationIndex": 3,
                        "time": 694
                    },
                    {
                        "locationIndex": 4,
                        "time": 698
                    },
                    {
                        "locationIndex": 0,
                        "time": 698
                    },
                    {
                        "locationIndex": 5,
                        "time": 702
                    },
                    {
                        "locationIndex": 2,
                        "time": 706
                    },
                    {
                        "locationIndex": 3,
                        "time": 706
                    },
                    {
                        "locationIndex": 1,
                        "time": 711
                    },
                    {
                        "locationIndex": 0,
                        "time": 714
                    },
                    {
                        "locationIndex": 4,
                        "time": 714
                    },
                    {
                        "locationIndex": 5,
                        "time": 719,
                        "type": "long",
                        "ends": 734
                    },
                    {
                        "locationIndex": 1,
                        "time": 719,
                        "type": "long",
                        "ends": 734
                    },
                    {
                        "locationIndex": 3,
                        "time": 722
                    },
                    {
                        "locationIndex": 0,
                        "time": 730
                    },
                    {
                        "locationIndex": 4,
                        "time": 730
                    },
                    {
                        "locationIndex": 3,
                        "time": 738
                    },
                    {
                        "locationIndex": 2,
                        "time": 738
                    },
                    {
                        "locationIndex": 0,
                        "time": 746
                    },
                    {
                        "locationIndex": 3,
                        "time": 754
                    },
                    {
                        "locationIndex": 2,
                        "time": 754
                    },
                    {
                        "locationIndex": 5,
                        "time": 758
                    },
                    {
                        "locationIndex": 4,
                        "time": 758
                    },
                    {
                        "locationIndex": 0,
                        "time": 762
                    },
                    {
                        "locationIndex": 3,
                        "time": 762
                    },
                    {
                        "locationIndex": 2,
                        "time": 766
                    },
                    {
                        "locationIndex": 4,
                        "time": 770
                    },
                    {
                        "locationIndex": 1,
                        "time": 770
                    },
                    {
                        "locationIndex": 0,
                        "time": 778
                    },
                    {
                        "locationIndex": 3,
                        "time": 782
                    },
                    {
                        "locationIndex": 2,
                        "time": 782
                    },
                    {
                        "locationIndex": 1,
                        "time": 782
                    },
                    {
                        "locationIndex": 0,
                        "time": 786,
                        "type": "long",
                        "ends": 801
                    },
                    {
                        "locationIndex": 4,
                        "time": 790
                    },
                    {
                        "locationIndex": 3,
                        "time": 790
                    },
                    {
                        "locationIndex": 2,
                        "time": 794
                    },
                    {
                        "locationIndex": 4,
                        "time": 802
                    },
                    {
                        "locationIndex": 5,
                        "time": 802
                    },
                    {
                        "locationIndex": 1,
                        "time": 806
                    },
                    {
                        "locationIndex": 3,
                        "time": 810
                    },
                    {
                        "locationIndex": 2,
                        "time": 810
                    },
                    {
                        "locationIndex": 1,
                        "time": 818
                    },
                    {
                        "locationIndex": 3,
                        "time": 826
                    },
                    {
                        "locationIndex": 5,
                        "time": 826
                    },
                    {
                        "locationIndex": 0,
                        "time": 834,
                        "type": "long",
                        "ends": 849
                    },
                    {
                        "locationIndex": 1,
                        "time": 842
                    },
                    {
                        "locationIndex": 4,
                        "time": 842
                    },
                    {
                        "locationIndex": 5,
                        "time": 850
                    },
                    {
                        "locationIndex": 3,
                        "time": 850
                    },
                    {
                        "locationIndex": 4,
                        "time": 858
                    },
                    {
                        "locationIndex": 1,
                        "time": 858
                    },
                    {
                        "locationIndex": 2,
                        "time": 866,
                        "type": "long",
                        "ends": 881
                    },
                    {
                        "locationIndex": 3,
                        "time": 874
                    },
                    {
                        "locationIndex": 5,
                        "time": 874
                    },
                    {
                        "locationIndex": 1,
                        "time": 882
                    },
                    {
                        "locationIndex": 0,
                        "time": 882
                    },
                    {
                        "locationIndex": 5,
                        "time": 890,
                        "type": "long",
                        "ends": 905
                    },
                    {
                        "locationIndex": 0,
                        "time": 894
                    },
                    {
                        "locationIndex": 3,
                        "time": 894
                    },
                    {
                        "locationIndex": 1,
                        "time": 898
                    },
                    {
                        "locationIndex": 4,
                        "time": 898
                    },
                    {
                        "locationIndex": 3,
                        "time": 906
                    },
                    {
                        "locationIndex": 0,
                        "time": 910,
                        "type": "long",
                        "ends": 925
                    },
                    {
                        "locationIndex": 4,
                        "time": 910,
                        "type": "long",
                        "ends": 925
                    },
                    {
                        "locationIndex": 1,
                        "time": 914
                    },
                    {
                        "locationIndex": 2,
                        "time": 914
                    },
                    {
                        "locationIndex": 3,
                        "time": 922
                    },
                    {
                        "locationIndex": 2,
                        "time": 930
                    },
                    {
                        "locationIndex": 1,
                        "time": 938
                    },
                    {
                        "locationIndex": 3,
                        "time": 938
                    },
                    {
                        "locationIndex": 5,
                        "time": 946
                    },
                    {
                        "locationIndex": 2,
                        "time": 946
                    },
                    {
                        "locationIndex": 1,
                        "time": 954
                    },
                    {
                        "locationIndex": 4,
                        "time": 958
                    },
                    {
                        "locationIndex": 2,
                        "time": 958
                    },
                    {
                        "locationIndex": 3,
                        "time": 962
                    },
                    {
                        "locationIndex": 1,
                        "time": 966
                    },
                    {
                        "locationIndex": 0,
                        "time": 966
                    },
                    {
                        "locationIndex": 5,
                        "time": 970
                    },
                    {
                        "locationIndex": 0,
                        "time": 978
                    },
                    {
                        "locationIndex": 1,
                        "time": 978
                    },
                    {
                        "locationIndex": 2,
                        "time": 982
                    },
                    {
                        "locationIndex": 4,
                        "time": 982
                    },
                    {
                        "locationIndex": 0,
                        "time": 986
                    },
                    {
                        "locationIndex": 4,
                        "time": 994
                    },
                    {
                        "locationIndex": 5,
                        "time": 994
                    },
                    {
                        "locationIndex": 2,
                        "time": 998,
                        "type": "long",
                        "ends": 1013
                    },
                    {
                        "locationIndex": 1,
                        "time": 998,
                        "type": "long",
                        "ends": 1013
                    },
                    {
                        "locationIndex": 3,
                        "time": 1002
                    },
                    {
                        "locationIndex": 5,
                        "time": 1002
                    },
                    {
                        "locationIndex": 0,
                        "time": 1010,
                        "type": "long",
                        "ends": 1025
                    },
                    {
                        "locationIndex": 4,
                        "time": 1014
                    },
                    {
                        "locationIndex": 3,
                        "time": 1014
                    },
                    {
                        "locationIndex": 5,
                        "time": 1014
                    },
                    {
                        "locationIndex": 4,
                        "time": 1022
                    },
                    {
                        "locationIndex": 5,
                        "time": 1022
                    },
                    {
                        "locationIndex": 3,
                        "time": 1026
                    },
                    {
                        "locationIndex": 5,
                        "time": 1030,
                        "type": "long",
                        "ends": 1045
                    },
                    {
                        "locationIndex": 4,
                        "time": 1034
                    },
                    {
                        "locationIndex": 3,
                        "time": 1034
                    },
                    {
                        "locationIndex": 2,
                        "time": 1038
                    },
                    {
                        "locationIndex": 1,
                        "time": 1042
                    },
                    {
                        "locationIndex": 4,
                        "time": 1042
                    },
                    {
                        "locationIndex": 2,
                        "time": 1050
                    },
                    {
                        "locationIndex": 3,
                        "time": 1050
                    },
                    {
                        "locationIndex": 4,
                        "time": 1058
                    },
                    {
                        "locationIndex": 0,
                        "time": 1062
                    },
                    {
                        "locationIndex": 3,
                        "time": 1062
                    },
                    {
                        "locationIndex": 2,
                        "time": 1066
                    },
                    {
                        "locationIndex": 3,
                        "time": 1070
                    },
                    {
                        "locationIndex": 5,
                        "time": 1070
                    },
                    {
                        "locationIndex": 2,
                        "time": 1074
                    },
                    {
                        "locationIndex": 4,
                        "time": 1074
                    },
                    {
                        "locationIndex": 3,
                        "time": 1082
                    },
                    {
                        "locationIndex": 5,
                        "time": 1090
                    },
                    {
                        "locationIndex": 1,
                        "time": 1090
                    },
                    {
                        "locationIndex": 0,
                        "time": 1098
                    },
                    {
                        "locationIndex": 5,
                        "time": 1103
                    },
                    {
                        "locationIndex": 4,
                        "time": 1103
                    },
                    {
                        "locationIndex": 2,
                        "time": 1106
                    },
                    {
                        "locationIndex": 0,
                        "time": 1114
                    },
                    {
                        "locationIndex": 4,
                        "time": 1114
                    },
                    {
                        "locationIndex": 3,
                        "time": 1118
                    },
                    {
                        "locationIndex": 5,
                        "time": 1122
                    },
                    {
                        "locationIndex": 0,
                        "time": 1122
                    },
                    {
                        "locationIndex": 2,
                        "time": 1122
                    },
                    {
                        "locationIndex": 3,
                        "time": 1130
                    },
                    {
                        "locationIndex": 4,
                        "time": 1130
                    },
                    {
                        "locationIndex": 0,
                        "time": 1138
                    },
                    {
                        "locationIndex": 2,
                        "time": 1146
                    },
                    {
                        "locationIndex": 1,
                        "time": 1146
                    },
                    {
                        "locationIndex": 3,
                        "time": 1154
                    },
                    {
                        "locationIndex": 0,
                        "time": 1154
                    },
                    {
                        "locationIndex": 4,
                        "time": 1162
                    },
                    {
                        "locationIndex": 1,
                        "time": 1170,
                        "type": "long",
                        "ends": 1185
                    },
                    {
                        "locationIndex": 0,
                        "time": 1170,
                        "type": "long",
                        "ends": 1185
                    },
                    {
                        "locationIndex": 4,
                        "time": 1178
                    },
                    {
                        "locationIndex": 5,
                        "time": 1178
                    },
                    {
                        "locationIndex": 2,
                        "time": 1186,
                        "type": "long",
                        "ends": 1201
                    },
                    {
                        "locationIndex": 5,
                        "time": 1191
                    },
                    {
                        "locationIndex": 3,
                        "time": 1194
                    },
                    {
                        "locationIndex": 4,
                        "time": 1194
                    },
                    {
                        "locationIndex": 5,
                        "time": 1200
                    },
                    {
                        "locationIndex": 4,
                        "time": 1202
                    },
                    {
                        "locationIndex": 3,
                        "time": 1202
                    },
                    {
                        "locationIndex": 5,
                        "time": 1202
                    },
                    {
                        "locationIndex": 1,
                        "time": 1210
                    },
                    {
                        "locationIndex": 5,
                        "time": 1210
                    },
                    {
                        "locationIndex": 3,
                        "time": 1216
                    },
                    {
                        "locationIndex": 4,
                        "time": 1216
                    },
                    {
                        "locationIndex": 5,
                        "time": 1218
                    },
                    {
                        "locationIndex": 0,
                        "time": 1218
                    },
                    {
                        "locationIndex": 3,
                        "time": 1226
                    },
                    {
                        "locationIndex": 4,
                        "time": 1226
                    },
                    {
                        "locationIndex": 0,
                        "time": 1232
                    },
                    {
                        "locationIndex": 4,
                        "time": 1234
                    },
                    {
                        "locationIndex": 3,
                        "time": 1242
                    },
                    {
                        "locationIndex": 0,
                        "time": 1242
                    },
                    {
                        "locationIndex": 4,
                        "time": 1250
                    },
                    {
                        "locationIndex": 2,
                        "time": 1250
                    },
                    {
                        "locationIndex": 1,
                        "time": 1258
                    },
                    {
                        "locationIndex": 3,
                        "time": 1258
                    },
                    {
                        "locationIndex": 2,
                        "time": 1266,
                        "type": "long",
                        "ends": 1281
                    },
                    {
                        "locationIndex": 3,
                        "time": 1271
                    },
                    {
                        "locationIndex": 4,
                        "time": 1271
                    },
                    {
                        "locationIndex": 5,
                        "time": 1274
                    },
                    {
                        "locationIndex": 1,
                        "time": 1274
                    },
                    {
                        "locationIndex": 3,
                        "time": 1274
                    },
                    {
                        "locationIndex": 4,
                        "time": 1279
                    },
                    {
                        "locationIndex": 5,
                        "time": 1282
                    },
                    {
                        "locationIndex": 0,
                        "time": 1282
                    },
                    {
                        "locationIndex": 1,
                        "time": 1290
                    },
                    {
                        "locationIndex": 0,
                        "time": 1298
                    },
                    {
                        "locationIndex": 5,
                        "time": 1298
                    },
                    {
                        "locationIndex": 3,
                        "time": 1306
                    },
                    {
                        "locationIndex": 1,
                        "time": 1306
                    },
                    {
                        "locationIndex": 5,
                        "time": 1312
                    },
                    {
                        "locationIndex": 2,
                        "time": 1314
                    },
                    {
                        "locationIndex": 4,
                        "time": 1319
                    },
                    {
                        "locationIndex": 1,
                        "time": 1322
                    },
                    {
                        "locationIndex": 0,
                        "time": 1322
                    },
                    {
                        "locationIndex": 4,
                        "time": 1330
                    },
                    {
                        "locationIndex": 5,
                        "time": 1335
                    },
                    {
                        "locationIndex": 3,
                        "time": 1335
                    },
                    {
                        "locationIndex": 0,
                        "time": 1338
                    },
                    {
                        "locationIndex": 1,
                        "time": 1344
                    },
                    {
                        "locationIndex": 4,
                        "time": 1344
                    },
                    {
                        "locationIndex": 3,
                        "time": 1346
                    },
                    {
                        "locationIndex": 2,
                        "time": 1354
                    },
                    {
                        "locationIndex": 1,
                        "time": 1354
                    },
                    {
                        "locationIndex": 5,
                        "time": 1362
                    },
                    {
                        "locationIndex": 3,
                        "time": 1362
                    },
                    {
                        "locationIndex": 0,
                        "time": 1367
                    },
                    {
                        "locationIndex": 5,
                        "time": 1369
                    },
                    {
                        "locationIndex": 4,
                        "time": 1378
                    },
                    {
                        "locationIndex": 0,
                        "time": 1378
                    },
                    {
                        "locationIndex": 3,
                        "time": 1386
                    },
                    {
                        "locationIndex": 1,
                        "time": 1394
                    },
                    {
                        "locationIndex": 2,
                        "time": 1394
                    },
                    {
                        "locationIndex": 4,
                        "time": 1399,
                        "type": "long",
                        "ends": 1414
                    },
                    {
                        "locationIndex": 5,
                        "time": 1399,
                        "type": "long",
                        "ends": 1414
                    },
                    {
                        "locationIndex": 3,
                        "time": 1402
                    },
                    {
                        "locationIndex": 1,
                        "time": 1407
                    },
                    {
                        "locationIndex": 0,
                        "time": 1407
                    },
                    {
                        "locationIndex": 3,
                        "time": 1410
                    },
                    {
                        "locationIndex": 2,
                        "time": 1418
                    },
                    {
                        "locationIndex": 1,
                        "time": 1418
                    },
                    {
                        "locationIndex": 3,
                        "time": 1426
                    },
                    {
                        "locationIndex": 0,
                        "time": 1426
                    },
                    {
                        "locationIndex": 2,
                        "time": 1434
                    },
                    {
                        "locationIndex": 1,
                        "time": 1434
                    },
                    {
                        "locationIndex": 4,
                        "time": 1442
                    },
                    {
                        "locationIndex": 0,
                        "time": 1442
                    },
                    {
                        "locationIndex": 3,
                        "time": 1450
                    },
                    {
                        "locationIndex": 5,
                        "time": 1458
                    },
                    {
                        "locationIndex": 0,
                        "time": 1458
                    },
                    {
                        "locationIndex": 4,
                        "time": 1463
                    },
                    {
                        "locationIndex": 3,
                        "time": 1466
                    },
                    {
                        "locationIndex": 0,
                        "time": 1466
                    },
                    {
                        "locationIndex": 5,
                        "time": 1474
                    },
                    {
                        "locationIndex": 2,
                        "time": 1482
                    },
                    {
                        "locationIndex": 0,
                        "time": 1482
                    },
                    {
                        "locationIndex": 3,
                        "time": 1490
                    },
                    {
                        "locationIndex": 4,
                        "time": 1490
                    },
                    {
                        "locationIndex": 0,
                        "time": 1498
                    },
                    {
                        "locationIndex": 5,
                        "time": 1506
                    },
                    {
                        "locationIndex": 1,
                        "time": 1506
                    },
                    {
                        "locationIndex": 3,
                        "time": 1514
                    },
                    {
                        "locationIndex": 0,
                        "time": 1522
                    },
                    {
                        "locationIndex": 1,
                        "time": 1522
                    },
                    {
                        "locationIndex": 5,
                        "time": 1527
                    },
                    {
                        "locationIndex": 2,
                        "time": 1527
                    },
                    {
                        "locationIndex": 1,
                        "time": 1530
                    },
                    {
                        "locationIndex": 4,
                        "time": 1535
                    },
                    {
                        "locationIndex": 3,
                        "time": 1535
                    },
                    {
                        "locationIndex": 0,
                        "time": 1538,
                        "type": "long",
                        "ends": 1553
                    },
                    {
                        "locationIndex": 3,
                        "time": 1546
                    },
                    {
                        "locationIndex": 1,
                        "time": 1546
                    },
                    {
                        "locationIndex": 5,
                        "time": 1546
                    },
                    {
                        "locationIndex": 4,
                        "time": 1554,
                        "type": "long",
                        "ends": 1569
                    },
                    {
                        "locationIndex": 3,
                        "time": 1562
                    },
                    {
                        "locationIndex": 2,
                        "time": 1562
                    },
                    {
                        "locationIndex": 5,
                        "time": 1570
                    },
                    {
                        "locationIndex": 1,
                        "time": 1570
                    },
                    {
                        "locationIndex": 3,
                        "time": 1578
                    },
                    {
                        "locationIndex": 0,
                        "time": 1586
                    },
                    {
                        "locationIndex": 2,
                        "time": 1586
                    },
                    {
                        "locationIndex": 5,
                        "time": 1591
                    },
                    {
                        "locationIndex": 0,
                        "time": 1594
                    },
                    {
                        "locationIndex": 1,
                        "time": 1594
                    },
                    {
                        "locationIndex": 5,
                        "time": 1602
                    },
                    {
                        "locationIndex": 3,
                        "time": 1610
                    },
                    {
                        "locationIndex": 4,
                        "time": 1610
                    },
                    {
                        "locationIndex": 5,
                        "time": 1618,
                        "type": "long",
                        "ends": 1633
                    },
                    {
                        "locationIndex": 4,
                        "time": 1626,
                        "type": "long",
                        "ends": 1641
                    },
                    {
                        "locationIndex": 2,
                        "time": 1626,
                        "type": "long",
                        "ends": 1641
                    },
                    {
                        "locationIndex": 3,
                        "time": 1631
                    },
                    {
                        "locationIndex": 0,
                        "time": 1634
                    },
                    {
                        "locationIndex": 1,
                        "time": 1634
                    },
                    {
                        "locationIndex": 3,
                        "time": 1642
                    },
                    {
                        "locationIndex": 1,
                        "time": 1650
                    },
                    {
                        "locationIndex": 0,
                        "time": 1650
                    },
                    {
                        "locationIndex": 3,
                        "time": 1654
                    },
                    {
                        "locationIndex": 5,
                        "time": 1658
                    },
                    {
                        "locationIndex": 1,
                        "time": 1658
                    },
                    {
                        "locationIndex": 0,
                        "time": 1662
                    },
                    {
                        "locationIndex": 4,
                        "time": 1664
                    },
                    {
                        "locationIndex": 5,
                        "time": 1664
                    },
                    {
                        "locationIndex": 3,
                        "time": 1666
                    },
                    {
                        "locationIndex": 1,
                        "time": 1666
                    },
                    {
                        "locationIndex": 4,
                        "time": 1670
                    },
                    {
                        "locationIndex": 5,
                        "time": 1670
                    },
                    {
                        "locationIndex": 3,
                        "time": 1674
                    },
                    {
                        "locationIndex": 4,
                        "time": 1678
                    },
                    {
                        "locationIndex": 0,
                        "time": 1678
                    },
                    {
                        "locationIndex": 3,
                        "time": 1682,
                        "type": "long",
                        "ends": 1697
                    },
                    {
                        "locationIndex": 1,
                        "time": 1686
                    },
                    {
                        "locationIndex": 4,
                        "time": 1686
                    },
                    {
                        "locationIndex": 2,
                        "time": 1690
                    },
                    {
                        "locationIndex": 5,
                        "time": 1690
                    },
                    {
                        "locationIndex": 4,
                        "time": 1694
                    },
                    {
                        "locationIndex": 5,
                        "time": 1698
                    },
                    {
                        "locationIndex": 1,
                        "time": 1698
                    },
                    {
                        "locationIndex": 2,
                        "time": 1702
                    },
                    {
                        "locationIndex": 0,
                        "time": 1706
                    },
                    {
                        "locationIndex": 5,
                        "time": 1706
                    },
                    {
                        "locationIndex": 4,
                        "time": 1710
                    },
                    {
                        "locationIndex": 1,
                        "time": 1710
                    },
                    {
                        "locationIndex": 5,
                        "time": 1714
                    },
                    {
                        "locationIndex": 4,
                        "time": 1718
                    },
                    {
                        "locationIndex": 0,
                        "time": 1718
                    },
                    {
                        "locationIndex": 1,
                        "time": 1722
                    },
                    {
                        "locationIndex": 2,
                        "time": 1722
                    },
                    {
                        "locationIndex": 4,
                        "time": 1726
                    },
                    {
                        "locationIndex": 0,
                        "time": 1726
                    },
                    {
                        "locationIndex": 1,
                        "time": 1730
                    },
                    {
                        "locationIndex": 4,
                        "time": 1734
                    },
                    {
                        "locationIndex": 3,
                        "time": 1734
                    },
                    {
                        "locationIndex": 1,
                        "time": 1738
                    },
                    {
                        "locationIndex": 3,
                        "time": 1742
                    },
                    {
                        "locationIndex": 0,
                        "time": 1742
                    },
                    {
                        "locationIndex": 2,
                        "time": 1746
                    },
                    {
                        "locationIndex": 5,
                        "time": 1746
                    },
                    {
                        "locationIndex": 3,
                        "time": 1754
                    },
                    {
                        "locationIndex": 5,
                        "time": 1762
                    },
                    {
                        "locationIndex": 2,
                        "time": 1762
                    },
                    {
                        "locationIndex": 3,
                        "time": 1764
                    },
                    {
                        "locationIndex": 0,
                        "time": 1764
                    },
                    {
                        "locationIndex": 2,
                        "time": 1770
                    },
                    {
                        "locationIndex": 4,
                        "time": 1772
                    },
                    {
                        "locationIndex": 1,
                        "time": 1772
                    },
                    {
                        "locationIndex": 3,
                        "time": 1772
                    },
                    {
                        "locationIndex": 0,
                        "time": 1778
                    },
                    {
                        "locationIndex": 2,
                        "time": 1778
                    },
                    {
                        "locationIndex": 5,
                        "time": 1782
                    },
                    {
                        "locationIndex": 3,
                        "time": 1786
                    },
                    {
                        "locationIndex": 4,
                        "time": 1786
                    },
                    {
                        "locationIndex": 5,
                        "time": 1790
                    },
                    {
                        "locationIndex": 0,
                        "time": 1794
                    },
                    {
                        "locationIndex": 4,
                        "time": 1794
                    },
                    {
                        "locationIndex": 3,
                        "time": 1794
                    },
                    {
                        "locationIndex": 2,
                        "time": 1798
                    },
                    {
                        "locationIndex": 1,
                        "time": 1798
                    },
                    {
                        "locationIndex": 0,
                        "time": 1802
                    },
                    {
                        "locationIndex": 1,
                        "time": 1806
                    },
                    {
                        "locationIndex": 5,
                        "time": 1806
                    },
                    {
                        "locationIndex": 2,
                        "time": 1810
                    },
                    {
                        "locationIndex": 0,
                        "time": 1810
                    },
                    {
                        "locationIndex": 4,
                        "time": 1814
                    },
                    {
                        "locationIndex": 5,
                        "time": 1814
                    },
                    {
                        "locationIndex": 2,
                        "time": 1818,
                        "type": "long",
                        "ends": 1833
                    },
                    {
                        "locationIndex": 1,
                        "time": 1822
                    },
                    {
                        "locationIndex": 3,
                        "time": 1822
                    },
                    {
                        "locationIndex": 4,
                        "time": 1826
                    },
                    {
                        "locationIndex": 3,
                        "time": 1830
                    },
                    {
                        "locationIndex": 1,
                        "time": 1830
                    },
                    {
                        "locationIndex": 0,
                        "time": 1834
                    },
                    {
                        "locationIndex": 3,
                        "time": 1838
                    },
                    {
                        "locationIndex": 1,
                        "time": 1838
                    },
                    {
                        "locationIndex": 0,
                        "time": 1846
                    },
                    {
                        "locationIndex": 1,
                        "time": 1858
                    },
                    {
                        "locationIndex": 3,
                        "time": 1858
                    },
                    {
                        "locationIndex": 0,
                        "time": 1862
                    },
                    {
                        "locationIndex": 5,
                        "time": 1862
                    },
                    {
                        "locationIndex": 1,
                        "time": 1866
                    },
                    {
                        "locationIndex": 3,
                        "time": 1870
                    },
                    {
                        "locationIndex": 4,
                        "time": 1870
                    },
                    {
                        "locationIndex": 0,
                        "time": 1874,
                        "type": "long",
                        "ends": 1889
                    },
                    {
                        "locationIndex": 3,
                        "time": 1878
                    },
                    {
                        "locationIndex": 1,
                        "time": 1878
                    },
                    {
                        "locationIndex": 2,
                        "time": 1882
                    },
                    {
                        "locationIndex": 4,
                        "time": 1882
                    },
                    {
                        "locationIndex": 3,
                        "time": 1886
                    },
                    {
                        "locationIndex": 4,
                        "time": 1890
                    },
                    {
                        "locationIndex": 1,
                        "time": 1890
                    },
                    {
                        "locationIndex": 2,
                        "time": 1894
                    },
                    {
                        "locationIndex": 5,
                        "time": 1894
                    },
                    {
                        "locationIndex": 3,
                        "time": 1898
                    },
                    {
                        "locationIndex": 4,
                        "time": 1902
                    },
                    {
                        "locationIndex": 5,
                        "time": 1902
                    },
                    {
                        "locationIndex": 1,
                        "time": 1906
                    },
                    {
                        "locationIndex": 2,
                        "time": 1906
                    },
                    {
                        "locationIndex": 5,
                        "time": 1910
                    },
                    {
                        "locationIndex": 2,
                        "time": 1914
                    },
                    {
                        "locationIndex": 1,
                        "time": 1914
                    },
                    {
                        "locationIndex": 3,
                        "time": 1916
                    },
                    {
                        "locationIndex": 4,
                        "time": 1918
                    },
                    {
                        "locationIndex": 1,
                        "time": 1918
                    },
                    {
                        "locationIndex": 0,
                        "time": 1922
                    },
                    {
                        "locationIndex": 2,
                        "time": 1922
                    },
                    {
                        "locationIndex": 3,
                        "time": 1926
                    },
                    {
                        "locationIndex": 1,
                        "time": 1930
                    },
                    {
                        "locationIndex": 2,
                        "time": 1930
                    },
                    {
                        "locationIndex": 0,
                        "time": 1934
                    },
                    {
                        "locationIndex": 5,
                        "time": 1934
                    },
                    {
                        "locationIndex": 1,
                        "time": 1938,
                        "type": "long",
                        "ends": 1953
                    },
                    {
                        "locationIndex": 3,
                        "time": 1942
                    },
                    {
                        "locationIndex": 0,
                        "time": 1942
                    },
                    {
                        "locationIndex": 5,
                        "time": 1946,
                        "type": "long",
                        "ends": 1961
                    },
                    {
                        "locationIndex": 3,
                        "time": 1950
                    },
                    {
                        "locationIndex": 0,
                        "time": 1950
                    },
                    {
                        "locationIndex": 2,
                        "time": 1954
                    },
                    {
                        "locationIndex": 4,
                        "time": 1954
                    },
                    {
                        "locationIndex": 3,
                        "time": 1957
                    },
                    {
                        "locationIndex": 2,
                        "time": 1962
                    },
                    {
                        "locationIndex": 0,
                        "time": 1962
                    },
                    {
                        "locationIndex": 4,
                        "time": 1966
                    },
                    {
                        "locationIndex": 3,
                        "time": 1970
                    },
                    {
                        "locationIndex": 0,
                        "time": 1970
                    },
                    {
                        "locationIndex": 2,
                        "time": 1974
                    },
                    {
                        "locationIndex": 4,
                        "time": 1974
                    },
                    {
                        "locationIndex": 0,
                        "time": 1978
                    },
                    {
                        "locationIndex": 1,
                        "time": 1978
                    },
                    {
                        "locationIndex": 2,
                        "time": 1982
                    },
                    {
                        "locationIndex": 5,
                        "time": 1986
                    },
                    {
                        "locationIndex": 0,
                        "time": 1986
                    },
                    {
                        "locationIndex": 4,
                        "time": 1986
                    },
                    {
                        "locationIndex": 1,
                        "time": 1990
                    },
                    {
                        "locationIndex": 3,
                        "time": 1990
                    },
                    {
                        "locationIndex": 5,
                        "time": 1994
                    },
                    {
                        "locationIndex": 3,
                        "time": 1998
                    },
                    {
                        "locationIndex": 0,
                        "time": 1998
                    },
                    {
                        "locationIndex": 4,
                        "time": 2002
                    },
                    {
                        "locationIndex": 1,
                        "time": 2002
                    },
                    {
                        "locationIndex": 3,
                        "time": 2006,
                        "type": "long",
                        "ends": 2021
                    },
                    {
                        "locationIndex": 5,
                        "time": 2010
                    },
                    {
                        "locationIndex": 1,
                        "time": 2010
                    },
                    {
                        "locationIndex": 0,
                        "time": 2014
                    },
                    {
                        "locationIndex": 2,
                        "time": 2018
                    },
                    {
                        "locationIndex": 5,
                        "time": 2018
                    },
                    {
                        "locationIndex": 0,
                        "time": 2026
                    },
                    {
                        "locationIndex": 1,
                        "time": 2026
                    },
                    {
                        "locationIndex": 2,
                        "time": 2034
                    },
                    {
                        "locationIndex": 5,
                        "time": 2038
                    },
                    {
                        "locationIndex": 4,
                        "time": 2038
                    },
                    {
                        "locationIndex": 2,
                        "time": 2042
                    },
                    {
                        "locationIndex": 1,
                        "time": 2046
                    },
                    {
                        "locationIndex": 0,
                        "time": 2046
                    },
                    {
                        "locationIndex": 5,
                        "time": 2050
                    },
                    {
                        "locationIndex": 3,
                        "time": 2050
                    },
                    {
                        "locationIndex": 4,
                        "time": 2050
                    },
                    {
                        "locationIndex": 1,
                        "time": 2054
                    },
                    {
                        "locationIndex": 0,
                        "time": 2054
                    },
                    {
                        "locationIndex": 5,
                        "time": 2058
                    },
                    {
                        "locationIndex": 0,
                        "time": 2062
                    },
                    {
                        "locationIndex": 3,
                        "time": 2062
                    },
                    {
                        "locationIndex": 1,
                        "time": 2066
                    },
                    {
                        "locationIndex": 3,
                        "time": 2074
                    },
                    {
                        "locationIndex": 4,
                        "time": 2074
                    },
                    {
                        "locationIndex": 1,
                        "time": 2078
                    },
                    {
                        "locationIndex": 5,
                        "time": 2078
                    },
                    {
                        "locationIndex": 3,
                        "time": 2082
                    },
                    {
                        "locationIndex": 1,
                        "time": 2086
                    },
                    {
                        "locationIndex": 0,
                        "time": 2086
                    },
                    {
                        "locationIndex": 2,
                        "time": 2090
                    },
                    {
                        "locationIndex": 0,
                        "time": 2099
                    },
                    {
                        "locationIndex": 3,
                        "time": 2099
                    },
                    {
                        "locationIndex": 1,
                        "time": 2102
                    },
                    {
                        "locationIndex": 4,
                        "time": 2107
                    },
                    {
                        "locationIndex": 5,
                        "time": 2107
                    },
                    {
                        "locationIndex": 1,
                        "time": 2110
                    },
                    {
                        "locationIndex": 4,
                        "time": 2114
                    },
                    {
                        "locationIndex": 0,
                        "time": 2114
                    },
                    {
                        "locationIndex": 1,
                        "time": 2118
                    },
                    {
                        "locationIndex": 3,
                        "time": 2122
                    },
                    {
                        "locationIndex": 0,
                        "time": 2122
                    },
                    {
                        "locationIndex": 1,
                        "time": 2126
                    },
                    {
                        "locationIndex": 5,
                        "time": 2126
                    },
                    {
                        "locationIndex": 0,
                        "time": 2130
                    },
                    {
                        "locationIndex": 1,
                        "time": 2134
                    },
                    {
                        "locationIndex": 2,
                        "time": 2134
                    },
                    {
                        "locationIndex": 4,
                        "time": 2138
                    },
                    {
                        "locationIndex": 0,
                        "time": 2138
                    },
                    {
                        "locationIndex": 1,
                        "time": 2142
                    },
                    {
                        "locationIndex": 3,
                        "time": 2146
                    },
                    {
                        "locationIndex": 0,
                        "time": 2146
                    },
                    {
                        "locationIndex": 4,
                        "time": 2146
                    },
                    {
                        "locationIndex": 5,
                        "time": 2150
                    },
                    {
                        "locationIndex": 1,
                        "time": 2150
                    },
                    {
                        "locationIndex": 2,
                        "time": 2150
                    },
                    {
                        "locationIndex": 0,
                        "time": 2154
                    },
                    {
                        "locationIndex": 4,
                        "time": 2154
                    },
                    {
                        "locationIndex": 1,
                        "time": 2158
                    },
                    {
                        "locationIndex": 4,
                        "time": 2162
                    },
                    {
                        "locationIndex": 5,
                        "time": 2162
                    },
                    {
                        "locationIndex": 3,
                        "time": 2168
                    },
                    {
                        "locationIndex": 0,
                        "time": 2168
                    },
                    {
                        "locationIndex": 4,
                        "time": 2170
                    },
                    {
                        "locationIndex": 1,
                        "time": 2174
                    },
                    {
                        "locationIndex": 5,
                        "time": 2174
                    },
                    {
                        "locationIndex": 3,
                        "time": 2174
                    },
                    {
                        "locationIndex": 4,
                        "time": 2176
                    },
                    {
                        "locationIndex": 5,
                        "time": 2178
                    },
                    {
                        "locationIndex": 3,
                        "time": 2178
                    },
                    {
                        "locationIndex": 1,
                        "time": 2182
                    },
                    {
                        "locationIndex": 0,
                        "time": 2182
                    },
                    {
                        "locationIndex": 2,
                        "time": 2186
                    },
                    {
                        "locationIndex": 3,
                        "time": 2190
                    },
                    {
                        "locationIndex": 0,
                        "time": 2190
                    },
                    {
                        "locationIndex": 5,
                        "time": 2194
                    },
                    {
                        "locationIndex": 2,
                        "time": 2194
                    },
                    {
                        "locationIndex": 3,
                        "time": 2198
                    },
                    {
                        "locationIndex": 1,
                        "time": 2198
                    },
                    {
                        "locationIndex": 2,
                        "time": 2202
                    },
                    {
                        "locationIndex": 3,
                        "time": 2206
                    },
                    {
                        "locationIndex": 4,
                        "time": 2206
                    },
                    {
                        "locationIndex": 0,
                        "time": 2210,
                        "type": "long",
                        "ends": 2225
                    },
                    {
                        "locationIndex": 5,
                        "time": 2214
                    },
                    {
                        "locationIndex": 4,
                        "time": 2214
                    },
                    {
                        "locationIndex": 2,
                        "time": 2218
                    },
                    {
                        "locationIndex": 5,
                        "time": 2222
                    },
                    {
                        "locationIndex": 4,
                        "time": 2222
                    },
                    {
                        "locationIndex": 1,
                        "time": 2226
                    },
                    {
                        "locationIndex": 2,
                        "time": 2226
                    },
                    {
                        "locationIndex": 5,
                        "time": 2230
                    },
                    {
                        "locationIndex": 4,
                        "time": 2230
                    },
                    {
                        "locationIndex": 3,
                        "time": 2234
                    },
                    {
                        "locationIndex": 1,
                        "time": 2238
                    },
                    {
                        "locationIndex": 5,
                        "time": 2238
                    },
                    {
                        "locationIndex": 3,
                        "time": 2242
                    },
                    {
                        "locationIndex": 4,
                        "time": 2246
                    },
                    {
                        "locationIndex": 1,
                        "time": 2246
                    },
                    {
                        "locationIndex": 2,
                        "time": 2250
                    },
                    {
                        "locationIndex": 3,
                        "time": 2250
                    },
                    {
                        "locationIndex": 1,
                        "time": 2254
                    },
                    {
                        "locationIndex": 2,
                        "time": 2258
                    },
                    {
                        "locationIndex": 0,
                        "time": 2258
                    },
                    {
                        "locationIndex": 5,
                        "time": 2262
                    },
                    {
                        "locationIndex": 3,
                        "time": 2266
                    },
                    {
                        "locationIndex": 0,
                        "time": 2266
                    },
                    {
                        "locationIndex": 2,
                        "time": 2270,
                        "type": "long",
                        "ends": 2285
                    },
                    {
                        "locationIndex": 5,
                        "time": 2270,
                        "type": "long",
                        "ends": 2285
                    },
                    {
                        "locationIndex": 0,
                        "time": 2274
                    },
                    {
                        "locationIndex": 1,
                        "time": 2274
                    },
                    {
                        "locationIndex": 3,
                        "time": 2278
                    },
                    {
                        "locationIndex": 4,
                        "time": 2282
                    },
                    {
                        "locationIndex": 0,
                        "time": 2282
                    },
                    {
                        "locationIndex": 1,
                        "time": 2286,
                        "type": "long",
                        "ends": 2301
                    },
                    {
                        "locationIndex": 3,
                        "time": 2286,
                        "type": "long",
                        "ends": 2301
                    },
                    {
                        "locationIndex": 4,
                        "time": 2290
                    },
                    {
                        "locationIndex": 0,
                        "time": 2290
                    },
                    {
                        "locationIndex": 0,
                        "time": 2298
                    },
                    {
                        "locationIndex": 4,
                        "time": 2298
                    },
                    {
                        "locationIndex": 4,
                        "time": 2302,
                        "type": "long",
                        "ends": 2317
                    },
                    {
                        "locationIndex": 0,
                        "time": 2306
                    },
                    {
                        "locationIndex": 5,
                        "time": 2310
                    },
                    {
                        "locationIndex": 2,
                        "time": 2310
                    },
                    {
                        "locationIndex": 0,
                        "time": 2314
                    },
                    {
                        "locationIndex": 2,
                        "time": 2318
                    },
                    {
                        "locationIndex": 5,
                        "time": 2318
                    },
                    {
                        "locationIndex": 0,
                        "time": 2322
                    },
                    {
                        "locationIndex": 5,
                        "time": 2326
                    },
                    {
                        "locationIndex": 1,
                        "time": 2326
                    },
                    {
                        "locationIndex": 0,
                        "time": 2330
                    },
                    {
                        "locationIndex": 3,
                        "time": 2330
                    },
                    {
                        "locationIndex": 1,
                        "time": 2334,
                        "type": "long",
                        "ends": 2349
                    },
                    {
                        "locationIndex": 2,
                        "time": 2338
                    },
                    {
                        "locationIndex": 3,
                        "time": 2338
                    },
                    {
                        "locationIndex": 0,
                        "time": 2338
                    },
                    {
                        "locationIndex": 4,
                        "time": 2342
                    },
                    {
                        "locationIndex": 5,
                        "time": 2342
                    },
                    {
                        "locationIndex": 0,
                        "time": 2346
                    },
                    {
                        "locationIndex": 2,
                        "time": 2350
                    },
                    {
                        "locationIndex": 4,
                        "time": 2350
                    },
                    {
                        "locationIndex": 0,
                        "time": 2354
                    },
                    {
                        "locationIndex": 5,
                        "time": 2354
                    },
                    {
                        "locationIndex": 4,
                        "time": 2358
                    },
                    {
                        "locationIndex": 5,
                        "time": 2362
                    },
                    {
                        "locationIndex": 0,
                        "time": 2362
                    },
                    {
                        "locationIndex": 2,
                        "time": 2362
                    },
                    {
                        "locationIndex": 4,
                        "time": 2366
                    },
                    {
                        "locationIndex": 3,
                        "time": 2366
                    },
                    {
                        "locationIndex": 0,
                        "time": 2366
                    },
                    {
                        "locationIndex": 2,
                        "time": 2370
                    },
                    {
                        "locationIndex": 5,
                        "time": 2374
                    },
                    {
                        "locationIndex": 1,
                        "time": 2374
                    },
                    {
                        "locationIndex": 2,
                        "time": 2378
                    },
                    {
                        "locationIndex": 1,
                        "time": 2382
                    },
                    {
                        "locationIndex": 4,
                        "time": 2382
                    },
                    {
                        "locationIndex": 5,
                        "time": 2382
                    },
                    {
                        "locationIndex": 3,
                        "time": 2386
                    },
                    {
                        "locationIndex": 2,
                        "time": 2386
                    },
                    {
                        "locationIndex": 1,
                        "time": 2390
                    },
                    {
                        "locationIndex": 4,
                        "time": 2390
                    },
                    {
                        "locationIndex": 0,
                        "time": 2394
                    },
                    {
                        "locationIndex": 4,
                        "time": 2398
                    },
                    {
                        "locationIndex": 5,
                        "time": 2398
                    },
                    {
                        "locationIndex": 2,
                        "time": 2398
                    },
                    {
                        "locationIndex": 0,
                        "time": 2402
                    },
                    {
                        "locationIndex": 2,
                        "time": 2406
                    },
                    {
                        "locationIndex": 5,
                        "time": 2406
                    },
                    {
                        "locationIndex": 3,
                        "time": 2410
                    },
                    {
                        "locationIndex": 5,
                        "time": 2414
                    },
                    {
                        "locationIndex": 0,
                        "time": 2414
                    },
                    {
                        "locationIndex": 1,
                        "time": 2418
                    },
                    {
                        "locationIndex": 2,
                        "time": 2418
                    },
                    {
                        "locationIndex": 0,
                        "time": 2426
                    },
                    {
                        "locationIndex": 5,
                        "time": 2430
                    },
                    {
                        "locationIndex": 1,
                        "time": 2430
                    },
                    {
                        "locationIndex": 2,
                        "time": 2432
                    },
                    {
                        "locationIndex": 1,
                        "time": 2434
                    },
                    {
                        "locationIndex": 4,
                        "time": 2434
                    },
                    {
                        "locationIndex": 3,
                        "time": 2434
                    },
                    {
                        "locationIndex": 2,
                        "time": 2438
                    },
                    {
                        "locationIndex": 4,
                        "time": 2442
                    },
                    {
                        "locationIndex": 5,
                        "time": 2442
                    },
                    {
                        "locationIndex": 0,
                        "time": 2446
                    },
                    {
                        "locationIndex": 3,
                        "time": 2454
                    },
                    {
                        "locationIndex": 5,
                        "time": 2458
                    },
                    {
                        "locationIndex": 3,
                        "time": 2466
                    },
                    {
                        "locationIndex": 4,
                        "time": 2466
                    },
                    {
                        "locationIndex": 5,
                        "time": 2470
                    },
                    {
                        "locationIndex": 0,
                        "time": 2474
                    },
                    {
                        "locationIndex": 5,
                        "time": 2482
                    },
                    {
                        "locationIndex": 2,
                        "time": 2510,
                        "type": "long",
                        "ends": 2525
                    },
                    {
                        "locationIndex": 1,
                        "time": 2514
                    },
                    {
                        "locationIndex": 0,
                        "time": 2538
                    },
                    {
                        "locationIndex": 4,
                        "time": 2542
                    },
                    {
                        "locationIndex": 5,
                        "time": 2546
                    },
                    {
                        "locationIndex": 4,
                        "time": 2554
                    },
                    {
                        "locationIndex": 3,
                        "time": 2554
                    },
                    {
                        "locationIndex": 2,
                        "time": 2562
                    },
                    {
                        "locationIndex": 4,
                        "time": 2566
                    },
                    {
                        "locationIndex": 5,
                        "time": 2566
                    },
                    {
                        "locationIndex": 1,
                        "time": 2570
                    },
                    {
                        "locationIndex": 3,
                        "time": 2574
                    },
                    {
                        "locationIndex": 4,
                        "time": 2574
                    },
                    {
                        "locationIndex": 0,
                        "time": 2594
                    },
                    {
                        "locationIndex": 4,
                        "time": 2646
                    },
                    {
                        "locationIndex": 0,
                        "time": 2670
                    },
                    {
                        "locationIndex": 3,
                        "time": 2674
                    },
                    {
                        "locationIndex": 1,
                        "time": 2684
                    },
                    {
                        "locationIndex": 2,
                        "time": 2690
                    },
                    {
                        "locationIndex": 5,
                        "time": 2778
                    }
                ],
                "autoCreate": false
            }
        ]
    };
    songs.push(song);
}

const SSBundleSongs = songs;
export { SSBundleSongs };
export default SSBundleSongs;