/**
 * Sound System for 3D Sphere Game
 * Handles loading, caching, and playing sound effects
 */

// Main audio context
let audioContext;

// Sound cache to avoid reloading sounds
const soundCache = {};

// Master volume control
let masterVolume = 0.5;

// Track if sounds are enabled
let soundEnabled = true;

/**
 * Initializes the sound system
 */
function initSoundSystem() {
    try {
        // Create audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master volume control
        const volumeControl = document.createElement('div');
        volumeControl.id = 'volume-control';
        volumeControl.style.position = 'absolute';
        volumeControl.style.bottom = '10px';
        volumeControl.style.left = '10px';
        volumeControl.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        volumeControl.style.padding = '10px';
        volumeControl.style.borderRadius = '5px';
        volumeControl.style.display = 'flex';
        volumeControl.style.alignItems = 'center';
        volumeControl.style.zIndex = '1001';
        
        // Volume label
        const volumeLabel = document.createElement('label');
        volumeLabel.textContent = 'Volume:';
        volumeLabel.style.color = 'white';
        volumeLabel.style.marginRight = '10px';
        volumeLabel.style.fontFamily = 'Arial, sans-serif';
        volumeLabel.style.fontSize = '12px';
        
        // Volume slider
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '100';
        volumeSlider.value = masterVolume * 100;
        volumeSlider.style.width = '100px';
        
        // Mute button
        const muteButton = document.createElement('button');
        muteButton.textContent = '🔊';
        muteButton.style.marginLeft = '10px';
        muteButton.style.width = '30px';
        muteButton.style.height = '30px';
        muteButton.style.border = 'none';
        muteButton.style.borderRadius = '5px';
        muteButton.style.backgroundColor = '#4CAF50';
        muteButton.style.color = 'white';
        muteButton.style.cursor = 'pointer';
        
        // Event listeners
        volumeSlider.addEventListener('input', () => {
            masterVolume = volumeSlider.value / 100;
            if (masterVolume > 0 && soundEnabled) {
                muteButton.textContent = '🔊';
                muteButton.style.backgroundColor = '#4CAF50';
            } else {
                muteButton.textContent = '🔇';
                muteButton.style.backgroundColor = '#F44336';
            }
        });
        
        muteButton.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            if (soundEnabled) {
                muteButton.textContent = '🔊';
                muteButton.style.backgroundColor = '#4CAF50';
            } else {
                muteButton.textContent = '🔇';
                muteButton.style.backgroundColor = '#F44336';
            }
        });
        
        // Assemble volume control
        volumeControl.appendChild(volumeLabel);
        volumeControl.appendChild(volumeSlider);
        volumeControl.appendChild(muteButton);
        
        document.body.appendChild(volumeControl);
        
        console.log('Sound system initialized successfully');
        
        // Preload common sounds
        preloadSounds();
        
    } catch (error) {
        console.error('Failed to initialize sound system:', error);
    }
}

/**
 * Preloads commonly used sounds
 */
function preloadSounds() {
    // List of sounds to preload
    const soundsToPreload = [
        'collect.mp3',
        'powerup.mp3',
        'hurt.mp3',
        'victory.mp3',
        'gameover.mp3',
        'button.mp3',
        'footstep.mp3',
        'enemy.mp3',
        'wall_hit.mp3',
        'spawn.mp3'
    ];
    
    // Start preloading each sound
    soundsToPreload.forEach(sound => {
        loadSound(sound);
    });
}

/**
 * Loads a sound file
 * @param {string} filename - The sound file to load
 * @returns {Promise<AudioBuffer>} The loaded sound buffer
 */
function loadSound(filename) {
    // If already cached, return from cache
    if (soundCache[filename]) {
        return Promise.resolve(soundCache[filename]);
    }
    
    return new Promise((resolve, reject) => {
        // Create an audio element instead of using fetch
        const audio = new Audio();
        
        // Set up event handlers
        audio.oncanplaythrough = () => {
            soundCache[filename] = audio;
            resolve(audio);
        };
        
        audio.onerror = () => {
            console.error(`Failed to load sound: ${filename}`);
            reject(new Error(`Failed to load sound: ${filename}`));
        };
        
        // Set source and start loading
        audio.src = `sounds/${filename}`;
        audio.load();
    });
}
/**
 * Plays a sound with optional parameters
 * @param {string} filename - The sound file to play
 * @param {Object} options - Options for playing the sound
 * @param {number} options.volume - Volume multiplier (0-1)
 * @param {number} options.pitch - Pitch multiplier (0.5-2)
 * @param {boolean} options.loop - Whether to loop the sound
 * @param {number} options.x - X position for spatial audio
 * @param {number} options.y - Y position for spatial audio
 * @param {number} options.z - Z position for spatial audio
 * @returns {Object} Sound control object with stop function
 */
