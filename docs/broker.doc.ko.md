한국어 | [English](broker.doc.md)

# Shutting Stars - Broker
## Broker

Broker 는, 게임의 일부 설정을 커스텀하거나, 다른 플랫폼에서 사용하기 위해 다루는 객체입니다.    
HTML 페이지 일부를 보겠습니다.
    

```
<!-- Game 메인 영역 -->
<div id='shuttingstar_canvas_root'></div>

<!-- 스크립트로 게임 구동 -->
<script type="module">
window.addEventListener('load', function(){
    const root = document.getElementById('shuttingstar_canvas_root');
    ShuttingStars.init(root, './', function(broker) {
       // Something with broker
    });
});
</script>
```
    
위 예에서 "Something with broker" 주석이 있는 위치에서 "broker" 이름의 변수로 Broker 객체를 이용하실 수 있습니다.    
Broker 객체를 통해 사용 가능한 메소드(멤버함수)와 멤버변수는 아래 단락에서 볼 수 있습니다.    
    
Broker 객체의 멤버변수는 읽기 전용으로, 수정해도 의미가 없습니다.    
멤버변수를 변경하려면 Broker 객체의 apply 메소드를 이용해야 합니다.    
    
## Broker API

### apply

- 타입 : 메소드    
- 리턴 타입 : void (없음)    
- 매개 변수
    + changes (object) - 객체 리터럴 (JSON 객체) 로 넣습니다. 수정해야 할 속성 및 함수들을 이 객체 안에 탑재하여 넣습니다.
- 설명    
    + Broker 을 통해 게임 내 설정을 변경할 때 이용하는 메소드로, 아래 멤버변수들을 수정할 때도 이 메소드를 이용해야 합니다.
    + 변경 불가 (이 apply 메소드를 이용해 apply 메소드를 교체하는 것이 불가능)
- 사용 예
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        volume : 0.5,
        renderDebugMode : true,
        fOuterWidth  : function() { return window.outerWidth; },
        fOuterHeight : function() { return window.outerHeight; } // 수정할 설정과 함수들을 객체 안에 탑재
    });
});
```

### keyList

- 타입 : 배열 (원소 타입 : string, 원소 수 : 6개)
- 설명
    + 게임 플레이에 사용되는 6개의 키 (웹 표준 Key Event 에서 쓰이는 코드값)
- 사용 예
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        keyList : ['S', 'D', 'F', 'H', 'J', 'K']
    });
});
```

### arrowKeys

- 타입 : 배열 (원소 타입 : string, 원소 수 : 4개)
- 설명
    + 게임 내에서 메뉴 이동 등에 사용되는 방향키 (웹 표준 Key Event 에서 쓰이는 코드값)
- 사용 예
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        arrowKeys : ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT']
    });
});
```

### enterKey

- 타입 : string
- 설명
    + 게임 내에서 확인 버튼으로 사용되는 키 (웹 표준 Key Event 에서 쓰이는 코드값)
- 사용 예
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        enterKey : 'ENTER'
    });
});
```

### escKey

- 타입 : string
- 설명
    + 게임 내에서 취소 버튼으로 사용되는 키 (웹 표준 Key Event 에서 쓰이는 코드값)
- 사용 예
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        escKey : 'ESCAPE'
    });
});
```

### volume

- 타입 : number (0~1 사이로 지정, 소수 허용)
- 설명
    + 음량 (소리 크기)
- 사용 예
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        volume : 0.5
    });
});
```

### fOuterWidth

- 타입 : 함수 (apply 메소드를 이용해 다른 함수로 교체할 수 있음)    
- 리턴 타입 : number
- 매개 변수 : 없음
- 설명    
    + 게임 내에서 브라우저 창의 가로 길이, 혹은 디스플레이의 가로 길이를 픽셀(px) 단위로 알아내는 데 사용됩니다.
    + apply 메소드를 이용해 임의의 함수로 교체할 수 있습니다.
    + 다른 함수로 교체 시, 해당 함수가 본 역할을 대신 수행해야 합니다.
    + 변경하지 않을 경우,  function() { return window.outerWidth; } 함수가 기본 탑재되어 있습니다.
