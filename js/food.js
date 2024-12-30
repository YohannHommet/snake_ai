export class Food {
    constructor(grid) {
        this.grid = grid;
        this.position = { x: 0, y: 0 };
        this.pulsePhase = 0;
        this.relocate();
    }

    relocate() {
        const maxX = this.grid.width / this.grid.cellSize;
        const maxY = this.grid.height / this.grid.cellSize;
        
        this.position = {
            x: Math.floor(Math.random() * maxX) * this.grid.cellSize,
            y: Math.floor(Math.random() * maxY) * this.grid.cellSize
        };
    }

    draw(ctx) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f0f';
        
        this.pulsePhase += 0.1;
        const pulseSize = Math.sin(this.pulsePhase) * 3;
        const glowIntensity = (Math.sin(this.pulsePhase) + 1) * 0.5;
        
        ctx.shadowBlur = 15 + glowIntensity * 10;
        ctx.fillStyle = '#f0f';
        
        // Effet de halo
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(
            this.position.x + this.grid.cellSize/2,
            this.position.y + this.grid.cellSize/2,
            this.grid.cellSize * (0.8 + glowIntensity * 0.3),
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Carré principal
        ctx.globalAlpha = 1;
        ctx.fillRect(
            this.position.x - pulseSize/2,
            this.position.y - pulseSize/2,
            this.grid.cellSize - 1 + pulseSize,
            this.grid.cellSize - 1 + pulseSize
        );
    }
} 