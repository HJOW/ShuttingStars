/**
 * Shutting Stars
 * 
 *     기본 탑재 곡들을 구현하는 파일
 */

let song = new ShuttingStarsSong();
song.name = 'TEST SONG';
song.composer = 'HJOW';
song.noteWriter = 'HJOW';
song.bgaUrl = '';
song.musicUrl = '';
song.thumbnailUrl = '';
song.description = 'Just for test this game';
song.bpm = 120;
song.endTime = 540;
song.difficulties = {
    'hard;9' : []
};

// 임시 테스트 곡으로, 노트는 랜덤하게 생성
for(let idx=0; idx<song.endTime; idx++) {
    const locationIndex = Math.floor(Math.random() * 6);
    const time = idx * 4.0; // 4분의 1비트마다 노트 생성
    const pattern = new ShuttingStarsNotePattern(locationIndex, time);
    
    if(Math.random() > 0.3) song.difficulties['hard;9'].push(pattern);
}

_shuttingstarcore.songs.push(song);