export class ScoreBoard {
    constructor(difficultyManager) {
        this.score = 0;
        this.scoreElement = document.getElementById('score');
        this.difficultyManager = difficultyManager;
        this.multiplier = 1;
    }

    increment() {
        const difficultyMultiplier = this.difficultyManager.getScoreMultiplier();
        this.score += 10 * difficultyMultiplier * this.multiplier;
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