function playSound(filename, options = {}) {
    // If sound is disabled, do nothing
    if (!soundEnabled || masterVolume <= 0) {
        return { stop: () => {} };
    }
    
    // Default options
    const defaultOptions = {
        volume: 1,
        loop: false
    };
    
    // Merge options
    const finalOptions = { ...defaultOptions, ...options };
    
    // Promise for loading sound
    const soundPromise = loadSound(filename);
    
    // Audio element
    let audioElement = null;
    
    // Play sound when loaded
    soundPromise.then(audio => {
        // Clone the audio element for simultaneous sounds
        audioElement = audio.cloneNode();
        
        // Set properties
        audioElement.volume = finalOptions.volume * masterVolume;
        audioElement.loop = finalOptions.loop;
        
        // Play the sound
        audioElement.play().catch(e => {
            console.warn('Could not play audio:', e);
        });
    }).catch(error => {
        console.error(`Error playing sound ${filename}:`, error);
    });
    
    // Return control object
    return {
        stop: () => {
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
        },
        setVolume: (volume) => {
            if (audioElement) {
                audioElement.volume = volume * masterVolume;
            }
        }
    };
}
/**
 * Plays a sound at a specific 3D position
 * @param {string} filename - The sound file to play
 * @param {THREE.Vector3} position - The position to play the sound at
 * @param {Object} options - Additional options for the sound
 * @returns {Object} Sound control object
 */
function playSpatialSound(filename, position, options = {}) {
    return playSound(filename, {
        ...options,
        x: position.x,
        y: position.y,
        z: position.z
    });
}

/**
 * Plays the collectible pickup sound
 * @param {THREE.Vector3} position - Position of the collectible
 */
function playCollectSound(position) {
    playSpatialSound('collect.mp3', position, { volume: 0.7 });
}

/**
 * Plays the power-up pickup sound
 * @param {THREE.Vector3} position - Position of the power-up
 * @param {string} type - Type of power-up
 */
function playPowerUpSound(position, type) {
    // Different pitch based on power-up type
    let pitch = 1.0;
    
    switch(type) {
        case 'SPEED':
            pitch = 1.2;
            break;
        case 'INVINCIBLE':
            pitch = 0.9;
            break;
        case 'GHOST':
            pitch = 0.7;
            break;
    }
    
    playSpatialSound('powerup.mp3', position, { volume: 0.8, pitch: pitch });
}

/**
 * Plays a sound when player hits a wall
 * @param {THREE.Vector3} position - Position of the collision
 * @param {number} force - Force of the collision (0-1)
 */
function playWallHitSound(position, force = 1) {
    // Only play if force is significant
    if (force < 0.1) return;
    
    // Scale volume with force
    const volume = Math.min(force, 1) * 0.5;
    
    playSpatialSound('wall_hit.mp3', position, { 
        volume: volume,
        // Randomize pitch slightly
        pitch: 0.9 + Math.random() * 0.2
    });
}

/**
 * Plays the red blob enemy sound
 * @param {THREE.Vector3} position - Position of the enemy
 * @param {boolean} isChasing - Whether the enemy is chasing the player
 */
function playEnemySound(position, isChasing) {
    const options = {
        volume: isChasing ? 0.7 : 0.3,
        pitch: isChasing ? 1.2 : 0.8,
        loop: true
    };
    
    // Instead of creating a spatial sound, just play a regular sound
    // with volume based on distance
    const enemySound = playSound('enemy.mp3', options);
    
    // Store reference to stop it later
    if (!redBlob.userData.sound) {
        redBlob.userData.sound = enemySound;
    }
    
    return enemySound;
}

/**
 * Updates the position of spatial sounds
 */
function updateSpatialSounds() {
    // Update enemy sound position
    if (redBlob && redBlob.userData.sound) {
        // Check if the setPosition method exists before calling it
        if (typeof redBlob.userData.sound.setPosition === 'function') {
            redBlob.userData.sound.setPosition(
                redBlob.position.x,
                redBlob.position.y,
                redBlob.position.z
            );
        }
        // If using the simplified Audio element approach, we can't update position
        // So we just need to make sure we don't try to call a non-existent method
    }
}

/**
 * Plays the player hurt/caught sound
 */
function playHurtSound() {
    playSound('hurt.mp3', { volume: 0.8 });
}

/**
 * Plays the victory sound
 */
function playVictorySound() {
    playSound('victory.mp3', { volume: 1.0 });
}

/**
 * Plays the game over sound
 */
function playGameOverSound() {
    playSound('gameover.mp3', { volume: 1.0 });
}

/**
 * Plays a UI button click sound
 */
function playButtonSound() {
    playSound('button.mp3', { volume: 0.5 });
}

/**
 * Plays footstep sounds while the player is moving
 */
let lastFootstepTime = 0;
let isFootstepPlaying = false;

function playFootstepSounds() {
    const now = Date.now();
    
    // Only play if player is moving and enough time has passed
    if ((moveForward || moveBackward || moveLeft || moveRight) && 
        now - lastFootstepTime > 300 && !isFootstepPlaying) {
        
        isFootstepPlaying = true;
        
        // Play footstep sound
        playSpatialSound('footstep.mp3', playerSphere.position, {
            volume: 0.3,
            // Randomize pitch slightly
            pitch: 0.9 + Math.random() * 0.2
        });
        
        lastFootstepTime = now;
        
        // Reset flag after sound duration
        setTimeout(() => {
            isFootstepPlaying = false;
        }, 300);
    }
}

/**
 * Plays a spawn sound when player respawns
 */
function playSpawnSound() {
    playSpatialSound('spawn.mp3', playerSphere.position, { volume: 0.6 });
}

/**
 * Plays background ambient music
 * @returns {Object} Sound control object for the music
 */
let backgroundMusic = null;

function playBackgroundMusic() {
    // Stop existing music if any
    if (backgroundMusic) {
        backgroundMusic.stop();
    }
    
    // Play new background music
    backgroundMusic = playSound('background.mp3', {
        volume: 0.3,
        loop: true
    });
    
    return backgroundMusic;
}