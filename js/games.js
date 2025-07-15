

let allGames = [];


const gameContainer = document.querySelector('.games-grid');
const searchInput = document.getElementById('gameSearch');


async function fetchGames() {
    try {
        const response = await fetch('games.json');
        if (!response.ok) {
            throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        allGames = data.games;
        displayGames(allGames);
    } catch (error) {
        console.error('Error fetching games:', error);
        displayError();
    }
}


function displayGames(games) {
    if (!gameContainer) return;
    
    if (games.length === 0) {
        gameContainer.innerHTML = '<div class="no-games">No games found</div>';
        return;
    }
    
    gameContainer.innerHTML = games.map(game => `
        <div class="game-card" data-game-id="${game.id}" onclick="playGame('${game.link}')">
            <div class="game-image">
                <img src="${game.image}" alt="${game.title}" loading="lazy">
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}


function displayError() {
    if (gameContainer) {
        gameContainer.innerHTML = `
            <div class="error-message">
                <i data-lucide="alert-circle"></i>
                <p>Failed to load games. Please try again later.</p>
            </div>
        `;
        lucide.createIcons();
    }
}


function searchGames(query) {
    if (!query.trim()) {
        displayGames(allGames);
        return;
    }
    
    const filteredGames = allGames.filter(game => 
        game.title.toLowerCase().includes(query.toLowerCase()) ||
        game.id.toLowerCase().includes(query.toLowerCase())
    );
    
    displayGames(filteredGames);
}


function playGame(gameLink) {
    window.location.href = gameLink;
}


document.addEventListener('DOMContentLoaded', () => {
    fetchGames();
    

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchGames(e.target.value);
        });
    }
});


document.addEventListener('keydown', (e) => {

    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (searchInput) {
            searchInput.focus();
        }
    }
    
  
    if (e.key === 'Escape' && searchInput === document.activeElement) {
        searchInput.value = '';
        searchGames('');
    }
});