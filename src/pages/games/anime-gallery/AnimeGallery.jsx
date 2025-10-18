import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faImages,
  faTrophy,
  faClock,
  faRedo,
  faPlay,
  faCheck,
  faTimes,
  faStar,
  faQuestionCircle,
  faDownload,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';

// Sample gallery questions with placeholder images (replace with actual anime screencaps)
const galleryQuestions = [
  {
    id: 1,
    imageUrl: "https://static0.srcdn.com/wordpress/wp-content/uploads/2024/01/ch1094zorofam.jpg",
    question: "Which anime series features this iconic color spread?",
    options: ["One Piece", "Naruto", "Dragon Ball", "Bleach"],
    correct: 0,
    category: "Series Recognition",
    explanation: "This is the color spread from One Piece Chapter 1094 featuring the Straw Hat Pirates."
  },
  {
    id: 2,
    imageUrl: "https://sukuna.co.uk/wp-content/uploads/2024/05/ryomen-sukuna-true-form-1-1024x1495.webp",
    question: "What is the name of this powerful cursed spirit?",
    options: ["Ryomen Sukuna", "Mahito", "Jogo", "Hanami"],
    correct: 0,
    category: "Character Recognition",
    explanation: "This is Ryomen Sukuna, the King of Curses from Jujutsu Kaisen."
  },
  {
    id: 3,
    imageUrl: "https://images5.alphacoders.com/133/thumb-350-1337105.webp",
    question: "Which Hashira is shown in this intense battle scene?",
    options: ["Tengen Uzui", "Kyojuro Rengoku", "Muichiro Tokito", "Mitsuri Kanroji"],
    correct: 0,
    category: "Character Recognition",
    explanation: "This is Tengen Uzui, the Sound Hashira, in action during the Swordsmith Village arc."
  },
  {
    id: 4,
    imageUrl: "https://images7.alphacoders.com/134/thumb-350-1342980.webp",
    question: "What is the name of this colossal Titan?",
    options: ["Founding Titan", "Attack Titan", "Armored Titan", "Female Titan"],
    correct: 0,
    category: "Character Recognition",
    explanation: "This is the Founding Titan, one of the Nine Titans in Attack on Titan."
  },
  {
    id: 5,
    imageUrl: "https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c8/Class_1-A_prepare_to_create_their_Ultimate_Moves.png",
    question: "Which anime features these young heroes in training?",
    options: ["My Hero Academia", "One Punch Man", "The Promised Neverland", "Black Clover"],
    correct: 0,
    category: "Series Recognition",
    explanation: "This is from My Hero Academia, showing Class 1-A students at U.A. High School."
  },
  {
    id: 6,
    imageUrl: "https://animerants.net/wp-content/uploads/2023/04/dr-stone-new-world-episode-01.png",
    question: "What scientific achievement is shown in this scene?",
    options: ["Creating gunpowder", "Building a hot air balloon", "Inventing the cell phone", "Developing antibiotics"],
    correct: 1,
    category: "Scene Recognition",
    explanation: "This shows Senku and his friends building a hot air balloon in Dr. Stone Season 3."
  },
  {
    id: 7,
    imageUrl: "https://variety.com/wp-content/uploads/2022/11/One-Piece-Film-Red.jpg",
    question: "Which One Piece movie features this concert scene?",
    options: ["One Piece Film: Red", "One Piece Film: Gold", "One Piece Film: Z", "One Piece Stampede"],
    correct: 0,
    category: "Movie Recognition",
    explanation: "This is from One Piece Film: Red, featuring Uta's concert performance."
  },
  {
    id: 8,
    imageUrl: "https://static.wikia.nocookie.net/fma/images/b/be/Brotherhood30.jpg",
    question: "What is the name of this alchemical symbol?",
    options: ["Philosopher's Stone", "Red Stone", "Father's Stone", "Truth's Stone"],
    correct: 0,
    category: "Symbol Recognition",
    explanation: "This is the Philosopher's Stone, a central element in Fullmetal Alchemist: Brotherhood."
  },
  {
    id: 9,
    imageUrl: "https://img.joomcdn.net/f32a0a08983938276fd0cac140f86f3e22b266ca_original.jpeg",
    question: "What is the name of this supernatural notebook?",
    options: ["Death Note", "Life Note", "Judgment Book", "Fate Book"],
    correct: 0,
    category: "Object Recognition",
    explanation: "This is the Death Note, the central object in the series of the same name."
  },
  {
    id: 10,
    imageUrl: "https://images7.alphacoders.com/765/thumb-350-765121.webp",
    question: "Which Makoto Shinkai film features this breathtaking landscape?",
    options: ["Your Name", "Weathering with You", "A Silent Voice", "Five Centimeters Per Second"],
    correct: 0,
    category: "Movie Recognition",
    explanation: "This iconic landscape scene is from Your Name (Kimi no Na wa)."
  },
  {
    id: 11,
    imageUrl: "https://s2.aminoapps.com/image/7uodwtbddvcslzhky232x3gyipuqbaa6_hq.jpg",
    question: "What is the name of this Survey Corps formation?",
    options: ["Long Distance Enemy Scouting Formation", "Vertical Maneuvering Equipment", "Thunder Spear", "Blade of Demise"],
    correct: 0,
    category: "Tactic Recognition",
    explanation: "This shows the Long Distance Enemy Scouting Formation used by the Survey Corps."
  },
  {
    id: 12,
    imageUrl: "https://ovicio.com.br/wp-content/uploads/2023/07/20230730-satorugojo-768x432.webp",
    question: "Which special grade sorcerer is shown here?",
    options: ["Satoru Gojo", "Yuki Tsukumo", "Suguru Geto", "Kenjaku"],
    correct: 0,
    category: "Character Recognition",
    explanation: "This is Satoru Gojo, the strongest Jujutsu Sorcerer in Jujutsu Kaisen."
  },
  {
    id: 13,
    imageUrl: "https://wallpapers.com/images/high/rengoku-flame-breath-9th-form-0pbp0alvvvrn9ang.webp",
    question: "What is the name of this breathing technique?",
    options: ["Water Breathing", "Flame Breathing", "Thunder Breathing", "Wind Breathing"],
    correct: 1,
    category: "Technique Recognition",
    explanation: "This shows Flame Breathing, used by Kyojuro Rengoku in Demon Slayer."
  },
  {
    id: 14,
    imageUrl: "https://static.wikia.nocookie.net/bokunoheroacademia/images/3/3d/United_States_of_Smash.gif",
    question: "Which hero is known for this powerful punch?",
    options: ["All Might", "Endeavor", "Best Jeanist", "Edgeshot"],
    correct: 0,
    category: "Character Recognition",
    explanation: "This is All Might performing his signature smash attack in My Hero Academia."
  },
  {
    id: 15,
    imageUrl: "https://images6.alphacoders.com/134/thumb-350-1346719.webp",
    question: "What is the name of this pirate crew?",
    options: ["Straw Hat Pirates", "Whitebeard Pirates", "Red Hair Pirates", "Blackbeard Pirates"],
    correct: 0,
    category: "Group Recognition",
    explanation: "This is the Straw Hat Pirates, led by Monkey D. Luffy in One Piece."
  }
];

