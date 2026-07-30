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
                        "line": 5,
                        "time": 147
                    },
                    {
                        "line": 4,
                        "time": 194
                    },
                    {
                        "line": 5,
                        "time": 275
                    },
                    {
                        "line": 3,
                        "time": 322
                    },
                    {
                        "line": 5,
                        "time": 354
                    },
                    {
                        "line": 0,
                        "time": 386
                    },
                    {
                        "line": 1,
                        "time": 418
                    },
                    {
                        "line": 3,
                        "time": 450
                    },
                    {
                        "line": 4,
                        "time": 482
                    },
                    {
                        "line": 5,
                        "time": 514
                    },
                    {
                        "line": 0,
                        "time": 546
                    },
                    {
                        "line": 4,
                        "time": 578
                    },
                    {
                        "line": 1,
                        "time": 610
                    },
                    {
                        "line": 0,
                        "time": 642
                    },
                    {
                        "line": 2,
                        "time": 674
                    },
                    {
                        "line": 3,
                        "time": 706
                    },
                    {
                        "line": 2,
                        "time": 738
                    },
                    {
                        "line": 4,
                        "time": 785
                    },
                    {
                        "line": 3,
                        "time": 818
                    },
                    {
                        "line": 1,
                        "time": 859
                    },
                    {
                        "line": 5,
                        "time": 898
                    },
                    {
                        "line": 0,
                        "time": 930
                    },
                    {
                        "line": 4,
                        "time": 962
                    },
                    {
                        "line": 3,
                        "time": 994
                    },
                    {
                        "line": 1,
                        "time": 994
                    },
                    {
                        "line": 5,
                        "time": 1026
                    },
                    {
                        "line": 0,
                        "time": 1072
                    },
                    {
                        "line": 3,
                        "time": 1115
                    },
                    {
                        "line": 4,
                        "time": 1154
                    },
                    {
                        "line": 1,
                        "time": 1186
                    },
                    {
                        "line": 2,
                        "time": 1218
                    },
                    {
                        "line": 4,
                        "time": 1250
                    },
                    {
                        "line": 3,
                        "time": 1282
                    },
                    {
                        "line": 0,
                        "time": 1314
                    },
                    {
                        "line": 3,
                        "time": 1346
                    },
                    {
                        "line": 2,
                        "time": 1378
                    },
                    {
                        "line": 5,
                        "time": 1423
                    },
                    {
                        "line": 4,
                        "time": 1458
                    },
                    {
                        "line": 3,
                        "time": 1490
                    },
                    {
                        "line": 2,
                        "time": 1522
                    },
                    {
                        "line": 4,
                        "time": 1555
                    },
                    {
                        "line": 1,
                        "time": 1590
                    },
                    {
                        "line": 5,
                        "time": 1634
                    },
                    {
                        "line": 2,
                        "time": 1666
                    },
                    {
                        "line": 5,
                        "time": 1698
                    },
                    {
                        "line": 0,
                        "time": 1730
                    },
                    {
                        "line": 1,
                        "time": 1762
                    },
                    {
                        "line": 0,
                        "time": 1794
                    },
                    {
                        "line": 5,
                        "time": 1826
                    },
                    {
                        "line": 4,
                        "time": 1858
                    },
                    {
                        "line": 3,
                        "time": 1890
                    },
                    {
                        "line": 2,
                        "time": 1922
                    },
                    {
                        "line": 5,
                        "time": 1954
                    },
                    {
                        "line": 4,
                        "time": 1986
                    },
                    {
                        "line": 3,
                        "time": 2018
                    },
                    {
                        "line": 4,
                        "time": 2066
                    },
                    {
                        "line": 0,
                        "time": 2098
                    },
                    {
                        "line": 3,
                        "time": 2146
                    },
                    {
                        "line": 2,
                        "time": 2178
                    },
                    {
                        "line": 3,
                        "time": 2210
                    },
                    {
                        "line": 0,
                        "time": 2254
                    },
                    {
                        "line": 2,
                        "time": 2290
                    },
                    {
                        "line": 0,
                        "time": 2322
                    },
                    {
                        "line": 2,
                        "time": 2354
                    },
                    {
                        "line": 5,
                        "time": 2386
                    },
                    {
                        "line": 2,
                        "time": 2418
                    },
                    {
                        "line": 4,
                        "time": 2466
                    },
                    {
                        "line": 3,
                        "time": 2498
                    },
                    {
                        "line": 1,
                        "time": 2530
                    },
                    {
                        "line": 4,
                        "time": 2562
                    },
                    {
                        "line": 1,
                        "time": 2594
                    },
                    {
                        "line": 2,
                        "time": 2626
                    },
                    {
                        "line": 0,
                        "time": 2669
                    },
                    {
                        "line": 2,
                        "time": 2708
                    },
                    {
                        "line": 4,
                        "time": 2747
                    },
                    {
                        "line": 3,
                        "time": 2781
                    },
                    {
                        "line": 0,
                        "time": 2781
                    },
                    {
                        "line": 5,
                        "time": 2833
                    },
                    {
                        "line": 3,
                        "time": 2915
                    },
                    {
                        "line": 2,
                        "time": 2949
                    },
                    {
                        "line": 0,
                        "time": 2992
                    },
                    {
                        "line": 2,
                        "time": 3038
                    },
                    {
                        "line": 4,
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
                        "line": 1,
                        "time": 147
                    },
                    {
                        "line": 0,
                        "time": 184
                    },
                    {
                        "line": 3,
                        "time": 275
                    },
                    {
                        "line": 1,
                        "time": 303
                    },
                    {
                        "line": 2,
                        "time": 322
                    },
                    {
                        "line": 0,
                        "time": 354
                    },
                    {
                        "line": 4,
                        "time": 370
                    },
                    {
                        "line": 3,
                        "time": 386
                    },
                    {
                        "line": 1,
                        "time": 386
                    },
                    {
                        "line": 5,
                        "time": 418
                    },
                    {
                        "line": 4,
                        "time": 434
                    },
                    {
                        "line": 2,
                        "time": 450
                    },
                    {
                        "line": 3,
                        "time": 466
                    },
                    {
                        "line": 4,
                        "time": 482
                    },
                    {
                        "line": 0,
                        "time": 498
                    },
                    {
                        "line": 3,
                        "time": 514
                    },
                    {
                        "line": 1,
                        "time": 531
                    },
                    {
                        "line": 2,
                        "time": 560
                    },
                    {
                        "line": 5,
                        "time": 578
                    },
                    {
                        "line": 4,
                        "time": 610
                    },
                    {
                        "line": 1,
                        "time": 626
                    },
                    {
                        "line": 2,
                        "time": 642
                    },
                    {
                        "line": 4,
                        "time": 674
                    },
                    {
                        "line": 3,
                        "time": 690
                    },
                    {
                        "line": 4,
                        "time": 706
                    },
                    {
                        "line": 1,
                        "time": 737
                    },
                    {
                        "line": 4,
                        "time": 753
                    },
                    {
                        "line": 5,
                        "time": 785
                    },
                    {
                        "line": 1,
                        "time": 785
                    },
                    {
                        "line": 3,
                        "time": 802
                    },
                    {
                        "line": 4,
                        "time": 818
                    },
                    {
                        "line": 5,
                        "time": 834
                    },
                    {
                        "line": 2,
                        "time": 859
                    },
                    {
                        "line": 5,
                        "time": 875
                    },
                    {
                        "line": 3,
                        "time": 898
                    },
                    {
                        "line": 2,
                        "time": 923
                    },
                    {
                        "line": 4,
                        "time": 923
                    },
                    {
                        "line": 0,
                        "time": 939
                    },
                    {
                        "line": 3,
                        "time": 962
                    },
                    {
                        "line": 0,
                        "time": 978
                    },
                    {
                        "line": 3,
                        "time": 994
                    },
                    {
                        "line": 1,
                        "time": 1010
                    },
                    {
                        "line": 2,
                        "time": 1026
                    },
                    {
                        "line": 1,
                        "time": 1043
                    },
                    {
                        "line": 3,
                        "time": 1072
                    },
                    {
                        "line": 0,
                        "time": 1090
                    },
                    {
                        "line": 1,
                        "time": 1115
                    },
                    {
                        "line": 2,
                        "time": 1131
                    },
                    {
                        "line": 4,
                        "time": 1131
                    },
                    {
                        "line": 3,
                        "time": 1154
                    },
                    {
                        "line": 1,
                        "time": 1179
                    },
                    {
                        "line": 2,
                        "time": 1195
                    },
                    {
                        "line": 3,
                        "time": 1195
                    },
                    {
                        "line": 1,
                        "time": 1218
                    },
                    {
                        "line": 4,
                        "time": 1234
                    },
                    {
                        "line": 1,
                        "time": 1250
                    },
                    {
                        "line": 2,
                        "time": 1266
                    },
                    {
                        "line": 4,
                        "time": 1282
                    },
                    {
                        "line": 0,
                        "time": 1299
                    },
                    {
                        "line": 1,
                        "time": 1299
                    },
                    {
                        "line": 5,
                        "time": 1318
                    },
                    {
                        "line": 2,
                        "time": 1336
                    },
                    {
                        "line": 1,
                        "time": 1378
                    },
                    {
                        "line": 3,
                        "time": 1394
                    },
                    {
                        "line": 2,
                        "time": 1410
                    },
                    {
                        "line": 3,
                        "time": 1427
                    },
                    {
                        "line": 0,
                        "time": 1453
                    },
                    {
                        "line": 5,
                        "time": 1474
                    },
                    {
                        "line": 4,
                        "time": 1490
                    },
                    {
                        "line": 5,
                        "time": 1506
                    },
                    {
                        "line": 0,
                        "time": 1522
                    },
                    {
                        "line": 1,
                        "time": 1522
                    },
                    {
                        "line": 5,
                        "time": 1538
                    },
                    {
                        "line": 2,
                        "time": 1555
                    },
                    {
                        "line": 4,
                        "time": 1584
                    },
                    {
                        "line": 3,
                        "time": 1584
                    },
                    {
                        "line": 0,
                        "time": 1602
                    },
                    {
                        "line": 5,
                        "time": 1634
                    },
                    {
                        "line": 3,
                        "time": 1650
                    },
                    {
                        "line": 5,
                        "time": 1666
                    },
                    {
                        "line": 4,
                        "time": 1698
                    },
                    {
                        "line": 1,
                        "time": 1714
                    },
                    {
                        "line": 2,
                        "time": 1730
                    },
                    {
                        "line": 4,
                        "time": 1746
                    },
                    {
                        "line": 2,
                        "time": 1762
                    },
                    {
                        "line": 0,
                        "time": 1778
                    },
                    {
                        "line": 5,
                        "time": 1778
                    },
                    {
                        "line": 2,
                        "time": 1794
                    },
                    {
                        "line": 0,
                        "time": 1811
                    },
                    {
                        "line": 5,
                        "time": 1832
                    },
                    {
                        "line": 3,
                        "time": 1858
                    },
                    {
                        "line": 1,
                        "time": 1890
                    },
                    {
                        "line": 5,
                        "time": 1906
                    },
                    {
                        "line": 3,
                        "time": 1922
                    },
                    {
                        "line": 4,
                        "time": 1938
                    },
                    {
                        "line": 0,
                        "time": 1954
                    },
                    {
                        "line": 1,
                        "time": 1970
                    },
                    {
                        "line": 3,
                        "time": 1986
                    },
                    {
                        "line": 4,
                        "time": 1986
                    },
                    {
                        "line": 1,
                        "time": 2002
                    },
                    {
                        "line": 2,
                        "time": 2018
                    },
                    {
                        "line": 0,
                        "time": 2018
                    },
                    {
                        "line": 5,
                        "time": 2034
                    },
                    {
                        "line": 3,
                        "time": 2066
                    },
                    {
                        "line": 0,
                        "time": 2082
                    },
                    {
                        "line": 2,
                        "time": 2098
                    },
                    {
                        "line": 3,
                        "time": 2098
                    },
                    {
                        "line": 1,
                        "time": 2114
                    },
                    {
                        "line": 0,
                        "time": 2146
                    },
                    {
                        "line": 4,
                        "time": 2162
                    },
                    {
                        "line": 3,
                        "time": 2178
                    },
                    {
                        "line": 2,
                        "time": 2210
                    },
                    {
                        "line": 1,
                        "time": 2226
                    },
                    {
                        "line": 4,
                        "time": 2242
                    },
                    {
                        "line": 1,
                        "time": 2258
                    },
                    {
                        "line": 3,
                        "time": 2274
                    },
                    {
                        "line": 2,
                        "time": 2290
                    },
                    {
                        "line": 1,
                        "time": 2306
                    },
                    {
                        "line": 2,
                        "time": 2322
                    },
                    {
                        "line": 1,
                        "time": 2338
                    },
                    {
                        "line": 0,
                        "time": 2354
                    },
                    {
                        "line": 3,
                        "time": 2370
                    },
                    {
                        "line": 2,
                        "time": 2402
                    },
                    {
                        "line": 1,
                        "time": 2418
                    },
                    {
                        "line": 5,
                        "time": 2434
                    },
                    {
                        "line": 1,
                        "time": 2466
                    },
                    {
                        "line": 4,
                        "time": 2482
                    },
                    {
                        "line": 0,
                        "time": 2498
                    },
                    {
                        "line": 2,
                        "time": 2514
                    },
                    {
                        "line": 4,
                        "time": 2530
                    },
                    {
                        "line": 0,
                        "time": 2546
                    },
                    {
                        "line": 2,
                        "time": 2562
                    },
                    {
                        "line": 1,
                        "time": 2579
                    },
                    {
                        "line": 3,
                        "time": 2608
                    },
                    {
                        "line": 4,
                        "time": 2608
                    },
                    {
                        "line": 5,
                        "time": 2626
                    },
                    {
                        "line": 2,
                        "time": 2669
                    },
                    {
                        "line": 4,
                        "time": 2708
                    },
                    {
                        "line": 1,
                        "time": 2739
                    },
                    {
                        "line": 5,
                        "time": 2776
                    },
                    {
                        "line": 3,
                        "time": 2794
                    },
                    {
                        "line": 0,
                        "time": 2833
                    },
                    {
                        "line": 5,
                        "time": 2864
                    },
                    {
                        "line": 1,
                        "time": 2915
                    },
                    {
                        "line": 4,
                        "time": 2954
                    },
                    {
                        "line": 2,
                        "time": 2992
                    },
                    {
                        "line": 5,
                        "time": 3067
                    },
                    {
                        "line": 2,
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
                        "line": 0,
                        "time": 146
                    },
                    {
                        "line": 1,
                        "time": 162
                    },
                    {
                        "line": 0,
                        "time": 190
                    },
                    {
                        "line": 2,
                        "time": 206
                    },
                    {
                        "line": 3,
                        "time": 234
                    },
                    {
                        "line": 4,
                        "time": 252
                    },
                    {
                        "line": 0,
                        "time": 278
                    },
                    {
                        "line": 1,
                        "time": 294
                    },
                    {
                        "line": 0,
                        "time": 314
                    },
                    {
                        "line": 3,
                        "time": 330
                    },
                    {
                        "line": 5,
                        "time": 362
                    },
                    {
                        "line": 4,
                        "time": 378
                    },
                    {
                        "line": 1,
                        "time": 394
                    },
                    {
                        "line": 2,
                        "time": 394
                    },
                    {
                        "line": 5,
                        "time": 418
                    },
                    {
                        "line": 1,
                        "time": 434
                    },
                    {
                        "line": 2,
                        "time": 450
                    },
                    {
                        "line": 3,
                        "time": 466
                    },
                    {
                        "line": 2,
                        "time": 482
                    },
                    {
                        "line": 0,
                        "time": 502
                    },
                    {
                        "line": 2,
                        "time": 522
                    },
                    {
                        "line": 3,
                        "time": 538
                    },
                    {
                        "line": 5,
                        "time": 554
                    },
                    {
                        "line": 4,
                        "time": 570
                    },
                    {
                        "line": 5,
                        "time": 586
                    },
                    {
                        "line": 2,
                        "time": 606
                    },
                    {
                        "line": 5,
                        "time": 626
                    },
                    {
                        "line": 2,
                        "time": 642
                    },
                    {
                        "line": 5,
                        "time": 658
                    },
                    {
                        "line": 4,
                        "time": 658
                    },
                    {
                        "line": 1,
                        "time": 674
                    },
                    {
                        "line": 3,
                        "time": 690
                    },
                    {
                        "line": 2,
                        "time": 711
                    },
                    {
                        "line": 0,
                        "time": 730
                    },
                    {
                        "line": 4,
                        "time": 746
                    },
                    {
                        "line": 1,
                        "time": 762
                    },
                    {
                        "line": 3,
                        "time": 762
                    },
                    {
                        "line": 2,
                        "time": 778
                    },
                    {
                        "line": 0,
                        "time": 794
                    },
                    {
                        "line": 1,
                        "time": 818
                    },
                    {
                        "line": 3,
                        "time": 834
                    },
                    {
                        "line": 4,
                        "time": 850
                    },
                    {
                        "line": 3,
                        "time": 866
                    },
                    {
                        "line": 0,
                        "time": 882
                    },
                    {
                        "line": 2,
                        "time": 906
                    },
                    {
                        "line": 3,
                        "time": 922
                    },
                    {
                        "line": 0,
                        "time": 938
                    },
                    {
                        "line": 5,
                        "time": 954
                    },
                    {
                        "line": 0,
                        "time": 970
                    },
                    {
                        "line": 1,
                        "time": 994
                    },
                    {
                        "line": 0,
                        "time": 1010
                    },
                    {
                        "line": 1,
                        "time": 1026
                    },
                    {
                        "line": 3,
                        "time": 1042
                    },
                    {
                        "line": 5,
                        "time": 1058
                    },
                    {
                        "line": 3,
                        "time": 1082
                    },
                    {
                        "line": 2,
                        "time": 1098
                    },
                    {
                        "line": 4,
                        "time": 1114
                    },
                    {
                        "line": 2,
                        "time": 1130
                    },
                    {
                        "line": 4,
                        "time": 1146
                    },
                    {
                        "line": 3,
                        "time": 1146
                    },
                    {
                        "line": 5,
                        "time": 1170
                    },
                    {
                        "line": 4,
                        "time": 1186
                    },
                    {
                        "line": 3,
                        "time": 1202
                    },
                    {
                        "line": 4,
                        "time": 1218
                    },
                    {
                        "line": 1,
                        "time": 1234
                    },
                    {
                        "line": 3,
                        "time": 1234
                    },
                    {
                        "line": 0,
                        "time": 1258
                    },
                    {
                        "line": 2,
                        "time": 1274
                    },
                    {
                        "line": 0,
                        "time": 1290
                    },
                    {
                        "line": 3,
                        "time": 1306
                    },
                    {
                        "line": 5,
                        "time": 1322
                    },
                    {
                        "line": 4,
                        "time": 1344
                    },
                    {
                        "line": 2,
                        "time": 1362
                    },
                    {
                        "line": 3,
                        "time": 1378
                    },
                    {
                        "line": 2,
                        "time": 1394
                    },
                    {
                        "line": 0,
                        "time": 1410
                    },
                    {
                        "line": 2,
                        "time": 1426
                    },
                    {
                        "line": 1,
                        "time": 1450
                    },
                    {
                        "line": 4,
                        "time": 1466
                    },
                    {
                        "line": 3,
                        "time": 1466
                    },
                    {
                        "line": 5,
                        "time": 1482
                    },
                    {
                        "line": 3,
                        "time": 1498
                    },
                    {
                        "line": 4,
                        "time": 1514
                    },
                    {
                        "line": 0,
                        "time": 1535
                    },
                    {
                        "line": 5,
                        "time": 1554
                    },
                    {
                        "line": 4,
                        "time": 1570
                    },
                    {
                        "line": 1,
                        "time": 1570
                    },
                    {
                        "line": 0,
                        "time": 1586
                    },
                    {
                        "line": 5,
                        "time": 1602
                    },
                    {
                        "line": 3,
                        "time": 1618
                    },
                    {
                        "line": 1,
                        "time": 1642
                    },
                    {
                        "line": 5,
                        "time": 1642
                    },
                    {
                        "line": 2,
                        "time": 1658
                    },
                    {
                        "line": 0,
                        "time": 1674
                    },
                    {
                        "line": 3,
                        "time": 1674
                    },
                    {
                        "line": 4,
                        "time": 1690
                    },
                    {
                        "line": 3,
                        "time": 1706
                    },
                    {
                        "line": 1,
                        "time": 1726
                    },
                    {
                        "line": 0,
                        "time": 1742
                    },
                    {
                        "line": 4,
                        "time": 1762
                    },
                    {
                        "line": 3,
                        "time": 1778
                    },
                    {
                        "line": 2,
                        "time": 1794
                    },
                    {
                        "line": 1,
                        "time": 1810
                    },
                    {
                        "line": 3,
                        "time": 1826
                    },
                    {
                        "line": 4,
                        "time": 1846
                    },
                    {
                        "line": 1,
                        "time": 1862
                    },
                    {
                        "line": 0,
                        "time": 1878
                    },
                    {
                        "line": 3,
                        "time": 1894
                    },
                    {
                        "line": 2,
                        "time": 1910
                    },
                    {
                        "line": 5,
                        "time": 1930
                    },
                    {
                        "line": 3,
                        "time": 1946
                    },
                    {
                        "line": 0,
                        "time": 1962
                    },
                    {
                        "line": 1,
                        "time": 1962
                    },
                    {
                        "line": 2,
                        "time": 1978
                    },
                    {
                        "line": 1,
                        "time": 1994
                    },
                    {
                        "line": 0,
                        "time": 2014
                    },
                    {
                        "line": 4,
                        "time": 2034
                    },
                    {
                        "line": 5,
                        "time": 2050
                    },
                    {
                        "line": 3,
                        "time": 2050
                    },
                    {
                        "line": 0,
                        "time": 2066
                    },
                    {
                        "line": 2,
                        "time": 2082
                    },
                    {
                        "line": 4,
                        "time": 2099
                    },
                    {
                        "line": 0,
                        "time": 2118
                    },
                    {
                        "line": 2,
                        "time": 2134
                    },
                    {
                        "line": 5,
                        "time": 2150
                    },
                    {
                        "line": 3,
                        "time": 2168
                    },
                    {
                        "line": 1,
                        "time": 2186
                    },
                    {
                        "line": 4,
                        "time": 2202
                    },
                    {
                        "line": 3,
                        "time": 2218
                    },
                    {
                        "line": 4,
                        "time": 2234
                    },
                    {
                        "line": 0,
                        "time": 2250
                    },
                    {
                        "line": 1,
                        "time": 2250
                    },
                    {
                        "line": 4,
                        "time": 2270
                    },
                    {
                        "line": 3,
                        "time": 2286
                    },
                    {
                        "line": 5,
                        "time": 2302
                    },
                    {
                        "line": 2,
                        "time": 2318
                    },
                    {
                        "line": 5,
                        "time": 2334
                    },
                    {
                        "line": 0,
                        "time": 2354
                    },
                    {
                        "line": 2,
                        "time": 2370
                    },
                    {
                        "line": 0,
                        "time": 2386
                    },
                    {
                        "line": 5,
                        "time": 2402
                    },
                    {
                        "line": 0,
                        "time": 2418
                    },
                    {
                        "line": 2,
                        "time": 2454
                    },
                    {
                        "line": 5,
                        "time": 2470
                    },
                    {
                        "line": 4,
                        "time": 2486
                    },
                    {
                        "line": 5,
                        "time": 2506
                    },
                    {
                        "line": 2,
                        "time": 2506
                    },
                    {
                        "line": 3,
                        "time": 2522
                    },
                    {
                        "line": 1,
                        "time": 2538
                    },
                    {
                        "line": 0,
                        "time": 2554
                    },
                    {
                        "line": 3,
                        "time": 2570
                    },
                    {
                        "line": 4,
                        "time": 2590
                    },
                    {
                        "line": 0,
                        "time": 2626
                    },
                    {
                        "line": 4,
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
                        "line": 0,
                        "time": 146
                    },
                    {
                        "line": 3,
                        "time": 154
                    },
                    {
                        "line": 2,
                        "time": 174
                    },
                    {
                        "line": 3,
                        "time": 186
                    },
                    {
                        "line": 5,
                        "time": 198
                    },
                    {
                        "line": 2,
                        "time": 210
                    },
                    {
                        "line": 1,
                        "time": 234
                    },
                    {
                        "line": 4,
                        "time": 250
                    },
                    {
                        "line": 5,
                        "time": 266
                    },
                    {
                        "line": 1,
                        "time": 282
                    },
                    {
                        "line": 5,
                        "time": 290
                    },
                    {
                        "line": 4,
                        "time": 298
                    },
                    {
                        "line": 2,
                        "time": 310
                    },
                    {
                        "line": 1,
                        "time": 310
                    },
                    {
                        "line": 5,
                        "time": 322
                    },
                    {
                        "line": 4,
                        "time": 330
                    },
                    {
                        "line": 3,
                        "time": 330
                    },
                    {
                        "line": 5,
                        "time": 346
                    },
                    {
                        "line": 0,
                        "time": 354
                    },
                    {
                        "line": 3,
                        "time": 378
                    },
                    {
                        "line": 0,
                        "time": 386
                    },
                    {
                        "line": 4,
                        "time": 402
                    },
                    {
                        "line": 5,
                        "time": 402
                    },
                    {
                        "line": 1,
                        "time": 410
                    },
                    {
                        "line": 0,
                        "time": 418
                    },
                    {
                        "line": 3,
                        "time": 426
                    },
                    {
                        "line": 4,
                        "time": 434
                    },
                    {
                        "line": 2,
                        "time": 442
                    },
                    {
                        "line": 5,
                        "time": 442
                    },
                    {
                        "line": 3,
                        "time": 450
                    },
                    {
                        "line": 1,
                        "time": 458
                    },
                    {
                        "line": 4,
                        "time": 466
                    },
                    {
                        "line": 3,
                        "time": 474
                    },
                    {
                        "line": 4,
                        "time": 482
                    },
                    {
                        "line": 3,
                        "time": 490
                    },
                    {
                        "line": 5,
                        "time": 490
                    },
                    {
                        "line": 1,
                        "time": 498
                    },
                    {
                        "line": 2,
                        "time": 498
                    },
                    {
                        "line": 5,
                        "time": 506
                    },
                    {
                        "line": 3,
                        "time": 514
                    },
                    {
                        "line": 5,
                        "time": 522
                    },
                    {
                        "line": 4,
                        "time": 522
                    },
                    {
                        "line": 3,
                        "time": 530
                    },
                    {
                        "line": 1,
                        "time": 538
                    },
                    {
                        "line": 4,
                        "time": 546
                    },
                    {
                        "line": 2,
                        "time": 554
                    },
                    {
                        "line": 3,
                        "time": 562
                    },
                    {
                        "line": 4,
                        "time": 562
                    },
                    {
                        "line": 0,
                        "time": 570
                    },
                    {
                        "line": 1,
                        "time": 578
                    },
                    {
                        "line": 2,
                        "time": 578
                    },
                    {
                        "line": 5,
                        "time": 586
                    },
                    {
                        "line": 4,
                        "time": 594
                    },
                    {
                        "line": 0,
                        "time": 602
                    },
                    {
                        "line": 3,
                        "time": 602
                    },
                    {
                        "line": 4,
                        "time": 610
                    },
                    {
                        "line": 1,
                        "time": 618
                    },
                    {
                        "line": 3,
                        "time": 626
                    },
                    {
                        "line": 1,
                        "time": 634
                    },
                    {
                        "line": 2,
                        "time": 642
                    },
                    {
                        "line": 1,
                        "time": 650
                    },
                    {
                        "line": 5,
                        "time": 658
                    },
                    {
                        "line": 3,
                        "time": 666
                    },
                    {
                        "line": 4,
                        "time": 682
                    },
                    {
                        "line": 0,
                        "time": 682
                    },
                    {
                        "line": 3,
                        "time": 690
                    },
                    {
                        "line": 5,
                        "time": 698
                    },
                    {
                        "line": 4,
                        "time": 706
                    },
                    {
                        "line": 2,
                        "time": 714
                    },
                    {
                        "line": 0,
                        "time": 714
                    },
                    {
                        "line": 5,
                        "time": 722
                    },
                    {
                        "line": 1,
                        "time": 730
                    },
                    {
                        "line": 2,
                        "time": 738
                    },
                    {
                        "line": 4,
                        "time": 738
                    },
                    {
                        "line": 1,
                        "time": 746,
                        "type": "long",
                        "ends": 761
                    },
                    {
                        "line": 3,
                        "time": 754
                    },
                    {
                        "line": 4,
                        "time": 762
                    },
                    {
                        "line": 3,
                        "time": 770
                    },
                    {
                        "line": 2,
                        "time": 778
                    },
                    {
                        "line": 0,
                        "time": 786
                    },
                    {
                        "line": 2,
                        "time": 794
                    },
                    {
                        "line": 3,
                        "time": 794
                    },
                    {
                        "line": 4,
                        "time": 802
                    },
                    {
                        "line": 3,
                        "time": 810
                    },
                    {
                        "line": 2,
                        "time": 818
                    },
                    {
                        "line": 3,
                        "time": 826
                    },
                    {
                        "line": 0,
                        "time": 834
                    },
                    {
                        "line": 2,
                        "time": 842
                    },
                    {
                        "line": 4,
                        "time": 850,
                        "type": "long",
                        "ends": 865
                    },
                    {
                        "line": 0,
                        "time": 850,
                        "type": "long",
                        "ends": 865
                    },
                    {
                        "line": 5,
                        "time": 858
                    },
                    {
                        "line": 3,
                        "time": 866
                    },
                    {
                        "line": 2,
                        "time": 874
                    },
                    {
                        "line": 5,
                        "time": 874
                    },
                    {
                        "line": 3,
                        "time": 882
                    },
                    {
                        "line": 2,
                        "time": 890
                    },
                    {
                        "line": 1,
                        "time": 898
                    },
                    {
                        "line": 3,
                        "time": 898
                    },
                    {
                        "line": 2,
                        "time": 906
                    },
                    {
                        "line": 1,
                        "time": 914
                    },
                    {
                        "line": 3,
                        "time": 914
                    },
                    {
                        "line": 5,
                        "time": 922
                    },
                    {
                        "line": 1,
                        "time": 930
                    },
                    {
                        "line": 5,
                        "time": 938
                    },
                    {
                        "line": 2,
                        "time": 946
                    },
                    {
                        "line": 1,
                        "time": 954
                    },
                    {
                        "line": 3,
                        "time": 962
                    },
                    {
                        "line": 1,
                        "time": 970
                    },
                    {
                        "line": 3,
                        "time": 978
                    },
                    {
                        "line": 5,
                        "time": 986
                    },
                    {
                        "line": 2,
                        "time": 986
                    },
                    {
                        "line": 4,
                        "time": 994
                    },
                    {
                        "line": 1,
                        "time": 994
                    },
                    {
                        "line": 3,
                        "time": 1002
                    },
                    {
                        "line": 1,
                        "time": 1010,
                        "type": "long",
                        "ends": 1025
                    },
                    {
                        "line": 4,
                        "time": 1018
                    },
                    {
                        "line": 0,
                        "time": 1026,
                        "type": "long",
                        "ends": 1041
                    },
                    {
                        "line": 3,
                        "time": 1034
                    },
                    {
                        "line": 4,
                        "time": 1042
                    },
                    {
                        "line": 3,
                        "time": 1050
                    },
                    {
                        "line": 2,
                        "time": 1050
                    },
                    {
                        "line": 5,
                        "time": 1058
                    },
                    {
                        "line": 4,
                        "time": 1066
                    },
                    {
                        "line": 2,
                        "time": 1074
                    },
                    {
                        "line": 4,
                        "time": 1082
                    },
                    {
                        "line": 2,
                        "time": 1090
                    },
                    {
                        "line": 4,
                        "time": 1098
                    },
                    {
                        "line": 2,
                        "time": 1106
                    },
                    {
                        "line": 5,
                        "time": 1106
                    },
                    {
                        "line": 4,
                        "time": 1114
                    },
                    {
                        "line": 2,
                        "time": 1122
                    },
                    {
                        "line": 3,
                        "time": 1130
                    },
                    {
                        "line": 5,
                        "time": 1138
                    },
                    {
                        "line": 2,
                        "time": 1146
                    },
                    {
                        "line": 5,
                        "time": 1154
                    },
                    {
                        "line": 3,
                        "time": 1162
                    },
                    {
                        "line": 5,
                        "time": 1170
                    },
                    {
                        "line": 0,
                        "time": 1178
                    },
                    {
                        "line": 3,
                        "time": 1186
                    },
                    {
                        "line": 1,
                        "time": 1194
                    },
                    {
                        "line": 2,
                        "time": 1194
                    },
                    {
                        "line": 5,
                        "time": 1202
                    },
                    {
                        "line": 3,
                        "time": 1210
                    },
                    {
                        "line": 1,
                        "time": 1218
                    },
                    {
                        "line": 2,
                        "time": 1226
                    },
                    {
                        "line": 3,
                        "time": 1234
                    },
                    {
                        "line": 5,
                        "time": 1242
                    },
                    {
                        "line": 0,
                        "time": 1250
                    },
                    {
                        "line": 1,
                        "time": 1250
                    },
                    {
                        "line": 2,
                        "time": 1258
                    },
                    {
                        "line": 5,
                        "time": 1266
                    },
                    {
                        "line": 3,
                        "time": 1274
                    },
                    {
                        "line": 5,
                        "time": 1282
                    },
                    {
                        "line": 4,
                        "time": 1290
                    },
                    {
                        "line": 3,
                        "time": 1298
                    },
                    {
                        "line": 5,
                        "time": 1298
                    },
                    {
                        "line": 2,
                        "time": 1306
                    },
                    {
                        "line": 5,
                        "time": 1314,
                        "type": "long",
                        "ends": 1329
                    },
                    {
                        "line": 3,
                        "time": 1322
                    },
                    {
                        "line": 0,
                        "time": 1322
                    },
                    {
                        "line": 1,
                        "time": 1330
                    },
                    {
                        "line": 0,
                        "time": 1338
                    },
                    {
                        "line": 2,
                        "time": 1346,
                        "type": "long",
                        "ends": 1361
                    },
                    {
                        "line": 0,
                        "time": 1354
                    },
                    {
                        "line": 4,
                        "time": 1362
                    },
                    {
                        "line": 3,
                        "time": 1370
                    },
                    {
                        "line": 1,
                        "time": 1370
                    },
                    {
                        "line": 0,
                        "time": 1378
                    },
                    {
                        "line": 4,
                        "time": 1386
                    },
                    {
                        "line": 3,
                        "time": 1394
                    },
                    {
                        "line": 1,
                        "time": 1402,
                        "type": "long",
                        "ends": 1417
                    },
                    {
                        "line": 4,
                        "time": 1410
                    },
                    {
                        "line": 0,
                        "time": 1418
                    },
                    {
                        "line": 4,
                        "time": 1426,
                        "type": "long",
                        "ends": 1441
                    },
                    {
                        "line": 3,
                        "time": 1434
                    },
                    {
                        "line": 0,
                        "time": 1442
                    },
                    {
                        "line": 3,
                        "time": 1450
                    },
                    {
                        "line": 5,
                        "time": 1458,
                        "type": "long",
                        "ends": 1473
                    },
                    {
                        "line": 0,
                        "time": 1466
                    },
                    {
                        "line": 3,
                        "time": 1474
                    },
                    {
                        "line": 0,
                        "time": 1482
                    },
                    {
                        "line": 2,
                        "time": 1490
                    },
                    {
                        "line": 0,
                        "time": 1498
                    },
                    {
                        "line": 3,
                        "time": 1498
                    },
                    {
                        "line": 2,
                        "time": 1506
                    },
                    {
                        "line": 3,
                        "time": 1514,
                        "type": "long",
                        "ends": 1529
                    },
                    {
                        "line": 2,
                        "time": 1522
                    },
                    {
                        "line": 0,
                        "time": 1522
                    },
                    {
                        "line": 0,
                        "time": 1535
                    },
                    {
                        "line": 2,
                        "time": 1535
                    },
                    {
                        "line": 1,
                        "time": 1546
                    },
                    {
                        "line": 0,
                        "time": 1554
                    },
                    {
                        "line": 2,
                        "time": 1562
                    },
                    {
                        "line": 0,
                        "time": 1570
                    },
                    {
                        "line": 2,
                        "time": 1578,
                        "type": "long",
                        "ends": 1593
                    },
                    {
                        "line": 4,
                        "time": 1586
                    },
                    {
                        "line": 0,
                        "time": 1586
                    },
                    {
                        "line": 1,
                        "time": 1594
                    },
                    {
                        "line": 4,
                        "time": 1602
                    },
                    {
                        "line": 5,
                        "time": 1602
                    },
                    {
                        "line": 1,
                        "time": 1610
                    },
                    {
                        "line": 0,
                        "time": 1618
                    },
                    {
                        "line": 1,
                        "time": 1626
                    },
                    {
                        "line": 4,
                        "time": 1634
                    },
                    {
                        "line": 5,
                        "time": 1642
                    },
                    {
                        "line": 0,
                        "time": 1650
                    },
                    {
                        "line": 5,
                        "time": 1658
                    },
                    {
                        "line": 3,
                        "time": 1658
                    },
                    {
                        "line": 4,
                        "time": 1666
                    },
                    {
                        "line": 1,
                        "time": 1674
                    },
                    {
                        "line": 3,
                        "time": 1682
                    },
                    {
                        "line": 4,
                        "time": 1690
                    },
                    {
                        "line": 0,
                        "time": 1690
                    },
                    {
                        "line": 1,
                        "time": 1698
                    },
                    {
                        "line": 0,
                        "time": 1706
                    },
                    {
                        "line": 4,
                        "time": 1714
                    },
                    {
                        "line": 1,
                        "time": 1722,
                        "type": "long",
                        "ends": 1737
                    },
                    {
                        "line": 0,
                        "time": 1730
                    },
                    {
                        "line": 3,
                        "time": 1738
                    },
                    {
                        "line": 5,
                        "time": 1746
                    },
                    {
                        "line": 4,
                        "time": 1754
                    },
                    {
                        "line": 0,
                        "time": 1754
                    },
                    {
                        "line": 3,
                        "time": 1762
                    },
                    {
                        "line": 5,
                        "time": 1770
                    },
                    {
                        "line": 0,
                        "time": 1778
                    },
                    {
                        "line": 5,
                        "time": 1786
                    },
                    {
                        "line": 2,
                        "time": 1794
                    },
                    {
                        "line": 5,
                        "time": 1802
                    },
                    {
                        "line": 3,
                        "time": 1810
                    },
                    {
                        "line": 5,
                        "time": 1818
                    },
                    {
                        "line": 4,
                        "time": 1818
                    },
                    {
                        "line": 2,
                        "time": 1826,
                        "type": "long",
                        "ends": 1841
                    },
                    {
                        "line": 3,
                        "time": 1834
                    },
                    {
                        "line": 4,
                        "time": 1846
                    },
                    {
                        "line": 3,
                        "time": 1858
                    },
                    {
                        "line": 1,
                        "time": 1866
                    },
                    {
                        "line": 3,
                        "time": 1874
                    },
                    {
                        "line": 1,
                        "time": 1882
                    },
                    {
                        "line": 4,
                        "time": 1882
                    },
                    {
                        "line": 5,
                        "time": 1890
                    },
                    {
                        "line": 3,
                        "time": 1898
                    },
                    {
                        "line": 1,
                        "time": 1906
                    },
                    {
                        "line": 5,
                        "time": 1914
                    },
                    {
                        "line": 3,
                        "time": 1922
                    },
                    {
                        "line": 5,
                        "time": 1930
                    },
                    {
                        "line": 1,
                        "time": 1938
                    },
                    {
                        "line": 0,
                        "time": 1938
                    },
                    {
                        "line": 5,
                        "time": 1946
                    },
                    {
                        "line": 4,
                        "time": 1954
                    },
                    {
                        "line": 3,
                        "time": 1962
                    },
                    {
                        "line": 4,
                        "time": 1970
                    },
                    {
                        "line": 2,
                        "time": 1978
                    },
                    {
                        "line": 4,
                        "time": 1986
                    },
                    {
                        "line": 5,
                        "time": 1994
                    },
                    {
                        "line": 0,
                        "time": 1994
                    },
                    {
                        "line": 3,
                        "time": 2002
                    },
                    {
                        "line": 4,
                        "time": 2010,
                        "type": "long",
                        "ends": 2025
                    },
                    {
                        "line": 3,
                        "time": 2018
                    },
                    {
                        "line": 1,
                        "time": 2026
                    },
                    {
                        "line": 0,
                        "time": 2034
                    },
                    {
                        "line": 1,
                        "time": 2042
                    },
                    {
                        "line": 5,
                        "time": 2042
                    },
                    {
                        "line": 0,
                        "time": 2050
                    },
                    {
                        "line": 1,
                        "time": 2058
                    },
                    {
                        "line": 0,
                        "time": 2066
                    },
                    {
                        "line": 3,
                        "time": 2074
                    },
                    {
                        "line": 0,
                        "time": 2082
                    },
                    {
                        "line": 3,
                        "time": 2090
                    },
                    {
                        "line": 2,
                        "time": 2099
                    },
                    {
                        "line": 0,
                        "time": 2107
                    },
                    {
                        "line": 2,
                        "time": 2118
                    },
                    {
                        "line": 0,
                        "time": 2126
                    },
                    {
                        "line": 1,
                        "time": 2126
                    },
                    {
                        "line": 3,
                        "time": 2134,
                        "type": "long",
                        "ends": 2149
                    },
                    {
                        "line": 2,
                        "time": 2142
                    },
                    {
                        "line": 1,
                        "time": 2150
                    },
                    {
                        "line": 5,
                        "time": 2150
                    },
                    {
                        "line": 4,
                        "time": 2158
                    },
                    {
                        "line": 0,
                        "time": 2168
                    },
                    {
                        "line": 1,
                        "time": 2176
                    },
                    {
                        "line": 2,
                        "time": 2186
                    },
                    {
                        "line": 1,
                        "time": 2194
                    },
                    {
                        "line": 5,
                        "time": 2202
                    },
                    {
                        "line": 4,
                        "time": 2210
                    },
                    {
                        "line": 5,
                        "time": 2218
                    },
                    {
                        "line": 1,
                        "time": 2218
                    },
                    {
                        "line": 0,
                        "time": 2226
                    },
                    {
                        "line": 1,
                        "time": 2234
                    },
                    {
                        "line": 5,
                        "time": 2242
                    },
                    {
                        "line": 4,
                        "time": 2250
                    },
                    {
                        "line": 2,
                        "time": 2258
                    },
                    {
                        "line": 0,
                        "time": 2258
                    },
                    {
                        "line": 5,
                        "time": 2266
                    },
                    {
                        "line": 0,
                        "time": 2274
                    },
                    {
                        "line": 2,
                        "time": 2282
                    },
                    {
                        "line": 0,
                        "time": 2290
                    },
                    {
                        "line": 2,
                        "time": 2298
                    },
                    {
                        "line": 3,
                        "time": 2306
                    },
                    {
                        "line": 2,
                        "time": 2314
                    },
                    {
                        "line": 1,
                        "time": 2314
                    },
                    {
                        "line": 5,
                        "time": 2322
                    },
                    {
                        "line": 1,
                        "time": 2330
                    },
                    {
                        "line": 3,
                        "time": 2338
                    },
                    {
                        "line": 1,
                        "time": 2346
                    },
                    {
                        "line": 4,
                        "time": 2354
                    },
                    {
                        "line": 0,
                        "time": 2354
                    },
                    {
                        "line": 5,
                        "time": 2362
                    },
                    {
                        "line": 0,
                        "time": 2370
                    },
                    {
                        "line": 5,
                        "time": 2378
                    },
                    {
                        "line": 3,
                        "time": 2386
                    },
                    {
                        "line": 4,
                        "time": 2394
                    },
                    {
                        "line": 0,
                        "time": 2402
                    },
                    {
                        "line": 1,
                        "time": 2410
                    },
                    {
                        "line": 2,
                        "time": 2418
                    },
                    {
                        "line": 0,
                        "time": 2426
                    },
                    {
                        "line": 4,
                        "time": 2426
                    },
                    {
                        "line": 3,
                        "time": 2434
                    },
                    {
                        "line": 1,
                        "time": 2446
                    },
                    {
                        "line": 5,
                        "time": 2458
                    },
                    {
                        "line": 1,
                        "time": 2466,
                        "type": "long",
                        "ends": 2481
                    },
                    {
                        "line": 2,
                        "time": 2478,
                        "type": "long",
                        "ends": 2493
                    },
                    {
                        "line": 3,
                        "time": 2490
                    },
                    {
                        "line": 4,
                        "time": 2502
                    },
                    {
                        "line": 3,
                        "time": 2510
                    },
                    {
                        "line": 4,
                        "time": 2522
                    },
                    {
                        "line": 0,
                        "time": 2530
                    },
                    {
                        "line": 5,
                        "time": 2538
                    },
                    {
                        "line": 3,
                        "time": 2554
                    },
                    {
                        "line": 5,
                        "time": 2570
                    },
                    {
                        "line": 4,
                        "time": 2578
                    },
                    {
                        "line": 5,
                        "time": 2638
                    },
                    {
                        "line": 1,
                        "time": 2650
                    },
                    {
                        "line": 0,
                        "time": 2658
                    },
                    {
                        "line": 4,
                        "time": 2674
                    },
                    {
                        "line": 5,
                        "time": 2682
                    },
                    {
                        "line": 0,
                        "time": 2738
                    },
                    {
                        "line": 2,
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
                        "line": 1,
                        "time": 146
                    },
                    {
                        "line": 5,
                        "time": 182
                    },
                    {
                        "line": 2,
                        "time": 194
                    },
                    {
                        "line": 1,
                        "time": 198
                    },
                    {
                        "line": 5,
                        "time": 214
                    },
                    {
                        "line": 0,
                        "time": 243
                    },
                    {
                        "line": 1,
                        "time": 258
                    },
                    {
                        "line": 3,
                        "time": 258
                    },
                    {
                        "line": 5,
                        "time": 262
                    },
                    {
                        "line": 0,
                        "time": 270
                    },
                    {
                        "line": 4,
                        "time": 282
                    },
                    {
                        "line": 0,
                        "time": 298
                    },
                    {
                        "line": 2,
                        "time": 310
                    },
                    {
                        "line": 1,
                        "time": 314
                    },
                    {
                        "line": 3,
                        "time": 314
                    },
                    {
                        "line": 5,
                        "time": 318
                    },
                    {
                        "line": 3,
                        "time": 334,
                        "type": "long",
                        "ends": 349
                    },
                    {
                        "line": 1,
                        "time": 338
                    },
                    {
                        "line": 4,
                        "time": 354,
                        "type": "long",
                        "ends": 369
                    },
                    {
                        "line": 2,
                        "time": 362,
                        "type": "long",
                        "ends": 377
                    },
                    {
                        "line": 1,
                        "time": 370,
                        "type": "long",
                        "ends": 385
                    },
                    {
                        "line": 3,
                        "time": 378
                    },
                    {
                        "line": 5,
                        "time": 378
                    },
                    {
                        "line": 0,
                        "time": 386,
                        "type": "long",
                        "ends": 401
                    },
                    {
                        "line": 3,
                        "time": 394
                    },
                    {
                        "line": 5,
                        "time": 394
                    },
                    {
                        "line": 4,
                        "time": 394
                    },
                    {
                        "line": 5,
                        "time": 418
                    },
                    {
                        "line": 4,
                        "time": 426
                    },
                    {
                        "line": 5,
                        "time": 434
                    },
                    {
                        "line": 1,
                        "time": 442
                    },
                    {
                        "line": 4,
                        "time": 442
                    },
                    {
                        "line": 0,
                        "time": 446
                    },
                    {
                        "line": 2,
                        "time": 450
                    },
                    {
                        "line": 4,
                        "time": 450
                    },
                    {
                        "line": 3,
                        "time": 458
                    },
                    {
                        "line": 5,
                        "time": 458
                    },
                    {
                        "line": 0,
                        "time": 466,
                        "type": "long",
                        "ends": 481
                    },
                    {
                        "line": 3,
                        "time": 474
                    },
                    {
                        "line": 4,
                        "time": 474
                    },
                    {
                        "line": 2,
                        "time": 482
                    },
                    {
                        "line": 1,
                        "time": 490
                    },
                    {
                        "line": 3,
                        "time": 490
                    },
                    {
                        "line": 2,
                        "time": 498
                    },
                    {
                        "line": 3,
                        "time": 502
                    },
                    {
                        "line": 5,
                        "time": 502
                    },
                    {
                        "line": 4,
                        "time": 506
                    },
                    {
                        "line": 2,
                        "time": 510
                    },
                    {
                        "line": 5,
                        "time": 510
                    },
                    {
                        "line": 1,
                        "time": 514
                    },
                    {
                        "line": 3,
                        "time": 514
                    },
                    {
                        "line": 2,
                        "time": 522
                    },
                    {
                        "line": 0,
                        "time": 526
                    },
                    {
                        "line": 4,
                        "time": 526
                    },
                    {
                        "line": 1,
                        "time": 530
                    },
                    {
                        "line": 0,
                        "time": 534
                    },
                    {
                        "line": 2,
                        "time": 534
                    },
                    {
                        "line": 4,
                        "time": 534
                    },
                    {
                        "line": 1,
                        "time": 538
                    },
                    {
                        "line": 0,
                        "time": 546
                    },
                    {
                        "line": 4,
                        "time": 546
                    },
                    {
                        "line": 2,
                        "time": 550
                    },
                    {
                        "line": 3,
                        "time": 550
                    },
                    {
                        "line": 5,
                        "time": 554
                    },
                    {
                        "line": 0,
                        "time": 558
                    },
                    {
                        "line": 1,
                        "time": 558
                    },
                    {
                        "line": 2,
                        "time": 562
                    },
                    {
                        "line": 5,
                        "time": 570
                    },
                    {
                        "line": 0,
                        "time": 570
                    },
                    {
                        "line": 3,
                        "time": 574,
                        "type": "long",
                        "ends": 589
                    },
                    {
                        "line": 1,
                        "time": 578
                    },
                    {
                        "line": 4,
                        "time": 578
                    },
                    {
                        "line": 2,
                        "time": 581
                    },
                    {
                        "line": 0,
                        "time": 586
                    },
                    {
                        "line": 1,
                        "time": 586
                    },
                    {
                        "line": 5,
                        "time": 594
                    },
                    {
                        "line": 4,
                        "time": 594
                    },
                    {
                        "line": 2,
                        "time": 602
                    },
                    {
                        "line": 5,
                        "time": 606
                    },
                    {
                        "line": 1,
                        "time": 606
                    },
                    {
                        "line": 2,
                        "time": 610,
                        "type": "long",
                        "ends": 625
                    },
                    {
                        "line": 3,
                        "time": 618
                    },
                    {
                        "line": 1,
                        "time": 618
                    },
                    {
                        "line": 4,
                        "time": 626
                    },
                    {
                        "line": 0,
                        "time": 626
                    },
                    {
                        "line": 1,
                        "time": 630
                    },
                    {
                        "line": 5,
                        "time": 630
                    },
                    {
                        "line": 0,
                        "time": 634
                    },
                    {
                        "line": 3,
                        "time": 638
                    },
                    {
                        "line": 5,
                        "time": 638
                    },
                    {
                        "line": 1,
                        "time": 642,
                        "type": "long",
                        "ends": 657
                    },
                    {
                        "line": 4,
                        "time": 650
                    },
                    {
                        "line": 0,
                        "time": 650
                    },
                    {
                        "line": 3,
                        "time": 655
                    },
                    {
                        "line": 4,
                        "time": 658
                    },
                    {
                        "line": 2,
                        "time": 658
                    },
                    {
                        "line": 3,
                        "time": 666
                    },
                    {
                        "line": 5,
                        "time": 674
                    },
                    {
                        "line": 4,
                        "time": 674
                    },
                    {
                        "line": 3,
                        "time": 682
                    },
                    {
                        "line": 0,
                        "time": 682
                    },
                    {
                        "line": 4,
                        "time": 690
                    },
                    {
                        "line": 5,
                        "time": 694
                    },
                    {
                        "line": 3,
                        "time": 694
                    },
                    {
                        "line": 4,
                        "time": 698
                    },
                    {
                        "line": 0,
                        "time": 698
                    },
                    {
                        "line": 5,
                        "time": 702
                    },
                    {
                        "line": 2,
                        "time": 706
                    },
                    {
                        "line": 3,
                        "time": 706
                    },
                    {
                        "line": 1,
                        "time": 711
                    },
                    {
                        "line": 0,
                        "time": 714
                    },
                    {
                        "line": 4,
                        "time": 714
                    },
                    {
                        "line": 5,
                        "time": 719,
                        "type": "long",
                        "ends": 734
                    },
                    {
                        "line": 1,
                        "time": 719,
                        "type": "long",
                        "ends": 734
                    },
                    {
                        "line": 3,
                        "time": 722
                    },
                    {
                        "line": 0,
                        "time": 730
                    },
                    {
                        "line": 4,
                        "time": 730
                    },
                    {
                        "line": 3,
                        "time": 738
                    },
                    {
                        "line": 2,
                        "time": 738
                    },
                    {
                        "line": 0,
                        "time": 746
                    },
                    {
                        "line": 3,
                        "time": 754
                    },
                    {
                        "line": 2,
                        "time": 754
                    },
                    {
                        "line": 5,
                        "time": 758
                    },
                    {
                        "line": 4,
                        "time": 758
                    },
                    {
                        "line": 0,
                        "time": 762
                    },
                    {
                        "line": 3,
                        "time": 762
                    },
                    {
                        "line": 2,
                        "time": 766
                    },
                    {
                        "line": 4,
                        "time": 770
                    },
                    {
                        "line": 1,
                        "time": 770
                    },
                    {
                        "line": 0,
                        "time": 778
                    },
                    {
                        "line": 3,
                        "time": 782
                    },
                    {
                        "line": 2,
                        "time": 782
                    },
                    {
                        "line": 1,
                        "time": 782
                    },
                    {
                        "line": 0,
                        "time": 786,
                        "type": "long",
                        "ends": 801
                    },
                    {
                        "line": 4,
                        "time": 790
                    },
                    {
                        "line": 3,
                        "time": 790
                    },
                    {
                        "line": 2,
                        "time": 794
                    },
                    {
                        "line": 4,
                        "time": 802
                    },
                    {
                        "line": 5,
                        "time": 802
                    },
                    {
                        "line": 1,
                        "time": 806
                    },
                    {
                        "line": 3,
                        "time": 810
                    },
                    {
                        "line": 2,
                        "time": 810
                    },
                    {
                        "line": 1,
                        "time": 818
                    },
                    {
                        "line": 3,
                        "time": 826
                    },
                    {
                        "line": 5,
                        "time": 826
                    },
                    {
                        "line": 0,
                        "time": 834,
                        "type": "long",
                        "ends": 849
                    },
                    {
                        "line": 1,
                        "time": 842
                    },
                    {
                        "line": 4,
                        "time": 842
                    },
                    {
                        "line": 5,
                        "time": 850
                    },
                    {
                        "line": 3,
                        "time": 850
                    },
                    {
                        "line": 4,
                        "time": 858
                    },
                    {
                        "line": 1,
                        "time": 858
                    },
                    {
                        "line": 2,
                        "time": 866,
                        "type": "long",
                        "ends": 881
                    },
                    {
                        "line": 3,
                        "time": 874
                    },
                    {
                        "line": 5,
                        "time": 874
                    },
                    {
                        "line": 1,
                        "time": 882
                    },
                    {
                        "line": 0,
                        "time": 882
                    },
                    {
                        "line": 5,
                        "time": 890,
                        "type": "long",
                        "ends": 905
                    },
                    {
                        "line": 0,
                        "time": 894
                    },
                    {
                        "line": 3,
                        "time": 894
                    },
                    {
                        "line": 1,
                        "time": 898
                    },
                    {
                        "line": 4,
                        "time": 898
                    },
                    {
                        "line": 3,
                        "time": 906
                    },
                    {
                        "line": 0,
                        "time": 910,
                        "type": "long",
                        "ends": 925
                    },
                    {
                        "line": 4,
                        "time": 910,
                        "type": "long",
                        "ends": 925
                    },
                    {
                        "line": 1,
                        "time": 914
                    },
                    {
                        "line": 2,
                        "time": 914
                    },
                    {
                        "line": 3,
                        "time": 922
                    },
                    {
                        "line": 2,
                        "time": 930
                    },
                    {
                        "line": 1,
                        "time": 938
                    },
                    {
                        "line": 3,
                        "time": 938
                    },
                    {
                        "line": 5,
                        "time": 946
                    },
                    {
                        "line": 2,
                        "time": 946
                    },
                    {
                        "line": 1,
                        "time": 954
                    },
                    {
                        "line": 4,
                        "time": 958
                    },
                    {
                        "line": 2,
                        "time": 958
                    },
                    {
                        "line": 3,
                        "time": 962
                    },
                    {
                        "line": 1,
                        "time": 966
                    },
                    {
                        "line": 0,
                        "time": 966
                    },
                    {
                        "line": 5,
                        "time": 970
                    },
                    {
                        "line": 0,
                        "time": 978
                    },
                    {
                        "line": 1,
                        "time": 978
                    },
                    {
                        "line": 2,
                        "time": 982
                    },
                    {
                        "line": 4,
                        "time": 982
                    },
                    {
                        "line": 0,
                        "time": 986
                    },
                    {
                        "line": 4,
                        "time": 994
                    },
                    {
                        "line": 5,
                        "time": 994
                    },
                    {
                        "line": 2,
                        "time": 998,
                        "type": "long",
                        "ends": 1013
                    },
                    {
                        "line": 1,
                        "time": 998,
                        "type": "long",
                        "ends": 1013
                    },
                    {
                        "line": 3,
                        "time": 1002
                    },
                    {
                        "line": 5,
                        "time": 1002
                    },
                    {
                        "line": 0,
                        "time": 1010,
                        "type": "long",
                        "ends": 1025
                    },
                    {
                        "line": 4,
                        "time": 1014
                    },
                    {
                        "line": 3,
                        "time": 1014
                    },
                    {
                        "line": 5,
                        "time": 1014
                    },
                    {
                        "line": 4,
                        "time": 1022
                    },
                    {
                        "line": 5,
                        "time": 1022
                    },
                    {
                        "line": 3,
                        "time": 1026
                    },
                    {
                        "line": 5,
                        "time": 1030,
                        "type": "long",
                        "ends": 1045
                    },
                    {
                        "line": 4,
                        "time": 1034
                    },
                    {
                        "line": 3,
                        "time": 1034
                    },
                    {
                        "line": 2,
                        "time": 1038
                    },
                    {
                        "line": 1,
                        "time": 1042
                    },
                    {
                        "line": 4,
                        "time": 1042
                    },
                    {
                        "line": 2,
                        "time": 1050
                    },
                    {
                        "line": 3,
                        "time": 1050
                    },
                    {
                        "line": 4,
                        "time": 1058
                    },
                    {
                        "line": 0,
                        "time": 1062
                    },
                    {
                        "line": 3,
                        "time": 1062
                    },
                    {
                        "line": 2,
                        "time": 1066
                    },
                    {
                        "line": 3,
                        "time": 1070
                    },
                    {
                        "line": 5,
                        "time": 1070
                    },
                    {
                        "line": 2,
                        "time": 1074
                    },
                    {
                        "line": 4,
                        "time": 1074
                    },
                    {
                        "line": 3,
                        "time": 1082
                    },
                    {
                        "line": 5,
                        "time": 1090
                    },
                    {
                        "line": 1,
                        "time": 1090
                    },
                    {
                        "line": 0,
                        "time": 1098
                    },
                    {
                        "line": 5,
                        "time": 1103
                    },
                    {
                        "line": 4,
                        "time": 1103
                    },
                    {
                        "line": 2,
                        "time": 1106
                    },
                    {
                        "line": 0,
                        "time": 1114
                    },
                    {
                        "line": 4,
                        "time": 1114
                    },
                    {
                        "line": 3,
                        "time": 1118
                    },
                    {
                        "line": 5,
                        "time": 1122
                    },
                    {
                        "line": 0,
                        "time": 1122
                    },
                    {
                        "line": 2,
                        "time": 1122
                    },
                    {
                        "line": 3,
                        "time": 1130
                    },
                    {
                        "line": 4,
                        "time": 1130
                    },
                    {
                        "line": 0,
                        "time": 1138
                    },
                    {
                        "line": 2,
                        "time": 1146
                    },
                    {
                        "line": 1,
                        "time": 1146
                    },
                    {
                        "line": 3,
                        "time": 1154
                    },
                    {
                        "line": 0,
                        "time": 1154
                    },
                    {
                        "line": 4,
                        "time": 1162
                    },
                    {
                        "line": 1,
                        "time": 1170,
                        "type": "long",
                        "ends": 1185
                    },
                    {
                        "line": 0,
                        "time": 1170,
                        "type": "long",
                        "ends": 1185
                    },
                    {
                        "line": 4,
                        "time": 1178
                    },
                    {
                        "line": 5,
                        "time": 1178
                    },
                    {
                        "line": 2,
                        "time": 1186,
                        "type": "long",
                        "ends": 1201
                    },
                    {
                        "line": 5,
                        "time": 1191
                    },
                    {
                        "line": 3,
                        "time": 1194
                    },
                    {
                        "line": 4,
                        "time": 1194
                    },
                    {
                        "line": 5,
                        "time": 1200
                    },
                    {
                        "line": 4,
                        "time": 1202
                    },
                    {
                        "line": 3,
                        "time": 1202
                    },
                    {
                        "line": 5,
                        "time": 1202
                    },
                    {
                        "line": 1,
                        "time": 1210
                    },
                    {
                        "line": 5,
                        "time": 1210
                    },
                    {
                        "line": 3,
                        "time": 1216
                    },
                    {
                        "line": 4,
                        "time": 1216
                    },
                    {
                        "line": 5,
                        "time": 1218
                    },
                    {
                        "line": 0,
                        "time": 1218
                    },
                    {
                        "line": 3,
                        "time": 1226
                    },
                    {
                        "line": 4,
                        "time": 1226
                    },
                    {
                        "line": 0,
                        "time": 1232
                    },
                    {
                        "line": 4,
                        "time": 1234
                    },
                    {
                        "line": 3,
                        "time": 1242
                    },
                    {
                        "line": 0,
                        "time": 1242
                    },
                    {
                        "line": 4,
                        "time": 1250
                    },
                    {
                        "line": 2,
                        "time": 1250
                    },
                    {
                        "line": 1,
                        "time": 1258
                    },
                    {
                        "line": 3,
                        "time": 1258
                    },
                    {
                        "line": 2,
                        "time": 1266,
                        "type": "long",
                        "ends": 1281
                    },
                    {
                        "line": 3,
                        "time": 1271
                    },
                    {
                        "line": 4,
                        "time": 1271
                    },
                    {
                        "line": 5,
                        "time": 1274
                    },
                    {
                        "line": 1,
                        "time": 1274
                    },
                    {
                        "line": 3,
                        "time": 1274
                    },
                    {
                        "line": 4,
                        "time": 1279
                    },
                    {
                        "line": 5,
                        "time": 1282
                    },
                    {
                        "line": 0,
                        "time": 1282
                    },
                    {
                        "line": 1,
                        "time": 1290
                    },
                    {
                        "line": 0,
                        "time": 1298
                    },
                    {
                        "line": 5,
                        "time": 1298
                    },
                    {
                        "line": 3,
                        "time": 1306
                    },
                    {
                        "line": 1,
                        "time": 1306
                    },
                    {
                        "line": 5,
                        "time": 1312
                    },
                    {
                        "line": 2,
                        "time": 1314
                    },
                    {
                        "line": 4,
                        "time": 1319
                    },
                    {
                        "line": 1,
                        "time": 1322
                    },
                    {
                        "line": 0,
                        "time": 1322
                    },
                    {
                        "line": 4,
                        "time": 1330
                    },
                    {
                        "line": 5,
                        "time": 1335
                    },
                    {
                        "line": 3,
                        "time": 1335
                    },
                    {
                        "line": 0,
                        "time": 1338
                    },
                    {
                        "line": 1,
                        "time": 1344
                    },
                    {
                        "line": 4,
                        "time": 1344
                    },
                    {
                        "line": 3,
                        "time": 1346
                    },
                    {
                        "line": 2,
                        "time": 1354
                    },
                    {
                        "line": 1,
                        "time": 1354
                    },
                    {
                        "line": 5,
                        "time": 1362
                    },
                    {
                        "line": 3,
                        "time": 1362
                    },
                    {
                        "line": 0,
                        "time": 1367
                    },
                    {
                        "line": 5,
                        "time": 1369
                    },
                    {
                        "line": 4,
                        "time": 1378
                    },
                    {
                        "line": 0,
                        "time": 1378
                    },
                    {
                        "line": 3,
                        "time": 1386
                    },
                    {
                        "line": 1,
                        "time": 1394
                    },
                    {
                        "line": 2,
                        "time": 1394
                    },
                    {
                        "line": 4,
                        "time": 1399,
                        "type": "long",
                        "ends": 1414
                    },
                    {
                        "line": 5,
                        "time": 1399,
                        "type": "long",
                        "ends": 1414
                    },
                    {
                        "line": 3,
                        "time": 1402
                    },
                    {
                        "line": 1,
                        "time": 1407
                    },
                    {
                        "line": 0,
                        "time": 1407
                    },
                    {
                        "line": 3,
                        "time": 1410
                    },
                    {
                        "line": 2,
                        "time": 1418
                    },
                    {
                        "line": 1,
                        "time": 1418
                    },
                    {
                        "line": 3,
                        "time": 1426
                    },
                    {
                        "line": 0,
                        "time": 1426
                    },
                    {
                        "line": 2,
                        "time": 1434
                    },
                    {
                        "line": 1,
                        "time": 1434
                    },
                    {
                        "line": 4,
                        "time": 1442
                    },
                    {
                        "line": 0,
                        "time": 1442
                    },
                    {
                        "line": 3,
                        "time": 1450
                    },
                    {
                        "line": 5,
                        "time": 1458
                    },
                    {
                        "line": 0,
                        "time": 1458
                    },
                    {
                        "line": 4,
                        "time": 1463
                    },
                    {
                        "line": 3,
                        "time": 1466
                    },
                    {
                        "line": 0,
                        "time": 1466
                    },
                    {
                        "line": 5,
                        "time": 1474
                    },
                    {
                        "line": 2,
                        "time": 1482
                    },
                    {
                        "line": 0,
                        "time": 1482
                    },
                    {
                        "line": 3,
                        "time": 1490
                    },
                    {
                        "line": 4,
                        "time": 1490
                    },
                    {
                        "line": 0,
                        "time": 1498
                    },
                    {
                        "line": 5,
                        "time": 1506
                    },
                    {
                        "line": 1,
                        "time": 1506
                    },
                    {
                        "line": 3,
                        "time": 1514
                    },
                    {
                        "line": 0,
                        "time": 1522
                    },
                    {
                        "line": 1,
                        "time": 1522
                    },
                    {
                        "line": 5,
                        "time": 1527
                    },
                    {
                        "line": 2,
                        "time": 1527
                    },
                    {
                        "line": 1,
                        "time": 1530
                    },
                    {
                        "line": 4,
                        "time": 1535
                    },
                    {
                        "line": 3,
                        "time": 1535
                    },
                    {
                        "line": 0,
                        "time": 1538,
                        "type": "long",
                        "ends": 1553
                    },
                    {
                        "line": 3,
                        "time": 1546
                    },
                    {
                        "line": 1,
                        "time": 1546
                    },
                    {
                        "line": 5,
                        "time": 1546
                    },
                    {
                        "line": 4,
                        "time": 1554,
                        "type": "long",
                        "ends": 1569
                    },
                    {
                        "line": 3,
                        "time": 1562
                    },
                    {
                        "line": 2,
                        "time": 1562
                    },
                    {
                        "line": 5,
                        "time": 1570
                    },
                    {
                        "line": 1,
                        "time": 1570
                    },
                    {
                        "line": 3,
                        "time": 1578
                    },
                    {
                        "line": 0,
                        "time": 1586
                    },
                    {
                        "line": 2,
                        "time": 1586
                    },
                    {
                        "line": 5,
                        "time": 1591
                    },
                    {
                        "line": 0,
                        "time": 1594
                    },
                    {
                        "line": 1,
                        "time": 1594
                    },
                    {
                        "line": 5,
                        "time": 1602
                    },
                    {
                        "line": 3,
                        "time": 1610
                    },
                    {
                        "line": 4,
                        "time": 1610
                    },
                    {
                        "line": 5,
                        "time": 1618,
                        "type": "long",
                        "ends": 1633
                    },
                    {
                        "line": 4,
                        "time": 1626,
                        "type": "long",
                        "ends": 1641
                    },
                    {
                        "line": 2,
                        "time": 1626,
                        "type": "long",
                        "ends": 1641
                    },
                    {
                        "line": 3,
                        "time": 1631
                    },
                    {
                        "line": 0,
                        "time": 1634
                    },
                    {
                        "line": 1,
                        "time": 1634
                    },
                    {
                        "line": 3,
                        "time": 1642
                    },
                    {
                        "line": 1,
                        "time": 1650
                    },
                    {
                        "line": 0,
                        "time": 1650
                    },
                    {
                        "line": 3,
                        "time": 1654
                    },
                    {
                        "line": 5,
                        "time": 1658
                    },
                    {
                        "line": 1,
                        "time": 1658
                    },
                    {
                        "line": 0,
                        "time": 1662
                    },
                    {
                        "line": 4,
                        "time": 1664
                    },
                    {
                        "line": 5,
                        "time": 1664
                    },
                    {
                        "line": 3,
                        "time": 1666
                    },
                    {
                        "line": 1,
                        "time": 1666
                    },
                    {
                        "line": 4,
                        "time": 1670
                    },
                    {
                        "line": 5,
                        "time": 1670
                    },
                    {
                        "line": 3,
                        "time": 1674
                    },
                    {
                        "line": 4,
                        "time": 1678
                    },
                    {
                        "line": 0,
                        "time": 1678
                    },
                    {
                        "line": 3,
                        "time": 1682,
                        "type": "long",
                        "ends": 1697
                    },
                    {
                        "line": 1,
                        "time": 1686
                    },
                    {
                        "line": 4,
                        "time": 1686
                    },
                    {
                        "line": 2,
                        "time": 1690
                    },
                    {
                        "line": 5,
                        "time": 1690
                    },
                    {
                        "line": 4,
                        "time": 1694
                    },
                    {
                        "line": 5,
                        "time": 1698
                    },
                    {
                        "line": 1,
                        "time": 1698
                    },
                    {
                        "line": 2,
                        "time": 1702
                    },
                    {
                        "line": 0,
                        "time": 1706
                    },
                    {
                        "line": 5,
                        "time": 1706
                    },
                    {
                        "line": 4,
                        "time": 1710
                    },
                    {
                        "line": 1,
                        "time": 1710
                    },
                    {
                        "line": 5,
                        "time": 1714
                    },
                    {
                        "line": 4,
                        "time": 1718
                    },
                    {
                        "line": 0,
                        "time": 1718
                    },
                    {
                        "line": 1,
                        "time": 1722
                    },
                    {
                        "line": 2,
                        "time": 1722
                    },
                    {
                        "line": 4,
                        "time": 1726
                    },
                    {
                        "line": 0,
                        "time": 1726
                    },
                    {
                        "line": 1,
                        "time": 1730
                    },
                    {
                        "line": 4,
                        "time": 1734
                    },
                    {
                        "line": 3,
                        "time": 1734
                    },
                    {
                        "line": 1,
                        "time": 1738
                    },
                    {
                        "line": 3,
                        "time": 1742
                    },
                    {
                        "line": 0,
                        "time": 1742
                    },
                    {
                        "line": 2,
                        "time": 1746
                    },
                    {
                        "line": 5,
                        "time": 1746
                    },
                    {
                        "line": 3,
                        "time": 1754
                    },
                    {
                        "line": 5,
                        "time": 1762
                    },
                    {
                        "line": 2,
                        "time": 1762
                    },
                    {
                        "line": 3,
                        "time": 1764
                    },
                    {
                        "line": 0,
                        "time": 1764
                    },
                    {
                        "line": 2,
                        "time": 1770
                    },
                    {
                        "line": 4,
                        "time": 1772
                    },
                    {
                        "line": 1,
                        "time": 1772
                    },
                    {
                        "line": 3,
                        "time": 1772
                    },
                    {
                        "line": 0,
                        "time": 1778
                    },
                    {
                        "line": 2,
                        "time": 1778
                    },
                    {
                        "line": 5,
                        "time": 1782
                    },
                    {
                        "line": 3,
                        "time": 1786
                    },
                    {
                        "line": 4,
                        "time": 1786
                    },
                    {
                        "line": 5,
                        "time": 1790
                    },
                    {
                        "line": 0,
                        "time": 1794
                    },
                    {
                        "line": 4,
                        "time": 1794
                    },
                    {
                        "line": 3,
                        "time": 1794
                    },
                    {
                        "line": 2,
                        "time": 1798
                    },
                    {
                        "line": 1,
                        "time": 1798
                    },
                    {
                        "line": 0,
                        "time": 1802
                    },
                    {
                        "line": 1,
                        "time": 1806
                    },
                    {
                        "line": 5,
                        "time": 1806
                    },
                    {
                        "line": 2,
                        "time": 1810
                    },
                    {
                        "line": 0,
                        "time": 1810
                    },
                    {
                        "line": 4,
                        "time": 1814
                    },
                    {
                        "line": 5,
                        "time": 1814
                    },
                    {
                        "line": 2,
                        "time": 1818,
                        "type": "long",
                        "ends": 1833
                    },
                    {
                        "line": 1,
                        "time": 1822
                    },
                    {
                        "line": 3,
                        "time": 1822
                    },
                    {
                        "line": 4,
                        "time": 1826
                    },
                    {
                        "line": 3,
                        "time": 1830
                    },
                    {
                        "line": 1,
                        "time": 1830
                    },
                    {
                        "line": 0,
                        "time": 1834
                    },
                    {
                        "line": 3,
                        "time": 1838
                    },
                    {
                        "line": 1,
                        "time": 1838
                    },
                    {
                        "line": 0,
                        "time": 1846
                    },
                    {
                        "line": 1,
                        "time": 1858
                    },
                    {
                        "line": 3,
                        "time": 1858
                    },
                    {
                        "line": 0,
                        "time": 1862
                    },
                    {
                        "line": 5,
                        "time": 1862
                    },
                    {
                        "line": 1,
                        "time": 1866
                    },
                    {
                        "line": 3,
                        "time": 1870
                    },
                    {
                        "line": 4,
                        "time": 1870
                    },
                    {
                        "line": 0,
                        "time": 1874,
                        "type": "long",
                        "ends": 1889
                    },
                    {
                        "line": 3,
                        "time": 1878
                    },
                    {
                        "line": 1,
                        "time": 1878
                    },
                    {
                        "line": 2,
                        "time": 1882
                    },
                    {
                        "line": 4,
                        "time": 1882
                    },
                    {
                        "line": 3,
                        "time": 1886
                    },
                    {
                        "line": 4,
                        "time": 1890
                    },
                    {
                        "line": 1,
                        "time": 1890
                    },
                    {
                        "line": 2,
                        "time": 1894
                    },
                    {
                        "line": 5,
                        "time": 1894
                    },
                    {
                        "line": 3,
                        "time": 1898
                    },
                    {
                        "line": 4,
                        "time": 1902
                    },
                    {
                        "line": 5,
                        "time": 1902
                    },
                    {
                        "line": 1,
                        "time": 1906
                    },
                    {
                        "line": 2,
                        "time": 1906
                    },
                    {
                        "line": 5,
                        "time": 1910
                    },
                    {
                        "line": 2,
                        "time": 1914
                    },
                    {
                        "line": 1,
                        "time": 1914
                    },
                    {
                        "line": 3,
                        "time": 1916
                    },
                    {
                        "line": 4,
                        "time": 1918
                    },
                    {
                        "line": 1,
                        "time": 1918
                    },
                    {
                        "line": 0,
                        "time": 1922
                    },
                    {
                        "line": 2,
                        "time": 1922
                    },
                    {
                        "line": 3,
                        "time": 1926
                    },
                    {
                        "line": 1,
                        "time": 1930
                    },
                    {
                        "line": 2,
                        "time": 1930
                    },
                    {
                        "line": 0,
                        "time": 1934
                    },
                    {
                        "line": 5,
                        "time": 1934
                    },
                    {
                        "line": 1,
                        "time": 1938,
                        "type": "long",
                        "ends": 1953
                    },
                    {
                        "line": 3,
                        "time": 1942
                    },
                    {
                        "line": 0,
                        "time": 1942
                    },
                    {
                        "line": 5,
                        "time": 1946,
                        "type": "long",
                        "ends": 1961
                    },
                    {
                        "line": 3,
                        "time": 1950
                    },
                    {
                        "line": 0,
                        "time": 1950
                    },
                    {
                        "line": 2,
                        "time": 1954
                    },
                    {
                        "line": 4,
                        "time": 1954
                    },
                    {
                        "line": 3,
                        "time": 1957
                    },
                    {
                        "line": 2,
                        "time": 1962
                    },
                    {
                        "line": 0,
                        "time": 1962
                    },
                    {
                        "line": 4,
                        "time": 1966
                    },
                    {
                        "line": 3,
                        "time": 1970
                    },
                    {
                        "line": 0,
                        "time": 1970
                    },
                    {
                        "line": 2,
                        "time": 1974
                    },
                    {
                        "line": 4,
                        "time": 1974
                    },
                    {
                        "line": 0,
                        "time": 1978
                    },
                    {
                        "line": 1,
                        "time": 1978
                    },
                    {
                        "line": 2,
                        "time": 1982
                    },
                    {
                        "line": 5,
                        "time": 1986
                    },
                    {
                        "line": 0,
                        "time": 1986
                    },
                    {
                        "line": 4,
                        "time": 1986
                    },
                    {
                        "line": 1,
                        "time": 1990
                    },
                    {
                        "line": 3,
                        "time": 1990
                    },
                    {
                        "line": 5,
                        "time": 1994
                    },
                    {
                        "line": 3,
                        "time": 1998
                    },
                    {
                        "line": 0,
                        "time": 1998
                    },
                    {
                        "line": 4,
                        "time": 2002
                    },
                    {
                        "line": 1,
                        "time": 2002
                    },
                    {
                        "line": 3,
                        "time": 2006,
                        "type": "long",
                        "ends": 2021
                    },
                    {
                        "line": 5,
                        "time": 2010
                    },
                    {
                        "line": 1,
                        "time": 2010
                    },
                    {
                        "line": 0,
                        "time": 2014
                    },
                    {
                        "line": 2,
                        "time": 2018
                    },
                    {
                        "line": 5,
                        "time": 2018
                    },
                    {
                        "line": 0,
                        "time": 2026
                    },
                    {
                        "line": 1,
                        "time": 2026
                    },
                    {
                        "line": 2,
                        "time": 2034
                    },
                    {
                        "line": 5,
                        "time": 2038
                    },
                    {
                        "line": 4,
                        "time": 2038
                    },
                    {
                        "line": 2,
                        "time": 2042
                    },
                    {
                        "line": 1,
                        "time": 2046
                    },
                    {
                        "line": 0,
                        "time": 2046
                    },
                    {
                        "line": 5,
                        "time": 2050
                    },
                    {
                        "line": 3,
                        "time": 2050
                    },
                    {
                        "line": 4,
                        "time": 2050
                    },
                    {
                        "line": 1,
                        "time": 2054
                    },
                    {
                        "line": 0,
                        "time": 2054
                    },
                    {
                        "line": 5,
                        "time": 2058
                    },
                    {
                        "line": 0,
                        "time": 2062
                    },
                    {
                        "line": 3,
                        "time": 2062
                    },
                    {
                        "line": 1,
                        "time": 2066
                    },
                    {
                        "line": 3,
                        "time": 2074
                    },
                    {
                        "line": 4,
                        "time": 2074
                    },
                    {
                        "line": 1,
                        "time": 2078
                    },
                    {
                        "line": 5,
                        "time": 2078
                    },
                    {
                        "line": 3,
                        "time": 2082
                    },
                    {
                        "line": 1,
                        "time": 2086
                    },
                    {
                        "line": 0,
                        "time": 2086
                    },
                    {
                        "line": 2,
                        "time": 2090
                    },
                    {
                        "line": 0,
                        "time": 2099
                    },
                    {
                        "line": 3,
                        "time": 2099
                    },
                    {
                        "line": 1,
                        "time": 2102
                    },
                    {
                        "line": 4,
                        "time": 2107
                    },
                    {
                        "line": 5,
                        "time": 2107
                    },
                    {
                        "line": 1,
                        "time": 2110
                    },
                    {
                        "line": 4,
                        "time": 2114
                    },
                    {
                        "line": 0,
                        "time": 2114
                    },
                    {
                        "line": 1,
                        "time": 2118
                    },
                    {
                        "line": 3,
                        "time": 2122
                    },
                    {
                        "line": 0,
                        "time": 2122
                    },
                    {
                        "line": 1,
                        "time": 2126
                    },
                    {
                        "line": 5,
                        "time": 2126
                    },
                    {
                        "line": 0,
                        "time": 2130
                    },
                    {
                        "line": 1,
                        "time": 2134
                    },
                    {
                        "line": 2,
                        "time": 2134
                    },
                    {
                        "line": 4,
                        "time": 2138
                    },
                    {
                        "line": 0,
                        "time": 2138
                    },
                    {
                        "line": 1,
                        "time": 2142
                    },
                    {
                        "line": 3,
                        "time": 2146
                    },
                    {
                        "line": 0,
                        "time": 2146
                    },
                    {
                        "line": 4,
                        "time": 2146
                    },
                    {
                        "line": 5,
                        "time": 2150
                    },
                    {
                        "line": 1,
                        "time": 2150
                    },
                    {
                        "line": 2,
                        "time": 2150
                    },
                    {
                        "line": 0,
                        "time": 2154
                    },
                    {
                        "line": 4,
                        "time": 2154
                    },
                    {
                        "line": 1,
                        "time": 2158
                    },
                    {
                        "line": 4,
                        "time": 2162
                    },
                    {
                        "line": 5,
                        "time": 2162
                    },
                    {
                        "line": 3,
                        "time": 2168
                    },
                    {
                        "line": 0,
                        "time": 2168
                    },
                    {
                        "line": 4,
                        "time": 2170
                    },
                    {
                        "line": 1,
                        "time": 2174
                    },
                    {
                        "line": 5,
                        "time": 2174
                    },
                    {
                        "line": 3,
                        "time": 2174
                    },
                    {
                        "line": 4,
                        "time": 2176
                    },
                    {
                        "line": 5,
                        "time": 2178
                    },
                    {
                        "line": 3,
                        "time": 2178
                    },
                    {
                        "line": 1,
                        "time": 2182
                    },
                    {
                        "line": 0,
                        "time": 2182
                    },
                    {
                        "line": 2,
                        "time": 2186
                    },
                    {
                        "line": 3,
                        "time": 2190
                    },
                    {
                        "line": 0,
                        "time": 2190
                    },
                    {
                        "line": 5,
                        "time": 2194
                    },
                    {
                        "line": 2,
                        "time": 2194
                    },
                    {
                        "line": 3,
                        "time": 2198
                    },
                    {
                        "line": 1,
                        "time": 2198
                    },
                    {
                        "line": 2,
                        "time": 2202
                    },
                    {
                        "line": 3,
                        "time": 2206
                    },
                    {
                        "line": 4,
                        "time": 2206
                    },
                    {
                        "line": 0,
                        "time": 2210,
                        "type": "long",
                        "ends": 2225
                    },
                    {
                        "line": 5,
                        "time": 2214
                    },
                    {
                        "line": 4,
                        "time": 2214
                    },
                    {
                        "line": 2,
                        "time": 2218
                    },
                    {
                        "line": 5,
                        "time": 2222
                    },
                    {
                        "line": 4,
                        "time": 2222
                    },
                    {
                        "line": 1,
                        "time": 2226
                    },
                    {
                        "line": 2,
                        "time": 2226
                    },
                    {
                        "line": 5,
                        "time": 2230
                    },
                    {
                        "line": 4,
                        "time": 2230
                    },
                    {
                        "line": 3,
                        "time": 2234
                    },
                    {
                        "line": 1,
                        "time": 2238
                    },
                    {
                        "line": 5,
                        "time": 2238
                    },
                    {
                        "line": 3,
                        "time": 2242
                    },
                    {
                        "line": 4,
                        "time": 2246
                    },
                    {
                        "line": 1,
                        "time": 2246
                    },
                    {
                        "line": 2,
                        "time": 2250
                    },
                    {
                        "line": 3,
                        "time": 2250
                    },
                    {
                        "line": 1,
                        "time": 2254
                    },
                    {
                        "line": 2,
                        "time": 2258
                    },
                    {
                        "line": 0,
                        "time": 2258
                    },
                    {
                        "line": 5,
                        "time": 2262
                    },
                    {
                        "line": 3,
                        "time": 2266
                    },
                    {
                        "line": 0,
                        "time": 2266
                    },
                    {
                        "line": 2,
                        "time": 2270,
                        "type": "long",
                        "ends": 2285
                    },
                    {
                        "line": 5,
                        "time": 2270,
                        "type": "long",
                        "ends": 2285
                    },
                    {
                        "line": 0,
                        "time": 2274
                    },
                    {
                        "line": 1,
                        "time": 2274
                    },
                    {
                        "line": 3,
                        "time": 2278
                    },
                    {
                        "line": 4,
                        "time": 2282
                    },
                    {
                        "line": 0,
                        "time": 2282
                    },
                    {
                        "line": 1,
                        "time": 2286,
                        "type": "long",
                        "ends": 2301
                    },
                    {
                        "line": 3,
                        "time": 2286,
                        "type": "long",
                        "ends": 2301
                    },
                    {
                        "line": 4,
                        "time": 2290
                    },
                    {
                        "line": 0,
                        "time": 2290
                    },
                    {
                        "line": 0,
                        "time": 2298
                    },
                    {
                        "line": 4,
                        "time": 2298
                    },
                    {
                        "line": 4,
                        "time": 2302,
                        "type": "long",
                        "ends": 2317
                    },
                    {
                        "line": 0,
                        "time": 2306
                    },
                    {
                        "line": 5,
                        "time": 2310
                    },
                    {
                        "line": 2,
                        "time": 2310
                    },
                    {
                        "line": 0,
                        "time": 2314
                    },
                    {
                        "line": 2,
                        "time": 2318
                    },
                    {
                        "line": 5,
                        "time": 2318
                    },
                    {
                        "line": 0,
                        "time": 2322
                    },
                    {
                        "line": 5,
                        "time": 2326
                    },
                    {
                        "line": 1,
                        "time": 2326
                    },
                    {
                        "line": 0,
                        "time": 2330
                    },
                    {
                        "line": 3,
                        "time": 2330
                    },
                    {
                        "line": 1,
                        "time": 2334,
                        "type": "long",
                        "ends": 2349
                    },
                    {
                        "line": 2,
                        "time": 2338
                    },
                    {
                        "line": 3,
                        "time": 2338
                    },
                    {
                        "line": 0,
                        "time": 2338
                    },
                    {
                        "line": 4,
                        "time": 2342
                    },
                    {
                        "line": 5,
                        "time": 2342
                    },
                    {
                        "line": 0,
                        "time": 2346
                    },
                    {
                        "line": 2,
                        "time": 2350
                    },
                    {
                        "line": 4,
                        "time": 2350
                    },
                    {
                        "line": 0,
                        "time": 2354
                    },
                    {
                        "line": 5,
                        "time": 2354
                    },
                    {
                        "line": 4,
                        "time": 2358
                    },
                    {
                        "line": 5,
                        "time": 2362
                    },
                    {
                        "line": 0,
                        "time": 2362
                    },
                    {
                        "line": 2,
                        "time": 2362
                    },
                    {
                        "line": 4,
                        "time": 2366
                    },
                    {
                        "line": 3,
                        "time": 2366
                    },
                    {
                        "line": 0,
                        "time": 2366
                    },
                    {
                        "line": 2,
                        "time": 2370
                    },
                    {
                        "line": 5,
                        "time": 2374
                    },
                    {
                        "line": 1,
                        "time": 2374
                    },
                    {
                        "line": 2,
                        "time": 2378
                    },
                    {
                        "line": 1,
                        "time": 2382
                    },
                    {
                        "line": 4,
                        "time": 2382
                    },
                    {
                        "line": 5,
                        "time": 2382
                    },
                    {
                        "line": 3,
                        "time": 2386
                    },
                    {
                        "line": 2,
                        "time": 2386
                    },
                    {
                        "line": 1,
                        "time": 2390
                    },
                    {
                        "line": 4,
                        "time": 2390
                    },
                    {
                        "line": 0,
                        "time": 2394
                    },
                    {
                        "line": 4,
                        "time": 2398
                    },
                    {
                        "line": 5,
                        "time": 2398
                    },
                    {
                        "line": 2,
                        "time": 2398
                    },
                    {
                        "line": 0,
                        "time": 2402
                    },
                    {
                        "line": 2,
                        "time": 2406
                    },
                    {
                        "line": 5,
                        "time": 2406
                    },
                    {
                        "line": 3,
                        "time": 2410
                    },
                    {
                        "line": 5,
                        "time": 2414
                    },
                    {
                        "line": 0,
                        "time": 2414
                    },
                    {
                        "line": 1,
                        "time": 2418
                    },
                    {
                        "line": 2,
                        "time": 2418
                    },
                    {
                        "line": 0,
                        "time": 2426
                    },
                    {
                        "line": 5,
                        "time": 2430
                    },
                    {
                        "line": 1,
                        "time": 2430
                    },
                    {
                        "line": 2,
                        "time": 2432
                    },
                    {
                        "line": 1,
                        "time": 2434
                    },
                    {
                        "line": 4,
                        "time": 2434
                    },
                    {
                        "line": 3,
                        "time": 2434
                    },
                    {
                        "line": 2,
                        "time": 2438
                    },
                    {
                        "line": 4,
                        "time": 2442
                    },
                    {
                        "line": 5,
                        "time": 2442
                    },
                    {
                        "line": 0,
                        "time": 2446
                    },
                    {
                        "line": 3,
                        "time": 2454
                    },
                    {
                        "line": 5,
                        "time": 2458
                    },
                    {
                        "line": 3,
                        "time": 2466
                    },
                    {
                        "line": 4,
                        "time": 2466
                    },
                    {
                        "line": 5,
                        "time": 2470
                    },
                    {
                        "line": 0,
                        "time": 2474
                    },
                    {
                        "line": 5,
                        "time": 2482
                    },
                    {
                        "line": 2,
                        "time": 2510,
                        "type": "long",
                        "ends": 2525
                    },
                    {
                        "line": 1,
                        "time": 2514
                    },
                    {
                        "line": 0,
                        "time": 2538
                    },
                    {
                        "line": 4,
                        "time": 2542
                    },
                    {
                        "line": 5,
                        "time": 2546
                    },
                    {
                        "line": 4,
                        "time": 2554
                    },
                    {
                        "line": 3,
                        "time": 2554
                    },
                    {
                        "line": 2,
                        "time": 2562
                    },
                    {
                        "line": 4,
                        "time": 2566
                    },
                    {
                        "line": 5,
                        "time": 2566
                    },
                    {
                        "line": 1,
                        "time": 2570
                    },
                    {
                        "line": 3,
                        "time": 2574
                    },
                    {
                        "line": 4,
                        "time": 2574
                    },
                    {
                        "line": 0,
                        "time": 2594
                    },
                    {
                        "line": 4,
                        "time": 2646
                    },
                    {
                        "line": 0,
                        "time": 2670
                    },
                    {
                        "line": 3,
                        "time": 2674
                    },
                    {
                        "line": 1,
                        "time": 2684
                    },
                    {
                        "line": 2,
                        "time": 2690
                    },
                    {
                        "line": 5,
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