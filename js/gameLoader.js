/**
 * Updated Game Loader - Dynamically loads all game scripts in the correct order
 * Replace the original gameLoader.js with this file
 */

// Store loaded script count to track loading progress
let loadedScripts = 0;
let totalScripts = 0;

// Script loading order (ensures dependencies are loaded first)
const scripts = [
    // Core variables and scene setup
    { path: 'js/gameVariables.js', loaded: false },
    { path: 'js/gameObjects.js', loaded: false },
    
    // Game systems
    { path: 'js/visualEffects.js', loaded: false },
    { path: 'js/minimap.js', loaded: false },
    { path: 'js/powerUps.js', loaded: false },
    { path: 'js/highScores.js', loaded: false },
    
    // Game mechanics
    { path: 'js/collisions.js', loaded: false },
    { path: 'js/redBlobAI.js', loaded: false },
    
    // Controls and input
    { path: 'js/controls.js', loaded: false },
    { path: 'js/joysticks.js', loaded: false },
    
    // Networking
    { path: 'js/networking.js', loaded: false },
    
    // Main menu (must come before main.js)
    { path: 'js/mainMenu.js', loaded: false },
    
    // Main game loop (must be last)
    { path: 'js/main.js', loaded: false }
];

/**
 * Initializes the game loader
 */
function initLoader() {
    // Create loading screen
    createLoadingScreen();
    
    // Set total scripts count
    totalScripts = scripts.length;
    
    // Start loading scripts
    loadNextScript(0);
}

/**
 * Creates a loading screen
 */
function createLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.style.position = 'fixed';
    loadingScreen.style.top = '0';
    loadingScreen.style.left = '0';
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.backgroundColor = '#000022';
    loadingScreen.style.backgroundImage = 'linear-gradient(to bottom, #000022, #001144)';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.flexDirection = 'column';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.alignItems = 'center';
    loadingScreen.style.zIndex = '9999';
    
    // Game title
    const title = document.createElement('h1');
    title.textContent = '3D Sphere Game';
    title.style.color = '#ffffff';
    title.style.fontFamily = 'Arial, sans-serif';
    title.style.fontSize = '48px';
    title.style.marginBottom = '20px';
    title.style.textShadow = '0 0 10px #00a2ff, 0 0 20px #00a2ff';
    title.style.animation = 'glow 2s infinite alternate';
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes glow {
            from {
                text-shadow: 0 0 10px #00a2ff, 0 0 20px #00a2ff;
            }
            to {
                text-shadow: 0 0 15px #00a2ff, 0 0 30px #00a2ff;
            }
        }
        
        @keyframes bounce {
            0% {
                transform: translateY(0);
            }
            100% {
                transform: translateY(-20px);
            }
        }
        
        @keyframes rotate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Loading indicator container
    const progressContainer = document.createElement('div');
    progressContainer.style.width = '300px';
    progressContainer.style.height = '20px';
    progressContainer.style.backgroundColor = '#333333';
    progressContainer.style.borderRadius = '10px';
    progressContainer.style.overflow = 'hidden';
    progressContainer.style.marginBottom = '20px';
    progressContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    
    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.id = 'loading-progress';
    progressBar.style.width = '0%';
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = '#00a2ff';
    progressBar.style.transition = 'width 0.3s ease-in-out';
    progressBar.style.backgroundImage = 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)';
    progressBar.style.backgroundSize = '40px 40px';
    progressBar.style.animation = 'progress-bar-stripes 2s linear infinite';
    
    // Add more keyframes for progress bar
    style.textContent += `
        @keyframes progress-bar-stripes {
            from { background-position: 40px 0; }
            to { background-position: 0 0; }
        }
    `;
    
    // Loading text
    const loadingText = document.createElement('div');
    loadingText.id = 'loading-text';
    loadingText.textContent = 'Loading... 0%';
    loadingText.style.color = '#ffffff';
    loadingText.style.fontFamily = 'Arial, sans-serif';
    loadingText.style.marginTop = '5px';
    
    // Animated sphere graphic
    const sphereContainer = document.createElement('div');
    sphereContainer.style.width = '50px';
    sphereContainer.style.height = '50px';
    sphereContainer.style.position = 'relative';
    sphereContainer.style.margin = '30px 0';
    
    const sphere = document.createElement('div');
    sphere.style.width = '100%';
    sphere.style.height = '100%';
    sphere.style.borderRadius = '50%';
    sphere.style.backgroundColor = '#00a2ff';
    sphere.style.boxShadow = '0 0 20px #00a2ff';
    sphere.style.animation = 'bounce 1s infinite alternate';
    
    // Add the enemies chasing sphere animation
    const enemy = document.createElement('div');
    enemy.style.width = '30px';
    enemy.style.height = '30px';
    enemy.style.borderRadius = '50%';
    enemy.style.backgroundColor = '#ff3333';
    enemy.style.boxShadow = '0 0 10px #ff3333';
    enemy.style.position = 'absolute';
    enemy.style.top = '10px';
    enemy.style.right = '-40px';
    enemy.style.animation = 'chase 2s infinite';
    
    // Add more keyframes for enemy chase
    style.textContent += `
        @keyframes chase {
            0% { right: -40px; }
            45% { right: 60px; }
            50% { right: 60px; }
            95% { right: -40px; }
            100% { right: -40px; }
        }
    `;
    
    // Assemble elements
    progressContainer.appendChild(progressBar);
    sphereContainer.appendChild(sphere);
    sphereContainer.appendChild(enemy);
    
    loadingScreen.appendChild(title);
    loadingScreen.appendChild(sphereContainer);
    loadingScreen.appendChild(progressContainer);
    loadingScreen.appendChild(loadingText);
    
    document.body.appendChild(loadingScreen);
}

/**
 * Updates the loading progress
 */
function updateLoadingProgress() {
    loadedScripts++;
    
    const progressPercent = Math.round((loadedScripts / totalScripts) * 100);
    
    // Update progress bar
    const progressBar = document.getElementById('loading-progress');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
    
    // Update loading text
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.textContent = `Loading... ${progressPercent}%`;
    }
    
    // If all scripts are loaded, remove loading screen after a delay
    if (loadedScripts === totalScripts) {
        setTimeout(removeLoadingScreen, 500);
    }
}

/**
 * Removes the loading screen
 */
function removeLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        // Fade out animation
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        loadingScreen.style.opacity = '0';
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (loadingScreen.parentNode) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
        }, 500);
    }
}

/**
 * Loads the next script in the list
 * @param {number} index - The index of the script to load
 */
function loadNextScript(index) {
    if (index >= scripts.length) {
        return;
    }
    
    const script = scripts[index];
    
    if (script.loaded) {
        // Skip already loaded scripts
        loadNextScript(index + 1);
        return;
    }
    
    // Create script element
    const scriptElement = document.createElement('script');
    scriptElement.src = script.path;
    scriptElement.async = false; // Maintain order
    
    // Set up load and error handlers
    scriptElement.onload = () => {
        script.loaded = true;
        updateLoadingProgress();
        loadNextScript(index + 1);
    };
    
    scriptElement.onerror = () => {
        console.error(`Failed to load script: ${script.path}`);
        loadNextScript(index + 1);
    };
    
    // Add to document
    document.body.appendChild(scriptElement);
}

// Start loading when document is ready
document.addEventListener('DOMContentLoaded', initLoader);