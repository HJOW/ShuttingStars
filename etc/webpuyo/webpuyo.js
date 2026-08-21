/*
Made by HJOW
Apache 2.0
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

  let canvas = null;
  let context = null;
  let initialized = false;
  let game = null;
  let menuScreen = 'title';
  let selectedOpponent = 0;
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
      this.aiRotation = 0;
      this.aiSimulations = [];
    }

    /**
     * 다음에 제공할 세로 뿌요 한 쌍을 만든다.
     * @returns {string[]} 아래와 위 뿌요 색상
     */
    createPair() {
      return [randomColor(), randomColor()];
    }

    /**
     * 현재 보드에 지정한 뿌요를 놓았을 때의 예상 공격 수치를 계산한다.
     * @param {string[]} colors 배치할 두 뿌요의 색상
     * @param {{x:number, y:number}[]} positions 두 뿌요의 보드 좌표
     * @returns {number} 연쇄와 인접 방해뿌요 제거까지 반영한 예상 ATTACK 값
     */
    estimateAttack(colors, positions) {
      return estimateAttack(this.board, colors, positions);
    }
  }

  /**
   * 자동 플레이어의 이동 목표를 결정하는 확장 지점이다.
   */
  class OpponentController {
    /**
     * 위치와 회전별 가상 착지 결과를 계산하여 AI가 사용할 후보 목록을 준비한다.
     * @param {PlayerState} player 자동 조작할 플레이어
     * @returns {void}
     */
    prepareTurn(player) {
      if (!player.active) {
        player.aiSimulations = [];
        return;
      }
      const simulations = [];
      for (let rotation = 0; rotation < 4; rotation += 1) {
        for (let x = 0; x < COLUMNS; x += 1) {
          const placement = findLandingPlacement(player, x, rotation);
          if (!placement) continue;
          simulations.push({
            x,
            rotation,
            positions: activeCells(placement).map(({ x: cellX, y: cellY }) => ({ x: cellX, y: cellY })),
            attack: player.estimateAttack(player.active.colors, activeCells(placement).map(({ x: cellX, y: cellY }) => ({ x: cellX, y: cellY })) )
          });
        }
      }
      player.aiSimulations = simulations;
    }

    /**
     * 현재는 회전 없이 가장 오른쪽 열에 배치한다.
     * @param {PlayerState} player 자동 조작할 플레이어
     * @returns {number} 목표 X 좌표
     */
    chooseTarget(player) {
      return COLUMNS - 1;
    }

    /**
     * 현재는 세로 상태를 유지한다. 하위 클래스에서 목표 회전값을 반환해 재정의할 수 있다.
     * @param {PlayerState} player 자동 조작할 플레이어
     * @returns {number} 목표 회전값 (0: 위, 1: 오른쪽, 2: 아래, 3: 왼쪽)
     */
    chooseRotate(player) {
      return 0;
    }

    /**
     * 적 선택 및 대전 화면에 표시할 적 초상화를 그린다.
     * @param {CanvasRenderingContext2D} drawingContext 캔버스 렌더링 컨텍스트
     * @param {number} centerX 초상화 중심 X 좌표
     * @param {number} centerY 초상화 중심 Y 좌표
     * @param {number} scale 기본 크기 대비 배율
     * @returns {void}
     */
    drawPortrait(drawingContext, centerX, centerY, scale = 1) {
    }

    /**
     * 게임 화면의 베젤 테두리를 그린다. 기본 구현은 현행 테두리를 유지한다.
     * @param {CanvasRenderingContext2D} drawingContext 캔버스 렌더링 컨텍스트
     * @param {{x:number, y:number, width:number, height:number, player:PlayerState}} area 베젤 영역 정보
     * @returns {void}
     */
    drawBezelBackground(drawingContext, area) {
      drawingContext.fillStyle = '#0c2433';
      drawingContext.fillRect(area.x, area.y, area.width, area.height);
    }

    /**
     * 각 사용자 필드의 뒷배경을 그린다. 기본 구현은 현행 배경을 유지한다.
     * @param {CanvasRenderingContext2D} drawingContext 캔버스 렌더링 컨텍스트
     * @param {{x:number, y:number, width:number, height:number, player:PlayerState}} area 사용자 영역 정보
     * @returns {void}
     */
    drawPlayerBackground(drawingContext, area) {
      drawingContext.fillStyle = '#112f40';
      drawingContext.fillRect(area.x, area.y, area.width, area.height);
    }

    /**
     * 중앙 영역의 뒷배경을 그린다. 기본 구현은 현행 배경을 유지한다.
     * @param {CanvasRenderingContext2D} drawingContext 캔버스 렌더링 컨텍스트
     * @param {{x:number, y:number, width:number, height:number}} area 중앙 영역 정보
     * @returns {void}
     */
    drawCenterBackground(drawingContext, area) {
      drawingContext.fillStyle = '#071621';
      drawingContext.fillRect(area.x, area.y, area.width, area.height);
    }
  }

  /**
   * 단테의 배치 목표를 결정한다. 11번째마다 예상 공격이 가장 큰 열을 고른다.
   */
  class DanteController extends OpponentController {
    constructor() {
      super();
      this.turnCount = 0;
    }

    /**
     * @param {PlayerState} player 자동 조작할 플레이어
     * @returns {number} 목표 X 좌표
     */
    chooseTarget(player) {
      this.turnCount += 1;
      const stackDirection = player.board[9][2] ? 0 : COLUMNS - 1;
      if (this.turnCount % 11 !== 0 || !player.active) return stackDirection;

      let bestColumn = stackDirection;
      let bestAttack = -1;
      player.aiSimulations
        .filter((simulation) => simulation.rotation === 0)
        .forEach((simulation) => {
          if (simulation.attack >= bestAttack) {
            bestAttack = simulation.attack;
            bestColumn = simulation.x;
          }
        });
      return bestColumn;
    }

    /**
     * 가상의 인간형 몬스터 단테를 캔버스 도형으로 그린다.
     * @param {CanvasRenderingContext2D} drawingContext 캔버스 렌더링 컨텍스트
     * @param {number} centerX 캐릭터 중심 X 좌표
     * @param {number} centerY 캐릭터 중심 Y 좌표
     * @param {number} scale 기본 크기 대비 배율
     * @returns {void}
     */
    drawPortrait(drawingContext, centerX, centerY, scale = 1) {
      const size = 72 * scale;
      drawingContext.save();
      drawingContext.translate(centerX, centerY);
      drawingContext.lineCap = 'round';
      drawingContext.strokeStyle = '#3d204d';
      drawingContext.lineWidth = 14 * scale;
      drawingContext.beginPath();
      drawingContext.moveTo(-size * 0.33, size * 0.34);
      drawingContext.lineTo(-size * 0.5, size * 0.82);
      drawingContext.moveTo(size * 0.33, size * 0.34);
      drawingContext.lineTo(size * 0.5, size * 0.82);
      drawingContext.stroke();
      drawingContext.fillStyle = '#563068';
      drawingContext.beginPath();
      drawingContext.moveTo(-size * 0.52, size * 0.34);
      drawingContext.lineTo(-size * 0.92, size * 0.04);
      drawingContext.moveTo(size * 0.52, size * 0.34);
      drawingContext.lineTo(size * 0.92, size * 0.04);
      drawingContext.lineWidth = 15 * scale;
      drawingContext.stroke();
      drawingContext.beginPath();
      drawingContext.moveTo(-size * 0.5, size * 0.28);
      drawingContext.quadraticCurveTo(0, -size * 0.02, size * 0.5, size * 0.28);
      drawingContext.lineTo(size * 0.35, size * 0.72);
      drawingContext.quadraticCurveTo(0, size * 0.88, -size * 0.35, size * 0.72);
      drawingContext.closePath();
      drawingContext.fillStyle = '#6e3f8b';
      drawingContext.fill();
      drawingContext.strokeStyle = '#bd87e8';
      drawingContext.lineWidth = 3 * scale;
      drawingContext.stroke();
      drawingContext.fillStyle = '#303752';
      drawingContext.beginPath();
      drawingContext.arc(0, -size * 0.28, size * 0.43, 0, Math.PI * 2);
      drawingContext.fill();
      drawingContext.strokeStyle = '#bd87e8';
      drawingContext.lineWidth = 3 * scale;
      drawingContext.stroke();
      drawingContext.fillStyle = '#ef5350';
      drawingContext.beginPath();
      drawingContext.moveTo(-size * 0.27, -size * 0.6);
      drawingContext.lineTo(-size * 0.08, -size * 0.93);
      drawingContext.lineTo(size * 0.03, -size * 0.55);
      drawingContext.closePath();
      drawingContext.moveTo(size * 0.27, -size * 0.6);
      drawingContext.lineTo(size * 0.08, -size * 0.93);
      drawingContext.lineTo(-size * 0.03, -size * 0.55);
      drawingContext.closePath();
      drawingContext.fill();
      drawingContext.fillStyle = '#f5fbfc';
      drawingContext.beginPath();
      drawingContext.arc(-size * 0.16, -size * 0.31, size * 0.12, 0, Math.PI * 2);
      drawingContext.arc(size * 0.16, -size * 0.31, size * 0.12, 0, Math.PI * 2);
      drawingContext.fill();
      drawingContext.fillStyle = '#ef5350';
      drawingContext.beginPath();
      drawingContext.arc(-size * 0.13, -size * 0.29, size * 0.055, 0, Math.PI * 2);
      drawingContext.arc(size * 0.13, -size * 0.29, size * 0.055, 0, Math.PI * 2);
      drawingContext.fill();
      drawingContext.restore();
    }
  }

  const OPPONENTS = [
    {
      name: '단테',
      createController: () => new DanteController()
    }
  ];

  /**
   * 외부 스크립트에서 새 적을 등록한다.
   * @param {{name:string, createController:()=>OpponentController}} opponent 등록할 적 정보
   * @returns {void}
   */
  function registerOpponent(opponent) {
    if (!opponent || typeof opponent.name !== 'string' || typeof opponent.createController !== 'function') {
      throw new TypeError('opponent에는 name과 createController 함수가 필요합니다.');
    }
    const controller = opponent.createController();
    if (!(controller instanceof OpponentController)) {
      throw new TypeError('createController는 OpponentController 인스턴스를 반환해야 합니다.');
    }
    OPPONENTS.push({ name: opponent.name, createController: opponent.createController });
  }

  /**
   * 대전 상태를 초기화하고 첫 뿌요를 제공한다.
   * @returns {void}
   */
  function startGame() {
    const opponent = OPPONENTS[selectedOpponent];
    const controller = opponent.createController();
    game = { running: true, paused: false, winner: null, themeController: controller, players: [new PlayerState('PLAYER 1', FIELD_LEFT), new PlayerState(opponent.name, FIELD_RIGHT, controller)] };
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
    if (player.controller) {
      player.controller.prepareTurn(player);
      player.aiTarget = player.controller.chooseTarget(player);
      player.aiRotation = ((player.controller.chooseRotate(player) % 4) + 4) % 4;
    }
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
   * 지정한 회전과 X 좌표에서 뿌요 쌍이 실제로 착지할 위치를 가상으로 구한다.
   * @param {PlayerState} player 대상 플레이어
   * @param {number} x 회전축이 될 X 좌표
   * @param {number} rotation 목표 회전값
   * @returns {{x:number, y:number, rotation:number, colors:string[]}|null} 착지 상태 또는 불가능 시 null
   */
  function findLandingPlacement(player, x, rotation) {
    if (!player.active) return null;
    let placement = { ...player.active, x, rotation };
    if (!canPlace(player, placement)) return null;
    while (canPlace(player, { ...placement, y: placement.y - 1 })) {
      placement = { ...placement, y: placement.y - 1 };
    }
    return placement;
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
    return findExplosionsOnBoard(player.board);
  }

  /**
   * 보드 복사본에서 상하좌우로 4개 이상 연결된 색 뿌요를 모두 찾는다.
   * @param {(string|null)[][]} board 탐색할 보드
   * @returns {number[][]} 폭발할 [x, y] 좌표 목록
   */
  function findExplosionsOnBoard(board) {
    const visited = new Set();
    const exploding = [];
    for (let y = 0; y < ROWS; y += 1) for (let x = 0; x < COLUMNS; x += 1) {
      const color = board[y][x];
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
          if (nx >= 0 && nx < COLUMNS && ny >= 0 && ny < ROWS && board[ny][nx] === color && !visited.has(nextKey)) {
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
   * 보드의 모든 뿌요를 열별로 아래로 내린다.
   * @param {(string|null)[][]} board 중력을 적용할 보드
   * @returns {(string|null)[][]} 중력 적용 후의 새 보드
   */
  function collapseBoard(board) {
    const collapsed = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));
    for (let x = 0; x < COLUMNS; x += 1) {
      let targetY = 0;
      for (let y = 0; y < ROWS; y += 1) {
        if (board[y][x]) {
          collapsed[targetY][x] = board[y][x];
          targetY += 1;
        }
      }
    }
    return collapsed;
  }

  /**
   * 두 뿌요를 가상 배치하여 발생 가능한 ATTACK을 계산한다.
   * @param {(string|null)[][]} sourceBoard 배치 전 보드
   * @param {string[]} colors 배치할 두 뿌요 색상
   * @param {{x:number, y:number}[]} positions 배치할 두 뿌요 좌표
   * @returns {number} 연쇄 전체의 예상 ATTACK 값
   */
  function estimateAttack(sourceBoard, colors, positions) {
    if (!Array.isArray(colors) || !Array.isArray(positions) || colors.length !== 2 || positions.length !== 2) return 0;
    let board = sourceBoard.map((row) => [...row]);
    for (let index = 0; index < 2; index += 1) {
      const { x, y } = positions[index] || {};
      if (!COLORS.includes(colors[index]) || !Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= COLUMNS || y < 0 || y >= ROWS || board[y][x]) return 0;
      board[y][x] = colors[index];
    }
    board = collapseBoard(board);
    let combo = 0;
    let attack = 0;
    while (true) {
      const exploding = findExplosionsOnBoard(board);
      if (!exploding.length) return attack;
      combo += 1;
      const power = COMBO_POWER[Math.min(combo, 18)] || 999;
      attack += exploding.length * power / 4;
      const removed = new Set(exploding.map(([x, y]) => `${x},${y}`));
      exploding.forEach(([x, y]) => DIRECTIONS.forEach(([deltaX, deltaY]) => {
        const nextX = x + deltaX;
        const nextY = y + deltaY;
        if (nextX >= 0 && nextX < COLUMNS && nextY >= 0 && nextY < ROWS && board[nextY][nextX] === 'garbage') removed.add(`${nextX},${nextY}`);
      }));
      removed.forEach((key) => {
        const [x, y] = key.split(',').map(Number);
        board[y][x] = null;
      });
      board = collapseBoard(board);
    }
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
      if (player.controller) {
        const rotationDelta = (player.aiRotation - player.active.rotation + 4) % 4;
        if (rotationDelta) {
          const direction = rotationDelta === 3 ? -1 : 1;
          if (!rotateActive(player, direction) && player.active.x !== player.aiTarget) {
            moveActive(player, player.active.x < player.aiTarget ? 1 : -1, 0);
          }
        } else if (player.active.x !== player.aiTarget) {
          moveActive(player, player.active.x < player.aiTarget ? 1 : -1, 0);
        }
      }
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
    [[500, 'sun'], [210, 'star'], [30, 'rock'], [6, 'drop'], [1, 'tiny']].forEach(([value, type]) => {
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
    if (type === 'sun') {
      context.save();
      context.translate(x + CELL / 2, y + CELL / 2);
      context.fillStyle = '#ff9f1c';
      for (let index = 0; index < 8; index += 1) {
        context.save();
        context.rotate(index * Math.PI / 4);
        context.beginPath();
        context.moveTo(CELL * 0.22, 0);
        context.lineTo(CELL * 0.48, -CELL * 0.1);
        context.lineTo(CELL * 0.48, CELL * 0.1);
        context.closePath();
        context.fill();
        context.restore();
      }
      context.fillStyle = '#ff6b35';
      context.beginPath();
      context.arc(0, 0, CELL * 0.31, 0, Math.PI * 2);
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = '#ffe082';
      context.stroke();
      drawPuyoEyes(CELL * 0.31);
      context.restore();
      return;
    }
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
      drawPuyo(x, y, 'red');
      return;
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
   * 조작 중인 뿌요에 흰색 점멸 테두리를 그린다.
   * @param {number} x 셀의 왼쪽 X 좌표
   * @param {number} y 셀의 위쪽 Y 좌표
   * @returns {void}
   */
  function drawActiveOutline(x, y) {
    const pulse = 0.35 + (Math.sin(performance.now() / 105) + 1) * 0.325;
    context.save();
    context.globalAlpha = pulse;
    context.strokeStyle = '#ffffff';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x + CELL / 2, y + CELL / 2, CELL * 0.44, 0, Math.PI * 2);
    context.stroke();
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
    const theme = game.themeController;
    theme.drawBezelBackground(context, { x: x - CELL, y: FIELD_TOP - CELL, width: CELL * 8, height: CELL * 14, player });
    theme.drawPlayerBackground(context, { x, y: FIELD_TOP, width: CELL * 6, height: CELL * 12, player });
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
      if (cell.y < VISIBLE_ROWS) {
        const cellX = x + cell.x * CELL;
        const cellY = FIELD_BOTTOM - (cell.y + 1) * CELL;
        drawPuyo(cellX, cellY, cell.color);
        drawActiveOutline(cellX, cellY);
      }
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
  }

  /**
  * 양쪽의 다음 2쌍, 단테 이미지와 중앙 점수 패널을 그린다.
   * @returns {void}
   */
  function drawCenter() {
    game.themeController.drawCenterBackground(context, { x: 450, y: 0, width: 380, height: HEIGHT });
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
        drawPuyo(pairX, 163, pair[1], 0.68);
        drawPuyo(pairX, 208, pair[0], 0.68);
        context.fillStyle = 'rgba(216, 242, 245, 0.4)'; context.fillRect(x + 74, 158, 1, 92);
      });
    });
    right.controller.drawPortrait(context, WIDTH / 2, 380, 0.86);
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
    context.textAlign = 'center'; context.fillStyle = '#d8f2f5'; context.font = '68px "Black Han Sans"'; context.fillText('WEB PUYO', WIDTH / 2, menuScreen === 'opponent' ? 100 : 260);
    context.fillStyle = '#4cc9b0'; context.font = '20px "Nanum Gothic Coding"'; context.fillText('2D PUZZLE BATTLE', WIDTH / 2, menuScreen === 'opponent' ? 138 : 300);
    if (menuScreen === 'opponent') {
      context.fillStyle = '#d8f2f5'; context.font = '30px "Black Han Sans"'; context.fillText('적 선택', WIDTH / 2, 190);
      const opponent = OPPONENTS[selectedOpponent];
      context.fillStyle = '#0b202c'; context.fillRect(WIDTH / 2 - 170, 215, 340, 258);
      context.strokeStyle = '#ef8aa0'; context.lineWidth = 3; context.strokeRect(WIDTH / 2 - 170, 215, 340, 258);
      opponent.createController().drawPortrait(context, WIDTH / 2, 319, 0.8);
      context.fillStyle = '#f5fbfc'; context.font = '28px "Black Han Sans"'; context.fillText(opponent.name, WIDTH / 2, 443);
      OPPONENTS.forEach((entry, index) => {
        const cardX = WIDTH / 2 - 80 + (index - selectedOpponent) * 180;
        context.fillStyle = index === selectedOpponent ? '#563068' : '#0b202c';
        context.fillRect(cardX, 500, 160, 58);
        context.strokeStyle = index === selectedOpponent ? '#ef8aa0' : '#3b6070'; context.lineWidth = 2;
        context.strokeRect(cardX, 500, 160, 58);
        context.fillStyle = '#f5fbfc'; context.font = '17px "Black Han Sans"'; context.fillText(entry.name, cardX + 80, 536);
      });
      context.fillStyle = '#ef5350'; context.fillRect(440, 600, 250, 58);
      context.fillStyle = '#fff'; context.font = '20px "Black Han Sans"'; context.fillText('시작', 565, 637);
      context.fillStyle = '#264b5b'; context.fillRect(710, 600, 130, 58);
      context.fillStyle = '#d8f2f5'; context.font = '18px "Black Han Sans"'; context.fillText('이전', 775, 637);
      return;
    }
    context.fillStyle = '#ef5350'; context.fillRect(WIDTH / 2 - 145, 358, 290, 66);
    context.fillStyle = '#fff'; context.font = '25px "Black Han Sans"'; context.fillText('게임 시작', WIDTH / 2, 402);
    context.fillStyle = '#8bb3bd'; context.font = '16px "Nanum Gothic Coding"'; context.fillText('버튼을 클릭하여 시작', WIDTH / 2, 465);
  }

  /**
   * 진행 중인 화면 위에 일시정지 오버레이와 조작 버튼을 그린다.
   * @returns {void}
   */
  function drawPauseOverlay() {
    context.fillStyle = 'rgba(3, 11, 19, 0.72)';
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.textAlign = 'center';
    context.fillStyle = '#f5fbfc';
    context.font = '48px "Black Han Sans"';
    context.fillText('일시정지', WIDTH / 2, 322);
    context.fillStyle = '#4cc9b0';
    context.fillRect(470, 376, 150, 64);
    context.fillStyle = '#ef5350';
    context.fillRect(660, 376, 150, 64);
    context.fillStyle = '#ffffff';
    context.font = '23px "Black Han Sans"';
    context.fillText('재개', 545, 417);
    context.fillText('종료', 735, 417);
    context.fillStyle = '#b3dbe2';
    context.font = '15px "Nanum Gothic Coding"';
    context.fillText('ESC 키로 재개', WIDTH / 2, 478);
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
    if (game.paused) {
      drawPauseOverlay();
    } else if (!game.running) {
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
    if (game && game.running && !game.paused) {
      updatePlayer(game.players[0], game.players[1], delta);
      updatePlayer(game.players[1], game.players[0], delta);
    }
    render();
    requestAnimationFrame(frame);
  }

  /**
   * 키 입력을 현재 메뉴 또는 플레이어 조작에 전달한다.
   * @param {KeyboardEvent} event 키보드 이벤트
   * @returns {void}
   */
  function handleKeydown(event) {
    const key = event.key.toLowerCase();
    if (['arrowleft', 'arrowright', 'arrowdown', 'z', 'x', 'escape', 'enter', ' '].includes(key)) event.preventDefault();
    if (game && !game.running && key === 'enter') {
      game = null;
      menuScreen = 'title';
      return;
    }
    if (!game) {
      if (menuScreen === 'opponent' && key === 'arrowleft') {
        selectedOpponent = (selectedOpponent + OPPONENTS.length - 1) % OPPONENTS.length;
      } else if (menuScreen === 'opponent' && key === 'arrowright') {
        selectedOpponent = (selectedOpponent + 1) % OPPONENTS.length;
      } else if (key === 'enter' || key === ' ') {
        if (menuScreen === 'title') menuScreen = 'opponent';
        else startGame();
      } else if (key === 'escape' && menuScreen === 'opponent') menuScreen = 'title';
      return;
    }
    if (!game.running) {
      return;
    }
    if (key === 'escape') {
      game.paused = !game.paused;
      return;
    }
    if (game.paused) return;
    const player = game.players[0];
    if (player.phase !== 'control') return;
    if (key === 'arrowleft') moveActive(player, -1, 0);
    if (key === 'arrowright') moveActive(player, 1, 0);
    if (key === 'arrowdown' && !moveActive(player, 0, -1)) lockActive(player);
    if (key === 'z') rotateActive(player, -1);
    if (key === 'x') rotateActive(player, 1);
  }

  /**
  * 메뉴의 게임 시작 버튼을 선택하거나 결과 화면에서 메뉴로 돌아간다.
   * @param {MouseEvent} event 캔버스 클릭 이벤트
   * @returns {void}
   */
  /**
   * 캔버스 클릭을 메뉴 조작에 전달한다.
   * @param {MouseEvent} event 마우스 이벤트
   * @returns {void}
   */
  function handleCanvasClick(event) {
    if (game && !game.running) {
      game = null;
      menuScreen = 'title';
      return;
    }
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * WIDTH / bounds.width;
    const y = (event.clientY - bounds.top) * HEIGHT / bounds.height;
    if (game && game.paused) {
      if (x >= 470 && x <= 620 && y >= 376 && y <= 440) {
        game.paused = false;
      } else if (x >= 660 && x <= 810 && y >= 376 && y <= 440) {
        game = null;
        menuScreen = 'title';
      }
      return;
    }
    if (game) return;
    if (menuScreen === 'title') {
      if (x >= WIDTH / 2 - 145 && x <= WIDTH / 2 + 145 && y >= 358 && y <= 424) menuScreen = 'opponent';
    } else {
      const cardIndex = OPPONENTS.findIndex((entry, index) => {
        const cardX = WIDTH / 2 - 80 + (index - selectedOpponent) * 180;
        return x >= cardX && x <= cardX + 160 && y >= 500 && y <= 558;
      });
      if (cardIndex >= 0) selectedOpponent = cardIndex;
      else if (x >= 440 && x <= 690 && y >= 600 && y <= 658) startGame();
      else if (x >= 710 && x <= 840 && y >= 600 && y <= 658) menuScreen = 'title';
    }
  }

  /**
   * 지정한 캔버스에 게임을 연결하고 메뉴 렌더링을 시작한다.
   * @param {HTMLCanvasElement|string} target 캔버스 요소 또는 요소 id
   * @returns {void}
   */
  function initialize(target = 'webpuyo_canvas') {
    if (initialized) return;
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      throw new Error('Web Puyo 초기화에는 브라우저 DOM 환경이 필요합니다.');
    }
    canvas = typeof target === 'string' ? document.getElementById(target) : target;
    if (!canvas || typeof canvas.getContext !== 'function') {
      throw new TypeError('유효한 canvas 요소 또는 id를 전달해야 합니다.');
    }
    context = canvas.getContext('2d');
    if (!context) throw new Error('2D 캔버스 컨텍스트를 만들 수 없습니다.');
    initialized = true;
    window.addEventListener('keydown', handleKeydown);
    canvas.addEventListener('click', handleCanvasClick);
    requestAnimationFrame(frame);
  }

  const WebPuyo = { OpponentController, registerOpponent, initialize };
  if (typeof module !== 'undefined' && module.exports) module.exports = WebPuyo;
  if (typeof window !== 'undefined') window.WebPuyo = WebPuyo;
})();