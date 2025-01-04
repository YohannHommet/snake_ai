export class ScoreBoard {
    constructor(difficultyManager) {
        this.score = 0;
        this.scoreElement = document.getElementById('score');
        this.difficultyManager = difficultyManager;
        this.multiplier = 1;
        this.basePoints = 10;
    }

    increment() {
        const difficultyMultiplier = this.difficultyManager.getScoreMultiplier();
        const totalPoints = this.basePoints * difficultyMultiplier * this.multiplier;
        this.score += totalPoints;
        this.update();
    }

    reset() {
        this.score = 0;
        this.multiplier = 1;
        this.update();
    }

    update() {
        this.scoreElement.textContent = this.score;
    }

    setMultiplier(value) {
        this.multiplier = value;
    }

    resetMultiplier() {
        this.multiplier = 1;
    }
} 