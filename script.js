// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Paddle Object
const paddleWidth = 10;
const paddleHeight = 80;

const player1 = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6,
    score: 0
};

const player2 = {
    x: canvas.width - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5,
    score: 0
};

// Ball Object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 4,
    dy: 4,
    speed: 4,
    maxSpeed: 8
};

// Game Variables
let gameRunning = true;
const winScore = 11;
let keys = {};

// Mouse position tracking
let mouseY = canvas.height / 2;

// Event Listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key.toLowerCase() === 'r') {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.getElementById('resetButton').addEventListener('click', resetGame);

// Update function
function update() {
    // Player 1 Control (Mouse and Keyboard)
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player1.y = Math.max(0, player1.y - player1.speed);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player1.y = Math.min(canvas.height - player1.height, player1.y + player1.speed);
    }

    // Mouse control for Player 1
    const mouseCenter = player1.height / 2;
    if (mouseY - mouseCenter > player1.y) {
        player1.y = Math.min(canvas.height - player1.height, player1.y + player1.speed);
    } else if (mouseY - mouseCenter < player1.y) {
        player1.y = Math.max(0, player1.y - player1.speed);
    }

    // Player 2 AI Control
    const player2Center = player2.y + player2.height / 2;
    if (player2Center < ball.y - 35) {
        player2.y = Math.min(canvas.height - player2.height, player2.y + player2.speed);
    } else if (player2Center > ball.y + 35) {
        player2.y = Math.max(0, player2.y - player2.speed);
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }

    // Ball collision with paddles
    if (
        ball.x - ball.radius < player1.x + player1.width &&
        ball.y > player1.y &&
        ball.y < player1.y + player1.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player1.x + player1.width + ball.radius;

        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player1.y + player1.height / 2)) / (player1.height / 2);
        ball.dy = hitPos * ball.maxSpeed;
    }

    if (
        ball.x + ball.radius > player2.x &&
        ball.y > player2.y &&
        ball.y < player2.y + player2.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player2.x - ball.radius;

        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player2.y + player2.height / 2)) / (player2.height / 2);
        ball.dy = hitPos * ball.maxSpeed;
    }

    // Ball out of bounds - scoring
    if (ball.x - ball.radius < 0) {
        player2.score++;
        updateScore();
        resetBall();
    }

    if (ball.x + ball.radius > canvas.width) {
        player1.score++;
        updateScore();
        resetBall();
    }

    // Check for winner
    if (player1.score >= winScore || player2.score >= winScore) {
        gameRunning = false;
        const winner = player1.score >= winScore ? 'Player 1' : 'Computer';
        document.getElementById('gameStatus').innerHTML = `<span class="winner-message">${winner} Wins! 🎉</span>`;
    }
}

// Draw function
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
    ctx.fillRect(player2.x, player2.y, player2.width, player2.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Update score display
function updateScore() {
    document.getElementById('player1Score').textContent = player1.score;
    document.getElementById('player2Score').textContent = player2.score;

    if (gameRunning) {
        document.getElementById('gameStatus').textContent = `Score: ${player1.score} - ${player2.score}`;
    }
}

// Reset ball position
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.dy = (Math.random() - 0.5) * 4;
}

// Reset entire game
function resetGame() {
    player1.score = 0;
    player2.score = 0;
    player1.y = canvas.height / 2 - paddleHeight / 2;
    player2.y = canvas.height / 2 - paddleHeight / 2;
    gameRunning = true;
    resetBall();
    updateScore();
    document.getElementById('gameStatus').textContent = 'Ready to Play!';
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateScore();
gameLoop();
