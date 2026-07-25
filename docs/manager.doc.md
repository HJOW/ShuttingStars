English | [한글](manager.doc.ko.md)

# Shutting Stars - Manager
## Manager

The Manager is the object used to start the game loading, or, conversely, stop using it.
Let us look at part of an HTML page.

```
<script type="text/javascript" src='resources/js/dist/shuttingstars.bundle.js'></script>

<!-- Main game area -->
<div id='shuttingstar_canvas_root'></div>

<!-- Start the game with a script -->
<script type="module">
window.addEventListener('load', function(){
    const root = document.getElementById('shuttingstar_canvas_root');
    ShuttingStars.init(root, './'); // ShuttingStars is a manager object
});
</script>
```

The Manager object is a singleton. You can access and use it directly with the `ShuttingStars` keyword.

## Manager API

### init

- Type: method
- Return type: Promise (resolved value: Broker)
- Parameters
    + mainDiv (HTMLElement) - The div element in which to place the game area. `null` is also allowed; in that case, the game area fills the entire screen.
    + urlContext (string) - Usually, use `null` or `'./'`. In an environment with a different URL context path, this value must be changed.
    + fCustom (function) - Provide a function here for work to perform near the end of game initialization. The function is called at that point with a Broker object as its parameter.
- Description
    + Starts the game.
    + You can specify the area in which to display the game screen.
    + During initialization, there is a wait while resources are loaded. The `fCustom` function is called before that wait.
    + This method returns a Promise. The Promise resolves after resource loading is complete, and the resolved value is a Broker object.
- Example
```
<script type="module">
window.addEventListener('load', function(){
    const root = document.getElementById('shuttingstar_canvas_root');

    ShuttingStars.init(root, './', function(broker) {
        // Do something before resource load waiting
    }).then(function(broker) {
        // Do something after all initializing finished
    });
});
</script>
```

### destroy

- Type: method
- Return type: void (none)
- Parameters: none
- Description
    + Stops using the game. It removes the game from the screen and releases all system resources it occupies.
- Example
```
ShuttingStars.destroy();
```

## build

- Type: method
- Return type: number
- Parameters: none
- Description
    + Returns the current build number of the game.
- Example
```
console.log(ShuttingStars.build());
```

### setBeforeInitializeHook

- Type: method
- Return type: void (none)
- Parameters
    + fHook (function) - Provide a function here for work to perform at the beginning of game initialization. The function is called at that point with a Broker object as its parameter.
- Description
    + Sets work to perform at the beginning of game initialization.
    + It can also be used when you need to access the Broker object early.
    + Note that song information and similar data have not yet been loaded at this point.
- Example
```
<script type="module">
window.addEventListener('load', function(){
    const root = document.getElementById('shuttingstar_canvas_root');

    ShuttingStars.setBeforeInitializeHook(function(broker) {
        // Do something
    });
    ShuttingStars.init(root, './', function(broker) {});
});
</script>
```

### setAfterInitializeHook

- Type: method
- Return type: void (none)
- Parameters
    + fHook (function) - Provide a function here for work to perform later in game initialization. The function is called at that point with a Broker object as its parameter.
- Description
    + Sets work to perform during the later stage of game initialization.
    + `fHook` is called after the hooks provided to `setBeforeInitializeHook` and the `fCustom` parameter of `init`.
    + It is called after initialization completes and before the prompt asking the user to press ENTER appears.
- Example
```
<script type="module">
window.addEventListener('load', function(){
    const root = document.getElementById('shuttingstar_canvas_root');

    ShuttingStars.setAfterInitializeHook(function(broker) {
        // Do something
    });
    ShuttingStars.init(root, './', function(broker) {});
});
</script>
```

### setStringTable

- Type: method
- Return type: void (none)
- Parameters
    + stringTable (object) - Provide an object literal (JSON object) containing translations for in-game text and messages.
