export class Grid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
    }

    getCellCoordinates(x, y) {
        return {
            x: Math.floor(x / this.cellSize) * this.cellSize,
            y: Math.floor(y / this.cellSize) * this.cellSize
        };
    }

    isWithinBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
} 