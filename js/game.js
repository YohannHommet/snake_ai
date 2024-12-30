import { SoundManager } from './soundManager.js';
import { HighScoreManager } from './highScoreManager.js';
import { ParticleSystem } from './particleSystem.js';
import { PowerUpManager } from './powerUpManager.js';
import { VisualEffects } from './visualEffects.js';

const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

export class Game {
    constructor(canvas, snake, food, grid, scoreBoard, difficultyManager) {
        // Éléments de base du jeu
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.grid = grid;
        
        // Entités du jeu
        this.snake = snake;
        this.food = food;
        this.scoreBoard = scoreBoard;
        
        // Gestionnaires
        this.difficultyManager = difficultyManager;
        this.powerUpManager = new PowerUpManager(grid);
        this.soundManager = new SoundManager();
        this.highScoreManager = new HighScoreManager();
        this.particleSystem = new ParticleSystem();
        this.glitchEffects = new VisualEffects(canvas);
        
        // État du jeu
        this.state = GameState.MENU;
        this.isRunning = false;
        this.baseSpeed = difficultyManager.getSpeed();
        
        // Gestion de la boucle de jeu
        this.frameId = null;
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        
        // Effets visuels
        this.flashEffect = 0;
        
        // Contrôles
        this.directionQueue = [];
        
        // Initialisation
        this.bindEvents();
        this.updateHighScoresDisplay();
        this.updateDifficultyDisplay();
    }

    setState(newState) {
        this.state = newState;
        this.handleStateChange();
    }

    handleStateChange() {
        switch(this.state) {
            case GameState.MENU:
                this.pause();
                break;
            case GameState.PLAYING:
                this.start();
                break;
            case GameState.PAUSED:
                this.pause();
                break;
            case GameState.GAME_OVER:
                this.reset();
                break;
        }
    }

    start() {
        if (this.isRunning) return;
        
        // Réinitialisation complète de l'état
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        
        this.isRunning = true;
        this.soundManager.play('start');
        this.lastTime = performance.now();
        
        // S'assurer que la vitesse est correctement initialisée
        this.baseSpeed = this.difficultyManager.getSpeed();
        
        this.frameId = requestAnimationFrame(this.gameLoop);
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        const speed = this.difficultyManager.getSpeed();
        
        if (deltaTime >= speed || !this.lastTime) {  // Ajout d'une condition pour le premier frame
            this.update();
            this.lastTime = currentTime;
            this.draw();
        }
        
        this.frameId = requestAnimationFrame(this.gameLoop);
    }

    pause() {
        this.isRunning = false;
        this.soundManager.play('pause');
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    reset() {
        this.pause();
        this.soundManager.play('gameOver');
        
        this.powerUpManager.reset();
        const finalScore = this.scoreBoard.score;
        if (this.highScoreManager.isHighScore(finalScore)) {
            this.soundManager.play('highScore');
            this.highScoreManager.addScore(finalScore);
            this.updateHighScoresDisplay();
        }
        
        this.snake.reset();
        this.food.relocate();
        this.scoreBoard.reset();
        this.draw();
    }

    update() {
        this.snake.update();
        this.particleSystem.update();
        this.powerUpManager.spawnPowerUp();

        if (this.flashEffect > 0) {
            this.flashEffect -= 0.1;
        }

        if (this.snake.checkCollision()) {
            this.reset();
            return;
        }

        const head = this.snake.segments[0];
        if (head.x === this.food.position.x && head.y === this.food.position.y) {
            this.snake.grow();
            this.particleSystem.createFoodCollectionEffect(
                head.x + this.grid.cellSize/2,
                head.y + this.grid.cellSize/2,
                '#f0f'
            );
            this.flashEffect = 1.0;
            
            this.food.relocate();
            this.scoreBoard.increment();
            this.soundManager.play('eat');
        }

        if (this.powerUpManager.collectPowerUp(this.snake, this)) {
            this.soundManager.play('powerUp');
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.flashEffect > 0) {
            this.ctx.save();
            this.ctx.fillStyle = `rgba(255, 0, 255, ${this.flashEffect * 0.2})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }

        this.snake.draw(this.ctx);
        this.food.draw(this.ctx);
        this.powerUpManager.draw(this.ctx);
        this.particleSystem.draw(this.ctx);
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            const directions = {
                'ArrowUp': { x: 0, y: -1 },
                'ArrowDown': { x: 0, y: 1 },
                'ArrowLeft': { x: -1, y: 0 },
                'ArrowRight': { x: 1, y: 0 }
            };

            if (e.key.toLowerCase() === 'm') {
                const isMuted = this.soundManager.toggleMute();
                return;
            }

            if (directions[e.key]) {
                e.preventDefault();
                const newDirection = directions[e.key];
                const currentDirection = this.snake.direction;
                if (!(newDirection.x === -currentDirection.x && newDirection.y === -currentDirection.y)) {
                    this.snake.setDirection(newDirection);
                }
            }
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.setState(GameState.PLAYING);
        });

        document.getElementById('pauseButton').addEventListener('click', () => {
            this.setState(this.state === GameState.PLAYING ? GameState.PAUSED : GameState.PLAYING);
        });

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isRunning) return;
                
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const difficulty = btn.dataset.difficulty;
                this.difficultyManager.setDifficulty(difficulty);
                this.updateDifficultyDisplay();
            });
        });
    }

    updateHighScoresDisplay() {
        const highScoresList = document.getElementById('highScoresList');
        const scores = this.highScoreManager.getScores();
        
        highScoresList.innerHTML = scores.map((score, index) => `
            <div class="high-score-item">
                <span>${index + 1}. ${score.score}</span>
                <span class="score-date">${score.date}</span>
            </div>
        `).join('');
    }

    updateDifficultyDisplay() {
        const config = this.difficultyManager.getCurrentConfig();
        const difficultyDisplay = document.querySelector('.current-difficulty');
        difficultyDisplay.textContent = `DIFFICULTY: ${config.name}`;
        difficultyDisplay.style.color = config.color;
    }

    setGameSpeed(speed) {
        this.baseSpeed = speed;
    }

    resetGameSpeed() {
        this.baseSpeed = this.difficultyManager.getSpeed();
    }

    setGhostMode(enabled) {
        this.ghostMode = enabled;
    }

    setScoreMultiplier(multiplier) {
        this.scoreBoard.setMultiplier(multiplier);
    }

    resetScoreMultiplier() {
        this.scoreBoard.resetMultiplier();
    }
} 