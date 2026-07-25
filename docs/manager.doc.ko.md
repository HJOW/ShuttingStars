한국어 | [English](manager.doc.md)

# Shutting Stars - Manager
## Manager
    
Manager 는 게임을 활성화하거나, 반대로 게임 사용을 중단하는 데 사용되는 객체입니다.
HTML 페이지 일부를 보겠습니다.
    

```
<script type="text/javascript" src='resources/js/dist/shuttingstars.bundle.js'></script>

<!-- Game 메인 영역 -->
<div id='shuttingstar_canvas_root'></div>

<!-- 스크립트로 게임 구동 -->
<script type="module">
window.addEventListener('load', function(){
    const root = document.getElementById('shuttingstar_canvas_root');
    ShuttingStars.init(root, './'); // ShuttingStars is a manager object
});
</script>
```
    
Manager 객체는 고유하며, `ShuttingStars` 키워드로 접근해 바로 사용할 수 있습니다.

## Manager API

### init

- 타입 : 메소드    
- 리턴 타입 : Promise (resolve 타입 : Broker)    
- 매개 변수
    + mainDiv    (HTMLElement) - 게임 영역을 위치시킬 div 객체를 넣습니다. null 입력도 가능하며, 이 경우 게임 영역이 화면 전체를 차지합니다.
    + urlContext (string)      - 일반적으로 null 또는 './' 를 넣으면 됩니다. 단 URL Context Path 가 다른 환경에서는 이 값의 수정이 필요합니다.
    + fCustom    (function)    - 게임 초기화 작업이 거의 끝난 후 처리할 동작을 이 곳에 함수를 넣으면 됩니다. 해당 시점에 함수가 호출되며, 매개변수로 Broker 객체가 탑재됩니다.
- 설명    
    + 게임을 활성화합니다. 
    + 게임 화면을 출력할 영역을 지정할 수 있습니다.
    + 게임 초기화 작업 중, 리소스 로딩을 위한 대기 시간이 있습니다. fCustom 함수를 그 대기 시간 전에 호출됩니다.
    + 이 메소드는 Promise 를 리턴하며, 이 Promise 가 resolve 되는 타이밍은 리소스 로딩 대기 시간 이후입니다. resolve 매개변수로도 Broker 객체가 탑재됩니다.
- 사용 예
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

- 타입 : 메소드    
- 리턴 타입 : void (없음)
- 매개 변수 : 없음
- 설명    
    + 게임 사용을 중단합니다. 화면에서 게임을 제거하며, 사용된 점유 시스템 리소스를 모두 해제합니다.
- 사용 예
```
ShuttingStars.destroy();
```

## build

- 타입 : 메소드    
- 리턴 타입 : number
- 매개 변수 : 없음
- 설명    
    + 게임의 현재 빌드 번호를 반환합니다.
- 사용 예
```
console.log(ShuttingStars.build());
```

### setBeforeInitializeHook

- 타입 : 메소드    
- 리턴 타입 : void (없음)    
- 매개 변수
    + fHook (function) - 게임 초기화 작업 초기에 처리할 작업을 이 곳에 함수로 넣습니다. 해당 시점에 함수가 호출되며, 매개변수로 Broker 객체가 탑재됩니다.
- 설명    
    + 게임 초기화 작업 초기에 처리할 작업을 지정할 수 있습니다.
    + Broker 객체를 빠른 시기에 이용하고자 할 때에도 이용할 수 있습니다.
    + 단, 이 때에는 곡 정보 등이 로딩되기 전 타이밍임에 유의해야 합니다.
- 사용 예
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

- 타입 : 메소드    
- 리턴 타입 : void (없음)    
- 매개 변수
    + fHook (function) - 게임 초기화 작업 후반부에 처리할 작업을 이 곳에 함수로 넣습니다. 해당 시점에 함수가 호출되며, 매개변수로 Broker 객체가 탑재됩니다.
- 설명    
    + 게임 초기화 작업 후반부 처리할 작업을 지정할 수 있습니다.
    + fHook 의 호출 타이밍은 setBeforeInitializeHook 과 init 메소드의 fCustom 의 경우보다는 이후에 호출됩니다.
    + 초기화 작업이 끝나고, ENTER 키를 눌러달라는 안내 문구가 나오기 전에 fHook 이 호출됩니다.
- 사용 예
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

- 타입 : 메소드    
- 리턴 타입 : void (없음)    
- 매개 변수
    + stringTable (object) - 객체 리터럴 (JSON 객체) 로 넣습니다. 게임 내 출력되는 문구와 메시지의 언어 번역 정보를 넣습니다.
