/**
 * High Score System for 3D Sphere Game
 */

// Max number of high scores to store
const MAX_HIGH_SCORES = 5;

// High scores array
let highScores = [];

/**
 * Initializes the high score system
 */
function initHighScores() {
    // Create UI elements
    createHighScoreUI();
    
    // Load high scores from local storage
    loadHighScores();
    
    // Show high scores at game start
    showHighScores();
}

/**
 * Loads high scores from local storage
 */
function loadHighScores() {
    try {
        const savedScores = localStorage.getItem('sphereGameHighScores');
        if (savedScores) {
            highScores = JSON.parse(savedScores);
        }
    } catch (e) {
        console.error('Error loading high scores:', e);
        highScores = [];
    }
    
    // Ensure array format
    if (!Array.isArray(highScores)) {
        highScores = [];
    }
}

/**
 * Saves high scores to local storage
 */
function saveHighScores() {
    try {
        localStorage.setItem('sphereGameHighScores', JSON.stringify(highScores));
    } catch (e) {
        console.error('Error saving high scores:', e);
    }
}

/**
 * Checks if the current score is a high score
 * @returns {boolean} True if current score is a high score
 */
function isHighScore() {
    // If we don't have MAX_HIGH_SCORES yet, it's automatically a high score
    if (highScores.length < MAX_HIGH_SCORES) {
        return true;
    }
    
    // Check if score is higher than the lowest high score
    const lowestScore = highScores[highScores.length - 1].score;
    return score > lowestScore;
}

/**
 * Adds the current score to high scores
 * @param {string} playerName - Name of the player
 */
function addHighScore(playerName) {
    // Create new high score entry
    const newScore = {
        name: playerName,
        score: score,
        date: new Date().toISOString()
    };
    
    // Add to high scores and sort
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    
    // Keep only the top MAX_HIGH_SCORES
    if (highScores.length > MAX_HIGH_SCORES) {
        highScores = highScores.slice(0, MAX_HIGH_SCORES);
    }
    
    // Save to local storage
    saveHighScores();
}

/**
 * Prompts player for name and adds high score
 */
function promptForHighScore() {
    if (isHighScore()) {
        // Pause game
        gamePaused = true;
        
        // Create high score form
        const overlay = document.createElement('div');
        overlay.id = 'high-score-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
        overlay.style.zIndex = '2000';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        
        const form = document.createElement('div');
        form.style.backgroundColor = '#333';
        form.style.padding = '20px';
        form.style.borderRadius = '10px';
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'center';
        form.style.gap = '15px';
        
        const title = document.createElement('h2');
        title.textContent = 'NEW HIGH SCORE!';
        title.style.color = '#ffff00';
        title.style.margin = '0';
        title.style.fontFamily = 'Arial, sans-serif';
        
        const scoreDisplay = document.createElement('div');
        scoreDisplay.textContent = `Score: ${score}`;
        scoreDisplay.style.color = '#ffffff';
        scoreDisplay.style.fontSize = '24px';
        scoreDisplay.style.fontFamily = 'Arial, sans-serif';
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Enter your name:';
        nameLabel.style.color = '#ffffff';
        nameLabel.style.fontFamily = 'Arial, sans-serif';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.maxLength = 15;
        nameInput.style.padding = '8px';
        nameInput.style.fontSize = '16px';
        nameInput.style.width = '200px';
        nameInput.style.textAlign = 'center';
        nameInput.style.borderRadius = '5px';
        nameInput.style.border = 'none';
        
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.style.padding = '10px 20px';
        submitButton.style.fontSize = '16px';
        submitButton.style.backgroundColor = '#4CAF50';
        submitButton.style.color = 'white';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '5px';
        submitButton.style.cursor = 'pointer';
        
        // Add elements to form
        form.appendChild(title);
        form.appendChild(scoreDisplay);
        form.appendChild(nameLabel);
        form.appendChild(nameInput);
        form.appendChild(submitButton);
        
        // Add form to overlay
        overlay.appendChild(form);
        
        // Add to document
        document.body.appendChild(overlay);
        
        // Focus input
        setTimeout(() => nameInput.focus(), 0);
        
        // Handle submit
        submitButton.addEventListener('click', () => {
            const name = nameInput.value.trim() || 'Anonymous';
            addHighScore(name);
            document.body.removeChild(overlay);
            gamePaused = false;
            showHighScores();
        });
        
        // Also submit on Enter key
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitButton.click();
            }
        });
    }
}

