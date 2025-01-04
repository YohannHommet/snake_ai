export class ProgressionSystem {
    constructor() {
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 1000;
        this.unlockedThemes = ['default'];
        this.unlockedPowerUps = ['speedBoost', 'scoreMultiplier', 'timeFreeze'];
        
        // Charger la progression sauvegardée
        this.loadProgress();
        
        // Créer le conteneur de notifications
        this.createNotificationsContainer();
    }

    addXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
        this.saveProgress();
        this.updateUI();
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel *= 1.25;
        this.checkUnlocks();
    }

    checkUnlocks() {
        // Débloquer des récompenses basées sur le niveau
        switch(this.level) {
            case 5:
                this.unlockTheme('synthwave');
                break;
            case 10:
                this.unlockPowerUp('timeWarp');
                break;
            case 15:
                this.unlockTheme('matrix');
                break;
            case 20:
                this.unlockPowerUp('ghostMode');
                break;
        }
    }

    unlockTheme(theme) {
        if (!this.unlockedThemes.includes(theme)) {
            this.unlockedThemes.push(theme);
            this.showUnlockNotification('Theme', this.getThemeName(theme));
        }
    }

    unlockPowerUp(powerUp) {
        if (!this.unlockedPowerUps.includes(powerUp)) {
            this.unlockedPowerUps.push(powerUp);
            const powerUpInfo = window.game.powerUpManager.types[powerUp];
            this.showUnlockNotification('Power-up', `${powerUpInfo.icon} ${powerUpInfo.effect}`);
        }
    }

    getThemeName(theme) {
        const themes = {
            'default': 'Classic',
            'synthwave': 'Synthwave',
            'matrix': 'Matrix'
        };
        return themes[theme] || theme;
    }

    showUnlockNotification(type, item) {
        const notification = document.createElement('div');
        notification.className = 'unlock-notification';
        notification.innerHTML = `
            <h3>New ${type} Unlocked!</h3>
            <p>${item}</p>
        `;
        document.querySelector('.notifications-container').appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'none';
            notification.offsetHeight; // Force reflow
            notification.style.animation = 'notification-fade-up 2s forwards';
            setTimeout(() => notification.remove(), 4000);
        }, 0);
    }

    updateUI() {
        const progressBar = document.querySelector('.xp-progress');
        if (progressBar) {
            const progress = (this.xp / this.xpToNextLevel) * 100;
            progressBar.style.width = `${progress}%`;
            document.querySelector('.level-display').textContent = `Level ${this.level}`;
            document.querySelector('.xp-display').textContent = `${this.xp}/${Math.floor(this.xpToNextLevel)}`;
        }
    }

    saveProgress() {
        const progress = {
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            unlockedThemes: this.unlockedThemes,
            unlockedPowerUps: this.unlockedPowerUps
        };
        localStorage.setItem('snakeProgress', JSON.stringify(progress));
    }

    loadProgress() {
        const saved = localStorage.getItem('snakeProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.level = progress.level;
            this.xp = progress.xp;
            this.xpToNextLevel = progress.xpToNextLevel;
            this.unlockedThemes = progress.unlockedThemes;
            this.unlockedPowerUps = progress.unlockedPowerUps;
        }
    }

    reset() {
        localStorage.removeItem('snakeProgress');
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 1000;
        this.unlockedThemes = ['default'];
        this.unlockedPowerUps = ['speedBoost', 'scoreMultiplier', 'timeFreeze'];
        this.updateUI();
    }

    createNotificationsContainer() {
        if (!document.querySelector('.notifications-container')) {
            const container = document.createElement('div');
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
    }
} 