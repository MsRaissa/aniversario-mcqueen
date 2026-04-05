/* ==========================================
   SONS
   ========================================== */

function startLisboa() {
  const el = document.getElementById("somLisboa");
  if (!el) return;
  el.volume = 0.45;
  el.play().catch(() => {});
}

function stopLisboa() {
  const el = document.getElementById("somLisboa");
  if (!el) return;
  el.pause();
  el.currentTime = 0;
}

function playKatchow() {
  const el = document.getElementById("somKatchow");
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {});
}

/* ==========================================
   NAVEGAÇÃO ENTRE TELAS
   ========================================== */

let gameStarted = false;

function startGame() {
  if (gameStarted) return;
  gameStarted = true;

  const btn = document.getElementById("startBtn");
  if (btn) btn.disabled = true;

  startLisboa();

  // Fade out do conteúdo da tela 1
  const content = document.querySelector('#screen1 .content');
  if (content) {
    content.style.transition = 'transform 0.45s ease, opacity 0.45s ease';
    content.style.transform  = 'scale(1.15)';
    content.style.opacity    = '0';
  }

  // Troca de tela após animação
  setTimeout(() => {
    document.getElementById("screen1").classList.remove("active");
    document.getElementById("screen2").classList.add("active");
    // Força redimensionamento do canvas p5
    window.dispatchEvent(new Event('resize'));
  }, 450);
}

function unlockSite() {
  stopLisboa();
  playKatchow();

  // Flash dourado no canvas
  const gs = document.getElementById("gameScreen");
  if (gs) {
    gs.style.transition = 'background-color 0.25s';
    gs.style.backgroundColor = "gold";
    setTimeout(() => { gs.style.backgroundColor = ""; }, 300);
  }

  setTimeout(() => {
    document.getElementById("screen2").classList.remove("active");
    const s3 = document.getElementById("screen3");
    s3.classList.add("active");
    s3.scrollTop = 0;
    // Para o loop do p5 para economizar recursos
    if (typeof noLoop === 'function') noLoop();
  }, 800);
}

/* ==========================================
   BOTÕES DE TELA CHEIA PARA VÍDEOS
   ========================================== */

function initFullscreenButtons() {
  document.querySelectorAll('.fullscreen-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const iframe = document.getElementById(btn.getAttribute('data-video'));
      if (!iframe) return;
      const req = iframe.requestFullscreen
               || iframe.webkitRequestFullscreen
               || iframe.msRequestFullscreen;
      if (req) req.call(iframe);
    });
  });
}

/* ==========================================
   CONTROLES MOBILE
   ========================================== */

function setupMobileControls() {
  const btnUp   = document.getElementById('btnUp');
  const btnDown = document.getElementById('btnDown');
  if (!btnUp || !btnDown) return;

  const go   = dir => () => { if (paddleOne) paddleOne.switchMoveDirection(dir); };
  const stop = ()  => { if (paddleOne) paddleOne.switchMoveDirection('none'); };

  [
    [btnUp,   'up'],
    [btnDown, 'down'],
  ].forEach(([el, dir]) => {
    el.addEventListener('touchstart',  e => { e.preventDefault(); go(dir)(); }, { passive: false });
    el.addEventListener('touchend',    stop);
    el.addEventListener('touchcancel', stop);
    el.addEventListener('mousedown',   go(dir));
    el.addEventListener('mouseup',     stop);
    el.addEventListener('mouseleave',  stop);
    el.addEventListener('contextmenu', e => e.preventDefault());
  });
}

/* ==========================================
   INICIALIZAÇÃO
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  setupMobileControls();
  initFullscreenButtons();
  // 🔥 ADICIONE ISSO AQUI:
  const startBtn = document.getElementById('startBtn');
  if (startBtn) startBtn.addEventListener('click', startGame);
});

/* ==========================================
   P5.JS — JOGO DA COPA PISTÃO
   ========================================== */

/* ---------- Classe Ball ---------- */
class Ball {
  constructor(x, y, radius) {
    this.x        = x;
    this.y        = y;
    this.shadowY  = y;
    this.radius   = radius;
    this.velocity = createVector(
      radius * 0.21,
      random(-radius * 0.084, radius * 0.084)
    );
  }

