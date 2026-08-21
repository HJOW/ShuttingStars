/*

추가 수정해줘.
1. 방해뿌요, 예고뿌요 모두 뿌요라는 설정이라서, 두 눈을 달아서 귀엽게 표현해줘.
2. 뿌요 폭발 시, 폭발하는 자리에 1연쇄, 2연쇄 와 같이 글자를 띄워서 연쇄 수를 표시해줘.
   이 글자는 그 위치에서 천천히 올라가다 1.5초 뒤에 흐릿해지며 2초 시점에는 사라지게 해줘.
3. README.md 에 이 게임에 대한 소개와 플레이 방법을 한국어로 적어줘.
4. HOWTO_NEWAI.md 에, 코딩을 통해 적을 추가하는 방법을 설명해줘. 특히 알고리즘 코딩 방법도 설명해줘.


아래 내용은 2차 수정요청한 내용이야. 참고만 해줘.
----------------------------------------------------------

추가 수정해줘.

1. 중앙 영역에 있는, 다음에 나올 뿌요를 미리 알려주는 공간은 플레이어마다 따로 있어야 해.
   중앙 상단에 있긴 하지만, 그 안에서 좌우로 나뉘어서 각각 2회씩.

2. ES6 문법을 써줘. const, let 와 같은.
3. 나중에는 적을 선택할 수도 있게 하려고 해.
   class 로 만들고, 자동 조작 알고리즘도 그 안에서 구현할 수 있게 구조를 만들어줘.

4. 플레이어 조작 시, z, x키를 이용한 회전 시, 양쪽 모두에 자리가 없으면 180도로 회전해야 하는 것은 맞아.
   단, 한쪽만 자리가 없다면, 반대편으로 밀려서 90도 회전이 되어야 해.
   이를테면 사용자가 z키를 눌러 왼쪽 회전을 하려고 했는데 왼쪽에 자리가 없어. 오른쪽은 비어있어.
   그러면 회전 기준이 되는 아래뿌요는 오른쪽으로 밀리고, 위뿌요가 왼쪽으로 내려와 왼쪽회전이 된 것처럼 동작해야 해.

5. 코드에 주석을 한국어로 달아줘. 함수와 클래스에 그 역할과 동작 설명과 jsdoc 형식으로 매개변수 및 리턴 타입도 달아줘.
6. 화면 내에서 게임 시작을 선택해야 게임이 시작되도록 해줘. 지금은 왜그런지는 모르겠는데 자동으로 시작돼.


아래 내용은 1차 수정요청한 내용이야. 참고만 해줘.
-------------------------------------------------------

추가 수정해줘.

1. 점수는 두 플레이어 모두 중앙 구역 하단에 출력해야 해.
2. 지금 예고뿌요가 출력되지 않고 있어.
   예고뿌요는 각 플레이어 영역 위 베젤 영역 (지금 점수가 출력되는 곳) 에 출력되어야 해.
3. 중력 적용 시 떨어지는 속도가 지금은 너무 빨라. 맨 위에서 아래로 떨어지는 데 1초 정도 걸렸으면 좋겠어.
   그리고 동일한 속도로 떨어지기보다는 적당한 가속도를 가진 것처럼 보였으면 좋겠어.
4. 뿌요 폭발 시 즉시 없어지는 대신 이펙트를 표시해줘. 어짜피 폭발 단계에서는 플레이어가 조작을 못해.
5. 뿌요 폭발 시, 폭발되는 뿌요와 바로 인접한 (위, 아래, 좌, 우 방향으로) 방해뿌요도 같이 폭발해.
   (단, 방해뿌요 폭발은 점수 및 공격 수치에는 포함되지 않아.)

실제 구현한 예제가 있어서 스크린샷을 구했어. 
another_impl_sc.png 를 참고하여 구현해줘. 일단은 레이아웃과 배치 위주로.




아래 내용은 최초 구현할 때 요청한 내용이야. 참고만 해줘.
---------------------------------------------------
HTML canvas 에 2D로 뿌요뿌요 퍼즐게임을 구현해줘.
canvas 해상도는 1280 * 720 으로, canvas 태그는 웹 화면을 꽉 차게 만들어줘.


일단 에셋 없이 만들자. 사운드 없이, 이미지 없이.
2D로 원과 선 등을 그려서 간단하게 만들자.


게임 규칙을 설명해볼게.
기본적으로 뿌요뿌요는 1:1 대전 퍼즐 게임으로
각 사람 당 가로 6 세로 12칸의 공간을 가져.
숨겨진 공간이 위 1줄이 있어, 실제로는 가로 6 세로 13칸이지.
좌표계로는 좌측 하단이 (0, 0)으로, 숨겨진 공간 우측 상단이 (5, 12) 가 되겠지.
그 바깥으로 모든 방향에 1칸 크기로 베젤이 둘러쌓여 있어.

이러한 사용자별 공간이 좌우로 1개씩 총 2개의 공간이 있지.
중앙에는, 다음 제공받을 뿌요 색을 미리 알려주는 공간과, 사용자별 점수를 알려주는 공간이 있어.

이 게임에서 뿌요 라는 존재가 있는데,
뿌요는 동그란 모양의 퍼즐 블록으로 이해하면 돼.
(실제로는 동그란 모양의 슬라임처럼 생긴 귀여운 몬스터의 일종이지. 눈 두개가 달려있고 그외 입과 코, 귀는 표현하지 않지.)
색이 있는 뿌요 5종류가 있고 (빨강, 초록, 노랑, 파랑, 보라)
방해뿌요라고, 물방울 같이 생긴 (반투명한) 뿌요가 있고,
예고뿌요라고, 화면 최상단에만 배치되며, 다음 차례에 방해뿌요를 받는 양을 예고하는 역할의 뿌요가 있어.

각 사용자는 뿌요를 배치하고 폭발시켜, 상대방을 공격 (방해뿌요 발생) 하고, 이를 통해 상대방을 먼저 패배시키려고 하지.

실시간으로 게임이 진행되기는 하지만, 각 타이밍은 5종류로 나눌 수 있어.
1. 사용자의 컨트롤
2. 중력 작용
3. 폭발 탐지
4. 예고된 방해뿌요 집행
5. 패배 여부 탐지

그리고 각 사용자마다 변수 값이 몇 가지 있는데,
우선
점수 (POINT) 가 있어. 초기값은 0이고, 게임이 끝날 때까지 누적돼.
추가점수 (ADD_POINT) 가 있어. 초기값은 0이야. 이건 3번 "폭발 탐지" 타이밍과 관련이 있어.
공격 (ATTACK) 이 있어. 초기값은 0이고, 3번 "폭발 탐지" 타이밍과 관련이 있어.
피해 (DAMAGE) 가 있어. 초기값은 0이고, 3번 및 4번 타이밍과 관련이 있어.
연쇄 수 (COMBO) 가 있어. 초기값은 둘 다 0이야. 3번 "폭발 탐지" 타이밍과 관련이 있어.
연쇄 상수 (COMBO_POWER) 가 있어. 이건 연쇄 수 (COMBO) 에 따라 미리 정해진 값이 있어. 이건 아래에서 설명할게.


게임이 시작되면 모두 1번 타이밍인 채로 시작해.
먼저 1번 타이밍에 대해 설명할게.

1. 사용자의 컨트롤

ESC키를 제외한 그 어떠한 조작도 이 타이밍에서만 가능해. (물론 게임 진행 중일때에 한해서.)

1번 타이밍에 진입할 때, 맨 위 가로 3번째 공간에서 뿌요 2개를 받아.
이 때 반드시 색이 있는 뿌요만 받아. 일단 세로로 나열된 상태로 받지.

이 뿌요 2개는 아주 천천히 아래로 내려와.
이 때 사용자는 방향키 좌, 우, 아래 키와, 키보드 z, x, ESC 키로 조작을 할 수 있어.
좌키를 누르면 뿌요 2개가 동시에 좌측으로 이동해. 단, 두 개의 뿌요 중 하나라도 좌측의 방해물 (벽이나 다른 뿌요) 에 걸리면 이동할 수 없어.
우키는 좌 키와 마찬가지지만 방향만 우측으로 동작해.
z키를 누르면 2개의 뿌요가 둘중 아래의 뿌요를 축으로 하여 좌측으로 90도 회전해. 단, 이렇게 되면 세로 두 칸을 차지하는데, 그 공간이 없는 곳에서 회전한 경우는 90도 추가 회전하여 180도 회전해.
x키는 z키와 동일하나 회전 방향이 우측이야.
2개의 뿌요가 더 이상 내려갈 곳이 없는 경우, 그 위치에 두 개의 뿌요가 배치되고, 1번 "사용자의 컨트롤" 차례가 종료돼.
이후 2번 "중력 작용"이 동작하지.

2. 중력 작용

필드에 있는 모든 뿌요에 중력이 작용해.
자기자신보다 아래에 빈 공간이 있으면 그 곳으로 떨어져.
(단, 중력 작용 후에도 각 뿌요들은 정수 위치에만 있을 수 있어. 떨어지는 중에만 부드럽게 떨어지는 걸 표현하기 위해 임시로 소수값이 허용되지만, 최종적으로는 정수 위치여야 해.)
모든 뿌요가 더 이상 떨어질 곳이 없으면 2번 "중력 작용" 차례가 종료돼.
이후 3번 "폭발 탐지" 로 넘어가.

3. 폭발 탐지

방해뿌요와 예고뿌요를 제외한, 색이 있는 5종류의 뿌요는
같은 색으로 4개 이상이 인접하는 경우 폭발해 없어져.
가로 4개, 세로 4개처럼 일자로 붙어있는 경우는 물론
ㄱ자 모양처럼 구부러져 있어도 선으로 연결될 수 있다면 인접한 것으로 간주돼.
(단 대각선으로 인접한 것은 인정되지 않아. 오직 위, 아래, 좌, 우 4방향으로 인접해야 해.)

일단 폭발이 발생했다면, "연쇄 수" COMBO 는 1 증가해.
증가한 이후의 값을 사용해 점수를 계산해.
추가점수 (ADD_POINT) 와 공격 (ATTACK) 의 계산 식은 다음과 같아.

    ADD_POINT = [터진 뿌요수] * COMBO_POWER
    ATTACK = [터진 뿌요수] * COMBO_POWER / 4

여기서 "연쇄 상수 (COMBO_POWER)" 는 뒤에서 설명할게. 현재의 "연쇄 수" (COMBO) 값에 따라 달라지는 값이야.
이 추가점수 (ADD_POINT) 값은 아직 점수에 반영되지 않아.
공격 (ATTACK) 값도 아직 게임에 영향을 끼치지는 않고, 다만 이 값이 얼마인지를 "예고뿌요" 들을 이용해 보여줘. 이 예고뿌요는 뒤에서 설명할게.

폭발 탐지가 모두 끝난 경우
폭발이 있었다면, 다시 2번 "중력 작용"이 또 동작해.
"중력 작용"이 끝나면 다시 "폭발 탐지"로 넘어오고, 폭발이 있었다면 연쇄 수가 또 증가해.
이 때도 폭발이 있었다면 또 "중력 작용"이 동작해.
이와 같이 폭발이 계속 연쇄 발동한다면 2번 중력 작용과 3번 폭발 탐지가 반복될 수 있어.
그리고 추가점수 (ADD_POINT) 값은 계속 누적돼.

폭발 탐지가 끝난 후 폭발이 없었다면,
이제 추가점수 (ADD_POINT) 가 반영될 차례야.
사용자의 점수 (POINT) 에 덧셈이 돼.
그리고 추가점수 (ADD_POINT) 는 0으로 초기화 돼.

이후 공격 (ATTACK) 이 반영될 차례야.
이 공격의 의미는, 상대방에게 이 갯수 만큼의 방해뿌요를 발생시킨다는 의미야.
하지만 그 전에 먼저, 사용자 본인이 가진 피해 (DAMAGE) 값이 있으면, 공격 (ATTACK) 값 만큼 피해 (DAMAGE) 값을 차감해.
그리고 남은 값이 있으면 상대방의 피해 (DAMAGE) 값을 증가시켜.
만약 공격 (ATTACK) 값이 피해 (DAMAGE) 값보다 적었다면, 상대방에게 아무 영향도 끼치지 못하고, 피해 (DAMAGE) 값만 줄어들겠지.
반대로 공격 (ATTACK) 값이 더 컸다면, 본인의 피해 (DAMAGE) 값은 0이 되고, 남은 값은 상대방의 피해 (DAMAGE) 를 증가시켜.
다 계산이 끝났다면 공격 (ATTACK) 값은 다시 0이 돼.

여기까지 반영이 끝났다면 
연쇄 수 (COMBO) 값은 0으로 초기화되고, 
4번 "예고된 방해뿌요 집행" 으로 넘어가.

4. 예고된 방해뿌요 집행

이 단계는 사용자가 가진 피해 (DAMAGE) 값을 집행하는 단계야.
이 수만큼 방해뿌요를 받게 되지.
기본적으로 방해뿌요는 맨 위에 생성 (화면 상에 보이는 맨 윗줄보다 6줄 더 위에 생성돼.) 되어 아래로 떨어지고
가로 위치는 랜덤이기는 하지만, 고르게 떨어져.
이를테면, 떨어져야 하는 방해뿌요 갯수가 5개 이하라면, 1줄 (6칸)을 다 채우지 못하기 때문에, 한 곳에 두개 이상 떨어지는 일은 없어.
만약 9개가 떨어져야 한다면, 1줄이 떨어지고, 3개가 추가로 랜덤한 위치에 떨어지겠지.

이 타이밍 동안 중력이 작용하고, (2번 "중력 작용"과 동일한 방식)
발생한 방해뿌요 갯수만큼 피해 (DAMAGE) 값은 감소해.
이 4번 "예고된 방해뿌요 집행" 타이밍 1회에는 최대 30개 (5줄) 까지만 방해뿌요가 생성될 수 있어.
이후에는 5번 "패배 여부 탐지" 로 넘어가.

5. 패배 여부 탐지

이 시점에서
화면 최상단 (보이는 영역), 가로 3번째 위치, 좌표로는 (2, 11)
해당 위치에 뿌요 (색상이 있는 뿌요 혹은 방해뿌요) 가 존재하면, 이 사용자는 패배하고, 동시에 상대방은 승리하게 돼.
이 경우 게임이 종료되고 승패와 최종 점수가 출력되지.

만약 이 타이밍에 해당 위치에 뿌요가 존재하지 않으면
다시 1번 "사용자의 컨트롤" 타이밍으로 넘어가.

***

"연쇄 상수" COMBO_POWER 에 대해 얘기할게.

연쇄 상수는, 연쇄에 따른 공격 (상대방에게 방해뿌요를 보내는 행위) 의 위력이라 보면 돼.
높은 연쇄의 폭발일 수록 더 강한 공격을 가하게 되지.

연쇄 수 (COMBO) 와 연쇄 상수 (COMBO_POWER) 은 1:1 대응이 되지.

COMBO : COMBO_POWER
  1   :      1
  2   :      6
  3   :     12
  4   :     24
  5   :     48
  6   :     96
  7   :    192
  8   :    240
  9   :    360
  10  :    480
  11  :    560
  12  :    640
  13  :    720
  14  :    800
  15  :    880
  16  :    960
  17  :    975
  18  :    990
  19이상 : 999
  
***

예고뿌요에 대해 설명할게.
예고뿌요는, 사용자 게임공간 맨 위 베젤 공간에 표시되어
이 사용자가 얼마나 방해뿌요를 받게 될 지를 표시하는 용도지.

먼저 예고뿌요 출력량 (MANY_DISTURBS) 을 계산해야 해.

    예고뿌요 출력량 (MANY_DISTURBS) = [상대방의 공격 (ATTACK) 값] + [본인의 피해 (DAMAGE) 값]

이걸 숫자로 표시하지 않고, "예고뿌요" 형태로 표시해.
예고뿌요는 여러 종류가 있고, 단위에 따라 종류가 달라.
큰 단위의 예고뿌요를 좌측에, 작은 단위를 우측으로 나열하여 배치하지.

1줄에 6칸이기 때문에 6진법을 사용해.
6 미만의 낱개인 경우는 아주 작은 방울의 모양을 1 당 1개로 표시해.
6 이상의 경우는, 6 단위를 나타내는 예고뿌요가 도입되는데, 방해뿌요와 유사하게 생긴 물방울 모양의 뿌요로 6 당 1개로 표시해. 크기는 1칸 (즉 다른 뿌요와 유사한 크기)
30 이상의 경우는, 30 단위를 나타내는 예고뿌요가 도입되는데, 빨간 색 돌 모양의 뿌요로 30 당 1개로 표시해. 크기는 1칸 (예고뿌요는 낱개 1짜리를 제외하고는 다 1칸 크기야.)
210 이상의 경우는, 210 단위를 나타내는 예고뿌요가 도입되는데, 별모양의 황금색 뿌요로 210 당 1개로 표시해. 크기는 역시 1칸.

이를테면 예고뿌요 출력량이 1000이 됐다고 가정하면
별모양 예고뿌요 4개가 출력되고
빨간 색 돌 모양 예고뿌요 5개가 출력되고
6 단위 예고뿌요 1개와, 낱개 예고뿌요 4개가 출력될 거야.
모두 한줄로, 왼쪽정렬로, 큰 단위부터 순서대로.

총 갯수가 6개가 넘어가서 칸을 넘어가는 경우는
6번째 칸 까지만 출력하고 그 뒤는 보여주지 않아.

***

이 게임에도 메뉴가 있어야지.
일단 게임시작 메뉴 하나만 넣자.

***

게임이 진행이 되려면 상대방 역할이 필요한데
기본적으로 플레이어 사용자는 왼쪽을 사용해.
오른쪽은 가상의 플레이어 (자동 플레이) 가 조작해야 해.
1번 "사용자의 컨트롤" 타이밍 때 어떻게 자동조작 시킬지 정의하는 부분은 별도 함수로 빼두고
그 함수에 지금은 무조건 우측 끝에 회전없이 뿌요를 두기만 하는 알고리즘을 넣자.
*/

