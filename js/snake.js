export class Snake {
    constructor(grid) {
        this.grid = grid;
        this.reset();
    }

    reset() {
        this.segments = [
            { x: 3 * this.grid.cellSize, y: 3 * this.grid.cellSize }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
    }

    update() {
        this.direction = { ...this.nextDirection };
        const head = { ...this.segments[0] };
        head.x += this.direction.x * this.grid.cellSize;
        head.y += this.direction.y * this.grid.cellSize;
        
        this.segments.unshift(head);
        return this.segments.pop();
    }

    grow() {
        const lastSegment = this.segments[this.segments.length - 1];
        this.segments.push({ ...lastSegment });
    }

    setDirection(direction) {
        const isOpposite = (
            this.direction.x === -direction.x && 
            this.direction.y === -direction.y
        );
        
        if (!isOpposite) {
            this.nextDirection = direction;
        }
    }

    checkCollision() {
        const head = this.segments[0];
        
        // Vérifier les collisions avec les murs
        if (!this.grid.isWithinBounds(head.x, head.y)) {
            return true;
        }

        // Vérifier les collisions avec le corps
        return this.segments.slice(1).some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    draw(ctx) {
        // Effet de lueur
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ff';
        
        // Calculer l'opacité pour chaque segment
        const totalSegments = this.segments.length;
        this.segments.forEach((segment, index) => {
            // Couleur unique cyan pour tout le serpent
            const opacity = 1 - (index / totalSegments) * 0.6;
            ctx.fillStyle = '#0ff';
            
            // Lueur plus intense pour la tête
            ctx.shadowBlur = index === 0 ? 20 : 15;
            
            // Appliquer l'opacité
            ctx.globalAlpha = opacity;
            
            ctx.fillRect(
                segment.x,
                segment.y,
                this.grid.cellSize - 1,
                this.grid.cellSize - 1
            );
        });
        
        // Réinitialiser les effets
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
} 