  update(ballArc) {
    this.x += this.velocity.x;
    this.shadowY += this.velocity.y;
    this.y = this.shadowY - ballArc;
  }

  render() {
    push();
    noStroke();
    // Sombra
    fill(0, 0, 0, 100);
    ellipse(this.x, this.shadowY, this.radius);
    // Bola
    stroke(54);
    strokeWeight(1);
    fill(255, 235, 0);
    ellipse(this.x, this.y, this.radius);
    pop();
  }
}

/* ---------- Classe Paddle ---------- */
class Paddle {
  constructor(x, y, slope, bottomBound, topBound, imageCar, isPlayer, w) {
    this.x             = x;
    this.y             = y;
    this.bottomBound   = bottomBound;
    this.topBound      = topBound;
    this.slope         = -slope;        // negativo para manter orientação correta
    this.imageCar      = imageCar;
    this.width         = w;
    this.height        = w * 1.5;
    this.moveDirection = 'none';
    this.isPlayer      = isPlayer;
    this.playerHasMoved = false;

    // Velocidades distintas para jogador e IA
this.speed = this.height * (isPlayer ? 0.08 : 0.04);  }

  autoMove(ballY) {
    // 👇 AQUI ESTÁ O AJUSTE DE VELOCIDADE DA REAÇÃO (CÉREBRO)
    // Diminuímos a "zona morta" (0.3 -> 0.1). 
    // Isso faz ela começar a se mover muito mais cedo quando a bola se aproxima.
    const diff = this.y - ballY;
    if (diff < 0 && diff < -this.height * 0.01) { 
      this.switchMoveDirection('down');
    } else if (diff > 0 && diff > this.height * 2.5) {
      this.switchMoveDirection('up');
    } else {
      this.switchMoveDirection('none');
    }
    
    // 👇 AQUI ESTÁ O AJUSTE DE VELOCIDADE DE MOVIMENTO (MOTOR)
    // Como definimos anteriormente, o speedMultiplier para a CPU (isPlayer = false) é 0.01.
    // Vamos aumentar esse valor para a Sally se mover mais rápido fisicamente.
    // Procure pela função 'move()' logo abaixo e altere:
  }

  move() {
    const speed = this.height * 0.05;
    if (this.moveDirection === 'up' && this.y > this.topBound) {
      this.y -= speed
      this.x += (speed/this.slope)
      this.counter += this.animationSpeed;
    } else if (this.moveDirection === 'down' && this.y < this.bottomBound) {
      this.y += speed
      this.x -= (speed/this.slope)
      this.counter += this.animationSpeed;
    }
  }
  switchMoveDirection(dir) {
    this.moveDirection = dir;
    if (dir !== 'none') this.playerHasMoved = true;
  }

  render() {
    if (this.imageCar) {
      imageMode(CENTER);
      image(this.imageCar, this.x, this.y, this.width * 3, this.height * 3);

      // Dica para o jogador caso ainda não tenha se movido
      if (this.isPlayer && !this.playerHasMoved) {
        push();
        textSize(13);
        fill(255);
        noStroke();
        textAlign(CENTER, BOTTOM);
        text('Setinhas para mover!', this.x, this.y - this.height * 2.1);
        pop();
      }
    } else {
      // Fallback retângulo
      rectMode(CENTER);
      noStroke();
      fill(this.isPlayer ? color(232, 0, 14) : color(50, 150, 255));
      rect(this.x, this.y, this.width, this.height * 2, 4);
    }
  }
}

/* ---------- Variáveis globais do jogo ---------- */
let gameW, gameH;
let courtTopLeftX, courtTopLeftY;
let courtBottomLeftX, courtBottomLeftY;
let courtBottomRightX, courtBottomRightY;
let courtTopRightX, courtTopRightY;
let padding, quadOffset;

let paddleOne, paddleTwo, ball;
let leftPlayerScore  = 0;
let rightPlayerScore = 0;
let gameFinished     = false;

let imgMcQueen, imgSally;
let courtWidth, maxBallArc, oneFourthPoint, threeFourthsPoint;