/**
 * Creates the high score UI
 */
function createHighScoreUI() {
    // Create button to show high scores
    const highScoreButton = document.createElement('div');
    highScoreButton.id = 'high-score-button';
    highScoreButton.textContent = 'High Scores';
    highScoreButton.style.position = 'absolute';
    highScoreButton.style.top = '10px';
    highScoreButton.style.left = '100px';
    highScoreButton.style.background = 'rgba(0,0,0,0.5)';
    highScoreButton.style.color = 'white';
    highScoreButton.style.padding = '10px';
    highScoreButton.style.borderRadius = '5px';
    highScoreButton.style.fontFamily = 'Arial, sans-serif';
    highScoreButton.style.cursor = 'pointer';
    
    highScoreButton.addEventListener('click', () => {
        showHighScores();
    });
    
    document.body.appendChild(highScoreButton);
}

/**
 * Shows the high scores panel
 */
function showHighScores() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'high-scores-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    overlay.style.zIndex = '2000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    
    // Create panel
    const panel = document.createElement('div');
    panel.style.backgroundColor = '#333';
    panel.style.padding = '20px';
    panel.style.borderRadius = '10px';
    panel.style.width = '350px';
    
    // Title
    const title = document.createElement('h2');
    title.textContent = 'HIGH SCORES';
    title.style.color = '#ffff00';
    title.style.textAlign = 'center';
    title.style.margin = '0 0 20px 0';
    title.style.fontFamily = 'Arial, sans-serif';
    
    panel.appendChild(title);
    
    // Scores table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.color = 'white';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.borderCollapse = 'collapse';
    
    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const rankHeader = document.createElement('th');
    rankHeader.textContent = 'Rank';
    rankHeader.style.padding = '8px';
    rankHeader.style.textAlign = 'center';
    rankHeader.style.borderBottom = '1px solid #ddd';
    
    const nameHeader = document.createElement('th');
    nameHeader.textContent = 'Name';
    nameHeader.style.padding = '8px';
    nameHeader.style.textAlign = 'left';
    nameHeader.style.borderBottom = '1px solid #ddd';
    
    const scoreHeader = document.createElement('th');
    scoreHeader.textContent = 'Score';
    scoreHeader.style.padding = '8px';
    scoreHeader.style.textAlign = 'right';
    scoreHeader.style.borderBottom = '1px solid #ddd';
    
    headerRow.appendChild(rankHeader);
    headerRow.appendChild(nameHeader);
    headerRow.appendChild(scoreHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Table body
    const tbody = document.createElement('tbody');
    
    if (highScores.length === 0) {
        // No scores yet
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.textContent = 'No high scores yet!';
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '15px';
        emptyCell.colSpan = 3;
        
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
    } else {
        // Add each high score
        highScores.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            const rankCell = document.createElement('td');
            rankCell.textContent = `${index + 1}`;
            rankCell.style.padding = '8px';
            rankCell.style.textAlign = 'center';
            
            const nameCell = document.createElement('td');
            nameCell.textContent = entry.name;
            nameCell.style.padding = '8px';
            nameCell.style.textAlign = 'left';
            
            const scoreCell = document.createElement('td');
            scoreCell.textContent = entry.score;
            scoreCell.style.padding = '8px';
            scoreCell.style.textAlign = 'right';
            
            // Highlight if this is a new high score
            if (entry.score === score && entry.date === highScores[index].date) {
                row.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
                row.style.fontWeight = 'bold';
            }
            
            row.appendChild(rankCell);
            row.appendChild(nameCell);
            row.appendChild(scoreCell);
            tbody.appendChild(row);
        });
    }
    
    table.appendChild(tbody);
    panel.appendChild(table);
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.display = 'block';
    closeButton.style.margin = '20px auto 0';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = '#4CAF50';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    panel.appendChild(closeButton);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
}