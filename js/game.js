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
        this.frameTime = 1000 / 60;  // Cibler 60 FPS
        this.accumulator = 0;
        this.maxAccumulator = 200;    // Éviter le spiral de la mort
        
        // Effets visuels
        this.flashEffect = 0;
        
        // Contrôles
        this.directionQueue = [];
        
        // Initialisation
        this.bindEvents();
        this.updateHighScoresDisplay();
        this.updateDifficultyDisplay();
        
        // Gestion des power-ups
        this.currentSpeed = difficultyManager.getSpeed();
        this.baseSpeed = this.currentSpeed;
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
        this.accumulator = 0;  // Réinitialiser l'accumulateur
        
        // S'assurer que la vitesse est correctement initialisée
        this.baseSpeed = this.difficultyManager.getSpeed();
        
        this.frameId = requestAnimationFrame(this.gameLoop);
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculer le temps écoulé depuis la dernière frame
        const deltaTime = Math.min(currentTime - this.lastTime, this.maxAccumulator);
        this.accumulator += deltaTime;
        
        // Mettre à jour la logique du jeu à un pas de temps fixe
        while (this.accumulator >= this.currentSpeed) {
            this.update();
            this.accumulator -= this.currentSpeed;
        }
        
        // Dessiner à chaque frame pour une animation fluide
        this.draw();
        
        this.lastTime = currentTime;
        this.frameId = requestAnimationFrame(this.gameLoop);
    }

    pause() {
        this.isRunning = false;
        this.soundManager.play('pause');
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        this.accumulator = 0;  // Réinitialiser l'accumulateur à la pause
    }

    reset() {
        // Arrêter le jeu d'abord
        this.pause();
        this.soundManager.play('gameOver');
        
        // Réinitialiser les power-ups avant tout
        this.powerUpManager.reset();
        
        // Réinitialiser les vitesses et multiplicateurs
        this.currentSpeed = this.difficultyManager.getSpeed();
        this.baseSpeed = this.currentSpeed;
        
        const finalScore = this.scoreBoard.score;
        if (this.highScoreManager.isHighScore(finalScore)) {
            this.soundManager.play('highScore');
            this.highScoreManager.addScore(finalScore);
            this.updateHighScoresDisplay();
        }
        
        // Réinitialiser les autres éléments
        this.snake.reset();
        this.food.relocate();
        this.scoreBoard.reset();
        
        // S'assurer que l'UI est à jour
        this.draw();
        this.updateDifficultyDisplay();
        
        // Réinitialiser les timings
        this.accumulator = 0;
        this.lastTime = 0;
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

            // Gestion du son (M)
            if (e.key.toLowerCase() === 'm') {
                this.soundManager.toggleMute();
                return;
            }
            
            // Gestion de la pause (Espace)
            if (e.code === 'Space') {
                e.preventDefault(); // Empêcher le défilement de la page
                this.setState(this.state === GameState.PLAYING ? GameState.PAUSED : GameState.PLAYING);
                return;
            }

            // Gestion de la pause (Entrée)
            if (e.code === 'Enter') {
                e.preventDefault();
                this.setState(this.state === GameState.PLAYING ? GameState.PAUSED : GameState.PLAYING);
                return;
            }

            // Gestion des directions
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
                const newSpeed = this.difficultyManager.setDifficulty(difficulty);
                this.currentSpeed = newSpeed;
                this.baseSpeed = newSpeed;
                this.updateDifficultyDisplay();
            });
        });
    }

    updateHighScoresDisplay() {
        const highScoresList = document.getElementById('highScoresList');
        const highScoresContainer = document.querySelector('.high-scores-container');
        const scores = this.highScoreManager.getScores();
        
        highScoresContainer.classList.toggle('hidden', scores.length === 0);
        
        if (scores.length > 0) {
            highScoresList.innerHTML = scores.map((score, index) => `
                <div class="high-score-item">
                    <span>${index + 1}. ${score.score}</span>
                    <span class="score-date">${score.date}</span>
                </div>
            `).join('');

            highScoresContainer.style.display = 'block';
        }
    }

    updateDifficultyDisplay() {
        const config = this.difficultyManager.getCurrentConfig();
        const difficultyDisplay = document.querySelector('.current-difficulty');
        difficultyDisplay.textContent = `DIFFICULTY: ${config.name}`;
        difficultyDisplay.style.color = config.color;
    }

    setGameSpeed(speed) {
        this.currentSpeed = speed;
    }

    resetGameSpeed() {
        this.currentSpeed = this.difficultyManager.getSpeed();
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

    getCurrentSpeed() {
        return {
            currentSpeed: this.currentSpeed,
            baseSpeed: this.baseSpeed,
            difficultySpeed: this.difficultyManager.getSpeed()
        };
    }
} 