export class SoundManager {
    constructor() {
        this.sounds = {
            eat: new Audio('assets/sounds/eat.mp3'),
            gameOver: new Audio('assets/sounds/gameOver.mp3'),
            start: new Audio('assets/sounds/start.mp3'),
            powerUp: new Audio('assets/sounds/powerUp.mp3'),
            // pause: new Audio('assets/sounds/pause.mp3'),
            // highScore: new Audio('assets/sounds/highscore.mp3')
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
    }

    setVolume(volume) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = Math.max(0, Math.min(1, volume));
        });
    }
} 