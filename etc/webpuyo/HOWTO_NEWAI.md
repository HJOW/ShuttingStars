# 새로운 AI 상대 추가하기

`webpuyo.js`는 CommonJS와 브라우저 스크립트 방식 모두에서 사용할 수 있는 라이브러리입니다. `OpponentController`는 CPU 조작 알고리즘과 게임 화면 테마를 넣기 위한 기본 클래스입니다. 메인 화면에서 게임 시작을 선택하면 적 선택 화면이 열리며, 외부 파일에서 등록한 상대를 선택해 대전합니다.

## 초기화

라이브러리를 불러오는 것만으로는 게임이 초기화되지 않습니다. 브라우저에서는 모든 적 등록 스크립트를 불러온 뒤 `WebPuyo.initialize()`를 명시적으로 호출해야 메뉴와 입력 처리가 시작됩니다.

```html
<script defer src="webpuyo.js"></script>
<script defer src="my-opponent.js"></script>
<script defer src="game-bootstrap.js"></script>
```

```js
// game-bootstrap.js
WebPuyo.initialize('webpuyo_canvas');
```

Node.js CommonJS 환경에서는 아래처럼 라이브러리를 불러올 수 있습니다. DOM이 없는 Node.js에서는 `initialize()`를 호출할 수 없지만, 컨트롤러 클래스와 적 등록 API는 사용할 수 있습니다.

```js
const { OpponentController, registerOpponent, initialize } = require('./webpuyo.js');
```

## 기본 구조

새 상대는 `WebPuyo.OpponentController`를 상속하는 클래스로 만듭니다. 게임 루프는 컨트롤러가 결정한 목표 회전값으로 뿌요 쌍을 돌린 뒤, 목표 X 좌표까지 이동시킵니다.

```js
class CenterOpponentController extends WebPuyo.OpponentController {
	/**
	 * 뿌요 쌍을 중앙 열로 이동시킨다.
	 * @param {PlayerState} player 자동 조작할 플레이어
	 * @returns {number} 목표 X 좌표
	 */
	chooseTarget(player) {
		return 2;
	}
}
```

## 적 초상화 그리기

`OpponentController`의 `drawPortrait(drawingContext, centerX, centerY, scale)` 메서드를 재정의하면 적 선택 화면과 대전 중 중앙 패널에 표시할 적 이미지를 직접 그릴 수 있습니다. `drawingContext`는 캔버스 2D 컨텍스트이며, `centerX`, `centerY`는 초상화의 중심 좌표, `scale`은 기본 크기 대비 배율입니다.

기본 `OpponentController`의 메서드는 아무것도 그리지 않습니다. 새 적은 필요할 때만 이 메서드를 재정의하면 됩니다.

```js
class CenterOpponentController extends WebPuyo.OpponentController {
	/**
	 * 적 선택 화면과 중앙 패널에 초상화를 그린다.
	 * @param {CanvasRenderingContext2D} drawingContext 캔버스 렌더링 컨텍스트
	 * @param {number} centerX 초상화 중심 X 좌표
	 * @param {number} centerY 초상화 중심 Y 좌표
	 * @param {number} scale 기본 크기 대비 배율
	 * @returns {void}
	 */
	drawPortrait(drawingContext, centerX, centerY, scale = 1) {
		drawingContext.save();
		drawingContext.translate(centerX, centerY);
		drawingContext.fillStyle = '#42a5f5';
		drawingContext.beginPath();
		drawingContext.arc(0, 0, 42 * scale, 0, Math.PI * 2);
		drawingContext.fill();
		drawingContext.restore();
	}
}
```

## 적 등록 방법

새 컨트롤러는 별도 JavaScript 파일에서 `WebPuyo.registerOpponent()`로 등록합니다. 따라서 새 적을 추가할 때 `webpuyo.js`를 수정할 필요가 없습니다. `createController`는 매 게임마다 새 컨트롤러 인스턴스를 반환해야 합니다.

```js
// my-opponent.js
class CenterOpponentController extends WebPuyo.OpponentController {
	chooseTarget(player) {
		return 2;
	}
}

WebPuyo.registerOpponent({
	name: '중앙 수집가',
	createController: () => new CenterOpponentController()
});
```

`my-opponent.js`는 `webpuyo.js` 다음, `WebPuyo.initialize()`를 호출하는 스크립트 전의 순서로 불러와야 합니다.

## 게임 화면 테마

선택된 적의 컨트롤러는 게임 시작 시 세 가지 테마 메서드를 재정의할 수 있습니다. 세 메서드 모두 재정의하지 않으면 기존의 청록색 베젤, 사용자 필드 배경, 중앙 영역 배경이 그대로 그려집니다.

- `drawBezelBackground(drawingContext, area)`: 양쪽 필드를 감싸는 베젤 테두리. `area`에는 `x`, `y`, `width`, `height`, `player`가 있습니다.
- `drawPlayerBackground(drawingContext, area)`: 각 사용자 필드의 뒷배경. `area`에는 `x`, `y`, `width`, `height`, `player`가 있습니다.
- `drawCenterBackground(drawingContext, area)`: 다음 뿌요, 초상화, 점수 뒤의 중앙 영역. `area`에는 `x`, `y`, `width`, `height`가 있습니다.

