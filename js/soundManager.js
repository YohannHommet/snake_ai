export class SoundManager {
    constructor() {
        this.sounds = {
            eat: new Audio('sounds/eat.wav'),
            gameOver: new Audio('sounds/gameover.wav'),
            start: new Audio('sounds/start.wav'),
            pause: new Audio('sounds/pause.wav'),
            highScore: new Audio('sounds/highscore.wav')
        };

        // Précharger les sons
        Object.values(this.sounds).forEach(sound => {
            sound.load();
            sound.volume = 0.3; // Volume par défaut à 30%
        });

        this.muted = false;
    }

    play(soundName) {
        if (this.muted || !this.sounds[soundName]) return;
        
        const sound = this.sounds[soundName];
        sound.currentTime = 0; // Réinitialiser le son
        sound.play().catch(error => console.log('Erreur de lecture audio:', error));
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    setVolume(volume) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = Math.max(0, Math.min(1, volume));
        });
    }
} 