- 설명    
    + 게임 내 표시되는 문구와 메시지들을 다른 언어로 번역할 때 사용합니다.
    + 키로 언어 코드 (ko, en, ...) 가 들어와야 하며, 값으로는 또 다른 객체 리터럴 (JSON 객체) 이 들어가야 합니다. 
    + 이 객체 내에서 키는 영어 메시지, 값은 번역 메시지를 넣으면 됩니다. 대소문자를 가립니다.
    + 번역 데이터 전체를 교체하는 방식이므로, 전체 번역 데이터를 넣지 않으면 일부 항목은 삭제됩니다.
    + [참고 (shuttingstarstringtable.js)](../src/main/webapp/resources/js/shuttingstarstringtable.js)
- 사용 예
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
            // 기타 문구와 메시지들을 이 곳에 입력, 사정 상 내용 생략, 실제로는 전부 기입해야 합니다. 여기에 없는 항목은 삭제됩니다.
        }
    });
    ShuttingStars.init(root, './', function(broker) {});
});
</script>
```

### updateStringTable

- 타입 : 메소드    
- 리턴 타입 : void (없음)    
- 매개 변수
    + stringTable (object) - 객체 리터럴 (JSON 객체) 로 넣습니다. 게임 내 출력되는 문구와 메시지의 언어 번역 정보를 넣습니다.
- 설명    
    + 게임 내 표시되는 문구와 메시지들을 다른 언어로 번역할 때 사용합니다.
    + 키로 언어 코드 (ko, en, ...) 가 들어와야 하며, 값으로는 또 다른 객체 리터럴 (JSON 객체) 이 들어가야 합니다. 
    + 이 객체 내에서 키는 영어 메시지, 값은 번역 메시지를 넣으면 됩니다. 대소문자를 가립니다.
    + 수정된 항목만 덮어쓰는 방식으로, 누락된 데이터는 수정되지 않습니다.
    + [참고 (shuttingstarstringtable.js)](../src/main/webapp/resources/js/shuttingstarstringtable.js)
- 사용 예
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
            // 기타 문구와 메시지들을 이 곳에 입력, 사정 상 내용 생략, 여기에 기입된 항목만 수정(덮어쓰기) 됩니다. 여기에 없는 항목이 삭제되지는 않습니다.
        }
    });
    ShuttingStars.init(root, './', function(broker) {});
});
</script>
```

### set3DManager

- 타입 : 메소드    
- 리턴 타입 : void (없음)    
- 매개 변수
    + ss3d (ShuttingStars3DManager) - ShuttingStars3DManager 클래스를 상속(extends) 하여 임의 수정한 객체를 넣습니다.
- 설명    
    + 3D 처리를 담당하는 객체를 임의로 변경하여 넣을 수 있습니다.
    + [참고 (shuttingstars3d.js)](../src/main/webapp/resources/js/shuttingstars3d.js)

### addSong

- 타입 : 메소드    
- 리턴 타입 : void (없음)
- 매개 변수
    + song (ShuttingStarsSong or object) - 게임 내에 곡을 추가합니다. ShuttingStarsSong 타입의 객체를 넣거나 객체 리터럴 (JSON 객체) 형태로 넣습니다.
- 설명    
    + ShuttingStarsSong 타입의 객체를 넣어, 게임 내에서 플레이할 수 있도록 곡을 추가하는 메소드입니다.
    + 객체 리터럴 (JSON 객체) 형태로 넣는 경우, ShuttingStarsSong 타입으로 자체 변환을 시도합니다.
    + [songs.json](../src/main/webapp/resources/json/songs.json) 을 참고하여, 객체 리터럴의 형태를 확인해 보세요.

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

### directSelectSong

- 타입 : 메소드    
- 리턴 타입 : Promise (resolve 타입 없음)
- 매개 변수
    + song (ShuttingStarsSong or string) - 플레이할 곡, 혹은 곡의 serial 값 (사전에 게임 내에 곡이 추가되어 있어야 합니다.)
- 설명    
    + 곡 선택 화면으로 전환하고, 바로 지정한 곡을 선택된 상태로 만듭니다.
    + 이미 플레이 중일 때는 호출할 수 없습니다. (오류 발생)

### getAllSongData

- 타입 : 메소드    
- 리턴 타입 : Array (원소 : 객체 리터럴)
- 매개 변수 : 없음
- 설명    
    + 로딩된 곡 정보 전체를 배열로 반환합니다.

### getAllSongPromise

- 타입 : 메소드    
- 리턴 타입 : Promise (원소 : Array)
- 매개 변수 
    + urlContext (string)      - 일반적으로 null 또는 './' 를 넣으면 됩니다. 단 URL Context Path 가 다른 환경에서는 이 값의 수정이 필요합니다.
    + fFilter    (function)    - 필터 함수, 곡 정보 객체 하나가 매개변수로 들어오며, 이 함수에서 true 를 리턴해야 Promise 응답에 포함됨
- 설명    
    + 로딩된 곡 정보 전체를 배열로 반환합니다. 게임 자체를 로딩하고 곡 정보를 추출한 후 게임을 비활성화하는 절차가 포함되어 있습니다. Promise 형태이니 주의하세요.

# 다른 API 문서

[Broker API](./broker.doc.ko.md)