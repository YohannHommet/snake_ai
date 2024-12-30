import { Grid } from './grid.js';
import { Snake } from './snake.js';
import { Food } from './food.js';
import { Game } from './game.js';
import { ScoreBoard } from './scoreBoard.js';
import { DifficultyManager } from './difficultyManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const CELL_SIZE = 20;
    const GRID_WIDTH = 600;
    const GRID_HEIGHT = 400;

    canvas.width = GRID_WIDTH;
    canvas.height = GRID_HEIGHT;

    const grid = new Grid(GRID_WIDTH, GRID_HEIGHT, CELL_SIZE);
    const snake = new Snake(grid);
    const food = new Food(grid);
    const difficultyManager = new DifficultyManager();
    const scoreBoard = new ScoreBoard(difficultyManager);
    
    const game = new Game(canvas, snake, food, grid, scoreBoard, difficultyManager);
    game.draw();
});

window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1500); // Affiche le loading screen pendant 1.5 secondes
}); 