- Description
    + Use this to translate in-game text and messages into other languages.
    + The keys must be language codes (`ko`, `en`, ...), and each value must be another object literal (JSON object).
    + In these objects, the keys are English messages and the values are their translations. Matching is case-sensitive.
    + [Reference (shuttingstarstringtable.js)](../src/main/webapp/resources/js/shuttingstarstringtable.js)
- Example
```
<script type="module">
window.addEventListener('load', function(){
    const root = document.getElementById('shuttingstar_canvas_root');

    ShuttingStars.setStringTable({
        ko : {
            'PLAY' : '플레이',
            'SETTING' : '설정',
            'ACCEPT' : '확인',
            'Accept' : '확인',
            'CANCEL' : '취소',
            'Cancel' : '취소',
            // Add other text and messages here. They are omitted here for brevity; in practice, all of them must be included.
        }
    });
    ShuttingStars.init(root, './', function(broker) {});
});
</script>
```

### updateStringTable

- Type: method
- Return type: void (none)
- Parameters
    + stringTable (object) - Provide an object literal (JSON object) containing translations for in-game text and messages.
- Description
    + Use this to translate in-game text and messages into other languages.
    + The keys must be language codes (`ko`, `en`, ...), and each value must be another object literal (JSON object).
    + In these objects, the keys are English messages and the values are their translations. Matching is case-sensitive.
    + [Reference (shuttingstarstringtable.js)](../src/main/webapp/resources/js/shuttingstarstringtable.js)
- Example
```
<script type="module">
window.addEventListener('load', function(){
    const root = document.getElementById('shuttingstar_canvas_root');

    ShuttingStars.updateStringTable({
        ko : {
            'PLAY' : '플레이',
            'SETTING' : '설정',
            'ACCEPT' : '확인',
            'Accept' : '확인',
            'CANCEL' : '취소',
            'Cancel' : '취소',
            // Add other text and messages here. Only written values will be changed. (Overwritting)
        }
    });
    ShuttingStars.init(root, './', function(broker) {});
});
</script>
```

### set3DManager

- Type: method
- Return type: void (none)
- Parameters
    + ss3d (ShuttingStars3DManager) - Provide a customized object that extends the `ShuttingStars3DManager` class.
- Description
    + Lets you replace the object responsible for 3D processing with a custom one.
    + [Reference (shuttingstars3d.js)](../src/main/webapp/resources/js/shuttingstars3d.js)

### addSong

- Type: method
- Return type: void (none)
- Parameters
    + song (ShuttingStarsSong or object) - Adds a song to the game. Provide a `ShuttingStarsSong` object or an object literal (JSON object).
- Description
    + Adds a song that can be played in the game by providing a `ShuttingStarsSong` object.
    + When an object literal (JSON object) is provided, the game attempts to convert it to a `ShuttingStarsSong` object.
    + Refer to [songs.json](../src/main/webapp/resources/json/songs.json) for the shape of the object literal.

### playSong

- Type: method
- Return type: Promise (no resolved value)
- Parameters
    + song            (ShuttingStarsSong or string) - The song to play, or its serial value. The song must have been added to the game beforehand.
    + difficultyLevel (number)                      - The difficulty level to play. Provide an integer; that difficulty must exist for the song.
    + listen          (boolean)                     - Whether to listen only. When `true`, the game runs in listening mode with autoplay; no record is saved and no results screen appears.
- Description
    + Starts song playback.
    + It cannot be called while a song is already being played (an error occurs).

### directSelectSong

- Type: method
- Return type: Promise (no resolved value)
- Parameters
    + song (ShuttingStarsSong or string) - The song to play, or its serial value. The song must have been added to the game beforehand.
- Description
    + Switches to the song selection screen and immediately selects the specified song.
    + It cannot be called while a song is already being played (an error occurs).

### getAllSongData

- Type: method  
- Return type: Array (Plain Objects)
- Parameters : none
- Description    
    + All song data are returned.

# Other APIs

[Broker API](./broker.doc.md)