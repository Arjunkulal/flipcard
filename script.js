$(document).ready(function() {
    // Game Variables
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timeElapsed = 0;
    let gameTimer;
    let gameStarted = false;
    let isChecking = false;

    // Array of emojis for the cards (8 pairs = 16 cards total)
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    
    /**
     * Initialize the game by creating cards and setting up the board
     */
    function initGame() {
        console.log('Initializing new game...');
        
        // Reset game state
        resetGameState();
        
        // Create pairs of emojis and shuffle them
        cards = [...emojis, ...emojis];
        shuffleArray(cards);
        
        // Create the game board
        createGameBoard();
        
        // Bind event listeners
        bindEventListeners();
        
        console.log('Game initialized successfully');
    }

    /**
     * Reset all game variables to initial state
     */
    function resetGameState() {
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        timeElapsed = 0;
        gameStarted = false;
        isChecking = false;
        
        // Clear timer if it exists
        if (gameTimer) {
            clearInterval(gameTimer);
            gameTimer = null;
        }
        
        // Update UI counters
        updateMoveCounter();
        updateTimer();
        
        console.log('Game state reset');
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        console.log('Cards shuffled');
    }

    /**
     * Create the game board with cards
     */
    function createGameBoard() {
        const $gameBoard = $('#game-board');
        $gameBoard.empty();
        
        // Create each card element
        cards.forEach((emoji, index) => {
            const $card = $(`
                <div class="memory-card loading" data-emoji="${emoji}" data-index="${index}">
                    <div class="card-face card-back">
                        <i class="fas fa-question"></i>
                    </div>
                    <div class="card-face card-front">
                        ${emoji}
                    </div>
                </div>
            `);
            
            $gameBoard.append($card);
        });
        
        // Add loading animation delay for visual effect
        $('.memory-card').each(function(index) {
            $(this).css('animation-delay', `${index * 0.05}s`);
        });
        
        console.log('Game board created with', cards.length, 'cards');
    }

    /**
     * Bind event listeners for game interactions
     */
    function bindEventListeners() {
        // Card click handler
        $(document).off('click', '.memory-card').on('click', '.memory-card', function() {
            if (!isChecking && !$(this).hasClass('flipped') && !$(this).hasClass('matched')) {
                handleCardClick($(this));
            }
        });
        
        // Restart button handler
        $('#restart-btn').off('click').on('click', function() {
            console.log('Restart button clicked');
            initGame();
        });
        
        // Play again button in modal
        $('#play-again-btn').off('click').on('click', function() {
            console.log('Play again button clicked');
            initGame();
        });
        
        console.log('Event listeners bound');
    }

    /**
     * Handle card click events
     * @param {jQuery} $card - The clicked card element
     */
    function handleCardClick($card) {
        // Start the game timer on first card click
        if (!gameStarted) {
            startGameTimer();
            gameStarted = true;
            console.log('Game started');
        }
        
        // Flip the card
        $card.addClass('flipped');
        flippedCards.push($card);
        
        console.log('Card flipped:', $card.data('emoji'));
        
        // Check if we have two cards flipped
        if (flippedCards.length === 2) {
            moves++;
            updateMoveCounter();
            isChecking = true;
            
            setTimeout(() => {
                checkForMatch();
            }, 600); // Delay to allow flip animation to complete
        }
    }

    /**
     * Check if the two flipped cards match
     */
    function checkForMatch() {
        const [$card1, $card2] = flippedCards;
        const emoji1 = $card1.data('emoji');
        const emoji2 = $card2.data('emoji');
        
        if (emoji1 === emoji2) {
            // Cards match!
            $card1.addClass('matched');
            $card2.addClass('matched');
            matchedPairs++;
            
            console.log('Match found!', emoji1, '- Pairs matched:', matchedPairs);
            
            // Check if game is complete
            if (matchedPairs === emojis.length) {
                setTimeout(() => {
                    endGame();
                }, 800);
            }
        } else {
            // Cards don't match, flip them back
            setTimeout(() => {
                $card1.removeClass('flipped');
                $card2.removeClass('flipped');
                console.log('No match, cards flipped back');
            }, 1000);
        }
        
        // Reset flipped cards array and allow new clicks
        flippedCards = [];
        isChecking = false;
    }

    /**
     * Start the game timer
     */
    function startGameTimer() {
        gameTimer = setInterval(() => {
            timeElapsed++;
            updateTimer();
        }, 1000);
        
        // Add pulse animation to timer
        $('#timer').addClass('pulse');
        
        console.log('Game timer started');
    }

    /**
     * End the game and show win modal
     */
    function endGame() {
        // Stop the timer
        if (gameTimer) {
            clearInterval(gameTimer);
            gameTimer = null;
        }
        
        // Remove pulse animation from timer
        $('#timer').removeClass('pulse');
        
        // Update final stats in modal
        $('#final-moves').text(moves);
        $('#final-time').text(formatTime(timeElapsed));
        
        // Show win modal
        const winModal = new bootstrap.Modal(document.getElementById('winModal'));
        winModal.show();
        
        console.log('Game completed! Moves:', moves, 'Time:', formatTime(timeElapsed));
    }

    /**
     * Update the move counter display
     */
    function updateMoveCounter() {
        $('#moves-counter').text(moves);
    }

    /**
     * Update the timer display
     */
    function updateTimer() {
        $('#timer').text(formatTime(timeElapsed));
    }

    /**
     * Format time in MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Add visual feedback for button interactions
     */
    function addButtonFeedback() {
        $('#restart-btn').on('mousedown', function() {
            $(this).css('transform', 'translateY(-1px)');
        }).on('mouseup mouseleave', function() {
            $(this).css('transform', 'translateY(-3px)');
        });
    }

    /**
     * Add keyboard support for accessibility
     */
    function addKeyboardSupport() {
        $(document).on('keydown', function(e) {
            // Restart game with 'R' key
            if (e.key.toLowerCase() === 'r') {
                $('#restart-btn').click();
            }
            
            // Close modal with Escape key
            if (e.key === 'Escape') {
                const modal = bootstrap.Modal.getInstance(document.getElementById('winModal'));
                if (modal) {
                    modal.hide();
                }
            }
        });
    }

    /**
     * Initialize tooltips for better UX
     */
    function initTooltips() {
        $('#restart-btn').attr('title', 'Press R to restart');
        
        // Enable Bootstrap tooltips if available
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }

    // Initialize the game when document is ready
    console.log('Memory Card Game loaded');
    
    // Set up initial game state
    initGame();
    
    // Add additional features
    addButtonFeedback();
    addKeyboardSupport();
    initTooltips();
    
    // Debug function for testing (can be removed in production)
    window.debugGame = {
        revealAllCards: function() {
            $('.memory-card').addClass('flipped');
            console.log('All cards revealed for debugging');
        },
        autoWin: function() {
            $('.memory-card').addClass('flipped matched');
            matchedPairs = emojis.length;
            setTimeout(() => {
                endGame();
            }, 1000);
            console.log('Auto-win triggered for debugging');
        },
        resetGame: function() {
            initGame();
            console.log('Game reset via debug function');
        }
    };
    
    console.log('Debug functions available: debugGame.revealAllCards(), debugGame.autoWin(), debugGame.resetGame()');
});