// Animação de escala no placar
let leftScoreScale  = 1;
let rightScoreScale = 1;
let scaleTimer      = 0;

/* ---------- p5: preload ---------- */
function preload() {
  imgMcQueen = loadImage('assets/mcqueen.png', () => {}, () => console.warn('McQueen não carregado'));
  imgSally   = loadImage('assets/sally.png',   () => {}, () => console.warn('Sally não carregada'));
}

/* ---------- p5: setup ---------- */
function setup() {
  // Dimensiona o canvas para caber na janela mantendo proporção 2:1
  gameH = min(window.innerHeight * 0.9, window.innerWidth / 2);
  gameW = min(window.innerWidth,        gameH * 2);

  const canvas = createCanvas(gameW, gameH);
  canvas.parent('gameScreen');

  leftPlayerScore  = 0;
  rightPlayerScore = 0;
  gameFinished     = false;

  setupCourtCoordinates();
  setupPaddles();
  ball = new Ball(gameW * 0.5, gameH * 0.5, gameW * 0.021);
}

/* ---------- p5: draw ---------- */
function draw() {
  if (gameFinished) return; // para de atualizar após fim de jogo

  paddleOne.move();
  paddleTwo.autoMove(ball.y);
  updateBall();
  isColliding();
  didHitWall();
  didScore();

  background(20);
  drawTrack();
  drawFinishLine();

  paddleOne.render();
  paddleTwo.render();
  ball.render();

  // Atualiza escala do placar
  if (scaleTimer > 0) {
    scaleTimer--;
    if (scaleTimer === 0) {
      leftScoreScale  = 1;
      rightScoreScale = 1;
    } else {
      leftScoreScale  = max(1, leftScoreScale  - 0.05);
      rightScoreScale = max(1, rightScoreScale - 0.05);
    }
  }

  drawScore();
}

/* ---------- p5: windowResized ---------- */
function windowResized() {
  gameH = min(window.innerHeight * 0.9, window.innerWidth / 2);
  gameW = min(window.innerWidth,        gameH * 2);
  resizeCanvas(gameW, gameH);
  setupCourtCoordinates();
  setupPaddles();
  ball = new Ball(gameW * 0.5, gameH * 0.5, gameW * 0.021);
}

/* ---------- Coordenadas da quadra ---------- */
function setupCourtCoordinates() {
  padding    = gameH * 0.125;
  quadOffset = gameW * 0.125;

  courtTopLeftX     = padding + quadOffset;
  courtTopLeftY     = padding;
  courtBottomLeftX  = padding;
  courtBottomLeftY  = gameH - padding;
  courtBottomRightX = gameW - padding - quadOffset;
  courtBottomRightY = gameH - padding;
  courtTopRightX    = gameW - padding;
  courtTopRightY    = padding;
}

/* ---------- Criação dos paddles ---------- */
function setupPaddles() {
  const topBound    = courtTopRightY;
  const bottomBound = courtBottomLeftY;

  // Paddle do jogador (esquerda / McQueen)
  const slope1 = (courtBottomLeftY - courtTopLeftY) / (courtBottomLeftX - courtTopLeftX);
  paddleOne = new Paddle(
    courtBottomLeftX + 30, courtBottomLeftY - 60,
    slope1, bottomBound, topBound,
    imgMcQueen, true, gameW * 0.03
  );

  // Paddle da IA (direita / Sally)
  const slope2 = (courtTopRightY - courtBottomRightY) / (courtTopRightX - courtBottomRightX);
  paddleTwo = new Paddle(
    courtTopRightX - 70, courtTopRightY + 60,
    slope2, bottomBound, topBound,
    imgSally, false, gameW * 0.03
  );
}

/* ---------- Controles de teclado ---------- */
function keyPressed() {
  if (keyCode === UP_ARROW   || keyCode === 87) paddleOne.switchMoveDirection('up');
  if (keyCode === DOWN_ARROW || keyCode === 83) paddleOne.switchMoveDirection('down');
}