```js
class NightOpponentController extends WebPuyo.OpponentController {
	drawBezelBackground(drawingContext, area) {
		drawingContext.fillStyle = '#2b193d';
		drawingContext.fillRect(area.x, area.y, area.width, area.height);
	}

	drawPlayerBackground(drawingContext, area) {
		drawingContext.fillStyle = '#171226';
		drawingContext.fillRect(area.x, area.y, area.width, area.height);
	}

	drawCenterBackground(drawingContext, area) {
		drawingContext.fillStyle = '#100d1a';
		drawingContext.fillRect(area.x, area.y, area.width, area.height);
	}
}
```

## 알고리즘 작성 방법

CPU 한 차례를 시작할 때 게임은 `prepareTurn(player)`, `chooseTarget(player)`, `chooseRotate(player)` 순서로 호출합니다. `prepareTurn()`은 위치와 회전별 가상 착지 결과 및 예상 공격력을 `player.aiSimulations`에 준비합니다. 하위 클래스가 재정의할 때는 `super.prepareTurn(player)`을 먼저 호출해 기본 후보 생성을 유지해야 합니다. 그 다음 두 선택 메서드는 같은 후보 목록을 읽어 서로 일관된 목표 열과 회전을 반환할 수 있습니다.

`chooseTarget(player)`에서는 현재 CPU 필드를 읽고, 이번 뿌요 쌍을 어느 열에 둘지 결정합니다. `chooseRotate(player)`는 목표 회전값을 반환합니다. 기본값은 세로 상태인 `0`이며, `1`은 오른쪽, `2`는 아래, `3`은 왼쪽입니다.

- `player.board[y][x]`에는 해당 칸의 색상 문자열 또는 빈 칸의 `null`이 있습니다.
- 좌표는 왼쪽 아래가 `(0, 0)`입니다. `x`는 `0`부터 `5`, `y`는 `0`부터 `12`입니다.
- 현재 떨어지는 쌍은 `player.active`에 있고, 색상은 `player.active.colors` 배열에 있습니다.
- `player.aiSimulations`의 각 항목에는 `x`, `rotation`, `positions`, `attack`이 있습니다. `positions`는 실제 착지 좌표이고 `attack`은 해당 배치의 예상 공격력입니다.
- 기본 `prepareTurn()`은 현재 보드에서 실제로 착지할 수 있는 후보만 목록에 넣습니다. 따라서 AI는 존재하지 않는 후보를 별도로 걸러낼 필요가 없습니다.
- 반환값은 `0`부터 `5` 사이의 목표 X 좌표여야 합니다.
- 회전값은 `0`부터 `3` 사이여야 하며, 게임 루프는 회전과 수평 이동을 모두 수행합니다.

예상 공격력이 가장 높은 배치의 열과 회전을 함께 선택하는 예시는 다음과 같습니다.

```js
class AttackOpponentController extends WebPuyo.OpponentController {
	prepareTurn(player) {
		super.prepareTurn(player);
		this.bestMove = player.aiSimulations.reduce(
			(best, candidate) => candidate.attack >= best.attack ? candidate : best,
			{ x: 5, rotation: 0, attack: -1 }
		);
	}

	chooseTarget(player) {
		return this.bestMove.x;
	}

	chooseRotate(player) {
		return this.bestMove.rotation;
	}
}
```

간단한 알고리즘은 각 열의 높이를 구한 뒤, 가장 낮은 열을 선택하는 방식입니다.

```js
class LowestColumnOpponentController extends WebPuyo.OpponentController {
	/**
	 * 가장 낮은 열을 찾아 뿌요를 쌓는다.
	 * @param {PlayerState} player 자동 조작할 플레이어
	 * @returns {number} 목표 X 좌표
	 */
	chooseTarget(player) {
		let bestColumn = 0;
		let lowestHeight = ROWS;

		for (let x = 0; x < COLUMNS; x += 1) {
			let height = 0;
			while (height < ROWS && player.board[height][x]) height += 1;
			if (height < lowestHeight) {
				lowestHeight = height;
				bestColumn = x;
			}
		}
		return bestColumn;
	}
}
```

더 강한 AI를 만들려면 각 열에 배치한 뒤의 가상 보드를 계산하고, 같은 색의 인접 수, 예상 폭발 수, 필드 높이, 방해뿌요 위험을 점수화해 가장 높은 점수의 열을 선택하면 됩니다.

## 예상 공격 계산

AI는 `player.estimateAttack(colors, positions)`으로 특정 두 뿌요를 놓았을 때의 예상 공격 수치를 얻을 수 있습니다. 이 메서드는 현재 보드를 변경하지 않고, 중력, 연쇄, 인접 방해뿌요 제거를 가상으로 적용한 뒤 전체 `ATTACK` 값을 숫자로 반환합니다.

`colors`는 아래 뿌요부터의 색상 두 개이고, `positions`는 각각의 `{ x, y }` 좌표입니다. 좌표는 왼쪽 아래가 `(0, 0)`이며 범위를 벗어나거나 이미 찬 칸을 지정하면 `0`을 반환합니다.

```js
const attack = player.estimateAttack(
	[player.active.colors[0], player.active.colors[1]],
	[{ x: 2, y: 4 }, { x: 2, y: 5 }]
);
```

AI는 `OpponentController` 내부에 유지하면 플레이어 선택 화면을 추가할 때도 컨트롤러 인스턴스만 교체하면 됩니다.
