export class VisualEffects {
    constructor(canvas) {
        // Contexte de rendu
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // État des effets
        this.glitchActive = false;
        
        // Configuration des effets
        this.config = {
            glitch: {
                minInterval: 15000,   // Intervalle minimum entre les glitchs
                maxInterval: 30000,   // Intervalle maximum entre les glitchs
                duration: 500,        // Durée d'un effet glitch
                intensity: 0.2        // Intensité de l'effet (0-1)
            }
        };
        
        // Démarrer les effets
        this.startGlitchEffect();
    }

    // Garder uniquement les méthodes liées au glitch
    startGlitchEffect() {
        const scheduleNextGlitch = () => {
            const delay = this.config.glitch.minInterval + 
                         Math.random() * (this.config.glitch.maxInterval - this.config.glitch.minInterval);
            
            if (Math.random() > 0.7) {
                setTimeout(() => {
                    this.triggerGlitch();
                    scheduleNextGlitch();
                }, delay);
            } else {
                setTimeout(scheduleNextGlitch, delay / 2);
            }
        };

        scheduleNextGlitch();
    }

    triggerGlitch() {
        this.glitchActive = true;
        
        // Créer plusieurs couches de glitch
        const layers = 3;
        for (let i = 0; i < layers; i++) {
            setTimeout(() => {
                this.applyGlitchLayer();
            }, i * (this.config.glitch.duration / layers));
        }

        setTimeout(() => {
            this.glitchActive = false;
        }, this.config.glitch.duration);
    }

    applyGlitchLayer() {
        if (!this.glitchActive) return;

        const ctx = this.ctx;
        const intensity = this.config.glitch.intensity;
        
        // Sauvegarder une copie de l'écran
        const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Créer des bandes de glitch
        const numSlices = Math.floor(5 + Math.random() * 5);
        const sliceHeight = this.canvas.height / numSlices;
        
        ctx.save();
        
        for (let i = 0; i < numSlices; i++) {
            const y = i * sliceHeight;
            const offset = (Math.random() - 0.5) * 50 * intensity;
            
            // Déplacer horizontalement une partie de l'image
            ctx.drawImage(
                this.canvas,
                0, y, this.canvas.width, sliceHeight,
                offset, y, this.canvas.width, sliceHeight
            );
            
            // Ajouter des artefacts de couleur RGB
            if (Math.random() < 0.3) {
                ctx.fillStyle = `rgba(255, 0, 255, ${0.1 * intensity})`;
                ctx.fillRect(0, y, this.canvas.width, sliceHeight);
            }
        }

        // Ajouter des effets de chromatic aberration
        if (Math.random() < 0.5) {
            ctx.globalCompositeOperation = 'screen';
            ctx.drawImage(
                this.canvas,
                2, 0, this.canvas.width, this.canvas.height,
                0, 0, this.canvas.width, this.canvas.height
            );
            ctx.drawImage(
                this.canvas,
                -2, 0, this.canvas.width, this.canvas.height,
                0, 0, this.canvas.width, this.canvas.height
            );
        }
        
        ctx.restore();

        // Restaurer l'image originale après un court délai
        setTimeout(() => {
            if (this.glitchActive) {
                ctx.putImageData(imageData, 0, 0);
            }
        }, 50);
    }
} 