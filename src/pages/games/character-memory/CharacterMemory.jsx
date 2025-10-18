import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faRedo,
  faTrophy,
  faClock,
  faStar,
  faPlay,
  faPause,
  faMemory,
  faCheck,
  faTimes,
  faDownload,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import { getRandomCharacterImages } from '../../../services/jikanService';

const CharacterMemory = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('menu'); // 'menu', 'loading', 'playing', 'paused', 'completed'
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  const [characterImages, setCharacterImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const resultCardRef = useRef(null);

  const difficulties = {
    easy: { pairs: 6, timeBonus: 100 },
    medium: { pairs: 8, timeBonus: 150 },
    hard: { pairs: 10, timeBonus: 200 }
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  const loadCharacterImages = async () => {
    setLoading(true);
    try {
      console.log('Starting to load character images...');
      const images = await getRandomCharacterImages(difficulties[difficulty].pairs);
      console.log('Received images:', images);

      if (images.length === 0) {
        throw new Error('No images received from service');
      }

      setCharacterImages(images);
      initializeGame(images);
    } catch (error) {
      console.error('Failed to load character images:', error);
      // Use fallback images
      const fallbackImages = Array.from({ length: difficulties[difficulty].pairs }, (_, i) => {
        const characters = [
          'Eren Yeager', 'Light Yagami', 'Naruto Uzumaki', 'Monkey D. Luffy',
          'Izuku Midoriya', 'Tanjiro Kamado', 'Ken Kaneki', 'Edward Elric',
          'Goku', 'Kirito', 'Natsu Dragneel', 'Ichigo Kurosaki'
        ];
        const animes = [
          'Attack on Titan', 'Death Note', 'Naruto', 'One Piece',
          'My Hero Academia', 'Demon Slayer', 'Tokyo Ghoul', 'Fullmetal Alchemist',
          'Dragon Ball', 'Sword Art Online', 'Fairy Tail', 'Bleach'
        ];

        // Use more unique random seeds
        const uniqueSeed = Date.now() + i + Math.floor(Math.random() * 10000);

        return {
          url: `https://picsum.photos/seed/${characters[i % characters.length].toLowerCase().replace(/\s+/g, '')}${uniqueSeed}/300/400`,
          character: characters[i % characters.length],
          anime: animes[i % animes.length],
          type: 'character'
        };
      });
      setCharacterImages(fallbackImages);
      initializeGame(fallbackImages);
    } finally {
      setLoading(false);
    }
  };

  const initializeGame = (images) => {
    // Create pairs of cards
    const cardPairs = images.flatMap((image, index) => [
      {
        id: `${index}-1`,
        imageId: index,
        image: image,
        isFlipped: false,
        isMatched: false
      },
      {
        id: `${index}-2`,
        imageId: index,
        image: image,
        isFlipped: false,
        isMatched: false
      }
    ]);

    // Shuffle the cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(new Set());
    setMoves(0);
    setTimeElapsed(0);
    setGameState('playing');
  };

  const handleCardClick = (cardId) => {
    if (gameState !== 'playing' || flippedCards.length >= 2) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prevCards =>
      prevCards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);

      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      if (firstCard.imageId === secondCard.imageId) {
        // Match found
        setTimeout(() => {
          setMatchedPairs(prev => new Set([...prev, firstCard.imageId]));
          setCards(prevCards =>
            prevCards.map(c =>
              c.id === firstCardId || c.id === secondCardId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setFlippedCards([]);

          // Check if game is complete
          if (matchedPairs.size + 1 === difficulties[difficulty].pairs) {
            setGameState('completed');
            saveGameStats();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              c.id === firstCardId || c.id === secondCardId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const saveGameStats = () => {
    const score = calculateScore();
    const savedStats = JSON.parse(localStorage.getItem('animeGamesStats') || '{"totalGames": 0, "totalScore": 0, "gamesPlayed": 0, "memoryGames": 0, "memoryBestScore": 0}');
    savedStats.gamesPlayed += 1;
    savedStats.totalScore += score;
    savedStats.memoryGames += 1;
    if (score > savedStats.memoryBestScore) {
      savedStats.memoryBestScore = score;
    }
    localStorage.setItem('animeGamesStats', JSON.stringify(savedStats));
  };

  const calculateScore = () => {
    const baseScore = difficulties[difficulty].pairs * 100;
    const timeBonus = Math.max(0, difficulties[difficulty].timeBonus - timeElapsed);
    const movesPenalty = Math.max(0, moves - difficulties[difficulty].pairs * 2) * 10;
    return Math.max(0, baseScore + timeBonus - movesPenalty);
  };

  const generateResultImage = async () => {
    if (!resultCardRef.current) return;

    try {
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: resultCardRef.current.offsetWidth,
        height: resultCardRef.current.offsetHeight
      });

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `character-memory-results-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error generating result image:', error);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Character Memory Results', canvas.width / 2, 80);

        ctx.font = '20px Arial';
        ctx.fillStyle = '#a855f7';
        ctx.fillText(`${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty`, canvas.width / 2, 120);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 48px Arial';
        ctx.fillText('🏆', canvas.width / 2, 180);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${calculateScore().toLocaleString()} points`, canvas.width / 2, 240);
        ctx.fillText(`Time: ${formatTime(timeElapsed)}`, canvas.width / 2, 280);
        ctx.fillText(`Moves: ${moves}`, canvas.width / 2, 320);
        ctx.fillText(`Pairs: ${matchedPairs.size}/${difficulties[difficulty].pairs}`, canvas.width / 2, 360);

        ctx.font = '16px Arial';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText(`Completed on ${new Date().toLocaleDateString()}`, canvas.width / 2, 420);

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `character-memory-results-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      } catch (fallbackError) {
        console.error('Fallback canvas generation also failed:', fallbackError);
      }
    }
  };

  const shareResult = async () => {
    const score = calculateScore();
    const shareText = `I just completed the ${difficulty} Character Memory game! Score: ${score.toLocaleString()} points, Time: ${formatTime(timeElapsed)}, Moves: ${moves}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Character Memory Results',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
        navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
        alert('Results copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
      alert('Results copied to clipboard!');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetGame = () => {
    setGameState('menu');
    setCards([]);
    setFlippedCards([]);
    setMatchedPairs(new Set());
    setMoves(0);
    setTimeElapsed(0);
    setCharacterImages([]);
  };

  const startGame = async (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameState('loading');
    await loadCharacterImages();
  };

  const togglePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back to Games Button */}
            <div className="flex justify-start mb-4">
              <button
                onClick={() => navigate('/games')}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Games
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <FontAwesomeIcon icon={faMemory} className="text-3xl text-purple-400" />
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Character Memory
                </h1>
              </div>
              <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
                Test your memory by matching anime character cards. Find all the pairs to win!
              </p>
            </div>

            {/* Difficulty Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
              {Object.entries(difficulties).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => startGame(key)}
                  className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-[1.02] p-6 text-center group"
                >
                  <div className="text-2xl font-bold text-purple-400 group-hover:text-purple-300 mb-2 capitalize">
                    {key}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    {config.pairs} Pairs
                  </div>
                  <div className="text-xs text-gray-500">
                    Time Bonus: {config.timeBonus}s
                  </div>
                </button>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-8 border border-purple-500/20">
              <h3 className="text-xl font-bold mb-4 text-center">How to Play</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <FontAwesomeIcon icon={faMemory} className="text-2xl text-blue-400 mb-2" />
                  <h4 className="font-bold mb-1">Match Pairs</h4>
                  <p className="text-sm text-gray-400">Flip cards to find matching character pairs</p>
                </div>
                <div>
                  <FontAwesomeIcon icon={faClock} className="text-2xl text-yellow-400 mb-2" />
                  <h4 className="font-bold mb-1">Beat the Clock</h4>
                  <p className="text-sm text-gray-400">Complete faster for bonus points</p>
                </div>
                <div>
                  <FontAwesomeIcon icon={faTrophy} className="text-2xl text-purple-400 mb-2" />
                  <h4 className="font-bold mb-1">Score Points</h4>
                  <p className="text-sm text-gray-400">Earn points based on speed and efficiency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <FontAwesomeIcon icon={faMemory} className="text-4xl text-purple-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Loading Characters...</h2>
              <p className="text-gray-400">Preparing your memory game</p>
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'completed') {
    const score = calculateScore();
    const accuracy = Math.round((matchedPairs.size / difficulties[difficulty].pairs) * 100);

    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <button
                onClick={() => navigate('/games')}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Games
              </button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Congratulations!
              </h1>
              <p className="text-gray-400">You completed the {difficulty} memory challenge!</p>
            </div>

            {/* Results Card */}
            <div ref={resultCardRef} className="relative bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 mb-8 overflow-hidden">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className="text-center">
                  <FontAwesomeIcon icon={faMemory} className="text-8xl text-purple-400 mb-4" />
                  <h1 className="text-4xl font-bold text-purple-400">Otazumi</h1>
                  <p className="text-lg text-purple-300">Character Memory</p>
                </div>
              </div>

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-500/20 border-4 border-yellow-400 text-yellow-400 rounded-full mb-4">
                    <FontAwesomeIcon icon={faTrophy} className="text-4xl" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Perfect Memory!</h2>
                  <p className="text-gray-300 text-lg">Score: {score.toLocaleString()} points</p>
                  <p className="text-gray-400 text-sm mt-2">Completed on {new Date().toLocaleDateString()}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-white/5">
                    <FontAwesomeIcon icon={faClock} className="text-blue-400 text-3xl mb-3" />
                    <p className="text-sm text-gray-400 mb-1">Time</p>
                    <p className="text-2xl font-bold">{formatTime(timeElapsed)}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-white/5">
                    <FontAwesomeIcon icon={faMemory} className="text-purple-400 text-3xl mb-3" />
                    <p className="text-sm text-gray-400 mb-1">Moves</p>
                    <p className="text-2xl font-bold">{moves}</p>
                  </div>
                </div>

                {/* Performance */}
                <div className="bg-white/10 rounded-lg p-4 mb-6 border border-white/5">
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-2">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty</h3>
                    <p className="text-gray-400 text-sm">
                      Accuracy: {accuracy}% | Pairs: {matchedPairs.size}/{difficulties[difficulty].pairs}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button
                  onClick={shareResult}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faShare} className="mr-2" />
                  Share Result
                </button>
                <button
                  onClick={generateResultImage}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Download Image
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faRedo} className="mr-2" />
                  Play Again
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Back to Games
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Playing State
  const gridCols = difficulty === 'easy' ? 'grid-cols-3' :
                   difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-6';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={resetGame}
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back
            </button>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-400" />
                <span className="font-bold">{calculateScore().toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-blue-400" />
                <span className="font-bold">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faMemory} className="text-purple-400" />
                <span className="font-bold">{moves}</span>
              </div>
              <div className="text-gray-400">
                {matchedPairs.size} / {difficulties[difficulty].pairs}
              </div>
            </div>
            <button
              onClick={togglePause}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={gameState === 'playing' ? faPause : faPlay} />
              {gameState === 'playing' ? 'Pause' : 'Resume'}
            </button>
          </div>

          {/* Game Board */}
          <div className={`grid ${gridCols} gap-4 max-w-4xl mx-auto`}>
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  aspect-square rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105
                  ${card.isFlipped || card.isMatched
                    ? 'bg-white/10 border-2 border-purple-400'
                    : 'bg-white/5 border-2 border-white/20 hover:border-purple-400/50'
                  }
                  ${card.isMatched ? 'opacity-75' : ''}
                  ${gameState === 'paused' ? 'pointer-events-none opacity-50' : ''}
                `}
              >
                {card.isFlipped || card.isMatched ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 p-2 pb-0 flex items-center justify-center bg-gray-800/50 rounded-lg overflow-hidden">
                      <img
                        src={card.image.url}
                        alt={card.image.character}
                        className="w-full h-full object-contain rounded"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        onError={(e) => {
                          console.log(`Image failed to load for ${card.image.character}, using fallback`);
                          const uniqueSeed = Date.now() + card.imageId + Math.floor(Math.random() * 10000);
                          e.target.src = `https://picsum.photos/seed/fallback${uniqueSeed}/300/400`;
                          e.target.onerror = () => {
                            // Final fallback - show a colored placeholder
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                                <div class="text-center text-white">
                                  <div class="text-2xl mb-1">👤</div>
                                  <div class="text-xs font-bold">${card.image.character}</div>
                                </div>
                              </div>
                            `;
                          };
                        }}
                      />
                    </div>
                    <div className="p-2 pt-1 text-center">
                      <p className="text-xs font-medium text-white truncate">{card.image.character}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faMemory} className="text-2xl text-purple-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pause Overlay */}
          {gameState === 'paused' && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#0a0a0a] border border-white/20 rounded-xl p-8 text-center max-w-md mx-4">
                <FontAwesomeIcon icon={faPause} className="text-4xl text-purple-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Game Paused</h3>
                <p className="text-gray-400 mb-6">Take your time, we'll wait!</p>
                <button
                  onClick={togglePause}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-8 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2" />
                  Resume Game
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterMemory;