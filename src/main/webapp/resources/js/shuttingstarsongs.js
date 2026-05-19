/**
 * Shutting Stars
 * 
 *     기본 탑재 곡들을 구현하는 파일
 */
let song;

song = new ShuttingStarsSong();
song.name = 'Night Ride';
song.composer = 'Joshua Moses';
song.noteWriter = 'HJOW';
song.bgaUrl = '';
song.musicUrl = './resources/songs/night-ride-by-joshua-moses.mp3';
song.thumbnailUrl = '';
song.description = `
Music: Night Ride by Joshua Moses https://joshuamosesmusic.bandcamp.com|
License: Creative Commons — Attribution 4.0 International — CC BY 4.0|
Free Download / Stream: https://links.al/NnW|
Music promoted by Audio Library: https://links.al/youtube|
`;
song.bpm = 79;
song.endTime = 1838;
song.difficulties = {
    'easy;2' : [
        new ShuttingStarsNotePattern(-1, 1),
        new ShuttingStarsNotePattern(-1, 2),
        new ShuttingStarsNotePattern(-1, 3)
    ]
};
_shuttingstarcore.songs.push(song);

song = new ShuttingStarsSong();
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
    const pattern = new ShuttingStarsNotePattern(-1, idx);
    
    if(Math.random() > 0.2) song.difficulties['hard;9'].push(pattern);
}

_shuttingstarcore.songs.push(song);