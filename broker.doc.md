English | [한글](broker.doc.ko.md)

# Shutting Stars - Broker
## Broker

The Broker is an object used to customize some game settings or to work with the game from other platforms.
Here is part of an HTML page.

```
<!-- Main game area -->
<div id='shuttingstar_canvas_root'></div>

<!-- Run the game with a script -->
<script type="module">
window.addEventListener('load', function(){
    const root = document.getElementById('shuttingstar_canvas_root');
    ShuttingStars.init(root, './', function(broker) {
       // Something with broker
    });
});
</script>
```

In the example above, you can use the Broker object through the variable named `broker` at the position marked with the `Something with broker` comment.
The methods (member functions) and member variables available through the Broker object are described in the sections below.

The member variables of the Broker object are read-only. Changing them directly has no effect.
To change a member variable, use the Broker object's `apply` method.

## Broker API

### apply

- Type: method
- Return type: void
- Parameters
    + changes (object) - Pass an object literal (JSON object). Put the properties and functions to be changed inside this object.
- Description
    + This method is used to change in-game settings through the Broker. It must also be used when changing the member variables listed below.
    + Cannot be changed. It is not possible to replace the `apply` method by using this `apply` method.
- Example
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        volume : 0.5,
        renderDebugMode : true,
        fOuterWidth  : function() { return window.outerWidth; },
        fOuterHeight : function() { return window.outerHeight; } // Put the settings and functions to change inside the object
    });
});
```

### keyList

- Type: array (element type: string, number of elements: 6)
- Description
    + The six keys used for gameplay. These are code values used by the web standard Key Event.
- Example
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        keyList : ['S', 'D', 'F', 'H', 'J', 'K']
    });
});
```

### arrowKeys

- Type: array (element type: string, number of elements: 4)
- Description
    + The arrow keys used for actions such as moving through menus in the game. These are code values used by the web standard Key Event.
- Example
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        arrowKeys : ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT']
    });
});
```

### enterKey

- Type: string
- Description
    + The key used as the confirm button in the game. This is a code value used by the web standard Key Event.
- Example
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        enterKey : 'ENTER'
    });
});
```

### escKey

- Type: string
- Description
    + The key used as the cancel button in the game. This is a code value used by the web standard Key Event.
- Example
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        escKey : 'ESCAPE'
    });
});
```

### volume

- Type: number (set between 0 and 1; decimals are allowed)
- Description
    + Volume (sound level)
- Example
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        volume : 0.5
    });
});
```

### fOuterWidth

- Type: function (can be replaced with another function by using the `apply` method)
- Return type: number
- Parameters: none
- Description
    + Used in the game to get the width of the browser window or display in pixels (px).
    + Can be replaced with a custom function by using the `apply` method.
    + If replaced with another function, that function must perform this original role.
    + If not changed, `function() { return window.outerWidth; }` is provided by default.
- Example
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        fOuterWidth  : function() { return window.outerWidth; }
    });
});
```

### fOuterHeight

- Type: function (can be replaced with another function by using the `apply` method)
- Return type: number
- Parameters: none
- Description
    + Used in the game to get the height of the browser window or display in pixels (px).
    + Can be replaced with a custom function by using the `apply` method.
    + If replaced with another function, that function must perform this original role.
    + If not changed, `function() { return window.outerHeight; }` is provided by default.
- Example
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        fOuterHeight  : function() { return window.outerHeight; }
    });
});
```

### fOnShutdownCalled

- Type: function (can be replaced with another function by using the `apply` method)
- Return type: void
- Parameters: none
- Description
    + In the game, this function actually shuts down the game when the user selects the shutdown menu.
    + Can be replaced with a custom function by using the `apply` method.
    + If replaced with another function, that function must perform this original role.
    + It is not provided by default. Instead, `null` is provided. In this case, the shutdown menu is not shown.
- Example
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        fOnShutdownCalled  : function() { window.close(); }
    });
});
```

### parseSong

- Type: method
- Return type: ShuttingStarsSong
- Parameters
    + jsonObject (object) - Pass an object literal (JSON object). Provide information for a playable song in the game.
- Description
    + Converts object-literal data into a `ShuttingStarsSong` object used by the actual game.
    + Cannot be changed. It is not possible to replace this method by using the `apply` method.
    + Refer to `songs.json` to see the object literal format.

### addSong

- Type: method
- Return type: void
- Parameters
    + song (ShuttingStarsSong) - Adds a song to the game.
- Description
    + Adds a `ShuttingStarsSong` object so the song can be played in the game.
    + Cannot be changed. It is not possible to replace this method by using the `apply` method.

### playSong

- Type: method
- Return type: void
- Parameters
    + song            (ShuttingStarsSong or string) - The song to play, or the song's serial value. The song must already have been added to the game.
    + difficultyLevel (number)                      - The difficulty level to play. Enter an integer; the selected song must have that difficulty.
    + listen          (boolean)                     - Whether to listen only. If set to `true`, the song runs in listen mode, is played automatically, is not recorded, and does not show a result screen.
- Description
    + Starts playing a song.
    + Cannot be called while a song is already being played. An error will occur.
    + Cannot be changed. It is not possible to replace this method by using the `apply` method.

### directSelectSong

- Type: method
- Return type: void
- Parameters
    + song            (ShuttingStarsSong or string) - The song to play, or the song's serial value. The song must already have been added to the game.
- Description
    + Switches to the song selection screen and immediately selects the specified song.
    + Cannot be called while a song is already being played. An error will occur.
    + Cannot be changed. It is not possible to replace this method by using the `apply` method.

### destroy

- Type: method
- Return type: void
- Parameters: none
- Description
    + Stops using the game. It removes the game from the screen and releases all occupied system resources.
    + Cannot be changed. It is not possible to replace this method by using the `apply` method.

