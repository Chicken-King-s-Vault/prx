let allGames = [];
let filteredGames = [];
const gameContainer = document.querySelector('.games-grid');
const searchInput = document.getElementById('gameSearch');


function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


async function fetchGames(retryCount = 3) {
    for (let i = 0; i < retryCount; i++) {
        try {
            const response = await fetch('games.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.games || !Array.isArray(data.games)) {
                throw new Error('Invalid data structure: games array not found');
            }
            
            allGames = data.games;
            filteredGames = [...allGames];
            setTimeout(() => {
                displayGames(filteredGames, true);
            }, 1000);
            return;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === retryCount - 1) {
                displayError(error.message);
            } else {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    }
}


function displayGames(games, fadeIn = false) {
    if (!gameContainer) return;
    
    if (games.length === 0) {
        gameContainer.innerHTML = `
            <div class="no-games">
                <p>No games found</p>
                <small>Try adjusting your search terms</small>
            </div>
        `;
        return;
    }
    

    const fragment = document.createDocumentFragment();
    
    games.forEach((game, index) => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.setAttribute('data-game-id', game.id);
        gameCard.setAttribute('tabindex', '0'); 
        gameCard.setAttribute('role', 'button');
        gameCard.setAttribute('aria-label', `Play ${game.title}`);
        

        if (fadeIn) {
            gameCard.style.opacity = '0';
            gameCard.style.transform = 'translateY(40px) scale(0.9) rotateX(20deg)';
            gameCard.style.filter = 'blur(2px)';
            gameCard.style.animation = `coolFadeIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`;
            gameCard.style.animationDelay = `${index * 0.05}s`;
            
     
            setTimeout(() => {
                gameCard.style.opacity = '';
                gameCard.style.transform = '';
                gameCard.style.filter = '';
                gameCard.style.animation = '';
                gameCard.style.animationDelay = '';
            }, 800 + (index * 50) + 100); 
        }
        
        gameCard.innerHTML = `
            <div class="game-image">
                <img src="${escapeHtml(game.image)}" 
                     alt="${escapeHtml(game.title)}" 
                     loading="lazy"
                     onerror="this.src='placeholder-image.jpg'">
            </div>
            <div class="game-info">
                <h3 class="game-title">${escapeHtml(game.title)}</h3>
            </div>
        `;
        
    
        gameCard.addEventListener('click', () => playGame(game.link));
        gameCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playGame(game.link);
            }
        });
        
        fragment.appendChild(gameCard);
    });
    
    gameContainer.innerHTML = '';
    gameContainer.appendChild(fragment);
    lucide.createIcons();
}


function displayError(message = 'Failed to load games') {
    if (!gameContainer) return;
    
    gameContainer.innerHTML = `
        <div class="error-message">
            <p>${escapeHtml(message)}</p>
            <button class="retry-button" onclick="fetchGames()">
                Try Again
            </button>
        </div>
    `;
}


function searchGames(query) {
    if (!query.trim()) {
        filteredGames = [...allGames];
        displayGames(filteredGames);
        return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    

    filteredGames = allGames.filter(game => {
        const titleMatch = game.title.toLowerCase().includes(searchTerm);
        const idMatch = game.id.toLowerCase().includes(searchTerm);
        const descMatch = game.description ? game.description.toLowerCase().includes(searchTerm) : false;
        const categoryMatch = game.category ? game.category.toLowerCase().includes(searchTerm) : false;
        
        return titleMatch || idMatch || descMatch || categoryMatch;
    });

    filteredGames.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(searchTerm) ? 1 : 0;
        const bTitle = b.title.toLowerCase().includes(searchTerm) ? 1 : 0;
        return bTitle - aTitle;
    });
    
    displayGames(filteredGames);
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function playGame(gameLink) {
    if (!gameLink) {
        console.error('No game link provided');
        return;
    }
    

    try {
        new URL(gameLink, window.location.origin);
        window.location.href = gameLink;
    } catch (error) {
        console.error('Invalid game link:', gameLink);
        alert('Invalid game link. Please try again.');
    }
}


function showLoading() {
    if (gameContainer) {
        gameContainer.innerHTML = `
            <div style="
                position: absolute;
                top: 30%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                width: 100%;
            ">
                <p style="
                    font-size: 1.2rem; 
                    color: black; 
                    font-weight: 600; 
                    margin: 0;
                    padding: 0;
                ">Loading games...</p>
            </div>
        `;
    }
}


const debouncedSearch = debounce(searchGames, 300);


document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes coolFadeIn {
            0% {
                opacity: 0;
                transform: translateY(40px) scale(0.9) rotateX(20deg);
                filter: blur(2px);
            }
            50% {
                opacity: 0.8;
                transform: translateY(10px) scale(1.02) rotateX(5deg);
                filter: blur(0px);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1) rotateX(0deg);
                filter: blur(0px);
            }
        }
        
        .game-card {
            transition: transform 0.4s ease-out !important;
            will-change: transform !important;
            transform-origin: center center !important;
        }
        
        .game-card:hover {
            transform: scale(1.05) !important;
        }

        .game-card:focus {
            transform: scale(1.05) !important;
        }

        .game-card:active {
            transform: scale(1.02) !important;
        }
        

        @media (hover: hover) {
            .game-card:hover {
                transform: scale(1.05) !important;
            }
        }
        
        @media (hover: none) {
            .game-card:active {
                transform: scale(1.02) !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    showLoading();
    fetchGames();
    

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement?.classList.add('focused');
        });
        
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement?.classList.remove('focused');
        });
    }
});


document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    if (e.key === 'Escape' && searchInput === document.activeElement) {
        searchInput.value = '';
        searchGames('');
        searchInput.blur();
    }
    

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const gameCards = document.querySelectorAll('.game-card');
        const focusedCard = document.activeElement;
        
        if (gameCards.length > 0) {
            const currentIndex = Array.from(gameCards).indexOf(focusedCard);
            let nextIndex;
            
            if (e.key === 'ArrowDown') {
                nextIndex = currentIndex < gameCards.length - 1 ? currentIndex + 1 : 0;
            } else {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : gameCards.length - 1;
            }
            
            if (nextIndex >= 0 && nextIndex < gameCards.length) {
                gameCards[nextIndex].focus();
                e.preventDefault();
            }
        }
    }
});


document.addEventListener('visibilitychange', () => {
    if (!document.hidden && allGames.length === 0) {
        fetchGames();
    }
});


window.gameAPI = {
    fetchGames,
    searchGames,
    playGame,
    getAllGames: () => allGames,
    getFilteredGames: () => filteredGames
};