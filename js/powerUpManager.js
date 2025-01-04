export class PowerUpManager {
    constructor(grid) {
        this.grid = grid;
        this.activePowerUp = null;
        this.powerUpPosition = null;
        this.effectTimer = null;
        this.powerUpTimer = null;
        this.spawnTimer = null;
        this.spawnDelay = 10000;
        this.powerUpDuration = 7000;
        
        this.types = {
            speedBoost: {
                duration: 5000,
                color: '#00ffff',
                icon: '⚡',
                effect: 'Vitesse x2',
                probability: 0.3
            },
            scoreMultiplier: {
                duration: 8000,
                color: '#ffff00',
                icon: '💎',
                effect: 'Score x3',
                probability: 0.3
            },
            timeFreeze: {
                duration: 6000,
                color: '#ffffff',
                icon: '❄️',
                effect: 'Ralentit le temps',
                probability: 0.2
            }
        };

        this.reset();
    }

    spawnPowerUp() {
        if (!this.powerUpPosition && !this.spawnTimer) {
            this.spawnTimer = setTimeout(() => {
                const availableTypes = Object.keys(this.types);
                const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                
                const maxX = this.grid.width / this.grid.cellSize;
                const maxY = this.grid.height / this.grid.cellSize;
                
                this.activePowerUp = randomType;

                // Trouver une position valide
                let attempts = 0;
                do {
                    this.powerUpPosition = {
                        x: Math.floor(Math.random() * maxX) * this.grid.cellSize,
                        y: Math.floor(Math.random() * maxY) * this.grid.cellSize
                    };
                    attempts++;
                } while (this.checkCollisionWithSnake(window.game.snake.segments) && attempts < 100);

                if (attempts >= 100) {
                    this.powerUpPosition = null;
                    return;
                }

                this.powerUpTimer = setTimeout(() => {
                    this.removePowerUp();
                }, this.powerUpDuration);
                
                this.spawnTimer = null;
            }, this.spawnDelay);
        }
    }

    checkCollisionWithSnake(segments) {
        return segments.some(segment => 
            segment.x === this.powerUpPosition.x && 
            segment.y === this.powerUpPosition.y
        );
    }

    removePowerUp() {
        if (this.powerUpTimer) {
            clearTimeout(this.powerUpTimer);
            this.powerUpTimer = null;
        }
        this.powerUpPosition = null;
        this.activePowerUp = null;
    }

    collectPowerUp(snake, game) {
        if (!this.powerUpPosition) return;

        const head = snake.segments[0];
        if (head.x === this.powerUpPosition.x && head.y === this.powerUpPosition.y) {
            const powerUp = this.types[this.activePowerUp];
            this.activateEffect(powerUp, game);
            this.removePowerUp();
            return true;
        }
        return false;
    }

    activateEffect(powerUp, game) {
        if (this.effectTimer) {
            clearTimeout(this.effectTimer);
        }

        this.activeEffect = this.activePowerUp;

        switch (this.activePowerUp) {
            case 'speedBoost':
                const currentSpeed = game.difficultyManager.getSpeed();
                const boostedSpeed = currentSpeed / 2;  // Deux fois plus rapide
                game.setGameSpeed(boostedSpeed);
                break;
            case 'scoreMultiplier':
                game.setScoreMultiplier(3);
                break;
            case 'timeFreeze':
                const baseSpeed = game.difficultyManager.getSpeed();
                const frozenSpeed = baseSpeed * 1.5;  // 50% plus lent
                game.setGameSpeed(frozenSpeed);
                break;
        }

        this.showPowerUpUI(powerUp);

        this.effectTimer = setTimeout(() => {
            this.deactivateEffect(game);
            this.activeEffect = null;
        }, powerUp.duration);
    }

    deactivateEffect(game) {
        if (!this.activeEffect) return;

        switch (this.activeEffect) {
            case 'speedBoost':
            case 'timeFreeze':
                game.resetGameSpeed();
                break;
            case 'scoreMultiplier':
                game.resetScoreMultiplier();
                break;
        }

        this.hidePowerUpUI();
        this.activeEffect = null;
    }

    draw(ctx) {
        if (this.powerUpPosition) {
            const powerUp = this.types[this.activePowerUp];
            
            // Effet de lueur
            ctx.shadowBlur = 15;
            ctx.shadowColor = powerUp.color;
            
            // Dessiner le fond
            ctx.fillStyle = powerUp.color;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(
                this.powerUpPosition.x + this.grid.cellSize/2,
                this.powerUpPosition.y + this.grid.cellSize/2,
                this.grid.cellSize * 0.8,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Dessiner l'icône
            ctx.globalAlpha = 1;
            ctx.font = `${this.grid.cellSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                powerUp.icon,
                this.powerUpPosition.x + this.grid.cellSize/2,
                this.powerUpPosition.y + this.grid.cellSize/2
            );
            
            // Réinitialiser les effets
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }

    showPowerUpUI(powerUp) {
        const ui = document.querySelector('.power-up-ui') || this.createPowerUpUI();
        const icon = ui.querySelector('.power-up-icon');
        const timer = ui.querySelector('.power-up-timer');
        const name = ui.querySelector('.power-up-name');

        icon.textContent = powerUp.icon;
        name.textContent = powerUp.effect;
        ui.style.setProperty('--power-up-color', powerUp.color);
        ui.classList.add('active');

        // Réinitialiser et redémarrer l'animation du timer
        timer.style.animation = 'none';
        timer.offsetHeight; // Force reflow
        timer.style.animation = `powerUpTimer ${powerUp.duration}ms linear forwards`;
    }

    createPowerUpUI() {
        const ui = document.createElement('div');
        ui.className = 'power-up-ui';
        ui.innerHTML = `
            <div class="power-up-icon"></div>
            <div class="power-up-info">
                <div class="power-up-name"></div>
                <div class="power-up-timer"></div>
            </div>
        `;
        document.body.appendChild(ui);
        return ui;
    }

    hidePowerUpUI() {
        const ui = document.querySelector('.power-up-ui');
        if (ui) {
            ui.classList.remove('active');
            const timer = ui.querySelector('.power-up-timer');
            if (timer) {
                timer.style.animation = 'none';
            }
            ui.style.setProperty('--power-up-color', '#0ff');
        }
    }

    reset() {
        if (this.powerUpTimer) {
            clearTimeout(this.powerUpTimer);
        }
        if (this.spawnTimer) {
            clearTimeout(this.spawnTimer);
        }
        if (this.effectTimer) {
            clearTimeout(this.effectTimer);
        }

        this.powerUpTimer = null;
        this.spawnTimer = null;
        this.effectTimer = null;
        this.powerUpPosition = null;
        this.activePowerUp = null;
        this.activeEffect = null;

        this.hidePowerUpUI();
        
        if (window.game) {
            window.game.resetGameSpeed();
            window.game.resetScoreMultiplier();
        }
    }
} 