function keyReleased() {
  if ([UP_ARROW, DOWN_ARROW, 87, 83].includes(keyCode)) {
    paddleOne.switchMoveDirection('none');
  }
}

/* ---------- Colisão bola x paddles ---------- */
function isColliding() {
  const topOfBall    = ball.y - ball.radius;
  const bottomOfBall = ball.y + ball.radius;

  // Paddle do jogador
  if (
    ball.x >= paddleOne.x - paddleOne.width &&
    ball.x <= paddleOne.x + paddleOne.width &&
    topOfBall    <= paddleOne.y + paddleOne.height &&
    bottomOfBall >= paddleOne.y - paddleOne.height
  ) {
    playerCollisionEvent();
  }
  // Paddle da IA
  else if (
    ball.x >= paddleTwo.x - paddleTwo.width &&
    ball.x <= paddleTwo.x + paddleTwo.width &&
    topOfBall    <= paddleTwo.y + paddleTwo.height &&
    bottomOfBall >= paddleTwo.y - paddleTwo.height
  ) {
    computerCollisionEvent();
  }
}

function playerCollisionEvent() {
  ball.velocity.x  *= -1.05;
  ball.x            = paddleOne.x + paddleOne.width + 5;

  const xVel           = ball.velocity.x;
  const maxTopSlope    = (courtTopRightY    - (paddleOne.y - paddleOne.height))
                       / (courtTopRightX    - (paddleOne.x + paddleOne.width));
  const maxBottomSlope = (courtBottomRightY - (paddleOne.y + paddleOne.height))
                       / (courtBottomRightX - (paddleOne.x + paddleOne.width));

  if (ball.y < paddleOne.y) {
    ball.velocity.y = map(random(-4, 0), -4, 0, xVel * maxTopSlope, 0);
  } else {
    ball.velocity.y = map(random(0, 4),  0, 4, 0, xVel * maxBottomSlope);
  }
}

function computerCollisionEvent() {
  ball.velocity.x  *= -1.05;
  ball.x            = paddleTwo.x - paddleTwo.width - 4;

  const xVel           = ball.velocity.x;
  const maxTopSlope    = (courtTopLeftY    - (paddleTwo.y - paddleTwo.height))
                       / (courtTopLeftX    - (paddleTwo.x - paddleTwo.width));
  const maxBottomSlope = (courtBottomLeftY - (paddleTwo.y + paddleTwo.height))
                       / (courtBottomLeftX - (paddleTwo.x - paddleTwo.width));

  if (ball.y < paddleTwo.y) {
    ball.velocity.y = map(random(-4, 0), -4, 0, xVel * maxTopSlope, 0);
  } else {
    ball.velocity.y = map(random(0, 4),  0, 4, 0, xVel * maxBottomSlope);
  }
}

/* ---------- Colisão bola x paredes ---------- */
function didHitWall() {
  if (ball.y <= courtTopLeftY || ball.y >= courtBottomLeftY) {
    ball.velocity.y *= -1;
    // Corrige posição para não grudar na parede
    if (ball.y <= courtTopLeftY)    ball.y = courtTopLeftY + 1;
    if (ball.y >= courtBottomLeftY) ball.y = courtBottomLeftY - 1;
  }
}

/* ---------- Pontuação ---------- */
function didScore() {
  if (ball.x <= courtBottomLeftX) {
    rightPlayerScore++;
    rightScoreScale = 1.5;
    scaleTimer = 10;
    resetBall();
  } else if (ball.x >= courtTopRightX) {
    leftPlayerScore++;
    leftScoreScale = 1.5;
    scaleTimer = 10;
    resetBall();
  }

  // Condição de vitória: jogador chegou a 5 pontos
  if (leftPlayerScore >= 5 && !gameFinished) {
    gameFinished = true;
    // Exibe mensagem de vitória por 1 frame a mais
    push();
    fill(255, 215, 0);
    textSize(min(gameW * 0.045, 38));
    textAlign(CENTER, CENTER);
    noStroke();
    text('VITÓRIA! ACESSO VIP LIBERADO 🏆', gameW / 2, gameH / 2);
    pop();
    setTimeout(unlockSite, 1100);
  }
}

