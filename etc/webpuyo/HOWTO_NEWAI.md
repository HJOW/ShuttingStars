# 새로운 AI 상대 추가하기

`webpuyo.js`의 `OpponentController`는 CPU의 조작 알고리즘을 넣기 위한 기본 클래스입니다. 현재 구현은 회전하지 않고 오른쪽 끝으로 이동하는 가장 단순한 상대입니다. 메인 화면에서 게임 시작을 선택하면 적 선택 화면이 열리며, `OPPONENTS`에 등록된 상대를 선택해 대전합니다.

## 기본 구조

새 상대는 `OpponentController`를 상속하는 클래스로 만듭니다. 현재 게임 루프는 CPU 플레이어의 `controller`가 반환한 목표 X 좌표까지 자동으로 이동시킵니다.

```js
class CenterOpponentController extends OpponentController {
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

## 적 등록 방법

새 컨트롤러를 만든 뒤 `webpuyo.js`의 `OPPONENTS` 배열에 항목을 추가합니다. `createController`는 매 게임마다 새 컨트롤러 인스턴스를 반환해야 합니다.

```js
const OPPONENTS = [
	{
		name: '오른쪽 끝 수비대',
		description: '회전 없이 오른쪽 끝에 쌓는 기본 알고리즘',
		createController: () => new OpponentController()
	},
	{
		name: '중앙 수집가',
		description: '중앙 열을 노리는 실험용 알고리즘',
		createController: () => new CenterOpponentController()
	}
];
```

## 알고리즘 작성 방법

`chooseTarget(player)`에서는 현재 CPU 필드를 읽고, 이번 뿌요 쌍을 어느 열에 둘지 결정합니다.

- `player.board[y][x]`에는 해당 칸의 색상 문자열 또는 빈 칸의 `null`이 있습니다.
- 좌표는 왼쪽 아래가 `(0, 0)`입니다. `x`는 `0`부터 `5`, `y`는 `0`부터 `12`입니다.
- 현재 떨어지는 쌍은 `player.active`에 있고, 색상은 `player.active.colors` 배열에 있습니다.
- 반환값은 `0`부터 `5` 사이의 목표 X 좌표여야 합니다.
- 현재 기본 게임 루프는 수평 이동만 수행하므로, 유효한 목표는 세로 상태에서 두 뿌요를 놓을 수 있는 열이어야 합니다.

간단한 알고리즘은 각 열의 높이를 구한 뒤, 가장 낮은 열을 선택하는 방식입니다.

```js
class LowestColumnOpponentController extends OpponentController {
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

## 회전 AI로 확장하기

현재 `OpponentController`는 목표 열만 반환하며, CPU는 회전하지 않습니다. 회전 AI가 필요하면 다음 단계로 확장할 수 있습니다.

1. `OpponentController`에 목표 회전을 반환하는 메서드나 행동 목록 메서드를 추가합니다.
2. `PlayerState`에 CPU의 회전 목표를 저장합니다.
3. `updatePlayer()`의 `control` 단계에서 `rotateActive()`를 호출해 목표 회전에 도달시킵니다.
4. 회전 후보마다 `canPlace()`로 충돌을 검사하고, 벽 밀기와 180도 회전 규칙을 그대로 사용합니다.

AI는 `OpponentController` 내부에 유지하면 플레이어 선택 화면을 추가할 때도 컨트롤러 인스턴스만 교체하면 됩니다.