const AnimeGallery = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('menu'); // menu, loading, playing, completed
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [showResult, setShowResult] = useState(false);
  const [gameStats, setGameStats] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const timerRef = useRef(null);
  const resultCardRef = useRef(null);

  const getGalleryQuestions = (count = 10) => {
    console.log('Getting gallery questions from drunkenanimeblog screencaps...');

    // Shuffle and select questions
    const shuffled = [...galleryQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));

    // Shuffle options for each question and update correct index
    const questionsWithShuffledOptions = selectedQuestions.map(question => {
      const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
      const correctOption = question.options[question.correct];
      const newCorrectIndex = shuffledOptions.indexOf(correctOption);

      return {
        ...question,
        options: shuffledOptions,
        correct: newCorrectIndex
      };
    });

    console.log(`Selected ${questionsWithShuffledOptions.length} gallery questions with shuffled options`);
    return questionsWithShuffledOptions;
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
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
  }, [gameState, timeLeft]);

  const startGame = async (questionCount) => {
    setGameState('loading');

    try {
      const galleryQuestions = getGalleryQuestions(questionCount);
      setQuestions(galleryQuestions);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setScore(0);
      setTimeLeft(45);
      setShowResult(false);
      setImageLoaded(false);
      setGameState('playing');
    } catch (error) {
      console.error('Failed to start game:', error);
      setGameState('menu');
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null || showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question.correct;

    if (isCorrect) {
      // Bonus points for speed
      const timeBonus = Math.max(0, timeLeft * 5);
      const points = 20 + timeBonus;
      setScore(prev => prev + points);
    }

    // Auto advance after showing result
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const handleTimeUp = () => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(-1); // -1 indicates time up
    setShowResult(true);

    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(45);
      setShowResult(false);
      setImageLoaded(false);
    } else {
      // Game completed
      finishGame();
    }
  };

  const finishGame = () => {
    const percentage = questions.length > 0 ? Math.round((score / (questions.length * 20)) * 100) : 0;
    let grade = 'F';

    if (percentage >= 90) grade = 'S';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    const stats = {
      score,
      percentage,
      grade,
      totalQuestions: questions.length,
      correctAnswers: Math.floor(score / 20), // Approximate
      averageTime: 45 - (timeLeft / questions.length)
    };

    setGameStats(stats);
    setGameState('completed');
    saveGameStats(stats);
  };

  const saveGameStats = (stats) => {
    const savedStats = JSON.parse(localStorage.getItem('animeGamesStats') || '{"totalGames": 0, "totalScore": 0, "gamesPlayed": 0, "galleryGames": 0, "galleryBestScore": 0}');
    savedStats.gamesPlayed += 1;
    savedStats.totalScore += stats.score;
    savedStats.galleryGames += 1;
    if (stats.score > savedStats.galleryBestScore) {
      savedStats.galleryBestScore = stats.score;
    }
    localStorage.setItem('animeGamesStats', JSON.stringify(savedStats));
  };

  const generateResultImage = async () => {
    if (!resultCardRef.current) return null;

    try {
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: resultCardRef.current.offsetWidth,
        height: resultCardRef.current.offsetHeight,
        logging: false,
        imageTimeout: 0,
        removeContainer: true
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating result image:', error);
      return null;
    }
  };

  const shareResult = async () => {
    const imageDataUrl = await generateResultImage();
    if (!imageDataUrl) {
      alert('Failed to generate result image. Please try again.');
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'anime-gallery-result.png', { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          title: 'Anime Gallery Quiz Result',
          text: `I scored ${gameStats.score} points with a grade of ${gameStats.grade} in Anime Gallery Quiz! Can you identify these anime scenes?`,
          files: [file]
        });
      } else {
        // Fallback: download the image
        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = 'anime-gallery-result.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error sharing result:', error);
      // Fallback: download the image
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = 'anime-gallery-result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setTimeLeft(45);
    setShowResult(false);
    setGameStats(null);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(true); // Still proceed even if image fails to load
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
                <FontAwesomeIcon icon={faImages} className="text-3xl text-indigo-400" />
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent px-4 py-2">
                  Anime Gallery Quiz
                </h1>
              </div>
              <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
                Test your anime knowledge by identifying series, characters, and scenes from iconic screencaps!
              </p>
            </div>

            {/* Game Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 text-center">
                <FontAwesomeIcon icon={faClock} className="text-2xl text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-blue-400">45</div>
                <div className="text-sm text-gray-400">Seconds per Question</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 text-center">
                <FontAwesomeIcon icon={faTrophy} className="text-2xl text-yellow-400 mb-2" />
                <div className="text-2xl font-bold text-yellow-400">20</div>
                <div className="text-sm text-gray-400">Points per Question</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 text-center">
                <FontAwesomeIcon icon={faImages} className="text-2xl text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-purple-400">15</div>
                <div className="text-sm text-gray-400">Screencaps</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-8 border border-indigo-500/20 mb-8">
              <h3 className="text-xl font-bold mb-4 text-center">How to Play</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <FontAwesomeIcon icon={faImages} className="text-2xl text-indigo-400 mb-2" />
                  <h4 className="font-bold mb-1">Identify Images</h4>
                  <p className="text-sm text-gray-400">Recognize anime series and characters from screencaps</p>
                </div>
                <div>
                  <FontAwesomeIcon icon={faClock} className="text-2xl text-blue-400 mb-2" />
                  <h4 className="font-bold mb-1">45 Seconds</h4>
                  <p className="text-sm text-gray-400">Answer each question within 45 seconds</p>
                </div>
                <div>
                  <FontAwesomeIcon icon={faTrophy} className="text-2xl text-yellow-400 mb-2" />
                  <h4 className="font-bold mb-1">Score Bonus</h4>
                  <p className="text-sm text-gray-400">Earn bonus points for answering quickly</p>
                </div>
              </div>
            </div>

            {/* Question Count Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              {[5, 10, 15].map((count) => (
                <button
                  key={count}
                  onClick={() => startGame(count)}
                  className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-indigo-400/50 transition-all duration-300 hover:scale-[1.02] p-6 text-center group"
                >
                  <div className="text-2xl font-bold text-indigo-400 group-hover:text-indigo-300 mb-2">
                    {count}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    Questions
                  </div>
                  <div className="text-xs text-gray-500">
                    {count * 45}s Total Time
                  </div>
                </button>
              ))}
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
              <FontAwesomeIcon icon={faImages} className="text-4xl text-indigo-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Loading Gallery...</h2>
              <p className="text-gray-400">Preparing your anime gallery quiz</p>
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'completed' && gameStats) {
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Gallery Complete!
              </h1>
              <p className="text-gray-400">Excellent work identifying those anime scenes!</p>
            </div>

            {/* Results Card */}
            <div ref={resultCardRef} className="relative bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 mb-8 overflow-hidden">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className="text-center">
                  <FontAwesomeIcon icon={faImages} className="text-8xl text-indigo-400 mb-4" />
                  <h1 className="text-4xl font-bold text-indigo-400">Otazumi</h1>
                  <p className="text-lg text-purple-300">Anime Gallery</p>
                </div>
              </div>

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-500/20 border-4 border-yellow-400 text-yellow-400 rounded-full mb-4">
                    <FontAwesomeIcon icon={faTrophy} className="text-4xl" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Gallery Master!</h2>
                  <p className="text-gray-300 text-lg">Score: {gameStats.score.toLocaleString()} points</p>
                  <p className="text-gray-400 text-sm mt-2">Completed on {new Date().toLocaleDateString()}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-white/5">
                    <FontAwesomeIcon icon={faImages} className="text-indigo-400 text-3xl mb-3" />
                    <p className="text-sm text-gray-400 mb-1">Questions</p>
                    <p className="text-2xl font-bold">{gameStats.totalQuestions}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-white/5">
                    <FontAwesomeIcon icon={faCheck} className="text-green-400 text-3xl mb-3" />
                    <p className="text-sm text-gray-400 mb-1">Correct</p>
                    <p className="text-2xl font-bold">{gameStats.correctAnswers}</p>
                  </div>
                </div>

                {/* Performance */}
                <div className="bg-white/10 rounded-lg p-4 mb-6 border border-white/5">
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-2">Grade: {gameStats.grade}</h3>
                    <p className="text-gray-400 text-sm">
                      Accuracy: {gameStats.percentage}% | Avg Time: {gameStats.averageTime.toFixed(1)}s per question
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
                  onClick={async () => {
                    const imageDataUrl = await generateResultImage();
                    if (imageDataUrl) {
                      const link = document.createElement('a');
                      link.href = imageDataUrl;
                      link.download = 'anime-gallery-result.png';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Download
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faRedo} className="mr-2" />
                  Try Again
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
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
                <span className="font-bold">{score.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className={`text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'}`} />
                <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="text-gray-400">
                {currentQuestion + 1} / {questions.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-indigo-400 font-medium bg-indigo-500/10 px-3 py-1 rounded-full">
                {question?.category || 'Gallery'}
              </span>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className={`text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'}`} />
                <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Image */}
            <div className="mb-6 flex justify-center">
              <div className="relative max-w-2xl w-full">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                  </div>
                )}
                <img
                  src={question?.imageUrl}
                  alt="Anime screencap"
                  className={`w-full h-auto rounded-lg shadow-2xl ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-center">{question?.question}</h2>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                    selectedAnswer === null
                      ? 'border-white/20 hover:border-indigo-400 hover:bg-indigo-400/10'
                      : selectedAnswer === index
                      ? index === question.correct
                        ? 'border-green-400 bg-green-400/20'
                        : 'border-red-400 bg-red-400/20'
                      : index === question.correct && showResult
                      ? 'border-green-400 bg-green-400/20'
                      : 'border-white/20 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                      selectedAnswer === null
                        ? 'border-white/40'
                        : selectedAnswer === index
                        ? index === question.correct
                          ? 'border-green-400 bg-green-400 text-white'
                          : 'border-red-400 bg-red-400 text-white'
                        : index === question.correct && showResult
                        ? 'border-green-400 bg-green-400 text-white'
                        : 'border-white/40'
                    }`}>
                      {selectedAnswer !== null && (
                        index === question.correct ? (
                          <FontAwesomeIcon icon={faCheck} className="text-xs" />
                        ) : selectedAnswer === index ? (
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        ) : null
                      )}
                    </span>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Result Feedback */}
            {showResult && question && (
              <div className="mt-6 p-4 rounded-lg bg-white/10">
                <div className="flex items-center gap-2 mb-2">
                  {selectedAnswer === question.correct ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="text-green-400" />
                      <span className="text-green-400 font-bold">Correct!</span>
                    </>
                  ) : selectedAnswer === -1 ? (
                    <>
                      <FontAwesomeIcon icon={faClock} className="text-red-400" />
                      <span className="text-red-400 font-bold">Time's Up!</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTimes} className="text-red-400" />
                      <span className="text-red-400 font-bold">Incorrect!</span>
                    </>
                  )}
                </div>
                {question.explanation && (
                  <p className="text-gray-300 text-sm">{question.explanation}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeGallery;