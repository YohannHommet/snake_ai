export class HighScoreManager {
    constructor() {
        // Stockage local
        this.storage = window.localStorage;
        
        // Configuration
        this.maxScores = 5;  // Nombre maximum de scores à conserver
        
        // Chargement des scores
        this.scores = this.loadScores();
    }

    loadScores() {
        try {
            const scores = this.storage.getItem('snakeHighScores');
            return scores ? JSON.parse(scores) : [];
        } catch (error) {
            console.error('Error loading scores:', error);
            return [];
        }
    }

    saveScores() {
        try {
            this.storage.setItem('snakeHighScores', JSON.stringify(this.scores));
            return true;
        } catch (error) {
            console.error('Error saving scores:', error);
            return false;
        }
    }

    addScore(score) {
        try {
            const date = new Date().toLocaleDateString();
            this.scores.push({ score, date });
            this.scores.sort((a, b) => b.score - a.score);
            this.scores = this.scores.slice(0, this.maxScores);
            return this.saveScores() && this.isHighScore(score);
        } catch (error) {
            console.error('Error adding score:', error);
            return false;
        }
    }

    isHighScore(score) {
        return this.scores.length < this.maxScores || score > this.scores[this.scores.length - 1].score;
    }

    getScores() {
        return this.scores;
    }

    clearScores() {
        this.scores = [];
        this.saveScores();
    }
} 