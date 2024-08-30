const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const newGameBtn = document.getElementById('newGameBtn');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chickenImg = new Image();
chickenImg.src = 'static/images/chicken.png';

const bulletImg = new Image();
bulletImg.src = 'static/images/bullet.png';

const shipImg = new Image();
shipImg.src = 'static/images/ship.png';

const explosionImg = new Image();
explosionImg.src = 'static/images/explosion.png';

// Sound effects
const shootSound = new Audio('static/sounds/shoot.mp3');
const explosionSound = new Audio('static/sounds/explosion.mp3');
const backgroundMusic = new Audio('static/sounds/background.mp3');

backgroundMusic.loop = true; // Loop background music
backgroundMusic.play(); // Play background music when the game starts

let chickens = [];
let bullets = [];
let ship = { x: canvas.width / 2, y: canvas.height - 100, width: 100, height: 100, speed: 5 };
let score = 0;
let gameOver = false;
let firingInterval = null;

let chickenSpawnInterval = 500;
let chickenSpeedMultiplier = 1;
let chickenSpawnMultiplier = 1;

function drawChicken() {
    chickens.forEach((chicken, index) => {
        ctx.drawImage(chickenImg, chicken.x, chicken.y, chicken.width, chicken.height);
        chicken.y += chicken.speed;

        if (chicken.y > canvas.height) {
            chickens.splice(index, 1);
        }

        if (isCollision(chicken, ship)) {
            gameOver = true;
        }
    });
}

function drawBullets() {
    bullets.forEach((bullet, index) => {
        ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y -= bullet.speed;

        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function drawShip() {
    ctx.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
}

function drawExplosions() {
    bullets.forEach((bullet, bulletIndex) => {
        chickens.forEach((chicken, chickenIndex) => {
            if (isCollision(bullet, chicken)) {
                ctx.drawImage(explosionImg, chicken.x, chicken.y, chicken.width, chicken.height);
                explosionSound.play(); // Play explosion sound
                chickens.splice(chickenIndex, 1);
                bullets.splice(bulletIndex, 1);
                score += 1;
            }
        });
    });
}

function isCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function spawnChicken() {
    const size = 50;
    const x = Math.random() * (canvas.width - size);
    chickens.push({ x, y: -size, width: size, height: size, speed: 2 * chickenSpeedMultiplier });
}

function fireBullet() {
    const size = 40;
    bullets.push({ x: ship.x + ship.width / 2 - size / 2, y: ship.y, width: size, height: size, speed: 10 });
    shootSound.play(); // Play shooting sound
}

function updateShipPosition(x) {
    ship.x = Math.min(Math.max(x - ship.width / 2, 0), canvas.width - ship.width);
}

function handleTouchStart(x, y) {
    updateShipPosition(x);
    firingInterval = setInterval(fireBullet, 200);
}

function handleTouchMove(x) {
    updateShipPosition(x);
}

function handleTouchEnd() {
    clearInterval(firingInterval);
    firingInterval = null;
}

function getTouchPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    const { x } = getTouchPosition(event);
    handleTouchStart(x);
});

canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    const { x } = getTouchPosition(event);
    handleTouchMove(x);
});

canvas.addEventListener('touchend', () => {
    handleTouchEnd();
});

document.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    updateShipPosition(mouseX);
});

document.addEventListener('click', () => {
    if (!gameOver) {
        fireBullet();
    }
});

function resetGame() {
    chickens = [];
    bullets = [];
    ship = { x: canvas.width / 2, y: canvas.height - 60, width: 60, height: 60, speed: 5 };
    score = 0;
    gameOver = false;
    chickenSpawnInterval = 500;
    chickenSpeedMultiplier = 1;
    chickenSpawnMultiplier = 1;
    newGameBtn.style.display = 'none';
    backgroundMusic.play(); // Restart background music
}

function increaseDifficulty() {
    chickenSpawnMultiplier = Math.min(chickenSpawnMultiplier * 1.2, 2);
    chickenSpeedMultiplier = Math.min(chickenSpeedMultiplier * 1.1, 1.5);
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnChicken, chickenSpawnInterval / chickenSpawnMultiplier);
}

function gameLoop() {
    if (gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '48px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
        newGameBtn.style.display = 'block';
        backgroundMusic.pause(); // Pause background music on game over
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawChicken();
    drawBullets();
    drawExplosions();
    drawShip();

    ctx.font = '24px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'red';
    ctx.fillText(`Score: ${score}`, canvas.width - 10, 30);

    requestAnimationFrame(gameLoop);
}

let spawnInterval = setInterval(spawnChicken, chickenSpawnInterval);
setInterval(increaseDifficulty, 1000);

newGameBtn.addEventListener('click', () => {
    resetGame();
    gameLoop();
});

gameLoop();
