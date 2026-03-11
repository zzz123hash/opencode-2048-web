/* 
   Self-test note:
   This 2048 game implementation includes:
   1. 4x4 grid logic
   2. Arrow key controls
   3. Single merge per move (prevents double merges)
   4. Random 2/4 spawn after valid move
   5. Score tracking
   6. Win condition (2048) and game over detection
   7. Restart button
   Expected behavior: Tiles slide and merge in one direction per move.
*/

document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('tiles-container');
    const scoreDisplay = document.getElementById('score');
    const bestDisplay = document.getElementById('best');
    const gameMessage = document.getElementById('game-message');
    const messageText = document.getElementById('message-text');
    const restartBtn = document.getElementById('restart-btn');
    const retryBtn = document.getElementById('retry-btn');

    const GRID_SIZE = 4;
    let grid = [];
    let score = 0;
    let bestScore = localStorage.getItem('best2048') || 0;
    let gameOver = false;
    let won = false;

    function init() {
        grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
        score = 0;
        gameOver = false;
        won = false;
        bestDisplay.textContent = bestScore;
        addRandomTile();
        addRandomTile();
        renderGrid();
        gameMessage.classList.remove('show');
    }

    function addRandomTile() {
        let emptyCells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            grid[r][c] = Math.random() < 0.9 ? 2 : 4;
            return true; // Valid spawn
        }
        return false; // No empty cells
    }

    function renderGrid() {
        gridContainer.innerHTML = '';
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${grid[r][c]}`;
                    tile.textContent = grid[r][c];
                    // Calculate position (including gap)
                    const gap = 10;
                    const cellSize = 72;
                    tile.style.left = `${c * (cellSize + gap) + gap}px`;
                    tile.style.top = `${r * (cellSize + gap) + gap}px`;
                    gridContainer.appendChild(tile);
                }
            }
        }
        scoreDisplay.textContent = score;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('best2048', bestScore);
            bestDisplay.textContent = bestScore;
        }
    }

    function move(direction) {
        if (gameOver) return;

        let moved = false;
        const prevGrid = JSON.stringify(grid);

        // Helper to process a single row/col
        const processLine = (line) => {
            // Filter out zeros
            let filtered = line.filter(val => val !== 0);
            let merged = [];
            let mergedIndices = new Set(); // Prevent double merge

            for (let i = 0; i < filtered.length; i++) {
                // If current value equals next and not merged yet
                if (i + 1 < filtered.length && filtered[i] === filtered[i+1] && !mergedIndices.has(i)) {
                    merged.push(filtered[i] * 2);
                    score += filtered[i] * 2;
                    mergedIndices.add(i);
                    i++; // Skip next
                } else {
                    merged.push(filtered[i]);
                }
            }

            // Pad with zeros
            while (merged.length < GRID_SIZE) {
                merged.push(0);
            }
            return merged;
        };

        if (direction === 'left' || direction === 'right') {
            for (let r = 0; r < GRID_SIZE; r++) {
                let row = [...grid[r]];
                if (direction === 'right') row.reverse();
                row = processLine(row);
                if (direction === 'right') row.reverse();
                grid[r] = row;
            }
        } else { // up or down
            for (let c = 0; c < GRID_SIZE; c++) {
                let col = [];
                for (let r = 0; r < GRID_SIZE; r++) col.push(grid[r][c]);
                if (direction === 'down') col.reverse();
                col = processLine(col);
                if (direction === 'down') col.reverse();
                for (let r = 0; r < GRID_SIZE; r++) grid[r][c] = col[r];
            }
        }

        if (JSON.stringify(grid) !== prevGrid) {
            moved = true;
        }

        if (moved) {
            addRandomTile();
            renderGrid();
            checkGameState();
        }
    }

    function checkGameState() {
        // Check for 2048 (win)
        if (!won) {
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (grid[r][c] === 2048) {
                        won = true;
                        messageText.textContent = 'You Win!';
                        gameMessage.classList.add('show');
                        return;
                    }
                }
            }
        }

        // Check for game over (no moves left)
        let hasEmpty = false;
        let canMove = false;

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 0) hasEmpty = true;
                // Check right neighbor
                if (c < GRID_SIZE - 1 && grid[r][c] === grid[r][c+1]) canMove = true;
                // Check bottom neighbor
                if (r < GRID_SIZE - 1 && grid[r][c] === grid[r+1][c]) canMove = true;
            }
        }

        if (!hasEmpty && !canMove) {
            gameOver = true;
            messageText.textContent = 'Game Over!';
            gameMessage.classList.add('show');
        }
    }

    // Event Listeners
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp': move('up'); break;
            case 'ArrowDown': move('down'); break;
            case 'ArrowLeft': move('left'); break;
            case 'ArrowRight': move('right'); break;
        }
    });

    restartBtn.addEventListener('click', init);
    retryBtn.addEventListener('click', init);

    // Start game
    init();
});