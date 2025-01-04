export class DifficultyManager {
    constructor() {
        this.difficulties = {
            easy: {
                speed: 150,
                scoreMultiplier: 1,
                name: 'EASY',
                color: '#0ff'
            },
            medium: {
                speed: 100,
                scoreMultiplier: 2,
                name: 'MEDIUM',
                color: '#ff0'
            },
            hard: {
                speed: 60,
                scoreMultiplier: 3,
                name: 'HARD',
                color: '#f0f'
            }
        };
        
        this.currentDifficulty = 'medium';
    }

    getCurrentConfig() {
        return this.difficulties[this.currentDifficulty];
    }

    setDifficulty(level) {
        if (this.difficulties[level]) {
            this.currentDifficulty = level;
            return this.difficulties[level].speed;
        }
        
        return null;
    }

    getSpeed() {
        return this.difficulties[this.currentDifficulty].speed;
    }

    getScoreMultiplier() {
        return this.difficulties[this.currentDifficulty].scoreMultiplier;
    }
} 