function resetBall() {
  ball.x        = gameW * 0.5;
  ball.y        = gameH * 0.5;
  ball.shadowY  = gameH * 0.5;
  // Inverte a direção horizontal entre pontos
  const dir     = ball.velocity.x < 0 ? 1 : -1;
  ball.velocity.x = dir * ball.radius * 0.21;
  ball.velocity.y = random(-ball.radius * 0.084, ball.radius * 0.084);
}

/* ---------- Arco da bola (perspectiva isométrica) ---------- */
function updateBall() {
  maxBallArc        = gameH * 0.0625;
  courtWidth        = gameW - (2 * padding) - quadOffset;
  oneFourthPoint    = courtBottomLeftX + quadOffset * 0.5 + courtWidth * 0.25;
  threeFourthsPoint = courtTopRightX   - quadOffset * 0.5 - courtWidth * 0.25;

  const oneRacketX = paddleOne.x + paddleOne.width;
  const twoRacketX = paddleTwo.x - paddleTwo.width;

  let ballArc;

  if (ball.velocity.x > 0) {
    if      (ball.x <= gameW * 0.5)     ballArc = map(ball.x, oneRacketX,       gameW * 0.5,     maxBallArc * 0.5, maxBallArc);
    else if (ball.x <= threeFourthsPoint) ballArc = map(ball.x, gameW * 0.5,   threeFourthsPoint, maxBallArc,       0);
    else                                  ballArc = map(ball.x, threeFourthsPoint, twoRacketX,    0,                maxBallArc * 0.5);
  } else {
    if      (ball.x >= gameW * 0.5)     ballArc = map(ball.x, twoRacketX,       gameW * 0.5,     maxBallArc * 0.5, maxBallArc);
    else if (ball.x >= oneFourthPoint)  ballArc = map(ball.x, gameW * 0.5,     oneFourthPoint,    maxBallArc,       0);
    else                                ballArc = map(ball.x, oneFourthPoint,   oneRacketX,       0,                maxBallArc * 0.5);
  }

  ball.update(ballArc);
}

/* ---------- Desenho da pista ---------- */
function drawTrack() {
  // Quadrilátero vermelho (pista)
  noStroke();
  fill(170, 15, 15);
  quad(
    courtTopLeftX,     courtTopLeftY,
    courtBottomLeftX,  courtBottomLeftY,
    courtBottomRightX, courtBottomRightY,
    courtTopRightX,    courtTopRightY
  );
  // Bordas brancas
  stroke(255);
  strokeWeight(3);
  line(courtTopLeftX,    courtTopLeftY,    courtTopRightX,    courtTopRightY);
  line(courtBottomLeftX, courtBottomLeftY, courtBottomRightX, courtBottomRightY);
  noStroke();
}

/* ---------- Linha de chegada xadrez ---------- */
function drawFinishLine() {
  const sqSize = gameH * 0.04;
  const startX = gameW * 0.5 - sqSize;
  noStroke();

  for (let y = padding; y < gameH - padding; y += sqSize) {
    for (let col = 0; col < 2; col++) {
      const isWhite = (col + Math.floor((y - padding) / sqSize)) % 2 === 0;
      fill(isWhite ? 255 : 0);
      rect(startX + col * sqSize, y, sqSize, sqSize);
    }
  }
}

/* ---------- Placar ---------- */
function drawScore() {
  push();
  textStyle(BOLD);
  noStroke();
  const scoreSize = gameH * 0.10;

  // Placar do jogador (esquerda) — dourado
  push();
  translate(padding + quadOffset + courtWidth * 0.25, padding - 12);
  scale(leftScoreScale);
  textSize(scoreSize);
  fill('#ffcc00');
  textAlign(RIGHT, BOTTOM);
  text(leftPlayerScore, 0, 0);
  pop();

  // Placar da IA (direita) — azul claro
  push();
  translate(gameW - padding - courtWidth * 0.25, padding - 12);
  scale(rightScoreScale);
  textSize(scoreSize);
  fill('#66ccff');
  textAlign(LEFT, BOTTOM);
  text(rightPlayerScore, 0, 0);
  pop();

  pop();
}