- 사용 예
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        fOuterWidth  : function() { return window.outerWidth; }
    });
});
```

### fOuterHeight

- 타입 : 함수 (apply 메소드를 이용해 다른 함수로 교체할 수 있음)    
- 리턴 타입 : number
- 매개 변수 : 없음
- 설명    
    + 게임 내에서 브라우저 창의 세로 길이, 혹은 디스플레이의 세로 길이를 픽셀(px) 단위로 알아내는 데 사용됩니다.
    + apply 메소드를 이용해 임의의 함수로 교체할 수 있습니다.
    + 다른 함수로 교체 시, 해당 함수가 본 역할을 대신 수행해야 합니다.
    + 변경하지 않을 경우,  function() { return window.outerHeight; } 함수가 기본 탑재되어 있습니다.
- 사용 예
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        fOuterHeight  : function() { return window.outerHeight; }
    });
});
```

### fOnShutdownCalled

- 타입 : 함수 (apply 메소드를 이용해 다른 함수로 교체할 수 있음)    
- 리턴 타입 : void (없음)
- 매개 변수 : 없음
- 설명    
    + 게임 내에서, 사용자가 게임 종료 메뉴 선택 시, 게임을 실제로 종료하는 역할을 수행합니다.
    + apply 메소드를 이용해 임의의 함수로 교체할 수 있습니다.
    + 다른 함수로 교체 시, 해당 함수가 본 역할을 대신 수행해야 합니다.
    + 기본 탑재되어 있지 않으며 null 이 대신 탑재되어 있습니다. 이 경우 종료 메뉴가 나타나지 않습니다.
- 사용 예
```
ShuttingStars.init(root, './', function(broker) {
    broker.apply({
        fOnShutdownCalled  : function() { window.close(); }
    });
});
```

### parseSong

- 타입 : 메소드    
- 리턴 타입 : ShuttingStarsSong
- 매개 변수
    + jsonObject (object) - 객체 리터럴 (JSON 객체) 로 넣습니다. 게임 내 플레이 가능한 곡 정보를 넣습니다.
- 설명    
    + 객체 리터럴 형태의 데이터를, 실제 게임 내에서 사용되는 ShuttingStarsSong 타입의 객체로 변환하는 메소드입니다.
    + 변경 불가 (이 apply 메소드를 이용해 apply 메소드를 교체하는 것이 불가능)
    + [songs.json](../src/main/webapp/resources/json/songs.json) 을 참고하여, 객체 리터럴의 형태를 확인해 보세요.

### addSong

- 타입 : 메소드    
- 리턴 타입 : void (없음)
- 매개 변수
    + song (ShuttingStarsSong) - 게임 내에 곡을 추가합니다.
- 설명    
    + ShuttingStarsSong 타입의 객체를 넣어, 게임 내에서 플레이할 수 있도록 곡을 추가하는 메소드입니다.
    + 변경 불가 (이 apply 메소드를 이용해 apply 메소드를 교체하는 것이 불가능)

### playSong

- 타입 : 메소드    
- 리턴 타입 : Promise (resolve 타입 없음)
- 매개 변수
    + song            (ShuttingStarsSong or string) - 플레이할 곡, 혹은 곡의 serial 값 (사전에 게임 내에 곡이 추가되어 있어야 합니다.)
    + difficultyLevel (number)                      - 플레이할 난이도 레벨 (정수로 입력, 해당 곡에 해당 난이도가 있어야 함)
    + listen          (boolean)                     - 감상 여부 (true 지정 시 감상 모드로 실행되며, 자동 플레이가 되고, 기록에 남지 않으며, 결과 화면이 나타나지 않음)
- 설명    
    + 곡 플레이가 시작되도록 만드는 메소드입니다.
    + 이미 플레이 중일 때는 호출할 수 없습니다. (오류 발생)
    + 변경 불가 (이 apply 메소드를 이용해 apply 메소드를 교체하는 것이 불가능)

### directSelectSong

- 타입 : 메소드    
- 리턴 타입 : Promise (resolve 타입 없음)
- 매개 변수
    + song (ShuttingStarsSong or string) - 플레이할 곡, 혹은 곡의 serial 값 (사전에 게임 내에 곡이 추가되어 있어야 합니다.)
- 설명    
    + 곡 선택 화면으로 전환하고, 바로 지정한 곡을 선택된 상태로 만듭니다.
    + 이미 플레이 중일 때는 호출할 수 없습니다. (오류 발생)
    + 변경 불가 (이 apply 메소드를 이용해 apply 메소드를 교체하는 것이 불가능)

### destroy

- 타입 : 메소드    
- 리턴 타입 : void (없음)
- 매개 변수 : 없음
- 설명    
    + 게임 사용을 중단합니다. 화면에서 게임을 제거하며, 사용된 점유 시스템 리소스를 모두 해제합니다.
    + 변경 불가 (이 apply 메소드를 이용해 apply 메소드를 교체하는 것이 불가능)

# 다른 API 문서

[Manager API](./manager.doc.ko.md)