(() => {
  'use strict';

  const WIDTH = 1280;
  const HEIGHT = 720;
  const COLUMNS = 6;
  const ROWS = 13;
  const VISIBLE_ROWS = 12;
  const CELL = 38;
  const FIELD_TOP = 102;
  const FIELD_BOTTOM = FIELD_TOP + VISIBLE_ROWS * CELL;
  const FIELD_LEFT = 188;
  const FIELD_RIGHT = 864;
  const COLORS = ['red', 'green', 'yellow', 'blue', 'purple'];
  const PALETTE = {
    red: '#ef5350', green: '#66bb6a', yellow: '#f7c843', blue: '#42a5f5', purple: '#ab73e8',
    garbage: '#d3edf4'
  };
  const COMBO_POWER = [0, 1, 6, 12, 24, 48, 96, 192, 240, 360, 480, 560, 640, 720, 800, 880, 960, 975, 990];
  const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  const canvas = document.getElementById('webpuyo_canvas');
  const context = canvas.getContext('2d');
  let game = null;
  let lastTime = 0;

  /**
   * 색 뿌요 하나를 무작위로 선택한다.
   * @returns {string} 뿌요 색상 이름
   */
  function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  /**
   * 플레이어 한 명의 보드와 진행 상태를 보관한다.
   */
  class PlayerState {
    /**
     * @param {string} name 화면에 표시할 이름
     * @param {number} fieldX 필드의 왼쪽 X 좌표
     * @param {OpponentController|null} controller 자동 조작 컨트롤러
     */
    constructor(name, fieldX, controller = null) {
      this.name = name;
      this.fieldX = fieldX;
      this.controller = controller;
      this.board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));
      this.point = 0;
      this.addPoint = 0;
      this.attack = 0;
      this.damage = 0;
      this.combo = 0;
      this.phase = 'control';
      this.active = null;
      this.fallTimer = 0;
      this.phaseTimer = 0;
      this.gravityAnimation = null;
      this.gravityNextPhase = 'explode';
      this.effects = null;
      this.comboPopups = [];
      this.nextPairs = [this.createPair(), this.createPair()];
      this.aiTarget = 5;
    }

    /**
     * 다음에 제공할 세로 뿌요 한 쌍을 만든다.
     * @returns {string[]} 아래와 위 뿌요 색상
     */
    createPair() {
      return [randomColor(), randomColor()];
    }
  }

  /**
   * 자동 플레이어의 이동 목표를 결정하는 확장 지점이다.
   */
  class OpponentController {
    /**
     * 현재는 회전 없이 가장 오른쪽 열에 배치한다.
     * @param {PlayerState} player 자동 조작할 플레이어
     * @returns {number} 목표 X 좌표
     */
    chooseTarget(player) {
      return COLUMNS - 1;
    }
  }

  /**
   * 대전 상태를 초기화하고 첫 뿌요를 제공한다.
   * @returns {void}
   */
  function startGame() {
    game = { running: true, winner: null, players: [new PlayerState('PLAYER 1', FIELD_LEFT), new PlayerState('CPU', FIELD_RIGHT, new OpponentController())] };
    enterControl(game.players[0]);
    enterControl(game.players[1]);
  }

  /**
   * 조작 단계로 전환하고 다음 뿌요 한 쌍을 꺼낸다.
   * @param {PlayerState} player 전환할 플레이어
   * @returns {void}
   */
  function enterControl(player) {
    player.phase = 'control';
    player.fallTimer = 0;
    player.active = { x: 2, y: 12, rotation: 0, colors: player.nextPairs.shift() };
    player.nextPairs.push(player.createPair());
    player.aiTarget = player.controller ? player.controller.chooseTarget(player) : 0;
  }

  /**
   * 회전값으로부터 현재 조작 중인 두 뿌요의 좌표를 구한다.
   * @param {{x:number, y:number, rotation:number, colors:string[]}} active 조작 중인 뿌요 쌍
   * @returns {{x:number, y:number, color:string}[]} 두 뿌요의 좌표와 색상
   */
  function activeCells(active) {
    const offsets = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    const offset = offsets[active.rotation];
    return [
      { x: active.x, y: active.y, color: active.colors[0] },
      { x: active.x + offset[0], y: active.y + offset[1], color: active.colors[1] }
    ];
  }

  /**
   * 후보 위치에 두 뿌요를 모두 놓을 수 있는지 검사한다.
   * @param {PlayerState} player 대상 플레이어
   * @param {{x:number, y:number, rotation:number, colors:string[]}} active 검사할 뿌요 쌍
   * @returns {boolean} 배치 가능 여부
   */
  function canPlace(player, active) {
    return activeCells(active).every((cell) => cell.x >= 0 && cell.x < COLUMNS && cell.y >= 0 && cell.y < ROWS && !player.board[cell.y][cell.x]);
  }

  /**
   * 조작 중인 뿌요 쌍을 한 칸 이동한다.
   * @param {PlayerState} player 이동할 플레이어
   * @param {number} horizontal X축 이동량
   * @param {number} vertical Y축 이동량
   * @returns {boolean} 이동 성공 여부
   */
  function moveActive(player, horizontal, vertical) {
    if (!player.active) return false;
    const candidate = { ...player.active, x: player.active.x + horizontal, y: player.active.y + vertical };
    if (!canPlace(player, candidate)) return false;
    player.active = candidate;
    return true;
  }

  /**
   * 뿌요 쌍을 회전하며, 한쪽만 막혔을 때 반대쪽으로 밀어 넣는다.
   * @param {PlayerState} player 회전할 플레이어
   * @param {number} direction 좌회전 -1 또는 우회전 1
   * @returns {boolean} 회전 성공 여부
   */
  function rotateActive(player, direction) {
    if (!player.active) return false;
    const candidate = { ...player.active, rotation: (player.active.rotation + direction + 4) % 4 };
    if (canPlace(player, candidate)) {
      player.active = candidate;
      return true;
    }
    const horizontalKick = candidate.rotation === 1 ? -1 : candidate.rotation === 3 ? 1 : 0;
    const kicked = { ...candidate, x: candidate.x + horizontalKick };
    if (horizontalKick && canPlace(player, kicked)) {
      player.active = kicked;
      return true;
    }
    const flipped = { ...player.active, rotation: (player.active.rotation + direction * 2 + 4) % 4 };
    if (canPlace(player, flipped)) {
      player.active = flipped;
      return true;
    }
    return false;
  }

  /**
   * 조작 중인 뿌요를 보드에 고정하고 중력 단계로 넘긴다.
   * @param {PlayerState} player 고정할 플레이어
   * @returns {void}
   */
  function lockActive(player) {
    activeCells(player.active).forEach((cell) => {
      if (cell.y >= 0 && cell.y < ROWS) player.board[cell.y][cell.x] = cell.color;
    });
    player.active = null;
    startGravity(player, 'explode');
  }

  /**
   * 모든 보드 뿌요의 낙하 목적지와 가속 애니메이션을 준비한다.
   * @param {PlayerState} player 중력을 적용할 플레이어
   * @param {string} nextPhase 낙하 완료 후 실행할 단계
   * @returns {void}
   */
  function startGravity(player, nextPhase) {
    const nextBoard = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));
    const falling = [];
    for (let x = 0; x < COLUMNS; x += 1) {
      const stack = [];
      for (let y = 0; y < ROWS; y += 1) {
        if (player.board[y][x]) stack.push({ color: player.board[y][x], fromY: y });
      }
      for (let y = 0; y < ROWS; y += 1) {
        const puyo = stack[y];
        if (!puyo) continue;
        nextBoard[y][x] = puyo.color;
        if (puyo.fromY !== y) falling.push({ x, fromY: puyo.fromY, toY: y, color: puyo.color });
      }
    }
    player.board = nextBoard;
    player.gravityNextPhase = nextPhase;
    player.phase = 'gravity';
    player.phaseTimer = 0;
    player.gravityAnimation = falling.length ? { falling, elapsed: 0, duration: Math.max(...falling.map((puyo) => 210 + 790 * Math.sqrt((puyo.fromY - puyo.toY) / VISIBLE_ROWS))) } : null;
  }

  /**
   * 상하좌우로 4개 이상 연결된 색 뿌요를 모두 찾는다.
   * @param {PlayerState} player 탐색할 플레이어
   * @returns {number[][]} 폭발할 [x, y] 좌표 목록
   */
  function findExplosions(player) {
    const visited = new Set();
    const exploding = [];
    for (let y = 0; y < ROWS; y += 1) for (let x = 0; x < COLUMNS; x += 1) {
      const color = player.board[y][x];
      const key = `${x},${y}`;
      if (!color || color === 'garbage' || visited.has(key)) continue;
      const group = [];
      const queue = [[x, y]];
      visited.add(key);
      while (queue.length) {
        const [currentX, currentY] = queue.pop();
        group.push([currentX, currentY]);
        DIRECTIONS.forEach(([deltaX, deltaY]) => {
          const nx = currentX + deltaX;
          const ny = currentY + deltaY;
          const nextKey = `${nx},${ny}`;
          if (nx >= 0 && nx < COLUMNS && ny >= 0 && ny < ROWS && player.board[ny][nx] === color && !visited.has(nextKey)) {
            visited.add(nextKey);
            queue.push([nx, ny]);
          }
        });
      }
      if (group.length >= 4) exploding.push(...group);
    }
    return exploding;
  }

  /**
   * 폭발 점수와 공격을 계산하고 인접 방해뿌요까지 제거한다.
   * @param {PlayerState} player 공격한 플레이어
   * @param {PlayerState} opponent 공격받는 플레이어
   * @returns {void}
   */
  function resolveExplosions(player, opponent) {
    const exploding = findExplosions(player);
    if (exploding.length) {
      const removed = new Map(exploding.map(([x, y]) => [`${x},${y}`, { x, y, color: player.board[y][x] }]));
      exploding.forEach(([x, y]) => {
        DIRECTIONS.forEach(([deltaX, deltaY]) => {
          const nextX = x + deltaX;
          const nextY = y + deltaY;
          if (nextX >= 0 && nextX < COLUMNS && nextY >= 0 && nextY < ROWS && player.board[nextY][nextX] === 'garbage') {
            removed.set(`${nextX},${nextY}`, { x: nextX, y: nextY, color: 'garbage' });
          }
        });
      });
      player.combo += 1;
      const power = COMBO_POWER[Math.min(player.combo, 18)] || 999;
      player.addPoint += exploding.length * power;
      player.attack += exploding.length * power / 4;
      const center = exploding.reduce((sum, [x, y]) => ({ x: sum.x + x, y: sum.y + y }), { x: 0, y: 0 });
      player.comboPopups.push({ x: center.x / exploding.length, y: center.y / exploding.length, combo: player.combo, elapsed: 0 });
      removed.forEach((puyo) => { player.board[puyo.y][puyo.x] = null; });
      player.effects = { cells: [...removed.values()], elapsed: 0, duration: 430 };
      player.phase = 'burst';
      player.phaseTimer = 0;
      return;
    }
    player.point += player.addPoint;
    player.addPoint = 0;
    const blocked = Math.min(player.damage, player.attack);
    player.damage -= blocked;
    opponent.damage += player.attack - blocked;
    player.attack = 0;
    player.combo = 0;
    player.phase = 'garbage';
  }

  /**
   * 피해 수치만큼 방해뿌요를 상단에서 생성한다.
   * @param {PlayerState} player 방해뿌요를 받을 플레이어
   * @returns {void}
   */
  function dropGarbage(player) {
    const amount = Math.min(30, Math.floor(player.damage));
    if (amount) {
      const positions = [];
      for (let y = 0; y < Math.ceil(amount / COLUMNS); y += 1) {
        const columns = [...Array(COLUMNS).keys()].sort(() => Math.random() - 0.5);
        columns.forEach((x) => positions.push([x, ROWS - 1 - y]));
      }
      positions.slice(0, amount).forEach(([x, y]) => { player.board[y][x] = 'garbage'; });
      player.damage -= amount;
      startGravity(player, 'check');
      return;
    }
    player.phase = 'check';
  }

  /**
   * 플레이어의 현재 게임 단계를 시간 경과만큼 진행한다.
   * @param {PlayerState} player 갱신할 플레이어
   * @param {PlayerState} opponent 상대 플레이어
   * @param {number} delta 이전 프레임 후 경과한 밀리초
   * @returns {void}
   */
  function updatePlayer(player, opponent, delta) {
    player.comboPopups = player.comboPopups
      .map((popup) => ({ ...popup, elapsed: popup.elapsed + delta }))
      .filter((popup) => popup.elapsed < 2000);
    if (player.phase === 'control') {
      if (player.controller && player.active.x < player.aiTarget) moveActive(player, 1, 0);
      player.fallTimer += delta;
      if (player.fallTimer >= (player.isAi ? 290 : 520)) {
        player.fallTimer = 0;
        if (!moveActive(player, 0, -1)) lockActive(player);
      }
      return;
    }
    if (player.phase === 'gravity') {
      if (!player.gravityAnimation) {
        player.phase = player.gravityNextPhase;
        return;
      }
      player.gravityAnimation.elapsed += delta;
      if (player.gravityAnimation.elapsed >= player.gravityAnimation.duration) {
        player.gravityAnimation = null;
        player.phase = player.gravityNextPhase;
      }
      return;
    }
    if (player.phase === 'burst') {
      player.effects.elapsed += delta;
      if (player.effects.elapsed >= player.effects.duration) {
        player.effects = null;
        startGravity(player, 'explode');
      }
      return;
    }
    player.phaseTimer += delta;
    if (player.phaseTimer < 150) return;
    player.phaseTimer = 0;
    if (player.phase === 'explode') {
      resolveExplosions(player, opponent);
    } else if (player.phase === 'garbage') {
      dropGarbage(player);
    } else if (player.phase === 'check') {
      if (player.board[11][2]) {
        game.running = false;
        game.winner = opponent;
      } else enterControl(player);
    }
  }

  /**
   * 공격량을 예고뿌요 단위 목록으로 변환한다.
   * @param {number} amount 예고할 방해뿌요 수
   * @returns {string[]} 왼쪽부터 그릴 예고뿌요 종류
   */
  function warningUnits(amount) {
    const units = [];
    [[210, 'star'], [30, 'rock'], [6, 'drop'], [1, 'tiny']].forEach(([value, type]) => {
      const count = Math.floor(amount / value);
      amount %= value;
      for (let index = 0; index < count && units.length < 6; index += 1) units.push(type);
    });
    return units;
  }

  /**
   * 눈이 있는 색 뿌요 또는 반투명 방해뿌요를 그린다.
   * @param {number} x 셀의 왼쪽 X 좌표
   * @param {number} y 셀의 위쪽 Y 좌표
   * @param {string} color 뿌요 색상 종류
   * @param {number} scale 셀 대비 크기 비율
   * @returns {void}
   */
  function drawPuyo(x, y, color, scale = 1) {
    const radius = CELL * 0.42 * scale;
    context.save();
    context.translate(x + CELL / 2, y + CELL / 2);
    context.fillStyle = PALETTE[color];
    context.globalAlpha = color === 'garbage' ? 0.75 : 1;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = color === 'garbage' ? '#f4fbff' : 'rgba(255,255,255,0.45)';
    context.stroke();
    drawPuyoEyes(radius);
    context.restore();
  }

  /**
   * 현재 변환 좌표를 기준으로 뿌요의 귀여운 두 눈을 그린다.
   * @param {number} radius 뿌요 본체의 반지름
   * @returns {void}
   */
  function drawPuyoEyes(radius) {
    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(-radius * 0.28, -radius * 0.12, radius * 0.19, 0, Math.PI * 2);
    context.arc(radius * 0.28, -radius * 0.12, radius * 0.19, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#172031';
    context.beginPath();
    context.arc(-radius * 0.25, -radius * 0.08, radius * 0.08, 0, Math.PI * 2);
    context.arc(radius * 0.31, -radius * 0.08, radius * 0.08, 0, Math.PI * 2);
    context.fill();
  }

  /**
   * 단위별 예고뿌요 모양을 한 칸에 그린다.
   * @param {number} x 셀의 왼쪽 X 좌표
   * @param {number} y 셀의 위쪽 Y 좌표
   * @param {string} type 예고뿌요 단위 종류
   * @returns {void}
   */
  function drawWarning(x, y, type) {
    if (type === 'tiny') return drawPuyo(x + CELL * 0.25, y + CELL * 0.25, 'garbage', 0.45);
    if (type === 'star') {
      context.save(); context.translate(x + CELL / 2, y + CELL / 2); context.fillStyle = '#ffd54f'; context.beginPath();
      for (let index = 0; index < 10; index += 1) {
        const angle = -Math.PI / 2 + index * Math.PI / 5;
        const radius = index % 2 ? CELL * 0.18 : CELL * 0.42;
        context[index ? 'lineTo' : 'moveTo'](Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      context.closePath(); context.fill(); drawPuyoEyes(CELL * 0.34); context.restore(); return;
    }
    if (type === 'rock') {
      context.save(); context.translate(x + CELL / 2, y + CELL / 2); context.fillStyle = '#ef5350'; context.fillRect(-CELL * 0.36, -CELL * 0.27, CELL * 0.72, CELL * 0.58); drawPuyoEyes(CELL * 0.3); context.restore(); return;
    }
    drawPuyo(x, y, 'garbage');
  }

  /**
   * 폭발한 뿌요 위치에 확산 광선 효과를 그린다.
   * @param {number} x 셀의 왼쪽 X 좌표
   * @param {number} y 셀의 위쪽 Y 좌표
   * @param {{color:string}} puyo 폭발한 뿌요 정보
   * @param {number} progress 0부터 1까지의 애니메이션 진행률
   * @returns {void}
   */
  function drawExplosionEffect(x, y, puyo, progress) {
    const centerX = x + CELL / 2;
    const centerY = y + CELL / 2;
    context.save();
    context.globalAlpha = 1 - progress;
    context.strokeStyle = puyo.color === 'garbage' ? '#e9fbff' : PALETTE[puyo.color];
    context.lineWidth = 3;
    for (let ray = 0; ray < 8; ray += 1) {
      const angle = (Math.PI * 2 * ray) / 8;
      const inner = CELL * 0.14 + progress * CELL * 0.12;
      const outer = CELL * (0.28 + progress * 0.44);
      context.beginPath();
      context.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner);
      context.lineTo(centerX + Math.cos(angle) * outer, centerY + Math.sin(angle) * outer);
      context.stroke();
    }
    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(centerX, centerY, CELL * (0.3 + progress * 0.2), 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  /**
   * 폭발 중심에서 위로 올라가며 사라지는 연쇄 수 텍스트를 그린다.
   * @param {number} fieldX 필드의 왼쪽 X 좌표
   * @param {{x:number, y:number, combo:number, elapsed:number}} popup 연쇄 텍스트 정보
   * @returns {void}
   */
  function drawComboPopup(fieldX, popup) {
    const progress = popup.elapsed / 2000;
    const opacity = popup.elapsed <= 1500 ? 1 : 1 - (popup.elapsed - 1500) / 500;
    const x = fieldX + (popup.x + 0.5) * CELL;
    const y = FIELD_BOTTOM - (popup.y + 1) * CELL - progress * 42;
    context.save();
    context.globalAlpha = opacity;
    context.textAlign = 'center';
    context.font = '24px "Black Han Sans"';
    context.lineWidth = 5;
    context.strokeStyle = '#172031';
    context.strokeText(`${popup.combo}연쇄`, x, y);
    context.fillStyle = '#fff3a6';
    context.fillText(`${popup.combo}연쇄`, x, y);
    context.restore();
  }

  /**
   * 한 플레이어의 필드, 예고줄, 낙하와 폭발 효과를 그린다.
   * @param {PlayerState} player 그릴 플레이어
   * @param {PlayerState} opponent 예고 공격량을 제공할 상대
   * @returns {void}
   */
  function drawField(player, opponent) {
    const x = player.fieldX;
    context.fillStyle = '#0c2433';
    context.fillRect(x - CELL, FIELD_TOP - CELL, CELL * 8, CELL * 14);
    context.fillStyle = '#112f40';
    context.fillRect(x, FIELD_TOP, CELL * 6, CELL * 12);
    context.strokeStyle = 'rgba(162, 220, 235, 0.14)';
    context.lineWidth = 1;
    for (let index = 0; index <= COLUMNS; index += 1) { context.beginPath(); context.moveTo(x + index * CELL, FIELD_TOP); context.lineTo(x + index * CELL, FIELD_BOTTOM); context.stroke(); }
    for (let index = 0; index <= VISIBLE_ROWS; index += 1) { context.beginPath(); context.moveTo(x, FIELD_TOP + index * CELL); context.lineTo(x + CELL * 6, FIELD_TOP + index * CELL); context.stroke(); }
    const fallingTargets = new Set((player.gravityAnimation?.falling || []).map((puyo) => `${puyo.x},${puyo.toY}`));
    for (let y = 0; y < VISIBLE_ROWS; y += 1) for (let column = 0; column < COLUMNS; column += 1) {
      const puyo = player.board[y][column];
      if (puyo && !fallingTargets.has(`${column},${y}`)) drawPuyo(x + column * CELL, FIELD_BOTTOM - (y + 1) * CELL, puyo);
    }
    if (player.gravityAnimation) {
      const animation = player.gravityAnimation;
      const progress = Math.min(1, animation.elapsed / animation.duration);
      const eased = progress * progress;
      animation.falling.forEach((puyo) => {
        const y = puyo.fromY + (puyo.toY - puyo.fromY) * eased;
        if (y < VISIBLE_ROWS) drawPuyo(x + puyo.x * CELL, FIELD_BOTTOM - (y + 1) * CELL, puyo.color);
      });
    }
    if (player.active) activeCells(player.active).forEach((cell) => {
      if (cell.y < VISIBLE_ROWS) drawPuyo(x + cell.x * CELL, FIELD_BOTTOM - (cell.y + 1) * CELL, cell.color);
    });
    for (let index = 0; index < COLUMNS; index += 1) {
      context.fillStyle = '#0a1d29'; context.fillRect(x + index * CELL + 3, FIELD_TOP - CELL + 3, CELL - 6, CELL - 6);
      context.strokeStyle = 'rgba(176, 232, 244, 0.25)'; context.strokeRect(x + index * CELL + 3, FIELD_TOP - CELL + 3, CELL - 6, CELL - 6);
    }
    warningUnits(opponent.attack + player.damage).forEach((type, index) => drawWarning(x + index * CELL, FIELD_TOP - CELL, type));
    if (player.effects) {
      const progress = Math.min(1, player.effects.elapsed / player.effects.duration);
      player.effects.cells.forEach((puyo) => drawExplosionEffect(x + puyo.x * CELL, FIELD_BOTTOM - (puyo.y + 1) * CELL, puyo, progress));
    }
    player.comboPopups.forEach((popup) => drawComboPopup(x, popup));
    context.fillStyle = '#e7f8fa'; context.font = '18px "Black Han Sans"'; context.textAlign = 'left';
    context.fillText(player.name, x, 54);
    context.fillStyle = '#b3dbe2'; context.font = '14px "Nanum Gothic Coding"'; context.fillText(`DAMAGE ${Math.floor(player.damage)}`, x, 653);
  }

  /**
   * 양쪽의 다음 2쌍, 조작 안내와 중앙 점수 패널을 그린다.
   * @returns {void}
   */
  function drawCenter() {
    context.fillStyle = '#d8f2f5'; context.textAlign = 'center'; context.font = '42px "Black Han Sans"'; context.fillText('WEB PUYO', WIDTH / 2, 95);
    const left = game.players[0]; const right = game.players[1];
    [
      { player: left, x: 482, color: '#ef8aa0' },
      { player: right, x: 650, color: '#6bbce8' }
    ].forEach(({ player, x, color }) => {
      context.fillStyle = '#0b202c'; context.fillRect(x, 120, 148, 150);
      context.strokeStyle = color; context.lineWidth = 2; context.strokeRect(x, 120, 148, 150);
      context.fillStyle = color; context.font = '13px "Nanum Gothic Coding"'; context.fillText(`${player.name} NEXT`, x + 74, 143);
      player.nextPairs.forEach((pair, pairIndex) => {
        const pairX = x + 21 + pairIndex * 70;
        drawPuyo(pairX, 163, pair[0], 0.68);
        drawPuyo(pairX, 208, pair[1], 0.68);
        context.fillStyle = 'rgba(216, 242, 245, 0.4)'; context.fillRect(x + 74, 158, 1, 92);
      });
    });
    context.fillStyle = '#8bb3bd'; context.font = '14px "Nanum Gothic Coding"';
    context.fillText('ARROWS: MOVE / DOWN', WIDTH / 2, 406); context.fillText('Z / X: ROTATE     ESC: MENU', WIDTH / 2, 430);
    const scores = [
      { player: left, x: 488, color: '#ef8aa0' },
      { player: right, x: 646, color: '#6bbce8' }
    ];
    scores.forEach(({ player, x, color }) => {
      context.fillStyle = '#0b202c'; context.fillRect(x, 492, 146, 92);
      context.strokeStyle = color; context.lineWidth = 2; context.strokeRect(x, 492, 146, 92);
      context.fillStyle = color; context.font = '13px "Nanum Gothic Coding"'; context.fillText(player.name, x + 73, 516);
      context.fillStyle = '#f5fbfc'; context.font = '27px "Nanum Gothic Coding"'; context.fillText(String(Math.floor(player.point)).padStart(7, '0'), x + 73, 557);
    });
  }

  /**
   * 클릭 가능한 게임 시작 메뉴를 그린다.
   * @returns {void}
   */
  function drawMenu() {
    context.fillStyle = '#071621'; context.fillRect(0, 0, WIDTH, HEIGHT);
    context.textAlign = 'center'; context.fillStyle = '#d8f2f5'; context.font = '68px "Black Han Sans"'; context.fillText('WEB PUYO', WIDTH / 2, 260);
    context.fillStyle = '#4cc9b0'; context.font = '20px "Nanum Gothic Coding"'; context.fillText('2D PUZZLE BATTLE', WIDTH / 2, 300);
    context.fillStyle = '#ef5350'; context.fillRect(WIDTH / 2 - 145, 358, 290, 66);
    context.fillStyle = '#fff'; context.font = '25px "Black Han Sans"'; context.fillText('게임 시작', WIDTH / 2, 402);
    context.fillStyle = '#8bb3bd'; context.font = '16px "Nanum Gothic Coding"'; context.fillText('버튼을 클릭하여 시작', WIDTH / 2, 465);
  }

  /**
   * 현재 메뉴 또는 실행 중인 게임의 한 프레임을 렌더링한다.
   * @returns {void}
   */
  function render() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
    if (!game) { drawMenu(); return; }
    context.fillStyle = '#071621'; context.fillRect(0, 0, WIDTH, HEIGHT);
    drawField(game.players[0], game.players[1]); drawField(game.players[1], game.players[0]); drawCenter();
    if (!game.running) {
      context.fillStyle = 'rgba(3, 11, 19, 0.78)'; context.fillRect(0, 0, WIDTH, HEIGHT);
      context.textAlign = 'center'; context.fillStyle = '#f7c843'; context.font = '48px "Black Han Sans"'; context.fillText(`${game.winner.name} 승리!`, WIDTH / 2, 318);
      context.fillStyle = '#d8f2f5'; context.font = '22px "Nanum Gothic Coding"'; context.fillText('ENTER 또는 화면 클릭으로 메인 화면', WIDTH / 2, 376);
    }
  }

  /**
   * 애니메이션 프레임을 갱신하고 다음 프레임을 예약한다.
   * @param {number} time 브라우저가 제공한 현재 시각
   * @returns {void}
   */
  function frame(time) {
    const delta = Math.min(50, time - lastTime || 0);
    lastTime = time;
    if (game && game.running) {
      updatePlayer(game.players[0], game.players[1], delta);
      updatePlayer(game.players[1], game.players[0], delta);
    }
    render();
    requestAnimationFrame(frame);
  }

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowleft', 'arrowright', 'arrowdown', 'z', 'x', 'escape', 'enter', ' '].includes(key)) event.preventDefault();
    if (game && !game.running && key === 'enter') {
      game = null;
      return;
    }
    if (!game || !game.running) {
      return;
    }
    if (key === 'escape') { game = null; return; }
    const player = game.players[0];
    if (player.phase !== 'control') return;
    if (key === 'arrowleft') moveActive(player, -1, 0);
    if (key === 'arrowright') moveActive(player, 1, 0);
    if (key === 'arrowdown' && !moveActive(player, 0, -1)) lockActive(player);
    if (key === 'z') rotateActive(player, -1);
    if (key === 'x') rotateActive(player, 1);
  });

  /**
  * 메뉴의 게임 시작 버튼을 선택하거나 결과 화면에서 메뉴로 돌아간다.
   * @param {MouseEvent} event 캔버스 클릭 이벤트
   * @returns {void}
   */
  canvas.addEventListener('click', (event) => {
    if (game && !game.running) {
      game = null;
      return;
    }
    if (game) return;
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * WIDTH / bounds.width;
    const y = (event.clientY - bounds.top) * HEIGHT / bounds.height;
    if (x >= WIDTH / 2 - 145 && x <= WIDTH / 2 + 145 && y >= 358 && y <= 424) startGame();
  });

  requestAnimationFrame(frame);
})();