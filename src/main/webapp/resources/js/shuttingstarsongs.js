/** 
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0 
*/
/*
 * Shutting Stars
 *     기본 탑재 곡들을 구현하는 파일
 */

let songs = [];
let song;

song = {};
song.name = '출발은 떨렸지만';
song.composer = '우아한형제들';
song.noteWriter = 'HJOW';
song.bgaUrl = '';
song.musicUrl = '[RSSC]songs/woowahan/track01.mp3';
song.musicAlterUrl = '';// 'https://hjow.duckdns.org/shuttingstars/resources/songs/woowahan/track01.mp3';
song.thumbnailUrl = '';
song.canListen = true;
song.useYoutube = false;
song.youtubeVideoId = '';
song.description = `
|Music: 우아한형제들
|  https://www.woowahan.com/music
|License: 
|  https://www.woowahan.com/music/license
`;
song.loadingTime = 10;
song.bpm = 91;
song.endTime = 0;
song.timeConstant = 0;
song.timeMultiplier = 1;
song.noteMultiplier = 1;
song.serial = 'nai4ilaHfdhsdfhfsdhsfgfnJ93f8gp34qgD39p4g';
song.test = false;
song.onlyRandom = false;
song.difficulties = [];
song.difficulties.push({
    difficultyLabel : 'easy',
    difficultyLevel : 1,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 2,
                    "time": 144
                },
                {
                    "locationIndex": 3,
                    "time": 219
                },
                {
                    "locationIndex": 2,
                    "time": 288
                },
                {
                    "locationIndex": 4,
                    "time": 354
                },
                {
                    "locationIndex": 0,
                    "time": 354
                },
                {
                    "locationIndex": 2,
                    "time": 425
                },
                {
                    "locationIndex": 0,
                    "time": 490
                },
                {
                    "locationIndex": 2,
                    "time": 565
                },
                {
                    "locationIndex": 0,
                    "time": 631
                },
                {
                    "locationIndex": 3,
                    "time": 698
                },
                {
                    "locationIndex": 0,
                    "time": 765
                },
                {
                    "locationIndex": 2,
                    "time": 765
                },
                {
                    "locationIndex": 4,
                    "time": 833
                },
                {
                    "locationIndex": 3,
                    "time": 899
                },
                {
                    "locationIndex": 0,
                    "time": 964
                },
                {
                    "locationIndex": 4,
                    "time": 1031
                },
                {
                    "locationIndex": 0,
                    "time": 1101
                },
                {
                    "locationIndex": 3,
                    "time": 1171
                },
                {
                    "locationIndex": 0,
                    "time": 1237
                },
                {
                    "locationIndex": 4,
                    "time": 1304
                },
                {
                    "locationIndex": 5,
                    "time": 1368
                },
                {
                    "locationIndex": 1,
                    "time": 1438
                },
                {
                    "locationIndex": 0,
                    "time": 1502
                },
                {
                    "locationIndex": 1,
                    "time": 1572
                },
                {
                    "locationIndex": 5,
                    "time": 1637
                },
                {
                    "locationIndex": 2,
                    "time": 1718
                },
                {
                    "locationIndex": 3,
                    "time": 1788
                },
                {
                    "locationIndex": 1,
                    "time": 1853
                },
                {
                    "locationIndex": 2,
                    "time": 1933
                },
                {
                    "locationIndex": 5,
                    "time": 1998
                },
                {
                    "locationIndex": 0,
                    "time": 2066
                },
                {
                    "locationIndex": 1,
                    "time": 2139
                },
                {
                    "locationIndex": 0,
                    "time": 2205
                },
                {
                    "locationIndex": 2,
                    "time": 2278
                },
                {
                    "locationIndex": 5,
                    "time": 2344
                },
                {
                    "locationIndex": 0,
                    "time": 2409
                },
                {
                    "locationIndex": 4,
                    "time": 2477
                },
                {
                    "locationIndex": 2,
                    "time": 2477
                },
                {
                    "locationIndex": 5,
                    "time": 2557
                },
                {
                    "locationIndex": 2,
                    "time": 2624
                },
                {
                    "locationIndex": 0,
                    "time": 2693
                },
                {
                    "locationIndex": 5,
                    "time": 2786
                },
                {
                    "locationIndex": 4,
                    "time": 2855
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'normal',
    difficultyLevel : 4,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 4,
                    "time": 144
                },
                {
                    "locationIndex": 2,
                    "time": 187
                },
                {
                    "locationIndex": 3,
                    "time": 225
                },
                {
                    "locationIndex": 4,
                    "time": 262
                },
                {
                    "locationIndex": 5,
                    "time": 294
                },
                {
                    "locationIndex": 0,
                    "time": 333
                },
                {
                    "locationIndex": 1,
                    "time": 370
                },
                {
                    "locationIndex": 2,
                    "time": 407
                },
                {
                    "locationIndex": 3,
                    "time": 440
                },
                {
                    "locationIndex": 5,
                    "time": 473
                },
                {
                    "locationIndex": 0,
                    "time": 508
                },
                {
                    "locationIndex": 5,
                    "time": 541
                },
                {
                    "locationIndex": 1,
                    "time": 587
                },
                {
                    "locationIndex": 3,
                    "time": 587
                },
                {
                    "locationIndex": 5,
                    "time": 619
                },
                {
                    "locationIndex": 3,
                    "time": 692
                },
                {
                    "locationIndex": 2,
                    "time": 729
                },
                {
                    "locationIndex": 1,
                    "time": 765
                },
                {
                    "locationIndex": 3,
                    "time": 765
                },
                {
                    "locationIndex": 4,
                    "time": 800
                },
                {
                    "locationIndex": 2,
                    "time": 833
                },
                {
                    "locationIndex": 1,
                    "time": 872
                },
                {
                    "locationIndex": 5,
                    "time": 905
                },
                {
                    "locationIndex": 4,
                    "time": 943
                },
                {
                    "locationIndex": 5,
                    "time": 977
                },
                {
                    "locationIndex": 0,
                    "time": 977
                },
                {
                    "locationIndex": 3,
                    "time": 1014
                },
                {
                    "locationIndex": 5,
                    "time": 1049
                },
                {
                    "locationIndex": 4,
                    "time": 1083
                },
                {
                    "locationIndex": 3,
                    "time": 1116
                },
                {
                    "locationIndex": 5,
                    "time": 1153
                },
                {
                    "locationIndex": 2,
                    "time": 1187
                },
                {
                    "locationIndex": 0,
                    "time": 1222
                },
                {
                    "locationIndex": 5,
                    "time": 1259
                },
                {
                    "locationIndex": 0,
                    "time": 1299
                },
                {
                    "locationIndex": 4,
                    "time": 1332
                },
                {
                    "locationIndex": 3,
                    "time": 1366
                },
                {
                    "locationIndex": 5,
                    "time": 1402
                },
                {
                    "locationIndex": 0,
                    "time": 1438
                },
                {
                    "locationIndex": 4,
                    "time": 1477
                },
                {
                    "locationIndex": 3,
                    "time": 1477
                },
                {
                    "locationIndex": 2,
                    "time": 1522
                },
                {
                    "locationIndex": 1,
                    "time": 1561
                },
                {
                    "locationIndex": 2,
                    "time": 1593
                },
                {
                    "locationIndex": 3,
                    "time": 1627
                },
                {
                    "locationIndex": 1,
                    "time": 1664
                },
                {
                    "locationIndex": 2,
                    "time": 1718
                },
                {
                    "locationIndex": 4,
                    "time": 1756
                },
                {
                    "locationIndex": 2,
                    "time": 1788
                },
                {
                    "locationIndex": 4,
                    "time": 1848
                },
                {
                    "locationIndex": 1,
                    "time": 1880
                },
                {
                    "locationIndex": 2,
                    "time": 1914
                },
                {
                    "locationIndex": 3,
                    "time": 1914
                },
                {
                    "locationIndex": 5,
                    "time": 1950
                },
                {
                    "locationIndex": 0,
                    "time": 1992
                },
                {
                    "locationIndex": 4,
                    "time": 2027
                },
                {
                    "locationIndex": 3,
                    "time": 2066
                },
                {
                    "locationIndex": 1,
                    "time": 2109
                },
                {
                    "locationIndex": 4,
                    "time": 2142
                },
                {
                    "locationIndex": 0,
                    "time": 2176
                },
                {
                    "locationIndex": 2,
                    "time": 2208
                },
                {
                    "locationIndex": 1,
                    "time": 2247
                },
                {
                    "locationIndex": 3,
                    "time": 2281
                },
                {
                    "locationIndex": 4,
                    "time": 2315
                },
                {
                    "locationIndex": 0,
                    "time": 2315
                },
                {
                    "locationIndex": 3,
                    "time": 2348
                },
                {
                    "locationIndex": 5,
                    "time": 2386
                },
                {
                    "locationIndex": 0,
                    "time": 2421
                },
                {
                    "locationIndex": 1,
                    "time": 2458
                },
                {
                    "locationIndex": 5,
                    "time": 2496
                },
                {
                    "locationIndex": 4,
                    "time": 2529
                },
                {
                    "locationIndex": 1,
                    "time": 2529
                },
                {
                    "locationIndex": 3,
                    "time": 2562
                },
                {
                    "locationIndex": 5,
                    "time": 2595
                },
                {
                    "locationIndex": 2,
                    "time": 2639
                },
                {
                    "locationIndex": 3,
                    "time": 2693
                },
                {
                    "locationIndex": 0,
                    "time": 2774
                },
                {
                    "locationIndex": 2,
                    "time": 2814
                },
                {
                    "locationIndex": 4,
                    "time": 2909
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'hard',
    difficultyLevel : 8,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 5,
                    "time": 144
                },
                {
                    "locationIndex": 3,
                    "time": 174
                },
                {
                    "locationIndex": 1,
                    "time": 174
                },
                {
                    "locationIndex": 2,
                    "time": 187
                },
                {
                    "locationIndex": 4,
                    "time": 200
                },
                {
                    "locationIndex": 5,
                    "time": 200
                },
                {
                    "locationIndex": 0,
                    "time": 213
                },
                {
                    "locationIndex": 3,
                    "time": 258
                },
                {
                    "locationIndex": 4,
                    "time": 258
                },
                {
                    "locationIndex": 2,
                    "time": 266
                },
                {
                    "locationIndex": 5,
                    "time": 290
                },
                {
                    "locationIndex": 1,
                    "time": 312
                },
                {
                    "locationIndex": 4,
                    "time": 328
                },
                {
                    "locationIndex": 0,
                    "time": 328
                },
                {
                    "locationIndex": 1,
                    "time": 337,
                    "type": "long",
                    "ends": 352
                },
                {
                    "locationIndex": 0,
                    "time": 346
                },
                {
                    "locationIndex": 2,
                    "time": 358
                },
                {
                    "locationIndex": 4,
                    "time": 358
                },
                {
                    "locationIndex": 0,
                    "time": 370
                },
                {
                    "locationIndex": 4,
                    "time": 381
                },
                {
                    "locationIndex": 0,
                    "time": 413
                },
                {
                    "locationIndex": 5,
                    "time": 425
                },
                {
                    "locationIndex": 3,
                    "time": 425
                },
                {
                    "locationIndex": 2,
                    "time": 425
                },
                {
                    "locationIndex": 1,
                    "time": 433
                },
                {
                    "locationIndex": 5,
                    "time": 452
                },
                {
                    "locationIndex": 3,
                    "time": 452
                },
                {
                    "locationIndex": 2,
                    "time": 466,
                    "type": "long",
                    "ends": 481
                },
                {
                    "locationIndex": 1,
                    "time": 482
                },
                {
                    "locationIndex": 0,
                    "time": 482
                },
                {
                    "locationIndex": 3,
                    "time": 490
                },
                {
                    "locationIndex": 4,
                    "time": 490
                },
                {
                    "locationIndex": 0,
                    "time": 490
                },
                {
                    "locationIndex": 5,
                    "time": 498
                },
                {
                    "locationIndex": 0,
                    "time": 508
                },
                {
                    "locationIndex": 3,
                    "time": 508
                },
                {
                    "locationIndex": 1,
                    "time": 524
                },
                {
                    "locationIndex": 3,
                    "time": 533
                },
                {
                    "locationIndex": 0,
                    "time": 541
                },
                {
                    "locationIndex": 5,
                    "time": 541
                },
                {
                    "locationIndex": 4,
                    "time": 565
                },
                {
                    "locationIndex": 3,
                    "time": 565
                },
                {
                    "locationIndex": 5,
                    "time": 587
                },
                {
                    "locationIndex": 0,
                    "time": 595
                },
                {
                    "locationIndex": 4,
                    "time": 595
                },
                {
                    "locationIndex": 1,
                    "time": 613
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
                    "locationIndex": 5,
                    "time": 626
                },
                {
                    "locationIndex": 2,
                    "time": 634
                },
                {
                    "locationIndex": 4,
                    "time": 642
                },
                {
                    "locationIndex": 1,
                    "time": 692
                },
                {
                    "locationIndex": 5,
                    "time": 692
                },
                {
                    "locationIndex": 2,
                    "time": 705
                },
                {
                    "locationIndex": 0,
                    "time": 713
                },
                {
                    "locationIndex": 3,
                    "time": 713
                },
                {
                    "locationIndex": 4,
                    "time": 729
                },
                {
                    "locationIndex": 1,
                    "time": 729
                },
                {
                    "locationIndex": 2,
                    "time": 739,
                    "type": "long",
                    "ends": 754
                },
                {
                    "locationIndex": 0,
                    "time": 748
                },
                {
                    "locationIndex": 4,
                    "time": 748
                },
                {
                    "locationIndex": 1,
                    "time": 756
                },
                {
                    "locationIndex": 3,
                    "time": 756
                },
                {
                    "locationIndex": 0,
                    "time": 756
                },
                {
                    "locationIndex": 4,
                    "time": 765
                },
                {
                    "locationIndex": 0,
                    "time": 775,
                    "type": "long",
                    "ends": 790
                },
                {
                    "locationIndex": 5,
                    "time": 775,
                    "type": "long",
                    "ends": 790
                },
                {
                    "locationIndex": 4,
                    "time": 787
                },
                {
                    "locationIndex": 3,
                    "time": 800
                },
                {
                    "locationIndex": 1,
                    "time": 800
                },
                {
                    "locationIndex": 4,
                    "time": 811
                },
                {
                    "locationIndex": 3,
                    "time": 821
                },
                {
                    "locationIndex": 2,
                    "time": 821
                },
                {
                    "locationIndex": 1,
                    "time": 833,
                    "type": "long",
                    "ends": 848
                },
                {
                    "locationIndex": 2,
                    "time": 848,
                    "type": "long",
                    "ends": 863
                },
                {
                    "locationIndex": 4,
                    "time": 858
                },
                {
                    "locationIndex": 5,
                    "time": 858
                },
                {
                    "locationIndex": 0,
                    "time": 872,
                    "type": "long",
                    "ends": 887
                },
                {
                    "locationIndex": 3,
                    "time": 872,
                    "type": "long",
                    "ends": 887
                },
                {
                    "locationIndex": 4,
                    "time": 884
                },
                {
                    "locationIndex": 5,
                    "time": 899
                },
                {
                    "locationIndex": 4,
                    "time": 912
                },
                {
                    "locationIndex": 5,
                    "time": 923
                },
                {
                    "locationIndex": 1,
                    "time": 923
                },
                {
                    "locationIndex": 4,
                    "time": 935
                },
                {
                    "locationIndex": 2,
                    "time": 943
                },
                {
                    "locationIndex": 5,
                    "time": 943
                },
                {
                    "locationIndex": 1,
                    "time": 954
                },
                {
                    "locationIndex": 4,
                    "time": 964
                },
                {
                    "locationIndex": 1,
                    "time": 973
                },
                {
                    "locationIndex": 0,
                    "time": 973
                },
                {
                    "locationIndex": 2,
                    "time": 982
                },
                {
                    "locationIndex": 4,
                    "time": 999
                },
                {
                    "locationIndex": 1,
                    "time": 999
                },
                {
                    "locationIndex": 2,
                    "time": 1007
                },
                {
                    "locationIndex": 5,
                    "time": 1015
                },
                {
                    "locationIndex": 3,
                    "time": 1015
                },
                {
                    "locationIndex": 2,
                    "time": 1025
                },
                {
                    "locationIndex": 0,
                    "time": 1025
                },
                {
                    "locationIndex": 3,
                    "time": 1036,
                    "type": "long",
                    "ends": 1051
                },
                {
                    "locationIndex": 2,
                    "time": 1049
                },
                {
                    "locationIndex": 0,
                    "time": 1049
                },
                {
                    "locationIndex": 5,
                    "time": 1060
                },
                {
                    "locationIndex": 0,
                    "time": 1071
                },
                {
                    "locationIndex": 4,
                    "time": 1083
                },
                {
                    "locationIndex": 2,
                    "time": 1101
                },
                {
                    "locationIndex": 5,
                    "time": 1116
                },
                {
                    "locationIndex": 0,
                    "time": 1137
                },
                {
                    "locationIndex": 4,
                    "time": 1146
                },
                {
                    "locationIndex": 1,
                    "time": 1146
                },
                {
                    "locationIndex": 3,
                    "time": 1156
                },
                {
                    "locationIndex": 2,
                    "time": 1156
                },
                {
                    "locationIndex": 1,
                    "time": 1164
                },
                {
                    "locationIndex": 2,
                    "time": 1174
                },
                {
                    "locationIndex": 3,
                    "time": 1187
                },
                {
                    "locationIndex": 1,
                    "time": 1197
                },
                {
                    "locationIndex": 0,
                    "time": 1197
                },
                {
                    "locationIndex": 3,
                    "time": 1207
                },
                {
                    "locationIndex": 0,
                    "time": 1222
                },
                {
                    "locationIndex": 4,
                    "time": 1230
                },
                {
                    "locationIndex": 5,
                    "time": 1243
                },
                {
                    "locationIndex": 3,
                    "time": 1252
                },
                {
                    "locationIndex": 1,
                    "time": 1269
                },
                {
                    "locationIndex": 5,
                    "time": 1285
                },
                {
                    "locationIndex": 4,
                    "time": 1299
                },
                {
                    "locationIndex": 5,
                    "time": 1317
                },
                {
                    "locationIndex": 0,
                    "time": 1332
                },
                {
                    "locationIndex": 2,
                    "time": 1348
                },
                {
                    "locationIndex": 1,
                    "time": 1356
                },
                {
                    "locationIndex": 2,
                    "time": 1366
                },
                {
                    "locationIndex": 5,
                    "time": 1366
                },
                {
                    "locationIndex": 1,
                    "time": 1375
                },
                {
                    "locationIndex": 0,
                    "time": 1385
                },
                {
                    "locationIndex": 3,
                    "time": 1393
                },
                {
                    "locationIndex": 2,
                    "time": 1402
                },
                {
                    "locationIndex": 5,
                    "time": 1402
                },
                {
                    "locationIndex": 0,
                    "time": 1412
                },
                {
                    "locationIndex": 1,
                    "time": 1420,
                    "type": "long",
                    "ends": 1435
                },
                {
                    "locationIndex": 3,
                    "time": 1428
                },
                {
                    "locationIndex": 0,
                    "time": 1428
                },
                {
                    "locationIndex": 4,
                    "time": 1438
                },
                {
                    "locationIndex": 5,
                    "time": 1438
                },
                {
                    "locationIndex": 2,
                    "time": 1446
                },
                {
                    "locationIndex": 3,
                    "time": 1458
                },
                {
                    "locationIndex": 0,
                    "time": 1477
                },
                {
                    "locationIndex": 5,
                    "time": 1477
                },
                {
                    "locationIndex": 2,
                    "time": 1477
                },
                {
                    "locationIndex": 3,
                    "time": 1485
                },
                {
                    "locationIndex": 4,
                    "time": 1485
                },
                {
                    "locationIndex": 5,
                    "time": 1493
                },
                {
                    "locationIndex": 2,
                    "time": 1493
                },
                {
                    "locationIndex": 1,
                    "time": 1501
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
                    "locationIndex": 3,
                    "time": 1547
                },
                {
                    "locationIndex": 4,
                    "time": 1561
                },
                {
                    "locationIndex": 1,
                    "time": 1572
                },
                {
                    "locationIndex": 2,
                    "time": 1580
                },
                {
                    "locationIndex": 0,
                    "time": 1589
                },
                {
                    "locationIndex": 3,
                    "time": 1589
                },
                {
                    "locationIndex": 1,
                    "time": 1599
                },
                {
                    "locationIndex": 4,
                    "time": 1599
                },
                {
                    "locationIndex": 2,
                    "time": 1610
                },
                {
                    "locationIndex": 0,
                    "time": 1618
                },
                {
                    "locationIndex": 2,
                    "time": 1627
                },
                {
                    "locationIndex": 4,
                    "time": 1627
                },
                {
                    "locationIndex": 5,
                    "time": 1637
                },
                {
                    "locationIndex": 0,
                    "time": 1637
                },
                {
                    "locationIndex": 3,
                    "time": 1649
                },
                {
                    "locationIndex": 1,
                    "time": 1664
                },
                {
                    "locationIndex": 4,
                    "time": 1664
                },
                {
                    "locationIndex": 2,
                    "time": 1675
                },
                {
                    "locationIndex": 5,
                    "time": 1685
                },
                {
                    "locationIndex": 0,
                    "time": 1685
                },
                {
                    "locationIndex": 1,
                    "time": 1718
                },
                {
                    "locationIndex": 3,
                    "time": 1718
                },
                {
                    "locationIndex": 4,
                    "time": 1732
                },
                {
                    "locationIndex": 2,
                    "time": 1747
                },
                {
                    "locationIndex": 4,
                    "time": 1756
                },
                {
                    "locationIndex": 5,
                    "time": 1756
                },
                {
                    "locationIndex": 0,
                    "time": 1788
                },
                {
                    "locationIndex": 2,
                    "time": 1788
                },
                {
                    "locationIndex": 3,
                    "time": 1810
                },
                {
                    "locationIndex": 5,
                    "time": 1848,
                    "type": "long",
                    "ends": 1863
                },
                {
                    "locationIndex": 0,
                    "time": 1860
                },
                {
                    "locationIndex": 3,
                    "time": 1860
                },
                {
                    "locationIndex": 1,
                    "time": 1871
                },
                {
                    "locationIndex": 3,
                    "time": 1880
                },
                {
                    "locationIndex": 2,
                    "time": 1880
                },
                {
                    "locationIndex": 1,
                    "time": 1898
                },
                {
                    "locationIndex": 2,
                    "time": 1909
                },
                {
                    "locationIndex": 0,
                    "time": 1909
                },
                {
                    "locationIndex": 4,
                    "time": 1933
                },
                {
                    "locationIndex": 1,
                    "time": 1933
                },
                {
                    "locationIndex": 5,
                    "time": 1950
                },
                {
                    "locationIndex": 2,
                    "time": 1963
                },
                {
                    "locationIndex": 1,
                    "time": 1972
                },
                {
                    "locationIndex": 4,
                    "time": 1972
                },
                {
                    "locationIndex": 0,
                    "time": 1992
                },
                {
                    "locationIndex": 4,
                    "time": 2003
                },
                {
                    "locationIndex": 1,
                    "time": 2003
                },
                {
                    "locationIndex": 3,
                    "time": 2003
                },
                {
                    "locationIndex": 2,
                    "time": 2016
                },
                {
                    "locationIndex": 0,
                    "time": 2027
                },
                {
                    "locationIndex": 1,
                    "time": 2027
                },
                {
                    "locationIndex": 2,
                    "time": 2046
                },
                {
                    "locationIndex": 4,
                    "time": 2066
                },
                {
                    "locationIndex": 3,
                    "time": 2075
                },
                {
                    "locationIndex": 1,
                    "time": 2075
                },
                {
                    "locationIndex": 4,
                    "time": 2093
                },
                {
                    "locationIndex": 0,
                    "time": 2093
                },
                {
                    "locationIndex": 2,
                    "time": 2109
                },
                {
                    "locationIndex": 1,
                    "time": 2139
                },
                {
                    "locationIndex": 0,
                    "time": 2150
                },
                {
                    "locationIndex": 5,
                    "time": 2150
                },
                {
                    "locationIndex": 2,
                    "time": 2161
                },
                {
                    "locationIndex": 0,
                    "time": 2171
                },
                {
                    "locationIndex": 3,
                    "time": 2189
                },
                {
                    "locationIndex": 4,
                    "time": 2189
                },
                {
                    "locationIndex": 2,
                    "time": 2205
                },
                {
                    "locationIndex": 3,
                    "time": 2220
                },
                {
                    "locationIndex": 1,
                    "time": 2220
                },
                {
                    "locationIndex": 5,
                    "time": 2234
                },
                {
                    "locationIndex": 0,
                    "time": 2247
                },
                {
                    "locationIndex": 1,
                    "time": 2247
                },
                {
                    "locationIndex": 3,
                    "time": 2264
                },
                {
                    "locationIndex": 5,
                    "time": 2264
                },
                {
                    "locationIndex": 2,
                    "time": 2278
                },
                {
                    "locationIndex": 3,
                    "time": 2297
                },
                {
                    "locationIndex": 1,
                    "time": 2297
                },
                {
                    "locationIndex": 5,
                    "time": 2306
                },
                {
                    "locationIndex": 3,
                    "time": 2315
                },
                {
                    "locationIndex": 0,
                    "time": 2315
                },
                {
                    "locationIndex": 5,
                    "time": 2327
                },
                {
                    "locationIndex": 1,
                    "time": 2335
                },
                {
                    "locationIndex": 3,
                    "time": 2344
                },
                {
                    "locationIndex": 4,
                    "time": 2344
                },
                {
                    "locationIndex": 5,
                    "time": 2377
                },
                {
                    "locationIndex": 0,
                    "time": 2386
                },
                {
                    "locationIndex": 3,
                    "time": 2386
                },
                {
                    "locationIndex": 2,
                    "time": 2396
                },
                {
                    "locationIndex": 1,
                    "time": 2409
                },
                {
                    "locationIndex": 0,
                    "time": 2409
                },
                {
                    "locationIndex": 5,
                    "time": 2409
                },
                {
                    "locationIndex": 3,
                    "time": 2421
                },
                {
                    "locationIndex": 2,
                    "time": 2421
                },
                {
                    "locationIndex": 1,
                    "time": 2437
                },
                {
                    "locationIndex": 3,
                    "time": 2452,
                    "type": "long",
                    "ends": 2467
                },
                {
                    "locationIndex": 5,
                    "time": 2464
                },
                {
                    "locationIndex": 0,
                    "time": 2477
                },
                {
                    "locationIndex": 4,
                    "time": 2496
                },
                {
                    "locationIndex": 2,
                    "time": 2505
                },
                {
                    "locationIndex": 5,
                    "time": 2505
                },
                {
                    "locationIndex": 1,
                    "time": 2517
                },
                {
                    "locationIndex": 0,
                    "time": 2517
                },
                {
                    "locationIndex": 2,
                    "time": 2529
                },
                {
                    "locationIndex": 3,
                    "time": 2539,
                    "type": "long",
                    "ends": 2554
                },
                {
                    "locationIndex": 4,
                    "time": 2539,
                    "type": "long",
                    "ends": 2554
                },
                {
                    "locationIndex": 0,
                    "time": 2557
                },
                {
                    "locationIndex": 1,
                    "time": 2565
                },
                {
                    "locationIndex": 2,
                    "time": 2565
                },
                {
                    "locationIndex": 5,
                    "time": 2573
                },
                {
                    "locationIndex": 2,
                    "time": 2586
                },
                {
                    "locationIndex": 0,
                    "time": 2586
                },
                {
                    "locationIndex": 5,
                    "time": 2595
                },
                {
                    "locationIndex": 2,
                    "time": 2614
                },
                {
                    "locationIndex": 0,
                    "time": 2614
                },
                {
                    "locationIndex": 1,
                    "time": 2614
                },
                {
                    "locationIndex": 3,
                    "time": 2624
                },
                {
                    "locationIndex": 0,
                    "time": 2650,
                    "type": "long",
                    "ends": 2665
                },
                {
                    "locationIndex": 1,
                    "time": 2658
                },
                {
                    "locationIndex": 2,
                    "time": 2658
                },
                {
                    "locationIndex": 4,
                    "time": 2667
                },
                {
                    "locationIndex": 3,
                    "time": 2680
                },
                {
                    "locationIndex": 4,
                    "time": 2699
                },
                {
                    "locationIndex": 5,
                    "time": 2699
                },
                {
                    "locationIndex": 2,
                    "time": 2792
                },
                {
                    "locationIndex": 5,
                    "time": 2814
                },
                {
                    "locationIndex": 4,
                    "time": 2845
                },
                {
                    "locationIndex": 3,
                    "time": 2845
                },
                {
                    "locationIndex": 1,
                    "time": 2963
                }
            ]
});

songs.push(song);

song = {};
song.name = '복귀해도 될까요';
song.composer = '우아한형제들';
song.noteWriter = 'HJOW';
song.bgaUrl = '';
song.musicUrl = '[RSSC]songs/woowahan/track03.mp3';
song.musicAlterUrl = '';// 'https://hjow.duckdns.org/shuttingstars/resources/songs/woowahan/track03.mp3';
song.thumbnailUrl = '';
song.canListen = true;
song.useYoutube = false;
song.youtubeVideoId = '';
song.description = `
|Music: 우아한형제들
|  https://www.woowahan.com/music
|License: 
|  https://www.woowahan.com/music/license
`;
song.loadingTime = 10;
song.bpm = 115;
song.endTime = 0;
song.timeConstant = 0;
song.timeMultiplier = 1;
song.noteMultiplier = 1;
song.serial = 'nai4ilagwaifiuIBTUcfasgp34qgD39p4g';
song.test = false;
song.onlyRandom = false;
song.difficulties = [];
song.difficulties.push({
    difficultyLabel : 'easy',
    difficultyLevel : 2,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 4,
                    "time": 147
                },
                {
                    "locationIndex": 0,
                    "time": 235
                },
                {
                    "locationIndex": 5,
                    "time": 373
                },
                {
                    "locationIndex": 1,
                    "time": 462
                },
                {
                    "locationIndex": 2,
                    "time": 529
                },
                {
                    "locationIndex": 3,
                    "time": 605
                },
                {
                    "locationIndex": 5,
                    "time": 701
                },
                {
                    "locationIndex": 1,
                    "time": 769
                },
                {
                    "locationIndex": 0,
                    "time": 859
                },
                {
                    "locationIndex": 1,
                    "time": 943
                },
                {
                    "locationIndex": 4,
                    "time": 1037
                },
                {
                    "locationIndex": 1,
                    "time": 1150
                },
                {
                    "locationIndex": 0,
                    "time": 1150
                },
                {
                    "locationIndex": 5,
                    "time": 1261
                },
                {
                    "locationIndex": 4,
                    "time": 1373
                },
                {
                    "locationIndex": 0,
                    "time": 1447
                },
                {
                    "locationIndex": 1,
                    "time": 1539
                },
                {
                    "locationIndex": 3,
                    "time": 1630
                },
                {
                    "locationIndex": 0,
                    "time": 1768
                },
                {
                    "locationIndex": 2,
                    "time": 1835
                },
                {
                    "locationIndex": 4,
                    "time": 1925
                },
                {
                    "locationIndex": 0,
                    "time": 1989
                },
                {
                    "locationIndex": 5,
                    "time": 1989
                },
                {
                    "locationIndex": 4,
                    "time": 2061
                },
                {
                    "locationIndex": 5,
                    "time": 2177
                },
                {
                    "locationIndex": 1,
                    "time": 2247
                },
                {
                    "locationIndex": 3,
                    "time": 2317
                },
                {
                    "locationIndex": 2,
                    "time": 2381
                },
                {
                    "locationIndex": 3,
                    "time": 2445
                },
                {
                    "locationIndex": 0,
                    "time": 2509
                },
                {
                    "locationIndex": 5,
                    "time": 2577
                },
                {
                    "locationIndex": 1,
                    "time": 2650
                },
                {
                    "locationIndex": 0,
                    "time": 2754
                },
                {
                    "locationIndex": 2,
                    "time": 2818
                },
                {
                    "locationIndex": 1,
                    "time": 2818
                },
                {
                    "locationIndex": 5,
                    "time": 2940
                },
                {
                    "locationIndex": 1,
                    "time": 3006
                },
                {
                    "locationIndex": 0,
                    "time": 3006
                },
                {
                    "locationIndex": 3,
                    "time": 3083
                },
                {
                    "locationIndex": 2,
                    "time": 3159
                },
                {
                    "locationIndex": 0,
                    "time": 3231
                },
                {
                    "locationIndex": 5,
                    "time": 3307
                },
                {
                    "locationIndex": 3,
                    "time": 3382
                },
                {
                    "locationIndex": 5,
                    "time": 3446
                },
                {
                    "locationIndex": 1,
                    "time": 3519
                },
                {
                    "locationIndex": 0,
                    "time": 3593
                },
                {
                    "locationIndex": 3,
                    "time": 3690
                },
                {
                    "locationIndex": 2,
                    "time": 3690
                },
                {
                    "locationIndex": 0,
                    "time": 3767
                },
                {
                    "locationIndex": 1,
                    "time": 3879
                },
                {
                    "locationIndex": 4,
                    "time": 3947
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'normal',
    difficultyLevel : 6,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 2,
                    "time": 147
                },
                {
                    "locationIndex": 1,
                    "time": 183
                },
                {
                    "locationIndex": 0,
                    "time": 219
                },
                {
                    "locationIndex": 4,
                    "time": 219
                },
                {
                    "locationIndex": 5,
                    "time": 235
                },
                {
                    "locationIndex": 0,
                    "time": 259
                },
                {
                    "locationIndex": 2,
                    "time": 379,
                    "type": "long",
                    "ends": 394
                },
                {
                    "locationIndex": 0,
                    "time": 462
                },
                {
                    "locationIndex": 5,
                    "time": 487
                },
                {
                    "locationIndex": 4,
                    "time": 509
                },
                {
                    "locationIndex": 3,
                    "time": 525
                },
                {
                    "locationIndex": 2,
                    "time": 605
                },
                {
                    "locationIndex": 5,
                    "time": 605
                },
                {
                    "locationIndex": 1,
                    "time": 629
                },
                {
                    "locationIndex": 4,
                    "time": 629
                },
                {
                    "locationIndex": 2,
                    "time": 646
                },
                {
                    "locationIndex": 0,
                    "time": 701
                },
                {
                    "locationIndex": 1,
                    "time": 744
                },
                {
                    "locationIndex": 2,
                    "time": 760
                },
                {
                    "locationIndex": 4,
                    "time": 781
                },
                {
                    "locationIndex": 0,
                    "time": 798
                },
                {
                    "locationIndex": 3,
                    "time": 831
                },
                {
                    "locationIndex": 1,
                    "time": 859
                },
                {
                    "locationIndex": 5,
                    "time": 859
                },
                {
                    "locationIndex": 2,
                    "time": 943
                },
                {
                    "locationIndex": 0,
                    "time": 975
                },
                {
                    "locationIndex": 1,
                    "time": 1037
                },
                {
                    "locationIndex": 2,
                    "time": 1139
                },
                {
                    "locationIndex": 1,
                    "time": 1164
                },
                {
                    "locationIndex": 5,
                    "time": 1261
                },
                {
                    "locationIndex": 3,
                    "time": 1261
                },
                {
                    "locationIndex": 4,
                    "time": 1294,
                    "type": "long",
                    "ends": 1309
                },
                {
                    "locationIndex": 0,
                    "time": 1373
                },
                {
                    "locationIndex": 1,
                    "time": 1422
                },
                {
                    "locationIndex": 3,
                    "time": 1447
                },
                {
                    "locationIndex": 1,
                    "time": 1486
                },
                {
                    "locationIndex": 4,
                    "time": 1539
                },
                {
                    "locationIndex": 5,
                    "time": 1576
                },
                {
                    "locationIndex": 0,
                    "time": 1576
                },
                {
                    "locationIndex": 3,
                    "time": 1630
                },
                {
                    "locationIndex": 4,
                    "time": 1670
                },
                {
                    "locationIndex": 5,
                    "time": 1768
                },
                {
                    "locationIndex": 0,
                    "time": 1797
                },
                {
                    "locationIndex": 5,
                    "time": 1835
                },
                {
                    "locationIndex": 2,
                    "time": 1893
                },
                {
                    "locationIndex": 1,
                    "time": 1925
                },
                {
                    "locationIndex": 0,
                    "time": 1953
                },
                {
                    "locationIndex": 2,
                    "time": 1975
                },
                {
                    "locationIndex": 4,
                    "time": 2040
                },
                {
                    "locationIndex": 3,
                    "time": 2061
                },
                {
                    "locationIndex": 5,
                    "time": 2061
                },
                {
                    "locationIndex": 0,
                    "time": 2102
                },
                {
                    "locationIndex": 2,
                    "time": 2167
                },
                {
                    "locationIndex": 0,
                    "time": 2185
                },
                {
                    "locationIndex": 3,
                    "time": 2224
                },
                {
                    "locationIndex": 0,
                    "time": 2247
                },
                {
                    "locationIndex": 4,
                    "time": 2309
                },
                {
                    "locationIndex": 1,
                    "time": 2309
                },
                {
                    "locationIndex": 3,
                    "time": 2343
                },
                {
                    "locationIndex": 5,
                    "time": 2343
                },
                {
                    "locationIndex": 4,
                    "time": 2363
                },
                {
                    "locationIndex": 0,
                    "time": 2381
                },
                {
                    "locationIndex": 3,
                    "time": 2415
                },
                {
                    "locationIndex": 0,
                    "time": 2439
                },
                {
                    "locationIndex": 1,
                    "time": 2509
                },
                {
                    "locationIndex": 4,
                    "time": 2525
                },
                {
                    "locationIndex": 2,
                    "time": 2543
                },
                {
                    "locationIndex": 1,
                    "time": 2570
                },
                {
                    "locationIndex": 2,
                    "time": 2591
                },
                {
                    "locationIndex": 3,
                    "time": 2608
                },
                {
                    "locationIndex": 5,
                    "time": 2627
                },
                {
                    "locationIndex": 2,
                    "time": 2627
                },
                {
                    "locationIndex": 0,
                    "time": 2650
                },
                {
                    "locationIndex": 2,
                    "time": 2701
                },
                {
                    "locationIndex": 0,
                    "time": 2754
                },
                {
                    "locationIndex": 5,
                    "time": 2754
                },
                {
                    "locationIndex": 3,
                    "time": 2777,
                    "type": "long",
                    "ends": 2792
                },
                {
                    "locationIndex": 4,
                    "time": 2801
                },
                {
                    "locationIndex": 5,
                    "time": 2818
                },
                {
                    "locationIndex": 1,
                    "time": 2836
                },
                {
                    "locationIndex": 2,
                    "time": 2862
                },
                {
                    "locationIndex": 5,
                    "time": 2862
                },
                {
                    "locationIndex": 1,
                    "time": 2940
                },
                {
                    "locationIndex": 4,
                    "time": 2956
                },
                {
                    "locationIndex": 2,
                    "time": 2989
                },
                {
                    "locationIndex": 0,
                    "time": 3006
                },
                {
                    "locationIndex": 5,
                    "time": 3040
                },
                {
                    "locationIndex": 0,
                    "time": 3067
                },
                {
                    "locationIndex": 2,
                    "time": 3067
                },
                {
                    "locationIndex": 5,
                    "time": 3083
                },
                {
                    "locationIndex": 0,
                    "time": 3100
                },
                {
                    "locationIndex": 4,
                    "time": 3124
                },
                {
                    "locationIndex": 3,
                    "time": 3159
                },
                {
                    "locationIndex": 0,
                    "time": 3159
                },
                {
                    "locationIndex": 4,
                    "time": 3183
                },
                {
                    "locationIndex": 5,
                    "time": 3213
                },
                {
                    "locationIndex": 3,
                    "time": 3231
                },
                {
                    "locationIndex": 4,
                    "time": 3274
                },
                {
                    "locationIndex": 0,
                    "time": 3307
                },
                {
                    "locationIndex": 2,
                    "time": 3329
                },
                {
                    "locationIndex": 4,
                    "time": 3345
                },
                {
                    "locationIndex": 1,
                    "time": 3382
                },
                {
                    "locationIndex": 4,
                    "time": 3406
                },
                {
                    "locationIndex": 2,
                    "time": 3425
                },
                {
                    "locationIndex": 4,
                    "time": 3442
                },
                {
                    "locationIndex": 1,
                    "time": 3469
                },
                {
                    "locationIndex": 0,
                    "time": 3485
                },
                {
                    "locationIndex": 4,
                    "time": 3485
                },
                {
                    "locationIndex": 3,
                    "time": 3506
                },
                {
                    "locationIndex": 2,
                    "time": 3535
                },
                {
                    "locationIndex": 1,
                    "time": 3559
                },
                {
                    "locationIndex": 0,
                    "time": 3593,
                    "type": "long",
                    "ends": 3608
                },
                {
                    "locationIndex": 1,
                    "time": 3619
                },
                {
                    "locationIndex": 5,
                    "time": 3690
                },
                {
                    "locationIndex": 1,
                    "time": 3715
                },
                {
                    "locationIndex": 3,
                    "time": 3752
                },
                {
                    "locationIndex": 0,
                    "time": 3827
                },
                {
                    "locationIndex": 5,
                    "time": 3827
                },
                {
                    "locationIndex": 4,
                    "time": 3877
                },
                {
                    "locationIndex": 0,
                    "time": 3911
                },
                {
                    "locationIndex": 3,
                    "time": 3939
                },
                {
                    "locationIndex": 4,
                    "time": 3987
                },
                {
                    "locationIndex": 5,
                    "time": 4019
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'hard',
    difficultyLevel : 8,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 5,
                    "time": 147
                },
                {
                    "locationIndex": 3,
                    "time": 164
                },
                {
                    "locationIndex": 4,
                    "time": 219
                },
                {
                    "locationIndex": 0,
                    "time": 231
                },
                {
                    "locationIndex": 4,
                    "time": 269
                },
                {
                    "locationIndex": 1,
                    "time": 331
                },
                {
                    "locationIndex": 3,
                    "time": 331
                },
                {
                    "locationIndex": 0,
                    "time": 385,
                    "type": "long",
                    "ends": 400
                },
                {
                    "locationIndex": 5,
                    "time": 462
                },
                {
                    "locationIndex": 1,
                    "time": 487
                },
                {
                    "locationIndex": 4,
                    "time": 487
                },
                {
                    "locationIndex": 3,
                    "time": 509
                },
                {
                    "locationIndex": 1,
                    "time": 525
                },
                {
                    "locationIndex": 2,
                    "time": 525
                },
                {
                    "locationIndex": 4,
                    "time": 605
                },
                {
                    "locationIndex": 2,
                    "time": 629
                },
                {
                    "locationIndex": 3,
                    "time": 646
                },
                {
                    "locationIndex": 1,
                    "time": 646
                },
                {
                    "locationIndex": 0,
                    "time": 701
                },
                {
                    "locationIndex": 3,
                    "time": 744
                },
                {
                    "locationIndex": 1,
                    "time": 760
                },
                {
                    "locationIndex": 5,
                    "time": 769
                },
                {
                    "locationIndex": 0,
                    "time": 781
                },
                {
                    "locationIndex": 3,
                    "time": 795
                },
                {
                    "locationIndex": 4,
                    "time": 795
                },
                {
                    "locationIndex": 0,
                    "time": 831
                },
                {
                    "locationIndex": 5,
                    "time": 859
                },
                {
                    "locationIndex": 2,
                    "time": 859
                },
                {
                    "locationIndex": 4,
                    "time": 943
                },
                {
                    "locationIndex": 3,
                    "time": 954,
                    "type": "long",
                    "ends": 969
                },
                {
                    "locationIndex": 0,
                    "time": 954,
                    "type": "long",
                    "ends": 969
                },
                {
                    "locationIndex": 4,
                    "time": 975
                },
                {
                    "locationIndex": 2,
                    "time": 1037
                },
                {
                    "locationIndex": 5,
                    "time": 1037
                },
                {
                    "locationIndex": 3,
                    "time": 1150
                },
                {
                    "locationIndex": 1,
                    "time": 1164
                },
                {
                    "locationIndex": 3,
                    "time": 1261
                },
                {
                    "locationIndex": 5,
                    "time": 1261
                },
                {
                    "locationIndex": 1,
                    "time": 1275
                },
                {
                    "locationIndex": 4,
                    "time": 1294
                },
                {
                    "locationIndex": 0,
                    "time": 1294
                },
                {
                    "locationIndex": 2,
                    "time": 1373
                },
                {
                    "locationIndex": 1,
                    "time": 1422
                },
                {
                    "locationIndex": 0,
                    "time": 1447
                },
                {
                    "locationIndex": 5,
                    "time": 1447
                },
                {
                    "locationIndex": 4,
                    "time": 1486
                },
                {
                    "locationIndex": 3,
                    "time": 1549
                },
                {
                    "locationIndex": 2,
                    "time": 1576
                },
                {
                    "locationIndex": 1,
                    "time": 1576
                },
                {
                    "locationIndex": 3,
                    "time": 1587
                },
                {
                    "locationIndex": 0,
                    "time": 1630
                },
                {
                    "locationIndex": 5,
                    "time": 1630
                },
                {
                    "locationIndex": 3,
                    "time": 1670
                },
                {
                    "locationIndex": 1,
                    "time": 1670
                },
                {
                    "locationIndex": 2,
                    "time": 1768
                },
                {
                    "locationIndex": 5,
                    "time": 1797
                },
                {
                    "locationIndex": 2,
                    "time": 1835
                },
                {
                    "locationIndex": 0,
                    "time": 1835
                },
                {
                    "locationIndex": 4,
                    "time": 1893
                },
                {
                    "locationIndex": 3,
                    "time": 1925
                },
                {
                    "locationIndex": 1,
                    "time": 1933
                },
                {
                    "locationIndex": 5,
                    "time": 1933
                },
                {
                    "locationIndex": 0,
                    "time": 1953
                },
                {
                    "locationIndex": 4,
                    "time": 1967
                },
                {
                    "locationIndex": 5,
                    "time": 1967
                },
                {
                    "locationIndex": 0,
                    "time": 1975
                },
                {
                    "locationIndex": 2,
                    "time": 1975
                },
                {
                    "locationIndex": 3,
                    "time": 1975
                },
                {
                    "locationIndex": 5,
                    "time": 1989
                },
                {
                    "locationIndex": 2,
                    "time": 2040
                },
                {
                    "locationIndex": 0,
                    "time": 2061
                },
                {
                    "locationIndex": 4,
                    "time": 2102
                },
                {
                    "locationIndex": 2,
                    "time": 2102
                },
                {
                    "locationIndex": 1,
                    "time": 2111
                },
                {
                    "locationIndex": 3,
                    "time": 2167
                },
                {
                    "locationIndex": 4,
                    "time": 2177
                },
                {
                    "locationIndex": 3,
                    "time": 2185
                },
                {
                    "locationIndex": 0,
                    "time": 2185
                },
                {
                    "locationIndex": 1,
                    "time": 2185
                },
                {
                    "locationIndex": 4,
                    "time": 2224
                },
                {
                    "locationIndex": 5,
                    "time": 2247
                },
                {
                    "locationIndex": 4,
                    "time": 2309
                },
                {
                    "locationIndex": 3,
                    "time": 2309
                },
                {
                    "locationIndex": 5,
                    "time": 2317
                },
                {
                    "locationIndex": 2,
                    "time": 2343
                },
                {
                    "locationIndex": 4,
                    "time": 2343
                },
                {
                    "locationIndex": 1,
                    "time": 2343
                },
                {
                    "locationIndex": 5,
                    "time": 2363
                },
                {
                    "locationIndex": 0,
                    "time": 2381
                },
                {
                    "locationIndex": 4,
                    "time": 2381
                },
                {
                    "locationIndex": 3,
                    "time": 2415
                },
                {
                    "locationIndex": 4,
                    "time": 2439
                },
                {
                    "locationIndex": 5,
                    "time": 2509
                },
                {
                    "locationIndex": 0,
                    "time": 2522
                },
                {
                    "locationIndex": 3,
                    "time": 2522
                },
                {
                    "locationIndex": 1,
                    "time": 2543
                },
                {
                    "locationIndex": 3,
                    "time": 2571
                },
                {
                    "locationIndex": 0,
                    "time": 2571
                },
                {
                    "locationIndex": 5,
                    "time": 2591
                },
                {
                    "locationIndex": 1,
                    "time": 2608
                },
                {
                    "locationIndex": 2,
                    "time": 2608
                },
                {
                    "locationIndex": 3,
                    "time": 2627
                },
                {
                    "locationIndex": 1,
                    "time": 2650
                },
                {
                    "locationIndex": 2,
                    "time": 2650
                },
                {
                    "locationIndex": 3,
                    "time": 2701
                },
                {
                    "locationIndex": 0,
                    "time": 2754,
                    "type": "long",
                    "ends": 2769
                },
                {
                    "locationIndex": 2,
                    "time": 2754,
                    "type": "long",
                    "ends": 2769
                },
                {
                    "locationIndex": 1,
                    "time": 2777
                },
                {
                    "locationIndex": 3,
                    "time": 2777
                },
                {
                    "locationIndex": 4,
                    "time": 2801,
                    "type": "long",
                    "ends": 2816
                },
                {
                    "locationIndex": 3,
                    "time": 2812
                },
                {
                    "locationIndex": 5,
                    "time": 2812
                },
                {
                    "locationIndex": 1,
                    "time": 2826
                },
                {
                    "locationIndex": 0,
                    "time": 2836
                },
                {
                    "locationIndex": 5,
                    "time": 2836
                },
                {
                    "locationIndex": 2,
                    "time": 2851
                },
                {
                    "locationIndex": 3,
                    "time": 2862
                },
                {
                    "locationIndex": 5,
                    "time": 2862
                },
                {
                    "locationIndex": 1,
                    "time": 2898
                },
                {
                    "locationIndex": 3,
                    "time": 2940
                },
                {
                    "locationIndex": 1,
                    "time": 2948
                },
                {
                    "locationIndex": 5,
                    "time": 2956
                },
                {
                    "locationIndex": 2,
                    "time": 2956
                },
                {
                    "locationIndex": 1,
                    "time": 2989,
                    "type": "long",
                    "ends": 3004
                },
                {
                    "locationIndex": 2,
                    "time": 3005
                },
                {
                    "locationIndex": 4,
                    "time": 3040
                },
                {
                    "locationIndex": 5,
                    "time": 3067,
                    "type": "long",
                    "ends": 3082
                },
                {
                    "locationIndex": 0,
                    "time": 3083
                },
                {
                    "locationIndex": 1,
                    "time": 3100
                },
                {
                    "locationIndex": 4,
                    "time": 3100
                },
                {
                    "locationIndex": 0,
                    "time": 3100
                },
                {
                    "locationIndex": 3,
                    "time": 3115
                },
                {
                    "locationIndex": 0,
                    "time": 3124
                },
                {
                    "locationIndex": 1,
                    "time": 3124
                },
                {
                    "locationIndex": 2,
                    "time": 3159,
                    "type": "long",
                    "ends": 3174
                },
                {
                    "locationIndex": 0,
                    "time": 3183
                },
                {
                    "locationIndex": 4,
                    "time": 3195
                },
                {
                    "locationIndex": 1,
                    "time": 3195
                },
                {
                    "locationIndex": 0,
                    "time": 3213
                },
                {
                    "locationIndex": 3,
                    "time": 3231
                },
                {
                    "locationIndex": 5,
                    "time": 3231
                },
                {
                    "locationIndex": 1,
                    "time": 3242
                },
                {
                    "locationIndex": 5,
                    "time": 3274
                },
                {
                    "locationIndex": 3,
                    "time": 3274
                },
                {
                    "locationIndex": 2,
                    "time": 3288
                },
                {
                    "locationIndex": 5,
                    "time": 3307
                },
                {
                    "locationIndex": 1,
                    "time": 3315
                },
                {
                    "locationIndex": 2,
                    "time": 3315
                },
                {
                    "locationIndex": 3,
                    "time": 3329
                },
                {
                    "locationIndex": 1,
                    "time": 3341
                },
                {
                    "locationIndex": 0,
                    "time": 3341
                },
                {
                    "locationIndex": 3,
                    "time": 3382
                },
                {
                    "locationIndex": 0,
                    "time": 3406
                },
                {
                    "locationIndex": 1,
                    "time": 3406
                },
                {
                    "locationIndex": 2,
                    "time": 3414,
                    "type": "long",
                    "ends": 3429
                },
                {
                    "locationIndex": 1,
                    "time": 3425
                },
                {
                    "locationIndex": 5,
                    "time": 3438
                },
                {
                    "locationIndex": 3,
                    "time": 3438
                },
                {
                    "locationIndex": 1,
                    "time": 3446
                },
                {
                    "locationIndex": 4,
                    "time": 3446
                },
                {
                    "locationIndex": 3,
                    "time": 3469
                },
                {
                    "locationIndex": 5,
                    "time": 3485
                },
                {
                    "locationIndex": 1,
                    "time": 3506
                },
                {
                    "locationIndex": 4,
                    "time": 3506
                },
                {
                    "locationIndex": 0,
                    "time": 3519
                },
                {
                    "locationIndex": 2,
                    "time": 3519
                },
                {
                    "locationIndex": 4,
                    "time": 3535
                },
                {
                    "locationIndex": 2,
                    "time": 3559
                },
                {
                    "locationIndex": 3,
                    "time": 3567
                },
                {
                    "locationIndex": 0,
                    "time": 3567
                },
                {
                    "locationIndex": 2,
                    "time": 3593
                },
                {
                    "locationIndex": 0,
                    "time": 3619
                },
                {
                    "locationIndex": 3,
                    "time": 3690
                },
                {
                    "locationIndex": 5,
                    "time": 3690
                },
                {
                    "locationIndex": 4,
                    "time": 3699
                },
                {
                    "locationIndex": 1,
                    "time": 3699
                },
                {
                    "locationIndex": 0,
                    "time": 3715
                },
                {
                    "locationIndex": 2,
                    "time": 3725
                },
                {
                    "locationIndex": 3,
                    "time": 3752
                },
                {
                    "locationIndex": 1,
                    "time": 3752
                },
                {
                    "locationIndex": 0,
                    "time": 3767
                },
                {
                    "locationIndex": 4,
                    "time": 3767
                },
                {
                    "locationIndex": 5,
                    "time": 3827
                },
                {
                    "locationIndex": 4,
                    "time": 3839
                },
                {
                    "locationIndex": 1,
                    "time": 3891
                },
                {
                    "locationIndex": 0,
                    "time": 3899
                },
                {
                    "locationIndex": 1,
                    "time": 3911
                },
                {
                    "locationIndex": 4,
                    "time": 3919
                },
                {
                    "locationIndex": 2,
                    "time": 3960
                },
                {
                    "locationIndex": 1,
                    "time": 3960
                },
                {
                    "locationIndex": 5,
                    "time": 3971
                },
                {
                    "locationIndex": 1,
                    "time": 3983
                },
                {
                    "locationIndex": 4,
                    "time": 4008
                },
                {
                    "locationIndex": 3,
                    "time": 4019
                }
            ]
});
songs.push(song);

song = {};
song.name = '큰집 18층으로 떠나는 여행';
song.composer = '우아한형제들';
song.noteWriter = 'HJOW';
song.bgaUrl = '';
song.musicUrl = '[RSSC]songs/woowahan/track07.mp3';
song.musicAlterUrl = '';// 'https://hjow.duckdns.org/shuttingstars/resources/songs/woowahan/track07.mp3';
song.thumbnailUrl = '';
song.canListen = true;
song.useYoutube = false;
song.youtubeVideoId = '';
song.description = `
|Music: 우아한형제들
|  https://www.woowahan.com/music
|License: 
|  https://www.woowahan.com/music/license
`;
song.loadingTime = 10;
song.bpm = 120;
song.endTime = 0;
song.timeConstant = 0;
song.timeMultiplier = 1;
song.noteMultiplier = 1;
song.serial = 'nai4ilaHbwgwgnoimomwenofnJ93f8gp34qgD39p4g';
song.test = false;
song.onlyRandom = false;
song.difficulties = [];
song.difficulties.push({
    difficultyLabel : 'easy',
    difficultyLevel : 3,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 1,
                    "time": 147
                },
                {
                    "locationIndex": 3,
                    "time": 305
                },
                {
                    "locationIndex": 2,
                    "time": 338
                },
                {
                    "locationIndex": 1,
                    "time": 370
                },
                {
                    "locationIndex": 0,
                    "time": 426
                },
                {
                    "locationIndex": 1,
                    "time": 466
                },
                {
                    "locationIndex": 2,
                    "time": 499
                },
                {
                    "locationIndex": 5,
                    "time": 531
                },
                {
                    "locationIndex": 3,
                    "time": 596
                },
                {
                    "locationIndex": 4,
                    "time": 628
                },
                {
                    "locationIndex": 5,
                    "time": 690
                },
                {
                    "locationIndex": 4,
                    "time": 722
                },
                {
                    "locationIndex": 0,
                    "time": 754
                },
                {
                    "locationIndex": 1,
                    "time": 786
                },
                {
                    "locationIndex": 3,
                    "time": 818
                },
                {
                    "locationIndex": 4,
                    "time": 853
                },
                {
                    "locationIndex": 0,
                    "time": 893
                },
                {
                    "locationIndex": 5,
                    "time": 893
                },
                {
                    "locationIndex": 3,
                    "time": 947
                },
                {
                    "locationIndex": 0,
                    "time": 979
                },
                {
                    "locationIndex": 1,
                    "time": 1011
                },
                {
                    "locationIndex": 2,
                    "time": 1046
                },
                {
                    "locationIndex": 0,
                    "time": 1093
                },
                {
                    "locationIndex": 4,
                    "time": 1128
                },
                {
                    "locationIndex": 3,
                    "time": 1170
                },
                {
                    "locationIndex": 2,
                    "time": 1202
                },
                {
                    "locationIndex": 0,
                    "time": 1202
                },
                {
                    "locationIndex": 5,
                    "time": 1234
                },
                {
                    "locationIndex": 0,
                    "time": 1267
                },
                {
                    "locationIndex": 4,
                    "time": 1301
                },
                {
                    "locationIndex": 3,
                    "time": 1350
                },
                {
                    "locationIndex": 1,
                    "time": 1350
                },
                {
                    "locationIndex": 5,
                    "time": 1384
                },
                {
                    "locationIndex": 3,
                    "time": 1416
                },
                {
                    "locationIndex": 5,
                    "time": 1459
                },
                {
                    "locationIndex": 3,
                    "time": 1493
                },
                {
                    "locationIndex": 0,
                    "time": 1529
                },
                {
                    "locationIndex": 3,
                    "time": 1586
                },
                {
                    "locationIndex": 0,
                    "time": 1640
                },
                {
                    "locationIndex": 2,
                    "time": 1683
                },
                {
                    "locationIndex": 3,
                    "time": 1741
                },
                {
                    "locationIndex": 5,
                    "time": 1779
                },
                {
                    "locationIndex": 4,
                    "time": 1813
                },
                {
                    "locationIndex": 5,
                    "time": 1854
                },
                {
                    "locationIndex": 3,
                    "time": 1896
                },
                {
                    "locationIndex": 5,
                    "time": 1928
                },
                {
                    "locationIndex": 1,
                    "time": 1967
                },
                {
                    "locationIndex": 2,
                    "time": 2002
                },
                {
                    "locationIndex": 5,
                    "time": 2034
                },
                {
                    "locationIndex": 3,
                    "time": 2067
                },
                {
                    "locationIndex": 2,
                    "time": 2099
                },
                {
                    "locationIndex": 0,
                    "time": 2135
                },
                {
                    "locationIndex": 1,
                    "time": 2183
                },
                {
                    "locationIndex": 4,
                    "time": 2222
                },
                {
                    "locationIndex": 3,
                    "time": 2258
                },
                {
                    "locationIndex": 1,
                    "time": 2309
                },
                {
                    "locationIndex": 2,
                    "time": 2354
                },
                {
                    "locationIndex": 4,
                    "time": 2389
                },
                {
                    "locationIndex": 3,
                    "time": 2389
                },
                {
                    "locationIndex": 1,
                    "time": 2429
                },
                {
                    "locationIndex": 5,
                    "time": 2462
                },
                {
                    "locationIndex": 1,
                    "time": 2500
                },
                {
                    "locationIndex": 2,
                    "time": 2535
                },
                {
                    "locationIndex": 1,
                    "time": 2578
                },
                {
                    "locationIndex": 4,
                    "time": 2611
                },
                {
                    "locationIndex": 5,
                    "time": 2643
                },
                {
                    "locationIndex": 4,
                    "time": 2675
                },
                {
                    "locationIndex": 5,
                    "time": 2738
                },
                {
                    "locationIndex": 1,
                    "time": 2770
                },
                {
                    "locationIndex": 3,
                    "time": 2802
                },
                {
                    "locationIndex": 2,
                    "time": 2834
                },
                {
                    "locationIndex": 4,
                    "time": 2866
                },
                {
                    "locationIndex": 1,
                    "time": 2909
                },
                {
                    "locationIndex": 3,
                    "time": 2941
                },
                {
                    "locationIndex": 0,
                    "time": 2994
                },
                {
                    "locationIndex": 2,
                    "time": 3026
                },
                {
                    "locationIndex": 4,
                    "time": 3058
                },
                {
                    "locationIndex": 1,
                    "time": 3090
                },
                {
                    "locationIndex": 3,
                    "time": 3122
                },
                {
                    "locationIndex": 4,
                    "time": 3122
                },
                {
                    "locationIndex": 2,
                    "time": 3167
                },
                {
                    "locationIndex": 1,
                    "time": 3203
                },
                {
                    "locationIndex": 2,
                    "time": 3246
                },
                {
                    "locationIndex": 3,
                    "time": 3282
                },
                {
                    "locationIndex": 1,
                    "time": 3319
                },
                {
                    "locationIndex": 0,
                    "time": 3368
                },
                {
                    "locationIndex": 1,
                    "time": 3410
                },
                {
                    "locationIndex": 2,
                    "time": 3442
                },
                {
                    "locationIndex": 1,
                    "time": 3474
                },
                {
                    "locationIndex": 5,
                    "time": 3506
                },
                {
                    "locationIndex": 3,
                    "time": 3538
                },
                {
                    "locationIndex": 0,
                    "time": 3583
                },
                {
                    "locationIndex": 5,
                    "time": 3619
                },
                {
                    "locationIndex": 0,
                    "time": 3656
                },
                {
                    "locationIndex": 4,
                    "time": 3720
                },
                {
                    "locationIndex": 1,
                    "time": 3816
                },
                {
                    "locationIndex": 0,
                    "time": 3867
                },
                {
                    "locationIndex": 1,
                    "time": 3902
                },
                {
                    "locationIndex": 5,
                    "time": 4009
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'hard',
    difficultyLevel : 7, // MIN TOTAL SUM 25 / INC COUNT STD 15, INC SUM STD 75, MIN GAP 4
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 5,
                    "time": 147
                },
                {
                    "locationIndex": 1,
                    "time": 160
                },
                {
                    "locationIndex": 0,
                    "time": 180
                },
                {
                    "locationIndex": 4,
                    "time": 207
                },
                {
                    "locationIndex": 3,
                    "time": 245
                },
                {
                    "locationIndex": 2,
                    "time": 274
                },
                {
                    "locationIndex": 0,
                    "time": 286
                },
                {
                    "locationIndex": 4,
                    "time": 305
                },
                {
                    "locationIndex": 0,
                    "time": 338
                },
                {
                    "locationIndex": 2,
                    "time": 370
                },
                {
                    "locationIndex": 1,
                    "time": 403
                },
                {
                    "locationIndex": 5,
                    "time": 403
                },
                {
                    "locationIndex": 3,
                    "time": 434
                },
                {
                    "locationIndex": 1,
                    "time": 446
                },
                {
                    "locationIndex": 5,
                    "time": 466
                },
                {
                    "locationIndex": 2,
                    "time": 499
                },
                {
                    "locationIndex": 1,
                    "time": 499
                },
                {
                    "locationIndex": 0,
                    "time": 531
                },
                {
                    "locationIndex": 3,
                    "time": 595
                },
                {
                    "locationIndex": 4,
                    "time": 611
                },
                {
                    "locationIndex": 2,
                    "time": 627
                },
                {
                    "locationIndex": 5,
                    "time": 643
                },
                {
                    "locationIndex": 0,
                    "time": 643
                },
                {
                    "locationIndex": 1,
                    "time": 655
                },
                {
                    "locationIndex": 2,
                    "time": 690
                },
                {
                    "locationIndex": 5,
                    "time": 690
                },
                {
                    "locationIndex": 4,
                    "time": 717,
                    "type": "long",
                    "ends": 732
                },
                {
                    "locationIndex": 2,
                    "time": 754
                },
                {
                    "locationIndex": 0,
                    "time": 754
                },
                {
                    "locationIndex": 1,
                    "time": 770
                },
                {
                    "locationIndex": 3,
                    "time": 770
                },
                {
                    "locationIndex": 2,
                    "time": 786
                },
                {
                    "locationIndex": 3,
                    "time": 808
                },
                {
                    "locationIndex": 5,
                    "time": 818
                },
                {
                    "locationIndex": 0,
                    "time": 818
                },
                {
                    "locationIndex": 3,
                    "time": 835
                },
                {
                    "locationIndex": 4,
                    "time": 835
                },
                {
                    "locationIndex": 2,
                    "time": 850
                },
                {
                    "locationIndex": 4,
                    "time": 866
                },
                {
                    "locationIndex": 5,
                    "time": 882
                },
                {
                    "locationIndex": 0,
                    "time": 882
                },
                {
                    "locationIndex": 4,
                    "time": 893
                },
                {
                    "locationIndex": 1,
                    "time": 893
                },
                {
                    "locationIndex": 0,
                    "time": 901
                },
                {
                    "locationIndex": 4,
                    "time": 914
                },
                {
                    "locationIndex": 3,
                    "time": 914
                },
                {
                    "locationIndex": 1,
                    "time": 947
                },
                {
                    "locationIndex": 4,
                    "time": 957
                },
                {
                    "locationIndex": 3,
                    "time": 957
                },
                {
                    "locationIndex": 2,
                    "time": 965,
                    "type": "long",
                    "ends": 980
                },
                {
                    "locationIndex": 1,
                    "time": 973
                },
                {
                    "locationIndex": 0,
                    "time": 973
                },
                {
                    "locationIndex": 5,
                    "time": 981
                },
                {
                    "locationIndex": 4,
                    "time": 1011
                },
                {
                    "locationIndex": 3,
                    "time": 1011
                },
                {
                    "locationIndex": 1,
                    "time": 1026
                },
                {
                    "locationIndex": 3,
                    "time": 1035
                },
                {
                    "locationIndex": 0,
                    "time": 1035
                },
                {
                    "locationIndex": 1,
                    "time": 1046
                },
                {
                    "locationIndex": 4,
                    "time": 1069
                },
                {
                    "locationIndex": 2,
                    "time": 1069
                },
                {
                    "locationIndex": 3,
                    "time": 1093
                },
                {
                    "locationIndex": 0,
                    "time": 1104
                },
                {
                    "locationIndex": 4,
                    "time": 1104
                },
                {
                    "locationIndex": 5,
                    "time": 1112
                },
                {
                    "locationIndex": 2,
                    "time": 1128
                },
                {
                    "locationIndex": 0,
                    "time": 1128
                },
                {
                    "locationIndex": 4,
                    "time": 1138
                },
                {
                    "locationIndex": 3,
                    "time": 1138
                },
                {
                    "locationIndex": 0,
                    "time": 1155
                },
                {
                    "locationIndex": 3,
                    "time": 1170
                },
                {
                    "locationIndex": 2,
                    "time": 1170
                },
                {
                    "locationIndex": 0,
                    "time": 1202
                },
                {
                    "locationIndex": 2,
                    "time": 1234
                },
                {
                    "locationIndex": 4,
                    "time": 1245,
                    "type": "long",
                    "ends": 1260
                },
                {
                    "locationIndex": 0,
                    "time": 1267
                },
                {
                    "locationIndex": 1,
                    "time": 1278
                },
                {
                    "locationIndex": 5,
                    "time": 1278
                },
                {
                    "locationIndex": 0,
                    "time": 1288
                },
                {
                    "locationIndex": 1,
                    "time": 1296
                },
                {
                    "locationIndex": 5,
                    "time": 1296
                },
                {
                    "locationIndex": 2,
                    "time": 1320
                },
                {
                    "locationIndex": 4,
                    "time": 1331
                },
                {
                    "locationIndex": 5,
                    "time": 1331
                },
                {
                    "locationIndex": 3,
                    "time": 1350
                },
                {
                    "locationIndex": 1,
                    "time": 1350
                },
                {
                    "locationIndex": 0,
                    "time": 1359
                },
                {
                    "locationIndex": 1,
                    "time": 1376
                },
                {
                    "locationIndex": 2,
                    "time": 1384
                },
                {
                    "locationIndex": 5,
                    "time": 1384
                },
                {
                    "locationIndex": 1,
                    "time": 1394
                },
                {
                    "locationIndex": 4,
                    "time": 1413
                },
                {
                    "locationIndex": 2,
                    "time": 1427
                },
                {
                    "locationIndex": 3,
                    "time": 1444
                },
                {
                    "locationIndex": 1,
                    "time": 1444
                },
                {
                    "locationIndex": 2,
                    "time": 1459
                },
                {
                    "locationIndex": 3,
                    "time": 1469
                },
                {
                    "locationIndex": 5,
                    "time": 1469
                },
                {
                    "locationIndex": 1,
                    "time": 1485
                },
                {
                    "locationIndex": 5,
                    "time": 1493
                },
                {
                    "locationIndex": 3,
                    "time": 1493
                },
                {
                    "locationIndex": 0,
                    "time": 1523
                },
                {
                    "locationIndex": 2,
                    "time": 1523
                },
                {
                    "locationIndex": 1,
                    "time": 1541
                },
                {
                    "locationIndex": 2,
                    "time": 1555
                },
                {
                    "locationIndex": 1,
                    "time": 1586
                },
                {
                    "locationIndex": 5,
                    "time": 1597
                },
                {
                    "locationIndex": 3,
                    "time": 1605
                },
                {
                    "locationIndex": 4,
                    "time": 1605
                },
                {
                    "locationIndex": 5,
                    "time": 1640
                },
                {
                    "locationIndex": 1,
                    "time": 1640
                },
                {
                    "locationIndex": 2,
                    "time": 1650
                },
                {
                    "locationIndex": 5,
                    "time": 1683
                },
                {
                    "locationIndex": 3,
                    "time": 1683
                },
                {
                    "locationIndex": 0,
                    "time": 1698
                },
                {
                    "locationIndex": 1,
                    "time": 1714,
                    "type": "long",
                    "ends": 1729
                },
                {
                    "locationIndex": 4,
                    "time": 1714,
                    "type": "long",
                    "ends": 1729
                },
                {
                    "locationIndex": 3,
                    "time": 1741
                },
                {
                    "locationIndex": 0,
                    "time": 1741
                },
                {
                    "locationIndex": 2,
                    "time": 1779
                },
                {
                    "locationIndex": 5,
                    "time": 1796
                },
                {
                    "locationIndex": 1,
                    "time": 1796
                },
                {
                    "locationIndex": 2,
                    "time": 1810
                },
                {
                    "locationIndex": 3,
                    "time": 1826
                },
                {
                    "locationIndex": 4,
                    "time": 1826
                },
                {
                    "locationIndex": 5,
                    "time": 1842
                },
                {
                    "locationIndex": 4,
                    "time": 1854
                },
                {
                    "locationIndex": 3,
                    "time": 1874
                },
                {
                    "locationIndex": 0,
                    "time": 1874
                },
                {
                    "locationIndex": 2,
                    "time": 1885
                },
                {
                    "locationIndex": 3,
                    "time": 1896
                },
                {
                    "locationIndex": 0,
                    "time": 1896
                },
                {
                    "locationIndex": 2,
                    "time": 1906
                },
                {
                    "locationIndex": 3,
                    "time": 1928
                },
                {
                    "locationIndex": 1,
                    "time": 1928
                },
                {
                    "locationIndex": 2,
                    "time": 1937
                },
                {
                    "locationIndex": 3,
                    "time": 1953
                },
                {
                    "locationIndex": 0,
                    "time": 1953
                },
                {
                    "locationIndex": 1,
                    "time": 1967
                },
                {
                    "locationIndex": 0,
                    "time": 1976
                },
                {
                    "locationIndex": 2,
                    "time": 1990
                },
                {
                    "locationIndex": 5,
                    "time": 2002
                },
                {
                    "locationIndex": 4,
                    "time": 2002
                },
                {
                    "locationIndex": 3,
                    "time": 2029
                },
                {
                    "locationIndex": 5,
                    "time": 2052
                },
                {
                    "locationIndex": 0,
                    "time": 2067
                },
                {
                    "locationIndex": 4,
                    "time": 2067
                },
                {
                    "locationIndex": 2,
                    "time": 2087
                },
                {
                    "locationIndex": 1,
                    "time": 2087
                },
                {
                    "locationIndex": 3,
                    "time": 2099
                },
                {
                    "locationIndex": 1,
                    "time": 2109
                },
                {
                    "locationIndex": 2,
                    "time": 2127
                },
                {
                    "locationIndex": 3,
                    "time": 2135
                },
                {
                    "locationIndex": 0,
                    "time": 2135
                },
                {
                    "locationIndex": 2,
                    "time": 2146
                },
                {
                    "locationIndex": 4,
                    "time": 2162
                },
                {
                    "locationIndex": 1,
                    "time": 2162
                },
                {
                    "locationIndex": 0,
                    "time": 2183
                },
                {
                    "locationIndex": 4,
                    "time": 2191,
                    "type": "long",
                    "ends": 2206
                },
                {
                    "locationIndex": 5,
                    "time": 2208
                },
                {
                    "locationIndex": 3,
                    "time": 2208
                },
                {
                    "locationIndex": 2,
                    "time": 2222
                },
                {
                    "locationIndex": 5,
                    "time": 2238
                },
                {
                    "locationIndex": 1,
                    "time": 2238
                },
                {
                    "locationIndex": 3,
                    "time": 2258
                },
                {
                    "locationIndex": 2,
                    "time": 2258
                },
                {
                    "locationIndex": 5,
                    "time": 2301
                },
                {
                    "locationIndex": 1,
                    "time": 2309
                },
                {
                    "locationIndex": 4,
                    "time": 2322
                },
                {
                    "locationIndex": 1,
                    "time": 2354,
                    "type": "long",
                    "ends": 2369
                },
                {
                    "locationIndex": 3,
                    "time": 2365
                },
                {
                    "locationIndex": 2,
                    "time": 2365
                },
                {
                    "locationIndex": 5,
                    "time": 2389
                },
                {
                    "locationIndex": 0,
                    "time": 2389
                },
                {
                    "locationIndex": 2,
                    "time": 2414
                },
                {
                    "locationIndex": 0,
                    "time": 2429
                },
                {
                    "locationIndex": 5,
                    "time": 2429
                },
                {
                    "locationIndex": 2,
                    "time": 2450
                },
                {
                    "locationIndex": 1,
                    "time": 2462
                },
                {
                    "locationIndex": 5,
                    "time": 2462
                },
                {
                    "locationIndex": 4,
                    "time": 2478
                },
                {
                    "locationIndex": 2,
                    "time": 2500
                },
                {
                    "locationIndex": 0,
                    "time": 2514
                },
                {
                    "locationIndex": 5,
                    "time": 2526
                },
                {
                    "locationIndex": 4,
                    "time": 2526
                },
                {
                    "locationIndex": 1,
                    "time": 2535
                },
                {
                    "locationIndex": 0,
                    "time": 2546
                },
                {
                    "locationIndex": 1,
                    "time": 2563
                },
                {
                    "locationIndex": 2,
                    "time": 2578
                },
                {
                    "locationIndex": 0,
                    "time": 2578
                },
                {
                    "locationIndex": 3,
                    "time": 2589
                },
                {
                    "locationIndex": 2,
                    "time": 2611
                },
                {
                    "locationIndex": 5,
                    "time": 2611
                },
                {
                    "locationIndex": 4,
                    "time": 2619
                },
                {
                    "locationIndex": 3,
                    "time": 2642
                },
                {
                    "locationIndex": 5,
                    "time": 2642
                },
                {
                    "locationIndex": 1,
                    "time": 2674
                },
                {
                    "locationIndex": 3,
                    "time": 2685
                },
                {
                    "locationIndex": 0,
                    "time": 2685
                },
                {
                    "locationIndex": 4,
                    "time": 2706
                },
                {
                    "locationIndex": 5,
                    "time": 2706
                },
                {
                    "locationIndex": 0,
                    "time": 2738
                },
                {
                    "locationIndex": 2,
                    "time": 2758
                },
                {
                    "locationIndex": 3,
                    "time": 2770
                },
                {
                    "locationIndex": 4,
                    "time": 2770
                },
                {
                    "locationIndex": 1,
                    "time": 2792
                },
                {
                    "locationIndex": 4,
                    "time": 2802
                },
                {
                    "locationIndex": 5,
                    "time": 2802
                },
                {
                    "locationIndex": 1,
                    "time": 2813
                },
                {
                    "locationIndex": 5,
                    "time": 2822
                },
                {
                    "locationIndex": 4,
                    "time": 2834
                },
                {
                    "locationIndex": 0,
                    "time": 2834
                },
                {
                    "locationIndex": 5,
                    "time": 2855
                },
                {
                    "locationIndex": 1,
                    "time": 2865
                },
                {
                    "locationIndex": 4,
                    "time": 2865
                },
                {
                    "locationIndex": 0,
                    "time": 2888
                },
                {
                    "locationIndex": 4,
                    "time": 2898
                },
                {
                    "locationIndex": 1,
                    "time": 2898
                },
                {
                    "locationIndex": 0,
                    "time": 2909
                },
                {
                    "locationIndex": 1,
                    "time": 2931
                },
                {
                    "locationIndex": 2,
                    "time": 2931
                },
                {
                    "locationIndex": 0,
                    "time": 2941
                },
                {
                    "locationIndex": 5,
                    "time": 2952
                },
                {
                    "locationIndex": 1,
                    "time": 2952
                },
                {
                    "locationIndex": 0,
                    "time": 2962
                },
                {
                    "locationIndex": 2,
                    "time": 2994
                },
                {
                    "locationIndex": 3,
                    "time": 2994
                },
                {
                    "locationIndex": 4,
                    "time": 3005
                },
                {
                    "locationIndex": 0,
                    "time": 3015
                },
                {
                    "locationIndex": 5,
                    "time": 3023
                },
                {
                    "locationIndex": 2,
                    "time": 3045
                },
                {
                    "locationIndex": 0,
                    "time": 3058
                },
                {
                    "locationIndex": 5,
                    "time": 3058
                },
                {
                    "locationIndex": 4,
                    "time": 3071,
                    "type": "long",
                    "ends": 3086
                },
                {
                    "locationIndex": 1,
                    "time": 3079
                },
                {
                    "locationIndex": 0,
                    "time": 3079
                },
                {
                    "locationIndex": 2,
                    "time": 3090
                },
                {
                    "locationIndex": 3,
                    "time": 3090
                },
                {
                    "locationIndex": 0,
                    "time": 3101
                },
                {
                    "locationIndex": 1,
                    "time": 3111
                },
                {
                    "locationIndex": 5,
                    "time": 3111
                },
                {
                    "locationIndex": 3,
                    "time": 3122
                },
                {
                    "locationIndex": 1,
                    "time": 3144
                },
                {
                    "locationIndex": 2,
                    "time": 3144
                },
                {
                    "locationIndex": 4,
                    "time": 3154
                },
                {
                    "locationIndex": 1,
                    "time": 3167
                },
                {
                    "locationIndex": 0,
                    "time": 3167
                },
                {
                    "locationIndex": 4,
                    "time": 3176
                },
                {
                    "locationIndex": 0,
                    "time": 3186
                },
                {
                    "locationIndex": 2,
                    "time": 3186
                },
                {
                    "locationIndex": 1,
                    "time": 3203
                },
                {
                    "locationIndex": 5,
                    "time": 3203
                },
                {
                    "locationIndex": 0,
                    "time": 3213
                },
                {
                    "locationIndex": 5,
                    "time": 3234
                },
                {
                    "locationIndex": 4,
                    "time": 3246
                },
                {
                    "locationIndex": 3,
                    "time": 3268
                },
                {
                    "locationIndex": 5,
                    "time": 3268
                },
                {
                    "locationIndex": 0,
                    "time": 3282,
                    "type": "long",
                    "ends": 3297
                },
                {
                    "locationIndex": 5,
                    "time": 3291
                },
                {
                    "locationIndex": 4,
                    "time": 3306
                },
                {
                    "locationIndex": 3,
                    "time": 3306
                },
                {
                    "locationIndex": 1,
                    "time": 3319
                },
                {
                    "locationIndex": 5,
                    "time": 3327
                },
                {
                    "locationIndex": 4,
                    "time": 3327
                },
                {
                    "locationIndex": 1,
                    "time": 3336
                },
                {
                    "locationIndex": 3,
                    "time": 3336
                },
                {
                    "locationIndex": 2,
                    "time": 3347
                },
                {
                    "locationIndex": 3,
                    "time": 3368
                },
                {
                    "locationIndex": 1,
                    "time": 3379
                },
                {
                    "locationIndex": 5,
                    "time": 3379
                },
                {
                    "locationIndex": 2,
                    "time": 3387
                },
                {
                    "locationIndex": 0,
                    "time": 3387
                },
                {
                    "locationIndex": 1,
                    "time": 3410
                },
                {
                    "locationIndex": 5,
                    "time": 3421
                },
                {
                    "locationIndex": 3,
                    "time": 3421
                },
                {
                    "locationIndex": 0,
                    "time": 3432
                },
                {
                    "locationIndex": 5,
                    "time": 3442
                },
                {
                    "locationIndex": 1,
                    "time": 3442
                },
                {
                    "locationIndex": 2,
                    "time": 3454
                },
                {
                    "locationIndex": 4,
                    "time": 3454
                },
                {
                    "locationIndex": 3,
                    "time": 3470,
                    "type": "long",
                    "ends": 3485
                },
                {
                    "locationIndex": 5,
                    "time": 3483
                },
                {
                    "locationIndex": 4,
                    "time": 3483
                },
                {
                    "locationIndex": 1,
                    "time": 3506
                },
                {
                    "locationIndex": 4,
                    "time": 3517
                },
                {
                    "locationIndex": 0,
                    "time": 3517
                },
                {
                    "locationIndex": 5,
                    "time": 3535
                },
                {
                    "locationIndex": 3,
                    "time": 3546
                },
                {
                    "locationIndex": 1,
                    "time": 3555
                },
                {
                    "locationIndex": 4,
                    "time": 3555
                },
                {
                    "locationIndex": 0,
                    "time": 3570
                },
                {
                    "locationIndex": 2,
                    "time": 3583,
                    "type": "long",
                    "ends": 3598
                },
                {
                    "locationIndex": 3,
                    "time": 3592
                },
                {
                    "locationIndex": 1,
                    "time": 3602
                },
                {
                    "locationIndex": 4,
                    "time": 3602
                },
                {
                    "locationIndex": 0,
                    "time": 3613
                },
                {
                    "locationIndex": 5,
                    "time": 3623
                },
                {
                    "locationIndex": 4,
                    "time": 3634
                },
                {
                    "locationIndex": 1,
                    "time": 3656
                },
                {
                    "locationIndex": 0,
                    "time": 3682
                },
                {
                    "locationIndex": 3,
                    "time": 3682
                },
                {
                    "locationIndex": 4,
                    "time": 3720
                },
                {
                    "locationIndex": 1,
                    "time": 3720
                },
                {
                    "locationIndex": 0,
                    "time": 3740
                },
                {
                    "locationIndex": 1,
                    "time": 3769
                },
                {
                    "locationIndex": 3,
                    "time": 3779
                },
                {
                    "locationIndex": 4,
                    "time": 3853
                },
                {
                    "locationIndex": 1,
                    "time": 3863
                },
                {
                    "locationIndex": 4,
                    "time": 3872
                },
                {
                    "locationIndex": 1,
                    "time": 3889
                },
                {
                    "locationIndex": 5,
                    "time": 3898
                },
                {
                    "locationIndex": 1,
                    "time": 3925
                },
                {
                    "locationIndex": 0,
                    "time": 3959
                },
                {
                    "locationIndex": 5,
                    "time": 3989
                },
                {
                    "locationIndex": 1,
                    "time": 4009
                },
                {
                    "locationIndex": 5,
                    "time": 4063
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'ex1',
    difficultyLevel : 11,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 3,
                    "time": 147
                },
                {
                    "locationIndex": 2,
                    "time": 179
                },
                {
                    "locationIndex": 4,
                    "time": 275
                },
                {
                    "locationIndex": 5,
                    "time": 306
                },
                {
                    "locationIndex": 0,
                    "time": 329
                },
                {
                    "locationIndex": 4,
                    "time": 338
                },
                {
                    "locationIndex": 5,
                    "time": 338
                },
                {
                    "locationIndex": 0,
                    "time": 340
                },
                {
                    "locationIndex": 3,
                    "time": 370
                },
                {
                    "locationIndex": 4,
                    "time": 372
                },
                {
                    "locationIndex": 5,
                    "time": 427
                },
                {
                    "locationIndex": 3,
                    "time": 434
                },
                {
                    "locationIndex": 0,
                    "time": 434
                },
                {
                    "locationIndex": 1,
                    "time": 446
                },
                {
                    "locationIndex": 4,
                    "time": 446
                },
                {
                    "locationIndex": 0,
                    "time": 451
                },
                {
                    "locationIndex": 5,
                    "time": 466
                },
                {
                    "locationIndex": 3,
                    "time": 466
                },
                {
                    "locationIndex": 4,
                    "time": 499
                },
                {
                    "locationIndex": 3,
                    "time": 525
                },
                {
                    "locationIndex": 0,
                    "time": 531
                },
                {
                    "locationIndex": 1,
                    "time": 531
                },
                {
                    "locationIndex": 4,
                    "time": 531
                },
                {
                    "locationIndex": 3,
                    "time": 533
                },
                {
                    "locationIndex": 2,
                    "time": 533
                },
                {
                    "locationIndex": 5,
                    "time": 595
                },
                {
                    "locationIndex": 1,
                    "time": 597
                },
                {
                    "locationIndex": 3,
                    "time": 597
                },
                {
                    "locationIndex": 5,
                    "time": 611,
                    "type": "long",
                    "ends": 626
                },
                {
                    "locationIndex": 0,
                    "time": 626
                },
                {
                    "locationIndex": 1,
                    "time": 628
                },
                {
                    "locationIndex": 3,
                    "time": 628
                },
                {
                    "locationIndex": 4,
                    "time": 643
                },
                {
                    "locationIndex": 3,
                    "time": 655
                },
                {
                    "locationIndex": 0,
                    "time": 655
                },
                {
                    "locationIndex": 5,
                    "time": 655
                },
                {
                    "locationIndex": 2,
                    "time": 658
                },
                {
                    "locationIndex": 0,
                    "time": 690
                },
                {
                    "locationIndex": 1,
                    "time": 690
                },
                {
                    "locationIndex": 3,
                    "time": 696
                },
                {
                    "locationIndex": 2,
                    "time": 696
                },
                {
                    "locationIndex": 4,
                    "time": 717
                },
                {
                    "locationIndex": 0,
                    "time": 722
                },
                {
                    "locationIndex": 3,
                    "time": 722
                },
                {
                    "locationIndex": 4,
                    "time": 754
                },
                {
                    "locationIndex": 2,
                    "time": 770
                },
                {
                    "locationIndex": 0,
                    "time": 770
                },
                {
                    "locationIndex": 1,
                    "time": 770
                },
                {
                    "locationIndex": 3,
                    "time": 776
                },
                {
                    "locationIndex": 0,
                    "time": 786
                },
                {
                    "locationIndex": 1,
                    "time": 786
                },
                {
                    "locationIndex": 5,
                    "time": 789,
                    "type": "long",
                    "ends": 804
                },
                {
                    "locationIndex": 1,
                    "time": 808
                },
                {
                    "locationIndex": 0,
                    "time": 808
                },
                {
                    "locationIndex": 3,
                    "time": 818
                },
                {
                    "locationIndex": 2,
                    "time": 818
                },
                {
                    "locationIndex": 1,
                    "time": 835
                },
                {
                    "locationIndex": 5,
                    "time": 838
                },
                {
                    "locationIndex": 0,
                    "time": 838
                },
                {
                    "locationIndex": 4,
                    "time": 841,
                    "type": "long",
                    "ends": 856
                },
                {
                    "locationIndex": 2,
                    "time": 841,
                    "type": "long",
                    "ends": 856
                },
                {
                    "locationIndex": 3,
                    "time": 841,
                    "type": "long",
                    "ends": 856
                },
                {
                    "locationIndex": 5,
                    "time": 850
                },
                {
                    "locationIndex": 0,
                    "time": 850
                },
                {
                    "locationIndex": 1,
                    "time": 853
                },
                {
                    "locationIndex": 5,
                    "time": 866
                },
                {
                    "locationIndex": 0,
                    "time": 866
                },
                {
                    "locationIndex": 1,
                    "time": 882
                },
                {
                    "locationIndex": 0,
                    "time": 893
                },
                {
                    "locationIndex": 1,
                    "time": 901
                },
                {
                    "locationIndex": 5,
                    "time": 901
                },
                {
                    "locationIndex": 4,
                    "time": 904,
                    "type": "long",
                    "ends": 919
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
                    "locationIndex": 0,
                    "time": 917
                },
                {
                    "locationIndex": 3,
                    "time": 917
                },
                {
                    "locationIndex": 2,
                    "time": 947
                },
                {
                    "locationIndex": 5,
                    "time": 947
                },
                {
                    "locationIndex": 1,
                    "time": 957
                },
                {
                    "locationIndex": 3,
                    "time": 962
                },
                {
                    "locationIndex": 0,
                    "time": 962
                },
                {
                    "locationIndex": 5,
                    "time": 965,
                    "type": "long",
                    "ends": 980
                },
                {
                    "locationIndex": 3,
                    "time": 973
                },
                {
                    "locationIndex": 1,
                    "time": 973
                },
                {
                    "locationIndex": 0,
                    "time": 978
                },
                {
                    "locationIndex": 1,
                    "time": 981
                },
                {
                    "locationIndex": 2,
                    "time": 981
                },
                {
                    "locationIndex": 0,
                    "time": 1011
                },
                {
                    "locationIndex": 3,
                    "time": 1011
                },
                {
                    "locationIndex": 4,
                    "time": 1026
                },
                {
                    "locationIndex": 2,
                    "time": 1030
                },
                {
                    "locationIndex": 1,
                    "time": 1030
                },
                {
                    "locationIndex": 0,
                    "time": 1032
                },
                {
                    "locationIndex": 3,
                    "time": 1032
                },
                {
                    "locationIndex": 1,
                    "time": 1035
                },
                {
                    "locationIndex": 2,
                    "time": 1039,
                    "type": "long",
                    "ends": 1054
                },
                {
                    "locationIndex": 3,
                    "time": 1039,
                    "type": "long",
                    "ends": 1054
                },
                {
                    "locationIndex": 0,
                    "time": 1046
                },
                {
                    "locationIndex": 1,
                    "time": 1046
                },
                {
                    "locationIndex": 5,
                    "time": 1069
                },
                {
                    "locationIndex": 4,
                    "time": 1069
                },
                {
                    "locationIndex": 0,
                    "time": 1075
                },
                {
                    "locationIndex": 1,
                    "time": 1093
                },
                {
                    "locationIndex": 2,
                    "time": 1093
                },
                {
                    "locationIndex": 3,
                    "time": 1096
                },
                {
                    "locationIndex": 4,
                    "time": 1096
                },
                {
                    "locationIndex": 0,
                    "time": 1104
                },
                {
                    "locationIndex": 5,
                    "time": 1104
                },
                {
                    "locationIndex": 1,
                    "time": 1107
                },
                {
                    "locationIndex": 0,
                    "time": 1112
                },
                {
                    "locationIndex": 5,
                    "time": 1112
                },
                {
                    "locationIndex": 2,
                    "time": 1128
                },
                {
                    "locationIndex": 4,
                    "time": 1128
                },
                {
                    "locationIndex": 0,
                    "time": 1131
                },
                {
                    "locationIndex": 1,
                    "time": 1131
                },
                {
                    "locationIndex": 3,
                    "time": 1138
                },
                {
                    "locationIndex": 2,
                    "time": 1138
                },
                {
                    "locationIndex": 4,
                    "time": 1155
                },
                {
                    "locationIndex": 2,
                    "time": 1170
                },
                {
                    "locationIndex": 0,
                    "time": 1170
                },
                {
                    "locationIndex": 4,
                    "time": 1202
                },
                {
                    "locationIndex": 1,
                    "time": 1202
                },
                {
                    "locationIndex": 0,
                    "time": 1234
                },
                {
                    "locationIndex": 4,
                    "time": 1245
                },
                {
                    "locationIndex": 5,
                    "time": 1245
                },
                {
                    "locationIndex": 2,
                    "time": 1267,
                    "type": "long",
                    "ends": 1282
                },
                {
                    "locationIndex": 3,
                    "time": 1273
                },
                {
                    "locationIndex": 1,
                    "time": 1273
                },
                {
                    "locationIndex": 5,
                    "time": 1278
                },
                {
                    "locationIndex": 3,
                    "time": 1288
                },
                {
                    "locationIndex": 0,
                    "time": 1288
                },
                {
                    "locationIndex": 1,
                    "time": 1288
                },
                {
                    "locationIndex": 5,
                    "time": 1296
                },
                {
                    "locationIndex": 1,
                    "time": 1301
                },
                {
                    "locationIndex": 3,
                    "time": 1301
                },
                {
                    "locationIndex": 2,
                    "time": 1320
                },
                {
                    "locationIndex": 4,
                    "time": 1320
                },
                {
                    "locationIndex": 3,
                    "time": 1327,
                    "type": "long",
                    "ends": 1342
                },
                {
                    "locationIndex": 5,
                    "time": 1331
                },
                {
                    "locationIndex": 2,
                    "time": 1331
                },
                {
                    "locationIndex": 4,
                    "time": 1350
                },
                {
                    "locationIndex": 2,
                    "time": 1359
                },
                {
                    "locationIndex": 0,
                    "time": 1359
                },
                {
                    "locationIndex": 1,
                    "time": 1376
                },
                {
                    "locationIndex": 0,
                    "time": 1384
                },
                {
                    "locationIndex": 3,
                    "time": 1384
                },
                {
                    "locationIndex": 2,
                    "time": 1384
                },
                {
                    "locationIndex": 1,
                    "time": 1394
                },
                {
                    "locationIndex": 2,
                    "time": 1413
                },
                {
                    "locationIndex": 3,
                    "time": 1413
                },
                {
                    "locationIndex": 4,
                    "time": 1416
                },
                {
                    "locationIndex": 5,
                    "time": 1416
                },
                {
                    "locationIndex": 3,
                    "time": 1416
                },
                {
                    "locationIndex": 2,
                    "time": 1427
                },
                {
                    "locationIndex": 1,
                    "time": 1427
                },
                {
                    "locationIndex": 0,
                    "time": 1444
                },
                {
                    "locationIndex": 2,
                    "time": 1459
                },
                {
                    "locationIndex": 3,
                    "time": 1459
                },
                {
                    "locationIndex": 1,
                    "time": 1469
                },
                {
                    "locationIndex": 4,
                    "time": 1469
                },
                {
                    "locationIndex": 5,
                    "time": 1474
                },
                {
                    "locationIndex": 3,
                    "time": 1474
                },
                {
                    "locationIndex": 2,
                    "time": 1485
                },
                {
                    "locationIndex": 0,
                    "time": 1490
                },
                {
                    "locationIndex": 4,
                    "time": 1490
                },
                {
                    "locationIndex": 3,
                    "time": 1493
                },
                {
                    "locationIndex": 5,
                    "time": 1493
                },
                {
                    "locationIndex": 0,
                    "time": 1496
                },
                {
                    "locationIndex": 1,
                    "time": 1517
                },
                {
                    "locationIndex": 5,
                    "time": 1517
                },
                {
                    "locationIndex": 0,
                    "time": 1523
                },
                {
                    "locationIndex": 2,
                    "time": 1523
                },
                {
                    "locationIndex": 1,
                    "time": 1529
                },
                {
                    "locationIndex": 0,
                    "time": 1541
                },
                {
                    "locationIndex": 4,
                    "time": 1541
                },
                {
                    "locationIndex": 5,
                    "time": 1541
                },
                {
                    "locationIndex": 3,
                    "time": 1555
                },
                {
                    "locationIndex": 2,
                    "time": 1555
                },
                {
                    "locationIndex": 5,
                    "time": 1586,
                    "type": "long",
                    "ends": 1601
                },
                {
                    "locationIndex": 0,
                    "time": 1597
                },
                {
                    "locationIndex": 4,
                    "time": 1597
                },
                {
                    "locationIndex": 2,
                    "time": 1605
                },
                {
                    "locationIndex": 3,
                    "time": 1605
                },
                {
                    "locationIndex": 4,
                    "time": 1608,
                    "type": "long",
                    "ends": 1623
                },
                {
                    "locationIndex": 2,
                    "time": 1640
                },
                {
                    "locationIndex": 0,
                    "time": 1640
                },
                {
                    "locationIndex": 1,
                    "time": 1643
                },
                {
                    "locationIndex": 2,
                    "time": 1647
                },
                {
                    "locationIndex": 0,
                    "time": 1647
                },
                {
                    "locationIndex": 5,
                    "time": 1650
                },
                {
                    "locationIndex": 2,
                    "time": 1683
                },
                {
                    "locationIndex": 3,
                    "time": 1683
                },
                {
                    "locationIndex": 1,
                    "time": 1698
                },
                {
                    "locationIndex": 5,
                    "time": 1698
                },
                {
                    "locationIndex": 4,
                    "time": 1714,
                    "type": "long",
                    "ends": 1729
                },
                {
                    "locationIndex": 2,
                    "time": 1741
                },
                {
                    "locationIndex": 5,
                    "time": 1741
                },
                {
                    "locationIndex": 0,
                    "time": 1746
                },
                {
                    "locationIndex": 2,
                    "time": 1779
                },
                {
                    "locationIndex": 1,
                    "time": 1779
                },
                {
                    "locationIndex": 5,
                    "time": 1796
                },
                {
                    "locationIndex": 3,
                    "time": 1796
                },
                {
                    "locationIndex": 4,
                    "time": 1800
                },
                {
                    "locationIndex": 1,
                    "time": 1800
                },
                {
                    "locationIndex": 5,
                    "time": 1808
                },
                {
                    "locationIndex": 0,
                    "time": 1810,
                    "type": "long",
                    "ends": 1825
                },
                {
                    "locationIndex": 4,
                    "time": 1813
                },
                {
                    "locationIndex": 2,
                    "time": 1813
                },
                {
                    "locationIndex": 3,
                    "time": 1813
                },
                {
                    "locationIndex": 1,
                    "time": 1826
                },
                {
                    "locationIndex": 5,
                    "time": 1826
                },
                {
                    "locationIndex": 4,
                    "time": 1842
                },
                {
                    "locationIndex": 5,
                    "time": 1854
                },
                {
                    "locationIndex": 3,
                    "time": 1854
                },
                {
                    "locationIndex": 2,
                    "time": 1874
                },
                {
                    "locationIndex": 3,
                    "time": 1885
                },
                {
                    "locationIndex": 5,
                    "time": 1885
                },
                {
                    "locationIndex": 1,
                    "time": 1896
                },
                {
                    "locationIndex": 3,
                    "time": 1906
                },
                {
                    "locationIndex": 0,
                    "time": 1906
                },
                {
                    "locationIndex": 1,
                    "time": 1906
                },
                {
                    "locationIndex": 2,
                    "time": 1928
                },
                {
                    "locationIndex": 4,
                    "time": 1928
                },
                {
                    "locationIndex": 3,
                    "time": 1937
                },
                {
                    "locationIndex": 1,
                    "time": 1953
                },
                {
                    "locationIndex": 0,
                    "time": 1953
                },
                {
                    "locationIndex": 3,
                    "time": 1967
                },
                {
                    "locationIndex": 1,
                    "time": 1970
                },
                {
                    "locationIndex": 5,
                    "time": 1970
                },
                {
                    "locationIndex": 4,
                    "time": 1976
                },
                {
                    "locationIndex": 0,
                    "time": 1981
                },
                {
                    "locationIndex": 1,
                    "time": 1981
                },
                {
                    "locationIndex": 2,
                    "time": 1983
                },
                {
                    "locationIndex": 5,
                    "time": 1990
                },
                {
                    "locationIndex": 1,
                    "time": 1990
                },
                {
                    "locationIndex": 2,
                    "time": 2002
                },
                {
                    "locationIndex": 3,
                    "time": 2005
                },
                {
                    "locationIndex": 0,
                    "time": 2005
                },
                {
                    "locationIndex": 1,
                    "time": 2029
                },
                {
                    "locationIndex": 2,
                    "time": 2029
                },
                {
                    "locationIndex": 0,
                    "time": 2034
                },
                {
                    "locationIndex": 3,
                    "time": 2052
                },
                {
                    "locationIndex": 2,
                    "time": 2052
                },
                {
                    "locationIndex": 1,
                    "time": 2056
                },
                {
                    "locationIndex": 4,
                    "time": 2056
                },
                {
                    "locationIndex": 5,
                    "time": 2067
                },
                {
                    "locationIndex": 2,
                    "time": 2087
                },
                {
                    "locationIndex": 4,
                    "time": 2087
                },
                {
                    "locationIndex": 5,
                    "time": 2099
                },
                {
                    "locationIndex": 1,
                    "time": 2099
                },
                {
                    "locationIndex": 3,
                    "time": 2109
                },
                {
                    "locationIndex": 5,
                    "time": 2115
                },
                {
                    "locationIndex": 0,
                    "time": 2115
                },
                {
                    "locationIndex": 1,
                    "time": 2127
                },
                {
                    "locationIndex": 2,
                    "time": 2127
                },
                {
                    "locationIndex": 4,
                    "time": 2130,
                    "type": "long",
                    "ends": 2145
                },
                {
                    "locationIndex": 5,
                    "time": 2135
                },
                {
                    "locationIndex": 0,
                    "time": 2135
                },
                {
                    "locationIndex": 2,
                    "time": 2146
                },
                {
                    "locationIndex": 3,
                    "time": 2146
                },
                {
                    "locationIndex": 5,
                    "time": 2151
                },
                {
                    "locationIndex": 2,
                    "time": 2162
                },
                {
                    "locationIndex": 3,
                    "time": 2162
                },
                {
                    "locationIndex": 1,
                    "time": 2183
                },
                {
                    "locationIndex": 5,
                    "time": 2183
                },
                {
                    "locationIndex": 2,
                    "time": 2183
                },
                {
                    "locationIndex": 4,
                    "time": 2191
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
                    "locationIndex": 4,
                    "time": 2208
                },
                {
                    "locationIndex": 1,
                    "time": 2208
                },
                {
                    "locationIndex": 0,
                    "time": 2214
                },
                {
                    "locationIndex": 2,
                    "time": 2222
                },
                {
                    "locationIndex": 3,
                    "time": 2226
                },
                {
                    "locationIndex": 5,
                    "time": 2226
                },
                {
                    "locationIndex": 2,
                    "time": 2238
                },
                {
                    "locationIndex": 5,
                    "time": 2244
                },
                {
                    "locationIndex": 4,
                    "time": 2244
                },
                {
                    "locationIndex": 3,
                    "time": 2258
                },
                {
                    "locationIndex": 5,
                    "time": 2261
                },
                {
                    "locationIndex": 2,
                    "time": 2261
                },
                {
                    "locationIndex": 4,
                    "time": 2301
                },
                {
                    "locationIndex": 0,
                    "time": 2308
                },
                {
                    "locationIndex": 5,
                    "time": 2322
                },
                {
                    "locationIndex": 3,
                    "time": 2324
                },
                {
                    "locationIndex": 0,
                    "time": 2324
                },
                {
                    "locationIndex": 4,
                    "time": 2354
                },
                {
                    "locationIndex": 1,
                    "time": 2365
                },
                {
                    "locationIndex": 0,
                    "time": 2365
                },
                {
                    "locationIndex": 3,
                    "time": 2389
                },
                {
                    "locationIndex": 4,
                    "time": 2389
                },
                {
                    "locationIndex": 1,
                    "time": 2393
                },
                {
                    "locationIndex": 5,
                    "time": 2393
                },
                {
                    "locationIndex": 3,
                    "time": 2414
                },
                {
                    "locationIndex": 2,
                    "time": 2414
                },
                {
                    "locationIndex": 0,
                    "time": 2418
                },
                {
                    "locationIndex": 5,
                    "time": 2429
                },
                {
                    "locationIndex": 0,
                    "time": 2434
                },
                {
                    "locationIndex": 2,
                    "time": 2450
                },
                {
                    "locationIndex": 5,
                    "time": 2456
                },
                {
                    "locationIndex": 4,
                    "time": 2456
                },
                {
                    "locationIndex": 0,
                    "time": 2461
                },
                {
                    "locationIndex": 4,
                    "time": 2478
                },
                {
                    "locationIndex": 2,
                    "time": 2482
                },
                {
                    "locationIndex": 5,
                    "time": 2500
                },
                {
                    "locationIndex": 2,
                    "time": 2514
                },
                {
                    "locationIndex": 0,
                    "time": 2514
                },
                {
                    "locationIndex": 4,
                    "time": 2526
                },
                {
                    "locationIndex": 1,
                    "time": 2526
                },
                {
                    "locationIndex": 5,
                    "time": 2535
                },
                {
                    "locationIndex": 3,
                    "time": 2535
                },
                {
                    "locationIndex": 4,
                    "time": 2546
                },
                {
                    "locationIndex": 1,
                    "time": 2563
                },
                {
                    "locationIndex": 0,
                    "time": 2565
                },
                {
                    "locationIndex": 4,
                    "time": 2565
                },
                {
                    "locationIndex": 2,
                    "time": 2578
                },
                {
                    "locationIndex": 3,
                    "time": 2578
                },
                {
                    "locationIndex": 5,
                    "time": 2589
                },
                {
                    "locationIndex": 0,
                    "time": 2611
                },
                {
                    "locationIndex": 2,
                    "time": 2611
                },
                {
                    "locationIndex": 5,
                    "time": 2611
                },
                {
                    "locationIndex": 4,
                    "time": 2619,
                    "type": "long",
                    "ends": 2634
                },
                {
                    "locationIndex": 2,
                    "time": 2626
                },
                {
                    "locationIndex": 5,
                    "time": 2626
                },
                {
                    "locationIndex": 1,
                    "time": 2642
                },
                {
                    "locationIndex": 3,
                    "time": 2642
                },
                {
                    "locationIndex": 0,
                    "time": 2674
                },
                {
                    "locationIndex": 5,
                    "time": 2674
                },
                {
                    "locationIndex": 3,
                    "time": 2685,
                    "type": "long",
                    "ends": 2700
                },
                {
                    "locationIndex": 4,
                    "time": 2706
                },
                {
                    "locationIndex": 1,
                    "time": 2706
                },
                {
                    "locationIndex": 5,
                    "time": 2738
                },
                {
                    "locationIndex": 2,
                    "time": 2738
                },
                {
                    "locationIndex": 0,
                    "time": 2758
                },
                {
                    "locationIndex": 3,
                    "time": 2760
                },
                {
                    "locationIndex": 1,
                    "time": 2760
                },
                {
                    "locationIndex": 0,
                    "time": 2770,
                    "type": "long",
                    "ends": 2785
                },
                {
                    "locationIndex": 3,
                    "time": 2772
                },
                {
                    "locationIndex": 2,
                    "time": 2772
                },
                {
                    "locationIndex": 4,
                    "time": 2792
                },
                {
                    "locationIndex": 5,
                    "time": 2802
                },
                {
                    "locationIndex": 3,
                    "time": 2802
                },
                {
                    "locationIndex": 4,
                    "time": 2813
                },
                {
                    "locationIndex": 1,
                    "time": 2813
                },
                {
                    "locationIndex": 2,
                    "time": 2822
                },
                {
                    "locationIndex": 5,
                    "time": 2824
                },
                {
                    "locationIndex": 0,
                    "time": 2824
                },
                {
                    "locationIndex": 4,
                    "time": 2834
                },
                {
                    "locationIndex": 1,
                    "time": 2834
                },
                {
                    "locationIndex": 2,
                    "time": 2855
                },
                {
                    "locationIndex": 5,
                    "time": 2865
                },
                {
                    "locationIndex": 3,
                    "time": 2865
                },
                {
                    "locationIndex": 2,
                    "time": 2888
                },
                {
                    "locationIndex": 1,
                    "time": 2898,
                    "type": "long",
                    "ends": 2913
                },
                {
                    "locationIndex": 3,
                    "time": 2909
                },
                {
                    "locationIndex": 0,
                    "time": 2909
                },
                {
                    "locationIndex": 4,
                    "time": 2931
                },
                {
                    "locationIndex": 5,
                    "time": 2931
                },
                {
                    "locationIndex": 2,
                    "time": 2941
                },
                {
                    "locationIndex": 1,
                    "time": 2946
                },
                {
                    "locationIndex": 4,
                    "time": 2946
                },
                {
                    "locationIndex": 5,
                    "time": 2952
                },
                {
                    "locationIndex": 2,
                    "time": 2952
                },
                {
                    "locationIndex": 0,
                    "time": 2959
                },
                {
                    "locationIndex": 2,
                    "time": 2962
                },
                {
                    "locationIndex": 3,
                    "time": 2965
                },
                {
                    "locationIndex": 4,
                    "time": 2965
                },
                {
                    "locationIndex": 0,
                    "time": 2965
                },
                {
                    "locationIndex": 1,
                    "time": 2994
                },
                {
                    "locationIndex": 2,
                    "time": 2994
                },
                {
                    "locationIndex": 0,
                    "time": 3005
                },
                {
                    "locationIndex": 2,
                    "time": 3015
                },
                {
                    "locationIndex": 3,
                    "time": 3023
                },
                {
                    "locationIndex": 4,
                    "time": 3026
                },
                {
                    "locationIndex": 1,
                    "time": 3026
                },
                {
                    "locationIndex": 5,
                    "time": 3045
                },
                {
                    "locationIndex": 0,
                    "time": 3048
                },
                {
                    "locationIndex": 4,
                    "time": 3048
                },
                {
                    "locationIndex": 1,
                    "time": 3058
                },
                {
                    "locationIndex": 3,
                    "time": 3069
                },
                {
                    "locationIndex": 1,
                    "time": 3071
                },
                {
                    "locationIndex": 0,
                    "time": 3071
                },
                {
                    "locationIndex": 5,
                    "time": 3079
                },
                {
                    "locationIndex": 4,
                    "time": 3079
                },
                {
                    "locationIndex": 2,
                    "time": 3090
                },
                {
                    "locationIndex": 0,
                    "time": 3090
                },
                {
                    "locationIndex": 3,
                    "time": 3101
                },
                {
                    "locationIndex": 1,
                    "time": 3111
                },
                {
                    "locationIndex": 2,
                    "time": 3111
                },
                {
                    "locationIndex": 0,
                    "time": 3117
                },
                {
                    "locationIndex": 3,
                    "time": 3117
                },
                {
                    "locationIndex": 2,
                    "time": 3122
                },
                {
                    "locationIndex": 4,
                    "time": 3122
                },
                {
                    "locationIndex": 3,
                    "time": 3143
                },
                {
                    "locationIndex": 1,
                    "time": 3149
                },
                {
                    "locationIndex": 2,
                    "time": 3154
                },
                {
                    "locationIndex": 4,
                    "time": 3154
                },
                {
                    "locationIndex": 3,
                    "time": 3154
                },
                {
                    "locationIndex": 5,
                    "time": 3167,
                    "type": "long",
                    "ends": 3182
                },
                {
                    "locationIndex": 1,
                    "time": 3170
                },
                {
                    "locationIndex": 0,
                    "time": 3170
                },
                {
                    "locationIndex": 3,
                    "time": 3176
                },
                {
                    "locationIndex": 4,
                    "time": 3186
                },
                {
                    "locationIndex": 0,
                    "time": 3186
                },
                {
                    "locationIndex": 2,
                    "time": 3192
                },
                {
                    "locationIndex": 0,
                    "time": 3203
                },
                {
                    "locationIndex": 3,
                    "time": 3203
                },
                {
                    "locationIndex": 4,
                    "time": 3208
                },
                {
                    "locationIndex": 2,
                    "time": 3208
                },
                {
                    "locationIndex": 0,
                    "time": 3213
                },
                {
                    "locationIndex": 3,
                    "time": 3218
                },
                {
                    "locationIndex": 2,
                    "time": 3218
                },
                {
                    "locationIndex": 4,
                    "time": 3220,
                    "type": "long",
                    "ends": 3235
                },
                {
                    "locationIndex": 5,
                    "time": 3234
                },
                {
                    "locationIndex": 1,
                    "time": 3234
                },
                {
                    "locationIndex": 0,
                    "time": 3246
                },
                {
                    "locationIndex": 2,
                    "time": 3268
                },
                {
                    "locationIndex": 5,
                    "time": 3268
                },
                {
                    "locationIndex": 1,
                    "time": 3282,
                    "type": "long",
                    "ends": 3297
                },
                {
                    "locationIndex": 0,
                    "time": 3291
                },
                {
                    "locationIndex": 3,
                    "time": 3291
                },
                {
                    "locationIndex": 5,
                    "time": 3306
                },
                {
                    "locationIndex": 4,
                    "time": 3309
                },
                {
                    "locationIndex": 3,
                    "time": 3309
                },
                {
                    "locationIndex": 5,
                    "time": 3319
                },
                {
                    "locationIndex": 0,
                    "time": 3327,
                    "type": "long",
                    "ends": 3342
                },
                {
                    "locationIndex": 2,
                    "time": 3327,
                    "type": "long",
                    "ends": 3342
                },
                {
                    "locationIndex": 5,
                    "time": 3334
                },
                {
                    "locationIndex": 3,
                    "time": 3334
                },
                {
                    "locationIndex": 1,
                    "time": 3336
                },
                {
                    "locationIndex": 5,
                    "time": 3340
                },
                {
                    "locationIndex": 4,
                    "time": 3340
                },
                {
                    "locationIndex": 3,
                    "time": 3347
                },
                {
                    "locationIndex": 1,
                    "time": 3347
                },
                {
                    "locationIndex": 4,
                    "time": 3368,
                    "type": "long",
                    "ends": 3383
                },
                {
                    "locationIndex": 1,
                    "time": 3375
                },
                {
                    "locationIndex": 0,
                    "time": 3375
                },
                {
                    "locationIndex": 3,
                    "time": 3379,
                    "type": "long",
                    "ends": 3394
                },
                {
                    "locationIndex": 1,
                    "time": 3387
                },
                {
                    "locationIndex": 2,
                    "time": 3387
                },
                {
                    "locationIndex": 5,
                    "time": 3387
                },
                {
                    "locationIndex": 0,
                    "time": 3410
                },
                {
                    "locationIndex": 2,
                    "time": 3421
                },
                {
                    "locationIndex": 5,
                    "time": 3426
                },
                {
                    "locationIndex": 4,
                    "time": 3426
                },
                {
                    "locationIndex": 2,
                    "time": 3432
                },
                {
                    "locationIndex": 0,
                    "time": 3432
                },
                {
                    "locationIndex": 3,
                    "time": 3442,
                    "type": "long",
                    "ends": 3457
                },
                {
                    "locationIndex": 4,
                    "time": 3442,
                    "type": "long",
                    "ends": 3457
                },
                {
                    "locationIndex": 2,
                    "time": 3454
                },
                {
                    "locationIndex": 1,
                    "time": 3454
                },
                {
                    "locationIndex": 0,
                    "time": 3456,
                    "type": "long",
                    "ends": 3471
                },
                {
                    "locationIndex": 1,
                    "time": 3458
                },
                {
                    "locationIndex": 2,
                    "time": 3458
                },
                {
                    "locationIndex": 5,
                    "time": 3470
                },
                {
                    "locationIndex": 2,
                    "time": 3474
                },
                {
                    "locationIndex": 1,
                    "time": 3483
                },
                {
                    "locationIndex": 5,
                    "time": 3483
                },
                {
                    "locationIndex": 2,
                    "time": 3490
                },
                {
                    "locationIndex": 3,
                    "time": 3506
                },
                {
                    "locationIndex": 0,
                    "time": 3506
                },
                {
                    "locationIndex": 1,
                    "time": 3511
                },
                {
                    "locationIndex": 4,
                    "time": 3511
                },
                {
                    "locationIndex": 3,
                    "time": 3517
                },
                {
                    "locationIndex": 1,
                    "time": 3535
                },
                {
                    "locationIndex": 2,
                    "time": 3535
                },
                {
                    "locationIndex": 5,
                    "time": 3538
                },
                {
                    "locationIndex": 4,
                    "time": 3538
                },
                {
                    "locationIndex": 2,
                    "time": 3546
                },
                {
                    "locationIndex": 0,
                    "time": 3551
                },
                {
                    "locationIndex": 5,
                    "time": 3551
                },
                {
                    "locationIndex": 3,
                    "time": 3555
                },
                {
                    "locationIndex": 1,
                    "time": 3570
                },
                {
                    "locationIndex": 5,
                    "time": 3570
                },
                {
                    "locationIndex": 2,
                    "time": 3583
                },
                {
                    "locationIndex": 3,
                    "time": 3585
                },
                {
                    "locationIndex": 1,
                    "time": 3585
                },
                {
                    "locationIndex": 0,
                    "time": 3592
                },
                {
                    "locationIndex": 4,
                    "time": 3592
                },
                {
                    "locationIndex": 3,
                    "time": 3595
                },
                {
                    "locationIndex": 5,
                    "time": 3602
                },
                {
                    "locationIndex": 0,
                    "time": 3613
                },
                {
                    "locationIndex": 4,
                    "time": 3613
                },
                {
                    "locationIndex": 5,
                    "time": 3619
                },
                {
                    "locationIndex": 2,
                    "time": 3619
                },
                {
                    "locationIndex": 0,
                    "time": 3623
                },
                {
                    "locationIndex": 5,
                    "time": 3634
                },
                {
                    "locationIndex": 1,
                    "time": 3634
                },
                {
                    "locationIndex": 3,
                    "time": 3639
                },
                {
                    "locationIndex": 2,
                    "time": 3656
                },
                {
                    "locationIndex": 4,
                    "time": 3656
                },
                {
                    "locationIndex": 3,
                    "time": 3661
                },
                {
                    "locationIndex": 5,
                    "time": 3663
                },
                {
                    "locationIndex": 1,
                    "time": 3663
                },
                {
                    "locationIndex": 3,
                    "time": 3682
                },
                {
                    "locationIndex": 2,
                    "time": 3720
                },
                {
                    "locationIndex": 1,
                    "time": 3720
                },
                {
                    "locationIndex": 5,
                    "time": 3734
                },
                {
                    "locationIndex": 2,
                    "time": 3736
                },
                {
                    "locationIndex": 3,
                    "time": 3738
                },
                {
                    "locationIndex": 2,
                    "time": 3740
                },
                {
                    "locationIndex": 3,
                    "time": 3745
                },
                {
                    "locationIndex": 5,
                    "time": 3745
                },
                {
                    "locationIndex": 0,
                    "time": 3756
                },
                {
                    "locationIndex": 1,
                    "time": 3761
                },
                {
                    "locationIndex": 4,
                    "time": 3765
                },
                {
                    "locationIndex": 1,
                    "time": 3799
                },
                {
                    "locationIndex": 3,
                    "time": 3822
                },
                {
                    "locationIndex": 4,
                    "time": 3854
                },
                {
                    "locationIndex": 3,
                    "time": 3863
                },
                {
                    "locationIndex": 0,
                    "time": 3867
                },
                {
                    "locationIndex": 5,
                    "time": 3872
                },
                {
                    "locationIndex": 0,
                    "time": 3889
                },
                {
                    "locationIndex": 5,
                    "time": 3892
                },
                {
                    "locationIndex": 3,
                    "time": 3934
                },
                {
                    "locationIndex": 1,
                    "time": 3936
                },
                {
                    "locationIndex": 0,
                    "time": 3948
                },
                {
                    "locationIndex": 4,
                    "time": 3952
                },
                {
                    "locationIndex": 2,
                    "time": 3976
                },
                {
                    "locationIndex": 1,
                    "time": 4028
                }
            ]
});

songs.push(song);

song = {};
song.name = '배달은 자신 있어';
song.composer = '우아한형제들';
song.noteWriter = 'HJOW';
song.bgaUrl = '';
song.musicUrl = '[RSSC]songs/woowahan/track02.mp3';
song.musicAlterUrl = '';
song.thumbnailUrl = '';
song.canListen = true;
song.useYoutube = false;
song.youtubeVideoId = '';
song.description = `
|Music: 우아한형제들
|  https://www.woowahan.com/music
|License: 
|  https://www.woowahan.com/music/license
`;
song.loadingTime = 10;
song.bpm = 150;
song.endTime = 0;
song.timeConstant = 0;
song.timeMultiplier = 1;
song.noteMultiplier = 1;
song.serial = 'nai4ilaaogn0iramegioamerpogm3490qmgaemfpoggsdGSDGsnmdk';
song.test = false;
song.onlyRandom = false;
song.difficulties = [];
song.difficulties.push({
    difficultyLabel : 'easy',
    difficultyLevel : 3,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 2,
                    "time": 145
                },
                {
                    "locationIndex": 5,
                    "time": 209
                },
                {
                    "locationIndex": 3,
                    "time": 209
                },
                {
                    "locationIndex": 1,
                    "time": 265
                },
                {
                    "locationIndex": 5,
                    "time": 304
                },
                {
                    "locationIndex": 2,
                    "time": 345
                },
                {
                    "locationIndex": 4,
                    "time": 385
                },
                {
                    "locationIndex": 0,
                    "time": 449
                },
                {
                    "locationIndex": 2,
                    "time": 481
                },
                {
                    "locationIndex": 4,
                    "time": 513
                },
                {
                    "locationIndex": 1,
                    "time": 545
                },
                {
                    "locationIndex": 2,
                    "time": 577
                },
                {
                    "locationIndex": 3,
                    "time": 611
                },
                {
                    "locationIndex": 1,
                    "time": 649
                },
                {
                    "locationIndex": 3,
                    "time": 681
                },
                {
                    "locationIndex": 2,
                    "time": 681
                },
                {
                    "locationIndex": 0,
                    "time": 713
                },
                {
                    "locationIndex": 5,
                    "time": 745
                },
                {
                    "locationIndex": 2,
                    "time": 777
                },
                {
                    "locationIndex": 0,
                    "time": 817
                },
                {
                    "locationIndex": 3,
                    "time": 849
                },
                {
                    "locationIndex": 2,
                    "time": 881
                },
                {
                    "locationIndex": 1,
                    "time": 913
                },
                {
                    "locationIndex": 4,
                    "time": 945
                },
                {
                    "locationIndex": 1,
                    "time": 986
                },
                {
                    "locationIndex": 2,
                    "time": 1025
                },
                {
                    "locationIndex": 3,
                    "time": 1025
                },
                {
                    "locationIndex": 0,
                    "time": 1057
                },
                {
                    "locationIndex": 5,
                    "time": 1089
                },
                {
                    "locationIndex": 1,
                    "time": 1121
                },
                {
                    "locationIndex": 2,
                    "time": 1153
                },
                {
                    "locationIndex": 4,
                    "time": 1193
                },
                {
                    "locationIndex": 1,
                    "time": 1237
                },
                {
                    "locationIndex": 5,
                    "time": 1237
                },
                {
                    "locationIndex": 0,
                    "time": 1281
                },
                {
                    "locationIndex": 2,
                    "time": 1313
                },
                {
                    "locationIndex": 0,
                    "time": 1345
                },
                {
                    "locationIndex": 1,
                    "time": 1377
                },
                {
                    "locationIndex": 4,
                    "time": 1409
                },
                {
                    "locationIndex": 3,
                    "time": 1457
                },
                {
                    "locationIndex": 0,
                    "time": 1489
                },
                {
                    "locationIndex": 3,
                    "time": 1521
                },
                {
                    "locationIndex": 0,
                    "time": 1553
                },
                {
                    "locationIndex": 5,
                    "time": 1585
                },
                {
                    "locationIndex": 1,
                    "time": 1624
                },
                {
                    "locationIndex": 2,
                    "time": 1659
                },
                {
                    "locationIndex": 1,
                    "time": 1697
                },
                {
                    "locationIndex": 4,
                    "time": 1745
                },
                {
                    "locationIndex": 5,
                    "time": 1793
                },
                {
                    "locationIndex": 2,
                    "time": 1827
                },
                {
                    "locationIndex": 4,
                    "time": 1827
                },
                {
                    "locationIndex": 3,
                    "time": 1859
                },
                {
                    "locationIndex": 2,
                    "time": 1891
                },
                {
                    "locationIndex": 3,
                    "time": 1923
                },
                {
                    "locationIndex": 5,
                    "time": 1961
                },
                {
                    "locationIndex": 4,
                    "time": 1997
                },
                {
                    "locationIndex": 1,
                    "time": 2032
                },
                {
                    "locationIndex": 3,
                    "time": 2068
                },
                {
                    "locationIndex": 4,
                    "time": 2113
                },
                {
                    "locationIndex": 0,
                    "time": 2177
                },
                {
                    "locationIndex": 4,
                    "time": 2209
                },
                {
                    "locationIndex": 2,
                    "time": 2209
                },
                {
                    "locationIndex": 0,
                    "time": 2244
                },
                {
                    "locationIndex": 4,
                    "time": 2278
                },
                {
                    "locationIndex": 3,
                    "time": 2314
                },
                {
                    "locationIndex": 1,
                    "time": 2355
                },
                {
                    "locationIndex": 3,
                    "time": 2406
                },
                {
                    "locationIndex": 4,
                    "time": 2469
                },
                {
                    "locationIndex": 3,
                    "time": 2513
                },
                {
                    "locationIndex": 5,
                    "time": 2513
                },
                {
                    "locationIndex": 1,
                    "time": 2561
                },
                {
                    "locationIndex": 5,
                    "time": 2593
                },
                {
                    "locationIndex": 0,
                    "time": 2641
                },
                {
                    "locationIndex": 4,
                    "time": 2674
                },
                {
                    "locationIndex": 2,
                    "time": 2674
                },
                {
                    "locationIndex": 1,
                    "time": 2712
                },
                {
                    "locationIndex": 5,
                    "time": 2750
                },
                {
                    "locationIndex": 3,
                    "time": 2790
                },
                {
                    "locationIndex": 2,
                    "time": 2822
                },
                {
                    "locationIndex": 1,
                    "time": 2822
                },
                {
                    "locationIndex": 0,
                    "time": 2866
                },
                {
                    "locationIndex": 1,
                    "time": 2917
                },
                {
                    "locationIndex": 3,
                    "time": 2950
                },
                {
                    "locationIndex": 2,
                    "time": 2992
                },
                {
                    "locationIndex": 3,
                    "time": 3025
                },
                {
                    "locationIndex": 4,
                    "time": 3139
                },
                {
                    "locationIndex": 3,
                    "time": 3193
                },
                {
                    "locationIndex": 2,
                    "time": 3225
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'normal',
    difficultyLevel : 5,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 3,
                    "time": 145
                },
                {
                    "locationIndex": 0,
                    "time": 177
                },
                {
                    "locationIndex": 4,
                    "time": 193
                },
                {
                    "locationIndex": 2,
                    "time": 249
                },
                {
                    "locationIndex": 0,
                    "time": 289
                },
                {
                    "locationIndex": 1,
                    "time": 305
                },
                {
                    "locationIndex": 0,
                    "time": 323
                },
                {
                    "locationIndex": 3,
                    "time": 345
                },
                {
                    "locationIndex": 0,
                    "time": 361
                },
                {
                    "locationIndex": 1,
                    "time": 377
                },
                {
                    "locationIndex": 4,
                    "time": 393
                },
                {
                    "locationIndex": 3,
                    "time": 425
                },
                {
                    "locationIndex": 0,
                    "time": 441
                },
                {
                    "locationIndex": 3,
                    "time": 457
                },
                {
                    "locationIndex": 1,
                    "time": 473
                },
                {
                    "locationIndex": 0,
                    "time": 473
                },
                {
                    "locationIndex": 2,
                    "time": 489
                },
                {
                    "locationIndex": 0,
                    "time": 505
                },
                {
                    "locationIndex": 2,
                    "time": 521
                },
                {
                    "locationIndex": 5,
                    "time": 537
                },
                {
                    "locationIndex": 4,
                    "time": 553
                },
                {
                    "locationIndex": 2,
                    "time": 569
                },
                {
                    "locationIndex": 5,
                    "time": 569
                },
                {
                    "locationIndex": 3,
                    "time": 592
                },
                {
                    "locationIndex": 1,
                    "time": 609
                },
                {
                    "locationIndex": 3,
                    "time": 625
                },
                {
                    "locationIndex": 5,
                    "time": 641
                },
                {
                    "locationIndex": 2,
                    "time": 665
                },
                {
                    "locationIndex": 3,
                    "time": 681
                },
                {
                    "locationIndex": 0,
                    "time": 705
                },
                {
                    "locationIndex": 4,
                    "time": 705
                },
                {
                    "locationIndex": 1,
                    "time": 721
                },
                {
                    "locationIndex": 5,
                    "time": 737
                },
                {
                    "locationIndex": 1,
                    "time": 753
                },
                {
                    "locationIndex": 5,
                    "time": 769
                },
                {
                    "locationIndex": 2,
                    "time": 769
                },
                {
                    "locationIndex": 4,
                    "time": 785
                },
                {
                    "locationIndex": 0,
                    "time": 801
                },
                {
                    "locationIndex": 4,
                    "time": 817
                },
                {
                    "locationIndex": 2,
                    "time": 833
                },
                {
                    "locationIndex": 3,
                    "time": 849
                },
                {
                    "locationIndex": 4,
                    "time": 865
                },
                {
                    "locationIndex": 5,
                    "time": 881
                },
                {
                    "locationIndex": 4,
                    "time": 905
                },
                {
                    "locationIndex": 3,
                    "time": 929
                },
                {
                    "locationIndex": 0,
                    "time": 945
                },
                {
                    "locationIndex": 1,
                    "time": 945
                },
                {
                    "locationIndex": 4,
                    "time": 961
                },
                {
                    "locationIndex": 3,
                    "time": 977
                },
                {
                    "locationIndex": 0,
                    "time": 993
                },
                {
                    "locationIndex": 2,
                    "time": 1011
                },
                {
                    "locationIndex": 4,
                    "time": 1033
                },
                {
                    "locationIndex": 1,
                    "time": 1049
                },
                {
                    "locationIndex": 5,
                    "time": 1068
                },
                {
                    "locationIndex": 3,
                    "time": 1088
                },
                {
                    "locationIndex": 0,
                    "time": 1105
                },
                {
                    "locationIndex": 4,
                    "time": 1105
                },
                {
                    "locationIndex": 1,
                    "time": 1121
                },
                {
                    "locationIndex": 4,
                    "time": 1137
                },
                {
                    "locationIndex": 3,
                    "time": 1153
                },
                {
                    "locationIndex": 5,
                    "time": 1153
                },
                {
                    "locationIndex": 1,
                    "time": 1169
                },
                {
                    "locationIndex": 3,
                    "time": 1185
                },
                {
                    "locationIndex": 0,
                    "time": 1201
                },
                {
                    "locationIndex": 3,
                    "time": 1217
                },
                {
                    "locationIndex": 1,
                    "time": 1237
                },
                {
                    "locationIndex": 4,
                    "time": 1237
                },
                {
                    "locationIndex": 3,
                    "time": 1257
                },
                {
                    "locationIndex": 1,
                    "time": 1281
                },
                {
                    "locationIndex": 4,
                    "time": 1297
                },
                {
                    "locationIndex": 0,
                    "time": 1313
                },
                {
                    "locationIndex": 2,
                    "time": 1329
                },
                {
                    "locationIndex": 4,
                    "time": 1345
                },
                {
                    "locationIndex": 3,
                    "time": 1361
                },
                {
                    "locationIndex": 2,
                    "time": 1377
                },
                {
                    "locationIndex": 4,
                    "time": 1409
                },
                {
                    "locationIndex": 3,
                    "time": 1427
                },
                {
                    "locationIndex": 0,
                    "time": 1456
                },
                {
                    "locationIndex": 4,
                    "time": 1473
                },
                {
                    "locationIndex": 5,
                    "time": 1489
                },
                {
                    "locationIndex": 4,
                    "time": 1505
                },
                {
                    "locationIndex": 0,
                    "time": 1505
                },
                {
                    "locationIndex": 3,
                    "time": 1521
                },
                {
                    "locationIndex": 2,
                    "time": 1537
                },
                {
                    "locationIndex": 3,
                    "time": 1553
                },
                {
                    "locationIndex": 5,
                    "time": 1569
                },
                {
                    "locationIndex": 2,
                    "time": 1569
                },
                {
                    "locationIndex": 3,
                    "time": 1585
                },
                {
                    "locationIndex": 5,
                    "time": 1601
                },
                {
                    "locationIndex": 1,
                    "time": 1624
                },
                {
                    "locationIndex": 0,
                    "time": 1649
                },
                {
                    "locationIndex": 2,
                    "time": 1673
                },
                {
                    "locationIndex": 4,
                    "time": 1697
                },
                {
                    "locationIndex": 0,
                    "time": 1721
                },
                {
                    "locationIndex": 5,
                    "time": 1745
                },
                {
                    "locationIndex": 2,
                    "time": 1761
                },
                {
                    "locationIndex": 0,
                    "time": 1793
                },
                {
                    "locationIndex": 3,
                    "time": 1809
                },
                {
                    "locationIndex": 4,
                    "time": 1827
                },
                {
                    "locationIndex": 1,
                    "time": 1827
                },
                {
                    "locationIndex": 5,
                    "time": 1857
                },
                {
                    "locationIndex": 1,
                    "time": 1873
                },
                {
                    "locationIndex": 5,
                    "time": 1889
                },
                {
                    "locationIndex": 0,
                    "time": 1913
                },
                {
                    "locationIndex": 2,
                    "time": 1929
                },
                {
                    "locationIndex": 4,
                    "time": 1953
                },
                {
                    "locationIndex": 5,
                    "time": 1985
                },
                {
                    "locationIndex": 0,
                    "time": 2001
                },
                {
                    "locationIndex": 5,
                    "time": 2017
                },
                {
                    "locationIndex": 1,
                    "time": 2033
                },
                {
                    "locationIndex": 3,
                    "time": 2068
                },
                {
                    "locationIndex": 5,
                    "time": 2113
                },
                {
                    "locationIndex": 2,
                    "time": 2139,
                    "type": "long",
                    "ends": 2154
                },
                {
                    "locationIndex": 5,
                    "time": 2177
                },
                {
                    "locationIndex": 4,
                    "time": 2199
                },
                {
                    "locationIndex": 1,
                    "time": 2199
                },
                {
                    "locationIndex": 0,
                    "time": 2216
                },
                {
                    "locationIndex": 1,
                    "time": 2244
                },
                {
                    "locationIndex": 0,
                    "time": 2265
                },
                {
                    "locationIndex": 5,
                    "time": 2265
                },
                {
                    "locationIndex": 1,
                    "time": 2289
                },
                {
                    "locationIndex": 2,
                    "time": 2309
                },
                {
                    "locationIndex": 3,
                    "time": 2355
                },
                {
                    "locationIndex": 0,
                    "time": 2355
                },
                {
                    "locationIndex": 2,
                    "time": 2382
                },
                {
                    "locationIndex": 3,
                    "time": 2406
                },
                {
                    "locationIndex": 2,
                    "time": 2425,
                    "type": "long",
                    "ends": 2440
                },
                {
                    "locationIndex": 4,
                    "time": 2425,
                    "type": "long",
                    "ends": 2440
                },
                {
                    "locationIndex": 1,
                    "time": 2469
                },
                {
                    "locationIndex": 3,
                    "time": 2497
                },
                {
                    "locationIndex": 0,
                    "time": 2513
                },
                {
                    "locationIndex": 3,
                    "time": 2530
                },
                {
                    "locationIndex": 5,
                    "time": 2530
                },
                {
                    "locationIndex": 0,
                    "time": 2561
                },
                {
                    "locationIndex": 3,
                    "time": 2593
                },
                {
                    "locationIndex": 1,
                    "time": 2609
                },
                {
                    "locationIndex": 5,
                    "time": 2641
                },
                {
                    "locationIndex": 2,
                    "time": 2657
                },
                {
                    "locationIndex": 4,
                    "time": 2674
                },
                {
                    "locationIndex": 1,
                    "time": 2674
                },
                {
                    "locationIndex": 2,
                    "time": 2705
                },
                {
                    "locationIndex": 5,
                    "time": 2721
                },
                {
                    "locationIndex": 3,
                    "time": 2750
                },
                {
                    "locationIndex": 2,
                    "time": 2777
                },
                {
                    "locationIndex": 1,
                    "time": 2793
                },
                {
                    "locationIndex": 3,
                    "time": 2812
                },
                {
                    "locationIndex": 5,
                    "time": 2812
                },
                {
                    "locationIndex": 4,
                    "time": 2828
                },
                {
                    "locationIndex": 3,
                    "time": 2866
                },
                {
                    "locationIndex": 0,
                    "time": 2917
                },
                {
                    "locationIndex": 5,
                    "time": 2942
                },
                {
                    "locationIndex": 3,
                    "time": 2976
                },
                {
                    "locationIndex": 4,
                    "time": 2992
                },
                {
                    "locationIndex": 1,
                    "time": 2992
                },
                {
                    "locationIndex": 3,
                    "time": 3009
                },
                {
                    "locationIndex": 1,
                    "time": 3088
                },
                {
                    "locationIndex": 4,
                    "time": 3134
                },
                {
                    "locationIndex": 0,
                    "time": 3163
                },
                {
                    "locationIndex": 5,
                    "time": 3211
                },
                {
                    "locationIndex": 1,
                    "time": 3234
                },
                {
                    "locationIndex": 4,
                    "time": 3316
                },
                {
                    "locationIndex": 1,
                    "time": 3369
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'hard',
    difficultyLevel : 9,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 1,
                    "time": 145
                },
                {
                    "locationIndex": 5,
                    "time": 201
                },
                {
                    "locationIndex": 0,
                    "time": 201
                },
                {
                    "locationIndex": 3,
                    "time": 211
                },
                {
                    "locationIndex": 2,
                    "time": 217
                },
                {
                    "locationIndex": 0,
                    "time": 241
                },
                {
                    "locationIndex": 4,
                    "time": 257
                },
                {
                    "locationIndex": 2,
                    "time": 273
                },
                {
                    "locationIndex": 1,
                    "time": 297
                },
                {
                    "locationIndex": 2,
                    "time": 321
                },
                {
                    "locationIndex": 4,
                    "time": 345
                },
                {
                    "locationIndex": 0,
                    "time": 345
                },
                {
                    "locationIndex": 5,
                    "time": 352
                },
                {
                    "locationIndex": 2,
                    "time": 361
                },
                {
                    "locationIndex": 4,
                    "time": 361
                },
                {
                    "locationIndex": 5,
                    "time": 369
                },
                {
                    "locationIndex": 2,
                    "time": 377
                },
                {
                    "locationIndex": 4,
                    "time": 393,
                    "type": "long",
                    "ends": 408
                },
                {
                    "locationIndex": 3,
                    "time": 400
                },
                {
                    "locationIndex": 5,
                    "time": 416
                },
                {
                    "locationIndex": 1,
                    "time": 425,
                    "type": "long",
                    "ends": 440
                },
                {
                    "locationIndex": 3,
                    "time": 441
                },
                {
                    "locationIndex": 2,
                    "time": 449
                },
                {
                    "locationIndex": 5,
                    "time": 449
                },
                {
                    "locationIndex": 4,
                    "time": 457
                },
                {
                    "locationIndex": 0,
                    "time": 457
                },
                {
                    "locationIndex": 3,
                    "time": 473
                },
                {
                    "locationIndex": 5,
                    "time": 473
                },
                {
                    "locationIndex": 1,
                    "time": 481
                },
                {
                    "locationIndex": 2,
                    "time": 489
                },
                {
                    "locationIndex": 3,
                    "time": 489
                },
                {
                    "locationIndex": 5,
                    "time": 496
                },
                {
                    "locationIndex": 1,
                    "time": 496
                },
                {
                    "locationIndex": 4,
                    "time": 496
                },
                {
                    "locationIndex": 0,
                    "time": 505
                },
                {
                    "locationIndex": 4,
                    "time": 513
                },
                {
                    "locationIndex": 5,
                    "time": 513
                },
                {
                    "locationIndex": 3,
                    "time": 521
                },
                {
                    "locationIndex": 2,
                    "time": 521
                },
                {
                    "locationIndex": 0,
                    "time": 529,
                    "type": "long",
                    "ends": 544
                },
                {
                    "locationIndex": 5,
                    "time": 537
                },
                {
                    "locationIndex": 4,
                    "time": 537
                },
                {
                    "locationIndex": 1,
                    "time": 545
                },
                {
                    "locationIndex": 2,
                    "time": 545
                },
                {
                    "locationIndex": 3,
                    "time": 553
                },
                {
                    "locationIndex": 5,
                    "time": 553
                },
                {
                    "locationIndex": 4,
                    "time": 561
                },
                {
                    "locationIndex": 1,
                    "time": 569
                },
                {
                    "locationIndex": 3,
                    "time": 569
                },
                {
                    "locationIndex": 4,
                    "time": 577
                },
                {
                    "locationIndex": 3,
                    "time": 592
                },
                {
                    "locationIndex": 0,
                    "time": 592
                },
                {
                    "locationIndex": 4,
                    "time": 609
                },
                {
                    "locationIndex": 5,
                    "time": 609
                },
                {
                    "locationIndex": 2,
                    "time": 617
                },
                {
                    "locationIndex": 0,
                    "time": 625
                },
                {
                    "locationIndex": 3,
                    "time": 625
                },
                {
                    "locationIndex": 2,
                    "time": 625
                },
                {
                    "locationIndex": 1,
                    "time": 633
                },
                {
                    "locationIndex": 4,
                    "time": 641
                },
                {
                    "locationIndex": 5,
                    "time": 641
                },
                {
                    "locationIndex": 0,
                    "time": 649
                },
                {
                    "locationIndex": 1,
                    "time": 673
                },
                {
                    "locationIndex": 5,
                    "time": 673
                },
                {
                    "locationIndex": 3,
                    "time": 681
                },
                {
                    "locationIndex": 2,
                    "time": 681
                },
                {
                    "locationIndex": 4,
                    "time": 681
                },
                {
                    "locationIndex": 5,
                    "time": 688
                },
                {
                    "locationIndex": 4,
                    "time": 705
                },
                {
                    "locationIndex": 3,
                    "time": 705
                },
                {
                    "locationIndex": 5,
                    "time": 713
                },
                {
                    "locationIndex": 2,
                    "time": 713
                },
                {
                    "locationIndex": 1,
                    "time": 721,
                    "type": "long",
                    "ends": 736
                },
                {
                    "locationIndex": 0,
                    "time": 729
                },
                {
                    "locationIndex": 3,
                    "time": 729
                },
                {
                    "locationIndex": 5,
                    "time": 729
                },
                {
                    "locationIndex": 4,
                    "time": 737
                },
                {
                    "locationIndex": 2,
                    "time": 737
                },
                {
                    "locationIndex": 3,
                    "time": 745
                },
                {
                    "locationIndex": 0,
                    "time": 745
                },
                {
                    "locationIndex": 2,
                    "time": 753
                },
                {
                    "locationIndex": 4,
                    "time": 753
                },
                {
                    "locationIndex": 3,
                    "time": 769
                },
                {
                    "locationIndex": 2,
                    "time": 777
                },
                {
                    "locationIndex": 0,
                    "time": 777
                },
                {
                    "locationIndex": 3,
                    "time": 777
                },
                {
                    "locationIndex": 5,
                    "time": 784
                },
                {
                    "locationIndex": 4,
                    "time": 784
                },
                {
                    "locationIndex": 3,
                    "time": 793
                },
                {
                    "locationIndex": 0,
                    "time": 797
                },
                {
                    "locationIndex": 3,
                    "time": 801
                },
                {
                    "locationIndex": 2,
                    "time": 801
                },
                {
                    "locationIndex": 5,
                    "time": 817
                },
                {
                    "locationIndex": 0,
                    "time": 817
                },
                {
                    "locationIndex": 3,
                    "time": 825
                },
                {
                    "locationIndex": 5,
                    "time": 832
                },
                {
                    "locationIndex": 1,
                    "time": 841
                },
                {
                    "locationIndex": 0,
                    "time": 841
                },
                {
                    "locationIndex": 5,
                    "time": 849
                },
                {
                    "locationIndex": 4,
                    "time": 849
                },
                {
                    "locationIndex": 3,
                    "time": 856
                },
                {
                    "locationIndex": 5,
                    "time": 865
                },
                {
                    "locationIndex": 2,
                    "time": 873
                },
                {
                    "locationIndex": 3,
                    "time": 873
                },
                {
                    "locationIndex": 4,
                    "time": 881
                },
                {
                    "locationIndex": 5,
                    "time": 889
                },
                {
                    "locationIndex": 1,
                    "time": 889
                },
                {
                    "locationIndex": 3,
                    "time": 905
                },
                {
                    "locationIndex": 4,
                    "time": 913
                },
                {
                    "locationIndex": 1,
                    "time": 913
                },
                {
                    "locationIndex": 3,
                    "time": 913
                },
                {
                    "locationIndex": 0,
                    "time": 929
                },
                {
                    "locationIndex": 2,
                    "time": 929
                },
                {
                    "locationIndex": 5,
                    "time": 935
                },
                {
                    "locationIndex": 1,
                    "time": 945
                },
                {
                    "locationIndex": 2,
                    "time": 945
                },
                {
                    "locationIndex": 0,
                    "time": 953
                },
                {
                    "locationIndex": 4,
                    "time": 953
                },
                {
                    "locationIndex": 3,
                    "time": 961
                },
                {
                    "locationIndex": 1,
                    "time": 976
                },
                {
                    "locationIndex": 4,
                    "time": 976
                },
                {
                    "locationIndex": 2,
                    "time": 986
                },
                {
                    "locationIndex": 3,
                    "time": 992
                },
                {
                    "locationIndex": 4,
                    "time": 1001
                },
                {
                    "locationIndex": 0,
                    "time": 1001
                },
                {
                    "locationIndex": 5,
                    "time": 1009
                },
                {
                    "locationIndex": 0,
                    "time": 1017
                },
                {
                    "locationIndex": 3,
                    "time": 1017
                },
                {
                    "locationIndex": 1,
                    "time": 1025
                },
                {
                    "locationIndex": 4,
                    "time": 1033
                },
                {
                    "locationIndex": 5,
                    "time": 1033
                },
                {
                    "locationIndex": 2,
                    "time": 1041
                },
                {
                    "locationIndex": 3,
                    "time": 1041
                },
                {
                    "locationIndex": 0,
                    "time": 1049
                },
                {
                    "locationIndex": 3,
                    "time": 1057
                },
                {
                    "locationIndex": 2,
                    "time": 1057
                },
                {
                    "locationIndex": 5,
                    "time": 1068
                },
                {
                    "locationIndex": 1,
                    "time": 1068
                },
                {
                    "locationIndex": 2,
                    "time": 1072
                },
                {
                    "locationIndex": 4,
                    "time": 1072
                },
                {
                    "locationIndex": 1,
                    "time": 1078
                },
                {
                    "locationIndex": 2,
                    "time": 1088
                },
                {
                    "locationIndex": 4,
                    "time": 1088
                },
                {
                    "locationIndex": 3,
                    "time": 1097
                },
                {
                    "locationIndex": 2,
                    "time": 1105
                },
                {
                    "locationIndex": 0,
                    "time": 1105
                },
                {
                    "locationIndex": 4,
                    "time": 1105
                },
                {
                    "locationIndex": 3,
                    "time": 1113
                },
                {
                    "locationIndex": 1,
                    "time": 1113
                },
                {
                    "locationIndex": 5,
                    "time": 1120
                },
                {
                    "locationIndex": 2,
                    "time": 1129
                },
                {
                    "locationIndex": 1,
                    "time": 1129
                },
                {
                    "locationIndex": 3,
                    "time": 1129
                },
                {
                    "locationIndex": 5,
                    "time": 1137
                },
                {
                    "locationIndex": 3,
                    "time": 1141
                },
                {
                    "locationIndex": 2,
                    "time": 1141
                },
                {
                    "locationIndex": 4,
                    "time": 1145
                },
                {
                    "locationIndex": 1,
                    "time": 1145
                },
                {
                    "locationIndex": 3,
                    "time": 1153
                },
                {
                    "locationIndex": 5,
                    "time": 1153
                },
                {
                    "locationIndex": 2,
                    "time": 1161
                },
                {
                    "locationIndex": 5,
                    "time": 1168
                },
                {
                    "locationIndex": 4,
                    "time": 1168
                },
                {
                    "locationIndex": 2,
                    "time": 1185
                },
                {
                    "locationIndex": 3,
                    "time": 1193
                },
                {
                    "locationIndex": 5,
                    "time": 1193
                },
                {
                    "locationIndex": 4,
                    "time": 1193
                },
                {
                    "locationIndex": 0,
                    "time": 1201
                },
                {
                    "locationIndex": 3,
                    "time": 1209
                },
                {
                    "locationIndex": 1,
                    "time": 1209
                },
                {
                    "locationIndex": 4,
                    "time": 1216
                },
                {
                    "locationIndex": 3,
                    "time": 1237
                },
                {
                    "locationIndex": 5,
                    "time": 1237
                },
                {
                    "locationIndex": 4,
                    "time": 1241
                },
                {
                    "locationIndex": 0,
                    "time": 1241
                },
                {
                    "locationIndex": 1,
                    "time": 1249
                },
                {
                    "locationIndex": 3,
                    "time": 1257
                },
                {
                    "locationIndex": 2,
                    "time": 1257
                },
                {
                    "locationIndex": 4,
                    "time": 1265
                },
                {
                    "locationIndex": 1,
                    "time": 1265
                },
                {
                    "locationIndex": 0,
                    "time": 1281
                },
                {
                    "locationIndex": 5,
                    "time": 1286
                },
                {
                    "locationIndex": 3,
                    "time": 1290
                },
                {
                    "locationIndex": 2,
                    "time": 1297
                },
                {
                    "locationIndex": 0,
                    "time": 1297
                },
                {
                    "locationIndex": 1,
                    "time": 1312
                },
                {
                    "locationIndex": 2,
                    "time": 1321
                },
                {
                    "locationIndex": 4,
                    "time": 1329
                },
                {
                    "locationIndex": 2,
                    "time": 1339
                },
                {
                    "locationIndex": 4,
                    "time": 1345
                },
                {
                    "locationIndex": 3,
                    "time": 1345
                },
                {
                    "locationIndex": 1,
                    "time": 1360
                },
                {
                    "locationIndex": 0,
                    "time": 1377
                },
                {
                    "locationIndex": 4,
                    "time": 1392,
                    "type": "long",
                    "ends": 1407
                },
                {
                    "locationIndex": 1,
                    "time": 1392,
                    "type": "long",
                    "ends": 1407
                },
                {
                    "locationIndex": 3,
                    "time": 1409
                },
                {
                    "locationIndex": 5,
                    "time": 1418
                },
                {
                    "locationIndex": 0,
                    "time": 1427
                },
                {
                    "locationIndex": 4,
                    "time": 1434
                },
                {
                    "locationIndex": 5,
                    "time": 1434
                },
                {
                    "locationIndex": 2,
                    "time": 1434
                },
                {
                    "locationIndex": 1,
                    "time": 1456
                },
                {
                    "locationIndex": 4,
                    "time": 1465
                },
                {
                    "locationIndex": 2,
                    "time": 1473
                },
                {
                    "locationIndex": 5,
                    "time": 1473
                },
                {
                    "locationIndex": 0,
                    "time": 1482
                },
                {
                    "locationIndex": 3,
                    "time": 1489
                },
                {
                    "locationIndex": 5,
                    "time": 1489
                },
                {
                    "locationIndex": 1,
                    "time": 1503
                },
                {
                    "locationIndex": 2,
                    "time": 1507
                },
                {
                    "locationIndex": 5,
                    "time": 1512
                },
                {
                    "locationIndex": 0,
                    "time": 1512
                },
                {
                    "locationIndex": 1,
                    "time": 1521
                },
                {
                    "locationIndex": 5,
                    "time": 1530
                },
                {
                    "locationIndex": 0,
                    "time": 1530
                },
                {
                    "locationIndex": 4,
                    "time": 1537
                },
                {
                    "locationIndex": 3,
                    "time": 1537
                },
                {
                    "locationIndex": 1,
                    "time": 1552
                },
                {
                    "locationIndex": 4,
                    "time": 1561
                },
                {
                    "locationIndex": 5,
                    "time": 1561
                },
                {
                    "locationIndex": 0,
                    "time": 1569
                },
                {
                    "locationIndex": 5,
                    "time": 1577
                },
                {
                    "locationIndex": 2,
                    "time": 1577
                },
                {
                    "locationIndex": 3,
                    "time": 1585
                },
                {
                    "locationIndex": 0,
                    "time": 1600
                },
                {
                    "locationIndex": 3,
                    "time": 1624
                },
                {
                    "locationIndex": 4,
                    "time": 1624
                },
                {
                    "locationIndex": 2,
                    "time": 1649
                },
                {
                    "locationIndex": 0,
                    "time": 1649
                },
                {
                    "locationIndex": 1,
                    "time": 1659
                },
                {
                    "locationIndex": 4,
                    "time": 1673
                },
                {
                    "locationIndex": 2,
                    "time": 1673
                },
                {
                    "locationIndex": 0,
                    "time": 1688
                },
                {
                    "locationIndex": 5,
                    "time": 1688
                },
                {
                    "locationIndex": 1,
                    "time": 1697,
                    "type": "long",
                    "ends": 1712
                },
                {
                    "locationIndex": 2,
                    "time": 1704
                },
                {
                    "locationIndex": 4,
                    "time": 1704
                },
                {
                    "locationIndex": 3,
                    "time": 1721
                },
                {
                    "locationIndex": 5,
                    "time": 1721
                },
                {
                    "locationIndex": 0,
                    "time": 1727
                },
                {
                    "locationIndex": 2,
                    "time": 1727
                },
                {
                    "locationIndex": 3,
                    "time": 1745
                },
                {
                    "locationIndex": 0,
                    "time": 1754
                },
                {
                    "locationIndex": 2,
                    "time": 1754
                },
                {
                    "locationIndex": 3,
                    "time": 1761
                },
                {
                    "locationIndex": 5,
                    "time": 1769
                },
                {
                    "locationIndex": 2,
                    "time": 1769
                },
                {
                    "locationIndex": 4,
                    "time": 1769
                },
                {
                    "locationIndex": 0,
                    "time": 1793
                },
                {
                    "locationIndex": 2,
                    "time": 1802
                },
                {
                    "locationIndex": 4,
                    "time": 1802
                },
                {
                    "locationIndex": 3,
                    "time": 1809
                },
                {
                    "locationIndex": 0,
                    "time": 1817
                },
                {
                    "locationIndex": 1,
                    "time": 1817
                },
                {
                    "locationIndex": 3,
                    "time": 1827
                },
                {
                    "locationIndex": 2,
                    "time": 1841
                },
                {
                    "locationIndex": 1,
                    "time": 1841
                },
                {
                    "locationIndex": 4,
                    "time": 1859
                },
                {
                    "locationIndex": 0,
                    "time": 1867
                },
                {
                    "locationIndex": 2,
                    "time": 1867
                },
                {
                    "locationIndex": 5,
                    "time": 1873
                },
                {
                    "locationIndex": 3,
                    "time": 1888
                },
                {
                    "locationIndex": 1,
                    "time": 1888
                },
                {
                    "locationIndex": 0,
                    "time": 1912
                },
                {
                    "locationIndex": 5,
                    "time": 1923,
                    "type": "long",
                    "ends": 1938
                },
                {
                    "locationIndex": 3,
                    "time": 1923,
                    "type": "long",
                    "ends": 1938
                },
                {
                    "locationIndex": 0,
                    "time": 1929
                },
                {
                    "locationIndex": 2,
                    "time": 1937
                },
                {
                    "locationIndex": 1,
                    "time": 1937
                },
                {
                    "locationIndex": 0,
                    "time": 1937
                },
                {
                    "locationIndex": 4,
                    "time": 1953
                },
                {
                    "locationIndex": 0,
                    "time": 1961
                },
                {
                    "locationIndex": 1,
                    "time": 1961
                },
                {
                    "locationIndex": 3,
                    "time": 1985
                },
                {
                    "locationIndex": 0,
                    "time": 1997
                },
                {
                    "locationIndex": 5,
                    "time": 1997
                },
                {
                    "locationIndex": 2,
                    "time": 2001
                },
                {
                    "locationIndex": 0,
                    "time": 2010
                },
                {
                    "locationIndex": 4,
                    "time": 2010
                },
                {
                    "locationIndex": 3,
                    "time": 2017
                },
                {
                    "locationIndex": 5,
                    "time": 2017
                },
                {
                    "locationIndex": 1,
                    "time": 2032
                },
                {
                    "locationIndex": 5,
                    "time": 2037
                },
                {
                    "locationIndex": 2,
                    "time": 2037
                },
                {
                    "locationIndex": 4,
                    "time": 2068
                },
                {
                    "locationIndex": 0,
                    "time": 2073
                },
                {
                    "locationIndex": 2,
                    "time": 2073
                },
                {
                    "locationIndex": 1,
                    "time": 2081
                },
                {
                    "locationIndex": 4,
                    "time": 2081
                },
                {
                    "locationIndex": 3,
                    "time": 2113
                },
                {
                    "locationIndex": 0,
                    "time": 2119
                },
                {
                    "locationIndex": 4,
                    "time": 2119
                },
                {
                    "locationIndex": 3,
                    "time": 2128
                },
                {
                    "locationIndex": 1,
                    "time": 2128
                },
                {
                    "locationIndex": 2,
                    "time": 2139
                },
                {
                    "locationIndex": 0,
                    "time": 2139
                },
                {
                    "locationIndex": 5,
                    "time": 2177
                },
                {
                    "locationIndex": 4,
                    "time": 2199
                },
                {
                    "locationIndex": 0,
                    "time": 2199
                },
                {
                    "locationIndex": 1,
                    "time": 2209,
                    "type": "long",
                    "ends": 2224
                },
                {
                    "locationIndex": 4,
                    "time": 2216
                },
                {
                    "locationIndex": 3,
                    "time": 2216
                },
                {
                    "locationIndex": 0,
                    "time": 2225
                },
                {
                    "locationIndex": 2,
                    "time": 2229
                },
                {
                    "locationIndex": 4,
                    "time": 2229
                },
                {
                    "locationIndex": 3,
                    "time": 2244
                },
                {
                    "locationIndex": 0,
                    "time": 2249
                },
                {
                    "locationIndex": 1,
                    "time": 2249
                },
                {
                    "locationIndex": 3,
                    "time": 2257,
                    "type": "long",
                    "ends": 2272
                },
                {
                    "locationIndex": 4,
                    "time": 2265
                },
                {
                    "locationIndex": 1,
                    "time": 2265
                },
                {
                    "locationIndex": 2,
                    "time": 2273
                },
                {
                    "locationIndex": 5,
                    "time": 2278
                },
                {
                    "locationIndex": 1,
                    "time": 2278
                },
                {
                    "locationIndex": 2,
                    "time": 2278
                },
                {
                    "locationIndex": 0,
                    "time": 2289
                },
                {
                    "locationIndex": 4,
                    "time": 2309
                },
                {
                    "locationIndex": 2,
                    "time": 2309
                },
                {
                    "locationIndex": 5,
                    "time": 2314
                },
                {
                    "locationIndex": 3,
                    "time": 2321
                },
                {
                    "locationIndex": 2,
                    "time": 2321
                },
                {
                    "locationIndex": 4,
                    "time": 2355
                },
                {
                    "locationIndex": 5,
                    "time": 2355
                },
                {
                    "locationIndex": 2,
                    "time": 2361
                },
                {
                    "locationIndex": 1,
                    "time": 2368
                },
                {
                    "locationIndex": 5,
                    "time": 2368
                },
                {
                    "locationIndex": 2,
                    "time": 2382
                },
                {
                    "locationIndex": 4,
                    "time": 2406
                },
                {
                    "locationIndex": 1,
                    "time": 2406
                },
                {
                    "locationIndex": 5,
                    "time": 2425
                },
                {
                    "locationIndex": 2,
                    "time": 2425
                },
                {
                    "locationIndex": 3,
                    "time": 2433
                },
                {
                    "locationIndex": 4,
                    "time": 2433
                },
                {
                    "locationIndex": 2,
                    "time": 2469,
                    "type": "long",
                    "ends": 2484
                },
                {
                    "locationIndex": 1,
                    "time": 2476
                },
                {
                    "locationIndex": 0,
                    "time": 2476
                },
                {
                    "locationIndex": 3,
                    "time": 2481
                },
                {
                    "locationIndex": 1,
                    "time": 2497
                },
                {
                    "locationIndex": 5,
                    "time": 2497
                },
                {
                    "locationIndex": 3,
                    "time": 2513
                },
                {
                    "locationIndex": 5,
                    "time": 2529
                },
                {
                    "locationIndex": 1,
                    "time": 2561
                },
                {
                    "locationIndex": 2,
                    "time": 2561
                },
                {
                    "locationIndex": 5,
                    "time": 2593
                },
                {
                    "locationIndex": 4,
                    "time": 2593
                },
                {
                    "locationIndex": 0,
                    "time": 2593
                },
                {
                    "locationIndex": 1,
                    "time": 2609
                },
                {
                    "locationIndex": 5,
                    "time": 2641
                },
                {
                    "locationIndex": 3,
                    "time": 2641
                },
                {
                    "locationIndex": 4,
                    "time": 2654
                },
                {
                    "locationIndex": 3,
                    "time": 2658,
                    "type": "long",
                    "ends": 2673
                },
                {
                    "locationIndex": 0,
                    "time": 2658,
                    "type": "long",
                    "ends": 2673
                },
                {
                    "locationIndex": 1,
                    "time": 2672
                },
                {
                    "locationIndex": 2,
                    "time": 2672
                },
                {
                    "locationIndex": 4,
                    "time": 2678
                },
                {
                    "locationIndex": 2,
                    "time": 2689
                },
                {
                    "locationIndex": 5,
                    "time": 2689
                },
                {
                    "locationIndex": 4,
                    "time": 2705
                },
                {
                    "locationIndex": 5,
                    "time": 2712
                },
                {
                    "locationIndex": 3,
                    "time": 2712
                },
                {
                    "locationIndex": 2,
                    "time": 2721,
                    "type": "long",
                    "ends": 2736
                },
                {
                    "locationIndex": 5,
                    "time": 2725,
                    "type": "long",
                    "ends": 2740
                },
                {
                    "locationIndex": 3,
                    "time": 2725,
                    "type": "long",
                    "ends": 2740
                },
                {
                    "locationIndex": 1,
                    "time": 2729
                },
                {
                    "locationIndex": 4,
                    "time": 2736
                },
                {
                    "locationIndex": 1,
                    "time": 2750
                },
                {
                    "locationIndex": 0,
                    "time": 2750
                },
                {
                    "locationIndex": 4,
                    "time": 2777
                },
                {
                    "locationIndex": 5,
                    "time": 2790
                },
                {
                    "locationIndex": 3,
                    "time": 2796
                },
                {
                    "locationIndex": 2,
                    "time": 2801
                },
                {
                    "locationIndex": 4,
                    "time": 2801
                },
                {
                    "locationIndex": 0,
                    "time": 2812
                },
                {
                    "locationIndex": 3,
                    "time": 2822
                },
                {
                    "locationIndex": 4,
                    "time": 2822
                },
                {
                    "locationIndex": 1,
                    "time": 2828
                },
                {
                    "locationIndex": 2,
                    "time": 2828
                },
                {
                    "locationIndex": 3,
                    "time": 2833
                },
                {
                    "locationIndex": 0,
                    "time": 2852
                },
                {
                    "locationIndex": 1,
                    "time": 2852
                },
                {
                    "locationIndex": 5,
                    "time": 2866
                },
                {
                    "locationIndex": 3,
                    "time": 2881
                },
                {
                    "locationIndex": 0,
                    "time": 2881
                },
                {
                    "locationIndex": 5,
                    "time": 2917,
                    "type": "long",
                    "ends": 2932
                },
                {
                    "locationIndex": 0,
                    "time": 2921
                },
                {
                    "locationIndex": 4,
                    "time": 2921
                },
                {
                    "locationIndex": 1,
                    "time": 2925
                },
                {
                    "locationIndex": 2,
                    "time": 2930
                },
                {
                    "locationIndex": 0,
                    "time": 2942
                },
                {
                    "locationIndex": 3,
                    "time": 2942
                },
                {
                    "locationIndex": 1,
                    "time": 2950
                },
                {
                    "locationIndex": 2,
                    "time": 2950
                },
                {
                    "locationIndex": 0,
                    "time": 2962
                },
                {
                    "locationIndex": 2,
                    "time": 2976
                },
                {
                    "locationIndex": 3,
                    "time": 2992
                },
                {
                    "locationIndex": 5,
                    "time": 3009
                },
                {
                    "locationIndex": 1,
                    "time": 3009
                },
                {
                    "locationIndex": 0,
                    "time": 3019
                },
                {
                    "locationIndex": 3,
                    "time": 3019
                },
                {
                    "locationIndex": 4,
                    "time": 3025
                },
                {
                    "locationIndex": 0,
                    "time": 3088
                },
                {
                    "locationIndex": 5,
                    "time": 3097
                },
                {
                    "locationIndex": 2,
                    "time": 3134
                },
                {
                    "locationIndex": 4,
                    "time": 3139
                },
                {
                    "locationIndex": 2,
                    "time": 3146
                },
                {
                    "locationIndex": 0,
                    "time": 3146
                },
                {
                    "locationIndex": 1,
                    "time": 3163
                },
                {
                    "locationIndex": 5,
                    "time": 3263
                },
                {
                    "locationIndex": 3,
                    "time": 3341
                }
            ]
});

song.difficulties.push({
    difficultyLabel : 'ex1',
    difficultyLevel : 14,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 0,
                    "time": 145
                },
                {
                    "locationIndex": 3,
                    "time": 177
                },
                {
                    "locationIndex": 4,
                    "time": 208
                },
                {
                    "locationIndex": 1,
                    "time": 209
                },
                {
                    "locationIndex": 3,
                    "time": 209
                },
                {
                    "locationIndex": 4,
                    "time": 281
                },
                {
                    "locationIndex": 2,
                    "time": 289
                },
                {
                    "locationIndex": 3,
                    "time": 289
                },
                {
                    "locationIndex": 4,
                    "time": 297
                },
                {
                    "locationIndex": 1,
                    "time": 305,
                    "type": "long",
                    "ends": 320
                },
                {
                    "locationIndex": 3,
                    "time": 305,
                    "type": "long",
                    "ends": 320
                },
                {
                    "locationIndex": 4,
                    "time": 321
                },
                {
                    "locationIndex": 5,
                    "time": 321
                },
                {
                    "locationIndex": 2,
                    "time": 337,
                    "type": "long",
                    "ends": 352
                },
                {
                    "locationIndex": 0,
                    "time": 337,
                    "type": "long",
                    "ends": 352
                },
                {
                    "locationIndex": 4,
                    "time": 345
                },
                {
                    "locationIndex": 1,
                    "time": 352
                },
                {
                    "locationIndex": 4,
                    "time": 353
                },
                {
                    "locationIndex": 3,
                    "time": 353
                },
                {
                    "locationIndex": 1,
                    "time": 361
                },
                {
                    "locationIndex": 5,
                    "time": 385
                },
                {
                    "locationIndex": 1,
                    "time": 400
                },
                {
                    "locationIndex": 3,
                    "time": 403
                },
                {
                    "locationIndex": 5,
                    "time": 416
                },
                {
                    "locationIndex": 1,
                    "time": 417
                },
                {
                    "locationIndex": 0,
                    "time": 433
                },
                {
                    "locationIndex": 5,
                    "time": 441
                },
                {
                    "locationIndex": 3,
                    "time": 448
                },
                {
                    "locationIndex": 1,
                    "time": 449
                },
                {
                    "locationIndex": 2,
                    "time": 449
                },
                {
                    "locationIndex": 4,
                    "time": 449
                },
                {
                    "locationIndex": 5,
                    "time": 457
                },
                {
                    "locationIndex": 2,
                    "time": 473
                },
                {
                    "locationIndex": 1,
                    "time": 473
                },
                {
                    "locationIndex": 0,
                    "time": 481
                },
                {
                    "locationIndex": 5,
                    "time": 483
                },
                {
                    "locationIndex": 4,
                    "time": 483
                },
                {
                    "locationIndex": 2,
                    "time": 489
                },
                {
                    "locationIndex": 5,
                    "time": 496
                },
                {
                    "locationIndex": 1,
                    "time": 496
                },
                {
                    "locationIndex": 2,
                    "time": 497,
                    "type": "long",
                    "ends": 512
                },
                {
                    "locationIndex": 4,
                    "time": 505
                },
                {
                    "locationIndex": 5,
                    "time": 505
                },
                {
                    "locationIndex": 0,
                    "time": 513
                },
                {
                    "locationIndex": 3,
                    "time": 521
                },
                {
                    "locationIndex": 1,
                    "time": 521
                },
                {
                    "locationIndex": 5,
                    "time": 521
                },
                {
                    "locationIndex": 0,
                    "time": 529
                },
                {
                    "locationIndex": 4,
                    "time": 529
                },
                {
                    "locationIndex": 3,
                    "time": 537
                },
                {
                    "locationIndex": 5,
                    "time": 545
                },
                {
                    "locationIndex": 4,
                    "time": 545
                },
                {
                    "locationIndex": 1,
                    "time": 546
                },
                {
                    "locationIndex": 0,
                    "time": 553
                },
                {
                    "locationIndex": 2,
                    "time": 553
                },
                {
                    "locationIndex": 1,
                    "time": 553
                },
                {
                    "locationIndex": 3,
                    "time": 561
                },
                {
                    "locationIndex": 2,
                    "time": 569
                },
                {
                    "locationIndex": 4,
                    "time": 569
                },
                {
                    "locationIndex": 0,
                    "time": 577
                },
                {
                    "locationIndex": 1,
                    "time": 592
                },
                {
                    "locationIndex": 5,
                    "time": 592
                },
                {
                    "locationIndex": 2,
                    "time": 593
                },
                {
                    "locationIndex": 3,
                    "time": 609
                },
                {
                    "locationIndex": 1,
                    "time": 609
                },
                {
                    "locationIndex": 2,
                    "time": 611
                },
                {
                    "locationIndex": 4,
                    "time": 617
                },
                {
                    "locationIndex": 3,
                    "time": 617
                },
                {
                    "locationIndex": 1,
                    "time": 625
                },
                {
                    "locationIndex": 2,
                    "time": 633
                },
                {
                    "locationIndex": 3,
                    "time": 633
                },
                {
                    "locationIndex": 4,
                    "time": 641
                },
                {
                    "locationIndex": 5,
                    "time": 649
                },
                {
                    "locationIndex": 2,
                    "time": 649
                },
                {
                    "locationIndex": 1,
                    "time": 665
                },
                {
                    "locationIndex": 2,
                    "time": 673,
                    "type": "long",
                    "ends": 688
                },
                {
                    "locationIndex": 3,
                    "time": 681
                },
                {
                    "locationIndex": 0,
                    "time": 681
                },
                {
                    "locationIndex": 1,
                    "time": 688
                },
                {
                    "locationIndex": 5,
                    "time": 689
                },
                {
                    "locationIndex": 4,
                    "time": 689
                },
                {
                    "locationIndex": 1,
                    "time": 689
                },
                {
                    "locationIndex": 3,
                    "time": 705
                },
                {
                    "locationIndex": 0,
                    "time": 705
                },
                {
                    "locationIndex": 1,
                    "time": 713
                },
                {
                    "locationIndex": 5,
                    "time": 713
                },
                {
                    "locationIndex": 0,
                    "time": 721,
                    "type": "long",
                    "ends": 736
                },
                {
                    "locationIndex": 4,
                    "time": 729
                },
                {
                    "locationIndex": 5,
                    "time": 729
                },
                {
                    "locationIndex": 3,
                    "time": 737
                },
                {
                    "locationIndex": 1,
                    "time": 737
                },
                {
                    "locationIndex": 2,
                    "time": 737
                },
                {
                    "locationIndex": 4,
                    "time": 738
                },
                {
                    "locationIndex": 1,
                    "time": 745
                },
                {
                    "locationIndex": 2,
                    "time": 745
                },
                {
                    "locationIndex": 3,
                    "time": 753,
                    "type": "long",
                    "ends": 768
                },
                {
                    "locationIndex": 5,
                    "time": 769
                },
                {
                    "locationIndex": 4,
                    "time": 769
                },
                {
                    "locationIndex": 2,
                    "time": 777
                },
                {
                    "locationIndex": 1,
                    "time": 777
                },
                {
                    "locationIndex": 0,
                    "time": 784,
                    "type": "long",
                    "ends": 799
                },
                {
                    "locationIndex": 2,
                    "time": 785
                },
                {
                    "locationIndex": 4,
                    "time": 785
                },
                {
                    "locationIndex": 1,
                    "time": 797
                },
                {
                    "locationIndex": 5,
                    "time": 797
                },
                {
                    "locationIndex": 4,
                    "time": 801
                },
                {
                    "locationIndex": 2,
                    "time": 801
                },
                {
                    "locationIndex": 3,
                    "time": 802
                },
                {
                    "locationIndex": 1,
                    "time": 802
                },
                {
                    "locationIndex": 4,
                    "time": 817
                },
                {
                    "locationIndex": 1,
                    "time": 825
                },
                {
                    "locationIndex": 0,
                    "time": 832
                },
                {
                    "locationIndex": 3,
                    "time": 833
                },
                {
                    "locationIndex": 5,
                    "time": 833
                },
                {
                    "locationIndex": 4,
                    "time": 833
                },
                {
                    "locationIndex": 1,
                    "time": 841
                },
                {
                    "locationIndex": 2,
                    "time": 849
                },
                {
                    "locationIndex": 4,
                    "time": 849
                },
                {
                    "locationIndex": 3,
                    "time": 856
                },
                {
                    "locationIndex": 1,
                    "time": 865,
                    "type": "long",
                    "ends": 880
                },
                {
                    "locationIndex": 0,
                    "time": 873
                },
                {
                    "locationIndex": 4,
                    "time": 873
                },
                {
                    "locationIndex": 5,
                    "time": 873
                },
                {
                    "locationIndex": 3,
                    "time": 881
                },
                {
                    "locationIndex": 2,
                    "time": 881
                },
                {
                    "locationIndex": 5,
                    "time": 881
                },
                {
                    "locationIndex": 4,
                    "time": 889
                },
                {
                    "locationIndex": 0,
                    "time": 896
                },
                {
                    "locationIndex": 2,
                    "time": 905
                },
                {
                    "locationIndex": 3,
                    "time": 905
                },
                {
                    "locationIndex": 1,
                    "time": 905
                },
                {
                    "locationIndex": 0,
                    "time": 913
                },
                {
                    "locationIndex": 4,
                    "time": 913
                },
                {
                    "locationIndex": 5,
                    "time": 929
                },
                {
                    "locationIndex": 4,
                    "time": 931
                },
                {
                    "locationIndex": 3,
                    "time": 931
                },
                {
                    "locationIndex": 2,
                    "time": 935,
                    "type": "long",
                    "ends": 950
                },
                {
                    "locationIndex": 1,
                    "time": 937
                },
                {
                    "locationIndex": 4,
                    "time": 937
                },
                {
                    "locationIndex": 5,
                    "time": 945
                },
                {
                    "locationIndex": 0,
                    "time": 953
                },
                {
                    "locationIndex": 4,
                    "time": 953
                },
                {
                    "locationIndex": 5,
                    "time": 961,
                    "type": "long",
                    "ends": 976
                },
                {
                    "locationIndex": 3,
                    "time": 961,
                    "type": "long",
                    "ends": 976
                },
                {
                    "locationIndex": 4,
                    "time": 963
                },
                {
                    "locationIndex": 0,
                    "time": 964
                },
                {
                    "locationIndex": 1,
                    "time": 964
                },
                {
                    "locationIndex": 4,
                    "time": 964
                },
                {
                    "locationIndex": 4,
                    "time": 977,
                    "type": "long",
                    "ends": 992
                },
                {
                    "locationIndex": 0,
                    "time": 977,
                    "type": "long",
                    "ends": 992
                },
                {
                    "locationIndex": 1,
                    "time": 986
                },
                {
                    "locationIndex": 2,
                    "time": 986
                },
                {
                    "locationIndex": 1,
                    "time": 1001
                },
                {
                    "locationIndex": 2,
                    "time": 1001
                },
                {
                    "locationIndex": 5,
                    "time": 1009
                },
                {
                    "locationIndex": 2,
                    "time": 1011
                },
                {
                    "locationIndex": 1,
                    "time": 1011
                },
                {
                    "locationIndex": 5,
                    "time": 1017
                },
                {
                    "locationIndex": 4,
                    "time": 1017
                },
                {
                    "locationIndex": 0,
                    "time": 1025
                },
                {
                    "locationIndex": 1,
                    "time": 1026
                },
                {
                    "locationIndex": 3,
                    "time": 1026
                },
                {
                    "locationIndex": 0,
                    "time": 1033
                },
                {
                    "locationIndex": 2,
                    "time": 1033
                },
                {
                    "locationIndex": 4,
                    "time": 1041,
                    "type": "long",
                    "ends": 1056
                },
                {
                    "locationIndex": 1,
                    "time": 1049
                },
                {
                    "locationIndex": 5,
                    "time": 1049
                },
                {
                    "locationIndex": 0,
                    "time": 1057
                },
                {
                    "locationIndex": 3,
                    "time": 1057
                },
                {
                    "locationIndex": 2,
                    "time": 1060
                },
                {
                    "locationIndex": 3,
                    "time": 1068
                },
                {
                    "locationIndex": 0,
                    "time": 1068
                },
                {
                    "locationIndex": 2,
                    "time": 1072
                },
                {
                    "locationIndex": 5,
                    "time": 1072
                },
                {
                    "locationIndex": 3,
                    "time": 1073
                },
                {
                    "locationIndex": 5,
                    "time": 1078
                },
                {
                    "locationIndex": 2,
                    "time": 1078
                },
                {
                    "locationIndex": 1,
                    "time": 1088,
                    "type": "long",
                    "ends": 1103
                },
                {
                    "locationIndex": 3,
                    "time": 1088,
                    "type": "long",
                    "ends": 1103
                },
                {
                    "locationIndex": 2,
                    "time": 1089
                },
                {
                    "locationIndex": 4,
                    "time": 1097
                },
                {
                    "locationIndex": 0,
                    "time": 1097
                },
                {
                    "locationIndex": 2,
                    "time": 1105
                },
                {
                    "locationIndex": 0,
                    "time": 1107
                },
                {
                    "locationIndex": 5,
                    "time": 1107
                },
                {
                    "locationIndex": 4,
                    "time": 1113
                },
                {
                    "locationIndex": 2,
                    "time": 1113
                },
                {
                    "locationIndex": 0,
                    "time": 1120,
                    "type": "long",
                    "ends": 1135
                },
                {
                    "locationIndex": 4,
                    "time": 1121
                },
                {
                    "locationIndex": 5,
                    "time": 1121
                },
                {
                    "locationIndex": 2,
                    "time": 1129
                },
                {
                    "locationIndex": 3,
                    "time": 1129
                },
                {
                    "locationIndex": 5,
                    "time": 1137
                },
                {
                    "locationIndex": 3,
                    "time": 1139
                },
                {
                    "locationIndex": 2,
                    "time": 1139
                },
                {
                    "locationIndex": 4,
                    "time": 1141
                },
                {
                    "locationIndex": 1,
                    "time": 1141
                },
                {
                    "locationIndex": 5,
                    "time": 1145
                },
                {
                    "locationIndex": 3,
                    "time": 1145
                },
                {
                    "locationIndex": 4,
                    "time": 1153
                },
                {
                    "locationIndex": 2,
                    "time": 1161
                },
                {
                    "locationIndex": 1,
                    "time": 1161
                },
                {
                    "locationIndex": 4,
                    "time": 1168
                },
                {
                    "locationIndex": 3,
                    "time": 1169
                },
                {
                    "locationIndex": 2,
                    "time": 1169
                },
                {
                    "locationIndex": 5,
                    "time": 1185,
                    "type": "long",
                    "ends": 1200
                },
                {
                    "locationIndex": 4,
                    "time": 1193
                },
                {
                    "locationIndex": 0,
                    "time": 1193
                },
                {
                    "locationIndex": 1,
                    "time": 1201
                },
                {
                    "locationIndex": 3,
                    "time": 1201
                },
                {
                    "locationIndex": 4,
                    "time": 1209
                },
                {
                    "locationIndex": 0,
                    "time": 1209
                },
                {
                    "locationIndex": 3,
                    "time": 1216
                },
                {
                    "locationIndex": 2,
                    "time": 1217
                },
                {
                    "locationIndex": 0,
                    "time": 1217
                },
                {
                    "locationIndex": 1,
                    "time": 1237
                },
                {
                    "locationIndex": 0,
                    "time": 1241
                },
                {
                    "locationIndex": 5,
                    "time": 1241
                },
                {
                    "locationIndex": 2,
                    "time": 1249
                },
                {
                    "locationIndex": 5,
                    "time": 1257
                },
                {
                    "locationIndex": 3,
                    "time": 1257
                },
                {
                    "locationIndex": 4,
                    "time": 1265
                },
                {
                    "locationIndex": 5,
                    "time": 1281
                },
                {
                    "locationIndex": 0,
                    "time": 1286
                },
                {
                    "locationIndex": 5,
                    "time": 1290
                },
                {
                    "locationIndex": 2,
                    "time": 1290
                },
                {
                    "locationIndex": 1,
                    "time": 1297
                },
                {
                    "locationIndex": 4,
                    "time": 1297
                },
                {
                    "locationIndex": 2,
                    "time": 1297
                },
                {
                    "locationIndex": 5,
                    "time": 1312
                },
                {
                    "locationIndex": 4,
                    "time": 1313
                },
                {
                    "locationIndex": 0,
                    "time": 1315
                },
                {
                    "locationIndex": 3,
                    "time": 1315
                },
                {
                    "locationIndex": 2,
                    "time": 1321
                },
                {
                    "locationIndex": 5,
                    "time": 1329
                },
                {
                    "locationIndex": 1,
                    "time": 1339
                },
                {
                    "locationIndex": 4,
                    "time": 1345
                },
                {
                    "locationIndex": 5,
                    "time": 1353
                },
                {
                    "locationIndex": 0,
                    "time": 1361
                },
                {
                    "locationIndex": 3,
                    "time": 1361
                },
                {
                    "locationIndex": 1,
                    "time": 1377
                },
                {
                    "locationIndex": 5,
                    "time": 1377
                },
                {
                    "locationIndex": 4,
                    "time": 1379
                },
                {
                    "locationIndex": 2,
                    "time": 1379
                },
                {
                    "locationIndex": 0,
                    "time": 1392
                },
                {
                    "locationIndex": 3,
                    "time": 1392
                },
                {
                    "locationIndex": 5,
                    "time": 1409
                },
                {
                    "locationIndex": 3,
                    "time": 1418
                },
                {
                    "locationIndex": 1,
                    "time": 1418
                },
                {
                    "locationIndex": 0,
                    "time": 1427
                },
                {
                    "locationIndex": 1,
                    "time": 1434
                },
                {
                    "locationIndex": 5,
                    "time": 1434
                },
                {
                    "locationIndex": 2,
                    "time": 1441
                },
                {
                    "locationIndex": 1,
                    "time": 1456
                },
                {
                    "locationIndex": 3,
                    "time": 1456
                },
                {
                    "locationIndex": 0,
                    "time": 1457
                },
                {
                    "locationIndex": 2,
                    "time": 1465
                },
                {
                    "locationIndex": 3,
                    "time": 1465
                },
                {
                    "locationIndex": 5,
                    "time": 1473
                },
                {
                    "locationIndex": 4,
                    "time": 1482
                },
                {
                    "locationIndex": 1,
                    "time": 1482
                },
                {
                    "locationIndex": 2,
                    "time": 1488
                },
                {
                    "locationIndex": 1,
                    "time": 1489
                },
                {
                    "locationIndex": 2,
                    "time": 1504
                },
                {
                    "locationIndex": 1,
                    "time": 1505
                },
                {
                    "locationIndex": 4,
                    "time": 1505
                },
                {
                    "locationIndex": 2,
                    "time": 1507
                },
                {
                    "locationIndex": 3,
                    "time": 1507
                },
                {
                    "locationIndex": 5,
                    "time": 1512
                },
                {
                    "locationIndex": 3,
                    "time": 1521
                },
                {
                    "locationIndex": 0,
                    "time": 1521
                },
                {
                    "locationIndex": 1,
                    "time": 1530
                },
                {
                    "locationIndex": 3,
                    "time": 1531
                },
                {
                    "locationIndex": 5,
                    "time": 1531
                },
                {
                    "locationIndex": 4,
                    "time": 1537
                },
                {
                    "locationIndex": 0,
                    "time": 1537
                },
                {
                    "locationIndex": 3,
                    "time": 1552
                },
                {
                    "locationIndex": 1,
                    "time": 1553
                },
                {
                    "locationIndex": 0,
                    "time": 1553
                },
                {
                    "locationIndex": 4,
                    "time": 1561
                },
                {
                    "locationIndex": 3,
                    "time": 1561
                },
                {
                    "locationIndex": 2,
                    "time": 1569
                },
                {
                    "locationIndex": 5,
                    "time": 1577
                },
                {
                    "locationIndex": 4,
                    "time": 1577
                },
                {
                    "locationIndex": 3,
                    "time": 1585
                },
                {
                    "locationIndex": 5,
                    "time": 1600
                },
                {
                    "locationIndex": 0,
                    "time": 1600
                },
                {
                    "locationIndex": 1,
                    "time": 1601
                },
                {
                    "locationIndex": 4,
                    "time": 1601
                },
                {
                    "locationIndex": 2,
                    "time": 1601
                },
                {
                    "locationIndex": 0,
                    "time": 1624
                },
                {
                    "locationIndex": 1,
                    "time": 1649
                },
                {
                    "locationIndex": 4,
                    "time": 1649
                },
                {
                    "locationIndex": 5,
                    "time": 1651
                },
                {
                    "locationIndex": 3,
                    "time": 1651
                },
                {
                    "locationIndex": 4,
                    "time": 1651
                },
                {
                    "locationIndex": 2,
                    "time": 1659
                },
                {
                    "locationIndex": 4,
                    "time": 1673
                },
                {
                    "locationIndex": 5,
                    "time": 1673
                },
                {
                    "locationIndex": 3,
                    "time": 1674
                },
                {
                    "locationIndex": 1,
                    "time": 1674
                },
                {
                    "locationIndex": 0,
                    "time": 1675
                },
                {
                    "locationIndex": 2,
                    "time": 1688
                },
                {
                    "locationIndex": 1,
                    "time": 1688
                },
                {
                    "locationIndex": 4,
                    "time": 1697
                },
                {
                    "locationIndex": 3,
                    "time": 1697
                },
                {
                    "locationIndex": 2,
                    "time": 1699
                },
                {
                    "locationIndex": 0,
                    "time": 1704
                },
                {
                    "locationIndex": 4,
                    "time": 1704
                },
                {
                    "locationIndex": 1,
                    "time": 1704
                },
                {
                    "locationIndex": 5,
                    "time": 1713
                },
                {
                    "locationIndex": 3,
                    "time": 1721
                },
                {
                    "locationIndex": 0,
                    "time": 1721
                },
                {
                    "locationIndex": 2,
                    "time": 1722
                },
                {
                    "locationIndex": 5,
                    "time": 1722
                },
                {
                    "locationIndex": 4,
                    "time": 1727
                },
                {
                    "locationIndex": 1,
                    "time": 1745
                },
                {
                    "locationIndex": 3,
                    "time": 1745
                },
                {
                    "locationIndex": 5,
                    "time": 1745
                },
                {
                    "locationIndex": 2,
                    "time": 1747
                },
                {
                    "locationIndex": 0,
                    "time": 1747
                },
                {
                    "locationIndex": 1,
                    "time": 1754
                },
                {
                    "locationIndex": 2,
                    "time": 1761
                },
                {
                    "locationIndex": 5,
                    "time": 1761
                },
                {
                    "locationIndex": 0,
                    "time": 1769
                },
                {
                    "locationIndex": 4,
                    "time": 1769
                },
                {
                    "locationIndex": 2,
                    "time": 1771
                },
                {
                    "locationIndex": 4,
                    "time": 1793
                },
                {
                    "locationIndex": 0,
                    "time": 1793
                },
                {
                    "locationIndex": 5,
                    "time": 1802
                },
                {
                    "locationIndex": 2,
                    "time": 1809
                },
                {
                    "locationIndex": 3,
                    "time": 1809
                },
                {
                    "locationIndex": 0,
                    "time": 1817
                },
                {
                    "locationIndex": 3,
                    "time": 1818
                },
                {
                    "locationIndex": 5,
                    "time": 1818
                },
                {
                    "locationIndex": 2,
                    "time": 1818
                },
                {
                    "locationIndex": 4,
                    "time": 1827
                },
                {
                    "locationIndex": 0,
                    "time": 1841
                },
                {
                    "locationIndex": 3,
                    "time": 1841
                },
                {
                    "locationIndex": 5,
                    "time": 1842
                },
                {
                    "locationIndex": 1,
                    "time": 1859,
                    "type": "long",
                    "ends": 1874
                },
                {
                    "locationIndex": 4,
                    "time": 1867
                },
                {
                    "locationIndex": 0,
                    "time": 1867
                },
                {
                    "locationIndex": 5,
                    "time": 1873
                },
                {
                    "locationIndex": 2,
                    "time": 1873
                },
                {
                    "locationIndex": 4,
                    "time": 1888
                },
                {
                    "locationIndex": 2,
                    "time": 1889
                },
                {
                    "locationIndex": 5,
                    "time": 1889
                },
                {
                    "locationIndex": 3,
                    "time": 1891
                },
                {
                    "locationIndex": 4,
                    "time": 1891
                },
                {
                    "locationIndex": 0,
                    "time": 1912
                },
                {
                    "locationIndex": 5,
                    "time": 1912
                },
                {
                    "locationIndex": 4,
                    "time": 1913,
                    "type": "long",
                    "ends": 1928
                },
                {
                    "locationIndex": 2,
                    "time": 1914
                },
                {
                    "locationIndex": 5,
                    "time": 1914
                },
                {
                    "locationIndex": 1,
                    "time": 1923
                },
                {
                    "locationIndex": 0,
                    "time": 1923
                },
                {
                    "locationIndex": 2,
                    "time": 1929
                },
                {
                    "locationIndex": 5,
                    "time": 1937,
                    "type": "long",
                    "ends": 1952
                },
                {
                    "locationIndex": 3,
                    "time": 1937,
                    "type": "long",
                    "ends": 1952
                },
                {
                    "locationIndex": 2,
                    "time": 1939
                },
                {
                    "locationIndex": 0,
                    "time": 1939
                },
                {
                    "locationIndex": 1,
                    "time": 1961
                },
                {
                    "locationIndex": 4,
                    "time": 1962
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
                    "time": 1963
                },
                {
                    "locationIndex": 1,
                    "time": 1985
                },
                {
                    "locationIndex": 4,
                    "time": 1985
                },
                {
                    "locationIndex": 2,
                    "time": 1986
                },
                {
                    "locationIndex": 0,
                    "time": 1997
                },
                {
                    "locationIndex": 3,
                    "time": 1997
                },
                {
                    "locationIndex": 1,
                    "time": 2001,
                    "type": "long",
                    "ends": 2016
                },
                {
                    "locationIndex": 2,
                    "time": 2010
                },
                {
                    "locationIndex": 5,
                    "time": 2010
                },
                {
                    "locationIndex": 4,
                    "time": 2017
                },
                {
                    "locationIndex": 0,
                    "time": 2017
                },
                {
                    "locationIndex": 5,
                    "time": 2032
                },
                {
                    "locationIndex": 0,
                    "time": 2033
                },
                {
                    "locationIndex": 4,
                    "time": 2033
                },
                {
                    "locationIndex": 5,
                    "time": 2033
                },
                {
                    "locationIndex": 2,
                    "time": 2037
                },
                {
                    "locationIndex": 4,
                    "time": 2068
                },
                {
                    "locationIndex": 3,
                    "time": 2068
                },
                {
                    "locationIndex": 2,
                    "time": 2068
                },
                {
                    "locationIndex": 0,
                    "time": 2073
                },
                {
                    "locationIndex": 1,
                    "time": 2073
                },
                {
                    "locationIndex": 5,
                    "time": 2081
                },
                {
                    "locationIndex": 1,
                    "time": 2083
                },
                {
                    "locationIndex": 0,
                    "time": 2083
                },
                {
                    "locationIndex": 4,
                    "time": 2113
                },
                {
                    "locationIndex": 2,
                    "time": 2119
                },
                {
                    "locationIndex": 1,
                    "time": 2119
                },
                {
                    "locationIndex": 5,
                    "time": 2128
                },
                {
                    "locationIndex": 3,
                    "time": 2139
                },
                {
                    "locationIndex": 0,
                    "time": 2139
                },
                {
                    "locationIndex": 4,
                    "time": 2177
                },
                {
                    "locationIndex": 2,
                    "time": 2177
                },
                {
                    "locationIndex": 1,
                    "time": 2199
                },
                {
                    "locationIndex": 4,
                    "time": 2209
                },
                {
                    "locationIndex": 3,
                    "time": 2209
                },
                {
                    "locationIndex": 1,
                    "time": 2216
                },
                {
                    "locationIndex": 0,
                    "time": 2225
                },
                {
                    "locationIndex": 5,
                    "time": 2225
                },
                {
                    "locationIndex": 1,
                    "time": 2225
                },
                {
                    "locationIndex": 3,
                    "time": 2229
                },
                {
                    "locationIndex": 0,
                    "time": 2244
                },
                {
                    "locationIndex": 2,
                    "time": 2244
                },
                {
                    "locationIndex": 1,
                    "time": 2249
                },
                {
                    "locationIndex": 3,
                    "time": 2249
                },
                {
                    "locationIndex": 4,
                    "time": 2257
                },
                {
                    "locationIndex": 3,
                    "time": 2265
                },
                {
                    "locationIndex": 1,
                    "time": 2265
                },
                {
                    "locationIndex": 0,
                    "time": 2273
                },
                {
                    "locationIndex": 1,
                    "time": 2278
                },
                {
                    "locationIndex": 4,
                    "time": 2278
                },
                {
                    "locationIndex": 0,
                    "time": 2289,
                    "type": "long",
                    "ends": 2304
                },
                {
                    "locationIndex": 1,
                    "time": 2309
                },
                {
                    "locationIndex": 4,
                    "time": 2309
                },
                {
                    "locationIndex": 5,
                    "time": 2314
                },
                {
                    "locationIndex": 3,
                    "time": 2321
                },
                {
                    "locationIndex": 2,
                    "time": 2321
                },
                {
                    "locationIndex": 1,
                    "time": 2355,
                    "type": "long",
                    "ends": 2370
                },
                {
                    "locationIndex": 0,
                    "time": 2361
                },
                {
                    "locationIndex": 3,
                    "time": 2361
                },
                {
                    "locationIndex": 4,
                    "time": 2368
                },
                {
                    "locationIndex": 2,
                    "time": 2368
                },
                {
                    "locationIndex": 3,
                    "time": 2369
                },
                {
                    "locationIndex": 0,
                    "time": 2369
                },
                {
                    "locationIndex": 4,
                    "time": 2382
                },
                {
                    "locationIndex": 5,
                    "time": 2385
                },
                {
                    "locationIndex": 3,
                    "time": 2385
                },
                {
                    "locationIndex": 4,
                    "time": 2406
                },
                {
                    "locationIndex": 2,
                    "time": 2406
                },
                {
                    "locationIndex": 5,
                    "time": 2408
                },
                {
                    "locationIndex": 3,
                    "time": 2408
                },
                {
                    "locationIndex": 1,
                    "time": 2409
                },
                {
                    "locationIndex": 0,
                    "time": 2425
                },
                {
                    "locationIndex": 5,
                    "time": 2425
                },
                {
                    "locationIndex": 4,
                    "time": 2433
                },
                {
                    "locationIndex": 1,
                    "time": 2433
                },
                {
                    "locationIndex": 5,
                    "time": 2434,
                    "type": "long",
                    "ends": 2449
                },
                {
                    "locationIndex": 2,
                    "time": 2469
                },
                {
                    "locationIndex": 3,
                    "time": 2469
                },
                {
                    "locationIndex": 5,
                    "time": 2476
                },
                {
                    "locationIndex": 0,
                    "time": 2476
                },
                {
                    "locationIndex": 3,
                    "time": 2481
                },
                {
                    "locationIndex": 4,
                    "time": 2497
                },
                {
                    "locationIndex": 1,
                    "time": 2497
                },
                {
                    "locationIndex": 0,
                    "time": 2513
                },
                {
                    "locationIndex": 1,
                    "time": 2529
                },
                {
                    "locationIndex": 2,
                    "time": 2530
                },
                {
                    "locationIndex": 4,
                    "time": 2530
                },
                {
                    "locationIndex": 5,
                    "time": 2561
                },
                {
                    "locationIndex": 0,
                    "time": 2561
                },
                {
                    "locationIndex": 4,
                    "time": 2593,
                    "type": "long",
                    "ends": 2608
                },
                {
                    "locationIndex": 0,
                    "time": 2609
                },
                {
                    "locationIndex": 5,
                    "time": 2609
                },
                {
                    "locationIndex": 3,
                    "time": 2641
                },
                {
                    "locationIndex": 1,
                    "time": 2641
                },
                {
                    "locationIndex": 2,
                    "time": 2654
                },
                {
                    "locationIndex": 5,
                    "time": 2656
                },
                {
                    "locationIndex": 0,
                    "time": 2657
                },
                {
                    "locationIndex": 3,
                    "time": 2658
                },
                {
                    "locationIndex": 1,
                    "time": 2658
                },
                {
                    "locationIndex": 5,
                    "time": 2672
                },
                {
                    "locationIndex": 0,
                    "time": 2674
                },
                {
                    "locationIndex": 3,
                    "time": 2674
                },
                {
                    "locationIndex": 4,
                    "time": 2678,
                    "type": "long",
                    "ends": 2693
                },
                {
                    "locationIndex": 2,
                    "time": 2681
                },
                {
                    "locationIndex": 0,
                    "time": 2681
                },
                {
                    "locationIndex": 1,
                    "time": 2689
                },
                {
                    "locationIndex": 0,
                    "time": 2705
                },
                {
                    "locationIndex": 3,
                    "time": 2705
                },
                {
                    "locationIndex": 5,
                    "time": 2712
                },
                {
                    "locationIndex": 1,
                    "time": 2712
                },
                {
                    "locationIndex": 4,
                    "time": 2713
                },
                {
                    "locationIndex": 0,
                    "time": 2721
                },
                {
                    "locationIndex": 2,
                    "time": 2721
                },
                {
                    "locationIndex": 3,
                    "time": 2721
                },
                {
                    "locationIndex": 4,
                    "time": 2724
                },
                {
                    "locationIndex": 3,
                    "time": 2725
                },
                {
                    "locationIndex": 1,
                    "time": 2725
                },
                {
                    "locationIndex": 0,
                    "time": 2728
                },
                {
                    "locationIndex": 2,
                    "time": 2728
                },
                {
                    "locationIndex": 5,
                    "time": 2729
                },
                {
                    "locationIndex": 3,
                    "time": 2729
                },
                {
                    "locationIndex": 1,
                    "time": 2729
                },
                {
                    "locationIndex": 0,
                    "time": 2732
                },
                {
                    "locationIndex": 4,
                    "time": 2750
                },
                {
                    "locationIndex": 2,
                    "time": 2750
                },
                {
                    "locationIndex": 0,
                    "time": 2753
                },
                {
                    "locationIndex": 3,
                    "time": 2777
                },
                {
                    "locationIndex": 5,
                    "time": 2777
                },
                {
                    "locationIndex": 0,
                    "time": 2780
                },
                {
                    "locationIndex": 3,
                    "time": 2790
                },
                {
                    "locationIndex": 0,
                    "time": 2792
                },
                {
                    "locationIndex": 4,
                    "time": 2792
                },
                {
                    "locationIndex": 3,
                    "time": 2793
                },
                {
                    "locationIndex": 1,
                    "time": 2796
                },
                {
                    "locationIndex": 2,
                    "time": 2796
                },
                {
                    "locationIndex": 0,
                    "time": 2801,
                    "type": "long",
                    "ends": 2816
                },
                {
                    "locationIndex": 1,
                    "time": 2812
                },
                {
                    "locationIndex": 4,
                    "time": 2812
                },
                {
                    "locationIndex": 2,
                    "time": 2822
                },
                {
                    "locationIndex": 5,
                    "time": 2822
                },
                {
                    "locationIndex": 1,
                    "time": 2824
                },
                {
                    "locationIndex": 4,
                    "time": 2825
                },
                {
                    "locationIndex": 3,
                    "time": 2828
                },
                {
                    "locationIndex": 5,
                    "time": 2828
                },
                {
                    "locationIndex": 2,
                    "time": 2828
                },
                {
                    "locationIndex": 1,
                    "time": 2833
                },
                {
                    "locationIndex": 4,
                    "time": 2833
                },
                {
                    "locationIndex": 3,
                    "time": 2852
                },
                {
                    "locationIndex": 0,
                    "time": 2865
                },
                {
                    "locationIndex": 5,
                    "time": 2866
                },
                {
                    "locationIndex": 1,
                    "time": 2866
                },
                {
                    "locationIndex": 2,
                    "time": 2881
                },
                {
                    "locationIndex": 4,
                    "time": 2881
                },
                {
                    "locationIndex": 1,
                    "time": 2881
                },
                {
                    "locationIndex": 5,
                    "time": 2917
                },
                {
                    "locationIndex": 2,
                    "time": 2921
                },
                {
                    "locationIndex": 0,
                    "time": 2921
                },
                {
                    "locationIndex": 5,
                    "time": 2925
                },
                {
                    "locationIndex": 1,
                    "time": 2925
                },
                {
                    "locationIndex": 3,
                    "time": 2930
                },
                {
                    "locationIndex": 0,
                    "time": 2931
                },
                {
                    "locationIndex": 1,
                    "time": 2942
                },
                {
                    "locationIndex": 4,
                    "time": 2942
                },
                {
                    "locationIndex": 0,
                    "time": 2945
                },
                {
                    "locationIndex": 5,
                    "time": 2945
                },
                {
                    "locationIndex": 2,
                    "time": 2950
                },
                {
                    "locationIndex": 5,
                    "time": 2962
                },
                {
                    "locationIndex": 0,
                    "time": 2976
                },
                {
                    "locationIndex": 2,
                    "time": 2977
                },
                {
                    "locationIndex": 3,
                    "time": 2977
                },
                {
                    "locationIndex": 0,
                    "time": 2992
                },
                {
                    "locationIndex": 4,
                    "time": 2993
                },
                {
                    "locationIndex": 0,
                    "time": 2995
                },
                {
                    "locationIndex": 2,
                    "time": 2995
                },
                {
                    "locationIndex": 4,
                    "time": 3009
                },
                {
                    "locationIndex": 2,
                    "time": 3019
                },
                {
                    "locationIndex": 1,
                    "time": 3019
                },
                {
                    "locationIndex": 5,
                    "time": 3025
                },
                {
                    "locationIndex": 1,
                    "time": 3088
                },
                {
                    "locationIndex": 0,
                    "time": 3097
                },
                {
                    "locationIndex": 2,
                    "time": 3139
                },
                {
                    "locationIndex": 1,
                    "time": 3139
                },
                {
                    "locationIndex": 0,
                    "time": 3146
                },
                {
                    "locationIndex": 1,
                    "time": 3286
                },
                {
                    "locationIndex": 4,
                    "time": 3308
                },
                {
                    "locationIndex": 2,
                    "time": 3332
                }
            ]
});

songs.push(song);

song = {};
song.name = '충전할 땐 클래식을';
song.composer = '우아한형제들';
song.noteWriter = 'HJOW';
song.bgaUrl = '';
song.musicUrl = '[RSSC]songs/woowahan/track04.mp3';
song.musicAlterUrl = '';
song.thumbnailUrl = '';
song.canListen = true;
song.useYoutube = false;
song.youtubeVideoId = '';
song.description = `
|Music: 우아한형제들
|  https://www.woowahan.com/music
|License: 
|  https://www.woowahan.com/music/license
`;
song.loadingTime = 10;
song.bpm = 104;
song.endTime = 0;
song.timeConstant = 0;
song.timeMultiplier = 1;
song.noteMultiplier = 1;
song.serial = 'nai4ilahgaGARGag00ij0djfhksakgoiapwegmpowaermgpoami';
song.test = false;
song.onlyRandom = false;
song.difficulties = [];
song.difficulties.push({
    difficultyLabel : 'easy',
    difficultyLevel : 2,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 0,
                    "time": 152
                },
                {
                    "locationIndex": 4,
                    "time": 245
                },
                {
                    "locationIndex": 1,
                    "time": 316
                },
                {
                    "locationIndex": 2,
                    "time": 385
                },
                {
                    "locationIndex": 0,
                    "time": 458
                },
                {
                    "locationIndex": 3,
                    "time": 529
                },
                {
                    "locationIndex": 5,
                    "time": 593
                },
                {
                    "locationIndex": 2,
                    "time": 673
                },
                {
                    "locationIndex": 3,
                    "time": 742
                },
                {
                    "locationIndex": 4,
                    "time": 816
                },
                {
                    "locationIndex": 3,
                    "time": 904
                },
                {
                    "locationIndex": 2,
                    "time": 976
                },
                {
                    "locationIndex": 0,
                    "time": 1041
                },
                {
                    "locationIndex": 1,
                    "time": 1136
                },
                {
                    "locationIndex": 5,
                    "time": 1211
                },
                {
                    "locationIndex": 4,
                    "time": 1211
                },
                {
                    "locationIndex": 0,
                    "time": 1281
                },
                {
                    "locationIndex": 3,
                    "time": 1346
                },
                {
                    "locationIndex": 5,
                    "time": 1424
                },
                {
                    "locationIndex": 0,
                    "time": 1531
                },
                {
                    "locationIndex": 3,
                    "time": 1599
                },
                {
                    "locationIndex": 4,
                    "time": 1684
                },
                {
                    "locationIndex": 1,
                    "time": 1787
                },
                {
                    "locationIndex": 2,
                    "time": 1852
                },
                {
                    "locationIndex": 0,
                    "time": 1923
                },
                {
                    "locationIndex": 4,
                    "time": 2036
                },
                {
                    "locationIndex": 1,
                    "time": 2138
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'normal',
    difficultyLevel : 5,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 0,
                    "time": 152
                },
                {
                    "locationIndex": 3,
                    "time": 209
                },
                {
                    "locationIndex": 0,
                    "time": 275
                },
                {
                    "locationIndex": 4,
                    "time": 275
                },
                {
                    "locationIndex": 3,
                    "time": 295
                },
                {
                    "locationIndex": 4,
                    "time": 385
                },
                {
                    "locationIndex": 2,
                    "time": 407
                },
                {
                    "locationIndex": 4,
                    "time": 458
                },
                {
                    "locationIndex": 3,
                    "time": 480
                },
                {
                    "locationIndex": 1,
                    "time": 480
                },
                {
                    "locationIndex": 5,
                    "time": 509
                },
                {
                    "locationIndex": 0,
                    "time": 529
                },
                {
                    "locationIndex": 1,
                    "time": 592
                },
                {
                    "locationIndex": 2,
                    "time": 609
                },
                {
                    "locationIndex": 4,
                    "time": 629
                },
                {
                    "locationIndex": 1,
                    "time": 648
                },
                {
                    "locationIndex": 0,
                    "time": 673
                },
                {
                    "locationIndex": 2,
                    "time": 721
                },
                {
                    "locationIndex": 1,
                    "time": 742
                },
                {
                    "locationIndex": 2,
                    "time": 766
                },
                {
                    "locationIndex": 5,
                    "time": 817
                },
                {
                    "locationIndex": 4,
                    "time": 840
                },
                {
                    "locationIndex": 5,
                    "time": 904
                },
                {
                    "locationIndex": 4,
                    "time": 953
                },
                {
                    "locationIndex": 0,
                    "time": 976
                },
                {
                    "locationIndex": 3,
                    "time": 996
                },
                {
                    "locationIndex": 5,
                    "time": 996
                },
                {
                    "locationIndex": 1,
                    "time": 1018
                },
                {
                    "locationIndex": 3,
                    "time": 1041
                },
                {
                    "locationIndex": 2,
                    "time": 1062
                },
                {
                    "locationIndex": 1,
                    "time": 1096
                },
                {
                    "locationIndex": 2,
                    "time": 1112
                },
                {
                    "locationIndex": 0,
                    "time": 1136
                },
                {
                    "locationIndex": 4,
                    "time": 1169
                },
                {
                    "locationIndex": 2,
                    "time": 1185
                },
                {
                    "locationIndex": 4,
                    "time": 1211
                },
                {
                    "locationIndex": 0,
                    "time": 1211
                },
                {
                    "locationIndex": 3,
                    "time": 1231
                },
                {
                    "locationIndex": 1,
                    "time": 1249
                },
                {
                    "locationIndex": 5,
                    "time": 1265,
                    "type": "long",
                    "ends": 1280
                },
                {
                    "locationIndex": 1,
                    "time": 1281
                },
                {
                    "locationIndex": 4,
                    "time": 1281
                },
                {
                    "locationIndex": 2,
                    "time": 1302
                },
                {
                    "locationIndex": 1,
                    "time": 1321
                },
                {
                    "locationIndex": 0,
                    "time": 1344
                },
                {
                    "locationIndex": 2,
                    "time": 1370
                },
                {
                    "locationIndex": 1,
                    "time": 1393
                },
                {
                    "locationIndex": 0,
                    "time": 1424
                },
                {
                    "locationIndex": 1,
                    "time": 1442
                },
                {
                    "locationIndex": 2,
                    "time": 1442
                },
                {
                    "locationIndex": 4,
                    "time": 1531
                },
                {
                    "locationIndex": 0,
                    "time": 1588
                },
                {
                    "locationIndex": 1,
                    "time": 1604
                },
                {
                    "locationIndex": 3,
                    "time": 1636,
                    "type": "long",
                    "ends": 1651
                },
                {
                    "locationIndex": 0,
                    "time": 1714
                },
                {
                    "locationIndex": 2,
                    "time": 1732
                },
                {
                    "locationIndex": 0,
                    "time": 1787
                },
                {
                    "locationIndex": 1,
                    "time": 1803
                },
                {
                    "locationIndex": 3,
                    "time": 1821
                },
                {
                    "locationIndex": 1,
                    "time": 1844
                },
                {
                    "locationIndex": 4,
                    "time": 1860
                },
                {
                    "locationIndex": 0,
                    "time": 1892
                },
                {
                    "locationIndex": 1,
                    "time": 1908
                },
                {
                    "locationIndex": 5,
                    "time": 1908
                },
                {
                    "locationIndex": 0,
                    "time": 1940
                },
                {
                    "locationIndex": 5,
                    "time": 1972
                },
                {
                    "locationIndex": 1,
                    "time": 1992
                },
                {
                    "locationIndex": 5,
                    "time": 2042
                },
                {
                    "locationIndex": 4,
                    "time": 2064
                },
                {
                    "locationIndex": 1,
                    "time": 2106
                },
                {
                    "locationIndex": 4,
                    "time": 2137
                }
            ]
});

songs.push(song);

song = {};
song.name = '미래도시라솔파';
song.composer = '우아한형제들';
song.noteWriter = 'HJOW';
song.bgaUrl = '';
song.musicUrl = '[RSSC]songs/woowahan/track06.mp3';
song.musicAlterUrl = '';
song.thumbnailUrl = '';
song.canListen = true;
song.useYoutube = false;
song.youtubeVideoId = '';
song.description = `
|Music: 우아한형제들
|  https://www.woowahan.com/music
|License: 
|  https://www.woowahan.com/music/license
`;
song.loadingTime = 10;
song.bpm = 60;
song.endTime = 0;
song.timeConstant = 0;
song.timeMultiplier = 1;
song.noteMultiplier = 1;
song.serial = 'nai4ilagneagnorienoinm34ongAGRAEG48nfg90g04GGHansklvamslkv';
song.test = false;
song.onlyRandom = false;
song.difficulties = [];
song.difficulties.push({
    difficultyLabel : 'easy',
    difficultyLevel : 1,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 1,
                    "time": 148
                },
                {
                    "locationIndex": 4,
                    "time": 200
                },
                {
                    "locationIndex": 2,
                    "time": 254
                },
                {
                    "locationIndex": 5,
                    "time": 294
                },
                {
                    "locationIndex": 3,
                    "time": 336
                },
                {
                    "locationIndex": 1,
                    "time": 336
                },
                {
                    "locationIndex": 0,
                    "time": 368
                },
                {
                    "locationIndex": 2,
                    "time": 400
                },
                {
                    "locationIndex": 3,
                    "time": 437
                },
                {
                    "locationIndex": 4,
                    "time": 472
                },
                {
                    "locationIndex": 1,
                    "time": 507
                },
                {
                    "locationIndex": 0,
                    "time": 547
                },
                {
                    "locationIndex": 4,
                    "time": 581
                },
                {
                    "locationIndex": 0,
                    "time": 621
                },
                {
                    "locationIndex": 4,
                    "time": 653
                },
                {
                    "locationIndex": 5,
                    "time": 685
                },
                {
                    "locationIndex": 4,
                    "time": 718
                },
                {
                    "locationIndex": 5,
                    "time": 755
                },
                {
                    "locationIndex": 2,
                    "time": 787
                },
                {
                    "locationIndex": 5,
                    "time": 819
                },
                {
                    "locationIndex": 2,
                    "time": 853
                },
                {
                    "locationIndex": 5,
                    "time": 885
                },
                {
                    "locationIndex": 1,
                    "time": 917
                },
                {
                    "locationIndex": 2,
                    "time": 917
                },
                {
                    "locationIndex": 4,
                    "time": 952
                },
                {
                    "locationIndex": 2,
                    "time": 987
                },
                {
                    "locationIndex": 0,
                    "time": 987
                },
                {
                    "locationIndex": 4,
                    "time": 1021
                },
                {
                    "locationIndex": 1,
                    "time": 1053
                },
                {
                    "locationIndex": 2,
                    "time": 1085
                },
                {
                    "locationIndex": 4,
                    "time": 1118
                },
                {
                    "locationIndex": 2,
                    "time": 1150
                },
                {
                    "locationIndex": 1,
                    "time": 1189
                },
                {
                    "locationIndex": 2,
                    "time": 1222
                },
                {
                    "locationIndex": 3,
                    "time": 1262
                },
                {
                    "locationIndex": 5,
                    "time": 1299
                },
                {
                    "locationIndex": 1,
                    "time": 1336
                },
                {
                    "locationIndex": 2,
                    "time": 1368
                },
                {
                    "locationIndex": 5,
                    "time": 1400
                },
                {
                    "locationIndex": 3,
                    "time": 1432
                },
                {
                    "locationIndex": 0,
                    "time": 1464
                },
                {
                    "locationIndex": 1,
                    "time": 1497
                },
                {
                    "locationIndex": 0,
                    "time": 1529
                },
                {
                    "locationIndex": 1,
                    "time": 1565
                },
                {
                    "locationIndex": 5,
                    "time": 1597
                },
                {
                    "locationIndex": 0,
                    "time": 1630
                },
                {
                    "locationIndex": 3,
                    "time": 1685
                },
                {
                    "locationIndex": 0,
                    "time": 1752
                },
                {
                    "locationIndex": 2,
                    "time": 1817
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'normal',
    difficultyLevel : 4,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 3,
                    "time": 148
                },
                {
                    "locationIndex": 4,
                    "time": 189
                },
                {
                    "locationIndex": 5,
                    "time": 211
                },
                {
                    "locationIndex": 1,
                    "time": 270
                },
                {
                    "locationIndex": 2,
                    "time": 296
                },
                {
                    "locationIndex": 3,
                    "time": 323
                },
                {
                    "locationIndex": 0,
                    "time": 344
                },
                {
                    "locationIndex": 2,
                    "time": 368
                },
                {
                    "locationIndex": 1,
                    "time": 387
                },
                {
                    "locationIndex": 3,
                    "time": 405
                },
                {
                    "locationIndex": 1,
                    "time": 422
                },
                {
                    "locationIndex": 2,
                    "time": 440
                },
                {
                    "locationIndex": 5,
                    "time": 462
                },
                {
                    "locationIndex": 3,
                    "time": 462
                },
                {
                    "locationIndex": 4,
                    "time": 480
                },
                {
                    "locationIndex": 2,
                    "time": 496
                },
                {
                    "locationIndex": 0,
                    "time": 512
                },
                {
                    "locationIndex": 5,
                    "time": 536
                },
                {
                    "locationIndex": 3,
                    "time": 552
                },
                {
                    "locationIndex": 5,
                    "time": 571
                },
                {
                    "locationIndex": 4,
                    "time": 606
                },
                {
                    "locationIndex": 0,
                    "time": 624
                },
                {
                    "locationIndex": 3,
                    "time": 643
                },
                {
                    "locationIndex": 0,
                    "time": 661
                },
                {
                    "locationIndex": 5,
                    "time": 678
                },
                {
                    "locationIndex": 1,
                    "time": 696
                },
                {
                    "locationIndex": 4,
                    "time": 718
                },
                {
                    "locationIndex": 0,
                    "time": 739
                },
                {
                    "locationIndex": 5,
                    "time": 739
                },
                {
                    "locationIndex": 1,
                    "time": 755
                },
                {
                    "locationIndex": 3,
                    "time": 771
                },
                {
                    "locationIndex": 4,
                    "time": 787
                },
                {
                    "locationIndex": 3,
                    "time": 805
                },
                {
                    "locationIndex": 1,
                    "time": 805
                },
                {
                    "locationIndex": 0,
                    "time": 824
                },
                {
                    "locationIndex": 1,
                    "time": 846
                },
                {
                    "locationIndex": 0,
                    "time": 867
                },
                {
                    "locationIndex": 2,
                    "time": 883
                },
                {
                    "locationIndex": 5,
                    "time": 901
                },
                {
                    "locationIndex": 2,
                    "time": 917
                },
                {
                    "locationIndex": 4,
                    "time": 933
                },
                {
                    "locationIndex": 0,
                    "time": 933
                },
                {
                    "locationIndex": 2,
                    "time": 952
                },
                {
                    "locationIndex": 3,
                    "time": 971
                },
                {
                    "locationIndex": 2,
                    "time": 987
                },
                {
                    "locationIndex": 0,
                    "time": 1006
                },
                {
                    "locationIndex": 3,
                    "time": 1030
                },
                {
                    "locationIndex": 5,
                    "time": 1048
                },
                {
                    "locationIndex": 4,
                    "time": 1069
                },
                {
                    "locationIndex": 3,
                    "time": 1085
                },
                {
                    "locationIndex": 2,
                    "time": 1101
                },
                {
                    "locationIndex": 4,
                    "time": 1118
                },
                {
                    "locationIndex": 2,
                    "time": 1134
                },
                {
                    "locationIndex": 1,
                    "time": 1134
                },
                {
                    "locationIndex": 0,
                    "time": 1150
                },
                {
                    "locationIndex": 3,
                    "time": 1168
                },
                {
                    "locationIndex": 1,
                    "time": 1189
                },
                {
                    "locationIndex": 4,
                    "time": 1208
                },
                {
                    "locationIndex": 3,
                    "time": 1227
                },
                {
                    "locationIndex": 5,
                    "time": 1246
                },
                {
                    "locationIndex": 4,
                    "time": 1262
                },
                {
                    "locationIndex": 3,
                    "time": 1286
                },
                {
                    "locationIndex": 1,
                    "time": 1304
                },
                {
                    "locationIndex": 4,
                    "time": 1326
                },
                {
                    "locationIndex": 2,
                    "time": 1326
                },
                {
                    "locationIndex": 1,
                    "time": 1349
                },
                {
                    "locationIndex": 4,
                    "time": 1365
                },
                {
                    "locationIndex": 3,
                    "time": 1381
                },
                {
                    "locationIndex": 4,
                    "time": 1398
                },
                {
                    "locationIndex": 2,
                    "time": 1414
                },
                {
                    "locationIndex": 0,
                    "time": 1432
                },
                {
                    "locationIndex": 3,
                    "time": 1432
                },
                {
                    "locationIndex": 2,
                    "time": 1453
                },
                {
                    "locationIndex": 4,
                    "time": 1469
                },
                {
                    "locationIndex": 5,
                    "time": 1485
                },
                {
                    "locationIndex": 4,
                    "time": 1506
                },
                {
                    "locationIndex": 0,
                    "time": 1523
                },
                {
                    "locationIndex": 5,
                    "time": 1544
                },
                {
                    "locationIndex": 3,
                    "time": 1565
                },
                {
                    "locationIndex": 0,
                    "time": 1589
                },
                {
                    "locationIndex": 1,
                    "time": 1607
                },
                {
                    "locationIndex": 5,
                    "time": 1630
                },
                {
                    "locationIndex": 1,
                    "time": 1646
                },
                {
                    "locationIndex": 0,
                    "time": 1646
                },
                {
                    "locationIndex": 3,
                    "time": 1675
                },
                {
                    "locationIndex": 0,
                    "time": 1691
                },
                {
                    "locationIndex": 3,
                    "time": 1710
                },
                {
                    "locationIndex": 5,
                    "time": 1744
                },
                {
                    "locationIndex": 2,
                    "time": 1744
                },
                {
                    "locationIndex": 1,
                    "time": 1766
                },
                {
                    "locationIndex": 2,
                    "time": 1798
                }
            ]
});

songs.push(song);

song = {};
song.name = '이 초대장은 2010년 최초로 시작되어...';
song.composer = '우아한형제들';
song.noteWriter = 'HJOW';
song.bgaUrl = '';
song.musicUrl = '[RSSC]songs/woowahan/track08.mp3';
song.musicAlterUrl = '';
song.thumbnailUrl = '';
song.canListen = true;
song.useYoutube = false;
song.youtubeVideoId = '';
song.description = `
|Music: 우아한형제들
|  https://www.woowahan.com/music
|License: 
|  https://www.woowahan.com/music/license
`;
song.loadingTime = 10;
song.bpm = 84;
song.endTime = 0;
song.timeConstant = 0;
song.timeMultiplier = 1;
song.noteMultiplier = 1;
song.serial = 'nai4ilaosng34gGERGI#$G#sGM3g8j0esajgg4GAEFGERRGAErgnaeorgnoaerng2';
song.test = false;
song.onlyRandom = false;
song.difficulties = [];
song.difficulties.push({
    difficultyLabel : 'easy',
    difficultyLevel : 3,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 3,
                    "time": 144
                },
                {
                    "locationIndex": 1,
                    "time": 236
                },
                {
                    "locationIndex": 0,
                    "time": 268
                },
                {
                    "locationIndex": 4,
                    "time": 296
                },
                {
                    "locationIndex": 1,
                    "time": 320
                },
                {
                    "locationIndex": 5,
                    "time": 336
                },
                {
                    "locationIndex": 0,
                    "time": 360
                },
                {
                    "locationIndex": 4,
                    "time": 396
                },
                {
                    "locationIndex": 1,
                    "time": 416
                },
                {
                    "locationIndex": 5,
                    "time": 432
                },
                {
                    "locationIndex": 4,
                    "time": 448
                },
                {
                    "locationIndex": 0,
                    "time": 464
                },
                {
                    "locationIndex": 5,
                    "time": 480
                },
                {
                    "locationIndex": 2,
                    "time": 500
                },
                {
                    "locationIndex": 5,
                    "time": 520
                },
                {
                    "locationIndex": 0,
                    "time": 536
                },
                {
                    "locationIndex": 2,
                    "time": 552
                },
                {
                    "locationIndex": 1,
                    "time": 552
                },
                {
                    "locationIndex": 5,
                    "time": 568
                },
                {
                    "locationIndex": 0,
                    "time": 594
                },
                {
                    "locationIndex": 2,
                    "time": 610
                },
                {
                    "locationIndex": 3,
                    "time": 636
                },
                {
                    "locationIndex": 0,
                    "time": 652
                },
                {
                    "locationIndex": 3,
                    "time": 672,
                    "type": "long",
                    "ends": 687
                },
                {
                    "locationIndex": 5,
                    "time": 688
                },
                {
                    "locationIndex": 4,
                    "time": 688
                },
                {
                    "locationIndex": 1,
                    "time": 704
                },
                {
                    "locationIndex": 0,
                    "time": 720
                },
                {
                    "locationIndex": 5,
                    "time": 736
                },
                {
                    "locationIndex": 0,
                    "time": 754
                },
                {
                    "locationIndex": 5,
                    "time": 780
                },
                {
                    "locationIndex": 0,
                    "time": 796
                },
                {
                    "locationIndex": 4,
                    "time": 812
                },
                {
                    "locationIndex": 1,
                    "time": 831
                },
                {
                    "locationIndex": 4,
                    "time": 850
                },
                {
                    "locationIndex": 0,
                    "time": 871
                },
                {
                    "locationIndex": 5,
                    "time": 895
                },
                {
                    "locationIndex": 2,
                    "time": 895
                },
                {
                    "locationIndex": 1,
                    "time": 911
                },
                {
                    "locationIndex": 2,
                    "time": 928
                },
                {
                    "locationIndex": 0,
                    "time": 947
                },
                {
                    "locationIndex": 5,
                    "time": 964
                },
                {
                    "locationIndex": 2,
                    "time": 991
                },
                {
                    "locationIndex": 3,
                    "time": 1011
                },
                {
                    "locationIndex": 1,
                    "time": 1032
                },
                {
                    "locationIndex": 5,
                    "time": 1032
                },
                {
                    "locationIndex": 0,
                    "time": 1055
                },
                {
                    "locationIndex": 4,
                    "time": 1071
                },
                {
                    "locationIndex": 2,
                    "time": 1087
                },
                {
                    "locationIndex": 3,
                    "time": 1106
                },
                {
                    "locationIndex": 4,
                    "time": 1106
                },
                {
                    "locationIndex": 0,
                    "time": 1122
                },
                {
                    "locationIndex": 1,
                    "time": 1144
                },
                {
                    "locationIndex": 0,
                    "time": 1164
                },
                {
                    "locationIndex": 3,
                    "time": 1164
                },
                {
                    "locationIndex": 1,
                    "time": 1180
                },
                {
                    "locationIndex": 5,
                    "time": 1200
                },
                {
                    "locationIndex": 2,
                    "time": 1216
                },
                {
                    "locationIndex": 5,
                    "time": 1232
                },
                {
                    "locationIndex": 4,
                    "time": 1248
                },
                {
                    "locationIndex": 1,
                    "time": 1248
                },
                {
                    "locationIndex": 0,
                    "time": 1266
                },
                {
                    "locationIndex": 2,
                    "time": 1283
                },
                {
                    "locationIndex": 4,
                    "time": 1308
                },
                {
                    "locationIndex": 5,
                    "time": 1324
                },
                {
                    "locationIndex": 4,
                    "time": 1342
                },
                {
                    "locationIndex": 3,
                    "time": 1360
                },
                {
                    "locationIndex": 5,
                    "time": 1376
                },
                {
                    "locationIndex": 0,
                    "time": 1404
                },
                {
                    "locationIndex": 4,
                    "time": 1420
                },
                {
                    "locationIndex": 2,
                    "time": 1449
                },
                {
                    "locationIndex": 4,
                    "time": 1466
                },
                {
                    "locationIndex": 5,
                    "time": 1486
                },
                {
                    "locationIndex": 0,
                    "time": 1502
                },
                {
                    "locationIndex": 2,
                    "time": 1502
                },
                {
                    "locationIndex": 3,
                    "time": 1524
                },
                {
                    "locationIndex": 5,
                    "time": 1543
                },
                {
                    "locationIndex": 1,
                    "time": 1572
                },
                {
                    "locationIndex": 5,
                    "time": 1592
                },
                {
                    "locationIndex": 3,
                    "time": 1610
                },
                {
                    "locationIndex": 5,
                    "time": 1632
                },
                {
                    "locationIndex": 0,
                    "time": 1660
                },
                {
                    "locationIndex": 3,
                    "time": 1676
                },
                {
                    "locationIndex": 2,
                    "time": 1716
                },
                {
                    "locationIndex": 3,
                    "time": 1732
                },
                {
                    "locationIndex": 5,
                    "time": 1753
                },
                {
                    "locationIndex": 2,
                    "time": 1753
                },
                {
                    "locationIndex": 4,
                    "time": 1780
                },
                {
                    "locationIndex": 5,
                    "time": 1800
                },
                {
                    "locationIndex": 2,
                    "time": 1828
                },
                {
                    "locationIndex": 0,
                    "time": 1844
                },
                {
                    "locationIndex": 2,
                    "time": 1860
                },
                {
                    "locationIndex": 5,
                    "time": 1876
                },
                {
                    "locationIndex": 4,
                    "time": 1892
                },
                {
                    "locationIndex": 3,
                    "time": 1911
                },
                {
                    "locationIndex": 0,
                    "time": 1927
                },
                {
                    "locationIndex": 3,
                    "time": 1947
                },
                {
                    "locationIndex": 0,
                    "time": 1964
                },
                {
                    "locationIndex": 3,
                    "time": 1986
                },
                {
                    "locationIndex": 2,
                    "time": 1986
                },
                {
                    "locationIndex": 0,
                    "time": 2008
                },
                {
                    "locationIndex": 1,
                    "time": 2040
                },
                {
                    "locationIndex": 2,
                    "time": 2040
                },
                {
                    "locationIndex": 5,
                    "time": 2056
                },
                {
                    "locationIndex": 3,
                    "time": 2079
                },
                {
                    "locationIndex": 2,
                    "time": 2095
                },
                {
                    "locationIndex": 5,
                    "time": 2111
                },
                {
                    "locationIndex": 4,
                    "time": 2127
                },
                {
                    "locationIndex": 1,
                    "time": 2146
                },
                {
                    "locationIndex": 5,
                    "time": 2162
                },
                {
                    "locationIndex": 0,
                    "time": 2183
                },
                {
                    "locationIndex": 2,
                    "time": 2199
                },
                {
                    "locationIndex": 4,
                    "time": 2215
                },
                {
                    "locationIndex": 0,
                    "time": 2231
                },
                {
                    "locationIndex": 1,
                    "time": 2247
                },
                {
                    "locationIndex": 2,
                    "time": 2264
                },
                {
                    "locationIndex": 0,
                    "time": 2286
                },
                {
                    "locationIndex": 3,
                    "time": 2305
                },
                {
                    "locationIndex": 2,
                    "time": 2324
                },
                {
                    "locationIndex": 0,
                    "time": 2356
                },
                {
                    "locationIndex": 3,
                    "time": 2356
                },
                {
                    "locationIndex": 2,
                    "time": 2395
                },
                {
                    "locationIndex": 0,
                    "time": 2415
                },
                {
                    "locationIndex": 3,
                    "time": 2431
                },
                {
                    "locationIndex": 2,
                    "time": 2452
                },
                {
                    "locationIndex": 5,
                    "time": 2491
                },
                {
                    "locationIndex": 3,
                    "time": 2509
                },
                {
                    "locationIndex": 0,
                    "time": 2533
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'normal',
    difficultyLevel : 5,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 1,
                    "time": 144
                },
                {
                    "locationIndex": 4,
                    "time": 152
                },
                {
                    "locationIndex": 2,
                    "time": 176
                },
                {
                    "locationIndex": 0,
                    "time": 291
                },
                {
                    "locationIndex": 2,
                    "time": 303
                },
                {
                    "locationIndex": 0,
                    "time": 312
                },
                {
                    "locationIndex": 1,
                    "time": 312
                },
                {
                    "locationIndex": 3,
                    "time": 336
                },
                {
                    "locationIndex": 4,
                    "time": 367
                },
                {
                    "locationIndex": 0,
                    "time": 387
                },
                {
                    "locationIndex": 2,
                    "time": 396
                },
                {
                    "locationIndex": 1,
                    "time": 416
                },
                {
                    "locationIndex": 3,
                    "time": 432
                },
                {
                    "locationIndex": 0,
                    "time": 447
                },
                {
                    "locationIndex": 1,
                    "time": 447
                },
                {
                    "locationIndex": 4,
                    "time": 464
                },
                {
                    "locationIndex": 5,
                    "time": 472
                },
                {
                    "locationIndex": 0,
                    "time": 472
                },
                {
                    "locationIndex": 1,
                    "time": 480
                },
                {
                    "locationIndex": 2,
                    "time": 480
                },
                {
                    "locationIndex": 4,
                    "time": 492
                },
                {
                    "locationIndex": 1,
                    "time": 500
                },
                {
                    "locationIndex": 4,
                    "time": 512
                },
                {
                    "locationIndex": 0,
                    "time": 520
                },
                {
                    "locationIndex": 5,
                    "time": 528
                },
                {
                    "locationIndex": 4,
                    "time": 536
                },
                {
                    "locationIndex": 1,
                    "time": 544
                },
                {
                    "locationIndex": 3,
                    "time": 552
                },
                {
                    "locationIndex": 0,
                    "time": 560
                },
                {
                    "locationIndex": 5,
                    "time": 568,
                    "type": "long",
                    "ends": 583
                },
                {
                    "locationIndex": 3,
                    "time": 576
                },
                {
                    "locationIndex": 1,
                    "time": 594
                },
                {
                    "locationIndex": 2,
                    "time": 610
                },
                {
                    "locationIndex": 0,
                    "time": 623
                },
                {
                    "locationIndex": 2,
                    "time": 636,
                    "type": "long",
                    "ends": 651
                },
                {
                    "locationIndex": 1,
                    "time": 652
                },
                {
                    "locationIndex": 3,
                    "time": 664
                },
                {
                    "locationIndex": 4,
                    "time": 672
                },
                {
                    "locationIndex": 1,
                    "time": 688
                },
                {
                    "locationIndex": 3,
                    "time": 688
                },
                {
                    "locationIndex": 0,
                    "time": 696
                },
                {
                    "locationIndex": 3,
                    "time": 704
                },
                {
                    "locationIndex": 4,
                    "time": 704
                },
                {
                    "locationIndex": 5,
                    "time": 720
                },
                {
                    "locationIndex": 0,
                    "time": 728
                },
                {
                    "locationIndex": 5,
                    "time": 736
                },
                {
                    "locationIndex": 0,
                    "time": 748
                },
                {
                    "locationIndex": 3,
                    "time": 748
                },
                {
                    "locationIndex": 5,
                    "time": 768
                },
                {
                    "locationIndex": 0,
                    "time": 780
                },
                {
                    "locationIndex": 1,
                    "time": 788
                },
                {
                    "locationIndex": 3,
                    "time": 796
                },
                {
                    "locationIndex": 2,
                    "time": 796
                },
                {
                    "locationIndex": 4,
                    "time": 812
                },
                {
                    "locationIndex": 2,
                    "time": 831
                },
                {
                    "locationIndex": 5,
                    "time": 831
                },
                {
                    "locationIndex": 3,
                    "time": 840
                },
                {
                    "locationIndex": 0,
                    "time": 840
                },
                {
                    "locationIndex": 4,
                    "time": 850
                },
                {
                    "locationIndex": 2,
                    "time": 871
                },
                {
                    "locationIndex": 3,
                    "time": 871
                },
                {
                    "locationIndex": 1,
                    "time": 879
                },
                {
                    "locationIndex": 5,
                    "time": 895
                },
                {
                    "locationIndex": 4,
                    "time": 895
                },
                {
                    "locationIndex": 0,
                    "time": 907
                },
                {
                    "locationIndex": 5,
                    "time": 915
                },
                {
                    "locationIndex": 3,
                    "time": 924
                },
                {
                    "locationIndex": 1,
                    "time": 940
                },
                {
                    "locationIndex": 0,
                    "time": 959
                },
                {
                    "locationIndex": 5,
                    "time": 968
                },
                {
                    "locationIndex": 1,
                    "time": 976
                },
                {
                    "locationIndex": 2,
                    "time": 976
                },
                {
                    "locationIndex": 5,
                    "time": 991
                },
                {
                    "locationIndex": 3,
                    "time": 1004
                },
                {
                    "locationIndex": 0,
                    "time": 1016
                },
                {
                    "locationIndex": 3,
                    "time": 1032
                },
                {
                    "locationIndex": 4,
                    "time": 1032
                },
                {
                    "locationIndex": 1,
                    "time": 1040
                },
                {
                    "locationIndex": 0,
                    "time": 1055
                },
                {
                    "locationIndex": 1,
                    "time": 1064
                },
                {
                    "locationIndex": 3,
                    "time": 1079
                },
                {
                    "locationIndex": 0,
                    "time": 1087
                },
                {
                    "locationIndex": 5,
                    "time": 1100
                },
                {
                    "locationIndex": 3,
                    "time": 1100
                },
                {
                    "locationIndex": 2,
                    "time": 1113
                },
                {
                    "locationIndex": 3,
                    "time": 1121
                },
                {
                    "locationIndex": 5,
                    "time": 1144
                },
                {
                    "locationIndex": 2,
                    "time": 1164
                },
                {
                    "locationIndex": 3,
                    "time": 1180
                },
                {
                    "locationIndex": 2,
                    "time": 1200
                },
                {
                    "locationIndex": 0,
                    "time": 1200
                },
                {
                    "locationIndex": 4,
                    "time": 1208
                },
                {
                    "locationIndex": 2,
                    "time": 1216
                },
                {
                    "locationIndex": 0,
                    "time": 1216
                },
                {
                    "locationIndex": 4,
                    "time": 1228
                },
                {
                    "locationIndex": 1,
                    "time": 1247
                },
                {
                    "locationIndex": 0,
                    "time": 1260
                },
                {
                    "locationIndex": 5,
                    "time": 1279
                },
                {
                    "locationIndex": 3,
                    "time": 1292
                },
                {
                    "locationIndex": 4,
                    "time": 1308
                },
                {
                    "locationIndex": 2,
                    "time": 1320
                },
                {
                    "locationIndex": 3,
                    "time": 1334
                },
                {
                    "locationIndex": 4,
                    "time": 1342
                },
                {
                    "locationIndex": 3,
                    "time": 1350
                },
                {
                    "locationIndex": 2,
                    "time": 1350
                },
                {
                    "locationIndex": 5,
                    "time": 1360
                },
                {
                    "locationIndex": 3,
                    "time": 1376
                },
                {
                    "locationIndex": 2,
                    "time": 1388
                },
                {
                    "locationIndex": 3,
                    "time": 1402
                },
                {
                    "locationIndex": 0,
                    "time": 1412
                },
                {
                    "locationIndex": 3,
                    "time": 1420
                },
                {
                    "locationIndex": 4,
                    "time": 1430
                },
                {
                    "locationIndex": 0,
                    "time": 1449
                },
                {
                    "locationIndex": 4,
                    "time": 1461
                },
                {
                    "locationIndex": 3,
                    "time": 1471
                },
                {
                    "locationIndex": 5,
                    "time": 1481
                },
                {
                    "locationIndex": 4,
                    "time": 1481
                },
                {
                    "locationIndex": 2,
                    "time": 1489
                },
                {
                    "locationIndex": 4,
                    "time": 1502
                },
                {
                    "locationIndex": 3,
                    "time": 1512
                },
                {
                    "locationIndex": 1,
                    "time": 1512
                },
                {
                    "locationIndex": 4,
                    "time": 1524
                },
                {
                    "locationIndex": 5,
                    "time": 1535
                },
                {
                    "locationIndex": 2,
                    "time": 1535
                },
                {
                    "locationIndex": 1,
                    "time": 1543
                },
                {
                    "locationIndex": 0,
                    "time": 1558
                },
                {
                    "locationIndex": 3,
                    "time": 1558
                },
                {
                    "locationIndex": 2,
                    "time": 1572
                },
                {
                    "locationIndex": 4,
                    "time": 1580,
                    "type": "long",
                    "ends": 1595
                },
                {
                    "locationIndex": 0,
                    "time": 1592
                },
                {
                    "locationIndex": 3,
                    "time": 1600
                },
                {
                    "locationIndex": 0,
                    "time": 1610
                },
                {
                    "locationIndex": 3,
                    "time": 1632
                },
                {
                    "locationIndex": 1,
                    "time": 1644
                },
                {
                    "locationIndex": 2,
                    "time": 1660,
                    "type": "long",
                    "ends": 1675
                },
                {
                    "locationIndex": 1,
                    "time": 1668
                },
                {
                    "locationIndex": 3,
                    "time": 1668
                },
                {
                    "locationIndex": 0,
                    "time": 1676
                },
                {
                    "locationIndex": 3,
                    "time": 1686
                },
                {
                    "locationIndex": 5,
                    "time": 1716
                },
                {
                    "locationIndex": 1,
                    "time": 1716
                },
                {
                    "locationIndex": 3,
                    "time": 1727
                },
                {
                    "locationIndex": 5,
                    "time": 1747
                },
                {
                    "locationIndex": 3,
                    "time": 1756
                },
                {
                    "locationIndex": 1,
                    "time": 1756
                },
                {
                    "locationIndex": 4,
                    "time": 1764
                },
                {
                    "locationIndex": 5,
                    "time": 1780
                },
                {
                    "locationIndex": 3,
                    "time": 1788
                },
                {
                    "locationIndex": 4,
                    "time": 1800
                },
                {
                    "locationIndex": 5,
                    "time": 1823,
                    "type": "long",
                    "ends": 1838
                },
                {
                    "locationIndex": 2,
                    "time": 1837
                },
                {
                    "locationIndex": 3,
                    "time": 1846
                },
                {
                    "locationIndex": 0,
                    "time": 1855
                },
                {
                    "locationIndex": 2,
                    "time": 1855
                },
                {
                    "locationIndex": 4,
                    "time": 1863
                },
                {
                    "locationIndex": 1,
                    "time": 1876
                },
                {
                    "locationIndex": 4,
                    "time": 1888
                },
                {
                    "locationIndex": 1,
                    "time": 1897
                },
                {
                    "locationIndex": 3,
                    "time": 1911
                },
                {
                    "locationIndex": 2,
                    "time": 1923
                },
                {
                    "locationIndex": 0,
                    "time": 1923
                },
                {
                    "locationIndex": 3,
                    "time": 1931
                },
                {
                    "locationIndex": 1,
                    "time": 1947
                },
                {
                    "locationIndex": 3,
                    "time": 1956
                },
                {
                    "locationIndex": 4,
                    "time": 1964
                },
                {
                    "locationIndex": 0,
                    "time": 1978
                },
                {
                    "locationIndex": 4,
                    "time": 1986
                },
                {
                    "locationIndex": 5,
                    "time": 2008,
                    "type": "long",
                    "ends": 2023
                },
                {
                    "locationIndex": 4,
                    "time": 2040
                },
                {
                    "locationIndex": 0,
                    "time": 2056
                },
                {
                    "locationIndex": 3,
                    "time": 2056
                },
                {
                    "locationIndex": 1,
                    "time": 2066
                },
                {
                    "locationIndex": 3,
                    "time": 2079
                },
                {
                    "locationIndex": 0,
                    "time": 2079
                },
                {
                    "locationIndex": 4,
                    "time": 2090
                },
                {
                    "locationIndex": 1,
                    "time": 2090
                },
                {
                    "locationIndex": 0,
                    "time": 2098
                },
                {
                    "locationIndex": 3,
                    "time": 2111
                },
                {
                    "locationIndex": 0,
                    "time": 2119
                },
                {
                    "locationIndex": 4,
                    "time": 2127
                },
                {
                    "locationIndex": 3,
                    "time": 2135
                },
                {
                    "locationIndex": 0,
                    "time": 2146
                },
                {
                    "locationIndex": 2,
                    "time": 2154,
                    "type": "long",
                    "ends": 2169
                },
                {
                    "locationIndex": 0,
                    "time": 2162
                },
                {
                    "locationIndex": 3,
                    "time": 2171
                },
                {
                    "locationIndex": 4,
                    "time": 2171
                },
                {
                    "locationIndex": 0,
                    "time": 2183
                },
                {
                    "locationIndex": 4,
                    "time": 2191
                },
                {
                    "locationIndex": 1,
                    "time": 2199
                },
                {
                    "locationIndex": 4,
                    "time": 2207
                },
                {
                    "locationIndex": 0,
                    "time": 2207
                },
                {
                    "locationIndex": 1,
                    "time": 2215
                },
                {
                    "locationIndex": 3,
                    "time": 2231
                },
                {
                    "locationIndex": 4,
                    "time": 2239
                },
                {
                    "locationIndex": 3,
                    "time": 2247
                },
                {
                    "locationIndex": 0,
                    "time": 2247
                },
                {
                    "locationIndex": 5,
                    "time": 2264
                },
                {
                    "locationIndex": 4,
                    "time": 2274,
                    "type": "long",
                    "ends": 2289
                },
                {
                    "locationIndex": 5,
                    "time": 2286,
                    "type": "long",
                    "ends": 2301
                },
                {
                    "locationIndex": 0,
                    "time": 2305
                },
                {
                    "locationIndex": 1,
                    "time": 2314
                },
                {
                    "locationIndex": 3,
                    "time": 2314
                },
                {
                    "locationIndex": 0,
                    "time": 2331
                },
                {
                    "locationIndex": 1,
                    "time": 2345
                },
                {
                    "locationIndex": 0,
                    "time": 2356
                },
                {
                    "locationIndex": 1,
                    "time": 2376
                },
                {
                    "locationIndex": 2,
                    "time": 2399,
                    "type": "long",
                    "ends": 2414
                },
                {
                    "locationIndex": 1,
                    "time": 2413
                },
                {
                    "locationIndex": 4,
                    "time": 2427
                },
                {
                    "locationIndex": 0,
                    "time": 2427
                },
                {
                    "locationIndex": 5,
                    "time": 2463
                }
            ]
});

songs.push(song);

song = {};
song.name = '거의 다 왔어요';
song.composer = '우아한형제들';
song.noteWriter = 'HJOW';
song.bgaUrl = '';
song.musicUrl = '[RSSC]songs/woowahan/track09.mp3';
song.musicAlterUrl = '';
song.thumbnailUrl = '';
song.canListen = true;
song.useYoutube = false;
song.youtubeVideoId = '';
song.description = `
|Music: 우아한형제들
|  https://www.woowahan.com/music
|License: 
|  https://www.woowahan.com/music/license
`;
song.loadingTime = 10;
song.bpm = 130;
song.endTime = 0;
song.timeConstant = 0;
song.timeMultiplier = 1;
song.noteMultiplier = 1;
song.serial = 'nai4ilagoisnomnGARA$IMERGM$#g#4g$%ghsdbfadsbmdfak';
song.test = false;
song.onlyRandom = false;
song.difficulties = [];
song.difficulties.push({
    difficultyLabel : 'easy',
    difficultyLevel : 3,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 4,
                    "time": 146
                },
                {
                    "locationIndex": 3,
                    "time": 231
                },
                {
                    "locationIndex": 5,
                    "time": 270
                },
                {
                    "locationIndex": 3,
                    "time": 307
                },
                {
                    "locationIndex": 1,
                    "time": 370
                },
                {
                    "locationIndex": 0,
                    "time": 414
                },
                {
                    "locationIndex": 1,
                    "time": 449
                },
                {
                    "locationIndex": 0,
                    "time": 486
                },
                {
                    "locationIndex": 3,
                    "time": 521
                },
                {
                    "locationIndex": 2,
                    "time": 559
                },
                {
                    "locationIndex": 1,
                    "time": 593
                },
                {
                    "locationIndex": 5,
                    "time": 628
                },
                {
                    "locationIndex": 0,
                    "time": 690
                },
                {
                    "locationIndex": 1,
                    "time": 722
                },
                {
                    "locationIndex": 3,
                    "time": 770
                },
                {
                    "locationIndex": 2,
                    "time": 808
                },
                {
                    "locationIndex": 4,
                    "time": 846
                },
                {
                    "locationIndex": 5,
                    "time": 881
                },
                {
                    "locationIndex": 3,
                    "time": 914
                },
                {
                    "locationIndex": 5,
                    "time": 972
                },
                {
                    "locationIndex": 2,
                    "time": 1042
                },
                {
                    "locationIndex": 0,
                    "time": 1094
                },
                {
                    "locationIndex": 1,
                    "time": 1094
                },
                {
                    "locationIndex": 4,
                    "time": 1127
                },
                {
                    "locationIndex": 3,
                    "time": 1162
                },
                {
                    "locationIndex": 0,
                    "time": 1201
                },
                {
                    "locationIndex": 5,
                    "time": 1233
                },
                {
                    "locationIndex": 1,
                    "time": 1270
                },
                {
                    "locationIndex": 5,
                    "time": 1307
                },
                {
                    "locationIndex": 4,
                    "time": 1342
                },
                {
                    "locationIndex": 3,
                    "time": 1379
                },
                {
                    "locationIndex": 5,
                    "time": 1426
                },
                {
                    "locationIndex": 3,
                    "time": 1458
                },
                {
                    "locationIndex": 0,
                    "time": 1497
                },
                {
                    "locationIndex": 4,
                    "time": 1537
                },
                {
                    "locationIndex": 0,
                    "time": 1580
                },
                {
                    "locationIndex": 3,
                    "time": 1580
                },
                {
                    "locationIndex": 5,
                    "time": 1645
                },
                {
                    "locationIndex": 2,
                    "time": 1713
                },
                {
                    "locationIndex": 0,
                    "time": 1746
                },
                {
                    "locationIndex": 4,
                    "time": 1746
                },
                {
                    "locationIndex": 1,
                    "time": 1795
                },
                {
                    "locationIndex": 2,
                    "time": 1841
                },
                {
                    "locationIndex": 3,
                    "time": 1874
                },
                {
                    "locationIndex": 4,
                    "time": 1906
                },
                {
                    "locationIndex": 1,
                    "time": 1938
                },
                {
                    "locationIndex": 2,
                    "time": 1970
                },
                {
                    "locationIndex": 1,
                    "time": 2002
                },
                {
                    "locationIndex": 5,
                    "time": 2038
                },
                {
                    "locationIndex": 1,
                    "time": 2122
                },
                {
                    "locationIndex": 0,
                    "time": 2157
                },
                {
                    "locationIndex": 1,
                    "time": 2197
                },
                {
                    "locationIndex": 2,
                    "time": 2233
                },
                {
                    "locationIndex": 4,
                    "time": 2279
                },
                {
                    "locationIndex": 5,
                    "time": 2315
                },
                {
                    "locationIndex": 0,
                    "time": 2354
                },
                {
                    "locationIndex": 2,
                    "time": 2388
                },
                {
                    "locationIndex": 0,
                    "time": 2433
                },
                {
                    "locationIndex": 1,
                    "time": 2476
                },
                {
                    "locationIndex": 4,
                    "time": 2476
                },
                {
                    "locationIndex": 3,
                    "time": 2513
                },
                {
                    "locationIndex": 4,
                    "time": 2561
                },
                {
                    "locationIndex": 3,
                    "time": 2626
                },
                {
                    "locationIndex": 2,
                    "time": 2659
                },
                {
                    "locationIndex": 0,
                    "time": 2697
                },
                {
                    "locationIndex": 5,
                    "time": 2740
                },
                {
                    "locationIndex": 4,
                    "time": 2787
                },
                {
                    "locationIndex": 2,
                    "time": 2823
                },
                {
                    "locationIndex": 0,
                    "time": 2862
                },
                {
                    "locationIndex": 2,
                    "time": 2898
                },
                {
                    "locationIndex": 3,
                    "time": 2947
                },
                {
                    "locationIndex": 5,
                    "time": 3002
                },
                {
                    "locationIndex": 0,
                    "time": 3002
                },
                {
                    "locationIndex": 3,
                    "time": 3044
                },
                {
                    "locationIndex": 1,
                    "time": 3084
                },
                {
                    "locationIndex": 0,
                    "time": 3146
                },
                {
                    "locationIndex": 5,
                    "time": 3179
                },
                {
                    "locationIndex": 1,
                    "time": 3217
                },
                {
                    "locationIndex": 4,
                    "time": 3256
                },
                {
                    "locationIndex": 5,
                    "time": 3295
                },
                {
                    "locationIndex": 2,
                    "time": 3327
                },
                {
                    "locationIndex": 1,
                    "time": 3327
                },
                {
                    "locationIndex": 3,
                    "time": 3367
                },
                {
                    "locationIndex": 4,
                    "time": 3427
                },
                {
                    "locationIndex": 5,
                    "time": 3474
                },
                {
                    "locationIndex": 2,
                    "time": 3520
                },
                {
                    "locationIndex": 0,
                    "time": 3560
                },
                {
                    "locationIndex": 1,
                    "time": 3602
                },
                {
                    "locationIndex": 4,
                    "time": 3666
                },
                {
                    "locationIndex": 0,
                    "time": 3724
                },
                {
                    "locationIndex": 1,
                    "time": 3756
                },
                {
                    "locationIndex": 3,
                    "time": 3788
                },
                {
                    "locationIndex": 4,
                    "time": 3825
                },
                {
                    "locationIndex": 2,
                    "time": 3858
                },
                {
                    "locationIndex": 5,
                    "time": 3890
                },
                {
                    "locationIndex": 3,
                    "time": 3922
                },
                {
                    "locationIndex": 2,
                    "time": 3954
                },
                {
                    "locationIndex": 1,
                    "time": 3986
                },
                {
                    "locationIndex": 2,
                    "time": 4050
                },
                {
                    "locationIndex": 4,
                    "time": 4082
                },
                {
                    "locationIndex": 3,
                    "time": 4114
                },
                {
                    "locationIndex": 2,
                    "time": 4167
                },
                {
                    "locationIndex": 1,
                    "time": 4224
                },
                {
                    "locationIndex": 4,
                    "time": 4271
                },
                {
                    "locationIndex": 2,
                    "time": 4306
                },
                {
                    "locationIndex": 0,
                    "time": 4341
                },
                {
                    "locationIndex": 4,
                    "time": 4341
                },
                {
                    "locationIndex": 5,
                    "time": 4373
                },
                {
                    "locationIndex": 3,
                    "time": 4407
                },
                {
                    "locationIndex": 1,
                    "time": 4446
                },
                {
                    "locationIndex": 3,
                    "time": 4490,
                    "type": "long",
                    "ends": 4505
                },
                {
                    "locationIndex": 0,
                    "time": 4524
                },
                {
                    "locationIndex": 5,
                    "time": 4558
                },
                {
                    "locationIndex": 4,
                    "time": 4593
                },
                {
                    "locationIndex": 5,
                    "time": 4626
                },
                {
                    "locationIndex": 4,
                    "time": 4659
                },
                {
                    "locationIndex": 2,
                    "time": 4692
                },
                {
                    "locationIndex": 0,
                    "time": 4748
                },
                {
                    "locationIndex": 5,
                    "time": 4784
                },
                {
                    "locationIndex": 3,
                    "time": 4818
                },
                {
                    "locationIndex": 0,
                    "time": 4818
                },
                {
                    "locationIndex": 5,
                    "time": 4866
                },
                {
                    "locationIndex": 0,
                    "time": 4917
                },
                {
                    "locationIndex": 3,
                    "time": 4963
                },
                {
                    "locationIndex": 1,
                    "time": 5001
                },
                {
                    "locationIndex": 2,
                    "time": 5035
                },
                {
                    "locationIndex": 0,
                    "time": 5071
                },
                {
                    "locationIndex": 3,
                    "time": 5110
                },
                {
                    "locationIndex": 0,
                    "time": 5227
                },
                {
                    "locationIndex": 3,
                    "time": 5271
                },
                {
                    "locationIndex": 0,
                    "time": 5330
                },
                {
                    "locationIndex": 4,
                    "time": 5394
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'normal',
    difficultyLevel : 6,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 4,
                    "time": 146
                },
                {
                    "locationIndex": 5,
                    "time": 231
                },
                {
                    "locationIndex": 3,
                    "time": 231
                },
                {
                    "locationIndex": 1,
                    "time": 258
                },
                {
                    "locationIndex": 3,
                    "time": 274
                },
                {
                    "locationIndex": 4,
                    "time": 307
                },
                {
                    "locationIndex": 0,
                    "time": 307
                },
                {
                    "locationIndex": 2,
                    "time": 333
                },
                {
                    "locationIndex": 0,
                    "time": 366
                },
                {
                    "locationIndex": 2,
                    "time": 398
                },
                {
                    "locationIndex": 3,
                    "time": 414
                },
                {
                    "locationIndex": 4,
                    "time": 432
                },
                {
                    "locationIndex": 0,
                    "time": 449
                },
                {
                    "locationIndex": 4,
                    "time": 465
                },
                {
                    "locationIndex": 2,
                    "time": 465
                },
                {
                    "locationIndex": 0,
                    "time": 486
                },
                {
                    "locationIndex": 2,
                    "time": 510
                },
                {
                    "locationIndex": 4,
                    "time": 530
                },
                {
                    "locationIndex": 3,
                    "time": 530
                },
                {
                    "locationIndex": 0,
                    "time": 559
                },
                {
                    "locationIndex": 3,
                    "time": 581
                },
                {
                    "locationIndex": 4,
                    "time": 603
                },
                {
                    "locationIndex": 2,
                    "time": 619
                },
                {
                    "locationIndex": 4,
                    "time": 636
                },
                {
                    "locationIndex": 3,
                    "time": 656
                },
                {
                    "locationIndex": 1,
                    "time": 690
                },
                {
                    "locationIndex": 0,
                    "time": 721
                },
                {
                    "locationIndex": 5,
                    "time": 739
                },
                {
                    "locationIndex": 3,
                    "time": 769
                },
                {
                    "locationIndex": 5,
                    "time": 786
                },
                {
                    "locationIndex": 4,
                    "time": 786
                },
                {
                    "locationIndex": 1,
                    "time": 808
                },
                {
                    "locationIndex": 2,
                    "time": 846
                },
                {
                    "locationIndex": 4,
                    "time": 866,
                    "type": "long",
                    "ends": 881
                },
                {
                    "locationIndex": 1,
                    "time": 892
                },
                {
                    "locationIndex": 0,
                    "time": 910
                },
                {
                    "locationIndex": 1,
                    "time": 939
                },
                {
                    "locationIndex": 2,
                    "time": 939
                },
                {
                    "locationIndex": 0,
                    "time": 972
                },
                {
                    "locationIndex": 3,
                    "time": 1042
                },
                {
                    "locationIndex": 4,
                    "time": 1067
                },
                {
                    "locationIndex": 1,
                    "time": 1067
                },
                {
                    "locationIndex": 5,
                    "time": 1094
                },
                {
                    "locationIndex": 0,
                    "time": 1124
                },
                {
                    "locationIndex": 4,
                    "time": 1148,
                    "type": "long",
                    "ends": 1163
                },
                {
                    "locationIndex": 1,
                    "time": 1187
                },
                {
                    "locationIndex": 3,
                    "time": 1218
                },
                {
                    "locationIndex": 1,
                    "time": 1234
                },
                {
                    "locationIndex": 5,
                    "time": 1250
                },
                {
                    "locationIndex": 3,
                    "time": 1270
                },
                {
                    "locationIndex": 0,
                    "time": 1293
                },
                {
                    "locationIndex": 1,
                    "time": 1314
                },
                {
                    "locationIndex": 5,
                    "time": 1314
                },
                {
                    "locationIndex": 4,
                    "time": 1342
                },
                {
                    "locationIndex": 2,
                    "time": 1368
                },
                {
                    "locationIndex": 3,
                    "time": 1403
                },
                {
                    "locationIndex": 2,
                    "time": 1426
                },
                {
                    "locationIndex": 0,
                    "time": 1426
                },
                {
                    "locationIndex": 1,
                    "time": 1458
                },
                {
                    "locationIndex": 4,
                    "time": 1481,
                    "type": "long",
                    "ends": 1496
                },
                {
                    "locationIndex": 0,
                    "time": 1497
                },
                {
                    "locationIndex": 1,
                    "time": 1522
                },
                {
                    "locationIndex": 5,
                    "time": 1522
                },
                {
                    "locationIndex": 0,
                    "time": 1544
                },
                {
                    "locationIndex": 1,
                    "time": 1580
                },
                {
                    "locationIndex": 3,
                    "time": 1610
                },
                {
                    "locationIndex": 2,
                    "time": 1645
                },
                {
                    "locationIndex": 1,
                    "time": 1713
                },
                {
                    "locationIndex": 2,
                    "time": 1738
                },
                {
                    "locationIndex": 0,
                    "time": 1764
                },
                {
                    "locationIndex": 5,
                    "time": 1787
                },
                {
                    "locationIndex": 4,
                    "time": 1804
                },
                {
                    "locationIndex": 3,
                    "time": 1841
                },
                {
                    "locationIndex": 5,
                    "time": 1867
                },
                {
                    "locationIndex": 3,
                    "time": 1888
                },
                {
                    "locationIndex": 1,
                    "time": 1906
                },
                {
                    "locationIndex": 5,
                    "time": 1927
                },
                {
                    "locationIndex": 2,
                    "time": 1960
                },
                {
                    "locationIndex": 1,
                    "time": 1960
                },
                {
                    "locationIndex": 0,
                    "time": 1985
                },
                {
                    "locationIndex": 1,
                    "time": 2002
                },
                {
                    "locationIndex": 3,
                    "time": 2018
                },
                {
                    "locationIndex": 5,
                    "time": 2038
                },
                {
                    "locationIndex": 3,
                    "time": 2066
                },
                {
                    "locationIndex": 2,
                    "time": 2119
                },
                {
                    "locationIndex": 5,
                    "time": 2147
                },
                {
                    "locationIndex": 2,
                    "time": 2164
                },
                {
                    "locationIndex": 1,
                    "time": 2197
                },
                {
                    "locationIndex": 4,
                    "time": 2197
                },
                {
                    "locationIndex": 5,
                    "time": 2214
                },
                {
                    "locationIndex": 3,
                    "time": 2233
                },
                {
                    "locationIndex": 1,
                    "time": 2258
                },
                {
                    "locationIndex": 5,
                    "time": 2279
                },
                {
                    "locationIndex": 3,
                    "time": 2279
                },
                {
                    "locationIndex": 1,
                    "time": 2306
                },
                {
                    "locationIndex": 4,
                    "time": 2325
                },
                {
                    "locationIndex": 1,
                    "time": 2344
                },
                {
                    "locationIndex": 3,
                    "time": 2344
                },
                {
                    "locationIndex": 0,
                    "time": 2365
                },
                {
                    "locationIndex": 3,
                    "time": 2383
                },
                {
                    "locationIndex": 2,
                    "time": 2402
                },
                {
                    "locationIndex": 5,
                    "time": 2433
                },
                {
                    "locationIndex": 1,
                    "time": 2450
                },
                {
                    "locationIndex": 3,
                    "time": 2476
                },
                {
                    "locationIndex": 4,
                    "time": 2476
                },
                {
                    "locationIndex": 1,
                    "time": 2497
                },
                {
                    "locationIndex": 3,
                    "time": 2513
                },
                {
                    "locationIndex": 2,
                    "time": 2529
                },
                {
                    "locationIndex": 0,
                    "time": 2529
                },
                {
                    "locationIndex": 1,
                    "time": 2561
                },
                {
                    "locationIndex": 4,
                    "time": 2578
                },
                {
                    "locationIndex": 1,
                    "time": 2626
                },
                {
                    "locationIndex": 0,
                    "time": 2654
                },
                {
                    "locationIndex": 2,
                    "time": 2676
                },
                {
                    "locationIndex": 3,
                    "time": 2697
                },
                {
                    "locationIndex": 0,
                    "time": 2717
                },
                {
                    "locationIndex": 4,
                    "time": 2740
                },
                {
                    "locationIndex": 2,
                    "time": 2769
                },
                {
                    "locationIndex": 5,
                    "time": 2787
                },
                {
                    "locationIndex": 3,
                    "time": 2807
                },
                {
                    "locationIndex": 4,
                    "time": 2823
                },
                {
                    "locationIndex": 2,
                    "time": 2823
                },
                {
                    "locationIndex": 5,
                    "time": 2849
                },
                {
                    "locationIndex": 3,
                    "time": 2880
                },
                {
                    "locationIndex": 4,
                    "time": 2880
                },
                {
                    "locationIndex": 0,
                    "time": 2898
                },
                {
                    "locationIndex": 5,
                    "time": 2915
                },
                {
                    "locationIndex": 4,
                    "time": 2944
                },
                {
                    "locationIndex": 1,
                    "time": 2962
                },
                {
                    "locationIndex": 0,
                    "time": 3002
                },
                {
                    "locationIndex": 1,
                    "time": 3018
                },
                {
                    "locationIndex": 3,
                    "time": 3044
                },
                {
                    "locationIndex": 4,
                    "time": 3062
                },
                {
                    "locationIndex": 0,
                    "time": 3062
                },
                {
                    "locationIndex": 3,
                    "time": 3084
                },
                {
                    "locationIndex": 0,
                    "time": 3146
                },
                {
                    "locationIndex": 5,
                    "time": 3169
                },
                {
                    "locationIndex": 3,
                    "time": 3185
                },
                {
                    "locationIndex": 4,
                    "time": 3185
                },
                {
                    "locationIndex": 5,
                    "time": 3217
                },
                {
                    "locationIndex": 3,
                    "time": 3256
                },
                {
                    "locationIndex": 0,
                    "time": 3282
                },
                {
                    "locationIndex": 5,
                    "time": 3310
                },
                {
                    "locationIndex": 0,
                    "time": 3327
                },
                {
                    "locationIndex": 4,
                    "time": 3327
                },
                {
                    "locationIndex": 1,
                    "time": 3343
                },
                {
                    "locationIndex": 5,
                    "time": 3367
                },
                {
                    "locationIndex": 2,
                    "time": 3388,
                    "type": "long",
                    "ends": 3403
                },
                {
                    "locationIndex": 4,
                    "time": 3427
                },
                {
                    "locationIndex": 5,
                    "time": 3451
                },
                {
                    "locationIndex": 1,
                    "time": 3451
                },
                {
                    "locationIndex": 0,
                    "time": 3474
                },
                {
                    "locationIndex": 4,
                    "time": 3505,
                    "type": "long",
                    "ends": 3520
                },
                {
                    "locationIndex": 5,
                    "time": 3521
                },
                {
                    "locationIndex": 1,
                    "time": 3521
                },
                {
                    "locationIndex": 2,
                    "time": 3537
                },
                {
                    "locationIndex": 1,
                    "time": 3560
                },
                {
                    "locationIndex": 5,
                    "time": 3581,
                    "type": "long",
                    "ends": 3596
                },
                {
                    "locationIndex": 0,
                    "time": 3602
                },
                {
                    "locationIndex": 1,
                    "time": 3666
                },
                {
                    "locationIndex": 2,
                    "time": 3682
                },
                {
                    "locationIndex": 0,
                    "time": 3724
                },
                {
                    "locationIndex": 5,
                    "time": 3751
                },
                {
                    "locationIndex": 4,
                    "time": 3751
                },
                {
                    "locationIndex": 1,
                    "time": 3783
                },
                {
                    "locationIndex": 2,
                    "time": 3801
                },
                {
                    "locationIndex": 1,
                    "time": 3825
                },
                {
                    "locationIndex": 5,
                    "time": 3842
                },
                {
                    "locationIndex": 3,
                    "time": 3858
                },
                {
                    "locationIndex": 4,
                    "time": 3885
                },
                {
                    "locationIndex": 2,
                    "time": 3885
                },
                {
                    "locationIndex": 1,
                    "time": 3901
                },
                {
                    "locationIndex": 5,
                    "time": 3918
                },
                {
                    "locationIndex": 1,
                    "time": 3934
                },
                {
                    "locationIndex": 0,
                    "time": 3954
                },
                {
                    "locationIndex": 3,
                    "time": 3971
                },
                {
                    "locationIndex": 1,
                    "time": 4009,
                    "type": "long",
                    "ends": 4024
                },
                {
                    "locationIndex": 0,
                    "time": 4050
                },
                {
                    "locationIndex": 2,
                    "time": 4082
                },
                {
                    "locationIndex": 3,
                    "time": 4082
                },
                {
                    "locationIndex": 4,
                    "time": 4106
                },
                {
                    "locationIndex": 3,
                    "time": 4132
                },
                {
                    "locationIndex": 5,
                    "time": 4167
                },
                {
                    "locationIndex": 4,
                    "time": 4167
                },
                {
                    "locationIndex": 2,
                    "time": 4224
                },
                {
                    "locationIndex": 4,
                    "time": 4243
                },
                {
                    "locationIndex": 0,
                    "time": 4243
                },
                {
                    "locationIndex": 2,
                    "time": 4271
                },
                {
                    "locationIndex": 0,
                    "time": 4287
                },
                {
                    "locationIndex": 3,
                    "time": 4306
                },
                {
                    "locationIndex": 2,
                    "time": 4323
                },
                {
                    "locationIndex": 4,
                    "time": 4341
                },
                {
                    "locationIndex": 2,
                    "time": 4370
                },
                {
                    "locationIndex": 0,
                    "time": 4370
                },
                {
                    "locationIndex": 5,
                    "time": 4394
                },
                {
                    "locationIndex": 0,
                    "time": 4420
                },
                {
                    "locationIndex": 1,
                    "time": 4446
                },
                {
                    "locationIndex": 2,
                    "time": 4474
                },
                {
                    "locationIndex": 5,
                    "time": 4490
                },
                {
                    "locationIndex": 4,
                    "time": 4508
                },
                {
                    "locationIndex": 1,
                    "time": 4524
                },
                {
                    "locationIndex": 5,
                    "time": 4545
                },
                {
                    "locationIndex": 1,
                    "time": 4561
                },
                {
                    "locationIndex": 4,
                    "time": 4561
                },
                {
                    "locationIndex": 2,
                    "time": 4593
                },
                {
                    "locationIndex": 0,
                    "time": 4609
                },
                {
                    "locationIndex": 1,
                    "time": 4626
                },
                {
                    "locationIndex": 2,
                    "time": 4626
                },
                {
                    "locationIndex": 3,
                    "time": 4645
                },
                {
                    "locationIndex": 5,
                    "time": 4664
                },
                {
                    "locationIndex": 4,
                    "time": 4682
                },
                {
                    "locationIndex": 3,
                    "time": 4702
                },
                {
                    "locationIndex": 5,
                    "time": 4721
                },
                {
                    "locationIndex": 3,
                    "time": 4766
                },
                {
                    "locationIndex": 1,
                    "time": 4784
                },
                {
                    "locationIndex": 0,
                    "time": 4784
                },
                {
                    "locationIndex": 3,
                    "time": 4812,
                    "type": "long",
                    "ends": 4827
                },
                {
                    "locationIndex": 5,
                    "time": 4835
                },
                {
                    "locationIndex": 2,
                    "time": 4866,
                    "type": "long",
                    "ends": 4881
                },
                {
                    "locationIndex": 1,
                    "time": 4882
                },
                {
                    "locationIndex": 4,
                    "time": 4917
                },
                {
                    "locationIndex": 1,
                    "time": 4946
                },
                {
                    "locationIndex": 4,
                    "time": 4963
                },
                {
                    "locationIndex": 1,
                    "time": 4982
                },
                {
                    "locationIndex": 4,
                    "time": 5001
                },
                {
                    "locationIndex": 1,
                    "time": 5035
                },
                {
                    "locationIndex": 0,
                    "time": 5056
                },
                {
                    "locationIndex": 4,
                    "time": 5056
                },
                {
                    "locationIndex": 3,
                    "time": 5074
                },
                {
                    "locationIndex": 5,
                    "time": 5090
                },
                {
                    "locationIndex": 3,
                    "time": 5138
                },
                {
                    "locationIndex": 1,
                    "time": 5227
                },
                {
                    "locationIndex": 2,
                    "time": 5271
                },
                {
                    "locationIndex": 0,
                    "time": 5313
                },
                {
                    "locationIndex": 2,
                    "time": 5330
                },
                {
                    "locationIndex": 4,
                    "time": 5386
                },
                {
                    "locationIndex": 2,
                    "time": 5425
                }
            ]
});
song.difficulties.push({
    difficultyLabel : 'hard',
    difficultyLevel : 10,
    autoCreate : false,
    patterns : [
                {
                    "locationIndex": 1,
                    "time": 146
                },
                {
                    "locationIndex": 4,
                    "time": 338
                },
                {
                    "locationIndex": 0,
                    "time": 366
                },
                {
                    "locationIndex": 1,
                    "time": 370
                },
                {
                    "locationIndex": 4,
                    "time": 376
                },
                {
                    "locationIndex": 0,
                    "time": 376
                },
                {
                    "locationIndex": 1,
                    "time": 402
                },
                {
                    "locationIndex": 3,
                    "time": 402
                },
                {
                    "locationIndex": 0,
                    "time": 414
                },
                {
                    "locationIndex": 2,
                    "time": 431
                },
                {
                    "locationIndex": 0,
                    "time": 435,
                    "type": "long",
                    "ends": 450
                },
                {
                    "locationIndex": 4,
                    "time": 449
                },
                {
                    "locationIndex": 2,
                    "time": 449
                },
                {
                    "locationIndex": 5,
                    "time": 449
                },
                {
                    "locationIndex": 3,
                    "time": 453
                },
                {
                    "locationIndex": 1,
                    "time": 453
                },
                {
                    "locationIndex": 5,
                    "time": 457
                },
                {
                    "locationIndex": 1,
                    "time": 461
                },
                {
                    "locationIndex": 3,
                    "time": 461
                },
                {
                    "locationIndex": 4,
                    "time": 465
                },
                {
                    "locationIndex": 5,
                    "time": 477
                },
                {
                    "locationIndex": 3,
                    "time": 477
                },
                {
                    "locationIndex": 4,
                    "time": 486
                },
                {
                    "locationIndex": 5,
                    "time": 490
                },
                {
                    "locationIndex": 2,
                    "time": 490
                },
                {
                    "locationIndex": 4,
                    "time": 510
                },
                {
                    "locationIndex": 1,
                    "time": 510
                },
                {
                    "locationIndex": 2,
                    "time": 514,
                    "type": "long",
                    "ends": 529
                },
                {
                    "locationIndex": 1,
                    "time": 521
                },
                {
                    "locationIndex": 0,
                    "time": 521
                },
                {
                    "locationIndex": 3,
                    "time": 530
                },
                {
                    "locationIndex": 4,
                    "time": 540
                },
                {
                    "locationIndex": 5,
                    "time": 540
                },
                {
                    "locationIndex": 1,
                    "time": 559,
                    "type": "long",
                    "ends": 574
                },
                {
                    "locationIndex": 4,
                    "time": 564
                },
                {
                    "locationIndex": 2,
                    "time": 564
                },
                {
                    "locationIndex": 5,
                    "time": 571
                },
                {
                    "locationIndex": 3,
                    "time": 571
                },
                {
                    "locationIndex": 0,
                    "time": 581
                },
                {
                    "locationIndex": 2,
                    "time": 593
                },
                {
                    "locationIndex": 4,
                    "time": 593
                },
                {
                    "locationIndex": 0,
                    "time": 603,
                    "type": "long",
                    "ends": 618
                },
                {
                    "locationIndex": 1,
                    "time": 614
                },
                {
                    "locationIndex": 3,
                    "time": 614
                },
                {
                    "locationIndex": 2,
                    "time": 619
                },
                {
                    "locationIndex": 5,
                    "time": 619
                },
                {
                    "locationIndex": 4,
                    "time": 628
                },
                {
                    "locationIndex": 3,
                    "time": 628
                },
                {
                    "locationIndex": 2,
                    "time": 636
                },
                {
                    "locationIndex": 5,
                    "time": 650
                },
                {
                    "locationIndex": 4,
                    "time": 650
                },
                {
                    "locationIndex": 3,
                    "time": 656
                },
                {
                    "locationIndex": 0,
                    "time": 656
                },
                {
                    "locationIndex": 5,
                    "time": 690
                },
                {
                    "locationIndex": 1,
                    "time": 721
                },
                {
                    "locationIndex": 5,
                    "time": 739
                },
                {
                    "locationIndex": 0,
                    "time": 747
                },
                {
                    "locationIndex": 1,
                    "time": 747
                },
                {
                    "locationIndex": 5,
                    "time": 769
                },
                {
                    "locationIndex": 4,
                    "time": 786
                },
                {
                    "locationIndex": 3,
                    "time": 786
                },
                {
                    "locationIndex": 5,
                    "time": 808
                },
                {
                    "locationIndex": 1,
                    "time": 808
                },
                {
                    "locationIndex": 0,
                    "time": 846
                },
                {
                    "locationIndex": 3,
                    "time": 846
                },
                {
                    "locationIndex": 5,
                    "time": 850
                },
                {
                    "locationIndex": 4,
                    "time": 850
                },
                {
                    "locationIndex": 2,
                    "time": 866
                },
                {
                    "locationIndex": 0,
                    "time": 871
                },
                {
                    "locationIndex": 4,
                    "time": 881
                },
                {
                    "locationIndex": 1,
                    "time": 881
                },
                {
                    "locationIndex": 2,
                    "time": 881
                },
                {
                    "locationIndex": 3,
                    "time": 891
                },
                {
                    "locationIndex": 4,
                    "time": 898,
                    "type": "long",
                    "ends": 913
                },
                {
                    "locationIndex": 5,
                    "time": 910
                },
                {
                    "locationIndex": 2,
                    "time": 910
                },
                {
                    "locationIndex": 0,
                    "time": 914
                },
                {
                    "locationIndex": 1,
                    "time": 914
                },
                {
                    "locationIndex": 2,
                    "time": 924
                },
                {
                    "locationIndex": 1,
                    "time": 939
                },
                {
                    "locationIndex": 5,
                    "time": 939
                },
                {
                    "locationIndex": 0,
                    "time": 972
                },
                {
                    "locationIndex": 1,
                    "time": 976
                },
                {
                    "locationIndex": 2,
                    "time": 976
                },
                {
                    "locationIndex": 3,
                    "time": 994
                },
                {
                    "locationIndex": 5,
                    "time": 1042,
                    "type": "long",
                    "ends": 1057
                },
                {
                    "locationIndex": 0,
                    "time": 1042,
                    "type": "long",
                    "ends": 1057
                },
                {
                    "locationIndex": 4,
                    "time": 1067
                },
                {
                    "locationIndex": 1,
                    "time": 1071
                },
                {
                    "locationIndex": 2,
                    "time": 1071
                },
                {
                    "locationIndex": 3,
                    "time": 1094,
                    "type": "long",
                    "ends": 1109
                },
                {
                    "locationIndex": 5,
                    "time": 1103
                },
                {
                    "locationIndex": 1,
                    "time": 1103
                },
                {
                    "locationIndex": 4,
                    "time": 1109
                },
                {
                    "locationIndex": 0,
                    "time": 1109
                },
                {
                    "locationIndex": 5,
                    "time": 1114
                },
                {
                    "locationIndex": 0,
                    "time": 1124
                },
                {
                    "locationIndex": 5,
                    "time": 1128
                },
                {
                    "locationIndex": 4,
                    "time": 1128
                },
                {
                    "locationIndex": 1,
                    "time": 1148
                },
                {
                    "locationIndex": 0,
                    "time": 1162
                },
                {
                    "locationIndex": 5,
                    "time": 1162
                },
                {
                    "locationIndex": 4,
                    "time": 1187
                },
                {
                    "locationIndex": 1,
                    "time": 1201
                },
                {
                    "locationIndex": 2,
                    "time": 1201
                },
                {
                    "locationIndex": 0,
                    "time": 1218
                },
                {
                    "locationIndex": 5,
                    "time": 1218
                },
                {
                    "locationIndex": 3,
                    "time": 1232
                },
                {
                    "locationIndex": 5,
                    "time": 1240
                },
                {
                    "locationIndex": 0,
                    "time": 1240
                },
                {
                    "locationIndex": 3,
                    "time": 1245
                },
                {
                    "locationIndex": 4,
                    "time": 1259
                },
                {
                    "locationIndex": 5,
                    "time": 1270
                },
                {
                    "locationIndex": 1,
                    "time": 1275
                },
                {
                    "locationIndex": 0,
                    "time": 1275
                },
                {
                    "locationIndex": 3,
                    "time": 1282
                },
                {
                    "locationIndex": 1,
                    "time": 1293
                },
                {
                    "locationIndex": 4,
                    "time": 1293
                },
                {
                    "locationIndex": 2,
                    "time": 1298
                },
                {
                    "locationIndex": 4,
                    "time": 1307
                },
                {
                    "locationIndex": 3,
                    "time": 1307
                },
                {
                    "locationIndex": 0,
                    "time": 1314,
                    "type": "long",
                    "ends": 1329
                },
                {
                    "locationIndex": 1,
                    "time": 1314,
                    "type": "long",
                    "ends": 1329
                },
                {
                    "locationIndex": 4,
                    "time": 1342
                },
                {
                    "locationIndex": 2,
                    "time": 1368
                },
                {
                    "locationIndex": 5,
                    "time": 1368
                },
                {
                    "locationIndex": 4,
                    "time": 1379
                },
                {
                    "locationIndex": 3,
                    "time": 1379
                },
                {
                    "locationIndex": 2,
                    "time": 1403
                },
                {
                    "locationIndex": 4,
                    "time": 1407
                },
                {
                    "locationIndex": 5,
                    "time": 1407
                },
                {
                    "locationIndex": 3,
                    "time": 1426
                },
                {
                    "locationIndex": 1,
                    "time": 1431
                },
                {
                    "locationIndex": 2,
                    "time": 1431
                },
                {
                    "locationIndex": 0,
                    "time": 1431
                },
                {
                    "locationIndex": 3,
                    "time": 1458
                },
                {
                    "locationIndex": 1,
                    "time": 1473
                },
                {
                    "locationIndex": 5,
                    "time": 1473
                },
                {
                    "locationIndex": 2,
                    "time": 1481
                },
                {
                    "locationIndex": 4,
                    "time": 1481
                },
                {
                    "locationIndex": 1,
                    "time": 1486,
                    "type": "long",
                    "ends": 1501
                },
                {
                    "locationIndex": 4,
                    "time": 1497
                },
                {
                    "locationIndex": 2,
                    "time": 1497
                },
                {
                    "locationIndex": 0,
                    "time": 1501
                },
                {
                    "locationIndex": 5,
                    "time": 1505
                },
                {
                    "locationIndex": 4,
                    "time": 1505
                },
                {
                    "locationIndex": 0,
                    "time": 1511
                },
                {
                    "locationIndex": 3,
                    "time": 1522
                },
                {
                    "locationIndex": 2,
                    "time": 1522
                },
                {
                    "locationIndex": 5,
                    "time": 1526
                },
                {
                    "locationIndex": 1,
                    "time": 1526
                },
                {
                    "locationIndex": 3,
                    "time": 1537
                },
                {
                    "locationIndex": 2,
                    "time": 1544
                },
                {
                    "locationIndex": 0,
                    "time": 1548,
                    "type": "long",
                    "ends": 1563
                },
                {
                    "locationIndex": 1,
                    "time": 1548,
                    "type": "long",
                    "ends": 1563
                },
                {
                    "locationIndex": 2,
                    "time": 1552
                },
                {
                    "locationIndex": 5,
                    "time": 1552
                },
                {
                    "locationIndex": 3,
                    "time": 1557
                },
                {
                    "locationIndex": 4,
                    "time": 1580
                },
                {
                    "locationIndex": 5,
                    "time": 1580
                },
                {
                    "locationIndex": 3,
                    "time": 1611
                },
                {
                    "locationIndex": 4,
                    "time": 1630
                },
                {
                    "locationIndex": 5,
                    "time": 1645
                },
                {
                    "locationIndex": 4,
                    "time": 1652
                },
                {
                    "locationIndex": 1,
                    "time": 1652
                },
                {
                    "locationIndex": 5,
                    "time": 1664
                },
                {
                    "locationIndex": 0,
                    "time": 1664
                },
                {
                    "locationIndex": 3,
                    "time": 1713
                },
                {
                    "locationIndex": 0,
                    "time": 1719
                },
                {
                    "locationIndex": 1,
                    "time": 1723
                },
                {
                    "locationIndex": 5,
                    "time": 1728
                },
                {
                    "locationIndex": 4,
                    "time": 1728
                },
                {
                    "locationIndex": 0,
                    "time": 1744
                },
                {
                    "locationIndex": 1,
                    "time": 1763
                },
                {
                    "locationIndex": 2,
                    "time": 1771
                },
                {
                    "locationIndex": 0,
                    "time": 1771
                },
                {
                    "locationIndex": 1,
                    "time": 1776
                },
                {
                    "locationIndex": 3,
                    "time": 1787
                },
                {
                    "locationIndex": 0,
                    "time": 1795
                },
                {
                    "locationIndex": 2,
                    "time": 1802
                },
                {
                    "locationIndex": 5,
                    "time": 1802
                },
                {
                    "locationIndex": 1,
                    "time": 1812
                },
                {
                    "locationIndex": 3,
                    "time": 1812
                },
                {
                    "locationIndex": 0,
                    "time": 1841
                },
                {
                    "locationIndex": 2,
                    "time": 1867
                },
                {
                    "locationIndex": 5,
                    "time": 1867
                },
                {
                    "locationIndex": 3,
                    "time": 1874
                },
                {
                    "locationIndex": 4,
                    "time": 1874
                },
                {
                    "locationIndex": 5,
                    "time": 1888
                },
                {
                    "locationIndex": 3,
                    "time": 1895
                },
                {
                    "locationIndex": 2,
                    "time": 1895
                },
                {
                    "locationIndex": 0,
                    "time": 1903
                },
                {
                    "locationIndex": 5,
                    "time": 1912
                },
                {
                    "locationIndex": 4,
                    "time": 1912
                },
                {
                    "locationIndex": 0,
                    "time": 1918
                },
                {
                    "locationIndex": 4,
                    "time": 1927
                },
                {
                    "locationIndex": 3,
                    "time": 1927
                },
                {
                    "locationIndex": 2,
                    "time": 1927
                },
                {
                    "locationIndex": 5,
                    "time": 1932
                },
                {
                    "locationIndex": 1,
                    "time": 1932
                },
                {
                    "locationIndex": 0,
                    "time": 1937,
                    "type": "long",
                    "ends": 1952
                },
                {
                    "locationIndex": 4,
                    "time": 1937,
                    "type": "long",
                    "ends": 1952
                },
                {
                    "locationIndex": 2,
                    "time": 1960
                },
                {
                    "locationIndex": 3,
                    "time": 1967
                },
                {
                    "locationIndex": 5,
                    "time": 1967
                },
                {
                    "locationIndex": 2,
                    "time": 1983
                },
                {
                    "locationIndex": 0,
                    "time": 1998,
                    "type": "long",
                    "ends": 2013
                },
                {
                    "locationIndex": 2,
                    "time": 2002
                },
                {
                    "locationIndex": 1,
                    "time": 2002
                },
                {
                    "locationIndex": 5,
                    "time": 2002
                },
                {
                    "locationIndex": 3,
                    "time": 2018
                },
                {
                    "locationIndex": 1,
                    "time": 2033
                },
                {
                    "locationIndex": 2,
                    "time": 2033
                },
                {
                    "locationIndex": 0,
                    "time": 2038
                },
                {
                    "locationIndex": 3,
                    "time": 2038
                },
                {
                    "locationIndex": 1,
                    "time": 2066
                },
                {
                    "locationIndex": 3,
                    "time": 2122
                },
                {
                    "locationIndex": 2,
                    "time": 2142
                },
                {
                    "locationIndex": 4,
                    "time": 2147
                },
                {
                    "locationIndex": 5,
                    "time": 2147
                },
                {
                    "locationIndex": 2,
                    "time": 2157
                },
                {
                    "locationIndex": 1,
                    "time": 2164
                },
                {
                    "locationIndex": 3,
                    "time": 2164
                },
                {
                    "locationIndex": 4,
                    "time": 2176
                },
                {
                    "locationIndex": 2,
                    "time": 2176
                },
                {
                    "locationIndex": 1,
                    "time": 2176
                },
                {
                    "locationIndex": 5,
                    "time": 2197
                },
                {
                    "locationIndex": 1,
                    "time": 2204
                },
                {
                    "locationIndex": 4,
                    "time": 2209
                },
                {
                    "locationIndex": 2,
                    "time": 2214
                },
                {
                    "locationIndex": 5,
                    "time": 2214
                },
                {
                    "locationIndex": 3,
                    "time": 2223
                },
                {
                    "locationIndex": 0,
                    "time": 2233
                },
                {
                    "locationIndex": 3,
                    "time": 2258
                },
                {
                    "locationIndex": 4,
                    "time": 2262,
                    "type": "long",
                    "ends": 2277
                },
                {
                    "locationIndex": 5,
                    "time": 2262,
                    "type": "long",
                    "ends": 2277
                },
                {
                    "locationIndex": 2,
                    "time": 2279
                },
                {
                    "locationIndex": 1,
                    "time": 2288
                },
                {
                    "locationIndex": 0,
                    "time": 2306
                },
                {
                    "locationIndex": 3,
                    "time": 2306
                },
                {
                    "locationIndex": 1,
                    "time": 2315
                },
                {
                    "locationIndex": 5,
                    "time": 2315
                },
                {
                    "locationIndex": 3,
                    "time": 2325
                },
                {
                    "locationIndex": 1,
                    "time": 2330
                },
                {
                    "locationIndex": 5,
                    "time": 2330
                },
                {
                    "locationIndex": 0,
                    "time": 2334
                },
                {
                    "locationIndex": 3,
                    "time": 2334
                },
                {
                    "locationIndex": 4,
                    "time": 2344
                },
                {
                    "locationIndex": 1,
                    "time": 2344
                },
                {
                    "locationIndex": 0,
                    "time": 2354,
                    "type": "long",
                    "ends": 2369
                },
                {
                    "locationIndex": 4,
                    "time": 2365
                },
                {
                    "locationIndex": 2,
                    "time": 2365
                },
                {
                    "locationIndex": 1,
                    "time": 2365
                },
                {
                    "locationIndex": 5,
                    "time": 2370
                },
                {
                    "locationIndex": 3,
                    "time": 2370
                },
                {
                    "locationIndex": 4,
                    "time": 2383
                },
                {
                    "locationIndex": 5,
                    "time": 2388
                },
                {
                    "locationIndex": 1,
                    "time": 2388
                },
                {
                    "locationIndex": 3,
                    "time": 2393
                },
                {
                    "locationIndex": 2,
                    "time": 2393
                },
                {
                    "locationIndex": 1,
                    "time": 2397
                },
                {
                    "locationIndex": 2,
                    "time": 2402
                },
                {
                    "locationIndex": 3,
                    "time": 2402
                },
                {
                    "locationIndex": 0,
                    "time": 2410
                },
                {
                    "locationIndex": 5,
                    "time": 2417
                },
                {
                    "locationIndex": 1,
                    "time": 2417
                },
                {
                    "locationIndex": 0,
                    "time": 2433
                },
                {
                    "locationIndex": 1,
                    "time": 2437
                },
                {
                    "locationIndex": 5,
                    "time": 2445
                },
                {
                    "locationIndex": 4,
                    "time": 2445
                },
                {
                    "locationIndex": 0,
                    "time": 2450
                },
                {
                    "locationIndex": 3,
                    "time": 2450
                },
                {
                    "locationIndex": 1,
                    "time": 2460
                },
                {
                    "locationIndex": 2,
                    "time": 2476
                },
                {
                    "locationIndex": 3,
                    "time": 2476
                },
                {
                    "locationIndex": 0,
                    "time": 2488
                },
                {
                    "locationIndex": 3,
                    "time": 2497
                },
                {
                    "locationIndex": 4,
                    "time": 2497
                },
                {
                    "locationIndex": 0,
                    "time": 2505
                },
                {
                    "locationIndex": 2,
                    "time": 2505
                },
                {
                    "locationIndex": 3,
                    "time": 2513
                },
                {
                    "locationIndex": 5,
                    "time": 2513
                },
                {
                    "locationIndex": 2,
                    "time": 2525
                },
                {
                    "locationIndex": 0,
                    "time": 2529
                },
                {
                    "locationIndex": 1,
                    "time": 2529
                },
                {
                    "locationIndex": 2,
                    "time": 2535
                },
                {
                    "locationIndex": 1,
                    "time": 2544
                },
                {
                    "locationIndex": 0,
                    "time": 2544
                },
                {
                    "locationIndex": 3,
                    "time": 2561
                },
                {
                    "locationIndex": 2,
                    "time": 2561
                },
                {
                    "locationIndex": 5,
                    "time": 2578
                },
                {
                    "locationIndex": 0,
                    "time": 2589,
                    "type": "long",
                    "ends": 2604
                },
                {
                    "locationIndex": 2,
                    "time": 2589,
                    "type": "long",
                    "ends": 2604
                },
                {
                    "locationIndex": 5,
                    "time": 2626
                },
                {
                    "locationIndex": 4,
                    "time": 2633
                },
                {
                    "locationIndex": 2,
                    "time": 2633
                },
                {
                    "locationIndex": 1,
                    "time": 2633
                },
                {
                    "locationIndex": 0,
                    "time": 2638
                },
                {
                    "locationIndex": 1,
                    "time": 2654
                },
                {
                    "locationIndex": 3,
                    "time": 2654
                },
                {
                    "locationIndex": 5,
                    "time": 2659
                },
                {
                    "locationIndex": 3,
                    "time": 2663
                },
                {
                    "locationIndex": 5,
                    "time": 2672
                },
                {
                    "locationIndex": 2,
                    "time": 2676
                },
                {
                    "locationIndex": 3,
                    "time": 2676
                },
                {
                    "locationIndex": 1,
                    "time": 2680
                },
                {
                    "locationIndex": 5,
                    "time": 2680
                },
                {
                    "locationIndex": 2,
                    "time": 2684
                },
                {
                    "locationIndex": 0,
                    "time": 2684
                },
                {
                    "locationIndex": 4,
                    "time": 2697
                },
                {
                    "locationIndex": 3,
                    "time": 2697
                },
                {
                    "locationIndex": 0,
                    "time": 2697
                },
                {
                    "locationIndex": 2,
                    "time": 2707,
                    "type": "long",
                    "ends": 2722
                },
                {
                    "locationIndex": 3,
                    "time": 2717
                },
                {
                    "locationIndex": 4,
                    "time": 2717
                },
                {
                    "locationIndex": 1,
                    "time": 2740
                },
                {
                    "locationIndex": 5,
                    "time": 2740
                },
                {
                    "locationIndex": 2,
                    "time": 2763
                },
                {
                    "locationIndex": 0,
                    "time": 2769
                },
                {
                    "locationIndex": 2,
                    "time": 2787
                },
                {
                    "locationIndex": 4,
                    "time": 2787
                },
                {
                    "locationIndex": 5,
                    "time": 2787
                },
                {
                    "locationIndex": 3,
                    "time": 2796
                },
                {
                    "locationIndex": 4,
                    "time": 2802
                },
                {
                    "locationIndex": 3,
                    "time": 2807
                },
                {
                    "locationIndex": 1,
                    "time": 2823
                },
                {
                    "locationIndex": 5,
                    "time": 2823
                },
                {
                    "locationIndex": 3,
                    "time": 2834
                },
                {
                    "locationIndex": 5,
                    "time": 2838,
                    "type": "long",
                    "ends": 2853
                },
                {
                    "locationIndex": 0,
                    "time": 2838,
                    "type": "long",
                    "ends": 2853
                },
                {
                    "locationIndex": 2,
                    "time": 2849
                },
                {
                    "locationIndex": 4,
                    "time": 2854
                },
                {
                    "locationIndex": 3,
                    "time": 2854
                },
                {
                    "locationIndex": 1,
                    "time": 2862
                },
                {
                    "locationIndex": 2,
                    "time": 2862
                },
                {
                    "locationIndex": 4,
                    "time": 2880,
                    "type": "long",
                    "ends": 2895
                },
                {
                    "locationIndex": 0,
                    "time": 2898,
                    "type": "long",
                    "ends": 2913
                },
                {
                    "locationIndex": 1,
                    "time": 2898,
                    "type": "long",
                    "ends": 2913
                },
                {
                    "locationIndex": 3,
                    "time": 2915
                },
                {
                    "locationIndex": 2,
                    "time": 2915
                },
                {
                    "locationIndex": 4,
                    "time": 2923
                },
                {
                    "locationIndex": 2,
                    "time": 2929
                },
                {
                    "locationIndex": 5,
                    "time": 2929
                },
                {
                    "locationIndex": 4,
                    "time": 2944
                },
                {
                    "locationIndex": 0,
                    "time": 2950
                },
                {
                    "locationIndex": 3,
                    "time": 2950
                },
                {
                    "locationIndex": 1,
                    "time": 2955
                },
                {
                    "locationIndex": 2,
                    "time": 2955
                },
                {
                    "locationIndex": 4,
                    "time": 2962
                },
                {
                    "locationIndex": 3,
                    "time": 2972
                },
                {
                    "locationIndex": 1,
                    "time": 2972
                },
                {
                    "locationIndex": 4,
                    "time": 3002
                },
                {
                    "locationIndex": 2,
                    "time": 3002
                },
                {
                    "locationIndex": 5,
                    "time": 3007
                },
                {
                    "locationIndex": 2,
                    "time": 3018
                },
                {
                    "locationIndex": 4,
                    "time": 3018
                },
                {
                    "locationIndex": 5,
                    "time": 3026
                },
                {
                    "locationIndex": 3,
                    "time": 3037
                },
                {
                    "locationIndex": 2,
                    "time": 3044
                },
                {
                    "locationIndex": 0,
                    "time": 3044
                },
                {
                    "locationIndex": 1,
                    "time": 3062
                },
                {
                    "locationIndex": 3,
                    "time": 3069
                },
                {
                    "locationIndex": 2,
                    "time": 3069
                },
                {
                    "locationIndex": 1,
                    "time": 3075
                },
                {
                    "locationIndex": 3,
                    "time": 3084
                },
                {
                    "locationIndex": 0,
                    "time": 3084
                },
                {
                    "locationIndex": 5,
                    "time": 3090
                },
                {
                    "locationIndex": 4,
                    "time": 3146
                },
                {
                    "locationIndex": 1,
                    "time": 3169
                },
                {
                    "locationIndex": 5,
                    "time": 3169
                },
                {
                    "locationIndex": 3,
                    "time": 3179,
                    "type": "long",
                    "ends": 3194
                },
                {
                    "locationIndex": 0,
                    "time": 3185
                },
                {
                    "locationIndex": 5,
                    "time": 3185
                },
                {
                    "locationIndex": 1,
                    "time": 3190
                },
                {
                    "locationIndex": 4,
                    "time": 3196
                },
                {
                    "locationIndex": 2,
                    "time": 3196
                },
                {
                    "locationIndex": 0,
                    "time": 3217
                },
                {
                    "locationIndex": 1,
                    "time": 3256
                },
                {
                    "locationIndex": 4,
                    "time": 3267
                },
                {
                    "locationIndex": 2,
                    "time": 3267
                },
                {
                    "locationIndex": 1,
                    "time": 3282
                },
                {
                    "locationIndex": 0,
                    "time": 3282
                },
                {
                    "locationIndex": 2,
                    "time": 3295
                },
                {
                    "locationIndex": 1,
                    "time": 3310
                },
                {
                    "locationIndex": 5,
                    "time": 3327
                },
                {
                    "locationIndex": 4,
                    "time": 3327
                },
                {
                    "locationIndex": 1,
                    "time": 3332
                },
                {
                    "locationIndex": 2,
                    "time": 3332
                },
                {
                    "locationIndex": 5,
                    "time": 3336
                },
                {
                    "locationIndex": 4,
                    "time": 3341
                },
                {
                    "locationIndex": 0,
                    "time": 3341
                },
                {
                    "locationIndex": 2,
                    "time": 3346
                },
                {
                    "locationIndex": 1,
                    "time": 3346
                },
                {
                    "locationIndex": 0,
                    "time": 3354
                },
                {
                    "locationIndex": 3,
                    "time": 3354
                },
                {
                    "locationIndex": 5,
                    "time": 3367
                },
                {
                    "locationIndex": 2,
                    "time": 3367
                },
                {
                    "locationIndex": 0,
                    "time": 3388
                },
                {
                    "locationIndex": 3,
                    "time": 3396
                },
                {
                    "locationIndex": 5,
                    "time": 3396
                },
                {
                    "locationIndex": 4,
                    "time": 3427
                },
                {
                    "locationIndex": 1,
                    "time": 3451
                },
                {
                    "locationIndex": 2,
                    "time": 3451
                },
                {
                    "locationIndex": 0,
                    "time": 3474
                },
                {
                    "locationIndex": 4,
                    "time": 3505
                },
                {
                    "locationIndex": 1,
                    "time": 3505
                },
                {
                    "locationIndex": 0,
                    "time": 3520
                },
                {
                    "locationIndex": 5,
                    "time": 3520
                },
                {
                    "locationIndex": 2,
                    "time": 3529
                },
                {
                    "locationIndex": 3,
                    "time": 3534
                },
                {
                    "locationIndex": 5,
                    "time": 3534
                },
                {
                    "locationIndex": 1,
                    "time": 3540
                },
                {
                    "locationIndex": 2,
                    "time": 3545
                },
                {
                    "locationIndex": 4,
                    "time": 3545
                },
                {
                    "locationIndex": 1,
                    "time": 3560,
                    "type": "long",
                    "ends": 3575
                },
                {
                    "locationIndex": 3,
                    "time": 3581
                },
                {
                    "locationIndex": 5,
                    "time": 3581
                },
                {
                    "locationIndex": 2,
                    "time": 3588
                },
                {
                    "locationIndex": 0,
                    "time": 3588
                },
                {
                    "locationIndex": 5,
                    "time": 3602
                },
                {
                    "locationIndex": 3,
                    "time": 3602
                },
                {
                    "locationIndex": 1,
                    "time": 3666
                },
                {
                    "locationIndex": 3,
                    "time": 3682
                },
                {
                    "locationIndex": 0,
                    "time": 3682
                },
                {
                    "locationIndex": 1,
                    "time": 3682
                },
                {
                    "locationIndex": 4,
                    "time": 3692
                },
                {
                    "locationIndex": 3,
                    "time": 3724
                },
                {
                    "locationIndex": 0,
                    "time": 3724
                },
                {
                    "locationIndex": 4,
                    "time": 3729
                },
                {
                    "locationIndex": 3,
                    "time": 3736,
                    "type": "long",
                    "ends": 3751
                },
                {
                    "locationIndex": 2,
                    "time": 3736,
                    "type": "long",
                    "ends": 3751
                },
                {
                    "locationIndex": 1,
                    "time": 3751
                },
                {
                    "locationIndex": 5,
                    "time": 3756
                },
                {
                    "locationIndex": 4,
                    "time": 3762
                },
                {
                    "locationIndex": 1,
                    "time": 3762
                },
                {
                    "locationIndex": 5,
                    "time": 3783
                },
                {
                    "locationIndex": 0,
                    "time": 3783
                },
                {
                    "locationIndex": 3,
                    "time": 3788
                },
                {
                    "locationIndex": 0,
                    "time": 3793
                },
                {
                    "locationIndex": 3,
                    "time": 3801
                },
                {
                    "locationIndex": 0,
                    "time": 3811
                },
                {
                    "locationIndex": 4,
                    "time": 3811
                },
                {
                    "locationIndex": 1,
                    "time": 3825
                },
                {
                    "locationIndex": 0,
                    "time": 3842
                },
                {
                    "locationIndex": 3,
                    "time": 3842
                },
                {
                    "locationIndex": 4,
                    "time": 3847
                },
                {
                    "locationIndex": 1,
                    "time": 3847
                },
                {
                    "locationIndex": 2,
                    "time": 3858
                },
                {
                    "locationIndex": 0,
                    "time": 3858
                },
                {
                    "locationIndex": 4,
                    "time": 3885
                },
                {
                    "locationIndex": 2,
                    "time": 3890
                },
                {
                    "locationIndex": 5,
                    "time": 3890
                },
                {
                    "locationIndex": 1,
                    "time": 3901
                },
                {
                    "locationIndex": 0,
                    "time": 3901
                },
                {
                    "locationIndex": 2,
                    "time": 3907,
                    "type": "long",
                    "ends": 3922
                },
                {
                    "locationIndex": 4,
                    "time": 3912
                },
                {
                    "locationIndex": 3,
                    "time": 3912
                },
                {
                    "locationIndex": 1,
                    "time": 3918
                },
                {
                    "locationIndex": 5,
                    "time": 3918
                },
                {
                    "locationIndex": 0,
                    "time": 3922,
                    "type": "long",
                    "ends": 3937
                },
                {
                    "locationIndex": 5,
                    "time": 3934
                },
                {
                    "locationIndex": 4,
                    "time": 3934
                },
                {
                    "locationIndex": 1,
                    "time": 3938
                },
                {
                    "locationIndex": 3,
                    "time": 3938
                },
                {
                    "locationIndex": 5,
                    "time": 3954
                },
                {
                    "locationIndex": 2,
                    "time": 3971
                },
                {
                    "locationIndex": 4,
                    "time": 3971
                },
                {
                    "locationIndex": 3,
                    "time": 3986
                },
                {
                    "locationIndex": 1,
                    "time": 3986
                },
                {
                    "locationIndex": 0,
                    "time": 4009
                },
                {
                    "locationIndex": 3,
                    "time": 4018
                },
                {
                    "locationIndex": 2,
                    "time": 4018
                },
                {
                    "locationIndex": 1,
                    "time": 4050
                },
                {
                    "locationIndex": 5,
                    "time": 4058
                },
                {
                    "locationIndex": 2,
                    "time": 4058
                },
                {
                    "locationIndex": 3,
                    "time": 4082
                },
                {
                    "locationIndex": 1,
                    "time": 4092
                },
                {
                    "locationIndex": 0,
                    "time": 4092
                },
                {
                    "locationIndex": 5,
                    "time": 4092
                },
                {
                    "locationIndex": 3,
                    "time": 4106
                },
                {
                    "locationIndex": 2,
                    "time": 4114
                },
                {
                    "locationIndex": 4,
                    "time": 4114
                },
                {
                    "locationIndex": 3,
                    "time": 4132
                },
                {
                    "locationIndex": 5,
                    "time": 4132
                },
                {
                    "locationIndex": 2,
                    "time": 4141
                },
                {
                    "locationIndex": 1,
                    "time": 4141
                },
                {
                    "locationIndex": 3,
                    "time": 4167
                },
                {
                    "locationIndex": 2,
                    "time": 4173
                },
                {
                    "locationIndex": 1,
                    "time": 4173
                },
                {
                    "locationIndex": 0,
                    "time": 4178
                },
                {
                    "locationIndex": 4,
                    "time": 4178
                },
                {
                    "locationIndex": 2,
                    "time": 4224
                },
                {
                    "locationIndex": 3,
                    "time": 4224
                },
                {
                    "locationIndex": 4,
                    "time": 4236
                },
                {
                    "locationIndex": 2,
                    "time": 4243
                },
                {
                    "locationIndex": 5,
                    "time": 4243
                },
                {
                    "locationIndex": 3,
                    "time": 4251
                },
                {
                    "locationIndex": 2,
                    "time": 4271
                },
                {
                    "locationIndex": 1,
                    "time": 4271
                },
                {
                    "locationIndex": 4,
                    "time": 4279
                },
                {
                    "locationIndex": 2,
                    "time": 4283
                },
                {
                    "locationIndex": 1,
                    "time": 4283
                },
                {
                    "locationIndex": 3,
                    "time": 4287
                },
                {
                    "locationIndex": 0,
                    "time": 4291
                },
                {
                    "locationIndex": 5,
                    "time": 4291
                },
                {
                    "locationIndex": 1,
                    "time": 4306
                },
                {
                    "locationIndex": 2,
                    "time": 4306
                },
                {
                    "locationIndex": 4,
                    "time": 4318
                },
                {
                    "locationIndex": 0,
                    "time": 4323
                },
                {
                    "locationIndex": 4,
                    "time": 4331
                },
                {
                    "locationIndex": 0,
                    "time": 4337
                },
                {
                    "locationIndex": 1,
                    "time": 4341
                },
                {
                    "locationIndex": 2,
                    "time": 4341
                },
                {
                    "locationIndex": 0,
                    "time": 4348
                },
                {
                    "locationIndex": 4,
                    "time": 4370
                },
                {
                    "locationIndex": 2,
                    "time": 4370
                },
                {
                    "locationIndex": 5,
                    "time": 4381
                },
                {
                    "locationIndex": 4,
                    "time": 4394
                },
                {
                    "locationIndex": 1,
                    "time": 4394
                },
                {
                    "locationIndex": 5,
                    "time": 4407
                },
                {
                    "locationIndex": 4,
                    "time": 4420
                },
                {
                    "locationIndex": 2,
                    "time": 4420
                },
                {
                    "locationIndex": 1,
                    "time": 4427,
                    "type": "long",
                    "ends": 4442
                },
                {
                    "locationIndex": 4,
                    "time": 4446
                },
                {
                    "locationIndex": 2,
                    "time": 4446
                },
                {
                    "locationIndex": 3,
                    "time": 4452
                },
                {
                    "locationIndex": 5,
                    "time": 4452
                },
                {
                    "locationIndex": 4,
                    "time": 4457
                },
                {
                    "locationIndex": 0,
                    "time": 4461
                },
                {
                    "locationIndex": 3,
                    "time": 4474
                },
                {
                    "locationIndex": 1,
                    "time": 4474
                },
                {
                    "locationIndex": 0,
                    "time": 4490
                },
                {
                    "locationIndex": 4,
                    "time": 4496
                },
                {
                    "locationIndex": 3,
                    "time": 4496
                },
                {
                    "locationIndex": 2,
                    "time": 4500
                },
                {
                    "locationIndex": 0,
                    "time": 4500
                },
                {
                    "locationIndex": 1,
                    "time": 4500
                },
                {
                    "locationIndex": 4,
                    "time": 4508
                },
                {
                    "locationIndex": 3,
                    "time": 4508
                },
                {
                    "locationIndex": 0,
                    "time": 4516
                },
                {
                    "locationIndex": 4,
                    "time": 4524
                },
                {
                    "locationIndex": 1,
                    "time": 4524
                },
                {
                    "locationIndex": 5,
                    "time": 4545
                },
                {
                    "locationIndex": 3,
                    "time": 4545
                },
                {
                    "locationIndex": 4,
                    "time": 4553
                },
                {
                    "locationIndex": 5,
                    "time": 4558
                },
                {
                    "locationIndex": 3,
                    "time": 4558
                },
                {
                    "locationIndex": 0,
                    "time": 4558
                },
                {
                    "locationIndex": 4,
                    "time": 4564
                },
                {
                    "locationIndex": 2,
                    "time": 4573
                },
                {
                    "locationIndex": 0,
                    "time": 4573
                },
                {
                    "locationIndex": 3,
                    "time": 4593
                },
                {
                    "locationIndex": 4,
                    "time": 4593
                },
                {
                    "locationIndex": 5,
                    "time": 4604
                },
                {
                    "locationIndex": 0,
                    "time": 4609
                },
                {
                    "locationIndex": 4,
                    "time": 4609
                },
                {
                    "locationIndex": 2,
                    "time": 4618
                },
                {
                    "locationIndex": 3,
                    "time": 4618
                },
                {
                    "locationIndex": 0,
                    "time": 4626
                },
                {
                    "locationIndex": 4,
                    "time": 4645
                },
                {
                    "locationIndex": 2,
                    "time": 4645
                },
                {
                    "locationIndex": 0,
                    "time": 4653
                },
                {
                    "locationIndex": 1,
                    "time": 4659
                },
                {
                    "locationIndex": 2,
                    "time": 4659
                },
                {
                    "locationIndex": 0,
                    "time": 4664
                },
                {
                    "locationIndex": 4,
                    "time": 4664
                },
                {
                    "locationIndex": 5,
                    "time": 4670,
                    "type": "long",
                    "ends": 4685
                },
                {
                    "locationIndex": 2,
                    "time": 4670,
                    "type": "long",
                    "ends": 4685
                },
                {
                    "locationIndex": 4,
                    "time": 4677
                },
                {
                    "locationIndex": 0,
                    "time": 4682
                },
                {
                    "locationIndex": 3,
                    "time": 4682
                },
                {
                    "locationIndex": 1,
                    "time": 4690
                },
                {
                    "locationIndex": 4,
                    "time": 4702
                },
                {
                    "locationIndex": 0,
                    "time": 4702
                },
                {
                    "locationIndex": 1,
                    "time": 4708
                },
                {
                    "locationIndex": 3,
                    "time": 4708
                },
                {
                    "locationIndex": 2,
                    "time": 4715
                },
                {
                    "locationIndex": 4,
                    "time": 4715
                },
                {
                    "locationIndex": 5,
                    "time": 4721
                },
                {
                    "locationIndex": 2,
                    "time": 4748
                },
                {
                    "locationIndex": 0,
                    "time": 4766
                },
                {
                    "locationIndex": 4,
                    "time": 4766
                },
                {
                    "locationIndex": 5,
                    "time": 4772
                },
                {
                    "locationIndex": 3,
                    "time": 4784
                },
                {
                    "locationIndex": 0,
                    "time": 4792
                },
                {
                    "locationIndex": 1,
                    "time": 4792
                },
                {
                    "locationIndex": 4,
                    "time": 4797
                },
                {
                    "locationIndex": 5,
                    "time": 4812
                },
                {
                    "locationIndex": 1,
                    "time": 4812
                },
                {
                    "locationIndex": 2,
                    "time": 4818
                },
                {
                    "locationIndex": 4,
                    "time": 4827
                },
                {
                    "locationIndex": 3,
                    "time": 4827
                },
                {
                    "locationIndex": 5,
                    "time": 4835
                },
                {
                    "locationIndex": 0,
                    "time": 4849
                },
                {
                    "locationIndex": 5,
                    "time": 4866
                },
                {
                    "locationIndex": 1,
                    "time": 4866
                },
                {
                    "locationIndex": 2,
                    "time": 4882
                },
                {
                    "locationIndex": 5,
                    "time": 4896
                },
                {
                    "locationIndex": 4,
                    "time": 4896
                },
                {
                    "locationIndex": 2,
                    "time": 4917,
                    "type": "long",
                    "ends": 4932
                },
                {
                    "locationIndex": 1,
                    "time": 4946
                },
                {
                    "locationIndex": 4,
                    "time": 4946
                },
                {
                    "locationIndex": 3,
                    "time": 4963
                },
                {
                    "locationIndex": 0,
                    "time": 4963
                },
                {
                    "locationIndex": 2,
                    "time": 4982
                },
                {
                    "locationIndex": 3,
                    "time": 4994
                },
                {
                    "locationIndex": 2,
                    "time": 5001
                },
                {
                    "locationIndex": 1,
                    "time": 5008
                },
                {
                    "locationIndex": 0,
                    "time": 5035
                },
                {
                    "locationIndex": 1,
                    "time": 5042
                },
                {
                    "locationIndex": 4,
                    "time": 5056
                },
                {
                    "locationIndex": 1,
                    "time": 5071
                },
                {
                    "locationIndex": 3,
                    "time": 5081
                },
                {
                    "locationIndex": 1,
                    "time": 5090
                },
                {
                    "locationIndex": 4,
                    "time": 5110
                },
                {
                    "locationIndex": 2,
                    "time": 5110
                },
                {
                    "locationIndex": 5,
                    "time": 5138
                },
                {
                    "locationIndex": 2,
                    "time": 5213
                },
                {
                    "locationIndex": 1,
                    "time": 5221
                },
                {
                    "locationIndex": 2,
                    "time": 5227
                },
                {
                    "locationIndex": 4,
                    "time": 5231
                },
                {
                    "locationIndex": 5,
                    "time": 5238
                },
                {
                    "locationIndex": 1,
                    "time": 5238
                },
                {
                    "locationIndex": 4,
                    "time": 5238
                },
                {
                    "locationIndex": 3,
                    "time": 5271
                },
                {
                    "locationIndex": 1,
                    "time": 5293
                },
                {
                    "locationIndex": 4,
                    "time": 5313
                },
                {
                    "locationIndex": 1,
                    "time": 5346
                },
                {
                    "locationIndex": 2,
                    "time": 5380
                },
                {
                    "locationIndex": 3,
                    "time": 5380
                },
                {
                    "locationIndex": 0,
                    "time": 5394
                },
                {
                    "locationIndex": 2,
                    "time": 5490
                }
            ]
});

songs.push(song);

song = {};

const SSBundleSongs = songs;
export { SSBundleSongs };
export default SSBundleSongs;